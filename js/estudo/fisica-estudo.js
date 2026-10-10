/*
 * Estudo: Física
 * Resolvedor de fórmulas com unidades, circuitos, lançamentos, conversor e exercícios.
 */
(function () {
  "use strict";
  const LAB = window.LAB;
  const F = window.FCalc;
  const E = LAB.estudo;
  const { el, ui } = LAB;
  const { campo, grade, mostrar, resultadoBox, dicaInicial, debounce } = E;
  const { VARS, U, TOPICOS } = F;
  const COR = "#4da3ff";

  const FERR = [];
  const est = { topico: "cinematica", alvo: null, ordem: [], campos: new Map(), uSaida: null };
  let parar = () => {};

  const unidadesDe = (id) => {
    const d = VARS[id].dim;
    const lista = Object.keys(U[d].u);
    return lista.length ? lista : null;
  };
  const padraoUn = (id) => VARS[id].pref || U[VARS[id].dim].si;
  const rotuloVar = (id) => `<em>${VARS[id].sim}</em> ${VARS[id].nome}`;

  function novoCampo(id) {
    const c = campo({
      rotulo: rotuloVar(id), ph: "valor", unidades: unidadesDe(id), unidadePadrao: unidadesDe(id) ? padraoUn(id) : null,
      valor: VARS[id].padrao ? String(F.config.g).replace(".", ",") : "",
    });
    return c;
  }

  // ---------- 1. Fórmulas ----------
  FERR.push({
    id: "formulas", nome: "Fórmulas", prat: "formulas",
    resumo: "Diga o que o problema pede e o que ele dá: a ferramenta escolhe a fórmula, isola, converte as unidades e resolve.",
    montar(raiz, ctx) {
      const topo = el("div", "chips");
      const dica = el("small", "dica");
      const bAlvo = el("div", "chips");
      const bForm = el("div", "chips quebra");
      const dados = el("div", "campos");
      const bAdd = el("div", "chips");
      const saida = el("div", "saida-un");
      const res = resultadoBox();
      const rot = (t) => el("span", "c-rot", t);
      const rAlvo = rot("1. O que o problema pede?");
      const rForm = rot("Fórmulas com essa grandeza (toque para trazer os dados que ela precisa)");
      const rDados = rot("2. Dados do problema");
      const rAdd = rot("Adicionar dado");
      raiz.append(topo, dica, rAlvo, bAlvo, rForm, bForm, rDados, dados, rAdd, bAdd, saida, res);

      const tp = () => TOPICOS.find((x) => x.id === est.topico);
      const chip = (html, on, fn, titulo) => { const b = el("button", "chip2" + (on ? " on" : ""), html); b.type = "button"; b.style.setProperty("--c", COR); if (titulo) b.title = titulo; b.addEventListener("click", fn); return b; };
      const garantir = (id) => { if (!est.campos.has(id)) { const c = novoCampo(id); c.input.addEventListener("input", calc0); if (c.sel) c.sel.addEventListener("change", calc0); est.campos.set(id, c); } return est.campos.get(id); };
      const adicionar = (id) => { if (id === est.alvo) return; if (!est.ordem.includes(id)) est.ordem.push(id); garantir(id); };

      function pintar() {
        const t = tp();
        topo.innerHTML = "";
        TOPICOS.forEach((x) => topo.appendChild(chip(x.nome, x.id === est.topico, () => { est.topico = x.id; est.alvo = null; est.ordem = []; est.campos.clear(); pintar(); })));
        dica.textContent = t.dica || "";
        dica.hidden = !t.dica;
        bAlvo.innerHTML = "";
        t.vars.forEach((id) => bAlvo.appendChild(chip(`${VARS[id].sim} <small>${VARS[id].nome}</small>`, id === est.alvo, () => {
          est.alvo = est.alvo === id ? null : id;
          est.ordem = est.ordem.filter((x) => x !== est.alvo);
          est.uSaida = null;
          pintar();
        })));
        bForm.innerHTML = ""; rForm.hidden = bForm.hidden = !est.alvo;
        if (est.alvo) t.equacoes.filter((e) => e.vars.includes(est.alvo)).forEach((e) => bForm.appendChild(chip(`${e.nome}`, false, () => { e.vars.forEach(adicionar); pintar(); calc(); }, e.forma.replace(/<[^>]+>/g, ""))));
        // g já preenchido
        t.vars.forEach((id) => { if (VARS[id].padrao && id !== est.alvo && !est.ordem.includes(id)) { /* só aparece quando usado */ } });
        dados.innerHTML = "";
        est.ordem.forEach((id) => {
          const c = garantir(id);
          const w = el("div", "campo-w");
          w.appendChild(c.el);
          const x = el("button", "campo-x", "×"); x.type = "button"; x.setAttribute("aria-label", "Remover " + VARS[id].nome);
          x.addEventListener("click", () => { est.ordem = est.ordem.filter((k) => k !== id); pintar(); calc(); });
          w.appendChild(x);
          dados.appendChild(w);
        });
        rDados.hidden = false;
        bAdd.innerHTML = "";
        t.vars.filter((id) => id !== est.alvo && !est.ordem.includes(id)).forEach((id) => bAdd.appendChild(chip(`+ ${VARS[id].sim}`, false, () => { adicionar(id); pintar(); const c = est.campos.get(id); if (c && !VARS[id].padrao) c.input.focus(); }, VARS[id].nome)));
        saida.innerHTML = "";
        if (est.alvo && unidadesDe(est.alvo)) {
          const sel = el("select", "sel");
          unidadesDe(est.alvo).forEach((u) => { const o = el("option", "", u); o.value = u; sel.appendChild(o); });
          sel.value = est.uSaida || padraoUn(est.alvo);
          sel.addEventListener("change", () => { est.uSaida = sel.value; calc(); });
          saida.append(el("span", "c-rot", `Mostrar a resposta em`), sel);
        }
        calc();
      }
      function calc() {
        if (!est.alvo) { res.innerHTML = ""; res._r = null; res.appendChild(dicaInicial("Escolha o assunto e toque na grandeza que o problema pede (por exemplo, a força F).")); return; }
        const d = {};
        for (const id of est.ordem) {
          const c = est.campos.get(id);
          if (!c || c.texto() === "") continue;
          const v = c.num();
          if (!isFinite(v)) { res.innerHTML = ""; res._r = null; res.appendChild(el("div", "res-erro", `<b>Hmm:</b> não entendi o valor de ${VARS[id].nome}. Use vírgula ou ponto (ex.: 9,8 ou 3e8).`)); return; }
          d[id] = { v, u: c.unidade() || "" };
        }
        if (!Object.keys(d).length) { res.innerHTML = ""; res._r = null; res.appendChild(dicaInicial("Agora preencha os dados. Dica: toque numa fórmula acima para trazer os campos que ela usa.")); return; }
        mostrar(res, F.resolver(est.topico, d, est.alvo, est.uSaida));
      }
      const calc0 = debounce(calc, 220);
      // veio do Formulário
      if (est.preset) { const p = est.preset; est.preset = null; est.topico = p.topico; est.alvo = p.alvo; est.ordem = []; est.campos.clear(); p.eq.vars.filter((v) => v !== p.alvo).forEach(adicionar); }
      pintar();
      return { recalcular: calc };
    },
  });

  // ---------- 2. Circuitos ----------
  FERR.push({
    id: "circuitos", nome: "Circuitos", prat: "circ",
    resumo: "Resistência equivalente de associações em série e paralelo, com corrente e tensão em cada resistor.",
    montar(raiz) {
      const f = campo({ rotulo: "Associação de resistores (Ω)", ph: "Ex.: 6 + (12 | 4)", tipo: "texto" });
      const tec = el("div", "teclado");
      for (const s of ["+", "|", "(", ")"]) {
        const b = el("button", "", s); b.type = "button";
        b.addEventListener("click", () => { const i = f.input.selectionStart ?? f.input.value.length; const ins = s === "+" || s === "|" ? ` ${s} ` : s; f.input.value = f.input.value.slice(0, i) + ins + f.input.value.slice(i); f.input.focus(); calc(); });
        tec.appendChild(b);
      }
      const v = campo({ rotulo: "Tensão da fonte (opcional)", ph: "Ex.: 12", sufixo: "V" });
      const ex = ui.chips({ itens: ["10 + 20 + 30", "10 | 10", "6 + (12 | 4)", "(2 + 3) | 5 | 10", "1k + 2,2k"].map((x) => ({ id: x, rotulo: x.replace(/\|/g, "∥") })), onClick: (_, b) => { f.set(b.textContent.replace(/∥/g, "|")); calc(); } });
      const res = resultadoBox();
      raiz.append(f.el, tec, el("small", "dica", "<b>+</b> = em série · <b>|</b> (ou ∥) = em paralelo · use parênteses para agrupar. Aceita 1k, 2,2k, 1M."), v.el, el("small", "dica", "Exemplos:"), ex.el, res);
      function calc() {
        const t = f.texto().replace(/∥/g, "|");
        if (!t) { res.innerHTML = ""; res._r = null; res.appendChild(dicaInicial("Digite a associação. Ex.: 6 + (12 | 4) é um resistor de 6 Ω em série com dois em paralelo.")); return; }
        mostrar(res, F.passosCircuito(t, v.texto() === "" ? null : v.num()));
      }
      f.input.addEventListener("input", debounce(calc, 220)); v.input.addEventListener("input", debounce(calc, 220));
      calc();
      return { recalcular: calc };
    },
  });

  // ---------- 3. Lançamento ----------
  FERR.push({
    id: "lancamento", nome: "Lançamento", prat: "lanc",
    resumo: "Lançamento oblíquo (ou horizontal): componentes, altura máxima, tempo no ar e alcance, com a trajetória desenhada.",
    montar(raiz) {
      const v0 = campo({ rotulo: "Velocidade inicial", ph: "Ex.: 20", unidades: ["m/s", "km/h"], unidadePadrao: "m/s", valor: "20" });
      const th = campo({ rotulo: "Ângulo com a horizontal", ph: "Ex.: 45", sufixo: "°", valor: "45" });
      const h0 = campo({ rotulo: "Altura inicial", ph: "0", sufixo: "m", valor: "0" });
      const res = resultadoBox();
      const cv = el("canvas", "lanc-cv");
      cv.height = 200;
      const bt = ui.botao("▶ Animar o lançamento", () => animar(), "sec");
      raiz.append(grade(v0, th, h0), el("small", "dica", `Sem resistência do ar. g = ${String(F.config.g).replace(".", ",")} m/s² (mude em “Opções”).`), cv, bt, res);
      let ult = null, raf = 0;
      function desenhar(ate) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = cv.clientWidth || 320, h = 200;
        if (cv.width !== Math.round(w * dpr)) cv.width = Math.round(w * dpr);
        cv.height = Math.round(h * dpr);
        const g = cv.getContext("2d");
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.clearRect(0, 0, w, h);
        if (!ult) return;
        const m = 26, W = w - 2 * m, H = h - 2 * m - 6;
        const xmax = Math.max(ult.A, 1), ymax = Math.max(ult.hmax, 1);
        const esc = Math.min(W / xmax, H / ymax);
        const X = (x) => m + x * esc, Y = (y) => h - m - y * esc;
        g.strokeStyle = "rgba(255,255,255,.25)"; g.lineWidth = 1;
        g.beginPath(); g.moveTo(m, Y(0)); g.lineTo(w - m + 10, Y(0)); g.moveTo(m, Y(0)); g.lineTo(m, 10); g.stroke();
        g.fillStyle = "rgba(255,255,255,.55)"; g.font = "11px 'Space Grotesk', sans-serif";
        g.fillText("0", m - 4, Y(0) + 14);
        g.fillText(`${F.num(ult.A)} m`, Math.min(X(ult.A) - 18, w - 60), Y(0) + 14);
        g.fillText(`${F.num(ult.hmax)} m`, m + 4, Y(ult.hmax) - 4);
        g.setLineDash([4, 4]); g.strokeStyle = "rgba(255,255,255,.18)";
        g.beginPath(); g.moveTo(m, Y(ult.hmax)); g.lineTo(X(ult.pts.find((p) => p[1] >= ult.hmax - 1e-9)?.[0] ?? 0), Y(ult.hmax)); g.stroke(); g.setLineDash([]);
        g.strokeStyle = COR; g.lineWidth = 2.5; g.lineCap = "round";
        g.beginPath();
        const lim = ate == null ? ult.pts.length : ate + 1;
        ult.pts.slice(0, lim).forEach((p, i) => (i ? g.lineTo(X(p[0]), Y(p[1])) : g.moveTo(X(p[0]), Y(p[1]))));
        g.stroke();
        const p = ult.pts[Math.min(lim - 1, ult.pts.length - 1)];
        g.fillStyle = "#fff"; g.shadowColor = COR; g.shadowBlur = 12;
        g.beginPath(); g.arc(X(p[0]), Y(p[1]), 5, 0, 7); g.fill(); g.shadowBlur = 0;
      }
      function animar() {
        cancelAnimationFrame(raf);
        if (!ult) return;
        const t0 = performance.now(), dur = Math.min(Math.max(ult.tT * 350, 900), 3500);
        const passo = (now) => {
          const k = Math.min((now - t0) / dur, 1);
          desenhar(Math.floor(k * (ult.pts.length - 1)));
          if (k < 1) raf = requestAnimationFrame(passo);
        };
        raf = requestAnimationFrame(passo);
      }
      parar = () => cancelAnimationFrame(raf);
      function calc() {
        cancelAnimationFrame(raf);
        let v = v0.num();
        if (v != null && v0.unidade() === "km/h") v /= 3.6;
        const r = F.passosLancamento({ v0: v, th: th.num() ?? 45, h0: h0.num() ?? 0, g: F.config.g });
        ult = r.ok ? r : null;
        mostrar(res, r);
        desenhar();
      }
      [v0.input, th.input, h0.input].forEach((i) => i.addEventListener("input", debounce(calc, 220)));
      v0.sel.addEventListener("change", calc);
      new ResizeObserver(() => desenhar()).observe(cv);
      calc();
      return { recalcular: calc };
    },
  });

  // ---------- 4. Conversor ----------
  FERR.push({
    id: "conversor", nome: "Unidades", prat: "conv",
    resumo: "Converta entre unidades mostrando o fator de conversão (km/h ↔ m/s, kWh ↔ J, atm ↔ Pa, °C ↔ K...).",
    montar(raiz) {
      const dims = [...F.CONV_DIMS, "temp"];
      const nomeDim = (d) => (d === "temp" ? "Temperatura" : F.NOME_DIM[d] || d);
      const selDim = el("select", "sel sel-cheio");
      dims.forEach((d) => { const o = el("option", "", nomeDim(d)); o.value = d; selDim.appendChild(o); });
      selDim.value = "vel";
      const v = campo({ rotulo: "Valor", ph: "Ex.: 72", valor: "72" });
      const de = el("select", "sel"), para = el("select", "sel");
      const cx = el("div", "conv-linha");
      const troca = el("button", "conv-troca", "⇄"); troca.type = "button"; troca.setAttribute("aria-label", "Trocar unidades");
      cx.append(de, troca, para);
      const res = resultadoBox();
      raiz.append(el("span", "c-rot", "Grandeza"), selDim, v.el, el("span", "c-rot", "De → Para"), cx, res);
      function unidades() {
        const lista = selDim.value === "temp" ? F.TEMP : Object.keys(U[selDim.value].u);
        [de, para].forEach((s) => { s.innerHTML = ""; lista.forEach((u) => { const o = el("option", "", u); o.value = u; s.appendChild(o); }); });
        de.value = selDim.value === "vel" ? "km/h" : lista[Math.min(1, lista.length - 1)];
        para.value = selDim.value === "vel" ? "m/s" : lista[0];
      }
      function calc() {
        const x = v.num();
        if (x == null) { res.innerHTML = ""; res._r = null; res.appendChild(dicaInicial("Digite o valor a converter.")); return; }
        mostrar(res, F.passosConversao(selDim.value, x, de.value, para.value));
      }
      selDim.addEventListener("change", () => { unidades(); calc(); });
      [de, para].forEach((s) => s.addEventListener("change", calc));
      troca.addEventListener("click", () => { const a = de.value; de.value = para.value; para.value = a; calc(); });
      v.input.addEventListener("input", debounce(calc, 200));
      unidades(); calc();
      return { recalcular: calc };
    },
  });

  // ---------- 5. Formulário ----------
  FERR.push({
    id: "formulario", nome: "Formulário",
    resumo: "Todas as fórmulas do app, com o significado de cada letra e a unidade no SI. Toque em “Resolver” para usar uma delas.",
    montar(raiz, ctx) {
      const busca = campo({ rotulo: "Procurar", ph: "Ex.: energia, Ohm, pêndulo...", tipo: "texto" });
      const lista = el("div", "form-lista");
      raiz.append(busca.el, lista);
      const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
      function pintar() {
        const q = norm(busca.texto());
        lista.innerHTML = "";
        TOPICOS.forEach((t) => {
          const es = t.equacoes.filter((e) => !q || norm(e.nome + " " + e.vars.map((v) => VARS[v].nome).join(" ") + " " + t.nome).includes(q));
          if (!es.length) return;
          lista.appendChild(el("h4", "form-topo", t.nome));
          es.forEach((e) => {
            const c = el("div", "form-card");
            c.innerHTML = `<b>${e.nome}</b><div class="eq">${e.forma}</div><div class="form-vars">${e.vars.map((v) => `<span><em>${VARS[v].sim}</em> ${VARS[v].nome} <i>${U[VARS[v].dim].si || "adim."}</i></span>`).join("")}${(e.consts || []).filter((k) => k.val).map((k) => `<span><em>${k.txt}</em> ${k.nome} <i>${k.val}</i></span>`).join("")}</div>`;
            const alvos = el("div", "chips quebra");
            alvos.appendChild(el("small", "dica", "Resolver para:"));
            e.vars.forEach((v) => { const b = el("button", "chip2", VARS[v].sim); b.type = "button"; b.style.setProperty("--c", COR); b.title = VARS[v].nome; b.addEventListener("click", () => { est.preset = { topico: t.id, alvo: v, eq: e }; ctx.irPara("formulas"); }); alvos.appendChild(b); });
            c.appendChild(alvos);
            lista.appendChild(c);
          });
        });
        if (!lista.children.length) lista.appendChild(dicaInicial("Nenhuma fórmula encontrada."));
      }
      busca.input.addEventListener("input", debounce(pintar, 150));
      pintar();
      return {};
    },
  });

  // ---------- casca ----------
  function criar(caixa) {
    caixa.classList.add("est");
    const wrap = el("div", "est-wrap");
    caixa.appendChild(wrap);
    wrap.innerHTML = `<div class="est-head"><div><h3>Física</h3><p>Resolva passo a passo, com unidades, ou treine com exercícios novos.</p></div></div>`;
    const opcoes = el("details", "est-opc");
    opcoes.innerHTML = "<summary>Opções: valor de g e modo guiado</summary>";
    const segG = ui.segmentado({ itens: [{ id: "9.8", rotulo: "g = 9,8 m/s²" }, { id: "10", rotulo: "g = 10 m/s²" }, { id: "9.81", rotulo: "g = 9,81 m/s²" }], valor: String(F.config.g), onChange: (id) => { F.config.g = +id; est.campos.forEach((c, k) => { if (VARS[k].padrao) c.set(String(F.config.g).replace(".", ",")); }); abrir(ferrAtual.def.id); } });
    segG.el.title = "Muitos professores usam g = 10 m/s² para facilitar as contas.";
    const segGuia = ui.segmentado({ itens: [{ id: "t", rotulo: "Tudo de uma vez" }, { id: "g", rotulo: "Passo a passo guiado" }], valor: E.guiado ? "g" : "t", onChange: (id) => { E.guiado = id === "g"; E.repintarPassos(); } });
    opcoes.append(segG.el, segGuia.el);
    const abas = ui.segmentado({ itens: FERR.map((f) => ({ id: f.id, rotulo: f.nome })), valor: FERR[0].id, onChange: (id) => abrir(id), cls: "est-abas" });
    const modoSeg = ui.segmentado({ itens: [{ id: "resolver", rotulo: "Resolver" }, { id: "treino", rotulo: "Praticar" }], valor: "resolver", onChange: (id) => { modo = id; abrir(ferrAtual.def.id); } });
    const resumo = el("p", "est-resumo");
    const painel = el("div", "est-painel");
    wrap.append(abas.el, resumo, modoSeg.el, opcoes, painel);
    wrap.appendChild(el("p", "est-rodape", "Cada resultado é calculado por um algoritmo e traz a conta completa, com conversão de unidades e conferência dimensional. As fórmulas valem nas condições usuais do ensino médio e do ciclo básico da faculdade (partícula, sem resistência do ar, campos uniformes)."));

    let modo = "resolver", ferrAtual = null;
    const ctx = { irPara: (id) => { abas.set(id); abrir(id); } };
    function abrir(id) {
      const def = FERR.find((x) => x.id === id);
      parar();
      painel.innerHTML = "";
      resumo.textContent = def.resumo;
      abas.set(id);
      modoSeg.el.hidden = !def.prat;
      if (!def.prat && modo === "treino") { modo = "resolver"; modoSeg.set("resolver"); }
      const area = el("div");
      painel.appendChild(area);
      if (modo === "treino" && def.prat) { E.praticar(area, def.prat, F, "estudo.f.pontos"); ferrAtual = { def, api: null }; return; }
      const api = def.montar(area, ctx);
      ferrAtual = { def, api };
    }
    abrir(FERR[0].id);
    return { iniciar() {}, parar() { parar(); }, abrir };
  }

  LAB.modulos.push({
    id: "fisica",
    grupo: "estudo",
    nome: "Física",
    resumo: "Fórmulas com unidades, circuitos e lançamentos",
    cor: COR,
    selo: "verificavel",
    icone: '<svg viewBox="0 0 24 24"><path d="M4 18c3-9 5-9 8 0s5 9 8 0"/><path d="M3 12h18"/></svg>',
    nota: {
      real: [
        "Cada resultado é calculado por um algoritmo (não por IA) e mostra a fórmula, o isolamento, a substituição e a conferência de unidades.",
        "Se os dados não bastam, o resolvedor combina várias fórmulas (por exemplo, v → γ → Δt na relatividade) e mostra cada etapa.",
        "Todas as fórmulas são testadas em ida e volta: isolar qualquer grandeza e substituir devolve o valor original.",
        "As constantes (G, k, c, h) usam valores do CODATA.",
      ],
      simplificado: [
        "Mecânica de partícula: sem resistência do ar, atrito só quando informado, campos uniformes.",
        "O sinal das cargas e a direção dos vetores não são tratados; as fórmulas usam módulos.",
        "A fórmula de Bohr vale só para átomos com um elétron.",
      ],
    },
    criar,
  });
})();
