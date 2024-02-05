const TelegramBot = require('node-telegram-bot-api')

// const token = '6965202334:AAEcJYVXE_NehXzEZ2NtjjdIHUT3PEvZGwQ'
const token = '6085919277:AAGvJfRHmmSVj9FZJFOnhKWaJgJRrc1UwkI'
const bot = new TelegramBot(token, { polling: true })
const chatForOrdersId = '-1002109190302'
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
				],
			],
		},
	}

	try {
		// Відправляємо групу фото
		await bot.sendMediaGroup(chatId, media)

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

	if (msg.text === 'Футболки,Лонгсліви та Поло') {
		state[chatId] = {}
		// Отправляем inline-клавиатуру для выбора "утепленных" и "неутепленных" кофт
		await bot.sendMessage(chatId, 'Виберіть тип кофт:', {
			reply_markup: {
				inline_keyboard: [
					[
						{ text: 'Утеплені', callback_data: 'tshirts_warm' },
						{ text: 'Неутеплені', callback_data: 'tshirts_not_warm' },
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
	if (clothingType === 'tshirts_warm' || clothingType === 'tshirts_not_warm') {
		const category = '/futbolky/'
		const tshirts = clothes[category]

		if (clothingType === 'tshirts_warm') {
			for (const tshirt of tshirts) {
				if (tshirt.isWarm) {
					await sendItemDescription(
						chatId,
						tshirt.name,
						tshirt.price,
						tshirt.imageSrcs,
						tshirt.id,
						category
					)
				}
			}
		}

		if (clothingType === 'tshirts_not_warm') {
			for (const tshirt of tshirts) {
				if (!tshirt.isWarm) {
					await sendItemDescription(
						chatId,
						tshirt.name,
						tshirt.price,
						tshirt.imageSrcs,
						tshirt.id,
						category
					)
				}
			}
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
		const firstSpaceIndex = clothingType.indexOf(' ')
		const productCategory = clothingType.split(' ')[1]
		console.log(`productCategory: ${productCategory}`)

		const productId = clothingType.split(' ')[2]
		console.log(`productId: ${productId}`)

		const clothesByCategory = clothes[productCategory]
		console.log(`clothesByCategory: ${clothesByCategory}`)

		const orderedProduct = clothesByCategory.find(clothe => {
			return Number(clothe.id) === Number(productId)
		})
		console.log(`productName: ${JSON.stringify(orderedProduct.name)}`)

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
			const category = '/shtany/'

			const clothe = clothes[category].find(
				clothe => clothe.name === 'Тактичний лонгслів 5.45style жіночий black'
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

		// await bot.sendMessage(
		// 	chatForOrdersId,
		// 	`
		// 	\n Ім'я: ${state[chatId]?.fullName}
		// 	\nНомер телефону: ${state[chatId]?.phoneNumber}
		// 	\nМісто: ${state[chatId]?.city}
		// 	\nВідділення пошти: ${state[chatId]?.mail}
		// 	\nТовар: ${state[chatId]?.productName}
		// 	\nТип оплати: ${state[chatId]?.paymentType === 'imposed' ? 'наложка' : 'онлайн'}
		// 	\nUPD: товар замовили за допомогою бота
		// `
		// )
		return
	}
})
