const TelegramBot = require('node-telegram-bot-api')

const token = '6965202334:AAEcJYVXE_NehXzEZ2NtjjdIHUT3PEvZGwQ'
const bot = new TelegramBot(token, { polling: true })

// Головне меню
const mainMenu = {
	reply_markup: {
		keyboard: [['Кофти'], ['Футболки'], ['Світера']],
		resize_keyboard: true,
	},
}

function sendItemDescription(
	chatId,
	itemName,
	itemPrice,
	itemImage,
	buyButtonText,
	buyCallbackData,
	backToMainMenu = true
) {
	const itemMessage = `${itemName}\nЦіна: ${itemPrice} грн`
	const itemOptions = {
		caption: itemMessage,
		parse_mode: 'Markdown',
		photo: itemImage,
		reply_markup: {
			inline_keyboard: [
				[
					{
						text: buyButtonText,
						callback_data: buyCallbackData,
					},
				],
			],
		},
	}
	bot.sendPhoto(chatId, itemImage, itemOptions)

	if (backToMainMenu) {
		bot.sendMessage(chatId, 'Назад до головного меню', mainMenu)
	}
}

// Відправлення повідомлення з головним меню
bot.onText(/\/start/, msg => {
	bot.sendMessage(msg.chat.id, 'Меню:', mainMenu)
})

// Обробка вибору пункту меню
bot.on('message', msg => {
	const chatId = msg.chat.id
	switch (msg.text) {
		case 'Кофти':
			// Логіка для показу варіантів кофт
			sendItemDescription(
				chatId,
				'Кофта 1',
				'100',
				'https://images.prom.ua/2410743319_w640_h640_kofta-zhenskaya-kombinirovannaya.jpg',
				'Купити',
				'buy_coffee_1'
			)

			sendItemDescription(
				chatId,
				'Кофта 2',
				'100',
				'https://images.prom.ua/2410743319_w640_h640_kofta-zhenskaya-kombinirovannaya.jpg',
				'Купити',
				'buy_coffee_1'
			)

			break

		case 'Футболки':
			// Логіка для показу варіантів футболок
			const tshirtMenu = {
				reply_markup: {
					keyboard: [
						['Футболка 1 - 50 грн'],
						['Футболка 2 - 80 грн'],
						['Футболка 3 - 60 грн'],
						['Назад до головного меню'],
					],
					resize_keyboard: true,
				},
			}
			bot.sendMessage(chatId, 'Виберіть футболку:', tshirtMenu)
			break

		case 'Світера':
			// Логіка для показу варіантів світерів
			const sweaterMenu = {
				reply_markup: {
					keyboard: [
						['Світер 1 - 120 грн'],
						['Світер 2 - 180 грн'],
						['Світер 3 - 150 грн'],
						['Назад до головного меню'],
					],
					resize_keyboard: true,
				},
			}
			bot.sendMessage(chatId, 'Виберіть світер:', sweaterMenu)
			break

		case 'Назад до головного меню':
			bot.sendMessage(chatId, 'Меню:', mainMenu)
			break

		default:
			// Логіка для обробки замовлення
			bot.sendMessage(chatId, `Ви вибрали: ${msg.text}. Замовлення прийнято!`)
			break
	}
})
