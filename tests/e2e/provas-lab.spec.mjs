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
