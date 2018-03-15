const axios = require("axios")

let sendUsers = (message, drawpile) => {
  let drawpileUrl = drawpile.url
  let drawpilePass = drawpile.password
  let drawpileUser = drawpile.user

  axios
    .get(drawpileUrl, {
      auth: {
        username: drawpileUser,
        password: drawpilePass
      }
    })
    .then(res => {
      let data = []
      res.data.forEach(x => data.push(x.name))
      let msg = "<http://2draw.me/drawpile/> - "
      if (data.length === 0) {
        msg += "Но в дравпайле никого нет 😭"
      } else {
        data = _.uniq(data)
        msg += "Пользователи в Drawpile: " + data.join(", ")
      }
      message.channel.send(msg)
    })
}

exports.sendUsers = sendUsers
