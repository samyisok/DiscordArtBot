const _ = require("lodash")
const Discord = require("discord.js")
const client = new Discord.Client()
const util = require("util")
const pandemonium = require("pandemonium")
const axios = require("axios")
const uuid = require("uuid/v4")
const fs = require("fs")
const crypto = require("crypto")

const low = require("lowdb")
const FileSync = require("lowdb/adapters/FileSync")
const adapter = new FileSync("db.json")
const db = low(adapter)

const winston = require("winston")

//lib start
const common = require("./lib/common")
const chooser = require("./lib/chooser")
const drawpile = require("./lib/drawpile")
const todo = require("./lib/todo")
const artstation = require("./lib/artstation")
const ref = require("./lib/ref")
const definer = require("./lib/definer")
const helper = require("./lib/helper")
const req = require("./lib/req")
const waifu = require("./lib/waifu")
//lib end

//config
const config = require("config")
const drawpileConf = config.get("drawpile")
const servername = config.get("app").guild
const masterId = config.get("app").master || ''
const arrayResponses = config.get("app").commonResponses
const permitAddHelp = config.get("app").permitAddHelp
const codeBot = config.get("app").code
const mainChannel = config.get("app").general || 'general'
const maxFileSize = 8000000

const drawpileUrlTxt = drawpileConf.urlTxt
const refsPath = "refs/"
const helpPath = "halp/"
const urlArtstation = config.get("app").urlArtstation

//vars
let helpWathcher = []
let withoutMsgCounter = -300
let lastUsers = []
let artArr = []
let artIndex = 0

//const list
const maxUsers = 7
const pauseArt = -300
const silenceTime = 25
const masterChannel = "High_Shinkai_Labs"

//init logger winson
const log = require("./lib/log")
//start

client.on("error", err => log.logError(err))

client.on("ready", () => {
  log.info("i am ready on " + servername)
  db
    .defaults({
      todo: [],
      refs: [],
      req: [],
      tagGroups: [],
      todoCount: 0,
      refsCount: 0,
      tagGroupCount: 0,
      reqCount: 0
    })
    .write()

  setInterval(function () {
    drawpile.checkUsers(client, drawpileUrlTxt, [servername, masterChannel], mainChannel )

    helpWathcher = []
    withoutMsgCounter++

    log.info("withoutMsgCounter: " + withoutMsgCounter )
    if (withoutMsgCounter > silenceTime) {
      //artStation move
      const channel = client.guilds
        .find("name", servername)
        .channels.find("name", mainChannel)
      if (!channel) return
      artstation.clearTop() // prepare for fresh data

      artstation.sendTop10(channel)
      withoutMsgCounter = pauseArt
    }
  }, 60000)
})

