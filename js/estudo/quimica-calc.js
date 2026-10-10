/*
 * Motor de química do modo Estudo.
 * Tudo é determinístico: cada resposta vem acompanhada do passo a passo e pode ser conferida.
 * Funções puras (testáveis em Node). Textos em português.
 */
(function (raiz) {
  "use strict";

  // ---------------------------------------------------------------------------
  // Formatação
  // ---------------------------------------------------------------------------
  const SUBS = { "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9" };
  const SUPS = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁻": "-", "⁺": "+" };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  const config = { escolar: false };
  const ESCOLAR = {
    H: 1, He: 4, Li: 7, Be: 9, B: 11, C: 12, N: 14, O: 16, F: 19, Ne: 20, Na: 23, Mg: 24, Al: 27, Si: 28, P: 31, S: 32, Cl: 35.5,
    Ar: 40, K: 39, Ca: 40, Ti: 48, Cr: 52, Mn: 55, Fe: 56, Co: 59, Ni: 59, Cu: 63.5, Zn: 65, Br: 80, Rb: 85.5, Sr: 88, Ag: 108,
    Sn: 119, I: 127, Cs: 133, Ba: 137, Pt: 195, Au: 197, Hg: 201, Pb: 207, U: 238,
  };

  // número com algarismos significativos, no padrão brasileiro
  function num(v, sig = 4) {
    if (v === 0) return "0";
    if (!isFinite(v)) return "—";
    const a = Math.abs(v);
    if (a >= 1e6 || a < 1e-3) return sci(v, Math.max(sig - 1, 1));
    const e = Math.floor(Math.log10(a));
    const casas = Math.max(0, sig - 1 - e);
    let s = v.toFixed(Math.min(casas, 12));
    if (s.includes(".")) s = s.replace(/0+$/, "").replace(/\.$/, "");
    const [i, d] = s.split(".");
    const ii = i.replace(/\B(?=(\d{3})+(?!\d))/g, a >= 10000 ? " " : "");
    return d ? `${ii},${d}` : ii;
  }
  function sci(v, casas = 2) {
    if (v === 0) return "0";
    const e = Math.floor(Math.log10(Math.abs(v)));
    const m = v / Math.pow(10, e);
    let ms = m.toFixed(casas).replace(/0+$/, "").replace(/\.$/, "").replace(".", ",");
    return `${ms}×10<sup>${String(e).replace("-", "−")}</sup>`;
  }
  // fórmula química com subscritos
  function fq(f) {
    return esc(f)
      .replace(/([A-Za-z\)\]])(\d+)/g, "$1<sub>$2</sub>")
      .replace(/\^(\d*[+-])/g, "<sup>$1</sup>")
      .replace(/-(?=<\/sup>)/g, "−");
  }
  const frac = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
  const un = (u) => `<span class="un">${u}</span>`;
  const eq = (h) => `<div class="eq">${h}</div>`;
  const R = (t, h) => ({ t, h });
  const item = (nome, h) => `<div class="item"><span class="item-n">${nome}</span>${h}</div>`;

  // interpreta números digitados: 1,5  1.5  1e-3  1,5x10^-3  1,5×10⁻³  1/3
  function lerNumero(s) {
    if (typeof s === "number") return s;
    if (s == null) return NaN;
    let t = String(s).trim().replace(/\s+/g, "");
    if (!t) return NaN;
    t = t.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]/g, (c) => SUPS[c]).replace(/−/g, "-");
    t = t.replace(/(\d)\s*[x×*]\s*10\^?\(?([+-]?\d+)\)?/i, "$1e$2");
    t = t.replace(",", ".");
    if (/^[+-]?\d*\.?\d+\/\d*\.?\d+$/.test(t)) { const [a, b] = t.split("/"); return +a / +b; }
    if (!/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(t)) return NaN;
    return parseFloat(t);
  }

  // ---------------------------------------------------------------------------
  // Elementos
  // ---------------------------------------------------------------------------
  let mapaEl = null;
  function elementos() {
    if (mapaEl) return mapaEl;
    mapaEl = {};
    for (const d of raiz.DADOS || []) {
      mapaEl[d.s] = { n: d.n, s: d.s, m: d.m, nome: raiz.DESCRICOES && raiz.DESCRICOES[d.n] ? raiz.DESCRICOES[d.n][0] : d.s, d };
    }
    return mapaEl;
  }
  function massaAtomica(s) {
    const e = elementos()[s];
    if (!e) return NaN;
    if (config.escolar) return ESCOLAR[s] != null ? ESCOLAR[s] : Math.round(e.m * 10) / 10;
    return e.m;
  }

  // ---------------------------------------------------------------------------
  // Fórmulas químicas
  // ---------------------------------------------------------------------------
  function normalizar(s) {
    return String(s).replace(/[₀-₉]/g, (c) => SUBS[c]).replace(/\s+/g, "").replace(/[–—−]/g, "-");
  }

  // devolve { ok, contagem, ordem, partes } ou { ok:false, erro }
  function parseFormula(entrada) {
    let s = normalizar(entrada || "");
    if (!s) return { ok: false, erro: "Digite uma fórmula, por exemplo H2O ou Ca(OH)2." };
    s = s.replace(/\^\d*[+-]$/, ""); // ignora carga no final
    const partesTxt = s.split(/[·.*]/).filter((x) => x.length);
    const total = {};
    const ordem = [];
    const partes = [];
    const els = elementos();
    for (let k = 0; k < partesTxt.length; k++) {
      let p = partesTxt[k];
      let coef = 1;
      if (k > 0) { const m = p.match(/^(\d+)/); if (m) { coef = +m[1]; p = p.slice(m[1].length); } }
      let i = 0;
      const erro = (msg) => ({ ok: false, erro: msg });
      function lerNum() { let j = i; while (j < p.length && /\d/.test(p[j])) j++; const v = j > i ? +p.slice(i, j) : 1; i = j; return v; }
      function grupo(fecha) {
        const c = {};
        const add = (sym, n) => { c[sym] = (c[sym] || 0) + n; };
        while (i < p.length) {
          const ch = p[i];
          if (ch === ")" || ch === "]") { if (fecha && ((fecha === ")" && ch === ")") || (fecha === "]" && ch === "]"))) return c; throw new Error("Parêntese fechando sem abrir."); }
          if (ch === "(" || ch === "[") {
            const f = ch === "(" ? ")" : "]";
            i++;
            const sub = grupo(f);
            if (p[i] !== f) throw new Error("Falta fechar um parêntese.");
            i++;
            const mult = lerNum();
            for (const kk in sub) add(kk, sub[kk] * mult);
          } else if (/[A-Z]/.test(ch)) {
            let sym = ch; i++;
            while (i < p.length && /[a-z]/.test(p[i]) && sym.length < 3) { if (els[sym + p[i]] || !els[sym]) { sym += p[i]; i++; } else break; }
            if (!els[sym]) { // tenta só a primeira letra
              throw new Error(`"${sym}" não é um símbolo de elemento. Lembre: só a primeira letra é maiúscula (Co é cobalto, CO é monóxido de carbono).`);
            }
            add(sym, lerNum());
          } else if (/[a-z]/.test(ch)) {
            throw new Error(`Encontrei "${ch}" minúsculo no começo de um símbolo. Escreva com maiúscula: os símbolos começam com letra maiúscula (por exemplo Na, Cl).`);
          } else if (/\d/.test(ch)) {
            throw new Error(`Número "${ch}" fora de lugar. O número vem depois do símbolo (H2O), não antes.`);
          } else {
            throw new Error(`Caractere "${ch}" não é permitido numa fórmula.`);
          }
        }
        if (fecha) throw new Error("Falta fechar um parêntese.");
        return c;
      }
      let c;
      try { c = grupo(null); } catch (e) { return erro(e.message); }
      const cont = {};
      for (const sym in c) { cont[sym] = c[sym] * coef; if (!(sym in total)) ordem.push(sym); total[sym] = (total[sym] || 0) + c[sym] * coef; }
      partes.push({ coef, texto: p, contagem: c });
    }
    if (!ordem.length) return { ok: false, erro: "Não encontrei nenhum elemento nessa fórmula." };
    return { ok: true, texto: s, contagem: total, ordem, partes };
  }

  function massaMolar(f) {
    const linhas = f.ordem.map((s) => {
      const e = elementos()[s];
      const m = massaAtomica(s);
      return { s, nome: e.nome, n: f.contagem[s], m, sub: m * f.contagem[s] };
    });
    return { linhas, total: linhas.reduce((a, l) => a + l.sub, 0) };
  }

  function passosMassaMolar(entrada) {
    const f = parseFormula(entrada);
    if (!f.ok) return { ok: false, erro: f.erro };
    const mm = massaMolar(f);
    const passos = [];
    const lista = mm.linhas.map((l) => `<b>${l.n}</b> átomo${l.n > 1 ? "s" : ""} de <b>${l.s}</b> <small>(${l.nome})</small>`).join(", ");
    let txt = `Em <b>${fq(f.texto)}</b> há: ${lista}.`;
    if (f.partes.length > 1) txt += `<br><small>A fórmula tem água de cristalização: o ponto separa as partes e o número depois dele multiplica a parte seguinte.</small>`;
    else if (/[()]/.test(f.texto)) txt += `<br><small>O número depois do parêntese multiplica tudo o que está dentro dele.</small>`;
    passos.push(R("Conte os átomos de cada elemento", txt));
    const linhasTab = mm.linhas
      .map((l) => `<tr><td><b>${l.s}</b> <small>${l.nome}</small></td><td>${l.n} × ${num(l.m, 5)}</td><td><b>${num(l.sub, 5)}</b></td></tr>`)
      .join("");
    passos.push(R("Procure a massa atômica de cada um", `<p>Quantidade de átomos × massa atômica (em u) de cada elemento:</p><div class="tab-rolar"><table class="tb"><thead><tr><th>Elemento</th><th>Conta</th><th>Subtotal</th></tr></thead><tbody>${linhasTab}</tbody></table></div><small class="dica">${config.escolar ? "Usando massas arredondadas (como nos livros)." : "Massas atômicas médias da tabela periódica."}</small>`));
    passos.push(R("Some tudo", eq(mm.linhas.map((l) => num(l.sub, 5)).join(" + ") + ` = <b>${num(mm.total, 5)}</b>`) + `<p>Massa molar: <b>M = ${num(mm.total, 5)} ${un("g/mol")}</b></p>`));
    const pc = mm.linhas
      .map((l) => `<tr><td><b>${l.s}</b></td><td>${frac(num(l.sub, 4), num(mm.total, 4))} × 100</td><td><b>${num((l.sub / mm.total) * 100, 4)}%</b></td></tr>`)
      .join("");
    passos.push(R("Extra: composição percentual", `<p>Quanto cada elemento representa da massa total:</p><div class="tab-rolar"><table class="tb"><tbody>${pc}</tbody></table></div>`));
    return { ok: true, valor: mm.total, formula: f, mm, passos, resposta: `M(${fq(f.texto)}) = ${num(mm.total, 5)} g/mol` };
  }

  // ---------------------------------------------------------------------------
  // Mol
  // ---------------------------------------------------------------------------
  const NA = 6.02214076e23;
  const VM_CNTP = 22.414;
  function passosMol(entrada, tipo, valor) {
    const f = parseFormula(entrada);
    if (!f.ok) return { ok: false, erro: f.erro };
    if (!(valor >= 0) || !isFinite(valor)) return { ok: false, erro: "Digite um valor numérico válido (pode usar vírgula ou notação como 3e23)." };
    const M = massaMolar(f).total;
    const passos = [R("Massa molar", `<p>Primeiro calculamos a massa molar de <b>${fq(f.texto)}</b>:</p>${eq(massaMolar(f).linhas.map((l) => `${l.n}×${num(l.m, 5)}`).join(" + ") + ` = <b>${num(M, 5)}</b> ${un("g/mol")}`)}`)];
    let n;
    if (tipo === "massa") {
      n = valor / M;
      passos.push(R("Massa → mol", `<p>Mol é massa dividida pela massa molar:</p>${eq(`n = ${frac("m", "M")} = ${frac(num(valor) + " g", num(M, 5) + " g/mol")} = <b>${num(n)} mol</b>`)}`));
    } else if (tipo === "mol") {
      n = valor;
      passos.push(R("Quantidade em mol", `<p>Você já informou a quantidade de matéria: <b>n = ${num(n)} mol</b>.</p>`));
    } else if (tipo === "particulas") {
      n = valor / NA;
      passos.push(R("Partículas → mol", `<p>Um mol tem ${sci(NA, 3)} partículas (constante de Avogadro). Então:</p>${eq(`n = ${frac("N", "N<sub>A</sub>")} = ${frac(num(valor), sci(NA, 3))} = <b>${num(n)} mol</b>`)}`));
    } else if (tipo === "volume") {
      n = valor / VM_CNTP;
      passos.push(R("Volume de gás → mol", `<p>Nas CNTP (0 °C e 1 atm) um mol de gás ideal ocupa ${num(VM_CNTP, 5)} L:</p>${eq(`n = ${frac("V", "V<sub>m</sub>")} = ${frac(num(valor) + " L", num(VM_CNTP, 5) + " L/mol")} = <b>${num(n)} mol</b>`)}`));
    } else return { ok: false, erro: "Tipo de conversão desconhecido." };
    const massa = n * M, part = n * NA, vol = n * VM_CNTP;
    passos.push(R("Do mol para tudo o resto", `<div class="tab-rolar"><table class="tb"><tbody>
      <tr><td>Massa</td><td>${eq(`m = n × M = ${num(n)} × ${num(M, 5)}`)}</td><td><b>${num(massa)} g</b></td></tr>
      <tr><td>Partículas</td><td>${eq(`N = n × N<sub>A</sub> = ${num(n)} × ${sci(NA, 3)}`)}</td><td><b>${sci(part, 3)}</b></td></tr>
      <tr><td>Volume (CNTP)</td><td>${eq(`V = n × V<sub>m</sub> = ${num(n)} × ${num(VM_CNTP, 5)}`)}</td><td><b>${num(vol)} L</b></td></tr>
      </tbody></table></div><small class="dica">O volume só vale para gases, nas CNTP.</small>`));
    return { ok: true, n, massa, part, vol, M, passos, resposta: `n = ${num(n)} mol` };
  }

  // ---------------------------------------------------------------------------
  // Balanceamento (álgebra com frações exatas)
  // ---------------------------------------------------------------------------
  const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
  const fr = (n, d = 1n) => { if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d) || 1n; return { n: n / g, d: d / g }; };
  const fSub = (a, b) => fr(a.n * b.d - b.n * a.d, a.d * b.d);
  const fMul = (a, b) => fr(a.n * b.n, a.d * b.d);
  const fDiv = (a, b) => fr(a.n * b.d, a.d * b.n);
  const fZero = (a) => a.n === 0n;

  function lerEquacao(txt) {
    let s = String(txt || "").replace(/[₀-₉]/g, (c) => SUBS[c]).trim();
    if (!s) return { ok: false, erro: "Digite uma equação, por exemplo H2 + O2 -> H2O." };
    const lados = s.split(/->|→|⟶|=>|<=>|⇌|=|⇒/);
    if (lados.length !== 2 || !lados[0].trim() || !lados[1].trim()) return { ok: false, erro: "Separe reagentes e produtos com uma seta (-> ou =). Exemplo: H2 + O2 -> H2O." };
    const quebra = (l) => l.split(/\s\+\s|\+(?=[A-Z(\[\d])/).map((x) => x.trim()).filter(Boolean);
    const lerLado = (l) => quebra(l).map((x) => x.replace(/^\d+\s*(?=[A-Z(\[])/, "").trim());
    const reag = lerLado(lados[0]), prod = lerLado(lados[1]);
    const todos = [];
    for (const f of [...reag, ...prod]) {
      const p = parseFormula(f);
      if (!p.ok) return { ok: false, erro: `Em "${f}": ${p.erro}` };
      todos.push(p);
    }
    return { ok: true, reag: reag.map((f, i) => ({ f, p: todos[i] })), prod: prod.map((f, i) => ({ f, p: todos[reag.length + i] })) };
  }

  function balancear(txt) {
    const eqn = lerEquacao(txt);
    if (!eqn.ok) return eqn;
    const especies = [...eqn.reag.map((x) => ({ ...x, lado: 1 })), ...eqn.prod.map((x) => ({ ...x, lado: -1 }))];
    const elems = [];
    for (const e of especies) for (const s of e.p.ordem) if (!elems.includes(s)) elems.push(s);
    const cols = especies.length;
    // elementos que aparecem só de um lado: impossível
    for (const s of elems) {
      const em = (lado) => especies.some((e) => e.lado === lado && e.p.contagem[s]);
      if (!em(1) || !em(-1)) return { ok: false, erro: `O elemento ${s} aparece só de um lado da equação. Os átomos não somem nem surgem: confira se algum reagente ou produto está faltando.` };
    }
    const M = elems.map((s) => especies.map((e) => fr(BigInt((e.p.contagem[s] || 0) * e.lado))));
    // escalonamento
    const piv = [];
    let lin = 0;
    const A = M.map((r) => r.slice());
    for (let c = 0; c < cols && lin < A.length; c++) {
      let k = -1;
      for (let i = lin; i < A.length; i++) if (!fZero(A[i][c])) { k = i; break; }
      if (k < 0) continue;
      [A[lin], A[k]] = [A[k], A[lin]];
      const p = A[lin][c];
      A[lin] = A[lin].map((x) => fDiv(x, p));
      for (let i = 0; i < A.length; i++) if (i !== lin && !fZero(A[i][c])) { const f = A[i][c]; A[i] = A[i].map((x, j) => fSub(x, fMul(f, A[lin][j]))); }
      piv.push(c); lin++;
    }
    const livres = [];
    for (let c = 0; c < cols; c++) if (!piv.includes(c)) livres.push(c);
    if (livres.length === 0) return { ok: false, erro: "Não existe um jeito de balancear essa equação com esses reagentes e produtos. Confira se as fórmulas estão certas." };
    if (livres.length > 1) return { ok: false, erro: "Essa equação pode ser balanceada de várias maneiras diferentes: provavelmente ela mistura mais de uma reação. Separe em reações menores." };
    const f = livres[0];
    const x = Array.from({ length: cols }, () => fr(0n));
    x[f] = fr(1n);
    piv.forEach((c, i) => { x[c] = fr(-A[i][f].n, A[i][f].d); });
    let l = 1n;
    for (const v of x) l = (l * v.d) / gcd(l, v.d);
    let ints = x.map((v) => (v.n * l) / v.d);
    let g = 0n;
    for (const v of ints) g = gcd(g, v);
    ints = ints.map((v) => v / g);
    if (ints.every((v) => v < 0n)) ints = ints.map((v) => -v);
    if (ints.some((v) => v <= 0n)) return { ok: false, erro: "Não consegui encontrar coeficientes positivos. Confira se os reagentes e produtos estão certos." };
    const coef = ints.map(Number);
    return { ok: true, especies, elems, coef, nReag: eqn.reag.length, matriz: M };
  }

  const LETRAS = "abcdefghijklmnopqrstuvwxyz";
  function textoEquacao(b, coef = b.coef, html = true) {
    const parte = (i) => `${coef[i] > 1 ? coef[i] + " " : ""}${html ? fq(b.especies[i].f) : b.especies[i].f}`;
    const r = [], p = [];
    for (let i = 0; i < b.especies.length; i++) (i < b.nReag ? r : p).push(parte(i));
    return `${r.join(" + ")} ${html ? "→" : "->"} ${p.join(" + ")}`;
  }

  function passosBalanceamento(txt) {
    const b = balancear(txt);
    if (!b.ok) return b;
    const passos = [];
    const sp = b.especies;
    passos.push(R("Identifique as substâncias", `<p>Reagentes e produtos, cada um com uma letra que vai representar o coeficiente (o número na frente):</p>${eq(sp.map((e, i) => `<b>${LETRAS[i]}</b> ${fq(e.f)}`).join(" &nbsp; "))}`));
    const linhas = b.elems.map((s, r) => {
      const esq = sp.map((e, i) => ({ e, i })).filter(({ e }) => e.lado === 1 && e.p.contagem[s]).map(({ e, i }) => `${e.p.contagem[s] > 1 ? e.p.contagem[s] : ""}${LETRAS[i]}`).join(" + ");
      const dir = sp.map((e, i) => ({ e, i })).filter(({ e }) => e.lado === -1 && e.p.contagem[s]).map(({ e, i }) => `${e.p.contagem[s] > 1 ? e.p.contagem[s] : ""}${LETRAS[i]}`).join(" + ");
      return `<tr><td><b>${s}</b></td><td>${esq} = ${dir}</td></tr>`;
    }).join("");
    passos.push(R("Monte uma equação para cada elemento", `<p>O número de átomos de cada elemento tem de ser igual nos dois lados:</p><div class="tab-rolar"><table class="tb"><tbody>${linhas}</tbody></table></div>`));
    const eqs = b.coef.map((c, i) => `${LETRAS[i]} = ${c}`).join(", ");
    passos.push(R("Resolva o sistema", `<p>Escolha uma letra livre (valendo 1), calcule as outras e multiplique por um número para eliminar frações, mantendo os menores inteiros possíveis:</p>${eq(`<b>${eqs}</b>`)}`));
    // conferência
    const lin = b.elems.map((s) => {
      let e = 0, d = 0;
      sp.forEach((x, i) => { const v = (x.p.contagem[s] || 0) * b.coef[i]; if (x.lado === 1) e += v; else d += v; });
      return `<tr><td><b>${s}</b></td><td>${e}</td><td>${d}</td><td class="ok">✓</td></tr>`;
    }).join("");
    passos.push(R("Equação balanceada e conferência", `${eq(`<b>${textoEquacao(b)}</b>`)}<div class="tab-rolar"><table class="tb"><thead><tr><th>Elemento</th><th>Reagentes</th><th>Produtos</th><th></th></tr></thead><tbody>${lin}</tbody></table></div><small class="dica">Conferir sempre: o mesmo número de átomos de cada elemento nos dois lados.</small>`));
    return { ok: true, balanco: b, passos, resposta: textoEquacao(b, b.coef, false), coef: b.coef };
  }

  // ---------------------------------------------------------------------------
  // Estequiometria
  // ---------------------------------------------------------------------------
  // entradas: [{ i: índice da espécie, valor, un: "g" | "mol" }]
  function passosEstequiometria(txt, entradas, rendReal) {
    const b = balancear(txt);
    if (!b.ok) return b;
    const sp = b.especies;
    const M = sp.map((e) => massaMolar(e.p).total);
    const dados = entradas.filter((e) => e.valor > 0 && isFinite(e.valor));
    if (!dados.length) return { ok: false, erro: "Informe a quantidade de pelo menos uma substância (em gramas ou em mol)." };
    const passos = [];
    passos.push(R("Equação balanceada", `${eq(`<b>${textoEquacao(b)}</b>`)}<small class="dica">Os coeficientes dão a proporção em mol entre as substâncias.</small>`));
    // massa -> mol
    const mols = {};
    const linhasConv = [];
    for (const d of dados) {
      const nome = fq(sp[d.i].f);
      if (d.un === "g") {
        mols[d.i] = d.valor / M[d.i];
        linhasConv.push(item(nome, eq(`n = ${frac("m", "M")} = ${frac(num(d.valor) + " g", num(M[d.i], 5) + " g/mol")} = <b>${num(mols[d.i])} mol</b>`)));
      } else {
        mols[d.i] = d.valor;
        linhasConv.push(item(nome, `<p>já está em mol: <b>${num(d.valor)} mol</b></p>`));
      }
    }
    passos.push(R("Passe tudo para mol", `<p>A proporção da reação é em mol, então convertemos o que foi dado:</p>${linhasConv.join("")}`));
    // reagente limitante
    const reag = dados.filter((d) => d.i < b.nReag);
    let xi, limite = null;
    if (reag.length) {
      const razoes = reag.map((d) => ({ i: d.i, r: mols[d.i] / b.coef[d.i] }));
      razoes.sort((p, q) => p.r - q.r);
      xi = razoes[0].r; limite = razoes[0].i;
      if (reag.length > 1) {
        const tabela = razoes.map((r) => item(fq(sp[r.i].f), eq(`${frac(num(mols[r.i]) + " mol", b.coef[r.i])} = <b>${num(r.r)}</b>`))).join("");
        passos.push(R("Descubra o reagente limitante", `<p>Divida o mol de cada reagente pelo seu coeficiente: o <b>menor valor</b> acaba primeiro e limita a reação.</p>${tabela}<p>Reagente limitante: <b>${fq(sp[limite].f)}</b>. O outro está em excesso.</p>`));
      } else {
        passos.push(R("Reagente de referência", `<p>Só um reagente foi informado, então supomos que ele reage por completo (<b>${fq(sp[limite].f)}</b>) e o resto está em quantidade suficiente.</p>`));
      }
    } else {
      const d = dados[0];
      xi = mols[d.i] / b.coef[d.i];
      passos.push(R("Parta do produto", `<p>Foi informada a quantidade de um produto (<b>${fq(sp[d.i].f)}</b>). Vamos descobrir quanto reagente foi preciso.</p>`));
    }
    // quantidades
    const lin = sp.map((e, i) => {
      const nMol = b.coef[i] * xi;
      const massa = nMol * M[i];
      const papel = i < b.nReag ? "reagente consumido" : "produto formado";
      return item(`${fq(e.f)} <small>(${papel})</small>`, eq(`n = ${b.coef[i]} × ${num(xi)} = <b>${num(nMol)} mol</b>`) + eq(`m = n × M = ${num(nMol)} × ${num(M[i], 5)} = <b>${num(massa)} g</b>`));
    }).join("");
    passos.push(R("Calcule a reação", `<p>Multiplique cada coeficiente pelo valor limitante (${num(xi)}) para obter os mols. Depois passe para massa (m = n × M):</p>${lin}`));
    // sobras
    const sobras = [];
    for (const d of reag) {
      if (d.i === limite) continue;
      const usado = b.coef[d.i] * xi, sobra = mols[d.i] - usado;
      sobras.push(item(fq(sp[d.i].f), eq(`${num(mols[d.i])} − ${num(usado)} = <b>${num(sobra)} mol</b> (${num(sobra * M[d.i])} g)`)));
    }
    if (sobras.length) passos.push(R("Sobra do reagente em excesso", `<p>Mol que havia − mol que reagiu:</p>${sobras.join("")}`));
    // rendimento
    let rend = null;
    if (rendReal && rendReal.valor > 0 && rendReal.i >= b.nReag) {
      const teor = b.coef[rendReal.i] * xi * M[rendReal.i];
      const real = rendReal.un === "g" ? rendReal.valor : rendReal.valor * M[rendReal.i];
      rend = (real / teor) * 100;
      passos.push(R("Rendimento da reação", `<p>Rendimento é o que se obteve de verdade dividido pelo que era esperado (teórico):</p>${eq(`η = ${frac("real", "teórico")} × 100 = ${frac(num(real) + " g", num(teor) + " g")} × 100 = <b>${num(rend, 4)}%</b>`)}`));
    }
    const prod = sp.map((e, i) => ({ f: e.f, mol: b.coef[i] * xi, massa: b.coef[i] * xi * M[i], reag: i < b.nReag }));
    return { ok: true, passos, balanco: b, prod, limite, rendimento: rend, resposta: prod.filter((p) => !p.reag).map((p) => `${p.f}: ${num(p.massa)} g`).join(" · ") };
  }

  // ---------------------------------------------------------------------------
  // Soluções e pH
  // ---------------------------------------------------------------------------
  function passosMolaridade(d) {
    // d: { M, m, V, MM } valores (null = incógnita); V em L, m em g, MM em g/mol, M em mol/L
    const faltam = ["M", "m", "V", "MM"].filter((k) => d[k] == null || isNaN(d[k]));
    if (faltam.length !== 1) return { ok: false, erro: "Deixe exatamente um campo em branco: ele será a incógnita." };
    const x = faltam[0];
    const passos = [R("Fórmula", `<p>A molaridade é a quantidade de soluto (em mol) por litro de solução:</p>${eq(`M = ${frac("n", "V")} = ${frac("m", "MM × V")}`)}<small class="dica">M em mol/L, m em gramas, MM (massa molar) em g/mol e V em litros.</small>`)];
    let r;
    const { M, m, V, MM } = d;
    if (x === "M") { r = m / (MM * V); passos.push(R("Substitua e calcule", eq(`M = ${frac(num(m) + " g", num(MM, 5) + " × " + num(V))} = <b>${num(r)} mol/L</b>`))); }
    if (x === "m") { r = M * MM * V; passos.push(R("Isole a massa", eq(`m = M × MM × V = ${num(M)} × ${num(MM, 5)} × ${num(V)} = <b>${num(r)} g</b>`))); }
    if (x === "V") { r = m / (M * MM); passos.push(R("Isole o volume", eq(`V = ${frac("m", "M × MM")} = ${frac(num(m), num(M) + " × " + num(MM, 5))} = <b>${num(r)} L</b>`))); }
    if (x === "MM") { r = m / (M * V); passos.push(R("Isole a massa molar", eq(`MM = ${frac("m", "M × V")} = ${frac(num(m), num(M) + " × " + num(V))} = <b>${num(r)} g/mol</b>`))); }
    if (!(r > 0) || !isFinite(r)) return { ok: false, erro: "Os valores informados não dão um resultado válido (confira zeros e sinais)." };
    return { ok: true, valor: r, incognita: x, passos, resposta: `${x} = ${num(r)}` };
  }
  function passosDiluicao(d) {
    const faltam = ["C1", "V1", "C2", "V2"].filter((k) => d[k] == null || isNaN(d[k]));
    if (faltam.length !== 1) return { ok: false, erro: "Deixe exatamente um campo em branco: ele será a incógnita." };
    const x = faltam[0];
    const passos = [R("Ideia", `<p>Ao diluir, adicionamos só solvente: a quantidade de soluto não muda. Como n = C × V, temos:</p>${eq(`C<sub>1</sub> × V<sub>1</sub> = C<sub>2</sub> × V<sub>2</sub>`)}<small class="dica">As unidades de volume (e de concentração) só precisam ser iguais dos dois lados.</small>`)];
    const { C1, V1, C2, V2 } = d;
    let r;
    if (x === "C1") { r = (C2 * V2) / V1; passos.push(R("Isole C₁", eq(`C<sub>1</sub> = ${frac("C<sub>2</sub> × V<sub>2</sub>", "V<sub>1</sub>")} = ${frac(num(C2) + " × " + num(V2), num(V1))} = <b>${num(r)}</b>`))); }
    if (x === "V1") { r = (C2 * V2) / C1; passos.push(R("Isole V₁", eq(`V<sub>1</sub> = ${frac("C<sub>2</sub> × V<sub>2</sub>", "C<sub>1</sub>")} = ${frac(num(C2) + " × " + num(V2), num(C1))} = <b>${num(r)}</b>`))); }
    if (x === "C2") { r = (C1 * V1) / V2; passos.push(R("Isole C₂", eq(`C<sub>2</sub> = ${frac("C<sub>1</sub> × V<sub>1</sub>", "V<sub>2</sub>")} = ${frac(num(C1) + " × " + num(V1), num(V2))} = <b>${num(r)}</b>`))); }
    if (x === "V2") { r = (C1 * V1) / C2; passos.push(R("Isole V₂", eq(`V<sub>2</sub> = ${frac("C<sub>1</sub> × V<sub>1</sub>", "C<sub>2</sub>")} = ${frac(num(C1) + " × " + num(V1), num(C2))} = <b>${num(r)}</b>`))); }
    if (!(r > 0) || !isFinite(r)) return { ok: false, erro: "Os valores informados não dão um resultado válido." };
    let extra = "";
    if (x === "V1" || x === "V2") {
      const v1 = x === "V1" ? r : V1, v2 = x === "V2" ? r : V2;
      if (v2 > v1) extra = `<p>Volume de solvente a adicionar: V<sub>2</sub> − V<sub>1</sub> = ${num(v2)} − ${num(v1)} = <b>${num(v2 - v1)}</b> (na mesma unidade).</p>`;
    }
    if (extra) passos.push(R("Quanto de solvente adicionar", extra));
    return { ok: true, valor: r, incognita: x, passos, resposta: `${x} = ${num(r)}` };
  }

  const KW = 1e-14;
  function passosPH(p) {
    // p: { tipo: "acido-forte" | "base-forte" | "acido-fraco" | "base-fraca" | "ph" | "poh" | "h" | "oh", C, K, nu, valor }
    const passos = [];
    const log = (x) => Math.log10(x);
    const ph2 = (h) => -log(h);
    const resumo = (h, oh, ph, poh) => `<div class="tab-rolar"><table class="tb"><tbody>
      <tr><td>[H<sup>+</sup>]</td><td><b>${num(h, 3)} mol/L</b></td></tr><tr><td>[OH<sup>−</sup>]</td><td><b>${num(oh, 3)} mol/L</b></td></tr>
      <tr><td>pH</td><td><b>${num(ph, 3)}</b></td></tr><tr><td>pOH</td><td><b>${num(poh, 3)}</b></td></tr></tbody></table></div>`;
    const avisoPH = (ph) => `<p>O meio é <b>${ph < 6.99 ? "ácido" : ph > 7.01 ? "básico" : "neutro"}</b> (pH ${ph < 6.99 ? "&lt; 7" : ph > 7.01 ? "&gt; 7" : "= 7"} a 25 °C).</p>`;
    if (p.tipo === "acido-forte" || p.tipo === "base-forte") {
      const nu = p.nu || 1;
      if (!(p.C > 0)) return { ok: false, erro: "Informe a concentração (mol/L) maior que zero." };
      const forte = p.tipo === "acido-forte";
      passos.push(R("Ácido ou base forte", `<p>Um ${forte ? "ácido" : "base"} forte se ${forte ? "ioniza" : "dissocia"} por completo. A concentração de ${forte ? "H<sup>+</sup>" : "OH<sup>−</sup>"} é a concentração do composto vezes o número de ${forte ? "H" : "OH"} liberados (${nu}):</p>${eq(`[${forte ? "H<sup>+</sup>" : "OH<sup>−</sup>"}] = ${nu} × ${num(p.C)} = <b>${num(nu * p.C)} mol/L</b>`)}`));
      let h, oh;
      if (forte) { h = nu * p.C; oh = KW / h; } else { oh = nu * p.C; h = KW / oh; }
      if (forte) passos.push(R("Calcule o pH", eq(`pH = −log[H<sup>+</sup>] = −log(${num(h)}) = <b>${num(ph2(h), 4)}</b>`)));
      else passos.push(R("Calcule o pOH e depois o pH", eq(`pOH = −log[OH<sup>−</sup>] = −log(${num(oh)}) = <b>${num(ph2(oh), 4)}</b>`) + eq(`pH = 14 − pOH = 14 − ${num(ph2(oh), 4)} = <b>${num(14 - ph2(oh), 4)}</b>`)));
      const ph = ph2(h);
      passos.push(R("Resumo", resumo(h, oh, ph, 14 - ph) + avisoPH(ph)));
      return { ok: true, ph, valor: ph, passos, resposta: `pH = ${num(ph, 4)}` };
    }
    if (p.tipo === "acido-fraco" || p.tipo === "base-fraca") {
      if (!(p.C > 0) || !(p.K > 0)) return { ok: false, erro: "Informe a concentração e a constante (Ka ou Kb), ambas maiores que zero." };
      const acido = p.tipo === "acido-fraco";
      const nome = acido ? "Ka" : "Kb", ion = acido ? "H<sup>+</sup>" : "OH<sup>−</sup>";
      passos.push(R("Equilíbrio de ionização", `<p>Um ${acido ? "ácido" : "base"} fraco ioniza só um pouco. Se ${acido ? "HA" : "B"} tem concentração inicial C e ioniza x:</p>${eq(`${nome} = ${frac("x × x", "C − x")}`)}<small class="dica">x é a concentração de ${ion} no equilíbrio.</small>`));
      const x = (-p.K + Math.sqrt(p.K * p.K + 4 * p.K * p.C)) / 2;
      const aprox = Math.sqrt(p.K * p.C);
      passos.push(R("Resolva a equação do 2º grau", `<p>Rearranjando: x² + ${nome}·x − ${nome}·C = 0. Aplicando Bhaskara:</p>${eq(`x = ${frac("−" + num(p.K, 3) + " + √(" + num(p.K, 3) + "² + 4 × " + num(p.K, 3) + " × " + num(p.C) + ")", "2")} = <b>${num(x, 4)} mol/L</b>`)}<small class="dica">Atalho: se x for menos de 5% de C, dá para usar x ≈ √(${nome} × C) = ${num(aprox, 4)}. ${x / p.C < 0.05 ? "Aqui a aproximação funciona." : "Aqui a aproximação NÃO é boa: use a conta completa."}</small>`));
      const alpha = x / p.C;
      passos.push(R("Grau de ionização", eq(`α = ${frac("x", "C")} = ${frac(num(x, 4), num(p.C))} = <b>${num(alpha * 100, 3)}%</b>`)));
      let h, oh;
      if (acido) { h = x; oh = KW / h; } else { oh = x; h = KW / oh; }
      const ph = ph2(h);
      passos.push(R("Calcule o pH", (acido ? eq(`pH = −log(${num(x, 4)}) = <b>${num(ph, 3)}</b>`) : eq(`pOH = −log(${num(x, 4)}) = ${num(ph2(oh), 3)}`) + eq(`pH = 14 − ${num(ph2(oh), 3)} = <b>${num(ph, 3)}</b>`)) + resumo(h, oh, ph, 14 - ph) + avisoPH(ph)));
      return { ok: true, ph, valor: ph, alpha, passos, resposta: `pH = ${num(ph, 3)}` };
    }
    // conversões
    if (!(p.valor > 0 || (p.tipo === "ph" || p.tipo === "poh"))) return { ok: false, erro: "Informe um valor válido." };
    let h;
    if (p.tipo === "ph") { h = Math.pow(10, -p.valor); passos.push(R("De pH para [H⁺]", eq(`[H<sup>+</sup>] = 10<sup>−pH</sup> = 10<sup>−${num(p.valor)}</sup> = <b>${num(h, 3)} mol/L</b>`))); }
    else if (p.tipo === "poh") { const oh = Math.pow(10, -p.valor); h = KW / oh; passos.push(R("De pOH para [OH⁻]", eq(`[OH<sup>−</sup>] = 10<sup>−pOH</sup> = <b>${num(oh, 3)} mol/L</b>`)), R("Ache [H⁺]", eq(`[H<sup>+</sup>] = ${frac("10<sup>−14</sup>", "[OH<sup>−</sup>]")} = <b>${num(h, 3)} mol/L</b>`))); }
    else if (p.tipo === "h") { h = p.valor; passos.push(R("[H⁺] conhecida", `<p>[H<sup>+</sup>] = <b>${num(h, 3)} mol/L</b>.</p>`)); }
    else { const oh = p.valor; h = KW / oh; passos.push(R("De [OH⁻] para [H⁺]", eq(`[H<sup>+</sup>] = ${frac("K<sub>w</sub>", "[OH<sup>−</sup>]")} = ${frac("10<sup>−14</sup>", num(oh, 3))} = <b>${num(h, 3)} mol/L</b>`))); }
    const ph = ph2(h);
    passos.push(R("pH, pOH e resumo", eq(`pH = −log[H<sup>+</sup>] = <b>${num(ph, 4)}</b>`) + eq(`pH + pOH = 14 ⇒ pOH = <b>${num(14 - ph, 4)}</b>`) + resumo(h, KW / h, ph, 14 - ph) + avisoPH(ph)));
    return { ok: true, ph, valor: ph, passos, resposta: `pH = ${num(ph, 4)}` };
  }

  // ---------------------------------------------------------------------------
  // Gases ideais
  // ---------------------------------------------------------------------------
  const UP = { atm: 1, kPa: 1 / 101.325, Pa: 1 / 101325, mmHg: 1 / 760, bar: 1 / 1.01325 };
  const UV = { L: 1, mL: 1e-3, "m³": 1e3, "cm³": 1e-3 };
  function passosGas(d) {
    // d: { P, V, n, T } números (null = incógnita), unidades dP, dV, dT ("K" ou "°C")
    const faltam = ["P", "V", "n", "T"].filter((k) => d[k] == null || isNaN(d[k]));
    if (faltam.length !== 1) return { ok: false, erro: "Deixe exatamente um campo em branco: ele será a incógnita." };
    const x = faltam[0];
    const R = 0.082057;
    const passos = [{ t: "Equação de Clapeyron", h: `<p>Para um gás ideal:</p>${eq(`P × V = n × R × T`)}<small class="dica">R = 0,082 atm·L/(mol·K) quando P está em atm, V em L e T em kelvin.</small>` }];
    const conv = [];
    let P = d.P, V = d.V, T = d.T, n = d.n;
    if (P != null) { const p0 = P; P = p0 * UP[d.uP]; if (d.uP !== "atm") conv.push(`P: ${num(p0)} ${d.uP} = ${num(P, 5)} atm`); }
    if (V != null) { const v0 = V; V = v0 * UV[d.uV]; if (d.uV !== "L") conv.push(`V: ${num(v0)} ${d.uV} = ${num(V, 5)} L`); }
    if (T != null) { const t0 = T; if (d.uT === "°C") { T = t0 + 273.15; conv.push(`T: ${num(t0)} °C + 273,15 = ${num(T, 5)} K`); } }
    if (conv.length) passos.push({ t: "Converta as unidades", h: `<p>Os valores precisam estar em atm, L e K:</p><ul class="lista">${conv.map((c) => `<li>${c}</li>`).join("")}</ul>` });
    let r, un2, form, sub;
    if (x === "P") { r = (n * R * T) / V; form = `P = ${frac("n × R × T", "V")}`; sub = frac(`${num(n)} × 0,082057 × ${num(T, 5)}`, num(V, 5)); un2 = "atm"; }
    if (x === "V") { r = (n * R * T) / P; form = `V = ${frac("n × R × T", "P")}`; sub = frac(`${num(n)} × 0,082057 × ${num(T, 5)}`, num(P, 5)); un2 = "L"; }
    if (x === "n") { r = (P * V) / (R * T); form = `n = ${frac("P × V", "R × T")}`; sub = frac(`${num(P, 5)} × ${num(V, 5)}`, `0,082057 × ${num(T, 5)}`); un2 = "mol"; }
    if (x === "T") { r = (P * V) / (n * R); form = `T = ${frac("P × V", "n × R")}`; sub = frac(`${num(P, 5)} × ${num(V, 5)}`, `${num(n)} × 0,082057`); un2 = "K"; }
    if (!(r > 0) || !isFinite(r)) return { ok: false, erro: "Os valores informados não dão um resultado válido (use valores positivos)." };
    passos.push({ t: "Isole a incógnita e calcule", h: eq(form) + eq(`${form.split("=")[0]}= ${sub} = <b>${num(r, 4)} ${un2}</b>`) });
    // na unidade pedida
    let final = r, uf = un2;
    const alvo = x === "P" ? d.uP : x === "V" ? d.uV : x === "T" ? d.uT : "mol";
    if (x === "P" && alvo !== "atm") { final = r / UP[alvo]; uf = alvo; }
    if (x === "V" && alvo !== "L") { final = r / UV[alvo]; uf = alvo; }
    if (x === "T" && alvo === "°C") { final = r - 273.15; uf = "°C"; }
    if (uf !== un2) passos.push({ t: "Volte para a unidade pedida", h: eq(`${num(r, 4)} ${un2} = <b>${num(final, 4)} ${uf}</b>`) });
    return { ok: true, valor: final, unidade: uf, incognita: x, passos, resposta: `${x} = ${num(final, 4)} ${uf}` };
  }

  // ---------------------------------------------------------------------------
  // Distribuição eletrônica
  // ---------------------------------------------------------------------------
  const ORDEM = ["1s", "2s", "2p", "3s", "3p", "4s", "3d", "4p", "5s", "4d", "5p", "6s", "4f", "5d", "6p", "7s", "5f", "6d", "7p"];
  const CAPS = { s: 2, p: 6, d: 10, f: 14 };
  const L_DE = { s: 0, p: 1, d: 2, f: 3 };
  function aufbau(Z) {
    const lista = [];
    let r = Z;
    for (const sub of ORDEM) {
      if (r <= 0) break;
      const c = Math.min(CAPS[sub[1]], r);
      lista.push({ sub, e: c });
      r -= c;
    }
    return lista;
  }
  function expandirReal(Z) {
    const el = (raiz.DADOS || [])[Z - 1];
    if (!el || !el.cfg) return aufbau(Z);
    const nobres = { He: 2, Ne: 10, Ar: 18, Kr: 36, Xe: 54, Rn: 86 };
    const mapa = {};
    const m = el.cfg.match(/^\[(\w+)\]\s*(.*)$/);
    let resto = el.cfg;
    if (m) { for (const s of aufbau(nobres[m[1]] || 0)) mapa[s.sub] = s.e; resto = m[2]; }
    for (const tk of resto.split(/\s+/).filter(Boolean)) { const mm = tk.match(/^(\d[spdf])(\d+)$/); if (mm) mapa[mm[1]] = +mm[2]; }
    return ORDEM.filter((s) => mapa[s]).map((s) => ({ sub: s, e: mapa[s] }));
  }
  const nDe = (sub) => +sub[0];
  function ordenarPorCamada(lista) { return lista.slice().sort((a, b) => nDe(a.sub) - nDe(b.sub) || L_DE[a.sub[1]] - L_DE[b.sub[1]]); }
  const supTxt = (n) => String(n).replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]);
  const confTxt = (lista) => lista.map((s) => `${s.sub}<sup>${s.e}</sup>`).join(" ");

  function orbitais(sub, e) {
    const l = L_DE[sub[1]], n = 2 * l + 1;
    const cx = Array.from({ length: n }, () => [0, 0]);
    for (let k = 0; k < e; k++) { if (k < n) cx[k][0] = 1; else cx[k - n][1] = 1; }
    return cx;
  }
  function numerosQuanticos(sub, e) {
    const l = L_DE[sub[1]], n = nDe(sub), cap = 2 * l + 1;
    const k = e - 1;
    const ml = k < cap ? -l + k : -l + (k - cap);
    const ms = k < cap ? "+½" : "−½";
    return { n, l, ml, ms };
  }

  function passosEletronica(Z, carga = 0) {
    if (!(Z >= 1 && Z <= 118) || Z !== Math.floor(Z)) return { ok: false, erro: "Informe um número atômico entre 1 e 118." };
    const el = elementos()[(raiz.DADOS || [])[Z - 1].s];
    const E = Z - carga;
    if (E < 0) return { ok: false, erro: "A carga positiva é maior que o número de elétrons." };
    const passos = [];
    passos.push(R("Quantos elétrons?", `<p><b>${el.nome}</b> (${el.s}) tem Z = <b>${Z}</b>. Um átomo neutro tem ${Z} elétrons${carga ? `; com carga ${carga > 0 ? "+" + carga : carga} o íon tem ${Z} ${carga > 0 ? "−" : "+"} ${Math.abs(carga)} = <b>${E}</b> elétrons` : ""}.</p>`));
    // Pauling
    const diag = `<div class="pauling">${[["1s"], ["2s", "2p"], ["3s", "3p", "3d"], ["4s", "4p", "4d", "4f"], ["5s", "5p", "5d", "5f"], ["6s", "6p", "6d"], ["7s", "7p"]].map((l) => `<div>${l.map((s) => `<span>${s}</span>`).join("")}</div>`).join("")}</div>`;
    passos.push(R("Siga o diagrama de Pauling", `<p>Os subníveis são preenchidos nesta ordem de energia: <b>${ORDEM.join(" → ")}</b>. Capacidades: s = 2, p = 6, d = 10, f = 14 elétrons.</p>${diag}`));
    let lista = carga === 0 ? expandirReal(Z) : null;
    const naive = aufbau(E);
    let excecao = false;
    if (carga === 0) { excecao = JSON.stringify(naive) !== JSON.stringify(lista); }
    if (carga !== 0) {
      lista = aufbau(Z);
      let rem = carga;
      // cátion: perde da camada mais externa; ânion: ganha no próximo espaço
      if (carga > 0) {
        while (rem > 0) {
          lista = lista.filter((s) => s.e > 0);
          const maxN = Math.max(...lista.map((s) => nDe(s.sub)));
          const cand = lista.filter((s) => nDe(s.sub) === maxN).sort((a, b) => L_DE[b.sub[1]] - L_DE[a.sub[1]])[0];
          cand.e--; rem--;
        }
        lista = lista.filter((s) => s.e > 0);
      } else lista = aufbau(E);
    }
    const mostra = lista;
    passos.push(R("Distribuição por ordem de energia", `${eq(`<b>${confTxt(mostra)}</b>`)}${excecao ? `<p class="aviso-exc"><b>Atenção:</b> ${el.nome} é uma <b>exceção</b> ao diagrama. Pelo preenchimento "puro" seria ${confTxt(naive)}, mas a configuração real (medida) é a acima, porque semipreenchida (d⁵, f⁷) ou completa (d¹⁰, f¹⁴) é mais estável.</p>` : ""}`));
    const porCamada = ordenarPorCamada(mostra);
    passos.push(R("Reorganize por camada (ordem de n)", `${eq(`<b>${confTxt(porCamada)}</b>`)}<small class="dica">Por camada: ${"KLMNOPQ"[0]} (n = 1), L (n = 2), M (n = 3), N (n = 4)...</small>`));
    const nMax = Math.max(...mostra.map((s) => nDe(s.sub)));
    const camadas = {};
    for (const s of mostra) camadas[nDe(s.sub)] = (camadas[nDe(s.sub)] || 0) + s.e;
    const camTxt = Object.keys(camadas).map((n) => `${"KLMNOPQ"[n - 1]} = ${camadas[n]}`).join(" · ");
    const val = camadas[nMax];
    passos.push(R("Camadas e elétrons de valência", `<p>Elétrons por camada: <b>${camTxt}</b>.</p><p>Camada de valência: n = <b>${nMax}</b> (a mais externa), com <b>${val}</b> elétron${val > 1 ? "s" : ""}.</p>`));
    // caixas
    const caixas = ordenarPorCamada(mostra).map((s) => `<div class="cx-sub"><span class="cx-nome">${s.sub}</span><span class="cx-orb">${orbitais(s.sub, s.e).map((o) => `<i>${o[0] ? "↑" : ""}${o[1] ? "↓" : ""}</i>`).join("")}</span></div>`).join("");
    passos.push(R("Diagrama de orbitais (regra de Hund)", `<p>Cada caixa é um orbital. Primeiro se coloca um elétron em cada caixa (todos com spin ↑), e só depois se completam os pares (↓):</p><div class="caixas">${caixas}</div>`));
    // último elétron
    const ult = naive[naive.length - 1];
    const q = numerosQuanticos(ult.sub, ult.e);
    passos.push(R("Números quânticos do elétron mais energético", `<p>Pelo diagrama de Pauling, o último elétron entra em <b>${ult.sub}</b> (posição ${ult.e} do subnível):</p><div class="tab-rolar"><table class="tb"><tbody>
      <tr><td>n (nível)</td><td><b>${q.n}</b></td></tr><tr><td>ℓ (subnível ${ult.sub[1]})</td><td><b>${q.l}</b></td></tr>
      <tr><td>mℓ (orbital)</td><td><b>${q.ml}</b></td></tr><tr><td>mₛ (spin)</td><td><b>${q.ms}</b></td></tr></tbody></table></div><small class="dica">Convenção usada: orbitais do menor mℓ para o maior, primeiro elétron com spin +½.${excecao ? " Em elementos exceção, o resultado pode diferir do esperado pelo diagrama." : ""}</small>`));
    const d = el.d;
    return { ok: true, el, passos, config: confTxt(mostra), excecao, valencia: val, resposta: mostra.map((s) => s.sub + supTxt(s.e)).join(" "), grupo: d.g, periodo: d.p, bloco: d.b };
  }

  // ---------------------------------------------------------------------------
  // Exercícios gerados
  // ---------------------------------------------------------------------------
  const sorteia = (a) => a[Math.floor(Math.random() * a.length)];
  const inteiro = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const COMPOSTOS = ["H2O", "CO2", "NaCl", "CH4", "NH3", "H2SO4", "HNO3", "Ca(OH)2", "NaOH", "KMnO4", "C6H12O6", "Al2(SO4)3", "CaCO3", "Mg(OH)2", "C2H5OH", "Fe2O3", "Na2CO3", "HCl", "C12H22O11", "Ca3(PO4)2", "CuSO4·5H2O", "(NH4)2SO4"];
  const EQUACOES = ["H2 + O2 -> H2O", "N2 + H2 -> NH3", "Fe + O2 -> Fe2O3", "C3H8 + O2 -> CO2 + H2O", "Al + HCl -> AlCl3 + H2", "KClO3 -> KCl + O2", "C2H6 + O2 -> CO2 + H2O", "Na + H2O -> NaOH + H2", "CaCO3 + HCl -> CaCl2 + CO2 + H2O", "Al + O2 -> Al2O3", "C6H12O6 + O2 -> CO2 + H2O", "Fe2O3 + CO -> Fe + CO2", "NH3 + O2 -> NO + H2O", "Ca(OH)2 + H3PO4 -> Ca3(PO4)2 + H2O"];

  function gerarExercicio(tipo) {
    if (tipo === "massa") {
      const f = sorteia(COMPOSTOS);
      const r = passosMassaMolar(f);
      return { enunciado: `Calcule a massa molar de <b>${fq(f)}</b>.`, resposta: r.valor, tol: config.escolar ? 0.01 : 0.02, rel: 0.005, unidade: "g/mol", passos: r.passos, texto: r.resposta };
    }
    if (tipo === "mol") {
      const f = sorteia(COMPOSTOS.filter((x) => !x.includes("·")));
      const m = inteiro(2, 90) + (Math.random() < 0.5 ? 0 : 0.5);
      const r = passosMol(f, "massa", m);
      return { enunciado: `Quantos mols existem em <b>${num(m)} g</b> de <b>${fq(f)}</b>?`, resposta: r.n, rel: 0.02, unidade: "mol", passos: r.passos, texto: r.resposta };
    }
    if (tipo === "balancear") {
      const e = sorteia(EQUACOES);
      const r = passosBalanceamento(e);
      return { enunciado: `Balanceie a equação (responda só os coeficientes, separados por vírgula, na ordem em que aparecem):<div class="eq"><b>${e.split("->").map((l) => l.split(" + ").map(fq).join(" + ")).join(" → ")}</b></div>`, resposta: r.coef, tipo: "lista", passos: r.passos, texto: r.resposta };
    }
    if (tipo === "ph") {
      const modo = sorteia(["acido", "base", "fraco"]);
      if (modo === "acido") { const e = inteiro(1, 5), c = inteiro(1, 9); const C = c * Math.pow(10, -e); const r = passosPH({ tipo: "acido-forte", C, nu: 1 }); return { enunciado: `Calcule o pH de uma solução de HCl (ácido forte) com concentração <b>${c}×10<sup>−${e}</sup> mol/L</b>.`, resposta: r.ph, tol: 0.02, unidade: "", passos: r.passos, texto: r.resposta }; }
      if (modo === "base") { const e = inteiro(1, 4), c = inteiro(1, 9); const C = c * Math.pow(10, -e); const r = passosPH({ tipo: "base-forte", C, nu: 1 }); return { enunciado: `Calcule o pH de uma solução de NaOH (base forte) com concentração <b>${c}×10<sup>−${e}</sup> mol/L</b>.`, resposta: r.ph, tol: 0.02, unidade: "", passos: r.passos, texto: r.resposta }; }
      const C = [0.1, 0.05, 0.2, 0.01][inteiro(0, 3)], K = [1.8e-5, 6.8e-4, 4.9e-10, 1.4e-3][inteiro(0, 3)];
      const r = passosPH({ tipo: "acido-fraco", C, K });
      return { enunciado: `Calcule o pH de uma solução <b>${num(C)} mol/L</b> de um ácido fraco com <b>K<sub>a</sub> = ${sci(K, 2)}</b>.`, resposta: r.ph, tol: 0.03, unidade: "", passos: r.passos, texto: r.resposta };
    }
    if (tipo === "gas") {
      const P = [1, 2, 0.5, 1.5, 3][inteiro(0, 4)], V = [5, 10, 2.5, 20, 8.2][inteiro(0, 4)], T = [273, 300, 350, 400, 25][inteiro(0, 4)];
      const celsius = T === 25;
      const r = passosGas({ P, V, n: null, T, uP: "atm", uV: "L", uT: celsius ? "°C" : "K" });
      return { enunciado: `Um gás ideal ocupa <b>${num(V)} L</b> a <b>${num(P)} atm</b> e <b>${T} ${celsius ? "°C" : "K"}</b>. Quantos mols de gás há na amostra? (R = 0,082 atm·L/mol·K)`, resposta: r.valor, rel: 0.03, unidade: "mol", passos: r.passos, texto: r.resposta };
    }
    if (tipo === "diluicao") {
      const C1 = [2, 1, 0.5, 4, 6][inteiro(0, 4)], V1 = [50, 100, 25, 200][inteiro(0, 3)], V2 = V1 * [2, 4, 5, 10][inteiro(0, 3)];
      const r = passosDiluicao({ C1, V1, C2: null, V2 });
      return { enunciado: `<b>${num(V1)} mL</b> de uma solução <b>${num(C1)} mol/L</b> são diluídos com água até <b>${num(V2)} mL</b>. Qual a nova concentração?`, resposta: r.valor, rel: 0.02, unidade: "mol/L", passos: r.passos, texto: r.resposta };
    }
    return null;
  }

  function conferir(ex, texto) {
    if (ex.tipo === "lista") {
      const v = String(texto).split(/[,;\s]+/).filter(Boolean).map(Number);
      return v.length === ex.resposta.length && v.every((x, i) => x === ex.resposta[i]);
    }
    const v = lerNumero(texto);
    if (isNaN(v)) return null;
    const dif = Math.abs(v - ex.resposta);
    return dif <= (ex.tol != null ? ex.tol : 0) || dif <= Math.abs(ex.resposta) * (ex.rel || 0);
  }

  const API = {
    config, num, sci, fq, frac, lerNumero, elementos, massaAtomica,
    parseFormula, massaMolar, passosMassaMolar, passosMol,
    lerEquacao, balancear, textoEquacao, passosBalanceamento, passosEstequiometria,
    passosMolaridade, passosDiluicao, passosPH, passosGas, passosEletronica, aufbau, expandirReal,
    gerarExercicio, conferir, NA, VM_CNTP, COMPOSTOS, EQUACOES, UP, UV,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else raiz.QCalc = API;
})(typeof window !== "undefined" ? window : globalThis);
