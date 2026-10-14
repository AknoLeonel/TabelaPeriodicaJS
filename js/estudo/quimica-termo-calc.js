/*
 * Estudo: Química — termoquímica, equilíbrio e cinética (motor).
 * Funções puras (rodam em Node e no navegador). Todas devolvem
 * { ok:true, passos:[{t,h}], resposta, respostaHTML, valor, ... } ou { ok:false, erro }.
 */
(function (raiz) {
  "use strict";
  const Q = typeof module !== "undefined" && module.exports ? require("./quimica-calc.js") : raiz.QCalc;
  const { fq, frac } = Q;

  // ---------------------------------------------------------------------------
  // Formatação e utilidades
  // ---------------------------------------------------------------------------
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const N = (v, sig = 4) => Q.num(v, sig).replace(/^-/, "−");
  const S = (v, c = 2) => Q.sci(v, c).replace(/^-/, "−");
  const KF = (v) => { const a = Math.abs(v); return v !== 0 && (a >= 1e4 || a < 1e-2) ? S(v, 3) : N(v, 4); }; // constantes de equilíbrio
  const par = (v, sig = 4) => (v < 0 ? `(${N(v, sig)})` : N(v, sig));
  const sinal = (v, sig = 4) => (v < 0 ? "−" : "+") + " " + N(Math.abs(v), sig);
  const un = (u) => `<span class="un">${u}</span>`;
  const eq = (h) => `<div class="eq">${h}</div>`;
  const R = (t, h) => ({ t, h });
  const erro = (m) => ({ ok: false, erro: m });
  const dica = (h) => `<small class="dica">${h}</small>`;
  const aviso = (h) => `<p class="aviso-exc"><b>Atenção:</b> ${h}</p>`;
  const item = (nome, h) => `<div class="item"><span class="item-n">${nome}</span>${h}</div>`;
  const tabela = (cab, linhas) => `<div class="tab-rolar"><table class="tb"><thead><tr>${cab.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${linhas.map((l) => `<tr>${l.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  const _sup = (e) => String(e).replace("-", "−");
  const fin = (v) => typeof v === "number" && isFinite(v);
  const nz = (v) => (v === 0 ? 0 : v); // evita -0
  const RGAS = 8.314; // J/(mol·K)
  const RATM = 0.08206; // L·atm/(mol·K)
  const _KW = 1e-14;
  const clean = (t) => String(t || "").replace(/[₀-₉]/g, (c) => "₀₁₂₃₄₅₆₇₈₉".indexOf(c));

  function paraK(T, u) {
    if (u === "°C") return T + 273.15;
    return T;
  }

  // ---------------------------------------------------------------------------
  // Tabela de entalpias padrão de formação (kJ/mol, 298 K, 1 bar) — NIST / CRC
  // formato: fórmula|fase|ΔHf|nome  (* = fase padrão quando o usuário não indica)
  // ---------------------------------------------------------------------------
  const BRUTO = `
H2|g|0|hidrogênio
O2|g|0|oxigênio
N2|g|0|nitrogênio
Cl2|g|0|cloro
F2|g|0|flúor
Br2|l|0|bromo líquido*
Br2|g|30.91|bromo gasoso
I2|s|0|iodo sólido*
I2|g|62.42|iodo gasoso
C|s|0|carbono grafite*
C|diamante|1.9|carbono diamante
S|s|0|enxofre rômbico
Na|s|0|sódio
K|s|0|potássio
Li|s|0|lítio
Ca|s|0|cálcio
Mg|s|0|magnésio
Al|s|0|alumínio
Fe|s|0|ferro
Cu|s|0|cobre
Zn|s|0|zinco
Ag|s|0|prata
Pb|s|0|chumbo
Sn|s|0|estanho
Ni|s|0|níquel
Hg|l|0|mercúrio
O3|g|142.7|ozônio
H2O|l|-285.83|água líquida*
H2O|g|-241.83|vapor d'água
H2O|s|-291.8|gelo
H2O2|l|-187.8|peróxido de hidrogênio
CO2|g|-393.51|gás carbônico
CO|g|-110.53|monóxido de carbono
CH4|g|-74.6|metano
C2H6|g|-83.8|etano
C3H8|g|-104.7|propano
C4H10|g|-125.7|butano
C5H12|l|-173.5|pentano
C6H14|l|-198.7|hexano
C8H18|l|-250.1|octano
C2H4|g|52.4|eteno (etileno)
C3H6|g|20.0|propeno
C2H2|g|226.7|etino (acetileno)
C6H6|l|49.1|benzeno líquido*
C6H6|g|82.9|benzeno gasoso
CH3OH|l|-239.2|metanol líquido*
CH3OH|g|-200.7|metanol gasoso
C2H5OH|l|-277.6|etanol líquido*
C2H5OH|g|-234.8|etanol gasoso
CH3COOH|l|-484.3|ácido acético
HCHO|g|-108.6|metanal (formaldeído)
CCl4|l|-128.2|tetracloreto de carbono
CHCl3|l|-134.1|clorofórmio
CS2|l|89.0|dissulfeto de carbono
HCN|g|135.1|cianeto de hidrogênio
C6H12O6|s|-1273.3|glicose
C12H22O11|s|-2226.1|sacarose
NH3|g|-45.9|amônia gasosa*
NH3|aq|-80.3|amônia em água
N2H4|l|50.6|hidrazina
NO|g|90.3|monóxido de nitrogênio
NO2|g|33.2|dióxido de nitrogênio
N2O|g|82.1|óxido nitroso
N2O4|g|9.2|tetróxido de dinitrogênio
HNO3|l|-174.1|ácido nítrico
NH4Cl|s|-314.4|cloreto de amônio
NH4NO3|s|-365.6|nitrato de amônio
(NH4)2SO4|s|-1180.9|sulfato de amônio
SO2|g|-296.8|dióxido de enxofre
SO3|g|-395.7|trióxido de enxofre
H2S|g|-20.6|sulfeto de hidrogênio
H2SO4|l|-814.0|ácido sulfúrico
HF|g|-273.3|fluoreto de hidrogênio
HCl|g|-92.3|cloreto de hidrogênio gasoso*
HCl|aq|-167.2|ácido clorídrico (aquoso)
HBr|g|-36.3|brometo de hidrogênio
HI|g|26.5|iodeto de hidrogênio
PCl3|g|-287.0|tricloreto de fósforo
PCl5|g|-374.9|pentacloreto de fósforo
NaCl|s|-411.2|cloreto de sódio*
NaCl|aq|-407.3|cloreto de sódio (aquoso)
NaOH|s|-425.8|hidróxido de sódio*
NaOH|aq|-470.1|hidróxido de sódio (aquoso)
Na2CO3|s|-1130.7|carbonato de sódio
NaHCO3|s|-950.8|bicarbonato de sódio
Na2SO4|s|-1387.1|sulfato de sódio
NaNO3|s|-467.9|nitrato de sódio
KCl|s|-436.5|cloreto de potássio
KClO3|s|-397.7|clorato de potássio
KBr|s|-393.8|brometo de potássio
KOH|s|-424.6|hidróxido de potássio
KNO3|s|-494.6|nitrato de potássio
K2SO4|s|-1437.8|sulfato de potássio
CaO|s|-634.9|óxido de cálcio
CaCO3|s|-1207.6|carbonato de cálcio
Ca(OH)2|s|-985.2|hidróxido de cálcio
CaCl2|s|-795.4|cloreto de cálcio
CaSO4|s|-1434.5|sulfato de cálcio
CaC2|s|-59.8|carbeto de cálcio
MgO|s|-601.6|óxido de magnésio
Mg(OH)2|s|-924.5|hidróxido de magnésio
MgCl2|s|-641.3|cloreto de magnésio
MgSO4|s|-1284.9|sulfato de magnésio
Al2O3|s|-1675.7|óxido de alumínio
Fe2O3|s|-824.2|óxido de ferro(III)
Fe3O4|s|-1118.4|óxido de ferro(II,III)
FeO|s|-272.0|óxido de ferro(II)
FeS2|s|-178.2|pirita
CuO|s|-157.3|óxido de cobre(II)
Cu2O|s|-168.6|óxido de cobre(I)
CuS|s|-53.1|sulfeto de cobre(II)
CuSO4|s|-771.4|sulfato de cobre(II)
ZnO|s|-350.5|óxido de zinco
PbO|s|-217.3|óxido de chumbo(II)
PbO2|s|-277.4|óxido de chumbo(IV)
NiO|s|-239.7|óxido de níquel(II)
SnO2|s|-577.6|óxido de estanho(IV)
Ag2O|s|-31.1|óxido de prata
AgCl|s|-127.0|cloreto de prata
AgNO3|s|-124.4|nitrato de prata
HgO|s|-90.8|óxido de mercúrio(II)
SiO2|s|-910.7|dióxido de silício (quartzo)
TiO2|s|-944.0|dióxido de titânio
BaSO4|s|-1473.2|sulfato de bário
`;
  const TABELA = [];
  const IDX = {}; // "F|fase" -> entrada
  const PADRAO = {}; // F -> fase padrão
  const FASES_DE = {}; // F -> [fases]
  for (const linha of BRUTO.split("\n")) {
    const t = linha.trim();
    if (!t) continue;
    let [f, fase, h, nome] = t.split("|");
    const padrao = nome.endsWith("*");
    if (padrao) nome = nome.slice(0, -1);
    const e = { f, fase, h: parseFloat(h), nome };
    TABELA.push(e);
    IDX[f + "|" + fase] = e;
    (FASES_DE[f] = FASES_DE[f] || []).push(fase);
    if (padrao || !PADRAO[f]) PADRAO[f] = fase;
  }
  const GASES_ELEM = new Set(["H", "N", "O", "F", "Cl", "He", "Ne", "Ar", "Kr", "Xe", "Rn"]);
  const faseElem = (s) => (GASES_ELEM.has(s) ? "g" : s === "Br" || s === "Hg" ? "l" : "s");
  const _NOMES_FASE = { s: "sólido", l: "líquido", g: "gás", aq: "aquoso", diamante: "diamante" };

  // ---------------------------------------------------------------------------
  // Leitura de equações com fases
  // ---------------------------------------------------------------------------
  const SETA = /<=>|⇌|<->|⇄|->|→|⟶|=>|⇒|=/;
  const QUEBRA = /\s\+\s|\+(?=\s*[\dA-Z(\[])/;
  function lerLado(txt, comCoef) {
    const itens = [];
    for (let raw of txt.split(QUEBRA).map((x) => x.trim()).filter(Boolean)) {
      let coef = 1, tem = false;
      const m = raw.match(/^(\d+(?:[.,]\d+)?(?:\/\d+)?)\s*(?=[A-Z(\[])/);
      if (m) { raw = raw.slice(m[0].length); tem = true; coef = m[1].includes("/") ? +m[1].split("/")[0] / +m[1].split("/")[1] : parseFloat(m[1].replace(",", ".")); }
      else if (/^½\s*/.test(raw)) { raw = raw.replace(/^½\s*/, ""); coef = 0.5; tem = true; }
      let fase = null;
      const f = raw.match(/\((s|l|g|aq|grafite|diamante)\)\s*$/i);
      if (f) { fase = f[1].toLowerCase(); raw = raw.slice(0, f.index).trim(); if (fase === "grafite") fase = "s"; }
      raw = raw.replace(/([A-Za-z)\]])([+-])$/, "$1^$2");
      itens.push({ f: raw, fase, coef, tem });
    }
    return itens;
  }
  function lerEq(txt) {
    const s = clean(txt).replace(/[−–—]/g, "-").trim();
    if (!s) return erro("Digite uma equação, por exemplo CH4(g) + O2(g) -> CO2(g) + H2O(l).");
    const lados = s.split(SETA);
    if (lados.length !== 2 || !lados[0].trim() || !lados[1].trim()) return erro("Separe reagentes e produtos com uma seta (-> ou =). Exemplo: N2 + 3 H2 -> 2 NH3.");
    const reag = lerLado(lados[0]), prod = lerLado(lados[1]);
    if (!reag.length || !prod.length) return erro("Faltam reagentes ou produtos na equação.");
    for (const x of [...reag, ...prod]) {
      const p = Q.parseFormula(x.f);
      if (!p.ok) return erro(`Em "${x.f}": ${p.erro}`);
      x.p = p;
      x.key = p.texto;
    }
    return { ok: true, reag, prod };
  }

  // ---------------------------------------------------------------------------
  // 1. ΔH° de reação (entalpias de formação)
  // ---------------------------------------------------------------------------
  const fasesTxt = (fases) => fases.map((x) => "(" + x + ")").join(", ");
  const fqF = (f, fase) => fq(f) + (fase ? `<small>(${fase === "diamante" ? "diam." : fase})</small>` : "");

  function dHReacao(txt, opts = {}) {
    const L = lerEq(txt);
    if (!L.ok) return L;
    const limpo = [L.reag, L.prod].map((l) => l.map((x) => x.f).join(" + ")).join(" -> ");
    const b = Q.balancear(limpo);
    if (!b.ok) return b;
    const extras = opts.extras || {};
    const todos = [...L.reag, ...L.prod];
    const faltam = [], assumidas = [];
    const sp = b.especies.map((e, i) => {
      const u = todos[i];
      const key = u.key;
      let fase = u.fase, assumida = false;
      if (!fase) {
        fase = PADRAO[key] || (u.p.ordem.length === 1 ? faseElem(u.p.ordem[0]) : null);
        assumida = true;
      }
      const chave = key + (fase ? `(${fase})` : "");
      let h = null, fonte = null, nome = "";
      const ex = extras[chave] != null ? extras[chave] : extras[key];
      if (fin(ex)) { h = ex; fonte = "informado por você"; }
      else if (fase && IDX[key + "|" + fase]) { const t = IDX[key + "|" + fase]; h = t.h; fonte = "tabela"; nome = t.nome; }
      else if (fase && u.p.ordem.length === 1 && fase === faseElem(u.p.ordem[0]) && !FASES_DE[key]) { h = 0; fonte = "elemento"; nome = "substância simples"; }
      else faltam.push({ chave, f: key, fase, outras: FASES_DE[key] || [] });
      if (assumida && fase) assumidas.push({ f: key, fase });
      return { f: key, fase, coef: b.coef[i], lado: b.especies[i].lado, h, fonte, nome, p: b.especies[i].p, assumida };
    });
    if (faltam.length) {
      const msg = faltam.map((x) => {
        const outras = x.outras.length ? ` Na tabela ele só aparece em ${fasesTxt(x.outras)}.` : "";
        return `Não tenho o ΔH<sub>f</sub>° de <b>${fq(x.f)}${x.fase ? "(" + x.fase + ")" : ""}</b>.${outras}`;
      }).join(" ");
      return { ok: false, erro: msg.replace(/<[^>]+>/g, "") + " Informe o valor nos campos abaixo ou confira a fórmula e a fase.", faltam };
    }
    const reag = sp.filter((x) => x.lado === 1), prod = sp.filter((x) => x.lado === -1);
    const soma = (l) => l.reduce((a, x) => a + x.coef * x.h, 0);
    const sP = soma(prod), sR = soma(reag);
    const dH = nz(sP - sR);
    const passos = [];
    const eqTxt = (l) => l.map((x) => `${x.coef > 1 ? x.coef + " " : ""}${fqF(x.f, x.fase)}`).join(" + ");
    let h1 = `<p>Primeiro balanceamos, porque o ΔH vale <b>para a equação como está escrita</b> (cada coeficiente é uma quantidade em mol).</p>${eq(`${eqTxt(reag)} → ${eqTxt(prod)}`)}`;
    if (assumidas.length) h1 += aviso(`você não indicou a fase de ${assumidas.map((a) => `<b>${fq(a.f)}</b>`).join(", ")}. Usei a fase padrão a 25 °C: ${assumidas.map((a) => `${fq(a.f)}(${a.fase})`).join(", ")}. A fase muda o resultado (por exemplo, H<sub>2</sub>O(l) e H<sub>2</sub>O(g) diferem em 44 kJ/mol): escreva a fase entre parênteses se o enunciado disser outra.`);
    if (L.reag.concat(L.prod).some((x) => x.tem)) h1 += dica("Os coeficientes que você digitou foram ignorados: o app sempre balanceia com os menores inteiros.");
    passos.push(R("Equação balanceada e fases", h1));
    passos.push(R("A fórmula (Lei de Hess)", `<p>A entalpia de formação (ΔH<sub>f</sub>°) é o calor da reação que forma 1 mol da substância a partir dos elementos puros na forma mais estável. Por isso <b>substâncias simples estáveis valem 0</b> (H<sub>2</sub>(g), O<sub>2</sub>(g), C grafite, Fe(s)...). Assim:</p>${eq(`ΔH° = Σ n·ΔH<sub>f</sub>°(produtos) − Σ n·ΔH<sub>f</sub>°(reagentes)`)}${dica("n é o coeficiente da substância na equação balanceada. Atenção ao sinal: é produtos MENOS reagentes.")}`));
    const linhas = (l) => l.map((x) => `<tr><td>${x.coef} ${fqF(x.f, x.fase)} <small>${x.nome ? esc(x.nome) : ""}</small></td><td>${par(x.h, 6)} ${un("kJ/mol")}${x.fonte === "elemento" || x.h === 0 ? " <small>(elemento puro)</small>" : x.fonte === "informado por você" ? " <small>(seu valor)</small>" : ""}</td><td><b>${x.coef} × ${par(x.h, 6)} = ${N(x.coef * x.h, 6)}</b></td></tr>`).join("");
    passos.push(R("Procure o ΔHf° de cada substância", `<p>Valores a 25 °C (298 K). Cada linha: coeficiente × ΔH<sub>f</sub>°.</p><div class="tab-rolar"><table class="tb"><thead><tr><th>Reagentes</th><th>ΔH<sub>f</sub>°</th><th>n·ΔH<sub>f</sub>°</th></tr></thead><tbody>${linhas(reag)}</tbody></table></div><div class="tab-rolar"><table class="tb"><thead><tr><th>Produtos</th><th>ΔH<sub>f</sub>°</th><th>n·ΔH<sub>f</sub>°</th></tr></thead><tbody>${linhas(prod)}</tbody></table></div><small class="dica">Valores do NIST/CRC. Livros diferentes arredondam de forma diferente: seu resultado pode variar alguns kJ.</small>`));
    const lista = (l) => l.map((x) => par(x.coef * x.h, 6)).join(" + ");
    passos.push(R("Some produtos e reagentes", `${eq(`Σ produtos = ${lista(prod)} = <b>${N(sP, 6)} kJ</b>`)}${eq(`Σ reagentes = ${lista(reag)} = <b>${N(sR, 6)} kJ</b>`)}${eq(`ΔH° = ${par(sP, 6)} − ${par(sR, 6)} = <b>${N(dH, 6)} kJ</b>`)}`));
    const cls = dH < -1e-9 ? "exotérmica" : dH > 1e-9 ? "endotérmica" : "termicamente neutra";
    passos.push(R("Interprete o sinal", dH < 0
      ? `<p>ΔH &lt; 0: a reação é <b>exotérmica</b>. Os produtos têm menos energia que os reagentes, então a reação <b>libera</b> ${N(Math.abs(dH), 4)} kJ de calor para cada ${eqTxt(reag)} que reage conforme a equação.</p>`
      : dH > 0 ? `<p>ΔH &gt; 0: a reação é <b>endotérmica</b>. Os produtos têm mais energia que os reagentes, então a reação <b>absorve</b> ${N(dH, 4)} kJ de calor do ambiente (ela "esfria" a vizinhança).</p>`
        : `<p>ΔH = 0: não há troca líquida de calor.</p>`) + dica("Se a equação for multiplicada por 2, o ΔH também dobra; se for invertida, o ΔH troca de sinal."));
    let extra = null, resposta = `ΔH° = ${N(dH, 5)} kJ (${cls})`;
    if (opts.ref && opts.ref.i != null) {
      const e = sp[opts.ref.i];
      const q = opts.ref.q;
      if (!e) return erro("Escolha qual substância da equação você tem.");
      if (!(q > 0)) return erro("Informe uma quantidade maior que zero para calcular o calor.");
      let n = q, h = `<p>Quantidade de ${fqF(e.f, e.fase)}: <b>${N(q)} mol</b>.</p>`;
      if (opts.ref.un === "g") {
        const M = Q.massaMolar(e.p).total;
        n = q / M;
        h = `<p>Passe a massa para mol (n = m ÷ M):</p>${eq(`M(${fq(e.f)}) = ${N(M, 5)} g/mol`)}${eq(`n = ${frac(N(q) + " g", N(M, 5) + " g/mol")} = <b>${N(n, 4)} mol</b>`)}`;
      }
      const ext = n / e.coef;
      const qq = dH * ext;
      h += `<p>A equação diz que <b>${e.coef} mol</b> de ${fqF(e.f, e.fase)} correspondem a <b>ΔH = ${N(dH, 5)} kJ</b>. Regra de três:</p>${eq(`Q = ${frac(N(n, 4) + " mol", e.coef + " mol")} × ${par(dH, 5)} kJ = <b>${N(qq, 4)} kJ</b>`)}`;
      h += qq < 0 ? `<p>Sinal negativo = calor <b>liberado</b>: <b>${N(Math.abs(qq), 4)} kJ</b> saem para o ambiente.</p>` : qq > 0 ? `<p>Sinal positivo = calor <b>absorvido</b>: <b>${N(qq, 4)} kJ</b> entram na reação.</p>` : "";
      passos.push(R(`Calor para ${N(q)} ${opts.ref.un === "g" ? "g" : "mol"} de ${fq(e.f)}`, h));
      extra = { q: qq, n, ext };
      resposta = `${qq < 0 ? "Libera" : "Absorve"} ${N(Math.abs(qq), 4)} kJ (ΔH° da equação = ${N(dH, 5)} kJ)`;
    }
    return {
      ok: true, passos, valor: dH, dH, classe: cls, especies: sp, balanco: b, extra,
      resposta, respostaHTML: extra ? `${extra.q < 0 ? "Libera" : "Absorve"} <b>${N(Math.abs(extra.q), 4)} kJ</b><br><small>ΔH° da equação = ${N(dH, 5)} kJ · ${cls}</small>` : `ΔH° = <b>${N(dH, 5)}</b> ${un("kJ")}<br><small>${cls}</small>`,
    };
  }

  // ---------------------------------------------------------------------------
  // 2. Lei de Hess
  // ---------------------------------------------------------------------------
  function hess(etapas) {
    if (!Array.isArray(etapas) || !etapas.length) return erro("Adicione pelo menos uma etapa com o ΔH.");
    const lin = [];
    for (let i = 0; i < etapas.length; i++) {
      const e = etapas[i];
      const dH = e.dH, f = e.fator == null ? 1 : e.fator;
      if (!fin(dH)) return erro(`Etapa ${i + 1}: informe o ΔH (número).`);
      if (!fin(f)) return erro(`Etapa ${i + 1}: o fator deve ser um número (2, 1/2, −1...).`);
      lin.push({ i: i + 1, dH, f, eq: e.eq || "", r: nz(dH * f) });
    }
    const ativos = lin.filter((x) => x.f !== 0);
    if (!ativos.length) return erro("Todos os fatores são 0: nenhuma etapa entra na soma.");
    const total = nz(ativos.reduce((a, x) => a + x.r, 0));
    const passos = [];
    passos.push(R("A ideia da Lei de Hess", `<p>A entalpia é uma <b>função de estado</b>: só depende do começo e do fim, não do caminho. Então o ΔH de uma reação pode ser obtido somando os ΔH de etapas que, somadas, dão a reação desejada.</p><p>Para ajustar cada etapa antes de somar:</p><div class="lista-itens">${item("Inverter a equação", "troca reagentes por produtos e <b>troca o sinal do ΔH</b> (fator −1).")}${item("Multiplicar por n", "multiplica todos os coeficientes <b>e o ΔH</b> por n (ex.: ×2 dobra; ÷2 é fator 1/2).")}${item("Somar", "substâncias iguais dos dois lados se cancelam; o ΔH total é a soma dos ΔH ajustados.")}</div>${dica("Truque: olhe a substância que aparece em só uma etapa e veja de que lado da equação desejada ela precisa ficar. Isso diz se inverte e quanto multiplica.")}`));
    const descr = (x) => (x.f === 1 ? "mantida" : x.f === -1 ? "invertida (sinal trocado)" : x.f < 0 ? `invertida e ×${N(Math.abs(x.f))}` : x.f === 0 ? "não entra" : `multiplicada por ${N(x.f)}`);
    passos.push(R("Ajuste cada etapa", tabela(["Etapa", "ΔH dado", "Fator", "O que fazer", "ΔH ajustado"], lin.map((x) => [`${x.i}${x.eq ? " <small>" + esc(x.eq) + "</small>" : ""}`, `${par(x.dH)} kJ`, par(x.f), descr(x), `<b>${par(x.f)} × ${par(x.dH)} = ${N(x.r)} kJ</b>`]))));
    passos.push(R("Some os ΔH ajustados", eq(`ΔH = ${ativos.map((x) => par(x.r)).join(" + ")} = <b>${N(total)} kJ</b>`) + (total < 0 ? "<p>Negativo: a reação desejada é <b>exotérmica</b> (libera calor).</p>" : total > 0 ? "<p>Positivo: a reação desejada é <b>endotérmica</b> (absorve calor).</p>" : "") + dica("Confira: depois de ajustar e somar as equações, tudo o que não está na reação desejada deve ter cancelado.")));
    return { ok: true, passos, valor: total, dH: total, resposta: `ΔH = ${N(total)} kJ`, respostaHTML: `ΔH = <b>${N(total)}</b> ${un("kJ")}` };
  }

  // ---------------------------------------------------------------------------
  // 3. ΔG = ΔH − TΔS
  // ---------------------------------------------------------------------------
  function dG(p) {
    const { dH, dS, T } = p;
    if (!fin(dH) || !fin(dS)) return erro("Informe ΔH e ΔS.");
    const passos = [];
    const dHkJ = p.uH === "J/mol" ? dH / 1000 : dH;
    const dSJ = p.uS === "kJ/(mol·K)" ? dS * 1000 : dS;
    const conv = [];
    if (p.uH === "J/mol") conv.push(`ΔH = ${N(dH)} J/mol ÷ 1000 = <b>${N(dHkJ)} kJ/mol</b>`);
    if (p.uS === "kJ/(mol·K)") conv.push(`ΔS = ${N(dS)} kJ/(mol·K) × 1000 = <b>${N(dSJ)} J/(mol·K)</b>`);
    passos.push(R("Padronize as unidades", `<p>O ΔH costuma vir em <b>kJ</b> e o ΔS em <b>J/K</b>: esta é a armadilha mais comum. Vamos usar ΔH em kJ/mol e ΔS em J/(mol·K), e converter o ΔS para kJ antes de multiplicar por T.</p>${conv.length ? conv.map(eq).join("") : eq(`ΔH = ${N(dHkJ)} kJ/mol &nbsp;·&nbsp; ΔS = ${N(dSJ)} J/(mol·K)`)}${eq(`ΔS = ${N(dSJ)} J/(mol·K) ÷ 1000 = <b>${N(dSJ / 1000, 5)} kJ/(mol·K)</b>`)}`));
    const dSk = dSJ / 1000;
    let TK = null;
    if (fin(T)) {
      TK = paraK(T, p.uT);
      if (TK < 0) return erro("A temperatura não pode ser menor que 0 K (−273,15 °C).");
      passos.push(R("Temperatura em kelvin", p.uT === "°C" ? `<p>Na fórmula, T é a temperatura absoluta (kelvin):</p>${eq(`T = ${N(T)} °C + 273,15 = <b>${N(TK, 5)} K</b>`)}` : `<p>T já está em kelvin: <b>${N(TK, 5)} K</b>.</p>`));
    }
    let G = null, cls = "";
    if (TK != null) {
      const TdS = TK * dSk;
      G = nz(dHkJ - TdS);
      passos.push(R("Calcule T·ΔS e depois ΔG", `<p>A energia livre de Gibbs combina o calor trocado (ΔH) com a "desordem" (T·ΔS):</p>${eq("ΔG = ΔH − T·ΔS")}${eq(`T·ΔS = ${N(TK, 5)} K × ${par(dSk, 5)} kJ/(mol·K) = <b>${N(TdS, 5)} kJ/mol</b>`)}${eq(`ΔG = ${par(dHkJ)} − ${par(TdS, 5)} = <b>${N(G, 5)} kJ/mol</b>`)}`));
      const tol = 1e-9 * Math.max(Math.abs(dHkJ), Math.abs(TdS), 1);
      cls = Math.abs(G) <= tol ? "em equilíbrio" : G < 0 ? "espontânea" : "não espontânea";
      passos.push(R("Espontaneidade", G < -tol ? `<p>ΔG &lt; 0 ⇒ a reação é <b>espontânea</b> a ${N(TK, 5)} K (acontece sozinha, no sentido escrito).</p>${dica("Espontânea não quer dizer rápida: velocidade é assunto de cinética.")}`
        : G > tol ? `<p>ΔG &gt; 0 ⇒ a reação é <b>não espontânea</b> a ${N(TK, 5)} K no sentido escrito (a reação inversa é espontânea).</p>` : `<p>ΔG = 0 ⇒ o sistema está <b>em equilíbrio</b> nessa temperatura.</p>`));
    }
    // temperatura de equilíbrio e casos
    let Teq = null;
    const caso = dHkJ < 0 && dSk > 0 ? 1 : dHkJ > 0 && dSk < 0 ? 2 : dHkJ < 0 && dSk < 0 ? 3 : dHkJ > 0 && dSk > 0 ? 4 : 0;
    const msgs = {
      1: "ΔH &lt; 0 e ΔS &gt; 0: ΔG é sempre negativo. <b>Espontânea em qualquer temperatura.</b>",
      2: "ΔH &gt; 0 e ΔS &lt; 0: ΔG é sempre positivo. <b>Não espontânea em nenhuma temperatura.</b>",
      3: "ΔH &lt; 0 e ΔS &lt; 0: favorecida pela energia, mas desfavorecida pela ordem. <b>Espontânea em temperaturas baixas</b> (abaixo de T<sub>eq</sub>).",
      4: "ΔH &gt; 0 e ΔS &gt; 0: desfavorecida pela energia, mas favorecida pela desordem. <b>Espontânea em temperaturas altas</b> (acima de T<sub>eq</sub>).",
      0: "Com ΔH ou ΔS igual a zero, o sinal de ΔG depende só de um dos termos.",
    };
    const quadro = tabela(["ΔH", "ΔS", "Espontânea?"], [
      ["−", "+", "sempre"], ["+", "−", "nunca"], ["−", "−", "só a baixa T"], ["+", "+", "só a alta T"],
    ]);
    let h = `${quadro}<p>${msgs[caso]}</p>`;
    if ((caso === 3 || caso === 4) && dSk !== 0) {
      Teq = dHkJ / dSk;
      h += `<p>Na temperatura de equilíbrio, ΔG = 0, então ΔH = T·ΔS:</p>${eq(`T<sub>eq</sub> = ${frac("ΔH", "ΔS")} = ${frac(par(dHkJ) + " kJ/mol", par(dSk, 5) + " kJ/(mol·K)")} = <b>${N(Teq, 5)} K</b> (${N(Teq - 273.15, 5)} °C)`)}`;
      if (TK != null) h += `<p>Como T = ${N(TK, 5)} K ${TK > Teq ? "&gt;" : "&lt;"} T<sub>eq</sub>, ${caso === 4 ? (TK > Teq ? "estamos na região espontânea (alta T)" : "ainda não chegamos à região espontânea") : (TK < Teq ? "estamos na região espontânea (baixa T)" : "já passamos da região espontânea")}: coerente com o sinal de ΔG.</p>`;
    }
    passos.push(R("Quando muda? Temperatura de equilíbrio", h));
    if (G != null && TK > 0) {
      const K = Math.exp(-G * 1000 / (RGAS * TK));
      passos.push(R("Extra: ligação com a constante de equilíbrio", `<p>Para as condições-padrão, ΔG° = −R·T·ln K. Então:</p>${eq(`K = e<sup>−ΔG°/(RT)</sup> = e<sup>−(${N(G * 1000, 5)} J/mol)/(8,314 × ${N(TK, 5)})</sup> = <b>${KF(K)}</b>`)}${dica("ΔG negativo ⇒ K &gt; 1 (produtos favorecidos). Vale quando o ΔG calculado é o ΔG° (estado-padrão).")}`));
    }
    const resp = G != null ? `ΔG = ${N(G, 5)} kJ/mol (${cls})` : Teq != null ? `T_eq = ${N(Teq, 5)} K` : msgs[caso].replace(/<[^>]+>/g, "");
    const respH = G != null ? `ΔG = <b>${N(G, 5)}</b> ${un("kJ/mol")}<br><small>${cls}${Teq != null ? ` · T<sub>eq</sub> = ${N(Teq, 5)} K` : ""}</small>` : Teq != null ? `T<sub>eq</sub> = <b>${N(Teq, 5)}</b> ${un("K")}` : msgs[caso];
    return { ok: true, passos, valor: G != null ? G : Teq, G, Teq, classe: cls, resposta: resp, respostaHTML: respH };
  }

  // ---------------------------------------------------------------------------
  // 4. Calorimetria
  // ---------------------------------------------------------------------------
  function calorimetria(p) {
    const { m, Ti, Tf } = p;
    if (!(m > 0)) return erro("Informe a massa (maior que zero).");
    if (!fin(Ti) || !fin(Tf)) return erro("Informe a temperatura inicial e a final.");
    const cal = p.uC === "cal/(g·°C)";
    const c0 = p.c == null ? 4.18 : p.c;
    if (!(c0 > 0)) return erro("O calor específico deve ser maior que zero.");
    const c = cal ? c0 * 4.184 : c0;
    const Ccal = p.Ccal || 0;
    if (Ccal < 0) return erro("A capacidade calorífica do calorímetro não pode ser negativa.");
    const dT = Tf - Ti;
    const passos = [];
    passos.push(R("O princípio", `<p>O calor que uma substância ganha ou perde ao mudar de temperatura é</p>${eq("q = m · c · ΔT &nbsp;&nbsp; com &nbsp;&nbsp; ΔT = T<sub>final</sub> − T<sub>inicial</sub>")}<p>(m em g, c em J/(g·°C), ΔT em °C ou K — a variação é igual nas duas escalas). Num calorímetro, o calor <b>liberado</b> pela reação é <b>absorvido</b> pela solução (e pelo aparelho): q<sub>reação</sub> = −(q<sub>solução</sub> + q<sub>calorímetro</sub>).</p>`));
    if (cal) passos.push(R("Converta o calor específico", eq(`c = ${N(c0)} cal/(g·°C) × 4,184 J/cal = <b>${N(c, 5)} J/(g·°C)</b>`)));
    passos.push(R("Variação de temperatura", eq(`ΔT = ${par(Tf)} − ${par(Ti)} = <b>${N(dT)} °C</b>`) + (dT > 0 ? "<p>A temperatura subiu: a solução <b>ganhou</b> calor, vindo da reação (exotérmica).</p>" : dT < 0 ? "<p>A temperatura caiu: a solução <b>perdeu</b> calor para a reação (endotérmica).</p>" : "<p>Sem variação de temperatura.</p>")));
    const qs = m * c * dT;
    passos.push(R("Calor recebido pela solução", eq(`q<sub>sol</sub> = m·c·ΔT = ${N(m)} × ${N(c, 4)} × ${par(dT)} = <b>${N(qs, 5)} J</b>`)));
    let qc = 0;
    if (Ccal > 0) {
      qc = Ccal * dT;
      passos.push(R("Calor recebido pelo calorímetro", `<p>O recipiente também esquenta. Sua <b>capacidade calorífica</b> C (J/°C) diz quanto calor ele absorve por grau:</p>${eq(`q<sub>cal</sub> = C·ΔT = ${N(Ccal)} × ${par(dT)} = <b>${N(qc, 5)} J</b>`)}`));
    }
    const qr = nz(-(qs + qc));
    passos.push(R("Calor da reação", `${eq(`q<sub>reação</sub> = −(q<sub>sol</sub>${Ccal > 0 ? " + q<sub>cal</sub>" : ""}) = −(${N(qs + qc, 5)}) = <b>${N(qr, 5)} J</b> = <b>${N(qr / 1000, 5)} kJ</b>`)}<p>${qr < 0 ? "Negativo: a reação <b>liberou</b> calor." : qr > 0 ? "Positivo: a reação <b>absorveu</b> calor." : ""}</p>`));
    let dH = null, n = null;
    if (p.n && p.n.valor != null) {
      const v = p.n.valor;
      if (!(v > 0)) return erro("A quantidade de substância deve ser maior que zero.");
      if (p.n.un === "g") {
        const f = Q.parseFormula(p.n.formula);
        if (!f.ok) return erro("Para usar gramas, informe a fórmula da substância (ex.: NaOH). " + f.erro);
        const M = Q.massaMolar(f).total;
        n = v / M;
        passos.push(R("Massa em mol", eq(`M(${fq(f.texto)}) = ${N(M, 5)} g/mol`) + eq(`n = ${frac(N(v) + " g", N(M, 5) + " g/mol")} = <b>${N(n, 4)} mol</b>`)));
      } else n = v;
      dH = qr / 1000 / n;
      passos.push(R("ΔH por mol", `<p>A entalpia molar é o calor da reação dividido pela quantidade de mol que reagiu (ou dissolveu):</p>${eq(`ΔH = ${frac("q<sub>reação</sub>", "n")} = ${frac(N(qr / 1000, 5) + " kJ", N(n, 4) + " mol")} = <b>${N(dH, 5)} kJ/mol</b>`)}${dica("Dissolver ou neutralizar: se a temperatura sobe, ΔH é negativo. Em soluções diluídas costuma-se usar c ≈ 4,18 J/(g·°C) e densidade 1 g/mL para a solução.")}`));
    }
    const resp = dH != null ? `ΔH = ${N(dH, 5)} kJ/mol (${dH < 0 ? "exotérmico" : "endotérmico"})` : `q da reação = ${N(qr / 1000, 5)} kJ`;
    return { ok: true, passos, valor: dH != null ? dH : qr / 1000, q: qr, dH, n, resposta: resp, respostaHTML: dH != null ? `ΔH = <b>${N(dH, 5)}</b> ${un("kJ/mol")}<br><small>${dH < 0 ? "exotérmico" : "endotérmico"} · q = ${N(qr / 1000, 4)} kJ</small>` : `q<sub>reação</sub> = <b>${N(qr / 1000, 5)}</b> ${un("kJ")}<br><small>q<sub>sol</sub> = ${N(qs, 5)} J</small>` };
  }

  // ---------------------------------------------------------------------------
  // 5. Energias de ligação
  // ---------------------------------------------------------------------------
  const LIGACOES = [
    ["H-H", 436], ["C-H", 413], ["C-C", 348], ["C=C", 614], ["C≡C", 839], ["C-O", 358], ["C=O", 799], ["C-N", 293], ["C-Cl", 328],
    ["C-F", 485], ["O-H", 463], ["O=O", 498], ["O-O", 146], ["N-H", 391], ["N-N", 163], ["N=N", 418], ["N≡N", 945], ["H-F", 567],
    ["H-Cl", 431], ["H-Br", 366], ["H-I", 299], ["F-F", 158], ["Cl-Cl", 243], ["Br-Br", 193], ["I-I", 151],
  ].map(([id, e]) => ({ id, e }));
  const chaveLig = (s) => {
    const t = String(s).replace(/[–−—]/g, "-").replace(/#/g, "≡").replace(/\s+/g, "");
    const m = t.match(/^([A-Z][a-z]?)([-=≡])([A-Z][a-z]?)$/);
    if (!m) return null;
    const [a, b] = [m[1], m[3]].sort();
    return a + m[2] + b;
  };
  const LIG_IDX = {};
  LIGACOES.forEach((l) => { LIG_IDX[chaveLig(l.id)] = l; });
  function lerLigacoes(txt) {
    const itens = [];
    const partes = String(txt || "").split(/[,;+\n]/).map((x) => x.trim()).filter(Boolean);
    for (const p of partes) {
      const m = p.match(/^(?:(\d+(?:[.,]\d+)?)\s*[x×*]?\s*)?([A-Z][a-z]?\s*[-–−=≡#]\s*[A-Z][a-z]?)$/);
      if (!m) return erro(`Não entendi "${p}". Escreva a quantidade e a ligação, por exemplo "4 C-H, 2 O=O" (simples -, dupla =, tripla ≡ ou #).`);
      const k = chaveLig(m[2]);
      const l = k && LIG_IDX[k];
      if (!l) return erro(`Não tenho a energia da ligação "${m[2].replace(/\s/g, "")}" na tabela. Ligações disponíveis: ${LIGACOES.map((x) => x.id).join(", ")}.`);
      const n = m[1] ? parseFloat(m[1].replace(",", ".")) : 1;
      if (!(n > 0)) return erro(`A quantidade de "${p}" deve ser maior que zero.`);
      const ex = itens.find((x) => x.l === l);
      if (ex) ex.n += n; else itens.push({ l, n });
    }
    return { ok: true, itens };
  }
  function energiaLigacao(rompTxt, formTxt) {
    const A = lerLigacoes(rompTxt), B = lerLigacoes(formTxt);
    if (!A.ok) return erro("Ligações rompidas: " + A.erro);
    if (!B.ok) return erro("Ligações formadas: " + B.erro);
    if (!A.itens.length || !B.itens.length) return erro("Preencha as ligações rompidas (nos reagentes) e as formadas (nos produtos).");
    const sA = A.itens.reduce((a, x) => a + x.n * x.l.e, 0), sB = B.itens.reduce((a, x) => a + x.n * x.l.e, 0);
    const dH = nz(sA - sB);
    const passos = [];
    passos.push(R("A ideia", `<p>Reagir é <b>quebrar</b> ligações dos reagentes e <b>formar</b> ligações nos produtos. Quebrar ligação <b>custa</b> energia (+); formar ligação <b>libera</b> energia (−). Tudo em fase gasosa:</p>${eq("ΔH ≈ Σ E(ligações rompidas) − Σ E(ligações formadas)")}${dica("Cuidado com o sinal: aqui é ROMPIDAS menos FORMADAS (ao contrário da fórmula com ΔHf, que é produtos menos reagentes).")}`));
    const tab = (itens) => tabela(["Ligação", "Quantidade", "Energia (kJ/mol)", "Subtotal"], itens.map((x) => [x.l.id, N(x.n), N(x.l.e), `<b>${N(x.n)} × ${x.l.e} = ${N(x.n * x.l.e)}</b>`]));
    passos.push(R("Ligações rompidas (reagentes)", tab(A.itens) + eq(`Σ rompidas = ${A.itens.map((x) => N(x.n * x.l.e)).join(" + ")} = <b>${N(sA)} kJ</b>`)));
    passos.push(R("Ligações formadas (produtos)", tab(B.itens) + eq(`Σ formadas = ${B.itens.map((x) => N(x.n * x.l.e)).join(" + ")} = <b>${N(sB)} kJ</b>`)));
    passos.push(R("Calcule o ΔH", eq(`ΔH = ${N(sA)} − ${N(sB)} = <b>${N(dH)} kJ</b>`) + (dH < 0 ? "<p>Formar as ligações novas libera mais energia do que quebrar as antigas: <b>exotérmica</b>.</p>" : dH > 0 ? "<p>Quebrar as ligações antigas custa mais do que se recupera formando as novas: <b>endotérmica</b>.</p>" : "") + aviso("as energias de ligação são <b>médias</b> (a mesma ligação varia de molécula para molécula), então o resultado é uma <b>estimativa</b>, às vezes com diferença de dezenas de kJ em relação ao valor calculado com ΔH<sub>f</sub>°.")));
    return { ok: true, passos, valor: dH, dH, resposta: `ΔH ≈ ${N(dH)} kJ`, respostaHTML: `ΔH ≈ <b>${N(dH)}</b> ${un("kJ")}<br><small>${dH < 0 ? "exotérmica" : dH > 0 ? "endotérmica" : ""} (estimativa)</small>` };
  }

  // ---------------------------------------------------------------------------
  // Equilíbrio: leitura da equação (coeficientes preservados) e expressão de K
  // ---------------------------------------------------------------------------
  function lerEqK(txt) {
    const L = lerEq(txt);
    if (!L.ok) return L;
    const esp = [...L.reag.map((x) => ({ ...x, lado: -1 })), ...L.prod.map((x) => ({ ...x, lado: 1 }))];
    esp.forEach((x, i) => { x.i = i; x.exp = x.lado * x.coef; });
    const semFase = esp.filter((x) => !x.fase);
    return { ok: true, esp, reag: L.reag, prod: L.prod, semFase: semFase.length === esp.length, algumaSemFase: semFase.length > 0 };
  }
  const _incluida = (x, tipo) => (tipo === "p" ? x.fase === "g" || (!x.fase && !hasFases(x)) : x.fase !== "s" && x.fase !== "l");
  const hasFases = () => false;
  function especiesK(L, tipo) {
    // Kp: só gases (espécies sem fase são tratadas como gases)
    return L.esp.filter((x) => (tipo === "p" ? x.fase === "g" || !x.fase : x.fase !== "s" && x.fase !== "l"));
  }
  const coefTxt = (c) => (c === 1 ? "" : Number.isInteger(c) ? String(c) : N(c));
  const expTxt = (c) => (c === 1 ? "" : `<sup>${Number.isInteger(c) ? c : N(c)}</sup>`);
  const simb = (x, tipo) => (tipo === "p" ? `P<sub>${fq(x.f)}</sub>` : `[${fq(x.f)}]`);
  function exprK(L, tipo) {
    const inc = especiesK(L, tipo);
    const nume = inc.filter((x) => x.lado === 1), deno = inc.filter((x) => x.lado === -1);
    const cat = (l) => (l.length ? l.map((x) => simb(x, tipo) + expTxt(x.coef)).join("") : "1");
    const k = tipo === "p" ? "K<sub>p</sub>" : "K<sub>c</sub>";
    return { inc, nume, deno, html: `${k} = ${deno.length ? frac(cat(nume), cat(deno)) : cat(nume)}`, k };
  }
  function valorQ(inc, vals) {
    let nu = 1, de = 1;
    inc.forEach((x, j) => { const v = vals[j]; if (x.lado === 1) nu *= Math.pow(v, x.coef); else de *= Math.pow(v, x.coef); });
    const Qv = de === 0 ? (nu === 0 ? NaN : Infinity) : nu / de;
    return { nu, de, Q: Qv };
  }
  function substK(inc, vals, tipo) {
    const cat = (lado) => {
      const l = inc.map((x, j) => ({ x, v: vals[j] })).filter((o) => o.x.lado === lado);
      if (!l.length) return "1";
      return l.map((o) => (o.x.coef === 1 ? (l.length > 1 ? `(${N(o.v, 4)})` : N(o.v, 4)) : `(${N(o.v, 4)})${expTxt(o.x.coef)}`)).join(" · ");
    };
    const de = inc.some((x) => x.lado === -1);
    return de ? frac(cat(1), cat(-1)) : cat(1);
  }
  function equacaoHTML(L) {
    const t = (l) => l.map((x) => `${coefTxt(x.coef)} ${fqF(x.f, x.fase)}`.trim()).join(" + ");
    return `${t(L.reag)} ⇌ ${t(L.prod)}`;
  }
  const notaFases = (L, tipo) => {
    let h = "";
    if (tipo === "p") h += `<p>O K<sub>p</sub> usa as <b>pressões parciais dos gases</b>. Sólidos, líquidos e substâncias dissolvidas ficam de fora.</p>`;
    else h += `<p>Sólidos e líquidos puros <b>não entram</b> na expressão de K (a "concentração" deles é constante). Entram só gases e espécies dissolvidas (aq).</p>`;
    if (L.semFase) h += dica("Você não indicou fases, então considerei todas as espécies como gases ou dissolvidas. Se alguma for sólido ou líquido puro, escreva (s) ou (l): ela sai da expressão.");
    else if (L.algumaSemFase) h += dica("Algumas espécies estão sem fase; considerei-as como gases ou dissolvidas.");
    const fora = L.esp.filter((x) => (tipo === "p" ? !(x.fase === "g" || !x.fase) : x.fase === "s" || x.fase === "l"));
    if (fora.length) h += `<p>Ficam de fora: ${fora.map((x) => fqF(x.f, x.fase)).join(", ")}.</p>`;
    return h;
  };
  const leituraK = (K) => (K >= 1e3 ? "K muito grande: no equilíbrio há <b>muito mais produtos</b> que reagentes (a reação praticamente se completa)." : K <= 1e-3 ? "K muito pequeno: no equilíbrio há <b>quase só reagentes</b> (a reação mal avança)." : K > 1 ? "K &gt; 1: os <b>produtos</b> são favorecidos, mas ainda sobra reagente." : K < 1 ? "K &lt; 1: os <b>reagentes</b> são favorecidos." : "K = 1: reagentes e produtos em proporções comparáveis.");

  // K a partir das concentrações (ou uma concentração a partir de K)
  function calcK(p) {
    const L = lerEqK(p.eq);
    if (!L.ok) return L;
    const tipo = p.tipo === "p" ? "p" : "c";
    const E = exprK(L, tipo);
    if (!E.inc.length) return erro("Nenhuma espécie entra na expressão de K (só há sólidos/líquidos puros?). Confira as fases.");
    const vals = E.inc.map((x) => (p.valores && p.valores[x.i] != null ? p.valores[x.i] : null));
    const faltam = vals.map((v, j) => (v == null ? j : -1)).filter((j) => j >= 0);
    for (const v of vals) if (v != null && !(v >= 0)) return erro("Concentrações e pressões não podem ser negativas.");
    const passos = [];
    const uni = tipo === "p" ? "pressão parcial (atm)" : "concentração em mol/L";
    passos.push(R("Equação e fases", `${eq(equacaoHTML(L))}${notaFases(L, tipo)}`));
    passos.push(R("Escreva a expressão de K", `<p>Lei da ação das massas: produtos no numerador, reagentes no denominador, cada um elevado ao seu <b>coeficiente</b>.</p>${eq(E.html)}`));
    if (faltam.length > 1) return erro("Deixe só uma ${uni} em branco (a que você quer descobrir) ou preencha todas.".replace("${uni}", uni));
    if (faltam.length === 1) {
      if (!(p.K > 0)) return erro("Para descobrir uma concentração, informe também o valor de K (maior que zero).");
      const u = faltam[0], xu = E.inc[u];
      let rest = 1;
      E.inc.forEach((x, j) => { if (j !== u) rest *= Math.pow(vals[j], x.exp); });
      if (!(rest > 0)) return erro("Com valor 0 nas outras espécies não dá para isolar a incógnita. Confira os dados.");
      const val = Math.pow(p.K / rest, 1 / xu.exp);
      passos.push(R("Isole a incógnita", `<p>Substitua os valores conhecidos e o K:</p>${eq(`${E.k} = ${KF(p.K)} = ${substK(E.inc, vals.map((v, j) => (j === u ? "?" : v)).map((v) => (v === "?" ? NaN : v)), tipo).replace(/NaN|\?/g, "?")}`)}<p>O que sobra de ${simb(xu, tipo)} é:</p>${eq(`${simb(xu, tipo)}${expTxt(Math.abs(xu.exp))} = ${xu.exp > 0 ? `K ÷ (resto)` : `(resto) ÷ K`}  ⇒ ${simb(xu, tipo)} = ${N(val, 4)}`)}${dica("O 'resto' é o produto das outras espécies, cada uma elevada ao seu coeficiente (negativo para os reagentes).")}`));
      passos.push(R("Confira", `<p>Recalcule K com o valor encontrado: ${eq(`${E.k} = ${KF(valorQ(E.inc, vals.map((v, j) => (j === u ? val : v))).Q)}`)}Deve coincidir com ${KF(p.K)}.</p>`));
      return { ok: true, passos, valor: val, resposta: `${E.inc[u].f} = ${N(val, 4)} ${tipo === "p" ? "atm" : "mol/L"}`, respostaHTML: `${simb(xu, tipo)} = <b>${N(val, 4)}</b> ${un(tipo === "p" ? "atm" : "mol/L")}` };
    }
    passos.push(R("Substitua as concentrações de equilíbrio", `<p>Use apenas valores medidos <b>no equilíbrio</b> (${uni}):</p>${eq(`${E.k} = ${substK(E.inc, vals, tipo)}`)}`));
    const { nu, de, Q: Kv } = valorQ(E.inc, vals);
    if (!fin(Kv)) return erro(de === 0 ? "Alguma espécie do denominador vale 0: o K fica indefinido. Confira os valores." : "Valores inválidos.");
    const nuTxt = E.nume.length ? `<b>${KF(nu)}</b>` : "1", deTxt = E.deno.length ? `<b>${KF(de)}</b>` : "1";
    passos.push(R("Calcule", `${eq(`numerador = ${nuTxt} &nbsp;·&nbsp; denominador = ${deTxt}`)}${eq(`${E.k} = ${frac(KF(nu), KF(de))} = <b>${KF(Kv)}</b>`)}`));
    const _dn = L.esp.filter((x) => x.fase === "g" || (!x.fase && tipo === "p")).reduce((a, x) => a + x.exp, 0);
    passos.push(R("O que o valor significa", `<p>${leituraK(Kv)}</p>${dica(`K só muda com a temperatura. Se a equação for invertida, o novo K é 1/K = ${KF(1 / Kv)}; se for multiplicada por n, o novo K é K<sup>n</sup>. A rigor K é adimensional; os livros costumam omitir as unidades.`)}`));
    return { ok: true, passos, valor: Kv, K: Kv, resposta: `${tipo === "p" ? "Kp" : "Kc"} = ${KF(Kv).replace(/<[^>]+>/g, (t) => (t === "<sup>" ? "^" : ""))}`, respostaHTML: `${E.k} = <b>${KF(Kv)}</b>` };
  }

  // Q versus K
  const EFEITOS = {
    "reag+": ["Adicionar reagente", "aumenta a concentração do reagente: o sistema tenta consumi-lo, deslocando o equilíbrio para os <b>produtos</b> (direita)."],
    "reag-": ["Retirar reagente", "diminui o reagente: o sistema tenta repô-lo, deslocando para os <b>reagentes</b> (esquerda)."],
    "prod+": ["Adicionar produto", "aumenta o produto: o sistema consome o excesso deslocando para os <b>reagentes</b> (esquerda)."],
    "prod-": ["Retirar produto", "diminui o produto: o sistema tenta repô-lo deslocando para os <b>produtos</b> (direita). É assim que se aumenta o rendimento na indústria."],
    "P+": ["Aumentar a pressão (comprimir)", "favorece o lado com <b>menos mols de gás</b>."],
    "P-": ["Diminuir a pressão (expandir)", "favorece o lado com <b>mais mols de gás</b>."],
    "T+": ["Aumentar a temperatura", "favorece o sentido <b>endotérmico</b> (absorve calor). Única perturbação que muda o valor de K."],
    "T-": ["Diminuir a temperatura", "favorece o sentido <b>exotérmico</b> (libera calor). Única perturbação que muda o valor de K."],
    cat: ["Adicionar catalisador", "acelera os dois sentidos igualmente: <b>não desloca</b> o equilíbrio e não muda K, só faz chegar mais rápido."],
  };
  function quociente(p) {
    const L = lerEqK(p.eq);
    if (!L.ok) return L;
    const tipo = p.tipo === "p" ? "p" : "c";
    const E = exprK(L, tipo);
    if (!E.inc.length) return erro("Nenhuma espécie entra na expressão de K. Confira as fases.");
    if (!(p.K > 0)) return erro("Informe o valor de K (maior que zero).");
    const vals = E.inc.map((x) => (p.valores && p.valores[x.i] != null ? p.valores[x.i] : null));
    if (vals.some((v) => v == null)) return erro("Preencha a concentração (ou pressão) de todas as espécies da expressão.");
    if (vals.some((v) => !(v >= 0))) return erro("Concentrações e pressões não podem ser negativas.");
    const { Q: Qv } = valorQ(E.inc, vals);
    if (Number.isNaN(Qv)) return erro("Numerador e denominador valem 0: o quociente fica indefinido. Coloque pelo menos um reagente ou um produto.");
    const passos = [];
    const q = tipo === "p" ? "Q<sub>p</sub>" : "Q<sub>c</sub>", k = tipo === "p" ? "K<sub>p</sub>" : "K<sub>c</sub>";
    passos.push(R("Expressão de K e de Q", `${eq(equacaoHTML(L))}${notaFases(L, tipo)}<p>Q tem a <b>mesma forma</b> de K, mas usa os valores do <b>momento</b> (não necessariamente de equilíbrio):</p>${eq(E.html.replace(/K<sub>[cp]<\/sub>/, q))}`));
    passos.push(R("Calcule Q", `${eq(`${q} = ${substK(E.inc, vals, tipo)}`)}${eq(`${q} = ${Qv === Infinity ? "∞ (denominador = 0)" : `<b>${KF(Qv)}</b>`}`)}`));
    const rel = Math.abs(Qv - p.K) / p.K;
    let sentido, txt;
    if (rel < 1e-6) { sentido = 0; txt = `Q = K: o sistema <b>já está em equilíbrio</b>; nada se desloca.`; }
    else if (Qv < p.K) { sentido = 1; txt = `Q &lt; K: há <b>pouco produto</b> em relação ao equilíbrio. A reação avança no sentido <b>direto</b> (→), formando produtos, até Q subir e igualar K.`; }
    else { sentido = -1; txt = `Q &gt; K: há <b>produto demais</b>. A reação avança no sentido <b>inverso</b> (←), formando reagentes, até Q cair e igualar K.`; }
    passos.push(R(`Compare ${q} com ${k}`, `${eq(`${q} = ${Qv === Infinity ? "∞" : KF(Qv)} &nbsp;&nbsp;${sentido === 0 ? "=" : sentido > 0 ? "&lt;" : "&gt;"}&nbsp;&nbsp; ${k} = ${KF(p.K)}`)}<p>${txt}</p>${tabela(["Comparação", "Para onde vai"], [["Q &lt; K", "direita → (produtos)"], ["Q = K", "equilíbrio"], ["Q &gt; K", "esquerda ← (reagentes)"]])}`));
    let h = `<p><b>Princípio de Le Chatelier:</b> quando se perturba um sistema em equilíbrio, ele se desloca no sentido que <b>reduz</b> o efeito da perturbação. (A comparação Q × K faz a mesma previsão com números.)</p>`;
    const gasR = L.reag.filter((x) => x.fase === "g" || !x.fase).reduce((a, x) => a + x.coef, 0), gasP = L.prod.filter((x) => x.fase === "g" || !x.fase).reduce((a, x) => a + x.coef, 0);
    let pert = null;
    if (p.pert && EFEITOS[p.pert]) {
      const [nome, base] = EFEITOS[p.pert];
      let ef = base, dir = null;
      if (p.pert === "reag+" || p.pert === "prod-") dir = 1;
      else if (p.pert === "reag-" || p.pert === "prod+") dir = -1;
      else if (p.pert === "P+" || p.pert === "P-") {
        const s = p.pert === "P+" ? 1 : -1;
        if (gasR === gasP) { ef = `não desloca: há ${gasR} mol de gás de cada lado.`; dir = 0; }
        else { const menosGas = gasP < gasR ? 1 : -1; dir = s * menosGas; ef += ` Aqui há ${gasR} mol de gás nos reagentes e ${gasP} nos produtos, então desloca para ${dir > 0 ? "os <b>produtos</b> (direita)" : "os <b>reagentes</b> (esquerda)"}.`; }
      } else if (p.pert === "T+" || p.pert === "T-") {
        if (!fin(p.dH) || p.dH === 0) ef += " Informe o ΔH da reação (kJ) para saber o sentido.";
        else { const s = p.pert === "T+" ? 1 : -1; dir = (p.dH > 0 ? 1 : -1) * s; ef += ` Como ΔH ${p.dH > 0 ? "&gt; 0 (direta endotérmica)" : "&lt; 0 (direta exotérmica)"}, desloca para ${dir > 0 ? "os <b>produtos</b> (direita)" : "os <b>reagentes</b> (esquerda)"} e K ${dir > 0 ? "aumenta" : "diminui"}.`; }
      } else dir = 0;
      h += `<p><b>${nome}:</b> ${ef}</p>`;
      pert = { nome, dir };
    }
    h += tabela(["Perturbação", "Efeito"], Object.values(EFEITOS).map(([a, b]) => [a, b.split(".")[0].replace(/<[^>]+>/g, "")]));
    passos.push(R("Le Chatelier", h));
    const resp = sentido === 0 ? "Em equilíbrio (Q = K)" : sentido > 0 ? "Q < K: desloca para a direita (produtos)" : "Q > K: desloca para a esquerda (reagentes)";
    return { ok: true, passos, valor: Qv, Q: Qv, sentido, pert, resposta: resp, respostaHTML: `${q} = <b>${Qv === Infinity ? "∞" : KF(Qv)}</b> &nbsp;·&nbsp; ${k} = ${KF(p.K)}<br><small>${resp}</small>` };
  }

  // Tabela ICE
  function ice(p) {
    const L = lerEqK(p.eq);
    if (!L.ok) return L;
    const tipo = p.tipo === "p" ? "p" : "c";
    const E = exprK(L, tipo);
    const inc = E.inc;
    if (!inc.length) return erro("Nenhuma espécie entra na expressão de K. Confira as fases.");
    if (!(p.K > 0) || !fin(p.K)) return erro("Informe o valor de K (maior que zero).");
    const K = p.K;
    const c0 = inc.map((x) => (p.inicial && p.inicial[x.i] != null ? p.inicial[x.i] : 0));
    if (c0.some((v) => !(v >= 0))) return erro("As concentrações iniciais não podem ser negativas (deixe 0 ou em branco para quem não existe no início).");
    const prodInc = inc.filter((x) => x.lado === 1), reagInc = inc.filter((x) => x.lado === -1);
    const fwdOK = reagInc.every((x) => c0[inc.indexOf(x)] > 0) && (reagInc.length > 0 || prodInc.length > 0);
    const revOK = prodInc.every((x) => c0[inc.indexOf(x)] > 0) && (reagInc.length > 0 || prodInc.length > 0);
    const rotC = tipo === "p" ? "pressão inicial (atm)" : "concentração inicial (mol/L)";
    if (c0.every((v) => v === 0)) return erro(`Informe a ${rotC} de pelo menos uma espécie.`);
    const Q0 = valorQ(inc, c0).Q;
    let dir;
    if (fwdOK && revOK) dir = Math.abs(Q0 - K) / K < 1e-12 ? 0 : Q0 < K ? 1 : -1;
    else if (fwdOK) dir = 1;
    else if (revOK) dir = -1;
    else return erro("Falta algo nos dois lados: para a reação ir para a direita é preciso ter todos os reagentes, e para ir para a esquerda, todos os produtos. Informe os valores iniciais que faltam.");
    const passos = [];
    passos.push(R("Equação, fases e K", `${eq(equacaoHTML(L))}${notaFases(L, tipo)}${eq(E.html)}<p>O valor dado é ${E.k} = <b>${KF(K)}</b>.</p>`));
    const q = tipo === "p" ? "Q<sub>p</sub>" : "Q<sub>c</sub>";
    passos.push(R("Para onde a reação vai?", `<p>Compare o quociente inicial ${q} com K antes de montar a tabela, para saber o sinal de x:</p>${eq(`${q} = ${substK(inc, c0, tipo)} = ${Q0 === Infinity ? "∞" : Number.isNaN(Q0) ? "indefinido" : KF(Q0)}`)}<p>${dir === 0 ? "Q = K: já está em equilíbrio (x = 0)." : dir > 0 ? `${q} &lt; K (ou faltam produtos): vai para a <b>direita</b> →, então os reagentes diminuem e os produtos aumentam.` : `${q} &gt; K (ou faltam reagentes): vai para a <b>esquerda</b> ←, então os produtos diminuem e os reagentes aumentam.`}</p>`));
    const xc = (x) => (x.coef === 1 ? "x" : coefTxt(x.coef) + "x");
    const sgnX = (x) => (dir * x.exp > 0 ? "+" : "−");
    const linhaVar = inc.map((x) => (dir === 0 ? "0" : `${sgnX(x)}${xc(x)}`));
    const termo = (x, j) => {
      if (dir === 0) return N(c0[j]);
      if (c0[j] === 0) return xc(x);
      return `(${N(c0[j], 4)} ${sgnX(x)} ${xc(x)})`;
    };
    const unid = tipo === "p" ? "atm" : "mol/L";
    if (dir === 0) {
      passos.push(R("Resultado", `<p>Como Q = K, nada muda: as concentrações de equilíbrio são as iniciais.</p>`));
      return { ok: true, passos, valor: 0, x: 0, eqm: c0, resposta: "x = 0 (já em equilíbrio)", respostaHTML: "x = <b>0</b> (já em equilíbrio)" };
    }
    const tbl = tabela(["", ...inc.map((x) => `${simb(x, tipo)}`)], [
      ["<b>I</b>nicial", ...c0.map((v) => N(v, 4))],
      ["<b>C</b>variação", ...linhaVar],
      ["<b>E</b>quilíbrio", ...inc.map((x, j) => termo(x, j))],
    ]);
    passos.push(R("Monte a tabela ICE", `<p>I = inicial, C = variação, E = equilíbrio. Chame de <b>x</b> a quantidade que reage (em mol/L ou atm, "por coeficiente"): cada espécie varia x vezes o seu coeficiente. Reagentes que são consumidos têm sinal −; produtos formados, +.</p>${tbl}${dica("Espécies que não aparecem na tabela (sólidos e líquidos) não entram em K e não mudam a conta.")}`));
    const cat = (lado) => {
      const l = inc.map((x, j) => ({ x, j })).filter((o) => o.x.lado === lado);
      if (!l.length) return "1";
      return l.map(({ x, j }) => { const t = termo(x, j); return x.coef === 1 ? t : (/^\(/.test(t) || t === "x" ? t : `(${t})`) + expTxt(x.coef); }).join(" · ");
    };
    const deno = inc.some((x) => x.lado === -1);
    passos.push(R("Substitua na expressão de K", `<p>O equilíbrio é descrito pela equação em x:</p>${eq(`${KF(K)} = ${deno ? frac(cat(1), cat(-1)) : cat(1)}`)}<p>Essa é uma equação polinomial em x (grau ${Math.max(1, Math.round(prodInc.reduce((a, x) => a + x.coef, 0) + reagInc.reduce((a, x) => a + x.coef, 0)))} no máximo, antes de simplificar). Vamos resolvê-la <b>sem aproximar</b>.</p>`));
    // solução numérica
    const lnK = Math.log(K);
    const ci = (j, y, aprox) => {
      const x = inc[j], d = dir * x.exp;
      if (aprox && d < 0) return c0[j];
      return Math.max(c0[j] + d * y, 0);
    };
    const lnQ = (y, aprox) => {
      let s = 0;
      inc.forEach((x, j) => { s += x.exp * Math.log(ci(j, y, aprox)); });
      return s;
    };
    let yhi = Infinity;
    inc.forEach((x, j) => { const d = dir * x.exp; if (d < 0) yhi = Math.min(yhi, c0[j] / -d); });
    const resolver = (aprox) => {
      const g = (y) => lnQ(y, aprox) - lnK;
      const sgn = dir > 0 ? -1 : 1; // sinal de g em y = 0
      let lo = 0, hi = aprox ? Infinity : yhi;
      if (!isFinite(hi)) {
        hi = 1;
        let it = 0;
        while (Math.sign(g(hi)) === sgn && it++ < 2000) hi *= 2;
        if (Math.sign(g(hi)) === sgn) return null;
      }
      for (let it = 0; it < 4000; it++) {
        const mid = (lo + hi) / 2;
        if (mid <= lo || mid >= hi) break;
        const gm = g(mid);
        if (Number.isNaN(gm)) return null;
        if (Math.sign(gm) === sgn) lo = mid; else hi = mid;
      }
      return (lo + hi) / 2;
    };
    const x = resolver(false);
    if (x == null || !(x > 0)) return erro("Não consegui resolver numericamente. Confira os dados (K, valores iniciais e fases).");
    const eqm = inc.map((_, j) => ci(j, x, false));
    const Qchk = valorQ(inc, eqm).Q;
    const erroRel = Math.abs(Qchk - K) / K;
    passos.push(R("Resolva para x", `<p>Como a função Q(x) cresce (ou decresce) sempre num só sentido dentro do intervalo possível (0 &lt; x &lt; ${isFinite(yhi) ? N(yhi, 4) : "∞"}, onde nenhuma concentração fica negativa), existe <b>uma única raiz válida</b>. Encontrei por bisseção (método numérico robusto, que não depende de chute inicial):</p>${eq(`x = <b>${N(x, 5)}</b> ${un(unid)}`)}${dica("Se você resolver à mão a equação de 2º grau, a outra raiz será negativa ou fará alguma concentração negativa: ela deve ser descartada.")}`));
    const cEq = inc.map((x2, j) => ({ x: x2, v: eqm[j] }));
    passos.push(R("Concentrações no equilíbrio", tabela(["Espécie", "Conta", `Equilíbrio (${unid})`], cEq.map(({ x: x2, v }, j) => [simb(x2, tipo), dir === 0 ? "" : c0[j] === 0 ? `${sgnX(x2) === "+" ? "" : "−"}${coefTxt(x2.coef) || ""} × ${N(x, 5)}` : `${N(c0[j], 4)} ${sgnX(x2)} ${coefTxt(x2.coef) ? coefTxt(x2.coef) + " × " : ""}${N(x, 5)}`, `<b>${N(v, 5)}</b>`]))));
    // aproximação x pequeno
    const dec = inc.map((x2, j) => ({ x: x2, j })).filter(({ x: x2 }) => dir * x2.exp < 0 && c0[inc.indexOf(x2)] > 0);
    let aprox = null, razao = null;
    if (dec.length) {
      aprox = resolver(true);
      razao = Math.max(...dec.map(({ x: x2, j }) => (x2.coef * x) / c0[j]));
    }
    let hA = "";
    if (aprox != null) {
      const errA = Math.abs(aprox - x) / x;
      hA = `<p>Quando K é pequeno, x costuma ser desprezível diante da concentração inicial dos reagentes que diminuem. Então se usa "c₀ − x ≈ c₀" e a equação fica bem mais simples. Resolvendo com essa simplificação: x ≈ <b>${N(aprox, 4)}</b> ${un(unid)}.</p>${eq(`variação relativa = ${frac("coef · x", "c<sub>0</sub>")} = <b>${N(razao * 100, 3)}%</b> &nbsp;&nbsp;(regra dos 5%)`)}<p>${razao < 0.05 ? `Menos de 5%: a aproximação é <b>válida</b> (diferença para o valor exato: ${N(errA * 100, 2)}%).` : `<b>Mais de 5%: a aproximação NÃO é válida</b> aqui (erro de ${N(errA * 100, 2)}%). Use o valor exato.`}</p>`;
    } else hA = "<p>Nesta tabela não há reagente com concentração inicial diminuindo, então a aproximação de 'x pequeno' não se aplica.</p>";
    passos.push(R("A aproximação “x pequeno” (quando vale?)", hA));
    const vz = substK(inc, eqm, tipo);
    passos.push(R("Confira no K", `<p>Substitua os valores de equilíbrio na expressão e veja se volta K:</p>${eq(`${E.k} = ${vz} = <b>${KF(Qchk)}</b>`)}<p>Esperado: ${KF(K)}. ${erroRel < 1e-6 ? "Confere ✓" : "Diferença relativa " + N(erroRel * 100, 2) + "%"}.</p>`));
    const dec1 = dec.length ? dec[0] : null;
    const fr = dec1 ? (dec1.x.coef * x) / c0[dec1.j] : null;
    if (fr != null) passos.push(R("Quanto reagiu", `<p>Fração de ${fqF(dec1.x.f, dec1.x.fase)} que reagiu: ${eq(`${frac(coefTxt(dec1.x.coef) ? coefTxt(dec1.x.coef) + " · " + N(x, 4) : N(x, 4), N(c0[dec1.j], 4))} = <b>${N(fr * 100, 3)}%</b>`)}</p>`));
    const alvoJ = p.alvo != null ? inc.findIndex((z) => z.i === p.alvo) : -1;
    const principal = alvoJ >= 0 ? alvoJ : inc.findIndex((z) => z.lado * dir > 0);
    const xs = inc[principal >= 0 ? principal : 0];
    const jj = inc.indexOf(xs);
    return { ok: true, passos, valor: x, x, eqm, especies: inc, aprox, razao, resposta: `x = ${N(x, 5)}; ${xs.f} no equilíbrio = ${N(eqm[jj], 5)} ${unid}`, respostaHTML: `x = <b>${N(x, 5)}</b><br>${simb(xs, tipo)}<sub>eq</sub> = <b>${N(eqm[jj], 5)}</b> ${un(unid)}`, ref: eqm[jj] };
  }

  // Kc <-> Kp
  function kcKp(p) {
    const de = p.de === "p" ? "p" : "c";
    if (!(p.K > 0)) return erro("Informe o valor de K (maior que zero).");
    const TK = paraK(p.T, p.uT);
    if (!(TK > 0)) return erro("Informe a temperatura (maior que 0 K).");
    let dn = p.dn, L = null;
    if (p.eq) {
      L = lerEqK(p.eq);
      if (!L.ok) return L;
      if (L.semFase) {
        // sem fases: assume todos gases
      }
      const gasR = L.reag.filter((x) => x.fase === "g" || !x.fase).reduce((a, x) => a + x.coef, 0);
      const gasP = L.prod.filter((x) => x.fase === "g" || !x.fase).reduce((a, x) => a + x.coef, 0);
      dn = gasP - gasR;
    }
    if (!fin(dn)) return erro("Informe a equação (com as fases dos gases) ou o valor de Δn.");
    const passos = [];
    if (L) {
      const gasR = L.reag.filter((x) => x.fase === "g" || !x.fase), gasP = L.prod.filter((x) => x.fase === "g" || !x.fase);
      passos.push(R("Conte os mols de gás (Δn)", `${eq(equacaoHTML(L))}<p>Só os <b>gases</b> contam. Δn = (mols de gás nos produtos) − (mols de gás nos reagentes):</p>${eq(`Δn = ${gasP.length ? gasP.map((x) => x.coef).join(" + ") : "0"} − ${gasR.length ? gasR.map((x) => x.coef).join(" + ") : "0"} = <b>${N(dn)}</b>`)}${L.algumaSemFase ? dica("Espécies sem fase foram contadas como gases. Marque (s) ou (l) para excluir sólidos e líquidos.") : ""}`));
    } else passos.push(R("Δn", `<p>Δn = (mols de gás nos produtos) − (mols de gás nos reagentes) = <b>${N(dn)}</b>.</p>`));
    passos.push(R("A relação", `<p>Do gás ideal, P = cRT. Substituindo na expressão de K<sub>p</sub>:</p>${eq("K<sub>p</sub> = K<sub>c</sub> · (R·T)<sup>Δn</sup>")}${dica("R = 0,082 atm·L/(mol·K) quando as pressões estão em atm; T em kelvin. Se Δn = 0, Kp = Kc.")}`));
    passos.push(R("Temperatura em kelvin", p.uT === "°C" ? eq(`T = ${N(p.T)} + 273,15 = <b>${N(TK, 5)} K</b>`) : `<p>T = <b>${N(TK, 5)} K</b>.</p>`));
    const f = Math.pow(RATM * TK, dn);
    let res, h;
    if (de === "c") {
      res = p.K * f;
      h = `${eq(`K<sub>p</sub> = ${KF(p.K)} × (${RATM} × ${N(TK, 5)})<sup>${N(dn)}</sup> = ${KF(p.K)} × ${KF(f)} = <b>${KF(res)}</b>`)}`;
    } else {
      res = p.K / f;
      h = `${eq(`K<sub>c</sub> = ${frac("K<sub>p</sub>", "(R·T)<sup>Δn</sup>")} = ${frac(KF(p.K), "(" + RATM + " × " + N(TK, 5) + ")<sup>" + N(dn) + "</sup>")} = ${frac(KF(p.K), KF(f))} = <b>${KF(res)}</b>`)}`;
    }
    passos.push(R("Calcule", h));
    const nome = de === "c" ? "Kp" : "Kc";
    return { ok: true, passos, valor: res, dn, resposta: `${nome} = ${KF(res).replace(/<sup>/g, "^").replace(/<\/sup>/g, "").replace("×", "x")}`, respostaHTML: `K<sub>${de === "c" ? "p" : "c"}</sub> = <b>${KF(res)}</b>${dn === 0 ? "<br><small>Δn = 0: Kp = Kc</small>" : ""}` };
  }

  // ---------------------------------------------------------------------------
  // Produto de solubilidade
  // ---------------------------------------------------------------------------
  function bisseccaoCrescente(f, hiIni) {
    // f crescente em s ≥ 0; acha s com f(s) = 0
    let lo = 0, hi = hiIni || 1, it = 0;
    while (f(hi) < 0 && it++ < 2000) hi *= 2;
    for (let k = 0; k < 4000; k++) {
      const mid = (lo + hi) / 2;
      if (mid <= lo || mid >= hi) break;
      if (f(mid) < 0) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }
  const ionTxt = (n, s) => (n === 1 ? s : n + s);
  function ksp(p) {
    const x = p.x, y = p.y;
    if (!(Number.isInteger(x) && x >= 1) || !(Number.isInteger(y) && y >= 1)) return erro("Informe quantos cátions (x) e ânions (y) o sal libera por fórmula (números inteiros, ex.: 1 e 2 para CaF₂).");
    const passos = [];
    const nome = p.nome ? fq(p.nome) : `A<sub>${x}</sub>B<sub>${y}</sub>`;
    passos.push(R("Equilíbrio de solubilidade", `<p>Um sal pouco solúvel ${nome} dissolve até saturar. Se o sal libera ${x} cátion(s) A e ${y} ânion(s) B:</p>${eq(`${nome}(s) ⇌ ${ionTxt(x, "A")}(aq) + ${ionTxt(y, "B")}(aq)`)}${eq(`K<sub>ps</sub> = [A]<sup>${x}</sup> · [B]<sup>${y}</sup>`)}${dica("O sólido não entra em K (concentração constante). K<sub>ps</sub> só muda com a temperatura. Quanto menor o Kps (para sais de mesma estequiometria), menos solúvel.")}`));
    if (p.modo === "s") {
      if (!(p.Ksp > 0)) return erro("Informe o Kps (maior que zero).");
      const s = Math.pow(p.Ksp / (Math.pow(x, x) * Math.pow(y, y)), 1 / (x + y));
      passos.push(R("Solubilidade molar s", `<p>Se s mol/L do sal se dissolvem, formam ${x}s de A e ${y}s de B:</p>${eq(`K<sub>ps</sub> = (${x === 1 ? "s" : x + "s"})<sup>${x}</sup> · (${y === 1 ? "s" : y + "s"})<sup>${y}</sup> = ${Math.pow(x, x) * Math.pow(y, y)}·s<sup>${x + y}</sup>`)}${eq(`s = ${"<sup>" + (x + y) + "</sup>√"}(${frac("K<sub>ps</sub>", Math.pow(x, x) * Math.pow(y, y))}) = ${"<sup>" + (x + y) + "</sup>√"}(${frac(KF(p.Ksp), Math.pow(x, x) * Math.pow(y, y))}) = <b>${KF(s)} mol/L</b>`)}`));
      passos.push(R("Concentração dos íons", eq(`[A] = ${x}s = <b>${KF(x * s)} mol/L</b> &nbsp;·&nbsp; [B] = ${y}s = <b>${KF(y * s)} mol/L</b>`) + eq(`Conferindo: (${KF(x * s)})<sup>${x}</sup> · (${KF(y * s)})<sup>${y}</sup> = ${KF(Math.pow(x * s, x) * Math.pow(y * s, y))}`)));
      let extra = "";
      if (p.formula) {
        const f = Q.parseFormula(p.formula);
        if (f.ok) { const M = Q.massaMolar(f).total; extra = `<br><small>${N(s * M, 3)} g/L (M = ${N(M, 4)} g/mol)</small>`; passos.push(R("Em gramas por litro", eq(`${KF(s)} mol/L × ${N(M, 5)} g/mol = <b>${KF(s * M)} g/L</b>`))); }
      }
      return { ok: true, passos, valor: s, s, resposta: `s = ${KF(s).replace(/<[^>]+>/g, "")} mol/L`, respostaHTML: `s = <b>${KF(s)}</b> ${un("mol/L")}${extra}` };
    }
    if (p.modo === "ksp") {
      if (!(p.s > 0)) return erro("Informe a solubilidade molar s (maior que zero).");
      const K = Math.pow(x * p.s, x) * Math.pow(y * p.s, y);
      passos.push(R("Calcule o Kps", `<p>Em mol/L: [A] = ${x}s e [B] = ${y}s.</p>${eq(`K<sub>ps</sub> = (${x} × ${KF(p.s)})<sup>${x}</sup> · (${y} × ${KF(p.s)})<sup>${y}</sup> = ${KF(x * p.s)}<sup>${x}</sup> · ${KF(y * p.s)}<sup>${y}</sup> = <b>${KF(K)}</b>`)}`));
      return { ok: true, passos, valor: K, resposta: `Kps = ${KF(K).replace(/<[^>]+>/g, "")}`, respostaHTML: `K<sub>ps</sub> = <b>${KF(K)}</b>` };
    }
    if (p.modo === "comum") {
      if (!(p.Ksp > 0)) return erro("Informe o Kps (maior que zero).");
      const Ca = p.Ca || 0, Cb = p.Cb || 0;
      if (Ca < 0 || Cb < 0) return erro("As concentrações do íon comum não podem ser negativas.");
      if (Ca === 0 && Cb === 0) return erro("Informe a concentração do íon comum (cátion A ou ânion B) já presente na solução.");
      const f = (s) => x * Math.log(Ca + x * s) + y * Math.log(Cb + y * s) - Math.log(p.Ksp);
      const s = bisseccaoCrescente((v) => (v === 0 ? (Ca === 0 ? -Infinity : f(1e-300)) : f(v)), 1e-6);
      const s0 = Math.pow(p.Ksp / (Math.pow(x, x) * Math.pow(y, y)), 1 / (x + y));
      passos.push(R("Solubilidade em água pura (referência)", eq(`s<sub>0</sub> = ${"<sup>" + (x + y) + "</sup>√"}(${frac("K<sub>ps</sub>", Math.pow(x, x) * Math.pow(y, y))}) = <b>${KF(s0)} mol/L</b>`)));
      const A = Ca > 0 ? `(${KF(Ca)} + ${ionTxt(x, "s")})` : ionTxt(x, "s"), B = Cb > 0 ? `(${KF(Cb)} + ${ionTxt(y, "s")})` : ionTxt(y, "s");
      passos.push(R("Monte K<sub>ps</sub> com o íon comum", `<p>O íon que já está na solução (de outra fonte) soma-se ao que vem do sal:</p>${eq(`K<sub>ps</sub> = [A]<sup>${x}</sup>[B]<sup>${y}</sup> = ${A}<sup>${x}</sup> · ${B}<sup>${y}</sup> = ${KF(p.Ksp)}`)}`));
      passos.push(R("Resolva para s (exato)", `<p>Resolvendo numericamente (bisseção; o lado esquerdo cresce com s, então há uma só raiz positiva):</p>${eq(`s = <b>${KF(s)} mol/L</b>`)}<p>Conferindo: [A]<sup>${x}</sup>[B]<sup>${y}</sup> = ${KF(Math.pow(Ca + x * s, x) * Math.pow(Cb + y * s, y))} (Kps = ${KF(p.Ksp)}).</p>`));
      // aproximação
      let aprox = null;
      if (Ca > 0 && Cb === 0) aprox = Math.pow(p.Ksp / (Math.pow(Ca, x) * Math.pow(y, y)), 1 / y);
      else if (Cb > 0 && Ca === 0) aprox = Math.pow(p.Ksp / (Math.pow(Cb, y) * Math.pow(x, x)), 1 / x);
      if (aprox != null) passos.push(R("Aproximação (íon comum em excesso)", `<p>Se o íon comum já é muito mais concentrado do que o que o sal fornece (x·s ≪ C), pode-se usar C no lugar de C + x·s:</p>${eq(`s ≈ <b>${KF(aprox)} mol/L</b>`)}<p>${Math.abs(aprox - s) / s < 0.05 ? "Aproximação boa (erro &lt; 5%)." : "Aqui a aproximação não é boa: use o valor exato."}</p>`));
      passos.push(R("Efeito do íon comum", `<p>A solubilidade caiu de ${KF(s0)} para ${KF(s)} mol/L: <b>${N(s0 / s, 3)} vezes menor</b>. É o princípio de Le Chatelier: adicionar um dos íons desloca o equilíbrio para o sólido (menos sal dissolvido).</p>`));
      return { ok: true, passos, valor: s, s, s0, resposta: `s = ${KF(s).replace(/<[^>]+>/g, "")} mol/L`, respostaHTML: `s = <b>${KF(s)}</b> ${un("mol/L")}<br><small>em água pura: ${KF(s0)} mol/L</small>` };
    }
    if (p.modo === "preci") {
      if (!(p.Ksp > 0)) return erro("Informe o Kps (maior que zero).");
      let a = p.a, b = p.b;
      if (!(a >= 0) || !(b >= 0) || a == null || b == null) return erro("Informe as concentrações do cátion e do ânion.");
      if (p.V1 > 0 && p.V2 > 0) {
        const Vt = p.V1 + p.V2;
        passos.push(R("Diluição pela mistura", `<p>Ao misturar as duas soluções, cada íon se dilui no volume total (C<sub>f</sub> = C·V ÷ V<sub>total</sub>):</p>${eq(`[A] = ${frac(KF(a) + " × " + N(p.V1), N(Vt))} = <b>${KF(a * p.V1 / Vt)} mol/L</b>`)}${eq(`[B] = ${frac(KF(b) + " × " + N(p.V2), N(Vt))} = <b>${KF(b * p.V2 / Vt)} mol/L</b>`)}${dica("Esquecer essa diluição é o erro mais comum.")}`));
        a = a * p.V1 / Vt; b = b * p.V2 / Vt;
      }
      const Qv = Math.pow(a, x) * Math.pow(b, y);
      passos.push(R("Quociente iônico Q", `${eq(`Q = [A]<sup>${x}</sup> · [B]<sup>${y}</sup> = (${KF(a)})<sup>${x}</sup> · (${KF(b)})<sup>${y}</sup> = <b>${KF(Qv)}</b>`)}<p>Q tem a forma do Kps, mas com as concentrações <b>do momento</b>.</p>`));
      const rel = Math.abs(Qv - p.Ksp) / p.Ksp;
      const res = rel < 1e-6 ? "solução saturada (Q = Kps): está no limite, sem precipitar" : Qv > p.Ksp ? "Q > Kps: PRECIPITA" : "Q < Kps: NÃO precipita (solução insaturada)";
      passos.push(R("Compare com o Kps", `${eq(`Q = ${KF(Qv)} &nbsp;${Qv > p.Ksp ? "&gt;" : rel < 1e-6 ? "=" : "&lt;"}&nbsp; K<sub>ps</sub> = ${KF(p.Ksp)}`)}<p>${Qv > p.Ksp ? "Q &gt; Kps: a solução está <b>supersaturada</b>; o excesso se separa como sólido (<b>há precipitação</b>) até Q cair ao valor do Kps." : rel < 1e-6 ? "Q = Kps: solução <b>saturada</b>, no limite exato." : "Q &lt; Kps: solução <b>insaturada</b>; <b>não há precipitado</b>."}</p>`));
      if (a > 0) {
        const bmin = Math.pow(p.Ksp / Math.pow(a, x), 1 / y);
        passos.push(R("Extra: concentração mínima para precipitar", `<p>Mantendo [A] = ${KF(a)} mol/L, o ânion começa a precipitar quando [B] passa de:</p>${eq(`[B]<sub>mín</sub> = ${"<sup>" + y + "</sup>√"}(${frac("K<sub>ps</sub>", "[A]<sup>" + x + "</sup>")}) = <b>${KF(bmin)} mol/L</b>`)}`));
      }
      return { ok: true, passos, valor: Qv, Q: Qv, precipita: Qv > p.Ksp * (1 + 1e-6), resposta: res, respostaHTML: `Q = <b>${KF(Qv)}</b> · K<sub>ps</sub> = ${KF(p.Ksp)}<br><small>${res}</small>` };
    }
    return erro("Escolha o que calcular.");
  }

  // ---------------------------------------------------------------------------
  // Ka, Kb, pKa, pKb
  // ---------------------------------------------------------------------------
  function acidoBase(p) {
    const v = p.valor;
    if (!(v > 0 || (v === 0 && false)) && !(p.tem === "pKa" || p.tem === "pKb") ) return erro("Informe um valor maior que zero.");
    if (!fin(v)) return erro("Informe um número.");
    let pKa, pKb;
    const passos = [];
    passos.push(R("As relações", `<p>Para um ácido HA e a sua base conjugada A<sup>−</sup> (ou uma base e seu ácido conjugado), a 25 °C:</p>${eq("K<sub>a</sub> · K<sub>b</sub> = K<sub>w</sub> = 10<sup>−14</sup> &nbsp;&nbsp;⇔&nbsp;&nbsp; pK<sub>a</sub> + pK<sub>b</sub> = 14")}${eq("pK = −log K &nbsp;&nbsp;⇔&nbsp;&nbsp; K = 10<sup>−pK</sup>")}${dica("Quanto maior o Ka (menor o pKa), mais forte o ácido. Ácido forte ⇒ base conjugada fraquíssima, e vice-versa. O valor de Kw = 10⁻¹⁴ vale a 25 °C; em outras temperaturas muda.")}`));
    if (p.tem === "Ka") { if (!(v > 0)) return erro("Ka deve ser maior que zero."); pKa = -Math.log10(v); passos.push(R("pKa", eq(`pK<sub>a</sub> = −log(${KF(v)}) = <b>${N(pKa, 4)}</b>`))); }
    else if (p.tem === "pKa") { pKa = v; passos.push(R("pKa dado", `<p>pK<sub>a</sub> = <b>${N(pKa, 4)}</b>.</p>`)); }
    else if (p.tem === "Kb") { if (!(v > 0)) return erro("Kb deve ser maior que zero."); pKb = -Math.log10(v); passos.push(R("pKb", eq(`pK<sub>b</sub> = −log(${KF(v)}) = <b>${N(pKb, 4)}</b>`))); }
    else if (p.tem === "pKb") { pKb = v; passos.push(R("pKb dado", `<p>pK<sub>b</sub> = <b>${N(pKb, 4)}</b>.</p>`)); }
    else return erro("Escolha qual valor você tem.");
    if (pKa == null) { pKa = 14 - pKb; passos.push(R("Ache o pKa", eq(`pK<sub>a</sub> = 14 − pK<sub>b</sub> = 14 − ${par(pKb, 4)} = <b>${N(pKa, 4)}</b>`))); }
    else if (pKb == null) { pKb = 14 - pKa; passos.push(R("Ache o pKb", eq(`pK<sub>b</sub> = 14 − pK<sub>a</sub> = 14 − ${par(pKa, 4)} = <b>${N(pKb, 4)}</b>`))); }
    const Ka = Math.pow(10, -pKa), Kb = Math.pow(10, -pKb);
    passos.push(R("Volte para as constantes", eq(`K<sub>a</sub> = 10<sup>−${N(pKa, 4)}</sup> = <b>${KF(Ka)}</b>`) + eq(`K<sub>b</sub> = 10<sup>−${N(pKb, 4)}</sup> = <b>${KF(Kb)}</b>`) + `<p>Conferindo: K<sub>a</sub>·K<sub>b</sub> = ${KF(Ka * Kb)} ≈ 10<sup>−14</sup> ✓</p>`));
    const forca = pKa < 0 ? "ácido forte (ioniza praticamente por completo)" : pKa < 4 ? "ácido fraco relativamente forte" : pKa < 10 ? "ácido fraco" : "ácido muito fraco";
    passos.push(R("Interpretação", `<p>Com pK<sub>a</sub> = ${N(pKa, 3)}: ${forca}. A base conjugada tem pK<sub>b</sub> = ${N(pKb, 3)}.</p>`));
    return { ok: true, passos, valor: Ka, Ka, Kb, pKa, pKb, resposta: `Ka = ${KF(Ka).replace(/<[^>]+>/g, "")}; Kb = ${KF(Kb).replace(/<[^>]+>/g, "")}; pKa = ${N(pKa, 4)}; pKb = ${N(pKb, 4)}`, respostaHTML: `K<sub>a</sub> = <b>${KF(Ka)}</b> · pK<sub>a</sub> = <b>${N(pKa, 4)}</b><br>K<sub>b</sub> = <b>${KF(Kb)}</b> · pK<sub>b</sub> = <b>${N(pKb, 4)}</b>` };
  }

  // ---------------------------------------------------------------------------
  // Tampão
  // ---------------------------------------------------------------------------
  function tampao(p) {
    let pKa;
    if (!(p.ca >= 0) || !(p.cb >= 0) || p.ca == null || p.cb == null) return erro("Informe a concentração do componente ácido e a do componente básico.");
    if (!(p.ca > 0) || !(p.cb > 0)) return erro("As duas concentrações devem ser maiores que zero para existir tampão (um ácido fraco e a sua base conjugada).");
    const passos = [];
    const acido = p.tipo !== "base";
    const nomeA = acido ? "HA" : "BH<sup>+</sup>", nomeB = acido ? "A<sup>−</sup>" : "B";
    passos.push(R("O que é um tampão", `<p>Uma solução tampão resiste a variações de pH ao receber pequenas quantidades de ácido ou base forte. Ela tem um <b>par conjugado</b>: um ácido fraco e a sua base conjugada em quantidades parecidas (${acido ? "ex.: ácido acético + acetato" : "ex.: amônia + cloreto de amônio"}). O ácido consome a base adicionada; a base consome o ácido adicionado.</p>${eq("pH = pK<sub>a</sub> + log " + frac("[base]", "[ácido]") + " &nbsp;&nbsp;(Henderson-Hasselbalch)")}${dica("Aqui 'ácido' é " + nomeA + " e 'base' é " + nomeB + ". A razão pode ser feita em mol ou em mol/L, tanto faz, desde que no mesmo volume.")}`));
    if (p.const === "Ka") pKa = -Math.log10(p.valor);
    else if (p.const === "pKa") pKa = p.valor;
    else if (p.const === "Kb") pKa = 14 + Math.log10(p.valor);
    else if (p.const === "pKb") pKa = 14 - p.valor;
    else return erro("Informe o Ka, pKa, Kb ou pKb.");
    if (!fin(pKa) || (p.const[0] === "K" && !(p.valor > 0))) return erro("O valor da constante deve ser um número maior que zero.");
    const txtC = { Ka: `pK<sub>a</sub> = −log(${KF(p.valor)}) = <b>${N(pKa, 4)}</b>`, pKa: `pK<sub>a</sub> = <b>${N(pKa, 4)}</b>`, Kb: `pK<sub>b</sub> = −log(${KF(p.valor)}) = ${N(-Math.log10(p.valor), 4)}; &nbsp; pK<sub>a</sub> = 14 − pK<sub>b</sub> = <b>${N(pKa, 4)}</b>`, pKb: `pK<sub>a</sub> = 14 − pK<sub>b</sub> = 14 − ${N(p.valor, 4)} = <b>${N(pKa, 4)}</b>` };
    passos.push(R("pKa do par", `<p>${acido ? "" : "Para um tampão de base fraca, o pKa que vale é o do ácido conjugado (BH<sup>+</sup>). "}</p>${eq(txtC[p.const])}`));
    const razao = p.cb / p.ca;
    const pH0 = pKa + Math.log10(razao);
    passos.push(R("Henderson-Hasselbalch (pH inicial)", `${eq(`pH = ${N(pKa, 4)} + log ${frac(N(p.cb, 4), N(p.ca, 4))} = ${N(pKa, 4)} + log(${N(razao, 4)}) = ${N(pKa, 4)} ${sinal(Math.log10(razao), 4)} = <b>${N(pH0, 4)}</b>`)}${razao < 0.1 || razao > 10 ? aviso("a razão base/ácido está fora de 0,1 a 10; nessa faixa o tampão é fraco e a equação é só aproximada.") : dica("A equação vale bem para razão entre 0,1 e 10 (pH = pKa ± 1) e quando as concentrações são muito maiores que Ka.")}${p.ca === p.cb ? "<p>Quando as concentrações são iguais, log 1 = 0 e <b>pH = pKa</b>: é o ponto de máxima capacidade tamponante.</p>" : ""}`));
    let pH1 = null, dpH = null, tipoAdd = null;
    if (p.add && p.add.n > 0) {
      const V = p.V;
      if (!(V > 0)) return erro("Informe o volume do tampão (mL) para calcular a adição.");
      const VL = V / 1000;
      const nA = p.ca * VL, nB = p.cb * VL;
      const nAdd = p.add.n; // mol
      const forte = p.add.tipo === "acido" ? "H<sup>+</sup> (ácido forte)" : "OH<sup>−</sup> (base forte)";
      passos.push(R("Quantidades em mol", `<p>Com a adição, calcule em <b>mol</b> (a concentração muda com o volume, mas a razão em mol não):</p>${eq(`n(${nomeA}) = ${N(p.ca, 4)} × ${N(VL, 4)} L = <b>${N(nA, 4)} mol</b>`)}${eq(`n(${nomeB}) = ${N(p.cb, 4)} × ${N(VL, 4)} L = <b>${N(nB, 4)} mol</b>`)}${eq(`n(${forte}) = <b>${N(nAdd, 4)} mol</b>`)}`));
      let nA2, nB2, ex = 0;
      if (p.add.tipo === "acido") {
        // H+ + base -> ácido
        const reage = Math.min(nAdd, nB);
        nB2 = nB - reage; nA2 = nA + reage; ex = nAdd - reage;
        passos.push(R("O ácido forte reage com a base do tampão", `<p>${nomeB} + H<sup>+</sup> → ${nomeA}. O ácido adicionado <b>consome</b> a base e <b>forma</b> ácido:</p>${tabela(["", nomeA, nomeB], [["antes", N(nA, 4), N(nB, 4)], ["reage", `+ ${N(reage, 4)}`, `− ${N(reage, 4)}`], ["depois", N(nA2, 4), N(nB2, 4)]])}`));
      } else {
        const reage = Math.min(nAdd, nA);
        nA2 = nA - reage; nB2 = nB + reage; ex = nAdd - reage;
        passos.push(R("A base forte reage com o ácido do tampão", `<p>${nomeA} + OH<sup>−</sup> → ${nomeB} + H<sub>2</sub>O. A base adicionada <b>consome</b> o ácido e <b>forma</b> base:</p>${tabela(["", nomeA, nomeB], [["antes", N(nA, 4), N(nB, 4)], ["reage", `− ${N(reage, 4)}`, `+ ${N(reage, 4)}`], ["depois", N(nA2, 4), N(nB2, 4)]])}`));
      }
      if (ex > 1e-12 * Math.max(nAdd, 1) && (nA2 === 0 || nB2 === 0)) {
        const c = ex / VL;
        pH1 = p.add.tipo === "acido" ? -Math.log10(c) : 14 + Math.log10(c);
        passos.push(R("A capacidade do tampão acabou", `<p>Adicionou-se mais ${p.add.tipo === "acido" ? "ácido" : "base"} forte do que o tampão aguenta. Sobram ${N(ex, 4)} mol em excesso, que determinam o pH (volume ≈ ${N(V)} mL):</p>${eq(p.add.tipo === "acido" ? `pH = −log(${N(c, 4)}) = <b>${N(pH1, 4)}</b>` : `pOH = −log(${N(c, 4)}) = ${N(-Math.log10(c), 4)}; &nbsp; pH = 14 − pOH = <b>${N(pH1, 4)}</b>`)}`));
      } else {
        pH1 = pKa + Math.log10(nB2 / nA2);
        passos.push(R("Novo pH (Henderson-Hasselbalch)", eq(`pH = ${N(pKa, 4)} + log ${frac(N(nB2, 4), N(nA2, 4))} = <b>${N(pH1, 4)}</b>`)));
      }
      dpH = pH1 - pH0;
      tipoAdd = p.add.tipo;
      // água pura
      const c = nAdd / VL;
      const phAgua = p.add.tipo === "acido" ? -Math.log10(c) : 14 + Math.log10(c);
      passos.push(R("Compare: o que aconteceria sem tampão", `<p>Se a mesma quantidade fosse adicionada a ${N(V)} mL de água pura (pH 7): [${p.add.tipo === "acido" ? "H<sup>+</sup>" : "OH<sup>−</sup>"}] = ${N(nAdd, 4)} mol ÷ ${N(VL, 4)} L = ${N(c, 4)} mol/L, e o pH iria para <b>${N(phAgua, 3)}</b> (variação de ${N(Math.abs(phAgua - 7), 3)} unidades).</p><p>No tampão a variação foi de apenas <b>${N(Math.abs(dpH), 3)}</b> unidade${Math.abs(dpH) === 1 ? "" : "s"}: ${N(pH0, 4)} → ${N(pH1, 4)}.</p>${dica("Desprezei a pequena mudança de volume ao adicionar o ácido ou a base.")}`));
    }
    const fim = pH1 != null ? pH1 : pH0;
    return { ok: true, passos, valor: fim, pH0, pH1, dpH, pKa, resposta: pH1 != null ? `pH inicial ${N(pH0, 4)}; pH final ${N(pH1, 4)} (variação ${N(dpH, 3)})` : `pH = ${N(pH0, 4)}`, respostaHTML: pH1 != null ? `pH: ${N(pH0, 4)} → <b>${N(pH1, 4)}</b><br><small>variação de ${N(dpH, 3)} com a adição de ${tipoAdd === "acido" ? "ácido" : "base"} forte</small>` : `pH = <b>${N(pH0, 4)}</b><br><small>pK<sub>a</sub> = ${N(pKa, 3)}</small>` };
  }

  // ---------------------------------------------------------------------------
  // Cinética
  // ---------------------------------------------------------------------------
  const sup2 = (e) => `<sup>${String(e).replace("-", "−")}</sup>`;
  function unidadeK(n, ut = "s") {
    const e = 1 - n;
    if (Math.abs(n - 1) < 1e-9) return `${ut}${sup2(-1)}`;
    if (Math.abs(n) < 1e-9) return `mol·L${sup2(-1)}·${ut}${sup2(-1)}`;
    if (Math.abs(n - 2) < 1e-9) return `L·mol${sup2(-1)}·${ut}${sup2(-1)}`;
    if (Math.abs(n - 3) < 1e-9) return `L${sup2(2)}·mol${sup2(-2)}·${ut}${sup2(-1)}`;
    return `mol${sup2(N(e))}·L${sup2(N(-e))}·${ut}${sup2(-1)}`;
  }
  const FORMAS = [
    { n: 0, y: "[A]", lei: "[A] = [A]<sub>0</sub> − k·t", lin: "[A] × t", t12: (A0, k) => A0 / (2 * k), f: (A) => A, inv: (y) => y, s: -1 },
    { n: 1, y: "ln[A]", lei: "ln[A] = ln[A]<sub>0</sub> − k·t", lin: "ln[A] × t", t12: (A0, k) => Math.LN2 / k, f: (A) => Math.log(A), inv: (y) => Math.exp(y), s: -1 },
    { n: 2, y: "1/[A]", lei: "1/[A] = 1/[A]<sub>0</sub> + k·t", lin: "1/[A] × t", t12: (A0, k) => 1 / (k * A0), f: (A) => 1 / A, inv: (y) => 1 / y, s: 1 },
  ];
  const T12TXT = { 0: ["[A]<sub>0</sub> ÷ (2k)", "depende da concentração inicial (diminui conforme a reação anda)"], 1: ["ln 2 ÷ k = 0,693 ÷ k", "<b>constante</b>: não depende de [A]<sub>0</sub> (típico de decaimento radioativo)"], 2: ["1 ÷ (k·[A]<sub>0</sub>)", "<b>aumenta</b> conforme a concentração cai (cada meia-vida dura mais que a anterior)"] };
  function _paraSeg(t, u) {
    const f = { s: 1, min: 60, h: 3600, dia: 86400, ano: 31557600 };
    return t * (f[u] || 1);
  }
  function leiIntegrada(p) {
    const F = FORMAS[p.ordem];
    if (!F) return erro("Escolha a ordem da reação: 0, 1 ou 2.");
    const ut = p.ut || "s";
    const dados = { k: p.k, A0: p.A0, A: p.A, t: p.t };
    const nomes = { k: "a constante k", A0: "[A]₀", A: "[A] no instante t", t: "o tempo t" };
    const vazios = Object.keys(dados).filter((c) => dados[c] == null);
    for (const c of Object.keys(dados)) if (dados[c] != null && !fin(dados[c])) return erro(`Valor inválido para ${nomes[c]}.`);
    if (vazios.length > 1) return erro("Deixe em branco só o que você quer descobrir e preencha o resto: k, [A]₀, [A] e t.");
    const passos = [];
    passos.push(R(`Lei integrada de ordem ${F.n}`, `<p>A lei de velocidade é v = k${F.n === 0 ? "" : F.n === 1 ? "·[A]" : "·[A]²"}. Integrando no tempo se obtém uma equação que dá a concentração em cada instante:</p>${eq(F.lei)}<p>Isso é uma <b>reta</b> quando se faz o gráfico de <b>${F.lin}</b>${F.n === 2 ? " (inclinação +k)" : " (inclinação −k)"}. Unidade de k: ${eq(`k em ${unidadeK(F.n, ut)}`)}${dica("A unidade de k depende da ordem: ela revela a ordem da reação. Em 1ª ordem, k tem unidade de 1/tempo.")}</p>`));
    for (const c of ["k", "A0", "A"]) if (dados[c] != null && !(dados[c] > 0) && !(c === "A" && dados[c] === 0 && F.n === 0) && !(c === "A0" && false)) return erro(`${c === "k" ? "k" : c === "A0" ? "[A]₀" : "[A]"} deve ser maior que zero.`);
    if (dados.t != null && dados.t < 0) return erro("O tempo não pode ser negativo.");
    let { k, A0, A, t } = dados;
    const y = (v) => F.f(v);
    const _Fn = (v) => N(y(v), 5);
    const alvo = vazios[0] || "A";
    if (alvo === "A") {
      if (k == null || A0 == null || t == null) return erro("Informe k, [A]₀ e t.");
      const yv = y(A0) + F.s * k * t;
      if (F.n === 0 && yv <= 0) {
        A = 0;
        const tfim = A0 / k;
        passos.push(R("Calcule [A]", `<p>Em ordem zero o reagente se esgota em um tempo finito:</p>${eq(`t<sub>esgota</sub> = ${frac("[A]<sub>0</sub>", "k")} = ${frac(N(A0), N(k))} = <b>${N(tfim)} ${ut}</b>`)}<p>Como t = ${N(t)} ${ut} é maior ou igual a isso, o reagente já acabou: <b>[A] = 0</b>.</p>`));
        return fimLei(passos, F, k, A0, 0, t, ut, "A");
      }
      A = F.inv(yv);
      passos.push(R("Substitua na equação", `${eq(F.lei)}${F.n === 0 ? eq(`[A] = ${N(A0)} − ${N(k)} × ${N(t)} = <b>${N(A, 5)} mol/L</b>`) : F.n === 1 ? eq(`ln[A] = ln(${N(A0)}) − ${N(k)} × ${N(t)} = ${N(yv, 5)}  ⇒  [A] = e<sup>${N(yv, 5)}</sup> = <b>${N(A, 5)} mol/L</b>`) : eq(`1/[A] = 1/${N(A0)} + ${N(k)} × ${N(t)} = ${N(yv, 5)}  ⇒  [A] = <b>${N(A, 5)} mol/L</b>`)}`));
    } else if (alvo === "t") {
      if (k == null || A0 == null || A == null) return erro("Informe k, [A]₀ e [A].");
      if (A > A0) return erro("[A] deve ser menor que [A]₀ (o reagente é consumido com o tempo).");
      if (A === 0 && F.n !== 0) return erro("Em ordens 1 e 2 a concentração nunca chega exatamente a zero. Use um valor maior que 0.");
      t = (y(A) - y(A0)) / (F.s * k);
      passos.push(R("Isole o tempo", `${eq(F.lei)}${eq(F.n === 0 ? `t = ${frac("[A]<sub>0</sub> − [A]", "k")} = ${frac(N(A0) + " − " + N(A), N(k))} = <b>${N(t, 5)} ${ut}</b>` : F.n === 1 ? `t = ${frac("ln([A]<sub>0</sub>/[A])", "k")} = ${frac("ln(" + N(A0) + "/" + N(A) + ")", N(k))} = <b>${N(t, 5)} ${ut}</b>` : `t = ${frac("1/[A] − 1/[A]<sub>0</sub>", "k")} = ${frac("1/" + N(A) + " − 1/" + N(A0), N(k))} = <b>${N(t, 5)} ${ut}</b>`)}`));
    } else if (alvo === "k") {
      if (A0 == null || A == null || t == null) return erro("Informe [A]₀, [A] e t.");
      if (!(t > 0)) return erro("O tempo deve ser maior que zero para achar k.");
      if (A > A0) return erro("[A] deve ser menor que [A]₀.");
      if (A === 0 && F.n !== 0) return erro("Use [A] maior que zero.");
      k = (y(A) - y(A0)) / (F.s * t);
      passos.push(R("Isole k", `${eq(F.lei)}${eq(F.n === 0 ? `k = ${frac("[A]<sub>0</sub> − [A]", "t")} = <b>${N(k, 5)}</b> ${un(unidadeK(0, ut))}` : F.n === 1 ? `k = ${frac("ln([A]<sub>0</sub>/[A])", "t")} = ${frac("ln(" + N(A0) + "/" + N(A) + ")", N(t))} = <b>${N(k, 5)}</b> ${un(unidadeK(1, ut))}` : `k = ${frac("1/[A] − 1/[A]<sub>0</sub>", "t")} = <b>${N(k, 5)}</b> ${un(unidadeK(2, ut))}`)}`));
    } else {
      if (k == null || A == null || t == null) return erro("Informe k, [A] e t.");
      const y0 = y(A) - F.s * k * t;
      A0 = F.inv(y0);
      if (!(A0 > 0) || !fin(A0)) return erro("Esses valores levam a uma [A]₀ impossível. Confira os dados.");
      passos.push(R("Isole [A]₀", `${eq(F.lei)}${eq(F.n === 0 ? `[A]<sub>0</sub> = [A] + k·t = ${N(A)} + ${N(k)} × ${N(t)} = <b>${N(A0, 5)} mol/L</b>` : F.n === 1 ? `ln[A]<sub>0</sub> = ln[A] + k·t = ${N(y0, 5)}  ⇒  [A]<sub>0</sub> = <b>${N(A0, 5)} mol/L</b>` : `1/[A]<sub>0</sub> = 1/[A] − k·t = ${N(y0, 5)}  ⇒  [A]<sub>0</sub> = <b>${N(A0, 5)} mol/L</b>`)}`));
    }
    return fimLei(passos, F, k, A0, A, t, ut, alvo);
  }
  function fimLei(passos, F, k, A0, A, t, ut, alvo) {
    const t12 = F.t12(A0, k);
    passos.push(R("Meia-vida", `<p>É o tempo para a concentração cair à metade:</p>${eq(`t<sub>½</sub> = ${T12TXT[F.n][0]} = <b>${N(t12, 4)} ${ut}</b>`)}<p>Na ordem ${F.n}, a meia-vida ${T12TXT[F.n][1]}.</p>`));
    const frac1 = A0 > 0 ? A / A0 : 0;
    if (t != null && A0 > 0) passos.push(R("Quanto sobra e quanto já reagiu", `<p>Restam <b>${N(frac1 * 100, 4)}%</b> do reagente (${N(t / t12, 3)} meias-vidas passaram${F.n === 1 ? "; em 1ª ordem sobra (½)<sup>n</sup>" : ""}); reagiram <b>${N((1 - frac1) * 100, 4)}%</b>.</p>`));
    const val = alvo === "A" ? A : alvo === "t" ? t : alvo === "k" ? k : A0;
    const un2 = alvo === "t" ? ut : alvo === "k" ? unidadeK(F.n, ut) : "mol/L";
    const nm = alvo === "A" ? "[A]" : alvo === "t" ? "t" : alvo === "k" ? "k" : "[A]<sub>0</sub>";
    return { ok: true, passos, valor: val, k, A0, A, t, t12, ordem: F.n, resposta: `${nm.replace(/<[^>]+>/g, "")} = ${N(val, 5)} ${un2.replace(/<[^>]+>/g, "")}; t1/2 = ${N(t12, 4)} ${ut}`, respostaHTML: `${nm} = <b>${N(val, 5)}</b> ${un(un2)}<br><small>t<sub>½</sub> = ${N(t12, 4)} ${ut} · ordem ${F.n}</small>` };
  }

  function regressao(xs, ys) {
    const n = xs.length;
    const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
    let sxx = 0, sxy = 0, syy = 0;
    for (let i = 0; i < n; i++) { sxx += (xs[i] - mx) ** 2; sxy += (xs[i] - mx) * (ys[i] - my); syy += (ys[i] - my) ** 2; }
    const a = sxx === 0 ? 0 : sxy / sxx, b = my - a * mx;
    let sse = 0;
    for (let i = 0; i < n; i++) sse += (ys[i] - (a * xs[i] + b)) ** 2;
    const r2 = syy === 0 ? 1 : Math.max(0, 1 - sse / syy);
    return { a, b, r2 };
  }
  function lerPares(txt) {
    const pts = [];
    const linhas = String(txt || "").split(/\n/).map((l) => l.trim()).filter(Boolean);
    for (let i = 0; i < linhas.length; i++) {
      const l = linhas[i];
      let partes;
      if (/[;\t]/.test(l)) partes = l.split(/[;\t]+/);
      else if (/,\s+/.test(l)) partes = l.split(/,\s+/);
      else partes = l.split(/\s+/);
      partes = partes.map((x) => x.trim()).filter(Boolean);
      if (partes.length !== 2) return erro(`Linha ${i + 1} ("${l}"): escreva o tempo e a concentração separados por espaço, ponto-e-vírgula ou tab (ex.: 10  0,45).`);
      const t = Q.lerNumero(partes[0]), A = Q.lerNumero(partes[1]);
      if (isNaN(t) || isNaN(A)) return erro(`Linha ${i + 1} ("${l}"): não entendi os números.`);
      pts.push({ t, A });
    }
    return { ok: true, pts };
  }
  function ordemPorDados(pts, ut = "s") {
    if (!Array.isArray(pts)) return erro("Informe os dados.");
    if (pts.length < 3) return erro("Informe pelo menos 3 pontos (tempo e concentração); com 4 a 6 o resultado fica bem mais confiável.");
    for (const q of pts) if (!fin(q.t) || !fin(q.A)) return erro("Há valores inválidos na tabela.");
    if (pts.some((q) => !(q.A > 0))) return erro("As concentrações precisam ser maiores que zero (ln e 1/[A] não existem para 0 ou negativos).");
    if (new Set(pts.map((q) => q.t)).size < pts.length) return erro("Há tempos repetidos. Cada ponto deve ter um tempo diferente.");
    const ordenados = pts.slice().sort((a, b) => a.t - b.t);
    if (ordenados[0].A < ordenados[ordenados.length - 1].A) return erro("A concentração do reagente deveria diminuir com o tempo. Confira se trocou tempo e concentração.");
    const xs = ordenados.map((q) => q.t);
    const passos = [];
    passos.push(R("Estratégia: linearizar", `<p>Cada ordem tem uma grandeza que vira <b>reta</b> contra o tempo:</p>${tabela(["Ordem", "Gráfico em linha reta", "Inclinação"], [["0", "[A] × t", "−k"], ["1", "ln[A] × t", "−k"], ["2", "1/[A] × t", "+k"]])}<p>Calcule as três versões, faça uma regressão linear (mínimos quadrados) em cada uma e veja qual tem <b>R² mais próximo de 1</b>.</p>`));
    passos.push(R("Tabela de dados", tabela(["t (" + ut + ")", "[A] (mol/L)", "ln[A]", "1/[A]"], ordenados.map((q) => [N(q.t), N(q.A, 4), N(Math.log(q.A), 5), N(1 / q.A, 5)]))));
    const res = FORMAS.map((F) => {
      const ys = ordenados.map((q) => F.f(q.A));
      const r = regressao(xs, ys);
      return { F, ...r, k: F.s * r.a };
    });
    passos.push(R("Regressão linear de cada tentativa", tabela(["Ordem", "Inclinação", "Intercepto", "R²"], res.map((r) => [r.F.n, N(r.a, 5), N(r.b, 5), `<b>${N(r.r2, 6)}</b>`])) + dica("R² = 1 significa que todos os pontos estão exatamente numa reta.")));
    const ord = res.slice().sort((a, b) => b.r2 - a.r2);
    const melhor = ord[0];
    const dif = melhor.r2 - ord[1].r2;
    const k = melhor.k;
    const _A0 = Math.exp(melhor.F.n === 1 ? melhor.b : 0);
    let aviso1 = "";
    if (dif < 0.002) aviso1 = aviso(`os R² das duas melhores tentativas (ordens ${melhor.F.n} e ${ord[1].F.n}) são muito próximos. Os dados cobrem pouca variação de concentração (menos de uma meia-vida?) e não dão para distinguir a ordem com segurança. Colete mais pontos até a concentração cair bastante.`);
    if (k <= 0) aviso1 += aviso("a inclinação deu k ≤ 0: os dados não parecem de um reagente sendo consumido.");
    passos.push(R("Escolha a ordem", `<p>A tentativa mais linear é a de <b>ordem ${melhor.F.n}</b> (R² = ${N(melhor.r2, 6)}).</p>${aviso1}`));
    passos.push(R("Constante de velocidade k", `<p>${melhor.F.n === 2 ? "A inclinação é +k" : "A inclinação é −k"}:</p>${eq(`k = ${melhor.F.n === 2 ? "" : "−"}(${N(melhor.a, 5)}) = <b>${N(k, 5)}</b> ${un(unidadeK(melhor.F.n, ut))}`)}`));
    const A0r = ordenados[0].A;
    const t12 = melhor.F.t12(A0r, k);
    passos.push(R("Meia-vida", `<p>Usando a concentração do primeiro ponto como [A]<sub>0</sub> = ${N(A0r, 4)} mol/L:</p>${eq(`t<sub>½</sub> = ${T12TXT[melhor.F.n][0]} = <b>${N(t12, 4)} ${ut}</b>`)}`));
    return { ok: true, passos, valor: melhor.F.n, ordem: melhor.F.n, k, t12, r2: Object.fromEntries(res.map((r) => [r.F.n, r.r2])), ambiguo: dif < 0.002, resposta: `Ordem ${melhor.F.n}; k = ${N(k, 4)} ${unidadeK(melhor.F.n, ut).replace(/<[^>]+>/g, "")}`, respostaHTML: `Ordem <b>${melhor.F.n}</b><br><small>k = ${N(k, 4)} ${unidadeK(melhor.F.n, ut)} · R² = ${N(melhor.r2, 5)}</small>` };
  }

  // Velocidades iniciais
  function resolverLinear(M, b) {
    const n = M.length;
    const A = M.map((r, i) => [...r, b[i]]);
    for (let c = 0; c < n; c++) {
      let m = c;
      for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[m][c])) m = r;
      if (Math.abs(A[m][c]) < 1e-12) return null;
      [A[c], A[m]] = [A[m], A[c]];
      for (let r = 0; r < n; r++) if (r !== c) { const f = A[r][c] / A[c][c]; for (let k = c; k <= n; k++) A[r][k] -= f * A[c][k]; }
    }
    return A.map((r, i) => r[n] / r[i]);
  }
  function velInicial(p) {
    const nomes = p.nomes || ["A"];
    const nR = nomes.length;
    const ex = p.exps || [];
    if (ex.length < 2) return erro("Informe pelo menos 2 experimentos.");
    for (let i = 0; i < ex.length; i++) {
      const e = ex[i];
      if (!e || e.c.length !== nR || e.c.some((v) => !(v > 0) || !fin(v)) || !(e.v > 0) || !fin(e.v)) return erro(`Experimento ${i + 1}: preencha as concentrações e a velocidade (números maiores que zero).`);
    }
    const ut = p.ut || "s";
    const passos = [];
    passos.push(R("Método das velocidades iniciais", `<p>A lei de velocidade tem a forma:</p>${eq(`v = k · ${nomes.map((n2, j) => `[${n2}]<sup>m<sub>${j + 1}</sub></sup>`).join(" · ")}`)}<p>Os expoentes <b>não</b> vêm da equação balanceada: só se descobrem experimentalmente. Compare dois experimentos em que <b>só uma</b> concentração muda; nesse caso:</p>${eq(`${frac("v<sub>2</sub>", "v<sub>1</sub>")} = ${frac("[X]<sub>2</sub>", "[X]<sub>1</sub>")}<sup>m</sup> &nbsp;&nbsp;⇒&nbsp;&nbsp; m = ${frac("ln(v<sub>2</sub>/v<sub>1</sub>)", "ln([X]<sub>2</sub>/[X]<sub>1</sub>)")}`)}${dica("Atalho: dobrar [X] e a velocidade não mudar ⇒ m = 0; dobrar e v dobrar ⇒ m = 1; dobrar e v quadruplicar ⇒ m = 2.")}`));
    passos.push(R("Dados", tabela(["Exp.", ...nomes.map((n2) => `[${n2}] (mol/L)`), `v (mol/L·${ut})`], ex.map((e, i) => [i + 1, ...e.c.map((v) => N(v, 4)), N(e.v, 4)]))));
    const rel = (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(Math.abs(a), Math.abs(b));
    const m = new Array(nR).fill(null), linhasPar = [];
    let usouRegr = false;
    for (let j = 0; j < nR; j++) {
      const ms = [];
      for (let a = 0; a < ex.length; a++) for (let b = a + 1; b < ex.length; b++) {
        const outros = ex[a].c.every((v, q) => q === j || rel(v, ex[b].c[q]));
        if (!outros || rel(ex[a].c[j], ex[b].c[j])) continue;
        const [lo, hi] = ex[a].c[j] < ex[b].c[j] ? [a, b] : [b, a];
        const mj = Math.log(ex[hi].v / ex[lo].v) / Math.log(ex[hi].c[j] / ex[lo].c[j]);
        ms.push(mj);
        linhasPar.push([nomes[j], `${lo + 1} e ${hi + 1}`, `${N(ex[hi].c[j] / ex[lo].c[j], 4)}×`, `${N(ex[hi].v / ex[lo].v, 4)}×`, `<b>${N(mj, 4)}</b>`]);
      }
      if (ms.length) m[j] = ms.reduce((a, b) => a + b, 0) / ms.length;
    }
    if (linhasPar.length) passos.push(R("Compare experimentos em que só um reagente muda", tabela(["Reagente", "Exps.", "Razão [X]", "Razão v", "m"], linhasPar)));
    if (m.some((v) => v == null)) {
      // regressão em logaritmos
      if (ex.length < nR + 1) return erro("Não há pares de experimentos que variem um reagente de cada vez, e os dados não bastam para ajustar. Acrescente experimentos.");
      const X = ex.map((e) => [1, ...e.c.map(Math.log)]);
      const y = ex.map((e) => Math.log(e.v));
      const n = nR + 1;
      const M = Array.from({ length: n }, (_, a) => Array.from({ length: n }, (_, b) => X.reduce((s, r) => s + r[a] * r[b], 0)));
      const bb = Array.from({ length: n }, (_, a) => X.reduce((s, r, i) => s + r[a] * y[i], 0));
      const sol = resolverLinear(M, bb);
      if (!sol) return erro("Os experimentos não permitem separar o efeito de cada reagente (concentrações variam juntas). Planeje experimentos em que um reagente muda por vez.");
      for (let j = 0; j < nR; j++) if (m[j] == null) m[j] = sol[j + 1];
      usouRegr = true;
      passos.push(R("Ajuste por logaritmos", aviso("não havia pares em que só um reagente muda. Usei o ajuste de ln v = ln k + Σ m·ln[X] (mínimos quadrados) para estimar os expoentes. O resultado é aproximado.")));
    }
    const mArr = m.map((v) => Math.round(v * 2) / 2);
    const fora = m.some((v, j) => Math.abs(v - mArr[j]) > 0.15);
    passos.push(R("Expoentes (ordem em cada reagente)", tabela(["Reagente", "m calculado", "Ordem adotada"], nomes.map((n2, j) => [n2, N(m[j], 4), `<b>${N(mArr[j])}</b>`])) + (fora ? aviso("algum expoente não está perto de um valor inteiro ou meio-inteiro. Confira os dados; os valores usados abaixo estão arredondados.") : dica("Os expoentes são arredondados para o inteiro mais próximo (ordens meio-inteiras são raras)."))));
    const total = mArr.reduce((a, b) => a + b, 0);
    const lei = `v = k${nomes.map((n2, j) => (mArr[j] === 0 ? "" : `[${n2}]${mArr[j] === 1 ? "" : "<sup>" + N(mArr[j]) + "</sup>"}`)).join("")}`;
    passos.push(R("Lei de velocidade e ordem global", eq(lei) + `<p>Ordem global = ${mArr.map((v) => N(v)).join(" + ")} = <b>${N(total)}</b>.</p>`));
    const ks = ex.map((e) => e.v / e.c.reduce((a, c, j) => a * Math.pow(c, mArr[j]), 1));
    const kmed = ks.reduce((a, b) => a + b, 0) / ks.length;
    const spread = (Math.max(...ks) - Math.min(...ks)) / kmed;
    passos.push(R("Calcule k", `<p>Isole k em cada experimento: k = v ÷ (${nomes.map((n2, j) => (mArr[j] === 0 ? "" : `[${n2}]${mArr[j] === 1 ? "" : "<sup>" + N(mArr[j]) + "</sup>"}`)).join("") || "1"}):</p>${tabela(["Exp.", "k"], ks.map((k, i) => [i + 1, N(k, 4)]))}${eq(`k (média) = <b>${N(kmed, 4)}</b> ${un(unidadeK(total, ut))}`)}${spread > 0.05 ? aviso("os valores de k diferem mais de 5% entre experimentos: confira os dados ou os expoentes.") : "<p>Os valores de k coincidem entre os experimentos ✓ (boa checagem).</p>"}${dica("Unidade de k = (mol/L)<sup>1−n</sup> · tempo<sup>−1</sup>, onde n é a ordem global.")}`));
    return { ok: true, passos, valor: kmed, k: kmed, ordens: mArr, ordemGlobal: total, resposta: `${lei.replace(/<[^>]+>/g, (t) => (t === "<sup>" ? "^" : ""))}; k = ${N(kmed, 4)} ${unidadeK(total, ut).replace(/<[^>]+>/g, "")}`, respostaHTML: `${lei}<br><small>k = ${N(kmed, 4)} ${unidadeK(total, ut)} · ordem global ${N(total)}</small>`, regressao: usouRegr };
  }

  // Arrhenius
  function arrhenius(p) {
    const modo = p.modo;
    const uT = p.uT || "K";
    const passos = [];
    const kJ = p.uEa === "J/mol" ? 1 : 1000;
    const T = (v) => paraK(v, uT);
    passos.push(R("A equação de Arrhenius", `<p>A constante de velocidade cresce rapidamente com a temperatura:</p>${eq("k = A · e<sup>−E<sub>a</sub>/(R·T)</sup>")}<p>Tomando o logaritmo de duas temperaturas (A se cancela):</p>${eq(`ln ${frac("k<sub>2</sub>", "k<sub>1</sub>")} = ${frac("E<sub>a</sub>", "R")} · (${frac("1", "T<sub>1</sub>")} − ${frac("1", "T<sub>2</sub>")})`)}${dica("R = 8,314 J/(mol·K). T <b>sempre em kelvin</b>. E<sub>a</sub> em J/mol (cuidado: costuma vir em kJ/mol, multiplique por 1000).")}`));
    const conv = (v, nome) => (uT === "°C" ? `${nome} = ${N(v)} °C + 273,15 = <b>${N(v + 273.15, 5)} K</b>` : null);
    const addConv = (lst) => { const l = lst.filter(Boolean); if (l.length) passos.push(R("Temperaturas em kelvin", l.map(eq).join(""))); };
    if (modo === "Ea") {
      const { k1, k2 } = p;
      if (!(k1 > 0) || !(k2 > 0)) return erro("Informe k₁ e k₂ (maiores que zero).");
      if (!fin(p.T1) || !fin(p.T2)) return erro("Informe as duas temperaturas.");
      const T1 = T(p.T1), T2 = T(p.T2);
      if (!(T1 > 0) || !(T2 > 0)) return erro("As temperaturas devem ser maiores que 0 K.");
      if (T1 === T2) return erro("As duas temperaturas são iguais: não dá para achar Ea.");
      addConv([uT === "°C" ? conv(p.T1, "T<sub>1</sub>") : null, uT === "°C" ? conv(p.T2, "T<sub>2</sub>") : null]);
      const Ea = RGAS * Math.log(k2 / k1) / (1 / T1 - 1 / T2);
      passos.push(R("Isole Ea", `${eq(`E<sub>a</sub> = ${frac("R · ln(k<sub>2</sub>/k<sub>1</sub>)", "1/T<sub>1</sub> − 1/T<sub>2</sub>")}`)}${eq(`E<sub>a</sub> = ${frac("8,314 × ln(" + KF(k2) + "/" + KF(k1) + ")", "1/" + N(T1, 5) + " − 1/" + N(T2, 5))} = ${frac("8,314 × " + N(Math.log(k2 / k1), 5), N(1 / T1 - 1 / T2, 5))} = <b>${N(Ea, 5)} J/mol</b> = <b>${N(Ea / 1000, 4)} kJ/mol</b>`)}${Ea < 0 ? aviso("Ea negativa: k diminuiu com o aumento de T? Confira qual k corresponde a qual T.") : ""}`));
      return { ok: true, passos, valor: Ea / 1000, Ea, resposta: `Ea = ${N(Ea / 1000, 4)} kJ/mol`, respostaHTML: `E<sub>a</sub> = <b>${N(Ea / 1000, 4)}</b> ${un("kJ/mol")}<br><small>${N(Ea, 5)} J/mol</small>` };
    }
    if (modo === "k2" || modo === "razao") {
      if (!fin(p.Ea) || !(p.Ea >= 0)) return erro("Informe a energia de ativação Ea (kJ/mol, maior ou igual a 0).");
      if (!fin(p.T1) || !fin(p.T2)) return erro("Informe as duas temperaturas.");
      const T1 = T(p.T1), T2 = T(p.T2);
      if (!(T1 > 0) || !(T2 > 0)) return erro("As temperaturas devem ser maiores que 0 K.");
      addConv([uT === "°C" ? conv(p.T1, "T<sub>1</sub>") : null, uT === "°C" ? conv(p.T2, "T<sub>2</sub>") : null]);
      const EaJ = p.Ea * kJ;
      if (kJ === 1000) passos.push(R("Ea em joules", eq(`E<sub>a</sub> = ${N(p.Ea)} kJ/mol × 1000 = <b>${N(EaJ, 6)} J/mol</b>`)));
      const lnr = EaJ / RGAS * (1 / T1 - 1 / T2);
      const r = Math.exp(lnr);
      passos.push(R("Razão k₂/k₁", `${eq(`ln ${frac("k<sub>2</sub>", "k<sub>1</sub>")} = ${frac(N(EaJ, 6), "8,314")} × (${frac("1", N(T1, 5))} − ${frac("1", N(T2, 5))}) = <b>${N(lnr, 5)}</b>`)}${eq(`${frac("k<sub>2</sub>", "k<sub>1</sub>")} = e<sup>${N(lnr, 5)}</sup> = <b>${N(r, 5)}</b>`)}<p>A reação fica <b>${N(r, 4)} vezes ${r >= 1 ? "mais rápida" : "mais lenta"}</b> em T<sub>2</sub> do que em T<sub>1</sub>.</p>`));
      if (modo === "razao") return { ok: true, passos, valor: r, resposta: `k2/k1 = ${N(r, 5)}`, respostaHTML: `k<sub>2</sub>/k<sub>1</sub> = <b>${N(r, 5)}</b>` };
      if (!(p.k1 > 0)) return erro("Informe k₁ (maior que zero).");
      const k2 = p.k1 * r;
      passos.push(R("Calcule k₂", eq(`k<sub>2</sub> = k<sub>1</sub> × ${N(r, 5)} = ${KF(p.k1)} × ${N(r, 5)} = <b>${KF(k2)}</b>`) + dica("A unidade de k₂ é a mesma de k₁.")));
      return { ok: true, passos, valor: k2, resposta: `k2 = ${KF(k2).replace(/<[^>]+>/g, "")}`, respostaHTML: `k<sub>2</sub> = <b>${KF(k2)}</b>` };
    }
    if (modo === "k") {
      if (!(p.A > 0)) return erro("Informe o fator pré-exponencial A (maior que zero).");
      if (!fin(p.Ea) || !(p.Ea >= 0)) return erro("Informe a energia de ativação Ea.");
      if (!fin(p.T1)) return erro("Informe a temperatura.");
      const T1 = T(p.T1);
      if (!(T1 > 0)) return erro("A temperatura deve ser maior que 0 K.");
      addConv([uT === "°C" ? conv(p.T1, "T") : null]);
      const EaJ = p.Ea * kJ;
      const expo = -EaJ / (RGAS * T1);
      const k = p.A * Math.exp(expo);
      passos.push(R("Calcule k", `${eq(`E<sub>a</sub>/(R·T) = ${frac(N(EaJ, 6) + " J/mol", "8,314 × " + N(T1, 5))} = ${N(-expo, 5)}`)}${eq(`k = ${KF(p.A)} × e<sup>−${N(-expo, 5)}</sup> = ${KF(p.A)} × ${KF(Math.exp(expo))} = <b>${KF(k)}</b>`)}${dica("A tem a mesma unidade de k.")}`));
      return { ok: true, passos, valor: k, resposta: `k = ${KF(k).replace(/<[^>]+>/g, "")}`, respostaHTML: `k = <b>${KF(k)}</b>` };
    }
    return erro("Escolha o que calcular.");
  }

  // ---------------------------------------------------------------------------
  // Exercícios
  // ---------------------------------------------------------------------------
  const sorteia = (a) => a[Math.floor(Math.random() * a.length)];
  const inteiro = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const dec = (a, b, casas = 2) => +(a + Math.random() * (b - a)).toFixed(casas);
  const arred = (v, sig = 3) => +v.toPrecision(sig);
  const fqEq = (e) => e.split("->").map((l) => l.split(" + ").map((x) => { const m = x.trim().match(/^(\d+\s*)?(.*?)(\((?:s|l|g|aq)\))?$/); return `${m[1] || ""}${fq(m[2])}${m[3] || ""}`; }).join(" + ")).join(" → ");
  const mkEx = (enunciado, r, extra) => ({ enunciado, resposta: r.valor, unidade: "", passos: r.passos, texto: r.resposta.replace(/<[^>]+>/g, ""), ...extra });

  const REACOES_H = [
    "CH4(g) + O2(g) -> CO2(g) + H2O(l)", "C3H8(g) + O2(g) -> CO2(g) + H2O(l)", "C2H5OH(l) + O2(g) -> CO2(g) + H2O(l)",
    "C6H12O6(s) + O2(g) -> CO2(g) + H2O(l)", "Fe2O3(s) + CO(g) -> Fe(s) + CO2(g)", "NH3(g) + O2(g) -> NO(g) + H2O(g)",
    "CaCO3(s) -> CaO(s) + CO2(g)", "N2(g) + H2(g) -> NH3(g)", "SO2(g) + O2(g) -> SO3(g)", "C2H2(g) + O2(g) -> CO2(g) + H2O(l)",
    "CO(g) + O2(g) -> CO2(g)", "H2(g) + Cl2(g) -> HCl(g)", "NO(g) + O2(g) -> NO2(g)", "C4H10(g) + O2(g) -> CO2(g) + H2O(l)",
    "Fe2O3(s) + Al(s) -> Al2O3(s) + Fe(s)", "C2H4(g) + H2O(l) -> C2H5OH(l)", "CH3OH(l) + O2(g) -> CO2(g) + H2O(l)", "C8H18(l) + O2(g) -> CO2(g) + H2O(l)",
    "H2O2(l) -> H2O(l) + O2(g)", "KClO3(s) -> KCl(s) + O2(g)",
  ];
  const COMBUSTOES = REACOES_H.filter((e) => /^(CH4|C3H8|C2H5OH|C6H12O6|C2H2|C4H10|CH3OH|C8H18)/.test(e));

  const HESS_MOD = [
    { alvo: "C(grafite) + 2 H2(g) → CH4(g)", etapas: [["C(grafite) + O2(g) → CO2(g)", 1, -393.5], ["H2(g) + ½ O2(g) → H2O(l)", 2, -285.8], ["CH4(g) + 2 O2(g) → CO2(g) + 2 H2O(l)", -1, -890.3]] },
    { alvo: "2 C(grafite) + O2(g) → 2 CO(g)", etapas: [["C(grafite) + O2(g) → CO2(g)", 2, -393.5], ["2 CO(g) + O2(g) → 2 CO2(g)", -1, -566.0]] },
    { alvo: "S(s) + 3/2 O2(g) → SO3(g)", etapas: [["S(s) + O2(g) → SO2(g)", 1, -296.8], ["2 SO2(g) + O2(g) → 2 SO3(g)", 0.5, -197.8]] },
    { alvo: "C2H4(g) + H2(g) → C2H6(g)", etapas: [["C2H4(g) + 3 O2(g) → 2 CO2(g) + 2 H2O(l)", 1, -1411], ["C2H6(g) + 7/2 O2(g) → 2 CO2(g) + 3 H2O(l)", -1, -1560], ["H2(g) + ½ O2(g) → H2O(l)", 1, -285.8]] },
    { alvo: "2 C(grafite) + H2(g) → C2H2(g)", etapas: [["C(grafite) + O2(g) → CO2(g)", 2, -393.5], ["H2(g) + ½ O2(g) → H2O(l)", 1, -285.8], ["C2H2(g) + 5/2 O2(g) → 2 CO2(g) + H2O(l)", -1, -1299.6]] },
    { alvo: "N2(g) + 2 O2(g) → 2 NO2(g)", etapas: [["N2(g) + O2(g) → 2 NO(g)", 1, 180.5], ["2 NO(g) + O2(g) → 2 NO2(g)", 1, -114.1]] },
    { alvo: "2 H2(g) + O2(g) → 2 H2O(l)", etapas: [["H2(g) + ½ O2(g) → H2O(g)", 2, -241.8], ["H2O(l) → H2O(g)", -2, 44.0]] },
  ];

  const REAC_K = [
    { eq: "N2(g) + 3 H2(g) <=> 2 NH3(g)", Ke: 0.5, c: [0.4, 1.2, 0.6] }, { eq: "2 SO2(g) + O2(g) <=> 2 SO3(g)", c: [0.3, 0.5, 0.7] },
    { eq: "H2(g) + I2(g) <=> 2 HI(g)", c: [0.2, 0.3, 1.1] }, { eq: "N2O4(g) <=> 2 NO2(g)", c: [0.6, 0.3] },
    { eq: "PCl5(g) <=> PCl3(g) + Cl2(g)", c: [0.5, 0.25, 0.25] }, { eq: "CO(g) + H2O(g) <=> CO2(g) + H2(g)", c: [0.3, 0.4, 0.6, 0.5] },
    { eq: "CaCO3(s) <=> CaO(s) + CO2(g)", c: [null, null, 0.4] }, { eq: "2 NO2(g) <=> N2O4(g)", c: [0.2, 0.5] },
    { eq: "C(s) + CO2(g) <=> 2 CO(g)", c: [null, 0.4, 0.8] }, { eq: "2 NH3(g) <=> N2(g) + 3 H2(g)", c: [0.5, 0.2, 0.4] },
  ];
  const ICE_MOD = [
    { eq: "N2O4(g) <=> 2 NO2(g)", Kr: [0.005, 0.3], c0: () => [dec(0.2, 1, 2), 0], alvo: 1, nome: "NO2" },
    { eq: "H2(g) + I2(g) <=> 2 HI(g)", K: () => sorteia([49, 50, 54]), c0: () => { const v = dec(0.1, 1, 2); return [v, v, 0]; }, alvo: 2, nome: "HI" },
    { eq: "PCl5(g) <=> PCl3(g) + Cl2(g)", Kr: [0.02, 0.5], c0: () => [dec(0.5, 2, 2), 0, 0], alvo: 2, nome: "Cl2" },
    { eq: "N2O4(g) <=> 2 NO2(g)", Kr: [0.005, 0.3], c0: () => [0, dec(0.2, 0.8, 2)], alvo: 0, nome: "N2O4" },
    { eq: "CH3COOH(aq) <=> H^+(aq) + CH3COO^-(aq)", K: () => 1.8e-5, c0: () => [sorteia([0.1, 0.2, 0.05, 0.5]), 0, 0], alvo: 1, nome: "H+", ac: true },
    { eq: "CO(g) + H2O(g) <=> CO2(g) + H2(g)", K: () => sorteia([4.0, 5.1, 9.0]), c0: () => [dec(0.2, 1, 2), dec(0.2, 1, 2), 0, 0], alvo: 2, nome: "CO2" },
  ];
  const ACIDOS = [["acético / acetato", 4.74, "acido"], ["fórmico / formiato", 3.75, "acido"], ["benzoico / benzoato", 4.20, "acido"], ["amônio / amônia (NH₄⁺/NH₃)", 9.25, "acido"], ["fosfato (H₂PO₄⁻/HPO₄²⁻)", 7.21, "acido"], ["carbônico (H₂CO₃/HCO₃⁻)", 6.35, "acido"]];
  const KSPS = [["AgCl", 1, 1, 1.8e-10], ["AgBr", 1, 1, 5.0e-13], ["BaSO4", 1, 1, 1.1e-10], ["CaF2", 1, 2, 3.9e-11], ["PbI2", 1, 2, 9.8e-9], ["Mg(OH)2", 1, 2, 5.6e-12], ["Ag2CrO4", 2, 1, 1.1e-12], ["Ca3(PO4)2", 3, 2, 2.1e-33], ["Al(OH)3", 1, 3, 3.0e-34], ["CaCO3", 1, 1, 3.4e-9]];
  const LIG_EX = [
    ["CH4 + 2 O2 → CO2 + 2 H2O", "4 C-H, 2 O=O", "2 C=O, 4 O-H"], ["H2 + Cl2 → 2 HCl", "H-H, Cl-Cl", "2 H-Cl"], ["N2 + 3 H2 → 2 NH3", "N≡N, 3 H-H", "6 N-H"],
    ["C2H4 + H2 → C2H6", "C=C, 4 C-H, H-H", "C-C, 6 C-H"], ["H2 + F2 → 2 HF", "H-H, F-F", "2 H-F"], ["2 H2 + O2 → 2 H2O", "2 H-H, O=O", "4 O-H"], ["C2H4 + Cl2 → C2H4Cl2", "C=C, Cl-Cl", "C-C, 2 C-Cl"],
  ];

  const TIPOS = ["hess", "dH-formacao", "dG", "kc", "ice-x", "ph-tampao", "meia-vida", "ordem-cinetica", "ksp", "arrhenius", "calorimetria", "ligacao", "termo", "equilibrio", "cinetica"];

  function gerarExercicio(tipo) {
    if (tipo === "termo") return gerarExercicio(sorteia(["dH-formacao", "hess", "dG", "dH-formacao", "calorimetria", "ligacao"]));
    if (tipo === "equilibrio") return gerarExercicio(sorteia(["kc", "ice-x", "ph-tampao", "ksp", "kc", "ice-x"]));
    if (tipo === "cinetica") return gerarExercicio(sorteia(["meia-vida", "ordem-cinetica", "arrhenius", "meia-vida"]));
    if (tipo === "dH-formacao") {
      const usarCalor = Math.random() < 0.35;
      const e = usarCalor ? sorteia(COMBUSTOES) : sorteia(REACOES_H);
      const r0 = dHReacao(e);
      if (!r0.ok) return gerarExercicio("hess");
      const tabHf = r0.especies.map((x) => `ΔH<sub>f</sub>°(${fqF(x.f, x.fase)}) = ${N(x.h, 6)}`).join("; ");
      const eqt = fqEq(e);
      if (usarCalor) {
        const m = sorteia([5, 10, 20, 25, 50, 100]);
        const r = dHReacao(e, { ref: { i: 0, q: m, un: "g" } });
        return mkEx(`Dados (kJ/mol, 25 °C): ${tabHf}.<br>Quanto calor é <b>liberado</b> na combustão completa de <b>${m} g</b> de ${fq(r0.especies[0].f)}? (equação:<div class="eq">${eqt}</div>Responda em kJ, valor positivo.)`, { valor: -r.extra.q, passos: r.passos, resposta: "" + (-r.extra.q) }, { unidade: "kJ", rel: 0.01, texto: `${N(-r.extra.q, 4)} kJ liberados` });
      }
      return mkEx(`Dados (kJ/mol, 25 °C): ${tabHf}.<br>Calcule o ΔH° da reação (balanceie primeiro; responda em kJ, com sinal):<div class="eq">${eqt}</div>`, r0, { unidade: "kJ", rel: 0.01, tol: 0.6, texto: `ΔH° = ${N(r0.valor, 5)} kJ` });
    }
    if (tipo === "hess") {
      const m = sorteia(HESS_MOD);
      const dados = m.etapas.map(([eq2, f, h]) => [eq2, f, nz(Math.round(h * (1 + (Math.random() - 0.5) * 0.12) * 10) / 10)]);
      const r = hess(dados.map(([eq2, f, h]) => ({ dH: h, fator: f })));
      const lista = dados.map(([eq2, f, h], i) => `(${i + 1}) ${fqEq(eq2.replace(/→/g, "->")).replace(/½/g, "½")} &nbsp; ΔH<sub>${i + 1}</sub> = ${N(h)} kJ`).join("<br>");
      return mkEx(`Use a Lei de Hess para obter o ΔH da reação:<div class="eq">${fqEq(m.alvo.replace(/→/g, "->"))}</div>a partir de:<div class="item">${lista}</div>Responda em kJ.`, r, { unidade: "kJ", rel: 0.005, tol: 0.2, texto: `ΔH = ${N(r.valor, 5)} kJ` });
    }
    if (tipo === "dG") {
      const dH = inteiro(-200, 200), dS = inteiro(-250, 250) || 50;
      const T = inteiro(250, 700);
      if (Math.random() < 0.3 && dH * dS > 0) {
        const r = dG({ dH, dS, T: null, uH: "kJ/mol", uS: "J/(mol·K)", uT: "K" });
        if (r.Teq != null) return mkEx(`Uma reação tem ΔH = <b>${dH} kJ</b> e ΔS = <b>${dS} J/K</b> (considere constantes). A que temperatura (em kelvin) ela está em equilíbrio (ΔG = 0)?`, { valor: r.Teq, passos: r.passos, resposta: `${N(r.Teq, 5)} K` }, { unidade: "K", rel: 0.01, texto: `T = ${N(r.Teq, 5)} K` });
      }
      const celsius = Math.random() < 0.3;
      const Tin = celsius ? T - 273 : T;
      const r = dG({ dH, dS, T: Tin, uH: "kJ/mol", uS: "J/(mol·K)", uT: celsius ? "°C" : "K" });
      return mkEx(`Para uma reação, ΔH = <b>${dH} kJ/mol</b> e ΔS = <b>${dS} J/(mol·K)</b>. Calcule ΔG a <b>${Tin} ${celsius ? "°C" : "K"}</b> (em kJ/mol).`, r, { unidade: "kJ/mol", rel: 0.01, tol: 0.3, texto: `ΔG = ${N(r.valor, 5)} kJ/mol (${r.classe})` });
    }
    if (tipo === "calorimetria") {
      const m = sorteia([50, 100, 150, 200, 250]);
      const n = sorteia([0.01, 0.02, 0.025, 0.05, 0.1]);
      const Ti = dec(20, 25, 1);
      const exo = Math.random() < 0.7;
      const dT = arred(dec(1, 12, 1), 3);
      const Tf = +(Ti + (exo ? dT : -dT)).toFixed(1);
      const r = calorimetria({ m, c: 4.18, Ti, Tf, n: { valor: n, un: "mol" } });
      return mkEx(`${n} mol de uma substância são dissolvidos em ${m} g de água num calorímetro (c = 4,18 J/(g·°C); desconsidere a capacidade do calorímetro). A temperatura vai de <b>${N(Ti)} °C</b> a <b>${N(Tf)} °C</b>. Calcule o ΔH da dissolução, em kJ/mol.`, r, { unidade: "kJ/mol", rel: 0.01, texto: `ΔH = ${N(r.valor, 5)} kJ/mol` });
    }
    if (tipo === "ligacao") {
      const [e, a, b] = sorteia(LIG_EX);
      const r = energiaLigacao(a, b);
      const tb = LIGACOES.map((l) => `${l.id} ${l.e}`).join("; ");
      return mkEx(`Estime o ΔH da reação <b>${e.replace(/(\w)(\d+)/g, "$1<sub>$2</sub>")}</b> (em fase gasosa) com as energias de ligação médias (kJ/mol): ${tb}.<br>Dica: ligações rompidas nos reagentes, formadas nos produtos. Responda em kJ.`, r, { unidade: "kJ", tol: 1, texto: `ΔH ≈ ${N(r.valor)} kJ` });
    }
    if (tipo === "kc") {
      for (;;) {
        const m = sorteia(REAC_K);
        const L = lerEqK(m.eq);
        const E = exprK(L, "c");
        const vals = {};
        const _ci = 0;
        L.esp.forEach((x, i) => { vals[i] = m.c[i] == null ? null : +(m.c[i] * (0.7 + Math.random() * 0.8)).toFixed(2); });
        const vv = E.inc.map((x) => vals[x.i]);
        if (vv.some((v) => v == null || !(v > 0))) continue;
        const incluidasDados = L.esp.filter((x) => vals[x.i] != null);
        const r = calcK({ eq: m.eq, tipo: "c", valores: vals });
        if (!r.ok) continue;
        const dados = incluidasDados.map((x) => `[${fq(x.f)}] = ${N(vals[x.i], 3)} mol/L`).join("; ");
        return mkEx(`No equilíbrio, a 25 °C: ${dados}. Calcule o K<sub>c</sub> da reação<div class="eq">${fqEq(m.eq.replace("<=>", "->")).replace("→", "⇌")}</div>`, r, { unidade: "", rel: 0.02, texto: `Kc = ${KF(r.valor).replace(/<sup>/g, "^").replace(/<[^>]+>/g, "")}` });
      }
    }
    if (tipo === "ice-x") {
      for (let tent = 0; tent < 50; tent++) {
        const m = sorteia(ICE_MOD);
        const K = m.K ? m.K() : arred(Math.exp(Math.log(m.Kr[0]) + Math.random() * (Math.log(m.Kr[1]) - Math.log(m.Kr[0]))), 2);
        const c0 = m.c0();
        const L = lerEqK(m.eq);
        if (!L.ok) continue;
        const inicial = {};
        L.esp.forEach((x, i) => { inicial[i] = c0[i]; });
        const r = ice({ eq: m.eq, tipo: "c", K, inicial, alvo: m.alvo });
        if (!r.ok || !(r.ref > 0)) continue;
        const dados = L.esp.map((x, i) => `[${fq(x.f.replace(/\^[+-]$/, (s) => s))}]<sub>0</sub> = ${N(c0[i], 3)}`).join("; ");
        const ref = L.esp[m.alvo];
        return mkEx(`Para o equilíbrio<div class="eq">${fqEq(m.eq.replace("<=>", "->")).replace("→", "⇌")}</div>K<sub>c</sub> = <b>${KF(K)}</b>. Concentrações iniciais (mol/L): ${dados}. Resolva a equação em x <b>sem aproximar</b> e dê a concentração de equilíbrio de <b>${fq(ref.f)}</b>.`, { valor: r.ref, passos: r.passos, resposta: `${N(r.ref, 5)} mol/L` }, { unidade: "mol/L", rel: 0.02, texto: `[${ref.f}] = ${N(r.ref, 5)} mol/L` });
      }
    }
    if (tipo === "ph-tampao") {
      const a = sorteia(ACIDOS);
      const ca = sorteia([0.05, 0.1, 0.2, 0.15, 0.3]), cb = sorteia([0.05, 0.1, 0.2, 0.25, 0.4]);
      const V = sorteia([100, 200, 250, 500, 1000]);
      const adicionar = Math.random() < 0.6;
      const add = adicionar ? { tipo: sorteia(["acido", "base"]), n: sorteia([0.001, 0.002, 0.005, 0.01]) } : null;
      const r = tampao({ tipo: "acido", const: "pKa", valor: a[1], ca, cb, V, add });
      const base = `Um tampão de ${a[0]} (pK<sub>a</sub> = ${a[1]}) tem componente ácido ${N(ca)} mol/L e componente básico ${N(cb)} mol/L${add ? `, com volume de ${V} mL` : ""}.`;
      if (!add) return mkEx(`${base} Qual o pH?`, r, { unidade: "", tol: 0.02, texto: `pH = ${N(r.valor, 4)}` });
      return mkEx(`${base} Adicionam-se ${N(add.n * 1000)} mmol de ${add.tipo === "acido" ? "HCl (ácido forte)" : "NaOH (base forte)"}, sem mudar o volume. Qual o pH final?`, r, { unidade: "", tol: 0.03, texto: `pH = ${N(r.valor, 4)}` });
    }
    if (tipo === "meia-vida") {
      const v = sorteia(["t12", "t12", "tempo", "sobra"]);
      const ordem = sorteia([0, 1, 1, 2]);
      const A0 = sorteia([0.5, 1, 2, 0.8, 0.4]);
      if (ordem === 1 && v !== "t12") {
        const t12 = sorteia([10, 20, 30, 60, 5.5]);
        const k = Math.LN2 / t12;
        if (v === "sobra") {
          const nn = sorteia([2, 3, 4, 2.5, 1.5]);
          const t = t12 * nn;
          const r = leiIntegrada({ ordem: 1, k, A0: 100, t, ut: "min" });
          return mkEx(`Uma reação de 1ª ordem tem meia-vida de <b>${t12} min</b>. Que <b>porcentagem</b> do reagente resta depois de <b>${N(t)} min</b>?`, { valor: r.A, passos: r.passos, resposta: N(r.A, 4) + "%" }, { unidade: "%", rel: 0.02, texto: `${N(r.A, 4)}%` });
        }
        const r = leiIntegrada({ ordem: 1, k, A0: 1, A: 0.125, ut: "min" });
        return mkEx(`Uma reação de 1ª ordem tem k = <b>${N(k, 4)} min<sup>−1</sup></b>. Quanto tempo (em minutos) leva para a concentração cair a <b>1/8</b> da inicial?`, r, { unidade: "min", rel: 0.02, texto: `t = ${N(r.valor, 4)} min` });
      }
      const k = ordem === 0 ? sorteia([0.01, 0.02, 0.005, 0.04]) : ordem === 1 ? sorteia([0.01, 0.02, 0.05, 0.1, 0.0231]) : sorteia([0.1, 0.2, 0.05, 0.5]);
      const r = leiIntegrada({ ordem, k, A0, t: 1, ut: "s" });
      return mkEx(`A decomposição de A é de <b>ordem ${ordem}</b>, com k = <b>${N(k)} ${unidadeK(ordem, "s")}</b> e [A]<sub>0</sub> = <b>${N(A0)} mol/L</b>. Calcule a meia-vida, em segundos.`, { valor: r.t12, passos: r.passos, resposta: N(r.t12, 4) + " s" }, { unidade: "s", rel: 0.02, texto: `t½ = ${N(r.t12, 4)} s` });
    }
    if (tipo === "ordem-cinetica") {
      for (let tent = 0; tent < 40; tent++) {
        const ordem = sorteia([0, 1, 2]);
        const A0 = sorteia([1, 0.8, 2, 0.5, 1.2]);
        const F = FORMAS[ordem];
        const _tf = ordem === 0 ? A0 * 0.75 : ordem === 1 ? 2 * Math.LN2 : 3 / A0;
        const k = ordem === 0 ? A0 / 100 : ordem === 1 ? Math.LN2 / 25 : 1 / (A0 * 25);
        const ts = [0, 20, 40, 60, 80, 100];
        const pts = ts.map((t) => { const y = F.f(A0) + F.s * k * t; const A = F.inv(y); return { t, A: arred(A, 3) }; });
        if (pts.some((q) => !(q.A > 0))) continue;
        const r = ordemPorDados(pts, "s");
        if (!r.ok || r.ordem !== ordem || r.ambiguo) continue;
        const linhas = pts.map((q) => `<tr><td>${q.t}</td><td>${N(q.A, 3)}</td></tr>`).join("");
        return mkEx(`Os dados abaixo foram medidos para a decomposição de A. Qual é a <b>ordem</b> da reação (0, 1 ou 2)?<div class="tab-rolar"><table class="tb"><thead><tr><th>t (s)</th><th>[A] (mol/L)</th></tr></thead><tbody>${linhas}</tbody></table></div>`, r, { unidade: "", tol: 0, texto: `ordem ${r.ordem}` });
      }
    }
    if (tipo === "ksp") {
      const s = sorteia(KSPS);
      const sal = s[0], x = s[1], y = s[2];
      const K = arred(s[3] * (0.6 + Math.random() * 0.9), 2);
      const r = ksp({ modo: "s", x, y, Ksp: K, nome: sal });
      return mkEx(`O sal ${fq(sal)} tem K<sub>ps</sub> = <b>${KF(K)}</b> a 25 °C. Qual a sua solubilidade molar, em mol/L, em água pura?`, r, { unidade: "mol/L", rel: 0.02, texto: `s = ${KF(r.valor).replace(/<[^>]+>/g, "")} mol/L` });
    }
    if (tipo === "arrhenius") {
      const T1 = sorteia([300, 310, 320, 350]), T2 = T1 + sorteia([10, 20, 30, 40]);
      const Ea = sorteia([40, 50, 60, 75, 85, 100]);
      const k1 = sorteia([1.2e-3, 3.5e-4, 2.0e-2, 5.0e-3]);
      const k2 = arred(k1 * Math.exp(Ea * 1000 / RGAS * (1 / T1 - 1 / T2)), 3);
      if (Math.random() < 0.5) {
        const r = arrhenius({ modo: "Ea", k1, T1, k2, T2, uT: "K" });
        return mkEx(`Uma reação tem k<sub>1</sub> = <b>${KF(k1)} s<sup>−1</sup></b> a <b>${T1} K</b> e k<sub>2</sub> = <b>${KF(k2)} s<sup>−1</sup></b> a <b>${T2} K</b>. Calcule a energia de ativação, em kJ/mol (R = 8,314 J/(mol·K)).`, r, { unidade: "kJ/mol", rel: 0.02, texto: `Ea = ${N(r.valor, 4)} kJ/mol` });
      }
      const r = arrhenius({ modo: "k2", k1, T1, T2, Ea, uT: "K", uEa: "kJ/mol" });
      return mkEx(`Uma reação tem E<sub>a</sub> = <b>${Ea} kJ/mol</b> e k = <b>${KF(k1)} s<sup>−1</sup></b> a <b>${T1} K</b>. Qual o valor de k a <b>${T2} K</b>? (R = 8,314 J/(mol·K); dê k em s<sup>−1</sup>)`, r, { unidade: "s⁻¹", rel: 0.03, texto: `k = ${KF(r.valor).replace(/<[^>]+>/g, "")} s^-1` });
    }
    return undefined;
  }

  const API = {
    TABELA, LIGACOES, TIPOS, RGAS, RATM,
    lerEq, lerEqK, dHReacao, hess, dG, calorimetria, lerLigacoes, energiaLigacao,
    calcK, quociente, ice, kcKp, ksp, acidoBase, tampao,
    leiIntegrada, ordemPorDados, lerPares, velInicial, arrhenius, regressao, unidadeK, exprK, especiesK,
    gerarExercicio,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else raiz.QTermo = API;
})(typeof window !== "undefined" ? window : globalThis);
