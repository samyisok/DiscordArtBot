const pandemonium = require("pandemonium")
const log = require("./log")

function run(message) {
  let answers = [
    "Да",
    "Нет",
    "Скорее да",
    "Я думаю, что нет",
    "Точно да",
    "Определенно нет",
    "Возможно",
    "Да нет наверное",
    "Спросите у Хидоя!"
  ]
  message.channel.send(pandemonium.choice(answers)).then( res => log.logSend(res))
}

exports.run = run
