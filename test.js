const TelegramBot = require('node-telegram-bot-api')

const chatForOrdersId = '-1731459101'

const token = '6965202334:AAEcJYVXE_NehXzEZ2NtjjdIHUT3PEvZGwQ'
// const token = '6085919277:AAGvJfRHmmSVj9FZJFOnhKWaJgJRrc1UwkI'
const bot = new TelegramBot(token, { polling: true })

const a = async () => {
	await bot.sendMessage(chatForOrdersId, `qwwdq`)
}

a()
