const filename = "main.log"
const winston = require("winston")

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: filename })
  ]
})

const logSend = promiseResp => {
  let content = promiseResp.content || ""
  let channelName = promiseResp.channel.name || ""
  let id = promiseResp.id || ""
  let createdTime = promiseResp.createdTimestamp || ""

  logger.info(
    `CMDOUT: ${content}, id: ${id}, channel: ${channelName}, createdAt: ${createdTime}`
  )
}

const logError = err => {
  logger.warn(err.message)
}

module.exports = logger
module.exports.logSend = logSend
module.exports.logError = logError
