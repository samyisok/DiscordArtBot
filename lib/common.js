const pandemonium = require("pandemonium")
const log = require("./log")

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

let send = (message, arrayResponses) => {
  message.channel
    .send(pandemonium.choice(arrayResponses || msgList))
    .then(res => log.logSend(res))
    .catch(e => log.logError(e))
}

exports.send = send
