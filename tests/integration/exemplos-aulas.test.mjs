/**
 * Contas das aulas: cada exemplo resolvido com resultado numérico é refeito
 * aqui, do zero (ou pelo motor da matéria), e o número tem de aparecer na
 * resposta escrita da aula. Um erro de conta numa aula quebra este teste.
 *
 * Exemplos só conceituais (configurações, equações escritas, interpretação)
 * ficam de fora; os de balanceamento são conferidos átomo por átomo e carga
 * por carga.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";
import { describe, expect, it } from "vitest";
import { Q } from "../helpers/motores.mjs";

const DIR = join(import.meta.dirname, "../../js/estudo/aulas");
const LAB = { estudo: { aulas: {} } };
for (const f of readdirSync(DIR)) vm.runInNewContext(readFileSync(join(DIR, f), "utf8"), { window: { LAB } }, { filename: f });

const SOBRE = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁻": "-" };
const plano = (h) => String(h).replace(/<sup>(.*?)<\/sup>/g, (_m, x) => `^${x}`).replace(/<[^>]+>/g, "").replace(/\s+/g, " ");

/** Todos os números de um texto em pt-BR: "1,2×10²⁴", "20 000", "1/8", "−0,5". */
function numeros(html) {
	return lidos(html).map((x) => x.v);
}

/** Como numeros(), mas com a meia-unidade da última casa escrita (tolerância de arredondamento). */
function lidos(html) {
	const t = plano(html)
		.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g, (s) => `^${[...s].map((c) => SOBRE[c]).join("")}`)
		.replace(/(\d)[  ](?=\d{3}(?!\d))/g, "$1")
		.replace(/(\d),(\d)/g, "$1.$2")
		.replace(/[−–]/g, "-")
		.replace(/(\d)\s*[×x·]\s*10\^(-?\d+)/g, "$1e$2");
	const out = [];
	for (const m of t.matchAll(/(-?\d+(?:\.(\d+))?(?:e(-?\d+))?)(?:\s*\/\s*(\d+(?:\.\d+)?)(?![\d.]))?/g)) {
		const a = Number(m[1]);
		const meia = 0.5 * 10 ** (-(m[2] ? m[2].length : 0) + (m[3] ? Number(m[3]) : 0));
		if (m[4]) out.push({ v: a / Number(m[4]), meia: 0 }, { v: a, meia: 0 }, { v: Number(m[4]), meia: 0 });
		else out.push({ v: a, meia });
	}
	return out;
}

const aula = (id) => {
	const [m, a] = id.split("/");
	return LAB.estudo.aulas[m][a];
};

/** A resposta (e, com `onde: "tudo"`, também os passos) contém cada valor, com tolerância relativa. */
function confere(id, i, valores, { tol = 0.012, onde = "resposta" } = {}) {
	const x = aula(id).exemplos[i];
	const texto = onde === "tudo" ? [x.resposta, ...x.passos].join(" ") : x.resposta;
	const ns = lidos(texto);
	for (const v of valores) {
		// vale se bater com tolerância relativa ou se for o valor arredondado na casa escrita
		const ok = ns.some((n) => Math.abs(n.v - v) <= Math.max(Math.abs(v) * tol, n.meia * (1 + 1e-9)) || (v === 0 && Math.abs(n.v) < 1e-9));
		expect(ok, `${id}#${i}: esperava ${v} em "${plano(x.resposta)}"`).toBe(true);
	}
}

/** Confere a conservação de átomos e de carga de uma equação [coef, fórmula, carga][] → [...]. */
function balanceada(reag, prod) {
	const soma = (lado) => {
		const at = {};
		let carga = 0;
		for (const [k, f, z = 0] of lado) {
			for (const [el, n] of Object.entries(Q.parseFormula(f).contagem)) at[el] = (at[el] || 0) + k * n;
			carga += k * z;
		}
		return { at, carga };
	};
	const a = soma(reag), b = soma(prod);
	expect(a.at).toEqual(b.at);
	expect(a.carga).toBe(b.carga);
}
const coeficientes = (id, i, lista) => {
	const t = plano(aula(id).exemplos[i].resposta).replace(/[₀-₉]/g, (c) => String(c.charCodeAt(0) - 8320));
	for (const s of lista) expect(t, `${id}#${i}`).toContain(s);
};

