const TelegramBot = require('node-telegram-bot-api')

const token = '6965202334:AAEcJYVXE_NehXzEZ2NtjjdIHUT3PEvZGwQ'
const bot = new TelegramBot(token, { polling: true })

// Головне меню
const mainMenu = {
	keyboard: [
		[{ text: '🧥 Кофти 🧥', callback_data: 'menu_coffee' }],
		[{ text: '🧥 Кофти 🧥', callback_data: 'menu_coffee' }],
		[{ text: '🧥 Кофти 🧥', callback_data: 'menu_coffee' }],
	],
	resize_keyboard: true,
}

// Inline-клавіатура для вибору меню
const menuInlineKeyboard = {
	inline_keyboard: [
		[{ text: '🧥 Кофти 🧥', callback_data: 'menu_coffee' }],
		[{ text: '👕 Футболки 👕', callback_data: 'menu_tshirt' }],
		[{ text: '🧣 Світера 🧣', callback_data: 'menu_sweater' }],
	],
}

// Функція для відправлення тексту та фото з Inline-кнопкою
async function sendItemDescription(
	chatId,
	itemName,
	itemPrice,
	itemImage,
	buyButtonText,
	buyCallbackData
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

	// Відправляємо фото
	await bot.sendPhoto(chatId, itemImage, itemOptions)
}

// Логіка для показу варіантів кофт
async function showCoffeeVariants(chatId) {
	bot.sendMessage(chatId, 'Перелік кофт:')

	await sendItemDescription(
		chatId,
		'Кофта 1',
		'100',
		'https://images.prom.ua/2410743319_w640_h640_kofta-zhenskaya-kombinirovannaya.jpg',
		'Купити',
		'buy_coffee_1'
	)
	await sendItemDescription(
		chatId,
		'Кофта 2',
		'150',
		'https://images.prom.ua/2410743319_w640_h640_kofta-zhenskaya-kombinirovannaya.jpg',
		'Купити',
		'buy_coffee_1'
	)

	// Додаємо кнопку "Назад до головного меню"
	bot.sendMessage(
		chatId,
		'Натисніть "Назад до головного меню", щоб повернутися:',
		{
			reply_markup: {
				keyboard: [['Назад до головного меню']],
				resize_keyboard: true,
				one_time_keyboard: true,
			},
		}
	)
}

// Обробка вибору пункту меню
bot.on('message', async msg => {
	const chatId = msg.chat.id
	console.log(msg.text) // Додайте цей рядок для виводу тексту повідомлення в консоль

	if (msg.text === '/start') {
		// Вітаємо користувача та відправляємо Inline-клавіатуру для вибору меню
		await bot.sendMessage(chatId, 'Вітаємо вас 👋')
	}
	if (msg.text === '/start' || msg.text === 'Назад до головного меню') {
		// Вітаємо користувача та відправляємо Inline-клавіатуру для вибору меню
		await bot.sendMessage(
			chatId,
			'Виберіть розділ, щоб вивести перелік товарів:',
			{
				reply_markup: mainMenu,
			}
		)
	}
	if (msg.text === '🧥 Кофти 🧥') {
		// Вітаємо користувача та відправляємо Inline-клавіатуру для вибору меню
		await showCoffeeVariants(chatId)
	}
})
