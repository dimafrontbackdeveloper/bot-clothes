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

// Inline-клавіатура для вибору меню
const menuInlineKeyboard = {
	inline_keyboard: [
		[{ text: 'Кофти', callback_data: 'menu_coffee' }],
		[{ text: 'Футболки', callback_data: 'menu_tshirt' }],
		[{ text: 'Світера', callback_data: 'menu_sweater' }],
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

// Логіка для показу варіантів футболок
async function showTshirtVariants(chatId) {
	await sendItemDescription(
		chatId,
		'Футболка 1',
		'50',
		'https://example.com/tshirt1.jpg',
		'Купити',
		'buy_tshirt_1'
	)
	await sendItemDescription(
		chatId,
		'Футболка 2',
		'80',
		'https://example.com/tshirt2.jpg',
		'Купити',
		'buy_tshirt_2'
	)
	await sendItemDescription(
		chatId,
		'Футболка 3',
		'60',
		'https://example.com/tshirt3.jpg',
		'Купити',
		'buy_tshirt_3'
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

// Логіка для показу варіантів світерів
async function showSweaterVariants(chatId) {
	await sendItemDescription(
		chatId,
		'Світер 1',
		'120',
		'https://example.com/sweater1.jpg',
		'Купити',
		'buy_sweater_1'
	)
	await sendItemDescription(
		chatId,
		'Світер 2',
		'180',
		'https://example.com/sweater2.jpg',
		'Купити',
		'buy_sweater_2'
	)
	await sendItemDescription(
		chatId,
		'Світер 3',
		'150',
		'https://example.com/sweater3.jpg',
		'Купити',
		'buy_sweater_3'
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

// Обробка Inline-кнопок
bot.on('callback_query', async callbackQuery => {
	const chatId = callbackQuery.message.chat.id
	const data = callbackQuery.data

	switch (data) {
		case 'menu_coffee':
			await showCoffeeVariants(chatId)
			break

		case 'menu_tshirt':
			await showTshirtVariants(chatId)
			break

		case 'menu_sweater':
			await showSweaterVariants(chatId)
			break

		default:
			// Додайте код для обробки натискання на кнопку "Купити"
			await bot.sendMessage(
				chatId,
				`Ви натиснули "Купити" для товару з ідентифікатором: ${data}`
			)
			break
	}
})

// Обробка вибору пункту меню
bot.on('message', async msg => {
	const chatId = msg.chat.id

	if (msg.text === '/start' || msg.text === 'Назад до головного меню') {
		// Вітаємо користувача та відправляємо Inline-клавіатуру для вибору меню
		await bot.sendMessage(chatId, 'Виберіть меню:', {
			reply_markup: menuInlineKeyboard,
		})
	}
})