const R = 8.314, Rat = 0.082057, NA = 6.02214076e23;
const ln2 = Math.log(2);
const reta = (x, y) => {
	const n = x.length, mx = x.reduce((s, v) => s + v) / n, my = y.reduce((s, v) => s + v) / n;
	const sxx = x.reduce((s, v) => s + (v - mx) ** 2, 0);
	const a = x.reduce((s, v, k) => s + (v - mx) * (y[k] - my), 0) / sxx, b = my - a * mx;
	const s = Math.sqrt(y.reduce((t, v, k) => t + (v - a * x[k] - b) ** 2, 0) / (n - 2));
	return { a, b, s, ua: s / Math.sqrt(sxx), ub: s * Math.sqrt(1 / n + mx ** 2 / sxx) };
};
const media = (v) => v.reduce((s, x) => s + x) / v.length;
const dp = (v) => Math.sqrt(v.reduce((s, x) => s + (x - media(v)) ** 2, 0) / (v.length - 1));

describe("leitor de números das respostas", () => {
	it("entende notação científica, milhar com espaço, frações e sinal", () => {
		expect(numeros("≈ 1,2×10²⁴ moléculas")).toContain(1.2e24);
		expect(numeros("cidade de 20 000 kcal")).toContain(20000);
		expect(numeros("P = 9/64 ≈ 14,1%")).toEqual(expect.arrayContaining([9 / 64, 14.1]));
		expect(numeros("sen = −0,5")).toContain(-0.5);
		expect(numeros("R = 8,314 462 618")).toContain(8.314462618);
	});
});

describe("Biologia", () => {
	it("genética", () => {
		confere("biologia/genetica", 0, [1 / 4, 0.5 / 0.75]);
		confere("biologia/genetica", 1, [(1 / 2) * (1 / 4), (1 / 2) * (3 / 4)]);
		confere("biologia/genetica", 2, [2 ** 3, 4 ** 3, (3 / 4) ** 3, (1 / 2) ** 3]);
	});
	it("probabilidade e heredogramas", () => {
		confere("biologia/probabilidade", 0, [(2 / 3) * (1 / 4)]);
		confere("biologia/probabilidade", 1, [1 / 2, 1 / 4]);
		confere("biologia/probabilidade", 2, [3 * (1 / 4) ** 2 * (3 / 4), 100 * 3 * (1 / 4) ** 2 * (3 / 4)]);
	});
	it("Hardy-Weinberg", () => {
		const q = Math.sqrt(1 / 2500), p = 1 - q;
		confere("biologia/hardy", 0, [q, p, 2 * p * q, 2 * p * q * 200000]);
		const pp = (2 * 500 + 300) / 2000, esp = [pp ** 2, 2 * pp * (1 - pp), (1 - pp) ** 2].map((f) => f * 1000);
		const chi = [500, 300, 200].reduce((s, o, k) => s + (o - esp[k]) ** 2 / esp[k], 0);
		confere("biologia/hardy", 1, [pp, chi], { tol: 0.01 });
		const qq = Math.sqrt(0.36), p2 = 1 - qq;
		confere("biologia/hardy", 2, [(100 * 2 * p2 * qq) / (p2 ** 2 + 2 * p2 * qq)]);
	});
	it("DNA e populações", () => {
		confere("biologia/dna", 1, [30, 20]);
		confere("biologia/populacoes", 0, [1000 * Math.exp(0.1 * 12), ln2 / 0.1]);
		confere("biologia/populacoes", 1, [1000 / (1 + 19 * Math.exp(-0.5 * 10)), (0.5 * 1000) / 4, 500]);
		confere("biologia/populacoes", 2, [20000 * 0.1 ** 3, 0.1]);
	});
});

