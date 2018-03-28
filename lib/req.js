const log = require("./log")

let add = (message, db) => {
  let report = /%report/i.test(message.content)
    ? "репорт об ошибке"
    : "фич-реквест"
  let msg = message.content
    .split(/\s/)
    .slice(1)
    .join(" ")
  let author = message.author.username
  let reqCount = db.get("reqCount").value()
  reqCount++
  db.set("reqCount", reqCount).write()
  db
    .get("req")
    .push({
      id: reqCount,
      text: msg,
      from: author
    })
    .write()
  message.react("✅").catch(e => log.warn(e.message))

  message.channel.send("Ваш " + report + " принят, Хорошего дня")
}

exports.add = add
