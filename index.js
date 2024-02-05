const TelegramBot = require('node-telegram-bot-api')

const token = '6965202334:AAEcJYVXE_NehXzEZ2NtjjdIHUT3PEvZGwQ'
// const token = '6085919277:AAGvJfRHmmSVj9FZJFOnhKWaJgJRrc1UwkI'
const bot = new TelegramBot(token, { polling: true })
const chatForOrdersId = '-1002109190302'

// Головне меню
const mainMenu = {
	keyboard: [
		[{ text: '🧥 Кофти 🧥', callback_data: 'menu_coffee1' }],
		// [{ text: '🧥 Штани 🧥', callback_data: 'menu_coffee2' }],
	],
	resize_keyboard: true,
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
						{ text: 'Утеплені', callback_data: 'sweatshirts_warm' },
						{ text: 'Неутеплені', callback_data: 'sweatshirts_not_warm' },
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
				'./imgs/coolmaxpixelwoman1.webp',
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
			'Натисніть "Назад до головного меню", щоб повернутися',
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

		state[chatId].productName = productName
		await bot.sendMessage(chatId, `Ви обрали: "${productName}"`, {})
		await bot.sendMessage(chatId, 'Оберіть спосіб платежу:', {
			reply_markup: {
				inline_keyboard: [
					[
						{
							text: 'Накладений',
							callback_data: `payment-type imposed`,
						},
						{
							text: 'Онлайн',
							callback_data: `payment-type online`,
						},
					],
				],
			},
		})
	}
	// обработка типа платежа
	if (clothingType.split(' ')[0] === 'payment-type') {
		const firstSpaceIndex = clothingType.indexOf(' ')
		const paymentType =
			firstSpaceIndex !== -1
				? clothingType.slice(firstSpaceIndex + 1)
				: clothingType

		// const productName = clothingType.split(' ')[1]

		state[chatId].paymentType = paymentType

		bot.sendMessage(chatId, 'Напишіть ваш номер телефону')
	}
})

// Обработка ответа на запрос данных пользователя
bot.on('text', async msg => {
	const chatId = msg.chat.id
	if (
		!!state[chatId]?.productName &&
		!!state[chatId]?.paymentType &&
		!state[chatId]?.phoneNumber
	) {
		state[chatId].phoneNumber = msg.text

		bot.sendMessage(chatId, `Укажіть ваш ПІБ`)
		return
	}
	if (
		!!state[chatId]?.productName &&
		!!state[chatId]?.paymentType &&
		!!state[chatId]?.phoneNumber &&
		!state[chatId]?.fullName
	) {
		state[chatId].fullName = msg.text

		bot.sendMessage(chatId, `Укажіть ваше місто`)
		return
	}
	if (
		!!state[chatId]?.productName &&
		!!state[chatId]?.paymentType &&
		!!state[chatId]?.phoneNumber &&
		!!state[chatId]?.fullName &&
		!state[chatId]?.city
	) {
		state[chatId].city = msg.text

		bot.sendMessage(chatId, `Укажіть відділення пошти`)
		return
	}
	if (
		!!state[chatId]?.productName &&
		!!state[chatId]?.paymentType &&
		!!state[chatId]?.phoneNumber &&
		!!state[chatId]?.fullName &&
		!!state[chatId]?.city &&
		!state[chatId]?.mail
	) {
		state[chatId].mail = msg.text

		bot.sendMessage(
			chatId,
			`Ви успішно замовили: ${state[chatId]?.productName}!`
		)
		bot.sendMessage(
			chatForOrdersId,
			`
			\n Ім'я: ${state[chatId]?.fullName}
			\nНомер телефону: ${state[chatId]?.phoneNumber}
			\nМісто: ${state[chatId]?.city}
			\nВідділення пошти: ${state[chatId]?.mail}
			\nТовар: ${state[chatId]?.productName}
			\nТип оплати: ${state[chatId]?.paymentType === 'imposed' ? 'наложка' : 'онлайн'}
			\nUPD: товар замовили за допомогою бота
		`
		)
		return
	}
})

// const TelegramBot = require('node-telegram-bot-api')

// const token = '6965202334:AAEcJYVXE_NehXzEZ2NtjjdIHUT3PEvZGwQ'
// // const token = '6085919277:AAGvJfRHmmSVj9FZJFOnhKWaJgJRrc1UwkI'
// const bot = new TelegramBot(token, { polling: true })
// const chatForOrdersId = '-1002109190302'
// const fs = require('fs')

