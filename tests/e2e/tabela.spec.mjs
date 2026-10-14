import { expect, test } from "@playwright/test";
import { abrir } from "./apoio.mjs";

test("a tabela abre com os 118 elementos e sem erros", async ({ page }) => {
	const erros = await abrir(page);
	const elementos = page.locator("#table button.el");
	await expect(elementos.first()).toBeVisible();
	expect(await elementos.count()).toBe(118);
	expect(erros).toEqual([]);
});

test("o guia de primeira visita aparece e fecha", async ({ page }) => {
	await page.goto("/index.html");
	const guia = page.locator("#guia");
	await expect(guia).toHaveAttribute("aria-hidden", "false");
	await page.locator("#guia-x").click();
	await expect(guia).toHaveAttribute("aria-hidden", "true");
});

test("abrir um elemento pelo endereço mostra a ficha", async ({ page }) => {
	const erros = await abrir(page, "Fe");
	await expect(page.locator("body")).toContainText("Ferro", { timeout: 15_000 });
	expect(erros).toEqual([]);
});
