/*
 * Expressões matemáticas: leitor e avaliador seguros (sem eval).
 * Aceita: + - * / ^ ( ), multiplicação implícita (2x, 3(x+1), x y), decimais com vírgula ou ponto,
 * funções sqrt cbrt abs sin cos tan asin acos atan sinh cosh tanh ln log log2 exp,
 * constantes pi e. Argumentos de funções separados por ";" (a vírgula é decimal).
 * AST: {t:"num",v} {t:"var",n} {t:"neg",a} {t:"bin",o,a,b} {t:"fn",n,a:[...]}
 */
(function (raiz) {
  "use strict";
  const FN = {
    sqrt: Math.sqrt, cbrt: Math.cbrt, abs: Math.abs, sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan,
    sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, ln: Math.log, log: Math.log10, log2: Math.log2, exp: Math.exp,
  };
  const ALIAS = { sen: "sin", tg: "tan", raiz: "sqrt", arcsen: "asin", arccos: "acos", arctg: "atan", arctan: "atan", lg: "log" };
  const CONST = { pi: Math.PI, "π": Math.PI, e: Math.E };

  function ler(txt, opcoes = {}) {
    const vars = opcoes.variaveis || null; // se dado, só estes nomes valem como variáveis
    const s = String(txt).replace(/\s+/g, " ").replace(/[−–]/g, "-").replace(/[×·]/g, "*").replace(/÷/g, "/").replace(/\*\*/g, "^").trim();
    if (!s) throw new Error("Digite uma expressão.");
    const tk = [];
    const re = /\s*(\d+(?:[.,]\d+)?(?:[eE][+-]?\d+)?|\.\d+|[A-Za-zπ_][A-Za-z0-9_π]*|[-+*/^();])/y;
    let i = 0;
    while (i < s.length) {
      re.lastIndex = i;
      const m = re.exec(s);
      if (!m) throw new Error(`Não entendi o símbolo “${s.slice(i).trim()[0]}”.`);
      tk.push(m[1]); i = re.lastIndex;
      while (s[i] === " ") i++;
    }
    let p = 0;
    const ehNum = (t) => /^[\d.]/.test(t);
    const ehId = (t) => /^[A-Za-zπ_]/.test(t);
    const prox = () => tk[p];
    function exprSoma() {
      let a = exprProd();
      while (prox() === "+" || prox() === "-") { const o = tk[p++]; a = { t: "bin", o, a, b: exprProd() }; }
      return a;
    }
    function exprProd() {
      let a = exprUn();
      for (;;) {
        const t = prox();
        if (t === "*" || t === "/") { p++; a = { t: "bin", o: t, a, b: exprUn() }; }
        else if (t !== undefined && (ehNum(t) || ehId(t) || t === "(")) a = { t: "bin", o: "*", a, b: exprUn() }; // implícita
        else return a;
      }
    }
    function exprUn() {
      if (prox() === "-") { p++; return { t: "neg", a: exprUn() }; }
      if (prox() === "+") { p++; return exprUn(); }
      return exprPot();
    }
    function exprPot() {
      const a = atomo();
      if (prox() === "^") { p++; return { t: "bin", o: "^", a, b: exprUn() }; }
      return a;
    }
    function atomo() {
      const t = tk[p++];
      if (t === undefined) throw new Error("A expressão terminou antes da hora.");
      if (t === "(") { const e = exprSoma(); if (tk[p++] !== ")") throw new Error("Faltou fechar um parêntese."); return e; }
      if (ehNum(t)) return { t: "num", v: parseFloat(t.replace(",", ".")) };
      if (ehId(t)) {
        const nome = ALIAS[t.toLowerCase()] || t;
        if (FN[nome] && tk[p] === "(") {
          p++;
          const a = [exprSoma()];
          while (tk[p] === ";") { p++; a.push(exprSoma()); }
          if (tk[p++] !== ")") throw new Error(`Faltou fechar o parêntese de ${t}.`);
          return { t: "fn", n: nome, a };
        }
        if (FN[nome]) throw new Error(`Use parênteses: ${t}(...).`);
        if (vars ? vars.includes(t) : false) return { t: "var", n: t };
        if (CONST[t] !== undefined && !(vars && vars.includes(t))) return { t: "var", n: t, constante: true };
        if (vars) throw new Error(`“${t}” não é uma das variáveis (${vars.join(", ")}).`);
        return { t: "var", n: t };
      }
      throw new Error(`Símbolo inesperado “${t}”.`);
    }
    const ast = exprSoma();
    if (p < tk.length) throw new Error(`Sobrou “${tk.slice(p).join(" ")}” no fim da expressão.`);
    return ast;
  }

  // graus: true faz sin/cos/tan receberem graus (e asin/acos/atan devolverem graus)
  function avaliar(a, v = {}, opc = {}) {
    const g = opc.graus ? Math.PI / 180 : 1;
    const f = (n) => {
      switch (n.t) {
        case "num": return n.v;
        case "var": {
          if (n.n in v) return v[n.n];
          if (CONST[n.n] !== undefined) return CONST[n.n];
          throw new Error(`Falta o valor de ${n.n}.`);
        }
        case "neg": return -f(n.a);
        case "bin": {
          const x = f(n.a), y = f(n.b);
          return n.o === "+" ? x + y : n.o === "-" ? x - y : n.o === "*" ? x * y : n.o === "/" ? x / y : Math.pow(x, y);
        }
        case "fn": {
          const x = f(n.a[0]);
          if (["sin", "cos", "tan"].includes(n.n)) return FN[n.n](x * g);
          if (["asin", "acos", "atan"].includes(n.n)) return FN[n.n](x) / g;
          return FN[n.n](x);
        }
      }
      return NaN;
    };
    return f(a);
  }
  function variaveis(a, acc = []) {
    if (a.t === "var") { if (!a.constante && !acc.includes(a.n)) acc.push(a.n); }
    else if (a.t === "neg") variaveis(a.a, acc);
    else if (a.t === "bin") { variaveis(a.a, acc); variaveis(a.b, acc); }
    else if (a.t === "fn") a.a.forEach((x) => variaveis(x, acc));
    return acc;
  }
  // texto legível (HTML): x^2 vira x<sup>2</sup>
  function paraHTML(a, pai = 0) {
    const P = { "+": 1, "-": 1, "*": 2, "/": 2, "^": 4 };
    switch (a.t) {
      case "num": return String(a.v).replace(".", ",");
      case "var": return a.n === "pi" ? "π" : a.n.replace(/^([A-Za-z]+)(\d+)$/, "$1<sub>$2</sub>").replace(/^([A-Za-z]+)_(\w+)$/, "$1<sub>$2</sub>");
      case "neg": { const s = "−" + paraHTML(a.a, 3); return pai > 2 ? `(${s})` : s; }
      case "fn": return `${a.n === "sqrt" ? "√" : a.n}(${a.a.map((x) => paraHTML(x)).join("; ")})`;
      case "bin": {
        const o = a.o, p = P[o];
        if (o === "^") return `${paraHTML(a.a, 5)}<sup>${paraHTML(a.b, 0)}</sup>`;
        const s = `${paraHTML(a.a, p)}${o === "*" ? "·" : o === "-" ? " − " : o === "+" ? " + " : "/"}${paraHTML(a.b, o === "-" || o === "/" ? p + 1 : p)}`;
        return p < pai ? `(${s})` : s;
      }
    }
    return "";
  }

  const API = { ler, avaliar, variaveis, paraHTML, FN, CONST };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else raiz.Expr = API;
})(typeof window !== "undefined" ? window : globalThis);
