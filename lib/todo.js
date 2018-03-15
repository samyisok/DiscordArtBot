let check = (message, db) => {

  let msg = message.content
  let splitter = /\s+/
  msg = msg.split(splitter).slice(1)
  if (msg[0] === "add") {
    msg = msg.slice(1)
    let user = message.author.username
    let userId = message.author.id
    let curTodo = db.get("todoCount").value()
    curTodo++
    db.set("todoCount", curTodo).write()
    db
      .get("todo")
      .push({
        id: curTodo,
        text: msg.join(" "),
        from: user,
        uid: userId
      })
      .write()
    message.react("✅")
    console.log(msg, user, curTodo)
  } else if (msg[0] === "del") {
    msg = msg
      .slice(1)
      .join("")
      .trim()
    let userId = message.author.id
    if (!/\d+/.test(msg)) {
      message.channel.send("Укажите ID конкретного таска a не " + msg)
      return
    }

    let delPost = db
      .get("todo")
      .filter(x => {
        return x.id === Number(msg)
      })
      .value()

    if (delPost.length === 0) {
      message.channel.send("Не найдена таска с таким id: " + msg)
      return
    }
    if (delPost[0].uid !== userId) {
      console.log(delPost[0].uid, userId)
      message.channel.send("Вы не владелец этой таски с id: " + msg)
      return
    }
    db
      .get("todo")
      .remove({
        id: delPost[0].id
      })
      .write()
    message.channel.send("Удолил:\n" + "```" + delPost[0].text + "```")
  } else {
    let byUser = msg[0]
    let todo = []
    if (byUser !== undefined) {
      console.log("byUser", byUser)
      todo = db
        .get("todo")
        .filter({
          from: byUser
        })
        .sortBy("id")
        .reverse()
        .value()
    } else {
      console.log("hello -1", todo)
      todo = db
        .get("todo")
        .sortBy("id")
        .reverse()
        .take(5)
        .value()
      console.log("hello", todo)
    }
    let countTask = todo.length
    let newMsg = todo
      .map(x => "#" + x.id + " " + x.text + ". From: " + x.from)
      .join("\n")
    //message.channel.send('```' + newMsg + '```' )
    console.log(todo)
    message.channel.send("Всего: " + countTask + "\n" + "```" + newMsg + "```")
  }
}

exports.check = check