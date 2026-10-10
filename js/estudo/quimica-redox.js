/*
 * Estudo: Química — número de oxidação, oxirredução, equações iônicas e eletroquímica.
 * As ferramentas entram na lista da Química (as abas aparecem sozinhas).
 */
(function () {
  "use strict";
  const LAB = window.LAB;
  const Q = window.QCalc;
  const X = window.QRedox;
  if (!LAB || !Q || !X) return;
  const { el, ui } = LAB;
  const E = LAB.estudo;
  const { campo, grade, mostrar, resultadoBox, dicaInicial, debounce } = E;
  const FERR = (E.ferramentas.quimica = E.ferramentas.quimica || []);

  // prática: tipos próprios (com grupos sorteados)
  const GRUPOS = { redox: ["nox", "nox", "redox-e"], eletroq: ["pilha", "faraday"] };
  const anterior = Q.gerarExercicio;
  Q.gerarExercicio = (t) => {
    if (GRUPOS[t]) t = GRUPOS[t][Math.floor(Math.random() * GRUPOS[t].length)];
    return X.TIPOS.includes(t) ? X.gerarExercicio(t) : anterior(t);
  };

  const n = (c) => { const t = c.texto(); return t === "" ? null : Q.lerNumero(t); };
  const vazio = (res, txt) => { res.innerHTML = ""; res._r = null; res.appendChild(dicaInicial(txt)); };
  const rotulo = (txt, filho) => { const w = el("label", "campo"); w.append(el("span", "c-rot", txt), filho); return w; };
  const exemplos = (lista, fn) => ui.chips({ itens: lista.map((x, i) => ({ id: String(i), rotulo: x.r })), onClick: (id) => fn(lista[+id]) });
  const ligar = (cs, fn) => { const d = debounce(fn, 220); cs.forEach((c) => { const i = c.input || c; i.addEventListener(i.tagName === "SELECT" ? "change" : "input", d); if (c.sel) c.sel.addEventListener("change", d); }); };
  function subAbas(raiz, itens, montar) {
    const area = el("div", "est-sub");
    const seg = ui.segmentado({ itens, valor: itens[0].id, onChange: (id) => abrir(id) });
    raiz.append(seg.el, area);
    let api = null;
    function abrir(id) { area.innerHTML = ""; api = montar(id, area) || null; }
    abrir(itens[0].id);
    return { recalcular: () => api && api.recalcular && api.recalcular() };
  }
  const teclado = (inp, simbolos, aoMudar) => {
    const t = el("div", "teclado teclado-rola");
    simbolos.forEach((s) => {
      const b = el("button"); b.type = "button"; b.textContent = s;
      b.addEventListener("click", () => { const i = inp.selectionStart ?? inp.value.length; const ins = s === "→" ? " -> " : s === "+" ? " + " : s; inp.value = inp.value.slice(0, i) + ins + inp.value.slice(i); inp.focus(); aoMudar(); });
      t.appendChild(b);
    });
    return t;
  };
  const opcoesPot = (sel, filtro) => { X.POT.filter(filtro || (() => true)).forEach((s) => { const o = el("option", "", `${s.nome} — E° = ${String(s.E).replace(".", ",")} V`); o.value = s.id; sel.appendChild(o); }); };

  // =====================================================================
  // 1. Nox e oxirredução
  // =====================================================================
  FERR.push({
    id: "redox", nome: "Nox e redox", prat: "redox",
    resumo: "Número de oxidação de cada elemento e análise de reações de oxirredução: quem oxida, quem reduz, elétrons e balanceamento (inclusive em meio ácido ou básico).",
    teoria: `<p>O <b>número de oxidação (Nox)</b> é a carga que o átomo teria se todas as ligações fossem iônicas. Regras na ordem de prioridade:</p>
      <ul><li>Substância simples: 0. Íon simples: a própria carga.</li>
      <li>Metais alcalinos +1; alcalinoterrosos +2; F −1; H +1 (−1 nos hidretos metálicos); O −2 (−1 nos peróxidos).</li>
      <li>A soma dos Nox é zero (ou a carga do íon).</li></ul>
      <p><b>Oxidação</b> = perda de elétrons (Nox aumenta). <b>Redução</b> = ganho (Nox diminui). O <b>agente oxidante</b> é quem se reduz; o <b>redutor</b> é quem se oxida.</p>
      <p>Balancear: o total de elétrons perdidos = total ganho. Em meio ácido completa-se com H₂O e H⁺; em meio básico, com H₂O e OH⁻.</p>
      <p>Escreva cargas com ^: <b>Fe^3+</b>, <b>MnO4^-</b>, <b>SO4^2-</b>.</p>`,
    montar(raiz) {
      return subAbas(raiz, [{ id: "nox", rotulo: "Nox" }, { id: "eq", rotulo: "Reação redox" }], (id, a) => {
        if (id === "nox") {
          const f = campo({ rotulo: "Substância ou íon", ph: "Ex.: KMnO4, SO4^2-, NH4^+", tipo: "texto", valor: "K2Cr2O7" });
          const tec = teclado(f.input, ["^", "+", "-", "2-", "3+", "(", ")"], () => calc());
          const ex = exemplos(["KMnO4", "H2SO4", "SO4^2-", "NH4^+", "H2O2", "NaH", "Fe3O4", "Cr2O7^2-", "Fe2(SO4)3"].map((x) => ({ r: x.replace("^", ""), f: x })), (e) => { f.set(e.f); calc(); });
          const res = resultadoBox();
          a.append(f.el, tec, el("small", "dica", "Exemplos:"), ex.el, res);
          const calc = () => (!f.texto() ? vazio(res, "Digite uma fórmula (com carga, se for íon).") : mostrar(res, X.nox(f.texto())));
          ligar([f], calc); calc();
          return { recalcular: calc };
        }
        const f = campo({ rotulo: "Equação (pode estar sem coeficientes)", ph: "Ex.: Zn + Cu^2+ -> Zn^2+ + Cu", tipo: "texto", valor: "MnO4^- + Fe^2+ -> Mn^2+ + Fe^3+" });
        const tec = teclado(f.input, ["→", "+", "^", "2+", "3+", "-", "2-"], () => calc());
        let meio = "auto";
        const seg = ui.segmentado({ itens: [{ id: "auto", rotulo: "Meio: automático" }, { id: "acido", rotulo: "Ácido (H⁺)" }, { id: "basico", rotulo: "Básico (OH⁻)" }], valor: "auto", onChange: (v) => { meio = v; calc(); } });
        const ex = exemplos([
          { r: "Pilha de Daniell", e: "Zn + Cu^2+ -> Zn^2+ + Cu" }, { r: "Permanganato + Fe²⁺", e: "MnO4^- + Fe^2+ -> Mn^2+ + Fe^3+" }, { r: "Dicromato + Fe²⁺", e: "Cr2O7^2- + Fe^2+ -> Cr^3+ + Fe^3+" },
          { r: "KMnO₄ + HCl", e: "KMnO4 + HCl -> KCl + MnCl2 + Cl2 + H2O" }, { r: "Cobre + ácido nítrico", e: "Cu + HNO3 -> Cu(NO3)2 + NO + H2O" }, { r: "Ferrugem", e: "Fe + O2 -> Fe2O3" }, { r: "MnO₄⁻ + I⁻ (básico)", e: "MnO4^- + I^- -> MnO2 + I2", m: "basico" },
        ], (e) => { f.set(e.e); if (e.m) { meio = e.m; seg.set(e.m); } calc(); });
        const res = resultadoBox();
        a.append(f.el, tec, el("small", "dica", "Exemplos:"), ex.el, seg.el, res);
        const calc = () => (!f.texto() ? vazio(res, "Digite a equação.") : mostrar(res, X.redox({ eq: f.texto(), meio })));
        ligar([f], calc); calc();
        return { recalcular: calc };
      });
    },
  });

  // =====================================================================
  // 2. Equações iônicas
  // =====================================================================
  FERR.push({
    id: "ionica", nome: "Iônicas", prat: "ionica",
    resumo: "Reações em solução aquosa (dupla troca, neutralização, precipitação): produtos, equação molecular, iônica completa e iônica simplificada.",
    teoria: `<p>Em água, sais solúveis, ácidos fortes e bases fortes ficam <b>separados em íons</b>. Uma reação só acontece de verdade se algo “sai” da solução:</p>
      <ul><li>um <b>precipitado</b> (sólido insolúvel, ex.: AgCl);</li><li>um <b>gás</b> (CO₂, H₂S, NH₃);</li><li><b>água</b> ou outro eletrólito fraco (neutralização).</li></ul>
      <p>Na <b>equação iônica simplificada</b> riscamos os <b>íons espectadores</b> (aparecem iguais dos dois lados). Ex.: Ag⁺ + Cl⁻ → AgCl(s).</p>
      <p><b>Regras de solubilidade</b> (resumo): sais de Na⁺, K⁺, NH₄⁺ e nitratos/acetatos são solúveis; cloretos solúveis exceto Ag⁺, Pb²⁺, Hg₂²⁺; sulfatos solúveis exceto Ca²⁺, Sr²⁺, Ba²⁺, Pb²⁺; carbonatos, fosfatos, sulfetos e hidróxidos geralmente insolúveis (exceto grupo 1 e NH₄⁺).</p>`,
    montar(raiz) {
      const f = campo({ rotulo: "Reagentes (dois compostos)", ph: "Ex.: AgNO3 + NaCl", tipo: "texto", valor: "AgNO3 + NaCl" });
      const tec = teclado(f.input, ["+", "(", ")"], () => calc());
      const ex = exemplos([
        { r: "AgNO₃ + NaCl", e: "AgNO3 + NaCl" }, { r: "HCl + NaOH", e: "HCl + NaOH" }, { r: "BaCl₂ + Na₂SO₄", e: "BaCl2 + Na2SO4" }, { r: "CaCO₃ + HCl", e: "CaCO3 + HCl" },
        { r: "Pb(NO₃)₂ + KI", e: "Pb(NO3)2 + KI" }, { r: "FeCl₃ + NaOH", e: "FeCl3 + NaOH" }, { r: "NH₄Cl + NaOH", e: "NH4Cl + NaOH" }, { r: "KNO₃ + NaCl", e: "KNO3 + NaCl" },
      ], (e) => { f.set(e.e); calc(); });
      const res = resultadoBox();
      raiz.append(f.el, tec, el("small", "dica", "Exemplos:"), ex.el, res);
      const calc = () => (!f.texto() ? vazio(res, "Digite os dois reagentes.") : mostrar(res, X.ionica({ reagentes: f.texto() })));
      ligar([f], calc); calc();
      return { recalcular: calc };
    },
  });

  // =====================================================================
  // 3. Eletroquímica
  // =====================================================================
  FERR.push({
    id: "eletroq", nome: "Eletroquímica", prat: "eletroq",
    resumo: "Pilhas (cátodo, ânodo, reação global, E°, ΔG°, K e Nernst), eletrólise pela lei de Faraday e tabela de potenciais.",
    teoria: `<p>Numa <b>pilha</b> a reação redox espontânea gera corrente. Quem tem <b>maior potencial de redução</b> (E°) se reduz no <b>cátodo</b> (+); o outro se oxida no <b>ânodo</b> (−). Os elétrons vão do ânodo para o cátodo pelo fio.</p>
      <div class="eq">E°<sub>pilha</sub> = E°<sub>cátodo</sub> − E°<sub>ânodo</sub> &nbsp;&nbsp; ΔG° = −n·F·E°</div>
      <ul><li>E° &gt; 0 → espontânea. Não multiplique o E° quando multiplicar a semirreação.</li>
      <li><b>Nernst</b> (25 °C): E = E° − (0,0592/n)·log Q.</li>
      <li><b>Eletrólise</b> (não espontânea, forçada por fonte): m = M·i·t/(n·F), com F = 96 485 C/mol.</li></ul>`,
    montar(raiz) {
      return subAbas(raiz, [{ id: "pilha", rotulo: "Pilha" }, { id: "far", rotulo: "Eletrólise (Faraday)" }, { id: "tab", rotulo: "Tabela de E°" }], (id, a) => {
        if (id === "pilha") {
          const s1 = el("select", "sel"), s2 = el("select", "sel");
          opcoesPot(s1); opcoesPot(s2);
          s1.value = X.POT.find((s) => s.metal === "Zn").id; s2.value = X.POT.find((s) => s.metal === "Cu").id;
          const ex = exemplos([{ r: "Daniell (Zn/Cu)", a: "Zn", b: "Cu" }, { r: "Cu/Ag", a: "Cu", b: "Ag" }, { r: "Mg/Fe (proteção)", a: "Mg", b: "Fe" }, { r: "Al/Ni", a: "Al", b: "Ni" }], (e) => { s1.value = X.POT.find((s) => s.metal === e.a).id; s2.value = X.POT.find((s) => s.metal === e.b).id; reconstruir(); });
          const conc = el("div", "campos");
          const res = resultadoBox();
          a.append(rotulo("Eletrodo 1", s1), rotulo("Eletrodo 2", s2), el("small", "dica", "Pilhas clássicas:"), ex.el, el("span", "c-rot", "Concentrações (mol/L) para a equação de Nernst — opcional; vazio = 1 mol/L"), conc, res);
          let campos = {};
          function reconstruir() {
            conc.innerHTML = ""; campos = {};
            const r = X.pilha({ a: s1.value, b: s2.value });
            if (r.ok) {
              const esp = [...r.global.reag, ...r.global.prod].filter((x) => x.e.carga !== 0);
              for (const x of esp) {
                const k = x.e.f + "|" + x.e.carga;
                if (campos[k]) continue;
                const c = campo({ rotulo: `[${X.htmlEsp(x.e)}]`, ph: "1" });
                c.input.addEventListener("input", debounce(calc, 250));
                campos[k] = c; conc.appendChild(c.el);
              }
            }
            calc();
          }
          function calc() {
            const cc = {}; let algum = false;
            for (const k in campos) { const v = n(campos[k]); cc[k] = v == null ? 1 : v; if (v != null) algum = true; }
            mostrar(res, X.pilha({ a: s1.value, b: s2.value, conc: algum ? cc : null }));
          }
          [s1, s2].forEach((s) => s.addEventListener("change", reconstruir));
          reconstruir();
          return { recalcular: calc };
        }
        if (id === "far") {
          const sel = el("select", "sel"); opcoesPot(sel, (s) => !!s.metal);
          sel.value = X.POT.find((s) => s.metal === "Cu").id;
          let modo = "massa";
          const seg = ui.segmentado({ itens: [{ id: "massa", rotulo: "Massa depositada" }, { id: "tempo", rotulo: "Tempo necessário" }], valor: "massa", onChange: (v) => { modo = v; vis(); calc(); } });
          const i = campo({ rotulo: "Corrente", ph: "2", valor: "2", sufixo: "A" });
          const t = campo({ rotulo: "Tempo", ph: "30", valor: "30", unidades: ["s", "min", "h"], unidadePadrao: "min" });
          const m = campo({ rotulo: "Massa desejada", ph: "5", sufixo: "g" });
          const res = resultadoBox();
          a.append(rotulo("Metal depositado no cátodo", sel), seg.el, grade(i, t), m.el, res);
          function vis() { t.el.hidden = modo === "tempo"; m.el.hidden = modo !== "tempo"; }
          function calc() { mostrar(res, X.faraday({ par: sel.value, modo, i: n(i), t: n(t), ut: t.unidade(), m: n(m) })); }
          ligar([sel, i, t, m], calc); vis(); calc();
          return { recalcular: calc };
        }
        const busca = campo({ rotulo: "Procurar", ph: "Ex.: cobre, cloro", tipo: "texto" });
        const lista = el("div");
        a.append(busca.el, lista, el("small", "dica", "Potenciais-padrão de redução a 25 °C, 1 mol/L, 1 atm (valores de tabelas usuais, como a do CRC Handbook). Quanto maior o E°, maior a tendência de se reduzir (melhor oxidante)."));
        function pintar() {
          const q = busca.texto().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
          const ls = X.POT.filter((s) => !q || s.nome.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").includes(q) || s.id.toLowerCase().includes(q));
          lista.innerHTML = `<div class="tab-rolar"><table class="tb"><thead><tr><th>Semirreação de redução</th><th>E° (V)</th></tr></thead><tbody>${ls.map((s) => `<tr><td>${X.semiHTML(s)}</td><td><b>${String(s.E.toFixed(2)).replace(".", ",").replace("-", "−")}</b></td></tr>`).join("")}</tbody></table></div>`;
        }
        busca.input.addEventListener("input", debounce(pintar, 150));
        pintar();
        return {};
      });
    },
  });
})();
