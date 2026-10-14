/*
 * Movimento: utilitários de animação do app inteiro (tabela, laboratório e estudo).
 *
 * Segue a skill design-motion-principles (Emil Kowalski, Jakub Krehel, Jhey Tompkins),
 * com o peso de um app educacional: Jakub (polimento sutil) como principal, Jhey
 * (momentos de descoberta, raros) como secundário e Emil (restrição e velocidade)
 * nas interações frequentes. Regras usadas aqui:
 *   - entrar com ease-out, sair com ease-in, trocar com ease-in-out, progresso linear;
 *   - a saída é mais curta e mais sutil que a entrada; nada começa de scale(0);
 *   - elementos menores animam mais rápido;
 *   - animar só transform e opacity (nada de width/height/top);
 *   - prefers-reduced-motion é obrigatório: com ele, nada se move, mas os estados
 *     finais continuam (quem usa leitor de tela ou tem enjoo não perde informação).
 *
 * Os mesmos tokens existem em CSS (style.css, :root → --dur-*, --ease-*).
 */
(function (raiz) {
	"use strict";

	const DUR = { micro: 120, curta: 180, media: 260, longa: 420 };
	const EASE = {
		entra: "cubic-bezier(0.16, 1, 0.3, 1)",
		sai: "cubic-bezier(0.55, 0, 1, 0.45)",
		troca: "cubic-bezier(0.65, 0, 0.35, 1)",
	};
	const consulta = raiz.matchMedia ? raiz.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
	const reduz = () => consulta.matches;
	const pronto = Promise.resolve();

	/** Entrada: aparece subindo alguns pixels (sem blur, sem escala a partir de zero). */
	function entrar(el, { y = 6, x = 0, dur = DUR.media, atraso = 0 } = {}) {
		if (!el || !el.animate || reduz()) return pronto;
		return el.animate(
			[
				{ opacity: 0, transform: `translate(${x}px, ${y}px)` },
				{ opacity: 1, transform: "none" },
			],
			{ duration: dur, delay: atraso, easing: EASE.entra, fill: "backwards" },
		).finished.catch(() => {});
	}

	/** Saída: mais curta e mais sutil que a entrada. Resolve quando termina. */
	function sair(el, { y = -4, x = 0, dur = DUR.curta } = {}) {
		if (!el || !el.animate || reduz()) return pronto;
		return el.animate(
			[
				{ opacity: 1, transform: "none" },
				{ opacity: 0, transform: `translate(${x}px, ${y}px)` },
			],
			{ duration: dur, easing: EASE.sai, fill: "forwards" },
		).finished.catch(() => {});
	}

	/**
	 * Abre ou fecha um bloco que entra no fluxo da página (lista, painel de ajustes).
	 * `mostrar(true|false)` aplica o estado; a animação acontece em volta dele.
	 */
	async function alternar(el, abrir, mostrar) {
		if (abrir) {
			mostrar(true);
			return entrar(el, { y: -4, dur: DUR.curta + 40 });
		}
		await sair(el, { y: -4, dur: DUR.micro + 20 });
		mostrar(false);
		if (el.getAnimations) for (const a of el.getAnimations()) a.cancel();
	}

	/** Troca de conteúdo direcional (próxima → vem da direita; anterior → da esquerda). */
	function deslizar(el, direcao = 1) {
		return entrar(el, { x: 14 * direcao, y: 0, dur: DUR.media });
	}

	/** Revela um item novo dentro de uma lista que já está na tela (ex.: próximo passo). */
	function revelar(el) {
		return entrar(el, { y: 4, dur: DUR.curta + 40 });
	}

	/** Barra de progresso determinada: devolve { el, definir(0..1) }. */
	function barra(classe = "") {
		const el = document.createElement("div");
		el.className = `mv-prog ${classe}`.trim();
		el.setAttribute("role", "progressbar");
		el.setAttribute("aria-valuemin", "0");
		el.setAttribute("aria-valuemax", "100");
		const i = document.createElement("i");
		el.appendChild(i);
		const definir = (f) => {
			const p = Math.max(0, Math.min(1, f || 0));
			el.style.setProperty("--p", p);
			el.setAttribute("aria-valuenow", String(Math.round(p * 100)));
		};
		definir(0);
		return { el, definir };
	}

	/** Esqueleto de carregamento a partir de uma descrição curta: ["titulo", "linha", "linha-curta", "bloco", "botao"]. */
	function esqueleto(partes, rotulo = "Carregando") {
		const el = document.createElement("div");
		el.className = "skel-grupo";
		el.setAttribute("role", "status");
		el.setAttribute("aria-live", "polite");
		el.setAttribute("aria-label", rotulo);
		for (const p of partes) {
			const s = document.createElement("div");
			s.className = `skel skel-${p}`;
			s.setAttribute("aria-hidden", "true");
			el.appendChild(s);
		}
		return el;
	}

	/** Executa `fn` quando o elemento chega perto da tela (lazy). Devolve uma função para cancelar. */
	function quandoVisivel(el, fn, margem = "200px") {
		if (!("IntersectionObserver" in raiz)) {
			fn();
			return () => {};
		}
		const io = new IntersectionObserver(
			(es) => {
				if (es.some((e) => e.isIntersecting)) {
					io.disconnect();
					fn();
				}
			},
			{ rootMargin: margem },
		);
		io.observe(el);
		return () => io.disconnect();
	}

	raiz.Movimento = { DUR, EASE, reduz, entrar, sair, alternar, deslizar, revelar, barra, esqueleto, quandoVisivel };
})(typeof window !== "undefined" ? window : globalThis);
