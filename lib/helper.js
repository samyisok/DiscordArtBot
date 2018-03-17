const pandemonium = require('pandemonium')
const listFilepaths = require("list-filepaths")

function run (message) {
    return listFilepaths("./halp")
    .then(filepaths => {
      let path = pandemonium.choice(filepaths)
      message.channel.send("send help", {
        files: [path]
      })
    })
    .catch(err => {
      // Handle errors
      console.error(err)
    })
}

exports.run = run