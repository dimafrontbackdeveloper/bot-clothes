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

// const TelegramBot = require('node-telegram-bot-api')

// const token = '6965202334:AAEcJYVXE_NehXzEZ2NtjjdIHUT3PEvZGwQ'
// // const token = '6085919277:AAGvJfRHmmSVj9FZJFOnhKWaJgJRrc1UwkI'
// const bot = new TelegramBot(token, { polling: true })
// const chatForOrdersId = '-1001731459101'
// const fs = require('fs')

// const clothes = JSON.parse(fs.readFileSync('clothes.json', 'utf8'))

// // Головне меню
// const mainMenu = {
// 	keyboard: [
// 		[{ text: 'Футболки,Лонгсліви та Поло' }],
// 		[{ text: 'Штани' }],
// 		[{ text: 'Білизна' }],
// 		[{ text: 'Верхній одяг' }],
// 		[{ text: 'Аксесуари' }],
// 		[{ text: 'Головні убори' }],
// 		[{ text: 'Комплекти' }],
// 		// [{ text: '🧥 Штани 🧥', callback_data: 'menu_coffee2' }],
// 	],
// 	resize_keyboard: true,
// }

// function getRandomInt(min, max) {
// 	min = Math.ceil(min)
// 	max = Math.floor(max)
// 	return Math.floor(Math.random() * (max - min + 1)) + min
// }

// async function sendItemDescription(
// 	chatId,
// 	itemName,
// 	itemPrice,
// 	itemImages,
// 	itemId,
// 	category
// ) {
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
// 						callback_data: `buy ${category} ${itemId}`,
// 					},
// 				],
// 			],
// 		},
// 	}

// 	try {
// 		console.log(media)
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

// 	if (
// 		msg.text === 'Футболки,Лонгсліви та Поло' ||
// 		msg.text === 'Штани' ||
// 		msg.text === 'Білизна' ||
// 		msg.text === 'Верхній одяг' ||
// 		msg.text === 'Аксесуари' ||
// 		msg.text === 'Головні убори' ||
// 		msg.text === 'Комплекти'
// 	) {
// 		state[chatId] = {}
// 		state[chatId].clothe =
// 			msg.text === 'Футболки,Лонгсліви та Поло'
// 				? 'tshirts'
// 				: msg.text === 'Штани'
// 				? 'trousers'
// 				: msg.text === 'Білизна'
// 				? 'whiteness'
// 				: msg.text === 'Верхній одяг'
// 				? 'outerwear'
// 				: msg.text === 'Аксесуари'
// 				? 'accessories'
// 				: msg.text === 'Головні убори'
// 				? 'hats'
// 				: msg.text === 'Комплекти'
// 				? 'kits'
// 				: ''
// 		// Отправляем inline-клавиатуру для выбора "утепленных" и "неутепленных" кофт
// 		await bot.sendMessage(chatId, 'Виберіть тип одягу:', {
// 			reply_markup: {
// 				inline_keyboard: [
// 					[
// 						{ text: 'Утеплені', callback_data: 'warm' },
// 						{ text: 'Неутеплені', callback_data: 'not_warm' },
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
// 	const clothe = state[chatId].clothe
// 	console.log(clothingType)

// 	// Обработка выбора типа кофт
// 	if (clothingType === 'warm' || clothingType === 'not_warm') {
// 		const category =
// 			clothe === 'tshirts'
// 				? '/futbolky/'
// 				: clothe === 'trousers'
// 				? '/shtany/'
// 				: clothe === 'whiteness'
// 				? '/termo-bilyzna/'
// 				: clothe === 'outerwear'
// 				? '/kurtky/'
// 				: clothe === 'accessories'
// 				? '/aksesuary/'
// 				: clothe === 'hats'
// 				? '/holovni-ubory/'
// 				: clothe === 'kits'
// 				? '/komplekty/'
// 				: ''
// 		const clothesByCategory = clothes[category]
// 		let isClotheExists = false

