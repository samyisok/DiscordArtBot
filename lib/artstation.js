const lodash = require("lodash")
const config = require("config")
const urlArtstation = config.get("app").urlArtstation
const axios = require("axios")
const pandemonium = require("pandemonium")
const util = require("util")
const log = require("./log")

let topArt = []
let sended = []

let getArt = () => {
  return new Promise(resolve => {
    axios.get(urlArtstation).then(x => {
      let arr = x.data.data
      arr.sort((a, b) => b.likes_count - a.likes_count)
      resolve(arr)
    })
  })
}

let sendTop10 = channel => {
  let mixSend = (message, topArt) => {
    let top10 = topArt.slice(0, 9).map(x => x.permalink)
    lodash.remove(top10, x => lodash.includes(sended, x))
    let chosen = pandemonium.choice(top10)
    message.channel.send(chosen).then( res => log.logSend(res))
    sended.push(chosen)
    if (sended.length > 9 ) sended.shift
  }
  let mimikMessage = {
    channel: channel
  }
  getTop(mimikMessage, mixSend)
}

let getTop = (message, mixSend) => {
  let curSend = mixSend || send
  if (topArt.length === 0) {
    getArt().then(arr => {
      if (arr.length > 0) {
        topArt = arr
        curSend(message, topArt)
      } else {
        console.log("empty incoming artstation data")
      }
    })
  } else {
    curSend(message, topArt)
  }
}

let send = (message, topArt) => {
  let top = /topkek/i.test(message.content)
  if (top) {
    let msg = "Current top 5:\n"
    let top5 = topArt.slice(0, 5)

    top5.forEach(e => {
      let row = util.format("<%s> - likes: %s\n", e.permalink, e.likes_count)
      msg = msg + row
    })

    message.channel.send(msg).then( res => log.logSend(res))
  } else {
    message.channel.send(pandemonium.choice(topArt).permalink).then( res => log.logSend(res))
  }
}

let clearTop = () => (topArt = [])

exports.sendTop10 = sendTop10
exports.getTop = getTop
exports.clearTop = clearTop
