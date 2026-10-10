/*
 * Motor de Biologia do modo Estudo.
 * Genética mendeliana (quadro de Punnett), probabilidade e heredogramas
 * (autossômica, ligada ao X, ABO/Rh), Hardy-Weinberg, do DNA à proteína
 * (código genético padrão) e crescimento populacional / fluxo de energia.
 * Funções puras (testáveis em Node). Textos em português.
 */
(function (raiz) {
  "use strict";

  // ---------------------------------------------------------------------------
  // Utilidades: números, frações, HTML
  // ---------------------------------------------------------------------------
  const R = (t, h) => ({ t, h });
  const eqH = (h) => `<div class="eq">${h}</div>`;
  const frH = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
  const SUP = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻" };
  const SUPS = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁻": "-", "⁺": "+" };
  const sorteia = (l) => l[Math.floor(Math.random() * l.length)];
  const embaralhar = (l) => { const a = l.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  function agrupar(s) { // 12500 -> "12 500" (espaço fino)
    const [i, d] = s.split(",");
    const neg = i.startsWith("−");
    let c = neg ? i.slice(1) : i;
    if (c.length > 4) c = c.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return (neg ? "−" : "") + c + (d != null ? "," + d : "");
  }
  // número com vírgula decimal e `sig` algarismos significativos
  function fmt(x, sig = 4) {
    if (x == null || !isFinite(x)) return "—";
    if (x === 0) return "0";
    const a = Math.abs(x);
    if (a >= 1e9 || a < 1e-4) {
      const [m, e] = x.toExponential(sig - 1).split("e");
      const mm = String(+m).replace(".", ",").replace("-", "−");
      return `${mm} × 10${String(+e).split("").map((c) => SUP[c] || c).join("")}`;
    }
    let t = a >= 10 ** sig ? String(Math.round(x)) : String(+x.toPrecision(sig));
    if (/e/.test(t)) t = String(Math.round(x));
    return agrupar(t.replace(".", ",").replace("-", "−"));
  }
  const pct = (x, sig = 3) => `${fmt(x * 100, sig)}%`;

  function lerNumero(s) {
    if (typeof s === "number") return s;
    if (s == null) return NaN;
    let t = String(s).trim().toLowerCase();
    if (!t) return NaN;
    t = t.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]/g, (c) => SUPS[c]).replace(/−/g, "-");
    let fator = 1;
    if (t.endsWith("%")) { fator = 0.01; t = t.slice(0, -1); }
    t = t.replace(/\s+/g, "");
    const em = t.match(/^([\d.,]+)em([\d.,]+)$/); // "1 em 2500"
    if (em) { const a = lerNumero(em[1]), b = lerNumero(em[2]); return b ? (a / b) * fator : NaN; }
    t = t.replace(/(\d)\s*[x×*]\s*10\^?\(?([+-]?\d+)\)?/i, "$1e$2");
    t = t.replace(",", ".");
    if (/^[+-]?\d*\.?\d+\/\d*\.?\d+$/.test(t)) { const [a, b] = t.split("/"); return +b ? (+a / +b) * fator : NaN; }
    if (!/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(t)) return NaN;
    return parseFloat(t) * fator;
  }
  function conferir(ex, texto) {
    if (ex.tipo === "escolha") return +texto === ex.resposta;
    if (ex.tipo === "lista") {
      const v = String(texto).split(/[,;\s]+/).filter(Boolean).map(Number);
      return v.length === ex.resposta.length && v.every((x, i) => x === ex.resposta[i]);
    }
    let t = String(texto);
    if (ex.unidade === "%") t = t.replace(/%/g, "");
    const v = lerNumero(t);
    if (isNaN(v)) return null;
    const dif = Math.abs(v - ex.resposta);
    return dif <= (ex.tol != null ? ex.tol : 1e-12) || dif <= Math.abs(ex.resposta) * (ex.rel != null ? ex.rel : 0.015);
  }

  // frações exatas {n, d}
  const mdc = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  const F = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = mdc(n, d); return { n: n / g, d: d / g }; };
  const fMul = (a, b) => F(a.n * b.n, a.d * b.d);
  const fSom = (a, b) => F(a.n * b.d + b.n * a.d, a.d * b.d);
  const fSub = (a, b) => F(a.n * b.d - b.n * a.d, a.d * b.d);
  const fDiv = (a, b) => F(a.n * b.d, a.d * b.n);
  const fV = (a) => a.n / a.d;
  const fT = (a) => (a.d === 1 ? String(a.n) : `${a.n}/${a.d}`);
  const fH = (a) => (a.d === 1 ? String(a.n) : frH(a.n, a.d));
  const fTudo = (a) => (a.d === 1 ? `${a.n}` : `${fT(a)} ≈ ${fmt(fV(a), 3)} (${pct(fV(a))})`);
  const fTudoH = (a) => (a.d === 1 ? `${a.n}` : `${fH(a)} ≈ ${fmt(fV(a), 3)} (${pct(fV(a))})`);
  // aceita "1/4", "0,25", "25%"
  function lerFracao(s) {
    const t = String(s).trim().replace(/\s+/g, "");
    const m = t.match(/^(\d+)\/(\d+)$/);
    if (m && +m[2] > 0) return F(+m[1], +m[2]);
    const v = lerNumero(t);
    if (!isFinite(v)) return null;
    for (const d of [2, 3, 4, 5, 6, 8, 9, 10, 12, 16, 20, 25, 32, 50, 64, 100, 1000, 10000]) { const n = Math.round(v * d); if (Math.abs(n / d - v) < 1e-9) return F(n, d); }
    return { n: v, d: 1, real: true };
  }
  const combin = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); };

  const CORES = ["#9ccc65", "#4da3ff", "#f0a23c", "#d9648c", "#a46bff", "#2ee6b6", "#ffb23d", "#e5646e", "#7fd3e6", "#c9b458", "#b0bec5", "#ff8a65"];

  // ===========================================================================
  // 1. GENÉTICA MENDELIANA
  // ===========================================================================
  const HERANCAS = {
    completa: "dominância completa",
    incompleta: "dominância incompleta",
    codominancia: "codominância",
  };

  function lerGenotipo(s) {
    const t = String(s || "").replace(/\s+/g, "");
    if (!t) return { ok: false, erro: "Escreva os dois genótipos, por exemplo: AaBb x Aabb." };
    if (!/^[A-Za-z]+$/.test(t)) return { ok: false, erro: `“${t}” não é um genótipo: use só letras, um par por gene (ex.: AaBb).` };
    if (t.length % 2) return { ok: false, erro: `“${t}” tem número ímpar de letras. Cada gene tem dois alelos (ex.: Aa, BB, cc).` };
    const loci = [];
    for (let i = 0; i < t.length; i += 2) {
      const a = t[i], b = t[i + 1];
      if (a.toLowerCase() !== b.toLowerCase()) return { ok: false, erro: `Em “${t}”, o par “${a}${b}” mistura genes diferentes. Escreva os alelos de cada gene juntos: Aa, Bb…` };
      const L = a.toUpperCase();
      if (loci.some((x) => x.L === L)) return { ok: false, erro: `O gene ${L} aparece duas vezes em “${t}”.` };
      const par = [a, b].sort((x, y) => (x === x.toUpperCase() ? 0 : 1) - (y === y.toUpperCase() ? 0 : 1));
      loci.push({ L, par });
    }
    return { ok: true, loci };
  }
  function lerCruzamento(txt) {
    const t = String(txt || "").trim();
    const partes = t.split(/\s+[xX×]\s+|\s*×\s*/).filter(Boolean);
    if (partes.length !== 2) return { ok: false, erro: "Escreva o cruzamento como “genótipo x genótipo”, com espaços em volta do x (ex.: AaBb x Aabb)." };
    const g1 = lerGenotipo(partes[0]), g2 = lerGenotipo(partes[1]);
    if (!g1.ok) return g1;
    if (!g2.ok) return g2;
    const L1 = g1.loci.map((x) => x.L), L2 = g2.loci.map((x) => x.L);
    if (L1.length !== L2.length || L1.some((L) => !L2.includes(L))) return { ok: false, erro: `Os dois genitores precisam ter os mesmos genes (${L1.join(", ")} × ${L2.join(", ")}).` };
    if (L1.length > 4) return { ok: false, erro: "Use no máximo 4 genes (já são 256 combinações de gametas)." };
    const p2 = L1.map((L) => g2.loci.find((x) => x.L === L));
    return { ok: true, loci: L1, p1: g1.loci, p2 };
  }
  const gtxt = (loci) => loci.map((x) => x.par.join("")).join("");
  const homo = (par) => par[0] === par[1];
  function gametas(loci) {
    let g = [""];
    for (const x of loci) {
      const al = homo(x.par) ? [x.par[0]] : x.par;
      g = g.flatMap((s) => al.map((a) => s + a));
    }
    return g;
  }
  const ordenaPar = (a, b) => [a, b].sort((x, y) => (x === x.toUpperCase() ? 0 : 1) - (y === y.toUpperCase() ? 0 : 1)).join("");
  const rankLocus = (par) => (par[0] === par[0].toUpperCase() ? (par[1] === par[1].toUpperCase() ? 0 : 1) : 2);
  // fenótipo de um locus: chave + rótulo
  function fenLocus(par, L, heranca, nomes) {
    const r = rankLocus(par);
    const nm = nomes && nomes[L];
    if (heranca === "completa") {
      const dom = r < 2;
      return { k: dom ? 0 : 2, sim: dom ? `${L}_` : `${L.toLowerCase()}${L.toLowerCase()}`, nome: nm ? (dom ? nm.dom : nm.rec) : null };
    }
    const sims = [`${L}${L}`, `${L}${L.toLowerCase()}`, `${L.toLowerCase()}${L.toLowerCase()}`];
    return { k: r, sim: sims[r], nome: nm ? [nm.dom, nm.int, nm.rec][r] : null };
  }

  /**
   * cruzar("AaBb x Aabb", { heranca: "completa"|"incompleta"|"codominancia", letal: null|"dom"|"rec", alvo: "aabb" | "A_bb", nomes })
   */
  function cruzar(texto, opc = {}) {
    const c = lerCruzamento(texto);
    if (!c.ok) return c;
    const heranca = HERANCAS[opc.heranca] ? opc.heranca : "completa";
    const letal = opc.letal === "dom" || opc.letal === "rec" ? opc.letal : null;
    const nomes = opc.nomes || null;
    const nL = c.loci.length;
    const g1 = gametas(c.p1), g2 = gametas(c.p2);
    const s1 = gtxt(c.p1), s2 = gtxt(c.p2);
    const L0 = c.loci[0];
    const morre = (gen) => {
      if (!letal) return false;
      const p = gen.slice(0, 2);
      return letal === "dom" ? p === L0 + L0 : p === L0.toLowerCase() + L0.toLowerCase();
    };
    // enumeração completa (cada par de gametas tem a mesma chance)
    const genCont = new Map();
    const celulas = g1.map((a) => g2.map((b) => {
      let gen = "";
      for (let i = 0; i < nL; i++) gen += ordenaPar(a[i], b[i]);
      genCont.set(gen, (genCont.get(gen) || 0) + 1);
      return gen;
    }));
    const totalBruto = g1.length * g2.length;
    const fenDe = (gen) => {
      const ps = [];
      for (let i = 0; i < nL; i++) ps.push(fenLocus(gen.slice(2 * i, 2 * i + 2), c.loci[i], heranca, nomes));
      return { chave: ps.map((p) => p.k).join(""), sim: ps.map((p) => p.sim).join(""), nome: ps.every((p) => p.nome) ? ps.map((p) => p.nome).join(", ") : null };
    };
    const ordGen = (a, b) => { for (let i = 0; i < nL; i++) { const d = rankLocus(a.slice(2 * i, 2 * i + 2)) - rankLocus(b.slice(2 * i, 2 * i + 2)); if (d) return d; } return 0; };
    const genotipos = [...genCont.entries()].map(([g, n]) => ({ g, n, letal: morre(g) })).sort((a, b) => ordGen(a.g, b.g));
    const vivos = genotipos.filter((x) => !x.letal);
    const total = vivos.reduce((s, x) => s + x.n, 0);
    if (!total) return { ok: false, erro: "Com esse gene letal, nenhum descendente sobrevive: todos os genótipos possíveis são letais." };
    const fenMap = new Map();
    for (const x of vivos) {
      const f = fenDe(x.g);
      if (!fenMap.has(f.chave)) fenMap.set(f.chave, { ...f, n: 0, gens: [] });
      const o = fenMap.get(f.chave); o.n += x.n; o.gens.push(x.g);
    }
    const fenotipos = [...fenMap.values()].sort((a, b) => (a.chave < b.chave ? -1 : 1));
    fenotipos.forEach((f, i) => (f.cor = CORES[i % CORES.length]));
    const corDe = (gen) => { if (morre(gen)) return null; const k = fenDe(gen).chave; return fenMap.get(k).cor; };
    const razao = (lista) => { const g = lista.reduce((s, x) => mdc(s, x.n), 0); return lista.map((x) => x.n / g).join(" : "); };
    const razG = razao(vivos), razF = razao(fenotipos);

    const passos = [];
    // 1. leitura
    const desc = c.p1.map((x, i) => {
      const a = x.par.join(""), b = c.p2[i].par.join("");
      const tipo = (p) => (homo(p.split("")) ? (p[0] === p[0].toUpperCase() ? "homozigoto dominante" : "homozigoto recessivo") : "heterozigoto");
      return `<li>Gene <b>${c.loci[i]}</b>: ${a} (${tipo(a)}) × ${b} (${tipo(b)})</li>`;
    }).join("");
    passos.push(R("Ler o cruzamento", `<p>Genitores: <b>${s1}</b> × <b>${s2}</b>. São ${nL} gene${nL > 1 ? "s" : ""} (${nL === 1 ? "mono-híbrido" : nL === 2 ? "di-híbrido" : nL === 3 ? "tri-híbrido" : "poli-híbrido"}), cada um com dois alelos:</p><ul>${desc}</ul>
      <p>Tipo de herança: <b>${HERANCAS[heranca]}</b>${heranca === "completa" ? " (o alelo maiúsculo esconde o minúsculo: AA e Aa têm o mesmo fenótipo)" : heranca === "incompleta" ? " (o heterozigoto tem fenótipo intermediário: AA, Aa e aa são três fenótipos diferentes)" : " (o heterozigoto mostra os dois fenótipos ao mesmo tempo: AA, Aa e aa são três fenótipos)"}.${letal ? ` Gene letal: <b>${letal === "dom" ? L0 + L0 : L0.toLowerCase() + L0.toLowerCase()}</b> morre antes de nascer.` : ""}${nL > 1 ? " Supomos genes em cromossomos diferentes (segregação independente, 2ª lei de Mendel)." : ""}</p>`));
    // 2. gametas
    const gl = (g, s) => `<b>${s}</b> → ${g.length} tipo${g.length > 1 ? "s" : ""} de gameta: ${g.map((x) => `<span class="bio-gam">${x}</span>`).join(" ")} (cada um com chance ${fH(F(1, g.length))})`;
    passos.push(R("Formar os gametas", `<p>Na meiose, os dois alelos de cada gene se separam (1ª lei de Mendel): cada gameta leva <b>um alelo de cada gene</b>. Cada gene heterozigoto dobra o número de tipos de gameta: são 2ⁿ tipos, com n = número de genes heterozigotos.</p><p>${gl(g1, s1)}</p><p>${gl(g2, s2)}</p>`));
    // 3. quadro de Punnett (até 2 genes) ou locus a locus
    let punnett = "";
    if (nL <= 2) {
      punnett = `<div class="tab-rolar"><table class="bio-pun"><tr><th class="bio-pun-c"><span>${s1} ↓</span><span>${s2} →</span></th>${g2.map((g) => `<th>${g}</th>`).join("")}</tr>${g1.map((a, i) => `<tr><th>${a}</th>${celulas[i].map((gen) => { const cor = corDe(gen); return cor ? `<td style="--f:${cor}">${gen}</td>` : `<td class="letal" title="letal">${gen}</td>`; }).join("")}</tr>`).join("")}</table></div>`;
      passos.push(R("Montar o quadro de Punnett", `<p>Gametas de um genitor nas linhas, do outro nas colunas; cada casa é um encontro de gametas (fecundação), e todas as ${totalBruto} casas têm a mesma chance. A cor indica o fenótipo${letal ? "; casas riscadas são letais" : ""}.</p>${punnett}${legendaFen(fenotipos)}`));
    }
    // locus a locus (regra do "e")
    const porLocus = c.loci.map((L, i) => {
      const a = c.p1[i].par, b = c.p2[i].par;
      const m = new Map();
      for (const x of homo(a) ? [a[0]] : a) for (const y of homo(b) ? [b[0]] : b) { const k = ordenaPar(x, y); m.set(k, (m.get(k) || 0) + 1); }
      let lista = [...m.entries()].map(([g, n]) => ({ g, n, letal: i === 0 && letal ? (letal === "dom" ? g === L + L : g === L.toLowerCase() + L.toLowerCase()) : false })).sort((p, q) => rankLocus(p.g) - rankLocus(q.g));
      const tot = lista.filter((x) => !x.letal).reduce((s, x) => s + x.n, 0);
      return { L, lista, tot };
    });
    const txtLocus = porLocus.map((pl, i) => {
      const vivosL = pl.lista.filter((x) => !x.letal);
      const fens = new Map();
      vivosL.forEach((x) => { const f = fenLocus(x.g, pl.L, heranca, nomes); const k = f.sim; fens.set(k, (fens.get(k) || 0) + x.n); });
      return `<li><b>${c.p1[i].par.join("")} × ${c.p2[i].par.join("")}</b>: ${vivosL.map((x) => `${x.g} ${fH(F(x.n, pl.tot))}`).join(" · ")}${pl.lista.some((x) => x.letal) ? ` <small>(${pl.lista.filter((x) => x.letal).map((x) => x.g).join("")} letal: sobram ${pl.tot} de 4 partes)</small>` : ""}<br><small>fenótipos:</small> ${[...fens.entries()].map(([k, n]) => `${k} ${fH(F(n, pl.tot))}`).join(" · ")}</li>`;
    }).join("");
    passos.push(R(nL === 1 ? "Conferir pelas frações" : "Atalho: um gene de cada vez (regra do “e”)", `<p>${nL === 1 ? "O mesmo resultado em frações:" : `Como os genes se separam de forma independente, cruze cada gene separadamente e <b>multiplique</b> as frações. ${nL >= 3 ? `Um quadro de Punnett aqui teria ${g1.length} × ${g2.length} = ${totalBruto} casas: o atalho é muito mais rápido.` : "Dá exatamente o mesmo que o quadro, sem desenhá-lo."}`}</p><ul>${txtLocus}</ul>${nL > 1 ? `<p>Exemplo: P(${fenotipos[0].sim}) = ${fenotipos[0].sim.match(/.{2}/g).map((p, i) => { const pl = porLocus[i]; const n = pl.lista.filter((x) => !x.letal && fenLocus(x.g, pl.L, heranca, nomes).sim === p).reduce((s, x) => s + x.n, 0); return fH(F(n, pl.tot)); }).join(" × ")} = ${fH(F(fenotipos[0].n, total))}.</p>` : ""}`));
    // 4. proporções
    const lin = (x, cor) => `<tr><td>${cor ? `<i class="bio-sw" style="--f:${cor}"></i>` : ""}<b>${x.g || x.sim}</b>${x.nome ? ` <small>${x.nome}</small>` : ""}</td><td>${x.n}/${total}</td><td>${fH(F(x.n, total))}</td><td>${pct(x.n / total)}</td></tr>`;
    passos.push(R("Proporção genotípica", `<p>Conte quantas casas tem cada genótipo${letal ? " (sem os letais, que não nascem)" : ""}: ${vivos.length} genótipos diferentes, ${total} partes no total.</p><div class="tab-rolar"><table class="tb"><tr><th>Genótipo</th><th>Casas</th><th>Fração</th><th>%</th></tr>${vivos.map((x) => lin(x)).join("")}</table></div>${eqH(`${vivos.map((x) => x.g).join(" : ")} = <b>${razG}</b>`)}`));
    passos.push(R("Proporção fenotípica", `<p>Agora junte os genótipos que têm a mesma aparência${heranca === "completa" ? " (o traço _ quer dizer “qualquer alelo”: A_ = AA ou Aa)" : ""}.</p><div class="tab-rolar"><table class="tb"><tr><th>Fenótipo</th><th>Casas</th><th>Fração</th><th>%</th></tr>${fenotipos.map((f) => lin({ sim: f.sim, nome: f.nome, n: f.n }, f.cor)).join("")}</table></div>${eqH(`${fenotipos.map((f) => f.sim).join(" : ")} = <b>${razF}</b>`)}${letal ? `<p class="nota">Gene letal: das ${totalBruto} casas, ${totalBruto - total} não nascem. Por isso as frações são calculadas sobre ${total}, e não sobre ${totalBruto}. É assim que surge a famosa proporção <b>2 : 1</b> dos camundongos amarelos.</p>` : ""}`));
    // 5. probabilidade de um descendente específico
    let prob = null;
    if (opc.alvo && String(opc.alvo).trim()) {
      const pa = lerAlvo(String(opc.alvo), c.loci);
      if (!pa.ok) passos.push(R("Probabilidade pedida", `<p class="res-erro">${pa.erro}</p>`));
      else {
        const casa = vivos.filter((x) => pa.testa(x.g));
        const n = casa.reduce((s, x) => s + x.n, 0);
        prob = F(n, total);
        passos.push(R(`Probabilidade de ${pa.txt}`, `<p>Casas que servem: ${casa.length ? casa.map((x) => `${x.g} (${x.n})`).join(" + ") : "nenhuma"} = <b>${n}</b> de ${total}.</p>${eqH(`P(${pa.txt}) = ${frH(n, total)} = <b>${fTudoH(prob)}</b>`)}`));
      }
    }
    const resposta = `Fenótipos ${razF}${prob ? ` · P(${opc.alvo.trim()}) = ${fT(prob)}` : ""}`;
    return {
      ok: true, passos, resposta,
      respostaHTML: `<span class="bio-raz">${fenotipos.map((f) => `<span style="--f:${f.cor}">${f.sim}</span>`).join(" : ")} = <b>${razF}</b></span>${prob ? `<br><small>P(${String(opc.alvo).trim()}) =</small> <b>${fTudoH(prob)}</b>` : ""}`,
      valor: prob ? fV(prob) : null, prob, genotipos, fenotipos, total, totalBruto, razG, razF, gam1: g1, gam2: g2, punnett, loci: c.loci,
    };
  }
  function legendaFen(fen) {
    return `<div class="bio-leg">${fen.map((f) => `<span><i class="bio-sw" style="--f:${f.cor}"></i>${f.sim}${f.nome ? ` (${f.nome})` : ""}</span>`).join("")}</div>`;
  }
  function lerAlvo(s, loci) {
    const t = s.replace(/\s+/g, "");
    if (t.length !== loci.length * 2 || !/^[A-Za-z_]+$/.test(t)) return { ok: false, erro: `Escreva o descendente com ${loci.length * 2} símbolos, um par por gene (ex.: ${loci.map((L) => L + "_").join("")} ou ${loci.map((L) => L.toLowerCase() + L.toLowerCase()).join("")}).` };
    const testes = [];
    for (let i = 0; i < loci.length; i++) {
      const p = t.slice(2 * i, 2 * i + 2);
      const letras = p.replace(/_/g, "");
      if (letras && [...letras].some((ch) => ch.toUpperCase() !== loci[i])) return { ok: false, erro: `No ${i + 1}º par esperava o gene ${loci[i]} (na mesma ordem do cruzamento).` };
      if (p === "__") testes.push(() => true);
      else if (p.includes("_")) { const a = letras; testes.push((g) => g.includes(a)); }
      else { const o = ordenaPar(p[0], p[1]); testes.push((g) => g === o); }
    }
    return { ok: true, txt: t, testa: (gen) => testes.every((f, i) => f(gen.slice(2 * i, 2 * i + 2))) };
  }

  // ===========================================================================
  // 2. PROBABILIDADE EM GENÉTICA
  // ===========================================================================
  // 2a. um gene autossômico (casal e filhos)
  function autossomico({ p1 = "Aa", p2 = "Aa", condicao = "recessiva", n = null, k = null } = {}) {
    const c = lerCruzamento(`${p1} x ${p2}`);
    if (!c.ok) return c;
    if (c.loci.length !== 1) return { ok: false, erro: "Aqui é um gene só: use genótipos como Aa, AA ou aa." };
    const L = c.loci[0], l = L.toLowerCase();
    const r = cruzar(`${p1} x ${p2}`, {});
    const P = (g) => F((r.genotipos.find((x) => x.g === g) || { n: 0 }).n, r.total);
    const pAA = P(L + L), pAa = P(L + l), paa = P(l + l);
    const rec = condicao !== "dominante";
    const pAf = rec ? paa : fSom(pAA, pAa), pNo = fSub(F(1), pAf);
    const passos = [];
    passos.push(R("Cruzar os pais", `<p>Casal <b>${gtxt(c.p1)} × ${gtxt(c.p2)}</b>. Pelo quadro de Punnett (ou cruzando os gametas):</p>${eqH(`${L}${L} ${fH(pAA)} · ${L}${l} ${fH(pAa)} · ${l}${l} ${fH(paa)}`)}<p>Doença <b>${rec ? "autossômica recessiva" : "autossômica dominante"}</b>: afetado = <b>${rec ? l + l : L + "_"}</b>; normal = <b>${rec ? L + "_" : l + l}</b>.</p>`));
    passos.push(R("Chance de um filho ser afetado", `${eqH(`P(afetado) = <b>${fTudoH(pAf)}</b> &nbsp;·&nbsp; P(normal) = 1 − ${fH(pAf)} = <b>${fH(pNo)}</b>`)}<p>Cada filho é um sorteio novo: a chance vale para <b>cada</b> gestação, independentemente dos irmãos que já nasceram.</p>`));
    let pCond = null;
    if (rec && pAa.n > 0 && pNo.n > 0) {
      pCond = fDiv(pAa, pNo);
      passos.push(R("Condicional: sabendo que é normal", `<p>Se já sabemos que o filho é <b>normal</b>, o “universo” encolhe: a casa ${l}${l} sai da conta. Só sobram ${L}${L} e ${L}${l}.</p>${eqH(`P(portador | normal) = ${frH("P(" + L + l + ")", "P(normal)")} = ${frH(fT(pAa), fT(pNo))} = <b>${fTudoH(pCond)}</b>`)}${pCond.n === 2 && pCond.d === 3 ? `<p>É o famoso <b>2/3</b> dos heredogramas quando os pais são ${L}${l} × ${L}${l}.</p>` : ""}`));
    }
    const pMen = fMul(F(1, 2), pAf);
    passos.push(R("Regras do “e” e do “ou”", `<p><b>“E”</b> (eventos independentes acontecendo juntos): multiplique. Ser de um sexo definido (menino, ou menina) <i>e</i> afetado:</p>${eqH(`P = ${frH(1, 2)} × ${fH(pAf)} = <b>${fH(pMen)}</b>`)}<p><b>“Ou”</b> (eventos que não podem ocorrer juntos): some. Ser ${L}${L} <i>ou</i> ${L}${l}: ${fH(pAA)} + ${fH(pAa)} = <b>${fH(fSom(pAA, pAa))}</b>.</p>`));
    let pBin = null;
    if (n != null && k != null && n >= 1 && k >= 0 && k <= n) {
      const b = binomial({ n, k, p: fT(pAf), evento: "afetado" });
      if (b.ok) { pBin = b.prob; b.passos.forEach((p) => passos.push(p)); }
    }
    return {
      ok: true, passos, prob: pAf, pCond, pMenino: pMen, pBin,
      valor: fV(pAf),
      resposta: `P(afetado) = ${fT(pAf)}${pCond ? ` · P(portador | normal) = ${fT(pCond)}` : ""}${pBin ? ` · P(${k} de ${n}) = ${fT(pBin)}` : ""}`,
      respostaHTML: `P(afetado) = <b>${fTudoH(pAf)}</b>${pCond ? `<br><small>Sabendo que é normal, P(portador) =</small> <b>${fH(pCond)}</b>` : ""}${pBin ? `<br><small>P(exatamente ${k} afetado${k === 1 ? "" : "s"} em ${n} filhos) =</small> <b>${fTudoH(pBin)}</b>` : ""}`,
    };
  }

  // 2b. binomial: exatamente k (ou pelo menos k) em n
  function binomial({ n, k, p, modo = "exato", evento = "com a característica" } = {}) {
    n = Math.round(+n); k = Math.round(+k);
    if (!(n >= 1 && n <= 20)) return { ok: false, erro: "Use n entre 1 e 20 filhos." };
    if (!(k >= 0 && k <= n)) return { ok: false, erro: "k precisa estar entre 0 e n." };
    const pf = typeof p === "object" ? p : lerFracao(p);
    if (!pf || !(fV(pf) >= 0 && fV(pf) <= 1)) return { ok: false, erro: "A probabilidade p deve estar entre 0 e 1 (ex.: 1/4, 0,25 ou 25%)." };
    const exato = !pf.real && Math.pow(pf.d, n) < 9e15;
    const q = exato ? F(pf.d - pf.n, pf.d) : { n: 1 - fV(pf), d: 1, real: true };
    const termo = (j) => (exato ? F(combin(n, j) * Math.pow(pf.n, j) * Math.pow(q.n, n - j), Math.pow(pf.d, n)) : { n: combin(n, j) * Math.pow(fV(pf), j) * Math.pow(fV(q), n - j), d: 1, real: true });
    const show = (f) => (f.real ? fmt(f.n, 4) : fTudoH(f));
    const passos = [];
    passos.push(R("Binomial: por que combinações?", `<p>Queremos ${modo === "exato" ? "<b>exatamente</b>" : "<b>pelo menos</b>"} ${k} filho${k === 1 ? "" : "s"} ${evento} em ${n}. Uma ordem específica (por exemplo, os ${k} primeiros) tem chance p<sup>k</sup>·q<sup>n−k</sup> (regra do “e”). Mas há C(n, k) ordens diferentes, todas válidas (regra do “ou”): por isso multiplicamos pelo número de combinações.</p>${eqH(`P(k) = C(n, k) · p<sup>k</sup> · q<sup>n−k</sup> &nbsp; com p = ${pf.real ? fmt(fV(pf)) : fH(pf)}, q = 1 − p = ${q.real ? fmt(fV(q)) : fH(q)}`)}`));
    let total;
    if (modo === "exato") {
      total = termo(k);
      passos.push(R("Fazer a conta", `${eqH(`C(${n}, ${k}) = ${frH(`${n}!`, `${k}! · ${n - k}!`)} = ${combin(n, k)}`)}${eqH(`P = ${combin(n, k)} · (${pf.real ? fmt(fV(pf)) : fT(pf)})<sup>${k}</sup> · (${q.real ? fmt(fV(q)) : fT(q)})<sup>${n - k}</sup> = <b>${show(total)}</b>`)}`));
    } else {
      // pelo menos k = 1 − P(menos de k)
      let menos = exato ? F(0) : { n: 0, d: 1, real: true };
      const ts = [];
      for (let j = 0; j < k; j++) { const t = termo(j); ts.push(`P(${j}) = ${show(t)}`); menos = exato ? fSom(menos, t) : { n: menos.n + t.n, d: 1, real: true }; }
      total = exato ? fSub(F(1), menos) : { n: 1 - menos.n, d: 1, real: true };
      passos.push(R("Use o complemento", `<p>“Pelo menos ${k}” é o contrário de “menos de ${k}”. É mais curto calcular o contrário e subtrair de 1:</p>${ts.length ? `<p>${ts.join("<br>")}</p>` : ""}${eqH(`P(≥ ${k}) = 1 − ${k === 0 ? "0" : show(menos)} = <b>${show(total)}</b>`)}${k === 1 ? `<p>Atalho clássico: P(pelo menos 1) = 1 − q<sup>n</sup> = 1 − (${q.real ? fmt(fV(q)) : fT(q)})<sup>${n}</sup>.</p>` : ""}`));
    }
    const v = total.real ? total.n : fV(total);
    return { ok: true, passos, prob: total.real ? null : total, valor: v, resposta: `P = ${total.real ? fmt(v) : fT(total)} ≈ ${pct(v)}`, respostaHTML: `P = <b>${show(total)}</b>` };
  }

  // 2c. herança ligada ao X
  const DOENCAS_X = { daltonismo: { nome: "daltonismo", L: "D" }, hemofilia: { nome: "hemofilia A", L: "H" } };
  const xh = (a) => `X<sup>${a}</sup>`;
  function ligadoX({ mae = "Dd", pai = "D", doenca = "daltonismo" } = {}) {
    const D = DOENCAS_X[doenca] || DOENCAS_X.daltonismo;
    const L = D.L, l = L.toLowerCase();
    const norm = (s) => String(s).replace(/X|Y|\s|\^/gi, "").replace(/[A-Za-z]/g, (c) => (c.toUpperCase() === L || /[A-Za-z]/.test(c) ? (c === c.toUpperCase() ? L : l) : c));
    const m = norm(mae).split(""), p = norm(pai).split("");
    if (m.length !== 2 || p.length !== 1) return { ok: false, erro: "A mãe tem dois X (ex.: XᴰXᵈ) e o pai um X e um Y (ex.: XᴰY)." };
    const ord = (a, b) => (a === L ? a + b : b + a);
    const mg = m[0] === m[1] ? [m[0]] : m;
    const filhas = [], filhos = [];
    for (const a of mg) { filhas.push(ord(a, p[0])); filhos.push(a); }
    const afetadaF = filhas.filter((g) => g === l + l).length, portF = filhas.filter((g) => g === L + l).length;
    const afetadoM = filhos.filter((g) => g === l).length;
    const nf = filhas.length;
    const pFa = F(afetadaF, nf), pFp = F(portF, nf), pMa = F(afetadoM, nf);
    const pCrianca = fSom(fMul(F(1, 2), pFa), fMul(F(1, 2), pMa));
    const gm = (g) => g.split("").map(xh).join("");
    const passos = [];
    passos.push(R("Quem é quem", `<p>O gene do ${D.nome} fica no cromossomo <b>X</b> e o alelo da doença (${xh(l)}) é <b>recessivo</b>. Mulher (XX) tem duas cópias; homem (XY) tem <b>uma só</b>, pois o Y não carrega esse gene. Por isso basta um ${xh(l)} para o homem ser afetado.</p>${eqH(`mãe ${gm(m[0] === L ? m.join("") : m.slice().reverse().join(""))} × pai ${xh(p[0])}Y`)}<p>Mãe: ${m[0] === m[1] ? (m[0] === L ? "normal, homozigota" : "afetada") : "<b>portadora</b> (normal, mas carrega o alelo)"}. Pai: ${p[0] === L ? "normal" : "afetado"}.</p>`));
    const tab = `<div class="tab-rolar"><table class="bio-pun"><tr><th class="bio-pun-c"><span>mãe ↓</span><span>pai →</span></th><th>${xh(p[0])}</th><th>Y</th></tr>${mg.map((a) => { const fa = ord(a, p[0]); return `<tr><th>${xh(a)}</th><td style="--f:${fa === l + l ? "#e5646e" : fa === L + l ? "#f0a23c" : "#9ccc65"}">${gm(fa)}<small>filha</small></td><td style="--f:${a === l ? "#e5646e" : "#4da3ff"}">${xh(a)}Y<small>filho</small></td></tr>`; }).join("")}</table></div>`;
    passos.push(R("Quadro de Punnett", `<p>O pai manda o X para <b>todas as filhas</b> e o Y para <b>todos os filhos</b>; o filho homem recebe o X sempre da mãe.</p>${tab}<div class="bio-leg"><span><i class="bio-sw" style="--f:#e5646e"></i>afetado(a)</span><span><i class="bio-sw" style="--f:#f0a23c"></i>portadora</span><span><i class="bio-sw" style="--f:#9ccc65"></i>mulher normal</span><span><i class="bio-sw" style="--f:#4da3ff"></i>homem normal</span></div>`));
    passos.push(R("Ler as probabilidades (cuidado com o “universo”)", `<ul><li>Entre as <b>filhas</b>: afetadas ${fH(pFa)}, portadoras ${fH(pFp)}.</li><li>Entre os <b>filhos homens</b>: afetados <b>${fH(pMa)}</b>.</li><li>Para uma criança qualquer (sexo ainda desconhecido): P(menino afetado) = ${frH(1, 2)} × ${fH(pMa)} = ${fH(fMul(F(1, 2), pMa))}; P(afetada, de qualquer sexo) = <b>${fH(pCrianca)}</b>.</li></ul><p class="nota">“Um filho homem ser afetado” (${fT(pMa)}) é diferente de “a criança ser um menino afetado” (${fT(fMul(F(1, 2), pMa))}). Leia o enunciado com atenção: é o erro número 1 nesse assunto.</p>`));
    return {
      ok: true, passos, pFilhaAf: pFa, pFilhaPort: pFp, pFilhoAf: pMa, pCrianca, valor: fV(pMa),
      resposta: `Filhos homens afetados: ${fT(pMa)} · filhas afetadas: ${fT(pFa)} · filhas portadoras: ${fT(pFp)}`,
      respostaHTML: `Filhos homens afetados: <b>${fH(pMa)}</b> · filhas afetadas: <b>${fH(pFa)}</b> · filhas portadoras: <b>${fH(pFp)}</b><br><small>Criança qualquer afetada:</small> <b>${fH(pCrianca)}</b>`,
    };
  }

  // 2d. ABO e Rh
  const ABO_GEN = { IAIA: ["A", "A"], IAi: ["A", "i"], IBIB: ["B", "B"], IBi: ["B", "i"], IAIB: ["A", "B"], ii: ["i", "i"] };
  const aboH = (g) => g.replace(/I([AB])/g, "I<sup>$1</sup>");
  const alH = (a) => (a === "i" ? "i" : `I<sup>${a}</sup>`);
  const fenABO = (a, b) => { const s = new Set([a, b]); return s.has("A") && s.has("B") ? "AB" : s.has("A") ? "A" : s.has("B") ? "B" : "O"; };
  const genABO = (a, b) => { const o = [a, b].sort((x, y) => "ABi".indexOf(x) - "ABi".indexOf(y)); return o.map((x) => (x === "i" ? "i" : "I" + x)).join(""); };
  // compatibilidade de hemácias: doador -> receptor
  const DOA_ABO = { O: ["O", "A", "B", "AB"], A: ["A", "AB"], B: ["B", "AB"], AB: ["AB"] };
  const podeDoar = (d, r) => { const [da, dr] = [d.replace(/[+−-]/, ""), /\+/.test(d)]; const [ra, rr] = [r.replace(/[+−-]/, ""), /\+/.test(r)]; return DOA_ABO[da].includes(ra) && (!dr || rr); };
  const TIPOS = ["O−", "O+", "A−", "A+", "B−", "B+", "AB−", "AB+"];
  function tabelaDoacao(destaque) {
    return `<div class="tab-rolar"><table class="tb bio-doa"><tr><th>doador ↓ / receptor →</th>${TIPOS.map((t) => `<th>${t}</th>`).join("")}</tr>${TIPOS.map((d) => `<tr${destaque && destaque.includes(d) ? ' class="on"' : ""}><th>${d}</th>${TIPOS.map((r) => `<td class="${podeDoar(d, r) ? "sim" : "nao"}">${podeDoar(d, r) ? "✓" : "·"}</td>`).join("")}</tr>`).join("")}</table></div>`;
  }
  function abo({ p1 = "IAi", p2 = "IBi", rh1 = "", rh2 = "" } = {}) {
    const A1 = ABO_GEN[p1], A2 = ABO_GEN[p2];
    if (!A1 || !A2) return { ok: false, erro: "Genótipos ABO válidos: IAIA, IAi, IBIB, IBi, IAIB, ii." };
    const RH = { RR: ["R", "R"], Rr: ["R", "r"], rr: ["r", "r"] };
    const usaRh = !!(rh1 && rh2);
    if (usaRh && (!RH[rh1] || !RH[rh2])) return { ok: false, erro: "Rh: use RR, Rr ou rr." };
    const passos = [];
    const g1 = [...new Set(A1)], g2 = [...new Set(A2)];
    passos.push(R("Os alelos do sistema ABO", `<p>Três alelos: <b>I<sup>A</sup></b> e <b>I<sup>B</sup></b> são <b>codominantes</b> entre si (juntos dão o tipo AB) e ambos dominam <b>i</b>. Fenótipos: A = I<sup>A</sup>I<sup>A</sup> ou I<sup>A</sup>i; B = I<sup>B</sup>I<sup>B</sup> ou I<sup>B</sup>i; AB = I<sup>A</sup>I<sup>B</sup>; O = ii.</p>${eqH(`${aboH(p1)} (tipo ${fenABO(...A1)}) × ${aboH(p2)} (tipo ${fenABO(...A2)})`)}`));
    const fen = new Map();
    const tot = g1.length * g2.length;
    const tab = `<div class="tab-rolar"><table class="bio-pun"><tr><th class="bio-pun-c"><span>${aboH(p1)} ↓</span><span>${aboH(p2)} →</span></th>${g2.map((b) => `<th>${alH(b)}</th>`).join("")}</tr>${g1.map((a) => `<tr><th>${alH(a)}</th>${g2.map((b) => { const f = fenABO(a, b); fen.set(f, (fen.get(f) || 0) + 1); return `<td style="--f:${({ A: "#4da3ff", B: "#f0a23c", AB: "#a46bff", O: "#9ccc65" })[f]}">${aboH(genABO(a, b))}<small>${f}</small></td>`; }).join("")}</tr>`).join("")}</table></div>`;
    const ordem = ["A", "B", "AB", "O"].filter((f) => fen.has(f));
    const pABO = Object.fromEntries(["A", "B", "AB", "O"].map((f) => [f, F(fen.get(f) || 0, tot)]));
    passos.push(R("Cruzar os alelos", `${tab}${eqH(ordem.map((f) => `${f}: ${fH(pABO[f])}`).join(" &nbsp;·&nbsp; "))}${["A", "B", "AB", "O"].filter((f) => !fen.has(f)).length ? `<p>Impossível para esse casal: <b>${["A", "B", "AB", "O"].filter((f) => !fen.has(f)).join(", ")}</b>.</p>` : ""}`));
    let pRh = null, comb = null;
    if (usaRh) {
      const r1 = [...new Set(RH[rh1])], r2 = [...new Set(RH[rh2])];
      let pos = 0;
      r1.forEach((a) => r2.forEach((b) => { if (a === "R" || b === "R") pos++; }));
      pRh = { "+": F(pos, r1.length * r2.length), "−": F(r1.length * r2.length - pos, r1.length * r2.length) };
      passos.push(R("Fator Rh (outro gene, herança independente)", `<p>Rh⁺ = R_ (dominante); Rh⁻ = rr. Casal ${rh1} × ${rh2}:</p>${eqH(`Rh⁺ ${fH(pRh["+"])} &nbsp;·&nbsp; Rh⁻ ${fH(pRh["−"])}`)}`));
      comb = [];
      ordem.forEach((f) => ["+", "−"].forEach((s) => { const p = fMul(pABO[f], pRh[s]); if (p.n) comb.push({ t: f + s, p }); }));
      passos.push(R("Juntar ABO e Rh (regra do “e”)", `<p>Os genes são independentes: multiplique. Por exemplo, P(${comb[0].t}) = ${fH(pABO[comb[0].t.slice(0, -1)])} × ${fH(pRh[comb[0].t.slice(-1)])} = ${fH(comb[0].p)}.</p><div class="tab-rolar"><table class="tb"><tr><th>Tipo</th><th>Probabilidade</th><th>%</th></tr>${comb.map((x) => `<tr><td><b>${x.t}</b></td><td>${fH(x.p)}</td><td>${pct(fV(x.p))}</td></tr>`).join("")}</table></div>`));
    }
    const tiposFilhos = usaRh ? comb.map((x) => x.t) : ordem.flatMap((f) => [f + "−", f + "+"]);
    passos.push(R("Transfusão: quem doa para quem", `<p>Na transfusão de hemácias, o que importa é o <b>antígeno da hemácia do doador</b> encontrar anticorpo no plasma do receptor. O tipo O não tem antígenos A nem B (<b>doador universal de hemácias</b>, se for O−); o AB não tem anticorpos anti-A nem anti-B (<b>receptor universal</b>, se AB+). Rh⁻ só recebe Rh⁻.</p>${tabelaDoacao(tiposFilhos)}`));
    return {
      ok: true, passos, pABO, pRh, comb, valor: fV(pABO.O),
      resposta: ordem.map((f) => `${f}: ${fT(pABO[f])}`).join(" · ") + (comb ? ` | ${comb.map((x) => `${x.t} ${fT(x.p)}`).join(", ")}` : ""),
      respostaHTML: ordem.map((f) => `${f}: <b>${fH(pABO[f])}</b>`).join(" &nbsp;·&nbsp; ") + (comb ? `<br><small>com Rh:</small> ${comb.map((x) => `${x.t} <b>${fT(x.p)}</b>`).join(" · ")}` : ""),
    };
  }

  // ===========================================================================
  // 3. HARDY-WEINBERG
  // ===========================================================================
  /** hardy({ modo: "q2"|"p"|"q"|"contagens", valor, N, AA, Aa, aa }) */
  function hardy(o = {}) {
    const modo = o.modo || "q2";
    const passos = [];
    let p, q, Nobs = null;
    if (modo === "contagens") {
      const AA = +o.AA, Aa = +o.Aa, aa = +o.aa;
      if (![AA, Aa, aa].every((x) => Number.isFinite(x) && x >= 0 && Math.round(x) === x)) return { ok: false, erro: "Informe as três contagens (números inteiros ≥ 0)." };
      const N = AA + Aa + aa;
      if (!N) return { ok: false, erro: "A população está vazia." };
      Nobs = { AA, Aa, aa, N };
      p = (2 * AA + Aa) / (2 * N); q = 1 - p;
      passos.push(R("Contar alelos (não indivíduos)", `<p>Cada indivíduo tem 2 alelos: são 2N = ${2 * N} alelos na população. Cada AA tem dois A; cada Aa tem um A.</p>${eqH(`p = ${frH("2·AA + Aa", "2N")} = ${frH(`2·${AA} + ${Aa}`, `2·${N}`)} = ${frH(2 * AA + Aa, 2 * N)} = <b>${fmt(p, 4)}</b>`)}${eqH(`q = 1 − p = <b>${fmt(q, 4)}</b>`)}`));
    } else {
      const v = lerNumero(o.valor);
      if (!isFinite(v)) return { ok: false, erro: modo === "q2" ? "Informe a frequência de indivíduos recessivos (aa), ex.: 1/2500, 0,04 ou 4%." : "Informe a frequência do alelo (entre 0 e 1)." };
      if (!(v >= 0 && v <= 1)) return { ok: false, erro: "Frequências ficam entre 0 e 1 (ou entre 0% e 100%)." };
      if (modo === "q2") {
        q = Math.sqrt(v); p = 1 - q;
        passos.push(R("Do fenótipo recessivo ao alelo", `<p>Só os <b>aa</b> mostram o fenótipo recessivo, e em equilíbrio a frequência deles é q². Os heterozigotos não dá para ver, por isso começamos pelos aa:</p>${eqH(`q² = ${fmt(v, 4)} &nbsp;⇒&nbsp; q = √${fmt(v, 4)} = <b>${fmt(q, 4)}</b>`)}${eqH(`p = 1 − q = 1 − ${fmt(q, 4)} = <b>${fmt(p, 4)}</b>`)}`));
      } else if (modo === "q") {
        q = v; p = 1 - q;
        passos.push(R("Frequências dos alelos", `${eqH(`q = ${fmt(q, 4)} &nbsp;⇒&nbsp; p = 1 − q = <b>${fmt(p, 4)}</b>`)}<p>p + q = 1: só há dois alelos, então as frequências somam 100%.</p>`));
      } else {
        p = v; q = 1 - p;
        passos.push(R("Frequências dos alelos", `${eqH(`p = ${fmt(p, 4)} &nbsp;⇒&nbsp; q = 1 − p = <b>${fmt(q, 4)}</b>`)}<p>p + q = 1: só há dois alelos, então as frequências somam 100%.</p>`));
      }
    }
    const fAA = p * p, fAa = 2 * p * q, faa = q * q;
    passos.push(R("Frequências dos genótipos (equilíbrio)", `<p>Com acasalamento ao acaso, cada filho junta dois alelos sorteados do “pote” da população: P(AA) = p·p, P(aa) = q·q, e o heterozigoto aparece de <b>duas</b> formas (A do pai e a da mãe, ou o contrário), daí o 2.</p>${eqH(`p² = ${fmt(fAA, 4)} &nbsp;·&nbsp; 2pq = ${fmt(fAa, 4)} &nbsp;·&nbsp; q² = ${fmt(faa, 4)}`)}${eqH(`p² + 2pq + q² = ${fmt(fAA + fAa + faa, 4)} ✓`)}`));
    const portNorm = fAa / (fAA + fAa);
    passos.push(R("Portadores", `<p>Portador = heterozigoto (Aa): normal, mas carrega o alelo recessivo.</p>${eqH(`2pq = 2 × ${fmt(p, 4)} × ${fmt(q, 4)} = <b>${fmt(fAa, 4)}</b> ≈ ${pct(fAa)}${fAa > 0 ? ` (cerca de 1 em ${fmt(1 / fAa, 3)})` : ""}`)}<p>Entre as pessoas <b>sem</b> o fenótipo recessivo, a fração de portadores é ${frH("2pq", "p² + 2pq")} = <b>${fmt(portNorm, 3)}</b>.${q > 0 && q < 0.2 ? ` Repare: há ${fmt(fAa / faa, 3)} vezes mais portadores que afetados. Alelos recessivos raros se “escondem” nos heterozigotos.` : ""}</p>`));
    let nPort = null;
    const Npop = Nobs ? Nobs.N : o.N != null && o.N !== "" ? lerNumero(o.N) : null;
    if (Npop && isFinite(Npop) && Npop > 0) {
      nPort = fAa * Npop;
      passos.push(R(`Numa população de ${fmt(Npop, 6)}`, `${eqH(`AA ≈ ${fmt(fAA * Npop, 4)} &nbsp;·&nbsp; Aa ≈ <b>${fmt(nPort, 4)}</b> &nbsp;·&nbsp; aa ≈ ${fmt(faa * Npop, 4)}`)}<p>Multiplique cada frequência pelo número de indivíduos.</p>`));
    }
    let chi = null;
    if (Nobs) {
      const N = Nobs.N;
      const esp = { AA: fAA * N, Aa: fAa * N, aa: faa * N };
      const ks = ["AA", "Aa", "aa"];
      const termos = ks.map((k) => (esp[k] > 0 ? (Nobs[k] - esp[k]) ** 2 / esp[k] : 0));
      chi = termos.reduce((s, x) => s + x, 0);
      const eq = chi <= 3.841;
      passos.push(R("Teste qui-quadrado (χ²): está em equilíbrio?", `<p>Compare o <b>observado</b> com o <b>esperado</b> pelo equilíbrio (N × frequência):</p><div class="tab-rolar"><table class="tb"><tr><th>Genótipo</th><th>Observado</th><th>Esperado</th><th>(O − E)²/E</th></tr>${ks.map((k, i) => `<tr><td>${k}</td><td>${Nobs[k]}</td><td>${fmt(esp[k], 4)}</td><td>${fmt(termos[i], 3)}</td></tr>`).join("")}</table></div>${eqH(`χ² = Σ ${frH("(O − E)²", "E")} = <b>${fmt(chi, 3)}</b>`)}<p>Graus de liberdade: 3 classes − 1 − 1 (p foi estimado dos dados) = <b>1</b>. Valor crítico (α = 0,05): <b>3,84</b>. ${eq ? `Como ${fmt(chi, 3)} ≤ 3,84, os dados são <b>compatíveis com o equilíbrio</b> (a diferença cabe no acaso).` : `Como ${fmt(chi, 3)} > 3,84, a população <b>não está em equilíbrio</b>: algo (seleção, endogamia, migração, cruzamentos preferenciais…) está mexendo nas frequências.`}</p>${Math.min(esp.AA, esp.Aa, esp.aa) < 5 ? `<p class="nota">Alguma classe tem esperado menor que 5: o χ² fica pouco confiável; use um teste exato.</p>` : ""}`));
    }
    return {
      ok: true, passos, p, q, fAA, fAa, faa, nPort, chi, valor: fAa,
      resposta: `p = ${fmt(p, 4)}, q = ${fmt(q, 4)} · AA ${fmt(fAA, 4)}, Aa ${fmt(fAa, 4)}, aa ${fmt(faa, 4)}${nPort != null && !Nobs ? ` · portadores ≈ ${fmt(nPort, 4)}` : ""}${chi != null ? ` · χ² = ${fmt(chi, 3)}` : ""}`,
      respostaHTML: `p = <b>${fmt(p, 4)}</b> · q = <b>${fmt(q, 4)}</b><br><small>AA</small> ${fmt(fAA, 4)} · <small>Aa (portadores)</small> <b>${fmt(fAa, 4)}</b> · <small>aa</small> ${fmt(faa, 4)}${nPort != null && !Nobs ? `<br><small>Portadores na população:</small> <b>≈ ${fmt(nPort, 4)}</b>` : ""}${chi != null ? `<br><small>χ² =</small> <b>${fmt(chi, 3)}</b> ${chi <= 3.841 ? "(em equilíbrio)" : "(fora do equilíbrio)"}` : ""}`,
    };
  }

  // ===========================================================================
  // 4. DO DNA À PROTEÍNA
  // ===========================================================================
  const BASES = "UCAG";
  // código genético padrão (tabela 1 do NCBI): índice = 16·b1 + 4·b2 + b3, bases na ordem U C A G
  const AA_DO_CODON = "FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG";
  const AMINO = {
    A: ["Ala", "Alanina"], R: ["Arg", "Arginina"], N: ["Asn", "Asparagina"], D: ["Asp", "Ácido aspártico"], C: ["Cys", "Cisteína"],
    Q: ["Gln", "Glutamina"], E: ["Glu", "Ácido glutâmico"], G: ["Gly", "Glicina"], H: ["His", "Histidina"], I: ["Ile", "Isoleucina"],
    L: ["Leu", "Leucina"], K: ["Lys", "Lisina"], M: ["Met", "Metionina"], F: ["Phe", "Fenilalanina"], P: ["Pro", "Prolina"],
    S: ["Ser", "Serina"], T: ["Thr", "Treonina"], W: ["Trp", "Triptofano"], Y: ["Tyr", "Tirosina"], V: ["Val", "Valina"],
    "*": ["Stop", "parada"],
  };
  const CODIGO = {};
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) CODIGO[BASES[i] + BASES[j] + BASES[k]] = AA_DO_CODON[16 * i + 4 * j + k];
  const traduzirCodon = (c) => CODIGO[c] || null;
  const COMP_DNA = { A: "T", T: "A", C: "G", G: "C" };
  const COMP_RNA_DE_DNA = { A: "U", T: "A", C: "G", G: "C" };
  const complementar = (s) => s.split("").map((b) => COMP_DNA[b]).join("");
  const transcrever = (molde) => molde.split("").map((b) => COMP_RNA_DE_DNA[b]).join("");
  function limparSeq(s) {
    return String(s || "").toUpperCase().replace(/[35]['’′]|[–—\-\s\d.,;:|]/g, "");
  }
  // traduz um RNAm a partir de `ini`; para no primeiro códon de parada
  function traduzir(rna, ini) {
    const cods = [];
    let parou = false;
    for (let i = ini; i + 3 <= rna.length; i += 3) {
      const c = rna.slice(i, i + 3), a = CODIGO[c];
      cods.push({ c, a, pos: i });
      if (a === "*") { parou = true; break; }
    }
    const prot = cods.filter((x) => x.a !== "*").map((x) => x.a).join("");
    return { cods, prot, parou };
  }
  const prot3 = (p) => (p ? p.split("").map((a) => AMINO[a][0]).join("-") : "(nenhum aminoácido)");
  const grupos = (s, ini = 0) => { const a = []; if (ini) a.push(s.slice(0, ini)); for (let i = ini; i < s.length; i += 3) a.push(s.slice(i, i + 3)); return a.join(" "); };
  function tabelaCodigo(usados) {
    const u = new Set(usados || []);
    const cel = (c) => { const a = CODIGO[c]; return `<span class="${u.has(c) ? "on " : ""}${a === "*" ? "stop" : c === "AUG" ? "ini" : ""}"><b>${c}</b> ${AMINO[a][0]}</span>`; };
    let h = `<div class="tab-rolar"><table class="bio-cod"><tr><th>1ª</th>${BASES.split("").map((b) => `<th>2ª: ${b}</th>`).join("")}</tr>`;
    for (const b1 of BASES) h += `<tr><th>${b1}</th>${BASES.split("").map((b2) => `<td>${BASES.split("").map((b3) => cel(b1 + b2 + b3)).join("")}</td>`).join("")}</tr>`;
    return h + `</table></div>`;
  }
  function aplicarMutacao(seq, m) {
    if (!m || !m.tipo || m.tipo === "nenhuma") return { ok: true, seq, desc: "" };
    const pos = Math.round(+m.pos);
    const b = String(m.base || "").toUpperCase();
    if (!(pos >= 1 && pos <= seq.length + (m.tipo === "ins" ? 1 : 0))) return { ok: false, erro: `A posição da mutação deve estar entre 1 e ${seq.length}.` };
    if (m.tipo !== "del" && !/^[ACGTU]+$/.test(b)) return { ok: false, erro: "Diga qual base entra na mutação (A, C, G, T ou U)." };
    const i = pos - 1;
    if (m.tipo === "sub") { if (b.length !== 1) return { ok: false, erro: "Na substituição, troque uma base só." }; if (seq[i] === b) return { ok: false, erro: `A posição ${pos} já é ${b}: escolha outra base.` }; return { ok: true, seq: seq.slice(0, i) + b + seq.slice(i + 1), desc: `substituição da base ${pos} (${seq[i]} → ${b})` }; }
    if (m.tipo === "ins") return { ok: true, seq: seq.slice(0, i) + b + seq.slice(i), desc: `inserção de ${b} antes da posição ${pos}` };
    if (m.tipo === "del") { const n = Math.max(1, Math.round(+m.n || 1)); return { ok: true, seq: seq.slice(0, i) + seq.slice(i + n), desc: `deleção de ${n > 1 ? n + " bases" : "1 base"} na posição ${pos} (${seq.slice(i, i + n)})` }; }
    return { ok: false, erro: "Tipo de mutação desconhecido." };
  }
  // RNAm a partir da entrada
  function paraRNA(seq, tipo) {
    if (tipo === "rna") return seq;
    if (tipo === "codificante") return seq.replace(/T/g, "U");
    return transcrever(seq);
  }
  function classificarMutacao(t0, t1, delta) {
    if (t0.prot === t1.prot && t0.parou === t1.parou) return { tipo: "silenciosa", nome: "silenciosa", expl: "A proteína não muda. Ou o códon novo codifica o mesmo aminoácido (o código é <b>degenerado</b>: vários códons por aminoácido, quase sempre diferindo na 3ª base), ou a mudança caiu fora da região que é traduzida." };
    if (!t1.cods.length || (t0.cods[0] && t0.cods[0].c === "AUG" && t1.cods[0] && t1.cods[0].pos !== t0.cods[0].pos)) {
      if (!t1.cods.length) return { tipo: "inicio", nome: "perda do códon de início", expl: "O AUG de início foi destruído: o ribossomo não reconhece onde começar e a proteína não é feita (ou começa num AUG mais adiante)." };
    }
    if (delta % 3 !== 0) return { tipo: "frameshift", nome: "deslocamento do quadro de leitura", expl: `Entraram ou saíram ${Math.abs(delta)} base${Math.abs(delta) > 1 ? "s" : ""} (não múltiplo de 3): todos os códons a partir dali são lidos “tortos”. Os aminoácidos seguintes mudam e, em geral, logo aparece um códon de parada fora do lugar. Costuma ser a mais grave.` };
    if (delta !== 0) return { tipo: "emfase", nome: delta > 0 ? "inserção em fase" : "deleção em fase", expl: `Entraram ou saíram ${Math.abs(delta)} bases (múltiplo de 3): o quadro de leitura se mantém e a proteína ganha ou perde ${Math.abs(delta) / 3} aminoácido(s). É o caso da fibrose cística mais comum (ΔF508: perda de uma fenilalanina).` };
    if (t1.prot.length < t0.prot.length && t1.parou && t0.prot.startsWith(t1.prot)) return { tipo: "semsentido", nome: "sem sentido (nonsense)", expl: "Um códon que codificava aminoácido virou códon de <b>parada</b>: a proteína sai truncada, mais curta. Em geral perde a função." };
    let dif = 0;
    for (let i = 0; i < Math.max(t0.prot.length, t1.prot.length); i++) if (t0.prot[i] !== t1.prot[i]) dif++;
    if (t0.prot.length === t1.prot.length && dif === 1) return { tipo: "trocado", nome: "de sentido trocado (missense)", expl: "Um aminoácido foi trocado por outro. O efeito vai de nenhum a grave, conforme o lugar e a química do aminoácido: na anemia falciforme, Glu → Val na 6ª posição da β-globina muda a forma da hemácia." };
    if (t1.prot.length > t0.prot.length && !t0.parou === false) return { tipo: "perdaparada", nome: "perda do códon de parada", expl: "O códon de parada virou códon de aminoácido: a proteína continua sendo alongada além do fim normal." };
    return { tipo: "outra", nome: "mudança na proteína", expl: "A sequência de aminoácidos mudou em mais de um ponto." };
  }
  /** dna({ seq, tipo: "molde"|"codificante"|"rna", quadro: "aug"|0|1|2, mut: { tipo, pos, base, n } }) */
  function dna(o = {}) {
    const tipo = ["molde", "codificante", "rna"].includes(o.tipo) ? o.tipo : "molde";
    const seq = limparSeq(o.seq);
    if (!seq) return { ok: false, erro: "Digite uma sequência de bases (ex.: TACGGTCAAGCTATT)." };
    const ruins = seq.replace(/[ACGTU]/g, "");
    if (ruins) return { ok: false, erro: `Letras que não são bases: ${[...new Set(ruins)].join(", ")}. Use só A, C, G, T (DNA) ou A, C, G, U (RNA).` };
    if (tipo === "rna" && seq.includes("T")) return { ok: false, erro: "RNA não tem timina (T): troque T por U, ou escolha uma das opções de DNA." };
    if (tipo !== "rna" && seq.includes("U")) return { ok: false, erro: "DNA não tem uracila (U). Se a sequência é de RNAm, escolha “RNAm” no tipo." };
    if (seq.length > 600) return { ok: false, erro: "Sequência longa demais para mostrar passo a passo (máximo 600 bases)." };
    const passos = [];
    const rna = paraRNA(seq, tipo);
    const molde = tipo === "molde" ? seq : complementar(rna.replace(/U/g, "T"));
    const codif = rna.replace(/U/g, "T");
    const linhas = `<div class="bio-seq"><div><small>DNA codificante 5'→3'</small><code>${grupos(codif)}</code></div><div><small>DNA molde 3'→5'</small><code>${grupos(molde)}</code></div><div><small>RNAm 5'→3'</small><code>${grupos(rna)}</code></div></div>`;
    if (tipo !== "rna") {
      passos.push(R("Fita complementar (pareamento de bases)", `<p>As duas fitas do DNA se encaixam pelas bases: <b>A com T</b> (2 pontes de hidrogênio) e <b>C com G</b> (3 pontes). As fitas são <b>antiparalelas</b>: uma vai de 5' para 3' e a outra de 3' para 5'.</p>${eqH(`${tipo === "molde" ? "molde 3'" : "5'"} ${grupos(seq)} ${tipo === "molde" ? "5'" : "3'"}`)}${eqH(`${tipo === "molde" ? "5'" : "3'"} ${grupos(complementar(seq))} ${tipo === "molde" ? "3'" : "5'"}`)}<p>Na <b>replicação</b> é isso que acontece: cada fita antiga serve de molde para uma nova (replicação <b>semiconservativa</b>), e a DNA-polimerase só alonga no sentido 5'→3'.</p>`));
    }
    passos.push(R("Transcrição: DNA → RNAm", tipo === "molde"
      ? `<p>A RNA-polimerase lê a fita <b>molde</b> (3'→5') e monta o RNAm complementar (5'→3'). Mesma regra de pareamento, mas o RNA usa <b>U (uracila)</b> no lugar de T: A do molde → U; T → A; C → G; G → C.</p>${eqH(`molde: ${grupos(seq)}`)}${eqH(`RNAm: <b>${grupos(rna)}</b>`)}`
      : tipo === "codificante"
        ? `<p>A fita dada é a <b>codificante</b> (5'→3'): o RNAm tem a <b>mesma sequência</b> dela, só que com U no lugar de T (a RNA-polimerase copiou a outra fita, a molde).</p>${eqH(`RNAm: <b>${grupos(rna)}</b>`)}`
        : `<p>A sequência já é o RNAm (5'→3'). O DNA molde que o originou é complementar a ele (com T no lugar de U):</p>${eqH(`molde 3'→5': ${grupos(molde)}`)}`));
    // quadro de leitura
    const quadro = o.quadro == null || o.quadro === "aug" ? "aug" : Math.max(0, Math.min(2, +o.quadro || 0));
    let ini = quadro === "aug" ? rna.indexOf("AUG") : quadro;
    // AUG precisa estar em qualquer posição (o ribossomo varre a partir do 5')
    const tr = ini >= 0 ? traduzir(rna, ini) : { cods: [], prot: "", parou: false };
    if (quadro === "aug") {
      passos.push(R("Achar o início (quadro de leitura)", ini >= 0
        ? `<p>O ribossomo percorre o RNAm a partir da ponta 5' até o primeiro <b>AUG</b> (códon de início, que também codifica metionina). Ele está na posição <b>${ini + 1}</b>; a partir dali o RNAm é lido de <b>3 em 3 bases</b>, sem pular nem sobrepor.</p>${eqH(grupos(rna, ini))}`
        : `<p>Não há nenhum <b>AUG</b> neste RNAm: sem códon de início, a tradução não começa e nenhuma proteína é produzida. (Se quiser só ler os códons, escolha um quadro fixo: +1, +2 ou +3.)</p>`));
    } else {
      passos.push(R("Quadro de leitura", `<p>Leitura a partir da base ${ini + 1} (quadro +${ini + 1}), de 3 em 3. Mudar o ponto de partida em uma base muda <b>todos</b> os códons: por isso o quadro importa.</p>${eqH(grupos(rna, ini))}`));
    }
    if (tr.cods.length) {
      const tab = `<div class="tab-rolar"><table class="tb bio-trad"><tr><th>#</th><th>Códon</th><th>Anticódon (RNAt)</th><th>Aminoácido</th></tr>${tr.cods.map((x, i) => `<tr${x.a === "*" ? ' class="stop"' : ""}><td>${i + 1}</td><td><b>${x.c}</b></td><td>${x.c.split("").map((b) => ({ A: "U", U: "A", C: "G", G: "C" })[b]).join("")}</td><td>${x.a === "*" ? "<b>parada</b> (nenhum RNAt; fatores de liberação encerram)" : `${AMINO[x.a][1]} <small>(${AMINO[x.a][0]}, ${x.a})</small>`}</td></tr>`).join("")}</table></div>`;
      passos.push(R("Tradução: códon por códon", `<p>Cada códon é reconhecido por um RNA transportador com o <b>anticódon</b> complementar, que traz o aminoácido certo (tabela do código genético). ${tr.parou ? "A leitura termina no códon de <b>parada</b> (UAA, UAG ou UGA), que não codifica aminoácido." : "Não apareceu códon de parada antes do fim da sequência: neste trecho a proteína ficaria incompleta."}</p>${tab}`));
    }
    const prot = tr.prot;
    passos.push(R("A proteína (sequência de aminoácidos)", prot ? `${eqH(`<b>${prot3(prot)}</b>`)}<p>${prot.length} aminoácido${prot.length > 1 ? "s" : ""} (código de 1 letra: ${prot}). ${tr.cods.length} códons lidos = ${tr.cods.length * 3} bases${tr.parou ? ", incluindo o de parada" : ""}.</p>` : `<p>Nenhum aminoácido.</p>`));
    // mutação
    let mut = null;
    if (o.mut && o.mut.tipo && o.mut.tipo !== "nenhuma") {
      const m = aplicarMutacao(seq, o.mut);
      if (!m.ok) passos.push(R("Mutação", `<p class="res-erro">${m.erro}</p>`));
      else {
        const rna1 = paraRNA(m.seq, tipo);
        const ini1 = quadro === "aug" ? rna1.indexOf("AUG") : quadro;
        const tr1 = ini1 >= 0 ? traduzir(rna1, ini1) : { cods: [], prot: "", parou: false };
        const delta = m.seq.length - seq.length;
        const cl = classificarMutacao(tr, tr1, delta);
        mut = { ...cl, seq: m.seq, rna: rna1, prot: tr1.prot, desc: m.desc };
        passos.push(R(`Mutação: ${m.desc}`, `<p>Sequência mutante: </p>${eqH(grupos(m.seq))}${eqH(`RNAm: ${grupos(rna1, ini1 >= 0 ? ini1 : 0)}`)}<p>Proteína original: <b>${prot3(prot)}</b><br>Proteína mutante: <b>${prot3(tr1.prot)}</b>${tr1.parou ? "" : " <small>(sem parada no trecho)</small>"}</p><p class="destaque">Classificação: <b>${cl.nome}</b>. ${cl.expl}</p>`));
      }
    }
    return {
      ok: true, passos, rna, molde, codif, comp: tipo === "rna" ? null : complementar(seq), prot, cods: tr.cods, ini, parou: tr.parou, mut, linhas,
      valor: prot.length,
      resposta: `RNAm ${grupos(rna)} · proteína: ${prot3(prot)}${mut ? ` · mutação ${mut.nome}` : ""}`,
      respostaHTML: `<span class="bio-prot">${prot ? prot.split("").map((a) => `<span>${AMINO[a][0]}</span>`).join("") : "nenhum aminoácido"}</span><small>${prot.length} aminoácido${prot.length === 1 ? "" : "s"}${mut ? ` · mutação: <b>${mut.nome}</b>` : ""}</small>`,
    };
  }

  // ===========================================================================
  // 5. POPULAÇÕES E ENERGIA
  // ===========================================================================
  const Nexp = (N0, r, t) => N0 * Math.exp(r * t);
  const Ndisc = (N0, r, t) => N0 * Math.pow(1 + r, t);
  const Nlog = (N0, r, K, t) => K / (1 + ((K - N0) / N0) * Math.exp(-r * t));
  /** crescimento({ modelo: "exp"|"disc"|"log", N0, r, t, K }) — r por unidade de tempo */
  function crescimento(o = {}) {
    const modelo = ["exp", "disc", "log"].includes(o.modelo) ? o.modelo : "exp";
    const N0 = +o.N0, r = +o.r, t = +o.t, K = +o.K;
    if (!(N0 > 0)) return { ok: false, erro: "N₀ (população inicial) precisa ser maior que zero." };
    if (!isFinite(r) || r <= -1 || (modelo === "log" && r <= 0)) return { ok: false, erro: modelo === "log" ? "No modelo logístico use r > 0." : "Informe a taxa r (ex.: 0,02 para 2% por unidade de tempo)." };
    if (!(t >= 0)) return { ok: false, erro: "Informe o tempo t (≥ 0)." };
    if (modelo === "log" && !(K > 0)) return { ok: false, erro: "Informe a capacidade de suporte K (> 0)." };
    const passos = [];
    let N, td = null;
    if (modelo === "exp") {
      N = Nexp(N0, r, t);
      passos.push(R("Modelo exponencial (contínuo)", `<p>Recursos ilimitados: a população cresce a uma taxa proporcional ao seu tamanho, dN/dt = r·N. A solução é</p>${eqH(`N(t) = N₀ · e<sup>r·t</sup>`)}${eqH(`N(${fmt(t)}) = ${fmt(N0)} · e<sup>${fmt(r)} × ${fmt(t)}</sup> = ${fmt(N0)} · e<sup>${fmt(r * t)}</sup> = ${fmt(N0)} × ${fmt(Math.exp(r * t))} = <b>${fmt(N)}</b>`)}`));
      if (r > 0) { td = Math.LN2 / r; passos.push(R("Tempo de duplicação", `<p>Quando N = 2N₀: e<sup>r·t</sup> = 2 ⇒ r·t = ln 2.</p>${eqH(`t<sub>d</sub> = ${frH("ln 2", "r")} = ${frH("0,6931", fmt(r))} = <b>${fmt(td)}</b>`)}<p>Regra rápida (“regra do 70”): t<sub>d</sub> ≈ 70 / (taxa em %) = 70 / ${fmt(r * 100)} ≈ ${fmt(70 / (r * 100), 3)}. O tempo de duplicação é <b>constante</b>: é a marca registrada do crescimento exponencial.</p>`)); }
    } else if (modelo === "disc") {
      N = Ndisc(N0, r, t);
      passos.push(R("Modelo exponencial (gerações discretas)", `<p>Para populações que se reproduzem em épocas definidas (uma vez por ano, por exemplo), cada período multiplica N por (1 + r), como juros compostos:</p>${eqH(`N(t) = N₀ · (1 + r)<sup>t</sup>`)}${eqH(`N(${fmt(t)}) = ${fmt(N0)} · (1 + ${fmt(r)})<sup>${fmt(t)}</sup> = ${fmt(N0)} × ${fmt(Math.pow(1 + r, t))} = <b>${fmt(N)}</b>`)}`));
      if (r > 0) { td = Math.LN2 / Math.log(1 + r); passos.push(R("Tempo de duplicação", `${eqH(`(1 + r)<sup>t</sup> = 2 ⇒ t<sub>d</sub> = ${frH("ln 2", "ln(1 + r)")} = ${frH("0,6931", fmt(Math.log(1 + r)))} = <b>${fmt(td)}</b>`)}<p>Para r pequeno, ln(1 + r) ≈ r e os dois modelos quase coincidem.</p>`)); }
    } else {
      N = Nlog(N0, r, K, t);
      const Ne = Nexp(N0, r, t);
      const A = (K - N0) / N0;
      passos.push(R("Modelo logístico: o freio da capacidade de suporte", `<p>No mundo real, comida, espaço e predadores limitam o crescimento. O modelo de Verhulst põe um freio que aumenta à medida que N se aproxima de <b>K</b> (capacidade de suporte):</p>${eqH(`${frH("dN", "dt")} = r·N·(1 − ${frH("N", "K")})`)}<p>Com N pequeno, o freio quase não age (crescimento quase exponencial); com N = K, o crescimento para.</p>`));
      passos.push(R("Calcular N(t)", `${eqH(`N(t) = ${frH("K", "1 + A·e<sup>−r·t</sup>")}, &nbsp; A = ${frH("K − N₀", "N₀")} = ${frH(`${fmt(K)} − ${fmt(N0)}`, fmt(N0))} = ${fmt(A)}`)}${eqH(`N(${fmt(t)}) = ${frH(fmt(K), `1 + ${fmt(A)} · e<sup>−${fmt(r * t)}</sup>`)} = ${frH(fmt(K), fmt(1 + A * Math.exp(-r * t)))} = <b>${fmt(N)}</b>`)}<p>Compare: sem limite (exponencial), seriam ${fmt(Ne)}.</p>`));
      passos.push(R("Onde a população cresce mais rápido", `<p>A taxa dN/dt é máxima quando N = K/2 (o ponto de inflexão da curva em S):</p>${eqH(`(dN/dt)<sub>máx</sub> = ${frH("r·K", "4")} = ${frH(`${fmt(r)} × ${fmt(K)}`, "4")} = <b>${fmt((r * K) / 4)}</b> por unidade de tempo`)}<p>É por isso que a pesca sustentável mira manter estoques perto de K/2 (rendimento máximo sustentável).</p>`));
    }
    return {
      ok: true, passos, N, td, modelo, N0, r, t, K,
      valor: N,
      resposta: `N(${fmt(t)}) ≈ ${fmt(N)}${td ? ` · duplica a cada ${fmt(td)}` : ""}`,
      respostaHTML: `N(${fmt(t)}) ≈ <b>${fmt(N)}</b>${td ? `<br><small>tempo de duplicação:</small> <b>${fmt(td)}</b>` : ""}`,
    };
  }
  /** energia({ E0, niveis, efic (%) }) — pirâmide de energia */
  const NIVEIS = ["Produtores", "Consumidores primários", "Consumidores secundários", "Consumidores terciários", "Consumidores quaternários", "Consumidores de 5ª ordem"];
  function energia(o = {}) {
    const E0 = +o.E0, nv = Math.round(+o.niveis || 4), ef = o.efic == null || o.efic === "" ? 10 : +o.efic;
    if (!(E0 > 0)) return { ok: false, erro: "Informe a energia dos produtores (> 0)." };
    if (!(nv >= 2 && nv <= 6)) return { ok: false, erro: "Use de 2 a 6 níveis tróficos." };
    if (!(ef > 0 && ef < 100)) return { ok: false, erro: "A eficiência fica entre 0 e 100% (em média, ~10%)." };
    const un = o.unidade || "kcal/m²·ano";
    const f = ef / 100;
    const lista = NIVEIS.slice(0, nv).map((nome, i) => ({ nome, E: E0 * Math.pow(f, i) }));
    const passos = [];
    passos.push(R(`A regra dos ${fmt(ef)}%`, `<p>De um nível trófico para o seguinte passa, em média, só cerca de <b>${fmt(ef)}%</b> da energia. O resto vai embora: gasto na respiração celular (vira calor), nas fezes, em partes não comidas (raízes, ossos) e nos cadáveres, que vão para os decompositores.</p>${eqH(`E<sub>n</sub> = E<sub>1</sub> × (${fmt(f)})<sup>n − 1</sup>`)}`));
    passos.push(R("Nível por nível", `<div class="tab-rolar"><table class="tb"><tr><th>Nível</th><th>Conta</th><th>Energia (${un})</th></tr>${lista.map((x, i) => `<tr><td>${i + 1}. ${x.nome}</td><td>${i ? `${fmt(lista[i - 1].E)} × ${fmt(f)}` : "dado"}</td><td><b>${fmt(x.E)}</b></td></tr>`).join("")}</table></div>`));
    const ult = lista[nv - 1].E;
    passos.push(R("O que isso explica", `<p>Só <b>${pct(ult / E0)}</b> da energia dos produtores chega ao ${nv}º nível. Por isso as cadeias raramente passam de 4 ou 5 níveis, os grandes predadores são poucos, e uma dieta mais próxima dos produtores alimenta mais gente com a mesma área plantada: para produzir 1 kg de consumidor secundário são necessários, grosso modo, ${fmt(1 / f / f)} kg de produtores.</p>`));
    return {
      ok: true, passos, lista, valor: ult,
      resposta: lista.map((x) => `${x.nome}: ${fmt(x.E)}`).join(" · "),
      respostaHTML: `${NIVEIS[nv - 1]}: <b>${fmt(ult)} ${un}</b><br><small>${pct(ult / E0)} da energia dos produtores</small>`,
    };
  }

  // ===========================================================================
  // EXERCÍCIOS
  // ===========================================================================
  const numEx = (enunciado, valor, passos, texto, extra = {}) => ({ enunciado, resposta: valor, rel: 0.015, unidade: "", passos, texto, ...extra });
  const escolha = (enunciado, certa, erradas, passos, extra = {}) => {
    const ops = embaralhar([certa, ...erradas.filter((x, i, a) => x !== certa && a.indexOf(x) === i)].slice(0, 5));
    // garante a certa entre as opções (o slice poderia cortá-la)
    if (!ops.includes(certa)) ops[0] = certa;
    const o2 = embaralhar(ops);
    return { tipo: "escolha", enunciado, opcoes: o2, resposta: o2.indexOf(certa), passos, texto: certa, ...extra };
  };
  const dicaFr = "<small><br>Responda como fração (ex.: 3/16) ou decimal.</small>";

  // ---- genética
  function exGenetica() {
    const t = sorteia(["mono", "di", "di", "razao", "letal", "incompleta", "tri", "gametas"]);
    if (t === "mono") {
      const [p1, p2] = sorteia([["Aa", "Aa"], ["Aa", "aa"], ["AA", "Aa"]]);
      const alvo = sorteia(["A_", "aa", "Aa"]);
      const r = cruzar(`${p1} x ${p2}`, { alvo });
      if (!r.prob.n) return exGenetica();
      const nome = alvo === "A_" ? "o fenótipo dominante (A_)" : alvo === "aa" ? "o fenótipo recessivo (aa)" : "o genótipo heterozigoto (Aa)";
      return numEx(`Em ervilhas, o alelo A (semente amarela) domina a (verde). No cruzamento <b>${p1} × ${p2}</b>, qual a probabilidade de um descendente ter ${nome}?${dicaFr}`, fV(r.prob), r.passos, fTudo(r.prob));
    }
    if (t === "di") {
      const pares = [["AaBb", "AaBb"], ["AaBb", "aabb"], ["AaBb", "Aabb"], ["AaBB", "aaBb"], ["AaBb", "aaBb"], ["Aabb", "aaBb"]];
      const [p1, p2] = sorteia(pares);
      const alvos = ["A_B_", "aabb", "A_bb", "aaB_", "AaBb", "AABB", "aaBb"];
      for (let k = 0; k < 20; k++) {
        const alvo = sorteia(alvos);
        const r = cruzar(`${p1} x ${p2}`, { alvo });
        if (r.prob && r.prob.n) return numEx(`Genes A e B em cromossomos diferentes, com dominância completa. No cruzamento <b>${p1} × ${p2}</b>, qual a probabilidade de um descendente ser <b>${alvo}</b>?<small><br>O traço _ significa “qualquer alelo” (A_ = AA ou Aa).</small>${dicaFr}`, fV(r.prob), r.passos, fTudo(r.prob));
      }
    }
    if (t === "razao") {
      const casos = [["AaBb", "AaBb", "9 : 3 : 3 : 1"], ["AaBb", "aabb", "1 : 1 : 1 : 1"], ["AaBb", "Aabb", "3 : 3 : 1 : 1"], ["Aa", "Aa", "3 : 1"], ["Aa", "aa", "1 : 1"], ["AaBB", "AaBb", "3 : 1"]];
      const [p1, p2, cert] = sorteia(casos);
      const r = cruzar(`${p1} x ${p2}`);
      const ops = ["9 : 3 : 3 : 1", "1 : 1 : 1 : 1", "3 : 3 : 1 : 1", "3 : 1", "1 : 1", "1 : 2 : 1", "2 : 1", "9 : 7"];
      return escolha(`Com dominância completa e segregação independente, qual a proporção <b>fenotípica</b> esperada na descendência de <b>${p1} × ${p2}</b>?`, r.razF, embaralhar(ops).slice(0, 5), r.passos);
    }
    if (t === "letal") {
      const r = cruzar("Aa x Aa", { letal: "dom", alvo: "Aa" });
      const q = sorteia(["amarelos", "heterozigotos"]);
      return numEx(`Em camundongos, o alelo A (pelagem amarela) é dominante para a cor, mas <b>AA morre</b> ainda no embrião. Cruzando dois amarelos (Aa × Aa), que fração dos filhotes <b>nascidos</b> é ${q === "amarelos" ? "amarela" : "heterozigota"}?${dicaFr}`, fV(r.prob), r.passos, fTudo(r.prob));
    }
    if (t === "incompleta") {
      const nomes = { V: { dom: "vermelha", int: "rosa", rec: "branca" } };
      const [p1, p2, alvo, nm] = sorteia([["Vv", "Vv", "Vv", "rosa"], ["Vv", "Vv", "VV", "vermelha"], ["Vv", "vv", "Vv", "rosa"], ["VV", "vv", "Vv", "rosa"], ["Vv", "VV", "VV", "vermelha"]]);
      const r = cruzar(`${p1} x ${p2}`, { heranca: "incompleta", alvo, nomes });
      return numEx(`Na planta maravilha (<i>Mirabilis jalapa</i>) há dominância incompleta: VV vermelha, Vv rosa, vv branca. Cruzando <b>${p1} × ${p2}</b>, qual a probabilidade de uma planta <b>${nm}</b>?${dicaFr}`, fV(r.prob), r.passos, fTudo(r.prob));
    }
    if (t === "tri") {
      const [alvo] = sorteia([["aabbcc"], ["A_B_C_"], ["AaBbCc"], ["A_bbcc"], ["aaB_C_"]]);
      const r = cruzar("AaBbCc x AaBbCc", { alvo });
      return numEx(`No cruzamento tri-híbrido <b>AaBbCc × AaBbCc</b> (genes independentes, dominância completa), qual a probabilidade de um descendente <b>${alvo}</b>?${dicaFr}`, fV(r.prob), r.passos, fTudo(r.prob));
    }
    // gametas
    const g = sorteia(["AaBbCc", "AaBBCc", "AaBbCcDd", "AABbcc", "AaBbccDd", "AaBb"]);
    const n = gametas(lerGenotipo(g).loci).length;
    const het = lerGenotipo(g).loci.filter((x) => !homo(x.par)).length;
    return numEx(`Quantos tipos diferentes de gametas forma um indivíduo <b>${g}</b> (genes em cromossomos diferentes)?`, n, [
      R("Contar os genes heterozigotos", `<p>Cada gene <b>heterozigoto</b> pode mandar um de dois alelos; um homozigoto manda sempre o mesmo. Em ${g} há <b>${het}</b> gene${het === 1 ? "" : "s"} heterozigoto${het === 1 ? "" : "s"}.</p>`),
      R("Aplicar 2ⁿ", `${eqH(`2<sup>${het}</sup> = <b>${n}</b> tipos de gameta`)}<p>${gametas(lerGenotipo(g).loci).join(", ")}</p>`),
    ], `${n} tipos`, { tol: 0, rel: 0 });
  }

  // ---- probabilidade
  function exProbabilidade() {
    const t = sorteia(["afetado", "condicional", "heredograma", "binomial", "pelomenos", "X", "Xcrianca", "abo", "doacao", "menina"]);
    if (t === "afetado" || t === "menina") {
      const r = autossomico({ p1: "Aa", p2: "Aa" });
      if (t === "afetado") return numEx(`O albinismo é autossômico recessivo. Um casal normal, ambos heterozigotos (Aa), quer ter um filho. Qual a probabilidade de a criança ser albina?${dicaFr}`, fV(r.prob), r.passos, fTudo(r.prob));
      return numEx(`Casal Aa × Aa, característica autossômica recessiva. Qual a probabilidade de o próximo filho ser <b>menina e afetada</b>?${dicaFr}`, fV(r.pMenino), r.passos, fTudo(r.pMenino));
    }
    if (t === "condicional") {
      const r = autossomico({ p1: "Aa", p2: "Aa" });
      return numEx(`João é normal, mas tem um irmão com fibrose cística (autossômica recessiva); os pais são normais. Qual a probabilidade de João ser portador (heterozigoto)?${dicaFr}`, fV(r.pCond), r.passos, fTudo(r.pCond));
    }
    if (t === "heredograma") {
      const parc = sorteia(["aa", "Aa"]);
      const pPort = F(2, 3), pFilho = parc === "aa" ? F(1, 2) : F(1, 4);
      const P = fMul(pPort, pFilho);
      const passos = autossomico({ p1: "Aa", p2: "Aa" }).passos.slice(0, 3);
      passos.push(R("Encadear as probabilidades (regra do “e”)", `<p>Para o filho ser afetado, duas coisas precisam acontecer: a mulher ser portadora <b>e</b> transmitir/receber a combinação aa no cruzamento com o marido ${parc}.</p>${eqH(`P = P(ela é Aa) × P(aa | Aa × ${parc}) = ${frH(2, 3)} × ${fH(pFilho)} = <b>${fH(P)}</b>`)}<p>Se ela fosse AA, a chance seria zero; por isso o 2/3 entra na conta.</p>`));
      return numEx(`Uma mulher normal tem pais normais e um irmão com uma doença autossômica recessiva. Ela se casa com um homem <b>${parc === "aa" ? "afetado (aa)" : "normal, sabidamente heterozigoto (Aa)"}</b>. Qual a probabilidade de o primeiro filho do casal ser afetado?${dicaFr}`, fV(P), passos, fTudo(P));
    }
    if (t === "binomial" || t === "pelomenos") {
      const n = sorteia([2, 3, 4, 5]);
      const k = t === "binomial" ? 1 + Math.floor(Math.random() * Math.min(n, 3)) : 1;
      const r = binomial({ n, k, p: "1/4", modo: t === "binomial" ? "exato" : "pelomenos", evento: "afetado" });
      return numEx(`Casal Aa × Aa (doença autossômica recessiva) planeja ${n} filhos. Qual a probabilidade de ${t === "binomial" ? `<b>exatamente ${k}</b>` : "<b>pelo menos 1</b>"} ser afetado?${dicaFr}`, r.valor, r.passos, fTudo(r.prob));
    }
    if (t === "X" || t === "Xcrianca") {
      const d = sorteia(["daltonismo", "hemofilia"]);
      const L = DOENCAS_X[d].L, l = L.toLowerCase();
      const pai = sorteia([L, l]);
      const r = ligadoX({ mae: L + l, pai, doenca: d });
      if (t === "X") {
        const qual = pai === l ? sorteia(["filha", "filho"]) : "filho";
        const v = qual === "filho" ? r.pFilhoAf : r.pFilhaAf;
        return numEx(`O ${DOENCAS_X[d].nome} é recessivo e ligado ao X. Uma mulher portadora (${xh(L)}${xh(l)}) e um homem ${pai === L ? "normal" : "afetado"} (${xh(pai)}Y) terão ${qual === "filho" ? "um <b>filho homem</b>" : "uma <b>filha</b>"}. Qual a probabilidade de ${qual === "filho" ? "ele" : "ela"} ser afetad${qual === "filho" ? "o" : "a"}?${dicaFr}`, fV(v), r.passos, fTudo(v));
      }
      const v = fMul(F(1, 2), r.pFilhoAf);
      return numEx(`${d === "hemofilia" ? "Hemofilia A" : "Daltonismo"}: recessivo ligado ao X. Mulher portadora × homem ${pai === L ? "normal" : "afetado"}. Qual a probabilidade de a <b>próxima criança</b> ser <b>um menino afetado</b>?${dicaFr}`, fV(v), r.passos, fTudo(v));
    }
    if (t === "abo") {
      const [p1, p2] = sorteia([["IAi", "IBi"], ["IAIB", "ii"], ["IAi", "IAi"], ["IAIB", "IAi"], ["IBi", "ii"], ["IAIB", "IBi"]]);
      const r = abo({ p1, p2 });
      const tipos = ["A", "B", "AB", "O"];
      const alvo = sorteia(tipos.filter((x) => r.pABO[x].n));
      return numEx(`Um casal tem genótipos ${aboH(p1)} e ${aboH(p2)}. Qual a probabilidade de um filho ter sangue <b>tipo ${alvo}</b>?${dicaFr}`, fV(r.pABO[alvo]), r.passos, fTudo(r.pABO[alvo]));
    }
    // doação
    const rec = sorteia(TIPOS.filter((t) => t !== "AB+")); // AB+ recebe de todos: não há "incompatível"
    const pode = TIPOS.filter((d) => podeDoar(d, rec));
    const nao = TIPOS.filter((d) => !podeDoar(d, rec));
    const passos = [R("A regra", `<p>Olhe os antígenos da hemácia do <b>doador</b>: o receptor não pode ter anticorpos contra eles. Tipo A tem anticorpo anti-B; B tem anti-A; O tem anti-A e anti-B; AB não tem nenhum. Quem é Rh⁻ não deve receber Rh⁺.</p>`), R("Aplicar", `<p>Podem doar hemácias para <b>${rec}</b>: ${pode.join(", ")}.</p>${tabelaDoacao([rec])}`)];
    // cada formato precisa de 3 alternativas erradas
    if (pode.length >= 3 && nao.length && Math.random() < 0.5) return escolha(`Qual destes tipos sanguíneos <b>não</b> pode doar hemácias para uma pessoa <b>${rec}</b>?`, sorteia(nao), embaralhar(pode).slice(0, 3), passos);
    if (nao.length >= 3 || pode.length < 3) return escolha(`Uma pessoa <b>${rec}</b> precisa de transfusão de hemácias. Qual destes doadores é compatível?`, sorteia(pode), embaralhar(nao).slice(0, 3), passos);
    return escolha(`Uma pessoa <b>${rec}</b> precisa de transfusão de hemácias. Qual destes doadores é <b>incompatível</b>?`, sorteia(nao), embaralhar(pode).slice(0, 3), passos);
  }

  // ---- Hardy-Weinberg
  function exHardy() {
    const t = sorteia(["q", "p", "port", "nport", "contagem", "qui", "premissa"]);
    const casos = [[1, 10000], [1, 2500], [1, 400], [1, 100], [4, 100], [9, 100], [16, 100], [1, 900], [1, 1600], [25, 100], [36, 100]];
    if (t === "contagem") {
      const AA = sorteia([360, 490, 250, 640, 180, 810]), Aa = sorteia([480, 420, 500, 320, 240, 180]), aa = sorteia([160, 90, 250, 40, 80, 10]);
      const r = hardy({ modo: "contagens", AA, Aa, aa });
      return numEx(`Numa população foram contados <b>${AA} AA, ${Aa} Aa e ${aa} aa</b>. Qual a frequência <b>p</b> do alelo A?<small><br>Responda em decimal (ex.: 0,6).</small>`, r.p, r.passos, fmt(r.p, 4), { rel: 0.01 });
    }
    if (t === "qui") {
      const N = 1000;
      const [AA, Aa, aa] = sorteia([[360, 480, 160], [490, 420, 90], [400, 400, 200], [300, 600, 100], [500, 300, 200], [250, 500, 250], [640, 320, 40], [450, 350, 200]]);
      const r = hardy({ modo: "contagens", AA, Aa, aa });
      const eq = r.chi <= 3.841;
      return escolha(`Numa amostra de ${N} indivíduos: <b>${AA} AA, ${Aa} Aa, ${aa} aa</b>. Pelo teste χ² (1 grau de liberdade, valor crítico 3,84), a população está em equilíbrio de Hardy-Weinberg?`,
        eq ? `Sim: χ² ≈ ${fmt(r.chi, 3)}, menor que 3,84` : `Não: χ² ≈ ${fmt(r.chi, 3)}, maior que 3,84`,
        eq ? [`Não: χ² ≈ ${fmt(r.chi, 3)}, maior que 3,84`, "Não: só há equilíbrio se p = q = 0,5", "Não dá para saber sem a geração seguinte"] : [`Sim: χ² ≈ ${fmt(r.chi, 3)}, menor que 3,84`, "Sim: toda população grande está em equilíbrio", "Não dá para saber sem a geração seguinte"],
        r.passos);
    }
    if (t === "premissa") {
      const certa = sorteia(["Ocorrência de seleção natural sobre o gene", "Cruzamentos preferenciais entre parentes", "Entrada constante de imigrantes", "População muito pequena, sujeita a deriva genética"]);
      return escolha(`Qual destas situações <b>tira</b> uma população do equilíbrio de Hardy-Weinberg?`, certa, ["População muito grande", "Cruzamentos ao acaso (panmixia)", "Ausência de mutações", "Gerações que se sucedem"], [
        R("As premissas", `<p>O equilíbrio vale para uma população <b>grande</b>, com <b>cruzamentos ao acaso</b>, <b>sem seleção</b>, <b>sem mutação</b> e <b>sem migração</b>. Qualquer uma dessas “forças evolutivas” muda as frequências. ${certa} viola uma delas.</p>`),
        R("Por que isso importa", `<p>Hardy-Weinberg é o “estado sem evolução”: quando uma população real foge dele, é sinal de que alguma força evolutiva está agindo.</p>`),
      ]);
    }
    const [a, b] = sorteia(casos);
    const q2 = a / b;
    const N = sorteia([10000, 50000, 100000, 200000, 1000000]);
    const r = hardy({ modo: "q2", valor: q2, N });
    const txt = a === 1 ? `1 em cada ${fmt(b)}` : `${fmt(q2 * 100)}%`;
    if (t === "q") return numEx(`Uma doença autossômica recessiva afeta ${txt} pessoas de uma população em equilíbrio de Hardy-Weinberg. Qual a frequência <b>q</b> do alelo recessivo?<small><br>Responda em decimal.</small>`, r.q, r.passos, fmt(r.q, 4));
    if (t === "p") return numEx(`Numa população em equilíbrio, ${txt} dos indivíduos mostram o fenótipo recessivo (aa). Qual a frequência <b>p</b> do alelo dominante?<small><br>Responda em decimal.</small>`, r.p, r.passos, fmt(r.p, 4));
    if (t === "port") return numEx(`Uma doença autossômica recessiva afeta ${txt} pessoas (população em equilíbrio). Qual a frequência de <b>portadores</b> (heterozigotos), 2pq?<small><br>Responda em decimal.</small>`, r.fAa, r.passos, fmt(r.fAa, 4));
    return numEx(`Uma doença autossômica recessiva afeta ${txt} pessoas. Numa cidade de <b>${fmt(N)}</b> habitantes (em equilíbrio), quantos são <b>portadores</b>?`, r.nPort, r.passos, `≈ ${fmt(r.nPort, 4)} pessoas`, { rel: 0.02, unidade: "pessoas" });
  }

  // ---- DNA
  const AA_COD = {}; for (const c in CODIGO) (AA_COD[CODIGO[c]] ||= []).push(c);
  function seqAleatoria(nAA) { // RNAm: AUG + n−1 códons + parada
    let s = "AUG";
    const aas = Object.keys(AA_COD).filter((a) => a !== "*");
    for (let i = 1; i < nAA; i++) s += sorteia(AA_COD[sorteia(aas)]);
    return s + sorteia(AA_COD["*"]);
  }
  const rnaParaMolde = (rna) => rna.split("").map((b) => ({ A: "T", U: "A", C: "G", G: "C" })[b]).join("");
  function exDNA() {
    const t = sorteia(["transc", "comp", "naa", "trad", "mut", "mut", "chargaff", "nucleo"]);
    if (t === "transc" || t === "comp") {
      const rna = seqAleatoria(3).slice(0, 12);
      const molde = rnaParaMolde(rna);
      if (t === "transc") {
        const r = dna({ seq: molde, tipo: "molde" });
        const cod = molde.replace(/[ACGT]/g, (b) => ({ A: "T", T: "A", C: "G", G: "C" })[b]);
        const ops = [grupos(rna), grupos(cod), grupos(molde.replace(/T/g, "U")), grupos(rna.split("").reverse().join("")), grupos(rna.replace(/U/g, "T"))];
        return escolha(`A fita molde de um trecho de DNA (lida 3'→5') é <b>${grupos(molde)}</b>. Qual o RNAm transcrito (5'→3')?`, ops[0], ops.slice(1), r.passos.slice(0, 2));
      }
      const r = dna({ seq: molde, tipo: "molde" });
      const comp = complementar(molde);
      const ops = [grupos(comp), grupos(comp.replace(/T/g, "U")), grupos(molde.split("").reverse().join("")), grupos(molde.replace(/[AG]/g, (b) => (b === "A" ? "G" : "A")))];
      return escolha(`Qual a fita complementar de DNA para <b>${grupos(molde)}</b>?`, ops[0], ops.slice(1), r.passos.slice(0, 1));
    }
    if (t === "naa") {
      const n = 3 + Math.floor(Math.random() * 4);
      const extra = sorteia(["", "GC", "CCA", "U"]);
      const rna = extra + seqAleatoria(n) + sorteia(["", "GA", "CU"]);
      if (rna.indexOf("AUG") !== extra.length) return exDNA();
      const r = dna({ seq: rna, tipo: "rna" });
      if (r.prot.length !== n) return exDNA();
      return numEx(`Quantos aminoácidos terá o peptídeo traduzido do RNAm <b>${rna}</b>? (A tradução começa no primeiro AUG.)`, n, r.passos, `${n} aminoácidos`, { tol: 0, rel: 0 });
    }
    if (t === "trad") {
      const rna = seqAleatoria(4);
      const r = dna({ seq: rna, tipo: "rna" });
      const certo = prot3(r.prot);
      const err1 = prot3(dna({ seq: rnaParaMolde(rna).replace(/T/g, "U"), tipo: "rna", quadro: 0 }).prot || "MS");
      const errs = [err1, prot3(r.prot.split("").reverse().join("")), prot3(r.prot.slice(0, 3) + "W"), prot3("M" + r.prot.slice(2) + "K")].filter((x) => x !== certo);
      return escolha(`Traduza o RNAm <b>${grupos(rna)}</b> (use a tabela do código genético).`, certo, errs, r.passos);
    }
    if (t === "mut") {
      for (let k = 0; k < 40; k++) {
        const rna = seqAleatoria(5);
        const molde = rnaParaMolde(rna);
        const tipoM = sorteia(["sub", "sub", "ins", "del"]);
        const pos = 4 + Math.floor(Math.random() * (molde.length - 7));
        const base = sorteia("ACGT".split("").filter((b) => b !== molde[pos - 1]));
        const r = dna({ seq: molde, tipo: "molde", mut: { tipo: tipoM, pos, base } });
        if (!r.mut) continue;
        const nomes = ["silenciosa", "de sentido trocado (missense)", "sem sentido (nonsense)", "deslocamento do quadro de leitura"];
        if (!nomes.includes(r.mut.nome)) continue;
        return escolha(`Fita molde de DNA: <b>${grupos(molde)}</b>. Ocorre ${r.mut.desc}. Que tipo de mutação é essa, pelo efeito na proteína?`, r.mut.nome, nomes.filter((x) => x !== r.mut.nome).concat(["inserção em fase"]), r.passos);
      }
      return exDNA();
    }
    if (t === "chargaff") {
      const base = sorteia(["A", "T", "C", "G"]);
      const v = sorteia([15, 18, 20, 22, 26, 28, 30, 32, 35]);
      const alvo = sorteia(["mesma", "outra"]);
      const par = COMP_DNA[base];
      const outras = "ACGT".split("").filter((b) => b !== base && b !== par);
      const qual = alvo === "mesma" ? par : sorteia(outras);
      const resp = alvo === "mesma" ? v : 50 - v;
      return numEx(`Num DNA de fita dupla, <b>${v}%</b> das bases são ${base}. Qual a porcentagem de <b>${qual}</b>?`, resp, [
        R("Regra de Chargaff", `<p>Na dupla-hélice, cada A pareia com um T e cada C com um G. Por isso <b>%A = %T</b> e <b>%C = %G</b>, e A + T + C + G = 100%.</p>`),
        R("Aplicar", `${eqH(`%${base} = %${par} = ${v}% &nbsp;⇒&nbsp; os outros dois somam 100 − 2 × ${v} = ${100 - 2 * v}%, ${50 - v}% cada`)}${eqH(`%${qual} = <b>${resp}%</b>`)}`),
      ], `${resp}%`, { unidade: "%", tol: 0.01, rel: 0 });
    }
    // nucleotídeos
    const n = sorteia([50, 100, 120, 146, 200, 300]);
    const resp = 3 * (n + 1);
    return numEx(`Uma proteína tem <b>${n} aminoácidos</b>. Qual o número mínimo de nucleotídeos da região codificante do RNAm, <b>incluindo o códon de parada</b>?`, resp, [
      R("Um códon por aminoácido", `<p>Cada aminoácido corresponde a um códon de <b>3 nucleotídeos</b>; o códon de parada não traz aminoácido, mas também ocupa 3 nucleotídeos.</p>`),
      R("Contar", `${eqH(`(${n} + 1) × 3 = <b>${resp}</b> nucleotídeos`)}<p>O “mínimo” é porque o RNAm real tem ainda regiões não traduzidas nas pontas (5' UTR e 3' UTR), e nos eucariotos o gene no DNA tem íntrons, que são retirados no processamento.</p>`),
    ], `${resp} nucleotídeos`, { tol: 0, rel: 0 });
  }

  // ---- Populações
  function exPopulacoes() {
    const t = sorteia(["exp", "dup", "disc", "log", "max", "energia", "biomassa"]);
    if (t === "exp") {
      const N0 = sorteia([100, 200, 500, 1000]), r = sorteia([0.05, 0.1, 0.2, 0.3, 0.5]), tt = sorteia([5, 10, 12, 20]);
      const R0 = crescimento({ modelo: "exp", N0, r, t: tt });
      return numEx(`Uma população de bactérias com <b>${N0}</b> células cresce exponencialmente com r = <b>${fmt(r)} por hora</b> (N = N₀·e<sup>rt</sup>). Quantas células haverá após <b>${tt} h</b>?`, R0.N, R0.passos, `≈ ${fmt(R0.N)} células`, { rel: 0.02, unidade: "células" });
    }
    if (t === "dup") {
      const r = sorteia([0.01, 0.02, 0.035, 0.05, 0.07, 0.1]);
      const R0 = crescimento({ modelo: "exp", N0: 1000, r, t: 1 });
      return numEx(`Uma população cresce exponencialmente a <b>${fmt(r * 100)}% ao ano</b> (r = ${fmt(r)} por ano, modelo contínuo). Qual o tempo de duplicação, em anos?`, R0.td, R0.passos, `≈ ${fmt(R0.td, 3)} anos`, { rel: 0.02, unidade: "anos" });
    }
    if (t === "disc") {
      const N0 = sorteia([50, 80, 200, 400]), r = sorteia([0.2, 0.25, 0.5, 1]), tt = sorteia([2, 3, 4, 5]);
      const R0 = crescimento({ modelo: "disc", N0, r, t: tt });
      return numEx(`Uma população de ${N0} aves aumenta <b>${fmt(r * 100)}% a cada ano</b> (reprodução uma vez por ano). Quantas aves haverá após <b>${tt} anos</b>? Use N = N₀·(1 + r)<sup>t</sup>.`, R0.N, R0.passos, `≈ ${fmt(R0.N)} aves`, { rel: 0.02, unidade: "aves" });
    }
    if (t === "log") {
      const K = sorteia([500, 1000, 2000, 5000]), N0 = K / sorteia([10, 20, 50]), r = sorteia([0.2, 0.3, 0.5]), tt = sorteia([5, 10, 15]);
      const R0 = crescimento({ modelo: "log", N0, r, t: tt, K });
      return numEx(`Uma população segue o modelo logístico com N₀ = ${fmt(N0)}, r = ${fmt(r)} por mês e capacidade de suporte K = ${fmt(K)}. Qual o tamanho após <b>${tt} meses</b>?`, R0.N, R0.passos, `≈ ${fmt(R0.N)} indivíduos`, { rel: 0.02, unidade: "indivíduos" });
    }
    if (t === "max") {
      const K = sorteia([400, 800, 1200, 2000, 10000]), r = sorteia([0.1, 0.2, 0.4, 0.5]);
      const R0 = crescimento({ modelo: "log", N0: K / 10, r, t: 1, K });
      if (Math.random() < 0.5) return escolha(`No modelo logístico com K = ${fmt(K)}, em que tamanho de população o crescimento (dN/dt) é <b>mais rápido</b>?`, `N = ${fmt(K / 2)} (K/2)`, [`N = ${fmt(K)} (K)`, `N próximo de zero`, `N = ${fmt(K / 4)} (K/4)`, `N = ${fmt((3 * K) / 4)} (3K/4)`], R0.passos);
      return numEx(`Modelo logístico com r = ${fmt(r)} por ano e K = ${fmt(K)}. Qual a <b>taxa máxima</b> de crescimento, dN/dt, em indivíduos por ano?`, (r * K) / 4, R0.passos, `${fmt((r * K) / 4)} indivíduos/ano`, { unidade: "ind./ano" });
    }
    if (t === "energia") {
      const E0 = sorteia([10000, 20000, 50000, 100000]), nv = sorteia([3, 4]);
      const R0 = energia({ E0, niveis: nv, efic: 10 });
      return numEx(`Os produtores de um ecossistema fixam <b>${fmt(E0)} kcal/m²·ano</b>. Pela regra dos 10%, quanta energia chega aos <b>${NIVEIS[nv - 1].toLowerCase()}</b> (${nv}º nível trófico)?`, R0.valor, R0.passos, `${fmt(R0.valor)} kcal/m²·ano`, { unidade: "kcal/m²·ano" });
    }
    const kg = sorteia([1, 2, 5, 10]), niv = sorteia([2, 3]);
    const resp = kg * Math.pow(10, niv);
    return numEx(`Pela regra dos 10%, quantos kg de capim são necessários, em média, para produzir <b>${kg} kg</b> de ${niv === 2 ? "um consumidor secundário (ex.: onça que come veado)" : "um consumidor terciário"}?`, resp, [
      R("Subir a cadeia ao contrário", `<p>Cada nível retém ~10% do anterior; então, para ter X kg num nível, o nível de baixo precisa de ~10·X kg.</p>`),
      R("Contar os degraus", `<p>Do capim (produtor, nível 1) até o ${niv === 2 ? "consumidor secundário (nível 3)" : "consumidor terciário (nível 4)"} são ${niv} passagens:</p>${eqH(`${kg} × 10<sup>${niv}</sup> = <b>${fmt(resp)} kg</b> de capim`)}`),
    ], `${fmt(resp)} kg`, { unidade: "kg" });
  }

  function gerarExercicio(tipo) {
    const G = { genetica: exGenetica, probabilidade: exProbabilidade, hardy: exHardy, dna: exDNA, populacoes: exPopulacoes };
    return (G[tipo] || exGenetica)();
  }

  const API = {
    fmt, pct, lerNumero, conferir, F, fT, fH, fV, lerFracao, combin,
    HERANCAS, lerCruzamento, lerGenotipo, gametas, cruzar, CORES,
    autossomico, binomial, ligadoX, abo, tabelaDoacao, podeDoar, TIPOS, ABO_GEN, aboH,
    hardy,
    CODIGO, AMINO, traduzir, transcrever, complementar, limparSeq, dna, tabelaCodigo, aplicarMutacao, prot3, grupos,
    crescimento, energia, Nexp, Ndisc, Nlog, NIVEIS,
    gerarExercicio,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else raiz.BCalc = API;
})(typeof window !== "undefined" ? window : globalThis);
