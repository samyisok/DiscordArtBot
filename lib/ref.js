const _ = require("lodash")
const axios = require("axios")
const fs = require("fs")
const crypto = require("crypto")
const uuid = require("uuid")
const refsPath = "refs/"
const maxFileSize = 8000000

function run(message, db) {
  //refs preapare
  let msg = message.content
  let splitter = /\s+/
  msg = msg.split(splitter).slice(1)
  //prepare

  if (_.toLower(msg[0]) === "add") {
    msg = msg.slice(1)
    let urlFile = msg.shift()
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
        } else if (type === "image/gif") {
          fileDesc = "gif"
          msg.push(fileDesc)
        } else if (type === "image/webp") {
          fileDesc = "webp"
          msg.push(fileDesc)
        } else {
          console.log("wrong file: " + urlFile)
          message.react("❌")
          return
        }

        let sizeFile = response.headers["content-length"]
        if (
          sizeFile === undefined ||
          sizeFile === null ||
          sizeFile > maxFileSize
        ) {
          message.channel.send(
            "Размер файла слишком большой: " +
              Math.round(sizeFile / 1000000) +
              " MB"
          )
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
            message.channel.send("Такой файл уже существует id#:" + hashData.id)
            return
          }

          fs.writeFile(refsPath + fullfilename, completeFile, err => {
            if (err) {
              console.log("err:" + err)
              console.log("Can not write file: " + urlFile)
              message.react("😱")
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
            message.react("✅")
            console.log(msg, user, curRef, uuidFile)
          })
        })
      })
      .catch(err => {
        console.log("err: " + err + urlFile)
        message.react("💩")
      })
  } else if (_.toLower(msg[0]) === "last") {
    message.channel.send("Последний id: " + db.get("refsCount").value())
  } else if (_.toLower(msg[0]) === "alltags") {
    let data = db
      .get("refs")
      .map("tags")
      .reduce((arr, x) => arr.concat(x),[])
      .uniq()
      .value()
    message.channel.send('all tags:\n' + data.join(', ') )
  } else if (_.toLower(msg[0]) === "id") {
    //start id part
    msg = msg.map(x => _.toLower(x))
    let typeOp = msg.shift()
    let id = msg.shift()

    if (!id || id === undefined || id === null) {
      console.log("empty uuid")
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
    console.log("tags: ", addTags, delTags, otherTags)

    if (addTags.length === 0 && delTags.length === 0) {
      console.log("id", id)
      let idData = db
        .get("refs")
        .find({
          id: Number(id)
        })
        .value()
      if (idData !== undefined && idData.length !== 0) {
        message.channel.send(
          "send refs №" + idData.id + "\n" + "[" + idData.tags.join(", ") + "]",
          {
            files: [refsPath + idData.name]
          }
        )
      } else {
        console.log("idData", idData)
        message.react("⭕")
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
        message.channel.send("Не нашла такой картинки с таким номером")
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

      console.log("changes: ", newIdData.tags)
      message.channel.send(
        "№" + newIdData.id + ", newTags:\n[" + newIdData.tags.join(", ") + "]"
      )
    }
    //end id part
  } else if (msg.length === 0) {
    let fileData = db
      .get("refs")
      .sample()
      .value()

    if (fileData !== undefined && fileData.length !== 0) {
      message.channel.send("send refs №" + fileData.id, {
        files: [refsPath + fileData.name]
      })
    }
  } else {
    msg = msg.map(x => _.toLower(x))
    let tags = _.uniq(msg)

    let fd = db
      .get("refs")
      .filter(x => {
        let correct = []
        tags.forEach(y => {
          correct.push(_.includes(x.tags, y))
        })
        return correct.every(x => x === true)
      })
      .sample()
      .value()

    if (fd !== undefined && fd.length !== 0) {
      message.channel.send("send refs №" + fd.id, {
        files: [refsPath + fd.name]
      })
    } else {
      let fileData = db
        .get("refs")
        .sample()
        .value()

      if (fileData !== undefined && fileData.length !== 0) {
        message.channel.send(
          "Я ничего не нашла, вот вам рендомная картинка номер №" + fileData.id,
          {
            files: [refsPath + fileData.name]
          }
        )
      }
    }
  }
}

exports.run = run