describe("Física", () => {
	it("movimento e forças", () => {
		confere("fisica/movimento", 0, [3 * 6, 0.5 * 3 * 36]);
		confere("fisica/movimento", 1, [25 * 0.8 + 25 ** 2 / (2 * 5), 25 * 0.8]);
		confere("fisica/movimento", 2, [10, 100, 20]);
		confere("fisica/forcas", 0, [(50 - 0.3 * 100) / 10]);
		confere("fisica/forcas", 1, [(100 * 0.6 - 0.5 * 100 * 0.8) / 10]);
		const a = (10 - 0.1 * 40) / 5;
		confere("fisica/forcas", 2, [a, 1 * (10 - a)]);
	});
	it("óptica e ondas", () => {
		const di = 1 / (1 / 10 - 1 / 30);
		confere("fisica/optica", 0, [di, (3 * di) / 30]);
		const d2 = 1 / (1 / 10 - 1 / 5);
		confere("fisica/optica", 1, [Math.abs(d2), -d2 / 5]);
		const f = 1 / (1 / 30 + 1 / 120);
		confere("fisica/optica", 2, [f, 100 / f, (4 * 120) / 30], { tol: 0.015 });
		confere("fisica/ondas", 0, [3e8 / 100e6]);
		const T = 0.0064 * (2 * 0.65 * 82.4) ** 2;
		confere("fisica/ondas", 1, [T, T / 9.8], { tol: 0.02 });
		confere("fisica/ondas", 2, [10 ** ((80 - 60) / 10), (500 * 340) / (340 + 20)]);
	});
	it("termologia", () => {
		confere("fisica/termologia", 0, [((104 - 32) * 5) / 9, 313.15]);
		confere("fisica/termologia", 1, [(200 * 0.11 * 100 + 400 * 20) / (200 * 0.11 + 400)]);
		confere("fisica/termologia", 2, [(200 * 60 - 50 * 0.5 * 10 - 50 * 80) / 250]);
	});
	it("fórmulas, circuitos, lançamento e conversões", () => {
		confere("fisica/formulas", 0, [((200 - 0.2 * 500) / 50) * 5, 36, 0.5 * 2 * 25]);
		confere("fisica/formulas", 1, [Math.sqrt(2 * 10 * 20), Math.sqrt(2 * 10 * 5)]);
		confere("fisica/formulas", 2, [5500 / 220, 220 / 25, 5.5 * 0.25 * 30], { tol: 0.01 });
		confere("fisica/circuitos", 0, [18 / 9, 12, 0.5, 1.5, 6]);
		confere("fisica/circuitos", 1, [6, 3]);
		const r60 = 220 ** 2 / 60, r100 = 220 ** 2 / 100, i = 220 / (r60 + r100);
		confere("fisica/circuitos", 2, [i * i * r60, i * i * r100], { tol: 0.03 });
		const rad = (g) => (g * Math.PI) / 180;
		confere("fisica/lancamento", 0, [(10 ** 2) / 20, 2, (400 * Math.sin(rad(60))) / 10]);
		confere("fisica/lancamento", 1, [3 * 0.5, Math.hypot(3, 5)]);
		confere("fisica/lancamento", 2, [15, 75, (2 * 20 * Math.sin(rad(75))) / 10, (2 * 20 * Math.sin(rad(15))) / 10], { tol: 0.04 });
		confere("fisica/conversor", 0, [108 / 3.6, 60]);
		confere("fisica/conversor", 1, [1000]);
		confere("fisica/conversor", 2, [80 * 365.25 * 86400], { tol: 0.02 });
	});
});