// 		if (clothingType === 'warm') {
// 			for (const clothe of clothesByCategory) {
// 				if (clothe.isWarm) {
// 					isClotheExists = true
// 					await sendItemDescription(
// 						chatId,
// 						clothe.name,
// 						clothe.price,
// 						clothe.imageSrcs,
// 						clothe.id,
// 						category
// 					)
// 				}
// 			}
// 		}

// 		if (clothingType === 'not_warm') {
// 			for (const clothe of clothesByCategory) {
// 				if (!clothe.isWarm) {
// 					isClotheExists = true

// 					await sendItemDescription(
// 						chatId,
// 						clothe.name,
// 						clothe.price,
// 						clothe.imageSrcs,
// 						clothe.id,
// 						category
// 					)
// 				}
// 			}
// 		}

// 		if (!isClotheExists) {
// 			bot.sendMessage(chatId, 'Таких товарів зараз нема у наявності')
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
// 		const productCategory = clothingType.split(' ')[1]
// 		console.log(`productCategory: ${productCategory}`)

// 		const productId = clothingType.split(' ')[2]
// 		console.log(`productId: ${productId}`)

// 		const clothesByCategory = clothes[productCategory]
// 		console.log(`clothesByCategory: ${clothesByCategory}`)

// 		const orderedProduct = clothesByCategory.find(clothe => {
// 			return Number(clothe.id) === Number(productId)
// 		})
// 		console.log(`productName: ${JSON.stringify(orderedProduct.name)}`)

// 		state[chatId].productName = orderedProduct.name
// 		await bot.sendMessage(
// 			chatId,
// 			`Ви обрали: "${state[chatId].productName}"`,
// 			{}
// 		)
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

// 		bot.sendMessage(chatId, `Укажіть розмір`)
// 		return
// 	}
// 	if (
// 		!!state[chatId]?.productName &&
// 		!!state[chatId]?.paymentType &&
// 		!!state[chatId]?.phoneNumber &&
// 		!state[chatId]?.size
// 	) {
// 		state[chatId].size = msg.text

// 		bot.sendMessage(chatId, `Укажіть ваш ПІБ`)
// 		return
// 	}
// 	if (
// 		!!state[chatId]?.productName &&
// 		!!state[chatId]?.paymentType &&
// 		!!state[chatId]?.phoneNumber &&
// 		!!state[chatId]?.size &&
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
// 		!!state[chatId]?.size &&
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
// 		!!state[chatId]?.size &&
// 		!!state[chatId]?.fullName &&
// 		!!state[chatId]?.city &&
// 		!state[chatId]?.mail
// 	) {
// 		state[chatId].mail = msg.text

// 		await bot.sendMessage(
// 			chatId,
// 			`Ви успішно замовили: ${state[chatId]?.productName}!`
// 		)

// 		if (
// 			state[chatId]?.productName === 'Тактичні штани 5.45style піксель жіночі'
// 		) {
// 			const category = '/futbolky/'

// 			const clothe = clothes[category].find(
// 				clothe => clothe.name === 'Тактичний лонгслів жіночий 5.45style піксель'
// 			)

// 			await bot.sendMessage(
// 				chatId,
// 				`Разом з товаром, що ви замовили також замовляють: ${clothe.name}!`
// 			)

// 			await sendItemDescription(
// 				chatId,
// 				clothe.name,
// 				clothe.price,
// 				clothe.imageSrcs,
// 				clothe.id,
// 				category
// 			)
// 		}

// 		if (
// 			state[chatId]?.productName ===
// 			'Тактичний лонгслів жіночий 5.45style піксель'
// 		) {
// 			const category = '/shtany/'

// 			const clothe = clothes[category].find(
// 				clothe => clothe.name === 'Тактичні штани 5.45style піксель жіночі'
// 			)

// 			await bot.sendMessage(
// 				chatId,
// 				`Разом з товаром, що ви замовили також замовляють: ${clothe.name}!`
// 			)

