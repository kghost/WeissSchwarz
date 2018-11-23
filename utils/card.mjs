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
		const sides = (url) => {
			if (url.endsWith("w.gif")) return "W";
			if (url.endsWith("b.gif")) return "B";
			throw "Unknown side";
		}
		const colors = (url) => {
			if (url.endsWith("green.gif")) return "GREEN";
			if (url.endsWith("red.gif")) return "RED";
			if (url.endsWith("yellow.gif")) return "YELLOW";
			if (url.endsWith("blue.gif")) return "BLUE";
			throw "Unknown color";
		}
		const triggers = (url) => {
			if (url.endsWith("soul.gif")) return "Soul";
			if (url.endsWith("stock.gif")) return "Pool";
			if (url.endsWith("salvage.gif")) return "ComeBack";
			if (url.endsWith("bounce.gif")) return "Return";
			if (url.endsWith("draw.gif")) return "Draw";
			if (url.endsWith("treasure.gif")) return "Treasure";
			if (url.endsWith("shot.gif")) return "Shot";
			if (url.endsWith("gate.gif")) return "Gate";
			throw "Unknown trigger";
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
			side: sides($("#cardDetail > table > tbody > tr > th").filter(":contains('Side'),:contains('サイド')")
				.next().find("img").attr("src")),
			type: $("#cardDetail > table > tbody > tr > th").filter(":contains('Card Type'),:contains('種類')")
				.next().text(),
			color: colors($("#cardDetail > table > tbody > tr > th").filter(":contains('Color'),:contains('色')")
				.next().find("img").attr("src")),
			level: parseInt($("#cardDetail > table > tbody > tr > th").filter(":contains('Level'),:contains('レベル')")
				.next().text()),
			cost: parseInt($("#cardDetail > table > tbody > tr > th").filter(":contains('Cost'),:contains('コスト')")
				.next().text()),
			power: parseInt($("#cardDetail > table > tbody > tr > th").filter(":contains('Power'),:contains('パワー')")
				.next().text()),
			soul: $("#cardDetail > table > tbody > tr > th").filter(":contains('Soul'),:contains('ソウル')")
				.next().find("img").length,
			trigger: $("#cardDetail > table > tbody > tr > th").filter(":contains('Trigger'),:contains('トリガー')")
				.next().find("img").toArray().map(x => triggers(x.getAttribute("src"))),
			text: $("#cardDetail > table > tbody > tr > th").filter(":contains('Text'),:contains('テキスト')")
				.next().text(),
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
		const res = await request({
			uri: `http://localhost:9222/json/version`,
			json: true,
			resolveWithFullResponse: true
		})
		const browser = await puppeteer.connect({browserWSEndpoint: res.body.webSocketDebuggerUrl});

		const cards = require('./cardlist.json')
		const root = 'data'

		async function fetch(i) {
			if (i >= cards.length) return
			const cardno = cards[i]
			const [title, code] = cardno.split('/')
			const [pack, number] = code.split('-')
			getCard(browser, cardno)
				.then(card => merge(`${root}/${title}/${pack}/${number}.json`, card))
				.then(x => fetch(i+1))
		}
		await fetch(0)
	})()
}

module.exports = {
	getCard
}
