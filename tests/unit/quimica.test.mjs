import { describe, expect, it } from "vitest";
import { Q, R, T, textoLimpo } from "../helpers/motores.mjs";

describe("Química: massa molar, mol e balanceamento", () => {
	it("calcula massas molares de livro, com parênteses e hidratos", () => {
		expect(Q.passosMassaMolar("H2O").valor).toBeCloseTo(18.015, 2);
		expect(Q.passosMassaMolar("Ca(OH)2").valor).toBeCloseTo(74.09, 1);
		expect(Q.passosMassaMolar("Al2(SO4)3").valor).toBeCloseTo(342.15, 1);
		expect(Q.passosMassaMolar("CuSO4·5H2O").valor).toBeCloseTo(249.68, 1);
	});

	it("rejeita fórmula inválida com mensagem amigável", () => {
		const r = Q.passosMassaMolar("Xx2");
		expect(r.ok).toBe(false);
		expect(r.erro).toBeTruthy();
	});

	it("converte massa em mol", () => {
		const r = Q.passosMol("H2O", "massa", 36.03);
		expect(r.n).toBeCloseTo(2, 2);
	});

	it.each([
		["H2 + O2 -> H2O", [2, 1, 2]],
		["C3H8 + O2 -> CO2 + H2O", [1, 5, 3, 4]],
		["Fe + O2 -> Fe2O3", [4, 3, 2]],
		["KMnO4 + HCl -> KCl + MnCl2 + Cl2 + H2O", [2, 16, 2, 2, 5, 8]],
	])("balanceia %s", (eq, coef) => {
		expect(Q.balancear(eq).coef).toEqual(coef);
	});

	it("estequiometria: 4 g de H₂ formam ≈ 35,7 g de água", () => {
		const r = Q.passosEstequiometria("H2 + O2 -> H2O", [{ i: 0, valor: 4, un: "g" }]);
		expect(r.prod[2].massa).toBeCloseTo(35.74, 1);
		expect(textoLimpo(r)).toBe(true);
	});

	it("estequiometria: identifica o reagente limitante", () => {
		const r = Q.passosEstequiometria("H2 + O2 -> H2O", [
			{ i: 0, valor: 4, un: "g" },
			{ i: 1, valor: 16, un: "g" },
		]);
		expect(r.limite).toBe(1); // 16 g de O₂ = 0,5 mol acaba antes de 2 mol de H₂
	});
});

describe("Química: soluções, pH e gases", () => {
	it("pH de ácido forte e de ácido fraco", () => {
		expect(Q.passosPH({ tipo: "acido-forte", C: 0.01, nu: 1 }).ph).toBeCloseTo(2, 6);
		expect(Q.passosPH({ tipo: "acido-fraco", C: 0.1, K: 1.8e-5 }).ph).toBeCloseTo(2.88, 2);
		expect(Q.passosPH({ tipo: "base-forte", C: 0.001, nu: 1 }).ph).toBeCloseTo(11, 6);
	});

	it("diluição C1·V1 = C2·V2", () => {
		expect(Q.passosDiluicao({ C1: 2, V1: 50, C2: null, V2: 200 }).valor).toBeCloseTo(0.5, 6);
	});

	it("1 mol de gás ideal ocupa ≈ 22,4 L nas CNTP", () => {
		const r = Q.passosGas({ P: 1, V: 22.4, n: null, T: 273.15, uP: "atm", uV: "L", uT: "K" });
		expect(r.valor).toBeCloseTo(1, 2);
	});

	it("distribuição eletrônica do ferro", () => {
		const r = Q.passosEletronica(26, 0);
		expect(r.valencia).toBe(2);
		expect(r.camadas).toEqual({ 1: 2, 2: 8, 3: 14, 4: 2 });
	});

	it("exceções conhecidas: cobre é [Ar] 3d¹⁰ 4s¹", () => {
		const r = Q.passosEletronica(29, 0);
		expect(r.excecao).toBe(true);
		expect(r.resposta).toContain("3d¹⁰");
	});
});

describe("Química: oxirredução e eletroquímica", () => {
	it("Nox no ácido sulfúrico", () => {
		expect(R.nox("H2SO4").nox).toEqual({ H: 1, O: -2, S: 6 });
	});

	it("pilha de Daniell: ΔE° = 1,10 V", () => {
		const r = R.pilha({ a: "Zn^2+|Zn", b: "Cu^2+|Cu" });
		expect(r.E0).toBeCloseTo(1.1, 2);
	});

	it("Faraday: 2 A por 965 s depositam ≈ 0,636 g de cobre", () => {
		expect(R.faraday({ par: "Cu^2+|Cu", modo: "massa", i: 2, t: 965 }).valor).toBeCloseTo(0.6356, 3);
	});

	it("equação iônica líquida da precipitação de AgCl", () => {
		const r = R.ionica({ reagentes: "AgNO3 + NaCl" });
		expect(r.resposta).toContain("AgCl(s)");
		expect(r.espectadores.length).toBe(2);
	});
});

describe("Química: equilíbrio e termoquímica", () => {
	it("Kps do AgCl → solubilidade ≈ 1,34×10⁻⁵ mol/L", () => {
		const r = T.ksp({ modo: "s", x: 1, y: 1, Ksp: 1.8e-10 });
		expect(r.ok).toBe(true);
		expect(r.valor).toBeCloseTo(1.342e-5, 7);
	});

	it("todos os textos gerados estão limpos", () => {
		for (const r of [Q.passosMassaMolar("NaCl"), Q.passosEletronica(17, -1), R.nox("KMnO4")]) {
			expect(textoLimpo(r)).toBe(true);
		}
	});
});