// 			await sendItemDescription(
// 				chatId,
// 				clothe.name,
// 				clothe.price,
// 				clothe.imageSrcs,
// 				clothe.id,
// 				category
// 			)
// 		}
// 		if (
// 			state[chatId]?.productName ===
// 			'Тактичний лонгслів 5.45style жіночий black'
// 		) {
// 			const category = '/futbolky/'

// 			const clothe = clothes[category].find(
// 				clothe => clothe.name === 'Штани Soft Shell на флісі чорні'
// 			)

// 			await bot.sendMessage(
// 				chatId,
// 				`Разом з товаром, що ви замовили також замовляють: ${clothe.name}!`
// 			)

// 			await sendItemDescription(
// 				chatId,
// 				clothe.name,
// 				clothe.price,
// 				clothe.imageSrcs,
// 				clothe.id,
// 				category
// 			)
// 		} else if (
// 			state[chatId]?.productName === 'Штани Soft Shell на флісі чорні'
// 		) {
// 			const category = '/futbolky/'
// 			console.log(clothes[category])

// 			const clothe = clothes[category].find(
// 				clothe => clothe.name === 'Тактичний лонгслів 5.45style жіночий black'
// 			)

// 			console.log(clothe)

// 			await bot.sendMessage(
// 				chatId,
// 				`Разом з товаром, що ви замовили також замовляють: ${clothe.name}!`
// 			)

// 			await sendItemDescription(
// 				chatId,
// 				clothe.name,
// 				clothe.price,
// 				clothe.imageSrcs,
// 				clothe.id,
// 				category
// 			)
// 		} else {
// 			const category = '/holovni-ubory/'

// 			const categoryClothesLength = clothes[category].length
// 			const idOfRandomClothe = getRandomInt(0, categoryClothesLength - 1)
// 			const randomClothe = clothes[category].find(
// 				clothe => Number(clothe.id) === Number(idOfRandomClothe)
// 			)

// 			await bot.sendMessage(
// 				chatId,
// 				`Разом з товаром, що ви замовили також замовляють: ${randomClothe.name}!`
// 			)

// 			await sendItemDescription(
// 				chatId,
// 				randomClothe.name,
// 				randomClothe.price,
// 				randomClothe.imageSrcs,
// 				randomClothe.id,
// 				category
// 			)
// 		}

// 		await bot.sendMessage(
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

//------------------------------------------------------------------------------

// const TelegramBot = require('node-telegram-bot-api')

// // const token = '6965202334:AAEcJYVXE_NehXzEZ2NtjjdIHUT3PEvZGwQ'
// const token = '6085919277:AAGvJfRHmmSVj9FZJFOnhKWaJgJRrc1UwkI'
// const bot = new TelegramBot(token, { polling: true })
// const chatForOrdersId = '-1001731459101'
// const fs = require('fs')

// const clothes = JSON.parse(fs.readFileSync('clothes.json', 'utf8'))

// // Головне меню
// const mainMenu = {
// 	keyboard: [
// 		[{ text: 'Футболки,Лонгсліви та Поло' }],
// 		[{ text: 'Штани' }],
// 		[{ text: 'Білизна' }],
// 		[{ text: 'Верхній одяг' }],
// 		[{ text: 'Аксесуари' }],
// 		[{ text: 'Головні убори' }],
// 		[{ text: 'Комплекти' }],
// 		// [{ text: '🧥 Штани 🧥', callback_data: 'menu_coffee2' }],
// 	],
// 	resize_keyboard: true,
// }

// function getRandomInt(min, max) {
// 	min = Math.ceil(min)
// 	max = Math.floor(max)
// 	return Math.floor(Math.random() * (max - min + 1)) + min
// }

// async function sendItemDescription(
// 	chatId,
// 	itemName,
// 	itemPrice,
// 	itemImages,
// 	itemId,
// 	category
// ) {
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
// 						callback_data: `buy ${category} ${itemId}`,
// 					},
// 				],
// 			],
// 		},
// 	}

// 	try {
// 		console.log(media)
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

