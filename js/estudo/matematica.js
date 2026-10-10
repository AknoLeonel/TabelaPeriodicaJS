/*
 * Estudo: Matemática
 * Apoio para química, física e cálculo: equações, proporção, logaritmos,
 * trigonometria, vetores, derivadas/integrais e gráficos de funções.
 */
(function () {
  "use strict";
  const LAB = window.LAB;
  const M = window.MCalc;
  const X = window.Expr;
  if (!LAB || !M || !X) return;
  const { el, ui } = LAB;
  const E = LAB.estudo;
  const { campo, grade, mostrar, resultadoBox, dicaInicial, debounce } = E;
  const COR = "#f0a23c";

  // prática: alguns tipos agrupam vários geradores
  const GRUPOS = { proporcao: ["regra3", "perc"], calculo: ["deriv", "integral"], equacoes: ["eq2", "eq2", "sist2"] };
  const motor = {
    gerarExercicio: (t) => M.gerarExercicio(GRUPOS[t] ? GRUPOS[t][Math.floor(Math.random() * GRUPOS[t].length)] : t),
    conferir: M.conferir,
    lerNumero: M.lerNumero,
  };

  E.modulo({
    id: "matematica",
    nome: "Matemática",
    sub: "A matemática que aparece em química, física e cálculo, passo a passo.",
    cor: COR,
    selo: "verificavel",
    icone: '<svg viewBox="0 0 24 24"><path d="M5 5h6M8 2v6"/><path d="M14 5h6"/><path d="M5 16l5 5M10 16l-5 5"/><path d="M14 17h6M14 20h6"/></svg>',
    motor,
    chave: "estudo.m.pontos",
    rodape: "As contas usam frações exatas quando possível (sistemas lineares) e as derivadas e integrais são simbólicas, conferidas numericamente em cada resposta.",
    nota: {
      real: [
        "Sistemas lineares resolvidos com frações exatas (sem erro de arredondamento).",
        "Derivadas simbólicas com as regras do cálculo (produto, quociente, cadeia), conferidas por diferenças finitas.",
        "Integrais definidas pelo Teorema Fundamental, conferidas pela regra de Simpson.",
      ],
      simplificado: [
        "Integrais só com regras elementares (potência, exponencial, seno, cosseno e substituição linear); integração por partes e frações parciais ainda não.",
        "Raízes e extremos de funções são procurados numericamente no intervalo escolhido.",
      ],
    },
  });
  const FERR = E.ferramentas.matematica;

  const n = (c) => { const t = c.texto(); return t === "" ? null : M.lerNumero(t); };
  const vazio = (res, txt) => { res.innerHTML = ""; res._r = null; res.appendChild(dicaInicial(txt)); };
  const rotulo = (txt, filho) => { const w = el("label", "campo"); w.append(el("span", "c-rot", txt), filho); return w; };
  const seletor = (opcoes, valor) => { const s = el("select", "sel"); opcoes.forEach(([v, t]) => { const o = el("option", "", t); o.value = v; s.appendChild(o); }); if (valor != null) s.value = valor; return s; };
  const ligar = (cs, fn) => { const d = debounce(fn, 220); cs.forEach((c) => { const i = c.input || c; i.addEventListener(i.tagName === "SELECT" ? "change" : "input", d); if (c.sel) c.sel.addEventListener("change", d); }); };
  const exemplos = (lista, fn) => ui.chips({ itens: lista.map((x, i) => ({ id: String(i), rotulo: x.r })), onClick: (id) => fn(lista[+id]) });
  function subAbas(raiz, itens, montar) {
    const area = el("div", "est-sub");
    const seg = ui.segmentado({ itens, valor: itens[0].id, onChange: (id) => abrir(id) });
    raiz.append(seg.el, area);
    let api = null;
    function abrir(id) { area.innerHTML = ""; api = montar(id, area) || null; }
    abrir(itens[0].id);
    return { recalcular: () => api && api.recalcular && api.recalcular() };
  }
  const css = (v, padrao) => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || padrao;

  // ---------- gráfico de função (canvas, sem animação contínua) ----------
  function grafico(cv, alt = 240) {
    let estado = null;
    function desenhar() {
      if (!estado) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = cv.clientWidth || 340, h = alt;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      const g = cv.getContext("2d");
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);
      const { pts, x0, x1, marcas = [], reta } = estado;
      const ys = pts.map((p) => p[1]).filter((y) => isFinite(y)).sort((a, b) => a - b);
      if (!ys.length) return;
      // ignora picos de assíntotas (percentis)
      let y0 = ys[Math.floor(ys.length * 0.02)], y1 = ys[Math.ceil(ys.length * 0.98) - 1];
      y0 = Math.min(y0, 0); y1 = Math.max(y1, 0);
      if (y1 - y0 < 1e-9) { y0 -= 1; y1 += 1; }
      const py = (y1 - y0) * 0.08; y0 -= py; y1 += py;
      const X_ = (x) => ((x - x0) / (x1 - x0)) * w, Y_ = (y) => h - ((y - y0) / (y1 - y0)) * h;
      g.strokeStyle = css("--line-soft", "#232b36"); g.lineWidth = 1;
      const passo = (v) => { const p = Math.pow(10, Math.floor(Math.log10(v / 5))); return [1, 2, 5, 10].map((k) => k * p).find((k) => v / k <= 8); };
      const sx = passo(x1 - x0), sy = passo(y1 - y0);
      g.fillStyle = css("--faint", "#7a8799"); g.font = "10.5px 'IBM Plex Mono', monospace";
      for (let x = Math.ceil(x0 / sx) * sx; x <= x1; x += sx) { g.beginPath(); g.moveTo(X_(x), 0); g.lineTo(X_(x), h); g.stroke(); if (Math.abs(x) > 1e-9) g.fillText(String(+x.toPrecision(6)).replace(".", ","), X_(x) + 2, Math.min(Math.max(Y_(0) + 12, 12), h - 3)); }
      for (let y = Math.ceil(y0 / sy) * sy; y <= y1; y += sy) { g.beginPath(); g.moveTo(0, Y_(y)); g.lineTo(w, Y_(y)); g.stroke(); if (Math.abs(y) > 1e-9) g.fillText(String(+y.toPrecision(6)).replace(".", ","), Math.min(Math.max(X_(0) + 3, 3), w - 40), Y_(y) - 2); }
      g.strokeStyle = css("--muted", "#9ba7b6"); g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(0, Y_(0)); g.lineTo(w, Y_(0)); g.moveTo(X_(0), 0); g.lineTo(X_(0), h); g.stroke();
      if (reta) { g.strokeStyle = css("--muted", "#9ba7b6"); g.setLineDash([5, 4]); g.beginPath(); g.moveTo(0, Y_(reta.m * x0 + reta.b)); g.lineTo(w, Y_(reta.m * x1 + reta.b)); g.stroke(); g.setLineDash([]); }
      g.strokeStyle = COR; g.lineWidth = 2.2; g.lineJoin = "round";
      g.beginPath();
      let dentro = false, ant = null;
      for (const [x, y] of pts) {
        if (!isFinite(y) || (ant != null && Math.abs(y - ant) > (y1 - y0) * 3)) { dentro = false; ant = isFinite(y) ? y : null; continue; }
        if (!dentro) { g.moveTo(X_(x), Y_(y)); dentro = true; } else g.lineTo(X_(x), Y_(y));
        ant = y;
      }
      g.stroke();
      for (const mk of marcas) {
        g.fillStyle = mk.cor || css("--text", "#e8edf3"); g.strokeStyle = css("--bg", "#0f1318"); g.lineWidth = 2;
        g.beginPath(); g.arc(X_(mk.x), Y_(mk.y), 4.5, 0, 6.3); g.fill(); g.stroke();
      }
    }
    new ResizeObserver(debounce(desenhar, 100)).observe(cv);
    return { mostrar(e) { estado = e; desenhar(); } };
  }
  function amostrar(ast, x0, x1, n = 500) {
    const pts = [];
    for (let i = 0; i <= n; i++) { const x = x0 + ((x1 - x0) * i) / n; let y; try { y = X.avaliar(ast, { x }); } catch (e) { y = NaN; } pts.push([x, y]); }
    return pts;
  }

  // =====================================================================
  // 1. Equações
  // =====================================================================
  FERR.push({
    id: "equacoes", nome: "Equações", prat: "equacoes",
    resumo: "Equações do 1º e do 2º grau (Bhaskara completo, com gráfico) e sistemas lineares 2×2 e 3×3 por escalonamento.",
    teoria: `<p><b>Resolver</b> uma equação é achar os valores de x que a tornam verdadeira. Tudo o que você faz de um lado, faz do outro.</p>
      <p><b>2º grau</b> (ax² + bx + c = 0):</p>
      <div class="eq">Δ = b² − 4ac &nbsp;&nbsp; x = <span class="frac"><span>−b ± √Δ</span><span>2a</span></span></div>
      <ul><li>Δ &gt; 0: duas raízes; Δ = 0: uma (dupla); Δ &lt; 0: nenhuma real.</li>
      <li>Soma das raízes = −b/a; produto = c/a (bom para conferir ou resolver de cabeça).</li></ul>
      <p><b>Sistemas</b>: o escalonamento (Gauss) usa três operações que não mudam a solução: trocar linhas, multiplicar uma linha por número ≠ 0 e somar a uma linha um múltiplo de outra.</p>`,
    montar(raiz) {
      return subAbas(raiz, [{ id: "2", rotulo: "2º grau" }, { id: "1", rotulo: "1º grau" }, { id: "s2", rotulo: "Sistema 2×2" }, { id: "s3", rotulo: "Sistema 3×3" }], (id, a) => {
        if (id === "1") {
          const A = campo({ rotulo: "a", ph: "2", valor: "2" }), B = campo({ rotulo: "b", ph: "3", valor: "3" }), C = campo({ rotulo: "c", ph: "11", valor: "11" });
          const res = resultadoBox();
          a.append(el("p", "dica-form", "Forma a·x + b = c. Aceita frações (1/3) e vírgula."), grade(A, B), C.el, res);
          const calc = () => (n(A) == null || n(B) == null ? vazio(res, "Preencha a e b.") : mostrar(res, M.eq1({ a: n(A), b: n(B), c: n(C) || 0 })));
          ligar([A, B, C], calc); calc();
          return { recalcular: calc };
        }
        if (id === "2") {
          const A = campo({ rotulo: "a (coef. de x²)", ph: "1", valor: "1" }), B = campo({ rotulo: "b (coef. de x)", ph: "-5", valor: "-5" }), C = campo({ rotulo: "c (termo independente)", ph: "6", valor: "6" });
          const ex = exemplos([{ r: "x² − 5x + 6", v: [1, -5, 6] }, { r: "2x² + 3x − 2", v: [2, 3, -2] }, { r: "x² − 4x + 4", v: [1, -4, 4] }, { r: "x² + 2x + 5", v: [1, 2, 5] }, { r: "−x² + 9", v: [-1, 0, 9] }], (e) => { A.set(e.v[0]); B.set(e.v[1]); C.set(e.v[2]); calc(); });
          const cv = el("canvas", "mt-cv");
          const gr = grafico(cv, 220);
          const res = resultadoBox();
          a.append(el("p", "dica-form", "Forma ax² + bx + c = 0. Se o termo não aparece, o coeficiente é 0."), grade(A, B), C.el, el("small", "dica", "Exemplos:"), ex.el, cv, res);
          function calc() {
            if ([A, B, C].some((c) => n(c) == null)) { cv.hidden = true; return vazio(res, "Preencha a, b e c."); }
            const r = M.eq2({ a: n(A), b: n(B), c: n(C) });
            mostrar(res, r);
            if (r.ok && n(A) !== 0) {
              cv.hidden = false;
              const xv = r.xv, larg = Math.max(4, ...(r.raizes || []).map((x) => Math.abs(x - xv) * 1.6));
              const ast = X.ler(`${n(A)}*x^2 + ${n(B)}*x + ${n(C)}`.replace(/\+ -/g, "- "));
              const marcas = [...(r.raizes || []).map((x) => ({ x, y: 0 })), { x: xv, y: r.yv, cor: COR }];
              gr.mostrar({ pts: amostrar(ast, xv - larg, xv + larg), x0: xv - larg, x1: xv + larg, marcas });
            } else cv.hidden = true;
          }
          ligar([A, B, C], calc); calc();
          return { recalcular: calc };
        }
        const k = id === "s2" ? 2 : 3;
        const nomes = ["x", "y", "z"].slice(0, k);
        const padrao = k === 2 ? [[2, 1, 5], [1, -1, 1]] : [[1, 1, 1, 6], [0, 2, 5, -4], [2, 5, -1, 27]];
        const tab = el("div", "mt-sis");
        const cs = padrao.map((linha, i) => {
          const l = el("div", "mt-sis-l");
          const cl = linha.map((v, j) => {
            const inp = el("input", "mt-sis-in"); inp.type = "text"; inp.inputMode = "decimal"; inp.value = String(v); inp.setAttribute("aria-label", j < k ? `coeficiente de ${nomes[j]} na equação ${i + 1}` : `termo independente da equação ${i + 1}`);
            const w = el("span", "mt-sis-c");
            w.append(inp, el("i", "", j < k ? `${nomes[j]}${j < k - 1 ? " +" : " ="}` : ""));
            l.appendChild(w);
            return inp;
          });
          tab.appendChild(l);
          return cl;
        });
        const res = resultadoBox();
        a.append(el("p", "dica-form", `Digite os coeficientes de cada equação (use negativos e frações à vontade: −2, 1/3).`), tab, res);
        function calc() {
          const Mx = cs.map((l) => l.map((i) => M.lerNumero(i.value.trim() || "0")));
          if (Mx.some((l) => l.some((v) => !isFinite(v)))) return vazio(res, "Há coeficientes que não são números.");
          mostrar(res, M.sistema(Mx));
        }
        cs.flat().forEach((i) => i.addEventListener("input", debounce(calc, 250)));
        calc();
        return { recalcular: calc };
      });
    },
  });

  // =====================================================================
  // 2. Proporção e porcentagem
  // =====================================================================
  FERR.push({
    id: "proporcao", nome: "Proporção e %", prat: "proporcao",
    resumo: "Regra de três simples e composta (direta ou inversa) e todos os tipos de porcentagem, incluindo aumentos e descontos sucessivos.",
    teoria: `<p>Duas grandezas são <b>diretamente proporcionais</b> quando, se uma dobra, a outra dobra (preço × quantidade). São <b>inversamente proporcionais</b> quando, se uma dobra, a outra cai pela metade (velocidade × tempo de viagem).</p>
      <div class="eq">direta: <span class="frac"><span>a</span><span>c</span></span> = <span class="frac"><span>b</span><span>x</span></span> &nbsp;&nbsp; inversa: a·b = c·x</div>
      <p><b>Porcentagem</b> = fração de 100: 15% = 0,15. Aumento de 20% multiplica por 1,20; desconto de 20% multiplica por 0,80. Taxas sucessivas se <b>multiplicam</b>, não se somam (+20% e −20% dá −4%).</p>
      <p>Na química e na física a regra de três aparece em estequiometria, conversões de unidade e diluições.</p>`,
    montar(raiz) {
      return subAbas(raiz, [{ id: "s", rotulo: "Regra de três" }, { id: "c", rotulo: "Composta" }, { id: "p", rotulo: "Porcentagem" }], (id, a) => {
        if (id === "s") {
          const A = campo({ rotulo: "Valor 1 da grandeza A", ph: "4", valor: "4" }), B = campo({ rotulo: "Valor 1 da grandeza B", ph: "12", valor: "12" });
          const C = campo({ rotulo: "Valor 2 da grandeza A", ph: "6", valor: "6" });
          let inv = false;
          const tipo = ui.segmentado({ itens: [{ id: "d", rotulo: "Diretamente proporcionais" }, { id: "i", rotulo: "Inversamente" }], valor: "d", onChange: (v) => { inv = v === "i"; calc(); } });
          const res = resultadoBox();
          a.append(grade(A, B), C.el, el("span", "c-rot", "Quando A aumenta, B também aumenta? Então é direta."), tipo.el, res);
          const calc = () => ([A, B, C].some((c) => n(c) == null) ? vazio(res, "Preencha os três valores conhecidos.") : mostrar(res, M.regra3({ a: n(A), b: n(B), c: n(C), inversa: inv })));
          ligar([A, B, C], calc); calc();
          return { recalcular: calc };
        }
        if (id === "c") {
          const nomes = ["Operários", "Horas/dia", "Dias"];
          const lin = [[8, 6, 10], [4, 6, ""]];
          const tab = el("div", "mt-comp");
          const inps = [], invs = [];
          let alvo = 2;
          nomes.forEach((nm, j) => {
            const col = el("div", "mt-comp-col");
            const nmIn = el("input", "mt-sis-in mt-comp-nome"); nmIn.value = nm; nmIn.setAttribute("aria-label", "nome da grandeza");
            const i1 = el("input", "mt-sis-in"); i1.inputMode = "decimal"; i1.value = lin[0][j];
            const i2 = el("input", "mt-sis-in"); i2.inputMode = "decimal"; i2.value = lin[1][j]; i2.placeholder = j === alvo ? "x" : "";
            const sel = el("select", "sel"); [["d", "direta"], ["i", "inversa"]].forEach(([v, t]) => { const o = el("option", "", t); o.value = v; sel.appendChild(o); });
            sel.value = j === 0 || j === 1 ? "i" : "d";
            col.append(nmIn, i1, i2, sel);
            tab.appendChild(col);
            inps.push([nmIn, i1, i2]); invs.push(sel);
            [nmIn, i1, i2, sel].forEach((e) => e.addEventListener(e.tagName === "SELECT" ? "change" : "input", debounce(calc, 250)));
          });
          const res = resultadoBox();
          a.append(el("p", "dica-form", "Linha 1: situação conhecida. Linha 2: nova situação, com a incógnita em branco. Abaixo de cada grandeza, diga se ela é direta ou inversa em relação à incógnita."), tab, res);
          function calc() {
            const l1 = inps.map((c) => M.lerNumero(c[1].value)), l2 = inps.map((c) => (c[2].value.trim() === "" ? null : M.lerNumero(c[2].value)));
            const vaz = l2.map((v, i) => (v == null ? i : -1)).filter((i) => i >= 0);
            if (vaz.length !== 1) return vazio(res, "Deixe exatamente um campo da linha 2 em branco (a incógnita).");
            alvo = vaz[0];
            invs.forEach((s, i) => { s.disabled = i === alvo; });
            mostrar(res, M.regra3Composta({ nomes: inps.map((c) => c[0].value || "?"), l1, l2: l2.map((v) => (v == null ? 0 : v)), inv: invs.map((s) => s.value === "i"), alvo }));
          }
          calc();
          return { recalcular: calc };
        }
        let modo = "de";
        const seg = ui.segmentado({ itens: [{ id: "de", rotulo: "x% de y" }, { id: "quanto", rotulo: "Quanto % é?" }, { id: "variacao", rotulo: "Variação %" }, { id: "sucessivos", rotulo: "Sucessivos" }], valor: "de", onChange: (v) => { modo = v; vis(); calc(); } });
        const pc = campo({ rotulo: "Porcentagem (%)", ph: "15", valor: "15" }), v = campo({ rotulo: "Valor", ph: "240", valor: "240" });
        const parte = campo({ rotulo: "Parte", ph: "36" }), total = campo({ rotulo: "Total", ph: "240" });
        const v0 = campo({ rotulo: "Valor inicial", ph: "80" }), v1 = campo({ rotulo: "Valor final", ph: "92" });
        const taxas = campo({ rotulo: "Taxas em % (negativo = desconto), separadas por espaço", ph: "Ex.: 20 -20", tipo: "texto", valor: "20 -20" });
        const res = resultadoBox();
        a.append(seg.el, grade(pc, v), grade(parte, total), grade(v0, v1), taxas.el, res);
        function vis() { pc.el.hidden = modo !== "de"; v.el.hidden = !(modo === "de" || modo === "sucessivos"); parte.el.hidden = total.el.hidden = modo !== "quanto"; v0.el.hidden = v1.el.hidden = modo !== "variacao"; taxas.el.hidden = modo !== "sucessivos"; }
        function calc() {
          const p = { modo, pc: n(pc), v: n(v), parte: n(parte), total: n(total), v0: n(v0), v1: n(v1), taxas: taxas.texto().split(/[\s;]+/).filter(Boolean).map(M.lerNumero) };
          const falta = { de: [p.pc, p.v], quanto: [p.parte, p.total], variacao: [p.v0, p.v1], sucessivos: [p.v] }[modo].some((x) => x == null);
          if (falta) return vazio(res, "Preencha os valores.");
          mostrar(res, M.porcentagem(p));
        }
        ligar([pc, v, parte, total, v0, v1, taxas], calc);
        vis(); calc();
        return { recalcular: calc };
      });
    },
  });

  // =====================================================================
  // 3. Potências e logaritmos
  // =====================================================================
  FERR.push({
    id: "log", nome: "Potências e log", prat: "log",
    resumo: "Logaritmos em qualquer base, equações exponenciais, potências com expoente fracionário e notação científica.",
    teoria: `<p><b>Logaritmo</b> é o expoente: log<sub>b</sub>(x) = y significa b<sup>y</sup> = x. Ex.: log<sub>2</sub>(8) = 3 porque 2³ = 8.</p>
      <ul><li>log = base 10; ln = base e ≈ 2,718.</li>
      <li>Propriedades: log(a·b) = log a + log b; log(a/b) = log a − log b; log(aⁿ) = n·log a.</li>
      <li>Mudança de base: log<sub>b</sub>(x) = log(x)/log(b).</li></ul>
      <p>Na química: pH = −log[H⁺]. Na física: decibéis, decaimento radioativo e carga de capacitores usam log e exponencial.</p>
      <p><b>Potência fracionária</b>: a<sup>p/q</sup> = <sup>q</sup>√(a<sup>p</sup>). Expoente negativo inverte: a<sup>−n</sup> = 1/aⁿ.</p>`,
    montar(raiz) {
      return subAbas(raiz, [{ id: "log", rotulo: "Logaritmo" }, { id: "exp", rotulo: "bˣ = y" }, { id: "pot", rotulo: "Potência e raiz" }, { id: "sci", rotulo: "Notação científica" }], (id, a) => {
        if (id === "log") {
          const base = seletor([["10", "log (base 10)"], ["e", "ln (base e)"], ["2", "base 2"], ["outra", "outra base"]], "10");
          const bo = campo({ rotulo: "Base", ph: "3" }), x = campo({ rotulo: "Logaritmando", ph: "1000", valor: "1000" });
          const res = resultadoBox();
          a.append(rotulo("Base", base), bo.el, x.el, res);
          function calc() {
            bo.el.hidden = base.value !== "outra";
            const b = base.value === "e" ? "e" : base.value === "outra" ? n(bo) : +base.value;
            if (n(x) == null || b == null) return vazio(res, "Preencha o logaritmando (e a base).");
            mostrar(res, M.logaritmo({ base: b, x: n(x) }));
          }
          ligar([base, bo, x], calc); calc();
          return { recalcular: calc };
        }
        if (id === "exp") {
          const b = campo({ rotulo: "Base b", ph: "2", valor: "2" }), y = campo({ rotulo: "Resultado y", ph: "10", valor: "10" });
          const res = resultadoBox();
          a.append(el("p", "dica-form", "Resolve bˣ = y aplicando logaritmo dos dois lados."), grade(b, y), res);
          const calc = () => (n(b) == null || n(y) == null ? vazio(res, "Preencha b e y.") : mostrar(res, M.expEq({ base: n(b), y: n(y) })));
          ligar([b, y], calc); calc();
          return { recalcular: calc };
        }
        if (id === "pot") {
          const b = campo({ rotulo: "Base", ph: "8", valor: "8" }), nu = campo({ rotulo: "Expoente: numerador", ph: "2", valor: "2" }), de = campo({ rotulo: "Expoente: denominador", ph: "1", valor: "3" });
          const res = resultadoBox();
          a.append(b.el, grade(nu, de), res);
          const calc = () => (n(b) == null || n(nu) == null ? vazio(res, "Preencha a base e o expoente.") : mostrar(res, M.potencia({ b: n(b), num: n(nu), den: n(de) || 1 })));
          ligar([b, nu, de], calc); calc();
          return { recalcular: calc };
        }
        const v = campo({ rotulo: "Número", ph: "0,00045 ou 602000000000000000000000", tipo: "texto", valor: "0,00045" });
        const res = resultadoBox();
        a.append(v.el, res);
        const calc = () => (!v.texto() ? vazio(res, "Digite um número.") : mostrar(res, M.notacaoCientifica(v.texto())));
        ligar([v], calc); calc();
        return { recalcular: calc };
      });
    },
  });

  // =====================================================================
  // 4. Trigonometria
  // =====================================================================
  FERR.push({
    id: "trig", nome: "Trigonometria", prat: "trig",
    resumo: "Seno, cosseno e tangente (com valores exatos e círculo trigonométrico), triângulo retângulo e leis dos senos e dos cossenos.",
    teoria: `<p>No <b>triângulo retângulo</b>, para um ângulo agudo α:</p>
      <div class="eq">sen α = <span class="frac"><span>oposto</span><span>hipotenusa</span></span> &nbsp; cos α = <span class="frac"><span>adjacente</span><span>hipotenusa</span></span> &nbsp; tg α = <span class="frac"><span>oposto</span><span>adjacente</span></span></div>
      <p>Macete: <b>SOH-CAH-TOA</b>. E Pitágoras: a² = b² + c².</p>
      <p>Em qualquer triângulo: <b>lei dos senos</b> (a/sen A = b/sen B = c/sen C) quando você conhece um lado e o ângulo oposto; <b>lei dos cossenos</b> (a² = b² + c² − 2bc·cos A) quando conhece três lados ou dois lados e o ângulo entre eles.</p>
      <p>Na física: decompor forças e velocidades (F<sub>x</sub> = F·cos θ, F<sub>y</sub> = F·sen θ). Atenção ao modo da calculadora: graus ou radianos!</p>`,
    montar(raiz) {
      return subAbas(raiz, [{ id: "ang", rotulo: "sen, cos, tg" }, { id: "ret", rotulo: "Triângulo retângulo" }, { id: "qq", rotulo: "Triângulo qualquer" }], (id, a) => {
        if (id === "ang") {
          const ang = campo({ rotulo: "Ângulo", ph: "30", valor: "150", unidades: ["°", "rad"], unidadePadrao: "°" });
          const cv = el("canvas", "mt-cv mt-circ");
          const res = resultadoBox();
          a.append(ang.el, cv, res);
          function desenhar(gr) {
            const dpr = Math.min(window.devicePixelRatio || 1, 2), w = cv.clientWidth || 300, h = 230;
            cv.width = w * dpr; cv.height = h * dpr;
            const g = cv.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
            const r = 90, cx = w / 2, cy = h / 2, t = (gr * Math.PI) / 180;
            g.strokeStyle = css("--line", "#2b3441"); g.lineWidth = 1;
            g.beginPath(); g.moveTo(cx - r - 20, cy); g.lineTo(cx + r + 20, cy); g.moveTo(cx, cy - r - 15); g.lineTo(cx, cy + r + 15); g.stroke();
            g.strokeStyle = css("--muted", "#9ba7b6"); g.beginPath(); g.arc(cx, cy, r, 0, 6.3); g.stroke();
            const px = cx + r * Math.cos(t), py = cy - r * Math.sin(t);
            g.strokeStyle = "#4aa3e0"; g.lineWidth = 3; g.beginPath(); g.moveTo(cx, cy); g.lineTo(px, cy); g.stroke();
            g.strokeStyle = "#e5646e"; g.beginPath(); g.moveTo(px, cy); g.lineTo(px, py); g.stroke();
            g.strokeStyle = COR; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(px, py); g.stroke();
            g.beginPath(); g.arc(cx, cy, 22, 0, -((((t % 6.2832) + 6.2832) % 6.2832) || 0.0001), true); g.stroke();
            g.fillStyle = css("--text", "#e8edf3"); g.beginPath(); g.arc(px, py, 4.5, 0, 6.3); g.fill();
            g.font = "12px 'IBM Plex Sans', sans-serif";
            g.fillStyle = "#4aa3e0"; g.fillText("cos", (cx + px) / 2 - 10, cy + (Math.sin(t) >= 0 ? 16 : -8));
            g.fillStyle = "#e5646e"; g.fillText("sen", px + (Math.cos(t) >= 0 ? 6 : -28), (cy + py) / 2);
          }
          function calc() {
            if (n(ang) == null) return vazio(res, "Digite o ângulo.");
            const r = M.trigAngulo({ ang: n(ang), unidade: ang.unidade() === "rad" ? "rad" : "g" });
            mostrar(res, r);
            desenhar(ang.unidade() === "rad" ? (n(ang) * 180) / Math.PI : n(ang));
          }
          ligar([ang], calc); calc();
          new ResizeObserver(debounce(calc, 120)).observe(cv);
          return { recalcular: calc };
        }
        if (id === "ret") {
          const A = campo({ rotulo: "a — hipotenusa", ph: "" }), B = campo({ rotulo: "b — cateto oposto a α", ph: "3", valor: "3" }), C = campo({ rotulo: "c — cateto adjacente a α", ph: "4", valor: "4" });
          const al = campo({ rotulo: "α (graus)", ph: "" });
          const res = resultadoBox();
          a.append(el("p", "dica-form", "Preencha exatamente dois: dois lados, ou um lado e o ângulo α."), grade(A, al), grade(B, C), res);
          function calc() {
            const p = { a: n(A), b: n(B), c: n(C), alfa: n(al) };
            const k = Object.values(p).filter((v) => v != null).length;
            if (k !== 2) return vazio(res, k < 2 ? "Preencha dois valores." : "Preencha só dois valores (o resto é calculado).");
            mostrar(res, M.trianguloRetangulo(p));
          }
          ligar([A, B, C, al], calc); calc();
          return { recalcular: calc };
        }
        const cs = { a: campo({ rotulo: "a", ph: "lado", valor: "7" }), b: campo({ rotulo: "b", ph: "lado", valor: "8" }), c: campo({ rotulo: "c", ph: "lado", valor: "9" }), A: campo({ rotulo: "A (°)", ph: "ângulo oposto a a" }), B: campo({ rotulo: "B (°)", ph: "oposto a b" }), C: campo({ rotulo: "C (°)", ph: "oposto a c" }) };
        const res = resultadoBox();
        a.append(el("p", "dica-form", "Preencha três elementos (com pelo menos um lado). Cada ângulo fica oposto ao lado de mesma letra."), grade(cs.a, cs.A), grade(cs.b, cs.B), grade(cs.c, cs.C), res);
        function calc() {
          const p = {}; for (const k in cs) p[k] = n(cs[k]);
          const qtd = Object.values(p).filter((v) => v != null).length;
          if (qtd !== 3) return vazio(res, qtd < 3 ? "Preencha três elementos." : "Preencha só três elementos.");
          mostrar(res, M.trianguloQualquer(p));
        }
        ligar(Object.values(cs), calc); calc();
        return { recalcular: calc };
      });
    },
  });

  // =====================================================================
  // 5. Vetores
  // =====================================================================
  FERR.push({
    id: "vetores", nome: "Vetores",
    resumo: "Soma, módulo, ângulo, produto escalar e vetorial em 2D e 3D, com desenho das setas.",
    teoria: `<p>Um <b>vetor</b> tem módulo (tamanho), direção e sentido. Em componentes: u = (u<sub>x</sub>; u<sub>y</sub>; u<sub>z</sub>).</p>
      <ul><li>Soma: componente a componente. Módulo: |u| = √(u<sub>x</sub>² + u<sub>y</sub>² + u<sub>z</sub>²).</li>
      <li>Produto escalar: u·v = u<sub>x</sub>v<sub>x</sub> + u<sub>y</sub>v<sub>y</sub> + u<sub>z</sub>v<sub>z</sub> = |u||v|cos θ (é zero se forem perpendiculares). Trabalho W = F·d é um produto escalar.</li>
      <li>Produto vetorial: u × v é perpendicular aos dois; |u × v| = área do paralelogramo. Torque e força magnética são produtos vetoriais.</li></ul>`,
    montar(raiz) {
      const op = seletor([["soma", "u + v"], ["sub", "u − v"], ["modulo", "Módulo e direção de u"], ["polar", "Componentes de módulo e ângulo"], ["escalar", "Produto escalar e ângulo"], ["vetorial", "Produto vetorial u × v"]], "soma");
      const u = campo({ rotulo: "u = componentes (separe por ; ou espaço)", ph: "(3; 4)", tipo: "texto", valor: "(3; 4)" });
      const v = campo({ rotulo: "v", ph: "(1; 2)", tipo: "texto", valor: "(1; -2)" });
      const cv = el("canvas", "mt-cv");
      const res = resultadoBox();
      raiz.append(rotulo("Operação", op), u.el, v.el, cv, res);
      function desenhar(r) {
        const vets = [];
        const U = M.lerVetor(u.texto()), V = M.lerVetor(v.texto());
        if (op.value === "polar") { if (r.ok) vets.push({ v: r.u, cor: COR, n: "u" }); }
        else {
          if (U && U.length === 2) vets.push({ v: U, cor: "#4aa3e0", n: "u" });
          if (V && V.length === 2 && op.value !== "modulo") vets.push({ v: V, cor: "#e5646e", n: "v" });
          if (r.ok && r.r && r.r.length === 2) vets.push({ v: r.r, cor: COR, n: op.value === "soma" ? "u+v" : "u−v" });
        }
        if (!vets.length) { cv.hidden = true; return; }
        cv.hidden = false;
        const dpr = Math.min(window.devicePixelRatio || 1, 2), w = cv.clientWidth || 300, h = 220;
        cv.width = w * dpr; cv.height = h * dpr;
        const g = cv.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
        const lim = Math.max(1, ...vets.flatMap((x) => x.v.map(Math.abs))) * 1.2;
        const esc = Math.min(w, h) / 2 / lim, cx = w / 2, cy = h / 2;
        g.strokeStyle = css("--line-soft", "#232b36");
        for (let k = -Math.floor(lim); k <= lim; k++) { g.beginPath(); g.moveTo(cx + k * esc, 0); g.lineTo(cx + k * esc, h); g.moveTo(0, cy - k * esc); g.lineTo(w, cy - k * esc); g.stroke(); }
        g.strokeStyle = css("--muted", "#9ba7b6"); g.beginPath(); g.moveTo(0, cy); g.lineTo(w, cy); g.moveTo(cx, 0); g.lineTo(cx, h); g.stroke();
        g.font = "600 12px 'IBM Plex Sans', sans-serif";
        for (const it of vets) {
          const ex = cx + it.v[0] * esc, ey = cy - it.v[1] * esc, ang = Math.atan2(ey - cy, ex - cx);
          g.strokeStyle = g.fillStyle = it.cor; g.lineWidth = 2.5;
          g.beginPath(); g.moveTo(cx, cy); g.lineTo(ex, ey); g.stroke();
          g.beginPath(); g.moveTo(ex, ey); g.lineTo(ex - 10 * Math.cos(ang - 0.4), ey - 10 * Math.sin(ang - 0.4)); g.lineTo(ex - 10 * Math.cos(ang + 0.4), ey - 10 * Math.sin(ang + 0.4)); g.closePath(); g.fill();
          g.fillText(it.n, ex + 6, ey - 6);
        }
      }
      function calc() {
        v.el.hidden = op.value === "modulo" || op.value === "polar";
        u.el.querySelector(".c-rot").textContent = op.value === "polar" ? "Módulo e ângulo em graus (ex.: 10; 30)" : "u = componentes (separe por ; ou espaço)";
        const r = M.vetores({ op: op.value, u: u.texto(), v: v.texto() });
        mostrar(res, r);
        desenhar(r);
      }
      ligar([op, u, v], calc); calc();
      new ResizeObserver(debounce(calc, 120)).observe(cv);
      return { recalcular: calc };
    },
  });

  // =====================================================================
  // 6. Cálculo: derivadas e integrais
  // =====================================================================
  FERR.push({
    id: "calculo", nome: "Derivadas e integrais", prat: "calculo",
    resumo: "Derivada simbólica com cada regra explicada, reta tangente, primitivas e integrais definidas com gráfico.",
    teoria: `<p>A <b>derivada</b> f′(x) é a taxa de variação instantânea: a inclinação da reta tangente. Velocidade é a derivada da posição; aceleração, da velocidade.</p>
      <div class="eq">(xⁿ)′ = n·xⁿ⁻¹ &nbsp; (f·g)′ = f′g + fg′ &nbsp; (f(g(x)))′ = f′(g(x))·g′(x)</div>
      <p>A <b>integral</b> desfaz a derivada (primitiva) e, entre dois limites, dá a <b>área com sinal</b> sob o gráfico. Deslocamento é a integral da velocidade; trabalho, a integral da força.</p>
      <div class="eq">∫xⁿ dx = <span class="frac"><span>xⁿ⁺¹</span><span>n+1</span></span> + C &nbsp;&nbsp; ∫<sub>a</sub><sup>b</sup> f dx = F(b) − F(a)</div>
      <p>Escreva: <b>3x^2 + sin(2x)</b>, <b>exp(x)</b> ou <b>e^x</b>, <b>ln(x)</b>, <b>sqrt(x)</b>. Multiplicação implícita funciona (2x, 3(x+1)).</p>`,
    montar(raiz) {
      return subAbas(raiz, [{ id: "d", rotulo: "Derivada" }, { id: "i", rotulo: "Integral" }], (id, a) => {
        const f = campo({ rotulo: "f(x) =", ph: "Ex.: x^3 - 2x + 1", tipo: "texto", valor: id === "d" ? "x^2*sin(x)" : "3x^2 + 2x - 1" });
        const tec = el("div", "teclado");
        ["^", "(", ")", "sin(", "cos(", "e^", "ln(", "sqrt("].forEach((s) => { const b = el("button"); b.type = "button"; b.textContent = s === "sqrt(" ? "√" : s; b.addEventListener("click", () => { const i = f.input.selectionStart ?? f.input.value.length; f.input.value = f.input.value.slice(0, i) + s + f.input.value.slice(i); f.input.focus(); f.input.setSelectionRange(i + s.length, i + s.length); calc(); }); tec.appendChild(b); });
        tec.classList.add("teclado-rola");
        const x0 = campo({ rotulo: "No ponto x = (opcional)", ph: "Ex.: 1", valor: id === "d" ? "1" : "" });
        const la = campo({ rotulo: "De a =", ph: "0", valor: "0" }), lb = campo({ rotulo: "até b =", ph: "2", valor: "2" });
        const ex = exemplos(id === "d"
          ? [{ r: "x³ − 2x + 1", f: "x^3 - 2x + 1" }, { r: "x²·sen x", f: "x^2*sin(x)" }, { r: "e^(2x)/x", f: "e^(2x)/x" }, { r: "ln(x² + 1)", f: "ln(x^2+1)" }, { r: "√(3x + 1)", f: "sqrt(3x+1)" }]
          : [{ r: "3x² + 2x − 1", f: "3x^2 + 2x - 1" }, { r: "sen(2x)", f: "sin(2x)" }, { r: "1/x", f: "1/x" }, { r: "e^(−x)", f: "e^(-x)" }, { r: "(x + 1)³", f: "(x+1)^3" }], (e) => { f.set(e.f); calc(); });
        const cv = el("canvas", "mt-cv");
        const gr = grafico(cv, 220);
        const res = resultadoBox();
        a.append(f.el, tec, el("small", "dica", "Exemplos:"), ex.el, id === "d" ? x0.el : grade(la, lb), cv, res);
        function calc() {
          if (!f.texto()) { cv.hidden = true; return vazio(res, "Digite a função."); }
          if (id === "d") {
            const r = M.derivada({ f: f.texto(), x0: n(x0) });
            mostrar(res, r);
            if (r.ok) {
              const ast = X.ler(f.texto()), c = n(x0) != null ? n(x0) : 0;
              const marcas = r.tangente ? [{ x: c, y: X.avaliar(ast, { x: c }), cor: COR }] : [];
              cv.hidden = false; gr.mostrar({ pts: amostrar(ast, c - 4, c + 4), x0: c - 4, x1: c + 4, marcas, reta: r.tangente });
            } else cv.hidden = true;
            return;
          }
          const A = n(la), B = n(lb);
          const r = M.integral({ f: f.texto(), a: A, b: B });
          mostrar(res, r);
          if (r.ok) {
            const ast = X.ler(f.texto());
            const lo = A != null && B != null ? Math.min(A, B) : -3, hi = A != null && B != null ? Math.max(A, B) : 3, m = Math.max(1, (hi - lo) * 0.4);
            cv.hidden = false; gr.mostrar({ pts: amostrar(ast, lo - m, hi + m), x0: lo - m, x1: hi + m, marcas: A != null && B != null ? [{ x: A, y: 0, cor: COR }, { x: B, y: 0, cor: COR }] : [] });
          } else cv.hidden = true;
        }
        ligar([f, x0, la, lb], calc); calc();
        return { recalcular: calc };
      });
    },
  });

  // =====================================================================
  // 7. Funções e gráficos
  // =====================================================================
  FERR.push({
    id: "funcoes", nome: "Gráficos",
    resumo: "Digite f(x) e veja o gráfico, as raízes, os máximos e mínimos e uma tabela de valores.",
    teoria: `<p>O <b>gráfico</b> de f mostra, para cada x, a altura f(x). Ler o gráfico responde a muitas perguntas:</p>
      <ul><li><b>Raízes</b>: onde o gráfico cruza o eixo x (f(x) = 0).</li>
      <li><b>Máximos e mínimos</b>: picos e vales, onde a derivada é zero.</li>
      <li><b>Crescente/decrescente</b>: subindo ou descendo da esquerda para a direita.</li>
      <li>1º grau → reta; 2º grau → parábola; exponencial → cresce cada vez mais rápido; seno e cosseno → ondas.</li></ul>`,
    montar(raiz) {
      const f = campo({ rotulo: "f(x) =", ph: "Ex.: x^3 - 3x", tipo: "texto", valor: "x^3 - 3x" });
      const a = campo({ rotulo: "x mínimo", ph: "-5", valor: "-3" }), b = campo({ rotulo: "x máximo", ph: "5", valor: "3" });
      const ex = exemplos([{ r: "x³ − 3x", f: "x^3 - 3x", a: -3, b: 3 }, { r: "parábola", f: "x^2 - 4x + 3", a: -1, b: 5 }, { r: "seno", f: "sin(x)", a: -7, b: 7 }, { r: "exponencial", f: "2^x", a: -3, b: 4 }, { r: "1/x", f: "1/x", a: -4, b: 4 }, { r: "decaimento", f: "100*exp(-0.3x)", a: 0, b: 15 }], (e) => { f.set(e.f); a.set(e.a); b.set(e.b); calc(); });
      const cv = el("canvas", "mt-cv mt-grande");
      const gr = grafico(cv, 280);
      const res = resultadoBox();
      raiz.append(f.el, el("small", "dica", "Exemplos:"), ex.el, grade(a, b), cv, res);
      function calc() {
        if (!f.texto()) { cv.hidden = true; return vazio(res, "Digite a função."); }
        const r = M.estudoFuncao({ f: f.texto(), x0: n(a) ?? -10, x1: n(b) ?? 10 });
        mostrar(res, r);
        if (!r.ok) { cv.hidden = true; return; }
        cv.hidden = false;
        gr.mostrar({ pts: r.pts, x0: n(a) ?? -10, x1: n(b) ?? 10, marcas: [...r.raizes.map((x) => ({ x, y: 0 })), ...r.extremos.map((e) => ({ x: e.x, y: e.y, cor: COR }))] });
      }
      ligar([f, a, b], calc); calc();
      return { recalcular: calc };
    },
  });
})();
