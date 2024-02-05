// const jsdom = require('jsdom')
// const { JSDOM } = jsdom

// // Создаем запрос с использованием Fetch API
// fetch('https://545style.com/termo-bilyzna-olyva/')
// 	.then(response => {
// 		// Проверяем, успешен ли запрос (код ответа 200-299)
// 		if (!response.ok) {
// 			throw new Error('Network response was not ok')
// 		}
// 		// Возвращаем текст HTML в виде Promise
// 		return response.text()
// 	})
// 	.then(htmlString => {
// 		// Используем jsdom для создания виртуального DOM
// 		const dom = new JSDOM(htmlString)
// 		const document = dom.window.document

// 		// Находим все элементы img с классом "gallery__photo-img"
// 		const images = document.querySelectorAll('a.products-menu__title-link')

// 		// Выводим найденные изображения в консоль
// 		images.forEach(image => {
// 			console.log(
// 				'Найдено изображение с классом gallery__photo-img:',
// 				image.outerHTML
// 			)
// 		})
// 	})
// 	.catch(error => {
// 		// Обрабатываем ошибки
// 		console.error('There was a problem with the fetch operation:', error)
// 	})

function getRandomInt(min, max) {
	min = Math.ceil(min)
	max = Math.floor(max)
	return Math.floor(Math.random() * (max - min + 1)) + min
}

const jsdom = require('jsdom')
const { JSDOM } = jsdom
const fs = require('fs')

const getObjectKeys = object => {
	const allKeys = object.reduce((keys, obj) => {
		// Используем Object.keys для получения ключей текущего объекта
		const objKeys = Object.keys(obj)

		// Добавляем ключи текущего объекта к общему списку ключей
		return [...keys, ...objKeys]
	}, [])

	// Теперь переменная allKeys содержит все ключи из массива объектов
	return allKeys
}

const findElementsByClass = (htmlString, className) => {
	const dom = new JSDOM(htmlString)
	const document = dom.window.document

	// Находим все элементы с указанным классом
	const elementsNodeList = document.querySelectorAll(`.${className}`)
	const elements = []

	// Получаем значения атрибута href для каждого элемента
	elementsNodeList.forEach(element => {
		elements.push(element.outerHTML)
	})

	return elements
}
const findElementByItemProp = (htmlString, itemProp) => {
	const dom = new JSDOM(htmlString)
	const document = dom.window.document

	// Находим все элементы с указанным классом
	const element = document.querySelector(`[itemprop="${itemProp}"]`)
	return element.outerHTML
}
const findElementByClassName = (htmlString, className) => {
	const dom = new JSDOM(htmlString)
	const document = dom.window.document

	// Находим все элементы с указанным классом
	const element = document.querySelector(`.${className}`)
	return element.outerHTML
}

const getNavigationItemsHrefs = async () => {
	const pageResponse = await fetch('https://545style.com/')
	const pageText = await pageResponse.text()

	const navigationItems = findElementsByClass(
		pageText,
		'products-menu__title-link'
	)

	// Создаем новый массив, содержащий только значения href
	const navigationItemsHrefs = navigationItems.map(item => {
		// Используем регулярное выражение для извлечения значения href
		const matchHref = item.match(/href="([^"]+)"/)

		if (matchHref) {
			// Если matchHref успешен, используем результат для дальнейших операций
			const match = matchHref[1].match(/(\/[^\/]+\/)$/)
			return match ? match[1] : null
		} else {
			// Если matchHref равен null, возвращаем null
			return null
		}
	})

	return navigationItemsHrefs
}

const getClothesHrefs = async navigationItems => {
	const clothesHrefs = []

	for (const navigationItem of navigationItems) {
		console.log(navigationItem)

		const pageResponse = await fetch(`https://545style.com${navigationItem}`)
		const pageText = await pageResponse.text()

		const clothesOnPage = findElementsByClass(pageText, 'catalogCard-image')

		// Создаем новый массив, содержащий только значения href
		const clothesOnPageHrefs = clothesOnPage.map(clotheOnPage => {
			// Используем регулярное выражение для извлечения значения href
			const match = clotheOnPage.match(/href="([^"]+)"/)
			return match ? match[1] : null
		})

		clothesHrefs.push({
			[navigationItem]: clothesOnPageHrefs,
		})
	}

	return clothesHrefs
}

const getClothes = async (clothesHrefs, clothesKeys) => {
	const clothes = {}
	let i = 0
	let id = 0

	clothesKeys.forEach(clothesKey => {
		clothes[clothesKey] = []
	})

	for (const clothesHref of clothesHrefs) {
		const hrefsByCategory = clothesHref[clothesKeys[i]]

		for (const href of hrefsByCategory) {
			const pageResponse = await fetch(`https://545style.com${href}`)
			const pageText = await pageResponse.text()

			const clotheImages = findElementsByClass(pageText, 'gallery__photo-img')

			// Создаем новый массив, содержащий только значения src
			const clotheImagesHrefs = clotheImages.map(item => {
				// Используем регулярное выражение для извлечения значения href
				const match = item.match(/src="([^"]+)"/)
				return match ? match[1] : null
			})

			const clothePrice = findElementByItemProp(pageText, 'price')
			const clothePriceMatch = clothePrice.match(/content="([^"]+)"/)
				? clothePrice.match(/content="([^"]+)"/)
				: null

			const clotheName = findElementByClassName(pageText, 'product-title')
			const clotheNameMatch = clotheName.match(/<h1[^>]*>(.*?)<\/h1>/)

			clothes[clothesKeys[i]].push({
				id,
				imageSrcs: clotheImagesHrefs,
				price: Number(clothePriceMatch[1]),
				name: clotheNameMatch[1],
				isWarm: getRandomInt(0, 1) === 0 ? false : true,
			})
			id += 1
		}
		id = 0
		i += 1
	}

	return clothes
}

const initial = async () => {
	const navigationItems = await getNavigationItemsHrefs()
	const clothesHrefs = await getClothesHrefs(navigationItems)
	const clothesHrefsKeys = getObjectKeys(clothesHrefs)
	const clothes = await getClothes(clothesHrefs, clothesHrefsKeys)

	return clothes
}

initial().then(data => {
	fs.writeFileSync('clothes.json', JSON.stringify(data))
	console.log(data)
})