// 	if (
// 		msg.text === 'Футболки,Лонгсліви та Поло' ||
// 		msg.text === 'Штани' ||
// 		msg.text === 'Білизна' ||
// 		msg.text === 'Верхній одяг' ||
// 		msg.text === 'Аксесуари' ||
// 		msg.text === 'Головні убори' ||
// 		msg.text === 'Комплекти'
// 	) {
// 		state[chatId] = {}
// 		state[chatId].clothe =
// 			msg.text === 'Футболки,Лонгсліви та Поло'
// 				? 'tshirts'
// 				: msg.text === 'Штани'
// 				? 'trousers'
// 				: msg.text === 'Білизна'
// 				? 'whiteness'
// 				: msg.text === 'Верхній одяг'
// 				? 'outerwear'
// 				: msg.text === 'Аксесуари'
// 				? 'accessories'
// 				: msg.text === 'Головні убори'
// 				? 'hats'
// 				: msg.text === 'Комплекти'
// 				? 'kits'
// 				: ''
// 		// Отправляем inline-клавиатуру для выбора "утепленных" и "неутепленных" кофт
// 		await bot.sendMessage(chatId, 'Виберіть тип одягу:', {
// 			reply_markup: {
// 				inline_keyboard: [
// 					[
// 						{ text: 'Утеплені', callback_data: 'warm' },
// 						{ text: 'Неутеплені', callback_data: 'not_warm' },
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
// 	const clothe = state[chatId].clothe
// 	console.log(clothingType)

// 	// Обработка выбора типа кофт
// 	if (clothingType === 'warm' || clothingType === 'not_warm') {
// 		const category =
// 			clothe === 'tshirts'
// 				? '/futbolky/'
// 				: clothe === 'trousers'
// 				? '/shtany/'
// 				: clothe === 'whiteness'
// 				? '/termo-bilyzna/'
// 				: clothe === 'outerwear'
// 				? '/kurtky/'
// 				: clothe === 'accessories'
// 				? '/aksesuary/'
// 				: clothe === 'hats'
// 				? '/holovni-ubory/'
// 				: clothe === 'kits'
// 				? '/komplekty/'
// 				: ''
// 		const clothesByCategory = clothes[category]
// 		let isClotheExists = false

// 		if (clothingType === 'warm') {
// 			for (const clothe of clothesByCategory) {
// 				if (clothe.isWarm) {
// 					isClotheExists = true
// 					await sendItemDescription(
// 						chatId,
// 						clothe.name,
// 						clothe.price,
// 						clothe.imageSrcs,
// 						clothe.id,
// 						category
// 					)
// 				}
// 			}
// 		}

// 		if (clothingType === 'not_warm') {
// 			for (const clothe of clothesByCategory) {
// 				if (!clothe.isWarm) {
// 					isClotheExists = true

// 					await sendItemDescription(
// 						chatId,
// 						clothe.name,
// 						clothe.price,
// 						clothe.imageSrcs,
// 						clothe.id,
// 						category
// 					)
// 				}
// 			}
// 		}

// 		if (!isClotheExists) {
// 			bot.sendMessage(chatId, 'Таких товарів зараз нема у наявності')
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
// 		const productCategory = clothingType.split(' ')[1]
// 		console.log(`productCategory: ${productCategory}`)

// 		const productId = clothingType.split(' ')[2]
// 		console.log(`productId: ${productId}`)

// 		const clothesByCategory = clothes[productCategory]
// 		console.log(`clothesByCategory: ${clothesByCategory}`)

// 		const orderedProduct = clothesByCategory.find(clothe => {
// 			return Number(clothe.id) === Number(productId)
// 		})
// 		console.log(`productName: ${JSON.stringify(orderedProduct.name)}`)

// 		state[chatId].productName = orderedProduct.name
// 		await bot.sendMessage(
// 			chatId,
// 			`Ви обрали: "${state[chatId].productName}"`,
// 			{}
// 		)
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

