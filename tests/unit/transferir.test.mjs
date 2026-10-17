import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const T = createRequire(import.meta.url)("../../js/estudo/transferir-calc.js");

const progresso = {
	"quimica/massa": { aula: true, teste: 0.75, h: [1, 0, 1, 1], t: 1000 },
	"fisica/optica": { aula: false, teste: 0.5, h: [0, 1], t: 2000 },
};
const historico = [{ data: 1700000000000, n: 10, ok: 8, tempo: 600, materias: ["Química", "Física"] }];

describe("transferir progresso", () => {
	it("ida e volta preserva progresso e histórico", () => {
		const c = T.codificar({ progresso, historico });
		expect(c.startsWith("EL1.")).toBe(true);
		expect(c).toMatch(/^EL1\.[A-Za-z0-9_-]+$/);
		const r = T.decodificar(c);
		expect(r.ok).toBe(true);
		expect(r.progresso).toEqual(progresso);
		expect(r.historico).toEqual(historico);
	});

	it("aceita acentos e espaços/quebras de linha coladas no código", () => {
		const c = T.codificar({ historico: [{ ...historico[0], materias: ["Química orgânica"] }] });
		const r = T.decodificar(`  ${c.slice(0, 10)}\n${c.slice(10)} `);
		expect(r.ok).toBe(true);
		expect(r.historico[0].materias).toEqual(["Química orgânica"]);
	});

	it("recusa códigos vazios, de outro formato ou corrompidos com mensagem clara", () => {
		expect(T.decodificar("").ok).toBe(false);
		expect(T.decodificar("abc").erro).toMatch(/EL1/);
		expect(T.decodificar("EL1.@@@").ok).toBe(false);
		expect(T.decodificar(`EL1.${Buffer.from('{"v":9,"p":{}}').toString("base64url")}`).ok).toBe(false);
	});

	it("descarta campos e chaves estranhos vindos do código", () => {
		const sujo = { v: 1, p: { "quimica/massa": { aula: "sim", teste: 7, h: [1, 2, "x", 0], t: -5, extra: "<script>" }, "<img>": { aula: true } }, h: [{ n: 3, ok: 9, data: 1 }, "x"] };
		const r = T.decodificar(`EL1.${Buffer.from(JSON.stringify(sujo)).toString("base64url")}`);
		expect(r.ok).toBe(true);
		expect(r.progresso).toEqual({ "quimica/massa": { aula: false, teste: 1, h: [1, 0], t: 0 } });
		expect(r.historico).toEqual([]);
	});

	it("mesclar nunca perde: aula OU, teste máximo, respostas da mais recente, histórico sem duplicar", () => {
		const atual = { progresso: { "quimica/massa": { aula: false, teste: 0.9, h: [0, 0], t: 5000 } }, historico };
		const r = T.mesclar(atual, { progresso, historico: [...historico, { data: 1600000000000, n: 5, ok: 5, tempo: 1, materias: [] }] });
		expect(r.progresso["quimica/massa"]).toEqual({ aula: true, teste: 0.9, h: [0, 0], t: 5000 });
		expect(r.progresso["fisica/optica"]).toEqual(progresso["fisica/optica"]);
		expect(r.historico.map((h) => h.n)).toEqual([5, 10]);
	});
});
