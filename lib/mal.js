const pandemonium = require("pandemonium")
const log = require("./log")
const MalApi = require("mal-api")
const config = require("config")
const username = config.get("mal").username
const password = config.get("mal").password

let mal = new MalApi({
  username,
  password
})

function get(message, findStr = "") {
  mal.anime
    .searchAnime(findStr)
    .then(animelist => {
      let chosenAnime = pandemonium.choice(animelist)
      let msg = chosenAnime.title
      if (
        chosenAnime.english !== "" &&
        chosenAnime.english !== chosenAnime.title
      ) {
        msg = `${msg}(${chosenAnime.english})`
      }
      msg = msg + "\n" + chosenAnime.image

      message.channel
        .send(msg)
        .then(res => log.logSend(res))
        .catch(e => log.logError(e))
    })
    .catch(err => {
      log.logError(err)
      message.react("🤷").catch(e => log.logError(e))
    })
}

exports.get = get
