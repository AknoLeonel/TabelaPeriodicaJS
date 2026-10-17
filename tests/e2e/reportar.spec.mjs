import { expect, test } from "@playwright/test";
import { abrir } from "./apoio.mjs";

/** Captura o window.open em vez de abrir uma aba de verdade. */
async function capturarAbertura(page) {
	await page.evaluate(() => {
		window.__aberto = null;
		window.open = (u) => {
			window.__aberto = u;
			return null;
		};
	});
}

test("exercício: 'Achei um erro' abre uma Issue pré-preenchida com o enunciado", async ({ page }) => {
	const erros = await abrir(page, "estudo/quimica/massa");
	await page.locator(".mod.on .est-etapas button").nth(2).click();
	await capturarAbertura(page);
	const enunciado = (await page.locator(".mod.on .ex-en").first().textContent()).replace(/\s+/g, " ").trim();
	await page.locator(".mod.on .rep-bt").first().click();
	const form = page.locator(".mod.on .rep-form");
	await expect(form).toBeVisible();
	await form.locator("select").selectOption("Enunciado confuso");
	await form.locator("textarea").fill("teste automático");
	await form.locator("button[type=submit]").click();
	await expect(page.locator(".mod.on .rep-ok")).toBeVisible();
	const u = new URL(await page.evaluate(() => window.__aberto));
	expect(u.origin + u.pathname).toBe("https://github.com/AknoLeonel/TabelaPeriodicaJS/issues/new");
	expect(u.searchParams.get("template")).toBe("correcao.yml");
	expect(u.searchParams.get("title")).toMatch(/^\[Correção\] Enunciado confuso/);
	const corpo = u.searchParams.get("o-que");
	expect(corpo).toContain("teste automático");
	expect(corpo).toContain(enunciado.slice(0, 40));
	expect(u.searchParams.get("como")).toContain("#estudo/quimica/massa");
	expect(erros).toEqual([]);
});

test("aula: o botão de erro aparece no fim da aula", async ({ page }) => {
	await abrir(page, "estudo/quimica/massa");
	await page.locator(".mod.on .est-etapas button").nth(0).click();
	await expect(page.locator(".mod.on .aula-rod .rep-bt")).toBeVisible();
});
