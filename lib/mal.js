const pandemonium = require("pandemonium")
const log = require("./log")
const MalApi = require("mal-api")
const config = require("config")
const username = config.get("mal").username
const password = config.get("mal").password

const mal = new MalApi({
  username,
  password
})

function get(message, anime = "") {
  mal.anime
    .searchAnime(anime)
    .then(animelist => {
      anime = pandemonium.choice(animelist)
      msg = anime.title
      if (anime.english !== "") {
        msg = `${msg}(${anime.english})`
      }
      msg = msg + "\n" + anime.image

      message.channel
        .send(msg)
        .then(res => log.logSend(res))
        .catch(e => log.logError(e))
    })
    .catch(err => log.logError(err))
}

exports.get = get
