const axios = require("axios")
const _ = require("lodash")
const log = require("./log")

let listUsers = []
let newListUsers = []
let firstLaunch = true

let getUsers = url => {
  return new Promise(resolve => {
    axios
      .get(url)
      .then(res => {
        if (res.data == "") {
          resolve([])
        } else {
          resolve(_.uniq(res.data.split( /[\r\n]+/g )))
        }
      })
      .catch(e => log.warn(e))
  })
}

let sendUsers = (message, url) => {
  getUsers(url).then(res => {
    let data = res
    let msg = "<http://2draw.me/drawpile/> - "
    if (data.length === 0) {
      msg += "Но в дравпайле никого нет 😭"
    } else {
      msg += "Пользователи в Drawpile: " + data.join(", ")
    }
    message.channel.send(msg).then( res => log.logSend(res))
  })
}

let checkUsers = (client, url, servername) => {
  getUsers(url).then(res => {
    newListUsers = res

    if (firstLaunch) {
      log.info("Изначальные пользователи: '" + newListUsers.join(", ") + "'")
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
      let msg = "<http://2draw.me/drawpile/> - Зашел: " + diff.join(", ")

      listUsers = newListUsers

      servername.forEach(name => {
        const channel = client.guilds
          .find("name", name)
          .channels.find("name", "general")
        if (!channel) return

        channel.send(msg).then( res => log.logSend(res))
      })
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
