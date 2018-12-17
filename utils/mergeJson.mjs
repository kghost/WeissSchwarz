const fs = require('fs').promises

function mergeArray(orig, update) {
	const s = new Set(orig.map(JSON.stringify))
	update.forEach(v => { if (!s.has(JSON.stringify(v))) orig.push(v) })
	return orig;
}

function mergeObject(orig, update) {
	Object.entries(update).forEach(([k, v]) => {
		if (orig.hasOwnProperty(k)) {
			orig[k] = mergeAll(orig[k], v)
		} else
			orig[k] = v
	})

	return orig;
}

function mergeAll(orig, update) {
	if (typeof orig != typeof update) return update;
	if (typeof orig != 'object') return update;
	if (orig == null) return update;
	if (Array.isArray(orig) != Array.isArray(update)) return update;
	if (Array.isArray(orig)) return mergeArray(orig, update); else return mergeObject(orig, update);
}

async function merge(path, object) {
	const { changed, updated } = await fs.readFile(path, 'utf-8').then(json => {
		const orig = JSON.parse(json)
		const updated = JSON.stringify(mergeAll(orig, object), null, '\t')
		return {
			changed: json != updated,
			updated
		}
	}).catch(e => {
		if (e.code == 'ENOENT') return { changed: true, updated: JSON.stringify(object, null, '\t') }; else throw e
	});

	if (changed) {
		console.log(`updating ${path} ${updated}`)
		await fs.writeFile(path, updated, 'utf-8', (e) => {
			if(e) throw e;
		})
	}
}

module.exports = {
	merge
}