// 		bot.sendMessage(chatId, `Укажіть розмір`)
// 		return
// 	}
// 	if (
// 		!!state[chatId]?.productName &&
// 		!!state[chatId]?.paymentType &&
// 		!!state[chatId]?.phoneNumber &&
// 		!state[chatId]?.size
// 	) {
// 		state[chatId].size = msg.text

// 		bot.sendMessage(chatId, `Укажіть ваш ПІБ`)
// 		return
// 	}
// 	if (
// 		!!state[chatId]?.productName &&
// 		!!state[chatId]?.paymentType &&
// 		!!state[chatId]?.phoneNumber &&
// 		!!state[chatId]?.size &&
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
// 		!!state[chatId]?.size &&
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
// 		!!state[chatId]?.size &&
// 		!!state[chatId]?.fullName &&
// 		!!state[chatId]?.city &&
// 		!state[chatId]?.mail
// 	) {
// 		state[chatId].mail = msg.text

// 		await bot.sendMessage(
// 			chatId,
// 			`Ви успішно замовили: ${state[chatId]?.productName}!`
// 		)

// 		if (
// 			state[chatId]?.productName === 'Тактичні штани 5.45style піксель жіночі'
// 		) {
// 			const category = '/futbolky/'

// 			const clothe = clothes[category].find(
// 				clothe => clothe.name === 'Тактичний лонгслів жіночий 5.45style піксель'
// 			)

// 			await bot.sendMessage(
// 				chatId,
// 				`Разом з товаром, що ви замовили також замовляють: ${clothe.name}!`
// 			)

// 			await sendItemDescription(
// 				chatId,
// 				clothe.name,
// 				clothe.price,
// 				clothe.imageSrcs,
// 				clothe.id,
// 				category
// 			)
// 		}

// 		if (
// 			state[chatId]?.productName ===
// 			'Тактичний лонгслів жіночий 5.45style піксель'
// 		) {
// 			const category = '/shtany/'

// 			const clothe = clothes[category].find(
// 				clothe => clothe.name === 'Тактичні штани 5.45style піксель жіночі'
// 			)

// 			await bot.sendMessage(
// 				chatId,
// 				`Разом з товаром, що ви замовили також замовляють: ${clothe.name}!`
// 			)

// 			await sendItemDescription(
// 				chatId,
// 				clothe.name,
// 				clothe.price,
// 				clothe.imageSrcs,
// 				clothe.id,
// 				category
// 			)
// 		}
// 		if (
// 			state[chatId]?.productName ===
// 			'Тактичний лонгслів 5.45style жіночий black'
// 		) {
// 			const category = '/futbolky/'

// 			const clothe = clothes[category].find(
// 				clothe => clothe.name === 'Штани Soft Shell на флісі чорні'
// 			)

// 			await bot.sendMessage(
// 				chatId,
// 				`Разом з товаром, що ви замовили також замовляють: ${clothe.name}!`
// 			)

// 			await sendItemDescription(
// 				chatId,
// 				clothe.name,
// 				clothe.price,
// 				clothe.imageSrcs,
// 				clothe.id,
// 				category
// 			)
// 		} else if (
// 			state[chatId]?.productName === 'Штани Soft Shell на флісі чорні'
// 		) {
// 			const category = '/futbolky/'
// 			console.log(clothes[category])

// 			const clothe = clothes[category].find(
// 				clothe => clothe.name === 'Тактичний лонгслів 5.45style жіночий black'
// 			)

// 			console.log(clothe)

// 			await bot.sendMessage(
// 				chatId,
// 				`Разом з товаром, що ви замовили також замовляють: ${clothe.name}!`
// 			)

// 			await sendItemDescription(
// 				chatId,
// 				clothe.name,
// 				clothe.price,
// 				clothe.imageSrcs,
// 				clothe.id,
// 				category
// 			)
// 		} else {
// 			const category = '/holovni-ubory/'

