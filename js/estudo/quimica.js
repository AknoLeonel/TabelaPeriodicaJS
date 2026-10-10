/*
 * Estudo: Química
 * Resolvedor passo a passo + exercícios gerados, para ensino médio e faculdade.
 */
(function () {
  "use strict";
  const LAB = window.LAB;
  const Q = window.QCalc;
  const { el, ui } = LAB;

  const COR_EL = { C: "#8fa0c8", H: "#9ad0ff", O: "#ff6a5a", N: "#6f7bff", S: "#ffd24d", P: "#ff9a4d", Na: "#ff4d6d", Cl: "#5df0b0", Ca: "#ff9e3d", K: "#d27bff", Fe: "#ff8a5a", Mg: "#2ee6b6" };
  const corDe = (s, i) => COR_EL[s] || ["#7aa2ff", "#ffb23d", "#2ee6b6", "#ff7ab8", "#c9a6ff", "#9be15d"][i % 6];
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sem armazenamento */ } };
  const ler = (k, padrao) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : padrao; } catch (e) { return padrao; } };

  // ---------- componentes ----------
  function campo({ rotulo, ph = "", sufixo = "", tipo = "num", ajuda = "", valor = "", unidades = null, unidadePadrao = null }) {
    const w = el("label", "campo");
    const topo = el("span", "c-rot", rotulo);
    const caixa = el("span", "c-in");
    const inp = el("input");
    inp.type = "text";
    inp.inputMode = tipo === "num" ? "decimal" : "text";
    inp.autocomplete = "off"; inp.autocapitalize = "off"; inp.spellcheck = false;
    inp.placeholder = ph; inp.value = valor;
    caixa.appendChild(inp);
    let sel = null;
    if (unidades) {
      sel = el("select", "sel");
      for (const u of unidades) { const o = el("option", "", u); o.value = u; sel.appendChild(o); }
      if (unidadePadrao) sel.value = unidadePadrao;
      caixa.appendChild(sel);
    } else if (sufixo) caixa.appendChild(el("i", "", sufixo));
    w.append(topo, caixa);
    if (ajuda) w.appendChild(el("small", "", ajuda));
    return {
      el: w, input: inp, sel,
      texto: () => inp.value.trim(),
      num: () => { const t = inp.value.trim(); return t === "" ? null : Q.lerNumero(t); },
      set: (v) => { inp.value = v; },
      unidade: () => (sel ? sel.value : null),
      limpar: () => { inp.value = ""; },
    };
  }
  const grade = (...cs) => { const g = el("div", "campos"); cs.forEach((c) => g.appendChild(c.el || c)); return g; };

  let guiado = false;
  function renderPassos(raiz, passos) {
    raiz.innerHTML = "";
    const ol = el("ol", "passos");
    let visiveis = guiado ? 1 : passos.length;
    const lis = passos.map((p, i) => {
      const li = el("li", "passo" + (i >= visiveis ? " oculto" : ""));
      li.innerHTML = `<span class="pn">${i + 1}</span><div class="pb"><h5>${p.t}</h5><div class="pc">${p.h}</div></div>`;
      ol.appendChild(li);
      return li;
    });
    if (guiado && passos.length > 1) {
      raiz.appendChild(el("p", "dica-guia", "Modo guiado: tente fazer cada passo no caderno antes de revelar o próximo."));
    }
    raiz.appendChild(ol);
    if (guiado && passos.length > 1) {
      const bt = ui.botao("Mostrar o próximo passo →", () => {
        if (visiveis < passos.length) { lis[visiveis].classList.remove("oculto"); lis[visiveis].scrollIntoView({ block: "nearest", behavior: "smooth" }); visiveis++; }
        if (visiveis >= passos.length) bt.remove();
        else bt.textContent = `Mostrar o próximo passo (${visiveis}/${passos.length}) →`;
      });
      raiz.appendChild(bt);
    }
  }
  function textoPlano(r) {
    const t = [r.resposta ? "Resposta: " + r.resposta.replace(/<[^>]+>/g, "") : ""];
    (r.passos || []).forEach((p, i) => {
      const d = document.createElement("div");
      d.innerHTML = p.h.replace(/<\/(tr|p|div|li)>/g, "\n");
      t.push(`${i + 1}. ${p.t}\n${d.textContent.replace(/\n{2,}/g, "\n").trim()}`);
    });
    return t.join("\n\n");
  }
  // mostra a resposta + passo a passo
  function mostrar(raiz, r, { extra } = {}) {
    raiz.innerHTML = "";
    if (!r.ok) { raiz.appendChild(el("div", "res-erro", `<b>Hmm, não deu:</b> ${r.erro}`)); return; }
    const card = el("div", "resp");
    card.innerHTML = `<small>Resposta</small><div class="resp-v">${r.respostaHTML || r.resposta}</div>`;
    raiz.appendChild(card);
    if (extra) raiz.appendChild(extra(r));
    const cab = el("div", "passos-cab");
    cab.innerHTML = `<h4>Passo a passo</h4>`;
    const cp = ui.botao("Copiar", async () => { try { await navigator.clipboard.writeText(textoPlano(r)); cp.textContent = "Copiado ✓"; setTimeout(() => (cp.textContent = "Copiar"), 1600); } catch (e) { cp.textContent = "Não consegui copiar"; } }, "sec mini");
    cab.appendChild(cp);
    raiz.appendChild(cab);
    const corpo = el("div");
    raiz.appendChild(corpo);
    renderPassos(corpo, r.passos);
    raiz._r = r; raiz._corpo = corpo;
  }
  function repintarPassos() {
    document.querySelectorAll(".est-wrap [data-res]").forEach((raiz) => { if (raiz._r && raiz._r.ok) renderPassos(raiz._corpo, raiz._r.passos); });
  }
  const resultadoBox = () => { const d = el("div", "est-res"); d.dataset.res = "1"; return d; };
  const dicaInicial = (t) => el("div", "est-vazio", t);

  // ---------- ferramentas ----------
  const FERR = [];

  // 1. Massa molar
  FERR.push({
    id: "massa", nome: "Massa molar", prat: "massa",
    resumo: "Some as massas atômicas de qualquer fórmula, até com parênteses e água de cristalização.",
    montar(raiz) {
      const f = campo({ rotulo: "Fórmula química", ph: "Ex.: Ca(OH)2", tipo: "texto" });
      f.input.style.fontFamily = '"Space Grotesk", sans-serif';
      const tec = el("div", "teclado");
      for (const s of ["(", ")", "·", "[", "]"]) {
        const b = el("button", "", s); b.type = "button";
        b.addEventListener("click", () => { const i = f.input.selectionStart ?? f.input.value.length; f.input.value = f.input.value.slice(0, i) + s + f.input.value.slice(i); f.input.focus(); f.input.setSelectionRange(i + 1, i + 1); calc(); });
        tec.appendChild(b);
      }
      const ex = ui.chips({ itens: ["H2O", "NaCl", "Ca(OH)2", "C6H12O6", "Al2(SO4)3", "CuSO4·5H2O"].map((x) => ({ id: x, rotulo: x })), onClick: (id) => { f.set(id); calc(); } });
      const res = resultadoBox();
      raiz.append(f.el, tec, el("small", "dica", "Exemplos:"), ex.el, res);
      function calc() {
        const v = f.texto();
        if (!v) { res.innerHTML = ""; res._r = null; res.appendChild(dicaInicial("Digite uma fórmula para ver a conta completa.")); return; }
        const r = Q.passosMassaMolar(v);
        if (r.ok) r.respostaHTML = `M(${Q.fq(r.formula.texto)}) = <b>${Q.num(r.valor, 5)}</b> <span class="un">g/mol</span>`;
        mostrar(res, r, {
          extra: (rr) => {
            const b = el("div", "comp");
            b.innerHTML = `<div class="comp-b">${rr.mm.linhas.map((l, i) => `<span style="flex:${l.sub};background:${corDe(l.s, i)}" title="${l.s}"></span>`).join("")}</div><div class="comp-l">${rr.mm.linhas.map((l, i) => `<span><i style="background:${corDe(l.s, i)}"></i>${l.s} ${Q.num((l.sub / rr.mm.total) * 100, 3)}%</span>`).join("")}</div>`;
            return b;
          },
        });
      }
      f.input.addEventListener("input", debounce(calc, 180));
      calc();
      return { recalcular: calc, enviarEq: null };
    },
  });

  // 2. Mol
  FERR.push({
    id: "mol", nome: "Mol e conversões", prat: "mol",
    resumo: "Passe entre massa, mol, número de partículas e volume de gás.",
    montar(raiz) {
      const f = campo({ rotulo: "Substância", ph: "Ex.: H2O", tipo: "texto" });
      const tipo = ui.segmentado({ itens: [{ id: "massa", rotulo: "Massa (g)" }, { id: "mol", rotulo: "Mol" }, { id: "particulas", rotulo: "Partículas" }, { id: "volume", rotulo: "Volume (L)" }], valor: "massa", onChange: () => calc() });
      const v = campo({ rotulo: "Quantidade que você tem", ph: "Ex.: 36 ou 3e23" });
      const res = resultadoBox();
      raiz.append(f.el, el("span", "c-rot", "O que você tem?"), tipo.el, v.el, res);
      let atual = "massa";
      tipo.el.addEventListener("click", (e) => { const b = e.target.closest("button[data-id]"); if (b) atual = b.dataset.id; });
      function calc() {
        if (!f.texto() || v.texto() === "") { res.innerHTML = ""; res._r = null; res.appendChild(dicaInicial("Preencha a substância e a quantidade.")); return; }
        const r = Q.passosMol(f.texto(), atual, Q.lerNumero(v.texto()));
        if (r.ok) r.respostaHTML = `<b>${Q.num(r.n)}</b> mol · <b>${Q.num(r.massa)}</b> g · <b>${Q.sci(r.part, 3)}</b> partículas · <b>${Q.num(r.vol)}</b> L (CNTP)`;
        mostrar(res, r);
      }
      [f.input, v.input].forEach((i) => i.addEventListener("input", debounce(calc, 220)));
      calc();
      return { recalcular: calc };
    },
  });

  // 3. Balanceamento
  let equacaoCompartilhada = "";
  FERR.push({
    id: "balancear", nome: "Balancear equações", prat: "balancear",
    resumo: "Acerte os coeficientes de qualquer equação química, com a conta algébrica.",
    montar(raiz, ctx) {
      const f = campo({ rotulo: "Equação (use -> ou = como seta)", ph: "Ex.: C3H8 + O2 -> CO2 + H2O", tipo: "texto" });
      const tec = el("div", "teclado");
      for (const s of ["→", "+", "(", ")"]) {
        const b = el("button", "", s); b.type = "button";
        b.addEventListener("click", () => { const i = f.input.selectionStart ?? f.input.value.length; const ins = s === "→" ? " -> " : s === "+" ? " + " : s; f.input.value = f.input.value.slice(0, i) + ins + f.input.value.slice(i); f.input.focus(); calc(); });
        tec.appendChild(b);
      }
      const ex = ui.chips({ itens: Q.EQUACOES.slice(0, 8).map((x) => ({ id: x, rotulo: x.replace("->", "→") })), onClick: (id) => { f.set(id); calc(); } });
      const res = resultadoBox();
      const usar = ui.botao("Usar em estequiometria →", () => { equacaoCompartilhada = f.texto(); ctx.irPara("estequiometria"); }, "sec");
      usar.hidden = true;
      raiz.append(f.el, tec, el("small", "dica", "Exemplos:"), ex.el, res, usar);
      function calc() {
        const v = f.texto();
        usar.hidden = true;
        if (!v) { res.innerHTML = ""; res._r = null; res.appendChild(dicaInicial("Digite uma equação para balancear.")); return; }
        const r = Q.passosBalanceamento(v);
        if (r.ok) { r.respostaHTML = Q.textoEquacao(r.balanco); usar.hidden = false; }
        mostrar(res, r);
      }
      f.input.addEventListener("input", debounce(calc, 250));
      calc();
      return { recalcular: calc };
    },
  });

  // 4. Estequiometria
  FERR.push({
    id: "estequiometria", nome: "Estequiometria",
    resumo: "Quanto se forma, quanto sobra e qual reagente limita a reação.",
    montar(raiz) {
      const f = campo({ rotulo: "Equação química", ph: "Ex.: H2 + O2 -> H2O", tipo: "texto" });
      const ex = ui.chips({ itens: ["H2 + O2 -> H2O", "N2 + H2 -> NH3", "CaCO3 + HCl -> CaCl2 + CO2 + H2O", "Fe2O3 + CO -> Fe + CO2"].map((x) => ({ id: x, rotulo: x.replace("->", "→") })), onClick: (id) => { f.set(id); montarTabela(); } });
      const tabela = el("div", "est-tab");
      const res = resultadoBox();
      raiz.append(f.el, ex.el, tabela, res);
      let linhas = [];
      let rendCampo, rendSel, rendUn;
      function montarTabela() {
        tabela.innerHTML = ""; res.innerHTML = ""; res._r = null; linhas = [];
        const v = f.texto();
        if (!v) return;
        const b = Q.balancear(v);
        if (!b.ok) { tabela.appendChild(el("div", "res-erro", `<b>Hmm, não deu:</b> ${b.erro}`)); return; }
        tabela.appendChild(el("p", "est-eq", `Equação balanceada: <b>${Q.textoEquacao(b)}</b>`));
        tabela.appendChild(el("small", "dica", "Informe a quantidade de pelo menos uma substância (em gramas ou em mol). Se informar mais de um reagente, o app descobre o limitante."));
        b.especies.forEach((e, i) => {
          const c = campo({ rotulo: `${e.lado === 1 ? "Reagente" : "Produto"}: ${b.coef[i] > 1 ? b.coef[i] + " " : ""}${Q.fq(e.f)}`, ph: "quantidade", unidades: ["g", "mol"], unidadePadrao: "g" });
          c.el.querySelector(".c-rot").innerHTML = c.el.querySelector(".c-rot").textContent.replace(/^(Reagente|Produto): /, '<em>$1</em> ') ;
          c.el.querySelector(".c-rot").innerHTML = `<em>${e.lado === 1 ? "Reagente" : "Produto"}</em> ${b.coef[i] > 1 ? b.coef[i] + " " : ""}${Q.fq(e.f)}`;
          linhas.push(c);
          tabela.appendChild(c.el);
          c.input.addEventListener("input", debounce(calc, 250)); c.sel.addEventListener("change", calc);
        });
        // rendimento
        const rendBox = el("details", "rend");
        rendBox.innerHTML = `<summary>Calcular rendimento (opcional)</summary>`;
        rendSel = el("select", "sel");
        b.especies.forEach((e, i) => { if (e.lado === -1) { const o = el("option", "", e.f); o.value = i; rendSel.appendChild(o); } });
        rendCampo = campo({ rotulo: "Quanto se obteve de verdade", ph: "quantidade real", unidades: ["g", "mol"], unidadePadrao: "g" });
        rendBox.append(el("small", "dica", "Produto obtido na prática:"), rendSel, rendCampo.el);
        tabela.appendChild(rendBox);
        rendCampo.input.addEventListener("input", debounce(calc, 250)); rendSel.addEventListener("change", calc); rendCampo.sel.addEventListener("change", calc);
        calc();
      }
      function calc() {
        const v = f.texto();
        const entradas = linhas.map((c, i) => ({ i, valor: c.num(), un: c.unidade() })).filter((e) => e.valor != null && e.valor > 0);
        if (!entradas.length) { res.innerHTML = ""; res._r = null; return; }
        const rend = rendCampo && rendCampo.num() > 0 ? { i: +rendSel.value, valor: rendCampo.num(), un: rendCampo.unidade() } : null;
        const r = Q.passosEstequiometria(v, entradas, rend);
        if (r.ok) {
          r.respostaHTML = r.prod.filter((p) => !p.reag).map((p) => `${Q.fq(p.f)}: <b>${Q.num(p.massa)}</b> g (${Q.num(p.mol)} mol)`).join("<br>") + `<br><small>Reagente limitante: ${Q.fq(r.balanco.especies[r.limite].f)}${r.rendimento != null ? ` · rendimento ${Q.num(r.rendimento, 4)}%` : ""}</small>`;
        }
        mostrar(res, r);
      }
      f.input.addEventListener("input", debounce(montarTabela, 300));
      const api = { recalcular: calc, definirEq(eq) { f.set(eq); montarTabela(); } };
      if (equacaoCompartilhada) { f.set(equacaoCompartilhada); montarTabela(); }
      return api;
    },
    aoAbrir(api) { if (equacaoCompartilhada && api.definirEq) { api.definirEq(equacaoCompartilhada); equacaoCompartilhada = ""; } },
  });

  // 5. Soluções
  FERR.push({
    id: "solucoes", nome: "Soluções", prat: "diluicao",
    resumo: "Molaridade e diluição: deixe em branco o que você quer descobrir.",
    montar(raiz) {
      const sub = ui.segmentado({ itens: [{ id: "mol", rotulo: "Molaridade" }, { id: "dil", rotulo: "Diluição" }], valor: "mol", onChange: (id) => { painelM.hidden = id !== "mol"; painelD.hidden = id !== "dil"; } });
      // molaridade
      const painelM = el("div");
      const fM = campo({ rotulo: "Molaridade M", ph: "mol/L", sufixo: "mol/L" });
      const fm = campo({ rotulo: "Massa do soluto m", ph: "gramas", sufixo: "g" });
      const fV = campo({ rotulo: "Volume da solução V", ph: "volume", unidades: ["L", "mL"], unidadePadrao: "L" });
      const fMM = campo({ rotulo: "Massa molar do soluto MM", ph: "g/mol", sufixo: "g/mol" });
      const fF = campo({ rotulo: "Ou digite a fórmula para achar a MM", ph: "Ex.: NaOH", tipo: "texto" });
      fF.input.addEventListener("input", () => { const p = Q.parseFormula(fF.texto()); if (p.ok) fMM.set(Q.num(Q.massaMolar(p).total, 5).replace(/ /g, "")); });
      const resM = resultadoBox();
      const btM = ui.botao("Calcular", () => {
        let V = fV.num(); if (V != null && fV.unidade() === "mL") V /= 1000;
        const r = Q.passosMolaridade({ M: fM.num(), m: fm.num(), V, MM: fMM.num() });
        if (r.ok) r.respostaHTML = `${{ M: "M", m: "m", V: "V", MM: "MM" }[r.incognita]} = <b>${Q.num(r.valor)}</b> ${{ M: "mol/L", m: "g", V: "L", MM: "g/mol" }[r.incognita]}`;
        mostrar(resM, r);
      });
      painelM.append(el("p", "dica-form", "Preencha três campos e deixe <b>um em branco</b>."), grade(fM, fm, fV, fMM), fF.el, btM, resM);
      // diluição
      const painelD = el("div"); painelD.hidden = true;
      const dC1 = campo({ rotulo: "Concentração inicial C₁", ph: "ex.: 2" }), dV1 = campo({ rotulo: "Volume inicial V₁", ph: "ex.: 50" });
      const dC2 = campo({ rotulo: "Concentração final C₂", ph: "em branco = incógnita" }), dV2 = campo({ rotulo: "Volume final V₂", ph: "ex.: 200" });
      const resD = resultadoBox();
      const btD = ui.botao("Calcular", () => {
        const r = Q.passosDiluicao({ C1: dC1.num(), V1: dV1.num(), C2: dC2.num(), V2: dV2.num() });
        if (r.ok) r.respostaHTML = `${r.incognita.replace("1", "₁").replace("2", "₂")} = <b>${Q.num(r.valor)}</b>`;
        mostrar(resD, r);
      });
      painelD.append(el("p", "dica-form", "C₁·V₁ = C₂·V₂. Preencha três campos e deixe <b>um em branco</b>. Use a mesma unidade de volume nos dois lados."), grade(dC1, dV1, dC2, dV2), btD, resD);
      raiz.append(sub.el, painelM, painelD);
      return {};
    },
  });

  // 6. pH
  FERR.push({
    id: "ph", nome: "pH e equilíbrio", prat: "ph",
    resumo: "pH de ácidos e bases fortes e fracos, e conversões entre pH, pOH, [H⁺] e [OH⁻].",
    montar(raiz) {
      const tipos = [["acido-forte", "Ácido forte"], ["base-forte", "Base forte"], ["acido-fraco", "Ácido fraco"], ["base-fraca", "Base fraca"], ["conv", "Converter"]];
      let tipo = "acido-forte";
      const seg = ui.segmentado({ itens: tipos.map(([id, r]) => ({ id, rotulo: r })), valor: tipo, onChange: (id) => { tipo = id; ajustar(); } });
      const C = campo({ rotulo: "Concentração C", ph: "ex.: 0,01 ou 1e-3", sufixo: "mol/L" });
      const nu = campo({ rotulo: "Nº de H⁺ (ou OH⁻) liberados por fórmula", ph: "1", valor: "1", ajuda: "HCl = 1, H₂SO₄ = 2, NaOH = 1, Ca(OH)₂ = 2" });
      const K = campo({ rotulo: "Constante Ka (ou Kb)", ph: "ex.: 1,8e-5" });
      const cv = el("select", "sel"); for (const [v, t] of [["ph", "pH"], ["poh", "pOH"], ["h", "[H⁺] (mol/L)"], ["oh", "[OH⁻] (mol/L)"]]) { const o = el("option", "", t); o.value = v; cv.appendChild(o); }
      const cvL = el("label", "campo"); cvL.append(el("span", "c-rot", "Eu tenho:"), cv);
      const V = campo({ rotulo: "Valor", ph: "ex.: 3 ou 1e-4" });
      const res = resultadoBox();
      const bt = ui.botao("Calcular", () => {
        const dados = { tipo };
        if (tipo === "conv") { dados.tipo = cv.value; dados.valor = V.num(); }
        else { dados.C = C.num(); dados.nu = nu.num() || 1; dados.K = K.num(); }
        const r = Q.passosPH(dados);
        if (r.ok) r.respostaHTML = `pH = <b>${Q.num(r.ph, 4)}</b>`;
        mostrar(res, r);
      });
      function ajustar() {
        const forte = tipo === "acido-forte" || tipo === "base-forte";
        const fraco = tipo === "acido-fraco" || tipo === "base-fraca";
        C.el.hidden = tipo === "conv"; nu.el.hidden = !forte; K.el.hidden = !fraco; cvL.hidden = V.el.hidden = tipo !== "conv";
        K.el.querySelector(".c-rot").textContent = tipo === "base-fraca" ? "Constante Kb" : "Constante Ka";
        nu.el.querySelector(".c-rot").textContent = tipo === "acido-forte" ? "Nº de H⁺ liberados" : "Nº de OH⁻ liberados";
      }
      raiz.append(seg.el, grade(C, nu, K), cvL, V.el, bt, res);
      ajustar();
      return {};
    },
  });

  // 7. Gases
  FERR.push({
    id: "gases", nome: "Gases ideais", prat: "gas",
    resumo: "PV = nRT: preencha três valores e deixe em branco o que quer descobrir.",
    montar(raiz) {
      const P = campo({ rotulo: "Pressão P", ph: "valor", unidades: ["atm", "kPa", "Pa", "mmHg", "bar"], unidadePadrao: "atm" });
      const V = campo({ rotulo: "Volume V", ph: "valor", unidades: ["L", "mL", "m³", "cm³"], unidadePadrao: "L" });
      const n = campo({ rotulo: "Quantidade de gás n", ph: "valor", sufixo: "mol" });
      const T = campo({ rotulo: "Temperatura T", ph: "valor", unidades: ["K", "°C"], unidadePadrao: "K" });
      const cntp = ui.chips({ itens: [{ id: "cntp", rotulo: "CNTP (1 atm e 0 °C)" }, { id: "amb", rotulo: "Ambiente (1 atm e 25 °C)" }], onClick: (id) => { P.set("1"); P.sel.value = "atm"; T.sel.value = "°C"; T.set(id === "cntp" ? "0" : "25"); } });
      const res = resultadoBox();
      const bt = ui.botao("Resolver", () => {
        const r = Q.passosGas({ P: P.num(), V: V.num(), n: n.num(), T: T.num(), uP: P.unidade(), uV: V.unidade(), uT: T.unidade() });
        if (r.ok) r.respostaHTML = `${r.incognita} = <b>${Q.num(r.valor, 4)}</b> ${r.unidade}`;
        mostrar(res, r);
      });
      raiz.append(el("p", "dica-form", "Preencha três campos e deixe <b>um em branco</b>."), cntp.el, grade(P, V, n, T), bt, res);
      return {};
    },
  });

  // 8. Distribuição eletrônica
  FERR.push({
    id: "eletrons", nome: "Distribuição eletrônica",
    resumo: "Diagrama de Pauling, camadas, orbitais (regra de Hund) e números quânticos.",
    montar(raiz) {
      const f = campo({ rotulo: "Elemento (símbolo ou número atômico)", ph: "Ex.: Fe ou 26", tipo: "texto" });
      const carga = campo({ rotulo: "Carga do íon (opcional)", ph: "0", valor: "0", ajuda: "Ex.: 3 para Fe³⁺, −1 para Cl⁻" });
      const ex = ui.chips({ itens: ["H", "C", "O", "Na", "Cl", "Fe", "Cr", "Cu"].map((x) => ({ id: x, rotulo: x })), onClick: (id) => { f.set(id); calc(); } });
      const res = resultadoBox();
      raiz.append(grade(f, carga), ex.el, res);
      function acharZ(t) {
        if (!t) return null;
        if (/^\d+$/.test(t)) return +t;
        const e = Q.elementos()[t[0].toUpperCase() + t.slice(1).toLowerCase()];
        return e ? e.n : NaN;
      }
      function calc() {
        const t = f.texto();
        if (!t) { res.innerHTML = ""; res._r = null; res.appendChild(dicaInicial("Digite um elemento para ver a distribuição eletrônica.")); return; }
        const Z = acharZ(t);
        if (isNaN(Z) || Z == null) { mostrar(res, { ok: false, erro: `Não reconheci "${t}". Digite um símbolo (Fe) ou o número atômico (26).` }); return; }
        const ch = Q.lerNumero(carga.texto() || "0");
        const r = Q.passosEletronica(Z, isNaN(ch) ? 0 : ch);
        if (r.ok) r.respostaHTML = `<span class="conf">${r.config}</span><br><small>${r.el.nome} · grupo ${r.grupo || "—"} · período ${r.periodo} · bloco ${r.bloco}</small>`;
        mostrar(res, r, {
          extra: (rr) => {
            const bt = ui.botao("Ver este átomo no Laboratório →", () => { LAB.ativar("atomo"); LAB.atomoDefinir(Z, Math.max(Math.round(rr.el.m) - Z, 0)); }, "sec");
            return bt;
          },
        });
      }
      f.input.addEventListener("input", debounce(calc, 220)); carga.input.addEventListener("input", debounce(calc, 220));
      calc();
      return { recalcular: calc };
    },
  });

  // ---------- exercícios ----------
  function praticar(raiz, tipo) {
    raiz.innerHTML = "";
    const pts = ler("estudo.q.pontos", { ok: 0, total: 0, seq: 0, melhor: 0 });
    const placar = el("div", "placar");
    const att = () => { placar.innerHTML = `<span>Acertos <b>${pts.ok}/${pts.total}</b></span><span>Sequência <b>${pts.seq}</b></span><span>Melhor <b>${pts.melhor}</b></span>`; };
    att();
    const card = el("div", "ex-card");
    const caixa = el("div", "ex-resp");
    const inp = el("input"); inp.type = "text"; inp.inputMode = tipo === "balancear" ? "text" : "decimal"; inp.placeholder = tipo === "balancear" ? "ex.: 2, 1, 2" : "sua resposta"; inp.autocomplete = "off";
    const unSpan = el("span", "ex-un");
    caixa.append(inp, unSpan);
    const fb = el("div", "ex-fb");
    const passosBox = el("div", "ex-passos"); passosBox.hidden = true;
    const bts = el("div", "linha-bt");
    let ex, respondido = false;
    const btConf = ui.botao("Conferir", () => conferir());
    const btVer = ui.botao("Ver resolução", () => { passosBox.hidden = !passosBox.hidden; if (!passosBox.hidden) renderPassos(passosBox, ex.passos); }, "sec");
    const btOutro = ui.botao("Outro exercício →", () => novo(), "sec");
    bts.append(btConf, btVer);
    function novo() {
      ex = Q.gerarExercicio(tipo);
      respondido = false;
      card.innerHTML = `<small>Exercício</small><div class="ex-en">${ex.enunciado}</div>`;
      inp.value = ""; fb.innerHTML = ""; fb.className = "ex-fb"; passosBox.hidden = true; passosBox.innerHTML = "";
      unSpan.textContent = ex.unidade || "";
      bts.innerHTML = ""; bts.append(btConf, btVer);
      inp.focus({ preventScroll: true });
    }
    function conferir() {
      const t = inp.value.trim();
      if (!t) { fb.className = "ex-fb aviso"; fb.textContent = "Digite uma resposta primeiro."; return; }
      const c = Q.conferir(ex, t);
      if (c === null) { fb.className = "ex-fb aviso"; fb.textContent = "Não entendi esse número. Use vírgula ou ponto (ex.: 18,02)."; return; }
      if (!respondido) {
        pts.total++;
        if (c) { pts.ok++; pts.seq++; pts.melhor = Math.max(pts.melhor, pts.seq); } else pts.seq = 0;
        guardar("estudo.q.pontos", pts); att();
        respondido = true;
      }
      if (c) { fb.className = "ex-fb certo"; fb.innerHTML = `<b>Certo!</b> ${ex.tipo === "lista" ? "" : "Resposta: " + ex.texto}`; }
      else {
        fb.className = "ex-fb errado";
        let dica = "";
        if (ex.tipo !== "lista") { const v = Q.lerNumero(t); if (Math.abs(v - ex.resposta) / Math.abs(ex.resposta) < 0.15) dica = " Está perto: confira os arredondamentos e as unidades."; }
        fb.innerHTML = `<b>Ainda não.</b>${dica} Abra a resolução para ver onde pode ter errado.`;
      }
      bts.innerHTML = ""; bts.append(btVer, btOutro);
      if (c) btOutro.classList.remove("sec");
    }
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter") { if (respondido) novo(); else conferir(); } });
    raiz.append(placar, card, caixa, fb, bts, passosBox);
    novo();
  }

  // ---------- casca do módulo ----------
  function criar(caixa) {
    caixa.classList.add("est");
    const wrap = el("div", "est-wrap");
    caixa.appendChild(wrap);
    wrap.innerHTML = `
      <div class="est-head">
        <div><h3>Química</h3><p>Resolva passo a passo ou treine com exercícios novos.</p></div>
      </div>`;
    const opcoes = el("details", "est-opc");
    opcoes.innerHTML = "<summary>Opções: massas atômicas e modo guiado</summary>";
    const segMassas = ui.segmentado({ itens: [{ id: "p", rotulo: "Massas precisas" }, { id: "e", rotulo: "Massas de livro" }], valor: "p", onChange: (id) => { Q.config.escolar = id === "e"; if (ferrAtual && ferrAtual.api && ferrAtual.api.recalcular) ferrAtual.api.recalcular(); if (modo === "treino") abrir(ferrAtual.def.id); } });
    segMassas.el.title = "Alguns professores usam massas arredondadas (H = 1, C = 12, O = 16, Cl = 35,5...).";
    const segGuia = ui.segmentado({ itens: [{ id: "t", rotulo: "Tudo de uma vez" }, { id: "g", rotulo: "Passo a passo guiado" }], valor: "t", onChange: (id) => { guiado = id === "g"; repintarPassos(); } });
    opcoes.append(segMassas.el, segGuia.el);
    const abas = ui.segmentado({ itens: FERR.map((f) => ({ id: f.id, rotulo: f.nome })), valor: FERR[0].id, onChange: (id) => abrir(id), cls: "est-abas" });
    const modoSeg = ui.segmentado({ itens: [{ id: "resolver", rotulo: "Resolver" }, { id: "treino", rotulo: "Praticar" }], valor: "resolver", onChange: (id) => { modo = id; abrir(ferrAtual.def.id); } });
    const resumo = el("p", "est-resumo");
    const painel = el("div", "est-painel");
    wrap.append(abas.el, resumo, modoSeg.el, opcoes, painel);
    wrap.appendChild(el("p", "est-rodape", "Cada resultado é calculado por um algoritmo e traz a conta completa: dá para conferir qualquer passo. Quando seu professor usar valores diferentes (massas arredondadas, outra temperatura), use a opção \"Massas de livro\" ou compare os passos."));

    let modo = "resolver";
    let ferrAtual = null;
    const cache = {};
    const ctx = { irPara: (id) => { abas.set(id); abrir(id); } };

    function abrir(id) {
      const def = FERR.find((x) => x.id === id);
      painel.innerHTML = "";
      resumo.textContent = def.resumo;
      abas.set(id);
      modoSeg.el.hidden = !def.prat;
      if (!def.prat && modo === "treino") { modo = "resolver"; modoSeg.set("resolver"); }
      const area = el("div");
      painel.appendChild(area);
      if (modo === "treino" && def.prat) { praticar(area, def.prat); ferrAtual = { def, api: null }; return; }
      const api = def.montar(area, ctx);
      ferrAtual = { def, api };
      if (def.aoAbrir) def.aoAbrir(api);
    }
    abrir(FERR[0].id);

    return {
      iniciar() { /* sem animação contínua */ },
      parar() {},
      abrir,
    };
  }

  LAB.modulos.push({
    id: "quimica",
    grupo: "estudo",
    nome: "Química",
    resumo: "Resolva passo a passo e pratique",
    cor: "#2ee6b6",
    selo: "verificavel",
    icone: '<svg viewBox="0 0 24 24"><path d="M9 3h6"/><path d="M10 3v6.2L4.6 18.3A2 2 0 0 0 6.3 21h11.4a2 2 0 0 0 1.7-2.7L14 9.2V3"/><path d="M7.5 14h9"/></svg>',
    nota: {
      real: [
        "Cada resultado é calculado por um algoritmo (não por IA) e mostra a conta completa: você pode conferir passo a passo.",
        "As massas atômicas vêm da tabela periódica do app (valores médios); há um modo \"massas de livro\" com valores arredondados.",
        "O balanceador usa álgebra com frações exatas e avisa quando a equação não tem solução única.",
        "Os exercícios são gerados com números novos e conferidos pelo mesmo motor que resolve.",
      ],
      simplificado: [
        "Gases são tratados como ideais; o pH usa Kw = 10⁻¹⁴ (25 °C) e não considera a autoionização da água em soluções muito diluídas.",
        "Não há equações iônicas, oxirredução ou equilíbrios múltiplos por enquanto.",
        "A distribuição eletrônica usa as configurações medidas dos elementos neutros; para íons, aplica a regra geral de remover elétrons da camada mais externa.",
      ],
    },
    criar,
  });

  // A Física chega a seguir: já aparece no menu, para mostrar o caminho
  LAB.modulos.push({
    id: "fisica", grupo: "estudo", emBreve: true, nome: "Física", resumo: "Em breve", cor: "#4da3ff", selo: "verificavel",
    icone: '<svg viewBox="0 0 24 24"><path d="M4 18c3-9 5-9 8 0s5 9 8 0"/><path d="M3 12h18"/></svg>',
    nota: { real: [], simplificado: [] }, criar() { return { iniciar() {}, parar() {} }; },
  });
})();
