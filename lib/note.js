const log = require("./log")

let add = (message, db) => {
  let msg = message.content
    .split(/\s/)
    .slice(1)
    .join(" ") + new Date()
  let author = message.author.username
  let noteCount = db.get("noteCount").value() || 0
  noteCount++
  db.set("noteCount", noteCount).write()
  db
    .get("note")
    .push({
      id: noteCount,
      text: msg,
      from: author
    })
    .write()
  message.react("✅").catch(e => log.logError(e))
}

exports.add = add
