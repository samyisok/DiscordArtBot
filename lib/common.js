const pandemonium = require('pandemonium')
const log = require('./log')

let msgList = [
    "А могли бы рисовать!",
    "Не пережирай",
    "Буль",
    "Бака!",
    "Не рисуешь небось!",
    "Чего не рисуешь?",
    "Опять не рисуете?",
    "Скоро так разучитесь совсем рисовать",
    "( .\\_.)\n(.\\_. )"
  ]

let send = (message) => {
    message.channel.send(pandemonium.choice(msgList)).then( res => log.logSend(res))
} 

exports.send = send