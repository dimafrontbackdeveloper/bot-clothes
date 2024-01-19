const TelegramBot = require('node-telegram-bot-api')

const token = '6965202334:AAEcJYVXE_NehXzEZ2NtjjdIHUT3PEvZGwQ'
const bot = new TelegramBot(token, { polling: true })

// Головне меню
const mainMenu = {
	keyboard: [
		[{ text: '🧥 Кофти 🧥', callback_data: 'menu_coffee1' }],
		[{ text: '🧥 Штани 🧥', callback_data: 'menu_coffee2' }],
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
						callback_data: `${buyCallbackData} ${itemName}`,
					},
				],
			],
		},
	}

	// Відправляємо фото
	await bot.sendPhoto(chatId, itemImage, itemOptions)
}

const state = {}

bot.on('message', async msg => {
	const chatId = msg.chat.id

	if (msg.text === '/start') {
		await bot.sendMessage(chatId, 'Вітаємо вас 👋')
	}

	if (msg.text === '/start' || msg.text === 'Назад до головного меню') {
		state[chatId] = {}
		await bot.sendMessage(
			chatId,
			'Виберіть розділ, щоб вивести перелік товарів:',
			{
				reply_markup: mainMenu,
			}
		)
	}

	if (msg.text === '🧥 Кофти 🧥') {
		// Отправляем inline-клавиатуру для выбора "утепленных" и "неутепленных" кофт
		await bot.sendMessage(chatId, 'Виберіть тип кофт:', {
			reply_markup: {
				inline_keyboard: [
					[
						{ text: 'Утепленные', callback_data: 'sweatshirts_warm' },
						{ text: 'Неутепленные', callback_data: 'sweatshirts_not_warm' },
					],
				],
			},
		})
	}

	if (msg.text === '🧥 Штани 🧥') {
		await bot.sendMessage(chatId, 'Виберіть тип штанів:', {
			reply_markup: {
				inline_keyboard: [
					[
						{ text: 'Утепленные', callback_data: 'coffee_insulated' },
						{ text: 'Неутепленные', callback_data: 'coffee_not_insulated' },
					],
				],
			},
		})
	}
})

// Обработка inline-клавиатуры
bot.on('callback_query', async query => {
	const chatId = query.message.chat.id
	const clothingType = query.data
	console.log(clothingType)

	// Обработка выбора типа кофт
	if (
		clothingType === 'sweatshirts_warm' ||
		clothingType === 'sweatshirts_not_warm'
	) {
		if (clothingType === 'sweatshirts_warm') {
			await sendItemDescription(
				chatId,
				'Кофта 1 тепла',
				'150',
				'https://images.prom.ua/2410743319_w640_h640_kofta-zhenskaya-kombinirovannaya.jpg',
				'Купити',
				'buy'
			)
		}
		if (clothingType === 'sweatshirts_not_warm') {
			await sendItemDescription(
				chatId,
				'Кофта 1 не тепла',
				'150',
				'https://images.prom.ua/2410743319_w640_h640_kofta-zhenskaya-kombinirovannaya.jpg',
				'Купити',
				'buy'
			)
		}

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

	// обработка кнопки buy
	if (clothingType.split(' ')[0] === 'buy') {
		const firstSpaceIndex = clothingType.indexOf(' ')
		const productName =
			firstSpaceIndex !== -1
				? clothingType.slice(firstSpaceIndex + 1)
				: clothingType

		// const productName = clothingType.split(' ')[1]

		state[chatId].productName = productName

		bot.sendMessage(chatId, 'Напишіть ваш номер телефону')
	}
})

// Обработка ответа на запрос данных пользователя
bot.on('text', async msg => {
	const chatId = msg.chat.id

	if (state[chatId]?.productName) {
		state[chatId].phoneNumber = msg.text

		bot.sendMessage(
			chatId,
			`${state[chatId].productName}---${state[chatId].phoneNumber}`
		)
	}
})
