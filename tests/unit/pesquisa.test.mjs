import { describe, expect, it } from "vitest";
import { P } from "../helpers/motores.mjs";

describe("Pesquisa: ajuste linear", () => {
	it("recupera a reta exata y = 2x + 1", () => {
		const r = P.ajustar([{ x: 1, y: 3 }, { x: 2, y: 5 }, { x: 3, y: 7 }], { modo: "lin" });
		expect(r.a).toBeCloseTo(2, 12);
		expect(r.b).toBeCloseTo(1, 12);
		expect(r.r2).toBeCloseTo(1, 12);
	});

	it("quarteto de Anscombe (conjunto I): a ≈ 0,500, b ≈ 3,00, R² ≈ 0,667", () => {
		const x = [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5];
		const y = [8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68];
		const r = P.ajustar(x.map((v, i) => ({ x: v, y: y[i] })), { modo: "lin" });
		expect(r.a).toBeCloseTo(0.5001, 3);
		expect(r.b).toBeCloseTo(3.0001, 3);
		expect(r.r2).toBeCloseTo(0.6665, 3);
	});
});

describe("Pesquisa: estatística e algarismos significativos", () => {
	it("média, desvio-padrão (n − 1) e erro-padrão", () => {
		const r = P.estatistica([10, 12, 14], { conf: 0.95 });
		expect(r.media).toBe(12);
		expect(r.s).toBeCloseTo(2, 12);
		expect(r.sm).toBeCloseTo(2 / Math.sqrt(3), 12);
	});

	it("t de Student tabelado", () => {
		expect(P.tStudent(4, 0.95)).toBeCloseTo(2.776, 3);
		expect(P.tStudent(10, 0.95)).toBeCloseTo(2.228, 3);
	});

	it.each([
		["0,00340", 3],
		["1500", 2],
		["1,500e3", 4],
		["12,0", 3],
	])("%s tem %i algarismos significativos", (txt, n) => {
		expect(P.contarAS(txt).n).toBe(n);
	});

	it("propagação: em a + b as incertezas somam em quadratura (0,3 e 0,4 → 0,5)", () => {
		const r = P.propagar("a + b", { a: { v: 10, s: 0.3 }, b: { v: 5, s: 0.4 } });
		expect(r.valor).toBe(15);
		expect(r.sigma).toBeCloseTo(0.5, 6);
	});

	it("propagação: em a·b as incertezas relativas somam em quadratura", () => {
		const r = P.propagar("a*b", { a: { v: 10, s: 0.3 }, b: { v: 5, s: 0.2 } });
		expect(r.sigma / r.valor).toBeCloseTo(Math.hypot(0.03, 0.04), 4);
	});
});
