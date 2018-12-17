const { URL } = require('url');
const puppeteer = require('puppeteer')

async function getCardList() {
	const browser = await puppeteer.launch({headless: false, slowMo: 500, args: ['--no-sandbox']})
	const page = await browser.newPage()

	const fetch = async (url) => {
		console.log(`loading ${url}`)
		await page.goto(url)
		var r = await page.evaluate(() => {
			var e = document.querySelector("#searchResults > p.pager > span.next > a")
			var nextPage = (e == null ? null : e.href)
			var cards = Array.from(document.querySelectorAll("#searchResults > div > table > tbody > tr > td > h4 > a")).map(e => e.href)
			console.log(`page(${window.location}): next(${nextPage}) ${cards}`)
			return {
				nextPage,
				cards
			}
		})
		const cards = r.cards.map(u => new URL(u).searchParams.get('cardno'))
		console.log(`done ${url}`)
		if (r.nextPage != null) {
			return cards.concat(await fetch(r.nextPage + '&show_page_count=100'))
		} else {
			return cards
		}
	}
	const cards = await fetch('https://ws-tcg.com/cardlist/search?show_page_count=100')
	await browser.close()
	return cards
}

if (require.main === module) {
	getCardList().then(cards => require('fs').writeFileSync('utils/cardlist.json', JSON.stringify(cards), 'utf-8'))
}

module.exports = {
	getCardList
}
