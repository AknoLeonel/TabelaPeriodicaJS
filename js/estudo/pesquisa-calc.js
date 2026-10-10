/*
 * Motor do módulo Pesquisa (relatórios de laboratório, iniciação científica, trabalhos).
 * Ajuste linear, propagação de incertezas, algarismos significativos, estatística de medidas,
 * constantes físicas (CODATA 2018) e formatação de tabelas.
 * Funções puras (rodam em Node e no navegador); nada de DOM, nada de eval.
 */
(function (raiz) {
  "use strict";
  const Q = typeof module !== "undefined" && module.exports ? require("./quimica-calc.js") : raiz.QCalc;
  const getX = () => (typeof module !== "undefined" && module.exports ? require("./expressao.js") : raiz.Expr);

  // ---------------------------------------------------------------------------
  // Formatação
  // ---------------------------------------------------------------------------
  const SUP_C = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹", "-": "⁻" };
  const SUP_D = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁻": "-", "⁺": "+" };
  const sup = (e) => String(e).replace(/[0-9-]/g, (c) => SUP_C[c]);
  const virg = (s) => String(s).replace(".", ",");
  const n = (v, sig = 5) => (isFinite(v) ? Q.num(v, sig) : "—"); // HTML
  const eq = (h) => `<div class="eq">${h}</div>`;
  const R = (t, h) => ({ t, h });
  const frac = Q.frac;
  const item = (nome, h) => `<div class="item"><span class="item-n">${nome}</span>${h}</div>`;
  const tabela = (cab, linhas) =>
    `<div class="tab-rolar"><table class="tb"><thead><tr>${cab.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${linhas.map((l) => `<tr>${l.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  const dica = (h) => `<small class="dica">${h}</small>`;
  const aviso = (h) => `<p class="aviso-exc"><b>Atenção:</b> ${h}</p>`;
  const sub = (s) => `<sub>${s}</sub>`;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const semTags = (h) => String(h).replace(/<sup>([^<]*)<\/sup>/g, (_, e) => sup(e.replace(/−/g, "-"))).replace(/<sub>([^<]*)<\/sub>/g, "$1").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

  // número em texto plano, no padrão brasileiro (sem HTML)
  function numT(v, sig = 5) {
    if (!isFinite(v)) return "—";
    if (v === 0) return "0";
    const a = Math.abs(v);
    const limpa = (m) => (m.includes(".") ? m.replace(/0+$/, "").replace(/\.$/, "") : m);
    if (a >= 1e6 || a < 1e-3) {
      const [m, e] = v.toExponential(sig - 1).split("e");
      return virg(limpa(m)) + "×10" + sup(parseInt(e, 10));
    }
    return virg(limpa(Number(v.toPrecision(sig)).toString()));
  }
  const fixo = (v, casas) => virg(v.toFixed(Math.max(0, Math.min(casas, 20))));
  const lerNumero = Q.lerNumero;

  // ---------------------------------------------------------------------------
  // Leitura de dados colados (planilha, CSV, texto)
  // ---------------------------------------------------------------------------
  // linhas de números; aceita vírgula decimal e separadores tab, ; , espaço, quebra de linha
  function parseTabela(txt, { minCols = 1 } = {}) {
    const bruto = String(txt == null ? "" : txt).replace(/\r/g, "").split("\n").map((l) => l.trim()).filter((l) => l.length);
    if (!bruto.length) return { ok: false, erro: "Cole ou digite os dados (um ponto por linha)." };
    const dividir = (l, modo) => {
      if (modo === "virgula") return l.split(",").map((s) => s.trim());
      let t = l;
      if (t.includes("\t")) return t.split("\t").map((s) => s.trim());
      if (t.includes(";")) return t.split(";").map((s) => s.trim());
      t = t.replace(/,\s+/g, " ");
      if (/\s/.test(t)) return t.split(/\s+/);
      return [t];
    };
    const montar = (modo) => {
      const linhas = [], ign = [];
      bruto.forEach((l, i) => {
        const tk = dividir(l, modo).map((s) => (s === "" ? NaN : lerNumero(s)));
        let ok = tk.length >= minCols;
        for (let k = 0; k < minCols && ok; k++) if (!isFinite(tk[k])) ok = false;
        if (ok) linhas.push(tk.map((v) => (isFinite(v) ? v : null))); else ign.push(i + 1);
      });
      return { linhas, ign };
    };
    let r = montar("auto");
    const poucas = r.linhas.length === 0 || (minCols >= 2 && r.linhas.every((l) => l.length < 2));
    if (poucas && minCols >= 2) {
      const r2 = montar("virgula");
      if (r2.linhas.length > r.linhas.length || (r2.linhas.length && r2.linhas.every((l) => l.length >= minCols))) r = r2;
    }
    if (!r.linhas.length) return { ok: false, erro: "Não encontrei números nessa tabela. Cada linha precisa de " + (minCols > 1 ? minCols + " valores (por exemplo: 1,5 ⟶ 2,3)." : "um número.") };
    return { ok: true, linhas: r.linhas, ignoradas: r.ign };
  }

  // lista de números (medidas repetidas)
  function lerLista(txt) {
    const t = String(txt == null ? "" : txt).trim();
    if (!t) return { ok: false, erro: "Digite as medidas (separadas por espaço, ponto e vírgula ou quebra de linha)." };
    let tokens;
    if (/[\s;]/.test(t)) tokens = t.split(/[\s;]+/).map((s) => s.replace(/,$/, "")).filter(Boolean);
    else if (t.includes(",")) {
      const virgulas = (t.match(/,/g) || []).length;
      if (virgulas === 1 && !t.includes(".")) tokens = [t];
      else if (t.includes(".")) tokens = t.split(",").filter(Boolean);
      else return { ok: false, erro: "Separe as medidas com espaço, ponto e vírgula ou quebra de linha (a vírgula é a vírgula decimal: 9,81)." };
    } else tokens = [t];
    const v = [];
    for (const k of tokens) {
      const x = lerNumero(k);
      if (!isFinite(x)) return { ok: false, erro: `Não entendi “${esc(k)}”. Use números como 9,81 ou 1,5e-3.` };
      v.push(x);
    }
    return { ok: true, valores: v };
  }

  // ---------------------------------------------------------------------------
  // Algarismos significativos: aritmética em texto decimal
  // ---------------------------------------------------------------------------
  // { neg, d: dígitos, f: casas após a vírgula (pode ser negativo), hasPoint, hasExp, valor }
  function lerDec(txt) {
    let t = String(txt == null ? "" : txt).trim();
    t = t.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+/g, (s) => "^" + [...s].map((c) => SUP_D[c]).join(""));
    t = t.replace(/[−–]/g, "-").replace(/\s+/g, "");
    t = t.replace(/[x×*·]10\^\(?([+-]?\d+)\)?$/i, "e$1");
    const m = /^([+-]?)(\d*)([.,]?)(\d*)(?:e([+-]?\d+))?$/i.exec(t);
    if (!m || m[2] + m[4] === "") return { ok: false, erro: `“${esc(txt)}” não parece um número. Exemplos: 0,00340  1500  1,50e3  2,5×10^-4.` };
    const exp = m[5] !== undefined ? parseInt(m[5], 10) : 0;
    const d = m[2] + m[4];
    const f = m[4].length - exp;
    const dec = { ok: true, neg: m[1] === "-", d, f, hasPoint: m[3] !== "", hasExp: m[5] !== undefined, texto: t, mant: m[2] + m[3] + m[4], pontoAmbiguo: m[3] === "." && /^\d{1,3}\.\d{3}$/.test(m[2] + "." + m[4]) };
    dec.valor = Number((dec.neg ? "-" : "") + d + "e" + -f);
    return dec;
  }
  function analisarAS(dec) {
    const d = dec.d;
    let L = 0;
    while (L < d.length && d[L] === "0") L++;
    if (L === d.length) return { zero: true, n: 1, min: 1, max: 1, L, ambiguo: false, casas: dec.hasPoint || dec.hasExp ? dec.f : 0, ultimoSig: -1, todos: true };
    const r = d.slice(L);
    let tz = 0;
    while (tz < r.length && r[r.length - 1 - tz] === "0") tz++;
    const todos = dec.hasPoint || dec.hasExp;
    const nn = todos ? r.length : r.length - tz;
    return {
      zero: false, n: nn, min: nn, max: r.length, L, tz, todos, ambiguo: !todos && tz > 0,
      casas: todos ? dec.f : -tz, // última casa decimal significativa
      ultimoSig: todos ? d.length - 1 : d.length - 1 - tz,
      E: r.length - 1 - dec.f, // expoente de 10 do primeiro algarismo significativo
    };
  }
  // arredonda para nn algarismos significativos (meio para cima, afastando do zero); lugar=true devolve n+1 dígitos se houver "vai um"
  function arredN(dec, nn, lugar = false) {
    const d = dec.d;
    let L = 0;
    while (L < d.length && d[L] === "0") L++;
    if (L === d.length) return { zero: true, neg: dec.neg };
    const r = d.slice(L);
    const E = r.length - 1 - dec.f;
    if (nn < 0) return { zero: true, neg: dec.neg };
    if (nn === 0) return r[0] >= "5" ? { neg: dec.neg, m: "1", E: E + 1 } : { zero: true, neg: dec.neg };
    if (r.length <= nn) return { neg: dec.neg, m: r + "0".repeat(nn - r.length), E };
    let m = r.slice(0, nn);
    if (r[nn] >= "5") {
      let carry = true;
      const arr = m.split("");
      for (let i = arr.length - 1; i >= 0 && carry; i--) {
        if (arr[i] === "9") arr[i] = "0"; else { arr[i] = String(+arr[i] + 1); carry = false; }
      }
      m = arr.join("");
      if (carry) return { neg: dec.neg, m: lugar ? "1" + m : "1" + m.slice(0, -1), E: E + 1 };
    }
    return { neg: dec.neg, m, E };
  }
  // texto a partir de {m,E}
  function fmtDec(x, casasZero = 0) {
    if (x.zero) return (x.neg ? "" : "") + (casasZero > 0 ? "0," + "0".repeat(casasZero) : "0");
    const { m, E } = x;
    let s;
    if (E >= m.length - 1) s = m + "0".repeat(E - m.length + 1);
    else if (E >= 0) s = m.slice(0, E + 1) + "," + m.slice(E + 1);
    else s = "0," + "0".repeat(-E - 1) + m;
    return (x.neg ? "−" : "") + s;
  }
  function fmtSci(x, html = true) {
    if (x.zero) return "0";
    const mant = x.m[0] + (x.m.length > 1 ? "," + x.m.slice(1) : "");
    return (x.neg ? "−" : "") + mant + (html ? ` × 10<sup>${String(x.E).replace("-", "−")}</sup>` : " × 10" + sup(x.E));
  }
  const numDe = (x) => (x.zero ? 0 : Number((x.neg ? "-" : "") + x.m + "e" + (x.E - x.m.length + 1)));
  // converte um número de ponto flutuante em decimal com 15 algarismos (elimina ruído binário)
  const decDeNum = (v) => lerDec(v.toPrecision(15));

  // desenho dos algarismos: significativos em negrito, o resto apagado
  function marcarAS(dec, an) {
    if (an.zero) return esc(dec.mant);
    let i = 0, out = "";
    for (const c of dec.mant) {
      if (/\d/.test(c)) {
        out += i >= an.L && i <= an.ultimoSig ? `<b class="pq-as">${c}</b>` : `<span class="pq-nas">${c}</span>`;
        i++;
      } else out += c;
    }
    return out + (dec.hasExp ? `<span class="pq-nas"> ×10<sup>${-dec.f + (dec.mant.includes(".") || dec.mant.includes(",") ? dec.mant.split(/[.,]/)[1].length : 0)}</sup></span>` : "");
  }

  function contarAS(txt) {
    const dec = lerDec(txt);
    if (!dec.ok) return { ok: false, erro: dec.erro };
    const an = analisarAS(dec);
    const passos = [];
    const marc = marcarAS(dec, an);
    passos.push(R("O que são algarismos significativos", `<p>São os algarismos que carregam informação sobre a medida: todos os que você <i>tem certeza</i> mais o primeiro duvidoso. Contar quantos são mostra a precisão de uma medida.</p>${dec.pontoAmbiguo ? aviso("interpretei o ponto como vírgula decimal (1.500 = 1,500). Se queria dizer mil e quinhentos, escreva 1500.") : ""}`));
    if (an.zero) {
      passos.push(R("Número zero", `<p>O número ${esc(dec.mant)} é zero. O zero sozinho não tem algarismo significativo “de verdade”; por convenção contamos <b>1</b>. O que importa em ${esc(dec.mant)} é a casa decimal onde a medida foi lida.</p>`));
      return { ok: true, n: 1, min: 1, max: 1, ambiguo: false, passos, resposta: "1 algarismo significativo (convenção para o zero)", respostaHTML: "<b>1</b> algarismo significativo <small>(convenção para o zero)</small>", casas: an.casas, valor: 0 };
    }
    passos.push(R("Marque os algarismos", `<div class="eq">${marc}</div><small class="dica"><b>Negrito</b> = significativo · apagado = não significativo.</small>`));
    const regras = [];
    regras.push("<b>1.</b> Todo algarismo diferente de zero conta.");
    regras.push("<b>2.</b> Zeros <i>entre</i> algarismos diferentes de zero contam (em 3004 são 4).");
    regras.push(`<b>3.</b> Zeros à <i>esquerda</i> nunca contam: só marcam a posição da vírgula${an.L > 0 ? ` (aqui: ${an.L} zero${an.L > 1 ? "s" : ""} à esquerda)` : ""}.`);
    regras.push("<b>4.</b> Zeros à <i>direita</i> contam quando há vírgula (1,50 tem 3) ou na notação científica (1,50×10³ tem 3).");
    regras.push("<b>5.</b> Em número inteiro terminado em zeros e sem vírgula (como 1500) os zeros finais são <b>ambíguos</b>.");
    passos.push(R("Regras usadas", `<ul class="lista">${regras.map((r) => `<li>${r}</li>`).join("")}</ul>`));
    let texto;
    if (an.ambiguo) {
      texto = `<p>${esc(dec.mant)} termina em ${an.tz} zero${an.tz > 1 ? "s" : ""} sem vírgula: não dá para saber se são medidos ou só posicionam o número. Pela convenção mais usada, conta-se só até o último algarismo diferente de zero: <b>${an.min}</b> algarismos significativos. O valor pode ter de ${an.min} até ${an.max}.</p>${aviso("para eliminar a dúvida, escreva em notação científica: " + [...Array(an.max - an.min + 1).keys()].map((k) => { const x = arredN(dec, an.min + k); return fmtSci(x); }).join(" (" + an.min + " a.s.), ").replace(/$/, "") + ".")}`;
    } else {
      texto = `<p>Contando os algarismos em negrito: <b>${an.n}</b>.</p>`;
    }
    passos.push(R("Contagem", texto));
    const x = arredN(dec, an.n);
    passos.push(R("Mesmo número em notação científica", `<div class="eq">${fmtSci({ ...x, neg: dec.neg })} </div><small class="dica">A notação científica deixa claro quantos algarismos são significativos: o que aparece na mantissa é tudo significativo.</small>`));
    const resp = an.ambiguo ? `${an.min} algarismos significativos (podem ser até ${an.max}: notação ambígua)` : `${an.n} algarismo${an.n > 1 ? "s" : ""} significativo${an.n > 1 ? "s" : ""}`;
    return { ok: true, n: an.n, min: an.min, max: an.max, ambiguo: an.ambiguo, casas: an.casas, passos, resposta: resp, respostaHTML: `<b>${an.n}</b> algarismo${an.n > 1 ? "s" : ""} significativo${an.n > 1 ? "s" : ""}${an.ambiguo ? ` <small>(ambíguo: pode ser até ${an.max})</small>` : ""}`, valor: dec.valor, cientifica: fmtSci({ ...x, neg: dec.neg }, false), cientificaHTML: fmtSci({ ...x, neg: dec.neg }) };
  }

  function arredondarAS(txt, nn) {
    const dec = lerDec(txt);
    if (!dec.ok) return { ok: false, erro: dec.erro };
    nn = Math.round(Number(nn));
    if (!(nn >= 1 && nn <= 15)) return { ok: false, erro: "Escolha um número de algarismos significativos entre 1 e 15." };
    const an = analisarAS(dec);
    if (an.zero) return { ok: true, resultado: "0", valor: 0, passos: [R("Zero", "<p>Zero arredondado continua sendo zero.</p>")], resposta: "0", respostaHTML: "<b>0</b>" };
    const x = arredN(dec, nn);
    const passos = [];
    passos.push(R("Identifique os algarismos", `<div class="eq">${marcarAS(dec, an)}</div><p>O número tem ${an.n}${an.ambiguo ? " (ou mais, se os zeros finais forem significativos)" : ""} algarismos significativos e você quer ficar com <b>${nn}</b>.</p>`));
    const r = dec.d.slice(an.L);
    if (r.length > nn) {
      const mantem = r.slice(0, nn), prox = r[nn];
      passos.push(R("Olhe o primeiro algarismo descartado", `<p>Mantenha os ${nn} primeiros algarismos significativos (<b>${mantem}</b>) e olhe o seguinte: <b>${prox}</b>.</p><ul class="lista"><li>Se for <b>5 ou mais</b>, o último algarismo mantido sobe uma unidade.</li><li>Se for <b>menor que 5</b>, o último algarismo mantido fica igual.</li></ul><p>Aqui ${prox} ${prox >= "5" ? "≥ 5: arredonda <b>para cima</b>" : "< 5: <b>mantém</b>"}.</p>${dica("Usamos a regra escolar (5 arredonda para cima). Em trabalhos de estatística usa-se às vezes “arredondar para o par” quando o descartado é exatamente 5.")}`));
    } else {
      passos.push(R("Nada a descartar", `<p>O número já tem só ${r.length} algarismos significativos, menos ou igual a ${nn}. Para chegar a ${nn} acrescentamos zeros à direita — mas atenção: isso <b>afirma</b> uma precisão maior do que a medida tinha.</p>`));
    }
    const plano = fmtDec(x);
    const ambiguoRes = !x.zero && !plano.includes(",") && plano.endsWith("0");
    passos.push(R("Resultado", `<div class="eq"><b>${plano}</b></div><div class="eq">${fmtSci(x)}</div>${ambiguoRes ? aviso("o resultado termina em zeros sem vírgula; para deixar claro que há " + nn + " algarismos significativos, use a notação científica acima.") : ""}`));
    return { ok: true, resultado: plano, cientifica: fmtSci(x, false), cientificaHTML: fmtSci(x), valor: numDe(x), n: nn, passos, resposta: `${plano}  (${fmtSci(x, false)})`, respostaHTML: `<b>${plano}</b> <small>${fmtSci(x)}</small>` };
  }

  // operações com a regra de a.s. (soma/subtração: casas decimais; produto/quociente: a.s.)
  function operarAS(textos, op) {
    const lista = (Array.isArray(textos) ? textos : String(textos).split(/[\s;]+/)).map((s) => String(s).trim()).filter(Boolean);
    if (lista.length < 2) return { ok: false, erro: "Digite pelo menos dois números." };
    if ((op === "-" || op === "/") && lista.length !== 2) return { ok: false, erro: "Subtração e divisão usam exatamente dois números." };
    const decs = [], ans = [];
    for (const t of lista) {
      const d = lerDec(t);
      if (!d.ok) return { ok: false, erro: d.erro };
      decs.push(d); ans.push(analisarAS(d));
    }
    const vals = decs.map((d) => d.valor);
    let exato;
    const simb = { "+": "+", "-": "−", "*": "×", "/": "÷" }[op];
    if (op === "+") exato = vals.reduce((a, b) => a + b, 0);
    else if (op === "-") exato = vals[0] - vals[1];
    else if (op === "*") exato = vals.reduce((a, b) => a * b, 1);
    else if (op === "/") { if (vals[1] === 0) return { ok: false, erro: "Divisão por zero." }; exato = vals[0] / vals[1]; }
    else return { ok: false, erro: "Operação desconhecida." };
    const decR = decDeNum(exato);
    const passos = [];
    const expr = lista.map((t) => `<b>${esc(t)}</b>`).join(` ${simb} `);
    passos.push(R("Conta com todos os algarismos", `<div class="eq">${expr} = ${n(exato, 12)}</div>${dica("Primeiro faça a conta normalmente, sem arredondar nada no meio do caminho. O arredondamento só vale no resultado final.")}`));
    let x, regra, motivo;
    if (op === "+" || op === "-") {
      const casas = ans.map((a) => a.casas);
      const q = Math.min(...casas);
      const linhas = lista.map((t, i) => [esc(t), marcarAS(decs[i], ans[i]), casas[i] >= 0 ? `${casas[i]}` : `${casas[i]} (${10 ** -casas[i]})`]);
      passos.push(R("Regra: soma e subtração", `<p>Na soma e na subtração <b>manda a casa decimal</b>, não a quantidade de algarismos: o resultado só pode ter tantas casas decimais quanto o número <i>menos preciso</i> (o de menos casas).</p>${tabela(["Número", "Algarismos", "Casas decimais"], linhas)}${ans.some((a) => a.ambiguo) ? aviso("há número inteiro terminado em zeros sem vírgula; usei a convenção de que os zeros finais não são significativos (1500 é preciso até a centena).") : ""}`));
      x = arredN(decR, decR.valor === 0 ? 0 : analisarAS(decR).E + q + 1, true);
      const minimo = ans.findIndex((a) => a.casas === q);
      motivo = `O menos preciso é ${esc(lista[minimo])}, com ${q >= 0 ? q + " casa" + (q === 1 ? "" : "s") + " decimal" + (q === 1 ? "" : "is") : "precisão até a casa 10^" + -q}. O resultado fica com essa mesma precisão.`;
      regra = `casas = ${q}`;
      const res = fmtDec(x, Math.max(q, 0));
      passos.push(R("Arredonde para a casa do menos preciso", `<p>${motivo}</p><div class="eq">${n(exato, 12)} ⟶ <b>${res}</b></div>${aroundNote(decR, x)}`));
      return finalizarOp(passos, x, res, exato, q, null, op, Math.max(q, 0));
    }
    const sigs = ans.map((a) => a.n);
    const m = Math.min(...sigs);
    const linhas = lista.map((t, i) => [esc(t), marcarAS(decs[i], ans[i]), String(sigs[i])]);
    passos.push(R("Regra: multiplicação e divisão", `<p>No produto e no quociente <b>manda a quantidade de algarismos significativos</b>: o resultado só pode ter tantos quantos tem o número <i>menos preciso</i> (o de menos algarismos significativos).</p>${tabela(["Número", "Algarismos", "a.s."], linhas)}${ans.some((a) => a.ambiguo) ? aviso("há número inteiro terminado em zeros sem vírgula; usei a convenção de que os zeros finais não são significativos.") : ""}`));
    x = arredN(decR, m);
    const minimo = sigs.indexOf(m);
    motivo = `O menor número de a.s. é ${m} (de ${esc(lista[minimo])}). O resultado fica com ${m} algarismo${m > 1 ? "s" : ""} significativo${m > 1 ? "s" : ""}.`;
    const res = fmtDec(x);
    passos.push(R("Arredonde para o menor número de a.s.", `<p>${motivo}</p><div class="eq">${n(exato, 12)} ⟶ <b>${res}</b>  =  ${fmtSci(x)}</div>${aroundNote(decR, x)}`));
    return finalizarOp(passos, x, res, exato, null, m, op, 0);
  }
  function aroundNote(dec, x) {
    const raw = analisarAS(dec);
    if (raw.zero) return "";
    return dica("Os algarismos além do último mantido são descartados com a regra: 5 ou mais, arredonda para cima.");
  }
  function finalizarOp(passos, x, res, exato, casas, sigs, op, cz) {
    const ambig = !x.zero && !res.includes(",") && res.replace("−", "").endsWith("0");
    if (ambig) passos.push(R("Atenção ao zero final", `<p>O resultado ${res} termina em zero sem vírgula, o que é ambíguo. Em notação científica fica claro: <b>${fmtSci(x)}</b>.</p>`));
    const arred = Math.abs(numDe(x) - exato) > 1e-12 * Math.max(1, Math.abs(exato));
    passos.push(R("Precisa arredondar?", arred
      ? `<p>Sim: o valor da calculadora (${n(exato, 12)}) tem mais algarismos do que as medidas permitem. Escrevê-lo inteiro afirmaria uma precisão que ninguém mediu. O resultado correto é <b>${res}</b>.</p>`
      : `<p>Não: o valor da conta já cabe na precisão permitida (${res}).</p>`));
    return { ok: true, exato, resultado: res, cientifica: fmtSci(x, false), cientificaHTML: fmtSci(x), valor: numDe(x), casas, sigs, arredondou: arred, passos, resposta: res + (ambig ? `  (${fmtSci(x, false)})` : ""), respostaHTML: `<b>${res}</b>${ambig ? ` <small>${fmtSci(x)}</small>` : ""}` };
  }

  // ---------------------------------------------------------------------------
  // Escrita de resultado com incerteza
  // ---------------------------------------------------------------------------
  function limparUn(u) { return String(u || "").trim(); }
  function unTex(u) {
    u = limparUn(u);
    if (!u) return "";
    let t = u.replace(/[²³]/g, (c) => "^{" + (c === "²" ? "2" : "3") + "}").replace(/\^(-?\d+)/g, "^{$1}").replace(/[·⋅]/g, "\\,").replace(/[µμ]/g, "\\mu{}").replace(/Ω/g, "\\Omega{}").replace(/°/g, "^{\\circ}").replace(/\s+/g, "\\,");
    return `\\mathrm{${t}}`;
  }
  // σ com 1 a.s. (2 se começar por 1); valor com a mesma casa decimal
  function arredondarIncerteza(v, s) {
    if (!isFinite(v)) return { ok: false, erro: "Valor inválido." };
    if (!(s > 0) || !isFinite(s)) {
      return { ok: true, semIncerteza: true, v, s: 0, p: null, texto: numT(v, 5), html: n(v, 5), latex: latexNum(numT(v, 5)), E: 0 };
    }
    const lead = Number(s.toExponential(15)[0]);
    const sigs = lead === 1 ? 2 : 1;
    const sr = Number(s.toPrecision(sigs));
    const eS = parseInt(sr.toExponential().split("e")[1], 10);
    const p = eS - (sigs - 1);
    const escala = Math.pow(10, p);
    const vr = p < 0 ? Number(v.toFixed(Math.min(-p, 100))) : Math.round(v / escala) * escala;
    const casas = Math.max(0, -p);
    const E = vr === 0 ? 0 : Math.floor(Math.log10(Math.abs(vr)) + 1e-12);
    const sci = Math.abs(vr) >= 1e4 || (vr !== 0 && Math.abs(vr) < 1e-3);
    const dm = E - p;
    const vStr = fixo(vr, casas), sStr = fixo(sr, casas);
    const out = { ok: true, v, s, vr, sr, p, casas, sigs, vStr, sStr, E };
    out.plano = `${vStr} ± ${sStr}`;
    out.comMantissa = null;
    if (dm >= 0 && vr !== 0) {
      const mant = fixo(vr / Math.pow(10, E), dm), ms = fixo(sr / Math.pow(10, E), dm);
      out.sciTexto = `(${mant} ± ${ms}) × 10${sup(E)}`;
      out.sciHTML = `(${mant} ± ${ms}) × 10<sup>${String(E).replace("-", "−")}</sup>`;
      out.sciLatex = `(${mant.replace(",", "{,}")} \\pm ${ms.replace(",", "{,}")}) \\times 10^{${E}}`;
    }
    if (sci && out.sciTexto) {
      out.usaSci = true;
      out.texto = out.sciTexto; out.html = out.sciHTML; out.latex = out.sciLatex;
    } else {
      out.texto = vr === 0 && false ? "" : `${vStr} ± ${sStr}`;
      out.html = out.texto;
      out.latex = `${vStr.replace(",", "{,}")} \\pm ${sStr.replace(",", "{,}")}`;
      if (Math.abs(vr) < 1e-3 && vr !== 0) { /* sem mantissa possível */ }
    }
    return out;
  }
  function latexNum(t) { return t.replace(",", "{,}").replace(/×10([⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)/, (_, e) => "\\times 10^{" + [...e].map((c) => SUP_D[c]).join("") + "}"); }
  // junta o resultado arredondado com a unidade
  function escreverResultado(v, s, un) {
    const r = arredondarIncerteza(v, s);
    if (!r.ok) return r;
    const u = limparUn(un);
    const par = (x, y) => (y && r.usaSci !== undefined ? x : x);
    const comUn = (t, plural) => t + (u ? " " + u : "");
    const base = r.semIncerteza ? r.texto : r.texto;
    const envolver = (t) => (r.semIncerteza || r.usaSci ? t : `(${t})`);
    let txt, html, latex;
    if (r.semIncerteza) { txt = base + (u ? " " + u : ""); html = r.html + (u ? ` <span class="un">${esc(u)}</span>` : ""); latex = r.latex + (u ? "\\,\\" + unTex(u) : ""); }
    else if (r.usaSci) { txt = r.texto + (u ? " " + u : ""); html = r.html + (u ? ` <span class="un">${esc(u)}</span>` : ""); latex = r.latex + (u ? "\\," + unTex(u) : ""); }
    else { txt = (u ? "(" + r.texto + ") " + u : r.texto); html = u ? `(${r.html}) <span class="un">${esc(u)}</span>` : r.html; latex = u ? `(${r.latex})\\,${unTex(u)}` : r.latex; }
    if (r.semIncerteza && u) latex = r.latex + "\\," + unTex(u);
    void par; void comUn; void envolver;
    return { ...r, texto: txt, html, latex };
  }

  // ---------------------------------------------------------------------------
  // Regressão linear
  // ---------------------------------------------------------------------------
  const TRANSF = {
    lin: { nome: "Reta direta", X: (x) => x, Y: (y) => y, tx: "x", ty: "y" },
    exp: { nome: "Exponencial (ln y × x)", X: (x) => x, Y: (y) => Math.log(y), tx: "x", ty: "ln y" },
    pot: { nome: "Lei de potência (ln y × ln x)", X: (x) => Math.log(x), Y: (y) => Math.log(y), tx: "ln x", ty: "ln y" },
    inv: { nome: "Inverso (y × 1/x)", X: (x) => 1 / x, Y: (y) => y, tx: "1/x", ty: "y" },
    log: { nome: "Logarítmica (y × ln x)", X: (x) => Math.log(x), Y: (y) => y, tx: "ln x", ty: "y" },
  };

  // núcleo numérico (sem texto): X, Y, sY (ou null); opções: origem
  function nucleoReta(X, Y, sY, origem) {
    const nn = X.length;
    const pond = !!sY;
    const w = pond ? sY.map((s) => 1 / (s * s)) : X.map(() => 1);
    let S = 0, Sx = 0, Sy = 0, Sxx = 0, Sxy = 0, Syy = 0;
    for (let i = 0; i < nn; i++) { S += w[i]; Sx += w[i] * X[i]; Sy += w[i] * Y[i]; Sxx += w[i] * X[i] * X[i]; Sxy += w[i] * X[i] * Y[i]; Syy += w[i] * Y[i] * Y[i]; }
    const o = { n: nn, pond, S, Sx, Sy, Sxx, Sxy, Syy, w };
    if (origem) {
      o.a = Sxy / Sxx; o.b = 0;
      o.res = X.map((x, i) => Y[i] - o.a * x);
      o.ss = o.res.reduce((t, r, i) => t + w[i] * r * r, 0);
      const gl = nn - 1;
      o.gl = gl;
      o.s2 = gl > 0 ? o.ss / gl : NaN;
      o.sa = pond ? Math.sqrt(1 / Sxx) : Math.sqrt(o.s2 / Sxx);
      o.sb = 0; o.cov = 0;
      o.sTot = Syy;
      o.r2 = Syy > 0 ? 1 - o.ss / Syy : NaN;
      return o;
    }
    const Delta = S * Sxx - Sx * Sx;
    o.Delta = Delta;
    o.a = (S * Sxy - Sx * Sy) / Delta;
    o.b = (Sxx * Sy - Sx * Sxy) / Delta;
    o.res = X.map((x, i) => Y[i] - (o.a * x + o.b));
    o.ss = o.res.reduce((t, r, i) => t + w[i] * r * r, 0);
    o.gl = nn - 2;
    o.xm = Sx / S; o.ym = Sy / S;
    o.Sxxc = Sxx - Sx * Sx / S; o.Sxyc = Sxy - Sx * Sy / S; o.Syyc = Syy - Sy * Sy / S;
    o.s2 = o.gl > 0 ? o.ss / o.gl : NaN;
    if (pond) { o.sa = Math.sqrt(S / Delta); o.sb = Math.sqrt(Sxx / Delta); o.cov = -Sx / Delta; }
    else { o.sa = Math.sqrt(o.s2 / o.Sxxc); o.sb = Math.sqrt(o.s2 * (1 / nn + o.xm * o.xm / o.Sxxc)); o.cov = -o.xm * o.s2 / o.Sxxc; }
    o.r2 = o.Syyc > 0 ? 1 - o.ss / o.Syyc : NaN;
    return o;
  }

  // pts: [{x,y,sy}] · opc: { modo, origem, ponderado, ux, uy }
  function ajustar(pts, opc = {}) {
    const modo = TRANSF[opc.modo] ? opc.modo : "lin";
    const T = TRANSF[modo];
    const origem = !!opc.origem;
    if (!Array.isArray(pts) || !pts.length) return { ok: false, erro: "Informe os pontos (x, y)." };
    const lim = pts.filter((p) => p && isFinite(p.x) && isFinite(p.y));
    if (lim.length < 2) return { ok: false, erro: "Preciso de pelo menos 2 pontos com x e y numéricos." };
    if (origem && (modo === "exp" || modo === "pot")) return { ok: false, erro: "“Reta pela origem” não combina com a linearização exponencial/potência (a origem em ln y seria A = 1). Desmarque essa opção." };
    const pond = !!opc.ponderado;
    if (pond) {
      if (lim.some((p) => !(p.sy > 0) || !isFinite(p.sy))) return { ok: false, erro: "Para o ajuste ponderado, todos os pontos precisam de uma incerteza σy maior que zero." };
    }
    if (modo === "exp" || modo === "pot") if (lim.some((p) => !(p.y > 0))) return { ok: false, erro: `Para ${modo === "exp" ? "ln y" : "ln y"} todos os valores de y precisam ser positivos (o logaritmo só existe para números positivos).` };
    if (modo === "pot" || modo === "log") if (lim.some((p) => !(p.x > 0))) return { ok: false, erro: "Para ln x todos os valores de x precisam ser positivos." };
    if (modo === "inv") if (lim.some((p) => p.x === 0)) return { ok: false, erro: "Para 1/x nenhum x pode ser zero." };
    const nn = lim.length;
    if (!origem && nn < 2) return { ok: false, erro: "Preciso de pelo menos 2 pontos." };
    const X = lim.map((p) => T.X(p.x)), Y = lim.map((p) => T.Y(p.y));
    let sY = null;
    if (pond) sY = lim.map((p) => (modo === "exp" || modo === "pot" ? p.sy / p.y : p.sy));
    const xs = new Set(X.map((v) => v.toPrecision(14)));
    if (!origem && xs.size < 2) return { ok: false, erro: "Todos os x são iguais: não dá para traçar uma reta (a reta seria vertical)." };
    if (origem && X.every((v) => v === 0)) return { ok: false, erro: "Todos os x são zero." };
    const o = nucleoReta(X, Y, sY, origem);
    if (!isFinite(o.a) || !isFinite(o.b)) return { ok: false, erro: "Não consegui calcular a reta com esses dados." };

    const sigs = (v) => n(v, 5);
    const passos = [];
    const lin = modo === "lin";
    // 1. dados
    {
      const MAX = 40;
      const linhas = lim.slice(0, MAX).map((p, i) => {
        const cel = [String(i + 1), n(p.x), n(p.y)];
        if (pond) cel.push(n(p.sy));
        if (!lin) { cel.push(n(X[i])); cel.push(n(Y[i])); if (pond) cel.push(n(sY[i])); }
        return cel;
      });
      const cab = ["#", "x", "y"];
      if (pond) cab.push("σ" + sub("y"));
      if (!lin) { cab.push(T.tx === "x" ? "X = x" : `X = ${T.tx}`); cab.push(`Y = ${T.ty}`); if (pond) cab.push("σ" + sub("Y")); }
      let h = `<p>${nn} pontos (x, y)${pond ? " com incerteza em y" : ""}. ${lin ? "O ajuste é direto: <b>y = a·x + b</b>." : `Para ajustar uma reta a uma relação que não é reta, <b>linearizamos</b>: trocamos as variáveis por <b>X = ${T.tx}</b> e <b>Y = ${T.ty}</b>, e ajustamos <b>Y = a·X + b</b>.`}</p>`;
      if (!lin) {
        h += modo === "exp" ? eq(`y = A·e<sup>k·x</sup> &nbsp;⟹&nbsp; ln y = k·x + ln A`) : modo === "pot" ? eq(`y = A·x<sup>p</sup> &nbsp;⟹&nbsp; ln y = p·ln x + ln A`) : modo === "inv" ? eq(`y = a·(1/x) + b`) : eq(`y = a·ln x + b`);
        if (pond && (modo === "exp" || modo === "pot")) h += eq(`σ${sub("Y")} = σ${sub("y")} / y &nbsp;<small>(propagação de ln y)</small>`);
      }
      h += tabela(cab, linhas);
      if (nn > MAX) h += dica(`Mostrando os ${MAX} primeiros pontos de ${nn}.`);
      passos.push(R("Dados" + (lin ? "" : " e linearização"), h));
    }
    // 2. somas
    if (origem) {
      passos.push(R("Reta pela origem: somas necessárias", `<p>Se sabemos que a reta passa por (0, 0) (por exemplo, a tensão é zero quando a corrente é zero), forçamos <b>b = 0</b> e ajustamos só <b>Y = a·X</b>.</p>${eq(`Σ${pond ? "w·" : ""}X² = ${sigs(o.Sxx)} &nbsp;&nbsp; Σ${pond ? "w·" : ""}X·Y = ${sigs(o.Sxy)}`)}${pond ? dica("w = 1/σ² é o peso de cada ponto: pontos mais precisos pesam mais.") : ""}`));
      passos.push(R("Coeficiente angular", `<p>Minimizando a soma dos quadrados dos resíduos, a inclinação é:</p>${eq(`a = ${frac(`Σ${pond ? "w·" : ""}X·Y`, `Σ${pond ? "w·" : ""}X²`)} = ${frac(sigs(o.Sxy), sigs(o.Sxx))} = <b>${sigs(o.a)}</b>`)}`));
    } else if (pond) {
      passos.push(R("Somas ponderadas", `<p>Cada ponto recebe um peso <b>w = 1/σ²</b>: um ponto com incerteza pequena puxa mais a reta. Calculamos:</p>${eq(`S = Σw = ${sigs(o.S)}`)}${eq(`S${sub("x")} = Σw·X = ${sigs(o.Sx)} &nbsp;&nbsp; S${sub("y")} = Σw·Y = ${sigs(o.Sy)}`)}${eq(`S${sub("xx")} = Σw·X² = ${sigs(o.Sxx)} &nbsp;&nbsp; S${sub("xy")} = Σw·X·Y = ${sigs(o.Sxy)}`)}${eq(`Δ = S·S${sub("xx")} − S${sub("x")}² = ${sigs(o.Delta)}`)}`));
      passos.push(R("Coeficientes (mínimos quadrados ponderados)", `${eq(`a = ${frac(`S·S${sub("xy")} − S${sub("x")}·S${sub("y")}`, "Δ")} = <b>${sigs(o.a)}</b>`)}${eq(`b = ${frac(`S${sub("xx")}·S${sub("y")} − S${sub("x")}·S${sub("xy")}`, "Δ")} = <b>${sigs(o.b)}</b>`)}`));
    } else {
      passos.push(R("Médias e somas de desvios", `<p>Para ajustar a melhor reta, medimos o quanto x e y variam <i>em torno das médias</i>:</p>${eq(`x̄ = ${sigs(o.xm)} &nbsp;&nbsp; ȳ = ${sigs(o.ym)}`)}${eq(`S${sub("xx")} = Σ(x − x̄)² = ${sigs(o.Sxxc)}`)}${eq(`S${sub("xy")} = Σ(x − x̄)(y − ȳ) = ${sigs(o.Sxyc)}`)}${eq(`S${sub("yy")} = Σ(y − ȳ)² = ${sigs(o.Syyc)}`)}${lin ? "" : dica("Aqui x e y significam X e Y (as variáveis já linearizadas).")}`));
      passos.push(R("Coeficientes pela fórmula dos mínimos quadrados", `<p>A reta que <b>minimiza a soma dos quadrados dos resíduos</b> (as distâncias verticais entre os pontos e a reta) tem:</p>${eq(`a = ${frac(`S${sub("xy")}`, `S${sub("xx")}`)} = ${frac(sigs(o.Sxyc), sigs(o.Sxxc))} = <b>${sigs(o.a)}</b>`)}${eq(`b = ȳ − a·x̄ = ${sigs(o.ym)} − (${sigs(o.a)})(${sigs(o.xm)}) = <b>${sigs(o.b)}</b>`)}${dica("a é a inclinação (quanto y varia por unidade de x) e b é o intercepto (valor de y quando x = 0).")}`));
    }
    // 3. resíduos
    {
      const MAX = 40;
      const cab = ["#", "X", "Y", "Ŷ = aX+b", "resíduo Y − Ŷ"];
      if (pond) cab.push("resíduo/σ");
      const linhas = X.slice(0, MAX).map((x, i) => {
        const l = [String(i + 1), n(x), n(Y[i]), n(o.a * x + o.b), n(o.res[i])];
        if (pond) l.push(n(o.res[i] / sY[i], 3));
        return l;
      });
      let h = `<p>Resíduo = valor medido − valor previsto pela reta. Se a reta é um bom modelo, os resíduos ficam espalhados ao acaso em torno de zero, sem padrão (sem curva, sem “funil”).</p>${tabela(cab, linhas)}`;
      if (nn > MAX) h += dica(`Mostrando ${MAX} de ${nn} linhas.`);
      h += eq(pond ? `χ² = Σ(resíduo/σ)² = ${sigs(o.ss)}` : `SQR = Σ resíduo² = ${sigs(o.ss)}`);
      if (o.gl > 0) {
        if (pond) h += eq(`χ²${sub("red")} = χ² / (n − ${origem ? 1 : 2}) = ${sigs(o.ss)} / ${o.gl} = <b>${sigs(o.s2)}</b>`) + dica("χ²<sub>red</sub> perto de 1 indica que as incertezas informadas explicam a dispersão dos pontos. Muito maior que 1: as incertezas estão subestimadas ou o modelo não é reta. Muito menor que 1: incertezas superestimadas.");
        else h += eq(`s = √(SQR / (n − ${origem ? 1 : 2})) = √(${sigs(o.ss)} / ${o.gl}) = <b>${sigs(Math.sqrt(o.s2))}</b>`) + dica("s é o desvio-padrão dos resíduos: o “erro típico” de um ponto em relação à reta, na unidade de Y. Dividimos por n − 2 (e não n) porque dois parâmetros (a e b) foram estimados dos mesmos dados.");
      } else h += aviso("com apenas " + nn + " pontos não há graus de liberdade para estimar a dispersão: a reta passa exatamente pelos pontos e não dá para calcular incertezas estatísticas.");
      passos.push(R("Resíduos e dispersão", h));
    }
    // 4. incertezas
    {
      let h;
      if (!(o.gl > 0) && !pond) h = `<p>Sem graus de liberdade (n − ${origem ? 1 : 2} = ${o.gl}): as incertezas de a e b não podem ser estimadas. Meça mais pontos.</p>`;
      else if (origem) {
        h = `<p>A incerteza do coeficiente angular diz o quanto ele mudaria se repetíssemos o experimento:</p>${eq(pond ? `σ${sub("a")} = 1/√(Σw·X²) = 1/√${sigs(o.Sxx)} = <b>${sigs(o.sa)}</b>` : `σ${sub("a")} = ${frac("s", `√(ΣX²)`)} = ${frac(sigs(Math.sqrt(o.s2)), `√${sigs(o.Sxx)}`)} = <b>${sigs(o.sa)}</b>`)}`;
      } else if (pond) {
        h = `<p>Com incertezas conhecidas em y, as incertezas dos parâmetros vêm direto dos pesos:</p>${eq(`σ${sub("a")} = √(S/Δ) = √(${sigs(o.S)}/${sigs(o.Delta)}) = <b>${sigs(o.sa)}</b>`)}${eq(`σ${sub("b")} = √(S${sub("xx")}/Δ) = <b>${sigs(o.sb)}</b>`)}${o.gl > 0 && o.s2 > 1 ? dica(`Como χ²<sub>red</sub> = ${sigs(o.s2)} &gt; 1, uma estimativa mais prudente multiplica essas incertezas por √χ²<sub>red</sub> = ${sigs(Math.sqrt(o.s2))}: σ<sub>a</sub> ≈ ${sigs(o.sa * Math.sqrt(o.s2))}, σ<sub>b</sub> ≈ ${sigs(o.sb * Math.sqrt(o.s2))}.`) : ""}`;
      } else {
        h = `<p>As incertezas dizem o quanto a e b mudariam se repetíssemos o experimento com outros pontos semelhantes:</p>${eq(`σ${sub("a")} = ${frac("s", `√S${sub("xx")}`)} = ${frac(sigs(Math.sqrt(o.s2)), `√${sigs(o.Sxxc)}`)} = <b>${sigs(o.sa)}</b>`)}${eq(`σ${sub("b")} = s·√(${frac("1", "n")} + ${frac("x̄²", `S${sub("xx")}`)}) = <b>${sigs(o.sb)}</b>`)}${dica("Quanto mais espalhados os valores de x e quanto mais pontos, menor a incerteza de a.")}`;
      }
      passos.push(R("Incertezas dos coeficientes", h));
    }
    // 5. R²
    {
      let h;
      if (!isFinite(o.r2)) h = "<p>Todos os valores de y são iguais, então R² não está definido (não há variação para explicar).</p>";
      else {
        h = `<p>O <b>coeficiente de determinação R²</b> diz que fração da variação de Y a reta explica. 1 = a reta explica tudo; 0 = não explica nada.</p>${eq(`R² = 1 − ${frac("SQR", origem ? "ΣY²" : `S${sub("yy")}`)} = 1 − ${frac(sigs(o.ss), sigs(origem ? o.Syy : o.Syyc))} = <b>${sigs(o.r2)}</b>`)}`;
        if (pond) h = h.replace(/SQR/g, "χ²").replace(/<small>[^<]*<\/small>/g, "") + dica("No ajuste ponderado, os somatórios usam os pesos w = 1/σ².");
        if (origem) h += dica("Na reta pela origem, R² usa ΣY² (e não os desvios em torno da média); não é comparável ao R² de um ajuste com intercepto.");
        h += dica("R² alto não prova que a reta é o modelo certo: sempre olhe o gráfico e os resíduos (os quatro conjuntos de Anscombe têm o mesmo R² e formatos totalmente diferentes).");
      }
      passos.push(R("Qualidade do ajuste: R²", h));
    }
    // 6. parâmetros originais
    const par = { a: o.a, sa: o.sa, b: o.b, sb: o.sb };
    const nomesPar = [];
    const unx = opc.ux || "", uny = opc.uy || "";
    const reg = { modo, T, ...o };
    if (modo === "exp") {
      par.k = o.a; par.sk = o.sa; par.A = Math.exp(o.b); par.sA = par.A * o.sb;
      const h = `<p>Voltando à relação original <b>y = A·e<sup>k·x</sup></b>:</p>${eq(`k = a = <b>${sigs(par.k)}</b> ± ${sigs(par.sk)}`)}${eq(`A = e<sup>b</sup> = e<sup>${sigs(o.b)}</sup> = <b>${sigs(par.A)}</b>`)}${eq(`σ${sub("A")} ≈ A·σ${sub("b")} = ${sigs(par.sA)}`)}${dica("Como ln A = b, a incerteza relativa de A é igual a σ<sub>b</sub> (propagação de uma exponencial).")}`;
      let extra = "";
      if (par.k < 0) { par.tau = -1 / par.k; par.stau = par.sk / (par.k * par.k); par.meia = Math.LN2 / -par.k; par.smeia = Math.LN2 * par.sk / (par.k * par.k); extra = eq(`τ = −1/k = ${sigs(par.tau)} ± ${sigs(par.stau)}`) + eq(`t${sub("1/2")} = ln 2 / |k| = <b>${sigs(par.meia)}</b> ± ${sigs(par.smeia)}`) + dica("Para um decaimento (k &lt; 0), τ é o tempo característico e t<sub>1/2</sub> a meia-vida."); }
      else if (par.k > 0) { par.dobra = Math.LN2 / par.k; par.sdobra = Math.LN2 * par.sk / (par.k * par.k); extra = eq(`tempo de dobra = ln 2 / k = <b>${sigs(par.dobra)}</b> ± ${sigs(par.sdobra)}`); }
      passos.push(R("Voltando aos parâmetros originais", h + extra));
    } else if (modo === "pot") {
      par.p = o.a; par.sp = o.sa; par.A = Math.exp(o.b); par.sA = par.A * o.sb;
      passos.push(R("Voltando aos parâmetros originais", `<p>Voltando à relação original <b>y = A·x<sup>p</sup></b>:</p>${eq(`p = a = <b>${sigs(par.p)}</b> ± ${sigs(par.sp)}`)}${eq(`A = e<sup>b</sup> = <b>${sigs(par.A)}</b> &nbsp;(σ${sub("A")} ≈ ${sigs(par.sA)})`)}${dica("O expoente p é a inclinação no gráfico log-log. Se p ≈ 1 a relação é linear; p ≈ 2 é quadrática; p ≈ −1 é inversa.")}`));
    } else if (modo === "inv") {
      passos.push(R("Voltando aos parâmetros originais", `<p>A relação original é <b>y = a/x + b</b>: o a do ajuste é o coeficiente do termo 1/x (<b>${sigs(o.a)}</b> ± ${sigs(o.sa)}) e b é o valor para o qual y tende quando x cresce (<b>${sigs(o.b)}</b> ± ${sigs(o.sb)}).</p>`));
    } else if (modo === "log") {
      passos.push(R("Voltando aos parâmetros originais", `<p>A relação original é <b>y = a·ln x + b</b>. O ajuste dá a = <b>${sigs(o.a)}</b> ± ${sigs(o.sa)} e b = <b>${sigs(o.b)}</b> ± ${sigs(o.sb)} (a cada vez que x multiplica por e ≈ 2,718, y varia a).</p>`));
    }
    // 7. R² no espaço original e interpretação
    const predY = (X0) => o.a * X0 + o.b;
    const varLinha = (X0) => (origem ? X0 * X0 * o.sa * o.sa : o.sb * o.sb + X0 * X0 * o.sa * o.sa + 2 * X0 * o.cov);
    const predizer = (x0) => {
      if (!isFinite(x0)) return { ok: false, erro: "Digite um valor numérico de x." };
      if ((modo === "pot" || modo === "log") && !(x0 > 0)) return { ok: false, erro: "x precisa ser positivo nesta linearização." };
      if (modo === "inv" && x0 === 0) return { ok: false, erro: "x não pode ser zero." };
      const X0 = T.X(x0);
      const Yh = predY(X0);
      let sYh = Math.sqrt(Math.max(0, varLinha(X0)));
      if (!isFinite(sYh)) sYh = NaN;
      if (modo === "exp" || modo === "pot") { const yy = Math.exp(Yh); return { ok: true, x: x0, y: yy, sy: yy * sYh }; }
      return { ok: true, x: x0, y: Yh, sy: sYh };
    };
    let r2orig = o.r2;
    if (!lin) {
      const yo = lim.map((p) => p.y), ym = yo.reduce((a, b) => a + b, 0) / nn;
      const ss = lim.reduce((t, p) => t + Math.pow(p.y - predizer(p.x).y, 2), 0);
      const tot = yo.reduce((t, v) => t + (v - ym) * (v - ym), 0);
      r2orig = tot > 0 ? 1 - ss / tot : NaN;
    }
    {
      const itens = [];
      if (isFinite(o.r2)) itens.push(`<li><b>R² = ${n(o.r2, 4)}</b>${!lin ? ` (no espaço linearizado) e ${n(r2orig, 4)} nos dados originais` : ""}: ${o.r2 > 0.99 ? "a reta explica quase toda a variação." : o.r2 > 0.9 ? "ajuste bom, mas confira o gráfico." : o.r2 > 0.7 ? "ajuste moderado; talvez o modelo não seja reta, ou os dados tenham muito ruído." : "ajuste fraco: a reta explica pouco da variação."}</li>`);
      if (isFinite(o.sa) && o.sa > 0) {
        const t = Math.abs(o.a) / o.sa;
        itens.push(`<li>A inclinação vale ${n(t, 3)} vezes a sua incerteza (|a|/σ<sub>a</sub>): ${t > 5 ? "bem diferente de zero, há relação clara entre as variáveis." : t > 2 ? "diferente de zero, porém sem muita folga." : "<b>compatível com zero</b>: com estes dados não dá para afirmar que y depende de x."}</li>`);
      }
      if (!origem && isFinite(o.sb) && o.sb > 0) {
        const t = Math.abs(o.b) / o.sb;
        itens.push(`<li>O intercepto b está a ${n(t, 3)} incertezas de zero: ${t < 2 ? "<b>compatível com zero</b> (a reta pode passar pela origem)." : "diferente de zero (há um “deslocamento” sistemático)."}</li>`);
      }
      if (pond && o.gl > 0) itens.push(`<li>χ²<sub>red</sub> = ${n(o.s2, 3)}: ${o.s2 > 3 ? "bem acima de 1, as incertezas parecem subestimadas ou a reta não é o modelo certo." : o.s2 < 0.3 ? "bem abaixo de 1, as incertezas parecem superestimadas." : "próximo de 1, ajuste consistente com as incertezas."}</li>`);
      passos.push(R("Como interpretar", `<ul class="lista">${itens.join("")}</ul>${dica("Relate a, b e suas incertezas arredondadas, junto com o gráfico e os resíduos.")}`));
    }

    // resposta
    const ea = escreverResultado(o.a, o.sa, ""), eb = escreverResultado(o.b, o.sb, "");
    const eqTxt = origem ? `${modo === "lin" ? "y" : "Y"} = (${ea.texto}) · X` : `${modo === "lin" ? "y" : "Y"} = (${ea.texto}) · X + (${eb.texto})`;
    const sufLin = lin ? "" : `  [X = ${T.tx}, Y = ${T.ty}]`;
    let resposta = `${eqTxt.replace(/ · X/, lin ? "·x" : "·X")}${sufLin}; R² = ${numT(o.r2, 4)}`;
    if (lin) resposta = resposta.replace(/·X/g, "·x");
    let respostaHTML = `<b>${lin ? "y" : "Y"} = (${ea.html})·${lin ? "x" : "X"}${origem ? "" : " + (" + eb.html + ")"}</b><br><small>R² = ${n(o.r2, 4)} · ${nn} pontos${!lin ? ` · X = ${T.tx}, Y = ${T.ty}` : ""}</small>`;
    if (modo === "exp") {
      const eA = escreverResultado(par.A, par.sA, uny), ek = escreverResultado(par.k, par.sk, unx ? "1/(" + unx + ")" : "");
      resposta += `;  y = A·e^(k·x) com A = ${eA.texto}, k = ${ek.texto}`;
      respostaHTML += `<br><small>y = A·e<sup>k·x</sup> com A = ${eA.html}, k = ${ek.html}</small>`;
    } else if (modo === "pot") {
      const eA = escreverResultado(par.A, par.sA, ""), ep = escreverResultado(par.p, par.sp, "");
      resposta += `;  y = A·x^p com A = ${eA.texto}, p = ${ep.texto}`;
      respostaHTML += `<br><small>y = A·x<sup>p</sup> com A = ${eA.html}, p = ${ep.html}</small>`;
    }
    return {
      ok: true, passos, resposta, respostaHTML, modo, origem, pond, n: nn, a: o.a, b: o.b, sa: o.sa, sb: o.sb, r2: o.r2, r2orig, s: Math.sqrt(o.s2), chi2red: pond ? o.s2 : undefined, gl: o.gl,
      cov: o.cov, par, X, Y, sY, residuos: o.res, pontos: lim, predizer, T, xm: o.xm, Sxx: o.Sxxc, Sxy: o.Sxyc, Syy: o.Syyc, bruto: o,
    };
  }

  // ---------------------------------------------------------------------------
  // Propagação de incertezas
  // ---------------------------------------------------------------------------
  function derivadaNumerica(f, x, h0) {
    const base = h0 > 0 ? h0 : Math.max(Math.abs(x) * 1e-2, 1e-3);
    let ant = null, melhor = NaN;
    let h = base;
    for (let k = 0; k < 14; k++) {
      let d1 = (f(x + h) - f(x - h)) / (2 * h);
      let d2 = (f(x + h / 2) - f(x - h / 2)) / h;
      let d = (4 * d2 - d1) / 3; // Richardson
      if (!isFinite(d)) {
        // domínio restrito: tenta diferença unilateral
        const um = (f(x + h) - f(x)) / h, dois = (f(x + h / 2) - f(x)) / (h / 2);
        d = 2 * dois - um;
        if (!isFinite(d)) { h /= 2; continue; }
      }
      if (ant !== null && Math.abs(d - ant) <= 1e-9 * (Math.abs(d) + 1e-300) + 1e-14 * Math.abs(base)) return d;
      ant = d; melhor = d; h /= 2;
    }
    return melhor;
  }
  function lerIncerteza(txt, v) {
    const t = String(txt == null ? "" : txt).trim();
    if (!t) return 0;
    if (t.endsWith("%")) { const p = lerNumero(t.slice(0, -1)); return isFinite(p) ? Math.abs(v) * Math.abs(p) / 100 : NaN; }
    const s = lerNumero(t);
    return isFinite(s) ? Math.abs(s) : NaN;
  }
  function variaveisDe(exprTxt) {
    try {
      const X = getX();
      const ast = X.ler(exprTxt);
      return { ok: true, nomes: X.variaveis(ast), ast };
    } catch (e) { return { ok: false, erro: e.message }; }
  }
  // vars: { nome: { v, s, u } }  (v, s podem ser texto; s aceita "2%")
  function propagar(exprTxt, vars, opc = {}) {
    const X = getX();
    let ast, nomes;
    try { ast = X.ler(exprTxt); nomes = X.variaveis(ast); } catch (e) { return { ok: false, erro: e.message }; }
    if (!nomes.length) return { ok: false, erro: "A expressão não tem variáveis. Escreva algo como m*g*h, com letras para as grandezas medidas." };
    const val = {}, sg = {}, un = {};
    for (const nm of nomes) {
      const d = vars && vars[nm];
      if (!d || d.v === "" || d.v == null) return { ok: false, erro: `Falta o valor de ${nm}.` };
      const v = typeof d.v === "number" ? d.v : lerNumero(d.v);
      if (!isFinite(v)) return { ok: false, erro: `Não entendi o valor de ${nm}. Use vírgula ou ponto (ex.: 9,81 ou 3e8).` };
      const s = typeof d.s === "number" ? Math.abs(d.s) : lerIncerteza(d.s, v);
      if (!isFinite(s)) return { ok: false, erro: `Não entendi a incerteza de ${nm}. Use um número (0,05) ou uma porcentagem (2%).` };
      val[nm] = v; sg[nm] = s; un[nm] = limparUn(d.u);
    }
    const f = (vv) => X.avaliar(ast, vv);
    let f0;
    try { f0 = f(val); } catch (e) { return { ok: false, erro: e.message }; }
    if (!isFinite(f0)) return { ok: false, erro: "A expressão não dá um número real com esses valores (divisão por zero, raiz de negativo ou logaritmo de zero?)." };
    const ders = {};
    for (const nm of nomes) {
      const g = (t) => { const vv = { ...val }; vv[nm] = t; return f(vv); };
      const h0 = Math.max(sg[nm] > 0 ? sg[nm] * 0.5 : 0, Math.abs(val[nm]) * 1e-2, 1e-3 * (Math.abs(val[nm]) || 1));
      ders[nm] = derivadaNumerica(g, val[nm], Math.min(h0, Math.max(Math.abs(val[nm]), 1e-3) * 0.1));
      if (!isFinite(ders[nm])) return { ok: false, erro: `Não consegui derivar em relação a ${nm} nesse ponto (a função não é definida ao redor de ${numT(val[nm])}).` };
    }
    const contr = nomes.map((nm) => ({ nome: nm, d: ders[nm], s: sg[nm], c: ders[nm] * sg[nm], c2: Math.pow(ders[nm] * sg[nm], 2) }));
    const var2 = contr.reduce((t, c) => t + c.c2, 0);
    const sq = Math.sqrt(var2);
    const pior = contr.reduce((t, c) => t + Math.abs(c.c), 0);
    contr.forEach((c) => { c.pct = var2 > 0 ? (100 * c.c2) / var2 : 0; c.pctLin = pior > 0 ? (100 * Math.abs(c.c)) / pior : 0; });
    const dominante = contr.slice().sort((a, b) => b.c2 - a.c2)[0];
    const un_ = limparUn(opc.unidade);
    const esq = escreverResultado(f0, sq, un_), epi = escreverResultado(f0, pior, un_);
    const passos = [];
    const Hexp = X.paraHTML(ast);
    passos.push(R("Por que propagar incertezas", `<p>Cada medida tem uma <b>incerteza</b> (σ): uma faixa de valores plausíveis para o valor verdadeiro. Quando calculamos algo a partir de medidas, essas incertezas “se propagam” para o resultado. Precisamos dizer quão incerto ele ficou.</p>${eq(`f = ${Hexp}`)}<ul class="lista">${nomes.map((nm) => `<li>${X.paraHTML({ t: "var", n: nm })} = ${n(val[nm], 6)} ± ${sg[nm] > 0 ? n(sg[nm], 3) : "0 (sem incerteza)"}${un[nm] ? ` <span class="un">${esc(un[nm])}</span>` : ""}</li>`).join("")}</ul>`));
    passos.push(R("Valor central", `<p>Substitua os valores medidos na expressão:</p>${eq(`f = ${n(f0, 8)}${un_ ? ` <span class="un">${esc(un_)}</span>` : ""}`)}`));
    passos.push(R("Derivadas parciais (sensibilidade)", `<p>Para saber quanto cada variável “pesa” no erro, calculamos a derivada parcial ∂f/∂x: quanto f muda quando só aquela variável varia de uma unidade. Aqui a derivada é feita <b>numericamente</b> (diferença central com refinamento, h → 0), o que funciona para qualquer expressão.</p>${eq(`∂f/∂x ≈ ${frac("f(x + h) − f(x − h)", "2h")}`)}${tabela(["Variável", "∂f/∂x", "σ", "|∂f/∂x|·σ"], contr.map((c) => [X.paraHTML({ t: "var", n: c.nome }), n(c.d, 6), n(c.s, 3), n(Math.abs(c.c), 4)]))}`));
    passos.push(R("Soma em quadratura (incertezas independentes)", `<p>Se os erros das medidas são independentes, eles tendem a se compensar parcialmente, então somamos os quadrados:</p>${eq(`σ${sub("f")} = √( Σ (∂f/∂x${sub("i")} · σ${sub("i")})² )`)}${eq(`σ${sub("f")} = √( ${contr.map((c) => n(c.c2, 4)).join(" + ")} ) = √${n(var2, 5)} = <b>${n(sq, 5)}</b>`)}`));
    passos.push(R("Pior caso (soma linear)", `<p>Se os erros pudessem todos se somar no mesmo sentido (ou estiverem correlacionados), a incerteza máxima seria:</p>${eq(`σ${sub("max")} = Σ |∂f/∂x${sub("i")}|·σ${sub("i")} = ${contr.map((c) => n(Math.abs(c.c), 4)).join(" + ")} = <b>${n(pior, 5)}</b>`)}${dica("A quadratura é a estimativa usual; o pior caso é um limite superior prudente (sempre ≥ quadratura).")}`));
    passos.push(R("Quem domina o erro?", `<p>A fração da variância (σ²) vinda de cada variável mostra onde vale a pena melhorar a medida:</p>${tabela(["Variável", "contribuição σ²", "%"], contr.slice().sort((a, b) => b.pct - a.pct).map((c) => [X.paraHTML({ t: "var", n: c.nome }), n(c.c2, 4), `<span class="pq-barra"><i style="width:${Math.min(100, c.pct).toFixed(1)}%"></i></span> ${c.pct.toFixed(1).replace(".", ",")}%`]))}${var2 > 0 ? `<p><b>${X.paraHTML({ t: "var", n: dominante.nome })}</b> responde por <b>${dominante.pct.toFixed(1).replace(".", ",")}%</b> da variância. Melhorar as outras medidas pouco ajudaria.</p>` : "<p>Nenhuma variável tem incerteza, então o resultado não tem incerteza.</p>"}`));
    let ar;
    if (var2 > 0) {
      ar = `<p>Regra: a incerteza se escreve com <b>1 algarismo significativo</b> (2 se o primeiro for 1), e o valor é arredondado na <b>mesma casa decimal</b> da incerteza.</p>${eq(`σ${sub("f")} = ${n(sq, 6)} ⟶ ${esq.sStr}`)}${eq(`f = ${n(f0, 8)} ⟶ ${esq.vStr}`)}<div class="eq"><b>${esq.html}</b></div>${esq.sciHTML && !esq.usaSci ? `<div class="eq">${esq.sciHTML}${un_ ? ` <span class="un">${esc(un_)}</span>` : ""}</div>` : ""}${dica("Escrever o valor com mais casas do que a incerteza permite é “mentir” sobre a precisão; com menos, joga informação fora.")}`;
    } else ar = `<p>Sem incerteza nas entradas: resultado ${n(f0, 8)}.</p>`;
    passos.push(R("Arredondamento e escrita final", ar));
    const aprox = contr.some((c) => Math.abs(val[c.nome]) > 0 && c.s / Math.abs(val[c.nome]) > 0.1);
    if (aprox) passos.push(R("Limite do método", `<p>Alguma incerteza relativa passa de 10%. O método de derivadas (primeira ordem) é uma boa aproximação para incertezas pequenas; com erros grandes ou funções muito curvas, o resultado pode ser impreciso (nesse caso, uma simulação de Monte Carlo seria mais fiel).</p>`));
    return {
      ok: true, passos, valor: f0, sigma: sq, sigmaMax: pior, contribuicoes: contr, dominante: dominante.nome, variaveis: nomes,
      resposta: esq.texto, respostaHTML: `<b>${esq.html}</b><br><small>pior caso: ${epi.html} · domina: ${esc(dominante.nome)} (${dominante.pct.toFixed(0)}%)</small>`,
      texto: esq.texto, latex: esq.latex, textoMax: epi.texto, escrita: esq,
    };
  }

  // ---------------------------------------------------------------------------
  // Estatística de medidas
  // ---------------------------------------------------------------------------
  const T_NU = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30];
  const T_TAB = {
    0.9: [6.314, 2.920, 2.353, 2.132, 2.015, 1.943, 1.895, 1.860, 1.833, 1.812, 1.796, 1.782, 1.771, 1.761, 1.753, 1.746, 1.740, 1.734, 1.729, 1.725, 1.721, 1.717, 1.714, 1.711, 1.708, 1.706, 1.703, 1.701, 1.699, 1.697],
    0.95: [12.706, 4.303, 3.182, 2.776, 2.571, 2.447, 2.365, 2.306, 2.262, 2.228, 2.201, 2.179, 2.160, 2.145, 2.131, 2.120, 2.110, 2.101, 2.093, 2.086, 2.080, 2.074, 2.069, 2.064, 2.060, 2.056, 2.052, 2.048, 2.045, 2.042],
    0.99: [63.657, 9.925, 5.841, 4.604, 4.032, 3.707, 3.499, 3.355, 3.250, 3.169, 3.106, 3.055, 3.012, 2.977, 2.947, 2.921, 2.898, 2.878, 2.861, 2.845, 2.831, 2.819, 2.807, 2.797, 2.787, 2.779, 2.771, 2.763, 2.756, 2.750],
  };
  const T_GRANDE = { 0.9: { 40: 1.684, 60: 1.671, 120: 1.658, inf: 1.645 }, 0.95: { 40: 2.021, 60: 2.000, 120: 1.980, inf: 1.960 }, 0.99: { 40: 2.704, 60: 2.660, 120: 2.617, inf: 2.576 } };
  function tStudent(nu, conf = 0.95) {
    const c = [0.9, 0.95, 0.99].find((k) => Math.abs(k - conf) < 1e-9);
    if (!c) return NaN;
    nu = Math.floor(nu);
    if (!(nu >= 1)) return NaN;
    if (nu <= 30) return T_TAB[c][nu - 1];
    const G = T_GRANDE[c];
    const nodes = [[30, T_TAB[c][29]], [40, G[40]], [60, G[60]], [120, G[120]], [Infinity, G.inf]];
    for (let i = 0; i < nodes.length - 1; i++) {
      const [n1, t1] = nodes[i], [n2, t2] = nodes[i + 1];
      if (nu >= n1 && nu <= n2) {
        const u1 = 1 / n1, u2 = n2 === Infinity ? 0 : 1 / n2, u = 1 / nu;
        return t1 + ((u - u1) / (u2 - u1)) * (t2 - t1);
      }
    }
    return G.inf;
  }
  function erfc(x) {
    if (x < 0) return 2 - erfc(-x);
    if (x < 2.5) {
      let soma = x, termo = x;
      for (let k = 1; k < 80; k++) {
        termo *= -x * x / k;
        const t = termo / (2 * k + 1);
        soma += t;
        if (Math.abs(t) < 1e-17 * Math.abs(soma)) break;
      }
      return 1 - (2 / Math.sqrt(Math.PI)) * soma;
    }
    // fração contínua para a cauda
    let f = 0;
    for (let k = 80; k >= 1; k--) f = (k / 2) / (x + f);
    return Math.exp(-x * x) / Math.sqrt(Math.PI) / (x + f);
  }
  function zChauvenet(nn) {
    let lo = 0, hi = 10;
    for (let i = 0; i < 80; i++) { const mid = (lo + hi) / 2; if (nn * erfc(mid / Math.SQRT2) > 0.5) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
  }
  function mediana(v) {
    const s = v.slice().sort((a, b) => a - b), m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }
  function estatBasica(v) {
    const nn = v.length, m = v.reduce((a, b) => a + b, 0) / nn;
    const ss = v.reduce((t, x) => t + (x - m) * (x - m), 0);
    const s = nn > 1 ? Math.sqrt(ss / (nn - 1)) : NaN;
    return { n: nn, media: m, ss, s, sm: s / Math.sqrt(nn), mediana: mediana(v) };
  }
  function histograma(v, bins) {
    const mn = Math.min(...v), mx = Math.max(...v);
    const k = bins || Math.max(3, Math.min(12, Math.round(Math.sqrt(v.length))));
    if (mx === mn) return [{ lo: mn - 0.5, hi: mx + 0.5, c: v.length }];
    const w = (mx - mn) / k;
    const out = Array.from({ length: k }, (_, i) => ({ lo: mn + i * w, hi: mn + (i + 1) * w, c: 0 }));
    v.forEach((x) => { let i = Math.floor((x - mn) / w); if (i >= k) i = k - 1; out[i].c++; });
    return out;
  }
  // valores: números; opc: { conf, excluir:[índices], unidade }
  function estatistica(valores, opc = {}) {
    if (!Array.isArray(valores) || valores.length < 2) return { ok: false, erro: "Preciso de pelo menos 2 medidas para calcular o desvio-padrão." };
    if (valores.some((x) => !isFinite(x))) return { ok: false, erro: "Há valores que não são números." };
    const conf = [0.9, 0.95, 0.99].includes(opc.conf) ? opc.conf : 0.95;
    const excl = new Set(opc.excluir || []);
    const idx = valores.map((_, i) => i).filter((i) => !excl.has(i));
    const v = idx.map((i) => valores[i]);
    if (v.length < 2) return { ok: false, erro: "Sobraram menos de 2 medidas depois de excluir." };
    const un = limparUn(opc.unidade);
    const B = estatBasica(v);
    const { n: nn, media: m, s, sm } = B;
    const nu = nn - 1;
    const t = tStudent(nu, conf);
    const ic = t * sm;
    const passos = [];
    const unH = un ? ` <span class="un">${esc(un)}</span>` : "";
    const ordenado = v.slice().sort((a, b) => a - b);
    passos.push(R("Medidas", `<p>${nn} medidas${excl.size ? ` (excluí ${excl.size} como discrepante${excl.size > 1 ? "s" : ""})` : ""}. Medir várias vezes a mesma grandeza e fazer a média reduz o efeito dos erros aleatórios.</p><div class="eq">${ordenado.map((x) => n(x, 6)).join(" &nbsp; ")}${unH}</div>`));
    passos.push(R("Média", `<p>A melhor estimativa do valor verdadeiro é a média aritmética:</p>${eq(`x̄ = ${frac("Σx" + sub("i"), "n")} = ${frac(n(v.reduce((a, b) => a + b, 0), 8), String(nn))} = <b>${n(m, 8)}</b>${unH}`)}`));
    passos.push(R("Mediana", `<p>A mediana é o valor do meio das medidas ordenadas${nn % 2 ? "" : " (com n par, a média dos dois do meio)"}. Ela resiste a valores discrepantes.</p>${eq(`mediana = <b>${n(B.mediana, 8)}</b>${unH}`)}${Math.abs(B.mediana - m) > 2 * sm ? dica("Média e mediana bem diferentes podem indicar um valor discrepante ou distribuição assimétrica.") : ""}`));
    {
      const MAX = 25;
      const linhas = v.slice(0, MAX).map((x, i) => [String(i + 1), n(x, 6), n(x - m, 4), n((x - m) * (x - m), 4)]);
      passos.push(R("Desvio-padrão amostral", `<p>O desvio-padrão <b>s</b> mede a dispersão das medidas ao redor da média (o “erro de uma medida”). Usamos n − 1 no denominador porque a média já foi calculada dos mesmos dados.</p>${tabela(["#", "xᵢ", "xᵢ − x̄", "(xᵢ − x̄)²"], linhas)}${nn > MAX ? dica(`Mostrando ${MAX} de ${nn}.`) : ""}${eq(`s = √( ${frac("Σ(x" + sub("i") + " − x̄)²", "n − 1")} ) = √( ${frac(n(B.ss, 6), String(nu))} ) = <b>${n(s, 6)}</b>${unH}`)}`));
    }
    passos.push(R("Erro-padrão da média", `<p>A média é mais confiável que uma medida isolada. Com n medidas, a incerteza da <b>média</b> encolhe com √n:</p>${eq(`σ${sub("x̄")} = ${frac("s", "√n")} = ${frac(n(s, 6), `√${nn}`)} = <b>${n(sm, 6)}</b>${unH}`)}${dica("Para reduzir a incerteza da média à metade é preciso 4 vezes mais medidas.")}`));
    const relS = m !== 0 ? (100 * s) / Math.abs(m) : NaN, relM = m !== 0 ? (100 * sm) / Math.abs(m) : NaN;
    passos.push(R("Incerteza relativa", `<p>Dividindo pela média, a incerteza vira uma porcentagem, boa para comparar medidas de ordens de grandeza diferentes:</p>${eq(`σ${sub("x̄")} / |x̄| = ${n(sm, 5)} / ${n(Math.abs(m), 5)} = <b>${isFinite(relM) ? n(relM, 3) + " %" : "—"}</b>`)}${isFinite(relS) ? dica(`Uma medida isolada tem incerteza relativa s/|x̄| = ${n(relS, 3)}%.`) : ""}`));
    passos.push(R(`Intervalo de confiança de ${Math.round(conf * 100)}%`, `<p>Com poucas medidas, o desvio-padrão ele mesmo é incerto; por isso o fator multiplicador não é 2, e sim o <b>t de Student</b> (n − 1 = ${nu} graus de liberdade):</p>${eq(`t = ${t.toFixed(3).replace(".", ",")} &nbsp;(tabela, ${Math.round(conf * 100)}%, ν = ${nu})`)}${eq(`IC = x̄ ± t·σ${sub("x̄")} = ${n(m, 6)} ± ${n(t, 4)}·${n(sm, 5)} = ${n(m, 6)} ± <b>${n(ic, 5)}</b>`)}${dica(`Interpretação: se repetíssemos o experimento muitas vezes, ${Math.round(conf * 100)}% dos intervalos assim construídos conteriam o valor verdadeiro (supondo erros aleatórios aproximadamente normais).`)}`));
    // Chauvenet
    const zc = zChauvenet(nn);
    const suspeitos = [];
    const linhasC = idx.map((i, k) => {
      const z = s > 0 ? Math.abs(valores[i] - m) / s : 0;
      const p = erfc(z / Math.SQRT2);
      const flag = s > 0 && nn * p < 0.5;
      if (flag) suspeitos.push({ indice: i, valor: valores[i], z, nP: nn * p });
      return [String(i + 1), n(valores[i], 6), n(z, 3), n(nn * p, 3), flag ? "<b>discrepante?</b>" : "ok"];
    });
    const base = s > 0 ? tabela(["#", "x", "|x − x̄|/s", "n·P", "critério"], linhasC.slice(0, 30)) : "";
    passos.push(R("Valor discrepante? (critério de Chauvenet)", `<p>Uma medida muito distante das outras pode ser um engano (erro de leitura, perturbação) ou só azar. O critério de Chauvenet a rejeita se a chance de ocorrer uma medida tão distante em n medidas for menor que 1/2:</p>${eq(`n · P(|Z| &gt; z) &lt; 0,5 &nbsp;onde&nbsp; z = |x − x̄|/s &nbsp;e&nbsp; P = erfc(z/√2)`)}<p>Para n = ${nn}, o limite é z ≈ <b>${n(zc, 3)}</b>.</p>${base}${s > 0 ? "" : "<p>Todas as medidas são iguais (s = 0): não há o que testar.</p>"}${suspeitos.length ? aviso(`${suspeitos.map((x) => n(x.valor, 6)).join(", ")} ${suspeitos.length > 1 ? "são candidatos" : "é candidato"} a valor discrepante. <b>Não descarte automaticamente</b>: verifique o caderno de laboratório. Só exclua se achar uma causa; e relate que excluiu.`) : "<p>Nenhuma medida passa do limite: sem valor discrepante pelo critério.</p>"}`));
    const e = escreverResultado(m, sm, un);
    const eic = escreverResultado(m, ic, un);
    passos.push(R("Relato final", `<p>Escreve-se a média com a incerteza (erro-padrão da média) com 1 algarismo significativo:</p><div class="eq"><b>x̄ ± s/√n = ${e.html}</b></div><div class="eq">IC ${Math.round(conf * 100)}%: ${eic.html}</div>${dica("Informe também n (número de medidas). A incerteza usada aqui é a estatística (tipo A); a incerteza do instrumento pode ser somada em quadratura.")}`));
    return {
      ok: true, passos, n: nn, media: m, mediana: B.mediana, s, sm, relMedia: relM, relS, t, ic, conf, nu, suspeitos, zCrit: zc, valoresUsados: v, indices: idx, bins: histograma(v),
      resposta: `x̄ ± s/√n = ${e.texto}  (s = ${numT(s, 4)}, n = ${nn}; IC ${Math.round(conf * 100)}%: ${eic.texto})`,
      respostaHTML: `<b>${e.html}</b><br><small>s = ${n(s, 4)} · n = ${nn} · IC ${Math.round(conf * 100)}%: ${eic.html}</small>`,
      texto: e.texto, latex: e.latex,
    };
  }

  // ---------------------------------------------------------------------------
  // Constantes físicas (CODATA 2018 — valores recomendados; as definidas pelo SI 2019 são exatas)
  // v = valor, u = incerteza-padrão (0 = exata), un = unidade, tex = unidade em LaTeX
  // ---------------------------------------------------------------------------
  const K = (nome, sim, v, u, un, tex, cat, simTex, extra) => ({ nome, sim, v, u, un, tex, cat, simTex: simTex || sim, extra: extra || "" });
  const CONSTANTES = [
    K("Velocidade da luz no vácuo", "c", "299792458", "0", "m/s", "m\\,s^{-1}", "Universais", "c", "luz velocidade"),
    K("Constante de Planck", "h", "6.62607015e-34", "0", "J·s", "J\\,s", "Universais", "h", "quantica"),
    K("Constante de Planck reduzida", "ħ", "1.054571817e-34", "0", "J·s", "J\\,s", "Universais", "\\hbar", "h cortado h barra"),
    K("Constante gravitacional", "G", "6.67430e-11", "0.00015e-11", "m³·kg⁻¹·s⁻²", "m^{3}\\,kg^{-1}\\,s^{-2}", "Universais", "G", "newton gravitacao"),
    K("Aceleração padrão da gravidade", "gₙ", "9.80665", "0", "m/s²", "m\\,s^{-2}", "Universais", "g_n", "g gravidade terra"),
    K("Massa de Planck", "m_P", "2.176434e-8", "0.000024e-8", "kg", "kg", "Universais", "m_P", "planck"),
    K("Comprimento de Planck", "l_P", "1.616255e-35", "0.000018e-35", "m", "m", "Universais", "l_P", "planck"),
    K("Tempo de Planck", "t_P", "5.391247e-44", "0.000060e-44", "s", "s", "Universais", "t_P", "planck"),
    K("Temperatura de Planck", "T_P", "1.416784e32", "0.000016e32", "K", "K", "Universais", "T_P", "planck"),
    K("Carga elementar", "e", "1.602176634e-19", "0", "C", "C", "Eletromagnéticas", "e", "eletron proton carga"),
    K("Permissividade elétrica do vácuo", "ε₀", "8.8541878128e-12", "0.0000000013e-12", "F/m", "F\\,m^{-1}", "Eletromagnéticas", "\\varepsilon_0", "epsilon eletrica"),
    K("Permeabilidade magnética do vácuo", "μ₀", "1.25663706212e-6", "0.00000000019e-6", "N/A²", "N\\,A^{-2}", "Eletromagnéticas", "\\mu_0", "mu magnetica"),
    K("Constante de Coulomb (1/4πε₀)", "kₑ", "8.9875517923e9", "0.0000000014e9", "N·m²/C²", "N\\,m^{2}\\,C^{-2}", "Eletromagnéticas", "k_e", "coulomb eletrostatica derivada"),
    K("Constante de Faraday", "F", "96485.33212", "0", "C/mol", "C\\,mol^{-1}", "Eletromagnéticas", "F", "eletroquimica faraday"),
    K("Quantum de fluxo magnético", "Φ₀", "2.067833848e-15", "0", "Wb", "Wb", "Eletromagnéticas", "\\Phi_0", "fluxo magnetico josephson"),
    K("Quantum de condutância", "G₀", "7.748091729e-5", "0", "S", "S", "Eletromagnéticas", "G_0", "condutancia"),
    K("Constante de von Klitzing", "R_K", "25812.80745", "0", "Ω", "\\Omega", "Eletromagnéticas", "R_K", "hall resistencia"),
    K("Magneton de Bohr", "μ_B", "9.2740100783e-24", "0.0000000028e-24", "J/T", "J\\,T^{-1}", "Eletromagnéticas", "\\mu_B", "magnetismo"),
    K("Magneton nuclear", "μ_N", "5.0507837461e-27", "0.0000000015e-27", "J/T", "J\\,T^{-1}", "Eletromagnéticas", "\\mu_N", "magnetismo"),
    K("Razão carga/massa do elétron (−e/mₑ)", "−e/mₑ", "-1.75882001076e11", "0.00000000053e11", "C/kg", "C\\,kg^{-1}", "Eletromagnéticas", "-e/m_e", "thomson"),
    K("Constante de Boltzmann", "k_B", "1.380649e-23", "0", "J/K", "J\\,K^{-1}", "Termodinâmicas", "k_B", "termodinamica"),
    K("Constante universal dos gases", "R", "8.314462618", "0", "J/(mol·K)", "J\\,mol^{-1}\\,K^{-1}", "Termodinâmicas", "R", "gases ideais"),
    K("Constante de Stefan–Boltzmann", "σ", "5.670374419e-8", "0", "W·m⁻²·K⁻⁴", "W\\,m^{-2}\\,K^{-4}", "Termodinâmicas", "\\sigma", "corpo negro radiacao"),
    K("Constante de deslocamento de Wien", "b", "2.897771955e-3", "0", "m·K", "m\\,K", "Termodinâmicas", "b", "wien corpo negro"),
    K("Primeira constante de radiação", "c₁", "3.741771852e-16", "0", "W·m²", "W\\,m^{2}", "Termodinâmicas", "c_1", "radiacao"),
    K("Segunda constante de radiação", "c₂", "1.438776877e-2", "0", "m·K", "m\\,K", "Termodinâmicas", "c_2", "radiacao"),
    K("Pressão atmosférica padrão", "atm", "101325", "0", "Pa", "Pa", "Termodinâmicas", "p_0", "pressao 1 atm"),
    K("Pressão padrão (1 bar)", "p°", "100000", "0", "Pa", "Pa", "Termodinâmicas", "p^\\circ", "bar"),
    K("Zero do Celsius", "T₀", "273.15", "0", "K", "K", "Termodinâmicas", "T_0", "temperatura 0 celsius"),
    K("Volume molar do gás ideal (273,15 K; 100 kPa)", "V_m", "22.71095464e-3", "0", "m³/mol", "m^{3}\\,mol^{-1}", "Termodinâmicas", "V_m", "gas ideal"),
    K("Volume molar do gás ideal (273,15 K; 101,325 kPa)", "V_m", "22.41396954e-3", "0", "m³/mol", "m^{3}\\,mol^{-1}", "Termodinâmicas", "V_m", "gas ideal CNTP"),
    K("Caloria termoquímica", "cal", "4.184", "0", "J", "J", "Termodinâmicas", "\\mathrm{cal}", "energia calor definicao"),
    K("Constante de Avogadro", "N_A", "6.02214076e23", "0", "mol⁻¹", "mol^{-1}", "Atômicas e nucleares", "N_A", "mol"),
    K("Massa do elétron", "mₑ", "9.1093837015e-31", "0.0000000028e-31", "kg", "kg", "Atômicas e nucleares", "m_e", "massa eletron"),
    K("Massa do próton", "m_p", "1.67262192369e-27", "0.00000000051e-27", "kg", "kg", "Atômicas e nucleares", "m_p", "massa proton"),
    K("Massa do nêutron", "m_n", "1.67492749804e-27", "0.00000000095e-27", "kg", "kg", "Atômicas e nucleares", "m_n", "massa neutron"),
    K("Massa do múon", "m_μ", "1.883531627e-28", "0.000000042e-28", "kg", "kg", "Atômicas e nucleares", "m_\\mu", "massa muon"),
    K("Unidade de massa atômica", "u", "1.66053906660e-27", "0.00000000050e-27", "kg", "kg", "Atômicas e nucleares", "u", "dalton amu"),
    K("Razão de massas próton/elétron", "m_p/mₑ", "1836.15267343", "0.00000011", "(adimensional)", "", "Atômicas e nucleares", "m_p/m_e", "razao"),
    K("Constante de estrutura fina", "α", "7.2973525693e-3", "0.0000000011e-3", "(adimensional)", "", "Atômicas e nucleares", "\\alpha", "estrutura fina sommerfeld"),
    K("Inverso da constante de estrutura fina", "1/α", "137.035999084", "0.000000021", "(adimensional)", "", "Atômicas e nucleares", "\\alpha^{-1}", "137"),
    K("Constante de Rydberg", "R∞", "10973731.568160", "0.000021", "m⁻¹", "m^{-1}", "Atômicas e nucleares", "R_\\infty", "rydberg espectro"),
    K("Raio de Bohr", "a₀", "5.29177210903e-11", "0.00000000080e-11", "m", "m", "Atômicas e nucleares", "a_0", "bohr atomo hidrogenio"),
    K("Raio clássico do elétron", "rₑ", "2.8179403262e-15", "0.0000000013e-15", "m", "m", "Atômicas e nucleares", "r_e", "raio eletron"),
    K("Comprimento de onda de Compton do elétron", "λ_C", "2.42631023867e-12", "0.00000000073e-12", "m", "m", "Atômicas e nucleares", "\\lambda_C", "compton"),
    K("Seção de choque de Thomson", "σₑ", "6.6524587321e-29", "0.0000000060e-29", "m²", "m^{2}", "Atômicas e nucleares", "\\sigma_e", "thomson"),
    K("Energia de Hartree", "E_h", "4.3597447222071e-18", "0.0000000000085e-18", "J", "J", "Atômicas e nucleares", "E_h", "atomica unidade"),
    K("Elétron-volt", "eV", "1.602176634e-19", "0", "J", "J", "Energia de repouso", "\\mathrm{eV}", "energia joule"),
    K("Energia de repouso do elétron (mₑc²)", "mₑc²", "0.51099895000", "0.00000000015", "MeV", "MeV", "Energia de repouso", "m_ec^2", "energia"),
    K("Energia de repouso do próton (m_pc²)", "m_pc²", "938.27208816", "0.00000029", "MeV", "MeV", "Energia de repouso", "m_pc^2", "energia"),
    K("Energia de repouso do nêutron (m_nc²)", "m_nc²", "939.56542052", "0.00000054", "MeV", "MeV", "Energia de repouso", "m_nc^2", "energia"),
    K("Energia de repouso de 1 u (uc²)", "uc²", "931.49410242", "0.00000028", "MeV", "MeV", "Energia de repouso", "uc^2", "energia dalton"),
  ];
  const PREFIXOS = [
    ["quetta", "Q", 30], ["ronna", "R", 27], ["yotta", "Y", 24], ["zetta", "Z", 21], ["exa", "E", 18], ["peta", "P", 15], ["tera", "T", 12], ["giga", "G", 9], ["mega", "M", 6],
    ["quilo", "k", 3], ["hecto", "h", 2], ["deca", "da", 1], ["deci", "d", -1], ["centi", "c", -2], ["mili", "m", -3], ["micro", "µ", -6], ["nano", "n", -9], ["pico", "p", -12],
    ["femto", "f", -15], ["atto", "a", -18], ["zepto", "z", -21], ["yocto", "y", -24], ["ronto", "r", -27], ["quecto", "q", -30],
  ].map(([nome, sim, exp]) => ({ nome, sim, exp }));

  const semAcento = (s) => String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  function dividirValor(str) { const [m, e] = String(str).toLowerCase().split("e"); return { m, e: e ? parseInt(e, 10) : 0 }; }
  // formata um valor "6.62607015e-34" em pt-BR
  function constanteFormatar(c) {
    const { m, e } = dividirValor(c.v);
    const mant = virg(m);
    const ehExp = String(c.v).toLowerCase().includes("e");
    const valorTxt = ehExp ? `${mant} × 10${sup(e)}` : mant;
    const valorHTML = ehExp ? `${mant} × 10<sup>${String(e).replace("-", "−")}</sup>` : mant;
    let incTxt = "exata", incHTML = "exata (definição)";
    if (c.u !== "0") {
      const um = dividirValor(c.u);
      const ex = c.v.includes("e") ? e : 0;
      // incerteza em ppares de dígitos: 6,62607015(…)
      incTxt = `${virg(String(Number(c.u)))}`;
      const uu = Number(c.u);
      incTxt = ehExp ? `${virg((uu / Math.pow(10, e)).toPrecision(2).replace(/\.?0+$/, ""))} × 10${sup(e)}` : virg(String(uu));
      incHTML = ehExp ? `${virg((uu / Math.pow(10, e)).toPrecision(2).replace(/\.?0+$/, ""))} × 10<sup>${String(e).replace("-", "−")}</sup>` : virg(String(uu));
      void um; void ex;
    }
    const num = Number(c.v);
    const unTxt = c.un === "(adimensional)" ? "" : c.un;
    const comUn = `${valorTxt}${unTxt ? " " + unTxt : ""}`;
    const tex = (ehExp ? `${m.replace(".", "{,}")} \\times 10^{${e}}` : m.replace(".", "{,}")) + (c.tex ? `\\,\\mathrm{${c.tex}}` : "");
    return { valorTxt, valorHTML, incTxt, incHTML, valorPlano: String(num), valorCodigo: String(c.v).replace(/^(-?)(\d)/, "$1$2"), comUnidade: `${c.sim} = ${comUn}`, latex: `${c.simTex} = ${tex}` };
  }
  function buscarConstantes(q, cat) {
    const t = semAcento(q || "").trim();
    return CONSTANTES.filter((c) => {
      if (cat && cat !== "Todas" && c.cat !== cat) return false;
      if (!t) return true;
      const hay = semAcento(`${c.nome} ${c.sim} ${c.simTex} ${c.un} ${c.extra} ${c.cat}`);
      return t.split(/\s+/).every((p) => hay.includes(p));
    });
  }
  const CATEGORIAS = ["Todas", ...Array.from(new Set(CONSTANTES.map((c) => c.cat)))];

  // ---------------------------------------------------------------------------
  // Tabela para relatório (CSV / LaTeX / Markdown)
  // ---------------------------------------------------------------------------
  function dividirLinhaTab(l, sep) {
    if (sep === "tab") return l.split("\t");
    if (sep === "pv") return l.split(";");
    if (sep === "virgula") return l.split(",");
    if (sep === "espaco") return l.trim().split(/\s+/);
    if (l.includes("\t")) return l.split("\t");
    if (l.includes(";")) return l.split(";");
    if (/\s{2,}|\s/.test(l.trim()) && l.trim().split(/\s+/).length > 1) return l.trim().split(/\s+/);
    return l.split(",");
  }
  function formatarTabela(txt, opc = {}) {
    const linhasBr = String(txt == null ? "" : txt).replace(/\r/g, "").split("\n").filter((l) => l.trim().length);
    if (!linhasBr.length) return { ok: false, erro: "Cole os dados da tabela (uma linha por linha, colunas separadas por tab, ; ou espaço)." };
    const sep = opc.sep || "auto";
    let linhas = linhasBr.map((l) => dividirLinhaTab(l, sep).map((s) => s.trim()));
    const nc = Math.max(...linhas.map((l) => l.length));
    linhas = linhas.map((l) => { const c = l.slice(); while (c.length < nc) c.push(""); return c; });
    const cab = opc.cabecalho !== false;
    const dec = opc.decimal === "ponto" ? "." : ",";
    const casas = opc.casas === undefined || opc.casas === "" || opc.casas === null || opc.casas === "manter" ? null : parseInt(opc.casas, 10);
    const ehNum = (s) => s !== "" && isFinite(lerNumero(s));
    const inicio = cab ? 1 : 0;
    const colNum = Array.from({ length: nc }, (_, j) => linhas.slice(inicio).length > 0 && linhas.slice(inicio).every((l) => l[j] === "" || ehNum(l[j])));
    const fmtCel = (s, j, i) => {
      if (i < inicio || !colNum[j] || s === "") return s;
      const v = lerNumero(s);
      if (casas !== null && isFinite(casas)) return v.toFixed(Math.max(0, Math.min(casas, 15))).replace(".", dec);
      return String(s).replace(/[.,]/, dec);
    };
    const m = linhas.map((l, i) => l.map((s, j) => fmtCel(s, j, i)));
    const formato = opc.formato || "csv";
    let saida;
    if (formato === "csv") {
      const delim = dec === "," ? ";" : ",";
      const q = (s) => (s.includes(delim) || s.includes('"') || s.includes("\n") ? '"' + s.replace(/"/g, '""') + '"' : s);
      saida = m.map((l) => l.map(q).join(delim)).join("\n");
    } else if (formato === "latex") {
      const eL = (s) => s.replace(/\\/g, "\\textbackslash{}").replace(/([&%$#_{}])/g, "\\$1").replace(/~/g, "\\textasciitilde{}").replace(/\^/g, "\\textasciicircum{}");
      const cel = (s, j, i) => (i >= inicio && colNum[j] && s !== "" ? (dec === "," ? s.replace(",", "{,}") : s) : eL(s));
      const al = colNum.map((c) => (c ? "r" : "l")).join(" ");
      const corpo = m.map((l, i) => l.map((s, j) => cel(s, j, i)).join(" & ") + " \\\\");
      const partes = ["\\begin{table}[ht]", "  \\centering"];
      if (opc.legenda) partes.push(`  \\caption{${eL(opc.legenda)}}`);
      if (opc.rotulo) partes.push(`  \\label{${String(opc.rotulo).replace(/[^\w:.-]/g, "")}}`);
      partes.push(`  \\begin{tabular}{${al}}`, "    \\toprule");
      if (cab) { partes.push("    " + corpo[0], "    \\midrule"); corpo.slice(1).forEach((l) => partes.push("    " + l)); } else corpo.forEach((l) => partes.push("    " + l));
      partes.push("    \\bottomrule", "  \\end{tabular}", "\\end{table}");
      saida = partes.join("\n");
    } else if (formato === "markdown") {
      const eM = (s) => s.replace(/\|/g, "\\|");
      const head = cab ? m[0] : Array.from({ length: nc }, (_, j) => `col${j + 1}`);
      const corpo = cab ? m.slice(1) : m;
      const sepL = colNum.map((c) => (c ? "---:" : ":---"));
      saida = [head, sepL, ...corpo].map((l) => "| " + l.map(eM).join(" | ") + " |").join("\n");
    } else return { ok: false, erro: "Formato desconhecido." };
    return { ok: true, saida, colunas: nc, linhas: m.length, numericas: colNum };
  }

  // ---------------------------------------------------------------------------
  // Exercícios
  // ---------------------------------------------------------------------------
  const sorteia = (a) => a[Math.floor(Math.random() * a.length)];
  const inteiro = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const fixoS = (v, c) => virg(v.toFixed(c));

  function exContar() {
    const forma = inteiro(0, 5);
    let txt;
    const dg = (k) => Array.from({ length: k }, () => inteiro(1, 9)).join("");
    if (forma === 0) txt = "0," + "0".repeat(inteiro(1, 3)) + dg(inteiro(1, 3)) + (Math.random() < 0.5 ? "0" : "");
    else if (forma === 1) txt = dg(inteiro(1, 3)) + "," + dg(inteiro(1, 3)) + (Math.random() < 0.5 ? "0" : "");
    else if (forma === 2) txt = dg(1) + "0" + dg(inteiro(1, 2)) + (Math.random() < 0.5 ? "," + dg(inteiro(1, 2)) : "");
    else if (forma === 3) txt = dg(1) + "," + dg(inteiro(1, 3)) + "×10^" + inteiro(2, 8) * (Math.random() < 0.5 ? -1 : 1);
    else if (forma === 4) txt = dg(inteiro(1, 2)) + "0".repeat(inteiro(1, 2)) + ",";
    else txt = dg(inteiro(2, 4)) + "," + "0".repeat(inteiro(1, 2));
    const r = contarAS(txt);
    const vis = txt.replace(/\^(-?\d+)/, (_, e) => `<sup>${e.replace("-", "−")}</sup>`);
    return { enunciado: `Quantos algarismos significativos tem o número <b>${vis}</b>?`, resposta: r.n, tol: 0, unidade: "", passos: r.passos, texto: String(r.n) };
  }
  function exArredondar() {
    const nd = inteiro(5, 8);
    let d = String(inteiro(1, 9)) + Array.from({ length: nd - 1 }, () => inteiro(0, 9)).join("");
    const pos = inteiro(0, 3);
    let txt;
    if (Math.random() < 0.4) txt = "0," + "0".repeat(inteiro(1, 3)) + d;
    else if (Math.random() < 0.5) txt = d.slice(0, pos + 1) + "," + d.slice(pos + 1);
    else txt = d.slice(0, pos + 2) + "," + d.slice(pos + 2);
    const nn = inteiro(2, 4);
    const r = arredondarAS(txt, nn);
    return { enunciado: `Arredonde <b>${txt}</b> para <b>${nn}</b> algarismos significativos.`, resposta: r.valor, tol: 0, rel: 1e-9, unidade: "", passos: r.passos, texto: r.resultado };
  }
  function exOperacao() {
    const op = sorteia(["+", "-", "*", "/"]);
    const casas = () => inteiro(0, 3);
    const num = (c) => {
      const base = inteiro(1, 9999) / Math.pow(10, inteiro(0, 2));
      return fixoS(base < 1 ? base + 1 : base, c);
    };
    let lista;
    if (op === "+" || op === "-") {
      lista = [num(casas()), num(casas())];
      if (op === "+" && Math.random() < 0.4) lista.push(num(casas()));
      if (op === "-") { const a = lerNumero(lista[0]), b = lerNumero(lista[1]); if (a < b) lista.reverse(); if (a === b) lista[0] = fixoS(a + 7.3, 1); }
    } else {
      const sg = () => { const k = inteiro(2, 4); const v = Array.from({ length: k }, () => inteiro(1, 9)).join(""); return fixoS(Number(v) / Math.pow(10, inteiro(0, k - 1)), 0).replace(/,.*/, "") && (() => { const dec = inteiro(0, k - 1); return virg((Number(v) / Math.pow(10, dec)).toFixed(dec)); })(); };
      lista = [sg(), sg()];
    }
    const r = operarAS(lista, op);
    const simb = { "+": "+", "-": "−", "*": "×", "/": "÷" }[op];
    return {
      enunciado: `Calcule <b>${lista.join(` ${simb} `)}</b> e dê o resultado com o número correto de algarismos significativos.<small><br>${op === "+" || op === "-" ? "Dica: na soma e na subtração, manda a casa decimal." : "Dica: na multiplicação e na divisão, manda o número de algarismos significativos."}</small>`,
      resposta: r.valor, tol: 0, rel: 1e-9, unidade: "", passos: r.passos, texto: r.resultado,
    };
  }
  function exEstat() {
    const centro = sorteia([20, 9.8, 50, 100, 12.5, 7]);
    const passo = centro >= 50 ? 0.5 : centro >= 10 ? 0.1 : 0.05;
    const valores = Array.from({ length: 5 }, () => Number((centro + inteiro(-6, 6) * passo).toFixed(3)));
    if (new Set(valores).size < 3) valores[0] += passo * 3;
    const casasEntrada = passo === 0.5 ? 1 : passo === 0.1 ? 1 : 2;
    const lista = valores.map((v) => fixoS(v, casasEntrada));
    const r = estatistica(valores, {});
    const q = sorteia(["media", "s", "sm"]);
    const nome = { media: "a <b>média</b>", s: "o <b>desvio-padrão amostral</b> (n − 1)", sm: "o <b>erro-padrão da média</b> (s/√n)" }[q];
    const resp = { media: r.media, s: r.s, sm: r.sm }[q];
    return { enunciado: `Cinco medições de uma mesma grandeza deram: <b>${lista.join("; ")}</b>. Calcule ${nome}, com 3 casas decimais.`, resposta: Number(resp.toFixed(3)), tol: 0.0011, rel: 0, unidade: "", passos: r.passos, texto: fixoS(resp, 3) };
  }
  function exIncerteza() {
    const tipo = sorteia(["soma", "dif", "prod", "quoc"]);
    const x = inteiro(40, 200) / 10, y = inteiro(30, 150) / 10;
    const sx = sorteia([0.1, 0.2, 0.3, 0.5]), sy = sorteia([0.1, 0.2, 0.4, 0.5]);
    const expr = { soma: "x+y", dif: "x-y", prod: "x*y", quoc: "x/y" }[tipo];
    const r = propagar(expr, { x: { v: x, s: sx }, y: { v: y, s: sy } });
    const simb = { soma: "+", dif: "−", prod: "×", quoc: "÷" }[tipo];
    const fx = (v) => fixoS(v, 1);
    return {
      enunciado: `Duas medidas independentes: x = <b>${fx(x)} ± ${fixoS(sx, 1)}</b> e y = <b>${fx(y)} ± ${fixoS(sy, 1)}</b>. Qual é a incerteza padrão σ de <b>z = x ${simb} y</b> (soma em quadratura), com 3 casas decimais?`,
      resposta: Number(r.sigma.toFixed(3)), tol: 0.0011, rel: 0, unidade: "", passos: r.passos, texto: fixoS(r.sigma, 3),
    };
  }
  // ajuste: dados com pequeno ruído; pede inclinação, intercepto, previsão ou R²
  function exAjuste() {
    const CEN = [
      { ctx: "Num experimento de queda, mediu-se a velocidade v (m/s) em vários instantes t (s).", x: "t (s)", y: "v (m/s)", xs: [0.1, 0.2, 0.3, 0.4, 0.5], a: 9.8, b: 0, un: "m/s²", nomeA: "a aceleração (inclinação da reta)", casas: 2 },
      { ctx: "Num resistor, mediu-se a tensão V (V) para várias correntes i (A).", x: "i (A)", y: "V (V)", xs: [0.1, 0.2, 0.3, 0.4, 0.5], a: inteiro(8, 40), b: 0, un: "Ω", nomeA: "a resistência (inclinação da reta)", casas: 1 },
      { ctx: "Uma mola foi esticada com massas diferentes; mediu-se o comprimento L (cm) para cada força F (N).", x: "F (N)", y: "L (cm)", xs: [1, 2, 3, 4, 5], a: sorteia([0.5, 0.8, 1.2, 1.5, 2]), b: sorteia([10, 12, 15, 20]), un: "cm/N", nomeA: "a inclinação", casas: 2 },
      { ctx: "Um líquido foi aquecido; mediu-se a temperatura T (°C) ao longo do tempo t (min).", x: "t (min)", y: "T (°C)", xs: [0, 2, 4, 6, 8], a: sorteia([1.5, 2, 2.5, 3]), b: sorteia([20, 22, 25]), un: "°C/min", nomeA: "a taxa de aquecimento (inclinação)", casas: 2 },
    ];
    const c = sorteia(CEN);
    const amp = Math.abs(c.a * (c.xs[4] - c.xs[0])) * 0.02;
    const ys = c.xs.map((x) => Number((c.a * x + c.b + (Math.random() * 2 - 1) * amp).toFixed(c.casas)));
    const r = ajustar(c.xs.map((x, i) => ({ x, y: ys[i] })), { modo: "lin" });
    const tab = `<div class="tab-rolar"><table class="tb"><thead><tr><th>${c.x}</th>${c.xs.map((x) => `<td>${numT(x, 3)}</td>`).join("")}</tr></thead><tbody><tr><th>${c.y}</th>${ys.map((y) => `<td>${fixoS(y, c.casas)}</td>`).join("")}</tr></tbody></table></div>`;
    const grafico = { rotX: c.x, rotY: c.y, series: [{ tipo: "pontos", pts: c.xs.map((x, i) => [x, ys[i]]), rotulo: "medidas" }] };
    const graficoOp = { modo: "dados", altura: 200 };
    const q = sorteia(["a", "a", "b", "prev"]);
    if (q === "b" && Math.abs(c.b) > 0) return { enunciado: `${c.ctx}${tab}Faça o ajuste linear y = a·x + b. Quanto vale o <b>coeficiente linear b</b> (onde a reta corta o eixo y)? Use 2 algarismos depois da vírgula.`, grafico, graficoOp, resposta: r.b, tol: Math.max(Math.abs(r.b) * 0.01, 0.02), unidade: c.y.match(/\(([^)]*)\)/)[1], passos: r.passos, texto: numT(r.b, 4) };
    if (q === "prev") {
      const xp = c.xs[4] + (c.xs[1] - c.xs[0]) * 2;
      const yp = r.a * xp + r.b;
      return { enunciado: `${c.ctx}${tab}Usando a reta ajustada, qual o valor previsto de y para <b>x = ${numT(xp, 3)}</b>? <small>(É uma extrapolação: use com cuidado em laboratório.)</small>`, grafico, graficoOp, resposta: yp, rel: 0.01, tol: 0.02, unidade: c.y.match(/\(([^)]*)\)/)[1], passos: r.passos.concat([{ t: `Previsão para x = ${numT(xp, 3)}`, h: `<div class="eq">ŷ = a·x + b = ${numT(r.a, 4)} × ${numT(xp, 3)} + ${numT(r.b, 4)} = <b>${numT(yp, 4)}</b></div>` }]), texto: numT(yp, 4) };
    }
    return { enunciado: `${c.ctx}${tab}Faça o ajuste linear (mínimos quadrados). Quanto vale ${c.nomeA}?`, grafico, graficoOp, resposta: r.a, rel: 0.01, tol: 0.005, unidade: c.un, passos: r.passos, texto: `${numT(r.a, 4)} ${c.un}` };
  }

  function gerarExercicio(tipo) {
    if (tipo === "ajuste") return exAjuste();
    if (tipo === "sig") tipo = sorteia(["sig-contar", "sig-arredondar", "sig-operacao"]);
    const mapa = { ajuste: exAjuste, "sig-contar": exContar, "sig-arredondar": exArredondar, "sig-operacao": exOperacao, estat: exEstat, incerteza: exIncerteza };
    return mapa[tipo] ? mapa[tipo]() : null;
  }
  const conferir = Q.conferir;

  const API = {
    numT, lerNumero, parseTabela, lerLista,
    lerDec, analisarAS, contarAS, arredondarAS, operarAS, arredondarIncerteza, escreverResultado, unTex,
    ajustar, nucleoReta, TRANSF,
    derivadaNumerica, propagar, variaveisDe, lerIncerteza,
    tStudent, erfc, zChauvenet, estatistica, estatBasica, histograma,
    CONSTANTES, PREFIXOS, CATEGORIAS, buscarConstantes, constanteFormatar, formatarTabela,
    gerarExercicio, conferir, semTags,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else raiz.PCalc = API;
})(typeof window !== "undefined" ? window : globalThis);
