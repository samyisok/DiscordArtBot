const pandemonium = require("pandemonium")
const _ = require("lodash")


let sendAnswer = (message) => {
    let ili = /\sили\s/i
    let splitter = /\s+/
    let msg = message.content 

    msg = msg.split(splitter).slice(1).join(' ')
    if (ili.test(msg)) splitter = ili
    msg = msg.split(splitter)

    message.channel.send(pandemonium.choice(msg))
}

exports.sendAnswer = sendAnswer