describe("Matemática", () => {
	it("equações, proporção e logaritmos", () => {
		confere("matematica/equacoes", 0, [6]);
		confere("matematica/equacoes", 1, [1, 3]);
		confere("matematica/equacoes", 2, [20, 10]);
		confere("matematica/proporcao", 0, [450 / 12]);
		confere("matematica/proporcao", 1, [(900 / (6 * 5)) * 8 * 3]);
		confere("matematica/proporcao", 2, [200 * 1.25 * 0.8, 200 * 1.2 * 0.75]);
		confere("matematica/log", 0, [Math.log2(64) + Math.log10(0.01)]);
		confere("matematica/log", 1, [20 * Math.log2(1000)], { tol: 0.01 });
		confere("matematica/log", 2, [5730 * Math.log2(10)], { tol: 0.01 });
	});
	it("trigonometria, vetores, cálculo e funções", () => {
		const rad = (g) => (g * Math.PI) / 180;
		confere("matematica/trig", 0, [5 * Math.sin(rad(60)), 5 * Math.cos(rad(60))]);
		confere("matematica/trig", 1, [Math.sin(rad(210)), Math.cos(rad(210)), 3 * rad(210)], { tol: 0.01 });
		confere("matematica/trig", 2, [Math.sqrt(100 + 256 - 2 * 10 * 16 * 0.5)]);
		confere("matematica/vetores", 0, [20 * Math.cos(rad(30)), 20 * Math.sin(rad(30))]);
		confere("matematica/vetores", 1, [5, 80 / 4, 3 * 20]);
		confere("matematica/vetores", 2, [(Math.acos((1 * 2 + 2 * -2 + 2 * 1) / 9) * 180) / Math.PI]);
		confere("matematica/calculo", 0, [2 * Math.sin(1) + Math.cos(1)]);
		confere("matematica/calculo", 1, [5, 5 * (30 - 10) ** 2]);
		confere("matematica/calculo", 2, [2 ** 3, 6 * 2]);
		confere("matematica/funcoes", 0, [2.5 * 12 + 5, (40 - 5) / 2.5]);
		confere("matematica/funcoes", 1, [-1, 5, 2, 9]);
	});
});

describe("Pesquisa", () => {
	it("ajuste de retas", () => {
		const r1 = reta([0.1, 0.2, 0.3, 0.4, 0.5], [1.02, 1.94, 2.98, 3.91, 4.93]);
		confere("pesquisa/ajuste", 0, [r1.a, r1.ua], { tol: 0.03 });
		const t = [0, 10, 20, 30, 40, 50], r2 = reta(t, [1000, 705, 498, 350, 248, 176].map(Math.log));
		confere("pesquisa/ajuste", 1, [r2.a, ln2 / -r2.a], { tol: 0.003 });
		const r3 = reta([0.05, 0.1, 0.15, 0.2, 0.25], [1.1, 2.0, 3.1, 4.0, 5.1]);
		// os números dados no enunciado também têm de bater com os dados
		expect(r3.a).toBeCloseTo(20.0, 1);
		expect(r3.b).toBeCloseTo(0.06, 2);
		expect(r3.s).toBeCloseTo(0.063, 3);
		confere("pesquisa/ajuste", 2, [r3.a * 0.18 + r3.b, r3.a * 1 + r3.b], { tol: 0.005 });
	});
	it("incertezas", () => {
		const rho = 12.5 / 4.6;
		confere("pesquisa/incerteza", 0, [rho, rho * Math.hypot(0.1 / 12.5, 0.2 / 4.6)]);
		const g = (4 * Math.PI ** 2 * 1) / 2.006 ** 2, vT = ((2 * 0.01) / 2.006) ** 2, vL = 0.002 ** 2;
		confere("pesquisa/incerteza", 1, [g, g * Math.sqrt(vT + vL), (100 * vT) / (vT + vL)], { tol: 0.02 });
		const E = 2 * 9.81 * 3;
		confere("pesquisa/incerteza", 2, [E, E * Math.hypot(0.01 / 2, 0.02 / 9.81, 0.05 / 3)], { tol: 0.03 });
	});
	it("algarismos significativos, estatística e constantes", () => {
		confere("pesquisa/sig", 1, [25.4 / (2.5 * 1.2 * 3.05)], { tol: 0.02 });
		confere("pesquisa/sig", 2, [1.25 + 0.37 + 0.0046]);
		const T = [2.01, 1.98, 2.03, 2.0, 1.99, 2.02], ep = dp(T) / Math.sqrt(6);
		confere("pesquisa/estat", 0, [media(T), ep, 2.571 * ep], { tol: 0.05 });
		const G = [9.78, 9.82, 9.8, 9.85, 9.79, 9.81, 9.83, 9.8, 9.81], epg = dp(G) / 3;
		confere("pesquisa/estat", 1, [media(G), 2.306 * epg], { tol: 0.03 });
		confere("pesquisa/estat", 2, [(0.1 / 0.02) ** 2]);
		confere("pesquisa/constantes", 0, [NA * 1.380649e-23], { tol: 1e-6 });
		const Ej = (6.62607015e-34 * 299792458) / 532e-9;
		// "(3,734 ± 0,007) × 10⁻¹⁹ J": a potência vale para o parêntese inteiro
		confere("pesquisa/constantes", 1, [Ej / 1.602176634e-19, Ej / 1e-19], { tol: 0.002 });
		confere("pesquisa/constantes", 2, [0.51e-36, 0.51e-36 / 1.67262192369e-27], { tol: 0.03 });
		confere("pesquisa/tabela", 0, [12.3, 24.6, 37.1]);
	});
});

