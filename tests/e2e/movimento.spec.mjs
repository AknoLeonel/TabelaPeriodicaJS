import { expect, test } from "@playwright/test";
import { abrir } from "./apoio.mjs";

// Animações em andamento (CSS ou Web Animations) que ainda não terminaram.
const animacoesRodando = (page) =>
	page.evaluate(() =>
		document
			.getAnimations()
			.filter((a) => a.playState === "running")
			.map((a) => {
				const t = a.effect && a.effect.getTiming ? a.effect.getTiming() : {};
				return { nome: a.animationName || a.constructor.name, duracao: t.duration, repete: t.iterations };
			})
			.filter((a) => a.duracao > 1 || a.repete === Infinity),
	);

test.describe("movimento reduzido", () => {
	test("com prefers-reduced-motion nada fica se mexendo e tudo continua funcionando", async ({ page }) => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		await abrir(page, "estudo/fisica/movimento");
		expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
		await expect(page.locator(".mod.on .est-etapas")).toBeVisible({ timeout: 20_000 });
		for (const etapa of [0, 1, 2]) {
			await page.locator(".mod.on .est-etapas button").nth(etapa).click();
			await expect(page.locator(".mod.on .est-area")).toBeVisible();
		}
		await page.locator('#lab-nav button[data-id="provas"]').click();
		await expect(page.locator(".pv-at").first()).toBeVisible({ timeout: 20_000 });
		await page.waitForTimeout(300);
		expect(await animacoesRodando(page)).toEqual([]);
	});
});

test("carregamento de matéria mostra esqueleto e progresso antes do conteúdo", async ({ page }) => {
	// sem pré-carregamento em segundo plano (ele baixaria a matéria antes do toque),
	// e os scripts da matéria ficam segurados até o esqueleto ser conferido
	await page.addInitScript(() => {
		window.requestIdleCallback = () => 0;
	});
	let soltar;
	const liberado = new Promise((z) => {
		soltar = z;
	});
	await page.route(/js\/estudo\/(biologia|aulas\/biologia).*\.js$/, async (r) => {
		await liberado;
		await r.continue();
	});
	await abrir(page, "estudo/quimica");
	await expect(page.locator(".mod.on .est-lista")).toBeAttached({ timeout: 20_000 });
	await page.locator('#lab-nav button[data-id="biologia"]').click();
	await expect(page.locator(".mod-esq [role=status]")).toBeVisible();
	await expect(page.locator(".mod-esq [role=progressbar]")).toBeVisible();
	soltar();
	await expect(page.locator(".mod.on .est-lista")).toBeAttached({ timeout: 20_000 });
	await expect(page.locator(".mod-esq")).toHaveCount(0);
});
