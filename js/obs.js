/*
 * Observabilidade do Elementar, no modelo do OpenTelemetry:
 *   Obs.span(nome, atributos) → { fim(atributos), falhou(erro) }   (traces)
 *   Obs.evento(nome, atributos)                                    (logs)
 *   Obs.metrica(nome, valor, unidade, atributos)                   (métricas)
 *   Obs.erro(erro, atributos)                                      (erros)
 *
 * Coleta automática: erros e promessas rejeitadas, Web Vitals (LCP, CLS, INP,
 * FCP, TTFB) e tarefas longas. Os módulos chamam Obs.* para carregamentos,
 * navegação, exercícios e simulados (sem nenhum dado pessoal).
 *
 * Exportadores (só os configurados em js/config.js são ligados):
 *   - OTLP/HTTP JSON → qualquer coletor OpenTelemetry (e, por ele, Grafana, Honeycomb, Datadog...);
 *   - Sentry (erros), carregando o SDK sob demanda.
 * Sem configuração, nada sai do navegador. Com ?obs=debug na URL, tudo aparece no console.
 */
(function (raiz) {
	"use strict";

	const CFG = raiz.ELEMENTAR_CONFIG || {};
	const agoraNs = () => String(Math.round((performance.timeOrigin + performance.now()) * 1e6));
	const hex = (n) => Array.from(crypto.getRandomValues(new Uint8Array(n)), (b) => b.toString(16).padStart(2, "0")).join("");
	const sessao = (() => {
		try {
			const k = "elementar.obs.sessao";
			let s = sessionStorage.getItem(k);
			if (!s) sessionStorage.setItem(k, (s = hex(8)));
			return s;
		} catch {
			return hex(8);
		}
	})();
	const debug = /[?&]obs=debug\b/.test(location.search);
	const privacidade = CFG.respeitarPrivacidade !== false && (navigator.doNotTrack === "1" || navigator.globalPrivacyControl === true);
	// amostragem estável por sessão
	const amostrada = parseInt(sessao.slice(0, 8), 16) / 0xffffffff < (CFG.amostragem ?? 1);
	const ativo = !privacidade && amostrada;
	const traceDaPagina = hex(16);

	const RECURSO = {
		"service.name": CFG.servico || "elementar",
		"service.version": CFG.versao || "0",
		"deployment.environment": CFG.ambiente || "producao",
		"session.id": sessao,
		"browser.language": navigator.language,
		"device.tipo": matchMedia("(pointer: coarse)").matches ? "toque" : "mouse",
	};

	// ---------- exportadores ----------
	const exportadores = [];
	const registrar = (e) => exportadores.push(e);
	const repassar = (tipo, dado) => {
		if (debug) console.info(`[obs] ${tipo}`, dado);
		if (!ativo) return;
		for (const e of exportadores) {
			try {
				e[tipo] && e[tipo](dado);
			} catch {
				/* um exportador com problema nunca derruba o app */
			}
		}
	};

	function carregarScript(src, aoCarregar) {
		const s = document.createElement("script");
		s.src = src;
		s.async = true;
		s.crossOrigin = "anonymous";
		s.onload = aoCarregar;
		s.onerror = () => debug && console.warn("[obs] não carregou", src);
		document.head.appendChild(s);
	}

	// OTLP/HTTP (JSON): lotes enviados a cada 5 s e ao sair da página
	if (CFG.otlp && CFG.otlp.endpoint) {
		const base = CFG.otlp.endpoint.replace(/\/$/, "");
		const fila = { traces: [], logs: [], metrics: [] };
		const attrs = (o) =>
			Object.entries(o || {})
				.filter(([, v]) => v !== undefined && v !== null)
				.map(([key, v]) => ({ key, value: typeof v === "number" ? (Number.isInteger(v) ? { intValue: v } : { doubleValue: v }) : typeof v === "boolean" ? { boolValue: v } : { stringValue: String(v) } }));
		const recurso = { attributes: attrs(RECURSO) };
		const escopo = { name: "elementar.obs", version: "1" };
		const corpo = {
			traces: (itens) => ({ resourceSpans: [{ resource: recurso, scopeSpans: [{ scope: escopo, spans: itens }] }] }),
			logs: (itens) => ({ resourceLogs: [{ resource: recurso, scopeLogs: [{ scope: escopo, logRecords: itens }] }] }),
			metrics: (itens) => ({ resourceMetrics: [{ resource: recurso, scopeMetrics: [{ scope: escopo, metrics: itens }] }] }),
		};
		const enviar = (saindo) => {
			for (const tipo of Object.keys(fila)) {
				if (!fila[tipo].length) continue;
				const dados = JSON.stringify(corpo[tipo](fila[tipo].splice(0)));
				const url = `${base}/v1/${tipo}`;
				const cab = CFG.otlp.cabecalhos || {};
				if (saindo && navigator.sendBeacon && !Object.keys(cab).length) navigator.sendBeacon(url, new Blob([dados], { type: "application/json" }));
				else fetch(url, { method: "POST", body: dados, keepalive: true, headers: { "Content-Type": "application/json", ...cab } }).catch(() => {});
			}
		};
		setInterval(() => enviar(false), 5000);
		addEventListener("visibilitychange", () => document.visibilityState === "hidden" && enviar(true));
		addEventListener("pagehide", () => enviar(true));
		registrar({
			span: (s) => fila.traces.push({ traceId: s.traceId, spanId: s.spanId, parentSpanId: s.pai || undefined, name: s.nome, kind: 1, startTimeUnixNano: s.inicio, endTimeUnixNano: s.fim, attributes: attrs(s.atributos), status: { code: s.erro ? 2 : 1, message: s.erro || undefined } }),
			evento: (e) => fila.logs.push({ timeUnixNano: e.tempo, severityNumber: 9, severityText: "INFO", body: { stringValue: e.nome }, attributes: attrs(e.atributos), traceId: traceDaPagina }),
			erro: (e) => fila.logs.push({ timeUnixNano: e.tempo, severityNumber: 17, severityText: "ERROR", body: { stringValue: e.mensagem }, attributes: attrs({ ...e.atributos, "exception.type": e.tipo, "exception.message": e.mensagem, "exception.stacktrace": e.pilha }), traceId: traceDaPagina }),
			metrica: (m) => fila.metrics.push({ name: m.nome, unit: m.unidade, gauge: { dataPoints: [{ asDouble: m.valor, timeUnixNano: m.tempo, attributes: attrs(m.atributos) }] } }),
		});
	}

	// Sentry (SDK do navegador sob demanda)
	if (ativo && CFG.sentry && CFG.sentry.dsn) {
		const pendentes = [];
		let S = null;
		carregarScript(CFG.sentry.sdk || "https://browser.sentry-cdn.com/11.7.0/bundle.tracing.min.js", () => {
			S = raiz.Sentry;
			if (!S) return;
			S.init({ dsn: CFG.sentry.dsn, environment: RECURSO["deployment.environment"], release: `${RECURSO["service.name"]}@${RECURSO["service.version"]}`, tracesSampleRate: CFG.sentry.amostragemTraces ?? 0.2, sendDefaultPii: false });
			S.setTag("sessao", sessao);
			pendentes.splice(0).forEach((f) => f());
		});
		const comS = (f) => (S ? f() : pendentes.push(f));
		registrar({
			erro: (e) => comS(() => S.captureException(e.original || new Error(e.mensagem), { extra: e.atributos })),
			evento: (e) => comS(() => S.addBreadcrumb({ category: "app", message: e.nome, data: e.atributos })),
			span: (s) => comS(() => S.addBreadcrumb({ category: "span", message: `${s.nome} (${s.duracaoMs} ms)`, data: s.atributos, level: s.erro ? "error" : "info" })),
		});
	}

	// ---------- API ----------
	function span(nome, atributos = {}, pai = null) {
		const s = { traceId: traceDaPagina, spanId: hex(8), pai, nome, atributos: { ...atributos }, inicio: agoraNs(), t0: performance.now() };
		let fechado = false;
		const fechar = (extra, erro) => {
			if (fechado) return;
			fechado = true;
			Object.assign(s.atributos, extra || {});
			s.fim = agoraNs();
			s.duracaoMs = Math.round(performance.now() - s.t0);
			if (erro) s.erro = String((erro && erro.message) || erro);
			repassar("span", s);
		};
		return { id: s.spanId, fim: (extra) => fechar(extra), falhou: (erro, extra) => fechar(extra, erro || "erro") };
	}
	const evento = (nome, atributos = {}) => repassar("evento", { nome, atributos, tempo: agoraNs() });
	const metrica = (nome, valor, unidade = "", atributos = {}) => Number.isFinite(valor) && repassar("metrica", { nome, valor, unidade, atributos, tempo: agoraNs() });
	function erro(e, atributos = {}) {
		const original = e instanceof Error ? e : null;
		repassar("erro", { original, tipo: (original && original.name) || "Error", mensagem: String((original && original.message) || e), pilha: (original && original.stack) || "", atributos: { ...atributos, url: location.pathname + location.hash }, tempo: agoraNs() });
	}

	// ---------- coleta automática ----------
	addEventListener("error", (ev) => {
		// erro de carregamento de recurso (script/css) chega sem ev.error
		if (ev.error || ev.message) erro(ev.error || ev.message, { origem: "window.onerror", arquivo: ev.filename, linha: ev.lineno });
		else if (ev.target && ev.target.src) evento("recurso.falhou", { url: ev.target.src });
	}, true);
	addEventListener("unhandledrejection", (ev) => erro(ev.reason instanceof Error ? ev.reason : String(ev.reason), { origem: "promessa" }));

	// Web Vitals (reportados uma vez, quando a página fica oculta)
	const vitais = { LCP: 0, CLS: 0, INP: 0, FCP: 0, TTFB: 0 };
	const observar = (tipo, fn, extra = {}) => {
		try {
			new PerformanceObserver((l) => l.getEntries().forEach(fn)).observe({ type: tipo, buffered: true, ...extra });
		} catch {
			/* navegador sem esse tipo de entrada */
		}
	};
	observar("largest-contentful-paint", (e) => (vitais.LCP = e.startTime));
	observar("paint", (e) => e.name === "first-contentful-paint" && (vitais.FCP = e.startTime));
	observar("layout-shift", (e) => !e.hadRecentInput && (vitais.CLS += e.value));
	observar("event", (e) => e.interactionId && (vitais.INP = Math.max(vitais.INP, e.duration)), { durationThreshold: 40 });
	observar("longtask", (e) => metrica("tarefa_longa", e.duration, "ms"));
	try {
		const nav = performance.getEntriesByType("navigation")[0];
		if (nav) vitais.TTFB = nav.responseStart;
	} catch {
		/* sem Navigation Timing */
	}
	let vitaisEnviados = false;
	const enviarVitais = () => {
		if (vitaisEnviados) return;
		vitaisEnviados = true;
		for (const [k, v] of Object.entries(vitais)) if (v) metrica(`web_vitals.${k.toLowerCase()}`, Math.round(k === "CLS" ? v * 1000 : v) / (k === "CLS" ? 1000 : 1), k === "CLS" ? "1" : "ms");
	};
	addEventListener("visibilitychange", () => document.visibilityState === "hidden" && enviarVitais());
	addEventListener("pagehide", enviarVitais);

	raiz.Obs = { span, evento, metrica, erro, ativo, sessao, _vitais: vitais, _enviarVitais: enviarVitais };
	evento("pagina.carregada", { caminho: location.pathname, hash: location.hash.split("/")[0] || "" });
})(typeof window !== "undefined" ? window : globalThis);
