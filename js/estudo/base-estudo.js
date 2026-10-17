/*
 * Estudo: base compartilhada pelos módulos (Química, Física, Matemática, Pesquisa).
 * Componentes de formulário, passo a passo, modo prática e a casca do módulo.
 */
(function () {
  "use strict";
  const LAB = window.LAB;
  const { el, ui } = LAB;
  const obs = window.Obs || { evento() {}, erro() {}, metrica() {}, span: () => ({ fim() {}, falhou() {} }) };
  // utilitários de motion (js/movimento.js); sem eles, tudo funciona sem animação
  const MV = window.Movimento || { entrar: () => Promise.resolve(), revelar: () => Promise.resolve(), deslizar: () => Promise.resolve(), alternar: (_e, a, f) => f(a) };

  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_e) { /* sem armazenamento */ } };
  const ler = (k, padrao) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : padrao; } catch (_e) { return padrao; } };

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
        if (visiveis < passos.length) { lis[visiveis].classList.remove("oculto"); MV.revelar(lis[visiveis]); lis[visiveis].scrollIntoView({ block: "nearest", behavior: "smooth" }); visiveis++; }
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
    // recalcular a cada tecla é frequente: só anima quando o resultado aparece (não a cada atualização)
    const apareceu = !(raiz._r && raiz._r.ok);
    raiz.innerHTML = "";
    if (!r.ok) { raiz._r = r; const e = el("div", "res-erro", `<b>Hmm, não deu:</b> ${r.erro}`); raiz.appendChild(e); return; }
    const card = el("div", "resp");
    if (apareceu) requestAnimationFrame(() => MV.entrar(card, { y: 6, dur: 220 }));
    card.innerHTML = `<small>Resposta</small><div class="resp-v">${r.respostaHTML || r.resposta}</div>`;
    raiz.appendChild(card);
    if (extra) raiz.appendChild(extra(r));
    const cab = el("div", "passos-cab");
    cab.innerHTML = `<h4>Passo a passo</h4>`;
    const cp = ui.botao("Copiar", async () => { try { await navigator.clipboard.writeText(textoPlano(r)); cp.textContent = "Copiado ✓"; setTimeout(() => (cp.textContent = "Copiar"), 1600); } catch (_e) { cp.textContent = "Não consegui copiar"; } }, "sec mini");
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

  // ---------- progresso (domínio por ferramenta, guardado no aparelho) ----------
  // chave "materia/ferramenta": { aula: bool, teste: 0..1, h: [1,0,1...] (últimas respostas), t: data }
  const PROG = "estudo.progresso";
  let progCache = null;
  const progTodos = () => (progCache ||= ler(PROG, {}));
  const progSalvar = () => guardar(PROG, progTodos());
  const ouvintes = new Set();
  const avisarProg = (k) => ouvintes.forEach((f) => { try { f(k); } catch (_e) { /* ignora */ } });
  const progresso = {
    ler: (k) => progTodos()[k] || { aula: false, teste: 0, h: [], t: 0 },
    registrarResposta(k, certo) {
      if (!k) return;
      const p = (progTodos()[k] ||= { aula: false, teste: 0, h: [], t: 0 });
      p.h.push(certo ? 1 : 0); if (p.h.length > 12) p.h.shift(); p.t = Date.now();
      progSalvar(); avisarProg(k);
    },
    registrarTeste(k, frac) {
      const p = (progTodos()[k] ||= { aula: false, teste: 0, h: [], t: 0 });
      p.teste = Math.max(p.teste || 0, frac); if (frac >= 0.75) p.aula = true; p.t = Date.now();
      progSalvar(); avisarProg(k);
    },
    // 0..1: aula concluída (25%), teste rápido (15%), acertos recentes nos exercícios (60%)
    dominio(k) {
      const p = progresso.ler(k);
      const ex = p.h.length ? p.h.reduce((a, b) => a + b, 0) / Math.max(p.h.length, 5) : 0;
      return Math.min(1, (p.aula ? 0.25 : 0) + 0.15 * (p.teste || 0) + 0.6 * ex);
    },
    nivel(d) { return d >= 0.85 ? "Domina" : d >= 0.6 ? "Bom" : d >= 0.3 ? "Aprendendo" : d > 0 ? "Começou" : "Novo"; },
    ouvir: (f) => { ouvintes.add(f); return () => ouvintes.delete(f); },
    todos: progTodos,
    zerar() { progCache = {}; progSalvar(); avisarProg(null); },
  };

  // ---------- uma questão (usada na prática e nos simulados) ----------
  // opc: { motor, aoResponder(certo, valorDigitado), corrigirNaHora = true, rotulo }
  function questao(raiz, ex, opc = {}) {
    const motor = opc.motor || window.QCalc;
    const corrigir = opc.corrigirNaHora !== false;
    const escolha = ex.tipo === "escolha";
    raiz.innerHTML = "";
    const card = el("div", "ex-card");
    card.innerHTML = `<small>${opc.rotulo || "Exercício"}</small><div class="ex-en">${ex.enunciado}</div>`;
    if (ex.grafico && LAB.estudo.grafico) {
      const gr = LAB.estudo.grafico({ interativo: false, leitura: false, ...(ex.graficoOp || {}) }); // sem leitura: não entrega a resposta
      card.querySelector(".ex-en").appendChild(gr.el);
      gr.definir(ex.grafico);
    }
    const caixa = el("div", "ex-resp");
    const inp = el("input"); inp.type = "text";
    inp.inputMode = ex.tipo === "lista" ? "text" : "decimal";
    inp.placeholder = ex.tipo === "lista" ? "ex.: 2, 1, 2" : "sua resposta"; inp.autocomplete = "off";
    inp.setAttribute("aria-label", "Sua resposta");
    caixa.append(inp, el("span", "ex-un", ex.unidade || ""));
    const opcoes = el("div", "ex-opcoes"); opcoes.setAttribute("role", "group"); opcoes.setAttribute("aria-label", "Alternativas");
    const fb = el("div", "ex-fb");
    fb.setAttribute("aria-live", "polite");
    const passosBox = el("div", "ex-passos"); passosBox.hidden = true;
    const bts = el("div", "linha-bt");
    let respondido = false, _escolhida = null;
    const btConf = ui.botao(corrigir ? "Conferir" : "Responder", () => conferir());
    const btVer = ui.botao("Ver resolução", () => { passosBox.hidden = !passosBox.hidden; if (!passosBox.hidden) renderPassos(passosBox, ex.passos); }, "sec");
    caixa.hidden = escolha; opcoes.hidden = !escolha;
    if (escolha) ex.opcoes.forEach((html, i) => {
      const b = el("button", "ex-op", `<i>${"ABCDE"[i]}</i><span>${html}</span>`);
      b.type = "button";
      b.addEventListener("click", () => { if (corrigir) conferir(i); else { _escolhida = i; opcoes.querySelectorAll(".ex-op").forEach((x, j) => x.classList.toggle("marcada", j === i)); opc.aoResponder && opc.aoResponder(null, i); } });
      opcoes.appendChild(b);
    });
    function avaliar(valor) {
      if (escolha) return valor === ex.resposta;
      return motor.conferir(ex, valor);
    }
    function conferir(indice) {
      const valor = escolha ? indice : inp.value.trim();
      if (!escolha && !valor) { fb.className = "ex-fb aviso"; fb.textContent = "Digite uma resposta primeiro."; return; }
      if (respondido && corrigir) return;
      const c = avaliar(valor);
      if (c === null) { fb.className = "ex-fb aviso"; fb.textContent = "Não entendi esse número. Use vírgula ou ponto (ex.: 18,02)."; return; }
      if (!corrigir) { opc.aoResponder && opc.aoResponder(null, valor); fb.className = "ex-fb aviso"; fb.textContent = "Resposta registrada. A correção sai no fim."; return; }
      respondido = true;
      if (escolha) opcoes.querySelectorAll(".ex-op").forEach((b, i) => { b.disabled = true; b.classList.toggle("certa", i === ex.resposta); b.classList.toggle("errada", i === indice && !c); });
      if (c) { fb.className = "ex-fb certo"; fb.innerHTML = `<b>Certo!</b> ${ex.tipo === "lista" || escolha ? "" : "Resposta: " + ex.texto}`; }
      else {
        fb.className = "ex-fb errado";
        let dica = "";
        if (escolha) dica = " A alternativa certa está marcada.";
        else if (ex.tipo !== "lista") { const v = motor.lerNumero(valor); if (Math.abs(v - ex.resposta) / Math.abs(ex.resposta) < 0.15) dica = " Está perto: confira os arredondamentos e as unidades."; }
        fb.innerHTML = `<b>Ainda não.</b>${dica} Abra a resolução para ver onde pode ter errado.`;
      }
      bts.innerHTML = ""; bts.append(btVer);
      opc.aoResponder && opc.aoResponder(c, valor);
    }
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter" && !respondido && corrigir) conferir(); });
    if (!corrigir) {
      // modo prova: a resposta é guardada enquanto se digita, sem mexer no layout
      inp.addEventListener("input", () => opc.aoResponder && opc.aoResponder(null, inp.value.trim() || null));
      fb.className = "ex-fb info";
      fb.textContent = escolha ? "Escolha uma alternativa. A correção sai no fim." : "Sua resposta fica guardada. A correção sai no fim.";
    }
    if (corrigir) bts.append(...(escolha ? [btVer] : [btConf, btVer]));
    raiz.append(card, caixa, opcoes, fb, bts, passosBox);
    if (window.Reportar) raiz.appendChild(window.Reportar.botao({ onde: "exercício", ...(opc.reportar || {}), enunciado: ex.enunciado }));
    return {
      inp, bts,
      respondido: () => respondido,
      // usado pelos simulados: corrige uma resposta guardada
      revelar(valor) {
        respondido = true;
        const c = valor == null || valor === "" ? false : avaliar(valor) === true;
        if (escolha) opcoes.querySelectorAll(".ex-op").forEach((b, i) => { b.disabled = true; b.classList.toggle("certa", i === ex.resposta); b.classList.toggle("errada", i === valor && !c); });
        else { inp.value = valor ?? ""; inp.disabled = true; }
        fb.className = "ex-fb " + (c ? "certo" : "errado");
        fb.innerHTML = c ? "<b>Certo!</b>" : `<b>${valor == null || valor === "" ? "Em branco." : "Errado."}</b> Resposta: ${ex.tipo === "escolha" ? ex.opcoes[ex.resposta] : ex.texto}`;
        bts.innerHTML = ""; bts.append(btVer);
        return c;
      },
      focar: () => !escolha && inp.focus({ preventScroll: true }),
    };
  }

  // ---------- prática: exercícios novos sem fim ----------
  function praticar(raiz, tipo, motor = window.QCalc, chave = "estudo.q.pontos", progChave = null) {
    raiz.innerHTML = "";
    const pts = ler(chave, { ok: 0, total: 0, seq: 0, melhor: 0 });
    const placar = el("div", "placar");
    const att = () => {
      const d = progChave ? progresso.dominio(progChave) : null;
      placar.innerHTML = `<span>Acertos <b>${pts.ok}/${pts.total}</b></span><span>Sequência <b>${pts.seq}</b></span><span>Melhor <b>${pts.melhor}</b></span>${d != null ? `<span class="placar-dom">Domínio deste tópico <b>${Math.round(d * 100)}%</b></span>` : ""}`;
    };
    att();
    const zona = el("div", "ex-zona");
    const btOutro = ui.botao("Outro exercício →", () => novo(), "sec");
    let primeira = true;
    function novo() {
      const ex = motor.gerarExercicio(tipo);
      if (!primeira) requestAnimationFrame(() => MV.deslizar(zona.firstElementChild, 1));
      primeira = false;
      const q = questao(zona, ex, {
        motor,
        reportar: { item: progChave || tipo },
        aoResponder(c) {
          pts.total++;
          if (c) { pts.ok++; pts.seq++; pts.melhor = Math.max(pts.melhor, pts.seq); } else pts.seq = 0;
          guardar(chave, pts);
          progresso.registrarResposta(progChave, c);
          obs.evento("estudo.resposta", { ferramenta: progChave || tipo, tipo, certo: !!c });
          att();
          if (c) btOutro.classList.remove("sec"); else btOutro.classList.add("sec");
          q.bts.appendChild(btOutro);
          btOutro.focus({ preventScroll: true });
        },
      });
      btOutro.classList.add("sec");
      q.focar();
    }
    raiz.append(placar, zona);
    novo();
  }

  // ---------- casca do módulo ----------
  // cfg: { id, nome, sub, cor, icone, selo, nota, motor, chave, rodape, opcoes(api), opcoesTitulo, aoTrocar }
  // Cada ferramenta: { id, nome, resumo, teoria, prat, montar(raiz, ctx) }
  //
  // Layout pensado para estudar sozinho: à esquerda (ou no seletor, no celular) a
  // lista de ferramentas; à direita, uma etapa de cada vez — Entenda, Resolva, Pratique.
  const FERRAMENTAS = {};
  const MATERIAS = {}; // id -> { cfg, ferr } (usado pelos simulados)
  const AULAS = {};    // materia -> { ferramenta -> aula } (arquivos js/estudo/aulas/*.js)
  const ETAPAS = [
    { id: "teoria", n: 1, rotulo: "Aprenda", dica: "a aula" },
    { id: "resolver", n: 2, rotulo: "Resolva", dica: "seu problema" },
    { id: "treino", n: 3, rotulo: "Pratique", dica: "exercícios" },
  ];
  const SETA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  const AJUSTE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>';

  function modulo(cfg) {
    const FERR = FERRAMENTAS[cfg.id] = FERRAMENTAS[cfg.id] || [];
    MATERIAS[cfg.id] = { cfg, ferr: FERR };
    const aulaDe = (def) => (AULAS[cfg.id] || {})[def.id];
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
            <header class="est-ferr-h"><p class="est-kicker"></p><h3></h3><p class="est-resumo"></p><p class="est-dom-h"></p></header>
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
        const abre = ajustes.hidden;
        ajustesBt.setAttribute("aria-expanded", String(abre));
        ajustesBt.classList.toggle("on", abre);
        MV.alternar(ajustes, abre, (v) => { ajustes.hidden = !v; });
      });

      // lista de ferramentas
      const itens = new Map();
      FERR.forEach((f, i) => {
        const b = el("button", "", `<span class="est-n">${String(i + 1).padStart(2, "0")}</span><span class="est-li"><b>${f.nome}</b><small>${f.resumo}</small></span><span class="est-dom" aria-hidden="true"><i></i></span>`);
        b.type = "button";
        b.addEventListener("click", () => { abrir(f.id); fecharLista(); caixa.scrollTo({ top: 0 }); });
        itens.set(f.id, b);
        lista.appendChild(b);
      });
      // domínio de cada ferramenta (barrinha na lista e selo no cabeçalho)
      function pintarDominio() {
        itens.forEach((b, id) => {
          const d = progresso.dominio(`${cfg.id}/${id}`);
          b.querySelector(".est-dom i").style.width = Math.round(d * 100) + "%";
          b.querySelector(".est-dom").dataset.n = progresso.nivel(d);
          b.title = `Domínio: ${Math.round(d * 100)}% (${progresso.nivel(d)})`;
        });
        if (ferrAtual) {
          const d = progresso.dominio(`${cfg.id}/${ferrAtual.def.id}`), p = progresso.ler(`${cfg.id}/${ferrAtual.def.id}`);
          q(".est-dom-h").innerHTML = `<span class="dom-chip" data-n="${progresso.nivel(d)}"><i style="width:${Math.round(d * 100)}%"></i></span> Seu domínio: <b>${Math.round(d * 100)}%</b> · ${progresso.nivel(d)}${p.aula ? " · aula concluída ✓" : ""}`;
        }
      }
      progresso.ouvir(pintarDominio);
      const listaVisivel = () => getComputedStyle(pick).display !== "none"; // no computador a lista é fixa ao lado
      const fecharLista = () => {
        if (!lista.classList.contains("aberta")) return;
        pick.setAttribute("aria-expanded", "false");
        if (!listaVisivel()) { lista.classList.remove("aberta"); return; }
        MV.alternar(lista, false, (v) => lista.classList.toggle("aberta", v));
      };
      pick.addEventListener("click", () => {
        const abre = !lista.classList.contains("aberta");
        pick.setAttribute("aria-expanded", String(abre));
        if (!abre) return fecharLista();
        MV.alternar(lista, true, (v) => lista.classList.toggle("aberta", v));
        itens.get(ferrAtual.def.id)?.scrollIntoView({ block: "nearest" });
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
        if (id === "teoria" && !def.teoria && !aulaDe(def)) id = "resolver";
        if (id === "treino" && !def.prat) id = "resolver";
        etapa = id;
        obs.evento("estudo.etapa", { materia: cfg.id, ferramenta: def.id, etapa: id });
        etapaBt.forEach((b, k) => { b.classList.toggle("on", k === id); b.setAttribute("aria-selected", String(k === id)); });
        if (cfg.aoTrocar) cfg.aoTrocar();
        painel.innerHTML = "";
        painel.dataset.etapa = id;
        const area = el("div", "est-area");
        painel.appendChild(area);
        // troca de etapa/ferramenta: entrada curta (é uma interação frequente)
        if (painel._jaMostrou) MV.entrar(area, { y: 6, dur: 200 });
        painel._jaMostrou = true;
        if (id === "teoria" && aulaDe(def) && LAB.estudo.renderAula) {
          LAB.estudo.renderAula(area, aulaDe(def), { chave: `${cfg.id}/${def.id}`, nome: def.nome, irEtapa, irPara: ctx.irPara, ferr: FERR, temPratica: !!def.prat });
          ferrAtual = { def, api: null };
        } else if (id === "teoria") {
          area.innerHTML = `<div class="teoria-c">${def.teoria}</div>`;
          const prox = el("div", "est-prox");
          prox.appendChild(ui.botao("Resolver um problema →", () => irEtapa("resolver")));
          if (def.prat) prox.appendChild(ui.botao("Treinar com exercícios", () => irEtapa("treino"), "sec"));
          area.appendChild(prox);
          ferrAtual = { def, api: null };
        } else if (id === "treino") {
          praticar(area, def.prat, cfg.motor, cfg.chave, `${cfg.id}/${def.id}`);
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
        etapaBt.get("teoria").hidden = !def.teoria && !aulaDe(def);
        etapaBt.get("treino").hidden = !def.prat;
        // primeira visita a uma ferramenta: começa pela teoria; depois, direto ao problema
        const chave = `${cfg.id}/${def.id}`;
        const primeira = (def.teoria || aulaDe(def)) && !vistas.has(chave);
        if (primeira) { vistas.add(chave); guardar("estudo.vistas", [...vistas]); }
        irEtapa(primeira ? "teoria" : etapa === "teoria" ? "resolver" : etapa);
        guardar(chaveMemoria, def.id);
        pintarDominio();
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
    campo, grade, renderPassos, mostrar, repintarPassos, resultadoBox, dicaInicial, debounce, guardar, ler, praticar, questao, modulo, progresso,
    ferramentas: FERRAMENTAS, materias: MATERIAS, aulas: AULAS,
    get guiado() { return guiado; }, set guiado(v) { guiado = !!v; },
  };
})();
