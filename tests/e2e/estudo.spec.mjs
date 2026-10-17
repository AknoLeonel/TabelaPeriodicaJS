import { expect, test } from "@playwright/test";
import { abrir, conferirTela, semSobreposicao } from "./apoio.mjs";

const MATERIAS = ["quimica", "fisica", "matematica", "biologia", "pesquisa"];

for (const materia of MATERIAS) {
	test(`${materia}: todas as ferramentas nas três etapas`, async ({ page }) => {
		test.setTimeout(240_000);
		const erros = await abrir(page, `estudo/${materia}`);
		await expect(page.locator(".mod.on .est-lista button").first()).toBeAttached({ timeout: 20_000 });
		const n = await page.locator(".mod.on .est-lista button").count();
		expect(n).toBeGreaterThan(3);
		for (let i = 0; i < n; i++) {
			await page.evaluate((k) => document.querySelectorAll(".mod.on .est-lista button")[k].click(), i);
			for (const etapa of [0, 1, 2]) {
				const bt = page.locator(".mod.on .est-etapas button").nth(etapa);
				if (!(await bt.isVisible())) continue;
				await bt.click();
				await expect(page.locator(".mod.on .est-area")).toBeVisible();
				await conferirTela(page);
				await semSobreposicao(page);
			}
		}
		expect(erros).toEqual([]);
	});
}

test("aula: o teste rápido corrige e explica", async ({ page }) => {
	await abrir(page, "estudo/quimica/massa");
	await page.locator(".mod.on .est-etapas button").nth(0).click();
	const q = page.locator(".mod.on .aula-q").first();
	await q.locator(".ex-op").first().click();
	await expect(q.locator(".aula-exp")).toBeVisible();
	await expect(q.locator(".ex-op.certa")).toHaveCount(1);
});

test("prática: responder certo soma acerto e libera o próximo exercício", async ({ page }) => {
	await abrir(page, "estudo/quimica/massa");
	await page.locator(".mod.on .est-etapas button").nth(2).click();
	const resposta = await page.evaluate(() => {
		// a resposta do exercício atual é recalculada a partir do enunciado mostrado
		const f = document.querySelector(".mod.on .ex-en b").textContent.replace(/\s/g, "");
		return window.QCalc.passosMassaMolar(f).valor;
	});
	await page.locator(".mod.on .ex-resp input").fill(String(resposta).replace(".", ","));
	await page.locator(".mod.on .linha-bt button", { hasText: "Conferir" }).click();
	await expect(page.locator(".mod.on .ex-fb.certo")).toBeVisible();
	await expect(page.locator(".mod.on .linha-bt button", { hasText: "Outro exercício" })).toBeVisible();
});

test("aula: mostra a situação da revisão, as fontes e a versão para impressão", async ({ page }) => {
	const erros = await abrir(page, "estudo/quimica/massa");
	await page.locator(".mod.on .est-etapas button").nth(0).click();
	await expect(page.locator(".mod.on .aula-selo")).toContainText(/aguardando revisão de professor|Revisada por/);
	await expect(page.locator('.mod.on .aula-selo a[href="verificacao.html"]')).toBeVisible();
	const fontes = page.locator(".mod.on .aula-fontes");
	await fontes.locator("summary").click();
	expect(await fontes.locator("li").count()).toBeGreaterThanOrEqual(2);
	// a versão para impressão abre tudo e traz o gabarito do teste rápido
	await page.evaluate(() => {
		window.print = () => {
			const c = document.querySelector(".aula-impressa");
			window.__impressa = c ? { gabaritos: c.querySelectorAll(".aula-exp b").length, ocultos: c.querySelectorAll(".oculto, [hidden]").length, perguntas: c.querySelectorAll(".aula-q").length } : null;
		};
	});
	await page.locator(".mod.on .aula-imp").click();
	const r = await page.evaluate(() => window.__impressa);
	expect(r.perguntas).toBeGreaterThanOrEqual(4);
	expect(r.gabaritos).toBe(r.perguntas);
	expect(r.ocultos).toBe(0);
	expect(erros).toEqual([]);
});

test("página 'Como verificamos' abre sem erros", async ({ page }) => {
	const erros = [];
	page.on("pageerror", (e) => erros.push(String(e)));
	await page.goto("/verificacao.html");
	await expect(page.locator("h1")).toHaveText("Como verificamos o conteúdo");
	const largura = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
	expect(largura).toBeLessThanOrEqual(1);
	expect(erros).toEqual([]);
});
