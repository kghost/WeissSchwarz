const fs = require('fs')

const { merge } = require('./mergeJson.mjs')
const cards = require('./cardlist.json')

async function createSkeleton(root) {
	var db = {}
	await Promise.all(cards.map(async (s) => {
		const [title, code] = s.split('/')
		const [pack, number] = code.split('-')

		if (!(db.hasOwnProperty(title))) db[title] = {}
		if (!(db[title].hasOwnProperty(pack))) db[title][pack] = []
		db[title][pack].push(number)
		const err = (e) => { if (e && e.code != 'EEXIST') console.log(e) }
		await fs.mkdir(`${root}/${title}`, err)
		await fs.mkdir(`${root}/${title}/${pack}`, err)
		await fs.mkdir(`${root}/${title}/${pack}/${number}`, err)
	}))

	const err = (e) => { if (e) console.log(e) }
	const titles = await Promise.all(Object.entries(db).map(async ([title, e1]) => {
		const packs = await Promise.all(Object.entries(e1).map(async ([pack, cards]) => {
			await merge(`${root}/${title}/${pack}/pack.json`, { cards })
			return pack
		}))
		await merge(`${root}/${title}/title.json`, { packs })
		return title
	}))
	await merge(`${root}/titles.json`, { titles })
}

if (require.main === module) {
	createSkeleton('data')
}
