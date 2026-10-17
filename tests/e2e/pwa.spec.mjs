import { expect, test } from "@playwright/test";
import { abrir } from "./apoio.mjs";

test("faixa 'Estude para a prova' leva ao estudo e não volta depois de escolhida", async ({ page, isMobile }) => {
	test.skip(isMobile, "no celular os cartões de baixo fazem esse papel");
	await abrir(page);
	const faixa = page.locator("#faixa");
	await expect(faixa).toBeVisible();
	await page.locator("#faixa-ir").click();
	await expect(page.locator(".mod.on .est-lista button").first()).toBeAttached({ timeout: 20_000 });
	await page.reload();
	await expect(faixa).toBeHidden();
});

test("celular: o cartão de estudo vende a prova", async ({ page, isMobile }) => {
	test.skip(!isMobile, "só no celular");
	await abrir(page);
	await expect(page.locator("#hub-estudo")).toContainText("Estude para a prova");
});

test.describe("PWA", () => {
	test.use({ serviceWorkers: "allow" });

test("PWA: tem manifest e abre sem internet depois da primeira visita", async ({ page, context }) => {
	const erros = await abrir(page);
	const manifest = await page.evaluate(async () => (await fetch(document.querySelector('link[rel="manifest"]').href)).json());
	expect(manifest.short_name).toBe("Elementar");
	expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
	await page.evaluate(() => navigator.serviceWorker.ready);
	// recarrega uma vez para a página ficar sob controle do service worker
	await page.reload();
	await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
	await context.setOffline(true);
	await page.reload();
	await expect(page.locator("#table button.el").first()).toBeVisible();
	await expect(page.locator("#table button.el")).toHaveCount(118);
	await context.setOffline(false);
	expect(erros.filter((e) => !/fonts\.g|ERR_INTERNET_DISCONNECTED|Failed to load resource/.test(e))).toEqual([]);
});
});
