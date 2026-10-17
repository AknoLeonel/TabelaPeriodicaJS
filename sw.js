/*
 * Service worker do Elementar: faz o site abrir sem internet.
 *
 * Estratégia: rede primeiro, cache como reserva. Com internet, o estudante sempre
 * recebe a versão mais nova (não existe "versão velha presa"); sem internet, recebe
 * a última versão que abriu. O núcleo é guardado na instalação; cada matéria ou
 * simulação entra no cache na primeira vez que é aberta. As fontes do Google ficam
 * no cache depois do primeiro uso. Nada de telemetria é guardado.
 *
 * Mudou a lista do núcleo ou a estratégia? Aumente VERSAO para limpar o cache antigo.
 */
const VERSAO = "v1";
const CACHE = `elementar-${VERSAO}`;
const NUCLEO = [
	"./",
	"./index.html",
	"./style.css",
	"./manifest.webmanifest",
	"./icons/icone-192.png",
	"./js/config.js",
	"./js/obs.js",
	"./js/dados.js",
	"./js/descricoes.js",
	"./js/movimento.js",
	"./js/app.js",
	"./js/lab/fisica.js",
	"./js/lab/base.js",
	"./js/lab/lab.js",
	"./css/lab.css",
	"./verificacao.html",
];
const FONTES = /^https:\/\/fonts\.(googleapis|gstatic)\.com\//;

self.addEventListener("install", (ev) => {
	ev.waitUntil(
		caches
			.open(CACHE)
			.then((c) => c.addAll(NUCLEO))
			.then(() => self.skipWaiting()),
	);
});

self.addEventListener("activate", (ev) => {
	ev.waitUntil(
		caches
			.keys()
			.then((ks) => Promise.all(ks.filter((k) => k.startsWith("elementar-") && k !== CACHE).map((k) => caches.delete(k))))
			.then(() => self.clients.claim()),
	);
});

async function redePrimeiro(req) {
	const cache = await caches.open(CACHE);
	try {
		const r = await fetch(req);
		if (r.ok) cache.put(req, r.clone());
		return r;
	} catch (e) {
		const guardado = (await cache.match(req, { ignoreSearch: req.mode === "navigate" })) || (req.mode === "navigate" && (await cache.match("./index.html")));
		if (guardado) return guardado;
		throw e;
	}
}

async function cachePrimeiro(req) {
	const cache = await caches.open(CACHE);
	const guardado = await cache.match(req);
	if (guardado) return guardado;
	const r = await fetch(req);
	if (r.ok || r.type === "opaque") cache.put(req, r.clone());
	return r;
}

self.addEventListener("fetch", (ev) => {
	const req = ev.request;
	if (req.method !== "GET") return;
	const url = new URL(req.url);
	if (url.origin === self.location.origin) ev.respondWith(redePrimeiro(req));
	else if (FONTES.test(req.url)) ev.respondWith(cachePrimeiro(req));
});
