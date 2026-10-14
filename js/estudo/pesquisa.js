/*
 * Estudo: Pesquisa
 * Ferramentas para relatório de laboratório e iniciação científica:
 * ajuste linear, propagação de incertezas, algarismos significativos,
 * estatística de medidas, constantes físicas e tabelas para copiar.
 */
(function () {
  "use strict";
  const LAB = window.LAB;
  const P = window.PCalc;
  const X = window.Expr;
  if (!LAB || !P || !X) return;
  const { el, ui } = LAB;
  const E = LAB.estudo;
  const { campo, grade, mostrar, resultadoBox, dicaInicial, debounce } = E;
  const COR = "#d9648c";

  E.modulo({
    id: "pesquisa",
    nome: "Pesquisa",
    sub: "Ferramentas para relatórios de laboratório, TCC e iniciação científica.",
    cor: COR,
    selo: "verificavel",
    icone: '<svg viewBox="0 0 24 24"><path d="M4 20h16"/><path d="M6 16l4-5 3 3 5-7"/><circle cx="6" cy="16" r="1"/><circle cx="10" cy="11" r="1"/><circle cx="13" cy="14" r="1"/><circle cx="18" cy="7" r="1"/></svg>',
    motor: P,
    chave: "estudo.p.pontos",
    rodape: "Os cálculos seguem o GUM (Guia para a Expressão da Incerteza de Medição) em sua forma usual de graduação: incertezas padrão combinadas em quadratura, desvio-padrão amostral (n − 1) e t de Student para intervalos de confiança.",
    nota: {
      real: [
        "Mínimos quadrados com as fórmulas fechadas (Sxx, Sxy) e incertezas dos coeficientes; ajuste ponderado quando há σy.",
        "Propagação por derivadas parciais (numéricas, com passo adaptativo) somadas em quadratura, como no GUM.",
        "Constantes do CODATA 2018 (valores exatos marcados como exatos).",
      ],
      simplificado: [
        "Supõe medidas independentes (sem correlação entre as variáveis) na propagação de incertezas.",
        "No ajuste, só y tem incerteza (x é considerado exato).",
        "O critério de Chauvenet só aponta suspeitos: descartar dados é decisão sua, com justificativa.",
      ],
    },
  });
  const FERR = E.ferramentas.pesquisa;

  const n = (c) => { const t = c.texto(); return t === "" ? null : P.lerNumero(t); };
  const vazio = (res, txt) => { res.innerHTML = ""; res._r = null; res.appendChild(dicaInicial(txt)); };
  const area = (ph, linhas = 7) => { const t = el("textarea", "area-dados"); t.rows = linhas; t.placeholder = ph; t.spellcheck = false; return t; };
  const copiarBt = (rotulo, texto) => {
    const b = ui.botao(rotulo, async () => {
      try { await navigator.clipboard.writeText(typeof texto === "function" ? texto() : texto); const t0 = b.textContent; b.textContent = "Copiado ✓"; setTimeout(() => (b.textContent = t0), 1500); }
      catch (_e) { b.textContent = "Não consegui copiar"; }
    }, "sec mini");
    return b;
  };
  const rotulo = (txt, filho) => { const w = el("label", "campo"); w.append(el("span", "c-rot", txt), filho); return w; };
  const seletor = (opcoes, valor) => { const s = el("select", "sel"); opcoes.forEach(([v, t]) => { const o = el("option", "", t); o.value = v; s.appendChild(o); }); if (valor != null) s.value = valor; return s; };

  const fmt = (v, k = 4) => E.fmtSig(v, k);

  // =====================================================================
  // 1. Ajuste linear
  // =====================================================================
  FERR.push({
    id: "ajuste", nome: "Ajuste linear", prat: "ajuste",
    resumo: "Cole seus dados (x, y e, se tiver, σy) e obtenha a melhor reta com incertezas, R², resíduos e gráfico.",
    teoria: `<p>O <b>método dos mínimos quadrados</b> escolhe a reta y = a·x + b que torna mínima a soma dos quadrados das distâncias verticais entre os pontos e a reta.</p>
      <div class="eq">a = <span class="frac"><span>S<sub>xy</sub></span><span>S<sub>xx</sub></span></span> &nbsp;&nbsp; b = ȳ − a·x̄</div>
      <ul><li><b>R²</b> (0 a 1) mede quanto da variação de y a reta explica. R² alto não prova que a relação é linear: olhe os <b>resíduos</b>; se formam uma curva, o modelo está errado.</li>
      <li>Leis não lineares viram retas com uma troca de variáveis: y = A·e<sup>kx</sup> → ln y × x; y = A·x<sup>n</sup> → log y × log x.</li>
      <li>Com incertezas σy diferentes, use o ajuste <b>ponderado</b> (pontos mais precisos pesam mais).</li>
      <li>Sempre informe os coeficientes <b>com incerteza e unidade</b>: a = (2,03 ± 0,05) m/s.</li></ul>`,
    montar(raiz) {
      const dados = area("x   y   (σy opcional)\n1   2,1\n2   3,9\n3   6,2\n4   7,8\n5   10,1");
      dados.value = "0 0,1\n0,1 1,08\n0,2 2,02\n0,3 2,90\n0,4 3,95\n0,5 4,88";
      const modo = seletor(Object.keys(P.TRANSF).map((k) => [k, P.TRANSF[k].nome]), "lin");
      const ori = el("label", "check-neutros"); const cbOri = el("input"); cbOri.type = "checkbox"; ori.append(cbOri, document.createTextNode("Forçar a reta a passar pela origem (b = 0)"));
      const pon = el("label", "check-neutros"); const cbPon = el("input"); cbPon.type = "checkbox"; pon.append(cbPon, document.createTextNode("Ajuste ponderado (usar a 3ª coluna como σy)"));
      const xp = campo({ rotulo: "Prever y para x =", ph: "opcional" });
      const ex = ui.chips({ itens: [{ id: "q", rotulo: "Queda livre (v × t)" }, { id: "o", rotulo: "Lei de Ohm (V × i)" }, { id: "e", rotulo: "Decaimento (exponencial)" }, { id: "p", rotulo: "Pêndulo (T × L, potência)" }], onClick: (id) => {
        const D = {
          q: ["0 0,1", "0,1 1,08", "0,2 2,02", "0,3 2,90", "0,4 3,95", "0,5 4,88"], o: ["0,10 1,02 0,02", "0,20 2,05 0,02", "0,30 2,98 0,03", "0,40 4,05 0,03", "0,50 4,96 0,04"],
          e: ["0 1000", "10 707", "20 498", "30 356", "40 249", "50 178"], p: ["0,2 0,90", "0,4 1,27", "0,6 1,55", "0,8 1,80", "1,0 2,01"],
        }[id];
        dados.value = D.join("\n"); modo.value = id === "e" ? "exp" : id === "p" ? "pot" : "lin"; cbPon.checked = id === "o"; calc();
      } });
      const gr = E.grafico({ modo: "dados", altura: (w) => Math.round(Math.min(Math.max(w * 0.5, 230), 330)), aria: "Pontos medidos e reta ajustada" });
      const grOrig = E.grafico({ modo: "dados", altura: (w) => Math.round(Math.min(Math.max(w * 0.45, 210), 300)), aria: "Dados originais e curva ajustada" });
      const grR = E.grafico({ modo: "dados", interativo: false, altura: 150, aria: "Resíduos" });
      const rotOrig = el("small", "dica", "Nos eixos originais (a curva é a reta ajustada desfeita a troca de variáveis):");
      const graf = el("div", "pq-graf"); graf.append(gr.el, rotOrig, grOrig.el, el("small", "dica", "Resíduos (ponto − reta): devem se espalhar ao acaso em torno de zero. Se formam uma curva, o modelo não serve."), grR.el);
      const res = resultadoBox();
      const bts = el("div", "linha-bt");
      raiz.append(el("span", "c-rot", "Dados: uma linha por ponto (cole da planilha; vírgula decimal ok)"), dados, el("small", "dica", "Exemplos:"), ex.el, rotulo("Modelo", modo), ori, pon, xp.el, graf, bts, res);
      let ult = null;
      function desenhar() {
        if (!ult || !ult.ok) { graf.hidden = true; return; }
        graf.hidden = false;
        const r = ult, T = P.TRANSF[r.modo];
        const pts = r.X.map((x, i) => [x, r.Y[i], r.sY ? r.sY[i] : 0]);
        gr.definir({ rotX: T.tx, rotY: T.ty, nomeX: T.tx, nomeY: T.ty, series: [
          { tipo: "funcao", f: (x) => r.a * x + r.b, rotulo: `reta: ${T.ty} = ${fmt(r.a)}·${T.tx} ${r.b < 0 ? "−" : "+"} ${fmt(Math.abs(r.b))} (R² = ${fmt(r.r2, 5)})` },
          { tipo: "pontos", pts, cor: "#e8edf3", rotulo: "medidas" },
        ] });
        const naoLinear = r.modo !== "lin" && r.predizer && r.pontos;
        rotOrig.hidden = !naoLinear;
        if (naoLinear) {
          const xs = r.pontos.map((p) => p.x), lo = Math.min(...xs), hi = Math.max(...xs);
          grOrig.definir({ rotX: "x", rotY: "y", series: [
            { tipo: "funcao", f: (x) => { const q = r.predizer(x); return q && q.ok ? q.y : NaN; }, dominio: [lo - (hi - lo) * 0.05, hi + (hi - lo) * 0.05], rotulo: "curva ajustada" },
            { tipo: "pontos", pts: r.pontos.map((p) => [p.x, p.y]), cor: "#e8edf3", rotulo: "medidas" },
          ] });
        } else grOrig.esconder();
        const lim = Math.max(...r.residuos.map(Math.abs), ...(r.sY || [0])) * 1.3 || 1;
        grR.definir({ y: [-lim, lim], rotY: "resíduo", nomeX: T.tx, nomeY: "resíduo", series: [
          { tipo: "hline", v: 0, cor: "rgba(155,167,182,.8)", tracejado: true, legenda: false },
          { tipo: "pontos", pts: r.X.map((x, i) => [x, r.residuos[i], r.sY ? r.sY[i] : 0]), rotulo: "resíduos", legenda: false },
        ] });
      }
      function calc() {
        const t = dados.value.trim();
        if (!t) { ult = null; desenhar(); bts.innerHTML = ""; return vazio(res, "Cole ou digite os pontos, ou toque num exemplo."); }
        const tab = P.parseTabela(t, { minCols: 2 });
        if (!tab.ok) { ult = null; desenhar(); return mostrar(res, tab); }
        const pts = tab.linhas.map((l) => ({ x: l[0], y: l[1], sy: l[2] }));
        const r = P.ajustar(pts, { modo: modo.value, origem: cbOri.checked, ponderado: cbPon.checked });
        if (r.ok && n(xp) != null && r.predizer) {
          const pr = r.predizer(n(xp));
          if (pr && pr.ok) r.passos.push({ t: `Previsão para x = ${P.numT(n(xp), 4)}`, h: `<div class="eq">ŷ = <b>${P.numT(pr.y, 5)}</b>${pr.sy ? ` ± ${P.numT(pr.sy, 2)}` : ""}</div><small class="dica">Previsões fora do intervalo medido (extrapolação) são bem menos confiáveis.</small>` });
        }
        ult = r;
        mostrar(res, r);
        desenhar();
        bts.innerHTML = "";
        if (r.ok) bts.append(copiarBt("Copiar resultado", () => r.resposta), copiarBt("Copiar resíduos (CSV)", () => ["x;y;residuo", ...r.pontos.map((p, i) => `${p.x};${p.y};${r.residuos[i]}`)].join("\n").replace(/\./g, ",")));
        if (tab.ignoradas && tab.ignoradas.length) res.prepend(el("p", "dica-form", `Ignorei ${tab.ignoradas.length} linha(s) sem números (cabeçalho?).`));
      }
      dados.addEventListener("input", debounce(calc, 300));
      [modo, cbOri, cbPon].forEach((c) => c.addEventListener("change", calc));
      xp.input.addEventListener("input", debounce(calc, 300));
      calc();
      return { recalcular: calc };
    },
  });

  // =====================================================================
  // 2. Propagação de incertezas
  // =====================================================================
  FERR.push({
    id: "incerteza", nome: "Incertezas", prat: "incerteza",
    resumo: "Digite a fórmula (ex.: m*g*h) e o valor ± incerteza de cada medida; veja a incerteza do resultado e qual medida mais pesa.",
    teoria: `<p>Toda medida tem uma <b>incerteza</b> σ: a faixa em que o valor verdadeiro provavelmente está. Ao calcular f(x, y, ...), as incertezas se combinam:</p>
      <div class="eq">σ<sub>f</sub> = √[ (∂f/∂x · σ<sub>x</sub>)² + (∂f/∂y · σ<sub>y</sub>)² + … ]</div>
      <ul><li>Atalhos: na soma/subtração somam-se as incertezas <b>absolutas</b> em quadratura; no produto/divisão, as incertezas <b>relativas</b>.</li>
      <li>A tabela de contribuições mostra qual medida domina o erro: melhore essa primeiro.</li>
      <li>Arredonde σ para 1 algarismo significativo (2 se começar por 1) e o valor na mesma casa decimal: <b>(9,81 ± 0,03) m/s²</b>.</li></ul>`,
    montar(raiz) {
      const f = campo({ rotulo: "Fórmula (use letras para as medidas)", ph: "Ex.: 0,5*m*v^2", tipo: "texto", valor: "m*g*h" });
      const unF = campo({ rotulo: "Unidade do resultado (opcional)", ph: "Ex.: J", tipo: "texto" });
      const vars = el("div", "pq-vars");
      const ex = ui.chips({ itens: [
        { id: "m*g*h|m=2,00±0,01|g=9,81±0,02|h=3,00±0,05|J", rotulo: "Energia potencial" },
        { id: "4*pi^2*L/T^2|L=1,000±0,002|T=2,006±0,010|m/s²", rotulo: "g pelo pêndulo" },
        { id: "m/V|m=12,5±0,1|V=4,6±0,2|g/cm³", rotulo: "Densidade" },
        { id: "V/i|V=12,0±0,1|i=0,250±0,005|Ω", rotulo: "Resistência" },
      ].map((x) => ({ id: x.id, rotulo: x.rotulo })), onClick: (id) => {
        const partes = id.split("|"); f.set(partes[0]); unF.set(partes[partes.length - 1]);
        reconstruir(Object.fromEntries(partes.slice(1, -1).map((p) => { const [k, v] = p.split("="); const [a, b] = v.split("±"); return [k, { v: a, s: b }]; })));
      } });
      const res = resultadoBox();
      const bts = el("div", "linha-bt");
      raiz.append(f.el, el("small", "dica", "Operações: + − * / ^, funções sqrt, sin, cos, tan, ln, log, exp; constantes pi e e. Exemplos:"), ex.el, vars, unF.el, bts, res);
      const campos = {};
      function reconstruir(preset) {
        let nomes = [];
        try { nomes = X.variaveis(X.ler(f.texto())); } catch (_e) { nomes = []; }
        vars.innerHTML = "";
        for (const nm of nomes) {
          if (!campos[nm]) {
            const v = campo({ rotulo: `${X.paraHTML({ t: "var", n: nm })} — valor`, ph: "medida" });
            const s = campo({ rotulo: "± incerteza (σ ou %)", ph: "Ex.: 0,01 ou 2%" });
            const u = campo({ rotulo: "unidade", ph: "opcional", tipo: "texto" });
            [v, s, u].forEach((c) => c.input.addEventListener("input", debounce(calc, 250)));
            campos[nm] = { v, s, u };
          }
          if (preset && preset[nm]) { campos[nm].v.set(preset[nm].v); campos[nm].s.set(preset[nm].s); }
          const linha = el("div", "pq-var");
          linha.append(grade(campos[nm].v, campos[nm].s), campos[nm].u.el);
          vars.appendChild(linha);
        }
        calc();
      }
      function calc() {
        bts.innerHTML = "";
        if (!f.texto()) return vazio(res, "Digite a fórmula do resultado.");
        let nomes;
        try { nomes = X.variaveis(X.ler(f.texto())); } catch (e) { return mostrar(res, { ok: false, erro: e.message }); }
        const d = {};
        for (const nm of nomes) {
          const c = campos[nm];
          if (!c || c.v.texto() === "") return vazio(res, `Informe o valor (e a incerteza) de ${nm}.`);
          d[nm] = { v: c.v.num(), s: c.s.texto() === "" ? 0 : P.lerIncerteza(c.s.texto(), c.v.num()), u: c.u.texto() };
        }
        const r = P.propagar(f.texto(), d, { unidade: unF.texto() });
        mostrar(res, r);
        if (r.ok) bts.append(copiarBt("Copiar resultado", r.texto || r.resposta), copiarBt("Copiar em LaTeX", r.latex || r.resposta));
      }
      f.input.addEventListener("input", debounce(() => reconstruir(), 350));
      unF.input.addEventListener("input", debounce(calc, 250));
      reconstruir({ m: { v: "2,00", s: "0,01" }, g: { v: "9,81", s: "0,02" }, h: { v: "3,00", s: "0,05" } });
      unF.set("J"); calc();
      return { recalcular: calc };
    },
  });

  // =====================================================================
  // 3. Algarismos significativos
  // =====================================================================
  FERR.push({
    id: "sig", nome: "Alg. significativos", prat: "sig-operacao",
    resumo: "Conte algarismos significativos, arredonde e faça contas respeitando a precisão das medidas.",
    teoria: `<p><b>Algarismos significativos</b> são os que você tem certeza mais o primeiro duvidoso. Eles dizem a precisão da medida: 2,50 m (3 a.s.) é mais preciso que 2,5 m (2 a.s.).</p>
      <ul><li>Zeros à <b>esquerda</b> não contam (0,0045 tem 2). Zeros entre algarismos contam (1005 tem 4). Zeros à <b>direita</b> depois da vírgula contam (2,50 tem 3).</li>
      <li>1500 é ambíguo: escreva 1,5×10³ (2 a.s.) ou 1,500×10³ (4 a.s.).</li>
      <li><b>Soma/subtração</b>: o resultado fica com o menor número de <b>casas decimais</b>. <b>Multiplicação/divisão</b>: com o menor número de <b>algarismos significativos</b>.</li>
      <li>Arredonde só no final; carregue algarismos extras nas contas intermediárias.</li></ul>`,
    montar(raiz) {
      let modo = "contar";
      const seg = ui.segmentado({ itens: [{ id: "contar", rotulo: "Contar" }, { id: "arred", rotulo: "Arredondar" }, { id: "op", rotulo: "Operações" }], valor: "contar", onChange: (v) => { modo = v; vis(); calc(); } });
      const num = campo({ rotulo: "Número (como foi medido)", ph: "Ex.: 0,004500 ou 1,50e3", tipo: "texto", valor: "0,004500" });
      const nn = campo({ rotulo: "Quantos algarismos significativos?", ph: "Ex.: 2", valor: "2" });
      const op = seletor([["+", "Somar (+)"], ["-", "Subtrair (−)"], ["*", "Multiplicar (×)"], ["/", "Dividir (÷)"]], "*");
      const nums = campo({ rotulo: "Números (separados por espaço ou ;)", ph: "Ex.: 12,52 1,7", tipo: "texto", valor: "2,5 3,42" });
      const res = resultadoBox();
      const wop = rotulo("Operação", op);
      raiz.append(seg.el, num.el, nn.el, wop, nums.el, res);
      function vis() { num.el.hidden = modo === "op"; nn.el.hidden = modo !== "arred"; wop.hidden = nums.el.hidden = modo !== "op"; }
      function calc() {
        if (modo === "contar") return num.texto() ? mostrar(res, P.contarAS(num.texto())) : vazio(res, "Digite um número.");
        if (modo === "arred") return num.texto() && n(nn) ? mostrar(res, P.arredondarAS(num.texto(), n(nn))) : vazio(res, "Digite o número e quantos algarismos quer manter.");
        const lista = nums.texto().split(/[\s;]+/).filter(Boolean);
        if (lista.length < 2) return vazio(res, "Digite pelo menos dois números.");
        mostrar(res, P.operarAS(lista, op.value));
      }
      [num, nn, nums].forEach((c) => c.input.addEventListener("input", debounce(calc, 220)));
      op.addEventListener("change", calc);
      vis(); calc();
      return { recalcular: calc };
    },
  });

  // =====================================================================
  // 4. Estatística de medidas
  // =====================================================================
  FERR.push({
    id: "estat", nome: "Estatística", prat: "estat",
    resumo: "Medidas repetidas → média, desvio-padrão, erro da média, intervalo de confiança e valores suspeitos.",
    teoria: `<p>Repetir uma medida e tirar a <b>média</b> reduz o efeito dos erros aleatórios.</p>
      <ul><li><b>Desvio-padrão</b> s (com n − 1): quanto cada medida costuma se afastar da média — a dispersão do método.</li>
      <li><b>Erro-padrão da média</b> s/√n: a incerteza da própria média; cai com mais medidas.</li>
      <li><b>Intervalo de confiança</b>: x̄ ± t·s/√n, com t de Student (para poucas medidas t é maior que 2).</li>
      <li><b>Critério de Chauvenet</b> aponta valores improváveis. Só descarte com motivo (erro de anotação, falha do aparelho).</li></ul>
      <div class="eq">x̄ = Σx/n &nbsp;&nbsp; s = √[Σ(x − x̄)²/(n − 1)]</div>`,
    montar(raiz) {
      const dados = area("Ex.: 9,81  9,79  9,83  9,80  9,82", 4);
      dados.value = "9,81 9,79 9,83 9,80 9,82 9,95";
      const conf = seletor([["0.9", "90%"], ["0.95", "95%"], ["0.99", "99%"]], "0.95");
      const un = campo({ rotulo: "Unidade (opcional)", ph: "Ex.: m/s²", tipo: "texto", valor: "m/s²" });
      const gr = E.grafico({ modo: "dados", interativo: false, altura: (w) => Math.round(Math.min(Math.max(w * 0.38, 190), 260)), aria: "Histograma das medidas" });
      const exclu = el("div", "chips quebra");
      const res = resultadoBox();
      const bts = el("div", "linha-bt");
      raiz.append(el("span", "c-rot", "Medidas (separadas por espaço, ; ou uma por linha)"), dados, grade(rotulo("Confiança", conf), un), gr.el, el("small", "dica", "Toque numa medida para excluí-la do cálculo (e de novo para incluir)."), exclu, bts, res);
      const excluir = new Set();
      let ult = null, vals = [];
      function desenhar() {
        if (!ult || !ult.ok) return gr.esconder();
        const bins = ult.bins || [];
        const u = un.texto() ? ` ${un.texto()}` : "";
        const lo = bins.length ? bins[0].lo : ult.media - 1, hi = bins.length ? bins[bins.length - 1].hi : ult.media + 1;
        const folga = (hi - lo) * 0.08 || 0.1;
        gr.definir({ x: [Math.min(lo, ult.media - ult.s) - folga, Math.max(hi, ult.media + ult.s) + folga], zeroY: true, rotX: `medida${u}`, rotY: "quantas", nomeX: "medida", series: [
          { tipo: "barras", barras: bins.map((b) => ({ a: b.lo, b: b.hi, v: b.c, nota: b.c === 1 ? "medida" : "medidas" })), cor: "#9ba7b6", rotulo: "medidas por faixa" },
          { tipo: "vline", v: ult.media, rotulo: `média ${fmt(ult.media, 5)}` },
          { tipo: "vline", v: ult.media - ult.s, tracejado: true, largura: 1, cor: "#4aa3e0", rotulo: "−s", legenda: false },
          { tipo: "vline", v: ult.media + ult.s, tracejado: true, largura: 1, cor: "#4aa3e0", rotulo: "+s (desvio-padrão)", legenda: false },
        ] });
      }
      function chips() {
        exclu.innerHTML = "";
        const susp = new Set((ult && ult.suspeitos ? ult.suspeitos : []).map((s) => s.indice));
        vals.forEach((v, i) => {
          const b = el("button", "chip2" + (excluir.has(i) ? " risca" : "") + (susp.has(i) ? " on" : ""), P.numT(v, 6));
          b.type = "button"; b.title = susp.has(i) ? "Suspeito pelo critério de Chauvenet" : "";
          b.addEventListener("click", () => { excluir.has(i) ? excluir.delete(i) : excluir.add(i); calc(true); });
          exclu.appendChild(b);
        });
      }
      function calc(manterExcl) {
        if (manterExcl !== true) excluir.clear();
        const L = P.lerLista(dados.value);
        vals = L.ok ? L.valores || L.lista || L.v || [] : [];
        if (!L.ok) { ult = null; desenhar(); exclu.innerHTML = ""; return mostrar(res, L); }
        if (vals.length < 2) { ult = null; desenhar(); exclu.innerHTML = ""; return vazio(res, "Digite pelo menos duas medidas."); }
        ult = P.estatistica(vals, { conf: +conf.value, excluir: [...excluir], unidade: un.texto() });
        mostrar(res, ult); desenhar(); chips();
        bts.innerHTML = "";
        if (ult.ok) bts.append(copiarBt("Copiar resultado", ult.texto || ult.resposta), copiarBt("Copiar em LaTeX", ult.latex || ult.resposta));
      }
      dados.addEventListener("input", debounce(calc, 300));
      conf.addEventListener("change", () => calc(true)); un.input.addEventListener("input", debounce(() => calc(true), 300));
      calc();
      return { recalcular: calc };
    },
  });

  // =====================================================================
  // 5. Constantes
  // =====================================================================
  FERR.push({
    id: "constantes", nome: "Constantes",
    resumo: "Constantes físicas do CODATA 2018 e prefixos do SI, prontas para copiar (texto ou LaTeX).",
    teoria: `<p>Desde 2019 o SI é definido fixando o valor <b>exato</b> de sete constantes (c, h, e, k<sub>B</sub>, N<sub>A</sub>, Δν<sub>Cs</sub> e K<sub>cd</sub>). Por isso h, e e N<sub>A</sub> aparecem como “exatas”.</p>
      <p>As demais (como G e a massa do elétron) são medidas e têm incerteza, mostrada entre parênteses na notação concisa: 6,674 30(15) significa ± 0,000 15.</p>`,
    montar(raiz) {
      const busca = campo({ rotulo: "Procurar", ph: "Ex.: Planck, elétron, gases...", tipo: "texto" });
      const cat = seletor([["Todas", "Todas as categorias"], ...P.CATEGORIAS.map((c) => [c, c])], "Todas");
      const lista = el("div", "pq-const");
      const pref = el("details", "rend");
      pref.innerHTML = `<summary>Prefixos do SI</summary><div class="tab-rolar"><table class="tb"><thead><tr><th>Prefixo</th><th>Símbolo</th><th>Fator</th></tr></thead><tbody>${P.PREFIXOS.map((p) => `<tr><td>${p.nome || p[0]}</td><td>${p.sim || p[1]}</td><td>10<sup>${String(p.exp != null ? p.exp : p[2]).replace("-", "−")}</sup></td></tr>`).join("")}</tbody></table></div>`;
      raiz.append(grade(busca, rotulo("Categoria", cat)), lista, pref);
      function pintar() {
        lista.innerHTML = "";
        const cs = P.buscarConstantes(busca.texto(), cat.value);
        if (!cs.length) return lista.appendChild(dicaInicial("Nenhuma constante encontrada."));
        cs.forEach((c) => {
          const f = P.constanteFormatar(c);
          const card = el("div", "form-card pq-c");
          card.innerHTML = `<b>${c.nome}</b><div class="pq-cv-v"><span class="pq-sim">${c.sim}</span> = ${f.valorHTML} <span class="un">${c.un === "(adimensional)" ? "" : c.un}</span></div><small class="dica">Incerteza: ${f.incHTML}${c.extra ? " · " + c.extra : ""}</small>`;
          const bts = el("div", "linha-bt");
          bts.append(copiarBt("Copiar valor", f.valorCodigo), copiarBt("Com unidade", f.comUnidade), copiarBt("LaTeX", f.latex));
          card.appendChild(bts);
          lista.appendChild(card);
        });
      }
      busca.input.addEventListener("input", debounce(pintar, 150));
      cat.addEventListener("change", pintar);
      pintar();
      return {};
    },
  });

  // =====================================================================
  // 6. Tabelas para o relatório
  // =====================================================================
  FERR.push({
    id: "tabela", nome: "Tabelas",
    resumo: "Cole uma tabela da planilha e copie pronta em CSV, LaTeX ou Markdown, com vírgula decimal e casas padronizadas.",
    teoria: `<p>Uma boa tabela de relatório tem: título (legenda) acima, unidade no cabeçalho de cada coluna — “t (s)”, não “t” —, o mesmo número de casas em cada coluna (de acordo com a incerteza) e alinhamento pelos números.</p>`,
    montar(raiz) {
      const dados = area("t (s);x (m)\n0;0,00\n1;4,9\n2;19,6", 6);
      dados.value = "t (s);x (m)\n0;0\n1;4,9\n2;19,6\n3;44,1";
      const formato = seletor([["csv", "CSV (planilha)"], ["latex", "LaTeX (tabular)"], ["markdown", "Markdown"]], "latex");
      const dec = seletor([["virgula", "Vírgula decimal"], ["ponto", "Ponto decimal"]], "virgula");
      const casas = seletor([["manter", "Manter casas"], ["0", "0 casas"], ["1", "1 casa"], ["2", "2 casas"], ["3", "3 casas"], ["4", "4 casas"]], "manter");
      const leg = campo({ rotulo: "Legenda (LaTeX)", ph: "Ex.: Posição em função do tempo", tipo: "texto" });
      const saida = el("pre", "pq-saida");
      const bts = el("div", "linha-bt");
      raiz.append(el("span", "c-rot", "Cole a tabela (colunas separadas por tab, ; ou espaço; 1ª linha = cabeçalho)"), dados, grade(rotulo("Formato", formato), rotulo("Decimal", dec)), grade(rotulo("Casas decimais", casas), leg), saida, bts);
      function calc() {
        const r = P.formatarTabela(dados.value, { formato: formato.value, decimal: dec.value, casas: casas.value, legenda: leg.texto() });
        bts.innerHTML = "";
        if (!r.ok) { saida.textContent = r.erro; return; }
        saida.textContent = r.saida;
        bts.append(copiarBt("Copiar tabela", r.saida));
      }
      dados.addEventListener("input", debounce(calc, 250));
      [formato, dec, casas].forEach((c) => c.addEventListener("change", calc));
      leg.input.addEventListener("input", debounce(calc, 250));
      calc();
      return { recalcular: calc };
    },
  });
})();