// const getObjectKeys = object => {
// 	const allKeys = object.reduce((keys, obj) => {
// 		// Используем Object.keys для получения ключей текущего объекта
// 		const objKeys = Object.keys(obj)

// 		// Добавляем ключи текущего объекта к общему списку ключей
// 		return [...keys, ...objKeys]
// 	}, [])

// 	// Теперь переменная allKeys содержит все ключи из массива объектов
// 	return allKeys
// }

// const clothes = JSON.parse(fs.readFileSync('clothes.json', 'utf8'))

// // Головне меню
// const mainMenu = {
// 	keyboard: [
// 		[{ text: 'Футболки,Лонгсліви та Поло' }],
// 		// [{ text: '🧥 Штани 🧥', callback_data: 'menu_coffee2' }],
// 	],
// 	resize_keyboard: true,
// }

// async function sendItemDescription(chatId, itemName, itemPrice, itemImages) {
// 	const itemMessage = `${itemName}\nЦіна: ${itemPrice} грн`

// 	// Преобразовываем массив URL-ов фотографий в массив объектов с типом 'photo'
// 	const media = itemImages.map(photoUrl => ({
// 		media: `https://545style.com${photoUrl}`,
// 		type: 'photo',
// 		caption: itemMessage, // Добавляем название и цену товара
// 		parse_mode: 'Markdown',
// 	}))

// 	// Опции для группы фотографий
// 	const itemOptions = {
// 		reply_markup: {
// 			inline_keyboard: [
// 				[
// 					{
// 						text: 'Купити',
// 						callback_data: `buy ${itemName}`,
// 					},
// 				],
// 			],
// 		},
// 	}

// 	try {
// 		// Відправляємо групу фото
// 		await bot.sendMediaGroup(chatId, media)

// 		// Отправляем текстовое сообщение
// 		await bot.sendMessage(chatId, itemMessage, itemOptions)
// 	} catch (error) {
// 		console.error('Помилка при відправці групи фото:', error)
// 	}
// }

// const state = {}

// bot.on('message', async msg => {
// 	const chatId = msg.chat.id

// 	if (msg.text === '/start') {
// 		await bot.sendMessage(chatId, 'Вітаємо вас 👋')
// 	}

// 	if (msg.text === '/start' || msg.text === 'Назад до головного меню') {
// 		state[chatId] = {}
// 		await bot.sendMessage(
// 			chatId,
// 			'Виберіть розділ, щоб вивести перелік товарів:',
// 			{
// 				reply_markup: mainMenu,
// 			}
// 		)
// 	}

// 	if (msg.text === 'Футболки,Лонгсліви та Поло') {
// 		// Отправляем inline-клавиатуру для выбора "утепленных" и "неутепленных" кофт
// 		await bot.sendMessage(chatId, 'Виберіть тип кофт:', {
// 			reply_markup: {
// 				inline_keyboard: [
// 					[
// 						{ text: 'Утеплені', callback_data: 'tshirts_warm' },
// 						{ text: 'Неутеплені', callback_data: 'tshirts_not_warm' },
// 					],
// 				],
// 			},
// 		})
// 	}

// 	if (msg.text === '🧥 Штани 🧥') {
// 		await bot.sendMessage(chatId, 'Виберіть тип штанів:', {
// 			reply_markup: {
// 				inline_keyboard: [
// 					[
// 						{ text: 'Утепленные', callback_data: 'coffee_insulated' },
// 						{ text: 'Неутепленные', callback_data: 'coffee_not_insulated' },
// 					],
// 				],
// 			},
// 		})
// 	}
// })

// // Обработка inline-клавиатуры
// bot.on('callback_query', async query => {
// 	const chatId = query.message.chat.id
// 	const clothingType = query.data
// 	console.log(clothingType)

// 	// Обработка выбора типа кофт
// 	if (clothingType === 'tshirts_warm' || clothingType === 'tshirts_not_warm') {
// 		const tshirts = clothes['/futbolky/']

// 		if (clothingType === 'tshirts_warm') {
// 			for (const tshirt of tshirts) {
// 				if (tshirt.isWarm) {
// 					await sendItemDescription(
// 						chatId,
// 						tshirt.name,
// 						tshirt.price,
// 						tshirt.imageSrcs
// 					)
// 				}
// 			}
// 		}
// 		if (clothingType === 'tshirts_not_warm') {
// 			for (const tshirt of tshirts) {
// 				if (!tshirt.isWarm) {
// 					await sendItemDescription(
// 						chatId,
// 						tshirt.name,
// 						tshirt.price,
// 						tshirt.imageSrcs
// 					)
// 					return
// 				}
// 			}
// 		}

