const _ = require("lodash")
const Discord = require("discord.js")
const client = new Discord.Client()
const util = require("util")
const pandemonium = require("pandemonium")
const listFilepaths = require("list-filepaths")
const axios = require("axios")
const uuid = require("uuid/v4")
const fs = require("fs")
const crypto = require("crypto")

const low = require("lowdb")
const FileSync = require("lowdb/adapters/FileSync")
const adapter = new FileSync("db.json")
const db = low(adapter)

//lib start
const common = require("./lib/common")
const chooser = require("./lib/chooser")
const drawpile = require("./lib/drawpile")
const todo = require("./lib/todo")
const artstation = require("./lib/artstation")
//lib end

//config
const config = require("config")
const drawpileConf = config.get("drawpile")
const servername = config.get("app").guild
const codeBot = config.get("app").code
const maxFileSize = 8000000

const drawpileUrl = drawpileConf.url
const drawpileUrlTxt = drawpileConf.urlTxt
const drawpilePass = drawpileConf.password
const drawpileUser = drawpileConf.user
const refsPath = "refs/"
const urlArtstation = config.get("app").urlArtstation

//vars
let helpWathcher = []
let withoutMsgCounter = 0
let lastUsers = []
let artArr = []
let artIndex = 0


//start

client.on("ready", () => {
  console.log("I am ready!")
  console.log(servername)
  // let myVar = client.channels.find('name', 'general');
  // myVar.send('boss, i am ready!');

  db
    .defaults({
      todo: [],
      refs: [],
      todoCount: 0,
      refsCount: 0
    })
    .write()
  let listUsers = []
  let newListUsers = []
  let firstLaunch = true
  setInterval(function() {
    axios
      .get(drawpileUrl, {
        auth: {
          username: drawpileUser,
          password: drawpilePass
        }
      })
      .then(res => {
        let data = []
        res.data.forEach(x => data.push(x.name))
        newListUsers = data

        let reverseDiff = []
        listUsers.forEach(x => {
          if (!newListUsers.includes(x)) {
            reverseDiff.push(x)
          }
        })

        let diff = []
        newListUsers.forEach(x => {
          if (!listUsers.includes(x)) {
            diff.push(x)
          }
        })

        if (firstLaunch) {
          listUsers = newListUsers
          firstLaunch = false
          return
        }

        if (diff.length > 0) {
          const channel = client.guilds
            .find("name", servername)
            .channels.find("name", "general")
          if (!channel) return
          listUsers = newListUsers
          channel.send(
            "<http://2draw.me/drawpile/> - Зашел: " + diff.join(", ")
          )
        }

        if (reverseDiff.length > 0) {
          console.log("reverseDiff on")
          listUsers = newListUsers
        }
      })
      .catch(e => console.log(e))

    helpWathcher = []
    withoutMsgCounter++
    console.log(withoutMsgCounter)

    if (withoutMsgCounter > 25) {
      //artStation move
      const channel = client.guilds
        .find("name", servername)
        .channels.find("name", "general")
      if (!channel) return
      artstation.clearTop() // prepare for fresh data

      artstation.sendTop10(channel)
      withoutMsgCounter = -300
    }
  }, 60000)

  //if ( guild.available ) { console.log('guilds availible')};
})

client.on("message", message => {
  if (withoutMsgCounter > 0 && message.guild.name === servername)
    withoutMsgCounter = 0
  if (
    message.guild.name === servername &&
    !_.includes(lastUsers, message.author.id)
  ) {
    lastUsers.push(message.author.id)
    if (lastUsers.length > 4) lastUsers.shift()
  }
  if (message.author.bot) return

  message.content = message.content.substr(0, 300)

  if (message.content === "%") {
    common.send(message)
  }

  if (/^%кто/i.test(message.content)) {
    msg = message.content.split(/\s+/)
    let user = (lastUsers.length !== 0) ? pandemonium.choice(lastUsers) : message.author.id
    message.channel.send("<@" + user + "> " + msg.slice(1).join(' '))
  }

  if (/^%top/i.test(message.content)) {
    let userId = message.author.id
    console.log(helpWathcher)

    if (_.includes(helpWathcher, userId)) {
      message.react("⏱")
      return
    }

    artstation.getTop(message)

    helpWathcher.push(userId)
  }

  if (
    /^%drawpile/i.test(message.content) ||
    /^%вкфцзшду/i.test(message.content) ||
    /^%d$/i.test(message.content)
  ) {
    drawpile.sendUsers(message, drawpileConf)
  }

  if (/^%эт[оаи]/i.test(message.content) || /^%!/i.test(message.content)) {
    let answers = [
      "Да",
      "Нет",
      "Скорее да",
      "Я думаю, что нет",
      "Точно да",
      "Определенно нет",
      "Возможно",
      "Да нет наверное",
      "Спросите у Хидоя!"
    ]
    message.channel.send(pandemonium.choice(answers))
  }

  if (/^%точно/i.test(message.content))
    message.channel.send(
      pandemonium.choice(["Определенно точно", "Конечно точно", "Да!"])
    )

  if (
    /^%halp/i.test(message.content) ||
    /^%рфдз/i.test(message.content) ||
    /^%памагите/i.test(message.content) ||
    /^%херп/i.test(message.content)
  ) {
    let userId = message.author.id
    console.log(helpWathcher)
    if (_.includes(helpWathcher, userId)) {
      message.channel.send(
        "Я недавно уже помогала, пользуйся прошлой картинкой"
      )
      return
    }
    listFilepaths("./halp")
      .then(filepaths => {
        let path = pandemonium.choice(filepaths)
        message.channel.send("send help", {
          files: [path]
        })
        helpWathcher.push(userId)
      })
      .catch(err => {
        // Handle errors
        console.error(err)
      })
  }

  if (/^КУСЬ.?$/i.test(message.content)) {
    msg = ["КУСЬ!", "( ᵒwᵒ)", "кусь", "(︶ω︶)"]
    message.channel.send(pandemonium.choice(msg))
  }

  if (/^%\?\s.+/i.test(message.content)) {
    chooser.sendAnswer(message)
  }

  if (/^uuu+$/i.test(message.content)) {
    message.react("🍆")
  }

  if (/(^|\ )+бутер[ы]?(\s|$)+/i.test(message.content)) {
    message.react("🍔")
  }

  if (
    /^%ref.?/i.test(message.content) ||
    /^%refs.?/i.test(message.content) ||
    /^%куаы.?/i.test(message.content) ||
    /^%куа.?/i.test(message.content)
  ) {
    let msg = message.content
    let splitter = /\s+/
    msg = msg.split(splitter).slice(1)
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
              message.channel.send(
                "Такой файл уже существует id#:" + hashData.id
              )
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
            "Я ничего не нашла, вот вам рендомная картинка номер №" +
              fileData.id,
            {
              files: [refsPath + fileData.name]
            }
          )
        }
      }
    }
  }

  if (
    /^%todo(\s.+)?$/i.test(message.content) ||
    /^%ещвщ.?/i.test(message.content)
  ) {
    todo.check(message, db)
  }
})

client.on("guildMemberAdd", member => {
  const channel = member.guild.channels.find("name", "welcome")
  if (!channel) return
  channel.send(
    `Сейчас придут специально обученные люди и выдадут вам кота, ${member}`
  )
})

try {
  client.login(codeBot)
} catch (error) {
  console.log(error)
}
