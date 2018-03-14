const pandemonium = require('pandemonium')

let msgList = [
    "А могли бы рисовать!",
    "Не пережирай",
    "Буль",
    "Бака!",
    "Анус себе дерни, бака!",
    "Не рисуешь небось!",
    "Чего не рисуешь?",
    "Опять не рисуете?",
    "Скоро так разучитесь совсем рисовать",
    "( .\\_.)\n(.\\_. )"
  ]

let send = (message) => {
    message.channel.send(pandemonium.choice(msgList))
} 

exports.send = send