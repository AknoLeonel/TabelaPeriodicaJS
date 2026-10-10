/*
 * Módulo 5 - Acelerador de partículas
 * Anel com feixes, números reais de um colisionador e um detector para ver o resultado.
 */
(function () {
  "use strict";
  const LAB = window.LAB;
  const F = window.LabFisica;
  const { el, ui, clamp, lerp, rnd } = LAB;

  const RHO = 2804; // raio de curvatura dos dipolos do LHC (m)
  const CIRC = 26659; // circunferência (m)
  const C = 299792458;
  const B_DET = 3.8; // campo do solenoide do detector (T)
  const RAIO_MUON = 7.4;

  const PART = {
    e: { s: "e⁻", nome: "Elétron", m: 0.000511, q: -1, B: 0, L: 1, nuc: 1, cor: "#38e0ff" },
    ep: { s: "e⁺", nome: "Pósitron", m: 0.000511, q: 1, B: 0, L: -1, nuc: 1, cor: "#ff7ab8" },
    p: { s: "p", nome: "Próton", m: 0.938272, q: 1, B: 1, L: 0, nuc: 1, cor: "#ff6a5a" },
    pb: { s: "p̄", nome: "Antipróton", m: 0.938272, q: -1, B: -1, L: 0, nuc: 1, cor: "#7aa2ff" },
    Pb: { s: "Pb⁸²⁺", nome: "Núcleo de chumbo", m: 193.687, q: 82, B: 208, L: 0, nuc: 208, cor: "#ffd24d" },
  };
  const COMBOS = {
    pp: { rotulo: "p + p", a: "p", b: "p", max: 6800, min: 450, padrao: 6800, ref: "LHC, CERN", info: "O Grande Colisor de Hádrons (LHC) colide prótons com até 6,8 TeV por feixe." },
    ee: { rotulo: "e⁻ + e⁺", a: "e", b: "ep", max: 104.5, min: 0.25, padrao: 45.6, ref: "LEP, CERN", info: "O LEP ocupava o mesmo túnel e chegou a 104,5 GeV por feixe. Acima disso os elétrons perdem energia demais em radiação." },
    ppb: { rotulo: "p + p̄", a: "p", b: "pb", max: 1000, min: 100, padrao: 980, ref: "Tevatron, Fermilab", info: "O Tevatron colidia prótons com antiprótons a ~1 TeV por feixe e descobriu o quark top em 1995." },
    PbPb: { rotulo: "Pb + Pb", a: "Pb", b: "Pb", max: 2760, min: 20, padrao: 2510, ref: "LHC, CERN", info: "Íons de chumbo colidem a energias tão altas que a matéria derrete em um plasma de quarks e glúons. A energia aqui é por núcleon." },
  };

  // tipos de evento por combinação: [id, nome, √s mínimo (GeV), descrição]
  const EVENTOS = {
    pp: [
      ["bm", "Colisão comum", 0, "A maioria das colisões só produz uma chuva de partículas leves."],
      ["jato", "Jatos", 200, "Dois quarks ou glúons saem em direções opostas e viram jatos de partículas."],
      ["w", "W → e ν", 400, "O W decai em um elétron e um neutrino. O neutrino não deixa rastro: some uma parte da energia."],
      ["z", "Z⁰ → μ⁺μ⁻", 455, "O Z⁰ decai em dois múons que atravessam o detector inteiro."],
      ["hgg", "Higgs → 2 fótons", 1000, "O Higgs é raríssimo: uma colisão em dez bilhões. Ele aparece como dois fótons de energia total 125 GeV."],
      ["h4", "Higgs → 4 múons", 1000, "O canal de ouro: quatro múons com massa total de 125 GeV. É o mais limpo e o mais raro."],
    ],
    ppb: [
      ["bm", "Colisão comum", 0, "A maioria das colisões só produz uma chuva de partículas leves."],
      ["jato", "Jatos", 200, "Dois quarks ou glúons saem em direções opostas e viram jatos de partículas."],
      ["w", "W → e ν", 300, "O W decai em um elétron e um neutrino (energia faltando)."],
      ["z", "Z⁰ → μ⁺μ⁻", 455, "O Z⁰ decai em dois múons."],
    ],
    ee: [
      ["ann", "Aniquilação → γγ", 0, "Matéria e antimatéria se encontram e viram luz: dois raios gama em direções opostas."],
      ["mm", "→ μ⁺μ⁻", 0.212, "A energia vira um par múon-antimúon (precisa de ao menos 0,21 GeV, o dobro da massa do múon)."],
      ["had", "→ hádrons", 3, "A energia vira um par quark-antiquark, que forma dois jatos."],
      ["z", "Pico do Z⁰", 85, "Perto de 91 GeV a produção do Z⁰ dispara. O Z⁰ decai de várias formas, inclusive em neutrinos, que são invisíveis."],
      ["ww", "W⁺W⁻", 161, "Um par de bósons W: o decaimento mais comum dá jatos e leptons."],
      ["zh", "Z + Higgs", 215, "O Higgs produzido junto com um Z⁰."],
    ],
    PbPb: [
      ["qgp", "Plasma de quarks e glúons", 20, "Milhares de partículas: por uma fração de segundo, quarks e glúons deixam de estar presos dentro de prótons e nêutrons."],
    ],
  };

  function criar(caixa) {
    caixa.style.setProperty("--vh", "52%");
    const vista = el("div", "mod-view");
    const canvas = el("canvas");
    const hudE = el("div", "ov ov-tl hud-ace");
    const hudD = el("div", "ov ov-tr");
    const barraVista = ui.segmentado({
      itens: [{ id: "anel", rotulo: "Anel" }, { id: "det", rotulo: "Detector" }],
      valor: "anel",
      onChange: (id) => { S.vistaAlvo = id === "det" ? 1 : 0; },
      cls: "seg-mini",
    });
    hudD.appendChild(barraVista.el);
    hudD.style.pointerEvents = "auto";
    const btColidirV = ui.botao("⚡ Colidir", () => colidir(), "ov-colidir");
    const ovB = el("div", "ov ov-bc");
    ovB.style.pointerEvents = "auto";
    ovB.appendChild(btColidirV);
    const legDet = el("div", "ov ov-bl leg leg-det");
    legDet.innerHTML = `<span style="--c:#7896ff"><i></i>traçador</span><span style="--c:#46ff9a"><i></i>cal. eletromagnético</span><span style="--c:#4da3ff"><i></i>cal. de hádrons</span><span style="--c:#ffaa5a"><i></i>múons</span>`;
    legDet.style.opacity = "0";
    legDet.style.maxWidth = "34%"; legDet.style.fontSize = "11px"; legDet.style.flexDirection = "column"; legDet.style.gap = "2px";
    vista.append(canvas, hudE, hudD, ovB, legDet);
    const ctl = el("div", "mod-ctl");
    caixa.append(vista, ctl);

    const S = {
      combo: "pp", E: 6800, Ea: 6800, acelerando: false,
      vista: 0, vistaAlvo: 0,
      tipo: "bm", evento: null, tEvt: 0, rapido: false,
      flash: 0, nEvt: 0,
    };
    let L = { w: 0, h: 0, cx: 0, cy: 0, R: 100, Rd: 100, esc: 10 };
    let angulo = 0;
    const faisca = [];

    const cena = new LAB.Cena(canvas, { dprMax: 2 });
    const A = () => PART[COMBOS[S.combo].a];
    const Bp = () => PART[COMBOS[S.combo].b];
    const sqrtS = (E = S.Ea) => 2 * E;

    // ---------- números reais ----------
    function numeros(E = S.Ea) {
      const a = A();
      const Et = E; // por partícula (Pb: por núcleon)
      const m = a.nuc > 1 ? 0.9315 : a.m;
      const gam = Math.max(1, Et / m);
      const om = gam > 30 ? 1 / (2 * gam * gam) : 1 - Math.sqrt(Math.max(0, 1 - 1 / (gam * gam)));
      const beta = 1 - om;
      const pnuc = Math.sqrt(Math.max(Et * Et - m * m, 0));
      const pTot = pnuc * a.nuc; // GeV/c por íon
      const q = a.nuc > 1 ? 82 : Math.abs(a.q);
      const Bd = pTot / (0.2998 * RHO * q);
      const f = (beta * C) / CIRC;
      const mIon = a.nuc > 1 ? a.m : a.m;
      const Eion = Et * a.nuc;
      const rad = 88.46 * q * q * Math.pow(Eion, 4) / RHO * Math.pow(0.000511 / mIon, 4); // keV
      const s = sqrtS(E) * sqrtS(E);
      const fixo = (s - 2 * m * m) / (2 * m); // GeV por núcleon num alvo fixo
      return { gam, beta, om, Bd, f, rad, sqrtS: sqrtS(E), fixo };
    }
    function pctC(om) {
      const casas = clamp(Math.ceil(-Math.log10(Math.max(om, 1e-15))) - 2 + 1, 1, 12);
      return `${((1 - om) * 100).toFixed(casas).replace(".", ",")}% de c`;
    }
    const fmtE = (g) => (g >= 1000 ? `${F.num(g / 1000, 2)} TeV` : g >= 1 ? `${F.num(g, g < 10 ? 2 : 1)} GeV` : g >= 1e-3 ? `${F.num(g * 1000, 1)} MeV` : `${F.num(g * 1e6, 1)} keV`);
    const fmtKeV = (k) => (k < 0.01 ? "desprezível" : k >= 1e6 ? `${F.num(k / 1e6, 2)} GeV` : k >= 1e3 ? `${F.num(k / 1e3, 2)} MeV` : `${F.num(k, 2)} keV`);

    // ---------- geração de eventos (modelo educativo) ----------
    const poisson = (m) => { if (m > 40) return Math.max(0, Math.round(m + Math.sqrt(m) * gauss())); const l = Math.exp(-m); let k = 0, p = 1; do { k++; p *= Math.random(); } while (p > l); return k - 1; };
    const gauss = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(6.2832 * Math.random());
    const expo = (m) => -m * Math.log(1 - Math.random());

    function novoEvento() { return { faixas: [], torreE: new Float32Array(72), torreH: new Float32Array(72), met: null, produtos: [], info: "", massa: null, mostrados: 0, total: 0 }; }
    function faixa(ev, phi, pT, q, tipo, E) { ev.faixas.push({ phi, pT: Math.max(pT, 0.12), q, tipo, E: E != null ? E : pT, pts: null }); }
    function jato(ev, phi, ET, cargaMedia = 0.62) {
      const n = clamp(Math.round(5 + Math.log(ET + 1) * 2.2 + rnd(0, 4)), 4, 26);
      const z = Array.from({ length: n }, () => expo(1));
      const soma = z.reduce((a, b) => a + b, 0);
      for (let i = 0; i < n; i++) {
        const pT = (z[i] / soma) * ET;
        const ph = phi + gauss() * 0.09;
        const r = Math.random();
        if (r < cargaMedia) faixa(ev, ph, pT, Math.random() < 0.5 ? 1 : -1, "pi", pT);
        else if (r < cargaMedia + 0.28) faixa(ev, ph, pT, 0, "gam", pT);
        else faixa(ev, ph, pT, 0, "n", pT);
      }
      ev.produtos.push({ s: `jato de ${n} partículas`, q: 0, B: 0, L: 0, n: 1, nota: `${F.num(ET, 0)} GeV` });
    }
    function eventoSuave(ev, n, mediaPT = 0.55) {
      for (let i = 0; i < n; i++) {
        const t = Math.random();
        const pT = 0.15 + expo(mediaPT);
        const phi = Math.random() * 6.2832;
        if (t < 0.7) faixa(ev, phi, pT, Math.random() < 0.5 ? 1 : -1, "pi", pT);
        else if (t < 0.82) faixa(ev, phi, pT, Math.random() < 0.5 ? 1 : -1, "k", pT);
        else if (t < 0.9) faixa(ev, phi, pT, Math.random() < 0.5 ? 1 : -1, "p", pT);
        else { faixa(ev, phi, pT * 0.7, 0, "gam", pT * 0.7); faixa(ev, phi + rnd(-0.05, 0.05), pT * 0.7, 0, "gam", pT * 0.7); }
      }
    }
    function multiplicidade(sq) { return Math.max(4, Math.round(8 + 4.5 * Math.log(Math.max(sq, 30) / 100))); }

    function gerar(tipo) {
      const ev = novoEvento();
      const sq = sqrtS();
      const c = COMBOS[S.combo];
      const a = A(), b = Bp();
      ev.inicial = { q: a.q + b.q, B: a.B + b.B, L: a.L + b.L };
      const lep = (s, q, Lp) => ({ s, q, B: 0, L: Lp, n: 1 });
      if (tipo === "bm") {
        const nCh = poisson(multiplicidade(sq));
        eventoSuave(ev, Math.round(nCh * 1.15));
        ev.info = `${nCh} partículas carregadas nesta colisão (média típica para ${F.num(sq / 1000, 1)} TeV).`;
        ev.produtos.push({ s: "píons, kaons, prótons e fótons", q: 0, B: 0, L: 0, n: nCh });
      } else if (tipo === "jato") {
        const ET = clamp(expo(sq * 0.04) + 40, 40, sq * 0.4);
        const phi = Math.random() * 6.2832;
        jato(ev, phi, ET); jato(ev, phi + Math.PI + rnd(-0.06, 0.06), ET * rnd(0.8, 1));
        eventoSuave(ev, 14);
        ev.info = `Dois jatos opostos com ${F.num(ET, 0)} GeV cada.`;
      } else if (tipo === "w") {
        const phi = Math.random() * 6.2832, pT = clamp(40 + gauss() * 6, 15, 55);
        const sinal = Math.random() < 0.5 ? 1 : -1;
        faixa(ev, phi, pT, sinal, "e", pT);
        ev.met = { phi: phi + Math.PI + rnd(-0.3, 0.3), E: pT * rnd(0.85, 1.05) };
        eventoSuave(ev, 12);
        ev.massa = { nome: "massa transversal", v: 80.4 + gauss() * 3, ref: "W: 80,4 GeV" };
        ev.produtos.push(lep(sinal > 0 ? "e⁺" : "e⁻", sinal, -sinal), lep(sinal > 0 ? "ν" : "ν̄", 0, sinal));
        ev.info = "Um elétron e uma energia faltando (seta tracejada): o neutrino escapou sem ser visto.";
      } else if (tipo === "z" && (S.combo === "pp" || S.combo === "ppb")) {
        const phi = Math.random() * 6.2832, pT = clamp(45.6 * Math.sqrt(Math.random()) + 4, 8, 46);
        faixa(ev, phi, pT, 1, "mu", pT); faixa(ev, phi + Math.PI + rnd(-0.08, 0.08), pT * rnd(0.9, 1.05), -1, "mu", pT);
        eventoSuave(ev, 14);
        ev.massa = { nome: "massa dos dois múons", v: 91.19 + gauss() * 2.5, ref: "Z⁰: 91,19 GeV" };
        ev.produtos.push(lep("μ⁺", 1, -1), lep("μ⁻", -1, 1));
        ev.info = "Dois múons de cargas opostas, bem separados. A massa que calculamos a partir deles revela o Z⁰.";
      } else if (tipo === "hgg") {
        const phi = Math.random() * 6.2832, pT = rnd(40, 62);
        faixa(ev, phi, pT, 0, "gam", pT); faixa(ev, phi + Math.PI + rnd(-0.12, 0.12), pT * rnd(0.85, 1), 0, "gam", pT);
        eventoSuave(ev, Math.round(poisson(multiplicidade(sq)) * 1.1));
        ev.massa = { nome: "massa dos dois fótons", v: 125.1 + gauss() * 1.7, ref: "Higgs: 125,1 GeV" };
        ev.produtos.push({ s: "γ", q: 0, B: 0, L: 0, n: 2 });
        ev.info = "Dois fótons de alta energia. Sozinho, um evento como esse pode ser só ruído; a pista está em milhares deles juntos.";
      } else if (tipo === "h4") {
        const p1 = Math.random() * 6.2832, p2 = Math.random() * 6.2832;
        const t1 = rnd(28, 46), t2 = rnd(10, 26);
        faixa(ev, p1, t1, 1, "mu", t1); faixa(ev, p1 + Math.PI + rnd(-0.3, 0.3), t1 * 0.8, -1, "mu", t1);
        faixa(ev, p2, t2, 1, "mu", t2); faixa(ev, p2 + Math.PI + rnd(-0.6, 0.6), t2 * 0.9, -1, "mu", t2);
        eventoSuave(ev, 18);
        ev.massa = { nome: "massa dos quatro múons", v: 125.1 + gauss() * 1.0, ref: "Higgs: 125,1 GeV" };
        ev.produtos.push(lep("μ⁺", 1, -1), lep("μ⁻", -1, 1), lep("μ⁺", 1, -1), lep("μ⁻", -1, 1));
        ev.info = "Quatro múons: duas cargas positivas e duas negativas. Um dos eventos mais raros e limpos do LHC.";
      } else if (tipo === "qgp") {
        const nTot = Math.round(1600 * Math.pow(Math.max(sq, 20) / 5020, 0.3) * 8);
        const nDes = Math.min(nTot, 620);
        eventoSuave(ev, nDes, 0.7);
        ev.total = nTot;
        ev.info = `Cerca de ${F.num(nTot, 0)} partículas carregadas (mostrando ${nDes}). A temperatura chega a ~5 trilhões de graus, 100 mil vezes o centro do Sol.`;
        ev.produtos.push({ s: "hádrons do plasma", q: 0, B: 0, L: 0, n: nTot });
      } else if (tipo === "ann") {
        const phi = Math.random() * 6.2832, e = S.Ea;
        faixa(ev, phi, e, 0, "gam", e); faixa(ev, phi + Math.PI, e, 0, "gam", e);
        ev.produtos.push({ s: "γ", q: 0, B: 0, L: 0, n: 2 });
        ev.info = `Dois fótons de ${fmtE(e)} cada, exatamente em direções opostas: o momento total é zero. Toda a massa virou luz.`;
      } else if (tipo === "mm") {
        const phi = Math.random() * 6.2832, e = S.Ea;
        faixa(ev, phi, e, 1, "mu", e); faixa(ev, phi + Math.PI, e, -1, "mu", e);
        ev.produtos.push(lep("μ⁺", 1, -1), lep("μ⁻", -1, 1));
        ev.info = "A energia da colisão virou massa: um múon e um antimúon, que são cópias mais pesadas do elétron e do pósitron.";
      } else if (tipo === "had") {
        const phi = Math.random() * 6.2832, e = S.Ea;
        jato(ev, phi, e, 0.7); jato(ev, phi + Math.PI + rnd(-0.03, 0.03), e, 0.7);
        ev.info = "Um quark e um antiquark se afastam e, como não podem existir sozinhos, cada um vira um jato de partículas.";
      } else if (tipo === "z") {
        const phi = Math.random() * 6.2832, e = S.Ea, r = Math.random();
        if (r < 0.699) { jato(ev, phi, e, 0.7); jato(ev, phi + Math.PI, e, 0.7); ev.info = "Z⁰ → quark e antiquark (70% das vezes): dois jatos."; }
        else if (r < 0.733) { faixa(ev, phi, e, 1, "mu", e); faixa(ev, phi + Math.PI, e, -1, "mu", e); ev.produtos.push(lep("μ⁺", 1, -1), lep("μ⁻", -1, 1)); ev.info = "Z⁰ → μ⁺μ⁻ (3,4%)."; }
        else if (r < 0.767) { faixa(ev, phi, e, 1, "e", e); faixa(ev, phi + Math.PI, e, -1, "e", e); ev.produtos.push(lep("e⁺", 1, -1), lep("e⁻", -1, 1)); ev.info = "Z⁰ → e⁺e⁻ (3,4%)."; }
        else if (r < 0.80) { faixa(ev, phi, e * 0.5, 1, "pi", e * 0.5); faixa(ev, phi + Math.PI, e * 0.5, -1, "pi", e * 0.5); ev.met = { phi: phi + 1.4, E: e * 0.9 }; ev.produtos.push(lep("τ⁺", 1, -1), lep("τ⁻", -1, 1)); ev.info = "Z⁰ → τ⁺τ⁻ (3,4%): os táus decaem logo, deixando neutrinos escondidos."; }
        else { ev.info = "Z⁰ → neutrinos (20%): o evento é totalmente invisível! Só sabemos que ele existe porque a energia some. Foi assim que o LEP concluiu que existem exatamente 3 tipos de neutrinos leves."; ev.produtos.push({ s: "ν ν̄", q: 0, B: 0, L: 0, n: 2 }); ev.invisivel = true; }
        ev.massa = { nome: "energia total", v: sqrtS(), ref: "Z⁰: 91,19 GeV" };
      } else if (tipo === "ww") {
        const phi = Math.random() * 6.2832, e = S.Ea * 0.9;
        if (Math.random() < 0.5) { jato(ev, phi, e * 0.5, 0.7); jato(ev, phi + 2.6, e * 0.5, 0.7); const sg = Math.random() < 0.5 ? 1 : -1; faixa(ev, phi + 4, e * 0.55, sg, "e", e * 0.55); ev.met = { phi: phi + 4 + Math.PI * 0.8, E: e * 0.5 }; ev.info = "Um W decaiu em dois jatos, o outro em um elétron e um neutrino."; }
        else { for (let k = 0; k < 4; k++) jato(ev, phi + k * 1.57 + rnd(-0.3, 0.3), e * 0.25, 0.7); ev.info = "Os dois W decaíram em quarks: quatro jatos."; }
      } else if (tipo === "zh") {
        const phi = Math.random() * 6.2832, e = S.Ea * 0.5;
        faixa(ev, phi, e * 0.7, 1, "mu", e * 0.7); faixa(ev, phi + rnd(2.4, 3.2), e * 0.6, -1, "mu", e * 0.6);
        jato(ev, phi + 1.6, e * 0.6, 0.65); jato(ev, phi + 4.5, e * 0.6, 0.65);
        ev.produtos.push(lep("μ⁺", 1, -1), lep("μ⁻", -1, 1));
        ev.info = "Um Z⁰ (dois múons) e um Higgs (que decaiu em dois jatos de quarks b).";
        ev.massa = { nome: "massa do recuo", v: 125.1 + gauss() * 2, ref: "Higgs: 125,1 GeV" };
      }
      // nos colisionadores de hádrons o que não virou partícula nova fica nos restos dos feixes
      if (S.combo !== "ee") {
        ev.produtos = ev.produtos.filter((p) => p.s !== "restos dos feixes");
        let q = 0, B = 0, Lp = 0;
        for (const p of ev.produtos) { const n = p.n && p.s !== "hádrons do plasma" && !p.nota ? p.n : 1; q += p.q * n; B += p.B * n; Lp += p.L * n; }
        ev.produtos.push({ s: "restos dos feixes", q: ev.inicial.q - q, B: ev.inicial.B - B, L: ev.inicial.L - Lp, n: 1, nota: "ficam no tubo" });
      }
      return ev;
    }

    // soma das leis de conservação
    function conservacao(ev) {
      let q = 0, B = 0, Lp = 0;
      for (const p of ev.produtos) { const n = p.n && !p.nota && p.s !== "hádrons do plasma" ? p.n : 1; q += p.q * n; B += p.B * n; Lp += p.L * n; }
      return { ini: ev.inicial, fin: { q, B, L: Lp } };
    }

    // ---------- geometria das trajetórias ----------
    function trajeto(f, amostras = 26) {
      // devolve pontos em metros; para na calorimetria ou segue (múons)
      const R = f.pT / (0.3 * B_DET);
      const s = f.q > 0 ? 1 : -1;
      const phi0 = f.phi;
      let rMax = f.tipo === "mu" ? RAIO_MUON : f.tipo === "e" ? 1.8 : 2.9;
      if (f.q === 0) { // neutros: reta
        rMax = f.tipo === "gam" ? 1.5 : 2.4;
        return { pts: [0, 0, Math.cos(phi0) * rMax, Math.sin(phi0) * rMax], neutro: true, rEnd: rMax, fim: [Math.cos(phi0) * rMax, Math.sin(phi0) * rMax], preso: false };
      }
      const pts = [0, 0];
      const lim = Math.min(rMax, 3.3); // dentro do solenoide a trajetória é um arco
      let t1, preso = false;
      if (lim < 2 * R) t1 = 2 * Math.asin(lim / (2 * R));
      else { t1 = 6.2832 * 0.98; preso = f.tipo !== "mu"; }
      const n = amostras;
      let x = 0, y = 0, psi = phi0;
      for (let i = 1; i <= n; i++) {
        const t = (t1 * i) / n;
        psi = phi0 + s * t;
        x = R * s * (Math.sin(psi) - Math.sin(phi0));
        y = -R * s * (Math.cos(psi) - Math.cos(phi0));
        pts.push(x, y);
      }
      if (f.tipo === "mu" && !preso) { // fora do solenoide: quase reto, com leve curvatura contrária
        const passos = 10, dr = (RAIO_MUON - Math.hypot(x, y)) / passos;
        for (let i = 1; i <= passos; i++) { psi -= s * 0.012; x += Math.cos(psi) * dr; y += Math.sin(psi) * dr; pts.push(x, y); }
      }
      return { pts, neutro: false, preso, rEnd: Math.hypot(x, y), fim: [x, y] };
    }
    function prepararEvento(ev) {
      ev.torreE.fill(0); ev.torreH.fill(0);
      for (const f of ev.faixas) {
        const tr = trajeto(f, ev.faixas.length > 250 ? 11 : 26);
        f.pts = tr.pts; f.neutro = tr.neutro; f.preso = tr.preso;
        f.rEnd = tr.rEnd;
        if (f.preso) { f.dep = null; continue; }
        const ang = Math.atan2(tr.fim[1], tr.fim[0]);
        const bin = ((Math.round((ang / 6.2832) * 72) % 72) + 72) % 72;
        if (f.tipo === "e" || f.tipo === "gam") ev.torreE[bin] += f.E;
        else if (f.tipo === "pi" || f.tipo === "k" || f.tipo === "p" || f.tipo === "n") { ev.torreH[bin] += f.E * 0.8; ev.torreE[bin] += f.E * 0.2; }
        else if (f.tipo === "mu") { ev.torreH[bin] += 1.5; }
        f.bin = bin;
      }
    }

    // ---------- ações ----------
    function colidir() {
      if (S.acelerando) return;
      LAB.som.preparar();
      S.tipo = S.tipoSel || S.tipo;
      const lista = EVENTOS[S.combo];
      let t = lista.find((e) => e[0] === S.tipo);
      if (!t || sqrtS() < t[2]) t = lista[0];
      const ev = gerar(t[0]);
      ev.tipoId = t[0]; ev.nome = t[1];
      prepararEvento(ev);
      S.evento = ev; S.tEvt = 0; S.flash = 1; S.nEvt++;
      S.vistaAlvo = 1; barraVista.set("det");
      LAB.som.tom(80, 0.5, 0.12, "sawtooth", 40); LAB.som.clique(0.3, 0.4); LAB.som.vibrar(40);
      mostrarProdutos(ev);
      atualizarHUD(true);
    }
    let alvoE = S.E;
    function acelerar() {
      if (S.acelerando) return;
      LAB.som.preparar();
      S.acelerando = true; S.Ea = Math.max(COMBOS[S.combo].min * 0.5, 0.2);
      btAcel.disabled = true;
      if (S.vista > 0.3) { S.vistaAlvo = 0; barraVista.set("anel"); }
      alvoE = S.E;
    }
    function mudarCombo(id) {
      S.combo = id;
      const c = COMBOS[id];
      S.E = c.padrao; S.Ea = c.padrao; S.acelerando = false; btAcel.disabled = false;
      slE.rotulo(id === "PbPb" ? "Energia por núcleon" : "Energia por feixe");
      slE.config(c.min, c.max, c.padrao);
      S.evento = null;
      S.tipoSel = EVENTOS[id][0][0];
      montarEventos();
      cHiggs.hidden = !(id === "pp");
      cZ.hidden = id !== "ee";
      atualizarNumeros();
      desenharZ(); desenharH();
      produtosCorpo.innerHTML = `<p class="dica-vazia">Aperte <b>Colidir</b> para ver as partículas produzidas.</p>`;
      infoCombo.textContent = c.info;
    }

    // ---------- desenho ----------
    cena.aoRedimensionar = (w, h) => {
      L = { w, h, cx: w / 2, cy: h / 2 - 8, R: Math.min(w, h) * 0.33, Rd: Math.min(w, h) * 0.46, esc: 1 };
    };
    cena.atualizar = (dt, t) => {
      // rampa de energia
      if (S.acelerando) {
        const k = Math.pow(alvoE / Math.max(S.Ea, 0.1), 1) ;
        S.Ea = Math.min(alvoE, S.Ea * (1 + dt * (1.2 + 3 * (1 / (1 + S.Ea / alvoE * 9)))) + alvoE * dt * 0.02);
        if (Math.random() < 0.3) LAB.som.tom(160 + 120 * Math.log10(1 + S.Ea / COMBOS[S.combo].min), 0.08, 0.025, "sawtooth");
        if (S.Ea >= alvoE * 0.999) { S.Ea = alvoE; S.acelerando = false; btAcel.disabled = false; LAB.som.tom(520, 0.2, 0.08, "triangle", 880); }
      }
      S.vista += (S.vistaAlvo - S.vista) * Math.min(1, dt * 3.2);
      const n = numeros();
      // a velocidade na tela cresce com β: devagar na injeção, máxima perto de c
      const w = 0.35 + 2.4 * Math.pow(n.beta, 4);
      angulo += dt * w;
      S.flash = Math.max(0, S.flash - dt * 1.6);
      if (S.evento) S.tEvt += dt;
      // faíscas de radiação síncrotron
      if (n.rad > 1e4 && S.vista < 0.5 && Math.random() < 0.4) {
        const a = Math.random() * 6.2832;
        faisca.push({ a, v: 0.5, r: L.R });
      }
      for (let i = faisca.length - 1; i >= 0; i--) { faisca[i].v -= dt; if (faisca[i].v <= 0) faisca.splice(i, 1); }
      atualizarHUD(false);
    };

    function desenharAnel(g, t, alfa, zoom) {
      const { cx, cy, R } = L;
      g.save();
      g.globalAlpha = alfa;
      g.translate(cx + (L.R * zoom * 0.0), cy);
      // zoom em direção ao ponto de interação (à direita)
      g.translate(R * (zoom - 1) * -1, 0);
      g.scale(zoom, zoom);
      g.translate(0, 0);
      const a = A(), b = Bp();
      // túnel
      g.strokeStyle = "rgba(255,255,255,0.06)"; g.lineWidth = 26;
      g.beginPath(); g.arc(0, 0, R, 0, 6.2832); g.stroke();
      // ímãs dipolo
      g.strokeStyle = "rgba(77,163,255,0.55)"; g.lineWidth = 9;
      g.setLineDash([R * 0.2, R * 0.04]);
      g.beginPath(); g.arc(0, 0, R, 0, 6.2832); g.stroke();
      g.setLineDash([]);
      // cavidade de RF (acelera os feixes)
      g.save(); g.rotate(-Math.PI / 2);
      g.fillStyle = S.acelerando ? "#fff3b0" : "#c9a23a";
      g.shadowColor = "#ffd24d"; g.shadowBlur = S.acelerando ? 22 : 6;
      g.fillRect(R - 8, -12, 16, 24);
      g.restore(); g.shadowBlur = 0;
      g.fillStyle = "rgba(255,230,160,0.8)"; g.font = "600 10px Inter, sans-serif"; g.textAlign = "center";
      g.fillText("cavidade de RF", 0, -R - 16);
      // ponto de interação
      g.strokeStyle = "rgba(255,255,255,0.35)"; g.lineWidth = 1.5;
      g.beginPath(); g.arc(R, 0, 13, 0, 6.2832); g.stroke();
      g.fillText("colisão", R, 32);
      g.textAlign = "left";
      // feixes
      g.globalCompositeOperation = "lighter";
      const NB = 22;
      const sA = LAB.brilho(8, a.cor, 1), sB = LAB.brilho(8, b.cor, 1);
      for (let i = 0; i < NB; i++) {
        const t1 = angulo + (i / NB) * 6.2832;
        g.drawImage(sA, Math.cos(t1) * (R - 7) - 9, Math.sin(t1) * (R - 7) - 9, 18, 18);
        const t2 = -angulo + (i / NB) * 6.2832 + 0.14;
        g.drawImage(sB, Math.cos(t2) * (R + 7) - 9, Math.sin(t2) * (R + 7) - 9, 18, 18);
      }
      // radiação síncrotron
      for (const f of faisca) {
        g.globalAlpha = alfa * f.v;
        const px = Math.cos(f.a) * (R + 10 + (0.5 - f.v) * 40), py = Math.sin(f.a) * (R + 10 + (0.5 - f.v) * 40);
        g.drawImage(LAB.brilho(6, "#ffd8a0", 1), px - 7, py - 7, 14, 14);
      }
      g.globalAlpha = alfa;
      g.globalCompositeOperation = "source-over";
      // legenda
      g.fillStyle = a.cor; g.beginPath(); g.arc(-R * 0.5, -6, 4, 0, 6.2832); g.fill();
      g.fillStyle = "rgba(235,240,255,0.85)"; g.font = "600 11px Inter, sans-serif"; g.fillText(a.s + " →", -R * 0.5 + 9, -2);
      g.fillStyle = b.cor; g.beginPath(); g.arc(-R * 0.5, 12, 4, 0, 6.2832); g.fill();
      g.fillStyle = "rgba(235,240,255,0.85)"; g.fillText(b.s + " ←", -R * 0.5 + 9, 16);
      g.restore();
    }

    function desenharDetector(g, t, alfa, zoom, estatico = false) {
      const { cx, cy, Rd, esc } = L;
      g.save();
      g.globalAlpha = alfa;
      g.translate(cx, cy);
      g.scale(zoom, zoom);
      const r = (m) => Rd * Math.pow(m / RAIO_MUON, 0.55); // escala radial comprimida: as camadas internas ficam visíveis
      const P = (x, y) => { const d = Math.hypot(x, y); if (d < 1e-6) return [0, 0]; const k = r(d) / d; return [x * k, y * k]; };
      // camadas
      const camada = (r1, r2, cor, borda) => {
        g.beginPath(); g.arc(0, 0, r(r2), 0, 6.2832); g.arc(0, 0, r(r1), 0, 6.2832, true);
        g.fillStyle = cor; g.fill("evenodd");
        g.strokeStyle = borda; g.lineWidth = 1; g.beginPath(); g.arc(0, 0, r(r2), 0, 6.2832); g.stroke();
      };
      camada(0.06, 1.1, "rgba(120,160,255,0.07)", "rgba(120,160,255,0.35)");
      camada(1.3, 1.8, "rgba(70,255,154,0.08)", "rgba(70,255,154,0.4)");
      camada(1.9, 2.9, "rgba(77,163,255,0.08)", "rgba(77,163,255,0.4)");
      camada(3.0, 3.3, "rgba(180,190,220,0.18)", "rgba(180,190,220,0.4)");
      for (let k = 0; k < 4; k++) { const r1 = 4.0 + k * 0.85; camada(r1, r1 + 0.5, "rgba(255,170,90,0.06)", "rgba(255,170,90,0.28)"); }
      g.textAlign = "left";
      const ev = S.evento;
      if (ev) {
        const prog = estatico ? 1 : clamp(S.tEvt / 0.9, 0, 1);
        // torres de energia
        const rtE = r(1.3), rtH = r(1.9);
        const fatorT = ev.tipoId === "qgp" ? 0.02 : 1;
        g.lineWidth = Math.max(2, (6.2832 * r(1.8)) / 72 - 1);
        g.lineCap = "butt";
        for (let b = 0; b < 72; b++) {
          const ang = (b / 72) * 6.2832;
          const e = ev.torreE[b], h = ev.torreH[b];
          const cs = Math.cos(ang), sn = Math.sin(ang);
          if (e > 0.5 && prog > 0.55) { const len = Rd * 0.03 + Rd * 0.16 * Math.min(1, Math.log10(1 + e * fatorT) / 2.3) * clamp((prog - 0.55) * 4, 0, 1); g.strokeStyle = "rgba(70,255,154,0.85)"; g.beginPath(); g.moveTo(cs * rtE, sn * rtE); g.lineTo(cs * (rtE + len), sn * (rtE + len)); g.stroke(); }
          if (h > 0.5 && prog > 0.7) { const len = Rd * 0.03 + Rd * 0.2 * Math.min(1, Math.log10(1 + h * fatorT) / 2.3) * clamp((prog - 0.7) * 4, 0, 1); g.strokeStyle = "rgba(90,170,255,0.9)"; g.beginPath(); g.moveTo(cs * rtH, sn * rtH); g.lineTo(cs * (rtH + len), sn * (rtH + len)); g.stroke(); }
        }
        // trajetórias
        const tipos = { e: "#46ff9a", mu: "#ff4d8b", pi: "#ffd24d", k: "#ffb23d", p: "#ff8a5a", gam: "#fff3b0", n: "#8fa0c8" };
        g.lineWidth = 1.4; g.lineJoin = "round";
        g.globalCompositeOperation = ev.faixas.length > 250 ? "source-over" : "lighter"; // mistura aditiva é cara com centenas de linhas
        const porCor = {};
        for (const f of ev.faixas) {
          if (!f.pts) continue;
          const n = f.pts.length / 2;
          const m = Math.max(2, Math.ceil(n * prog));
          const neutro = f.q === 0;
          if (neutro && !mostrarNeutros) continue;
          const cor = tipos[f.tipo];
          (porCor[cor + (neutro ? "d" : "")] = porCor[cor + (neutro ? "d" : "")] || []).push([f, m]);
        }
        for (const k in porCor) {
          const neutro = k.endsWith("d");
          g.strokeStyle = neutro ? LAB.rgba(k.slice(0, 7), 0.45) : LAB.rgba(k.slice(0, 7), 0.9);
          g.lineWidth = neutro ? 1 : k.startsWith("#ff4d8b") ? 2.2 : 1.4;
          g.setLineDash(neutro ? [3, 4] : []);
          g.beginPath();
          for (const [f, m] of porCor[k]) {
            g.moveTo(0, 0);
            for (let i = 1; i < m; i++) { const q = P(f.pts[i * 2], f.pts[i * 2 + 1]); g.lineTo(q[0], q[1]); }
          }
          g.stroke();
        }
        g.setLineDash([]);
        g.globalCompositeOperation = "source-over";
        // energia faltando
        if (ev.met && prog > 0.5) {
          g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineWidth = 2.5; g.setLineDash([7, 6]);
          const L1 = Rd * (0.45 + 0.4 * Math.min(1, ev.met.E / 60));
          g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(ev.met.phi) * L1, Math.sin(ev.met.phi) * L1); g.stroke(); g.setLineDash([]);
          g.fillStyle = "#fff"; g.font = "600 10.5px Inter, sans-serif";
          g.fillText("energia faltando (ν)", Math.cos(ev.met.phi) * L1 + 4, Math.sin(ev.met.phi) * L1);
        }
        if (ev.invisivel && prog > 0.3) { g.fillStyle = "rgba(255,255,255,0.8)"; g.font = "600 13px Inter, sans-serif"; g.textAlign = "center"; g.fillText("evento invisível", 0, 4); g.textAlign = "left"; }
      }
      // feixe e vértice
      g.fillStyle = "#fff"; g.beginPath(); g.arc(0, 0, 3, 0, 6.2832); g.fill();
      if (S.flash > 0 && !estatico) {
        g.globalCompositeOperation = "lighter";
        const fr = r(0.4 + (1 - S.flash) * 5);
        g.strokeStyle = `rgba(255,255,255,${S.flash})`; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, fr, 0, 6.2832); g.stroke();
        g.globalAlpha = alfa * S.flash; g.drawImage(LAB.brilho(32, "#ffe9a0", 1), -r(2), -r(2), r(4), r(4)); g.globalAlpha = alfa;
        g.globalCompositeOperation = "source-over";
      }
      g.restore();
    }
    let mostrarNeutros = false;
    const cacheEv = { canvas: document.createElement("canvas"), ev: null, w: 0, h: 0, n: false, d: 1 };
    function construirCache(w, h) {
      const c = cacheEv.canvas;
      c.width = Math.round(w * cena.dpr); c.height = Math.round(h * cena.dpr);
      const og = c.getContext("2d");
      og.setTransform(cena.dpr, 0, 0, cena.dpr, 0, 0);
      og.clearRect(0, 0, w, h);
      desenharDetector(og, 0, 1, 1, true);
      Object.assign(cacheEv, { ev: S.evento, w, h, n: mostrarNeutros, d: cena.dpr });
    }

    cena.desenhar = (g, w, h, t) => {
      g.clearRect(0, 0, w, h);
      const v = S.vista;
      if (v < 0.98) desenharAnel(g, t, 1 - v, 1 + v * 2.2);
      if (v > 0.02) {
        // depois da animação o evento é só uma imagem: milhares de linhas não precisam ser redesenhadas a cada quadro
        if (v > 0.99 && S.evento && S.tEvt > 1.0 && S.flash <= 0) {
          if (cacheEv.ev !== S.evento || cacheEv.w !== w || cacheEv.h !== h || cacheEv.n !== mostrarNeutros || cacheEv.d !== cena.dpr) construirCache(w, h);
          g.drawImage(cacheEv.canvas, 0, 0, w, h);
        } else desenharDetector(g, t, v, 0.45 + 0.55 * v);
      }
    };

    // ---------- HUD e painéis ----------
    let tHud = 0;
    function atualizarHUD(forcar) {
      const agora = performance.now();
      if (!forcar && agora - tHud < 120) return;
      tHud = agora;
      const n = numeros();
      hudE.innerHTML = `<div class="ace-s">√s = ${fmtE(n.sqrtS)}</div><div class="dec-sub">${S.acelerando ? "acelerando…" : S.vista > 0.5 && S.evento ? S.evento.nome : "feixes estáveis"}</div>`;
      btColidirV.disabled = S.acelerando;
      legDet.style.opacity = S.vista > 0.6 ? "1" : "0";
      if (!forcar) atualizarNumeros();
    }
    const numeroBox = el("div");
    function atualizarNumeros() {
      const n = numeros();
      const a = A();
      const linhas = [
        ["Energia por " + (a.nuc > 1 ? "núcleon" : "feixe"), fmtE(S.Ea)],
        ["Energia da colisão (√s)", fmtE(n.sqrtS)],
        ["Velocidade", pctC(n.om)],
        ["Fator de Lorentz γ", F.num(n.gam, n.gam < 100 ? 1 : 0)],
        ["Campo dos ímãs", `${F.num(n.Bd, 2)} <small>T</small>`],
        ["Voltas por segundo", `${F.num(n.f, 0)}`],
        ["Radiação por volta", fmtKeV(n.rad)],
        ["Alvo fixo equivalente", fmtE(n.fixo)],
      ];
      numeroBox.innerHTML = `<dl class="lin">${linhas.map(([k, v], i) => `<div class="${i === 7 ? "larga" : ""}"><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
        <small class="dica">${n.fixo > 1e5 ? `Para chegar à mesma energia atirando num alvo parado, seria preciso um feixe de ${fmtE(n.fixo)}: ${n.fixo > 1e7 ? "dezenas de milhões de vezes mais energético." : "muito mais energético."} Por isso os colisionadores colidem feixes de frente.` : "Colidir dois feixes de frente aproveita toda a energia; num alvo parado, boa parte se perderia como movimento."}</small>
        ${n.rad > 1e5 ? `<small class="dica" style="color:#ffb27a">A radiação síncrotron já é grande: as partículas perdem ${fmtKeV(n.rad)} a cada volta e precisam ser reaceleradas.</small>` : ""}`;
      if (S.combo === "ee") desenharZ();
    }

    // controles
    const seg = ui.segmentado({
      itens: Object.entries(COMBOS).map(([id, c]) => ({ id, rotulo: c.rotulo })),
      valor: "pp",
      onChange: (id) => mudarCombo(id),
    });
    const infoCombo = el("small", "dica", COMBOS.pp.info);
    const cFeixes = ui.cartao("Escolha os feixes", seg.el);
    cFeixes.appendChild(infoCombo);

    const slE = ui.slider({
      rotulo: "Energia por feixe", min: COMBOS.pp.min, max: COMBOS.pp.max, valor: COMBOS.pp.padrao, log: true, fmt: fmtE,
      onInput: (v) => { S.E = v; if (!S.acelerando) { S.Ea = v; S.evento = null; } else alvoE = v; atualizarNumeros(); atualizarEventosLock(); desenharZ(); desenharH(); },
      cor: "#a46bff",
    });
    const btAcel = ui.botao("⟳ Reinjetar e acelerar", () => acelerar(), "sec");
    const btColidir = ui.botao("⚡ Colidir", () => colidir());
    const linhaBt = el("div", "linha-bt"); linhaBt.append(btAcel, btColidir);
    const cEnergia = ui.cartao("Energia", "");
    cEnergia.append(slE.el, el("div", "esp"), linhaBt, el("div", "esp"), numeroBox);

    // eventos
    const eventosBox = el("div", "chips quebra");
    const eventoInfo = el("p");
    eventoInfo.style.marginTop = "10px";
    const neutros = el("label", "check-neutros", `<input type="checkbox"> mostrar partículas neutras (linhas pontilhadas)`);
    neutros.querySelector("input").addEventListener("change", (e) => { mostrarNeutros = e.target.checked; });
    const cEventos = ui.cartao("O que procurar", "");
    cEventos.append(eventosBox, eventoInfo, neutros);
    function montarEventos() {
      eventosBox.innerHTML = "";
      for (const [id, nome, min, desc] of EVENTOS[S.combo]) {
        const b = el("button", "chip2", nome);
        b.type = "button";
        b.dataset.id = id; b.dataset.min = min;
        b.addEventListener("click", () => {
          if (sqrtS() < min) { avisoLock(min); return; }
          S.tipoSel = id;
          marcarEvento();
        });
        eventosBox.appendChild(b);
      }
      atualizarEventosLock();
      marcarEvento();
    }
    function avisoLock(min) {
      eventoInfo.innerHTML = `<b style="color:#ffb27a">🔒 Energia insuficiente.</b> Precisa de √s ≥ ${fmtE(min)} (agora: ${fmtE(sqrtS())}). Aumente a energia.`;
      LAB.som.tom(180, 0.15, 0.06, "square");
    }
    function atualizarEventosLock() {
      eventosBox.querySelectorAll(".chip2").forEach((b) => {
        const trancado = sqrtS() < +b.dataset.min;
        b.classList.toggle("trancado", trancado);
        const nome = EVENTOS[S.combo].find((e) => e[0] === b.dataset.id)[1];
        b.textContent = (trancado ? "🔒 " : "") + nome;
      });
      if (!S.tipoSel) S.tipoSel = EVENTOS[S.combo][0][0];
      const sel = EVENTOS[S.combo].find((e) => e[0] === S.tipoSel);
      if (sel && sqrtS() < sel[2]) S.tipoSel = EVENTOS[S.combo][0][0];
      marcarEvento();
    }
    function marcarEvento() {
      const sel = EVENTOS[S.combo].find((e) => e[0] === S.tipoSel) || EVENTOS[S.combo][0];
      eventosBox.querySelectorAll(".chip2").forEach((b) => b.classList.toggle("on", b.dataset.id === sel[0]));
      eventoInfo.textContent = sel[3];
    }

    // produtos e conservação
    const produtosCorpo = el("div");
    const cProd = ui.cartao("Partículas produzidas", produtosCorpo);
    function mostrarProdutos(ev) {
      const c = conservacao(ev);
      const ok = (a, b) => (Math.abs(a - b) < 1e-9 ? "✓" : "✗");
      const prod = ev.produtos.map((p) => `<div class="prod"><b>${p.s}</b><span>${p.n && p.n > 1 ? "× " + F.num(p.n, 0) : ""}${p.nota ? " · " + p.nota : ""}</span></div>`).join("");
      let massa = "";
      if (ev.massa) massa = `<div class="res-ok" style="margin-top:10px"><b>${ev.massa.nome}:</b> ${F.num(ev.massa.v, 1)} GeV <small>(${ev.massa.ref})</small></div>`;
      produtosCorpo.innerHTML = `
        <p><b>${ev.nome}</b> · ${ev.info}</p>
        <div class="prods">${prod || '<div class="prod"><b>nenhuma partícula visível</b></div>'}</div>
        ${massa}
        <dl class="lin" style="margin-top:10px">
          <div><dt>Carga antes → depois</dt><dd>${c.ini.q} → ${c.fin.q} <small>${ok(c.ini.q, c.fin.q)}</small></dd></div>
          <div><dt>Bárions antes → depois</dt><dd>${c.ini.B} → ${c.fin.B} <small>${ok(c.ini.B, c.fin.B)}</small></dd></div>
          <div class="larga"><dt>Número leptônico antes → depois</dt><dd>${c.ini.L} → ${c.fin.L} <small>${ok(c.ini.L, c.fin.L)}</small></dd></div></dl>
        <small class="dica">As leis de conservação (carga, número de bárions e de léptons) valem em toda colisão. A energia total e o momento também.</small>
        <div class="linha-bt" style="margin-top:10px"></div>`;
      const lb = produtosCorpo.querySelector(".linha-bt");
      lb.append(ui.botao("Outra colisão", () => colidir(), "sec"));
    }

    // varredura do Z (e+e-)
    const zCanvas = el("canvas", "mini-grafico");
    const cZ = ui.cartao("Varredura de energia: o pico do Z⁰", zCanvas);
    cZ.insertAdjacentHTML("beforeend", `<small class="dica">Quantos eventos acontecem conforme a energia da colisão. Perto de 91,19 GeV a taxa dispara 100 vezes: é a ressonância do Z⁰. O LEP mediu a largura do pico e concluiu que existem 3 tipos de neutrinos leves.</small>`);
    cZ.hidden = true;
    function desenharZ() {
      if (cZ.hidden) return;
      const r = zCanvas.getBoundingClientRect();
      if (r.width < 10) return;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const w = Math.round(r.width), h = Math.round(r.height);
      if (zCanvas.width !== w * dpr) { zCanvas.width = w * dpr; zCanvas.height = h * dpr; }
      const g = zCanvas.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
      const M = 91.1876, G = 2.4952, s0 = 41.5;
      const sig = (E) => { const s = E * E; return s0 * (s * G * G) / (Math.pow(s - M * M, 2) + (s * s * G * G) / (M * M)) + 0.3; };
      const X = (E) => 28 + ((E - 80) / 25) * (w - 40), Y = (v) => h - 24 - (v / 46) * (h - 38);
      g.strokeStyle = "rgba(255,255,255,0.1)"; g.fillStyle = "rgba(220,226,255,0.55)"; g.font = "10px Inter, sans-serif";
      for (const E of [80, 85, 90, 95, 100, 105]) { g.beginPath(); g.moveTo(X(E), 6); g.lineTo(X(E), h - 24); g.stroke(); g.fillText(String(E), X(E) - 8, h - 10); }
      for (const v of [0, 20, 40]) { g.beginPath(); g.moveTo(28, Y(v)); g.lineTo(w - 12, Y(v)); g.stroke(); g.fillText(String(v), 6, Y(v) + 3); }
      g.fillText("√s (GeV)", w - 56, h - 10); g.fillText("nb", 6, 12);
      g.strokeStyle = "#ff7a45"; g.lineWidth = 2.4; g.shadowColor = "#ff7a45"; g.shadowBlur = 8;
      g.beginPath();
      for (let E = 80; E <= 105; E += 0.1) { const x = X(E), y = Y(Math.min(sig(E), 45)); E === 80 ? g.moveTo(x, y) : g.lineTo(x, y); }
      g.stroke(); g.shadowBlur = 0;
      const e = clamp(sqrtS(), 80, 105);
      g.strokeStyle = "#fff"; g.lineWidth = 1; g.beginPath(); g.moveTo(X(e), 6); g.lineTo(X(e), h - 24); g.stroke();
      g.fillStyle = "#fff"; g.beginPath(); g.arc(X(e), Y(Math.min(sig(e), 45)), 4.5, 0, 6.2832); g.fill();
      const fora = sqrtS() < 80 || sqrtS() > 105;
      g.fillStyle = "rgba(235,240,255,0.9)"; g.font = "600 11px Inter, sans-serif";
      g.fillText(fora ? `√s = ${fmtE(sqrtS())} (fora da janela)` : `√s = ${F.num(sqrtS(), 2)} GeV: ${F.num(sig(sqrtS()), 1)} nb`, 36, 20);
    }
    zCanvas.style.cssText = "display:block;width:100%;height:180px;border-radius:12px;background:rgba(0,0,0,0.3);border:1px solid var(--stroke-soft)";

    // descoberta do Higgs
    const H = { lum: 0, bins: new Float32Array(30), descoberto: false, sig: 0 };
    const hCanvas = el("canvas", "mini-grafico");
    hCanvas.style.cssText = "display:block;width:100%;height:210px;border-radius:12px;background:rgba(0,0,0,0.3);border:1px solid var(--stroke-soft)";
    const hInfo = el("div", "res-ok");
    const bkg = (m) => 29 * Math.exp(-(m - 125) / 28);
    const sinal = (m) => (6 / (1.7 * 2.5066)) * Math.exp(-0.5 * Math.pow((m - 125.1) / 1.7, 2)) * 2;
    const sigmaH = (sq) => (sq < 500 ? 0 : 55 * Math.pow(Math.min((sq / 1000 - 0.5) / 12.5, 1.1), 1.5));
    function fatorSinal() { return sigmaH(sqrtS()) / 25.6; }
    function coletar(dL) {
      for (let i = 0; i < 30; i++) {
        const m = 100 + i * 2 + 1;
        const bk = bkg(m) * dL;
        H.bins[i] += poisson(bk + fatorSinal() * sinal(m) * dL);
      }
      H.lum += dL;
      // significância na janela 122–128 GeV
      let n = 0, b = 0;
      for (let i = 11; i <= 13; i++) { n += H.bins[i]; b += bkg(100 + i * 2 + 1) * H.lum; }
      const s = Math.max(n - b, 0);
      H.sig = b > 0 && s > 0 ? Math.sqrt(2 * ((s + b) * Math.log(1 + s / b) - s)) : 0;
      if (H.sig >= 5 && !H.descoberto) { H.descoberto = true; LAB.som.tom(784, 0.5, 0.1, "triangle", 1568); LAB.som.vibrar(200); }
      desenharH();
    }
    function desenharH() {
      if (cHiggs.hidden) return;
      const r = hCanvas.getBoundingClientRect();
      if (r.width < 10) return;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const w = Math.round(r.width), h = Math.round(r.height);
      if (hCanvas.width !== w * dpr) { hCanvas.width = w * dpr; hCanvas.height = h * dpr; }
      const g = hCanvas.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
      const x0 = 34, x1 = w - 10, y0 = 10, y1 = h - 26;
      let mx = 10;
      for (let i = 0; i < 30; i++) mx = Math.max(mx, H.bins[i] * 1.2, bkg(101 + i * 2) * Math.max(H.lum, 1) * 1.1);
      const X = (m) => x0 + ((m - 100) / 60) * (x1 - x0), Y = (v) => y1 - (v / mx) * (y1 - y0);
      g.strokeStyle = "rgba(255,255,255,0.08)"; g.fillStyle = "rgba(220,226,255,0.55)"; g.font = "10px Inter, sans-serif";
      for (const m of [100, 110, 120, 130, 140, 150, 160]) { g.beginPath(); g.moveTo(X(m), y0); g.lineTo(X(m), y1); g.stroke(); g.fillText(String(m), X(m) - 8, h - 10); }
      g.fillText("massa de dois fótons (GeV)", x0 + 6, h - 1 - 0);
      g.fillStyle = "rgba(255,210,63,0.08)"; g.fillRect(X(122), y0, X(128) - X(122), y1 - y0);
      // barras
      for (let i = 0; i < 30; i++) {
        const v = H.bins[i];
        const bw = (x1 - x0) / 30 - 1;
        g.fillStyle = i >= 11 && i <= 13 ? "rgba(255,210,63,0.85)" : "rgba(120,170,255,0.75)";
        g.fillRect(X(100 + i * 2) + 0.5, Y(v), bw, y1 - Y(v));
      }
      // fundo esperado
      g.strokeStyle = "#ff5a7a"; g.lineWidth = 2; g.setLineDash([5, 4]);
      g.beginPath();
      for (let m = 100; m <= 160; m += 1) { const v = bkg(m) * H.lum; m === 100 ? g.moveTo(X(m), Y(v)) : g.lineTo(X(m), Y(v)); }
      g.stroke(); g.setLineDash([]);
      g.fillStyle = "#ff8aa0"; g.fillText("fundo esperado", x1 - 78, y0 + 12);
      g.fillStyle = "#fff"; g.font = "600 11px Inter, sans-serif";
      g.fillText(`${F.num(H.lum, 0)} fb⁻¹ coletados`, x0 + 6, y0 + 12);
      const corS = H.sig >= 5 ? "#5df0b0" : H.sig >= 3 ? "#ffd23f" : "#c8d0f0";
      hInfo.className = H.sig >= 5 ? "res-ok" : "res-aviso";
      hInfo.innerHTML = H.sig >= 5
        ? `<b>5σ: descoberta!</b> Significância ${F.num(H.sig, 1)}σ. Em 4 de julho de 2012, o ATLAS e o CMS anunciaram a descoberta do bóson de Higgs.<br><small>Dados sintéticos, modelados no formato real dos resultados.</small>`
        : H.lum === 0 ? "Colete dados para procurar o Higgs. Cada fb⁻¹ equivale a bilhões de colisões."
        : `Significância: <b style="color:${corS}">${F.num(H.sig, 1)}σ</b> ${H.sig >= 3 ? "(indício)" : "(ainda só ruído)"}. Para declarar descoberta são necessários <b>5σ</b>.${fatorSinal() < 0.3 ? "<br><small>Com essa energia o Higgs é produzido muito pouco. Aumente a energia.</small>" : ""}`;
    }
    const btColeta = ui.botao("Coletar 1 fb⁻¹", () => coletar(1), "sec");
    const btColeta10 = ui.botao("Coletar 10 fb⁻¹", () => coletar(10));
    const btZera = ui.botao("Zerar", () => { H.bins.fill(0); H.lum = 0; H.sig = 0; H.descoberto = false; desenharH(); }, "sec");
    const lH = el("div", "linha-bt"); lH.append(btColeta, btColeta10, btZera);
    const cHiggs = ui.cartao("Descubra o bóson de Higgs", hCanvas);
    cHiggs.append(el("div", "esp"), lH, el("div", "esp"), hInfo);
    cHiggs.insertAdjacentHTML("beforeend", `<small class="dica">Procurando pares de fótons: o Higgs aparece como um pequeno morro sobre o ruído, perto de 125 GeV. Um evento sozinho não prova nada; a descoberta vem da estatística.</small>`);

    const cComo = ui.cartao("Como funciona um colisionador", `
      <p>Ímãs supercondutores <b>curvam</b> os feixes ao longo do anel e cavidades de rádiofrequência <b>aceleram</b> as partículas a cada volta. Quanto mais energia, mais forte tem de ser o campo dos ímãs.</p>
      <p>Na colisão, a energia vira massa (E = mc²): partículas novas surgem. O detector, em camadas, mede o que sai: o <b>traçador</b> segue as cargas (o campo magnético as curva: mais curvo = menos energia), os <b>calorímetros</b> medem a energia e os <b>múons</b> atravessam tudo.</p>`);

    ctl.append(cFeixes, cEnergia, cEventos, cProd, cZ, cHiggs, cComo);

    // ---------- início ----------
    cZ.hidden = true;
    S.tipoSel = "bm";
    montarEventos();
    atualizarNumeros();
    produtosCorpo.innerHTML = `<p class="dica-vazia">Aperte <b>Colidir</b> para ver as partículas produzidas.</p>`;
    desenharH();
    new ResizeObserver(() => { desenharZ(); desenharH(); }).observe(ctl);

    return {
      iniciar() { cena.iniciar(); setTimeout(() => { desenharZ(); desenharH(); }, 100); },
      parar() { cena.parar(); },
      _cena: cena, _S: S, _gerar: gerar,
    };
  }

  LAB.modulos.push({
    id: "acelerador",
    nome: "Acelerador",
    resumo: "Colida partículas e veja o que nasce",
    cor: "#a46bff",
    selo: "parcial",
    icone: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><path d="M12 3v4.5M12 16.5V21M3 12h4.5M16.5 12H21"/></svg>',
    nota: {
      real: [
        "Os números do acelerador: energia, fator de Lorentz, velocidade (com as casas decimais corretas), campo dos ímãs, voltas por segundo e perda por radiação síncrotron, calculados com as fórmulas da relatividade e do eletromagnetismo para o anel de 26,7 km.",
        "A trajetória das partículas no detector: o raio de curvatura é pT / (0,3·B), com B = 3,8 T, como num detector real.",
        "A curva do pico do Z⁰ (fórmula de Breit-Wigner) e as proporções de decaimento do Z⁰ medidas no LEP.",
        "As leis de conservação e os limiares de energia para produzir cada partícula.",
        "A multiplicidade de partículas cresce com a energia como nos dados do LHC.",
      ],
      simplificado: [
        "Os eventos são sorteados por um modelo educativo, não por um gerador de física completo (como o Pythia). A forma geral é realista, os detalhes não.",
        "O detector é visto em corte, em 2D, e as partículas não têm ângulo de saída. A velocidade na tela não é a real.",
        "Os dados do Higgs são sintéticos, com o formato do resultado de 2012.",
        "As probabilidades de cada processo são aproximadas.",
      ],
    },
    criar,
  });
})();
