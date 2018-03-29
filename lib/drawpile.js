const axios = require("axios")
const _ = require("lodash")
const log = require("./log")

let newURL = "http://2draw.me/drawpile/users.txt"

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

let sendUsers = (message, drawpile) => {
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

exports.sendUsers = sendUsers
exports.getUsers = getUsers
