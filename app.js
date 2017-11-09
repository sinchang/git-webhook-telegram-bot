const express = require('express')
const bodyParser = require('body-parser')
const TelegramBot = require('node-telegram-bot-api')
const firebase = require('firebase')
const uniqueString = require('unique-string')
const createMessage = require('./message')

require('dotenv').config()

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.BOT_TOKEN
const url = process.env.WEBHOOK_URL
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {
  polling: true
})
const app = express()
const PORT = process.env.PORT || 3000

firebase.initializeApp({
  apiKey: process.env.FIREBASE_KEY,
  databaseURL: process.env.FIREBASE_DATABASE_URL
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}))

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, `
    - command _/add {name}_ -- add new repository
    - command _/search {repository id}_ -- search repository info
  `)
})

bot.onText(/\/add/, msg => {
  const userId = msg.chat.id
  const repoName = msg.text.substring(5)
  const repoId = uniqueString()
  const webhookUrl = `${url}/webhook/${repoId}`
  firebase.database().ref(`repos/${repoId}`).set({
    webhookUrl,
    repoName,
    userId: userId,
    username: msg.chat.username
  }).then(() => {
    bot.sendMessage(userId, `congrats!!!
      - repository name is ${repoName}
      - unique repository id is ${repoId} (important)
      - webhook url is ${webhookUrl}`)
  }).catch(error => {
    bot.sendMessage(error.message)
  })
})

bot.onText(/\/search/, msg => {
  const userId = msg.chat.id
  const repoId = msg.text.substring(8)
  firebase.database().ref(`repos/${repoId}`).once('value')
    .then(snapshot => {
      const {
        webhookUrl,
        username,
        userId,
        repoName
      } = snapshot
      bot.sendMessage(userId, `congrats!!!
      - repoName url is ${repoName}
      - username is ${username}
      - webhook url is ${webhookUrl}`)
    }).catch(error => {
      bot.sendMessage(error.message)
    })
})

app.get('/', (req, res) => {
  res.send('hello world')
})

app.post('/webhook/:id', (req, res) => {
  const body = req.body
  const repoId = req.params.id
  const message = createMessage(body)
  firebase.database().ref(`repos/${repoId}`).once('value')
    .then(snapshot => {
      const {
        userId
      } = snapshot.val()
      bot.sendMessage(userId, message)
      res.send('succeed')
    })
})

app.post('/webhook1', (req, res) => {
  // console.log(req.body)
  console.log(createMessage(req.body))
  res.send('succeed')
})

app.listen(PORT, () => {
  console.log('server running in port ' + PORT)
})
