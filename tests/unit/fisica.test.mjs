import { describe, expect, it } from "vitest";
import { F, F2, textoLimpo } from "../helpers/motores.mjs";

const rad = (g) => (g * Math.PI) / 180;

describe("Física: resolvedor de fórmulas", () => {
	it("toda fórmula é dimensionalmente consistente", () => {
		for (const [id, e] of Object.entries(F.EQ)) {
			if (!e.mono) continue;
			const soma = [0, 0, 0, 0, 0];
			for (const t of e.T) (t.var ? F.dimV(t.var) : t.c.dim).forEach((x, i) => (soma[i] += x * t.e));
			const y = F.U[F.VARS[e.y].dim].v;
			soma.forEach((x, i) => expect(x, `${id}: dimensão ${i}`).toBeCloseTo(y[i], 9));
		}
	});

	it("isolar e substituir devolve o valor original (ida e volta)", () => {
		const sorteia = (v) => v.faixa[0] + Math.random() * (v.faixa[1] - v.faixa[0]);
		const pular = new Set(["bohr", "lorentz", "snell", "torricelli", "mruv-s"]);
		for (const [id, e] of Object.entries(F.EQ)) {
			if (pular.has(id)) continue;
			for (let k = 0; k < 20; k++) {
				const X = {};
				for (const v of e.vars) X[v] = F.paraSI(F.VARS[v].dim, sorteia(F.VARS[v]), F.VARS[v].pref);
				const r0 = e.resolver(e.vars[0], X);
				if (!r0 || !Number.isFinite(r0.v)) continue;
				X[e.vars[0]] = r0.v;
				for (const a of e.vars) {
					const Y = { ...X };
					delete Y[a];
					const r = e.resolver(a, Y);
					if (!r || !Number.isFinite(r.v)) continue;
					expect(Math.abs(r.v - X[a]), `${id} → ${a}`).toBeLessThanOrEqual(1e-6 * Math.abs(X[a]) + 1e-30);
				}
			}
		}
	});

	it("F = m·a com unidades", () => {
		const r = F.resolver("dinamica", { m: { v: 5, u: "kg" }, a: { v: 3, u: "m/s²" } }, "F");
		expect(r.valor).toBeCloseTo(15, 12);
		expect(textoLimpo(r)).toBe(true);
	});

	it("converte km/h para m/s antes de calcular", () => {
		const r = F.resolver("cinematica", { v0: { v: 72, u: "km/h" }, v: { v: 0, u: "m/s" }, t: { v: 5, u: "s" } }, "a");
		expect(r.valor).toBeCloseTo(-4, 9);
	});

	it("lançamento oblíquo a 45° com 20 m/s", () => {
		const r = F.passosLancamento({ v0: 20, th: 45, h0: 0, g: 9.8 });
		expect(r.A).toBeCloseTo(400 / 9.8, 6);
		expect(r.hmax).toBeCloseTo(100 / 9.8, 6);
	});

	it("circuito misto: 2 + (3 | 6) = 4 Ω", () => {
		const r = F.passosCircuito("2 + (3 | 6)");
		expect(r.ok).toBe(true);
		expect(r.valor).toBeCloseTo(4, 9);
	});
});