// 			const categoryClothesLength = clothes[category].length
// 			const idOfRandomClothe = getRandomInt(0, categoryClothesLength - 1)
// 			const randomClothe = clothes[category].find(
// 				clothe => Number(clothe.id) === Number(idOfRandomClothe)
// 			)

// 			await bot.sendMessage(
// 				chatId,
// 				`Разом з товаром, що ви замовили також замовляють: ${randomClothe.name}!`
// 			)

// 			await sendItemDescription(
// 				chatId,
// 				randomClothe.name,
// 				randomClothe.price,
// 				randomClothe.imageSrcs,
// 				randomClothe.id,
// 				category
// 			)
// 		}

// 		await bot.sendMessage(
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



const TelegramBot = require('node-telegram-bot-api')

const token = '6965202334:AAEcJYVXE_NehXzEZ2NtjjdIHUT3PEvZGwQ'
// const token = '6085919277:AAGvJfRHmmSVj9FZJFOnhKWaJgJRrc1UwkI'
const bot = new TelegramBot(token, { polling: true })
const chatForOrdersId = '-1001731459101'
const fs = require('fs')

const clothes = JSON.parse(fs.readFileSync('clothes.json', 'utf8'))

// Головне меню
const mainMenu = {
	keyboard: [
		[{ text: 'Футболки,Лонгсліви та Поло' }],
		[{ text: 'Штани' }],
		[{ text: 'Білизна' }],
		[{ text: 'Верхній одяг' }],
		[{ text: 'Аксесуари' }],
		[{ text: 'Головні убори' }],
		[{ text: 'Комплекти' }],
		// [{ text: '🧥 Штани 🧥', callback_data: 'menu_coffee2' }],
	],
	resize_keyboard: true,
}

function getRandomInt(min, max) {
	min = Math.ceil(min)
	max = Math.floor(max)
	return Math.floor(Math.random() * (max - min + 1)) + min
}

