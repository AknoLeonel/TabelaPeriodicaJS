import { describe, expect, it } from "vitest";
import { M, X, textoLimpo } from "../helpers/motores.mjs";

describe("Leitor de expressões (sem eval)", () => {
	it.each([
		["2x^2 + 3", { x: 2 }, 11],
		["3(x+1)", { x: 1 }, 6],
		["sin(pi/2)", {}, 1],
		["e^0 + ln(e)", {}, 2],
		["sqrt(16) - 2^-1", {}, 3.5],
	])("avalia %s", (txt, vars, esperado) => {
		expect(X.avaliar(X.ler(txt), vars)).toBeCloseTo(esperado, 10);
	});

	it("lista as variáveis de uma expressão", () => {
		expect(X.variaveis(X.ler("m*g*h")).sort()).toEqual(["g", "h", "m"]);
	});

	it("não executa código: nomes desconhecidos viram variáveis sem valor", () => {
		// "alert(1)" é lido como multiplicação implícita de letras, nunca como chamada de função do navegador
		expect(() => X.avaliar(X.ler("alert(1)"), {})).toThrow(/Falta o valor/);
	});
});

describe("Matemática", () => {
	it("Bhaskara: x² − 5x + 6 = 0 tem raízes 2 e 3, vértice (2,5; −0,25)", () => {
		const r = M.eq2({ a: 1, b: -5, c: 6 });
		expect(r.raizes).toEqual([2, 3]);
		expect(r.xv).toBeCloseTo(2.5);
		expect(r.yv).toBeCloseTo(-0.25);
		expect(textoLimpo(r)).toBe(true);
	});

	it("Δ < 0: sem raízes reais", () => {
		expect(M.eq2({ a: 1, b: 2, c: 5 }).raizes || []).toEqual([]);
	});

	it("sistema 2×2 com frações exatas", () => {
		expect(M.sistema([[2, 1, 5], [1, -1, 1]]).sol).toEqual([2, 1]);
	});

	it("sistema 3×3", () => {
		expect(M.sistema([[1, 1, 1, 6], [0, 2, 5, -4], [2, 5, -1, 27]]).sol).toEqual([5, 3, -2]);
	});

	it("logaritmo: log₂ 8 = 3", () => {
		expect(M.logaritmo({ base: 2, x: 8 }).valor).toBeCloseTo(3, 12);
	});

	it("derivada simbólica conferida no ponto", () => {
		// (x²·sen x)′ = 2x·sen x + x²·cos x; em x = 1
		const r = M.derivada({ f: "x^2*sin(x)", x0: 1 });
		expect(r.valor).toBeCloseTo(2 * Math.sin(1) + Math.cos(1), 10);
		expect(r.tangente).toBeTruthy();
	});

	it("integral definida pelo teorema fundamental", () => {
		expect(M.integral({ f: "3x^2 + 2x - 1", a: 0, b: 2 }).valor).toBeCloseTo(10, 10);
		expect(M.integral({ f: "1/x", a: 1, b: Math.E }).valor).toBeCloseTo(1, 8);
	});

	it("trigonometria: sen 150° = 0,5 e cos 150° = −√3/2", () => {
		const r = M.trigAngulo({ ang: 150, unidade: "g" });
		expect(r.sen).toBeCloseTo(0.5, 12);
		expect(r.cos).toBeCloseTo(-Math.sqrt(3) / 2, 12);
	});

	it("vetores: (3; 4) + (1; −2) = (4; 2)", () => {
		const r = M.vetores({ op: "soma", u: "(3; 4)", v: "(1; -2)" });
		expect(r.r).toEqual([4, 2]);
	});

	it("estudo de função: x³ − 3x tem raízes 0 e ±√3", () => {
		const r = M.estudoFuncao({ f: "x^3 - 3x", x0: -3, x1: 3 });
		const raizes = r.raizes.map((x) => +x.toFixed(4)).sort((a, b) => a - b);
		expect(raizes).toEqual([-1.7321, 0, 1.7321]);
		expect(r.extremos.length).toBe(2);
	});
});
