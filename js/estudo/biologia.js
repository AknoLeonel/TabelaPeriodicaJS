/*
 * Estudo: Biologia
 * Genética mendeliana (quadro de Punnett), probabilidade em genética,
 * Hardy-Weinberg, do DNA à proteína e populações / fluxo de energia.
 * As contas ficam no motor (js/estudo/biologia-calc.js, window.BCalc).
 */
(function () {
  "use strict";
  const LAB = window.LAB;
  const B = window.BCalc;
  if (!LAB || !LAB.estudo || !B) return;
  const { el, ui } = LAB;
  const E = LAB.estudo;
  const { campo, grade, mostrar, resultadoBox, dicaInicial, debounce } = E;
  const COR = "#9ccc65";

  E.modulo({
    id: "biologia",
    nome: "Biologia",
    sub: "Genética, DNA e populações: cruzamentos, probabilidades e modelos passo a passo.",
    cor: COR,
    selo: "verificavel",
    icone: '<svg viewBox="0 0 24 24"><path d="M7 3c0 6 10 6 10 12s-10 6-10 6"/><path d="M17 3c0 6-10 6-10 12s10 6 10 6"/><path d="M8.5 6h7M8.5 18h7M10 9.5h4M10 14.5h4"/></svg>',
    motor: B,
    chave: "estudo.b.pontos",
    rodape: "Os cruzamentos são enumerados gameta a gameta e as probabilidades saem em frações exatas. A tradução usa o código genético padrão (tabela 1 do NCBI). Os modelos supõem as condições de livro: genes independentes, acasalamento ao acaso, população grande e parâmetros constantes.",
    nota: {
      real: [
        "Quadros de Punnett montados por enumeração completa dos gametas (até 4 genes), com frações exatas, sem arredondamento.",
        "Herança ligada ao X, sistema ABO (alelos múltiplos e codominância) e fator Rh tratados com as regras usuais da genética humana.",
        "Hardy-Weinberg com teste χ² (1 grau de liberdade, α = 0,05) quando há contagens observadas.",
        "Tradução pelo código genético padrão, com início no primeiro AUG e parada em UAA, UAG ou UGA; mutações classificadas pelo efeito na proteína.",
        "Crescimento exponencial (contínuo e discreto) e logístico de Verhulst com as soluções analíticas exatas.",
      ],
      simplificado: [
        "Genes em cromossomos diferentes (segregação independente): não há ligação gênica nem permutação (crossing-over) entre eles.",
        "Penetrância completa e expressividade constante: quem tem o genótipo mostra o fenótipo.",
        "Hardy-Weinberg ideal: população infinita, sem seleção, mutação, migração nem endogamia.",
        "A regra dos 10% é uma média: a eficiência ecológica real varia de cerca de 2% a 20% conforme o ecossistema e o grupo de organismos.",
        "Splicing, regiões reguladoras e modificações pós-traducionais não são simulados na tradução.",
      ],
    },
  });
  const FERR = E.ferramentas.biologia;

  // ---------- utilidades da interface ----------
  const vazio = (res, txt) => { res.innerHTML = ""; res._r = null; res.appendChild(dicaInicial(txt)); };
  const rotulo = (txt, filho) => { const w = el("label", "campo"); w.append(el("span", "c-rot", txt), filho); return w; };
  const seletor = (opcoes, valor) => { const s = el("select", "sel"); opcoes.forEach(([v, t]) => { const o = el("option", "", t); o.value = v; s.appendChild(o); }); if (valor != null) s.value = valor; return s; };
  const ligar = (cs, fn) => { const d = debounce(fn, 220); cs.forEach((c) => { const i = c.input || c; i.addEventListener(i.tagName === "SELECT" ? "change" : "input", d); }); };
  const exemplos = (lista, fn) => ui.chips({ itens: lista.map((x, i) => ({ id: String(i), rotulo: x.r, titulo: x.t })), onClick: (id) => fn(lista[+id]), cls: "quebra" });
  function subAbas(raiz, itens, montar) {
    const area = el("div", "bio-sub");
    const seg = ui.segmentado({ itens, valor: itens[0].id, onChange: (id) => abrir(id) });
    raiz.append(seg.el, area);
    let api = null;
    function abrir(id) { area.innerHTML = ""; api = montar(id, area) || null; }
    abrir(itens[0].id);
    return { recalcular: () => api && api.recalcular && api.recalcular() };
  }
  const fmt = (v, k = 4) => B.fmt(v, k);
  const SUPL = { D: "ᴰ", d: "ᵈ", H: "ᴴ", h: "ʰ" };

  // =====================================================================
  // 1. Genética mendeliana
  // =====================================================================
  FERR.push({
    id: "genetica", nome: "Cruzamentos", prat: "genetica",
    resumo: "Escreva o cruzamento (ex.: AaBb x AaBb) e veja gametas, quadro de Punnett colorido por fenótipo e as proporções, em frações exatas.",
    teoria: `<p>Cada gene tem <b>dois alelos</b> por indivíduo, um vindo de cada genitor. Na meiose eles se separam e cada gameta leva <b>um</b> (1ª lei de Mendel). Genes em cromossomos diferentes se separam de forma independente (2ª lei).</p>
      <ul><li><b>Dominância completa</b>: AA e Aa têm o mesmo fenótipo. Aa × Aa dá 3 : 1.</li>
      <li><b>Dominância incompleta</b>: o heterozigoto é intermediário; <b>codominância</b>: mostra os dois. Aa × Aa dá 1 : 2 : 1.</li>
      <li><b>Di-híbrido</b> AaBb × AaBb: 9 : 3 : 3 : 1. Para mais genes, cruze gene a gene e multiplique as frações.</li>
      <li><b>Letal</b> em homozigose: a classe some e as frações são recalculadas (o 2 : 1 dos camundongos amarelos).</li></ul>`,
    montar(raiz) {
      const cz = campo({ rotulo: "Cruzamento (genótipo x genótipo)", ph: "Ex.: AaBb x Aabb", tipo: "texto", valor: "AaBb x AaBb" });
      const alvo = campo({ rotulo: "Probabilidade de… (opcional)", ph: "Ex.: aabb, A_bb, Aa", tipo: "texto", valor: "aabb" });
      const her = seletor([["completa", "Dominância completa"], ["incompleta", "Dominância incompleta"], ["codominancia", "Codominância"]], "completa");
      const let_ = seletor([["", "Sem gene letal"], ["dom", "Homozigoto dominante (do 1º gene) é letal"], ["rec", "Homozigoto recessivo (do 1º gene) é letal"]], "");
      let nomes = null;
      const ex = exemplos([
        { r: "Ervilhas Aa × Aa", cz: "Aa x Aa", her: "completa", alvo: "aa", nomes: { A: { dom: "amarela", rec: "verde" } }, t: "Mendel: cor da semente, 3 : 1" },
        { r: "Di-híbrido 9 : 3 : 3 : 1", cz: "AaBb x AaBb", her: "completa", alvo: "aabb" },
        { r: "Cruzamento-teste", cz: "AaBb x aabb", her: "completa", alvo: "A_bb", t: "Cruzar com o duplo recessivo revela os gametas do outro genitor" },
        { r: "Maravilha (incompleta)", cz: "Vv x Vv", her: "incompleta", alvo: "Vv", nomes: { V: { dom: "vermelha", int: "rosa", rec: "branca" } }, t: "Mirabilis jalapa: vermelha, rosa e branca" },
        { r: "Gado (codominância)", cz: "Rr x Rr", her: "codominancia", alvo: "Rr", nomes: { R: { dom: "vermelho", int: "ruão", rec: "branco" } }, t: "Gado shorthorn: o ruão tem pelos vermelhos e brancos misturados" },
        { r: "Letal: camundongo amarelo", cz: "Aa x Aa", her: "completa", letal: "dom", alvo: "Aa", nomes: { A: { dom: "amarelo", rec: "aguti" } }, t: "AA morre no embrião: sobra 2 : 1" },
        { r: "Tri-híbrido", cz: "AaBbCc x AaBbCc", her: "completa", alvo: "A_B_C_" },
      ], (e) => { cz.set(e.cz); her.value = e.her; let_.value = e.letal || ""; alvo.set(e.alvo || ""); nomes = e.nomes || null; calc(); });
      const res = resultadoBox();
      raiz.append(cz.el, el("small", "dica", "Uma letra por gene, maiúscula = dominante. Use “_” no alvo para “qualquer alelo” (A_ = AA ou Aa). Exemplos:"), ex.el,
        grade(rotulo("Tipo de herança", her), rotulo("Gene letal", let_)), alvo.el, res);
      cz.input.addEventListener("input", () => { nomes = null; });
      function quadro(r) {
        const d = el("div", "bio-quadro");
        const leg = `<div class="bio-leg">${r.fenotipos.map((f) => `<span><i class="bio-sw" style="--f:${f.cor}"></i>${f.sim}${f.nome ? ` (${f.nome})` : ""} <b>${B.fT(B.F(f.n, r.total))}</b></span>`).join("")}</div>`;
        if (r.punnett) d.innerHTML = `<h4>Quadro de Punnett <small>${r.totalBruto} casas</small></h4>${r.punnett}${leg}`;
        else d.innerHTML = `<h4>Quadro de Punnett <small>${r.gam1.length} × ${r.gam2.length} = ${r.totalBruto} casas</small></h4><p class="dica-form">Grande demais para desenhar: o passo a passo usa o atalho gene a gene (regra do “e”), que dá o mesmo resultado.</p>${leg}`;
        return d;
      }
      function calc() {
        if (!cz.texto()) return vazio(res, "Escreva o cruzamento, por exemplo Aa x Aa.");
        const r = B.cruzar(cz.texto(), { heranca: her.value, letal: let_.value || null, alvo: alvo.texto(), nomes });
        mostrar(res, r, { extra: quadro });
      }
      ligar([cz, alvo, her, let_], calc); calc();
      return { recalcular: calc };
    },
  });

  // =====================================================================
  // 2. Probabilidade em genética
  // =====================================================================
  const XL = { daltonismo: "D", hemofilia: "H" };
  FERR.push({
    id: "probabilidade", nome: "Probabilidade e heredogramas", prat: "probabilidade",
    resumo: "Chance de um filho afetado (autossômica, ligada ao X), binomial para vários filhos, grupos sanguíneos ABO/Rh e quem doa para quem.",
    teoria: `<p>Genética é probabilidade: cada filho é um sorteio independente.</p>
      <ul><li><b>Regra do “e”</b>: eventos independentes juntos → multiplique (menino <i>e</i> afetado = ½ × ¼).</li>
      <li><b>Regra do “ou”</b>: eventos que se excluem → some (AA <i>ou</i> Aa = ¼ + ½).</li>
      <li><b>Condicional</b>: se já se sabe que a pessoa é normal, o universo encolhe (o 2/3 dos heredogramas).</li>
      <li><b>Binomial</b>: exatamente k em n filhos = C(n, k)·pᵏ·qⁿ⁻ᵏ.</li>
      <li><b>Ligada ao X</b>: o filho homem recebe o X só da mãe; basta um alelo recessivo para ele ser afetado.</li></ul>`,
    montar(raiz) {
      return subAbas(raiz, [{ id: "aut", rotulo: "Autossômica" }, { id: "bin", rotulo: "Binomial" }, { id: "x", rotulo: "Ligada ao X" }, { id: "abo", rotulo: "ABO e Rh" }], (id, a) => {
        const res = resultadoBox();
        if (id === "aut") {
          const gens = [["AA", "AA"], ["Aa", "Aa"], ["aa", "aa"]];
          const p1 = seletor(gens, "Aa"), p2 = seletor(gens, "Aa");
          const cond = seletor([["recessiva", "Doença recessiva (afetado = aa)"], ["dominante", "Doença dominante (afetado = A_)"]], "recessiva");
          const n = campo({ rotulo: "Filhos planejados (opcional)", ph: "Ex.: 4", valor: "" });
          const k = campo({ rotulo: "Quantos afetados (exatamente)", ph: "Ex.: 1", valor: "" });
          const ex = exemplos([
            { r: "Albinismo: Aa × Aa", v: ["Aa", "Aa", "recessiva", "", ""] },
            { r: "Aa × aa", v: ["Aa", "aa", "recessiva", "", ""] },
            { r: "Huntington: Aa × aa", v: ["Aa", "aa", "dominante", "", ""], t: "Doença de Huntington: autossômica dominante" },
            { r: "4 filhos, exatamente 1 afetado", v: ["Aa", "Aa", "recessiva", "4", "1"] },
          ], (e) => { [p1.value, p2.value, cond.value] = e.v; n.set(e.v[3]); k.set(e.v[4]); calc(); });
          a.append(el("small", "dica", "Um gene, dois alelos. Exemplos:"), ex.el, grade(rotulo("Genitor 1", p1), rotulo("Genitor 2", p2)), rotulo("Tipo de herança", cond), grade(n, k), res);
          const calc = () => {
            const nn = n.texto() === "" ? null : Math.round(n.num()), kk = k.texto() === "" ? null : Math.round(k.num());
            mostrar(res, B.autossomico({ p1: p1.value, p2: p2.value, condicao: cond.value, n: nn, k: kk }));
          };
          ligar([p1, p2, cond, n, k], calc); calc();
          return { recalcular: calc };
        }
        if (id === "bin") {
          const n = campo({ rotulo: "n (número de filhos)", ph: "Ex.: 4", valor: "4" });
          const k = campo({ rotulo: "k (quantos com a característica)", ph: "Ex.: 2", valor: "1" });
          const p = campo({ rotulo: "p (chance em cada filho)", ph: "Ex.: 1/4, 0,25 ou 25%", tipo: "texto", valor: "1/4" });
          const modo = seletor([["exato", "Exatamente k"], ["pelomenos", "Pelo menos k"]], "exato");
          const ex = exemplos([
            { r: "1 afetado em 4 (p = 1/4)", v: ["4", "1", "1/4", "exato"] },
            { r: "Pelo menos 1 em 3", v: ["3", "1", "1/4", "pelomenos"] },
            { r: "2 meninos e 2 meninas", v: ["4", "2", "1/2", "exato"], t: "k = 2 meninas em 4, com p = 1/2" },
            { r: "3 filhos, todos normais", v: ["3", "3", "3/4", "exato"] },
          ], (e) => { n.set(e.v[0]); k.set(e.v[1]); p.set(e.v[2]); modo.value = e.v[3]; calc(); });
          a.append(el("small", "dica", "Para vários filhos independentes. Exemplos:"), ex.el, grade(n, k), grade(p, rotulo("Pergunta", modo)), res);
          const calc = () => {
            if (n.texto() === "" || k.texto() === "" || !p.texto()) return vazio(res, "Preencha n, k e p.");
            mostrar(res, B.binomial({ n: n.num(), k: k.num(), p: p.texto(), modo: modo.value }));
          };
          ligar([n, k, p, modo], calc); calc();
          return { recalcular: calc };
        }
        if (id === "x") {
          const doenca = seletor([["daltonismo", "Daltonismo"], ["hemofilia", "Hemofilia A"]], "daltonismo");
          const mae = seletor([], null), pai = seletor([], null);
          const opcoes = () => {
            const L = XL[doenca.value], l = L.toLowerCase(), X = (a) => "X" + SUPL[a];
            const vm = mae.value || "Dd", vp = pai.value || "D";
            mae.innerHTML = ""; pai.innerHTML = "";
            [["DD", `${X(L)}${X(L)} normal`], ["Dd", `${X(L)}${X(l)} portadora`], ["dd", `${X(l)}${X(l)} afetada`]].forEach(([v, t]) => { const o = el("option", "", t); o.value = v; mae.appendChild(o); });
            [["D", `${X(L)}Y normal`], ["d", `${X(l)}Y afetado`]].forEach(([v, t]) => { const o = el("option", "", t); o.value = v; pai.appendChild(o); });
            mae.value = vm; pai.value = vp;
          };
          opcoes();
          const ex = exemplos([
            { r: "Portadora × normal", v: ["daltonismo", "Dd", "D"] },
            { r: "Portadora × daltônico", v: ["daltonismo", "Dd", "d"] },
            { r: "Normal × hemofílico", v: ["hemofilia", "DD", "d"], t: "Todas as filhas serão portadoras; nenhum filho afetado" },
            { r: "Afetada × normal", v: ["daltonismo", "dd", "D"] },
          ], (e) => { doenca.value = e.v[0]; opcoes(); mae.value = e.v[1]; pai.value = e.v[2]; calc(); });
          doenca.addEventListener("change", opcoes);
          a.append(el("small", "dica", "Herança recessiva ligada ao X. Exemplos:"), ex.el, rotulo("Doença", doenca), grade(rotulo("Mãe", mae), rotulo("Pai", pai)), res);
          const calc = () => mostrar(res, B.ligadoX({ mae: mae.value, pai: pai.value, doenca: doenca.value }));
          ligar([doenca, mae, pai], calc); calc();
          return { recalcular: calc };
        }
        // ABO e Rh
        const GA = Object.keys(B.ABO_GEN).map((g) => [g, `${g.replace(/IA/g, "Iᴬ").replace(/IB/g, "Iᴮ")} (tipo ${({ IAIA: "A", IAi: "A", IBIB: "B", IBi: "B", IAIB: "AB", ii: "O" })[g]})`]);
        const p1 = seletor(GA, "IAi"), p2 = seletor(GA, "IBi");
        const RH = [["", "Não considerar"], ["RR", "RR (Rh⁺)"], ["Rr", "Rr (Rh⁺)"], ["rr", "rr (Rh⁻)"]];
        const r1 = seletor(RH, ""), r2 = seletor(RH, "");
        const ex = exemplos([
          { r: "Iᴬi × Iᴮi (os 4 tipos)", v: ["IAi", "IBi", "", ""] },
          { r: "IᴬIᴮ × ii", v: ["IAIB", "ii", "", ""], t: "Pai AB e mãe O: nenhum filho será AB nem O" },
          { r: "Iᴬi × Iᴬi", v: ["IAi", "IAi", "", ""] },
          { r: "Com Rh: Iᴬi Rr × Iᴮi rr", v: ["IAi", "IBi", "Rr", "rr"] },
        ], (e) => { [p1.value, p2.value, r1.value, r2.value] = e.v; calc(); });
        a.append(el("small", "dica", "Sistema ABO (alelos Iᴬ, Iᴮ, i) e, se quiser, o fator Rh. Exemplos:"), ex.el, grade(rotulo("Genitor 1 (ABO)", p1), rotulo("Genitor 2 (ABO)", p2)), grade(rotulo("Genitor 1 (Rh)", r1), rotulo("Genitor 2 (Rh)", r2)), res);
        const calc = () => {
          if (!!r1.value !== !!r2.value) return mostrar(res, { ok: false, erro: "Para incluir o Rh, escolha o genótipo Rh dos dois genitores (ou “Não considerar” nos dois)." });
          mostrar(res, B.abo({ p1: p1.value, p2: p2.value, rh1: r1.value, rh2: r2.value }));
        };
        ligar([p1, p2, r1, r2], calc); calc();
        return { recalcular: calc };
      });
    },
  });

  // =====================================================================
  // 3. Hardy-Weinberg
  // =====================================================================
  FERR.push({
    id: "hardy", nome: "Hardy-Weinberg", prat: "hardy",
    resumo: "Das frequências dos alelos às dos genótipos (p² + 2pq + q² = 1), portadores numa população e teste χ² de equilíbrio.",
    teoria: `<p>Numa população grande, com cruzamentos ao acaso e sem forças evolutivas, as frequências dos alelos (p para A, q para a) <b>não mudam</b> de geração em geração, e as dos genótipos ficam:</p>
      <div class="eq">p² (AA) + 2pq (Aa) + q² (aa) = 1</div>
      <ul><li>Comece pelos recessivos: q² é a fração de afetados, então q = √(q²).</li>
      <li>Portadores = 2pq: para alelos raros, há muito mais portadores que afetados.</li>
      <li>Com contagens reais, conte <b>alelos</b> (p = (2·AA + Aa)/2N) e compare observado com esperado (χ²).</li></ul>`,
    montar(raiz) {
      let modo = "q2";
      const seg = ui.segmentado({ itens: [{ id: "q2", rotulo: "Afetados (q²)" }, { id: "q", rotulo: "Alelo q" }, { id: "p", rotulo: "Alelo p" }, { id: "contagens", rotulo: "Contagens" }], valor: modo, onChange: (v) => { modo = v; vis(); calc(); } });
      const valor = campo({ rotulo: "Frequência de afetados (aa)", ph: "Ex.: 1/2500, 0,04 ou 4%", tipo: "texto", valor: "1/2500" });
      const N = campo({ rotulo: "Tamanho da população (opcional)", ph: "Ex.: 200000", valor: "200000" });
      const AA = campo({ rotulo: "AA observados", ph: "Ex.: 360", valor: "360" }), Aa = campo({ rotulo: "Aa observados", ph: "Ex.: 480", valor: "480" }), aa = campo({ rotulo: "aa observados", ph: "Ex.: 160", valor: "160" });
      const ex = exemplos([
        { r: "Fibrose cística (1 em 2500)", m: "q2", v: "1/2500", N: "200000", t: "Frequência aproximada em populações de origem europeia" },
        { r: "Fenilcetonúria (1 em 10 000)", m: "q2", v: "1/10000", N: "1000000", t: "Ordem de grandeza em populações europeias; no Brasil é mais rara" },
        { r: "q = 0,3", m: "q", v: "0,3", N: "" },
        { r: "Amostra em equilíbrio", m: "contagens", c: ["360", "480", "160"] },
        { r: "Amostra fora do equilíbrio", m: "contagens", c: ["500", "300", "200"], t: "Falta de heterozigotos: típico de endogamia" },
      ], (e) => { modo = e.m; seg.set(modo); if (e.c) { AA.set(e.c[0]); Aa.set(e.c[1]); aa.set(e.c[2]); } else { valor.set(e.v); N.set(e.N); } vis(); calc(); });
      const gr = E.grafico({ modo: "dados", rotX: "p (frequência de A)", rotY: "frequência", altura: (w) => Math.round(Math.min(Math.max(w * 0.5, 220), 300)), aria: "Frequências dos genótipos em função de p" });
      const res = resultadoBox();
      const gValor = grade(valor, N), gCont = el("div", "campos bio-3"); gCont.append(AA.el, Aa.el, aa.el);
      raiz.append(seg.el, el("small", "dica", "Exemplos:"), ex.el, gValor, gCont, gr.el, res);
      function vis() {
        const c = modo === "contagens";
        gValor.hidden = c; gCont.hidden = !c;
        valor.el.querySelector(".c-rot").textContent = modo === "q2" ? "Frequência de afetados (aa)" : modo === "q" ? "Frequência q do alelo recessivo (a)" : "Frequência p do alelo dominante (A)";
        valor.input.placeholder = modo === "q2" ? "Ex.: 1/2500, 0,04 ou 4%" : "Ex.: 0,3";
      }
      function desenhar(r) {
        const cAA = "#4da3ff", cAa = COR, caa = "#f0a23c";
        gr.definir({ x: [0, 1], y: [0, 1.08], nomeX: "p", rotX: "p (frequência de A)", rotY: "frequência", series: [
          { tipo: "funcao", f: (p) => p * p, rotulo: "AA = p²", cor: cAA },
          { tipo: "funcao", f: (p) => 2 * p * (1 - p), rotulo: "Aa = 2pq", cor: cAa },
          { tipo: "funcao", f: (p) => (1 - p) * (1 - p), rotulo: "aa = q²", cor: caa },
          { tipo: "vline", v: r.p, cor: "rgba(155,167,182,.6)", tracejado: true, largura: 1, legenda: false },
          { tipo: "texto", x: Math.min(Math.max(r.p, 0.1), 0.9), y: 1.04, texto: `p = ${fmt(r.p, 3)}`, cor: "#9ba7b6" },
          { tipo: "marca", x: r.p, y: r.fAA, cor: cAA },
          { tipo: "marca", x: r.p, y: r.fAa, cor: cAa },
          { tipo: "marca", x: r.p, y: r.faa, cor: caa },
        ] });
      }
      function calc() {
        let r;
        if (modo === "contagens") {
          if ([AA, Aa, aa].some((c) => c.texto() === "")) { gr.esconder(); return vazio(res, "Informe as três contagens."); }
          r = B.hardy({ modo, AA: AA.num(), Aa: Aa.num(), aa: aa.num() });
        } else {
          if (!valor.texto()) { gr.esconder(); return vazio(res, "Informe a frequência."); }
          r = B.hardy({ modo, valor: valor.texto(), N: N.texto() });
        }
        mostrar(res, r);
        if (r.ok) desenhar(r); else gr.esconder();
      }
      vis();
      ligar([valor, N, AA, Aa, aa], calc); calc();
      return { recalcular: calc };
    },
  });

  // =====================================================================
  // 4. Do DNA à proteína
  // =====================================================================
  FERR.push({
    id: "dna", nome: "Do DNA à proteína", prat: "dna",
    resumo: "Digite uma sequência: fita complementar, transcrição em RNAm, códons, anticódons, aminoácidos e o efeito de uma mutação.",
    teoria: `<p>O DNA guarda a informação; o RNAm a leva ao ribossomo; o ribossomo a traduz em proteína.</p>
      <ul><li><b>Pareamento</b>: A–T e C–G no DNA; no RNA, U entra no lugar de T.</li>
      <li><b>Transcrição</b>: a RNA-polimerase lê a fita molde (3'→5') e faz o RNAm (5'→3'), igual à fita codificante com U no lugar de T.</li>
      <li><b>Tradução</b>: começa no primeiro AUG (metionina), segue de 3 em 3 bases e para em UAA, UAG ou UGA.</li>
      <li><b>Mutações</b>: silenciosa, de sentido trocado, sem sentido (vira parada) ou deslocamento do quadro de leitura.</li></ul>`,
    montar(raiz) {
      const seq = campo({ rotulo: "Sequência (5'→3' para codificante e RNAm; 3'→5' para a fita molde)", ph: "Ex.: TACGGTCAAGCTATT", tipo: "texto", valor: "TACGGTCAAGCTATT" });
      const tipo = seletor([["molde", "Fita molde de DNA (3'→5')"], ["codificante", "Fita codificante de DNA (5'→3')"], ["rna", "RNAm (5'→3')"]], "molde");
      const quadro = seletor([["aug", "A partir do 1º AUG"], ["0", "Quadro +1 (desde a 1ª base)"], ["1", "Quadro +2"], ["2", "Quadro +3"]], "aug");
      const mt = seletor([["nenhuma", "Nenhuma"], ["sub", "Substituição de uma base"], ["ins", "Inserção"], ["del", "Deleção"]], "nenhuma");
      const pos = campo({ rotulo: "Posição (1 = primeira base)", ph: "Ex.: 10", valor: "10" });
      const base = campo({ rotulo: "Base nova", ph: "Ex.: A", tipo: "texto", valor: "A" });
      const nDel = campo({ rotulo: "Quantas bases saem", ph: "Ex.: 1", valor: "1" });
      const ex = exemplos([
        { r: "Molde simples", v: ["TACGGTCAAGCTATT", "molde", "aug", "nenhuma"] },
        { r: "RNAm com região 5' não traduzida", v: ["GCCAUGGCUUGGAAAUAG", "rna", "aug", "nenhuma"] },
        { r: "Anemia falciforme (Glu → Val)", v: ["ATGGTGCATCTGACTCCTGAGGAGAAGTCT", "codificante", "aug", "sub", "20", "T"], t: "Início do gene da β-globina (HBB): GAG → GTG no 6º aminoácido da proteína madura" },
        { r: "Mutação silenciosa", v: ["TACGGTCAAGCTATT", "molde", "aug", "sub", "6", "C"] },
        { r: "Mutação sem sentido", v: ["TACGGTCAAGCTATT", "molde", "aug", "sub", "10", "A"] },
        { r: "Deleção (frameshift)", v: ["TACGGTCAAGCTATT", "molde", "aug", "del", "5", "", "1"] },
      ], (e) => { seq.set(e.v[0]); tipo.value = e.v[1]; quadro.value = e.v[2]; mt.value = e.v[3]; if (e.v[4]) pos.set(e.v[4]); if (e.v[5] != null) base.set(e.v[5]); if (e.v[6]) nDel.set(e.v[6]); vis(); calc(); });
      const gMut = el("div", "campos bio-3"); gMut.append(pos.el, base.el, nDel.el);
      const res = resultadoBox();
      raiz.append(seq.el, el("small", "dica", "Espaços, números e as marcas 5' e 3' são ignorados. Exemplos:"), ex.el, grade(rotulo("A sequência é", tipo), rotulo("Leitura", quadro)), rotulo("Mutação", mt), gMut, res);
      function vis() {
        gMut.hidden = mt.value === "nenhuma";
        base.el.hidden = mt.value === "del";
        nDel.el.hidden = mt.value !== "del";
      }
      function extra(r) {
        const d = el("div", "bio-dna");
        d.innerHTML = r.linhas;
        const det = el("details", "bio-det");
        det.innerHTML = `<summary>Tabela do código genético <small>(códons usados destacados)</small></summary>${B.tabelaCodigo(r.cods.map((x) => x.c))}`;
        d.appendChild(det);
        return d;
      }
      function calc() {
        if (!seq.texto()) return vazio(res, "Digite uma sequência de bases.");
        const m = mt.value === "nenhuma" ? null : { tipo: mt.value, pos: pos.num(), base: base.texto(), n: nDel.num() };
        mostrar(res, B.dna({ seq: seq.texto(), tipo: tipo.value, quadro: quadro.value === "aug" ? "aug" : +quadro.value, mut: m }), { extra });
      }
      vis();
      mt.addEventListener("change", vis);
      ligar([seq, tipo, quadro, mt, pos, base, nDel], calc); calc();
      return { recalcular: calc };
    },
  });

  // =====================================================================
  // 5. Populações e energia
  // =====================================================================
  FERR.push({
    id: "populacoes", nome: "Populações e energia", prat: "populacoes",
    resumo: "Crescimento exponencial × logístico com gráfico, tempo de duplicação e pirâmide de energia pela regra dos 10%.",
    teoria: `<p><b>Exponencial</b>: sem limites, N(t) = N₀·e<sup>rt</sup>; o tempo de duplicação é constante, t<sub>d</sub> = ln 2 / r.</p>
      <p><b>Logístico</b>: a capacidade de suporte K freia o crescimento, dN/dt = rN(1 − N/K); a curva tem forma de S e o crescimento é máximo em N = K/2.</p>
      <p><b>Energia</b>: de um nível trófico ao seguinte passa, em média, cerca de 10% da energia; o resto se perde principalmente como calor da respiração.</p>`,
    montar(raiz) {
      return subAbas(raiz, [{ id: "cresc", rotulo: "Crescimento" }, { id: "energia", rotulo: "Pirâmide de energia" }], (id, a) => {
        const res = resultadoBox();
        if (id === "cresc") {
          let modelo = "log";
          const seg = ui.segmentado({ itens: [{ id: "exp", rotulo: "Exponencial" }, { id: "disc", rotulo: "Gerações discretas" }, { id: "log", rotulo: "Logístico" }], valor: modelo, onChange: (v) => { modelo = v; vis(); calc(); } });
          const N0 = campo({ rotulo: "N₀ (população inicial)", ph: "Ex.: 50", valor: "50" });
          const r = campo({ rotulo: "r (taxa por unidade de tempo)", ph: "Ex.: 0,5", valor: "0,5" });
          const t = campo({ rotulo: "t (tempo)", ph: "Ex.: 10", valor: "10" });
          const K = campo({ rotulo: "K (capacidade de suporte)", ph: "Ex.: 1000", valor: "1000" });
          const ex = exemplos([
            { r: "Bactérias (exponencial)", m: "exp", v: ["100", "0,7", "10", ""], t: "r = 0,7 por hora: duplica a cada ~1 h" },
            { r: "População humana (1% ao ano)", m: "exp", v: ["8000000000", "0,01", "50", ""] },
            { r: "Aves (1 ninhada por ano)", m: "disc", v: ["80", "0,25", "5", ""] },
            { r: "Leveduras num frasco (logístico)", m: "log", v: ["10", "0,5", "15", "650"] },
            { r: "Peixes num lago", m: "log", v: ["200", "0,3", "20", "5000"] },
          ], (e) => { modelo = e.m; seg.set(modelo); N0.set(e.v[0]); r.set(e.v[1]); t.set(e.v[2]); if (e.v[3]) K.set(e.v[3]); vis(); calc(); });
          const gr = E.grafico({ modo: "dados", rotX: "tempo", rotY: "N", altura: (w) => Math.round(Math.min(Math.max(w * 0.5, 220), 320)), aria: "Curvas de crescimento populacional" });
          a.append(seg.el, el("small", "dica", "Use a mesma unidade de tempo em r e em t. Exemplos:"), ex.el, grade(N0, r), grade(t, K), gr.el, res);
          function vis() { K.el.hidden = modelo !== "log"; }
          function calc() {
            if ([N0, r, t].some((c) => c.texto() === "") || (modelo === "log" && K.texto() === "")) { gr.esconder(); return vazio(res, "Preencha N₀, r e t (e K no logístico)."); }
            const o = { modelo, N0: N0.num(), r: r.num(), t: t.num(), K: K.num() };
            const R0 = B.crescimento(o);
            mostrar(res, R0);
            if (!R0.ok) return gr.esconder();
            const tf = Math.max(o.t * 1.25, 1e-9);
            const series = [];
            if (modelo === "log") {
              // janela até a curva chegar a ~99% de K (ou o tempo pedido, se for maior)
              const t99 = o.K > o.N0 ? Math.log((99 * (o.K - o.N0)) / o.N0) / o.r : 5 / o.r;
              const tt = Math.max(t99, o.t * 1.15);
              const lim = Math.max(o.K, o.N0) * 1.6;
              series.push(
                { tipo: "funcao", f: (x) => { const v = B.Nexp(o.N0, o.r, x); return v <= lim ? v : NaN; }, rotulo: "exponencial (sem limite)", cor: "#f0a23c", tracejado: true },
                { tipo: "funcao", f: (x) => B.Nlog(o.N0, o.r, o.K, x), rotulo: "logístico", cor: COR },
                { tipo: "hline", v: o.K, cor: "rgba(155,167,182,.7)", tracejado: true, largura: 1, rotulo: `K = ${fmt(o.K)}`, legenda: false },
                { tipo: "hline", v: o.K / 2, cor: "rgba(155,167,182,.35)", tracejado: true, largura: 1, rotulo: "K/2", legenda: false },
                { tipo: "marca", x: o.t, y: R0.N, cor: COR, rotulo: `N(${fmt(o.t)}) = ${fmt(R0.N)}` },
              );
              gr.definir({ x: [0, tt], y: [0, Math.max(o.K, o.N0) * 1.12], nomeX: "t", nomeY: "N", rotX: "tempo", rotY: "N", series });
            } else {
              const fn = modelo === "exp" ? (x) => B.Nexp(o.N0, o.r, x) : (x) => B.Ndisc(o.N0, o.r, x);
              if (modelo === "disc") {
                const pts = []; for (let i = 0; i <= Math.ceil(tf) && i <= 200; i++) pts.push([i, B.Ndisc(o.N0, o.r, i)]);
                series.push({ tipo: "pontos", pts, rotulo: "N a cada geração", cor: COR });
              } else series.push({ tipo: "funcao", f: fn, rotulo: "N(t) = N₀·e^(rt)", cor: COR });
              if (R0.td && R0.td < tf) series.push({ tipo: "hline", v: 2 * o.N0, cor: "rgba(155,167,182,.55)", tracejado: true, largura: 1, rotulo: `2N₀ (t = ${fmt(R0.td, 3)})`, legenda: false });
              series.push({ tipo: "marca", x: o.t, y: R0.N, cor: COR, rotulo: `N(${fmt(o.t)}) = ${fmt(R0.N)}` });
              const ys = [o.N0, fn(tf)];
              gr.definir({ x: [0, tf], y: [0, Math.max(...ys) * 1.08], nomeX: "t", nomeY: "N", rotX: "tempo", rotY: "N", series });
            }
          }
          vis();
          ligar([N0, r, t, K], calc); calc();
          return { recalcular: calc };
        }
        // pirâmide de energia
        const E0 = campo({ rotulo: "Energia fixada pelos produtores", ph: "Ex.: 10000", valor: "20000", sufixo: "kcal/m²·ano" });
        const nv = seletor([2, 3, 4, 5, 6].map((x) => [String(x), `${x} níveis tróficos`]), "4");
        const ef = campo({ rotulo: "Eficiência entre níveis", ph: "Ex.: 10", valor: "10", sufixo: "%" });
        const ex = exemplos([
          { r: "Regra dos 10% (4 níveis)", v: ["20000", "4", "10"] },
          { r: "Floresta: 5 níveis", v: ["50000", "5", "10"] },
          { r: "Ambiente aquático (20%)", v: ["10000", "4", "20"], t: "Em cadeias aquáticas a eficiência costuma ser maior" },
          { r: "Eficiência baixa (2%)", v: ["100000", "3", "2"] },
        ], (e) => { E0.set(e.v[0]); nv.value = e.v[1]; ef.set(e.v[2]); calc(); });
        a.append(el("small", "dica", "Exemplos:"), ex.el, E0.el, grade(rotulo("Níveis", nv), ef), res);
        function piramide(r) {
          const d = el("div", "bio-pir");
          const E1 = r.lista[0].E;
          d.innerHTML = `<h4>Pirâmide de energia <small>largura proporcional à energia</small></h4>` + r.lista.slice().reverse().map((x, i, arr) => {
            const w = Math.max((x.E / E1) * 100, 1.2);
            return `<div class="bio-pir-l"><span class="bio-pir-n">${arr.length - i}. ${x.nome}</span><span class="bio-pir-b"><i style="width:${w}%"></i></span><b>${fmt(x.E)}</b></div>`;
          }).join("");
          return d;
        }
        const calc = () => {
          if (E0.texto() === "" || ef.texto() === "") return vazio(res, "Informe a energia dos produtores e a eficiência.");
          mostrar(res, B.energia({ E0: E0.num(), niveis: +nv.value, efic: ef.num() }), { extra: piramide });
        };
        ligar([E0, nv, ef], calc); calc();
        return { recalcular: calc };
      });
    },
  });
})();
