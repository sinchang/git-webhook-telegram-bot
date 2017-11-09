const express = require('express')
const bodyParser = require('body-parser')
const TelegramBot = require('node-telegram-bot-api')

// replace the value below with the Telegram token you receive from @BotFather
const token = '412096935:AAGEPdzS-oQh6dCpaJ3qw_cyrYiu2OGujvw'
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true})
const app = express()
const PORT = process.env.PORT || 8080

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

bot.on('message', (msg) => {
  const chatId = msg.chat.id
  // send a message to the chat acknowledging receipt of their message
  bot.sendMessage(chatId, 'Received your message')
})

app.get('/', (req, res) => {
  res.send('hello world')
})

app.post('/telegram', (req, res) => {
  cosole.log('22')
})

app.post('/webhook1', (req, res) => {
  const body = req.body
  const message = `[${body.project.path_with_namespace}]: ${body.event_name} by ${body.user_name}`
  console.log(message)
  res.send(message)
})

app.listen(PORT, () => {
  console.log('server running in port ' + PORT)
})
