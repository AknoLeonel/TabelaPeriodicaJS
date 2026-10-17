import { expect, test } from "@playwright/test";
import { abrir, conferirTela } from "./apoio.mjs";

test("Provas: simulado rápido do começo ao resultado", async ({ page }) => {
	test.setTimeout(180_000);
	const erros = await abrir(page, "estudo/provas");
	page.on("dialog", (d) => d.accept());
	await page.locator(".pv-at").first().click();
	await expect(page.locator(".pv-pt")).toHaveCount(10);
	for (let i = 0; i < 10; i++) {
		const op = page.locator(".mod.on .pv-zona .ex-op").first();
		if (await op.isVisible()) await op.click();
		else await page.locator(".mod.on .pv-zona .ex-resp input").fill("1");
		const prox = page.locator(".mod.on .pv-nav button", { hasText: "Próxima" });
		if (await prox.isVisible()) await prox.click();
	}
	await expect(page.locator(".pv-pt.feita")).toHaveCount(10);
	await page.locator(".mod.on .pv-nav button", { hasText: "Entregar" }).click();
	await expect(page.locator(".pv-nota")).toBeVisible();
	await expect(page.locator(".pv-q")).toHaveCount(10);
	await conferirTela(page);
	expect(erros).toEqual([]);
});

test("Laboratório: todos os módulos abrem, um de cada vez", async ({ page }) => {
	const erros = await abrir(page, "lab/atomo");
	await expect(page.locator(".mod.on")).toBeVisible({ timeout: 20_000 });
	const n = await page.locator("#lab-nav button").count();
	for (let i = 0; i < n; i++) {
		await page.locator("#lab-nav button").nth(i).click();
		await expect(page.locator(".mod.on canvas").first()).toBeVisible();
		await conferirTela(page);
	}
	expect(erros).toEqual([]);
});

test("fechar e reabrir não empilha módulos (regressão)", async ({ page }) => {
	await abrir(page);
	await page.locator("#lab-open").click();
	await expect(page.locator(".mod.on")).toBeVisible({ timeout: 20_000 });
	await page.locator("#lab-back").click();
	await page.locator("#estudo-open").click();
	await expect(page.locator(".mod.on .est-lista")).toBeAttached({ timeout: 20_000 });
	await page.locator("#lab-back").click();
	await page.locator("#estudo-open").click();
	await page.locator('#lab-nav button[data-id="pesquisa"]').click();
	await expect(page.locator(".mod.on")).toHaveCount(1);
});

test("Provas: o progresso vai para outro aparelho por código", async ({ browser }) => {
	// aparelho 1: tem progresso e copia o código
	const a = await browser.newContext({ permissions: ["clipboard-read", "clipboard-write"] });
	const p1 = await a.newPage();
	await p1.addInitScript(() => {
		localStorage.setItem("elementar.guia.visto", "1");
		localStorage.setItem("estudo.progresso", JSON.stringify({ "quimica/massa": { aula: true, teste: 1, h: [1, 1, 1, 1, 1], t: 1 } }));
		localStorage.setItem("estudo.provas.historico", JSON.stringify([{ data: 1700000000000, n: 10, ok: 9, tempo: 300, materias: ["Química"] }]));
	});
	await p1.goto("/index.html#estudo/provas");
	await p1.locator(".pv-tr .bt", { hasText: "Copiar meu código" }).click();
	await expect(p1.locator(".pv-tr-msg")).toContainText(/copiado|Copie/);
	const codigo = (await p1.evaluate(() => navigator.clipboard.readText().catch(() => ""))) || (await p1.locator(".pv-tr-cod").inputValue());
	expect(codigo.startsWith("EL1.")).toBe(true);
	await a.close();

	// aparelho 2: vazio, importa
	const b = await browser.newContext();
	const p2 = await b.newPage();
	await p2.addInitScript(() => localStorage.setItem("elementar.guia.visto", "1"));
	await p2.goto("/index.html#estudo/provas");
	await p2.locator(".pv-tr .bt", { hasText: "Trazer de outro aparelho" }).click();
	await p2.locator(".pv-tr-cod").fill("isso não é código");
	await p2.locator(".pv-tr .bt", { hasText: "Importar" }).click();
	await expect(p2.locator(".pv-tr-msg")).toContainText("EL1");
	await p2.locator(".pv-tr-cod").fill(codigo);
	await p2.locator(".pv-tr .bt", { hasText: "Importar" }).click();
	await expect(p2.locator(".pv-tr-msg")).toContainText("1 tópico(s) e 1 simulado(s)");
	const salvo = await p2.evaluate(() => JSON.parse(localStorage.getItem("estudo.progresso")));
	expect(salvo["quimica/massa"].aula).toBe(true);
	await b.close();
});
