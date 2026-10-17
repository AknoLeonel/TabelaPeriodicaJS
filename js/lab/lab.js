/*
 * Casca do laboratório e do estudo: abertura em "portal", navegação entre
 * módulos, selo de fidelidade científica, som e carregamento sob demanda.
 *
 * Cada módulo só é baixado quando alguém o abre. O catálogo abaixo guarda o
 * mínimo para desenhar a navegação (nome, cor, ícone) e a lista de arquivos;
 * o arquivo do módulo completa o resto com LAB.modulos.push({ id, criar, nota... }).
 */
(function () {
  "use strict";
  const LAB = window.LAB;
  const { el, ui } = LAB;
  const obs = window.Obs || { evento() {}, erro() {}, metrica() {}, span: () => ({ fim() {}, falhou() {} }) };
  const raiz = document.getElementById("lab");
  const OUT = "cubic-bezier(0.16, 1, 0.3, 1)";

  const ESTUDO_BASE = ["js/estudo/quimica-calc.js", "js/estudo/reportar.js", "js/estudo/base-estudo.js", "js/estudo/grafico.js", "js/estudo/aula.js"];
  const CATALOGO = [
    { id: "atomo", grupo: "lab", nome: "Átomo", resumo: "Monte, decaia e divida qualquer átomo", cor: "#38b6ff", icone: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-60 12 12)"/></svg>', js: ["js/lab/atomo.js"] },
    { id: "decaimento", grupo: "lab", nome: "Decaimento", resumo: "Meia-vida e contador Geiger", cor: "#2ee6b6", icone: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="2.2"/><path d="M12 3a9 9 0 0 1 7.8 4.5L15 10"/><path d="M20.8 15A9 9 0 0 1 12 21l.2-5.5"/><path d="M3.2 15A9 9 0 0 1 4.2 7.5L9 10"/></svg>', js: ["js/lab/decaimento.js"] },
    { id: "reator", grupo: "lab", nome: "Reator", resumo: "Reação em cadeia de fissão", cor: "#ffb23d", icone: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><circle cx="12" cy="12" r="2.4"/></svg>', js: ["js/lab/reator.js"] },
    { id: "estrela", grupo: "lab", nome: "Estrela", resumo: "Fusão nuclear e a curva de energia", cor: "#ff7a45", icone: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg>', js: ["js/lab/estrela.js"] },
    { id: "acelerador", grupo: "lab", nome: "Acelerador", resumo: "Colida partículas e veja o que nasce", cor: "#a46bff", icone: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><path d="M12 3v4.5M12 16.5V21M3 12h4.5M16.5 12H21"/></svg>', js: ["js/lab/acelerador.js"] },
    {
      id: "quimica", grupo: "estudo", nome: "Química", resumo: "Resolva passo a passo ou treine com exercícios novos.", cor: "#2ee6b6", icone: '<svg viewBox="0 0 24 24"><path d="M9 3h6"/><path d="M10 3v6.2L4.6 18.3A2 2 0 0 0 6.3 21h11.4a2 2 0 0 0 1.7-2.7L14 9.2V3"/><path d="M7.5 14h9"/></svg>',
      js: [...ESTUDO_BASE, "js/estudo/quimica-redox-calc.js", "js/estudo/quimica-termo-calc.js", "js/estudo/quimica.js", "js/estudo/quimica-redox.js", "js/estudo/quimica-termo.js", "js/estudo/aulas/quimica.js", "js/estudo/aulas/quimica-base.js", "js/estudo/aulas/quimica-avancada.js"],
      css: ["css/estudo-quimica-redox.css", "css/estudo-quimica-termo.css"],
    },
    { id: "fisica", grupo: "estudo", nome: "Física", resumo: "Resolva passo a passo, com unidades, ou treine com exercícios novos.", cor: "#4da3ff", icone: '<svg viewBox="0 0 24 24"><path d="M4 18c3-9 5-9 8 0s5 9 8 0"/><path d="M3 12h18"/></svg>', js: [...ESTUDO_BASE, "js/estudo/fisica-calc.js", "js/estudo/fisica2-calc.js", "js/estudo/fisica-estudo.js", "js/estudo/fisica-mais.js", "js/estudo/aulas/fisica.js", "js/estudo/aulas/fisica-mais.js"], css: ["css/estudo-fisica.css"] },
    {
      id: "matematica", grupo: "estudo", nome: "Matemática", resumo: "A matemática que aparece em química, física e cálculo, passo a passo.", cor: "#f0a23c", icone: '<svg viewBox="0 0 24 24"><path d="M5 5h6M8 2v6"/><path d="M14 5h6"/><path d="M5 16l5 5M10 16l-5 5"/><path d="M14 17h6M14 20h6"/></svg>',
      js: [...ESTUDO_BASE, "js/estudo/expressao.js", "js/estudo/matematica-calc.js", "js/estudo/matematica.js", "js/estudo/aulas/matematica.js"], css: ["css/estudo-matematica.css"],
    },
    {
      id: "biologia", grupo: "estudo", nome: "Biologia", resumo: "Genética, DNA e populações: cruzamentos, probabilidades e modelos passo a passo.", cor: "#9ccc65",
      icone: '<svg viewBox="0 0 24 24"><path d="M7 3c0 6 10 6 10 12s-10 6-10 6"/><path d="M17 3c0 6-10 6-10 12s10 6 10 6"/><path d="M8.5 6h7M8.5 18h7M10 9.5h4M10 14.5h4"/></svg>',
      js: [...ESTUDO_BASE, "js/estudo/biologia-calc.js", "js/estudo/biologia.js", "js/estudo/aulas/biologia.js"], css: ["css/estudo-biologia.css"],
    },
    {
      id: "pesquisa", grupo: "estudo", nome: "Pesquisa", resumo: "Ferramentas para relatórios de laboratório, TCC e iniciação científica.", cor: "#d9648c", icone: '<svg viewBox="0 0 24 24"><path d="M4 20h16"/><path d="M6 16l4-5 3 3 5-7"/><circle cx="6" cy="16" r="1"/><circle cx="10" cy="11" r="1"/><circle cx="13" cy="14" r="1"/><circle cx="18" cy="7" r="1"/></svg>',
      js: [...ESTUDO_BASE, "js/estudo/expressao.js", "js/estudo/pesquisa-calc.js", "js/estudo/pesquisa.js", "js/estudo/aulas/pesquisa.js"], css: ["css/estudo-pesquisa.css"],
    },
  ];
  // Provas usa os motores de todas as matérias do estudo
  {
    const est = CATALOGO.filter((c) => c.grupo === "estudo");
    CATALOGO.push({
      id: "provas", grupo: "estudo", nome: "Provas", resumo: "Simulados com correção, domínio por tópico e histórico.", cor: "#f2c14e",
      icone: '<svg viewBox="0 0 24 24"><path d="M9 4h6v3H9z"/><path d="M15 5h3v16H6V5h3"/><path d="M9 12l2 2 4-4"/><path d="M9 17h6"/></svg>',
      js: [...new Set(est.flatMap((c) => c.js)), "js/estudo/transferir-calc.js", "js/estudo/provas.js"], css: [...new Set(est.flatMap((c) => c.css || []))],
    });
  }

  // ---------- carregamento sob demanda ----------
  const scripts = new Map(); // src -> Promise
  function carregarJS(lista, aoProgredir) {
    // async = false: os arquivos executam na ordem em que foram pedidos
    let feitos = 0;
    const conta = () => { feitos++; if (aoProgredir) aoProgredir(feitos / lista.length); };
    return Promise.all(lista.map((src) => {
      if (!scripts.has(src)) {
        scripts.set(src, new Promise((ok, falha) => {
          const sc = document.createElement("script");
          sc.src = src;
          sc.async = false;
          sc.onload = ok;
          sc.onerror = () => { scripts.delete(src); sc.remove(); falha(new Error("Falha ao carregar " + src)); };
          document.body.appendChild(sc);
        }));
      }
      return scripts.get(src).then(conta);
    }));
  }
  function carregarCSS(lista = []) {
    for (const href of lista) {
      if (document.querySelector(`link[href="${href}"]`)) continue;
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = href;
      document.head.appendChild(l);
    }
  }
  const definicao = (id) => LAB.modulos.find((x) => x.id === id);
  async function garantir(c, aoProgredir) {
    if (definicao(c.id)) return definicao(c.id);
    const sp = obs.span("modulo.carregar", { modulo: c.id, grupo: c.grupo, arquivos: c.js.length });
    try {
      carregarCSS(c.css);
      await carregarJS(c.js, aoProgredir);
      const d = definicao(c.id);
      if (!d) throw new Error("Módulo não registrado: " + c.id);
      sp.fim();
      return d;
    } catch (e) {
      sp.falhou(e);
      obs.erro(e, { modulo: c.id });
      throw e;
    }
  }
  // pré-carrega em segundo plano os vizinhos do grupo, sem atrapalhar a interação
  function preCarregar(g) {
    const ocioso = window.requestIdleCallback || ((f) => setTimeout(f, 1200));
    ocioso(() => CATALOGO.filter((c) => c.grupo === g && !definicao(c.id)).forEach((c) => garantir(c).catch(() => {})));
  }

  const IC = {
    voltar: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
    som: '<svg viewBox="0 0 24 24"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
    mudo: '<svg viewBox="0 0 24 24"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="m16 9 5 6M21 9l-5 6"/></svg>',
    estudo: '<svg viewBox="0 0 24 24"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 19.5V5.5"/><path d="M9 8h6M9 12h6"/></svg>',
    lab: '<svg viewBox="0 0 24 24"><path d="M9 3h6"/><path d="M10 3v6.2L4.6 18.3A2 2 0 0 0 6.3 21h11.4a2 2 0 0 0 1.7-2.7L14 9.2V3"/><path d="M7.5 14h9"/></svg>',
  };

  raiz.innerHTML = `
    <header class="lab-top surf">
      <button class="lab-back" id="lab-back" type="button" aria-label="Voltar para a tabela">${IC.voltar}<span class="txt">Tabela</span></button>
      <div class="lab-titulo"><h2 id="lab-h">Laboratório</h2><p id="lab-p"></p></div>
      <nav class="lab-nav" id="lab-nav" aria-label="Módulos"></nav>
      <div class="lab-acoes">
        <button class="selo" id="lab-selo" type="button" aria-haspopup="dialog"></button>
        <button class="lab-ic" id="lab-grupo" type="button"></button>
        <button class="lab-ic" id="lab-som" type="button" aria-label="Som">${IC.som}</button>
      </div>
    </header>
    <div class="lab-pop surf" id="lab-pop" role="dialog" aria-label="O que é real e o que é simplificado"></div>
    <div class="lab-corpo" id="lab-corpo"></div>`;

  const $ = (s) => raiz.querySelector(s);
  const corpo = $("#lab-corpo");
  const nav = $("#lab-nav");
  const pop = $("#lab-pop");
  const selo = $("#lab-selo");
  const somBt = $("#lab-som");
  const grupoBt = $("#lab-grupo");
  let grupoAtual = null;
  const doGrupo = (g = grupoAtual) => CATALOGO.filter((c) => c.grupo === g);

  const telas = new Map(); // id -> { caixa, instancia }
  let atual = null;
  let pedido = 0; // descarta trocas antigas quando o usuário clica rápido
  let aberto = false;
  let anima = null;

  function montarNav() {
    nav.innerHTML = "";
    for (const c of doGrupo()) {
      const b = el("button", "", `${c.icone}<span>${c.nome}</span>`);
      b.type = "button";
      b.dataset.id = c.id;
      b.style.setProperty("--m-c", c.cor);
      b.addEventListener("click", () => ativar(c.id));
      nav.appendChild(b);
    }
    const outro = grupoAtual === "lab" ? "estudo" : "lab";
    grupoBt.innerHTML = IC[outro];
    grupoBt.setAttribute("aria-label", outro === "estudo" ? "Ir para o Estudo" : "Ir para o Laboratório");
    grupoBt.title = outro === "estudo" ? "Estudo (passo a passo)" : "Laboratório (simulações)";
    raiz.dataset.grupo = grupoAtual;
  }

  // o módulo que sai faz uma saída curta (mais sutil que a entrada do próximo)
  function esconderTudo(exceto, comAnimacao = true) {
    telas.forEach((t, id) => {
      if (id === exceto) return;
      if (!t.caixa.classList.contains("on")) return;
      t.instancia.parar();
      t.caixa.classList.remove("on");
      if (!comAnimacao || !t.caixa.classList.contains("est") || !window.Movimento || window.Movimento.reduz()) return;
      t.caixa.classList.add("saindo");
      window.Movimento.sair(t.caixa, { y: -6, dur: 140 }).then(() => {
        t.caixa.classList.remove("saindo");
        t.caixa.getAnimations().forEach((a) => a.cancel());
      });
    });
  }

  // enquanto um módulo é baixado: o esqueleto da tela que vai abrir + progresso real
  let carregando = null;
  function mostrarCarregando(c) {
    tirarCarregando();
    const caixa = el("div", "mod-esq");
    caixa.style.setProperty("--m-c", c.cor);
    const M = window.Movimento;
    const barra = M ? M.barra("mod-esq-prog") : null;
    if (barra) caixa.appendChild(barra.el);
    const partes = c.grupo === "estudo"
      ? `<div class="mod-esq-est"><aside>${'<div class="skel skel-item"></div>'.repeat(6)}</aside><main></main></div>`
      : '<div class="mod-esq-lab"><div class="skel skel-canvas"></div><aside></aside></div>';
    caixa.insertAdjacentHTML("beforeend", partes);
    if (M) {
      if (c.grupo === "estudo") caixa.querySelector("main").appendChild(M.esqueleto(["kicker", "titulo", "linha", "abas", "bloco", "linha-curta", "linha"], `Carregando ${c.nome}`));
      else caixa.querySelector("aside").appendChild(M.esqueleto(["titulo", "bloco", "item", "item", "botao"], `Carregando ${c.nome}`));
    }
    corpo.appendChild(caixa);
    carregando = { caixa, barra };
    return carregando;
  }
  function tirarCarregando() {
    if (!carregando) return;
    const { caixa } = carregando;
    carregando = null;
    if (window.Movimento && !window.Movimento.reduz()) window.Movimento.sair(caixa, { y: 0, dur: 120 }).then(() => caixa.remove());
    else caixa.remove();
  }

  // "estudo" e "lab" abrem o último módulo usado daquele grupo
  const ultimo = (g) => { try { return localStorage.getItem("elementar.ultimo." + g); } catch (_e) { return null; } };
  const lembrar = (c) => { try { localStorage.setItem("elementar.ultimo." + c.grupo, c.id); } catch (_e) { /* sem armazenamento */ } };

  async function ativar(id) {
    if (id === "estudo" || id === "lab") id = ultimo(id) || doGrupo(id)[0].id;
    const c = CATALOGO.find((x) => x.id === id) || CATALOGO[0];
    if (atual === c.id && telas.get(c.id)?.caixa.classList.contains("on")) return;
    const meu = ++pedido;
    if (c.grupo !== grupoAtual) { grupoAtual = c.grupo; montarNav(); }
    nav.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.id === c.id));
    raiz.style.setProperty("--lab-c", c.cor);
    $("#lab-h").textContent = c.nome;
    $("#lab-p").textContent = c.resumo;
    pop.classList.remove("on");

    let m = definicao(c.id);
    if (!m) {
      raiz.classList.add("carregando");
      esconderTudo(c.id);
      const esq = mostrarCarregando(c);
      try { m = await garantir(c, (f) => esq.barra && esq.barra.definir(f)); }
      catch (_e) {
        if (meu === pedido) {
          raiz.classList.remove("carregando");
          esq.caixa.innerHTML = "";
          const erro = el("div", "mod-esq-erro", `<b>Não consegui carregar ${c.nome}.</b><span>Verifique a conexão e tente de novo.</span>`);
          erro.appendChild(ui.botao("Tentar de novo", () => { tirarCarregando(); atual = null; ativar(c.id); }));
          esq.caixa.appendChild(erro);
          LAB.avisar("Não consegui carregar este módulo. Verifique a conexão.");
        }
        return;
      }
      if (meu !== pedido) return; // o usuário já foi para outro módulo
      raiz.classList.remove("carregando");
      tirarCarregando();
    }

    esconderTudo(c.id);
    let t = telas.get(c.id);
    if (!t) {
      const caixa = el("div", "mod");
      caixa.style.setProperty("--m-c", c.cor);
      corpo.appendChild(caixa);
      t = { caixa, instancia: m.criar(caixa) };
      telas.set(c.id, t);
    }
    t.caixa.classList.remove("saindo");
    t.caixa.getAnimations().forEach((a) => a.cancel());
    t.caixa.classList.add("on");
    atual = c.id;
    obs.evento("modulo.abrir", { modulo: c.id, grupo: c.grupo });
    lembrar(c);
    const s = LAB.selos[m.selo] || LAB.selos.parcial;
    selo.className = "selo " + s.cls;
    selo.innerHTML = `<span>${s.texto}</span>`;
    pop.innerHTML = `
      <h5 class="r">O que é real aqui</h5><ul>${m.nota.real.map((x) => `<li>${x}</li>`).join("")}</ul>
      <h5 class="s">O que é simplificado</h5><ul>${m.nota.simplificado.map((x) => `<li>${x}</li>`).join("")}</ul>`;
    if (aberto) {
      history.replaceState(null, "", `#${c.grupo}/${c.id}`);
      t.instancia.iniciar();
      preCarregar(c.grupo);
    }
  }

  function abrir(id = "atomo", origem) {
    const jaAberto = aberto;
    aberto = true;
    const pronto = ativar(id);
    if (jaAberto) return pronto;
    raiz.classList.add("on");
    raiz.setAttribute("aria-hidden", "false");
    const x = origem ? origem.x : innerWidth / 2;
    const y = origem ? origem.y : innerHeight / 2;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 20;
    anima?.cancel();
    if (LAB.reduzMovimento) {
      document.body.classList.add("lab-open");
    } else {
      anima = raiz.animate(
        [{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${r}px at ${x}px ${y}px)` }],
        { duration: 600, easing: OUT }
      );
      anima.finished.then(() => { if (aberto) document.body.classList.add("lab-open"); }).catch(() => {});
    }
    return pronto;
  }

  function fechar() {
    if (!aberto) return;
    aberto = false;
    pedido++;
    pop.classList.remove("on");
    raiz.classList.remove("carregando");
    document.body.classList.remove("lab-open");
    telas.forEach((t) => t.instancia.parar()); // para logo, para não competir com a transição
    const b = document.getElementById(grupoAtual === "estudo" ? "estudo-open" : "lab-open");
    const rb = b && b.offsetParent ? b.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
    const x = rb.left + rb.width / 2, y = rb.top + rb.height / 2;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 20;
    anima?.cancel();
    const fim = () => {
      raiz.classList.remove("on");
      raiz.setAttribute("aria-hidden", "true");
      esconderTudo(null, false);
      tirarCarregando();
      atual = null;
    };
    history.replaceState(null, "", location.pathname + location.search);
    if (LAB.reduzMovimento) return fim();
    anima = raiz.animate(
      [{ clipPath: `circle(${r}px at ${x}px ${y}px)` }, { clipPath: `circle(0px at ${x}px ${y}px)` }],
      { duration: 460, easing: "cubic-bezier(0.7, 0, 0.2, 1)", fill: "forwards" }
    );
    anima.finished.then(() => { anima.cancel(); if (!aberto) fim(); }).catch(() => {});
  }

  $("#lab-back").addEventListener("click", fechar);
  grupoBt.addEventListener("click", () => ativar(grupoAtual === "lab" ? "estudo" : "lab"));
  selo.addEventListener("click", () => pop.classList.toggle("on"));
  corpo.addEventListener("pointerdown", () => pop.classList.remove("on"));
  somBt.addEventListener("click", () => {
    LAB.som.mudo = !LAB.som.mudo;
    somBt.classList.toggle("off", LAB.som.mudo);
    somBt.innerHTML = LAB.som.mudo ? IC.mudo : IC.som;
  });
  document.addEventListener("keydown", (e) => {
    if (!aberto) return;
    if (e.key === "Escape") { if (pop.classList.contains("on")) pop.classList.remove("on"); else fechar(); return; }
    if (e.target.matches && e.target.matches("input, textarea, select")) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const n = +e.key;
    const lista = doGrupo();
    if (n >= 1 && n <= lista.length) ativar(lista[n - 1].id);
  });

  // aviso rápido (usa o mesmo balão da página principal)
  LAB.avisar = (msg) => {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("on");
    clearTimeout(LAB._tt);
    LAB._tt = setTimeout(() => t.classList.remove("on"), 2600);
  };
  LAB.catalogo = CATALOGO;
  LAB.abrir = abrir;
  LAB.fechar = fechar;
  LAB.ativar = ativar;
  LAB.estaAberto = () => aberto;
  LAB.instancia = (id) => telas.get(id)?.instancia;
  LAB.pronto = true;
})();
