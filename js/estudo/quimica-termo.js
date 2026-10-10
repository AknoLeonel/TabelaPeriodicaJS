/*
 * Estudo: Química — termoquímica, equilíbrio e cinética.
 * As ferramentas entram na lista da Química (as abas aparecem sozinhas).
 */
(function () {
  "use strict";
  const LAB = window.LAB;
  const Q = window.QCalc;
  const T = window.QTermo;
  if (!LAB || !Q || !T) return;
  const { el, ui } = LAB;
  const E = LAB.estudo;
  const { campo, grade, mostrar, resultadoBox, dicaInicial, debounce } = E;
  const FERR = (E.ferramentas.quimica = E.ferramentas.quimica || []);

  // ---------- prática: delega os tipos novos ----------
  const TIPOS = new Set(T.TIPOS);
  const gerarOriginal = Q.gerarExercicio;
  Q.gerarExercicio = (tipo) => (TIPOS.has(tipo) ? T.gerarExercicio(tipo) : gerarOriginal(tipo));

  // ---------- utilitários de interface ----------
  const n = (c) => { const t = c.texto(); return t === "" ? null : Q.lerNumero(t); };
  const vazio = (res, txt) => { res.innerHTML = ""; res._r = null; res.appendChild(dicaInicial(txt)); };
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
  const seletor = (opcoes, valor) => {
    const s = el("select", "sel");
    opcoes.forEach(([v, t]) => { const o = el("option", "", t); o.value = v; s.appendChild(o); });
    if (valor != null) s.value = valor;
    return s;
  };
  const rotulo = (txt, filho) => { const w = el("label", "campo"); w.append(el("span", "c-rot", txt), filho); return w; };
  const ligar = (cs, fn) => { const d = debounce(fn, 220); cs.forEach((c) => { const i = c.input || c; i.addEventListener(i.tagName === "SELECT" ? "change" : "input", d); if (c.sel) c.sel.addEventListener("change", d); }); };

  // campos de concentração para cada espécie de uma equação de equilíbrio
  function camposEspecies(caixa, eqTxt, tipo, rotuloFn, valoresAntigos) {
    caixa.innerHTML = "";
    const L = T.lerEqK(eqTxt);
    if (!L.ok) { caixa.appendChild(el("div", "res-erro", L.erro)); return null; }
    const g = el("div", "campos");
    const cs = {};
    for (const x of L.esp) {
      const fora = tipo === "p" ? x.fase && x.fase !== "g" : x.fase === "s" || x.fase === "l";
      if (fora) continue;
      const c = campo({ rotulo: rotuloFn(x), ph: tipo === "p" ? "atm" : "mol/L", valor: valoresAntigos && valoresAntigos[x.i] != null ? String(valoresAntigos[x.i]).replace(".", ",") : "" });
      cs[x.i] = c;
      g.appendChild(c.el);
    }
    caixa.appendChild(g);
    return { L, cs, ler: () => { const o = {}; for (const k in cs) { const v = n(cs[k]); if (v != null && isFinite(v)) o[k] = v; } return o; } };
  }
  const simbolo = (x, tipo) => (tipo === "p" ? `P(${Q.fq(x.f)})` : `[${Q.fq(x.f)}]`);

  // =====================================================================
  // 1. Termoquímica
  // =====================================================================
  FERR.push({
    id: "termo", nome: "Termoquímica", prat: "termo",
    resumo: "Calor das reações: ΔH por entalpias de formação, Lei de Hess, ΔG e espontaneidade, calorimetria e energias de ligação.",
    teoria: `<p><b>Entalpia (H)</b> é o “conteúdo de calor” a pressão constante. Numa reação, só a variação importa:</p>
      <div class="eq">ΔH = H(produtos) − H(reagentes)</div>
      <ul><li><b>ΔH &lt; 0</b>: exotérmica (libera calor, ex.: combustão). <b>ΔH &gt; 0</b>: endotérmica (absorve calor).</li>
      <li>Com entalpias de formação (ΔH<sub>f</sub>°, tabeladas a 25 °C; substância simples no estado padrão = 0):</li></ul>
      <div class="eq">ΔH° = Σ n·ΔH<sub>f</sub>°(produtos) − Σ n·ΔH<sub>f</sub>°(reagentes)</div>
      <p><b>Lei de Hess</b>: ΔH não depende do caminho. Inverter uma etapa troca o sinal; multiplicar a etapa multiplica o ΔH.</p>
      <p><b>Espontaneidade</b>: ΔG = ΔH − T·ΔS. ΔG &lt; 0 é espontânea. Atenção às unidades: ΔS costuma vir em J/K e ΔH em kJ.</p>
      <p><b>Erros comuns:</b> esquecer de multiplicar pelos coeficientes, usar H₂O(g) no lugar de H₂O(l) (valores diferentes!) e misturar J com kJ.</p>`,
    montar(raiz) {
      return subAbas(raiz, [{ id: "hf", rotulo: "ΔH por formação" }, { id: "hess", rotulo: "Lei de Hess" }, { id: "dg", rotulo: "ΔG" }, { id: "cal", rotulo: "Calorimetria" }, { id: "lig", rotulo: "Ligações" }], (id, a) => {
        if (id === "hf") {
          const f = campo({ rotulo: "Equação (fases opcionais: (g), (l), (s), (aq))", ph: "Ex.: CH4(g) + O2(g) -> CO2(g) + H2O(l)", tipo: "texto" });
          const quant = campo({ rotulo: "Calor para uma quantidade (opcional)", ph: "Ex.: 32", unidades: ["g", "mol"], unidadePadrao: "g" });
          const qual = seletor([], null);
          const ex = exemplos([
            { r: "Combustão do metano", e: "CH4(g) + O2(g) -> CO2(g) + H2O(l)" }, { r: "Etanol", e: "C2H5OH(l) + O2(g) -> CO2(g) + H2O(l)" },
            { r: "Síntese da amônia", e: "N2(g) + H2(g) -> NH3(g)" }, { r: "Glicose", e: "C6H12O6(s) + O2(g) -> CO2(g) + H2O(l)" }, { r: "Calcário", e: "CaCO3(s) -> CaO(s) + CO2(g)" },
          ], (x) => { f.set(x.e); calc(); });
          const res = resultadoBox();
          a.append(f.el, el("small", "dica", "Exemplos:"), ex.el, grade(quant, rotulo("de qual substância?", qual)), res);
          let ultEq = "";
          function calc() {
            const t = f.texto();
            if (!t) return vazio(res, "Digite uma equação. Ela é balanceada automaticamente e as entalpias vêm da tabela (NIST, 25 °C).");
            if (t !== ultEq) {
              ultEq = t; qual.innerHTML = "";
              const L = T.lerEq(t);
              if (L.ok) [...L.reag, ...L.prod].forEach((x, i) => { const o = el("option", "", x.f); o.value = i; qual.appendChild(o); });
            }
            const q = n(quant);
            const opts = q != null && q > 0 ? { ref: { i: +qual.value || 0, q, un: quant.unidade() } } : {};
            mostrar(res, T.dHReacao(t, opts));
          }
          ligar([f, quant, qual], calc);
          calc();
          return { recalcular: calc };
        }
        if (id === "hess") {
          const lista = el("div", "hess-lista");
          const res = resultadoBox();
          const etapas = [];
          const add = (eqT = "", dH = "", fat = "1") => {
            const linha = el("div", "hess-linha");
            const ce = campo({ rotulo: `Etapa ${etapas.length + 1} (opcional: a equação)`, ph: "Ex.: C + O2 -> CO2", tipo: "texto", valor: eqT });
            const cd = campo({ rotulo: "ΔH (kJ)", ph: "Ex.: -393,5", valor: dH });
            const cf = campo({ rotulo: "Fator (−1 inverte, 2 dobra, 1/2...)", ph: "1", valor: fat });
            linha.append(ce.el, grade(cd, cf));
            lista.appendChild(linha);
            etapas.push({ ce, cd, cf });
            ligar([ce, cd, cf], calc);
          };
          const btAdd = ui.botao("+ Etapa", () => { add(); calc(); }, "sec");
          const btEx = ui.botao("Exemplo: formação do CO", () => {
            lista.innerHTML = ""; etapas.length = 0;
            add("C(s) + O2(g) -> CO2(g)", "-393,5", "1"); add("CO(g) + 1/2 O2(g) -> CO2(g)", "-283,0", "-1"); calc();
          }, "sec");
          a.append(el("p", "dica-form", "Escreva cada etapa conhecida com seu ΔH e diga o que fazer com ela para chegar à reação pedida."), lista, el("div", "linha-bt"), res);
          a.querySelector(".linha-bt").append(btAdd, btEx);
          add(); add();
          function calc() {
            const lin = etapas.map((e) => ({ eq: e.ce.texto(), dH: n(e.cd), fator: n(e.cf) == null ? 1 : n(e.cf) })).filter((x) => x.dH != null);
            if (!lin.length) return vazio(res, "Preencha o ΔH de pelo menos uma etapa (ou toque no exemplo).");
            mostrar(res, T.hess(lin));
          }
          calc();
          return { recalcular: calc };
        }
        if (id === "dg") {
          const h = campo({ rotulo: "ΔH", ph: "Ex.: -92,2", unidades: ["kJ/mol", "J/mol"], unidadePadrao: "kJ/mol" });
          const s = campo({ rotulo: "ΔS", ph: "Ex.: -198,7", unidades: ["J/(mol·K)", "kJ/(mol·K)"], unidadePadrao: "J/(mol·K)" });
          const t = campo({ rotulo: "Temperatura (vazio = só a T de equilíbrio)", ph: "Ex.: 298", unidades: ["K", "°C"], unidadePadrao: "K" });
          const res = resultadoBox();
          a.append(grade(h, s), t.el, res);
          function calc() {
            if (n(h) == null || n(s) == null) return vazio(res, "Informe ΔH e ΔS. Com T, calcula ΔG; sem T, a temperatura em que ΔG = 0.");
            mostrar(res, T.dG({ dH: n(h), dS: n(s), T: n(t), uH: h.unidade(), uS: s.unidade(), uT: t.unidade() }));
          }
          ligar([h, s, t], calc);
          calc();
          return { recalcular: calc };
        }
        if (id === "cal") {
          const m = campo({ rotulo: "Massa da água/solução (g)", ph: "Ex.: 100" });
          const c = campo({ rotulo: "Calor específico", ph: "4,18", valor: "4,18", unidades: ["J/(g·°C)", "cal/(g·°C)"], unidadePadrao: "J/(g·°C)" });
          const ti = campo({ rotulo: "Temperatura inicial (°C)", ph: "Ex.: 22" });
          const tf = campo({ rotulo: "Temperatura final (°C)", ph: "Ex.: 28,5" });
          const cc = campo({ rotulo: "Capacidade do calorímetro (J/°C, opcional)", ph: "0" });
          const nn = campo({ rotulo: "Quantidade que reagiu (opcional, para ΔH em kJ/mol)", ph: "Ex.: 0,05", unidades: ["mol", "g"], unidadePadrao: "mol" });
          const form = campo({ rotulo: "Fórmula (se informou em gramas)", ph: "Ex.: NaOH", tipo: "texto" });
          const res = resultadoBox();
          a.append(grade(m, c), grade(ti, tf), cc.el, grade(nn, form), res);
          function calc() {
            if (n(m) == null || n(ti) == null || n(tf) == null) return vazio(res, "Informe a massa e as temperaturas inicial e final.");
            const p = { m: n(m), c: n(c), uC: c.unidade(), Ti: n(ti), Tf: n(tf), Ccal: n(cc) || 0 };
            if (n(nn) != null) p.n = { valor: n(nn), un: nn.unidade(), formula: form.texto() };
            mostrar(res, T.calorimetria(p));
          }
          ligar([m, c, ti, tf, cc, nn, form], calc);
          calc();
          return { recalcular: calc };
        }
        // ligações
        const r1 = campo({ rotulo: "Ligações rompidas (reagentes)", ph: "Ex.: 4 C-H, 2 O=O", tipo: "texto" });
        const r2 = campo({ rotulo: "Ligações formadas (produtos)", ph: "Ex.: 2 C=O, 4 O-H", tipo: "texto" });
        const ex = exemplos([{ r: "Combustão do metano", a: "4 C-H, 2 O=O", b: "2 C=O, 4 O-H" }, { r: "H₂ + Cl₂ → 2 HCl", a: "1 H-H, 1 Cl-Cl", b: "2 H-Cl" }], (x) => { r1.set(x.a); r2.set(x.b); calc(); });
        const res = resultadoBox();
        a.append(r1.el, r2.el, el("small", "dica", `Use - para simples, = para dupla e # para tripla. Ligações na tabela: ${T.LIGACOES.map((l) => l[0]).join(", ")}.`), ex.el, res);
        function calc() {
          if (!r1.texto() || !r2.texto()) return vazio(res, "Liste as ligações rompidas e as formadas (com a quantidade de cada uma).");
          mostrar(res, T.energiaLigacao(r1.texto(), r2.texto()));
        }
        ligar([r1, r2], calc);
        calc();
        return { recalcular: calc };
      });
    },
  });

  // =====================================================================
  // 2. Equilíbrio
  // =====================================================================
  FERR.push({
    id: "equilibrio", nome: "Equilíbrio", prat: "equilibrio",
    resumo: "Constante de equilíbrio, sentido da reação (Q × K), tabela ICE, Kc ↔ Kp, solubilidade (Kps) e tampões.",
    teoria: `<p>No <b>equilíbrio químico</b> as reações direta e inversa continuam acontecendo, na mesma velocidade; as concentrações param de mudar.</p>
      <p>Para aA + bB ⇌ cC + dD:</p>
      <div class="eq">K<sub>c</sub> = <span class="frac"><span>[C]<sup>c</sup>[D]<sup>d</sup></span><span>[A]<sup>a</sup>[B]<sup>b</sup></span></span></div>
      <ul><li>Sólidos e líquidos puros <b>não entram</b> na expressão.</li>
      <li><b>Q</b> tem a mesma forma, mas com os valores do momento: Q &lt; K → vai para os produtos; Q &gt; K → vai para os reagentes.</li>
      <li><b>Tabela ICE</b> (Inicial, Variação, Equilíbrio): a variação segue a proporção dos coeficientes (−ax, −bx, +cx...).</li>
      <li><b>Le Chatelier</b>: o sistema reage contra a perturbação. Só a temperatura muda o valor de K.</li>
      <li>K<sub>p</sub> = K<sub>c</sub>·(RT)<sup>Δn</sup>, com Δn = mols de gás dos produtos − dos reagentes e R = 0,082 L·atm/(mol·K).</li></ul>`,
    montar(raiz) {
      return subAbas(raiz, [{ id: "k", rotulo: "Calcular K" }, { id: "q", rotulo: "Q × K" }, { id: "ice", rotulo: "Tabela ICE" }, { id: "kp", rotulo: "Kc ↔ Kp" }, { id: "ksp", rotulo: "Kps" }, { id: "ab", rotulo: "Ka/Kb" }, { id: "tamp", rotulo: "Tampão" }], (id, a) => {
        const EXS = [
          { r: "Haber (N₂ + 3H₂)", e: "N2(g) + 3 H2(g) <=> 2 NH3(g)" }, { r: "HI", e: "H2(g) + I2(g) <=> 2 HI(g)" },
          { r: "N₂O₄ ⇌ 2NO₂", e: "N2O4(g) <=> 2 NO2(g)" }, { r: "Calcário (sólidos)", e: "CaCO3(s) <=> CaO(s) + CO2(g)" }, { r: "Gás-d'água", e: "CO(g) + H2O(g) <=> CO2(g) + H2(g)" },
        ];
        if (id === "k" || id === "q" || id === "ice") {
          const f = campo({ rotulo: "Equação de equilíbrio (use <=> ou ⇌; fases opcionais)", ph: "Ex.: N2(g) + 3 H2(g) <=> 2 NH3(g)", tipo: "texto", valor: EXS[0].e });
          const tipo = ui.segmentado({ itens: [{ id: "c", rotulo: "Kc (concentração)" }, { id: "p", rotulo: "Kp (pressão)" }], valor: "c", onChange: (v) => { tp = v; reconstruir(); } });
          let tp = "c";
          const kC = campo({ rotulo: "Valor de K", ph: "Ex.: 50,5" });
          const caixa = el("div");
          const alvo = el("select", "sel");
          const pert = seletor([["", "— nenhuma —"], ...Object.keys({ "reag+": 1, "reag-": 1, "prod+": 1, "prod-": 1, "P+": 1, "P-": 1, "T+": 1, "T-": 1, cat: 1 }).map((k) => [k, { "reag+": "Adicionar reagente", "reag-": "Retirar reagente", "prod+": "Adicionar produto", "prod-": "Retirar produto", "P+": "Aumentar a pressão", "P-": "Diminuir a pressão", "T+": "Aumentar a temperatura", "T-": "Diminuir a temperatura", cat: "Adicionar catalisador" }[k]])], "");
          const dH = campo({ rotulo: "ΔH da reação direta (kJ, para efeito da temperatura)", ph: "Ex.: -92" });
          const ex = exemplos(EXS, (x) => { f.set(x.e); reconstruir(); });
          const res = resultadoBox();
          const titulo = id === "k" ? "Concentrações (ou pressões) NO EQUILÍBRIO — deixe vazia só a que quer descobrir" : id === "q" ? "Valores AGORA (fora do equilíbrio)" : "Valores INICIAIS (0 ou vazio = ausente)";
          a.append(f.el, el("small", "dica", "Exemplos:"), ex.el, tipo.el);
          if (id !== "k") a.append(kC.el);
          a.append(el("span", "c-rot", titulo), caixa);
          if (id === "ice") a.append(rotulo("Qual espécie você quer no equilíbrio?", alvo));
          if (id === "q") a.append(rotulo("Perturbação (Le Chatelier, opcional)", pert), dH.el);
          a.append(res);
          let form = null;
          function reconstruir() {
            const antigos = form ? form.ler() : null;
            form = camposEspecies(caixa, f.texto(), tp, (x) => simbolo(x, tp), antigos);
            if (form) {
              Object.values(form.cs).forEach((c) => c.input.addEventListener("input", debounce(calc, 220)));
              alvo.innerHTML = "";
              Object.keys(form.cs).forEach((i) => { const x = form.L.esp[i]; const o = el("option", "", x.f); o.value = i; alvo.appendChild(o); });
              const prod = Object.keys(form.cs).find((i) => form.L.esp[i].lado === 1);
              if (prod != null) alvo.value = prod;
            }
            calc();
          }
          function calc() {
            if (!f.texto()) return vazio(res, "Digite a equação de equilíbrio.");
            if (!form) { res.innerHTML = ""; return; }
            const vals = form.ler();
            if (id === "k") {
              if (!Object.keys(vals).length) return vazio(res, "Preencha os valores no equilíbrio.");
              return mostrar(res, T.calcK({ eq: f.texto(), tipo: tp, valores: vals, K: n(kC) }));
            }
            if (n(kC) == null) return vazio(res, "Informe o valor de K.");
            if (id === "q") return mostrar(res, T.quociente({ eq: f.texto(), tipo: tp, valores: vals, K: n(kC), pert: pert.value || null, dH: n(dH) }));
            mostrar(res, T.ice({ eq: f.texto(), tipo: tp, K: n(kC), inicial: vals, alvo: alvo.value === "" ? null : +alvo.value }));
          }
          f.input.addEventListener("input", debounce(reconstruir, 350));
          ligar([kC, alvo, pert, dH], calc);
          reconstruir();
          return { recalcular: calc };
        }
        if (id === "kp") {
          const de = ui.segmentado({ itens: [{ id: "c", rotulo: "Tenho Kc → Kp" }, { id: "p", rotulo: "Tenho Kp → Kc" }], valor: "c", onChange: (v) => { d = v; calc(); } });
          let d = "c";
          const f = campo({ rotulo: "Equação (para achar Δn) — ou informe Δn abaixo", ph: "Ex.: N2(g) + 3 H2(g) <=> 2 NH3(g)", tipo: "texto" });
          const dn = campo({ rotulo: "Δn de gás (opcional se deu a equação)", ph: "Ex.: -2" });
          const k = campo({ rotulo: "Valor de K", ph: "Ex.: 0,5" });
          const t = campo({ rotulo: "Temperatura", ph: "Ex.: 500", unidades: ["K", "°C"], unidadePadrao: "K" });
          const res = resultadoBox();
          a.append(de.el, f.el, grade(dn, k), t.el, res);
          function calc() {
            if (n(k) == null || n(t) == null) return vazio(res, "Informe K, a temperatura e a equação (ou Δn).");
            mostrar(res, T.kcKp({ de: d, K: n(k), T: n(t), uT: t.unidade(), eq: f.texto() || null, dn: n(dn) }));
          }
          ligar([f, dn, k, t], calc);
          calc();
          return { recalcular: calc };
        }
        if (id === "ksp") {
          let modo = "s";
          const seg = ui.segmentado({ itens: [{ id: "s", rotulo: "Kps → solubilidade" }, { id: "ksp", rotulo: "Solubilidade → Kps" }, { id: "comum", rotulo: "Íon comum" }, { id: "preci", rotulo: "Precipita?" }], valor: "s", onChange: (v) => { modo = v; vis(); calc(); } });
          const nome = campo({ rotulo: "Sal (opcional, só para exibir)", ph: "Ex.: CaF2", tipo: "texto" });
          const x = campo({ rotulo: "Cátions por fórmula (x)", ph: "1", valor: "1" });
          const y = campo({ rotulo: "Ânions por fórmula (y)", ph: "2", valor: "2" });
          const K = campo({ rotulo: "Kps", ph: "Ex.: 3,9e-11" });
          const s = campo({ rotulo: "Solubilidade molar s (mol/L)", ph: "Ex.: 2,1e-4" });
          const Ca = campo({ rotulo: "[cátion] já presente (mol/L)", ph: "0" });
          const Cb = campo({ rotulo: "[ânion] já presente (mol/L)", ph: "0" });
          const ca = campo({ rotulo: "[cátion] na mistura (mol/L)", ph: "Ex.: 1e-3" });
          const cb = campo({ rotulo: "[ânion] na mistura (mol/L)", ph: "Ex.: 1e-3" });
          const v1 = campo({ rotulo: "Volume da solução do cátion (mL, opcional)", ph: "Ex.: 50" });
          const v2 = campo({ rotulo: "Volume da solução do ânion (mL, opcional)", ph: "Ex.: 50" });
          const ex = exemplos([{ r: "AgCl", x: 1, y: 1, k: "1,8e-10" }, { r: "CaF2", x: 1, y: 2, k: "3,9e-11" }, { r: "Ag2CrO4", x: 2, y: 1, k: "1,1e-12" }, { r: "Ca3(PO4)2", x: 3, y: 2, k: "2,1e-33" }], (e) => { nome.set(e.r); x.set(e.x); y.set(e.y); K.set(e.k); calc(); });
          const res = resultadoBox();
          a.append(seg.el, nome.el, el("small", "dica", "Sais comuns:"), ex.el, grade(x, y), K.el, s.el, grade(Ca, Cb), grade(ca, cb), grade(v1, v2), res);
          function vis() {
            K.el.hidden = modo === "ksp"; s.el.hidden = modo !== "ksp";
            Ca.el.parentElement.hidden = modo !== "comum"; ca.el.parentElement.hidden = v1.el.parentElement.hidden = modo !== "preci";
          }
          function calc() {
            const p = { modo, x: Math.round(n(x) || 0), y: Math.round(n(y) || 0), nome: nome.texto() || null, Ksp: n(K), s: n(s), Ca: n(Ca) || 0, Cb: n(Cb) || 0, a: n(ca), b: n(cb), V1: n(v1), V2: n(v2) };
            if (modo === "ksp" ? p.s == null : p.Ksp == null) return vazio(res, modo === "ksp" ? "Informe a solubilidade molar." : "Informe o Kps (ou toque num sal comum).");
            mostrar(res, T.ksp(p));
          }
          ligar([nome, x, y, K, s, Ca, Cb, ca, cb, v1, v2], calc);
          vis(); calc();
          return { recalcular: calc };
        }
        if (id === "ab") {
          const tem = seletor([["Ka", "Tenho Ka"], ["pKa", "Tenho pKa"], ["Kb", "Tenho Kb"], ["pKb", "Tenho pKb"]], "Ka");
          const v = campo({ rotulo: "Valor", ph: "Ex.: 1,8e-5" });
          const res = resultadoBox();
          a.append(rotulo("O que você tem?", tem), v.el, res);
          function calc() {
            if (n(v) == null) return vazio(res, "Informe o valor. Mostramos Ka, Kb, pKa e pKb (25 °C, Kw = 10⁻¹⁴).");
            mostrar(res, T.acidoBase({ tem: tem.value, valor: n(v) }));
          }
          ligar([tem, v], calc);
          calc();
          return { recalcular: calc };
        }
        // tampão
        const tipo = seletor([["acido", "Ácido fraco + sal (ex.: CH₃COOH/CH₃COO⁻)"], ["base", "Base fraca + sal (ex.: NH₃/NH₄⁺)"]], "acido");
        const cst = seletor([["pKa", "pKa"], ["Ka", "Ka"], ["pKb", "pKb"], ["Kb", "Kb"]], "pKa");
        const val = campo({ rotulo: "Valor da constante", ph: "Ex.: 4,74", valor: "4,74" });
        const ca = campo({ rotulo: "[componente ácido] (mol/L)", ph: "Ex.: 0,1" });
        const cb = campo({ rotulo: "[componente básico] (mol/L)", ph: "Ex.: 0,1" });
        const V = campo({ rotulo: "Volume do tampão (L, para adição)", ph: "Ex.: 1" });
        const addT = seletor([["", "Sem adição"], ["acido", "Adicionar ácido forte"], ["base", "Adicionar base forte"]], "");
        const addN = campo({ rotulo: "Quantidade adicionada (mol)", ph: "Ex.: 0,01" });
        const res = resultadoBox();
        a.append(rotulo("Tipo de tampão", tipo), grade(rotulo("Constante", cst), val), grade(ca, cb), el("span", "c-rot", "Extra: o que acontece ao adicionar ácido ou base forte?"), grade(rotulo("Adição", addT), addN), V.el, res);
        function calc() {
          if (n(ca) == null || n(cb) == null || n(val) == null) return vazio(res, "Informe a constante e as duas concentrações.");
          const p = { tipo: tipo.value, const: cst.value, valor: n(val), ca: n(ca), cb: n(cb), V: n(V) };
          if (addT.value && n(addN) > 0) p.add = { tipo: addT.value, n: n(addN) };
          mostrar(res, T.tampao(p));
        }
        ligar([tipo, cst, val, ca, cb, V, addT, addN], calc);
        calc();
        return { recalcular: calc };
      });
    },
  });

  // =====================================================================
  // 3. Cinética
  // =====================================================================
  FERR.push({
    id: "cinetica", nome: "Cinética", prat: "cinetica",
    resumo: "Velocidade das reações: leis integradas e meia-vida, ordem a partir de dados, velocidades iniciais e Arrhenius.",
    teoria: `<p>A <b>lei de velocidade</b> diz como a velocidade depende das concentrações: v = k·[A]<sup>m</sup>[B]<sup>n</sup>. Os expoentes (ordens) vêm de <b>experimentos</b>, não dos coeficientes da equação.</p>
      <div class="tab-rolar"><table class="tb"><thead><tr><th>Ordem</th><th>Lei integrada</th><th>Reta</th><th>Meia-vida</th></tr></thead><tbody>
      <tr><td>0</td><td>[A] = [A]₀ − kt</td><td>[A] × t</td><td>[A]₀/(2k)</td></tr>
      <tr><td>1</td><td>ln[A] = ln[A]₀ − kt</td><td>ln[A] × t</td><td>ln2/k</td></tr>
      <tr><td>2</td><td>1/[A] = 1/[A]₀ + kt</td><td>1/[A] × t</td><td>1/(k[A]₀)</td></tr></tbody></table></div>
      <p><b>Arrhenius</b>: k = A·e<sup>−Ea/RT</sup>; com duas temperaturas, ln(k₂/k₁) = (Ea/R)(1/T₁ − 1/T₂). Use T em kelvin e R = 8,314 J/(mol·K).</p>
      <p><b>Erro comum:</b> a unidade de k muda com a ordem (s⁻¹ na 1ª ordem; L/(mol·s) na 2ª).</p>`,
    montar(raiz) {
      return subAbas(raiz, [{ id: "lei", rotulo: "Lei integrada" }, { id: "dados", rotulo: "Achar a ordem" }, { id: "vi", rotulo: "Velocidades iniciais" }, { id: "arr", rotulo: "Arrhenius" }], (id, a) => {
        const UT = [["s", "s"], ["min", "min"], ["h", "h"]];
        if (id === "lei") {
          const ordem = ui.segmentado({ itens: [{ id: "0", rotulo: "Ordem 0" }, { id: "1", rotulo: "Ordem 1" }, { id: "2", rotulo: "Ordem 2" }], valor: "1", onChange: (v) => { o = +v; calc(); } });
          let o = 1;
          const ut = seletor(UT, "s");
          const k = campo({ rotulo: "Constante k", ph: "Ex.: 0,02" });
          const A0 = campo({ rotulo: "[A]₀ inicial (mol/L)", ph: "Ex.: 1" });
          const A = campo({ rotulo: "[A] no instante t (mol/L)", ph: "Ex.: 0,25" });
          const t = campo({ rotulo: "Tempo t", ph: "Ex.: 60" });
          const res = resultadoBox();
          a.append(ordem.el, rotulo("Unidade de tempo", ut), el("p", "dica-form", "Preencha três e deixe vazio o que quer descobrir. A meia-vida aparece junto."), grade(k, A0), grade(A, t), res);
          function calc() {
            const p = { ordem: o, ut: ut.value, k: n(k), A0: n(A0), A: n(A), t: n(t) };
            if (["k", "A0", "A", "t"].filter((c) => p[c] == null).length !== 1) return vazio(res, "Preencha exatamente três dos quatro campos (k, [A]₀, [A], t).");
            mostrar(res, T.leiIntegrada(p));
          }
          ligar([ut, k, A0, A, t], calc);
          calc();
          return { recalcular: calc };
        }
        if (id === "dados") {
          const area = el("textarea", "area-dados");
          area.rows = 6; area.placeholder = "t   [A]\n0   1,00\n10  0,50\n20  0,25\n30  0,125";
          const ut = seletor(UT, "s");
          const ex = ui.botao("Exemplo (1ª ordem)", () => { area.value = "0 1,00\n10 0,50\n20 0,25\n30 0,125\n40 0,0625"; calc(); }, "sec");
          const res = resultadoBox();
          a.append(el("span", "c-rot", "Tempo e concentração, um par por linha (cole da planilha)"), area, grade(rotulo("Unidade de tempo", ut), ex), res);
          function calc() {
            if (!area.value.trim()) return vazio(res, "Cole os pares (t, [A]). Testamos ordem 0, 1 e 2 e escolhemos a que dá a reta mais perfeita (maior R²).");
            const L = T.lerPares(area.value);
            if (!L.ok) return mostrar(res, L);
            mostrar(res, T.ordemPorDados(L.pts || L.pares || L.dados, ut.value));
          }
          area.addEventListener("input", debounce(calc, 300)); ut.addEventListener("change", calc);
          calc();
          return { recalcular: calc };
        }
        if (id === "vi") {
          const nomes = campo({ rotulo: "Reagentes (separados por vírgula)", ph: "A, B", tipo: "texto", valor: "A, B" });
          const tab = el("div", "vi-tab");
          const ut = seletor(UT, "s");
          const res = resultadoBox();
          const btEx = ui.botao("Exemplo", () => { nomes.set("A, B"); montarTab([[0.1, 0.1, 2e-3], [0.2, 0.1, 8e-3], [0.1, 0.2, 4e-3]]); calc(); }, "sec");
          const btAdd = ui.botao("+ Experimento", () => { linhas.push(novaLinha()); calc(); }, "sec");
          const bts = el("div", "linha-bt"); bts.append(btAdd, btEx);
          a.append(nomes.el, rotulo("Unidade de tempo", ut), el("span", "c-rot", "Experimentos: concentrações iniciais (mol/L) e velocidade inicial (mol/L por unidade de tempo)"), tab, bts, res);
          let linhas = [];
          const lista = () => nomes.texto().split(/[,;]/).map((s) => s.trim()).filter(Boolean);
          function novaLinha(vals) {
            const ns = lista();
            const cs = ns.map((nm, j) => campo({ rotulo: `[${nm}]`, ph: "mol/L", valor: vals ? String(vals[j]).replace(".", ",") : "" }));
            const v = campo({ rotulo: "v", ph: "Ex.: 2e-3", valor: vals ? String(vals[ns.length]).replace(".", ",") : "" });
            const g = el("div", "campos vi-linha");
            g.append(el("span", "c-rot vi-n", `Experimento ${linhas.length + 1}`), ...cs.map((c) => c.el), v.el);
            tab.appendChild(g);
            ligar([...cs, v], calc);
            return { cs, v };
          }
          function montarTab(dados) { tab.innerHTML = ""; linhas = []; (dados || [null, null, null]).forEach((d) => linhas.push(novaLinha(d))); }
          function calc() {
            const exps = linhas.map((l) => ({ c: l.cs.map(n), v: n(l.v) })).filter((e) => e.v != null && e.c.every((x) => x != null));
            if (exps.length < 2) return vazio(res, "Preencha pelo menos dois experimentos completos (ou toque em Exemplo).");
            mostrar(res, T.velInicial({ nomes: lista(), exps, ut: ut.value }));
          }
          nomes.input.addEventListener("change", () => { montarTab(); calc(); });
          ut.addEventListener("change", calc);
          montarTab();
          calc();
          return { recalcular: calc };
        }
        // Arrhenius
        let modo = "Ea";
        const seg = ui.segmentado({ itens: [{ id: "Ea", rotulo: "Achar Ea" }, { id: "k2", rotulo: "Achar k₂" }, { id: "razao", rotulo: "Quantas vezes mais rápido?" }], valor: "Ea", onChange: (v) => { modo = v; vis(); calc(); } });
        const uT = seletor([["K", "K"], ["°C", "°C"]], "K");
        const k1 = campo({ rotulo: "k₁", ph: "Ex.: 1e-3" });
        const T1 = campo({ rotulo: "T₁", ph: "Ex.: 300" });
        const k2 = campo({ rotulo: "k₂", ph: "Ex.: 2e-3" });
        const T2 = campo({ rotulo: "T₂", ph: "Ex.: 310" });
        const Ea = campo({ rotulo: "Ea", ph: "Ex.: 50", unidades: ["kJ/mol", "J/mol"], unidadePadrao: "kJ/mol" });
        const res = resultadoBox();
        a.append(seg.el, rotulo("Temperaturas em", uT), grade(k1, T1), grade(k2, T2), Ea.el, res);
        function vis() { k2.el.hidden = modo !== "Ea"; Ea.el.hidden = modo === "Ea"; k1.el.hidden = modo === "razao"; }
        function calc() {
          const p = { modo, uT: uT.value, k1: n(k1), k2: n(k2), T1: n(T1), T2: n(T2), Ea: n(Ea), uEa: Ea.unidade() };
          if (p.T1 == null || p.T2 == null) return vazio(res, "Informe as duas temperaturas e os demais dados.");
          mostrar(res, T.arrhenius(p));
        }
        ligar([uT, k1, T1, k2, T2, Ea], calc);
        vis(); calc();
        return { recalcular: calc };
      });
    },
  });
})();
