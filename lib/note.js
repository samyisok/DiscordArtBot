const log = require("./log")

let add = (message, db) => {
  let msg = message.content
    .split(/\s/)
    .slice(1)
    .join(" ") + new Date()
  let author = message.author.username
  db
    .get("note")
    .push({
      id: reqCount,
      text: msg,
      from: author
    })
    .write()
  message.react("✅").catch(e => log.logError(e))
}

exports.add = add