async function sendItemDescription(
	chatId,
	itemName,
	itemPrice,
	itemImages,
	itemId,
	category
) {
	const itemMessage = `${itemName}\nЦіна: ${itemPrice} грн`

	// Преобразовываем массив URL-ов фотографий в массив объектов с типом 'photo'
	const media = itemImages.map(photoUrl => ({
		media: `https://545style.com${photoUrl}`,
		type: 'photo',
		caption: itemMessage, // Добавляем название и цену товара
		parse_mode: 'Markdown',
	}))

	// Опции для группы фотографий
	const itemOptions = {
		reply_markup: {
			inline_keyboard: [
				[
					{
						text: 'Купити',
						callback_data: `buy ${category} ${itemId}`,
					},
					{
						text: 'Подивитись більше фоток',
						callback_data: `more_photos ${category} ${itemId}`,
					},
				],
			],
		},
	}

	try {
		console.log(media)
		// Відправляємо групу фото
		await bot.sendPhoto(chatId, media[0].media)
		// await bot.sendPhoto(chatId, media[0].media, {
		// 	caption: itemMessage,
		// 	...itemOptions,
		// })

		// Отправляем текстовое сообщение
		await bot.sendMessage(chatId, itemMessage, itemOptions)
	} catch (error) {
		console.error('Помилка при відправці групи фото:', error)
	}
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

	if (
		msg.text === 'Футболки,Лонгсліви та Поло' ||
		msg.text === 'Штани' ||
		msg.text === 'Білизна' ||
		msg.text === 'Верхній одяг' ||
		msg.text === 'Аксесуари' ||
		msg.text === 'Головні убори' ||
		msg.text === 'Комплекти'
	) {
		state[chatId] = {}
		state[chatId].clothe =
			msg.text === 'Футболки,Лонгсліви та Поло'
				? 'tshirts'
				: msg.text === 'Штани'
				? 'trousers'
				: msg.text === 'Білизна'
				? 'whiteness'
				: msg.text === 'Верхній одяг'
				? 'outerwear'
				: msg.text === 'Аксесуари'
				? 'accessories'
				: msg.text === 'Головні убори'
				? 'hats'
				: msg.text === 'Комплекти'
				? 'kits'
				: ''
		// Отправляем inline-клавиатуру для выбора "утепленных" и "неутепленных" кофт
		await bot.sendMessage(chatId, 'Виберіть тип одягу:', {
			reply_markup: {
				inline_keyboard: [
					[
						{ text: 'Утеплені', callback_data: 'warm' },
						{ text: 'Неутеплені', callback_data: 'not_warm' },
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
	const clothe = state[chatId].clothe
	console.log(clothingType)

	// Обработка выбора типа кофт
	if (clothingType === 'warm' || clothingType === 'not_warm') {
		const category =
			clothe === 'tshirts'
				? '/futbolky/'
				: clothe === 'trousers'
				? '/shtany/'
				: clothe === 'whiteness'
				? '/termo-bilyzna/'
				: clothe === 'outerwear'
				? '/kurtky/'
				: clothe === 'accessories'
				? '/aksesuary/'
				: clothe === 'hats'
				? '/holovni-ubory/'
				: clothe === 'kits'
				? '/komplekty/'
				: ''
		const clothesByCategory = clothes[category]
		let isClotheExists = false

		if (clothingType === 'warm') {
			for (const clothe of clothesByCategory) {
				if (clothe.isWarm) {
					isClotheExists = true
					await sendItemDescription(
						chatId,
						clothe.name,
						clothe.price,
						clothe.imageSrcs,
						clothe.id,
						category
					)
				}
			}
		}

		if (clothingType === 'not_warm') {
			for (const clothe of clothesByCategory) {
				if (!clothe.isWarm) {
					isClotheExists = true

					await sendItemDescription(
						chatId,
						clothe.name,
						clothe.price,
						clothe.imageSrcs,
						clothe.id,
						category
					)
				}
			}
		}

		if (!isClotheExists) {
			bot.sendMessage(chatId, 'Таких товарів зараз нема у наявності')
		}

		// bot.sendMessage(
		// 	chatId,
		// 	'Натисніть "Назад до головного меню", щоб повернутися',
		// 	{
		// 		reply_markup: {
		// 			keyboard: [['Назад до головного меню']],
		// 			resize_keyboard: true,
		// 			one_time_keyboard: true,
		// 		},
		// 	}
		// )
	}

	// обработка кнопки buy
	if (clothingType.split(' ')[0] === 'buy') {
		const productCategory = clothingType.split(' ')[1]
		const productId = clothingType.split(' ')[2]
		const clothesByCategory = clothes[productCategory]
		const orderedProduct = clothesByCategory.find(clothe => {
			return Number(clothe.id) === Number(productId)
		})

		state[chatId].productName = orderedProduct.name

		await bot.sendMessage(
			chatId,
			`Ви обрали: "${state[chatId].productName}"`,
			{}
		)
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

	// обработка типа платежа
	if (clothingType.split(' ')[0] === 'more_photos') {
		const productCategory = clothingType.split(' ')[1]
		const productId = clothingType.split(' ')[2]
		const clothesByCategory = clothes[productCategory]
		const orderedProduct = clothesByCategory.find(clothe => {
			return Number(clothe.id) === Number(productId)
		})

		const itemOptions = {
			reply_markup: {
				inline_keyboard: [
					[
						{
							text: 'Купити',
							callback_data: `buy ${productCategory} ${productId}`,
						},
					],
				],
			},
		}

		const media = orderedProduct.imageSrcs.map(photoUrl => ({
			media: `https://545style.com${photoUrl}`,
			type: 'photo',
			caption: '1', // Добавляем название и цену товара
			parse_mode: 'Markdown',
		}))

		await bot.sendMessage(chatId, `Більше фоток для "${orderedProduct.name}"`)
		await bot.sendMediaGroup(chatId, media)
		await bot.sendMessage(
			chatId,
			`Натисніть кнопку "Купити", щоб придбати товар`,
			itemOptions
		)
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

		bot.sendMessage(chatId, `Укажіть розмір`)
		return
	}
	if (
		!!state[chatId]?.productName &&
		!!state[chatId]?.paymentType &&
		!!state[chatId]?.phoneNumber &&
		!state[chatId]?.size
	) {
		state[chatId].size = msg.text

		bot.sendMessage(chatId, `Укажіть ваш ПІБ`)
		return
	}
	if (
		!!state[chatId]?.productName &&
		!!state[chatId]?.paymentType &&
		!!state[chatId]?.phoneNumber &&
		!!state[chatId]?.size &&
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
		!!state[chatId]?.size &&
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
		!!state[chatId]?.size &&
		!!state[chatId]?.fullName &&
		!!state[chatId]?.city &&
		!state[chatId]?.mail
	) {
		state[chatId].mail = msg.text

		await bot.sendMessage(
			chatId,
			`Ви успішно замовили: ${state[chatId]?.productName}!`
		)

		if (
			state[chatId]?.productName === 'Тактичні штани 5.45style піксель жіночі'
		) {
			const category = '/futbolky/'

			const clothe = clothes[category].find(
				clothe => clothe.name === 'Тактичний лонгслів жіночий 5.45style піксель'
			)

			await bot.sendMessage(
				chatId,
				`Разом з товаром, що ви замовили також замовляють: ${clothe.name}!`
			)

			await sendItemDescription(
				chatId,
				clothe.name,
				clothe.price,
				clothe.imageSrcs,
				clothe.id,
				category
			)
		}

		if (
			state[chatId]?.productName ===
			'Тактичний лонгслів жіночий 5.45style піксель'
		) {
			const category = '/shtany/'

			const clothe = clothes[category].find(
				clothe => clothe.name === 'Тактичні штани 5.45style піксель жіночі'
			)

			await bot.sendMessage(
				chatId,
				`Разом з товаром, що ви замовили також замовляють: ${clothe.name}!`
			)

			await sendItemDescription(
				chatId,
				clothe.name,
				clothe.price,
				clothe.imageSrcs,
				clothe.id,
				category
			)
		}
		if (
			state[chatId]?.productName ===
			'Тактичний лонгслів 5.45style жіночий black'
		) {
			const category = '/futbolky/'

			const clothe = clothes[category].find(
				clothe => clothe.name === 'Штани Soft Shell на флісі чорні'
			)

			await bot.sendMessage(
				chatId,
				`Разом з товаром, що ви замовили також замовляють: ${clothe.name}!`
			)

			await sendItemDescription(
				chatId,
				clothe.name,
				clothe.price,
				clothe.imageSrcs,
				clothe.id,
				category
			)
		} else if (
			state[chatId]?.productName === 'Штани Soft Shell на флісі чорні'
		) {
			const category = '/futbolky/'
			console.log(clothes[category])

			const clothe = clothes[category].find(
				clothe => clothe.name === 'Тактичний лонгслів 5.45style жіночий black'
			)

			console.log(clothe)

			await bot.sendMessage(
				chatId,
				`Разом з товаром, що ви замовили також замовляють: ${clothe.name}!`
			)

			await sendItemDescription(
				chatId,
				clothe.name,
				clothe.price,
				clothe.imageSrcs,
				clothe.id,
				category
			)
		} else {
			const category = '/holovni-ubory/'

			const categoryClothesLength = clothes[category].length
			const idOfRandomClothe = getRandomInt(0, categoryClothesLength - 1)
			const randomClothe = clothes[category].find(
				clothe => Number(clothe.id) === Number(idOfRandomClothe)
			)

			await bot.sendMessage(
				chatId,
				`Разом з товаром, що ви замовили також замовляють: ${randomClothe.name}!`
			)

			await sendItemDescription(
				chatId,
				randomClothe.name,
				randomClothe.price,
				randomClothe.imageSrcs,
				randomClothe.id,
				category
			)
		}

		await bot.sendMessage(
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

		state[chatId] = {}
		return
	}
})
