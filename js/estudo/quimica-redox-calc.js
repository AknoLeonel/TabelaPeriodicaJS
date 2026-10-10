/*
 * Motor de química: número de oxidação, oxirredução (com semirreações em meio
 * ácido ou básico), equações iônicas (dupla troca) e eletroquímica.
 * Funções puras (rodam em Node e no navegador).
 */
(function (raiz) {
  "use strict";
  const node = typeof module !== "undefined" && module.exports;
  const Q = node ? require("./quimica-calc.js") : raiz.QCalc;

  const N = (v, sig = 4) => (isFinite(v) ? Q.num(Math.abs(v) < 1e-12 ? 0 : v, sig).replace(/^-/, "−") : "—");
  const frac = Q.frac;
  const eq = (h) => `<div class="eq">${h}</div>`;
  const R = (t, h) => ({ t, h });
  const dica = (h) => `<small class="dica">${h}</small>`;
  const aviso = (h) => `<p class="aviso-exc"><b>Atenção:</b> ${h}</p>`;
  const erro = (m) => ({ ok: false, erro: m });
  const tabela = (cab, linhas) => `<div class="tab-rolar"><table class="tb"><thead><tr>${cab.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${linhas.map((l) => `<tr>${l.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  const FARADAY = 96485.33, RGAS = 8.314;
  const V = (x) => x.toFixed(2).replace(".", ",").replace("-", "−");

  // ---------------------------------------------------------------------------
  // Espécies com carga: "MnO4^-", "Fe^3+", "SO4^2-", "Fe³⁺"
  // ---------------------------------------------------------------------------
  const SUPS = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9" };
  function lerEspecie(txt) {
    let s = String(txt || "").trim().replace(/[₀-₉]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 8272)).replace(/\((aq|s|l|g)\)$/i, "");
    // sobrescritos unicode viram ^n±
    s = s.replace(/([⁰¹²³⁴⁵⁶⁷⁸⁹]*)([⁺⁻])$/, (_, d, sg) => "^" + [...d].map((c) => SUPS[c]).join("") + (sg === "⁺" ? "+" : "-"));
    let carga = 0;
    let m = /\^(\d*)([+-])$/.exec(s), d = null, sg = null;
    if (m) { d = m[1]; sg = m[2]; }
    else if ((m = /\^([+-])(\d*)$/.exec(s))) { d = m[2]; sg = m[1]; }
    if (m) {
      carga = (sg === "-" ? -1 : 1) * (d ? parseInt(d, 10) : 1);
      s = s.slice(0, m.index);
    }
    if (s === "e") return { ok: true, f: "e", carga: -1, cont: {}, eletron: true };
    const p = Q.parseFormula(s);
    if (!p.ok) return { ok: false, erro: p.erro };
    return { ok: true, f: s, carga, cont: p.contagem, ordem: p.ordem };
  }
  const supCarga = (c) => (c === 0 ? "" : `<sup>${Math.abs(c) === 1 ? "" : Math.abs(c)}${c > 0 ? "+" : "−"}</sup>`);
  const htmlEsp = (e) => (e.eletron ? "e<sup>−</sup>" : Q.fq(e.f) + supCarga(e.carga));

  // ---------------------------------------------------------------------------
  // Número de oxidação
  // ---------------------------------------------------------------------------
  let mapaEl = null;
  const dadosEl = (s) => { if (!mapaEl) { mapaEl = {}; for (const d of raiz.DADOS || []) mapaEl[d.s] = d; } return mapaEl[s]; };
  const G1 = ["Li", "Na", "K", "Rb", "Cs", "Fr"], G2 = ["Be", "Mg", "Ca", "Sr", "Ba", "Ra"];
  const HAL = ["Cl", "Br", "I"];
  // nox negativo típico de não metais (para casos com duas incógnitas)
  const NEG = { N: -3, P: -3, As: -3, C: -4, Si: -4, S: -2, Se: -2, Te: -2, O: -2, F: -1, Cl: -1, Br: -1, I: -1, H: -1 };
  const fracTxt = (v) => {
    if (Number.isInteger(v)) return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v);
    for (let d = 2; d <= 12; d++) { const nn = Math.round(v * d); if (Math.abs(nn / d - v) < 1e-9) return `${v > 0 ? "+" : "−"}${frac(String(Math.abs(nn)), String(d))}`; }
    return N(v);
  };
  function nox(txt) {
    const e = typeof txt === "string" ? lerEspecie(txt) : txt;
    if (!e.ok) return e;
    if (e.eletron) return erro("O elétron não tem número de oxidação.");
    const els = Object.keys(e.cont);
    const passos = [];
    const regras = [];
    const v = {};
    const metais = (s) => G1.includes(s) || G2.includes(s);
    const add = (s, val, regra) => { v[s] = val; regras.push([s, fracTxt(val), regra]); };
    passos.push(R("A espécie", `${eq(htmlEsp(e))}<p>${e.carga ? `É um íon de carga <b>${e.carga > 0 ? "+" : "−"}${Math.abs(e.carga)}</b>: a soma dos Nox deve dar ${e.carga}.` : "É neutra: a soma dos Nox de todos os átomos deve dar <b>zero</b>."}</p>`));
    if (els.length === 1) {
      const s = els[0], n = e.cont[s];
      const val = e.carga / n;
      add(s, val, e.carga === 0 ? "Substância simples: Nox = 0" : `Íon simples: Nox = carga${n > 1 ? " ÷ número de átomos" : ""}`);
    } else {
      for (const s of els) {
        if (G1.includes(s)) add(s, 1, "Metal alcalino (grupo 1): sempre +1");
        else if (G2.includes(s)) add(s, 2, "Metal alcalinoterroso (grupo 2): sempre +2");
        else if (s === "Al") add(s, 3, "Alumínio: +3");
        else if (s === "Zn") add(s, 2, "Zinco: +2");
        else if (s === "Ag") add(s, 1, "Prata: +1");
        else if (s === "F") add(s, -1, "Flúor (o mais eletronegativo): sempre −1");
      }
      const soMetaisEH = els.every((s) => s === "H" || metais(s));
      if (e.cont.H && !("H" in v) && !soMetaisEH) add("H", 1, "Hidrogênio ligado a não metal: +1");
      const desconhecidos = () => els.filter((s) => !(s in v));
      // O = −2, exceto quando é a única incógnita (peróxidos, superóxidos, OF2)
      if (e.cont.O && !("O" in v) && desconhecidos().length > 1) add("O", -2, "Oxigênio: −2 (regra geral)");
      // halogênios −1 quando não há O nem halogênio mais eletronegativo
      for (const s of HAL) if (e.cont[s] && !(s in v) && !e.cont.O && desconhecidos().length > 1) {
        const maisEN = HAL.slice(0, HAL.indexOf(s)).some((h) => e.cont[h]);
        if (!maisEN) add(s, -1, "Halogênio sem oxigênio: −1");
      }
      let falta = desconhecidos();
      let ambiguo = false;
      // sal/ácido/base com íon conhecido: calcula o Nox dentro do ânion separadamente
      if (falta.length > 1 && e.carga === 0) {
        const dd = decompor(e.f);
        if (dd && dd.an[0].length > 1 && /^[A-Z][a-z]?$/.test(dd.cat[0])) {
          const rA = nox(lerEspecie(`${dd.an[0]}^${-dd.an[1]}-`));
          if (rA.ok) {
            if (!(dd.cat[0] in v)) add(dd.cat[0], dd.cat[1], `Cátion ${dd.cat[0]}${supCarga(dd.cat[1])} (a carga vem do ânion ${Q.fq(dd.an[0])}${supCarga(dd.an[1])})`);
            for (const k in rA.nox) if (!(k in v)) add(k, rA.nox[k], `Dentro do ânion ${Q.fq(dd.an[0])}${supCarga(dd.an[1])}`);
            falta = desconhecidos();
          }
        }
      }
      if (falta.length > 1) {
        // fixa o mais eletronegativo no Nox negativo típico
        falta.sort((a, b) => ((dadosEl(b) || {}).en || 0) - ((dadosEl(a) || {}).en || 0));
        while (falta.length > 1) {
          const s = falta[0];
          add(s, NEG[s] != null ? NEG[s] : -((dadosEl(s) || {}).g > 12 ? 18 - dadosEl(s).g : 2), "Mais eletronegativo da espécie: Nox negativo típico (suposição)");
          falta = desconhecidos();
          ambiguo = true;
        }
      }
      if (falta.length === 1) {
        const s = falta[0];
        const soma = els.filter((x) => x !== s).reduce((t, x) => t + v[x] * e.cont[x], 0);
        const val = (e.carga - soma) / e.cont[s];
        passos.push(R(`Descubra o Nox de ${s} pela soma`, `${eq(`${els.map((x) => (x === s ? `${e.cont[x] > 1 ? e.cont[x] : ""}·x` : `${e.cont[x]}·(${fracTxt(v[x])})`)).join(" + ")} = ${e.carga}`)}${eq(`${e.cont[s] > 1 ? e.cont[s] + "x" : "x"} = ${e.carga} − (${N(soma)}) = ${N(e.carga - soma)} → x = <b>${fracTxt(val)}</b>`)}`));
        add(s, val, "Pela soma (carga total)");
      }
      const total = els.reduce((t, x) => t + v[x] * e.cont[x], 0);
      if (Math.abs(total - e.carga) > 1e-9) {
        // regra geral falhou: H ou O fora da regra (hidretos, peróxidos)
        return erro("As regras usuais não fecham a soma para essa espécie. Confira a fórmula e a carga (ex.: SO4^2-, NH4^+).");
      }
      if (ambiguo) passos.push(R("Atenção", aviso("Havia mais de um elemento sem regra fixa. Supusemos o Nox típico do mais eletronegativo; em espécies como FeS₂ (pirita) ou S₂O₃²⁻ os átomos do mesmo elemento podem ter Nox diferentes.")));
    }
    passos.splice(1, 0, R("Regras aplicadas", tabela(["Elemento", "Nox", "Por quê"], regras.map((r) => [r[0], `<b>${r[1]}</b>`, r[2]]))));
    const frac_ = Object.entries(v).filter(([, x]) => !Number.isInteger(x));
    if (frac_.length) passos.push(R("Nox fracionário", `<p>${frac_.map(([s]) => s).join(", ")} ficou com Nox fracionário: é um <b>Nox médio</b>. Os átomos desse elemento têm Nox diferentes entre si (ex.: no Fe₃O₄ há Fe²⁺ e Fe³⁺).</p>`));
    passos.push(R("Confira a soma", eq(`${els.map((x) => `${e.cont[x]}·(${fracTxt(v[x])})`).join(" + ")} = <b>${N(els.reduce((t, x) => t + v[x] * e.cont[x], 0))}</b> = carga ✓`)));
    return { ok: true, passos, nox: v, especie: e, resposta: els.map((s) => `${s}: ${fracTxt(v[s]).replace(/<[^>]+>/g, "")}`).join(", "), respostaHTML: els.map((s) => `${s} <b>${fracTxt(v[s])}</b>`).join(" · ") };
  }

  // ---------------------------------------------------------------------------
  // Álgebra exata para balancear com carga (espaço nulo)
  // ---------------------------------------------------------------------------
  const babs = (a) => (a < 0n ? -a : a);
  const bgcd = (a, b) => { a = babs(a); b = babs(b); while (b) [a, b] = [b, a % b]; return a || 1n; };
  const fr = (n, d = 1n) => { if (d < 0n) { n = -n; d = -d; } const g = bgcd(n, d); return [n / g, d / g]; };
  const fsub = (a, b) => fr(a[0] * b[1] - b[0] * a[1], a[1] * b[1]);
  const fmul = (a, b) => fr(a[0] * b[0], a[1] * b[1]);
  const fdiv = (a, b) => fr(a[0] * b[1], a[1] * b[0]);
  // A·c = 0, devolve vetor inteiro (ou null se a dimensão do espaço nulo ≠ 1)
  function espacoNulo(A) {
    const m = A.length, n = A[0].length;
    const M = A.map((l) => l.map((x) => fr(BigInt(x))));
    const piv = [];
    let r = 0;
    for (let c = 0; c < n && r < m; c++) {
      let p = -1;
      for (let i = r; i < m; i++) if (M[i][c][0] !== 0n) { p = i; break; }
      if (p < 0) continue;
      [M[r], M[p]] = [M[p], M[r]];
      const pv = M[r][c];
      M[r] = M[r].map((x) => fdiv(x, pv));
      for (let i = 0; i < m; i++) if (i !== r && M[i][c][0] !== 0n) { const k = M[i][c]; M[i] = M[i].map((x, j) => fsub(x, fmul(k, M[r][j]))); }
      piv.push(c); r++;
    }
    const livres = [...Array(n).keys()].filter((c) => !piv.includes(c));
    if (livres.length !== 1) return null;
    const L = livres[0];
    const sol = Array(n).fill(null).map(() => fr(0n));
    sol[L] = fr(1n);
    piv.forEach((c, i) => { sol[c] = fr(-M[i][L][0], M[i][L][1]); });
    let mmc = 1n;
    for (const s of sol) mmc = (mmc * s[1]) / bgcd(mmc, s[1]);
    let ints = sol.map((s) => (s[0] * mmc) / s[1]);
    let g = 0n;
    for (const x of ints) g = bgcd(g, x);
    ints = ints.map((x) => x / g);
    return ints.map(Number);
  }
  // espécies: [{e (lerEspecie), lado: 1 reagente | -1 produto | 0 livre}] → coeficientes
  function balancearCarga(esp) {
    const els = [];
    for (const s of esp) for (const k of Object.keys(s.e.cont)) if (!els.includes(k)) els.push(k);
    const A = els.map((k) => esp.map((s) => (s.e.cont[k] || 0) * (s.lado === -1 ? -1 : 1)));
    A.push(esp.map((s) => s.e.carga * (s.lado === -1 ? -1 : 1)));
    let c = espacoNulo(A);
    if (!c) return null;
    const fixos = () => esp.map((s, i) => c[i]).filter((x, i) => esp[i].lado !== 0);
    if (fixos().some((x) => x === 0)) return null;
    if (fixos().every((x) => x < 0)) c = c.map((x) => -x);
    if (fixos().some((x) => x < 0)) return null;
    return c;
  }

  // ---------------------------------------------------------------------------
  // Oxirredução numa equação
  // ---------------------------------------------------------------------------
  function lerLadoEsp(l) {
    return l.split(/\s\+\s|\+(?=\s*[A-Z(\[])/).map((x) => x.trim()).filter(Boolean).map((x) => x.replace(/^\d+\s*(?=[A-Z(\[])/, ""));
  }
  function redox(p) {
    const txt = String(p.eq || "").replace(/→|⟶|=>|=/g, "->");
    const lados = txt.split("->");
    if (lados.length !== 2 || !lados[0].trim() || !lados[1].trim()) return erro("Escreva a equação com uma seta: Zn + Cu^2+ -> Zn^2+ + Cu.");
    const reag = lerLadoEsp(lados[0]).map(lerEspecie), prod = lerLadoEsp(lados[1]).map(lerEspecie);
    const bad = [...reag, ...prod].find((x) => !x.ok);
    if (bad) return bad;
    const meio = p.meio || "auto";
    const passos = [];
    // Nox de cada espécie
    const nx = (e) => { const r = nox(e); return r.ok ? r.nox : null; };
    const noxR = reag.map(nx), noxP = prod.map(nx);
    if ([...noxR, ...noxP].some((x) => !x)) return erro("Não consegui atribuir Nox a alguma espécie. Confira as fórmulas e cargas (use ^ para carga: Fe^3+, MnO4^-).");
    const linhaNox = (e, v) => `${htmlEsp(e)}: ${Object.keys(v).map((s) => `${s} ${fracTxt(v[s])}`).join(", ")}`;
    passos.push(R("Nox de cada espécie", `<div class="lista-itens">${reag.map((e, i) => `<div class="item"><span class="item-n">Reagente</span>${linhaNox(e, noxR[i])}</div>`).join("")}${prod.map((e, i) => `<div class="item"><span class="item-n">Produto</span>${linhaNox(e, noxP[i])}</div>`).join("")}</div>`));
    // variações
    const mudas = [];
    const elems = [...new Set(reag.flatMap((e) => Object.keys(e.cont)))];
    for (const s of elems) {
      if (s === "H" || s === "O") { /* checamos também, mas costumam não mudar */ }
      const ri = reag.findIndex((e) => e.cont[s]), pi = prod.findIndex((e) => e.cont[s]);
      if (ri < 0 || pi < 0) continue;
      const nr = noxR[ri][s];
      for (let j = 0; j < prod.length; j++) {
        if (!prod[j].cont[s]) continue;
        const np = noxP[j][s];
        if (Math.abs(np - nr) > 1e-9) mudas.push({ s, ri, pj: j, nr, np, d: np - nr });
      }
    }
    if (!mudas.length) {
      passos.push(R("Nenhum Nox mudou", "<p>Nenhum elemento mudou de Nox: <b>não é uma reação de oxirredução</b> (pode ser ácido-base, precipitação, etc.).</p>"));
      return { ok: true, passos, redox: false, resposta: "Não é oxirredução", respostaHTML: "<b>Não é oxirredução</b> (nenhum Nox muda)" };
    }
    const ox = mudas.filter((m) => m.d > 0), red = mudas.filter((m) => m.d < 0);
    if (!ox.length || !red.length) return erro("Encontrei só oxidação ou só redução: confira a equação (falta algum produto?).");
    const desc = (m) => `${m.s}: ${fracTxt(m.nr)} → ${fracTxt(m.np)} (${m.d > 0 ? "perde" : "ganha"} ${N(Math.abs(m.d))} e⁻ por átomo)`;
    const agOx = [...new Set(red.map((m) => m.ri))].map((i) => htmlEsp(reag[i])).join(", ");
    const agRed = [...new Set(ox.map((m) => m.ri))].map((i) => htmlEsp(reag[i])).join(", ");
    passos.push(R("Quem oxida e quem reduz", `<div class="lista-itens"><div class="item"><span class="item-n">Oxidação (Nox aumenta)</span>${ox.map(desc).join("<br>")}</div><div class="item"><span class="item-n">Redução (Nox diminui)</span>${red.map(desc).join("<br>")}</div></div><p><b>Agente redutor</b> (sofre a oxidação, doa elétrons): ${agRed}.<br><b>Agente oxidante</b> (sofre a redução, recebe elétrons): ${agOx}.</p>`));
    // balanceamento por átomos + carga, adicionando H2O/H+/OH- se precisar
    const esp = [...reag.map((e) => ({ e, lado: 1 })), ...prod.map((e) => ({ e, lado: -1 }))];
    let coef = balancearCarga(esp), extras = [];
    const temCarga = [...reag, ...prod].some((e) => e.carga !== 0);
    if (!coef) {
      const opc = meio === "basico" ? [["H2O", "OH^-"]] : meio === "acido" ? [["H2O", "H^+"]] : [["H2O", "H^+"], ["H2O", "OH^-"], ["H2O"]];
      for (const add of opc) {
        const ex = add.map((f) => ({ e: lerEspecie(f), lado: 0 }));
        const c = balancearCarga([...esp, ...ex]);
        if (c) { coef = c; extras = ex; break; }
      }
    }
    if (!coef) return { ok: false, erro: "Não consegui balancear (nem acrescentando H₂O, H⁺ ou OH⁻). Confira as espécies.", passos };
    const todas = [...esp, ...extras];
    const L = [], Rr = [];
    todas.forEach((s, i) => {
      const c = coef[i];
      if (c === 0) return;
      const lado = s.lado === 0 ? (c > 0 ? 1 : -1) : s.lado;
      (lado === 1 ? L : Rr).push(`${Math.abs(c) === 1 ? "" : Math.abs(c) + " "}${htmlEsp(s.e)}`);
    });
    const global = `${L.join(" + ")} → ${Rr.join(" + ")}`;
    // elétrons contados pelos produtos em que o Nox mudou (só os átomos que realmente mudam)
    const nr = reag.length;
    const contar = (lista) => { const vistos = new Set(); let t = 0; for (const m of lista) { const k = m.s + "|" + m.pj; if (vistos.has(k)) continue; vistos.add(k); t += Math.abs(m.d) * prod[m.pj].cont[m.s] * coef[nr + m.pj]; } return t; };
    const eTot = contar(ox), eRed = contar(red);
    passos.push(R("Elétrons transferidos", `${eq(`elétrons perdidos = ${ox.map((m) => `${N(Math.abs(m.d))} × ${prod[m.pj].cont[m.s]} × ${coef[nr + m.pj]}`).join(" + ")} = <b>${N(eTot)}</b>`)}${eq(`elétrons ganhos = ${red.map((m) => `${N(Math.abs(m.d))} × ${prod[m.pj].cont[m.s]} × ${coef[nr + m.pj]}`).join(" + ")} = <b>${N(eRed)}</b>`)}<p>${Math.abs(eTot - eRed) < 1e-9 ? "Iguais ✓: todo elétron que um perde, o outro ganha." : "Atenção: perdas e ganhos diferem; confira a equação."}</p><small class="dica">Conta: variação do Nox × átomos do elemento na fórmula do produto × coeficiente.</small>`));
    return { ok: true, passos, redox: true, eletrons: eTot, coef, global, valor: eTot, resposta: `${global.replace(/<[^>]+>/g, "")} (${eTot} e⁻)`, respostaHTML: `${global}<br><small>${N(eTot)} elétrons transferidos · oxidante: ${agOx} · redutor: ${agRed}</small>` };
  }

  // ---------------------------------------------------------------------------
  // Equações iônicas (dupla troca)
  // ---------------------------------------------------------------------------
  const CATIONS = [
    ["NH4", 1, "amônio"], ["Li", 1, "lítio"], ["Na", 1, "sódio"], ["K", 1, "potássio"], ["Rb", 1, "rubídio"], ["Cs", 1, "césio"], ["Ag", 1, "prata"], ["H", 1, "hidrogênio"],
    ["Mg", 2, "magnésio"], ["Ca", 2, "cálcio"], ["Sr", 2, "estrôncio"], ["Ba", 2, "bário"], ["Zn", 2, "zinco"], ["Ni", 2, "níquel"], ["Co", 2, "cobalto"], ["Mn", 2, "manganês"], ["Cd", 2, "cádmio"],
    ["Al", 3, "alumínio"], ["Cr", 3, "crômio(III)"], ["Fe", 0, "ferro"], ["Cu", 0, "cobre"], ["Pb", 0, "chumbo"], ["Sn", 0, "estanho"], ["Hg", 0, "mercúrio"],
  ];
  const ANIONS = [
    ["CH3COO", -1, "acetato"], ["NO3", -1, "nitrato"], ["NO2", -1, "nitrito"], ["ClO4", -1, "perclorato"], ["ClO3", -1, "clorato"], ["ClO", -1, "hipoclorito"], ["MnO4", -1, "permanganato"], ["HCO3", -1, "bicarbonato"], ["HSO4", -1, "bissulfato"], ["OH", -1, "hidróxido"], ["CN", -1, "cianeto"],
    ["F", -1, "fluoreto"], ["Cl", -1, "cloreto"], ["Br", -1, "brometo"], ["I", -1, "iodeto"],
    ["SO4", -2, "sulfato"], ["SO3", -2, "sulfito"], ["CO3", -2, "carbonato"], ["CrO4", -2, "cromato"], ["Cr2O7", -2, "dicromato"], ["C2O4", -2, "oxalato"], ["S", -2, "sulfeto"], ["O", -2, "óxido"],
    ["PO4", -3, "fosfato"],
  ];
  const ACIDOS_FORTES = ["HCl", "HBr", "HI", "HNO3", "H2SO4", "HClO4", "HClO3"];
  const GASES = ["CO2", "SO2", "H2S", "NH3"];
  const romano = (n) => ["", "I", "II", "III", "IV"][n] || String(n);
  function grupo(txt) {
    // "(NH4)2" | "NH4" | "Al2" → {ion, n}
    const m = /^\(([A-Za-z0-9]+)\)(\d*)$/.exec(txt) || /^([A-Za-z]+?)(\d*)$/.exec(txt);
    return m ? { ion: m[1], n: m[2] ? parseInt(m[2], 10) : 1 } : null;
  }
  function decompor(f) {
    if (f === "CH3COOH") return { cat: ["H", 1, "hidrogênio"], nc: 1, an: ANIONS[0], na: 1 };
    for (const c of CATIONS) {
      const re = new RegExp(`^(\\(${c[0]}\\)\\d+|${c[0]}\\d*)(?![a-z])`);
      const m = re.exec(f);
      if (!m) continue;
      const g = { n: parseInt(m[1].slice(m[1].indexOf(c[0]) + c[0].length).replace(/\D/g, ""), 10) || 1 };
      const resto = f.slice(m[1].length);
      if (!resto) continue;
      for (const a of ANIONS) {
        const gA = grupo(resto);
        let na = null;
        if (resto === a[0]) na = 1;
        else if (gA && gA.ion === a[0] && (/^\(/.test(resto) || /^[A-Z][a-z]?$/.test(a[0]))) na = gA.n;
        else if (new RegExp(`^${a[0]}(\\d+)$`).test(resto) && /^[A-Z][a-z]?$/.test(a[0])) na = parseInt(resto.slice(a[0].length), 10);
        if (na == null) continue;
        let q = c[1];
        if (q === 0) { q = (-a[1] * na) / g.n; if (!Number.isInteger(q) || q < 1 || q > 4) continue; }
        if (q * g.n + a[1] * na !== 0) continue;
        return { cat: [c[0], q, c[1] === 0 ? `${c[2]}(${romano(q)})` : c[2]], nc: g.n, an: a, na };
      }
    }
    return null;
  }
  const mdc = (a, b) => (b ? mdc(b, a % b) : a);
  function montar(cat, an) {
    // cat = [ion, carga, nome]; an = [ion, carga, nome]
    const qc = cat[1], qa = -an[1];
    const l = (qc * qa) / mdc(qc, qa);
    const nc = l / qc, na = l / qa;
    const poli = (s) => /[A-Z].*[A-Z]|\d/.test(s.replace(/^[A-Z][a-z]?$/, ""));
    const parte = (s, k) => (k === 1 ? s : poli(s) ? `(${s})${k}` : `${s}${k}`);
    if (cat[0] === "H" && an[0] === "CH3COO") return "CH3COOH";
    if (cat[0] === "H" && an[0] === "OH") return "H2O";
    return parte(cat[0], nc) + parte(an[0], na);
  }
  function soluvel(cat, an) {
    const c = cat[0], a = an[0];
    const g1 = ["Li", "Na", "K", "Rb", "Cs", "NH4"].includes(c);
    if (c === "H") return true;
    if (g1 || ["NO3", "CH3COO", "ClO4", "ClO3", "NO2", "MnO4", "HCO3"].includes(a)) return true;
    if (["Cl", "Br", "I"].includes(a)) return !["Ag", "Pb", "Hg"].includes(c) || (c === "Hg" && cat[1] === 2 && a !== "I");
    if (a === "SO4") return !["Ba", "Sr", "Pb", "Ca", "Ag", "Hg"].includes(c) || (c === "Hg" && cat[1] === 2);
    if (a === "OH") return ["Ba", "Sr"].includes(c);
    if (a === "F") return !["Ca", "Mg", "Ba", "Sr", "Pb"].includes(c);
    if (a === "CrO4") return !["Ag", "Ba", "Pb", "Sr"].includes(c);
    if (a === "S") return ["Mg", "Ca", "Sr", "Ba"].includes(c);
    return false; // CO3, PO4, SO3, C2O4, O, CN (simplificação)
  }
  const ehAcidoForte = (f) => ACIDOS_FORTES.includes(f);
  function classe(f) {
    // como a substância aparece na equação iônica
    if (f === "H2O") return { tipo: "molecular", motivo: "água (eletrólito muito fraco)" };
    if (GASES.includes(f)) return { tipo: "gas", motivo: "gás que escapa" };
    const d = decompor(f);
    if (!d) return { tipo: "molecular", motivo: "substância molecular" };
    if (d.cat[0] === "H") return ehAcidoForte(f) ? { tipo: "ions", d, motivo: "ácido forte (ioniza totalmente)" } : { tipo: "molecular", d, motivo: "ácido fraco (quase não ioniza)" };
    if (soluvel(d.cat, d.an)) return { tipo: "ions", d, motivo: d.an[0] === "OH" ? "base forte solúvel" : "sal solúvel" };
    return { tipo: "solido", d, motivo: `precipitado: ${d.an[2]} de ${d.cat[2]}${d.an[0] === "OH" && d.cat[0] === "Ca" ? " (pouco solúvel)" : ""}` };
  }
  function ionHTML(ion, q) { return Q.fq(ion) + supCarga(q); }
  function ionica(p) {
    const txt = String(p.reagentes || "").split(/->|→|=/)[0];
    const rs = lerLadoEsp(txt);
    if (rs.length !== 2) return erro("Digite dois reagentes, por exemplo: AgNO3 + NaCl.");
    const d = rs.map(decompor);
    const idx = d.findIndex((x) => !x);
    if (idx >= 0) return erro(`Não reconheci ${rs[idx]} como composto iônico, ácido ou base da tabela. Exemplos aceitos: AgNO3, Na2SO4, Ca(OH)2, HCl, (NH4)2CO3, CH3COOH.`);
    const passos = [];
    passos.push(R("Separe cada reagente em íons", tabela(["Reagente", "Cátion", "Ânion"], rs.map((f, i) => [Q.fq(f), `${d[i].nc > 1 ? d[i].nc + " " : ""}${ionHTML(d[i].cat[0], d[i].cat[1])} <small>(${d[i].cat[2]})</small>`, `${d[i].na > 1 ? d[i].na + " " : ""}${ionHTML(d[i].an[0], d[i].an[1])} <small>(${d[i].an[2]})</small>`]))));
    // dupla troca
    let p1 = montar(d[0].cat, d[1].an), p2 = montar(d[1].cat, d[0].an);
    const prods = [p1, p2];
    const extra = [];
    // decomposições
    const decomp = { H2CO3: ["H2O", "CO2"], H2SO3: ["H2O", "SO2"], NH4OH: ["NH3", "H2O"] };
    const finais = [];
    for (const f of prods) {
      if (decomp[f]) { finais.push(...decomp[f]); extra.push(`${Q.fq(f)} é instável e se decompõe em ${decomp[f].map(Q.fq).join(" + ")}`); }
      else if (f === "HS" || f === "H2S") finais.push("H2S");
      else finais.push(f);
    }
    passos.push(R("Troque os parceiros (dupla troca)", `<p>O cátion de um se junta ao ânion do outro, ajustando as quantidades para a carga fechar em zero:</p>${eq(`${rs.map(Q.fq).join(" + ")} → ${prods.map(Q.fq).join(" + ")}`)}${extra.length ? `<p>${extra.join("; ")}.</p>` : ""}`));
    const molTxt = `${rs.join(" + ")} -> ${finais.join(" + ")}`;
    const b = Q.balancear(molTxt);
    if (!b.ok) return { ok: false, erro: "Não consegui balancear a equação molecular: " + b.erro, passos };
    const especies = b.especies.map((e, i) => ({ f: e.f, c: b.coef[i], reag: i < b.nReag, cl: classe(e.f) }));
    const cf = (c) => (c === 1 ? "" : c + " ");
    passos.push(R("Equação molecular balanceada", eq(Q.textoEquacao(b))));
    // classificação
    passos.push(R("Como cada substância aparece em água", tabela(["Substância", "Em solução", "Por quê"], especies.map((e) => [Q.fq(e.f), e.cl.tipo === "ions" ? "íons separados" : e.cl.tipo === "solido" ? "<b>sólido (s)</b>" : e.cl.tipo === "gas" ? "<b>gás (g)</b>" : "molécula", e.cl.motivo]))));
    const forca = especies.some((e) => !e.reag && e.cl.tipo !== "ions");
    // equação iônica completa
    const ionsLado = (lado) => {
      const lista = [];
      for (const e of especies.filter((x) => x.reag === lado)) {
        if (e.cl.tipo === "ions") {
          lista.push({ k: e.cl.d.cat[0] + e.cl.d.cat[1], html: ionHTML(e.cl.d.cat[0], e.cl.d.cat[1]), n: e.c * e.cl.d.nc });
          lista.push({ k: e.cl.d.an[0] + e.cl.d.an[1], html: ionHTML(e.cl.d.an[0], e.cl.d.an[1]), n: e.c * e.cl.d.na });
        } else lista.push({ k: e.f, html: Q.fq(e.f) + (e.cl.tipo === "solido" ? "<sub>(s)</sub>" : e.cl.tipo === "gas" ? "<sub>(g)</sub>" : e.f === "H2O" ? "<sub>(l)</sub>" : ""), n: e.c, mol: true });
      }
      const m = new Map();
      for (const x of lista) { if (m.has(x.k)) m.get(x.k).n += x.n; else m.set(x.k, { ...x }); }
      return [...m.values()];
    };
    const Lc = ionsLado(true), Rc = ionsLado(false);
    const txtLado = (l) => l.map((x) => `${cf(x.n)}${x.html}`).join(" + ");
    passos.push(R("Equação iônica completa", eq(`${txtLado(Lc)} → ${txtLado(Rc)}`)));
    if (!forca) {
      passos.push(R("Não há reação", "<p>Todos os produtos continuam como íons livres em solução: nada precipita, não sai gás nem se forma água ou eletrólito fraco. Na prática <b>não ocorre reação</b> (só uma mistura de íons).</p>"));
      return { ok: true, passos, reacao: false, resposta: "Sem reação (todos os íons permanecem em solução)", respostaHTML: "<b>Sem reação</b>: todos os íons permanecem em solução" };
    }
    // espectadores
    const espect = Lc.filter((x) => !x.mol && Rc.some((y) => y.k === x.k && y.n === x.n));
    const Ln = Lc.filter((x) => !espect.some((y) => y.k === x.k)), Rn = Rc.filter((x) => !espect.some((y) => y.k === x.k));
    let g = 0; for (const x of [...Ln, ...Rn]) g = mdc(g, x.n);
    const Ls = Ln.map((x) => ({ ...x, n: x.n / g })), Rs = Rn.map((x) => ({ ...x, n: x.n / g }));
    const liquida = `${txtLado(Ls)} → ${txtLado(Rs)}`;
    passos.push(R("Risque os íons espectadores", `<p>Íons que aparecem iguais dos dois lados não participam: são <b>espectadores</b>: ${espect.length ? espect.map((x) => x.html).join(", ") : "nenhum"}.</p>${eq(`<b>${liquida}</b>`)}${g > 1 ? dica(`Os coeficientes foram divididos por ${g}.`) : ""}`));
    const motivo = especies.filter((e) => !e.reag && e.cl.tipo !== "ions").map((e) => `${Q.fq(e.f)} (${e.cl.motivo})`).join(", ");
    passos.push(R("Por que a reação acontece", `<p>A força motriz é a formação de: ${motivo}. Ela “retira” íons da solução.</p>`));
    return { ok: true, passos, reacao: true, liquida, espectadores: espect.map((x) => x.k), resposta: liquida.replace(/<sup>([^<]*)<\/sup>/g, "^$1").replace(/<[^>]+>/g, ""), respostaHTML: `${liquida}<br><small>espectadores: ${espect.map((x) => x.html).join(", ") || "nenhum"}</small>` };
  }

  // ---------------------------------------------------------------------------
  // Eletroquímica
  // ---------------------------------------------------------------------------
  // semirreação de redução: r (reagentes), p (produtos), n elétrons, E° (V, 25 °C)
  const S = (ox, red, n, E, nome, extra = {}) => ({ id: `${ox}|${red}`, ox, red, n, E, nome, ...extra });
  const POT = [
    S("F2", "2 F^-", 2, 2.87, "Flúor"), S("MnO4^- + 8 H^+", "Mn^2+ + 4 H2O", 5, 1.51, "Permanganato (ácido)"), S("Au^3+", "Au", 3, 1.5, "Ouro", { metal: "Au" }),
    S("Cl2", "2 Cl^-", 2, 1.36, "Cloro"), S("Cr2O7^2- + 14 H^+", "2 Cr^3+ + 7 H2O", 6, 1.33, "Dicromato (ácido)"), S("O2 + 4 H^+", "2 H2O", 4, 1.23, "Oxigênio (ácido)"),
    S("Br2", "2 Br^-", 2, 1.07, "Bromo"), S("Hg^2+", "Hg", 2, 0.85, "Mercúrio", { metal: "Hg" }), S("Ag^+", "Ag", 1, 0.8, "Prata", { metal: "Ag" }), S("Fe^3+", "Fe^2+", 1, 0.77, "Ferro(III)/Ferro(II)"),
    S("I2", "2 I^-", 2, 0.54, "Iodo"), S("O2 + 2 H2O", "4 OH^-", 4, 0.4, "Oxigênio (básico)"), S("Cu^2+", "Cu", 2, 0.34, "Cobre", { metal: "Cu" }), S("AgCl", "Ag + Cl^-", 1, 0.22, "Prata/cloreto de prata"),
    S("Sn^4+", "Sn^2+", 2, 0.15, "Estanho(IV)/(II)"), S("2 H^+", "H2", 2, 0, "Hidrogênio (padrão)"), S("Pb^2+", "Pb", 2, -0.13, "Chumbo", { metal: "Pb" }), S("Sn^2+", "Sn", 2, -0.14, "Estanho", { metal: "Sn" }),
    S("Ni^2+", "Ni", 2, -0.25, "Níquel", { metal: "Ni" }), S("Co^2+", "Co", 2, -0.28, "Cobalto", { metal: "Co" }), S("Cd^2+", "Cd", 2, -0.4, "Cádmio", { metal: "Cd" }), S("Fe^2+", "Fe", 2, -0.44, "Ferro", { metal: "Fe" }),
    S("Cr^3+", "Cr", 3, -0.74, "Crômio", { metal: "Cr" }), S("Zn^2+", "Zn", 2, -0.76, "Zinco", { metal: "Zn" }), S("2 H2O", "H2 + 2 OH^-", 2, -0.83, "Água (básico)"), S("Mn^2+", "Mn", 2, -1.18, "Manganês", { metal: "Mn" }),
    S("Al^3+", "Al", 3, -1.66, "Alumínio", { metal: "Al" }), S("Mg^2+", "Mg", 2, -2.37, "Magnésio", { metal: "Mg" }), S("Na^+", "Na", 1, -2.71, "Sódio", { metal: "Na" }), S("Ca^2+", "Ca", 2, -2.87, "Cálcio", { metal: "Ca" }),
    S("Ba^2+", "Ba", 2, -2.91, "Bário", { metal: "Ba" }), S("K^+", "K", 1, -2.93, "Potássio", { metal: "K" }), S("Li^+", "Li", 1, -3.04, "Lítio", { metal: "Li" }),
  ];
  // "2 Cl^-" → [{c:2, e}]
  const termosTxt = (t) => t.split(/\s\+\s/).map((x) => { const m = /^(\d+)\s+(.*)$/.exec(x.trim()); return { c: m ? +m[1] : 1, e: lerEspecie(m ? m[2] : x.trim()) }; });
  const ladoHTML = (ts) => ts.map((x) => `${x.c === 1 ? "" : x.c + " "}${htmlEsp(x.e)}`).join(" + ");
  const semiHTML = (s) => `${ladoHTML(termosTxt(s.ox))} + ${s.n === 1 ? "" : s.n + " "}e<sup>−</sup> → ${ladoHTML(termosTxt(s.red))}`;
  function combinar(cat, an) {
    const L = (cat.n * an.n) / mdc(cat.n, an.n);
    const kc = L / cat.n, ka = L / an.n;
    const soma = new Map();
    const put = (ts, k, sinal) => { for (const t of ts) { const key = t.e.f + "|" + t.e.carga; const o = soma.get(key) || { e: t.e, c: 0 }; o.c += sinal * t.c * k; soma.set(key, o); } };
    put(termosTxt(cat.ox), kc, 1); put(termosTxt(cat.red), kc, -1); // cátodo como redução
    put(termosTxt(an.red), ka, 1); put(termosTxt(an.ox), ka, -1); // ânodo invertido (oxidação)
    const reag = [], prod = [];
    for (const o of soma.values()) { if (o.c > 0) reag.push({ c: o.c, e: o.e }); else if (o.c < 0) prod.push({ c: -o.c, e: o.e }); }
    return { L, kc, ka, reag, prod, html: `${ladoHTML(reag)} → ${ladoHTML(prod)}` };
  }
  function pilha(p) {
    const a = POT.find((x) => x.id === p.a), b = POT.find((x) => x.id === p.b);
    if (!a || !b) return erro("Escolha os dois eletrodos.");
    if (a.id === b.id) return erro("Escolha dois eletrodos diferentes.");
    const [cat, an] = a.E >= b.E ? [a, b] : [b, a];
    const E0 = cat.E - an.E;
    const passos = [];
    passos.push(R("Potenciais de redução (tabela, 25 °C)", tabela(["Semirreação", "E° (V)"], [a, b].map((s) => [semiHTML(s), V(s.E)]))));
    passos.push(R("Quem é cátodo e quem é ânodo", `<p>Reduz quem tem <b>maior</b> E° de redução: <b>${cat.nome}</b> (${V(cat.E)} V) → <b>cátodo</b> (polo +, recebe elétrons). O outro, <b>${an.nome}</b> (${V(an.E)} V), se oxida → <b>ânodo</b> (polo −).</p>${eq(`Cátodo (redução): ${semiHTML(cat)}`)}${eq(`Ânodo (oxidação): ${ladoHTML(termosTxt(an.red))} → ${ladoHTML(termosTxt(an.ox))} + ${an.n === 1 ? "" : an.n + " "}e<sup>−</sup>`)}`));
    const c = combinar(cat, an);
    passos.push(R("Reação global", `<p>Multiplique para igualar os elétrons (${c.L} e⁻): cátodo ×${c.kc}, ânodo ×${c.ka}. Some e cancele os elétrons:</p>${eq(`<b>${c.html}</b>`)}${dica("O E° NÃO é multiplicado junto com a semirreação: é uma grandeza intensiva.")}`));
    passos.push(R("Força eletromotriz", `${eq(`E°<sub>pilha</sub> = E°<sub>cátodo</sub> − E°<sub>ânodo</sub> = ${V(cat.E)} − (${V(an.E)}) = <b>${V(E0)} V</b>`)}<p>E° &gt; 0: a reação é <b>espontânea</b> (pilha). O sentido inverso só acontece forçado (eletrólise).</p>`));
    const n = c.L, dG = (-n * FARADAY * E0) / 1000;
    const lnK = (n * FARADAY * E0) / (RGAS * 298.15);
    passos.push(R("Energia livre e constante de equilíbrio", `${eq(`ΔG° = −n·F·E° = −${n} × 96 485 × ${V(E0)} = <b>${N(dG, 4)} kJ</b>`)}${eq(`K = e<sup>nFE°/RT</sup> = e<sup>${N(lnK, 4)}</sup> ≈ <b>${lnK > 700 ? "10<sup>" + N(lnK / Math.LN10, 3) + "</sup>" : Q.sci(Math.exp(lnK), 2)}</b>`)}`));
    const sol = (s, red) => { const t = termosTxt(red ? s.red : s.ox).find((x) => x.e.carga !== 0 || !s.metal); return t ? htmlEsp(t.e) : ""; };
    const notacao = `${an.metal ? an.metal : "Pt"} | ${sol(an, false) || ladoHTML(termosTxt(an.ox))} || ${sol(cat, false) || ladoHTML(termosTxt(cat.ox))} | ${cat.metal ? cat.metal : "Pt"}`;
    passos.push(R("Notação da pilha", `${eq(notacao)}<p>Ânodo à esquerda, cátodo à direita; | separa fases e || representa a ponte salina. Os elétrons vão do ânodo para o cátodo pelo fio.</p>`));
    // Nernst
    let E = null;
    if (p.conc && Object.keys(p.conc).length) {
      const especiesAq = [...c.reag.map((x) => ({ ...x, s: -1 })), ...c.prod.map((x) => ({ ...x, s: 1 }))].filter((x) => x.e.carga !== 0);
      const T = p.T || 298.15;
      let lnQ = 0, faltou = false;
      const partes = [];
      for (const x of especiesAq) {
        const v = p.conc[x.e.f + "|" + x.e.carga];
        if (!(v > 0)) { faltou = true; continue; }
        lnQ += x.s * x.c * Math.log(v);
        partes.push(`[${htmlEsp(x.e)}]${x.s > 0 ? "" : "⁻"}${x.c > 1 ? "^" + x.c : ""}`);
      }
      if (!faltou) {
        E = E0 - ((RGAS * T) / (n * FARADAY)) * lnQ;
        passos.push(R("Equação de Nernst", `${eq(`E = E° − ${frac("RT", "nF")}·ln Q &nbsp; (a 25 °C: E = E° − ${frac("0,0592", "n")}·log Q)`)}<p>Q usa só as espécies em solução (sólidos e gases a 1 atm valem 1).</p>${eq(`log Q = ${N(lnQ / Math.LN10, 4)} → E = ${V(E0)} − ${frac("0,0592", String(n))} × ${N(lnQ / Math.LN10, 4)} = <b>${N(E, 4)} V</b>`)}`));
      }
    }
    return { ok: true, passos, E0, E, n, dG, catodo: cat, anodo: an, global: c, valor: E != null ? E : E0, resposta: `E° = ${V(E0)} V${E != null ? `; E = ${N(E, 4)} V` : ""}`, respostaHTML: `E°<sub>pilha</sub> = <b>${V(E0)} V</b>${E != null ? ` · E = <b>${N(E, 4)} V</b>` : ""}<br><small>cátodo: ${cat.nome} · ânodo: ${an.nome} · ΔG° = ${N(dG, 4)} kJ</small>` };
  }
  function faraday(p) {
    const s = POT.find((x) => x.id === p.par);
    if (!s || !s.metal) return erro("Escolha o metal depositado.");
    const M = Q.massaAtomica(s.metal);
    const passos = [];
    const t = p.t != null ? p.t * ({ s: 1, min: 60, h: 3600 }[p.ut || "s"]) : null;
    passos.push(R("Semirreação no cátodo", `${eq(semiHTML(s))}<p>Cada mol de ${s.metal} precisa de <b>${s.n} mol de elétrons</b>. A carga de 1 mol de elétrons é a constante de Faraday, F = 96 485 C/mol.</p>`));
    if (p.modo === "tempo") {
      if (!(p.m > 0) || !(p.i > 0)) return erro("Informe a massa desejada e a corrente.");
      const n = p.m / M, Qc = n * s.n * FARADAY, tt = Qc / p.i;
      passos.push(R("Mols do metal", eq(`n = ${frac(`${N(p.m)} g`, `${N(M, 5)} g/mol`)} = <b>${N(n, 4)} mol</b>`)));
      passos.push(R("Carga necessária", eq(`Q = n × ${s.n} × F = ${N(n, 4)} × ${s.n} × 96 485 = <b>${N(Qc, 5)} C</b>`)));
      passos.push(R("Tempo", eq(`t = ${frac("Q", "i")} = ${frac(`${N(Qc, 5)} C`, `${N(p.i)} A`)} = <b>${N(tt, 5)} s</b> = ${N(tt / 60, 4)} min = ${N(tt / 3600, 4)} h`)));
      return { ok: true, passos, valor: tt, resposta: `t = ${N(tt, 5)} s`, respostaHTML: `t = <b>${N(tt, 5)} s</b> (${N(tt / 60, 4)} min)` };
    }
    if (!(p.i > 0) || !(t > 0)) return erro("Informe a corrente e o tempo.");
    const Qc = p.i * t, ne = Qc / FARADAY, n = ne / s.n, m = n * M;
    passos.push(R("Carga que passou", eq(`Q = i·t = ${N(p.i)} A × ${N(t)} s = <b>${N(Qc, 5)} C</b>`)));
    passos.push(R("Mols de elétrons", eq(`n(e⁻) = ${frac("Q", "F")} = ${frac(N(Qc, 5), "96 485")} = <b>${N(ne, 4)} mol</b>`)));
    passos.push(R(`Mols e massa de ${s.metal}`, `${eq(`n(${s.metal}) = ${frac(`${N(ne, 4)}`, String(s.n))} = ${N(n, 4)} mol`)}${eq(`m = n × M = ${N(n, 4)} × ${N(M, 5)} = <b>${N(m, 4)} g</b>`)}`));
    return { ok: true, passos, valor: m, resposta: `m = ${N(m, 4)} g`, respostaHTML: `m(${s.metal}) = <b>${N(m, 4)} g</b>` };
  }

  // ---------------------------------------------------------------------------
  // Exercícios
  // ---------------------------------------------------------------------------
  const sorteia = (a) => a[Math.floor(Math.random() * a.length)];
  const NOX_EX = [["KMnO4", "Mn"], ["K2Cr2O7", "Cr"], ["H2SO4", "S"], ["SO4^2-", "S"], ["NH4^+", "N"], ["HNO3", "N"], ["NO2", "N"], ["H3PO4", "P"], ["Na2S2O3", "S"], ["ClO3^-", "Cl"], ["HClO4", "Cl"], ["CO2", "C"], ["CH4", "C"], ["Fe2O3", "Fe"], ["H2O2", "O"], ["NaH", "H"], ["MnO2", "Mn"], ["CrO4^2-", "Cr"], ["NO3^-", "N"], ["PO4^3-", "P"]];
  const REDOX_EX = ["Zn + Cu^2+ -> Zn^2+ + Cu", "Fe + O2 -> Fe2O3", "Cu + Ag^+ -> Cu^2+ + Ag", "KMnO4 + HCl -> KCl + MnCl2 + Cl2 + H2O", "Al + H^+ -> Al^3+ + H2", "MnO4^- + Fe^2+ -> Mn^2+ + Fe^3+", "Cr2O7^2- + Fe^2+ -> Cr^3+ + Fe^3+", "H2S + O2 -> SO2 + H2O", "Mg + HCl -> MgCl2 + H2"];
  // iônicas: escolher a equação iônica líquida certa
  const PARES_IONICOS = ["AgNO3 + NaCl", "BaCl2 + Na2SO4", "Pb(NO3)2 + KI", "CaCl2 + Na2CO3", "HCl + NaOH", "H2SO4 + KOH", "CuSO4 + NaOH", "FeCl3 + KOH", "AgNO3 + KBr", "Na2CO3 + HCl", "NaCl + KNO3", "MgCl2 + NaOH", "BaCl2 + K2CO3", "HNO3 + Ca(OH)2", "Na2SO4 + KCl", "Pb(NO3)2 + Na2SO4", "AgNO3 + Na2CrO4", "NH4Cl + NaOH"];
  function exIonica() {
    const resultados = [];
    for (const par of PARES_IONICOS) { const r = ionica({ reagentes: par }); if (r.ok) resultados.push({ par, r, txt: r.reacao ? r.liquida : "Não há reação: todos os íons ficam em solução" }); }
    const alvo = sorteia(resultados);
    const outros = [...new Set(resultados.filter((x) => x.txt !== alvo.txt).map((x) => x.txt))].sort(() => Math.random() - 0.5).slice(0, 3);
    if (alvo.r.reacao && !outros.some((o) => o.startsWith("Não há")) ) outros[2] = "Não há reação: todos os íons ficam em solução";
    const ops = [alvo.txt, ...outros].sort(() => Math.random() - 0.5);
    const [a, b] = alvo.par.split(" + ");
    return { tipo: "escolha", enunciado: `Misturam-se soluções aquosas de <b>${htmlEsp(lerEspecie(a))}</b> e <b>${htmlEsp(lerEspecie(b))}</b>. Qual é a <b>equação iônica líquida</b>?`, opcoes: ops, resposta: ops.indexOf(alvo.txt), passos: alvo.r.passos, texto: alvo.r.resposta };
  }

  function gerarExercicio(tipo) {
    if (tipo === "ionica") return exIonica();
    if (tipo === "nox") {
      const [f, s] = sorteia(NOX_EX);
      const r = nox(f);
      return { enunciado: `Qual é o número de oxidação do <b>${s}</b> em <b>${htmlEsp(lerEspecie(f))}</b>?`, resposta: r.nox[s], tol: 0.01, unidade: "", passos: r.passos, texto: `${s}: ${fracTxt(r.nox[s]).replace(/<[^>]+>/g, "")}` };
    }
    if (tipo === "redox-e") {
      const e = sorteia(REDOX_EX);
      const r = redox({ eq: e });
      return { enunciado: `Balanceie e diga quantos <b>elétrons</b> são transferidos na reação (com os menores coeficientes inteiros):<div class="eq">${e.split("->").map((l) => lerLadoEsp(l).map((x) => htmlEsp(lerEspecie(x))).join(" + ")).join(" → ")}</div>`, resposta: r.eletrons, tol: 0.01, unidade: "e⁻", passos: r.passos, texto: `${r.eletrons} elétrons` };
    }
    if (tipo === "pilha") {
      const metais = POT.filter((x) => x.metal && x.E > -1.7 && x.E < 1.6);
      let a, b; do { a = sorteia(metais); b = sorteia(metais); } while (a === b);
      const r = pilha({ a: a.id, b: b.id });
      return { enunciado: `Uma pilha usa eletrodos de <b>${a.metal}</b> (E° ${a.metal}${supCarga(a.n)}/${a.metal} = ${N(a.E, 3)} V) e <b>${b.metal}</b> (E° ${b.metal}${supCarga(b.n)}/${b.metal} = ${N(b.E, 3)} V). Qual a força eletromotriz padrão, em volts?`, resposta: r.E0, tol: 0.006, unidade: "V", passos: r.passos, texto: `${N(r.E0, 3)} V` };
    }
    const s = sorteia(POT.filter((x) => ["Cu", "Ag", "Zn", "Ni", "Al", "Fe", "Au"].includes(x.metal)));
    const i = sorteia([0.5, 1, 2, 2.5, 5, 10]), t = sorteia([10, 20, 30, 45, 60]);
    const r = faraday({ par: s.id, i, t, ut: "min" });
    return { enunciado: `Uma solução de ${htmlEsp(termosTxt(s.ox)[0].e)} é eletrolisada com corrente de <b>${N(i)} A</b> durante <b>${t} min</b>. Que massa de <b>${s.metal}</b> se deposita no cátodo? (F = 96 485 C/mol)`, resposta: r.valor, rel: 0.02, unidade: "g", passos: r.passos, texto: r.resposta };
  }

  const API = { lerEspecie, htmlEsp, nox, redox, balancearCarga, decompor, ionica, POT, semiHTML, termosTxt, pilha, faraday, gerarExercicio, TIPOS: ["nox", "redox-e", "pilha", "faraday", "ionica"] };
  if (node) module.exports = API;
  else raiz.QRedox = API;
})(typeof window !== "undefined" ? window : globalThis);
