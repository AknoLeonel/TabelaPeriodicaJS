/** Utilidades comuns dos testes end-to-end. */
import { expect } from "@playwright/test";

/** Abre a página sem o guia de primeira visita e coleta erros do console. */
export async function abrir(page, hash = "") {
	const erros = [];
	page.on("pageerror", (e) => erros.push(String(e)));
	page.on("console", (m) => {
		if (m.type() === "error") erros.push(m.text());
	});
	await page.addInitScript(() => {
		try {
			localStorage.setItem("elementar.guia.visto", "1");
		} catch {
			/* sem armazenamento */
		}
	});
	await page.goto(`/index.html${hash ? `#${hash}` : ""}`);
	return erros;
}

/** Nada pode transbordar na horizontal nem haver dois módulos ativos. */
export async function conferirTela(page) {
	const r = await page.evaluate(() => {
		const mods = document.querySelectorAll(".mod.on");
		const m = mods[0];
		return {
			ativos: mods.length,
			transbordo: m ? m.scrollWidth - m.clientWidth : 0,
			pagina: document.documentElement.scrollWidth - innerWidth,
		};
	});
	expect(r.ativos, "deve haver exatamente um módulo ativo").toBe(1);
	expect(r.transbordo, "rolagem horizontal no módulo").toBeLessThanOrEqual(1);
	expect(r.pagina, "rolagem horizontal na página").toBeLessThanOrEqual(1);
}

/** Blocos em fluxo vertical não podem se sobrepor. */
export async function semSobreposicao(page) {
	const problemas = await page.evaluate(() => {
		const r = [];
		const m = document.querySelector(".mod.on");
		const vis = (e) => {
			const s = getComputedStyle(e);
			return s.display !== "none" && s.visibility !== "hidden" && !["absolute", "fixed", "sticky"].includes(s.position) && e.getClientRects().length;
		};
		for (const pai of m.querySelectorAll(".est-main, .est-main *, .pv-wrap, .pv-wrap *")) {
			const s = getComputedStyle(pai);
			const coluna = (s.display.includes("flex") && s.flexDirection.startsWith("column")) || s.display === "block";
			if (!vis(pai) || !coluna) continue;
			const filhos = [...pai.children].filter(vis).filter((e) => getComputedStyle(e).display !== "inline" && getComputedStyle(e).float === "none");
			for (let i = 1; i < filhos.length; i++) {
				const a = filhos[i - 1].getBoundingClientRect();
				const b = filhos[i].getBoundingClientRect();
				if (a.height && b.height && a.bottom - b.top > 2 && a.right > b.left && b.right > a.left) r.push(`${filhos[i - 1].className} × ${filhos[i].className}`);
			}
		}
		return r;
	});
	expect(problemas, "blocos sobrepostos").toEqual([]);
}