// 		// bot.sendMessage(
// 		// 	chatId,
// 		// 	'Натисніть "Назад до головного меню", щоб повернутися',
// 		// 	{
// 		// 		reply_markup: {
// 		// 			keyboard: [['Назад до головного меню']],
// 		// 			resize_keyboard: true,
// 		// 			one_time_keyboard: true,
// 		// 		},
// 		// 	}
// 		// )
// 	}

// 	// обработка кнопки buy
// 	if (clothingType.split(' ')[0] === 'buy') {
// 		const firstSpaceIndex = clothingType.indexOf(' ')
// 		const productName =
// 			firstSpaceIndex !== -1
// 				? clothingType.slice(firstSpaceIndex + 1)
// 				: clothingType

// 		state[chatId].productName = productName
// 		await bot.sendMessage(chatId, `Ви обрали: "${productName}"`, {})
// 		await bot.sendMessage(chatId, 'Оберіть спосіб платежу:', {
// 			reply_markup: {
// 				inline_keyboard: [
// 					[
// 						{
// 							text: 'Накладений',
// 							callback_data: `payment-type imposed`,
// 						},
// 						{
// 							text: 'Онлайн',
// 							callback_data: `payment-type online`,
// 						},
// 					],
// 				],
// 			},
// 		})
// 	}
// 	// обработка типа платежа
// 	if (clothingType.split(' ')[0] === 'payment-type') {
// 		const firstSpaceIndex = clothingType.indexOf(' ')
// 		const paymentType =
// 			firstSpaceIndex !== -1
// 				? clothingType.slice(firstSpaceIndex + 1)
// 				: clothingType

// 		// const productName = clothingType.split(' ')[1]

// 		state[chatId].paymentType = paymentType

// 		bot.sendMessage(chatId, 'Напишіть ваш номер телефону')
// 	}
// })

// // Обработка ответа на запрос данных пользователя
// bot.on('text', async msg => {
// 	const chatId = msg.chat.id

// 	if (
// 		!!state[chatId]?.productName &&
// 		!!state[chatId]?.paymentType &&
// 		!state[chatId]?.phoneNumber
// 	) {
// 		state[chatId].phoneNumber = msg.text

// 		bot.sendMessage(chatId, `Укажіть ваш ПІБ`)
// 		return
// 	}
// 	if (
// 		!!state[chatId]?.productName &&
// 		!!state[chatId]?.paymentType &&
// 		!!state[chatId]?.phoneNumber &&
// 		!state[chatId]?.fullName
// 	) {
// 		state[chatId].fullName = msg.text

// 		bot.sendMessage(chatId, `Укажіть ваше місто`)
// 		return
// 	}
// 	if (
// 		!!state[chatId]?.productName &&
// 		!!state[chatId]?.paymentType &&
// 		!!state[chatId]?.phoneNumber &&
// 		!!state[chatId]?.fullName &&
// 		!state[chatId]?.city
// 	) {
// 		state[chatId].city = msg.text

// 		bot.sendMessage(chatId, `Укажіть відділення пошти`)
// 		return
// 	}
// 	if (
// 		!!state[chatId]?.productName &&
// 		!!state[chatId]?.paymentType &&
// 		!!state[chatId]?.phoneNumber &&
// 		!!state[chatId]?.fullName &&
// 		!!state[chatId]?.city &&
// 		!state[chatId]?.mail
// 	) {
// 		state[chatId].mail = msg.text

// 		bot.sendMessage(
// 			chatId,
// 			`Ви успішно замовили: ${state[chatId]?.productName}!`
// 		)
// 		bot.sendMessage(
// 			chatForOrdersId,
// 			`
// 			\n Ім'я: ${state[chatId]?.fullName}
// 			\nНомер телефону: ${state[chatId]?.phoneNumber}
// 			\nМісто: ${state[chatId]?.city}
// 			\nВідділення пошти: ${state[chatId]?.mail}
// 			\nТовар: ${state[chatId]?.productName}
// 			\nТип оплати: ${state[chatId]?.paymentType === 'imposed' ? 'наложка' : 'онлайн'}
// 			\nUPD: товар замовили за допомогою бота
// 		`
// 		)
// 		return
// 	}
// })
