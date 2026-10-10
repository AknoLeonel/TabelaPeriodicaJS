/*
 * Motor de física do modo Estudo.
 * Cada fórmula sabe se isolar para qualquer grandeza; o resolvedor encontra a menor
 * cadeia de fórmulas que leva dos dados à incógnita e mostra a conta com unidades.
 * Funções puras (testáveis em Node). Textos em português.
 */
(function (raiz) {
  "use strict";
  const Q = typeof module !== "undefined" && module.exports ? require("./quimica-calc.js") : raiz.QCalc;
  const { num, lerNumero } = Q;
  const PI = Math.PI;
  const config = { g: 9.8, sig: 4 };

  const R = (t, h) => ({ t, h });
  const frac = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
  const eqH = (h) => `<div class="eq">${h}</div>`;
  const item = (nome, h) => `<div class="item"><span class="item-n">${nome}</span>${h}</div>`;
  const un = (u) => (u ? `<span class="un">${u}</span>` : "");
  const n = (x) => num(x, config.sig);
  const par = (x) => (x < 0 ? `(${n(x)})` : n(x));

  // ---------------------------------------------------------------------------
  // Dimensões e unidades. Vetor [L, M, T, I, Θ] = comprimento, massa, tempo, corrente, temperatura
  // ---------------------------------------------------------------------------
  const U = {
    adim: { v: [0, 0, 0, 0, 0], si: "", u: {} },
    comp: { v: [1, 0, 0, 0, 0], si: "m", u: { m: 1, km: 1e3, cm: 1e-2, mm: 1e-3, "µm": 1e-6, nm: 1e-9 } },
    massa: { v: [0, 1, 0, 0, 0], si: "kg", u: { kg: 1, g: 1e-3, mg: 1e-6, t: 1e3 } },
    tempo: { v: [0, 0, 1, 0, 0], si: "s", u: { s: 1, ms: 1e-3, min: 60, h: 3600, dia: 86400, ano: 3.15576e7 } },
    corrente: { v: [0, 0, 0, 1, 0], si: "A", u: { A: 1, mA: 1e-3, "µA": 1e-6 } },
    dtemp: { v: [0, 0, 0, 0, 1], si: "K", u: { K: 1, "°C": 1 } },
    area: { v: [2, 0, 0, 0, 0], si: "m²", u: { "m²": 1, "cm²": 1e-4, "mm²": 1e-6, "km²": 1e6 } },
    vol: { v: [3, 0, 0, 0, 0], si: "m³", u: { "m³": 1, L: 1e-3, mL: 1e-6, "cm³": 1e-6 } },
    vel: { v: [1, 0, -1, 0, 0], si: "m/s", u: { "m/s": 1, "km/h": 1 / 3.6, "cm/s": 1e-2, "km/s": 1e3, c: 299792458 } },
    acel: { v: [1, 0, -2, 0, 0], si: "m/s²", u: { "m/s²": 1, "cm/s²": 1e-2, "km/h²": 1 / 12960 } },
    forca: { v: [1, 1, -2, 0, 0], si: "N", u: { N: 1, mN: 1e-3, kN: 1e3, MN: 1e6, kgf: 9.80665, dyn: 1e-5 } },
    energia: { v: [2, 1, -2, 0, 0], si: "J", u: { J: 1, kJ: 1e3, MJ: 1e6, cal: 4.184, kcal: 4184, Wh: 3600, kWh: 3.6e6, eV: 1.602176634e-19, keV: 1.602176634e-16, MeV: 1.602176634e-13 } },
    torque: { v: [2, 1, -2, 0, 0], si: "N·m", u: { "N·m": 1, "kN·m": 1e3 } },
    pot: { v: [2, 1, -3, 0, 0], si: "W", u: { W: 1, mW: 1e-3, kW: 1e3, MW: 1e6, cv: 735.49875, hp: 745.69987 } },
    pressao: { v: [-1, 1, -2, 0, 0], si: "Pa", u: { Pa: 1, kPa: 1e3, atm: 101325, bar: 1e5, mmHg: 133.322 } },
    freq: { v: [0, 0, -1, 0, 0], si: "Hz", u: { Hz: 1, kHz: 1e3, MHz: 1e6, GHz: 1e9, rpm: 1 / 60 } },
    wang: { v: [0, 0, -1, 0, 0], si: "rad/s", u: { "rad/s": 1, rpm: (2 * PI) / 60 } },
    momento: { v: [1, 1, -1, 0, 0], si: "kg·m/s", u: { "kg·m/s": 1, "N·s": 1, "g·cm/s": 1e-5 } },
    dens: { v: [-3, 1, 0, 0, 0], si: "kg/m³", u: { "kg/m³": 1, "g/cm³": 1e3, "g/L": 1, "g/mL": 1e3 } },
    carga: { v: [0, 0, 1, 1, 0], si: "C", u: { C: 1, mC: 1e-3, "µC": 1e-6, nC: 1e-9, pC: 1e-12, e: 1.602176634e-19 } },
    tensao: { v: [2, 1, -3, -1, 0], si: "V", u: { V: 1, mV: 1e-3, kV: 1e3 } },
    resist: { v: [2, 1, -3, -2, 0], si: "Ω", u: { "Ω": 1, "kΩ": 1e3, "MΩ": 1e6, "mΩ": 1e-3 } },
    capac: { v: [-2, -1, 4, 2, 0], si: "F", u: { F: 1, mF: 1e-3, "µF": 1e-6, nF: 1e-9, pF: 1e-12 } },
    campoE: { v: [1, 1, -3, -1, 0], si: "N/C", u: { "N/C": 1, "V/m": 1, "kN/C": 1e3 } },
    campoB: { v: [0, 1, -2, -1, 0], si: "T", u: { T: 1, mT: 1e-3, "µT": 1e-6, G: 1e-4 } },
    cesp: { v: [2, 0, -2, 0, -1], si: "J/(kg·K)", u: { "J/(kg·K)": 1, "kJ/(kg·K)": 1e3, "cal/(g·°C)": 4184 } },
    clat: { v: [2, 0, -2, 0, 0], si: "J/kg", u: { "J/kg": 1, "kJ/kg": 1e3, "cal/g": 4184 } },
    mola: { v: [0, 1, -2, 0, 0], si: "N/m", u: { "N/m": 1, "N/cm": 100, "kN/m": 1e3 } },
    dilat: { v: [0, 0, 0, 0, -1], si: "1/K", u: { "1/K": 1, "1/°C": 1 } },
    angulo: { v: [0, 0, 0, 0, 0], si: "rad", u: { "°": PI / 180, rad: 1 } },
  };
  const temOffset = (x) => x; // (temperatura absoluta é tratada só no conversor)

  // grandezas: sim = símbolo em HTML, faixa = [mín, máx, casas] usada nos exercícios
  const VARS = {};
  const V = (id, sim, nome, dim, faixa, extra) => { VARS[id] = Object.assign({ id, sim, nome, dim, faixa }, extra); };
  V("Ds", "Δs", "deslocamento", "comp", [20, 400, 0]);
  V("v", "v", "velocidade", "vel", [2, 40, 0]);
  V("v0", "v<sub>0</sub>", "velocidade inicial", "vel", [0, 20, 0]);
  V("a", "a", "aceleração", "acel", [1, 10, 0]);
  V("t", "t", "tempo", "tempo", [2, 20, 0]);
  V("dt", "Δt", "intervalo de tempo", "tempo", [2, 30, 0]);
  V("w", "ω", "velocidade angular", "wang", [1, 20, 0]);
  V("f", "f", "frequência", "freq", [2, 60, 0]);
  V("Per", "T", "período", "tempo", [1, 8, 1]);
  V("Rr", "R", "raio", "comp", [1, 20, 0]);
  V("ac", "a<sub>c</sub>", "aceleração centrípeta", "acel", [2, 30, 0]);
  V("m", "m", "massa", "massa", [1, 50, 0]);
  V("m1", "m<sub>1</sub>", "massa 1", "massa", [10, 500, 0]);
  V("m2", "m<sub>2</sub>", "massa 2", "massa", [10, 500, 0]);
  V("F", "F", "força", "forca", [5, 200, 0]);
  V("Pe", "P", "peso", "forca", [10, 800, 0]);
  V("Fat", "F<sub>at</sub>", "força de atrito", "forca", [2, 100, 0]);
  V("N", "N", "força normal", "forca", [10, 400, 0]);
  V("mu", "μ", "coeficiente de atrito", "adim", [0.1, 0.8, 1]);
  V("g", "g", "aceleração da gravidade", "acel", [9.8, 9.8, 1], { padrao: "g" });
  V("ks", "k", "constante elástica", "mola", [50, 800, 0]);
  V("x", "x", "deformação da mola", "comp", [0.05, 0.5, 2]);
  V("p", "p", "quantidade de movimento", "momento", [5, 200, 0]);
  V("Imp", "I", "impulso", "momento", [5, 200, 0]);
  V("d", "d", "distância", "comp", [1, 100, 0]);
  V("tau", "τ", "torque", "torque", [5, 100, 0]);
  V("W", "W", "trabalho / energia", "energia", [50, 5000, 0]);
  V("th", "θ", "ângulo", "angulo", [20, 70, 0], { pref: "°" });
  V("Ec", "E<sub>c</sub>", "energia cinética", "energia", [50, 5000, 0]);
  V("Ep", "E<sub>p</sub>", "energia potencial gravitacional", "energia", [50, 5000, 0]);
  V("Epe", "E<sub>pe</sub>", "energia potencial elástica", "energia", [5, 500, 0]);
  V("h", "h", "altura", "comp", [1, 50, 0]);
  V("Pot", "P", "potência", "pot", [20, 2000, 0]);
  V("Pu", "P<sub>útil</sub>", "potência útil", "pot", [50, 800, 0]);
  V("Pt", "P<sub>total</sub>", "potência total", "pot", [900, 2000, 0]);
  V("eta", "η", "rendimento (0 a 1)", "adim", [0.2, 0.9, 2]);
  V("rho", "ρ", "densidade", "dens", [500, 3000, 0]);
  V("Vol", "V", "volume", "vol", [0.001, 0.5, 3]);
  V("A", "A", "área", "area", [0.01, 2, 2]);
  V("Pr", "p", "pressão", "pressao", [1000, 200000, 0]);
  V("Emp", "E", "empuxo", "forca", [5, 500, 0]);
  V("Qh", "Q", "quantidade de calor", "energia", [500, 50000, 0]);
  V("ce", "c", "calor específico", "cesp", [400, 4200, 0]);
  V("Lt", "L", "calor latente", "clat", [20000, 340000, 0]);
  V("dT", "ΔT", "variação de temperatura", "dtemp", [5, 80, 0]);
  V("al", "α", "coeficiente de dilatação linear", "dilat", [1e-5, 3e-5, 6]);
  V("L0", "L<sub>0</sub>", "comprimento (repouso/inicial)", "comp", [1, 100, 0]);
  V("dL", "ΔL", "variação de comprimento", "comp", [0.001, 0.05, 3]);
  V("Ls", "L", "comprimento", "comp", [0.2, 5, 1]);
  V("V", "V", "tensão elétrica", "tensao", [3, 220, 0]);
  V("i", "i", "corrente elétrica", "corrente", [0.5, 10, 1]);
  V("Res", "R", "resistência elétrica", "resist", [2, 200, 0]);
  V("Qe", "Q", "carga elétrica", "carga", [1e-6, 1e-3, 6]);
  V("q", "q", "carga elétrica", "carga", [1e-6, 1e-3, 6]);
  V("q1", "q<sub>1</sub>", "carga 1", "carga", [1e-6, 1e-4, 6]);
  V("q2", "q<sub>2</sub>", "carga 2", "carga", [1e-6, 1e-4, 6]);
  V("Ee", "E", "campo elétrico", "campoE", [100, 5000, 0]);
  V("Cap", "C", "capacitância", "capac", [1e-6, 1e-3, 6]);
  V("B", "B", "campo magnético", "campoB", [0.01, 2, 2]);
  V("lam", "λ", "comprimento de onda", "comp", [0.1, 20, 1]);
  V("n", "n", "índice de refração", "adim", [1.1, 2.4, 2]);
  V("n1", "n<sub>1</sub>", "índice de refração 1", "adim", [1, 1.6, 2]);
  V("n2", "n<sub>2</sub>", "índice de refração 2", "adim", [1.2, 2, 2]);
  V("th1", "θ<sub>1</sub>", "ângulo de incidência", "angulo", [10, 60, 0], { pref: "°" });
  V("th2", "θ<sub>2</sub>", "ângulo de refração", "angulo", [10, 60, 0], { pref: "°" });
  V("po", "p", "distância do objeto", "comp", [10, 60, 0]);
  V("pi", "p′", "distância da imagem", "comp", [10, 60, 0]);
  V("fd", "f", "distância focal", "comp", [5, 30, 0]);
  V("En", "E", "energia", "energia", [1, 100, 0]);
  V("phi", "φ", "função trabalho", "energia", [1, 5, 1]);
  V("gam", "γ", "fator de Lorentz", "adim", [1.05, 5, 2]);
  V("dt0", "Δt<sub>0</sub>", "tempo próprio", "tempo", [1, 100, 0]);
  V("nq", "n", "nível de energia", "adim", [1, 6, 0]);
  V("N0", "N<sub>0</sub>", "quantidade inicial", "adim", [1000, 100000, 0]);
  V("Nf", "N", "quantidade restante", "adim", [100, 90000, 0]);
  V("Th", "T<sub>½</sub>", "meia-vida", "tempo", [2, 30, 0]);
  VARS.Emp.faixa = [5, 500, 0];

  // constantes (entram nas fórmulas como números fixos)
  const K = {
    G: { txt: "G", v: 6.674e-11, dim: [3, -1, -2, 0, 0], nome: "constante gravitacional", val: "6,674×10⁻¹¹ N·m²/kg²" },
    KE: { txt: "k", v: 8.9875e9, dim: [3, 1, -4, -2, 0], nome: "constante eletrostática", val: "8,99×10⁹ N·m²/C²" },
    C: { txt: "c", v: 299792458, dim: [1, 0, -1, 0, 0], nome: "velocidade da luz", val: "3,00×10⁸ m/s" },
    H: { txt: "h", v: 6.62607015e-34, dim: [2, 1, -1, 0, 0], nome: "constante de Planck", val: "6,626×10⁻³⁴ J·s" },
    DOIS: { txt: "2", v: 2, dim: [0, 0, 0, 0, 0], nome: "fator 2" },
    DOISPI: { txt: "2π", v: 2 * PI, dim: [0, 0, 0, 0, 0], nome: "2π" },
  };

  // ---------------------------------------------------------------------------
  // Fórmulas
  // ---------------------------------------------------------------------------
  const EQ = {};
  const eqLista = [];
  const dimV = (id) => U[VARS[id].dim].v;

  function itemTxt(s, e) {
    const a = Math.abs(e);
    if (a === 1) return s;
    if (a === 2) return `${s}<sup>2</sup>`;
    if (a === 0.5) return `√(${s})`;
    return `${s}<sup>${a}</sup>`;
  }
  function razao(itens) {
    const nu = itens.filter((i) => i.e > 0), de = itens.filter((i) => i.e < 0);
    const f = (l) => (l.length ? l.map((i) => itemTxt(i.txt, i.e)).join("·") : "1");
    return de.length ? frac(f(nu), f(de)) : f(nu);
  }
  function raiz_(rz, q) {
    if (q === 1) return rz;
    if (q === 2) return `√(${rz})`;
    if (q === 0.5) return `(${rz})<sup>2</sup>`;
    return `(${rz})<sup>${n(1 / q)}</sup>`;
  }

  // y = Π termos^expoente
  function mono(id, nome, y, termos, opts = {}) {
    const T = termos.map(([k, e]) => (typeof k === "string" ? { var: k, e } : { c: k, e }));
    const sim = (v) => VARS[v].sim;
    const vars = [y, ...T.filter((t) => t.var).map((t) => t.var)];
    const txt = (t) => (t.var ? sim(t.var) : t.c.txt);
    const val = (t, Vv) => (t.var ? Vv[t.var] : t.c.v);
    const forma = opts.forma || `${sim(y)} = ${razao(T.map((t) => ({ txt: txt(t), e: t.e })))}`;
    const e = {
      id, nome, forma, vars, y, T, consts: T.filter((t) => t.c).map((t) => t.c), mono: true,
      resolver(alvo, Vv) {
        if (alvo === y) {
          const v = T.reduce((p, t) => p * Math.pow(val(t, Vv), t.e), 1);
          const nume = razao(T.map((t) => ({ txt: Math.abs(t.e) === 1 ? par(val(t, Vv)) : `(${n(val(t, Vv))})`, e: t.e })));
          return { v, iso: forma, sub: `${sim(y)} = ${nume}` };
        }
        const j = T.find((t) => t.var === alvo);
        const outros = T.filter((t) => t !== j);
        const p = j.e;
        const r = Vv[y] * outros.reduce((acc, t) => acc * Math.pow(val(t, Vv), -t.e), 1);
        let v;
        if (p === 1) v = r;
        else if (r < 0) v = NaN;
        else v = Math.pow(r, 1 / p);
        const sgn = p < 0 ? -1 : 1, q = Math.abs(p);
        const simb = [{ txt: sim(y), e: sgn }, ...outros.map((t) => ({ txt: txt(t), e: -t.e * sgn }))];
        const nume = [{ txt: par(Vv[y]), e: sgn }, ...outros.map((t) => ({ txt: Math.abs(t.e) === 1 ? par(val(t, Vv)) : `(${n(val(t, Vv))})`, e: -t.e * sgn }))];
        return { v, iso: `${sim(alvo)} = ${raiz_(razao(simb), q)}`, sub: `${sim(alvo)} = ${raiz_(razao(nume), q)}` };
      },
    };
    EQ[id] = e; eqLista.push(e);
    return e;
  }
  function custom(id, nome, forma, vars, resolver, opts = {}) {
    const e = Object.assign({ id, nome, forma, vars, consts: [], resolver }, opts);
    EQ[id] = e; eqLista.push(e);
    return e;
  }
  const S = (id) => VARS[id].sim;
  const bad = (v) => !isFinite(v);

  // --- Cinemática
  mono("mru", "MRU: deslocamento = velocidade × tempo", "Ds", [["v", 1], ["t", 1]]);
  custom("mruv-v", "MRUV: velocidade em função do tempo", `${S("v")} = ${S("v0")} + ${S("a")}·${S("t")}`, ["v", "v0", "a", "t"], (al, X) => {
    const r = {
      v: () => ({ v: X.v0 + X.a * X.t, iso: `v = v<sub>0</sub> + a·t`, sub: `v = ${par(X.v0)} + ${par(X.a)}·${par(X.t)}` }),
      v0: () => ({ v: X.v - X.a * X.t, iso: `v<sub>0</sub> = v − a·t`, sub: `v<sub>0</sub> = ${par(X.v)} − ${par(X.a)}·${par(X.t)}` }),
      a: () => ({ v: (X.v - X.v0) / X.t, iso: `a = ${frac("v − v<sub>0</sub>", "t")}`, sub: `a = ${frac(`${par(X.v)} − ${par(X.v0)}`, par(X.t))}` }),
      t: () => ({ v: (X.v - X.v0) / X.a, iso: `t = ${frac("v − v<sub>0</sub>", "a")}`, sub: `t = ${frac(`${par(X.v)} − ${par(X.v0)}`, par(X.a))}` }),
    }[al];
    return r();
  });
  custom("mruv-s", "MRUV: deslocamento (função horária)", `Δs = v<sub>0</sub>·t + ${frac("a·t²", "2")}`, ["Ds", "v0", "a", "t"], (al, X) => {
    if (al === "Ds") return { v: X.v0 * X.t + (X.a * X.t * X.t) / 2, iso: `Δs = v<sub>0</sub>·t + ${frac("a·t²", "2")}`, sub: `Δs = ${par(X.v0)}·${par(X.t)} + ${frac(`${par(X.a)}·${par(X.t)}²`, "2")}` };
    if (al === "v0") return { v: (X.Ds - (X.a * X.t * X.t) / 2) / X.t, iso: `v<sub>0</sub> = ${frac("Δs − a·t²/2", "t")}`, sub: `v<sub>0</sub> = ${frac(`${par(X.Ds)} − ${par(X.a)}·${par(X.t)}²/2`, par(X.t))}` };
    if (al === "a") return { v: (2 * (X.Ds - X.v0 * X.t)) / (X.t * X.t), iso: `a = ${frac("2·(Δs − v<sub>0</sub>·t)", "t²")}`, sub: `a = ${frac(`2·(${par(X.Ds)} − ${par(X.v0)}·${par(X.t)})`, `${par(X.t)}²`)}` };
    // t: equação do 2º grau  (a/2) t² + v0 t − Δs = 0
    const A = X.a / 2, B = X.v0, C = -X.Ds;
    let raizes;
    if (Math.abs(A) < 1e-12) raizes = B ? [-C / B] : [];
    else { const D = B * B - 4 * A * C; raizes = D < 0 ? [] : [(-B + Math.sqrt(D)) / (2 * A), (-B - Math.sqrt(D)) / (2 * A)]; }
    const pos = raizes.filter((r) => r >= 0).sort((a, b) => a - b);
    if (!pos.length) return { v: NaN };
    const iso = `Δs = v<sub>0</sub>·t + ${frac("a·t²", "2")} → ${frac("a", "2")}·t² + v<sub>0</sub>·t − Δs = 0 (equação do 2º grau em t)`;
    const D = B * B - 4 * A * C;
    const sub = Math.abs(A) < 1e-12 ? `t = ${frac(par(X.Ds), par(X.v0))}` : `t = ${frac(`−${par(B)} ± √(${par(B)}² − 4·${par(A)}·${par(C)})`, `2·${par(A)}`)} = ${frac(`−${par(B)} ± √${n(D)}`, par(2 * A))}`;
    return { v: pos[0], iso, sub, nota: pos.length > 1 ? `A equação tem duas raízes positivas (${n(pos[0])} e ${n(pos[1])}); usei a primeira. Escolha conforme o enunciado.` : raizes.length > 1 ? `A outra raiz (${n(raizes.find((r) => r !== pos[0]))}) é negativa e não tem sentido físico aqui.` : "" };
  });
  custom("mruv-m", "MRUV: velocidade média = (v₀ + v)/2", `Δs = ${frac(`${S("v0")} + ${S("v")}`, "2")}·${S("t")}`, ["Ds", "v0", "v", "t"], (al, X) => {
    const f = `Δs = ${frac("(v<sub>0</sub> + v)", "2")}·t`;
    if (al === "Ds") return { v: ((X.v0 + X.v) / 2) * X.t, iso: f, sub: `Δs = ${frac(`(${par(X.v0)} + ${par(X.v)})`, "2")}·${par(X.t)}` };
    if (al === "t") return { v: (2 * X.Ds) / (X.v0 + X.v), iso: `t = ${frac("2·Δs", "v<sub>0</sub> + v")}`, sub: `t = ${frac(`2·${par(X.Ds)}`, `${par(X.v0)} + ${par(X.v)}`)}` };
    if (al === "v0") return { v: (2 * X.Ds) / X.t - X.v, iso: `v<sub>0</sub> = ${frac("2·Δs", "t")} − v`, sub: `v<sub>0</sub> = ${frac(`2·${par(X.Ds)}`, par(X.t))} − ${par(X.v)}` };
    return { v: (2 * X.Ds) / X.t - X.v0, iso: `v = ${frac("2·Δs", "t")} − v<sub>0</sub>`, sub: `v = ${frac(`2·${par(X.Ds)}`, par(X.t))} − ${par(X.v0)}` };
  });
  custom("torricelli", "Equação de Torricelli", `${S("v")}² = ${S("v0")}² + 2·${S("a")}·Δs`, ["v", "v0", "a", "Ds"], (al, X) => {
    if (al === "v") { const r = X.v0 * X.v0 + 2 * X.a * X.Ds; return { v: r < 0 ? NaN : Math.sqrt(r), iso: `v = √(v<sub>0</sub>² + 2·a·Δs)`, sub: `v = √(${par(X.v0)}² + 2·${par(X.a)}·${par(X.Ds)})`, nota: "Tomei a raiz positiva; se o móvel anda no sentido negativo da trajetória, o sinal é −." }; }
    if (al === "v0") { const r = X.v * X.v - 2 * X.a * X.Ds; return { v: r < 0 ? NaN : Math.sqrt(r), iso: `v<sub>0</sub> = √(v² − 2·a·Δs)`, sub: `v<sub>0</sub> = √(${par(X.v)}² − 2·${par(X.a)}·${par(X.Ds)})`, nota: "Tomei a raiz positiva." }; }
    if (al === "a") return { v: (X.v * X.v - X.v0 * X.v0) / (2 * X.Ds), iso: `a = ${frac("v² − v<sub>0</sub>²", "2·Δs")}`, sub: `a = ${frac(`${par(X.v)}² − ${par(X.v0)}²`, `2·${par(X.Ds)}`)}` };
    return { v: (X.v * X.v - X.v0 * X.v0) / (2 * X.a), iso: `Δs = ${frac("v² − v<sub>0</sub>²", "2·a")}`, sub: `Δs = ${frac(`${par(X.v)}² − ${par(X.v0)}²`, `2·${par(X.a)}`)}` };
  });
  mono("acp", "Aceleração centrípeta", "ac", [["v", 2], ["Rr", -1]]);
  mono("vw", "Velocidade linear e angular", "v", [["w", 1], ["Rr", 1]]);
  mono("w2pif", "Velocidade angular e frequência", "w", [[K.DOISPI, 1], ["f", 1]]);
  mono("fT", "Frequência e período", "f", [["Per", -1]]);

  // --- Dinâmica
  mono("n2", "2ª lei de Newton", "F", [["m", 1], ["a", 1]]);
  mono("peso", "Peso", "Pe", [["m", 1], ["g", 1]]);
  mono("atrito", "Força de atrito", "Fat", [["mu", 1], ["N", 1]]);
  mono("hooke", "Lei de Hooke", "F", [["ks", 1], ["x", 1]]);
  mono("qm", "Quantidade de movimento", "p", [["m", 1], ["v", 1]]);
  mono("imp", "Impulso de uma força", "Imp", [["F", 1], ["dt", 1]]);
  mono("fcp", "Força centrípeta", "F", [["m", 1], ["v", 2], ["Rr", -1]]);
  mono("grav", "Gravitação universal", "F", [[K.G, 1], ["m1", 1], ["m2", 1], ["d", -2]]);
  mono("torque", "Torque (força perpendicular)", "tau", [["F", 1], ["d", 1]]);

  // --- Energia
  custom("wcos", "Trabalho de uma força", `W = F·d·cos θ`, ["W", "F", "d", "th"], (al, X) => {
    if (al === "W") return { v: X.F * X.d * Math.cos(X.th), iso: `W = F·d·cos θ`, sub: `W = ${par(X.F)}·${par(X.d)}·cos(${n((X.th * 180) / PI)}°)` };
    if (al === "F") return { v: X.W / (X.d * Math.cos(X.th)), iso: `F = ${frac("W", "d·cos θ")}`, sub: `F = ${frac(par(X.W), `${par(X.d)}·cos(${n((X.th * 180) / PI)}°)`)}` };
    if (al === "d") return { v: X.W / (X.F * Math.cos(X.th)), iso: `d = ${frac("W", "F·cos θ")}`, sub: `d = ${frac(par(X.W), `${par(X.F)}·cos(${n((X.th * 180) / PI)}°)`)}` };
    const c = X.W / (X.F * X.d);
    return { v: Math.abs(c) > 1 ? NaN : Math.acos(c), iso: `cos θ = ${frac("W", "F·d")} → θ = arccos(${frac("W", "F·d")})`, sub: `θ = arccos(${frac(par(X.W), `${par(X.F)}·${par(X.d)}`)}) = arccos(${n(c)})` };
  });
  mono("ec", "Energia cinética", "Ec", [["m", 1], ["v", 2], [K.DOIS, -1]]);
  mono("ep", "Energia potencial gravitacional", "Ep", [["m", 1], ["g", 1], ["h", 1]]);
  mono("epe", "Energia potencial elástica", "Epe", [["ks", 1], ["x", 2], [K.DOIS, -1]]);
  mono("pot", "Potência média", "Pot", [["W", 1], ["dt", -1]]);
  mono("potfv", "Potência de uma força", "Pot", [["F", 1], ["v", 1]]);
  mono("rend", "Rendimento", "eta", [["Pu", 1], ["Pt", -1]]);

  // --- Fluidos e calor
  mono("dens", "Densidade", "rho", [["m", 1], ["Vol", -1]]);
  mono("pres", "Pressão", "Pr", [["F", 1], ["A", -1]]);
  mono("stevin", "Pressão hidrostática (Stevin)", "Pr", [["rho", 1], ["g", 1], ["h", 1]]);
  mono("emp", "Empuxo (Arquimedes)", "Emp", [["rho", 1], ["Vol", 1], ["g", 1]]);
  mono("calsens", "Calor sensível", "Qh", [["m", 1], ["ce", 1], ["dT", 1]]);
  mono("callat", "Calor latente", "Qh", [["m", 1], ["Lt", 1]]);
  mono("dilat", "Dilatação linear", "dL", [["al", 1], ["L0", 1], ["dT", 1]]);

  // --- Eletricidade e magnetismo
  mono("ohm", "1ª lei de Ohm", "V", [["Res", 1], ["i", 1]]);
  mono("potel", "Potência elétrica", "Pot", [["V", 1], ["i", 1]]);
  mono("joule", "Potência dissipada num resistor", "Pot", [["Res", 1], ["i", 2]]);
  mono("potv", "Potência e tensão", "Pot", [["V", 2], ["Res", -1]]);
  mono("carga", "Carga e corrente", "Qe", [["i", 1], ["dt", 1]]);
  mono("energel", "Energia consumida", "W", [["Pot", 1], ["dt", 1]]);
  mono("coulomb", "Lei de Coulomb (módulos)", "F", [[K.KE, 1], ["q1", 1], ["q2", 1], ["d", -2]]);
  mono("campo", "Força num campo elétrico", "F", [["q", 1], ["Ee", 1]]);
  mono("campop", "Campo de uma carga puntiforme", "Ee", [[K.KE, 1], ["Qe", 1], ["d", -2]]);
  mono("cap", "Capacitor", "Qe", [["Cap", 1], ["V", 1]]);
  mono("fmag", "Força magnética (v ⊥ B)", "F", [["q", 1], ["v", 1], ["B", 1]]);
  mono("fmagfio", "Força magnética num fio (⊥ B)", "F", [["B", 1], ["i", 1], ["d", 1]]);

  // --- Ondas e óptica
  mono("ondulat", "Equação fundamental da ondulatória", "v", [["lam", 1], ["f", 1]]);
  mono("nluz", "Índice de refração", "n", [[K.C, 1], ["v", -1]]);
  custom("snell", "Lei de Snell", `n<sub>1</sub>·sen θ<sub>1</sub> = n<sub>2</sub>·sen θ<sub>2</sub>`, ["n1", "th1", "n2", "th2"], (al, X) => {
    const s1 = Math.sin(X.th1), s2 = Math.sin(X.th2);
    const d = (a) => `${n((a * 180) / PI)}°`;
    if (al === "n1") return { v: (X.n2 * s2) / s1, iso: `n<sub>1</sub> = ${frac("n<sub>2</sub>·sen θ<sub>2</sub>", "sen θ<sub>1</sub>")}`, sub: `n<sub>1</sub> = ${frac(`${par(X.n2)}·sen(${d(X.th2)})`, `sen(${d(X.th1)})`)}` };
    if (al === "n2") return { v: (X.n1 * s1) / s2, iso: `n<sub>2</sub> = ${frac("n<sub>1</sub>·sen θ<sub>1</sub>", "sen θ<sub>2</sub>")}`, sub: `n<sub>2</sub> = ${frac(`${par(X.n1)}·sen(${d(X.th1)})`, `sen(${d(X.th2)})`)}` };
    if (al === "th2") { const s = (X.n1 * s1) / X.n2; return { v: Math.abs(s) > 1 ? NaN : Math.asin(s), iso: `sen θ<sub>2</sub> = ${frac("n<sub>1</sub>·sen θ<sub>1</sub>", "n<sub>2</sub>")}`, sub: `sen θ<sub>2</sub> = ${frac(`${par(X.n1)}·sen(${d(X.th1)})`, par(X.n2))} = ${n(s)}`, nota: Math.abs(s) > 1 ? "Seno maior que 1: há reflexão total, não há raio refratado." : "" }; }
    const s = (X.n2 * s2) / X.n1;
    return { v: Math.abs(s) > 1 ? NaN : Math.asin(s), iso: `sen θ<sub>1</sub> = ${frac("n<sub>2</sub>·sen θ<sub>2</sub>", "n<sub>1</sub>")}`, sub: `sen θ<sub>1</sub> = ${frac(`${par(X.n2)}·sen(${d(X.th2)})`, par(X.n1))} = ${n(s)}` };
  });
  custom("lente", "Equação de Gauss (lentes e espelhos)", `${frac("1", "f")} = ${frac("1", "p")} + ${frac("1", "p′")}`, ["fd", "po", "pi"], (al, X) => {
    if (al === "fd") return { v: 1 / (1 / X.po + 1 / X.pi), iso: `${frac("1", "f")} = ${frac("1", "p")} + ${frac("1", "p′")}`, sub: `${frac("1", "f")} = ${frac("1", par(X.po))} + ${frac("1", par(X.pi))}`, nota: "No fim, f = 1 ÷ (soma das frações)." };
    if (al === "po") return { v: 1 / (1 / X.fd - 1 / X.pi), iso: `${frac("1", "p")} = ${frac("1", "f")} − ${frac("1", "p′")}`, sub: `${frac("1", "p")} = ${frac("1", par(X.fd))} − ${frac("1", par(X.pi))}`, nota: "No fim, p = 1 ÷ (resultado da subtração)." };
    return { v: 1 / (1 / X.fd - 1 / X.po), iso: `${frac("1", "p′")} = ${frac("1", "f")} − ${frac("1", "p")}`, sub: `${frac("1", "p′")} = ${frac("1", par(X.fd))} − ${frac("1", par(X.po))}`, nota: "No fim, p′ = 1 ÷ (resultado da subtração)." };
  });
  mono("pend", "Período do pêndulo simples", "Per", [[K.DOISPI, 1], ["Ls", 0.5], ["g", -0.5]], { forma: `T = 2π·√(${frac("L", "g")})` });
  mono("massamola", "Período do sistema massa-mola", "Per", [[K.DOISPI, 1], ["m", 0.5], ["ks", -0.5]], { forma: `T = 2π·√(${frac("m", "k")})` });

  // --- Física moderna
  mono("emc", "Equivalência massa-energia", "En", [["m", 1], [K.C, 2]]);
  mono("planck", "Energia do fóton", "En", [[K.H, 1], ["f", 1]]);
  mono("fotonl", "Energia do fóton (por λ)", "En", [[K.H, 1], [K.C, 1], ["lam", -1]]);
  mono("broglie", "Comprimento de onda de de Broglie", "lam", [[K.H, 1], ["p", -1]]);
  custom("efot", "Efeito fotoelétrico", `E<sub>c</sub> = E − φ`, ["Ec", "En", "phi"], (al, X) => {
    if (al === "Ec") return { v: X.En - X.phi, iso: `E<sub>c</sub> = E − φ`, sub: `E<sub>c</sub> = ${par(X.En)} − ${par(X.phi)}`, nota: X.En < X.phi ? "Energia do fóton menor que φ: nenhum elétron é emitido." : "" };
    if (al === "En") return { v: X.Ec + X.phi, iso: `E = E<sub>c</sub> + φ`, sub: `E = ${par(X.Ec)} + ${par(X.phi)}` };
    return { v: X.En - X.Ec, iso: `φ = E − E<sub>c</sub>`, sub: `φ = ${par(X.En)} − ${par(X.Ec)}` };
  });
  const EV = 1.602176634e-19;
  custom("bohr", "Níveis de energia do hidrogênio (Bohr)", `E<sub>n</sub> = − ${frac("13,6 eV", "n²")}`, ["En", "nq"], (al, X) => {
    if (al === "En") return { v: (-13.6 * EV) / (X.nq * X.nq), iso: `E<sub>n</sub> = −${frac("13,6 eV", "n²")}`, sub: `E<sub>n</sub> = −${frac("13,6 eV", `${par(X.nq)}²`)}` };
    if (X.En >= 0) return { v: NaN };
    return { v: Math.sqrt((13.6 * EV) / -X.En), iso: `n = √(${frac("13,6 eV", "|E<sub>n</sub>|")})`, sub: `n = √(${frac("13,6 eV", `${n(-X.En / EV)} eV`)})` };
  }, { nota: "Vale para átomos de um elétron (H, He⁺ com Z = 1)." });
  custom("lorentz", "Fator de Lorentz", `γ = ${frac("1", `√(1 − v²/c²)`)}`, ["gam", "v"], (al, X) => {
    const c = K.C.v;
    if (al === "gam") { const b = X.v / c; return b >= 1 ? { v: NaN } : { v: 1 / Math.sqrt(1 - b * b), iso: `γ = ${frac("1", "√(1 − v²/c²)")}`, sub: `γ = ${frac("1", `√(1 − (${n(X.v)}/${n(c)})²)`)} = ${frac("1", `√(1 − ${n(b * b)})`)}` }; }
    return X.gam < 1 ? { v: NaN } : { v: c * Math.sqrt(1 - 1 / (X.gam * X.gam)), iso: `v = c·√(1 − ${frac("1", "γ²")})`, sub: `v = ${n(c)}·√(1 − ${frac("1", `${par(X.gam)}²`)})` };
  }, { consts: [K.C] });
  mono("dilt", "Dilatação do tempo", "dt", [["gam", 1], ["dt0", 1]]);
  mono("contr", "Contração do comprimento", "Ls", [["L0", 1], ["gam", -1]]);
  custom("ecrel", "Energia cinética relativística", `E<sub>c</sub> = (γ − 1)·m·c²`, ["Ec", "gam", "m"], (al, X) => {
    const c2 = K.C.v * K.C.v;
    if (al === "Ec") return { v: (X.gam - 1) * X.m * c2, iso: `E<sub>c</sub> = (γ − 1)·m·c²`, sub: `E<sub>c</sub> = (${par(X.gam)} − 1)·${par(X.m)}·(${n(K.C.v)})²` };
    if (al === "gam") return { v: 1 + X.Ec / (X.m * c2), iso: `γ = 1 + ${frac("E<sub>c</sub>", "m·c²")}`, sub: `γ = 1 + ${frac(par(X.Ec), `${par(X.m)}·(${n(K.C.v)})²`)}` };
    return { v: X.Ec / ((X.gam - 1) * c2), iso: `m = ${frac("E<sub>c</sub>", "(γ − 1)·c²")}`, sub: `m = ${frac(par(X.Ec), `(${par(X.gam)} − 1)·(${n(K.C.v)})²`)}` };
  }, { consts: [K.C] });
  custom("decay", "Decaimento radioativo", `N = N<sub>0</sub>·2<sup>−t/T<sub>½</sub></sup>`, ["Nf", "N0", "t", "Th"], (al, X) => {
    if (al === "Nf") return { v: X.N0 * Math.pow(2, -X.t / X.Th), iso: `N = N<sub>0</sub>·2<sup>−t/T<sub>½</sub></sup>`, sub: `N = ${par(X.N0)}·2<sup>−${n(X.t)}/${n(X.Th)}</sup>` };
    if (al === "N0") return { v: X.Nf * Math.pow(2, X.t / X.Th), iso: `N<sub>0</sub> = N·2<sup>t/T<sub>½</sub></sup>`, sub: `N<sub>0</sub> = ${par(X.Nf)}·2<sup>${n(X.t)}/${n(X.Th)}</sup>` };
    const lg = Math.log2(X.N0 / X.Nf);
    if (al === "t") return { v: X.Th * lg, iso: `t = T<sub>½</sub>·log<sub>2</sub>(${frac("N<sub>0</sub>", "N")})`, sub: `t = ${par(X.Th)}·log<sub>2</sub>(${frac(par(X.N0), par(X.Nf))}) = ${par(X.Th)}·${n(lg)}` };
    return { v: X.t / lg, iso: `T<sub>½</sub> = ${frac("t", `log<sub>2</sub>(N<sub>0</sub>/N)`)}`, sub: `T<sub>½</sub> = ${frac(par(X.t), `log<sub>2</sub>(${frac(par(X.N0), par(X.Nf))}) = ${n(lg)}`)}` };
  });

  const TOPICOS = [
    { id: "cinematica", nome: "Cinemática", eqs: ["mru", "mruv-v", "mruv-s", "mruv-m", "torricelli", "acp", "vw", "w2pif", "fT"], dica: "Queda livre e lançamento vertical: use a = g (descendo) ou a = −g (subindo)." },
    { id: "dinamica", nome: "Dinâmica", eqs: ["n2", "peso", "atrito", "hooke", "qm", "imp", "fcp", "grav", "torque"] },
    { id: "energia", nome: "Energia", eqs: ["wcos", "ec", "ep", "epe", "pot", "potfv", "rend"] },
    { id: "fluidos", nome: "Calor e fluidos", eqs: ["dens", "pres", "stevin", "emp", "calsens", "callat", "dilat"], dica: "Variações de temperatura: 1 °C de variação = 1 K de variação." },
    { id: "eletro", nome: "Eletricidade", eqs: ["ohm", "potel", "joule", "potv", "carga", "energel", "coulomb", "campo", "campop", "cap", "fmag", "fmagfio"], dica: "Use apenas os módulos das cargas; o sinal indica atração ou repulsão." },
    { id: "ondas", nome: "Ondas e óptica", eqs: ["ondulat", "fT", "nluz", "snell", "lente", "pend", "massamola"] },
    { id: "moderna", nome: "Física moderna", eqs: ["emc", "planck", "fotonl", "broglie", "efot", "bohr", "lorentz", "dilt", "contr", "ecrel", "decay"] },
  ];
  for (const tp of TOPICOS) {
    tp.equacoes = tp.eqs.map((i) => EQ[i]);
    tp.vars = [];
    for (const e of tp.equacoes) for (const v of e.vars) if (!tp.vars.includes(v)) tp.vars.push(v);
  }

  // ---------------------------------------------------------------------------
  // Conversão e formatação
  // ---------------------------------------------------------------------------
  const fator = (dim, u) => (u && U[dim].u[u] != null ? U[dim].u[u] : 1);
  const paraSI = (dim, valor, u) => valor * fator(dim, u);
  const deSI = (dim, valor, u) => valor / fator(dim, u);
  const unSI = (id) => U[VARS[id].dim].si;

  const SUPN = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  const supInt = (k) => String(Math.abs(k)).split("").map((c) => SUPN[+c]).join("");
  const BASE = ["m", "kg", "s", "A", "K"];
  function dimTxt(vec) {
    const pos = [], neg = [];
    vec.forEach((e, i) => { if (e > 0) pos.push(BASE[i] + (e > 1 ? supInt(e) : "")); else if (e < 0) neg.push(BASE[i] + (e < -1 ? supInt(e) : "")); });
    if (!pos.length && !neg.length) return "(sem unidade)";
    if (!neg.length) return pos.join("·");
    return (pos.length ? pos.join("·") : "1") + "/" + neg.join("·");
  }

  // ---------------------------------------------------------------------------
  // Resolvedor
  // ---------------------------------------------------------------------------
  function planejar(eqs, conhecidos, alvo) {
    const key = (o) => Object.keys(o).sort().join();
    const vistos = new Set([key(conhecidos)]);
    let fila = [{ V: { ...conhecidos }, seq: [] }];
    while (fila.length) {
      const prox = [];
      for (const s of fila) {
        if (alvo in s.V) return s.seq;
        if (s.seq.length >= 5) continue;
        for (const e of eqs) {
          const falta = e.vars.filter((v) => !(v in s.V));
          if (falta.length !== 1) continue;
          const u = falta[0];
          const r = e.resolver(u, s.V);
          if (!r || bad(r.v)) continue;
          const Vn = { ...s.V, [u]: r.v };
          const k = key(Vn);
          if (vistos.has(k)) continue;
          vistos.add(k);
          prox.push({ V: Vn, seq: [...s.seq, { eq: e, u, res: r }] });
        }
      }
      fila = prox;
    }
    return null;
  }
  function planejarComAlvo(eqs, conhecidos, alvo) {
    if (alvo in conhecidos) return [];
    return planejar(eqs, conhecidos, alvo);
  }

  const simU = (id, u) => `${VARS[id].sim}`;
  // dados: { id: { v: número digitado, u: unidade } }
  function resolver(topicoId, dados, alvo, uSaida) {
    const tp = TOPICOS.find((x) => x.id === topicoId);
    if (!tp) return { ok: false, erro: "Escolha um assunto." };
    if (!alvo || !VARS[alvo]) return { ok: false, erro: "Escolha o que você quer descobrir." };
    const ids = Object.keys(dados).filter((k) => k !== alvo && dados[k] && isFinite(dados[k].v));
    if (!ids.length) return { ok: false, erro: "Preencha os dados do problema (pelo menos um valor)." };
    const dado = {}, conv = [], linhas = [];
    for (const id of ids) {
      const d = dados[id], dim = VARS[id].dim, f = fator(dim, d.u);
      const si = d.v * f;
      dado[id] = si;
      linhas.push(item(`${VARS[id].sim}`, `${n(d.v)} ${un(d.u || "")} <small class="dica">(${VARS[id].nome})</small>`));
      if (d.u && d.u !== U[dim].si) conv.push(`${VARS[id].sim}: ${n(d.v)} ${d.u} = ${n(d.v)} × ${n(f)} = <b>${n(si)}</b> ${U[dim].si}`);
    }
    const plano = planejarComAlvo(tp.equacoes, dado, alvo);
    if (!plano) {
      // dica do que falta
      let melhor = null;
      for (const e of tp.equacoes) if (e.vars.includes(alvo)) {
        const falta = e.vars.filter((v) => v !== alvo && !(v in dado));
        if (!melhor || falta.length < melhor.falta.length) melhor = { e, falta };
      }
      if (!melhor) return { ok: false, erro: `Neste assunto não há fórmula com ${VARS[alvo].nome}. Troque o assunto.` };
      return { ok: false, erro: `Com esses dados não dá para achar ${VARS[alvo].nome}. A fórmula “${melhor.e.nome}” ainda precisa de: ${melhor.falta.map((v) => `<b>${VARS[v].sim}</b> (${VARS[v].nome})`).join(", ") || "—"}. Se algum valor falhou (divisão por zero, raiz de número negativo), confira os dados.` };
    }
    const passos = [];
    passos.push(R("Organize os dados", `<div class="lista-itens">${linhas.join("")}</div>${item("Pede-se", `<b>${VARS[alvo].sim}</b> <small class="dica">(${VARS[alvo].nome})</small>`)}`));
    passos.push(R("Converta tudo para o SI", conv.length ? `<p>Fórmulas da física esperam unidades do Sistema Internacional (m, kg, s, N, J...). Convertendo:</p><div class="lista-itens">${conv.map((c) => `<div class="item">${c}</div>`).join("")}</div>` : `<p>Todos os dados já estão no SI. ✓</p>`));
    const constantes = [];
    plano.forEach((p, idx) => {
      const lbl = plano.length > 1 ? `${idx + 1}ª fórmula` : "Fórmula";
      for (const c of p.eq.consts || []) if (!constantes.includes(c)) constantes.push(c);
      let hIso = eqH(p.eq.forma);
      const sabidas = p.eq.vars.filter((v) => v !== p.u);
      hIso += `<p>${idx === plano.length - 1 ? "Ela contém o que você quer descobrir" : `Ainda falta ${VARS[p.u].sim} para chegar na resposta; esta fórmula o relaciona com dados que você tem`}: ${p.u === alvo ? "" : ""}(${sabidas.map((v) => `<b>${VARS[v].sim}</b>`).join(", ") || "—"} conhecidos).</p>`;
      hIso += `<p>Isole <b>${VARS[p.u].sim}</b>:</p>${eqH(p.res.iso)}`;
      if (p.res.nota && p.res.nota.startsWith("No fim")) hIso += `<small class="dica">${p.res.nota}</small>`;
      passos.push(R(`${lbl}: ${p.eq.nome}`, hIso));
      const un_ = unSI(p.u);
      let hSub = `<p>Substitua os valores (já em unidades do SI):</p>${eqH(p.res.sub)}<p>Resultado: ${eqH(`<b>${VARS[p.u].sim} = ${n(p.res.v)}</b> ${un(un_)}`)}</p>`;
      if (p.res.nota && !p.res.nota.startsWith("No fim")) hSub += `<p class="aviso-exc"><b>Atenção:</b> ${p.res.nota}</p>`;
      passos.push(R(plano.length > 1 ? `Calcule ${VARS[p.u].sim}` : "Substitua e calcule", hSub));
    });
    if (constantes.length) passos.splice(2, 0, R("Constantes usadas", `<div class="lista-itens">${constantes.map((c) => item(c.txt, `${c.val || n(c.v)} <small class="dica">(${c.nome})</small>`)).join("")}</div>`));
    const dimA = VARS[alvo].dim;
    let valorSI = alvo in dado ? dado[alvo] : null;
    const ult = plano[plano.length - 1];
    valorSI = ult ? ult.res.v : dado[alvo];
    let uOut = uSaida && U[dimA].u[uSaida] != null ? uSaida : (VARS[alvo].pref || U[dimA].si);
    const valorOut = deSI(dimA, valorSI, uOut);
    if (uOut !== U[dimA].si) passos.push(R("Converta para a unidade pedida", `<p>${VARS[alvo].sim} = ${n(valorSI)} ${U[dimA].si} = ${n(valorSI)} ÷ ${n(fator(dimA, uOut))} = <b>${n(valorOut)}</b> ${uOut}</p>`));
    // conferência dimensional
    let conf = `<p>Unidade esperada para ${VARS[alvo].nome}: <b>${U[dimA].si || "sem unidade"}</b> = ${dimTxt(U[dimA].v)} em unidades base.</p>`;
    if (ult && ult.eq.mono && ult.u === alvo) {
      const e = ult.eq;
      const termos = e.T.map((t) => ({ vec: t.var ? dimV(t.var) : t.c.dim, e: t.e, nome: t.var ? VARS[t.var].sim : t.c.txt, un: t.var ? (U[VARS[t.var].dim].si || "1") : (t.c.txt === "2" || t.c.txt === "2π" ? "" : "") }));
      const soma = [0, 0, 0, 0, 0];
      termos.forEach((t) => t.vec.forEach((x, i) => { soma[i] += x * t.e; }));
      const ok = soma.every((x, i) => Math.abs(x - U[dimA].v[i]) < 1e-9);
      conf += `<p>Os fatores da fórmula, em unidades base, multiplicam para <b>${dimTxt(soma)}</b>${ok ? " — a mesma unidade, então a fórmula está dimensionalmente coerente ✓" : ""}.</p>`;
    }
    conf += `<small class="dica">Dica: se o resultado tiver outra unidade ou ordem de grandeza absurda (uma pessoa pesando 7 toneladas...), revise as conversões.</small>`;
    passos.push(R("Confira as unidades e o bom senso", conf));
    return {
      ok: true, passos, valor: valorOut, valorSI, unidade: uOut, alvo,
      resposta: `${VARS[alvo].sim.replace(/<[^>]+>/g, "")} = ${n(valorOut)} ${uOut}`,
      respostaHTML: `${VARS[alvo].sim} = <b>${n(valorOut)}</b> ${un(uOut)}` + (uOut !== U[dimA].si ? ` <small class="dica">(= ${n(valorSI)} ${U[dimA].si})</small>` : ""),
    };
  }

  // ---------------------------------------------------------------------------
  // Conversor de unidades
  // ---------------------------------------------------------------------------
  const TEMP = ["K", "°C", "°F"];
  function paraK(v, u) { return u === "K" ? v : u === "°C" ? v + 273.15 : ((v - 32) * 5) / 9 + 273.15; }
  function deK(k, u) { return u === "K" ? k : u === "°C" ? k - 273.15 : ((k - 273.15) * 9) / 5 + 32; }
  const CONV_DIMS = Object.keys(U).filter((k) => Object.keys(U[k].u).length > 1 && k !== "angulo");
  const NOME_DIM = { comp: "Comprimento", massa: "Massa", tempo: "Tempo", corrente: "Corrente", dtemp: "Variação de temperatura", area: "Área", vol: "Volume", vel: "Velocidade", acel: "Aceleração", forca: "Força", energia: "Energia", torque: "Torque", pot: "Potência", pressao: "Pressão", freq: "Frequência", wang: "Vel. angular", momento: "Q. de movimento", dens: "Densidade", carga: "Carga", tensao: "Tensão", resist: "Resistência", capac: "Capacitância", campoE: "Campo elétrico", campoB: "Campo magnético", cesp: "Calor específico", clat: "Calor latente", mola: "Const. elástica", dilat: "Dilatação" };
  function passosConversao(dim, valor, de, para) {
    if (!isFinite(valor)) return { ok: false, erro: "Digite um número." };
    if (dim === "temp") {
      const k = paraK(valor, de), r = deK(k, para);
      if (k < 0) return { ok: false, erro: "Abaixo do zero absoluto (0 K = −273,15 °C): essa temperatura não existe." };
      const passos = [];
      if (de === para) passos.push(R("Mesma unidade", `<p>Nada a converter.</p>`));
      else {
        const f1 = de === "K" ? `${n(valor)} K` : de === "°C" ? `T(K) = T(°C) + 273,15 = ${n(valor)} + 273,15 = <b>${n(k)}</b> K` : `T(K) = (T(°F) − 32)·5/9 + 273,15 = (${n(valor)} − 32)·5/9 + 273,15 = <b>${n(k)}</b> K`;
        passos.push(R("Passe para kelvin (escala absoluta)", `<p>${f1}</p>`));
        const f2 = para === "K" ? `Já está em kelvin.` : para === "°C" ? `T(°C) = T(K) − 273,15 = ${n(k)} − 273,15 = <b>${n(r)}</b> °C` : `T(°F) = (T(K) − 273,15)·9/5 + 32 = (${n(k)} − 273,15)·9/5 + 32 = <b>${n(r)}</b> °F`;
        passos.push(R(`Passe de kelvin para ${para}`, `<p>${f2}</p>`));
      }
      return { ok: true, passos, valor: r, unidade: para, resposta: `${n(r)} ${para}`, respostaHTML: `${n(valor)} ${de} = <b>${n(r)}</b> ${un(para)}` };
    }
    const u = U[dim].u, f1 = u[de], f2 = u[para];
    if (f1 == null || f2 == null) return { ok: false, erro: "Escolha as unidades." };
    const si = valor * f1, r = si / f2;
    const passos = [];
    passos.push(R("Relacione cada unidade com a do SI", `<div class="lista-itens">${item(`1 ${de}`, `= ${n(f1)} ${U[dim].si}`)}${item(`1 ${para}`, `= ${n(f2)} ${U[dim].si}`)}</div>`));
    if (de === para) passos.push(R("Mesma unidade", `<p>Nada a converter.</p>`));
    else {
      passos.push(R(`Passe de ${de} para ${U[dim].si}`, `${eqH(`${n(valor)} ${de} × ${n(f1)} ${U[dim].si}/${de} = <b>${n(si)}</b> ${U[dim].si}`)}<small class="dica">Multiplicar pelo fator faz a unidade antiga “cortar” e sobra a nova.</small>`));
      if (para !== U[dim].si) passos.push(R(`Passe de ${U[dim].si} para ${para}`, `${eqH(`${n(si)} ${U[dim].si} ÷ ${n(f2)} ${U[dim].si}/${para} = <b>${n(r)}</b> ${para}`)}`));
      passos.push(R("Resumo em um só fator", `${eqH(`${n(valor)} ${de} × ${frac(`${n(f1)}`, `${n(f2)}`)} = <b>${n(r)}</b> ${para}`)}<small class="dica">Fator de conversão ${de} → ${para} = ${n(f1 / f2)}.</small>`));
    }
    return { ok: true, passos, valor: r, unidade: para, resposta: `${n(r)} ${para}`, respostaHTML: `${n(valor)} ${de} = <b>${n(r)}</b> ${un(para)}` };
  }

  // ---------------------------------------------------------------------------
  // Circuitos: resistores em série (+) e paralelo (|), com parênteses
  // ---------------------------------------------------------------------------
  function lerResist(t) {
    const m = /^(\d+(?:[.,]\d+)?)([kKMm]?)$/.exec(t);
    if (!m) return NaN;
    const v = parseFloat(m[1].replace(",", "."));
    return v * ({ "": 1, k: 1e3, K: 1e3, M: 1e6, m: 1e-3 }[m[2]]);
  }
  function parseCircuito(txt) {
    const tokens = txt.replace(/\s+/g, "").replace(/Ω/g, "").match(/\(|\)|\+|\||[0-9][0-9.,]*[kKMm]?/g);
    if (!tokens || tokens.join("") !== txt.replace(/\s+/g, "").replace(/Ω/g, "")) throw new Error("Use números, + (série), | (paralelo) e parênteses. Ex.: 10 + (20 | 30)");
    let pos = 0, cont = 0;
    const exprS = () => { const f = [termoP()]; while (tokens[pos] === "+") { pos++; f.push(termoP()); } return f.length === 1 ? f[0] : { t: "s", f }; };
    const termoP = () => { const f = [fator_()]; while (tokens[pos] === "|") { pos++; f.push(fator_()); } return f.length === 1 ? f[0] : { t: "p", f }; };
    const fator_ = () => {
      const k = tokens[pos++];
      if (k === "(") { const e = exprS(); if (tokens[pos++] !== ")") throw new Error("Faltou fechar parênteses."); return e; }
      const v = lerResist(k || "");
      if (!isFinite(v) || v <= 0) throw new Error("Resistência inválida: " + (k || "fim da expressão"));
      return { t: "r", v, id: ++cont };
    };
    const a = exprS();
    if (pos < tokens.length) throw new Error("Expressão incompleta ou parêntese sobrando.");
    return a;
  }
  const fmtR = (v) => (v >= 1e6 ? `${n(v / 1e6)} MΩ` : v >= 1e3 ? `${n(v / 1e3)} kΩ` : `${n(v)} Ω`);
  function passosCircuito(txt, V) {
    let arv;
    try { arv = parseCircuito(txt); } catch (e) { return { ok: false, erro: e.message }; }
    const passos = [];
    const folhas = [];
    const nome = (nó) => (nó.t === "r" ? `R<sub>${nó.id}</sub>` : nó.nome);
    (function achar(nó) { if (nó.t === "r") folhas.push(nó); else nó.f.forEach(achar); })(arv);
    passos.push(R("Identifique os resistores", `<p>Em <b>série</b> (+) a corrente é a mesma e as resistências somam. Em <b>paralelo</b> (|) a tensão é a mesma e somam-se os inversos.</p><div class="lista-itens">${folhas.map((f) => item(`R<sub>${f.id}</sub>`, fmtR(f.v))).join("")}</div>`));
    let contNo = 0;
    function eq(nó) {
      if (nó.t === "r") { nó.req = nó.v; return nó.v; }
      nó.f.forEach(eq);
      nó.nome = `R<sub>${nó.t === "s" ? "s" : "p"}${++contNo}</sub>`;
      if (nó.t === "s") {
        nó.req = nó.f.reduce((a, c) => a + c.req, 0);
        passos.push(R(`Série: ${nó.f.map(nome).join(" + ")}`, `${eqH(`${nó.nome} = ${nó.f.map((c) => fmtR(c.req)).join(" + ")} = <b>${fmtR(nó.req)}</b>`)}`));
      } else {
        const inv = nó.f.reduce((a, c) => a + 1 / c.req, 0);
        nó.req = 1 / inv;
        const dois = nó.f.length === 2;
        passos.push(R(`Paralelo: ${nó.f.map(nome).join(" | ")}`, `${eqH(`${frac("1", nó.nome)} = ${nó.f.map((c) => frac("1", fmtR(c.req))).join(" + ")} = ${frac("1", fmtR(nó.req))}`)}${dois ? `<p>Para dois resistores vale o atalho “produto sobre soma”: ${eqH(`${nó.nome} = ${frac(`${n(nó.f[0].req)}·${n(nó.f[1].req)}`, `${n(nó.f[0].req)} + ${n(nó.f[1].req)}`)} = <b>${fmtR(nó.req)}</b>`)}</p>` : `<p>${nó.nome} = <b>${fmtR(nó.req)}</b></p>`}`));
      }
      return nó.req;
    }
    const Req = eq(arv);
    if (folhas.length === 1) passos.push(R("Só há um resistor", `<p>A resistência equivalente é a do próprio resistor: ${fmtR(Req)}.</p>`));
    let corrente = null, pot = null;
    if (V != null && isFinite(V) && V > 0) {
      corrente = V / Req; pot = V * corrente;
      passos.push(R("Corrente total (lei de Ohm)", `${eqH(`i = ${frac("V", "R<sub>eq</sub>")} = ${frac(`${n(V)} V`, fmtR(Req))} = <b>${n(corrente)}</b> A`)}`));
      (function descer(nó, v, i) {
        nó.v_ = v; nó.i_ = i;
        if (nó.t === "s") nó.f.forEach((c) => descer(c, i * c.req, i));
        else if (nó.t === "p") nó.f.forEach((c) => descer(c, v, v / c.req));
      })(arv, V, corrente);
      const linhas = folhas.map((f) => `<tr><td>R<sub>${f.id}</sub> (${fmtR(f.v)})</td><td>${n(f.v_)} V</td><td>${n(f.i_)} A</td><td>${n(f.v_ * f.i_)} W</td></tr>`).join("");
      passos.push(R("Tensão, corrente e potência em cada resistor", `<p>Descendo da fonte: em série repete-se a corrente (V = R·i); em paralelo repete-se a tensão (i = V ÷ R).</p><div class="tab-rolar"><table class="tb"><thead><tr><th>Resistor</th><th>Tensão</th><th>Corrente</th><th>Potência</th></tr></thead><tbody>${linhas}</tbody></table></div><small class="dica">Conferência: a soma das potências dos resistores é ${n(folhas.reduce((a, f) => a + f.v_ * f.i_, 0))} W = V·i = ${n(pot)} W ✓</small>`));
    }
    return {
      ok: true, passos, Req, corrente, folhas,
      resposta: `R_eq = ${n(Req)} Ω` + (corrente != null ? `, i = ${n(corrente)} A` : ""),
      respostaHTML: `R<sub>eq</sub> = <b>${fmtR(Req)}</b>` + (corrente != null ? ` · i<sub>total</sub> = <b>${n(corrente)}</b> A · P = <b>${n(pot)}</b> W` : ""),
      valor: Req,
    };
  }

  // ---------------------------------------------------------------------------
  // Lançamento oblíquo (sem resistência do ar)
  // ---------------------------------------------------------------------------
  function passosLancamento({ v0, th, h0 = 0, g = config.g }) {
    if (!(v0 > 0)) return { ok: false, erro: "Informe a velocidade inicial (maior que zero)." };
    if (!isFinite(th) || th < -90 || th > 90) return { ok: false, erro: "Use um ângulo entre −90° e 90°." };
    if (!(g > 0)) return { ok: false, erro: "g deve ser positivo." };
    if (!(h0 >= 0)) return { ok: false, erro: "A altura inicial não pode ser negativa." };
    const r = (th * PI) / 180;
    const vx = v0 * Math.cos(r), vy = v0 * Math.sin(r);
    const ts = Math.max(vy / g, 0);
    const hmax = h0 + (vy > 0 ? (vy * vy) / (2 * g) : 0);
    const disc = vy * vy + 2 * g * h0;
    const tT = (vy + Math.sqrt(disc)) / g;
    const A = vx * tT;
    const vyf = vy - g * tT, vf = Math.hypot(vx, vyf);
    const angf = (Math.atan2(vyf, vx) * 180) / PI;
    const passos = [];
    passos.push(R("Decomponha a velocidade inicial", `<p>Horizontal: movimento uniforme. Vertical: movimento uniformemente variado, com a = −g = −${n(g)} m/s².</p>${eqH(`v<sub>x</sub> = v<sub>0</sub>·cos θ = ${n(v0)}·cos(${n(th)}°) = <b>${n(vx)}</b> m/s`)}${eqH(`v<sub>0y</sub> = v<sub>0</sub>·sen θ = ${n(v0)}·sen(${n(th)}°) = <b>${n(vy)}</b> m/s`)}`));
    if (vy > 0) passos.push(R("Tempo de subida", `<p>No ponto mais alto a velocidade vertical é zero: 0 = v<sub>0y</sub> − g·t<sub>s</sub>.</p>${eqH(`t<sub>s</sub> = ${frac("v<sub>0y</sub>", "g")} = ${frac(n(vy), n(g))} = <b>${n(ts)}</b> s`)}`));
    passos.push(R("Altura máxima", vy > 0 ? `<p>De v² = v<sub>0y</sub>² − 2·g·Δh, com v = 0 no topo:</p>${eqH(`h<sub>máx</sub> = h<sub>0</sub> + ${frac("v<sub>0y</sub>²", "2·g")} = ${n(h0)} + ${frac(`${n(vy)}²`, `2·${n(g)}`)} = <b>${n(hmax)}</b> m`)}` : `<p>O lançamento não sobe: a altura máxima é a altura inicial, <b>${n(hmax)}</b> m.</p>`));
    passos.push(R("Tempo total no ar", `<p>O corpo termina em y = 0: ${h0 ? `h<sub>0</sub> + v<sub>0y</sub>·t − g·t²/2 = 0` : `v<sub>0y</sub>·t − g·t²/2 = 0`} (equação do 2º grau).</p>${eqH(`t = ${frac(`v<sub>0y</sub> + √(v<sub>0y</sub>² + 2·g·h<sub>0</sub>)`, "g")} = ${frac(`${n(vy)} + √(${n(vy * vy)} + ${n(2 * g * h0)})`, n(g))} = <b>${n(tT)}</b> s`)}`));
    passos.push(R("Alcance horizontal", `<p>Na horizontal não há aceleração: Δx = v<sub>x</sub>·t.</p>${eqH(`A = ${n(vx)} × ${n(tT)} = <b>${n(A)}</b> m`)}${h0 === 0 && th > 0 ? `<small class="dica">Conferência com a fórmula do alcance (h<sub>0</sub> = 0): A = v<sub>0</sub>²·sen(2θ)/g = ${n((v0 * v0 * Math.sin(2 * r)) / g)} m ✓</small>` : ""}`));
    passos.push(R("Velocidade ao atingir o solo", `${eqH(`v<sub>y</sub> = v<sub>0y</sub> − g·t = ${n(vy)} − ${n(g)}·${n(tT)} = ${n(vyf)} m/s`)}${eqH(`|v| = √(v<sub>x</sub>² + v<sub>y</sub>²) = <b>${n(vf)}</b> m/s, a ${n(Math.abs(angf))}° abaixo da horizontal`)}`));
    const pts = [];
    const N = 80;
    for (let k = 0; k <= N; k++) { const t = (tT * k) / N; pts.push([vx * t, Math.max(h0 + vy * t - (g * t * t) / 2, 0), t]); }
    return {
      ok: true, passos, A, hmax, tT, ts, vx, vy, vf, pts, valor: A, h0,
      resposta: `A = ${n(A)} m · h máx = ${n(hmax)} m · t = ${n(tT)} s`,
      respostaHTML: `Alcance <b>${n(A)}</b> m · altura máx. <b>${n(hmax)}</b> m · tempo no ar <b>${n(tT)}</b> s`,
    };
  }

  // ---------------------------------------------------------------------------
  // Exercícios
  // ---------------------------------------------------------------------------
  const sorteia = (a) => a[Math.floor(Math.random() * a.length)];
  const aleat = ([mn, mx, c]) => { const x = mn + Math.random() * (mx - mn); const p = Math.pow(10, c); return Math.round(x * p) / p; };
  const ALT = { vel: "km/h", massa: "g", tempo: "min", comp: "cm", energia: "kJ", forca: "kN", pot: "kW" };
  const SEM_EXER = new Set(["bohr", "efot"]);

  function gerarFormulas() {
    for (let tent = 0; tent < 80; tent++) {
      const tp = sorteia(TOPICOS.filter((t) => t.id !== "moderna" || Math.random() < 0.4));
      const e = sorteia(tp.equacoes.filter((x) => !SEM_EXER.has(x.id)));
      const alvo = sorteia(e.vars);
      if (e.id === "torricelli" && (alvo === "v" || alvo === "v0")) continue;
      if (e.id === "snell" || e.id === "lorentz" || e.id === "wcos" && alvo === "th") continue;
      if (VARS[alvo].dim === "angulo") continue;
      const dados = {}, shown = [];
      let fail = false;
      for (const v of e.vars) {
        if (v === alvo) continue;
        let val = VARS[v].padrao ? config.g : aleat(VARS[v].faixa);
        if (val === 0) val = VARS[v].faixa[1];
        let u = VARS[v].dim === "angulo" ? "°" : U[VARS[v].dim].si;
        if (!VARS[v].padrao && ALT[VARS[v].dim] && Math.random() < 0.25) {
          u = ALT[VARS[v].dim];
          const f = fator(VARS[v].dim, u);
          val = Math.round((val / f) * 10) / 10 || 1;
        }
        if (e.id === "mruv-s" && v === "v0" && val === 0) val = 1;
        dados[v] = { v: val, u };
        shown.push(v);
      }
      const r = resolver(tp.id, dados, alvo, U[VARS[alvo].dim].si);
      // restringe à fórmula sorteada: a cadeia pode usar outras, o que não atrapalha
      if (!r.ok || !isFinite(r.valorSI) || r.valorSI <= 0 || r.valorSI > 1e12 || r.valorSI < 1e-9) continue;
      // evita que alguma outra fórmula produza resposta diferente de e: confere pela fórmula direta
      const X = {};
      for (const v of shown) X[v] = paraSI(VARS[v].dim, dados[v].v, dados[v].u);
      const dir = e.resolver(alvo, X);
      if (!dir || bad(dir.v) || Math.abs(dir.v - r.valorSI) > 1e-9 * Math.abs(dir.v)) continue;
      const dim = VARS[alvo].dim, uSI = U[dim].si;
      const dadosTxt = shown.map((v) => `${VARS[v].nome} ${VARS[v].sim} = <b>${n(dados[v].v)}${dados[v].u ? " " + dados[v].u : ""}</b>`).join("; ");
      return {
        enunciado: `<small>${tp.nome} · ${e.nome}</small><br>Dados: ${dadosTxt}.<br>Determine <b>${VARS[alvo].nome} (${VARS[alvo].sim})</b>. Responda em <b>${uSI}</b>.`,
        resposta: r.valorSI, rel: 0.02, unidade: uSI, passos: r.passos, texto: `${n(r.valorSI)} ${uSI}`,
      };
    }
    return null;
  }
  function gerarConversao() {
    for (let tent = 0; tent < 60; tent++) {
      const dim = sorteia(["comp", "massa", "tempo", "vel", "energia", "pot", "pressao", "forca", "vol", "area"]);
      const us = Object.keys(U[dim].u).filter((u) => !["c", "ano", "eV", "keV", "MeV", "dyn", "cv", "hp"].includes(u));
      const de = sorteia(us), para = sorteia(us);
      if (de === para) continue;
      const val = sorteia([1.5, 2, 3.6, 12, 25, 72, 120, 250, 0.5, 8, 90]);
      const r = passosConversao(dim, val, de, para);
      if (!(r.valor >= 1e-3 && r.valor <= 1e7)) continue;
      return { enunciado: `Converta <b>${n(val)} ${de}</b> para <b>${para}</b>.`, resposta: r.valor, rel: 0.01, unidade: para, passos: r.passos, texto: r.resposta };
    }
    return passosConversao && { enunciado: "Converta <b>72 km/h</b> para <b>m/s</b>.", resposta: 20, rel: 0.01, unidade: "m/s", passos: passosConversao("vel", 72, "km/h", "m/s").passos, texto: "20 m/s" };
  }
  function gerarCircuito() {
    const a = sorteia([10, 20, 30, 40, 60]), b = sorteia([12, 15, 20, 30, 60]), c = sorteia([5, 10, 25]);
    const forma = sorteia([`${a} + ${b} + ${c}`, `${a} | ${b}`, `${c} + (${a} | ${b})`]);
    const r = passosCircuito(forma, null);
    return { enunciado: `Calcule a resistência equivalente (em Ω) de: <b>${forma.replace("|", "∥")}</b><small><br>“+” = em série, “∥” = em paralelo. Resistências em ohms.</small>`, resposta: r.Req, rel: 0.01, unidade: "Ω", passos: r.passos, texto: `${n(r.Req)} Ω` };
  }
  function gerarLancamento() {
    const v0 = sorteia([10, 15, 20, 25, 30, 40]), th = sorteia([30, 37, 45, 53, 60]);
    const r = passosLancamento({ v0, th, h0: 0, g: config.g });
    return { enunciado: `Uma bola é lançada do solo com <b>${v0} m/s</b> a <b>${th}°</b> com a horizontal. Desprezando o ar e usando g = ${n(config.g)} m/s², qual o alcance horizontal?`, resposta: r.A, rel: 0.02, unidade: "m", passos: r.passos, texto: `${n(r.A)} m` };
  }
  function gerarExercicio(tipo) {
    return ({ formulas: gerarFormulas, conv: gerarConversao, circ: gerarCircuito, lanc: gerarLancamento })[tipo]();
  }

  const API = {
    config, num: n, lerNumero, VARS, U, K, EQ, TOPICOS, NOME_DIM, CONV_DIMS, TEMP,
    resolver, planejar, passosConversao, passosCircuito, passosLancamento, parseCircuito,
    gerarExercicio, conferir: Q.conferir, paraSI, deSI, fator, dimTxt, dimV, sim: simU,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else raiz.FCalc = API;
})(typeof window !== "undefined" ? window : globalThis);
