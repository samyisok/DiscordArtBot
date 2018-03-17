const pandemonium = require("pandemonium")

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
  message.channel.send(pandemonium.choice(answers))
}

exports.run = run
