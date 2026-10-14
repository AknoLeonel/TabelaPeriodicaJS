/**
 * Integração motor → exercício → correção: para cada tipo de exercício de cada
 * matéria, gera vários exercícios e confere que (1) o exercício é bem formado,
 * (2) tem resolução passo a passo, (3) a resposta do próprio motor é aceita na
 * conferência e (4) nenhum texto vaza "undefined" ou "NaN".
 */
import { describe, expect, it } from "vitest";
import { B, F, F2, M, P, Q, R, T } from "../helpers/motores.mjs";

const REPETICOES = Number(process.env.EXERCICIOS_POR_TIPO || 150);

const TIPOS = {
	quimica: { motor: Q, tipos: ["massa", "mol", "balancear", "ph", "gas", "diluicao", "esteq", "eletrons"] },
	redox: { motor: R, conferir: Q.conferir, tipos: R.TIPOS },
	termo: { motor: T, conferir: Q.conferir, tipos: T.TIPOS },
	fisica: { motor: F, tipos: ["formulas", "conv", "circ", "lanc"] },
	fisica2: { motor: F2, tipos: F2.TIPOS },
	matematica: { motor: M, tipos: M.TIPOS },
	pesquisa: { motor: P, tipos: ["ajuste", "sig-contar", "sig-arredondar", "sig-operacao", "estat", "incerteza"] },
	biologia: { motor: B, tipos: ["genetica", "probabilidade", "hardy", "dna", "populacoes"] },
};

const sujo = (t) => /\bundefined\b|\bNaN\b/.test(t);

describe.each(Object.entries(TIPOS))("exercícios de %s", (_materia, { motor, conferir, tipos }) => {
	const conf = conferir || motor.conferir;
	it.each(tipos)("tipo %s", (tipo) => {
		for (let i = 0; i < REPETICOES; i++) {
			const ex = motor.gerarExercicio(tipo);
			expect(ex, `${tipo}: gerador devolveu vazio`).toBeTruthy();
			expect(ex.enunciado).toBeTruthy();
			expect(Array.isArray(ex.passos) && ex.passos.length > 0, `${tipo}: sem resolução`).toBe(true);
			const textos = [ex.enunciado, ex.texto, ...(ex.opcoes || [])].join(" ");
			expect(sujo(textos), `${tipo}: texto sujo em "${ex.enunciado}"`).toBe(false);
			if (ex.tipo === "escolha") {
				expect(ex.opcoes.length).toBeGreaterThanOrEqual(3);
				expect(new Set(ex.opcoes).size, `${tipo}: alternativas repetidas`).toBe(ex.opcoes.length);
				expect(Number.isInteger(ex.resposta) && ex.resposta >= 0 && ex.resposta < ex.opcoes.length).toBe(true);
			} else if (ex.tipo === "lista") {
				expect(conf(ex, ex.resposta.join(", "))).toBe(true);
			} else {
				expect(Number.isFinite(ex.resposta), `${tipo}: resposta não numérica`).toBe(true);
				expect(conf(ex, String(ex.resposta)), `${tipo}: a própria resposta foi recusada`).toBe(true);
			}
		}
	});
});