client.on("message", message => {
  if (message.channel.type == "dm") return

  if (withoutMsgCounter > 0 && message.guild.name === servername)
    withoutMsgCounter = 0
  if (
    message.guild.name === servername &&
    !_.includes(lastUsers, message.author.id)
  ) {
    lastUsers.push(message.author.id)
    if (lastUsers.length > maxUsers) lastUsers.shift()
  }
  if (message.author.bot) return

  if (/^u+$/i.test(message.content)) {
    message.react("🍆").catch(e => log.logError(e))
  }

  if (/(^|\ )+бутер[ы]?(\s|$)+/i.test(message.content)) {
    message.react("🍔").catch(e => log.logError(e))
  }

  if (/^КУСЬ.?$/i.test(message.content)) {
    msg = ["КУСЬ!", "( ᵒwᵒ)", "кусь", "(︶ω︶)", "Курлык"]
    message.channel
      .send(pandemonium.choice(msg))
      .then(res => log.logSend(res))
      .catch(e => log.logError(e))
  }

  if (/^%когда/i.test(message.content)) {
    msg = ["Сейчас", "Завтра", "Когда-нибудь", "Никогда", "Вчера"]
    message.channel
      .send(pandemonium.choice(msg) + ' ' + message.content.split(/\s+/).slice(1).join(" "))
      .then(res => log.logSend(res))
      .catch(e => log.logError(e))
  }

  if (/^%/.test(message.content)) {
    log.info("CMDIN: " + message.content)
  } else {
    return
  }

  if (
    message.author.id == 377065326841692160 &&
    message.guild.name === masterChannel &&
    /^%анонс\s+/i.test(message.content)
  ) {
    let msg = message.content
      .split(/\s+/)
      .slice(1)
      .join(" ")

    const channel = client.guilds
      .find("name", servername)
      .channels.find("name", mainChannel)
    if (!channel) return

    channel
      .send(msg)
      .then(res => log.logSend(res))
      .catch(e => log.logError(e))
  }

  message.content = message.content.substr(0, 300)

  if (/(^%anime)|(^%аниме)/i.test(message.content)) {
    let userId = message.author.id

    if (_.includes(helpWathcher, userId)) {
      message.react("⏱").catch(e => log.logError(e))
      return
    }

    let urlKitsu = 'https://kitsu.io/api/edge/anime?filter%5Bstatus%5D=current&page%5Blimit%5D=20&page%5Bfset%5D=0&sort=-userCount'

    axios.get(urlKitsu).then(x => {
      let arr = pandemonium.choice(x.data.data)
      let msg = arr.attributes.canonicalTitle + "\n"
        + arr.attributes.posterImage.original + "\n"
      message.channel.send(msg).then(res => log.logSend(res)).catch(e => log.logError(e))
    }).catch(e => log.logError(e))

    helpWathcher.push(userId)
  }

  if (message.content === "%") {
    common.send(message, arrayResponses )
  }

  if (/^%кто/i.test(message.content)
    || /^%who/i.test(message.content)) {
    msg = message.content.split(/\s+/)
    let userId =
      lastUsers.length !== 0 ? pandemonium.choice(lastUsers) : message.author.id

    client.fetchUser(userId).then(user =>
      message.guild.fetchMember(user).then(member =>
        message.channel
          .send('**' + member.nickname + "** " + msg.slice(1).join(" "))
          .then(res => log.logSend(res))
          .catch(e => log.logError(e))
      )
    )
  }

  if (/^%top/i.test(message.content)) {
    let userId = message.author.id

    if (_.includes(helpWathcher, userId)) {
      message.react("⏱").catch(e => log.logError(e))
      return
    }

    artstation.getTop(message)

    helpWathcher.push(userId)
  }


  if (/^%[0-9]d[0-9]+/i.test(message.content)) {
    let msg = _.replace(message.content, '%', '')
    let dices = msg.split(/[dD]/)
    let diceMax
    let restMsg
    [diceMax, ...restMsg] = dices[1].split(/\s/)
    let out = []

    while (dices[0] > 0) {
      out.push(pandemonium.random(1, diceMax))
      dices[0]--
    }

    message.channel
      .send('Выпало: ' + out.join(', ') + ' ' + restMsg.join(' '))
      .then(res => log.logSend(res))
      .catch(e => log.logError(e))
  }

  if (
    /^%drawpile/i.test(message.content) ||
    /^%вкфцзшду/i.test(message.content) ||
    /^%d$/i.test(message.content) ||
    /^%в$/i.test(message.content)
  ) {
    drawpile.sendUsers(message, drawpileUrlTxt)
  }

  if (/^%эт[оаи]/i.test(message.content) || /^%!/i.test(message.content)) {
    definer.run(message)
  }

  if (/^%точно/i.test(message.content))
    message.channel
      .send(pandemonium.choice(["Определенно точно", "Конечно точно", "Да!"]))
      .then(res => log.logSend(res))
      .catch(e => log.logError(e))

  if (
    /^%h[ea][rl]p/i.test(message.content) ||
    /^%рфдз/i.test(message.content) ||
    /^%памаги(те)?/i.test(message.content) ||
    /^%х[ае][рл]п/i.test(message.content)
  ) {
    let userId = message.author.id

    if (_.includes(helpWathcher, userId)) {
      message.channel
        .send("Я недавно уже помогала, пользуйся прошлой картинкой")
        .then(res => log.logSend(res))
        .catch(e => log.logError(e))
      return
    }

    helper
      .run(message)
      .then(helpWathcher.push(userId))
      .catch(e => log.logError(e))
  }

  if (/^%\?\s.+/i.test(message.content)) {
    chooser.sendAnswer(message)
  }

  if (
    /^%ref.?/i.test(message.content) ||
    /^%refs.?/i.test(message.content) ||
    /^%куаы.?/i.test(message.content) ||
    /^%реф.?/i.test(message.content) ||
    /^%куа.?/i.test(message.content)
  ) {
    ref.run(message, db)
  }

  if (
    /^%todo(\s.+)?$/i.test(message.content) ||
    /^%ещвщ.?/i.test(message.content)
  ) {
    todo.check(message, db)
  }

  if (
    /^%req(\s.+)?$/i.test(message.content) ||
    /^%report(\s.+)?$/i.test(message.content)
  ) {
    req.add(message, db)
  }

  if (/%addhelp(\s.+)?$/i.test(message.content) && permitAddHelp ) {
    msg = message.content.split(/\s/).slice(1) || ''
    let attach = message.attachments.first()
    let urlFile = attach ? attach.url : msg.shift()
    urlFile = _.trimStart(urlFile, "<")
    urlFile = _.trimEnd(urlFile, ">")
    msg = msg.map(x => _.toLower(x))
    let user = message.author.username
    let uuidFile = uuid()
    //TODO refactoring
    axios({
      method: "get",
      url: urlFile,
      responseType: "stream"
    })
      .then(function (response) {
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

        let fullfilename = user + '_' + uuidFile + "." + fileDesc
        let fileData = response.data
        let chunks = []

        fileData.on("data", chunk => chunks.push(chunk))
        fileData.on("end", () => {
          let completeFile = Buffer.concat(chunks)

          fs.writeFile(helpPath + fullfilename, completeFile, err => {
            if (err) {
              log.error("err:" + err)
              log.error("Can not write file: " + urlFile)
              message.react("😱").catch(e => log.logError(e))
              return
            }

            message.react("✅").catch(e => log.logError(e))
            log.info("Сохранил файл: ", msg, user, helpPath + fullfilename )
          })
        })
      })
      .catch(e => log.logError(e))

  }

  if (
    /^%waifu(\s.+)?$/i.test(message.content) ||
    /^%тян(\s.+)?$/i.test(message.content)
  ) {
    let userId = message.author.id

    if (_.includes(helpWathcher, userId)) {
      message.react("⏱").catch(e => log.logError(e))
      return
    }

    let char = waifu.generate()
    let charDesc =
      "```" +
      `name: ${char.name}\n` +
      `race: ${char.races.join("-")}\n` +
      `age: ${char.age}\n` +
      `height: ${char.height}\n` +
      `quirks: ${char.quirks.join(", ")}\n` +
      "```"
    message.channel
      .send(charDesc)
      .then(res => log.logSend(res))
      .catch(e => log.logError(e))

    helpWathcher.push(userId)
  }
})

client.on("guildMemberAdd", member => {
  const channel = member.guild.channels.find("name", "welcome")
  if (!channel) return
  channel
    .send(`Дальше вы не пройдете, пока не покажете рисуночки, ${member}! >:3`)
    .then(res => log.logSend(res))
    .catch(e => log.logError(e))
})

client.login(codeBot).catch(e => log.logError(e))