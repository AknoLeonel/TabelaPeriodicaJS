import { expect, test } from "@playwright/test";
import { abrir } from "./apoio.mjs";

const TELEMETRIA = /\/__otlp\/|sentry|datadog|newrelic|nr-data/;

test("sem configuração, nenhum dado de telemetria sai do navegador", async ({ page }) => {
	const saidas = [];
	page.on("request", (r) => TELEMETRIA.test(r.url()) && saidas.push(r.url()));
	await abrir(page, "estudo/quimica");
	await expect(page.locator(".mod.on .est-lista")).toBeAttached({ timeout: 20_000 });
	expect(await page.evaluate(() => typeof window.Obs.span)).toBe("function");
	expect(saidas).toEqual([]);
});

test("com OTLP configurado, envia spans, eventos e erros no formato OpenTelemetry", async ({ page, baseURL }) => {
	const recebidos = { traces: [], logs: [], metrics: [] };
	await page.route("**/__otlp/v1/*", async (rota) => {
		const tipo = rota.request().url().split("/v1/")[1];
		recebidos[tipo].push(JSON.parse(rota.request().postData() || "{}"));
		await rota.fulfill({ status: 200, body: "{}" });
	});
	await page.addInitScript((endpoint) => {
		window.ELEMENTAR_CONFIG = { servico: "elementar-teste", versao: "e2e", ambiente: "teste", amostragem: 1, respeitarPrivacidade: false, otlp: { endpoint } };
	}, `${baseURL}/__otlp`);
	await abrir(page, "estudo/quimica");
	await expect(page.locator(".mod.on .est-lista")).toBeAttached({ timeout: 20_000 });
	await page.evaluate(() => setTimeout(() => { throw new Error("erro de teste da observabilidade"); }, 0));
	// o lote sai a cada 5 s (ou ao esconder a página)
	await expect.poll(() => recebidos.traces.length + recebidos.logs.length, { timeout: 15_000 }).toBeGreaterThan(0);
	await expect.poll(() => JSON.stringify(recebidos.logs), { timeout: 15_000 }).toContain("erro de teste da observabilidade");

	const spans = recebidos.traces.flatMap((t) => t.resourceSpans[0].scopeSpans[0].spans);
	const carga = spans.find((s) => s.name === "modulo.carregar");
	expect(carga, "span de carregamento do módulo").toBeTruthy();
	expect(carga.traceId).toMatch(/^[0-9a-f]{32}$/);
	expect(carga.spanId).toMatch(/^[0-9a-f]{16}$/);
	expect(BigInt(carga.endTimeUnixNano) >= BigInt(carga.startTimeUnixNano)).toBe(true);

	const recurso = recebidos.traces[0].resourceSpans[0].resource.attributes;
	expect(recurso).toContainEqual({ key: "service.name", value: { stringValue: "elementar-teste" } });
	const logs = recebidos.logs.flatMap((l) => l.resourceLogs[0].scopeLogs[0].logRecords);
	expect(logs.some((l) => l.body.stringValue === "modulo.abrir")).toBe(true);
	const erro = logs.find((l) => l.severityText === "ERROR");
	expect(erro.attributes.some((a) => a.key === "exception.stacktrace")).toBe(true);
});
