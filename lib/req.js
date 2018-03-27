
let add = (message, db) => {
    let msg = message.content.split(/\s/).slice(1).join(' ')
    let reqCount = db.get('reqCount').value()
    reqCount++
    db.set("reqCount", reqCount).write()
    db.get('req').push({
        id: reqCount,
        text: msg
    }).write()
    message.react("✅")
    message.channel.send('Ваш фичРеквест принят, Хорошего дня')
}

exports.add = add 