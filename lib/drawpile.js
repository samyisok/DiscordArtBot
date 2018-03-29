const axios = require("axios")
const _ = require("lodash")
const log = require("./log")

let newURL = "http://2draw.me/drawpile/users.txt"

let listUsers = []
let newListUsers = []
let firstLaunch = true

let getUsers = url => {
  return new Promise(resolve => {
    axios
      .get(url)
      .then(res => {
        resolve(_.uniq(res.data.split(", ")))
      })
      .catch(e => log.warn(e))
  })
}

let sendUsers = (message, url) => {
  getUsers(newURL).then(res => {
    let data = res
    let msg = "<http://2draw.me/drawpile/> - "
    if (data.length === 0) {
      msg += "Но в дравпайле никого нет 😭"
    } else {
      msg += "Пользователи в Drawpile: " + data.join(", ")
    }
    message.channel.send(msg)
  })
}

let checkUsers = (client, url, servername) => {
  getUsers(url).then(res => {
    newListUsers = res

    if (firstLaunch) {
      log.info('Изначальные пользователи' + newListUsers.join(', '))
      listUsers = newListUsers
      firstLaunch = false
      return
    }

    let reverseDiff = []
    listUsers.forEach(x => {
      if (!newListUsers.includes(x)) reverseDiff.push(x)
    })

    let diff = []
    newListUsers.forEach(x => {
      if (!listUsers.includes(x)) diff.push(x)
    })

    if (diff.length > 0) {
      const channel = client.guilds
        .find("name", servername)
        .channels.find("name", "general")
      if (!channel) return

      listUsers = newListUsers
      channel.send("<http://2draw.me/drawpile/> - Зашел: " + diff.join(", "))
      log.info("Из drowpile зашли, разница:" + diff.join(", "))
    }

    if (reverseDiff.length > 0) {
      log.info("Из drowpile вышли, разница:" + reverseDiff.join(", "))
      listUsers = newListUsers
    }
  })
}

exports.sendUsers = sendUsers
exports.getUsers = getUsers
exports.checkUsers = checkUsers
