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
const ref = require("./lib/ref")
const definer = require("./lib/definer")
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
    let user =
      lastUsers.length !== 0 ? pandemonium.choice(lastUsers) : message.author.id
    message.channel.send("<@" + user + "> " + msg.slice(1).join(" "))
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
    definer.run(message)
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
    ref.run(message, db)
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
