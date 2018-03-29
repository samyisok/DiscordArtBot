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
let newURL = "http://2draw.me/drawpile/users.txt"

//vars
let helpWathcher = []
let withoutMsgCounter = -300
let lastUsers = []
let artArr = []
let artIndex = 0

//const list
const maxUsers = 5
const pauseArt = -300
const silenceTime = 20
const masterChannel = "High_Shinkai_Labs"

//init logger winson
const log = require("./lib/log")
//start

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

  setInterval(function() {
    drawpile.checkUsers(client, newURL, [servername, masterChannel])

    helpWathcher = []
    withoutMsgCounter++

    if (withoutMsgCounter > silenceTime) {
      //artStation move
      const channel = client.guilds
        .find("name", servername)
        .channels.find("name", "general")
      if (!channel) return
      artstation.clearTop() // prepare for fresh data

      artstation.sendTop10(channel)
      withoutMsgCounter = pauseArt
    }
  }, 60000)
})

client.on("message", message => {
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
    message.react("🍆").catch(e => log.warn(e.message))
  }

  if (/(^|\ )+бутер[ы]?(\s|$)+/i.test(message.content)) {
    message.react("🍔").catch(e => log.warn(e.message))
  }

  if (/^КУСЬ.?$/i.test(message.content)) {
    msg = ["КУСЬ!", "( ᵒwᵒ)", "кусь", "(︶ω︶)"]
    message.channel.send(pandemonium.choice(msg))
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
      .channels.find("name", "general")
    if (!channel) return

    channel.send(msg)
  }

  message.content = message.content.substr(0, 300)

  if (message.content === "%") {
    common.send(message)
  }

  if (/^%кто/i.test(message.content)) {
    msg = message.content.split(/\s+/)
    let user =
      lastUsers.length !== 0 ? pandemonium.choice(lastUsers) : message.author.id
    message.channel.send("<@" + user + "> " + msg.slice(1).join(" "))
  }

  if (/^%top/i.test(message.content)) {
    let userId = message.author.id

    if (_.includes(helpWathcher, userId)) {
      message.react("⏱").catch(e => log.warn(e.message))
      return
    }

    artstation.getTop(message)

    helpWathcher.push(userId)
  }

  if (
    /^%drawpile/i.test(message.content) ||
    /^%вкфцзшду/i.test(message.content) ||
    /^%d$/i.test(message.content) ||
    /^%в$/i.test(message.content)
  ) {
    drawpile.sendUsers(message, drawpileConf)
  }

  if (/^%эт[оаи]/i.test(message.content) || /^%!/i.test(message.content)) {
    definer.run(message)
  }

  if (/^%точно/i.test(message.content))
    message.channel.send(
      pandemonium.choice(["Определенно точно", "Конечно точно", "Да!"])
    )

  if (
    /^%h[ea][rl]p/i.test(message.content) ||
    /^%рфдз/i.test(message.content) ||
    /^%памаги(те)?/i.test(message.content) ||
    /^%х[ае][рл]п/i.test(message.content)
  ) {
    let userId = message.author.id

    if (_.includes(helpWathcher, userId)) {
      message.channel.send(
        "Я недавно уже помогала, пользуйся прошлой картинкой"
      )
      return
    }

    helper.run(message).then(helpWathcher.push(userId))
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
  log.error(error)
}
