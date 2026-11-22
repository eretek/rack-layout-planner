/*! Eretek Online Araçlar #81 — Rack U ve Kabin Yerleşimi */
ERT.def('81', {
	run: function (v, c) {
		var r = c.csv(v.csv, 'csv', 200), H = r.head, col = function (n) { return ERT.csv.col(H, n); };
		var iN = col(['name', 'device', 'cihaz', 'gerat']), iU = col(['u', 'height_u', 'rack_u', 'he']), iQ = col(['qty', 'adet', 'anzahl']), iP = col(['pos', 'position', 'start_u']), iK = col(['kg', 'weight', 'agirlik', 'gewicht']), iW = col(['w', 'watt', 'power_w', 'leistung']);
		if (iN < 0 || iU < 0) { throw c.fe('csv', 'col', { c: 'name, u' }); }
		var H2 = v.height, slots = new Array(H2 + 1), items = [], kg = 0, w = 0, msgs = [];
		r.rows.forEach(function (x, i) {
			var n = function (k, d) { return k >= 0 && x[k] !== '' ? ERT.parseNum(x[k], 'en') : d; }, u = n(iU), q = n(iQ, 1), p = n(iP, null);
			if (!(u >= 1) || Math.floor(u) !== u || !(q >= 1) || Math.floor(q) !== q || (p !== null && (!(p >= 1) || Math.floor(p) !== p))) { throw c.fe('csv', 'rowNum', { r: i + 2 }); }
			for (var k = 0; k < q; k++) { items.push({ name: x[iN] + (q > 1 ? ' #' + (k + 1) : ''), u: u, pos: k === 0 ? p : null, kg: n(iK, 0), w: n(iW, 0), row: i + 2 }); }
		});
		var place = function (it, from) { for (var s = from; s + it.u - 1 <= H2; s++) { var free = true; for (var j = s; j < s + it.u; j++) { if (slots[j]) { free = false; break; } } if (free) { return s; } } return null; };
		items.filter(function (it) { return it.pos !== null; }).forEach(function (it) {
			if (it.pos + it.u - 1 > H2) { throw c.fe('csv', 'outside', { n: it.name }); }
			for (var j = it.pos; j < it.pos + it.u; j++) { if (slots[j]) { throw c.fe('csv', 'overlap', { a: it.name, b: slots[j].name, u: j }); } }
			for (j = it.pos; j < it.pos + it.u; j++) { slots[j] = it; } it.at = it.pos;
		});
		var auto = items.filter(function (it) { return it.pos === null; });
		if (v.heavy) { auto.sort(function (a, b) { return b.kg - a.kg; }); }
		var unplaced = [];
		auto.forEach(function (it) { var s = place(it, 1); if (s === null) { unplaced.push(it.name); return; } for (var j = s; j < s + it.u; j++) { slots[j] = it; } it.at = s; });
		items.forEach(function (it) { if (it.at) { kg += it.kg; w += it.w; } });
		var used = 0; for (var j = 1; j <= H2; j++) { if (slots[j]) { used++; } }
		var rows = [];
		for (var u = H2; u >= 1; u--) { var it = slots[u]; if (it && it.at + it.u - 1 !== u) { continue; } rows.push(it ? [it.u > 1 ? (it.at + it.u - 1) + '–' + it.at : u, it.name, it.u, it.kg ? c.n(it.kg, 1) : '–', it.w ? c.n(it.w, 0) : '–'] : [u, c.t('empty'), 1, '', '']); }
		if (unplaced.length) { msgs.push(['err', c.t('noRoom', { l: unplaced.join(', ') })]); }
		if (v.maxkg && kg > v.maxkg) { msgs.push(['err', c.t('heavy', { k: c.n(kg, 0), m: c.n(v.maxkg, 0) })]); }
		var heavyTop = items.filter(function (it) { return it.at && it.kg >= 25 && it.at > H2 / 2; });
		if (heavyTop.length) { msgs.push(['warn', c.t('top', { l: heavyTop.map(function (x) { return x.name; }).join(', ') })]); }
		if (!unplaced.length) { msgs.push(['ok', c.t('fit', { f: H2 - used })]); }
		msgs.push(['info', c.t('bottom')]);
		var cols = ['U', c.t('c_n'), c.t('c_u'), 'kg', 'W'];
		return { big: c.t('big', { u: used, h: H2, f: H2 - used }), kv: [[c.t('used'), used + ' U'], [c.t('free'), (H2 - used) + ' U'], [c.t('kg'), c.n(kg, 1) + ' kg'], [c.t('w'), c.n(w, 0) + ' W']], msgs: msgs, tables: [{ cols: cols, rows: rows }], x: { csv: { name: 'rack-layout', cols: cols, rows: rows } }, v: { used: used, free: H2 - used, unplaced: unplaced, kg: kg, pos: items.reduce(function (o, it) { o[it.name] = it.at || null; return o; }, {}) } };
	}
});
