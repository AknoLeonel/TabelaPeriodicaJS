import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import { B, F, F2, M, P, Q, R, T } from "../helpers/motores.mjs";

const S = createRequire(import.meta.url)("../../js/estudo/sorteio-calc.js");

const MOTORES = {
	quimica: [Q, ["massa", "mol", "balancear", "ph", "gas", "diluicao", "esteq", "eletrons"]],
	redox: [R, R.TIPOS],
	termo: [T, T.TIPOS],
	fisica: [F, ["formulas", "conv", "circ", "lanc"]],
	fisica2: [F2, F2.TIPOS],
	matematica: [M, M.TIPOS],
	pesquisa: [P, ["ajuste", "sig-contar", "sig-arredondar", "sig-operacao", "estat", "incerteza"]],
	biologia: [B, ["genetica", "probabilidade", "hardy", "dna", "populacoes"]],
};
const ITENS = Object.values(MOTORES).flatMap(([motor, tipos]) => tipos.map((tipo) => ({ motor, tipo })));
const assinatura = (ex) => JSON.stringify({ e: ex.enunciado, r: ex.resposta, o: ex.opcoes || null });

describe("sorteio com semente", () => {
	it("semente de texto é estável e espalha bem", () => {
		expect(S.semente("prova-1|aluno-1")).toBe(S.semente("prova-1|aluno-1"));
		const vistos = new Set(Array.from({ length: 1000 }, (_v, i) => S.semente(`prova-1|aluno-${i}`)));
		expect(vistos.size).toBe(1000);
	});

	it("o gerador fica em [0, 1) e repete a sequência", () => {
		const a = S.gerador(42), b = S.gerador(42);
		for (let i = 0; i < 1000; i++) {
			const x = a();
			expect(x).toBe(b());
			expect(x >= 0 && x < 1).toBe(true);
		}
	});

	it("devolve o Math.random original, mesmo quando a função falha", () => {
		const original = Math.random;
		expect(() => S.comSemente(1, () => { throw new Error("x"); })).toThrow("x");
		expect(Math.random).toBe(original);
	});

	it.each(ITENS.map((it) => [`${it.tipo}`, it]))("%s: mesma semente → mesma questão; sementes diferentes variam", (_n, item) => {
		const vistas = new Set();
		for (let k = 0; k < 20; k++) {
			const s = S.semente(`prova-teste|aluno-${k}`);
			const a = S.questao(item, s), b = S.questao(item, s);
			expect(assinatura(a)).toBe(assinatura(b));
			vistas.add(assinatura(a));
		}
		// quase todo tipo tem muitas variações; exige pelo menos 2 diferentes em 20 alunos
		expect(vistas.size).toBeGreaterThanOrEqual(2);
	});

	it("gerarProva é determinística e cada questão se regenera sozinha (como o servidor fará)", () => {
		const p1 = S.gerarProva("prova-9|aluno-3", ITENS, 12);
		const p2 = S.gerarProva("prova-9|aluno-3", ITENS, 12);
		expect(p1.map((q) => assinatura(q.ex))).toEqual(p2.map((q) => assinatura(q.ex)));
		for (const q of p1) expect(assinatura(S.questao(q.item, q.semente))).toBe(assinatura(q.ex));
		const outro = S.gerarProva("prova-9|aluno-4", ITENS, 12);
		expect(outro.map((q) => assinatura(q.ex))).not.toEqual(p1.map((q) => assinatura(q.ex)));
	});
});
