const _ = require("lodash")
const axios = require("axios")
const fs = require("fs")
const crypto = require("crypto")
const uuid = require("uuid")
const refsPath = "refs/"
const maxFileSize = 8000000
const log = require("./log")

function run(message, db) {
  //refs preapare
  let msg = message.content
  let splitter = /\s+/
  msg = msg.split(splitter).slice(1)

  //fn
  let getFound = curTag => {
    return db
      .get("tagGroups")
      .filter(x => {
        return !!_.includes(x.tags, curTag)
      })
      .value()
  }

  //prepare

  if (_.toLower(msg[0]) === "add") {
    msg = msg.slice(1)
    let attach = message.attachments.first()
    let urlFile = attach ? attach.url : msg.shift()
    urlFile = _.trimStart(urlFile, "<")
    urlFile = _.trimEnd(urlFile, ">")
    msg = msg.map(x => _.toLower(x))
    let user = message.author.username
    let userId = message.author.id
    let uuidFile = uuid()

    axios({
      method: "get",
      url: urlFile,
      responseType: "stream"
    })
      .then(function(response) {
        let type = response.headers["content-type"]
        let fileDesc = ""
        if (type === "image/jpeg") {
          fileDesc = "jpg"
        } else if (type === "image/png") {
          fileDesc = "png"
        } else if (type === "video/mp4") {
          fileDesc = "mp4"
          msg.push(fileDesc)
        } else if (type === "image/gif") {
          fileDesc = "gif"
          msg.push(fileDesc)
        } else if (type === "image/webp") {
          fileDesc = "webp"
          msg.push(fileDesc)
        } else {
          log.warn("wrong file: " + urlFile)
          message.react("❌").catch(e => log.logError(e))
          return
        }

        let sizeFile = response.headers["content-length"]
        if (
          sizeFile === undefined ||
          sizeFile === null ||
          sizeFile > maxFileSize
        ) {
          let warnMsg =
            "Размер файла слишком большой: " +
            Math.round(sizeFile / 1000000) +
            " MB"
          message.channel
            .send(warnMsg)
            .then(res => log.logSend(res))
            .catch(e => log.logError(e))
          return
        }

        let fullfilename = uuidFile + "." + fileDesc
        let fileData = response.data
        let chunks = []
        fileData.on("data", chunk => chunks.push(chunk))
        fileData.on("end", () => {
          let completeFile = Buffer.concat(chunks)
          let hash256 = crypto.createHash("sha256")
          let sumCurFile = hash256.update(completeFile).digest("hex")
          let hashData = db
            .get("refs")
            .find({
              hash: sumCurFile
            })
            .value()

          if (hashData !== undefined) {
            let warnMsg = "Такой файл уже существует id#:" + hashData.id
            message.channel
              .send(warnMsg)
              .then(res => log.logSend(res))
              .catch(e => log.logError(e))
            return
          }

          fs.writeFile(refsPath + fullfilename, completeFile, err => {
            if (err) {
              log.error("err:" + err)
              log.error("Can not write file: " + urlFile)
              message.react("😱").catch(e => log.logError(e))
              return
            }
            let curRef = db.get("refsCount").value()
            curRef++
            db.set("refsCount", curRef).write()
            db
              .get("refs")
              .push({
                id: curRef,
                tags: _.uniq(msg),
                from: user,
                uid: userId,
                name: fullfilename,
                uuid: uuidFile,
                hash: sumCurFile,
                link: urlFile,
                cdate: Date.now()
              })
              .write()
            message.react("✅").catch(e => log.logError(e))
            log.info("Сохранил файл: ", msg, user, curRef, uuidFile)
          })
        })
      })
      .catch(e => log.logError(e))
  } else if (_.toLower(msg[0]) === "last") {
    message.channel.send("Последний id: " + db.get("refsCount").value())
  } else if (_.toLower(msg[0]) === "tag") {
    let tag = _.toLower(msg[1])

    if (tag === undefined || tag == "") {
      message.channel
        .send("Не вижу вашего тега.")
        .then(res => log.logSend(res))
        .catch(e => log.logError(e))
      return
    }

    let found = getFound(tag)

    let createTagGroup = newTag => {
      let tagGroupCount = db.get("tagGroupCount").value()
      tagGroupCount++

      db.set("tagGroupCount", tagGroupCount).write()
      db
        .get("tagGroups")
        .push({
          id: tagGroupCount,
          tags: [newTag]
        })
        .write()
    }

    if (found === undefined || found.length === 0) {
      createTagGroup(tag)
      found = getFound(tag)
    }
    log.info("found tag group: " + JSON.stringify(found))

    let newTags = _.uniq(msg.slice(2).map(x => _.toLower(x)))

    if (newTags === undefined || newTags.length === 0) {
      message.channel
        .send("Текущие теги:\n" + found[0].tags.join(", "))
        .then(res => log.logSend(res))
        .catch(e => log.logError(e))
      return
    }

    let addTags = []
    let delTags = []
    let otherTags = []

    while (newTags.length > 0) {
      let tag = newTags.shift()
      if (/^\-.+/.test(tag)) {
        delTags.push(_.trimStart(tag, "-"))
      } else if (/^\+.+/.test(tag)) {
        addTags.push(_.trimStart(tag, "+"))
      } else {
        otherTags.push(tag)
      }
    }
    log.info("tags:" + JSON.stringify([addTags, delTags, otherTags]))
    if (addTags.length === 0 && delTags.length === 0 && otherTags.length > 0) {
      message.channel
        .send("И щито мне с этими тегами делать??:" + otherTags.join(", "))
        .then(res => log.logSend(res))
        .catch(e => log.logError(e))
      return
    }
    //addTags
    let existedTags = []
    let cleanedTags = addTags.reduce((holder, value) => {
      let existTag = db
        .get("tagGroups")
        .filter(x => {
          return !!_.includes(x.tags, value)
        })
        .value()

      if (existTag.length === 0) {
        holder.push(value)
      } else {
        existedTags.push(value)
      }
      return holder
    }, [])

    if (existedTags.length > 0) {
      message.channel
        .send("Эти теги уже существуют: " + existedTags.join(", "))
        .then(res => log.logSend(res))
        .catch(e => log.logError(e))
    }

    if (
      (cleanedTags === undefined || cleanedTags.length === 0) &&
      delTags.length === 0
    ) {
      log.warn("Nothing to do")
      return
    }

    let tagsToAssign = cleanedTags.concat(found[0].tags)
    _.remove(tagsToAssign, x => _.includes(delTags, x))

    let updateGroup = db
      .get("tagGroups")
      .find({ id: Number(found[0].id) })
      .assign({ tags: tagsToAssign })
      .write()

    if (updateGroup === undefined || updateGroup.length === 0) {
      log.error("some error")
      return
    }

    message.channel
      .send("Новые теги:\n" + updateGroup.tags.join(", "))
      .catch(e => log.logError(e))
  } else if (_.toLower(msg[0]) === "alltags") {
    let data = db
      .get("refs")
      .map("tags")
      .reduce((arr, x) => arr.concat(x), [])
      .uniq()
      .value()
    message.channel
      .send("all tags:\n" + data.join(", "))
      .then(res => log.logSend(res))
      .catch(e => log.logError(e))
  } else if (_.toLower(msg[0]) === "id") {
    //start id part
    msg = msg.map(x => _.toLower(x))
    let typeOp = msg.shift()
    let id = msg.shift()

    if (!id || id === undefined || id === null) {
      log.warn("empty uuid")
      return
    }

    let addTags = []
    let delTags = []
    let otherTags = []

    while (msg.length > 0) {
      let tag = msg.shift()
      if (/^\-.+/.test(tag)) {
        delTags.push(_.trimStart(tag, "-"))
      } else if (/^\+.+/.test(tag)) {
        addTags.push(_.trimStart(tag, "+"))
      } else {
        otherTags.push(tag)
      }
    }
    log.warn("tags: ", addTags, delTags, otherTags)

    if (addTags.length === 0 && delTags.length === 0) {
      let idData = db
        .get("refs")
        .find({
          id: Number(id)
        })
        .value()
      if (idData !== undefined && idData.length !== 0) {
        message.channel
          .send(
            "send refs №" +
              idData.id +
              "\n" +
              "[" +
              idData.tags.join(", ") +
              "]",
            {
              files: [refsPath + idData.name]
            }
          )
          .then(res => log.logSend(res))
      } else {
        message.react("⭕").catch(e => log.logError(e))
      }
    } else {
      //if we have tags
      let idData = db
        .get("refs")
        .find({
          id: Number(id)
        })
        .value()

      if (idData === undefined) {
        message.channel
          .send("Не нашла такой картинки с таким номером")
          .then(res => log.logSend(res))
        return
      }

      let arr = idData.tags

      arr = _.concat(arr, addTags)
      arr = _.pullAll(arr, delTags)

      let newIdData = db
        .get("refs")
        .find({
          id: Number(id)
        })
        .assign({ tags: _.uniq(arr) })
        .write()

      log.info("Changes in tags: ", newIdData.tags)
      message.channel
        .send(
          "№" + newIdData.id + ", newTags:\n[" + newIdData.tags.join(", ") + "]"
        )
        .then(res => log.logSend(res))
        .catch(e => log.logError(e))
    }
    //end id part
  } else if (msg.length === 0) {
    let fileData = db
      .get("refs")
      .sample()
      .value()

    if (fileData !== undefined && fileData.length !== 0) {
      message.channel
        .send("send refs №" + fileData.id, {
          files: [refsPath + fileData.name]
        })
        .then(res => log.logSend(res))
        .catch(e => log.logError(e))
    }
  } else {
    //tags
    msg = msg.map(x => _.toLower(x))
    let tags = _.uniq(msg)

    let exTags = []
    tags = tags.filter(
      v => (/^!.+/.test(v) ? exTags.push(_.trimStart(v, "!")) && false : true)
    )

    let search = (tagsFromDb, curTags) => {
      let allCorrect = []

      curTags.forEach(curTag => {
        let hit = false
        let groupFound = getFound(curTag)
        if (groupFound.length === 0) {
          allCorrect.push(_.includes(tagsFromDb, curTag))
          return
        }

        tagsFromDb.forEach(tagFromDb => {
          if (_.includes(groupFound[0].tags, tagFromDb)) hit = true // true\false
        })

        allCorrect.push(hit)
      })

      if (allCorrect.length === 0) {
        return false
      } else {
        let foo = true
        allCorrect.forEach(x => {
          if (x === false) foo = false
        })
        return foo
      }
    }

    let fd = db
      .get("refs")
      .filter(x => search(x.tags, tags))
      .filter(
        ex =>
          !exTags.map(tag => search(ex.tags, [tag])).some(res => res === true)
      )
      .sample()
      .value()

    if (fd !== undefined && fd.length !== 0) {
      message.channel
        .send("send refs №" + fd.id, {
          files: [refsPath + fd.name]
        })
        .then(res => log.logSend(res))
    } else {
      let fileData = db
        .get("refs")
        .sample()
        .value()

      if (fileData !== undefined && fileData.length !== 0) {
        message.channel
          .send(
            "Я ничего не нашла, вот вам рендомная картинка номер №" +
              fileData.id,
            {
              files: [refsPath + fileData.name]
            }
          )
          .then(res => log.logSend(res))
          .catch(e => log.logError(e))
      }
    }
  }
}

exports.run = run
