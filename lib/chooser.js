const pandemonium = require("pandemonium")
const _ = require("lodash")
const log = require("./log")

let sendAnswer = message => {
  let ili = /\sили\s/i
  let splitter = /\s+/
  let msg = message.content

  msg = msg
    .split(splitter)
    .slice(1)
    .join(" ")
  if (ili.test(msg)) splitter = ili
  msg = msg.split(splitter)

  if (msg.some(x => /не\s+рисовать/i.test(x))) {
    let filtered = msg.filter(value => !/не\s+рисовать/i.test(value))
    let onlyDraw = filtered.filter(value => /рисовать/i.test(value))

    let toSend = "рисовать"
    if (onlyDraw.length > 0) {
      toSend = pandemonium.choice(onlyDraw)
    } else if (filtered.length > 0) {
      toSend = pandemonium.choice(filtered)
    }

    message.channel.send(toSend).then(res => log.logSend(res))
  } else {
    message.channel.send(pandemonium.choice(msg)).then(res => log.logSend(res))
  }
}

exports.sendAnswer = sendAnswer
