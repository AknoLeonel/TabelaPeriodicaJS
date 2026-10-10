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
      num: () => { const t = inp.value.trim(); return t === "" ? null : window.QCalc.lerNumero(t); },
      set: (v) => { inp.value = v; },
      unidade: () => (sel ? sel.value : null),
      limpar: () => { inp.value = ""; },
    };
  }
  const grade = (...cs) => { const g = el("div", "campos"); cs.forEach((c) => g.appendChild(c.el || c)); return g; };

  let guiado = !!ler("estudo.guiado", false);
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
    document.querySelectorAll(".est [data-res]").forEach((raiz) => { if (raiz._r && raiz._r.ok) renderPassos(raiz._corpo, raiz._r.passos); });
  }
  const resultadoBox = () => { const d = el("div", "est-res"); d.dataset.res = "1"; return d; };
  const dicaInicial = (t) => el("div", "est-vazio", t);

  // ---------- exercícios ----------
  function praticar(raiz, tipo, motor = window.QCalc, chave = "estudo.q.pontos") {
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
    const opcoes = el("div", "ex-opcoes"); opcoes.setAttribute("role", "group"); opcoes.setAttribute("aria-label", "Alternativas");
    const fb = el("div", "ex-fb");
    const passosBox = el("div", "ex-passos"); passosBox.hidden = true;
    const bts = el("div", "linha-bt");
    let ex, respondido = false;
    const btConf = ui.botao("Conferir", () => conferir());
    const btVer = ui.botao("Ver resolução", () => { passosBox.hidden = !passosBox.hidden; if (!passosBox.hidden) renderPassos(passosBox, ex.passos); }, "sec");
    const btOutro = ui.botao("Outro exercício →", () => novo(), "sec");
    bts.append(btConf, btVer);
    const escolha = () => ex && ex.tipo === "escolha";
    function novo() {
      ex = motor.gerarExercicio(tipo);
      respondido = false;
      card.innerHTML = `<small>Exercício</small><div class="ex-en">${ex.enunciado}</div>`;
      if (ex.grafico && LAB.estudo.grafico) {
        const gr = LAB.estudo.grafico({ interativo: false, leitura: false, ...(ex.graficoOp || {}) }); // sem leitura: não entrega a resposta
        card.querySelector(".ex-en").appendChild(gr.el);
        gr.definir(ex.grafico);
      }
      inp.value = ""; fb.innerHTML = ""; fb.className = "ex-fb"; passosBox.hidden = true; passosBox.innerHTML = "";
      unSpan.textContent = ex.unidade || "";
      caixa.hidden = escolha();
      opcoes.hidden = !escolha();
      opcoes.innerHTML = "";
      if (escolha()) {
        ex.opcoes.forEach((html, i) => {
          const b = el("button", "ex-op", `<i>${"ABCDE"[i]}</i><span>${html}</span>`);
          b.type = "button";
          b.addEventListener("click", () => conferir(i));
          opcoes.appendChild(b);
        });
      }
      bts.innerHTML = ""; bts.append(...(escolha() ? [btVer] : [btConf, btVer]));
      if (!escolha()) inp.focus({ preventScroll: true });
    }
    function conferir(indice) {
      const t = escolha() ? String(indice) : inp.value.trim();
      if (escolha() && indice == null) return;
      if (!t) { fb.className = "ex-fb aviso"; fb.textContent = "Digite uma resposta primeiro."; return; }
      if (escolha() && respondido) return;
      const c = escolha() ? indice === ex.resposta : motor.conferir(ex, t);
      if (escolha()) opcoes.querySelectorAll(".ex-op").forEach((b, i) => { b.disabled = true; b.classList.toggle("certa", i === ex.resposta); b.classList.toggle("errada", i === indice && !c); });
      if (c === null) { fb.className = "ex-fb aviso"; fb.textContent = "Não entendi esse número. Use vírgula ou ponto (ex.: 18,02)."; return; }
      if (!respondido) {
        pts.total++;
        if (c) { pts.ok++; pts.seq++; pts.melhor = Math.max(pts.melhor, pts.seq); } else pts.seq = 0;
        guardar(chave, pts); att();
        respondido = true;
      }
      if (c) { fb.className = "ex-fb certo"; fb.innerHTML = `<b>Certo!</b> ${ex.tipo === "lista" || escolha() ? "" : "Resposta: " + ex.texto}`; }
      else {
        fb.className = "ex-fb errado";
        let dica = "";
        if (escolha()) dica = ` A alternativa certa está marcada.`;
        else if (ex.tipo !== "lista") { const v = motor.lerNumero(t); if (Math.abs(v - ex.resposta) / Math.abs(ex.resposta) < 0.15) dica = " Está perto: confira os arredondamentos e as unidades."; }
        fb.innerHTML = `<b>Ainda não.</b>${dica} Abra a resolução para ver onde pode ter errado.`;
      }
      bts.innerHTML = ""; bts.append(btVer, btOutro);
      if (c) btOutro.classList.remove("sec");
    }
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter") { if (respondido) novo(); else conferir(); } });
    raiz.append(placar, card, caixa, opcoes, fb, bts, passosBox);
    novo();
  }


  // ---------- casca do módulo ----------
  // cfg: { id, nome, sub, cor, icone, selo, nota, motor, chave, rodape, opcoes(api), opcoesTitulo, aoTrocar }
  // Cada ferramenta: { id, nome, resumo, teoria, prat, montar(raiz, ctx) }
  //
  // Layout pensado para estudar sozinho: à esquerda (ou no seletor, no celular) a
  // lista de ferramentas; à direita, uma etapa de cada vez — Entenda, Resolva, Pratique.
  const FERRAMENTAS = {};
  const ETAPAS = [
    { id: "teoria", n: 1, rotulo: "Entenda", dica: "o conceito" },
    { id: "resolver", n: 2, rotulo: "Resolva", dica: "seu problema" },
    { id: "treino", n: 3, rotulo: "Pratique", dica: "exercícios" },
  ];
  const SETA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  const AJUSTE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>';

  function modulo(cfg) {
    const FERR = FERRAMENTAS[cfg.id] = FERRAMENTAS[cfg.id] || [];
    const chaveMemoria = `estudo.${cfg.id}.ultima`;
    const vistas = new Set(ler("estudo.vistas", []));

    function criar(caixa) {
      caixa.classList.add("est");
      caixa.innerHTML = `
        <div class="est-layout">
          <aside class="est-lado">
            <div class="est-materia"><span class="est-ic">${cfg.icone}</span><div><b>${cfg.nome}</b><small>${cfg.sub}</small></div></div>
            <button class="est-pick" type="button" aria-expanded="false"><span class="est-pick-t"><small></small><b></b></span>${SETA}</button>
            <nav class="est-lista" aria-label="Ferramentas de ${cfg.nome}"></nav>
          </aside>
          <article class="est-main">
            <header class="est-ferr-h"><p class="est-kicker"></p><h3></h3><p class="est-resumo"></p></header>
            <div class="est-barra">
              <div class="est-etapas" role="tablist" aria-label="Etapas"></div>
              <button class="est-ajustes-bt" type="button" aria-expanded="false" title="Ajustes">${AJUSTE}<span>Ajustes</span></button>
            </div>
            <section class="est-ajustes" hidden><h4>Ajustes</h4></section>
            <section class="est-painel" aria-live="polite"></section>
            ${cfg.rodape ? `<p class="est-rodape">${cfg.rodape}</p>` : ""}
          </article>
        </div>`;
      const q = (s) => caixa.querySelector(s);
      const lista = q(".est-lista"), pick = q(".est-pick"), painel = q(".est-painel");
      const etapasEl = q(".est-etapas"), ajustes = q(".est-ajustes"), ajustesBt = q(".est-ajustes-bt");

      // ajustes (opções do módulo + modo guiado), num painel que empurra o conteúdo
      const api = { reabrir: () => abrir(ferrAtual.def.id), recalcular: () => ferrAtual && ferrAtual.api && ferrAtual.api.recalcular && ferrAtual.api.recalcular(), modo: () => etapa };
      (cfg.opcoes ? cfg.opcoes(api) : []).forEach((x) => ajustes.appendChild(x));
      const segGuia = ui.segmentado({ itens: [{ id: "t", rotulo: "Mostrar a solução inteira" }, { id: "g", rotulo: "Um passo de cada vez" }], valor: guiado ? "g" : "t", onChange: (id) => { guiado = id === "g"; guardar("estudo.guiado", guiado); repintarPassos(); } });
      ajustes.append(el("p", "est-ajustes-rot", "Passo a passo"), segGuia.el);
      ajustesBt.addEventListener("click", () => {
        ajustes.hidden = !ajustes.hidden;
        ajustesBt.setAttribute("aria-expanded", String(!ajustes.hidden));
        ajustesBt.classList.toggle("on", !ajustes.hidden);
      });

      // lista de ferramentas
      const itens = new Map();
      FERR.forEach((f, i) => {
        const b = el("button", "", `<span class="est-n">${String(i + 1).padStart(2, "0")}</span><span class="est-li"><b>${f.nome}</b><small>${f.resumo}</small></span>`);
        b.type = "button";
        b.addEventListener("click", () => { abrir(f.id); fecharLista(); caixa.scrollTo({ top: 0 }); });
        itens.set(f.id, b);
        lista.appendChild(b);
      });
      const fecharLista = () => { lista.classList.remove("aberta"); pick.setAttribute("aria-expanded", "false"); };
      pick.addEventListener("click", () => {
        const abre = !lista.classList.contains("aberta");
        lista.classList.toggle("aberta", abre);
        pick.setAttribute("aria-expanded", String(abre));
        if (abre) itens.get(ferrAtual.def.id)?.scrollIntoView({ block: "nearest" });
      });

      // etapas
      const etapaBt = new Map();
      for (const e of ETAPAS) {
        const b = el("button", "", `<i>${e.n}</i><span><b>${e.rotulo}</b><small>${e.dica}</small></span>`);
        b.type = "button";
        b.setAttribute("role", "tab");
        b.addEventListener("click", () => irEtapa(e.id));
        etapaBt.set(e.id, b);
        etapasEl.appendChild(b);
      }

      let etapa = "resolver", ferrAtual = null;
      const ctx = { irPara: (id) => { abrir(id); caixa.scrollTo({ top: 0 }); } };

      function irEtapa(id) {
        const def = ferrAtual.def;
        if (id === "teoria" && !def.teoria) id = "resolver";
        if (id === "treino" && !def.prat) id = "resolver";
        etapa = id;
        etapaBt.forEach((b, k) => { b.classList.toggle("on", k === id); b.setAttribute("aria-selected", String(k === id)); });
        if (cfg.aoTrocar) cfg.aoTrocar();
        painel.innerHTML = "";
        painel.dataset.etapa = id;
        const area = el("div", "est-area");
        painel.appendChild(area);
        if (id === "teoria") {
          area.innerHTML = `<div class="teoria-c">${def.teoria}</div>`;
          const prox = el("div", "est-prox");
          prox.appendChild(ui.botao("Resolver um problema →", () => irEtapa("resolver")));
          if (def.prat) prox.appendChild(ui.botao("Treinar com exercícios", () => irEtapa("treino"), "sec"));
          area.appendChild(prox);
          ferrAtual = { def, api: null };
        } else if (id === "treino") {
          praticar(area, def.prat, cfg.motor, cfg.chave);
          ferrAtual = { def, api: null };
        } else {
          ferrAtual = { def, api: def.montar(area, ctx) };
        }
      }

      function abrir(id) {
        const def = FERR.find((x) => x.id === id) || FERR[0];
        ferrAtual = { def, api: null };
        const i = FERR.indexOf(def);
        itens.forEach((b, k) => { b.classList.toggle("on", k === def.id); b.setAttribute("aria-current", k === def.id ? "true" : "false"); });
        q(".est-kicker").textContent = `${cfg.nome} · ferramenta ${i + 1} de ${FERR.length}`;
        q(".est-ferr-h h3").textContent = def.nome;
        q(".est-resumo").textContent = def.resumo;
        pick.querySelector("small").textContent = `Ferramenta ${i + 1} de ${FERR.length}`;
        pick.querySelector("b").textContent = def.nome;
        etapaBt.get("teoria").hidden = !def.teoria;
        etapaBt.get("treino").hidden = !def.prat;
        // primeira visita a uma ferramenta: começa pela teoria; depois, direto ao problema
        const chave = `${cfg.id}/${def.id}`;
        const primeira = def.teoria && !vistas.has(chave);
        if (primeira) { vistas.add(chave); guardar("estudo.vistas", [...vistas]); }
        irEtapa(primeira ? "teoria" : etapa === "teoria" ? "resolver" : etapa);
        guardar(chaveMemoria, def.id);
        if (LAB.estaAberto && LAB.estaAberto() && location.hash.startsWith(`#estudo/${cfg.id}`)) history.replaceState(null, "", `#estudo/${cfg.id}/${def.id}`);
      }

      const doEndereco = decodeURIComponent(location.hash).split("/")[2];
      const inicial = [doEndereco, ler(chaveMemoria, null)].find((x) => x && FERR.some((f) => f.id === x)) || FERR[0].id;
      abrir(inicial);
      return {
        iniciar() { if (location.hash === `#estudo/${cfg.id}` && ferrAtual) history.replaceState(null, "", `#estudo/${cfg.id}/${ferrAtual.def.id}`); },
        parar() { if (cfg.aoTrocar) cfg.aoTrocar(); },
        abrir,
      };
    }
    LAB.modulos.push({ id: cfg.id, grupo: "estudo", nome: cfg.nome, resumo: cfg.sub, cor: cfg.cor, selo: cfg.selo || "verificavel", icone: cfg.icone, nota: cfg.nota, criar });
    return FERR;
  }

  LAB.estudo = {
    campo, grade, renderPassos, mostrar, repintarPassos, resultadoBox, dicaInicial, debounce, guardar, ler, praticar, modulo, ferramentas: FERRAMENTAS,
    get guiado() { return guiado; }, set guiado(v) { guiado = !!v; },
  };
})();