describe("Química", () => {
	const M = (pares) => pares.reduce((s, [m, n]) => s + m * n, 0);
	it("massa molar, mol e estequiometria", () => {
		confere("quimica/massa", 0, [Q.passosMassaMolar("CO2").valor, M([[12.01, 1], [16, 2]])]);
		confere("quimica/massa", 1, [M([[26.98, 2], [32.07, 3], [16, 12]])], { tol: 0.001 });
		const cu = M([[63.55, 1], [32.07, 1], [16, 9], [1.008, 10]]);
		confere("quimica/massa", 2, [(100 * 5 * 18.016) / cu], { tol: 0.02 });
		confere("quimica/mol", 0, [36 / 18.02, (36 / 18.02) * NA]);
		confere("quimica/mol", 1, [(3.01e23 / NA) * 44.01, (3.01e23 / NA) * 22.4]);
		confere("quimica/mol", 2, [(4.9 / 98.08) * 4 * NA]);
		confere("quimica/estequiometria", 0, [(56 / 28.02) * 2 * 17.03]);
		const o2 = 64 / 32, h2 = 10 / 2.016;
		confere("quimica/estequiometria", 1, [2 * o2 * 18.02, (h2 - 2 * o2) * 2.016]);
		confere("quimica/estequiometria", 2, [((200 * 0.8) / 100.09) * 56.08 * 0.9]);
	});
	it("soluções, pH e gases", () => {
		confere("quimica/solucoes", 0, [4 / 40 / 0.25, 4 / 0.25]);
		confere("quimica/solucoes", 1, [(50 * 2) / 0.5 - 50, (50 * 2) / 0.5]);
		const c = (1190 * 0.37) / 36.46;
		confere("quimica/solucoes", 2, [c, (500 * 1) / c]);
		confere("quimica/ph", 0, [14 + Math.log10(2 * 0.005)]);
		const h = Math.sqrt(1.8e-5 * 0.1);
		confere("quimica/ph", 1, [-Math.log10(h), (100 * h) / 0.1], { tol: 0.03 });
		confere("quimica/ph", 2, [14 + Math.log10(h), 13]);
		confere("quimica/gases", 0, [(2 * 0.082 * 300) / 10]);
		confere("quimica/gases", 1, [((1 * 5) / 300) * (400 / 2)]);
		confere("quimica/gases", 2, [1.3 * 0.082 * 300.15]);
	});
	it("íons, eletroquímica e termoquímica", () => {
		const nPb = 0.05 * 0.1, nI = 0.05 * 0.3;
		confere("quimica/ionica", 2, [nPb * (207.2 + 2 * 126.9), nI - 2 * nPb, (nI - 2 * nPb) / 0.1]);
		confere("quimica/eletroq", 0, [0.8 - 0.34]);
		confere("quimica/eletroq", 1, [1.1 - (0.05916 / 2) * Math.log10(1 / 0.01)]);
		const t = ((6.04 / 107.87) * 96485) / 1.5;
		confere("quimica/eletroq", 2, [t, t / 3600]);
		const dh = 3 * -393.5 + 4 * -285.8 - -103.8;
		confere("quimica/termo", 0, [dh, ((13000 / 44.1) * -dh)], { tol: 0.01 });
		confere("quimica/termo", 1, [-393.5 + 2 * -285.8 - -890.3]);
		confere("quimica/termo", 2, [(-500 * 4.184 * 13 * 46.07) / 1000], { tol: 0.01 });
	});
	it("equilíbrio e cinética", () => {
		const kc = 0.0144 ** 2 / 0.045;
		confere("quimica/equilibrio", 0, [kc, kc * Rat * 298.15]);
		const x = 7 / 9;
		confere("quimica/equilibrio", 1, [2 * x, 1 - x]);
		confere("quimica/equilibrio", 2, [4.74, 4.74 + Math.log10(0.09 / 0.11), 7, 2]);
		confere("quimica/cinetica", 0, [500 / 2 ** 4, 6 * Math.log2(10)]);
		confere("quimica/cinetica", 1, [2.0e-3 / (0.1 ** 2 * 0.1)]);
		confere("quimica/cinetica", 2, [(R * ln2) / (1 / 298.15 - 1 / 308.15) / 1000], { tol: 0.01 });
	});
	it("balanceamentos conservam átomos e carga", () => {
		for (const [i, eq] of [["CH4 + O2 -> CO2 + H2O", 0], ["C2H6 + O2 -> CO2 + H2O", 1], ["Al + O2 -> Al2O3", 2]].map(([e, k]) => [k, e])) {
			const b = Q.balancear(eq);
			const txt = Q.textoEquacao(b).replace(/<[^>]+>/g, "");
			coeficientes("quimica/balancear", i, [txt.replace(/\s+/g, " ").split(" → ")[0].split(" + ")[0]]);
		}
		coeficientes("quimica/balancear", 1, ["2 C2H6 + 7 O2 → 4 CO2 + 6 H2O"]);
		coeficientes("quimica/balancear", 2, ["4 Al + 3 O2 → 2 Al2O3"]);
		balanceada([[1, "MnO4", -1], [8, "H", 1], [5, "Fe", 2]], [[1, "Mn", 2], [5, "Fe", 3], [4, "H2O"]]);
		coeficientes("quimica/redox", 1, ["MnO4⁻ + 8 H⁺ + 5 Fe²⁺ → Mn²⁺ + 5 Fe³⁺ + 4 H2O"]);
		balanceada([[2, "MnO4", -1], [6, "I", -1], [4, "H2O"]], [[2, "MnO2"], [3, "I2"], [8, "OH", -1]]);
		coeficientes("quimica/redox", 2, ["2 MnO4⁻ + 6 I⁻ + 4 H2O → 2 MnO2 + 3 I2 + 8 OH⁻"]);
		// Nox do Cr em K2Cr2O7: 2(+1) + 2x + 7(−2) = 0
		confere("quimica/redox", 0, [(0 - 2 * 1 - 7 * -2) / 2]);
	});
	it("distribuição eletrônica do cloro bate com o motor", () => {
		coeficientes("quimica/eletrons", 0, [Q.passosEletronica(17).resposta.replace(/<[^>]+>/g, "")]);
	});
});
