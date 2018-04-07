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
  if (msg.some(x => /рисовать/i.test(x))) {
    message.channel.send("рисовать").then( res => log.logSend(res))
  } else {
    message.channel.send(pandemonium.choice(msg)).then( res => log.logSend(res))
  }
}

exports.sendAnswer = sendAnswer
