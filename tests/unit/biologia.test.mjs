import { describe, expect, it } from "vitest";
import { B, textoLimpo } from "../helpers/motores.mjs";

describe("Biologia: genética", () => {
	it("di-híbrido AaBb × AaBb dá 9:3:3:1 em 16 casas", () => {
		const r = B.cruzar("AaBb x AaBb");
		expect(r.ok).toBe(true);
		expect(r.total).toBe(16);
		const fen = r.fenotipos.map((f) => f.n ?? f.c ?? f.k).sort((a, b) => b - a);
		expect(fen).toEqual([9, 3, 3, 1]);
		expect(textoLimpo(r)).toBe(true);
	});

	it("mono-híbrido Aa × Aa dá 1:2:1 nos genótipos", () => {
		const r = B.cruzar("Aa x Aa");
		const gen = r.genotipos.map((g) => g.n ?? g.c ?? g.k).sort((a, b) => a - b);
		expect(gen).toEqual([1, 1, 2]);
	});

	it("tipagem ABO: IAi × IBi pode gerar os quatro tipos, 1/4 cada", () => {
		const r = B.abo({ p1: "IAi", p2: "IBi" });
		for (const t of ["A", "B", "AB", "O"]) expect(B.fV(r.pABO[t])).toBeCloseTo(0.25, 9);
	});

	it("doação de sangue: O− doa para todos; AB+ recebe de todos", () => {
		for (const t of B.TIPOS) expect(B.podeDoar("O−", t)).toBe(true);
		for (const t of B.TIPOS) expect(B.podeDoar(t, "AB+")).toBe(true);
		expect(B.podeDoar("A+", "O−")).toBe(false);
	});
});

describe("Biologia: Hardy-Weinberg", () => {
	it("1 em 100 afetados → q = 0,1 e 18% de portadores", () => {
		const r = B.hardy({ modo: "q2", valor: 0.01 });
		expect(r.q).toBeCloseTo(0.1, 12);
		expect(r.p).toBeCloseTo(0.9, 12);
		expect(r.fAa).toBeCloseTo(0.18, 12);
	});
});

describe("Biologia: do DNA à proteína", () => {
	it("código genético: 64 códons, 3 de parada, AUG é metionina", () => {
		expect(Object.keys(B.CODIGO).length).toBe(64);
		const paradas = Object.entries(B.CODIGO).filter(([, a]) => /stop|parada|\*/i.test(String(a)));
		expect(paradas.map(([c]) => c).sort()).toEqual(["UAA", "UAG", "UGA"]);
	});

	it("traduz a fita molde TAC GGT CAA GCT ATT em Met-Pro-Val-Arg", () => {
		const r = B.dna({ seq: "TACGGTCAAGCTATT", tipo: "molde" });
		expect(r.ok).toBe(true);
		expect(r.rna.replace(/\s/g, "")).toBe("AUGCCAGUUCGAUAA");
		expect(r.resposta).toMatch(/Met.*Pro.*Val.*Arg/);
	});
});

describe("Biologia: populações", () => {
	it("tempo de duplicação a 3,5% ao ano ≈ 19,8 anos", () => {
		expect(Math.log(2) / 0.035).toBeCloseTo(19.8, 1);
		const r = B.crescimento({ modelo: "exp", N0: 100, r: 0.035, t: Math.log(2) / 0.035 });
		expect(r.ok).toBe(true);
		expect(r.valor).toBeCloseTo(200, 6);
	});
});
