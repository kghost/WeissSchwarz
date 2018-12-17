const { URL } = require('url');
const puppeteer = require('puppeteer')
const request = require('request-promise-native');

const { getCardType } = require('./constants.mjs')

async function getCard(browser, cardno) {
	const page = await browser.newPage()
	const url = `https://ws-tcg.com/cardlist/?cardno=${cardno}`

	console.log(`loading ${url}`)
	await page.goto(url)
	const card = await page.evaluate(() => {
		const img2Trigger = {
			SOUL: "Soul",
			STOCK: "Pool",
			SALVAGE: "ComeBack",
			BOUNCE: "Return",
			DRAW: "Draw",
			TREASURE: "Treasure",
			SHOT: "Shot",
			GATE: "Gate"
		}

		const imgName = (url) => {
			return url.split('/').pop().split('.')[0].toUpperCase()
		}

		const traits = (text) => { return text.split("・").filter(x => x != "-") }

		const textTrans = (node) => {
			node.find("img").each(function () {
				const name = imgName($(this).prop("src"))
				const trigger = img2Trigger[name]
				if (trigger != undefined)
					this.replaceWith(`[TRIGGER:${trigger}]`)
				else
					this.replaceWith(`[IMG:name]`)
			})
			return node.get(0).innerText
		}

		const colors = (node) => {
			const img = node.find("img");
			if (img.length > 0) return imgName(img.attr("src"))
			else {
				const v = ({
					"紫": "PURPLE"
				})[node.text()]
				if (typeof v != 'string') throw "Unknown color";
				return v
			}
		}

		const img = $("#cardDetail td.graphic img")
		const image = {
			uri: img.prop("src"),
			source: window.location.href,
			size: {
				width: img.get(0).naturalWidth,
				height: img.get(0).naturalHeight
			}
		}
		return {
			name: $("#cardDetail > table > tbody > tr > th").filter(":contains('Card Name'),:contains('カード名')")
				.next().contents().get(0).nodeValue,
			kana: $("#cardDetail > table > tbody > tr > th").filter(":contains('Card Name'),:contains('カード名')")
				.next().find("span").text(),
			rarity: $("#cardDetail > table > tbody > tr > th").filter(":contains('Rarity'),:contains('レアリティ')")
				.next().text(),
			side: imgName($("#cardDetail > table > tbody > tr > th").filter(":contains('Side'),:contains('サイド')")
				.next().find("img").attr("src")),
			type: $("#cardDetail > table > tbody > tr > th").filter(":contains('Card Type'),:contains('種類')")
				.next().text(),
			color: colors($("#cardDetail > table > tbody > tr > th").filter(":contains('Color'),:contains('色')")
				.next()),
			level: parseInt($("#cardDetail > table > tbody > tr > th").filter(":contains('Level'),:contains('レベル')")
				.next().text()),
			cost: parseInt($("#cardDetail > table > tbody > tr > th").filter(":contains('Cost'),:contains('コスト')")
				.next().text()),
			power: parseInt($("#cardDetail > table > tbody > tr > th").filter(":contains('Power'),:contains('パワー')")
				.next().text()),
			soul: $("#cardDetail > table > tbody > tr > th").filter(":contains('Soul'),:contains('ソウル')")
				.next().find("img").length,
			trigger: $("#cardDetail > table > tbody > tr > th").filter(":contains('Trigger'),:contains('トリガー')")
				.next().find("img").toArray().map(x => img2Trigger[imgName(x.getAttribute("src"))]),
			traits: traits($("#cardDetail > table > tbody > tr > th").filter(":contains('Special Attribute'),:contains('特徴')")
				.next().text()),
			text: textTrans($("#cardDetail > table > tbody > tr > th").filter(":contains('Text'),:contains('テキスト')")
				.next()),
			flavor: $("#cardDetail > table > tbody > tr > th").filter(":contains('Flavor Text'),:contains('フレーバー')")
				.next().text(),
			illustrator: $("#cardDetail > table > tbody > tr > th").filter(":contains('Illustrator')")
				.next().text(),
			images: [image]
		}
	})

	card.type = getCardType(card.type)
	console.log(`done ${url}`)
	await page.close()

	return card
}

if (require.main === module) {
	(async () => {
		const fs = require('fs')
		const { merge } = require('./mergeJson.mjs')
		const browser = await puppeteer.launch({slowMo: 500, args: ['--no-sandbox']})

		const cards = require('./cardlist.json')
		const root = 'data'

		async function fetch(i) {
			if (i >= cards.length) return
			const cardno = cards[i]
			const [title, code] = cardno.split('/')
			const [pack, number] = code.split('-')
			const card = await getCard(browser, cardno)
			await merge(`${root}/${title}/${pack}/${number}.json`, card)
			await fetch(i+1)
		}
		await fetch(20617)
	})()
}

module.exports = {
	getCard
}
