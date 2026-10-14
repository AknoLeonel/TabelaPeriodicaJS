/**
 * Contratos de arquitetura que dependem de globais (o dependency-cruiser só
 * enxerga require/import). Veja AGENTS.md, seção "Arquitetura".
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const RAIZ = join(import.meta.dirname, "../..");
const ler = (p) => readFileSync(join(RAIZ, p), "utf8");
// tira comentários e strings simples para não acusar palavras dentro de textos
const codigo = (src) =>
	src
		.replace(/\/\*[\s\S]*?\*\//g, "")
		.replace(/(^|[^:])\/\/.*$/gm, "$1")
		.replace(/`(?:\\[\s\S]|[^`\\])*`/g, "``")
		.replace(/"(?:\\.|[^"\\])*"/g, '""')
		.replace(/'(?:\\.|[^'\\])*'/g, "''");
const arquivos = (dir, filtro = () => true) => readdirSync(join(RAIZ, dir)).filter((f) => f.endsWith(".js") && filtro(f)).map((f) => `${dir}/${f}`);

const MOTORES = arquivos("js/estudo", (f) => f.endsWith("-calc.js") || f === "expressao.js");
const AULAS = arquivos("js/estudo/aulas");
const LAB_MODULOS = arquivos("js/lab", (f) => f !== "lab.js");
const TODOS = [...arquivos("js"), ...arquivos("js/estudo"), ...AULAS, ...arquivos("js/lab")].filter((f) => !/dados|descricoes/.test(f));

describe("contratos de arquitetura", () => {
	it.each(MOTORES)("motor %s é puro: sem DOM, sem LAB, sem armazenamento", (f) => {
		const c = codigo(ler(f));
		expect(c).not.toMatch(/\bdocument\b|\bLAB\b|localStorage|sessionStorage|\bfetch\(|addEventListener/);
	});

	it.each(MOTORES)("motor %s roda em Node e no navegador (UMD)", (f) => {
		const src = ler(f);
		expect(src).toMatch(/module\.exports/);
	});

	it.each(AULAS)("aula %s só contém dados", (f) => {
		const c = codigo(ler(f));
		expect(c).not.toMatch(/\bdocument\b|addEventListener|\bfetch\(|localStorage|innerHTML|setTimeout|setInterval/);
		expect(c).toMatch(/E\.aulas\.[a-z]+/);
	});

	it.each(LAB_MODULOS)("módulo do laboratório %s não depende do estudo", (f) => {
		expect(codigo(ler(f))).not.toMatch(/LAB\.estudo|QCalc|FCalc|MCalc|PCalc|BCalc/);
	});

	it.each(TODOS)("%s não usa eval nem new Function", (f) => {
		expect(codigo(ler(f))).not.toMatch(/\beval\(|new Function\(/);
	});

	it("todo arquivo do catálogo de módulos existe", () => {
		const lab = ler("js/lab/lab.js");
		const caminhos = [...lab.matchAll(/"((?:js|css)\/[^"]+\.(?:js|css))"/g)].map((m) => m[1]);
		expect(caminhos.length).toBeGreaterThan(20);
		for (const p of new Set(caminhos)) expect(() => ler(p), p).not.toThrow();
	});
});