describe("Física: movimento, forças, óptica, ondas e termologia", () => {
	it("MRUV e inversão de sentido", () => {
		let r = F2.passosMovimento({ s0: 10, v0: 5, a: 2, t: 4 });
		expect(r.s).toBeCloseTo(46);
		expect(r.v).toBeCloseTo(13);
		r = F2.passosMovimento({ s0: 0, v0: 10, a: -2, t: 8 });
		expect(r.s).toBeCloseTo(16);
		expect(r.dist).toBeCloseTo(34);
		expect(r.tinv).toBeCloseTo(5);
	});

	it("encontro de dois móveis", () => {
		const r = F2.passosEncontro({ sA: 0, vA: 20, sB: 300, vB: -10 });
		expect(r.t).toBeCloseTo(10);
		expect(r.s).toBeCloseTo(200);
	});

	it("plano inclinado liso e com atrito", () => {
		expect(F2.passosPlano({ m: 2, th: 30, g: 10 }).a).toBeCloseTo(5, 9);
		const r = F2.passosPlano({ m: 10, th: 37, muE: 0.5, muC: 0.5, g: 10 });
		expect(r.a).toBeCloseTo(10 * (Math.sin(rad(37)) - 0.5 * Math.cos(rad(37))), 9);
		const parado = F2.passosPlano({ m: 5, th: 20, muE: 0.5, muC: 0.4, g: 10 });
		expect(parado.desliza).toBeFalsy();
	});

	it("blocos ligados por fio: a = 4 m/s², T = 12 N", () => {
		const r = F2.passosFio({ mA: 3, mB: 2, g: 10 });
		expect(r.a).toBeCloseTo(4);
		expect(r.T).toBeCloseTo(12);
	});

	it("óptica: espelho côncavo, lupa e lente divergente", () => {
		let r = F2.passosOptica({ tipo: "concavo", f: 10, p: 30, o: 3 });
		expect(r.pi).toBeCloseTo(15);
		expect(r.A).toBeCloseTo(-0.5);
		expect(r.nat).toBe("real, invertida e menor");
		r = F2.passosOptica({ tipo: "convergente", f: 10, p: 5 });
		expect(r.pi).toBeCloseTo(-10);
		expect(r.A).toBeCloseTo(2);
		expect(F2.passosOptica({ tipo: "divergente", f: 20, p: 30 }).pi).toBeCloseTo(-12);
	});

	it("ondas e som", () => {
		expect(F2.passosOnda({ v: 340, f: 170 }).lam).toBeCloseTo(2);
		expect(F2.passosCorda({ Tr: 100, mu: 0.01, L: 0.5, nh: 1 }).f).toBeCloseTo(100);
		expect(F2.passosTubo({ L: 0.85, v: 340, nh: 1, fechado: true }).f).toBeCloseTo(100);
		expect(F2.passosDecibel({ I: 1e-5 }).beta).toBeCloseTo(70);
		expect(F2.passosDoppler({ f: 500, v: 340, vf: 20 }).fl).toBeCloseTo(531.25);
	});

	it("termologia: escalas, curva de aquecimento, misturas e gelo", () => {
		expect(F2.passosEscala({ valor: 98.6, de: "F" }).C).toBeCloseTo(37);
		expect(F2.passosEscala({ valor: -40, de: "C" }).F).toBeCloseTo(-40);
		expect(F2.passosAquecimento({ m: 50, Ti: -20, Tf: 30 }).Qt).toBeCloseTo(6000);
		expect(F2.passosMistura({ corpos: [{ m: 200, c: 1, T: 20 }, { m: 100, c: 1, T: 80 }] }).Te).toBeCloseTo(40);
		const g = F2.passosGelo({ ma: 200, Ta: 60, mg: 50, Tg: 0 });
		expect(g.caso).toBe("tudo");
		expect(g.Te).toBeCloseTo(32);
		expect(F2.passosDilatacao({ X0: 10, alfa: 1.2e-5, dT: 50 }).dX).toBeCloseTo(0.006, 9);
	});

	it.each([
		["tempo zero", () => F2.passosMovimento({ v0: 1, t: 0 })],
		["plano a 90°", () => F2.passosPlano({ m: 1, th: 90 })],
		["μ cinético maior que o estático", () => F2.passosPlano({ m: 1, th: 10, muE: 0.1, muC: 0.3 })],
		["fonte mais rápida que o som", () => F2.passosDoppler({ f: 100, vf: 400 })],
		["harmônico par em tubo fechado", () => F2.passosTubo({ L: 1, nh: 2, fechado: true })],
		["abaixo do zero absoluto", () => F2.passosEscala({ valor: -300, de: "C" })],
	])("recusa entrada impossível: %s", (_nome, fn) => {
		const r = fn();
		expect(r.ok).toBe(false);
		expect(r.erro).toBeTruthy();
	});
});
