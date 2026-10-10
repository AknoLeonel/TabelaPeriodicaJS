/*
 * Estudo: base compartilhada pelos módulos (Química, Física, Matemática, Pesquisa).
 * Componentes de formulário, passo a passo, modo prática e a casca do módulo.
 */
(function () {
  "use strict";
  const LAB = window.LAB;
  const { el, ui } = LAB;

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

  // ---------- exercícios ----------
  function praticar(raiz, tipo, motor = Q, chave = "estudo.q.pontos") {
    raiz.innerHTML = "";
    const pts = ler(chave, { ok: 0, total: 0, seq: 0, melhor: 0 });
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
      ex = motor.gerarExercicio(tipo);
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
      const c = motor.conferir(ex, t);
      if (c === null) { fb.className = "ex-fb aviso"; fb.textContent = "Não entendi esse número. Use vírgula ou ponto (ex.: 18,02)."; return; }
      if (!respondido) {
        pts.total++;
        if (c) { pts.ok++; pts.seq++; pts.melhor = Math.max(pts.melhor, pts.seq); } else pts.seq = 0;
        guardar(chave, pts); att();
        respondido = true;
      }
      if (c) { fb.className = "ex-fb certo"; fb.innerHTML = `<b>Certo!</b> ${ex.tipo === "lista" ? "" : "Resposta: " + ex.texto}`; }
      else {
        fb.className = "ex-fb errado";
        let dica = "";
        if (ex.tipo !== "lista") { const v = motor.lerNumero(t); if (Math.abs(v - ex.resposta) / Math.abs(ex.resposta) < 0.15) dica = " Está perto: confira os arredondamentos e as unidades."; }
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
  // cfg: { id, nome, sub, cor, icone, selo, nota, ferr, motor, chave, rodape, opcoes(api) }
  // ferr: lista de ferramentas { id, nome, resumo, teoria, prat, montar(raiz, ctx) }
  const FERRAMENTAS = {};
  function modulo(cfg) {
    const FERR = FERRAMENTAS[cfg.id] = FERRAMENTAS[cfg.id] || [];
    function criar(caixa) {
      caixa.classList.add("est");
      const wrap = el("div", "est-wrap");
      caixa.appendChild(wrap);
      wrap.innerHTML = `<div class="est-head"><div><h3>${cfg.nome}</h3><p>${cfg.sub}</p></div></div>`;
      const opcoes = el("details", "est-opc");
      opcoes.innerHTML = `<summary>Opções${cfg.opcoesTitulo ? ": " + cfg.opcoesTitulo : ""}</summary>`;
      const segGuia = ui.segmentado({ itens: [{ id: "t", rotulo: "Tudo de uma vez" }, { id: "g", rotulo: "Passo a passo guiado" }], valor: guiado ? "g" : "t", onChange: (id) => { guiado = id === "g"; repintarPassos(); } });
      const api = { reabrir: () => abrir(ferrAtual.def.id), recalcular: () => ferrAtual && ferrAtual.api && ferrAtual.api.recalcular && ferrAtual.api.recalcular(), modo: () => modo };
      (cfg.opcoes ? cfg.opcoes(api) : []).forEach((x) => opcoes.appendChild(x));
      opcoes.appendChild(segGuia.el);
      const abas = ui.segmentado({ itens: FERR.map((f) => ({ id: f.id, rotulo: f.nome })), valor: FERR[0].id, onChange: (id) => abrir(id), cls: "est-abas" });
      const modoSeg = ui.segmentado({ itens: [{ id: "resolver", rotulo: "Resolver" }, { id: "treino", rotulo: "Praticar" }], valor: "resolver", onChange: (id) => { modo = id; abrir(ferrAtual.def.id); } });
      const resumo = el("p", "est-resumo");
      const teoria = el("details", "teoria");
      const painel = el("div", "est-painel");
      wrap.append(abas.el, resumo, teoria, modoSeg.el, opcoes, painel);
      if (cfg.rodape) wrap.appendChild(el("p", "est-rodape", cfg.rodape));

      let modo = "resolver", ferrAtual = null;
      const ctx = { irPara: (id) => { abas.set(id); abrir(id); } };
      function abrir(id) {
        const def = FERR.find((x) => x.id === id);
        if (cfg.aoTrocar) cfg.aoTrocar();
        painel.innerHTML = "";
        resumo.textContent = def.resumo;
        teoria.hidden = !def.teoria;
        if (def.teoria) { teoria.innerHTML = `<summary>Entenda a teoria</summary><div class="teoria-c">${def.teoria}</div>`; }
        abas.set(id);
        modoSeg.el.hidden = !def.prat;
        if (!def.prat && modo === "treino") { modo = "resolver"; modoSeg.set("resolver"); }
        const area = el("div");
        painel.appendChild(area);
        if (modo === "treino" && def.prat) { praticar(area, def.prat, cfg.motor, cfg.chave); ferrAtual = { def, api: null }; return; }
        const a = def.montar(area, ctx);
        ferrAtual = { def, api: a };
      }
      abrir(FERR[0].id);
      return { iniciar() {}, parar() { if (cfg.aoTrocar) cfg.aoTrocar(); }, abrir };
    }
    LAB.modulos.push({ id: cfg.id, grupo: "estudo", nome: cfg.nome, resumo: cfg.sub, cor: cfg.cor, selo: cfg.selo || "verificavel", icone: cfg.icone, nota: cfg.nota, criar });
    return FERR;
  }

  LAB.estudo = {
    campo, grade, renderPassos, mostrar, repintarPassos, resultadoBox, dicaInicial, debounce, guardar, ler, praticar, modulo, ferramentas: FERRAMENTAS,
    get guiado() { return guiado; }, set guiado(v) { guiado = !!v; },
  };
})();
