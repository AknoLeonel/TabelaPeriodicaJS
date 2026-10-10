/*
 * Motor de matemática do modo Estudo (apoio para química, física e cálculo).
 * Equações, sistemas, regra de três, porcentagem, logaritmos, trigonometria,
 * vetores, derivadas e integrais simbólicas e estudo de funções.
 * Funções puras (rodam em Node e no navegador). Sem eval.
 */
(function (raiz) {
  "use strict";
  const node = typeof module !== "undefined" && module.exports;
  const Q = node ? require("./quimica-calc.js") : raiz.QCalc;
  const X = node ? require("./expressao.js") : raiz.Expr;

  const N = (v, sig = 5) => (isFinite(v) ? Q.num(Math.abs(v) < 1e-12 ? 0 : v, sig).replace(/^-/, "−") : v > 0 ? "∞" : v < 0 ? "−∞" : "—");
  const par = (v) => (v < 0 ? `(${N(v)})` : N(v));
  const frac = Q.frac;
  const eq = (h) => `<div class="eq">${h}</div>`;
  const R = (t, h) => ({ t, h });
  const dica = (h) => `<small class="dica">${h}</small>`;
  const aviso = (h) => `<p class="aviso-exc"><b>Atenção:</b> ${h}</p>`;
  const erro = (m) => ({ ok: false, erro: m });
  const fin = (v) => typeof v === "number" && isFinite(v);
  const tabela = (cab, linhas) => `<div class="tab-rolar"><table class="tb"><thead><tr>${cab.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${linhas.map((l) => `<tr>${l.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  const semTags = (h) => String(h).replace(/<sup>([^<]*)<\/sup>/g, "^$1").replace(/<sub>([^<]*)<\/sub>/g, "$1").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ");

  // ---------------------------------------------------------------------------
  // Frações exatas (BigInt) para sistemas e respostas "bonitas"
  // ---------------------------------------------------------------------------
  const babs = (a) => (a < 0n ? -a : a);
  const bgcd = (a, b) => { a = babs(a); b = babs(b); while (b) [a, b] = [b, a % b]; return a || 1n; };
  class F {
    constructor(n, d = 1n) { if (d === 0n) throw new Error("divisão por zero"); if (d < 0n) { n = -n; d = -d; } const g = bgcd(n, d); this.n = n / g; this.d = d / g; }
    static de(x) {
      if (x instanceof F) return x;
      if (typeof x === "bigint") return new F(x);
      if (!isFinite(x)) throw new Error("número inválido");
      // decimais digitados viram frações exatas (0,25 = 1/4); dízimas usuais via fração contínua
      const s = String(x);
      if (!/e/i.test(s) && s.includes(".") && s.split(".")[1].length <= 12) { const casas = s.split(".")[1].length; return new F(BigInt(s.replace(".", "").replace(/^(-?)0+(?=\d)/, "$1")), 10n ** BigInt(casas)); }
      if (Number.isInteger(x)) return new F(BigInt(x));
      const c = aproxFrac(x);
      return new F(BigInt(c[0]), BigInt(c[1]));
    }
    add(o) { o = F.de(o); return new F(this.n * o.d + o.n * this.d, this.d * o.d); }
    sub(o) { o = F.de(o); return new F(this.n * o.d - o.n * this.d, this.d * o.d); }
    mul(o) { o = F.de(o); return new F(this.n * o.n, this.d * o.d); }
    div(o) { o = F.de(o); return new F(this.n * o.d, this.d * o.n); }
    neg() { return new F(-this.n, this.d); }
    zero() { return this.n === 0n; }
    val() { return Number(this.n) / Number(this.d); }
    html() { if (this.d === 1n) return String(this.n).replace("-", "−"); const s = this.n < 0n ? "−" : ""; return `${s}${frac(String(babs(this.n)), String(this.d))}`; }
    txt() { return this.d === 1n ? String(this.n) : `${this.n}/${this.d}`; }
  }
  function aproxFrac(x, maxD = 10000) {
    let h1 = 1, h0 = 0, k1 = 0, k0 = 1, b = x;
    for (let i = 0; i < 30; i++) {
      const a = Math.floor(b);
      [h1, h0] = [a * h1 + h0, h1]; [k1, k0] = [a * k1 + k0, k1];
      if (k1 > maxD) return [h0, k0];
      if (Math.abs(x - h1 / k1) < 1e-12 * Math.max(1, Math.abs(x))) break;
      b = 1 / (b - a);
      if (!isFinite(b)) break;
    }
    return [h1, k1];
  }
  // número com forma de fração quando ela é simples (ex.: 0,333... → 1/3)
  function bonito(v) {
    if (!fin(v)) return N(v);
    if (Number.isInteger(v) || Math.abs(v - Math.round(v)) < 1e-12) return N(Math.round(v));
    const [h, k] = aproxFrac(v, 200);
    if (k > 1 && k <= 200 && Math.abs(h / k - v) < 1e-10) return `${h < 0 ? "−" : ""}${frac(String(Math.abs(h)), String(k))} <span class="un">(≈ ${N(v)})</span>`;
    return N(v);
  }
  const ehQuadradoPerfeito = (d) => d >= 0 && Math.abs(Math.sqrt(d) - Math.round(Math.sqrt(d))) < 1e-9;

  // ---------------------------------------------------------------------------
  // 1. Equações
  // ---------------------------------------------------------------------------
  function eq1(p) {
    const { a, b, c = 0 } = p;
    if (!fin(a) || !fin(b) || !fin(c)) return erro("Preencha a, b e c com números.");
    const passos = [];
    passos.push(R("A equação", `${eq(`${N(a)}·x ${b < 0 ? "−" : "+"} ${N(Math.abs(b))} = ${N(c)}`)}<p>Objetivo: deixar o x sozinho de um lado, desfazendo as operações na ordem inversa.</p>`));
    if (a === 0) {
      const ok = Math.abs(b - c) < 1e-12;
      passos.push(R("Não há x", `<p>Com a = 0 a equação vira ${N(b)} = ${N(c)}, que é ${ok ? "<b>sempre verdadeira</b> (infinitas soluções)" : "<b>falsa</b> (nenhuma solução)"}.</p>`));
      return { ok: true, passos, resposta: ok ? "Infinitas soluções" : "Sem solução", respostaHTML: ok ? "<b>Infinitas soluções</b> (S = ℝ)" : "<b>Sem solução</b> (S = ∅)", valor: NaN };
    }
    passos.push(R("Passe o termo independente", `<p>Subtraia ${par(b)} dos dois lados:</p>${eq(`${N(a)}·x = ${N(c)} − ${par(b)} = <b>${N(c - b)}</b>`)}`));
    const x = (c - b) / a;
    passos.push(R("Divida pelo coeficiente de x", `${eq(`x = ${frac(N(c - b), N(a))} = <b>${bonito(x)}</b>`)}`));
    passos.push(R("Confira", `${eq(`${N(a)}·${par(x)} ${b < 0 ? "−" : "+"} ${N(Math.abs(b))} = ${N(a * x + b)} ✓`)}`));
    return { ok: true, passos, valor: x, resposta: `x = ${N(x)}`, respostaHTML: `x = <b>${bonito(x)}</b>` };
  }

  function eq2(p) {
    const { a, b, c } = p;
    if (!fin(a) || !fin(b) || !fin(c)) return erro("Preencha a, b e c com números.");
    if (a === 0) { const r = eq1({ a: b, b: c, c: 0 }); if (r.ok) r.passos.unshift(R("Não é do 2º grau", "<p>Com a = 0 o termo x² some e sobra uma equação do 1º grau.</p>")); return r; }
    const passos = [];
    const termo = (k, s, primeiro) => (k === 0 ? "" : `${k < 0 ? (primeiro ? "−" : " − ") : primeiro ? "" : " + "}${Math.abs(k) === 1 && s ? "" : N(Math.abs(k))}${s}`);
    const txtEq = `${termo(a, "x²", true)}${termo(b, "x")}${termo(c, "")} = 0`;
    passos.push(R("Identifique os coeficientes", `${eq(txtEq)}<p>Na forma ax² + bx + c = 0: <b>a = ${N(a)}</b>, <b>b = ${N(b)}</b>, <b>c = ${N(c)}</b>.</p>`));
    const D = b * b - 4 * a * c;
    passos.push(R("Calcule o discriminante Δ", `${eq(`Δ = b² − 4·a·c = ${par(b)}² − 4·${par(a)}·${par(c)} = ${N(b * b)} ${4 * a * c < 0 ? "+" : "−"} ${N(Math.abs(4 * a * c))} = <b>${N(D)}</b>`)}<p>${D > 0 ? "Δ &gt; 0: <b>duas raízes reais diferentes</b>." : D === 0 ? "Δ = 0: <b>uma raiz real dupla</b> (o gráfico só encosta no eixo x)." : "Δ &lt; 0: <b>nenhuma raiz real</b> (o gráfico não corta o eixo x); as raízes são complexas."}</p>`));
    const xv = -b / (2 * a), yv = -D / (4 * a);
    let x1, x2, resp, respH;
    if (D >= 0) {
      const sD = Math.sqrt(D);
      x1 = (-b + sD) / (2 * a); x2 = (-b - sD) / (2 * a);
      if (x1 > x2) [x1, x2] = [x2, x1];
      passos.push(R("Fórmula de Bhaskara", `${eq(`x = ${frac("−b ± √Δ", "2a")} = ${frac(`${N(-b)} ± √${N(D)}`, `2·${par(a)}`)} = ${frac(`${N(-b)} ± ${ehQuadradoPerfeito(D) ? N(sD) : N(sD, 6)}`, N(2 * a))}`)}${eq(`x<sub>1</sub> = <b>${bonito(x1)}</b> &nbsp;&nbsp; x<sub>2</sub> = <b>${bonito(x2)}</b>`)}${ehQuadradoPerfeito(D) ? "" : dica(`√${N(D)} não é exata: dá para deixar a resposta como ${frac(`${N(-b)} ± √${N(D)}`, N(2 * a))}.`)}`));
      passos.push(R("Confira com soma e produto", `${eq(`x<sub>1</sub> + x<sub>2</sub> = ${N(x1 + x2)} = −b/a = ${N(-b / a)} ✓`)}${eq(`x<sub>1</sub> · x<sub>2</sub> = ${N(x1 * x2)} = c/a = ${N(c / a)} ✓`)}`));
      passos.push(R("Forma fatorada", eq(`${N(a) === "1" ? "" : N(a)}(x ${x1 < 0 ? "+" : "−"} ${N(Math.abs(x1))})(x ${x2 < 0 ? "+" : "−"} ${N(Math.abs(x2))}) = 0`)));
      resp = D === 0 ? `x = ${N(x1)} (raiz dupla)` : `x1 = ${N(x1)}, x2 = ${N(x2)}`;
      respH = D === 0 ? `x = <b>${bonito(x1)}</b> (raiz dupla)` : `x<sub>1</sub> = <b>${bonito(x1)}</b> · x<sub>2</sub> = <b>${bonito(x2)}</b>`;
    } else {
      const re = -b / (2 * a), im = Math.sqrt(-D) / Math.abs(2 * a);
      passos.push(R("Raízes complexas", `<p>√Δ = √(${N(D)}) = ${N(Math.sqrt(-D))}·i (i² = −1):</p>${eq(`x = ${frac(`${N(-b)} ± ${N(Math.sqrt(-D))}i`, N(2 * a))} = <b>${N(re)} ± ${N(im)}i</b>`)}${dica("No ensino médio costuma-se responder “não há raízes reais” (S = ∅).")}`));
      resp = `x = ${N(re)} ± ${N(im)}i (sem raízes reais)`;
      respH = `Sem raízes reais · x = <b>${N(re)} ± ${N(im)}i</b>`;
    }
    passos.push(R("Vértice da parábola", `${eq(`x<sub>v</sub> = ${frac("−b", "2a")} = <b>${bonito(xv)}</b> &nbsp;&nbsp; y<sub>v</sub> = ${frac("−Δ", "4a")} = <b>${bonito(yv)}</b>`)}<p>Como a ${a > 0 ? "&gt; 0, a parábola tem concavidade para <b>cima</b> e o vértice é o ponto de <b>mínimo</b>" : "&lt; 0, a concavidade é para <b>baixo</b> e o vértice é o ponto de <b>máximo</b>"}.</p>`));
    return { ok: true, passos, valor: D >= 0 ? x2 : NaN, raizes: D >= 0 ? [x1, x2] : [], D, xv, yv, resposta: resp, respostaHTML: respH };
  }

  // Sistemas lineares por escalonamento (Gauss-Jordan) com frações exatas
  function sistema(M) {
    const n = M.length;
    if (!(n === 2 || n === 3) || M.some((l) => l.length !== n + 1 || l.some((v) => !fin(v)))) return erro("Preencha todos os coeficientes com números.");
    const vars = ["x", "y", "z"].slice(0, n);
    let A;
    try { A = M.map((l) => l.map((v) => F.de(v))); } catch (e) { return erro("Coeficiente inválido."); }
    const passos = [];
    const linhaTxt = (l) => {
      let s = "";
      l.slice(0, n).forEach((c, j) => {
        if (c.zero()) return;
        const neg = c.n < 0n, abs = neg ? c.neg() : c;
        const coef = abs.n === 1n && abs.d === 1n ? "" : abs.html();
        s += s ? (neg ? " − " : " + ") : neg ? "−" : "";
        s += coef + vars[j];
      });
      return `${s || "0"} = ${l[n].html()}`;
    };
    const matriz = () => `<div class="tab-rolar"><table class="tb mat"><tbody>${A.map((l) => `<tr>${l.map((c, j) => `<td${j === n ? ' class="mat-b"' : ""}>${c.html()}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    passos.push(R("Escreva o sistema e a matriz aumentada", `${A.map((l) => eq(linhaTxt(l))).join("")}<p>Cada linha guarda os coeficientes de ${vars.join(", ")} e, depois da barra, o termo independente:</p>${matriz()}`));
    let lin = 0;
    const ops = [];
    for (let col = 0; col < n && lin < n; col++) {
      let piv = -1;
      for (let i = lin; i < n; i++) if (!A[i][col].zero()) { piv = i; break; }
      if (piv < 0) continue;
      if (piv !== lin) { [A[piv], A[lin]] = [A[lin], A[piv]]; ops.push(`Troque L${lin + 1} ↔ L${piv + 1} (o pivô não pode ser zero)`); }
      const p0 = A[lin][col];
      if (!(p0.n === 1n && p0.d === 1n)) { A[lin] = A[lin].map((c) => c.div(p0)); ops.push(`L${lin + 1} ← L${lin + 1} ÷ ${p0.html()} (pivô vira 1)`); }
      const feitas = [];
      for (let i = 0; i < n; i++) {
        if (i === lin || A[i][col].zero()) continue;
        const k = A[i][col];
        A[i] = A[i].map((c, j) => c.sub(k.mul(A[lin][j])));
        feitas.push(`L${i + 1} ← L${i + 1} − (${k.html()})·L${lin + 1}`);
      }
      passos.push(R(`Zere a coluna de ${vars[col]}`, `<ul class="lista">${[...ops, ...feitas].map((o) => `<li>${o}</li>`).join("")}</ul>${matriz()}`));
      ops.length = 0;
      lin++;
    }
    // classificação
    const zeroLinha = (l) => l.slice(0, n).every((c) => c.zero());
    const imposs = A.some((l) => zeroLinha(l) && !l[n].zero());
    const posto = A.filter((l) => !zeroLinha(l)).length;
    if (imposs) {
      passos.push(R("Classifique", `<p>Uma linha ficou 0 = ${A.find((l) => zeroLinha(l) && !l[n].zero())[n].html()}, o que é impossível.</p><p>O sistema é <b>impossível (SI)</b>: não há solução. Geometricamente, ${n === 2 ? "as retas são paralelas" : "os planos não têm ponto comum"}.</p>`));
      return { ok: true, passos, tipo: "SI", resposta: "Sistema impossível (sem solução)", respostaHTML: "<b>Sistema impossível</b> (S = ∅)" };
    }
    if (posto < n) {
      passos.push(R("Classifique", `<p>Sobrou ${n - posto} linha(s) 0 = 0: há menos equações independentes do que incógnitas.</p><p>O sistema é <b>possível e indeterminado (SPI)</b>: infinitas soluções. ${n === 2 ? "As retas coincidem." : "Os planos se cortam numa reta (ou coincidem)."}</p>`));
      return { ok: true, passos, tipo: "SPI", resposta: "Sistema possível e indeterminado (infinitas soluções)", respostaHTML: "<b>Infinitas soluções</b> (SPI)" };
    }
    const sol = A.map((l) => l[n]);
    passos.push(R("Leia a solução", `<p>A matriz virou a identidade: cada linha diz o valor de uma incógnita.</p>${eq(sol.map((s, j) => `${vars[j]} = <b>${s.html()}</b>`).join(" &nbsp;&nbsp; "))}`));
    const conf = M.map((l, i) => `${eq(`L${i + 1}: ${l.slice(0, n).map((c, j) => `${par(c)}·${par(sol[j].val())}`).join(" + ")} = ${N(l.slice(0, n).reduce((s, c, j) => s + c * sol[j].val(), 0))} ✓`)}`).join("");
    passos.push(R("Confira nas equações originais", conf));
    return { ok: true, passos, tipo: "SPD", sol: sol.map((s) => s.val()), valor: sol[0].val(), resposta: sol.map((s, j) => `${vars[j]} = ${s.txt()}`).join(", "), respostaHTML: sol.map((s, j) => `${vars[j]} = <b>${s.html()}</b>`).join(" · ") };
  }

  // ---------------------------------------------------------------------------
  // 2. Regra de três e porcentagem
  // ---------------------------------------------------------------------------
  function regra3(p) {
    const { a, b, c, inversa } = p;
    if (![a, b, c].every(fin)) return erro("Preencha os três valores conhecidos.");
    if (a === 0 || (inversa && c === 0)) return erro("Valores zero tornam a proporção impossível.");
    const passos = [];
    passos.push(R("Monte a tabela", `${tabela(["Grandeza 1", "Grandeza 2"], [[N(a), N(b)], [N(c), "<b>x</b>"]])}<p>${inversa ? "As grandezas são <b>inversamente</b> proporcionais: quando uma aumenta, a outra diminui na mesma proporção (ex.: mais operários → menos dias)." : "As grandezas são <b>diretamente</b> proporcionais: quando uma dobra, a outra também dobra (ex.: mais produtos → preço maior)."}</p>`));
    let x;
    if (!inversa) {
      x = (b * c) / a;
      passos.push(R("Multiplique cruzado", `${eq(`${frac(N(a), N(c))} = ${frac(N(b), "x")} → ${N(a)}·x = ${N(b)}·${par(c)}`)}${eq(`x = ${frac(`${N(b)} · ${par(c)}`, N(a))} = <b>${bonito(x)}</b>`)}`));
    } else {
      x = (a * b) / c;
      passos.push(R("Inverta uma das razões", `<p>Na proporção inversa o produto é constante: ${N(a)} · ${N(b)} = ${N(c)} · x.</p>${eq(`x = ${frac(`${N(a)} · ${par(b)}`, N(c))} = <b>${bonito(x)}</b>`)}`));
    }
    passos.push(R("Faz sentido?", `<p>${N(c)} é ${c > a ? "maior" : c < a ? "menor" : "igual"} que ${N(a)}; numa relação ${inversa ? "inversa x deve ser " + (c > a ? "menor" : "maior") : "direta x deve ser " + (c > a ? "maior" : "menor")} que ${N(b)}: x = ${N(x)} ${(inversa ? (c > a ? x <= b : x >= b) : c > a ? x >= b : x <= b) ? "✓" : ""}.</p>`));
    return { ok: true, passos, valor: x, resposta: `x = ${N(x)}`, respostaHTML: `x = <b>${bonito(x)}</b>` };
  }
  // regra de três composta: base = [valores da linha 1], alvo índice, nova linha, sentido de cada grandeza em relação à incógnita
  function regra3Composta(p) {
    const { l1, l2, inv, alvo } = p; // l1, l2: arrays; inv[i] true se inversa à grandeza alvo
    const k = l1.length;
    if (k < 3) return erro("Use pelo menos três grandezas (para duas, use a regra de três simples).");
    if (l1.some((v) => !fin(v)) || l2.some((v, i) => i !== alvo && !fin(v))) return erro("Preencha todos os valores (deixe só a incógnita em branco).");
    const passos = [];
    passos.push(R("Organize as grandezas", `${tabela(p.nomes.map((nm, i) => (i === alvo ? `<b>${nm}</b>` : nm)), [l1.map((v) => N(v)), l2.map((v, i) => (i === alvo ? "<b>x</b>" : N(v)))])}<p>Compare cada grandeza com a da incógnita (${p.nomes[alvo]}): ${p.nomes.map((nm, i) => (i === alvo ? null : `${nm} é <b>${inv[i] ? "inversa" : "direta"}</b>`)).filter(Boolean).join("; ")}.</p>`));
    let x = l1[alvo];
    const fat = [];
    for (let i = 0; i < k; i++) {
      if (i === alvo) continue;
      if (l1[i] === 0 || l2[i] === 0) return erro("Valores zero tornam a proporção impossível.");
      const f = inv[i] ? l1[i] / l2[i] : l2[i] / l1[i];
      fat.push(inv[i] ? frac(N(l1[i]), N(l2[i])) : frac(N(l2[i]), N(l1[i])));
      x *= f;
    }
    passos.push(R("Multiplique pelas razões", `<p>Grandeza direta entra na razão como “novo ÷ antigo”; inversa entra invertida (“antigo ÷ novo”).</p>${eq(`x = ${N(l1[alvo])} · ${fat.join(" · ")} = <b>${bonito(x)}</b>`)}`));
    return { ok: true, passos, valor: x, resposta: `x = ${N(x)}`, respostaHTML: `x = <b>${bonito(x)}</b>` };
  }
  function porcentagem(p) {
    const { modo } = p;
    const passos = [];
    if (modo === "de") {
      const { pc, v } = p;
      if (!fin(pc) || !fin(v)) return erro("Informe a porcentagem e o valor.");
      const r = (pc / 100) * v;
      passos.push(R("Porcentagem é “por cem”", `${eq(`${N(pc)}% = ${frac(N(pc), "100")} = ${N(pc / 100)}`)}${eq(`${N(pc)}% de ${N(v)} = ${N(pc / 100)} × ${par(v)} = <b>${N(r)}</b>`)}`));
      return { ok: true, passos, valor: r, resposta: `${N(r)}`, respostaHTML: `<b>${N(r)}</b>` };
    }
    if (modo === "quanto") {
      const { parte, total } = p;
      if (!fin(parte) || !fin(total) || total === 0) return erro("Informe a parte e o total (diferente de zero).");
      const r = (parte / total) * 100;
      passos.push(R("Divida a parte pelo total", `${eq(`${frac(N(parte), N(total))} = ${N(parte / total, 6)}`)}${eq(`${N(parte / total, 6)} × 100 = <b>${N(r)}%</b>`)}`));
      return { ok: true, passos, valor: r, resposta: `${N(r)}%`, respostaHTML: `<b>${N(r)}%</b>` };
    }
    if (modo === "variacao") {
      const { v0, v1 } = p;
      if (!fin(v0) || !fin(v1) || v0 === 0) return erro("Informe o valor inicial (diferente de zero) e o final.");
      const r = ((v1 - v0) / v0) * 100;
      passos.push(R("Variação relativa", `${eq(`variação = ${frac("final − inicial", "inicial")} × 100 = ${frac(`${N(v1)} − ${par(v0)}`, N(v0))} × 100 = <b>${N(r)}%</b>`)}<p>${r > 0 ? "Positivo: <b>aumento</b>." : r < 0 ? "Negativo: <b>redução</b>." : "Sem variação."}</p>`));
      return { ok: true, passos, valor: r, resposta: `${N(r)}%`, respostaHTML: `<b>${r > 0 ? "+" : ""}${N(r)}%</b>` };
    }
    if (modo === "sucessivos") {
      const { v, taxas } = p;
      if (!fin(v) || !taxas.length || taxas.some((t) => !fin(t))) return erro("Informe o valor e as taxas (use negativo para desconto).");
      let atual = v, fator = 1;
      const linhas = taxas.map((t, i) => { const f = 1 + t / 100; fator *= f; const novo = atual * f; const l = [i + 1, `${t > 0 ? "+" : ""}${N(t)}%`, N(f, 6), N(atual), N(novo)]; atual = novo; return l; });
      passos.push(R("Use fatores multiplicativos", `<p>Aumento de t% multiplica por (1 + t/100); desconto multiplica por (1 − t/100). Taxas sucessivas <b>não se somam</b>, multiplicam:</p>${tabela(["Etapa", "Taxa", "Fator", "Antes", "Depois"], linhas)}`));
      passos.push(R("Resultado e taxa equivalente", `${eq(`final = ${N(v)} × ${N(fator, 6)} = <b>${N(atual)}</b>`)}${eq(`taxa equivalente = (${N(fator, 6)} − 1) × 100 = <b>${N((fator - 1) * 100)}%</b>`)}${dica(`Repare: somar as taxas daria ${N(taxas.reduce((a, b) => a + b, 0))}%, que está errado.`)}`));
      return { ok: true, passos, valor: atual, resposta: `${N(atual)} (variação total ${N((fator - 1) * 100)}%)`, respostaHTML: `<b>${N(atual)}</b> · variação total <b>${N((fator - 1) * 100)}%</b>` };
    }
    return erro("Escolha o tipo de cálculo.");
  }

  // ---------------------------------------------------------------------------
  // 3. Potências, logaritmos e notação científica
  // ---------------------------------------------------------------------------
  function logaritmo(p) {
    const { base, x } = p;
    if (!fin(x) || x <= 0) return erro("O logaritmando deve ser maior que zero (não existe log de zero nem de negativo).");
    const b = base === "e" ? Math.E : base;
    if (!fin(b) || b <= 0 || b === 1) return erro("A base deve ser positiva e diferente de 1.");
    const nomeB = base === "e" ? "e" : N(b);
    const v = Math.log(x) / Math.log(b);
    const passos = [];
    passos.push(R("O que é logaritmo", `${eq(`log<sub>${nomeB}</sub>(${N(x)}) = y &nbsp;⟺&nbsp; ${nomeB}<sup>y</sup> = ${N(x)}`)}<p>Pergunta: a que expoente devo elevar ${nomeB} para obter ${N(x)}?</p>`));
    const inteiro = Math.abs(v - Math.round(v)) < 1e-10;
    if (inteiro) passos.push(R("Resposta exata", `<p>${nomeB}<sup>${Math.round(v)}</sup> = ${N(Math.pow(b, Math.round(v)))}, então o log é exatamente <b>${Math.round(v)}</b>.</p>`));
    else if (base !== 10 && base !== "e") passos.push(R("Mudança de base (calculadora)", `${eq(`log<sub>${nomeB}</sub>(${N(x)}) = ${frac(`log(${N(x)})`, `log(${nomeB})`)} = ${frac(N(Math.log10(x), 6), N(Math.log10(b), 6))} = <b>${N(v, 6)}</b>`)}`));
    else passos.push(R("Calcule", eq(`${base === "e" ? "ln" : "log"}(${N(x)}) = <b>${N(v, 6)}</b>`)));
    passos.push(R("Confira", eq(`${nomeB}<sup>${N(v, 6)}</sup> = ${N(Math.pow(b, v), 6)} ✓`)));
    return { ok: true, passos, valor: v, resposta: `${N(v, 6)}`, respostaHTML: `log<sub>${nomeB}</sub>(${N(x)}) = <b>${inteiro ? Math.round(v) : N(v, 6)}</b>` };
  }
  function expEq(p) {
    const { base, y } = p;
    if (!fin(base) || base <= 0 || base === 1) return erro("A base deve ser positiva e diferente de 1.");
    if (!fin(y) || y <= 0) return erro(`${N(base)}<sup>x</sup> é sempre positivo: não há solução para y ≤ 0.`);
    const x = Math.log(y) / Math.log(base);
    const passos = [R("Aplique log dos dois lados", `${eq(`${N(base)}<sup>x</sup> = ${N(y)} → x·log(${N(base)}) = log(${N(y)})`)}`), R("Isole x", eq(`x = ${frac(`log(${N(y)})`, `log(${N(base)})`)} = ${frac(N(Math.log10(y), 6), N(Math.log10(base), 6))} = <b>${N(x, 6)}</b>`)), R("Confira", eq(`${N(base)}<sup>${N(x, 6)}</sup> = ${N(Math.pow(base, x), 6)} ✓`))];
    return { ok: true, passos, valor: x, resposta: `x = ${N(x, 6)}`, respostaHTML: `x = <b>${N(x, 6)}</b>` };
  }
  function potencia(p) {
    const { b, num, den = 1 } = p;
    if (!fin(b) || !fin(num) || !fin(den) || den === 0) return erro("Informe a base e o expoente.");
    const passos = [];
    const e = num / den;
    let v;
    if (b < 0 && den % 2 === 0 && Number.isInteger(den)) return erro("Raiz de índice par de número negativo não é real.");
    if (b < 0 && Number.isInteger(den) && den % 2 === 1) v = -Math.pow(-b, e) * (Math.abs(num) % 2 === 1 ? 1 : -1);
    else v = Math.pow(b, e);
    if (b === 0 && e < 0) return erro("0 elevado a expoente negativo não existe (divisão por zero).");
    passos.push(R("Expoente fracionário = raiz", den !== 1 ? `${eq(`${par(b)}<sup>${frac(N(num), N(den))}</sup> = <sup>${N(den)}</sup>√(${par(b)}<sup>${N(num)}</sup>)`)}<p>O denominador do expoente é o índice da raiz; o numerador é a potência.</p>` : `<p>Expoente inteiro: multiplique a base por ela mesma ${N(Math.abs(num))} vez(es)${num < 0 ? " e inverta (expoente negativo = 1 ÷ potência)" : ""}.</p>`));
    if (num < 0) passos.push(R("Expoente negativo", eq(`${par(b)}<sup>${N(e)}</sup> = ${frac("1", `${par(b)}<sup>${N(-e)}</sup>`)}`)));
    passos.push(R("Resultado", eq(`= <b>${bonito(v)}</b>`)));
    return { ok: true, passos, valor: v, resposta: N(v, 6), respostaHTML: `<b>${bonito(v)}</b>` };
  }
  function notacaoCientifica(txt) {
    const v = Q.lerNumero(txt);
    if (!fin(v)) return erro("Digite um número (ex.: 0,00045 ou 3,2e5).");
    if (v === 0) return { ok: true, passos: [R("Zero", "<p>Zero não tem notação científica: é 0.</p>")], valor: 0, resposta: "0", respostaHTML: "<b>0</b>" };
    const e = Math.floor(Math.log10(Math.abs(v)));
    const m = v / Math.pow(10, e);
    const passos = [];
    passos.push(R("Forma a × 10ⁿ", `<p>Em notação científica a mantissa a fica entre 1 e 10 (1 ≤ |a| &lt; 10) e n é inteiro.</p>`));
    passos.push(R("Ande com a vírgula", `<p>Para deixar só um algarismo não nulo antes da vírgula, ela anda <b>${Math.abs(e)}</b> casa(s) para a ${e >= 0 ? "esquerda (o expoente fica positivo)" : "direita (o expoente fica negativo)"}.</p>${eq(`${N(v, 10)} = <b>${N(m, 10)} × 10<sup>${String(e).replace("-", "−")}</sup></b>`)}`));
    passos.push(R("Ordem de grandeza", `<p>A ordem de grandeza é 10<sup>${String(Math.abs(m) >= Math.sqrt(10) ? e + 1 : e).replace("-", "−")}</sup> (arredonda para cima quando a mantissa passa de √10 ≈ 3,16).</p>`));
    return { ok: true, passos, valor: v, resposta: `${N(m, 10)} × 10^${e}`, respostaHTML: `<b>${N(m, 10)} × 10<sup>${String(e).replace("-", "−")}</sup></b>` };
  }

  // ---------------------------------------------------------------------------
  // 4. Trigonometria
  // ---------------------------------------------------------------------------
  const RAD = Math.PI / 180;
  const NOTAVEIS = { 0: ["0", "1", "0"], 30: [frac("1", "2"), frac("√3", "2"), frac("√3", "3")], 45: [frac("√2", "2"), frac("√2", "2"), "1"], 60: [frac("√3", "2"), frac("1", "2"), "√3"], 90: ["1", "0", "não existe"], 180: ["0", "−1", "0"], 270: ["−1", "0", "não existe"], 360: ["0", "1", "0"] };
  function trigAngulo(p) {
    let g = p.unidade === "rad" ? p.ang / RAD : p.ang;
    if (!fin(g)) return erro("Digite o ângulo.");
    const passos = [];
    const red = ((g % 360) + 360) % 360;
    if (p.unidade === "rad") passos.push(R("Converta para graus", eq(`${N(p.ang)} rad × ${frac("180°", "π")} = <b>${N(g)}°</b>`)));
    else passos.push(R("Em radianos", eq(`${N(g)}° × ${frac("π", "180°")} = <b>${N(g * RAD, 6)} rad</b>${Number.isInteger(g) ? ` = ${fracPi(g)}` : ""}`)));
    if (red !== g) passos.push(R("Reduza à 1ª volta", `<p>Ângulos que diferem de 360° têm o mesmo seno e cosseno:</p>${eq(`${N(g)}° → <b>${N(red)}°</b>`)}`));
    const quad = red === 0 || red % 90 === 0 ? "sobre um eixo" : red < 90 ? "1º quadrante (sen +, cos +)" : red < 180 ? "2º quadrante (sen +, cos −)" : red < 270 ? "3º quadrante (sen −, cos −)" : "4º quadrante (sen −, cos +)";
    const ref = red <= 90 ? red : red <= 180 ? 180 - red : red <= 270 ? red - 180 : 360 - red;
    passos.push(R("Quadrante e ângulo de referência", `<p>${N(red)}° está no <b>${quad}</b>. Ângulo de referência (com o eixo x): <b>${N(ref)}°</b>.</p>`));
    const s = Math.sin(red * RAD), c = Math.cos(red * RAD), t = Math.abs(c) < 1e-12 ? NaN : s / c;
    const ex = NOTAVEIS[red] || (NOTAVEIS[ref] ? NOTAVEIS[ref].map((v, i) => { const sinal = [s, c, t][i] < 0 ? "−" : ""; return v === "não existe" ? v : v === "0" ? "0" : sinal + v; }) : null);
    passos.push(R("Valores", tabela(["", "sen", "cos", "tg"], [["valor", N(s, 6), N(c, 6), isNaN(t) ? "não existe" : N(t, 6)], ...(ex ? [["exato", ...ex]] : [])])));
    return { ok: true, passos, valor: s, sen: s, cos: c, tg: t, resposta: `sen = ${N(s, 6)}, cos = ${N(c, 6)}, tg = ${isNaN(t) ? "não existe" : N(t, 6)}`, respostaHTML: `sen = <b>${ex ? ex[0] : N(s, 6)}</b> · cos = <b>${ex ? ex[1] : N(c, 6)}</b> · tg = <b>${ex ? ex[2] : isNaN(t) ? "não existe" : N(t, 6)}</b>` };
  }
  function fracPi(g) {
    const gg = Math.abs(g);
    const d = (function mdc(a, b) { return b ? mdc(b, a % b) : a; })(gg, 180);
    const nn = gg / d, dd = 180 / d;
    if (nn === 0) return "0";
    const s = g < 0 ? "−" : "";
    return dd === 1 ? `${s}${nn === 1 ? "" : nn}π` : `${s}${frac(`${nn === 1 ? "" : nn}π`, String(dd))}`;
  }
  // triângulo retângulo: hipotenusa a, catetos b (oposto a α) e c, ângulo α (graus)
  function trianguloRetangulo(p) {
    let { a, b, c, alfa } = p;
    const dados = [a, b, c, alfa].filter((v) => v != null && isFinite(v)).length;
    if (dados < 2) return erro("Informe dois elementos (dois lados, ou um lado e um ângulo agudo).");
    if ([a, b, c].some((v) => v != null && v <= 0)) return erro("Lados devem ser positivos.");
    if (alfa != null && (alfa <= 0 || alfa >= 90)) return erro("O ângulo agudo deve estar entre 0° e 90°.");
    if (a != null && ((b != null && b >= a) || (c != null && c >= a))) return erro("A hipotenusa é o maior lado: deve ser maior que cada cateto.");
    const passos = [];
    passos.push(R("Nomes no triângulo", `<p><b>a</b> = hipotenusa (oposta ao ângulo reto), <b>b</b> = cateto oposto a α, <b>c</b> = cateto adjacente a α, β = 90° − α.</p>${eq("sen α = b/a &nbsp; cos α = c/a &nbsp; tg α = b/c &nbsp;&nbsp; a² = b² + c²")}`));
    if (alfa == null) {
      if (a != null && b != null) { c = Math.sqrt(a * a - b * b); passos.push(R("Pitágoras", eq(`c = √(a² − b²) = √(${N(a)}² − ${N(b)}²) = <b>${N(c)}</b>`))); }
      else if (a != null && c != null) { b = Math.sqrt(a * a - c * c); passos.push(R("Pitágoras", eq(`b = √(a² − c²) = √(${N(a)}² − ${N(c)}²) = <b>${N(b)}</b>`))); }
      else { a = Math.hypot(b, c); passos.push(R("Pitágoras", eq(`a = √(b² + c²) = √(${N(b)}² + ${N(c)}²) = <b>${N(a)}</b>`))); }
      alfa = Math.atan2(b, c) / RAD;
      passos.push(R("Ângulo α", eq(`tg α = ${frac("b", "c")} = ${frac(N(b), N(c))} = ${N(b / c, 5)} → α = arctg(${N(b / c, 5)}) = <b>${N(alfa)}°</b>`)));
    } else {
      const s = Math.sin(alfa * RAD), co = Math.cos(alfa * RAD), t = Math.tan(alfa * RAD);
      if (a != null) { b = a * s; c = a * co; passos.push(R("Use seno e cosseno", `${eq(`b = a·sen α = ${N(a)}·sen ${N(alfa)}° = <b>${N(b)}</b>`)}${eq(`c = a·cos α = ${N(a)}·cos ${N(alfa)}° = <b>${N(c)}</b>`)}`)); }
      else if (b != null) { a = b / s; c = b / t; passos.push(R("Use seno e tangente", `${eq(`a = ${frac("b", "sen α")} = ${frac(N(b), `sen ${N(alfa)}°`)} = <b>${N(a)}</b>`)}${eq(`c = ${frac("b", "tg α")} = ${frac(N(b), `tg ${N(alfa)}°`)} = <b>${N(c)}</b>`)}`)); }
      else { a = c / co; b = c * t; passos.push(R("Use cosseno e tangente", `${eq(`a = ${frac("c", "cos α")} = ${frac(N(c), `cos ${N(alfa)}°`)} = <b>${N(a)}</b>`)}${eq(`b = c·tg α = ${N(c)}·tg ${N(alfa)}° = <b>${N(b)}</b>`)}`)); }
    }
    const beta = 90 - alfa;
    passos.push(R("Feche o triângulo", `${eq(`β = 90° − α = <b>${N(beta)}°</b>`)}${eq(`Conferência: b² + c² = ${N(b * b + c * c)} = a² = ${N(a * a)} ✓`)}${eq(`Área = ${frac("b·c", "2")} = <b>${N((b * c) / 2)}</b> &nbsp; Perímetro = <b>${N(a + b + c)}</b>`)}`));
    return { ok: true, passos, a, b, c, alfa, beta, valor: a, resposta: `a = ${N(a)}, b = ${N(b)}, c = ${N(c)}, α = ${N(alfa)}°, β = ${N(beta)}°`, respostaHTML: `a = <b>${N(a)}</b> · b = <b>${N(b)}</b> · c = <b>${N(c)}</b><br>α = <b>${N(alfa)}°</b> · β = <b>${N(beta)}°</b>` };
  }
  // triângulo qualquer: lados a, b, c opostos aos ângulos A, B, C (graus)
  function trianguloQualquer(p) {
    let { a, b, c, A, B, C } = p;
    const L = [a, b, c].filter((v) => v != null).length, G = [A, B, C].filter((v) => v != null).length;
    if (L + G < 3 || L === 0) return erro("Informe três elementos, sendo pelo menos um lado (LLL, LAL, ALA, LAA ou LLA).");
    if ([a, b, c].some((v) => v != null && !(v > 0)) || [A, B, C].some((v) => v != null && !(v > 0 && v < 180))) return erro("Lados positivos e ângulos entre 0° e 180°.");
    const passos = [];
    passos.push(R("Leis que vamos usar", `${eq(`Lei dos senos: ${frac("a", "sen A")} = ${frac("b", "sen B")} = ${frac("c", "sen C")}`)}${eq("Lei dos cossenos: a² = b² + c² − 2bc·cos A")}${eq("A + B + C = 180°")}`));
    const s = (g) => Math.sin(g * RAD), co = (g) => Math.cos(g * RAD), ac = (x) => Math.acos(Math.max(-1, Math.min(1, x))) / RAD;
    let nota = "";
    if (G === 2) { if (A == null) A = 180 - B - C; else if (B == null) B = 180 - A - C; else C = 180 - A - B; if (!(A > 0 && B > 0 && C > 0)) return erro("A soma dos ângulos passa de 180°."); passos.push(R("Terceiro ângulo", eq(`A + B + C = 180° → A = ${N(A)}°, B = ${N(B)}°, C = ${N(C)}°`))); }
    if (L === 3) {
      if (a + b <= c || a + c <= b || b + c <= a) return erro("Esses lados não formam triângulo (cada lado deve ser menor que a soma dos outros dois).");
      A = ac((b * b + c * c - a * a) / (2 * b * c)); B = ac((a * a + c * c - b * b) / (2 * a * c)); C = 180 - A - B;
      passos.push(R("Lei dos cossenos para os ângulos (LLL)", `${eq(`cos A = ${frac("b² + c² − a²", "2bc")} = ${N((b * b + c * c - a * a) / (2 * b * c), 5)} → A = <b>${N(A)}°</b>`)}${eq(`cos B = ${frac("a² + c² − b²", "2ac")} = ${N((a * a + c * c - b * b) / (2 * a * c), 5)} → B = <b>${N(B)}°</b>`)}${eq(`C = 180° − A − B = <b>${N(C)}°</b>`)}`));
    } else if (L === 2 && G >= 1) {
      // LAL: ângulo entre os dois lados conhecidos
      if (a == null && A != null) { a = Math.sqrt(b * b + c * c - 2 * b * c * co(A)); passos.push(R("Lei dos cossenos (LAL)", eq(`a = √(b² + c² − 2bc·cos A) = √(${N(b)}² + ${N(c)}² − 2·${N(b)}·${N(c)}·cos ${N(A)}°) = <b>${N(a)}</b>`))); }
      else if (b == null && B != null) { b = Math.sqrt(a * a + c * c - 2 * a * c * co(B)); passos.push(R("Lei dos cossenos (LAL)", eq(`b = √(a² + c² − 2ac·cos B) = <b>${N(b)}</b>`))); }
      else if (c == null && C != null) { c = Math.sqrt(a * a + b * b - 2 * a * b * co(C)); passos.push(R("Lei dos cossenos (LAL)", eq(`c = √(a² + b² − 2ab·cos C) = <b>${N(c)}</b>`))); }
      else {
        // LLA (caso ambíguo): conhecemos um lado e o ângulo oposto
        const pares = [["a", "A"], ["b", "B"], ["c", "C"]];
        const v = { a, b, c, A, B, C };
        const conh = pares.find(([l, g]) => v[l] != null && v[g] != null);
        const outro = pares.find(([l, g]) => v[l] != null && v[g] == null);
        if (!conh || !outro) return erro("Combinação de dados não suportada: informe um lado e o ângulo oposto a ele, ou o ângulo entre os dois lados.");
        const sx = (v[outro[0]] * s(v[conh[1]])) / v[conh[0]];
        if (sx > 1 + 1e-12) return erro(`sen ${outro[1]} daria ${N(sx)} &gt; 1: não existe triângulo com esses dados.`);
        let g1 = Math.asin(Math.min(1, sx)) / RAD;
        const g2 = 180 - g1;
        const duas = g2 !== g1 && v[conh[1]] + g2 < 180;
        v[outro[1]] = g1;
        passos.push(R("Lei dos senos (LLA)", `${eq(`sen ${outro[1]} = ${frac(`${outro[0]}·sen ${conh[1]}`, conh[0])} = ${N(sx, 5)} → ${outro[1]} = <b>${N(g1)}°</b>`)}${duas ? aviso(`Caso ambíguo: ${outro[1]} = ${N(g2)}° também serve (sen θ = sen(180° − θ)), gerando um segundo triângulo. Mostramos o de ângulo agudo.`) : ""}`));
        ({ a, b, c, A, B, C } = v);
        const falta = ["A", "B", "C"].find((g) => v[g] == null);
        v[falta] = 180 - ["A", "B", "C"].filter((g) => g !== falta).reduce((t, g) => t + v[g], 0);
        ({ A, B, C } = v);
        nota = duas ? "ambíguo" : "";
      }
    }
    // com todos os ângulos e ao menos um lado: lei dos senos
    if ([A, B, C].some((g) => g == null)) { if (A == null) A = 180 - B - C; else if (B == null) B = 180 - A - C; else C = 180 - A - B; passos.push(R("Ângulo restante", eq(`A = ${N(A)}°, B = ${N(B)}°, C = ${N(C)}°`))); }
    const k = a != null ? a / s(A) : b != null ? b / s(B) : c / s(C);
    const faltantes = [];
    if (a == null) { a = k * s(A); faltantes.push(`a = ${N(k)}·sen ${N(A)}° = <b>${N(a)}</b>`); }
    if (b == null) { b = k * s(B); faltantes.push(`b = ${N(k)}·sen ${N(B)}° = <b>${N(b)}</b>`); }
    if (c == null) { c = k * s(C); faltantes.push(`c = ${N(k)}·sen ${N(C)}° = <b>${N(c)}</b>`); }
    if (faltantes.length) passos.push(R("Lei dos senos para os lados", `<p>A razão lado/sen(ângulo oposto) vale ${N(k)} (é o diâmetro do círculo circunscrito).</p>${faltantes.map(eq).join("")}`));
    const area = 0.5 * a * b * s(C);
    passos.push(R("Área", eq(`Área = ${frac("1", "2")}·a·b·sen C = <b>${N(area)}</b>`)));
    return { ok: true, passos, a, b, c, A, B, C, area, nota, valor: a, resposta: `a = ${N(a)}, b = ${N(b)}, c = ${N(c)}, A = ${N(A)}°, B = ${N(B)}°, C = ${N(C)}°`, respostaHTML: `a = <b>${N(a)}</b> · b = <b>${N(b)}</b> · c = <b>${N(c)}</b><br>A = <b>${N(A)}°</b> · B = <b>${N(B)}°</b> · C = <b>${N(C)}°</b>` };
  }

  // ---------------------------------------------------------------------------
  // 5. Vetores
  // ---------------------------------------------------------------------------
  function lerVetor(txt) {
    const t = String(txt || "").replace(/[()[\]<>{}]/g, " ").trim();
    if (!t) return null;
    const partes = t.split(/\s*;\s*|\s+|,\s+/).filter(Boolean);
    const v = partes.map((x) => Q.lerNumero(x));
    if (v.length < 2 || v.length > 3 || v.some((x) => !fin(x))) return null;
    return v;
  }
  const vtxt = (v) => `(${v.map((x) => N(x)).join("; ")})`;
  const modulo = (v) => Math.hypot(...v);
  function vetores(p) {
    const { op } = p;
    const u = lerVetor(p.u), w = lerVetor(p.v);
    if (!u) return erro("Vetor u inválido. Escreva as componentes separadas por ; ou espaço: (3; 4) ou 1 2 3.");
    const passos = [];
    if (op === "modulo") {
      const m = modulo(u);
      passos.push(R("Módulo (Pitágoras)", `${eq(`|u| = √(${u.map((x) => `${par(x)}²`).join(" + ")}) = √${N(u.reduce((s, x) => s + x * x, 0))} = <b>${N(m)}</b>`)}`));
      if (m > 0) passos.push(R("Vetor unitário (versor)", eq(`û = ${frac("u", "|u|")} = <b>${vtxt(u.map((x) => x / m))}</b>`)));
      if (u.length === 2 && m > 0) { const ang = Math.atan2(u[1], u[0]) / RAD; passos.push(R("Direção", eq(`θ = arctg(${frac("u<sub>y</sub>", "u<sub>x</sub>")}) = <b>${N(ang)}°</b> (com o eixo x, sentido anti-horário)`))); }
      return { ok: true, passos, valor: m, u, resposta: `|u| = ${N(m)}`, respostaHTML: `|u| = <b>${N(m)}</b>` };
    }
    if (op === "polar") {
      const [mod, ang] = u;
      const r = [mod * Math.cos(ang * RAD), mod * Math.sin(ang * RAD)];
      passos.push(R("Decomponha", `${eq(`u<sub>x</sub> = |u|·cos θ = ${N(mod)}·cos ${N(ang)}° = <b>${N(r[0])}</b>`)}${eq(`u<sub>y</sub> = |u|·sen θ = ${N(mod)}·sen ${N(ang)}° = <b>${N(r[1])}</b>`)}`));
      return { ok: true, passos, valor: r[0], u: r, resposta: `u = ${vtxt(r)}`, respostaHTML: `u = <b>${vtxt(r)}</b>` };
    }
    if (!w) return erro("Vetor v inválido.");
    if (u.length !== w.length) return erro("Os dois vetores devem ter o mesmo número de componentes (2D ou 3D).");
    if (op === "soma" || op === "sub") {
      const s = op === "soma" ? 1 : -1;
      const r = u.map((x, i) => x + s * w[i]);
      passos.push(R(op === "soma" ? "Some componente a componente" : "Subtraia componente a componente", eq(`u ${s > 0 ? "+" : "−"} v = (${u.map((x, i) => `${N(x)} ${s > 0 ? "+" : "−"} ${par(w[i])}`).join("; ")}) = <b>${vtxt(r)}</b>`)));
      passos.push(R("Módulo do resultado", eq(`|u ${s > 0 ? "+" : "−"} v| = <b>${N(modulo(r))}</b>`)));
      return { ok: true, passos, valor: modulo(r), u, v: w, r, resposta: `${vtxt(r)}`, respostaHTML: `<b>${vtxt(r)}</b> · módulo ${N(modulo(r))}` };
    }
    if (op === "escalar" || op === "angulo") {
      const d = u.reduce((s, x, i) => s + x * w[i], 0);
      passos.push(R("Produto escalar", eq(`u·v = ${u.map((x, i) => `${par(x)}·${par(w[i])}`).join(" + ")} = <b>${N(d)}</b>`)));
      const mu = modulo(u), mv = modulo(w);
      if (mu === 0 || mv === 0) return { ok: true, passos, valor: d, resposta: `u·v = ${N(d)}`, respostaHTML: `u·v = <b>${N(d)}</b>` };
      const cosT = d / (mu * mv), ang = Math.acos(Math.max(-1, Math.min(1, cosT))) / RAD;
      passos.push(R("Ângulo entre os vetores", `${eq(`cos θ = ${frac("u·v", "|u|·|v|")} = ${frac(N(d), `${N(mu)}·${N(mv)}`)} = ${N(cosT, 5)}`)}${eq(`θ = <b>${N(ang)}°</b>`)}<p>${Math.abs(d) < 1e-12 ? "Produto escalar zero: os vetores são <b>perpendiculares</b>." : d > 0 ? "Positivo: ângulo agudo." : "Negativo: ângulo obtuso."}</p>`));
      return { ok: true, passos, valor: op === "escalar" ? d : ang, u, v: w, resposta: op === "escalar" ? `u·v = ${N(d)}` : `θ = ${N(ang)}°`, respostaHTML: `u·v = <b>${N(d)}</b> · θ = <b>${N(ang)}°</b>` };
    }
    if (op === "vetorial") {
      const a = u.length === 2 ? [...u, 0] : u, b = w.length === 2 ? [...w, 0] : w;
      const r = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
      passos.push(R("Determinante simbólico", `${eq(`u × v = (u<sub>y</sub>v<sub>z</sub> − u<sub>z</sub>v<sub>y</sub>; u<sub>z</sub>v<sub>x</sub> − u<sub>x</sub>v<sub>z</sub>; u<sub>x</sub>v<sub>y</sub> − u<sub>y</sub>v<sub>x</sub>)`)}${eq(`= (${par(a[1])}·${par(b[2])} − ${par(a[2])}·${par(b[1])}; ${par(a[2])}·${par(b[0])} − ${par(a[0])}·${par(b[2])}; ${par(a[0])}·${par(b[1])} − ${par(a[1])}·${par(b[0])}) = <b>${vtxt(r)}</b>`)}`));
      passos.push(R("Interpretação", `<p>u × v é perpendicular a u e a v (regra da mão direita). Seu módulo, <b>${N(modulo(r))}</b>, é a área do paralelogramo formado por u e v.</p>`));
      return { ok: true, passos, valor: modulo(r), u, v: w, r, resposta: `u × v = ${vtxt(r)}`, respostaHTML: `u × v = <b>${vtxt(r)}</b>` };
    }
    return erro("Escolha a operação.");
  }

  // ---------------------------------------------------------------------------
  // 6. Cálculo simbólico (derivadas e integrais) sobre a AST de Expr
  // ---------------------------------------------------------------------------
  const num = (v) => ({ t: "num", v });
  const vr = (n) => ({ t: "var", n });
  const bin = (o, a, b) => ({ t: "bin", o, a, b });
  const fn = (n, a) => ({ t: "fn", n, a: [a] });
  const neg = (a) => ({ t: "neg", a });
  const ehNum = (a, v) => a.t === "num" && (v === undefined || Math.abs(a.v - v) < 1e-15);
  function temVar(a, x) {
    if (a.t === "var") return a.n === x;
    if (a.t === "num") return false;
    if (a.t === "neg") return temVar(a.a, x);
    if (a.t === "bin") return temVar(a.a, x) || temVar(a.b, x);
    if (a.t === "fn") return a.a.some((y) => temVar(y, x));
    return false;
  }
  function igual(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  // simplificação: dobra constantes e tira identidades (0, 1)
  function simp(a) {
    if (a.t === "neg") {
      const u = simp(a.a);
      if (u.t === "num") return num(-u.v);
      if (u.t === "neg") return u.a;
      return neg(u);
    }
    if (a.t === "fn") {
      const u = simp(a.a[0]);
      if (a.n === "ln" && u.t === "var" && u.n === "e" && u.constante) return num(1);
      if (u.t === "num" && ["sin", "cos", "tan", "exp", "ln", "log", "sqrt"].includes(a.n)) {
        const v = X.avaliar(fn(a.n, u), {});
        if (Number.isInteger(v)) return num(v);
      }
      return { t: "fn", n: a.n, a: [u] };
    }
    if (a.t !== "bin") return a;
    let L = simp(a.a), Rr = simp(a.b);
    const o = a.o;
    if (L.t === "num" && Rr.t === "num") {
      const v = o === "+" ? L.v + Rr.v : o === "-" ? L.v - Rr.v : o === "*" ? L.v * Rr.v : o === "/" ? L.v / Rr.v : Math.pow(L.v, Rr.v);
      if (o !== "/" || Number.isInteger(v)) return num(v);
    }
    if (o === "+") {
      if (ehNum(L, 0)) return Rr;
      if (ehNum(Rr, 0)) return L;
      if (Rr.t === "neg") return simp(bin("-", L, Rr.a));
      if (Rr.t === "num" && Rr.v < 0) return bin("-", L, num(-Rr.v));
      if (igual(L, Rr)) return simp(bin("*", num(2), L));
    }
    if (o === "-") {
      if (ehNum(Rr, 0)) return L;
      if (ehNum(L, 0)) return simp(neg(Rr));
      if (igual(L, Rr)) return num(0);
      if (Rr.t === "neg") return simp(bin("+", L, Rr.a));
      if (Rr.t === "num" && Rr.v < 0) return bin("+", L, num(-Rr.v));
    }
    if (o === "*") {
      if (ehNum(L, 0) || ehNum(Rr, 0)) return num(0);
      if (ehNum(L, 1)) return Rr;
      if (ehNum(Rr, 1)) return L;
      if (ehNum(L, -1)) return simp(neg(Rr));
      if (ehNum(Rr, -1)) return simp(neg(L));
      if (Rr.t === "num" && L.t !== "num") [L, Rr] = [Rr, L]; // número na frente
      if (L.t === "num" && Rr.t === "bin" && Rr.o === "*" && Rr.a.t === "num") return simp(bin("*", num(L.v * Rr.a.v), Rr.b));
      if (L.t === "neg") return simp(neg(bin("*", L.a, Rr)));
      if (Rr.t === "neg") return simp(neg(bin("*", L, Rr.a)));
      if (L.t === "num" && Rr.t === "bin" && Rr.o === "/" && Rr.a.t === "num") return simp(bin("/", num(L.v * Rr.a.v), Rr.b));
      if (igual(L, Rr)) return bin("^", L, num(2));
      if (L.t === "bin" && L.o === "^" && igual(L.a, Rr) && L.b.t === "num") return bin("^", Rr, num(L.b.v + 1));
      if (Rr.t === "bin" && Rr.o === "^" && igual(Rr.a, L) && Rr.b.t === "num") return bin("^", L, num(Rr.b.v + 1));
    }
    if (o === "/") {
      if (ehNum(L, 0)) return num(0);
      if (ehNum(Rr, 1)) return L;
      if (igual(L, Rr)) return num(1);
      if (L.t === "num" && Rr.t === "num") {
        const g = (function mdc(x, y) { return y ? mdc(y, x % y) : Math.abs(x); })(L.v, Rr.v);
        if (Number.isInteger(L.v) && Number.isInteger(Rr.v) && g > 1) return bin("/", num(L.v / g), num(Rr.v / g));
      }
      if (L.t === "neg") return simp(neg(bin("/", L.a, Rr)));
      if (Rr.t === "num" && Rr.v < 0) return simp(neg(bin("/", L, num(-Rr.v))));
      if (L.t === "bin" && L.o === "/") return simp(bin("/", L.a, bin("*", L.b, Rr)));
      if (L.t === "bin" && L.o === "*" && L.a.t === "num" && Rr.t === "num" && Number.isInteger(L.a.v / Rr.v)) return simp(bin("*", num(L.a.v / Rr.v), L.b));
    }
    if (o === "^") {
      if (ehNum(Rr, 0)) return num(1);
      if (ehNum(Rr, 1)) return L;
      if (ehNum(L, 1)) return num(1);
      if (L.t === "bin" && L.o === "^" && L.b.t === "num" && Rr.t === "num") return bin("^", L.a, num(L.b.v * Rr.v));
    }
    return bin(o, L, Rr);
  }
  const S = (a) => { let b = simp(a); for (let i = 0; i < 4; i++) { const c = simp(b); if (igual(c, b)) break; b = c; } return b; };
  const H = (a) => X.paraHTML(a);

  // derivada com registro das regras usadas
  function derivar(a, x, reg) {
    const D = (u) => derivar(u, x, reg);
    const anota = (regra, de, res) => { if (reg && reg.length < 40) reg.push({ regra, de, res }); return res; };
    if (!temVar(a, x)) return num(0);
    switch (a.t) {
      case "var": return num(1);
      case "neg": return neg(D(a.a));
      case "bin": {
        const u = a.a, v = a.b;
        if (a.o === "+" || a.o === "-") return anota("Soma/diferença: derive termo a termo", a, bin(a.o, D(u), D(v)));
        if (a.o === "*") {
          if (!temVar(u, x)) return anota("Constante multiplicando: (k·f)′ = k·f′", a, bin("*", u, D(v)));
          if (!temVar(v, x)) return anota("Constante multiplicando: (f·k)′ = f′·k", a, bin("*", D(u), v));
          return anota("Regra do produto: (f·g)′ = f′·g + f·g′", a, bin("+", bin("*", D(u), v), bin("*", u, D(v))));
        }
        if (a.o === "/") {
          if (!temVar(v, x)) return anota("Divisão por constante: (f/k)′ = f′/k", a, bin("/", D(u), v));
          if (!temVar(u, x)) return anota("Constante sobre função: (k/g)′ = −k·g′/g²", a, neg(bin("/", bin("*", u, D(v)), bin("^", v, num(2)))));
          return anota("Regra do quociente: (f/g)′ = (f′·g − f·g′)/g²", a, bin("/", bin("-", bin("*", D(u), v), bin("*", u, D(v))), bin("^", v, num(2))));
        }
        if (a.o === "^") {
          if (!temVar(v, x)) {
            const regra = u.t === "var" ? "Regra da potência: (xⁿ)′ = n·xⁿ⁻¹" : "Potência + cadeia: (uⁿ)′ = n·uⁿ⁻¹·u′";
            return anota(regra, a, bin("*", bin("*", v, bin("^", u, S(bin("-", v, num(1))))), D(u)));
          }
          if (!temVar(u, x)) return anota("Exponencial: (bᵘ)′ = bᵘ·ln b·u′", a, bin("*", bin("*", a, fn("ln", u)), D(v)));
          return anota("Função elevada a função: (fᵍ)′ = fᵍ·(g′·ln f + g·f′/f)", a, bin("*", a, bin("+", bin("*", D(v), fn("ln", u)), bin("/", bin("*", v, D(u)), u))));
        }
        break;
      }
      case "fn": {
        const u = a.a[0], du = D(u);
        const cad = u.t === "var" ? "" : " (com a regra da cadeia: × derivada de dentro)";
        const T = {
          sin: ["(sen u)′ = cos u·u′", bin("*", fn("cos", u), du)],
          cos: ["(cos u)′ = −sen u·u′", neg(bin("*", fn("sin", u), du))],
          tan: ["(tg u)′ = u′/cos²u", bin("/", du, bin("^", fn("cos", u), num(2)))],
          exp: ["(eᵘ)′ = eᵘ·u′", bin("*", fn("exp", u), du)],
          ln: ["(ln u)′ = u′/u", bin("/", du, u)],
          log: ["(log u)′ = u′/(u·ln 10)", bin("/", du, bin("*", u, fn("ln", num(10))))],
          log2: ["(log₂ u)′ = u′/(u·ln 2)", bin("/", du, bin("*", u, fn("ln", num(2))))],
          sqrt: ["(√u)′ = u′/(2√u)", bin("/", du, bin("*", num(2), fn("sqrt", u)))],
          cbrt: ["(∛u)′ = u′/(3·∛u²)", bin("/", du, bin("*", num(3), bin("^", fn("cbrt", u), num(2))))],
          asin: ["(arcsen u)′ = u′/√(1−u²)", bin("/", du, fn("sqrt", bin("-", num(1), bin("^", u, num(2)))))],
          acos: ["(arccos u)′ = −u′/√(1−u²)", neg(bin("/", du, fn("sqrt", bin("-", num(1), bin("^", u, num(2))))))],
          atan: ["(arctg u)′ = u′/(1+u²)", bin("/", du, bin("+", num(1), bin("^", u, num(2))))],
          sinh: ["(senh u)′ = cosh u·u′", bin("*", fn("cosh", u), du)],
          cosh: ["(cosh u)′ = senh u·u′", bin("*", fn("sinh", u), du)],
          tanh: ["(tgh u)′ = u′/cosh²u", bin("/", du, bin("^", fn("cosh", u), num(2)))],
          abs: ["(|u|)′ = u·u′/|u|", bin("/", bin("*", u, du), fn("abs", u))],
        }[a.n];
        if (!T) throw new Error(`Não sei derivar ${a.n}.`);
        return anota(T[0] + cad, a, T[1]);
      }
    }
    throw new Error("Expressão não suportada.");
  }
  function lerFuncao(txt, xv = "x") {
    let ast;
    try { ast = X.ler(txt); } catch (e) { return { ok: false, erro: e.message }; }
    const vs = X.variaveis(ast).filter((v) => v !== xv);
    if (vs.length) return { ok: false, erro: `Use só a variável ${xv} (encontrei: ${vs.join(", ")}). Para multiplicar, escreva 2*x ou 2x.` };
    return { ok: true, ast };
  }
  function derivada(p) {
    const xv = p.var || "x";
    const L = lerFuncao(p.f, xv);
    if (!L.ok) return L;
    const reg = [];
    let d;
    try { d = derivar(L.ast, xv, reg); } catch (e) { return erro(e.message); }
    const ds = S(d);
    const passos = [];
    passos.push(R("A função", `${eq(`f(${xv}) = ${H(L.ast)}`)}<p>Vamos aplicar as regras de derivação, de fora para dentro.</p>`));
    const vistos = new Set();
    const lista = reg.filter((r) => { const k = r.regra + H(r.de); if (vistos.has(k)) return false; vistos.add(k); return true; }).slice(0, 10);
    if (lista.length) passos.push(R("Regras aplicadas", `<div class="lista-itens">${lista.map((r) => `<div class="item"><span class="item-n">${H(r.de)}</span>${r.regra}<div class="eq">→ ${H(S(r.res))}</div></div>`).join("")}</div>`));
    else passos.push(R("Regras aplicadas", "<p>Termos constantes têm derivada zero; x tem derivada 1.</p>"));
    passos.push(R("Junte e simplifique", `${eq(`f′(${xv}) = ${H(d)}`)}${igual(d, ds) ? "" : eq(`f′(${xv}) = <b>${H(ds)}</b>`)}`));
    let valor = null, tang = null;
    if (fin(p.x0)) {
      try {
        const y0 = X.avaliar(L.ast, { [xv]: p.x0 }), m = X.avaliar(ds, { [xv]: p.x0 });
        valor = m;
        passos.push(R(`Valor em ${xv} = ${N(p.x0)}`, `${eq(`f′(${N(p.x0)}) = <b>${N(m, 6)}</b>`)}<p>É a inclinação da reta tangente ao gráfico nesse ponto (a taxa de variação instantânea).</p>`));
        if (fin(y0) && fin(m)) { tang = { m, b: y0 - m * p.x0 }; passos.push(R("Reta tangente", eq(`y − ${par(y0)} = ${N(m, 6)}·(x − ${par(p.x0)}) → y = <b>${N(m, 6)}x ${tang.b < 0 ? "−" : "+"} ${N(Math.abs(tang.b), 6)}</b>`))); }
      } catch (e) { /* ponto fora do domínio */ }
    }
    // conferência numérica
    const xt = fin(p.x0) ? p.x0 : 0.7;
    try {
      const h = 1e-5, fx = (t) => X.avaliar(L.ast, { [xv]: t });
      const num_ = (fx(xt + h) - fx(xt - h)) / (2 * h), sim = X.avaliar(ds, { [xv]: xt });
      if (fin(num_) && fin(sim)) passos.push(R("Conferência numérica", `${eq(`[f(${N(xt)} + h) − f(${N(xt)} − h)] / 2h ≈ ${N(num_, 6)} &nbsp; vs &nbsp; f′(${N(xt)}) = ${N(sim, 6)} ${Math.abs(num_ - sim) <= 1e-4 * Math.max(1, Math.abs(sim)) ? "✓" : "✗"}`)}${dica("A derivada é o limite dessa razão quando h → 0.")}`));
    } catch (e) { /* ignora */ }
    return { ok: true, passos, d: ds, valor: valor != null ? valor : NaN, tangente: tang, resposta: `f'(${xv}) = ${semTags(H(ds))}${valor != null ? `; f'(${N(p.x0)}) = ${N(valor, 6)}` : ""}`, respostaHTML: `f′(${xv}) = <b>${H(ds)}</b>${valor != null ? `<br>f′(${N(p.x0)}) = <b>${N(valor, 6)}</b>` : ""}` };
  }

  // polinômio: {grau: coef}
  function paraPoli(a, x) {
    if (!temVar(a, x)) { try { const v = X.avaliar(a, {}); return fin(v) ? { 0: v } : null; } catch (e) { return null; } }
    if (a.t === "var") return { 1: 1 };
    if (a.t === "neg") { const p = paraPoli(a.a, x); return p && mapa(p, (c) => -c); }
    if (a.t === "bin") {
      const P1 = paraPoli(a.a, x), P2 = a.o === "^" ? null : paraPoli(a.b, x);
      if (a.o === "+" || a.o === "-") { if (!P1 || !P2) return null; const r = { ...P1 }; for (const k in P2) r[k] = (r[k] || 0) + (a.o === "+" ? 1 : -1) * P2[k]; return r; }
      if (a.o === "*") { if (!P1 || !P2) return null; const r = {}; for (const i in P1) for (const j in P2) r[+i + +j] = (r[+i + +j] || 0) + P1[i] * P2[j]; return r; }
      if (a.o === "/") { if (!P1 || temVar(a.b, x)) return null; const d = X.avaliar(a.b, {}); return mapa(P1, (c) => c / d); }
      if (a.o === "^") {
        if (!P1 || temVar(a.b, x)) return null;
        const e = X.avaliar(a.b, {});
        if (!Number.isInteger(e) || e < 0 || e > 12) return null;
        let r = { 0: 1 };
        for (let k = 0; k < e; k++) { const t = {}; for (const i in r) for (const j in P1) t[+i + +j] = (t[+i + +j] || 0) + r[i] * P1[j]; r = t; }
        return r;
      }
    }
    return null;
  }
  const mapa = (p, f) => { const r = {}; for (const k in p) r[k] = f(p[k]); return r; };
  function poliHTML(p, xv = "x") {
    const ks = Object.keys(p).map(Number).filter((k) => Math.abs(p[k]) > 1e-12).sort((a, b) => b - a);
    if (!ks.length) return "0";
    return ks.map((k, i) => {
      const c = p[k], s = c < 0 ? (i ? " − " : "−") : i ? " + " : "", a = Math.abs(c);
      const cf = k === 0 ? bonitoTxt(a) : Math.abs(a - 1) < 1e-12 ? "" : bonitoTxt(a);
      return `${s}${cf}${k === 0 ? "" : k === 1 ? xv : `${xv}<sup>${k}</sup>`}`;
    }).join("");
  }
  function bonitoTxt(v) { if (Number.isInteger(v) || Math.abs(v - Math.round(v)) < 1e-12) return String(Math.round(v)); const [h, k] = aproxFrac(v, 100); if (k <= 100 && Math.abs(h / k - v) < 1e-10) return `(${h}/${k})`; return N(v); }
  // termo linear ax + b?
  function linear(a, x) { const p = paraPoli(a, x); if (!p) return null; const gr = Object.keys(p).map(Number).filter((k) => Math.abs(p[k]) > 1e-12); if (gr.some((k) => k > 1) || !(Math.abs(p[1] || 0) > 1e-12)) return null; return { a: p[1], b: p[0] || 0 }; }
  // separa em termos de soma
  function termos(a, sinal = 1, out = []) {
    if (a.t === "bin" && (a.o === "+" || a.o === "-")) { termos(a.a, sinal, out); termos(a.b, a.o === "-" ? -sinal : sinal, out); }
    else if (a.t === "neg") termos(a.a, -sinal, out);
    else out.push({ s: sinal, a });
    return out;
  }
  // c·g(x) → {c, g}
  function fatorConst(a, x) {
    if (!temVar(a, x)) return { c: X.avaliar(a, {}), g: num(1) };
    if (a.t === "bin" && a.o === "*") {
      if (!temVar(a.a, x)) { const r = fatorConst(a.b, x); return { c: X.avaliar(a.a, {}) * r.c, g: r.g }; }
      if (!temVar(a.b, x)) { const r = fatorConst(a.a, x); return { c: X.avaliar(a.b, {}) * r.c, g: r.g }; }
    }
    if (a.t === "bin" && a.o === "/" && !temVar(a.b, x)) { const r = fatorConst(a.a, x); return { c: r.c / X.avaliar(a.b, {}), g: r.g }; }
    if (a.t === "neg") { const r = fatorConst(a.a, x); return { c: -r.c, g: r.g }; }
    return { c: 1, g: a };
  }
  // primitiva de g (sem constante); devolve {F, regra} ou null
  function primitivaBase(g, x) {
    if (!temVar(g, x)) return { F: bin("*", g, vr(x)), regra: "∫k dx = k·x" };
    const P = paraPoli(g, x);
    if (P) {
      const r = {};
      for (const k in P) r[+k + 1] = P[k] / (+k + 1);
      return { F: poliAst(r, x), regra: "Regra da potência termo a termo: ∫xⁿ dx = xⁿ⁺¹/(n+1)", poli: r };
    }
    // u^n com u linear, ou x^n com n real
    if (g.t === "bin" && g.o === "^" && !temVar(g.b, x)) {
      const n = X.avaliar(g.b, {}), l = linear(g.a, x);
      if (l) {
        if (Math.abs(n + 1) < 1e-12) return { F: bin("/", fn("ln", fn("abs", g.a)), num(l.a)), regra: "∫(ax+b)⁻¹ dx = ln|ax+b|/a" };
        return { F: bin("/", bin("^", g.a, num(n + 1)), num(l.a * (n + 1))), regra: "Potência com substituição u = ax+b: ∫uⁿ dx = uⁿ⁺¹/[a(n+1)]" };
      }
    }
    if (g.t === "bin" && g.o === "/" && !temVar(g.a, x)) {
      const k = X.avaliar(g.a, {}), l = linear(g.b, x);
      if (l) return { F: bin("*", num(k / l.a), fn("ln", fn("abs", g.b))), regra: "∫k/(ax+b) dx = (k/a)·ln|ax+b|" };
      if (g.b.t === "bin" && g.b.o === "^" && !temVar(g.b.b, x)) { const n = -X.avaliar(g.b.b, {}); return primitivaBase(bin("*", g.a, bin("^", g.b.a, num(n))), x); }
    }
    if (g.t === "fn") {
      const l = linear(g.a[0], x);
      if (!l) return null;
      const u = g.a[0], A = l.a;
      const T = {
        sin: [neg(bin("/", fn("cos", u), num(A))), "∫sen(ax+b) dx = −cos(ax+b)/a"],
        cos: [bin("/", fn("sin", u), num(A)), "∫cos(ax+b) dx = sen(ax+b)/a"],
        exp: [bin("/", fn("exp", u), num(A)), "∫e^(ax+b) dx = e^(ax+b)/a"],
        sqrt: [bin("/", bin("*", num(2), bin("^", u, num(1.5))), num(3 * A)), "∫√(ax+b) dx = 2(ax+b)^(3/2)/(3a)"],
        tan: [neg(bin("/", fn("ln", fn("abs", fn("cos", u))), num(A))), "∫tg(ax+b) dx = −ln|cos(ax+b)|/a"],
      }[g.n];
      if (!T) return null;
      return { F: T[0], regra: T[1] };
    }
    // e^(ax+b) escrito como e^u
    if (g.t === "bin" && g.o === "^" && g.a.t === "var" && g.a.n === "e" && g.a.constante !== false) {
      const l = linear(g.b, x);
      if (l) return { F: bin("/", g, num(l.a)), regra: "∫e^(ax+b) dx = e^(ax+b)/a" };
    }
    if (g.t === "bin" && g.o === "^" && !temVar(g.a, x)) {
      const l = linear(g.b, x), base = X.avaliar(g.a, {});
      if (l && base > 0 && base !== 1) return { F: bin("/", g, Math.abs(l.a - 1) < 1e-15 ? fn("ln", g.a) : bin("*", num(l.a), fn("ln", g.a))), regra: "∫b^(ax+c) dx = b^(ax+c)/(a·ln b)" };
    }
    return null;
  }
  function poliAst(p, x) {
    const ks = Object.keys(p).map(Number).filter((k) => Math.abs(p[k]) > 1e-15).sort((a, b) => b - a);
    if (!ks.length) return num(0);
    return ks.map((k) => (k === 0 ? num(p[k]) : bin("*", num(p[k]), k === 1 ? vr(x) : bin("^", vr(x), num(k))))).reduce((s, t) => bin("+", s, t));
  }
  function integral(p) {
    const xv = p.var || "x";
    const L = lerFuncao(p.f, xv);
    if (!L.ok) return L;
    const passos = [];
    passos.push(R("A função", `${eq(`∫ ${H(L.ast)} d${xv}`)}<p>Integrar é achar uma função F cuja derivada é a função dada (a <b>primitiva</b>).</p>`));
    let F, poliHtml = null;
    const P = paraPoli(L.ast, xv);
    if (P) {
      const r = {};
      for (const k in P) r[+k + 1] = P[k] / (+k + 1);
      F = poliAst(r, xv);
      poliHtml = poliHTML(r, xv);
      passos.push(R("É um polinômio: regra da potência", `${eq(`f(${xv}) = ${poliHTML(P, xv)}`)}${eq("∫ xⁿ dx = " + frac("xⁿ⁺¹", "n + 1") + " &nbsp; (n ≠ −1)")}<p>Cada termo ganha 1 no expoente e é dividido pelo novo expoente:</p>${eq(`F(${xv}) = <b>${poliHtml}</b> + C`)}`));
    } else {
      const ts = termos(L.ast);
      const partes = [], linhas = [];
      for (const t of ts) {
        const { c, g } = fatorConst(t.a, xv);
        const pr = primitivaBase(g, xv);
        if (!pr) return { ok: false, erro: `Não sei integrar o termo ${semTags(H(t.a))} com regras elementares (pode exigir integração por partes ou substituição mais elaborada). Tente separar em termos mais simples.`, passos };
        const coef = t.s * c;
        partes.push(Math.abs(coef - 1) < 1e-15 ? pr.F : bin("*", num(coef), pr.F));
        linhas.push(`<div class="item"><span class="item-n">${H(t.a)}</span>${pr.regra}<div class="eq">→ ${H(S(Math.abs(coef - 1) < 1e-15 ? pr.F : bin("*", num(coef), pr.F)))}</div></div>`);
      }
      F = partes.reduce((s, t) => bin("+", s, t));
      passos.push(R("Integre termo a termo", `<p>A integral da soma é a soma das integrais, e constantes saem para fora.</p><div class="lista-itens">${linhas.join("")}</div>`));
      passos.push(R("Primitiva", eq(`F(${xv}) = <b>${H(S(F))}</b> + C`)));
    }
    F = S(F);
    // confere derivando
    try {
      const xt = 0.37 + (fin(p.a) ? p.a : 0);
      const h = 1e-5, Fx = (t) => X.avaliar(F, { [xv]: t }), fx = X.avaliar(L.ast, { [xv]: xt });
      const dF = (Fx(xt + h) - Fx(xt - h)) / (2 * h);
      if (fin(dF) && fin(fx)) passos.push(R("Confira derivando", `${eq(`F′(${N(xt)}) ≈ ${N(dF, 6)} &nbsp; e &nbsp; f(${N(xt)}) = ${N(fx, 6)} ${Math.abs(dF - fx) <= 1e-4 * Math.max(1, Math.abs(fx)) ? "✓" : "✗"}`)}`));
    } catch (e) { /* fora do domínio */ }
    let valor = NaN;
    if (fin(p.a) && fin(p.b)) {
      let Fa, Fb;
      try { Fa = X.avaliar(F, { [xv]: p.a }); Fb = X.avaliar(F, { [xv]: p.b }); } catch (e) { return erro("Não consegui avaliar a primitiva nos limites."); }
      if (!fin(Fa) || !fin(Fb)) return { ok: false, erro: "A primitiva não está definida em algum limite (a função tem uma assíntota no intervalo?).", passos };
      valor = Fb - Fa;
      passos.push(R("Teorema Fundamental do Cálculo", `${eq(`∫<sub>${N(p.a)}</sub><sup>${N(p.b)}</sup> f d${xv} = F(${N(p.b)}) − F(${N(p.a)}) = ${N(Fb, 6)} − ${par(Fa)} = <b>${N(valor, 6)}</b>`)}`));
      const simps = simpson((t) => X.avaliar(L.ast, { [xv]: t }), p.a, p.b, 400);
      if (fin(simps)) passos.push(R("Conferência numérica (Simpson)", `${eq(`≈ ${N(simps, 6)} ${Math.abs(simps - valor) <= 1e-4 * Math.max(1, Math.abs(valor)) ? "✓" : "(diferente: confira o domínio)"}`)}${dica("Integral definida = área com sinal entre o gráfico e o eixo x (partes abaixo do eixo contam negativo).")}`));
    }
    return { ok: true, passos, F, valor, resposta: fin(valor) ? `${N(valor, 6)}` : `F(${xv}) = ${semTags(poliHtml || H(F))} + C`, respostaHTML: fin(valor) ? `∫ = <b>${N(valor, 6)}</b><br><small>F(${xv}) = ${poliHtml || H(F)} + C</small>` : `F(${xv}) = <b>${poliHtml || H(F)}</b> + C` };
  }
  function simpson(f, a, b, nInt) {
    const n = nInt % 2 ? nInt + 1 : nInt, h = (b - a) / n;
    let s = f(a) + f(b);
    for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
    return (s * h) / 3;
  }

  // ---------------------------------------------------------------------------
  // 7. Estudo de função (amostragem, raízes, extremos)
  // ---------------------------------------------------------------------------
  function estudoFuncao(p) {
    const L = lerFuncao(p.f, "x");
    if (!L.ok) return L;
    let { x0 = -10, x1 = 10 } = p;
    if (!(x1 > x0)) return erro("O intervalo deve ter x mínimo menor que x máximo.");
    const f = (t) => { try { return X.avaliar(L.ast, { x: t }); } catch (e) { return NaN; } };
    const n = 600, pts = [];
    for (let i = 0; i <= n; i++) { const t = x0 + ((x1 - x0) * i) / n; pts.push([t, f(t)]); }
    // raízes
    const raizes = [];
    for (let i = 0; i < n; i++) {
      const [ta, fa] = pts[i], [tb, fb] = pts[i + 1];
      if (!fin(fa) || !fin(fb)) continue;
      if (fa === 0) { raizes.push(ta); continue; }
      if (fa * fb < 0 && Math.abs(fa - fb) < 1e6) {
        let a = ta, b = tb, va = fa;
        for (let k = 0; k < 60; k++) { const m = (a + b) / 2, vm = f(m); if (va * vm <= 0) b = m; else { a = m; va = vm; } }
        raizes.push((a + b) / 2);
      }
    }
    // extremos locais por mudança de inclinação
    const extremos = [];
    for (let i = 1; i < n; i++) {
      const [, ya] = pts[i - 1], [t, y] = pts[i], [, yb] = pts[i + 1];
      if (![ya, y, yb].every(fin)) continue;
      if ((y > ya && y >= yb) || (y < ya && y <= yb)) {
        let a = pts[i - 1][0], b = pts[i + 1][0];
        const max = y > ya;
        for (let k = 0; k < 60; k++) { const m1 = a + (b - a) / 3, m2 = b - (b - a) / 3; if (max ? f(m1) < f(m2) : f(m1) > f(m2)) a = m1; else b = m2; }
        const xm = (a + b) / 2;
        extremos.push({ x: xm, y: f(xm), tipo: max ? "máximo" : "mínimo" });
      }
    }
    const raizesU = raizes.filter((r, i) => i === 0 || Math.abs(r - raizes[i - 1]) > (x1 - x0) / n);
    const passos = [];
    passos.push(R("A função", eq(`f(x) = ${H(L.ast)}`)));
    const P = paraPoli(L.ast, "x");
    const grau = P ? Math.max(...Object.keys(P).map(Number).filter((k) => Math.abs(P[k]) > 1e-12), 0) : null;
    if (P && grau <= 2) passos.push(R(grau === 2 ? "É uma função do 2º grau" : grau === 1 ? "É uma função do 1º grau" : "É constante", grau === 2 ? `<p>Raízes e vértice exatos estão na ferramenta <b>Equações</b>. Aqui: a = ${N(P[2])}, b = ${N(P[1] || 0)}, c = ${N(P[0] || 0)}; vértice em x<sub>v</sub> = −b/2a = <b>${N(-(P[1] || 0) / (2 * P[2]))}</b>.</p>` : grau === 1 ? `<p>Reta com inclinação a = <b>${N(P[1])}</b> e intercepto b = <b>${N(P[0] || 0)}</b>.</p>` : "<p>Gráfico é uma reta horizontal.</p>"));
    const y0 = f(0);
    passos.push(R("Intercepto com o eixo y", fin(y0) && x0 <= 0 && x1 >= 0 ? eq(`f(0) = <b>${N(y0, 6)}</b>`) : "<p>x = 0 está fora do intervalo ou do domínio.</p>"));
    passos.push(R(`Raízes no intervalo [${N(x0)}; ${N(x1)}]`, raizesU.length ? `<p>Procuramos onde o sinal de f muda e refinamos por bisseção:</p>${eq(raizesU.map((r) => `x ≈ <b>${N(r, 6)}</b>`).join(" &nbsp; "))}` : "<p>Nenhuma raiz encontrada nesse intervalo (o gráfico não cruza o eixo x).</p>"));
    passos.push(R("Máximos e mínimos locais", extremos.length ? tabela(["Tipo", "x", "f(x)"], extremos.map((e) => [e.tipo, N(e.x, 5), N(e.y, 5)])) + dica("Nesses pontos a derivada vale zero (a tangente é horizontal).") : "<p>Nenhum máximo ou mínimo local no intervalo.</p>"));
    const tabX = [-2, -1, 0, 1, 2, 3].filter((t) => t >= x0 && t <= x1);
    passos.push(R("Tabela de valores", tabela(["x", "f(x)"], tabX.map((t) => [N(t), fin(f(t)) ? N(f(t), 5) : "não definido"]))));
    return { ok: true, passos, pts, raizes: raizesU, extremos, ast: L.ast, valor: raizesU[0], resposta: raizesU.length ? `raízes ≈ ${raizesU.map((r) => N(r, 5)).join("; ")}` : "sem raízes no intervalo", respostaHTML: raizesU.length ? `Raízes ≈ <b>${raizesU.map((r) => N(r, 5)).join(" · ")}</b>` : "Sem raízes no intervalo" };
  }

  // ---------------------------------------------------------------------------
  // Exercícios
  // ---------------------------------------------------------------------------
  const sorteia = (a) => a[Math.floor(Math.random() * a.length)];
  const inteiro = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const naoZero = (a, b) => { let v = 0; while (v === 0) v = inteiro(a, b); return v; };
  const ex = (enunciado, r, extra) => ({ enunciado, resposta: r.valor, passos: r.passos, texto: r.resposta, unidade: "", rel: 0.005, tol: 0.01, ...extra });
  const TIPOS = ["eq2", "sist2", "regra3", "perc", "log", "trig", "deriv", "integral", "vetor", "grafico"];
  // vetores: módulo, soma, produto escalar e ângulo
  function exVetor() {
    const v2 = () => [inteiro(-6, 6) || 1, inteiro(-6, 6) || 2];
    const modo = sorteia(["modulo", "soma", "escalar", "angulo"]);
    const u = modo === "modulo" ? sorteia([[3, 4], [6, 8], [5, 12], [8, 6], [-9, 12], [1, 1], [2, -3]]) : v2(), w = v2();
    const T = (a) => `(${a.map((x) => String(x).replace("-", "−")).join("; ")})`;
    const desenho = (series) => ({ series });
    if (modo === "modulo") { const r = vetores({ op: "modulo", u: T(u) }); return { ...ex(`Qual o <b>módulo</b> do vetor <b>u = ${T(u)}</b>?`, r, { resposta: Math.hypot(...u), texto: N(Math.hypot(...u), 5) }), grafico: desenho([{ tipo: "vetor", para: u, rotulo: "u" }]), graficoOp: { igual: true, altura: 200 } }; }
    if (modo === "soma") {
      const r = vetores({ op: "soma", u: T(u), v: T(w) }), sm = [u[0] + w[0], u[1] + w[1]];
      return { ...ex(`Sendo <b>u = ${T(u)}</b> e <b>v = ${T(w)}</b>, qual o <b>módulo de u + v</b>?`, r, { resposta: Math.hypot(...sm), texto: `u + v = ${T(sm)}, |u + v| = ${N(Math.hypot(...sm), 5)}` }) };
    }
    const r = vetores({ op: "escalar", u: T(u), v: T(w) });
    const dot = u[0] * w[0] + u[1] * w[1];
    if (modo === "escalar") return ex(`Calcule o <b>produto escalar</b> u·v para <b>u = ${T(u)}</b> e <b>v = ${T(w)}</b>.`, r, { resposta: dot, tol: 0, rel: 0, texto: N(dot) });
    const ang = (Math.acos(Math.max(-1, Math.min(1, dot / (Math.hypot(...u) * Math.hypot(...w))))) * 180) / Math.PI;
    return ex(`Qual o <b>ângulo entre u = ${T(u)} e v = ${T(w)}</b>, em graus?`, r, { resposta: ang, tol: 0.2, rel: 0, unidade: "°", texto: `${N(ang, 4)}°` });
  }

  // gráficos: reconhecer a função pelo desenho, ou ler raiz e vértice
  function exGrafico() {
    const modo = sorteia(["qual", "qual", "raiz", "vertice"]);
    const sinal = (k) => (k < 0 ? " − " : " + ");
    if (modo === "qual") {
      const FAM = [
        () => { const a = sorteia([-3, -2, -1, 1, 2, 3]), b = inteiro(-4, 4); return { f: (x) => a * x + b, t: `f(x) = ${a === 1 ? "" : a === -1 ? "−" : a}x${b ? sinal(b) + Math.abs(b) : ""}`, fam: "reta" }; },
        () => { const r1 = inteiro(-4, 3), r2 = r1 + inteiro(1, 4), a = sorteia([1, -1]); return { f: (x) => a * (x - r1) * (x - r2), t: `f(x) = ${a < 0 ? "−" : ""}(x${sinal(-r1)}${Math.abs(r1)})(x${sinal(-r2)}${Math.abs(r2)})`.replace(/x \+ 0|x − 0/g, "x"), fam: "parábola" }; },
        () => { const b = sorteia([2, 3, 0.5]); return { f: (x) => Math.pow(b, x), t: `f(x) = ${String(b).replace(".", ",")}<sup>x</sup>`, fam: "exponencial" }; },
        () => { const k = sorteia([1, 2]), A = sorteia([1, 2, 3]); return { f: (x) => A * Math.sin(k * x), t: `f(x) = ${A === 1 ? "" : A}sen(${k === 1 ? "" : k}x)`, fam: "seno" }; },
        () => ({ f: (x) => Math.log(x), t: "f(x) = ln x", fam: "log" }),
        () => { const k = sorteia([1, 2, 4]); return { f: (x) => k / x, t: `f(x) = ${k}/x`, fam: "hipérbole" }; },
        () => ({ f: (x) => Math.sqrt(x), t: "f(x) = √x", fam: "raiz" }),
        () => { const c = inteiro(-2, 2); return { f: (x) => x * x * x - 3 * x + c, t: `f(x) = x³ − 3x${c ? sinal(c) + Math.abs(c) : ""}`, fam: "cúbica" }; },
      ];
      const idx = [...FAM.keys()].sort(() => Math.random() - 0.5).slice(0, 4);
      const ops = idx.map((i) => FAM[i]());
      const certo = inteiro(0, 3), alvo = ops[certo];
      const dica = { reta: "Uma reta tem inclinação constante: o 1º grau.", parábola: "Uma parábola (2º grau) tem um vértice e é simétrica; se as raízes aparecem no eixo x, compare com os fatores (x − r).", exponencial: "A exponencial cresce cada vez mais rápido e nunca toca o eixo x (f(0) = 1).", seno: "Uma onda que se repete é seno ou cosseno; a altura máxima é a amplitude.", log: "ln x só existe para x > 0, passa por (1; 0) e cresce cada vez mais devagar.", hipérbole: "k/x não existe em x = 0 e tem dois ramos, um de cada lado.", raiz: "√x começa em (0; 0), só existe para x ≥ 0 e cresce cada vez mais devagar.", cúbica: "x³ − 3x tem um máximo em x = −1 e um mínimo em x = 1." }[alvo.fam];
      return { tipo: "escolha", enunciado: "Qual destas funções tem o gráfico abaixo?", grafico: { x: [-5, 5], series: [{ tipo: "funcao", f: alvo.f }] }, graficoOp: { altura: 220 }, opcoes: ops.map((o) => o.t), resposta: certo, passos: [R("Como reconhecer", `<p>${dica}</p><p>Resposta: <b>${alvo.t}</b>. Teste um ponto: em x = 1 ela vale ${N(alvo.f(1), 4)}.</p>`)], texto: alvo.t.replace(/<[^>]+>/g, "") };
    }
    const r1 = inteiro(-4, 2), r2 = r1 + inteiro(2, 6), a = sorteia([1, -1, 1]);
    const f = (x) => a * (x - r1) * (x - r2);
    const xv = (r1 + r2) / 2, yv = f(xv);
    const b = -a * (r1 + r2), c = a * r1 * r2;
    const ftxt = `f(x) = ${a < 0 ? "−" : ""}x²${b ? sinal(b) + (Math.abs(b) === 1 ? "" : Math.abs(b)) + "x" : ""}${c ? sinal(c) + Math.abs(c) : ""}`;
    const grafico = { x: [r1 - 2, r2 + 2], series: [{ tipo: "funcao", f, rotulo: ftxt }] };
    const r = eq2({ a, b, c });
    if (modo === "raiz") return ex(`O gráfico mostra ${ftxt}. Qual é a <b>maior raiz</b> (onde o gráfico corta o eixo x mais à direita)? Confira com Bhaskara.`, r, { grafico, graficoOp: { altura: 220 }, resposta: r2, tol: 0, rel: 0, texto: `x = ${r2}` });
    return ex(`O gráfico mostra ${ftxt}. Qual é o valor de y no <b>vértice</b> (${a > 0 ? "ponto mais baixo" : "ponto mais alto"})?`, r, { grafico, graficoOp: { altura: 220 }, resposta: yv, tol: 0.01, rel: 0, texto: `y<sub>v</sub> = ${N(yv)} (em x = ${N(xv)})` });
  }

  function gerarExercicio(tipo) {
    if (tipo === "vetor") return exVetor();
    if (tipo === "grafico") return exGrafico();
    if (tipo === "eq2") {
      const r1 = inteiro(-6, 6), r2 = inteiro(-6, 6), a = sorteia([1, 1, 2, -1]);
      const b = -a * (r1 + r2), c = a * r1 * r2;
      const r = eq2({ a, b, c });
      const termo = (k, s, pr) => (k === 0 ? "" : `${k < 0 ? (pr ? "−" : " − ") : pr ? "" : " + "}${Math.abs(k) === 1 && s ? "" : Math.abs(k)}${s}`);
      return ex(`Resolva <b>${termo(a, "x²", true)}${termo(b, "x")}${termo(c, "")} = 0</b>. Responda as raízes separadas por vírgula, da menor para a maior (raiz dupla: um número só).`, r, { tipo: "lista", resposta: r1 === r2 ? [r1] : [Math.min(r1, r2), Math.max(r1, r2)], texto: r.resposta });
    }
    if (tipo === "sist2") {
      const x = inteiro(-5, 5), y = inteiro(-5, 5);
      let a, b, c, d;
      do { a = naoZero(-4, 4); b = naoZero(-4, 4); c = naoZero(-4, 4); d = naoZero(-4, 4); } while (a * d - b * c === 0);
      const r = sistema([[a, b, a * x + b * y], [c, d, c * x + d * y]]);
      const l = (p, q, k) => `${p === 1 ? "" : p === -1 ? "−" : String(p).replace("-", "−")}x ${q < 0 ? "−" : "+"} ${Math.abs(q) === 1 ? "" : Math.abs(q)}y = ${String(k).replace("-", "−")}`;
      return ex(`Resolva o sistema:<div class="eq">${l(a, b, a * x + b * y)}<br>${l(c, d, c * x + d * y)}</div>Responda x e y separados por vírgula.`, r, { tipo: "lista", resposta: [x, y] });
    }
    if (tipo === "regra3") {
      const inv = Math.random() < 0.4;
      const a = sorteia([2, 3, 4, 5, 6, 8, 10, 12]), k = sorteia([2, 3, 4, 5, 6]), c = inv ? sorteia([a * 2, a / 2, a * 3]) : a * sorteia([2, 3, 1.5, 0.5]);
      const b = inv ? k * 6 : k * a;
      const r = regra3({ a, b, c, inversa: inv });
      return ex(inv ? `<b>${a} operários</b> fazem uma obra em <b>${b} dias</b>. Quantos dias levariam <b>${N(c)} operários</b>, no mesmo ritmo?` : `<b>${a} kg</b> de um produto custam <b>R$ ${b}</b>. Quanto custam <b>${N(c)} kg</b>?`, r, { unidade: inv ? "dias" : "R$" });
    }
    if (tipo === "perc") {
      const m = sorteia(["de", "variacao", "sucessivos"]);
      if (m === "de") { const pc = sorteia([5, 12, 15, 20, 25, 35, 40, 75]), v = sorteia([80, 120, 250, 360, 400, 1200]); const r = porcentagem({ modo: "de", pc, v }); return ex(`Quanto é <b>${pc}%</b> de <b>${v}</b>?`, r); }
      if (m === "variacao") { const v0 = sorteia([50, 80, 120, 200, 250]), v1 = v0 + sorteia([-30, -20, -10, 10, 15, 40, 60]); const r = porcentagem({ modo: "variacao", v0, v1 }); return ex(`Um preço passou de <b>R$ ${v0}</b> para <b>R$ ${v1}</b>. Qual a variação percentual?`, r, { unidade: "%" }); }
      const t1 = sorteia([10, 20, 25]), t2 = -sorteia([10, 20, 25]), v = sorteia([100, 200, 500]);
      const r = porcentagem({ modo: "sucessivos", v, taxas: [t1, t2] });
      return ex(`Um produto de <b>R$ ${v}</b> sofre aumento de <b>${t1}%</b> e depois desconto de <b>${-t2}%</b>. Qual o preço final?`, r, { unidade: "R$" });
    }
    if (tipo === "log") {
      const b = sorteia([2, 3, 5, 10]), e = inteiro(-2, 5);
      const x = Math.pow(b, e);
      const r = logaritmo({ base: b, x });
      return ex(`Calcule <b>log<sub>${b}</sub>(${N(x)})</b>.`, r, { tol: 1e-6 });
    }
    if (tipo === "trig") {
      const m = sorteia(["hip", "cat"]);
      if (m === "hip") { const alfa = sorteia([30, 37, 45, 53, 60]), a = sorteia([10, 12, 20, 25, 50]); const r = trianguloRetangulo({ a, alfa }); return ex(`Num triângulo retângulo, a hipotenusa mede <b>${a}</b> e um ângulo agudo mede <b>${alfa}°</b>. Quanto mede o cateto <b>oposto</b> a esse ângulo?`, { ...r, valor: r.b }, { rel: 0.01, texto: `b = ${N(r.b)}` }); }
      const [b, c] = sorteia([[3, 4], [5, 12], [8, 15], [6, 8], [7, 24], [9, 12]]);
      const r = trianguloRetangulo({ b, c });
      return ex(`Os catetos de um triângulo retângulo medem <b>${b}</b> e <b>${c}</b>. Quanto mede a hipotenusa?`, r, { rel: 0.005 });
    }
    if (tipo === "deriv") {
      const a = naoZero(-4, 5), n = inteiro(2, 4), b = inteiro(-6, 6), c = inteiro(-9, 9), x0 = inteiro(-3, 3);
      const f = `${a}x^${n} ${b < 0 ? "-" : "+"} ${Math.abs(b)}x ${c < 0 ? "-" : "+"} ${Math.abs(c)}`;
      const r = derivada({ f, x0 });
      return ex(`Sendo <b>f(x) = ${H(X.ler(f))}</b>, calcule <b>f′(${x0})</b>.`, r, { tol: 1e-6 });
    }
    // integral definida de polinômio
    const a = inteiro(1, 4), b = inteiro(-3, 5), x1 = inteiro(1, 3);
    const f = `${a}x^2 ${b < 0 ? "-" : "+"} ${Math.abs(b)}x`;
    const r = integral({ f, a: 0, b: x1 });
    return ex(`Calcule <b>∫<sub>0</sub><sup>${x1}</sup> (${H(X.ler(f))}) dx</b>.`, r, { rel: 0.002 });
  }

  const API = {
    F, aproxFrac, bonito, eq1, eq2, sistema, regra3, regra3Composta, porcentagem,
    logaritmo, expEq, potencia, notacaoCientifica, trigAngulo, trianguloRetangulo, trianguloQualquer,
    lerVetor, vetores, derivar, derivada, integral, estudoFuncao, paraPoli, simp: S,
    gerarExercicio, conferir: Q.conferir, lerNumero: Q.lerNumero, TIPOS,
  };
  if (node) module.exports = API;
  else raiz.MCalc = API;
})(typeof window !== "undefined" ? window : globalThis);
