const CardType = {
	Character: {
		alias: new Set(["キャラ"]),
	},
	Event: {
		alias: new Set(["イベント"])
	},
	Climax: {
		alias: new Set(["クライマックス"])
	}
}
Object.freeze(CardType)

function getCardType(alias) {
	return Object.entries(CardType).find(([k, v]) => v.alias.has(alias))[0]
}

module.exports = {
	CardType,
	getCardType
}
