/**
 * Toda aula (js/estudo/aulas/*.js) segue o formato que js/estudo/aula.js
 * renderiza e tem o mínimo de conteúdo combinado para ensinar de verdade.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";
import { describe, expect, it } from "vitest";

const DIR = join(import.meta.dirname, "../../js/estudo/aulas");
const LAB = { estudo: { aulas: {} } };
for (const f of readdirSync(DIR)) vm.runInNewContext(readFileSync(join(DIR, f), "utf8"), { window: { LAB } }, { filename: f });
// fontes por matéria e revisões de professores (só dados)
vm.runInNewContext(readFileSync(join(DIR, "../verificacao.js"), "utf8"), { window: { LAB } }, { filename: "verificacao.js" });
const AULAS = Object.entries(LAB.estudo.aulas).flatMap(([materia, a]) => Object.entries(a).map(([id, aula]) => [`${materia}/${id}`, aula]));

const texto = (h) => String(h).replace(/<[^>]+>/g, "");
function balanceado(h) {
	const pilha = [];
	const vazias = new Set(["br", "hr", "img", "wbr"]);
	for (const m of String(h).matchAll(/<\/?([a-z0-9]+)[^>]*>/gi)) {
		const t = m[1].toLowerCase();
		if (vazias.has(t) || m[0].endsWith("/>")) continue;
		if (m[0][1] === "/") {
			if (pilha.pop() !== t) return false;
		} else pilha.push(t);
	}
	return pilha.length === 0;
}

describe("aulas", () => {
	it("existem aulas para todas as matérias", () => {
		expect(Object.keys(LAB.estudo.aulas).sort()).toEqual(["biologia", "fisica", "matematica", "pesquisa", "quimica"]);
		expect(AULAS.length).toBeGreaterThanOrEqual(41);
	});

	it.each(AULAS)("%s tem o roteiro completo", (_id, a) => {
		expect(a.tempo && a.nivel).toBeTruthy();
		expect(a.objetivos.length).toBeGreaterThanOrEqual(3);
		expect(a.secoes.length).toBeGreaterThanOrEqual(3);
		expect(a.exemplos.length).toBeGreaterThanOrEqual(2);
		expect(a.erros.length).toBeGreaterThanOrEqual(3);
		expect(a.aplicacoes.length).toBeGreaterThanOrEqual(3);
		expect(a.teste.length).toBeGreaterThanOrEqual(4);
		expect(a.resumo.length).toBeGreaterThanOrEqual(4);
		expect(a.alem && a.alem.h).toBeTruthy();
		for (const s of a.secoes) expect(texto(s.h).length, `seção "${s.t}" curta`).toBeGreaterThanOrEqual(250);
		for (const x of a.exemplos) expect(x.passos.length).toBeGreaterThanOrEqual(2);
	});

	it.each(AULAS)("%s cita pelo menos 2 fontes", (id, a) => {
		const fontes = [...(a.fontes || []), ...((LAB.estudo.fontes || {})[id.split("/")[0]] || [])];
		expect(fontes.length).toBeGreaterThanOrEqual(2);
		for (const f of fontes) expect(typeof f === "string" && f.length > 20).toBe(true);
	});

	it("revisões registradas têm nome, formação e data válida", () => {
		for (const [k, r] of Object.entries(LAB.estudo.revisoes || {})) {
			expect(AULAS.some(([id]) => id === k), `revisão de aula inexistente: ${k}`).toBe(true);
			expect(r.por && r.formacao).toBeTruthy();
			expect(r.data).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		}
	});

	it.each(AULAS)("%s tem teste rápido válido", (_id, a) => {
		for (const t of a.teste) {
			expect(t.op.length).toBeGreaterThanOrEqual(3);
			expect(new Set(t.op).size).toBe(t.op.length);
			expect(Number.isInteger(t.certa) && t.certa >= 0 && t.certa < t.op.length).toBe(true);
			expect(t.explica).toBeTruthy();
		}
		expect(new Set(a.teste.map((t) => t.certa)).size, "a resposta certa nunca muda de posição").toBeGreaterThan(1);
	});

	it.each(AULAS)("%s tem HTML bem formado e sem texto sujo", (_id, a) => {
		const blocos = [
			...a.secoes.map((s) => s.h),
			...(a.formulas || []).flatMap((f) => [f.eq, f.obs || ""]),
			...a.exemplos.flatMap((x) => [x.enunciado, ...x.passos, x.resposta]),
			...a.erros.flatMap((e) => [e.errado, e.certo, e.porque || ""]),
			...a.teste.flatMap((t) => [t.p, ...t.op, t.explica]),
			...a.aplicacoes,
			...a.resumo,
			a.alem.h,
		];
		for (const h of blocos) {
			expect(balanceado(h), `HTML desbalanceado: ${String(h).slice(0, 80)}`).toBe(true);
			expect(/\bundefined\b|\bNaN\b|\$\{/.test(String(h)), `texto sujo: ${String(h).slice(0, 80)}`).toBe(false);
		}
	});
});
