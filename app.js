const express = require('express')
const bodyParser = require('body-parser')
const TelegramBot = require('node-telegram-bot-api')
const firebase = require('firebase')
const uniqueString = require('unique-string')

// replace the value below with the Telegram token you receive from @BotFather
const token = '412096935:AAGEPdzS-oQh6dCpaJ3qw_cyrYiu2OGujvw'
const url = 'https://gitlab-telegram-bot.herokuapp.com'
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true})
const app = express()
const PORT = process.env.PORT || 3000

firebase.initializeApp({
  apiKey: 'AIzaSyDmqhQ6Kcq6KdE7R4B9gZebPsiwUbGNIgs',
  databaseURL: 'https://gitlab-telegram-bot.firebaseio.com'
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

bot.onText(/\/add/, (msg) => {
  const userId = msg.chat.id
  const repoName = msg.message.text.substring(5)
  const repoId = uniqueString()
  const webhookUrl = `${url}/webhook/${repoId}`
  firebase.database().ref(`repos/${repoId}`).set({
    webhookUrl,
    repoName,
    userId: userId,
    username: msg.chat.username
  }).then(() => {
    console.log(repoName)
    bot.sendMessage(userId, `add succeed!!! repository name is ${repoName} and webhook url is ${webhookUrl}`)
  })
})

app.get('/', (req, res) => {
  res.send('hello world')
})

app.post('/webhook/:id', (req, res) => {
  const body = req.body
  const repoId = req.params.id
  const message = `[${body.project.path_with_namespace}]: ${body.event_name} by ${body.user_name}`
  firebase.database().ref(`repos/${repoId}`).once('value')
  .then(snapshot => {
    const { userId } = snapshot.val()
    console.log(userId)
    bot.sendMessage(userId, message)
    res.send('succeed')
  })
})

app.listen(PORT, () => {
  console.log('server running in port ' + PORT)
})
