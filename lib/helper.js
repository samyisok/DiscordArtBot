const pandemonium = require("pandemonium")
const listFilepaths = require("list-filepaths")
const log = require("./log")

function run(message) {
  return listFilepaths("./halp")
    .then(filepaths => {
      let path = pandemonium.choice(filepaths)
      message.channel
        .send("send help", {
          files: [path]
        })
        .then(res => log.logSend(res))
    })
    .catch(e => log.logError(e))
}

exports.run = run
