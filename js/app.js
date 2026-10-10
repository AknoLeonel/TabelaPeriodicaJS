(() => {
  "use strict";

  // ---------------------------------------------------------------------------
  // Dados
  // ---------------------------------------------------------------------------
  const CATEGORIAS = {
    alcalino: { nome: "Metais alcalinos", cor: "#ff4d6d" },
    alcalinoterroso: { nome: "Metais alcalinoterrosos", cor: "#ff9e3d" },
    transicao: { nome: "Metais de transição", cor: "#ffd23f" },
    postransicao: { nome: "Outros metais", cor: "#9be15d" },
    semimetal: { nome: "Semimetais", cor: "#2ee6b6" },
    naometal: { nome: "Não metais", cor: "#38b6ff" },
    halogenio: { nome: "Halogênios", cor: "#6f7bff" },
    nobre: { nome: "Gases nobres", cor: "#a46bff" },
    lantanideo: { nome: "Lantanídeos", cor: "#ff6bd6" },
    actinideo: { nome: "Actinídeos", cor: "#ff9ecf" },
    desconhecido: { nome: "Propriedades desconhecidas", cor: "#9aa3b8" },
  };

  const ESTADOS = {
    s: { nome: "Sólido", cor: "#4da3ff" },
    l: { nome: "Líquido", cor: "#ff9f43" },
    g: { nome: "Gasoso", cor: "#d27bff" },
    x: { nome: "Desconhecido", cor: "#7d8597" },
  };

  const ESCALA = ["#3a2dff", "#0096ff", "#19e3b1", "#ffd23f", "#ff3d6e"];
  const CAMADAS = "KLMNOPQ";

  const elementos = window.DADOS.map((d) => {
    const [nome, ano, por, etimologia, obtencao, usos, curiosidade] = window.DESCRICOES[d.n];
    return { ...d, nome, ano, por, etimologia, obtencao, usos, curiosidade, anoNum: anoNumerico(ano) };
  });

  function anoNumerico(ano) {
    const m = String(ano).match(/\d{4}/);
    if (m) return +m[0];
    if (/XIV/.test(ano)) return 1300;
    return 0; // Antiguidade
  }

  // ---------------------------------------------------------------------------
  // Utilidades
  // ---------------------------------------------------------------------------
  const $ = (sel, root = document) => root.querySelector(sel);
  const reduzMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dur = (ms) => (reduzMovimento ? 1 : ms);
  const CINE = "cubic-bezier(0.7, 0, 0.2, 1)";
  const OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
  const fmt = (v, casas = 2) =>
    v.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  function hexRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function escala(t) {
    t = clamp(t, 0, 1) * (ESCALA.length - 1);
    const i = Math.min(Math.floor(t), ESCALA.length - 2);
    const f = t - i;
    const a = hexRgb(ESCALA[i]);
    const b = hexRgb(ESCALA[i + 1]);
    return "#" + a.map((v, k) => Math.round(v + (b[k] - v) * f).toString(16).padStart(2, "0")).join("");
  }
  function normalizaNome(s) {
    return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  }
  function estadoEm(el, T) {
    if (el.mp == null) return "x";
    if (T < el.mp) return "s";
    if (el.bp == null || T < el.bp) return "l";
    return "g";
  }
  const celsius = (k) => k - 273.15;

  // ---------------------------------------------------------------------------
  // Construção da tabela
  // ---------------------------------------------------------------------------
  const table = $("#table");
  const tiles = new Map();
  let preview;

  function montarTabela() {
    const frag = document.createDocumentFragment();

    preview = document.createElement("div");
    preview.className = "preview";
    preview.innerHTML = `
      <div class="pv-tile"><b></b><span></span></div>
      <div class="pv-body">
        <div class="pv-cat"></div>
        <div class="pv-name"></div>
        <div class="pv-line cfg"></div>
        <div class="pv-line desc"></div>
      </div>`;
    preview.addEventListener("animationend", () => preview.classList.add("in"), { once: true });
    frag.appendChild(preview);

    for (const el of elementos) {
      const b = document.createElement("button");
      b.className = "el";
      b.dataset.n = el.n;
      b.style.gridColumn = el.x;
      b.style.gridRow = el.y;
      b.style.setProperty("--delay", `${Math.round((el.x * 1.1 + el.y * 2.2) * 22)}ms`);
      b.setAttribute("aria-label", `${el.nome}, número atômico ${el.n}`);
      b.innerHTML = `
        <span class="num">${el.n}</span>
        <span class="mass">${fmt(el.m, el.m < 100 ? 2 : 1)}</span>
        <span class="sym">${el.s}</span>
        <span class="name">${el.nome}</span>
        <span class="phase ${el.f}"></span>`;
      b.addEventListener("animationend", () => b.classList.add("in"), { once: true });
      tiles.set(el.n, b);
      frag.appendChild(b);
    }

    const ph = (col, row, txt, cat) => {
      const d = document.createElement("div");
      d.className = "el placeholder in";
      d.style.gridColumn = col;
      d.style.gridRow = row;
      d.style.setProperty("--c", CATEGORIAS[cat].cor);
      d.textContent = txt;
      frag.appendChild(d);
    };
    ph(3, 6, "57–71", "lantanideo");
    ph(3, 7, "89–103", "actinideo");

    for (const [row, txt] of [[9, "Lantanídeos"], [10, "Actinídeos"]]) {
      const l = document.createElement("div");
      l.className = "series-label";
      l.style.gridRow = row;
      l.textContent = txt;
      frag.appendChild(l);
    }

    table.appendChild(frag);
  }

  function atualizarPreview(el) {
    if (!el || preview.dataset.n == el.n) return;
    preview.dataset.n = el.n;
    const cor = corDe(el);
    preview.style.setProperty("--c", cor);
    $(".pv-tile b", preview).textContent = el.s;
    $(".pv-tile span", preview).textContent = el.n;
    $(".pv-cat", preview).textContent = CATEGORIAS[el.c].nome;
    $(".pv-name", preview).textContent = el.nome;
    $(".cfg", preview).innerHTML = `${configHTML(el.cfg)} · ${fmt(el.m, 3)} u`;
    $(".desc", preview).textContent = el.usos;
    const body = $(".pv-body", preview);
    body.classList.remove("pv-swap");
    void body.offsetWidth;
    body.classList.add("pv-swap");
  }

  function configHTML(cfg) {
    return esc(cfg).replace(/([spdf])(\d+)/g, "$1<sup>$2</sup>");
  }

  // ---------------------------------------------------------------------------
  // Modos de visualização
  // ---------------------------------------------------------------------------
  const estado = {
    modo: "categoria",
    temperatura: 298,
    ano: 2025,
    busca: "",
    categoriaFoco: null,
    categoriaFixa: null,
  };

  const MODOS = {
    categoria: { cor: (el) => CATEGORIAS[el.c].cor },
    estado: { cor: (el) => ESTADOS[estadoEm(el, estado.temperatura)].cor },
    eletronegatividade: {
      cor: (el) => (el.en == null ? null : escala((el.en - 0.7) / 3.3)),
      faixa: ["0,7 (baixa)", "4,0 (alta)"],
      titulo: "Eletronegatividade de Pauling",
    },
    raio: {
      cor: (el) => (el.r == null ? null : escala((el.r - 25) / 275)),
      faixa: ["25 pm", "300 pm"],
      titulo: "Raio atômico",
    },
    descoberta: {
      cor: (el) => escala(el.anoNum < 1650 ? 0 : (el.anoNum - 1650) / 360),
      faixa: ["Antiguidade", "2010"],
      titulo: "Ano de descoberta",
    },
  };

  function corDe(el) {
    return MODOS[estado.modo].cor(el) || "#555c6e";
  }

  function aplicarModo() {
    const q = normalizaNome(estado.busca.trim());
    const foco = estado.categoriaFoco || estado.categoriaFixa;
    for (const el of elementos) {
      const t = tiles.get(el.n);
      t.style.setProperty("--c", corDe(el));
      let dim = false;
      if (q) {
        const ok = el.s.toLowerCase() === q || normalizaNome(el.nome).includes(q) || String(el.n) === q || el.s.toLowerCase().startsWith(q);
        dim = !ok;
        t.classList.toggle("match", ok);
      } else t.classList.remove("match");
      if (!q && foco) {
        dim = estado.modo === "categoria" ? el.c !== foco : estado.modo === "estado" ? estadoEm(el, estado.temperatura) !== foco : false;
      }
      if (estado.modo === "descoberta" && el.anoNum > estado.ano) dim = true;
      if (estado.modo === "estado") {
        const ph = $(".phase", t);
        ph.className = "phase " + estadoEm(el, estado.temperatura);
      } else {
        $(".phase", t).className = "phase " + el.f;
      }
      t.classList.toggle("dim", dim);
    }
    if (preview.dataset.n) {
      const n = +preview.dataset.n;
      preview.dataset.n = "";
      atualizarPreview(elementos[n - 1]);
    }
  }

  const legend = $("#legend");
  function montarLegenda() {
    const m = estado.modo;
    legend.innerHTML = "";
    const chip = (key, info) => {
      const c = document.createElement("button");
      c.className = "chip" + (estado.categoriaFixa === key ? " on" : "");
      c.style.setProperty("--c", info.cor);
      c.innerHTML = `<i></i>${info.nome}`;
      c.addEventListener("mouseenter", () => { estado.categoriaFoco = key; aplicarModo(); });
      c.addEventListener("mouseleave", () => { estado.categoriaFoco = null; aplicarModo(); });
      c.addEventListener("click", () => {
        estado.categoriaFixa = estado.categoriaFixa === key ? null : key;
        legend.querySelectorAll(".chip").forEach((x) => x.classList.remove("on"));
        if (estado.categoriaFixa) c.classList.add("on");
        aplicarModo();
      });
      legend.appendChild(c);
    };
    if (m === "categoria") Object.entries(CATEGORIAS).forEach(([k, v]) => chip(k, v));
    else if (m === "estado") Object.entries(ESTADOS).forEach(([k, v]) => chip(k, v));
    else {
      const info = MODOS[m];
      const grad = `linear-gradient(90deg, ${ESCALA.join(",")})`;
      legend.innerHTML = `<div class="scale-bar"><span>${info.titulo}:</span><span>${info.faixa[0]}</span><span class="grad" style="background:${grad}"></span><span>${info.faixa[1]}</span></div>`;
    }
  }

  const control = $("#control");
  const range = $("#control-range");
  const rangeOut = $("#control-value");
  function montarControle() {
    const m = estado.modo;
    if (m === "estado") {
      control.hidden = false;
      $("#control-label").textContent = "Temperatura";
      Object.assign(range, { min: 0, max: 6000, step: 1 });
      range.value = estado.temperatura;
    } else if (m === "descoberta") {
      control.hidden = false;
      $("#control-label").textContent = "Elementos conhecidos até";
      Object.assign(range, { min: 1650, max: 2025, step: 1 });
      range.value = estado.ano;
    } else {
      control.hidden = true;
    }
    atualizarControle();
  }
  function atualizarControle() {
    if (estado.modo === "estado") {
      const T = +range.value;
      rangeOut.textContent = `${Math.round(T)} K · ${Math.round(celsius(T))} °C`;
    } else if (estado.modo === "descoberta") {
      const ano = +range.value;
      const n = elementos.filter((e) => e.anoNum <= ano).length;
      rangeOut.textContent = `${ano} · ${n} elementos`;
    }
  }
  range.addEventListener("input", () => {
    if (estado.modo === "estado") estado.temperatura = +range.value;
    if (estado.modo === "descoberta") estado.ano = +range.value;
    atualizarControle();
    aplicarModo();
  });

  const modes = $("#modes");
  const pill = $(".mode-pill", modes);
  function moverPill() {
    const a = $("button.active", modes);
    pill.style.left = a.offsetLeft + "px";
    pill.style.width = a.offsetWidth + "px";
  }
  modes.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-mode]");
    if (!b) return;
    modes.querySelectorAll("button").forEach((x) => x.classList.toggle("active", x === b));
    estado.modo = b.dataset.mode;
    estado.categoriaFixa = null;
    estado.categoriaFoco = null;
    moverPill();
    montarLegenda();
    montarControle();
    aplicarModo();
  });

  // ---------------------------------------------------------------------------
  // Interação com as células (inclinação 3D e brilho que segue o cursor)
  // ---------------------------------------------------------------------------
  table.addEventListener("pointermove", (e) => {
    const t = e.target.closest(".el:not(.placeholder)");
    if (!t) return;
    const r = t.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    t.style.setProperty("--mx", `${px * 100}%`);
    t.style.setProperty("--my", `${py * 100}%`);
    t.style.setProperty("--ry", `${(px - 0.5) * 22}deg`);
    t.style.setProperty("--rx", `${(0.5 - py) * 22}deg`);
  });
  table.addEventListener("pointerover", (e) => {
    const t = e.target.closest(".el[data-n]");
    if (t) atualizarPreview(elementos[t.dataset.n - 1]);
  });
  table.addEventListener("focusin", (e) => {
    const t = e.target.closest(".el[data-n]");
    if (t) atualizarPreview(elementos[t.dataset.n - 1]);
  });
  table.addEventListener("click", (e) => {
    const t = e.target.closest(".el[data-n]");
    if (t) abrirDetalhe(+t.dataset.n);
  });

  // Busca: símbolo ou número exato primeiro, depois nome que começa com o termo
  function melhorResultado(termo) {
    const q = normalizaNome(termo.trim());
    if (!q) return null;
    const nota = (el) => {
      const nome = normalizaNome(el.nome);
      if (el.s.toLowerCase() === q || String(el.n) === q) return 4;
      if (nome.startsWith(q)) return 3;
      if (el.s.toLowerCase().startsWith(q)) return 2;
      if (nome.includes(q)) return 1;
      return 0;
    };
    let melhor = null;
    let max = 0;
    for (const el of elementos) {
      const v = nota(el);
      if (v > max) { max = v; melhor = el; }
    }
    return melhor;
  }

  const search = $("#search");
  search.addEventListener("input", () => {
    estado.busca = search.value;
    aplicarModo();
  });
  search.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const m = melhorResultado(estado.busca);
      if (m) { search.blur(); abrirDetalhe(m.n); }
    }
    if (e.key === "Escape") { search.value = ""; estado.busca = ""; aplicarModo(); search.blur(); }
  });

  // ---------------------------------------------------------------------------
  // Câmera: zoom cinematográfico sobre a tabela
  // ---------------------------------------------------------------------------
  const panEl = $("#pan");
  const stage = $("#stage");
  const toque = matchMedia("(pointer: coarse)");
  const camera = { rest: { s: 1, x: 0, y: 0 }, L0: 0, T0: 0, transform: "", filter: "" };
  const vista = { s: 1, x: 0, y: 0 };
  const FILTRO_REPOUSO = "blur(0px) brightness(1) saturate(1)";
  const tstr = (v) => `translate(${v.x}px, ${v.y}px) scale(${v.s})`;

  // "Zoom semântico": quando as células são pequenas (celular), o conteúdo delas
  // depende do tamanho que aparecem na tela, e não só do tamanho nominal.
  function atualizarNiveis() {
    const nominal = tiles.get(1).offsetWidth;
    if (nominal >= 40) return table.removeAttribute("data-lv");
    const ef = nominal * vista.s;
    table.dataset.lv = ef < 30 ? "0" : ef < 56 ? "1" : ef < 90 ? "2" : "3";
  }
  function aplicarVista() {
    panEl.style.transform = tstr(vista);
    atualizarNiveis();
  }
  function origemPan() {
    const r = panEl.getBoundingClientRect();
    return { x: r.left - vista.x, y: r.top - vista.y };
  }
  // Mantém a tabela dentro da área visível (centralizada se for menor que ela)
  function escalaMin() {
    const a = stage.getBoundingClientRect();
    return Math.min(1, (a.width - 4) / panEl.offsetWidth, (a.height - 4) / panEl.offsetHeight);
  }
  function limitar(v, o = origemPan()) {
    v.s = clamp(v.s, escalaMin(), 6);
    const area = stage.getBoundingClientRect();
    const W = panEl.offsetWidth * v.s;
    const H = panEl.offsetHeight * v.s;
    v.x = W <= area.width ? area.left + (area.width - W) / 2 - o.x : clamp(v.x, area.right - W - o.x, area.left - o.x);
    v.y = H <= area.height ? area.top + (area.height - H) / 2 - o.y : clamp(v.y, area.bottom - H - o.y, area.top - o.y);
    return v;
  }
  let ajustado = false;
  function ajustarVista(animar = false) {
    if (det.aberto) return;
    if (!toque.matches) { Object.assign(vista, { s: 1, x: 0, y: 0 }); ajustado = false; panEl.style.transform = ""; return atualizarNiveis(); }
    panEl.classList.toggle("anim", animar);
    if (!ajustado) { vista.s = escalaMin(); ajustado = true; }
    limitar(vista);
    aplicarVista();
  }
  function zoomPara(fator, cx, cy) {
    const o = origemPan();
    const area = stage.getBoundingClientRect();
    cx ??= area.left + area.width / 2;
    cy ??= area.top + area.height / 2;
    const s2 = clamp(vista.s * fator, escalaMin(), 6);
    const k = s2 / vista.s;
    vista.x = cx - o.x - (cx - o.x - vista.x) * k;
    vista.y = cy - o.y - (cy - o.y - vista.y) * k;
    vista.s = s2;
    panEl.classList.add("anim");
    limitar(vista, o);
    aplicarVista();
  }

  // Gestos: arrastar com um dedo, pinça com dois
  (function gestos() {
    const ptrs = new Map();
    let ini = null;
    let moveu = false;
    const medidas = () => {
      const [a, b] = [...ptrs.values()];
      return b
        ? { cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2, d: Math.hypot(a.x - b.x, a.y - b.y) || 1 }
        : { cx: a.x, cy: a.y, d: 0 };
    };
    const reiniciar = () => {
      ini = ptrs.size ? { ...medidas(), v: { ...vista }, o: origemPan() } : null;
    };
    stage.addEventListener("pointerdown", (e) => {
      if (!toque.matches || det.aberto || e.pointerType === "mouse") return;
      panEl.classList.remove("anim");
      if (!ptrs.size) moveu = false;
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      reiniciar();
    });
    stage.addEventListener("pointermove", (e) => {
      if (!ptrs.has(e.pointerId) || !ini) return;
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const m = medidas();
      if (!moveu && ptrs.size < 2 && Math.hypot(m.cx - ini.cx, m.cy - ini.cy) < 8) return;
      moveu = true;
      const s2 = clamp(ini.v.s * (ini.d ? m.d / ini.d : 1), escalaMin(), 6);
      // o ponto da tabela sob o centro dos dedos acompanha o centro dos dedos
      const ux = (ini.cx - ini.o.x - ini.v.x) / ini.v.s;
      const uy = (ini.cy - ini.o.y - ini.v.y) / ini.v.s;
      vista.s = s2;
      vista.x = m.cx - ini.o.x - ux * s2;
      vista.y = m.cy - ini.o.y - uy * s2;
      limitar(vista, ini.o);
      aplicarVista();
    });
    const soltar = (e) => {
      if (!ptrs.delete(e.pointerId)) return;
      reiniciar();
    };
    stage.addEventListener("pointerup", soltar);
    stage.addEventListener("pointercancel", soltar);
    // depois de arrastar, o toque não deve abrir o elemento
    stage.addEventListener(
      "click",
      (e) => {
        if (moveu) { e.stopPropagation(); e.preventDefault(); moveu = false; }
      },
      true
    );
  })();

  $("#zoomctl").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-z]");
    if (!b) return;
    if (b.dataset.z === "fit") { vista.s = escalaMin(); ajustarVista(true); }
    else zoomPara(b.dataset.z === "in" ? 1.7 : 1 / 1.7);
  });

  // ---------------------------------------------------------------------------
  // Câmera: zoom cinematográfico sobre a tabela
  // ---------------------------------------------------------------------------
  function centroLocal(n) {
    const t = tiles.get(n);
    return { x: t.offsetLeft + t.offsetWidth / 2, y: t.offsetTop + t.offsetHeight / 2 };
  }
  function fixarRepouso() {
    // retrato da vista em repouso, antes de mover a câmera
    const o = origemPan();
    camera.L0 = o.x;
    camera.T0 = o.y;
    camera.rest = { ...vista };
    camera.transform = tstr(vista);
    camera.filter = FILTRO_REPOUSO;
  }
  function moverCamera(alvo, ms) {
    let destino = { ...camera.rest };
    let filter = FILTRO_REPOUSO;
    if (alvo) {
      // a célula fica onde estava e a tabela cresce a partir dela
      const p = centroLocal(alvo);
      const r = camera.rest;
      const zoom = Math.min(Math.max(toque.matches || innerWidth < 860 ? 7 : 3.4, r.s * 1.5), 9);
      const s2 = Math.min(r.s * zoom, 9);
      const cx = camera.L0 + r.x + r.s * p.x;
      const cy = camera.T0 + r.y + r.s * p.y;
      destino = { s: s2, x: cx - camera.L0 - s2 * p.x, y: cy - camera.T0 - s2 * p.y };
      filter = `blur(${innerWidth < 860 ? 5 : 9}px) brightness(0.55) saturate(1.3)`;
    }
    const from = { transform: camera.transform, filter: camera.filter };
    const to = tstr(destino);
    panEl.getAnimations().forEach((a) => a.cancel());
    panEl.classList.remove("anim");
    panEl.style.transform = to;
    panEl.style.filter = filter;
    camera.transform = to;
    camera.filter = filter;
    if (!alvo) Object.assign(vista, destino);
    return panEl.animate([from, { transform: to, filter }], { duration: dur(ms), easing: CINE });
  }
  function retanguloBase(n) {
    // posição da célula na tela com a câmera em repouso
    const t = tiles.get(n);
    const r = camera.rest;
    return {
      left: camera.L0 + r.x + r.s * t.offsetLeft,
      top: camera.T0 + r.y + r.s * t.offsetTop,
      width: t.offsetWidth * r.s,
      height: t.offsetHeight * r.s,
    };
  }

  // ---------------------------------------------------------------------------
  // Detalhe
  // ---------------------------------------------------------------------------
  const detail = $("#detail");
  const slot = $("#hero-slot");
  const panels = $("#panels");
  const flash = $(".d-flash", detail);
  const backdrop = $(".d-backdrop", detail);
  const bars = detail.querySelectorAll(".letterbox");
  const botoes = detail.querySelectorAll(".d-btn");
  const atomCanvas = $("#atom");

  const det = { aberto: false, n: null, hero: null, ocupado: false, fila: null };

  // Ações pedidas durante uma animação ficam na fila e rodam logo em seguida
  function liberar() {
    det.ocupado = false;
    const proxima = det.fila;
    det.fila = null;
    if (proxima) proxima();
  }

  function criarHero(el) {
    const h = document.createElement("div");
    h.className = "hero";
    h.style.setProperty("--c", CATEGORIAS[el.c].cor);
    h.innerHTML = `
      <div class="h-top"><span>${el.n}</span><span>${fmt(el.m, 3)}</span></div>
      <div class="h-sym">${el.s}</div>
      <div class="h-name">${el.nome}</div>
      <div class="h-cat">${CATEGORIAS[el.c].nome}</div>`;
    detail.appendChild(h);
    return h;
  }
  function slotRect() {
    const r = slot.getBoundingClientRect();
    return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, size: r.width };
  }
  function heroTransform(cx, cy, size, S, extra = "") {
    return `translate(${cx - S / 2}px, ${cy - S / 2}px) perspective(1200px) ${extra} scale(${size / S})`;
  }
  function posicionarHero(h, S) {
    h.style.width = h.style.height = S + "px";
    h.style.setProperty("--hs", S + "px");
  }

  function icone(nome) {
    const p = {
      prop: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
      atom: '<circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-60 12 12)"/>',
      pick: '<path d="M14 4l6 6"/><path d="M4 20l9-9"/><path d="M11 6c3-3 7-3 9 0-3-2-6-1-8 1"/>',
      tool: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>',
      book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5V21h16"/>',
      star: '<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6-4.5-4.2 6.1-.7z"/>',
    }[nome];
    return `<svg viewBox="0 0 24 24">${p}</svg>`;
  }

  function stat(rotulo, valor, casas, unidade, barra) {
    if (valor == null) return `<div class="stat"><div class="k">${rotulo}</div><div class="v">—</div></div>`;
    const b = barra != null ? `<div class="bar"><i data-w="${clamp(barra, 0, 1) * 100}"></i></div>` : "";
    return `<div class="stat"><div class="k">${rotulo}</div><div class="v"><span data-count="${valor}" data-dec="${casas}">0</span><small>${unidade}</small></div>${b}</div>`;
  }

  const METAIS = new Set(["alcalino", "alcalinoterroso", "transicao", "postransicao", "lantanideo", "actinideo"]);
  const radioativo = (el) => el.n === 43 || el.n === 61 || el.n >= 84;
  const sintetico = (el) => el.n === 43 || el.n === 61 || el.n >= 95;

  function chipsHTML(el) {
    const tipo = METAIS.has(el.c) ? "Metal" : el.c === "semimetal" ? "Semimetal" : "Não metal";
    const grupo = el.g ? `Grupo ${el.g}` : el.c === "lantanideo" ? "Lantanídeo" : "Actinídeo";
    const fase = ESTADOS[el.f].nome + (el.n >= 104 ? " (previsto)" : "");
    const itens = [[fase], [tipo], [grupo], [`Período ${el.p}`], [`Bloco ${el.b}`]];
    if (radioativo(el)) itens.push(["Radioativo", "alerta"]);
    if (sintetico(el)) itens.push(["Sintético", "alerta"]);
    return itens.map(([t, k]) => `<span class="tag ${k || ""}">${t}</span>`).join("");
  }

  // Posição do elemento na tabela, em miniatura
  function minimapaHTML(el) {
    const C = 10, G = 1.6, P = C + G;
    const py = (y) => (y <= 7 ? y - 1 : y - 1.6) * P;
    const cel = elementos
      .map((e) => {
        const igual = e.x === el.x && e.y === el.y;
        const guia = !igual && (e.x === el.x || e.y === el.y);
        const cor = CATEGORIAS[e.c].cor;
        const o = igual ? 1 : guia ? 0.55 : 0.2;
        return `<rect x="${(e.x - 1) * P}" y="${py(e.y)}" width="${C}" height="${C}" rx="2.2" fill="${cor}" opacity="${o}"${igual ? ' stroke="#fff" stroke-width="1.6"' : ""}/>`;
      })
      .join("");
    return `<svg class="minimap" viewBox="0 0 ${18 * P} ${9.4 * P}" role="img" aria-label="Posição de ${el.nome} na tabela periódica">${cel}</svg>`;
  }

  // Gráfico: a propriedade ao longo de toda a tabela, com o elemento em destaque
  const PROPS = [
    { k: "en", nome: "Eletronegatividade", un: "", dec: 2 },
    { k: "r", nome: "Raio atômico", un: "pm", dec: 0 },
    { k: "ie", nome: "Ionização", un: "kJ/mol", dec: 0 },
    { k: "d", nome: "Densidade", un: "g/cm³", dec: 3, log: true },
    { k: "mp", nome: "Fusão", un: "°C", dec: 0 },
  ];
  function valorProp(e, p) {
    let v = e[p.k];
    if (v == null) return null;
    if (p.k === "d" && e.f === "g") v /= 1000; // gases vêm em g/L
    if (p.k === "mp") v = celsius(v);
    return v;
  }
  function graficoHTML(el, pi) {
    const p = PROPS[pi];
    const W = 360, H = 132, L = 8, R = 8, T = 22, B = 20;
    const pts = elementos.map((e) => ({ e, v: valorProp(e, p) })).filter((d) => d.v != null && (!p.log || d.v > 0));
    const f = (v) => (p.log ? Math.log10(v) : v);
    const vs = pts.map((d) => f(d.v));
    const lo = Math.min(...vs), hi = Math.max(...vs);
    const X = (n) => L + ((n - 1) / 117) * (W - L - R);
    const Y = (v) => T + (1 - (f(v) - lo) / (hi - lo || 1)) * (H - T - B);
    const atual = valorProp(el, p);

    const guias = [2, 10, 18, 36, 54, 86]
      .map((n) => `<line x1="${X(n) + 1.4}" x2="${X(n) + 1.4}" y1="${T - 6}" y2="${H - B}" class="g"/>`)
      .join("");
    let linha = "";
    let aberto = false;
    for (let n = 1; n <= 118; n++) {
      const d = pts.find((q) => q.e.n === n);
      if (!d) { aberto = false; continue; }
      linha += `${aberto ? "L" : "M"}${X(n).toFixed(1)},${Y(d.v).toFixed(1)}`;
      aberto = true;
    }
    const pontos = pts
      .map((d) => `<circle cx="${X(d.e.n).toFixed(1)}" cy="${Y(d.v).toFixed(1)}" r="1.9" fill="${CATEGORIAS[d.e.c].cor}"/>`)
      .join("");
    let destaque = "";
    let resumo = `<span class="vazio">Sem dados medidos para este elemento.</span>`;
    if (atual != null && (!p.log || atual > 0)) {
      const x = X(el.n), y = Y(atual);
      const rank = pts.filter((d) => d.v > atual).length + 1;
      const txt = `${fmt(atual, p.dec)}${p.un ? " " + p.un : ""}`;
      const ancora = x > W - 70 ? "end" : x < 70 ? "start" : "middle";
      destaque = `
        <line x1="${x}" x2="${x}" y1="${y}" y2="${H - B}" class="guia"/>
        <circle cx="${x}" cy="${y}" r="9" class="halo"/>
        <circle cx="${x}" cy="${y}" r="4.6" fill="#fff" stroke="${CATEGORIAS[el.c].cor}" stroke-width="2.2"/>
        <text x="${x}" y="${Math.max(y - 12, 12)}" text-anchor="${ancora}" class="val">${txt}</text>`;
      resumo = `<b>${rank}º maior valor</b> entre ${pts.length} elementos com dados`;
    }
    return `
      <svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="${p.nome} de todos os elementos, com ${el.nome} em destaque">
        ${guias}
        <path d="${linha}" class="linha"/>
        ${pontos}${destaque}
        <text x="${L}" y="${H - 4}" class="eixo">1</text>
        <text x="${W / 2}" y="${H - 4}" text-anchor="middle" class="eixo">número atômico</text>
        <text x="${W - R}" y="${H - 4}" text-anchor="end" class="eixo">118</text>
      </svg>
      <div class="chart-nota">${resumo}</div>`;
  }

  function renderPaineis(el) {
    pararSim();
    const cat = CATEGORIAS[el.c];
    const unidDens = el.f === "g" ? "g/L" : "g/cm³";
    const camadas = el.sh.map((n, i) => `<span>${n}<small>${CAMADAS[i]}</small></span>`).join("");
    const abas = PROPS.map((p, i) => `<button type="button" data-prop="${i}" class="${i === 0 ? "on" : ""}">${p.nome}</button>`).join("");
    const temSim = el.mp != null;
    panels.innerHTML = `
      <div class="panel p-title">
        <div class="pt-main">
          <div class="eyebrow">${cat.nome}</div>
          <h2 id="d-name">${el.nome}</h2>
          <div class="sub">Número atômico ${el.n} · ${fmt(el.m, 3)} u</div>
        </div>
        ${minimapaHTML(el)}
        <div class="tags">${chipsHTML(el)}</div>
        <button type="button" class="lab-cta" data-z="${el.n}" data-n="${Math.max(Math.round(el.m) - el.n, 0)}">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-60 12 12)"/></svg>
          Montar ${el.nome} no laboratório
        </button>
      </div>
      <div class="panel glass">
        <h3>${icone("prop")}Propriedades</h3>
        <div class="stats">
          ${stat("Massa atômica", el.m, 3, "u")}
          ${stat("Densidade", el.d, el.d < 10 ? 3 : 2, unidDens, el.d != null && el.f !== "g" ? el.d / 22.6 : null)}
          ${stat("Eletronegatividade", el.en, 2, "Pauling", el.en != null ? el.en / 4 : null)}
          ${stat("Raio atômico", el.r, 0, "pm", el.r != null ? el.r / 300 : null)}
          ${stat("Fusão", el.mp != null ? celsius(el.mp) : null, 1, "°C")}
          ${stat("Ebulição", el.bp != null ? celsius(el.bp) : null, 1, "°C")}
          ${stat("1ª energia de ionização", el.ie, 1, "kJ/mol", el.ie != null ? el.ie / 2400 : null)}
          ${stat("Camadas de elétrons", el.sh.length, 0, "")}
        </div>
      </div>
      <div class="panel glass cmp">
        <h3>${icone("prop")}Comparado com todos os elementos</h3>
        <div class="abas" role="tablist">${abas}</div>
        <div class="chart-box" id="chart-box">${graficoHTML(el, 0)}</div>
      </div>
      ${temSim ? simHTML(el) : ""}
      <div class="panel glass">
        <h3>${icone("atom")}Configuração eletrônica</h3>
        <div class="cfg">${configHTML(el.cfg)}</div>
        <div class="shells">${camadas}</div>
      </div>
      <div class="panel glass">
        <h3>${icone("pick")}Onde é encontrado e como é obtido</h3>
        <p>${esc(el.obtencao)}</p>
      </div>
      <div class="panel glass">
        <h3>${icone("tool")}Para que serve</h3>
        <p>${esc(el.usos)}</p>
      </div>
      <div class="panel glass">
        <h3>${icone("book")}Descoberta</h3>
        <div class="timeline"><span class="year">${esc(el.ano)}</span><span class="who">${esc(el.por)}</span></div>
        <p><strong>Origem do nome:</strong> ${esc(el.etimologia)}</p>
      </div>
      <div class="panel glass fun">
        <h3>${icone("star")}Você sabia?</h3>
        <p>${esc(el.curiosidade)}</p>
      </div>`;
    $("#hud").innerHTML = `
      <div><b>${el.n}</b><span>Prótons</span></div>
      <div><b>${el.n}</b><span>Elétrons</span></div>
      <div><b>~${Math.max(Math.round(el.m) - el.n, 0)}</b><span>Nêutrons</span></div>`;
    panels.scrollTop = 0;
    iniciarSim(el);
  }

  panels.addEventListener("click", async (e) => {
    const cta = e.target.closest(".lab-cta");
    if (cta) {
      await abrirLab("atomo", cta);
      window.LAB.atomoDefinir(+cta.dataset.z, +cta.dataset.n);
      return;
    }
    const b = e.target.closest("button[data-prop]");
    if (!b) return;
    panels.querySelectorAll(".abas button").forEach((x) => x.classList.toggle("on", x === b));
    const box = $("#chart-box");
    box.innerHTML = graficoHTML(elementos[det.n - 1], +b.dataset.prop);
    box.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: dur(350), easing: OUT });
  });

  // ---------------------------------------------------------------------------
  // Simulador: o mesmo elemento em outra temperatura
  // ---------------------------------------------------------------------------
  const sim = { raf: 0, el: null, cv: null, ctx: null, p: [], T: 298, w: 0, h: 0, max: 1000 };

  function simHTML(el) {
    const fim = el.bp != null ? el.bp * 1.25 : el.mp * 2;
    const max = Math.max(Math.ceil(fim / 10) * 10, 20);
    const pct = (k) => (k == null ? 100 : clamp((k / max) * 100, 0, 100));
    return `
      <div class="panel glass simbox">
        <h3>${icone("prop")}E se a temperatura mudasse?</h3>
        <div class="sim-top"><span class="fase s" id="sim-fase">Sólido</span><output id="sim-T"></output></div>
        <canvas id="sim-cv" aria-hidden="true"></canvas>
        <input type="range" id="sim-range" min="0" max="${max}" step="${max / 500}" value="${Math.min(298, max)}"
          style="--mp:${pct(el.mp)}%; --bp:${pct(el.bp)}%" aria-label="Temperatura em kelvin">
        <div class="sim-marks"><span>Funde a ${fmt(celsius(el.mp), 0)} °C</span><span>${el.bp != null ? `Ferve a ${fmt(celsius(el.bp), 0)} °C` : "Ebulição sem dados"}</span></div>
      </div>`;
  }

  function fasePorT(el, T) {
    return T < el.mp ? "s" : el.bp == null || T < el.bp ? "l" : "g";
  }

  function iniciarSim(el) {
    const cv = $("#sim-cv");
    if (!cv) return;
    const range = $("#sim-range");
    sim.el = el;
    sim.cv = cv;
    sim.ctx = cv.getContext("2d");
    sim.max = +range.max;
    sim.T = +range.value;
    sim.cor = hexRgb(CATEGORIAS[el.c].cor);
    dimensionarSim();
    const N = 40;
    const cols = 10;
    sim.p = Array.from({ length: N }, (_, i) => {
      const hx = ((i % cols) + 0.5) / cols;
      const hy = (Math.floor(i / cols) + 0.5) / Math.ceil(N / cols);
      return { hx, hy, x: hx * sim.w, y: hy * sim.h, vx: 0, vy: 0 };
    });
    atualizarSimTexto();
    range.addEventListener("input", () => {
      sim.T = +range.value;
      atualizarSimTexto();
      if (reduzMovimento) { for (let k = 0; k < 40; k++) passoSim(); desenharSim(); }
    });
    if (reduzMovimento) { for (let k = 0; k < 40; k++) passoSim(); desenharSim(); return; }
    sim.raf = requestAnimationFrame(loopSim);
  }
  function pararSim() {
    cancelAnimationFrame(sim.raf);
    sim.raf = 0;
  }
  function dimensionarSim() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    sim.w = sim.cv.clientWidth || 300;
    sim.h = sim.cv.clientHeight || 110;
    sim.cv.width = sim.w * dpr;
    sim.cv.height = sim.h * dpr;
    sim.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function atualizarSimTexto() {
    const el = sim.el;
    const f = fasePorT(el, sim.T);
    const tag = $("#sim-fase");
    tag.textContent = ESTADOS[f].nome;
    tag.className = "fase " + f;
    $("#sim-T").textContent = `${fmt(sim.T, sim.T < 20 ? 1 : 0)} K · ${fmt(celsius(sim.T), sim.T < 20 ? 1 : 0)} °C`;
  }
  function passoSim() {
    const { el, w, h, T } = sim;
    const f = fasePorT(el, T);
    const alvoV = f === "g" ? 1.5 + 2.4 * Math.min(1, T / ((el.bp || T) * 1.6)) : f === "l" ? 0.9 + 0.9 * Math.min(1, (T - el.mp) / ((el.bp || el.mp * 2) - el.mp)) : 0;
    for (const q of sim.p) {
      if (f === "s") {
        const k = 0.06;
        const tremor = 0.05 + 0.6 * Math.min(1, T / el.mp);
        q.vx += (q.hx * w - q.x) * k + (Math.random() - 0.5) * tremor;
        q.vy += (q.hy * h - q.y) * k + (Math.random() - 0.5) * tremor;
        q.vx *= 0.82;
        q.vy *= 0.82;
      } else {
        if (f === "l" && q.y < h * 0.4) q.vy += 0.1; // o líquido se acomoda embaixo
        q.vx += (Math.random() - 0.5) * 0.25;
        q.vy += (Math.random() - 0.5) * 0.25;
        const v = Math.hypot(q.vx, q.vy) || 0.01;
        const m = 1 + 0.08 * (alvoV / v - 1);
        q.vx *= m;
        q.vy *= m;
      }
      q.x += q.vx;
      q.y += q.vy;
      if (q.x < 4) { q.x = 4; q.vx = Math.abs(q.vx); }
      if (q.x > w - 4) { q.x = w - 4; q.vx = -Math.abs(q.vx); }
      if (q.y < 4) { q.y = 4; q.vy = Math.abs(q.vy); }
      if (q.y > h - 4) { q.y = h - 4; q.vy = -Math.abs(q.vy); }
    }
  }
  function desenharSim() {
    const { ctx, w, h } = sim;
    const [r, g, b] = sim.cor;
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    const f = fasePorT(sim.el, sim.T);
    const rad = f === "s" ? 4.2 : f === "l" ? 4 : 3.2;
    for (const q of sim.p) {
      const gr = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, rad * 2.6);
      gr.addColorStop(0, "rgba(255,255,255,0.95)");
      gr.addColorStop(0.3, `rgba(${r},${g},${b},0.85)`);
      gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.arc(q.x, q.y, rad * 2.6, 0, 6.2832);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
  }
  function loopSim() {
    if (!sim.cv || !sim.cv.isConnected) return;
    sim.raf = requestAnimationFrame(loopSim);
    if (document.body.classList.contains("lab-open")) return;
    passoSim();
    desenharSim();
  }

  function animarPaineis(atraso) {
    const ps = [...panels.querySelectorAll(".panel")];
    ps.forEach((p, i) => {
      p.animate(
        [
          { opacity: 0, transform: "translateY(70px) rotateX(-12deg) scale(0.96)", filter: "blur(10px)" },
          { opacity: 1, transform: "none", filter: "blur(0px)" },
        ],
        { duration: dur(900), delay: dur(atraso + i * 95), easing: OUT, fill: "both" }
      );
    });
    setTimeout(() => {
      contarNumeros();
      panels.querySelectorAll(".bar i").forEach((i) => (i.style.width = i.dataset.w + "%"));
    }, dur(atraso + 250));
  }

  function contarNumeros() {
    const alvos = panels.querySelectorAll("[data-count]");
    const t0 = performance.now();
    const D = dur(1300);
    const passo = (t) => {
      const k = clamp((t - t0) / D, 0, 1);
      const e = 1 - Math.pow(1 - k, 4);
      alvos.forEach((a) => (a.textContent = fmt(+a.dataset.count * e, +a.dataset.dec)));
      if (k < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  }

  function letterbox(abrir, ms) {
    const h = getComputedStyle(detail).getPropertyValue("--lb").trim() || "7vh";
    bars.forEach((b) => {
      b.animate([{ height: abrir ? "0px" : h }, { height: abrir ? h : "0px" }], { duration: dur(ms), easing: CINE, fill: "forwards" });
    });
  }

  async function abrirDetalhe(n) {
    if (det.ocupado) return;
    if (det.aberto) return navegar(n);
    det.ocupado = true;
    det.aberto = true;
    det.n = n;
    const el = elementos[n - 1];
    const tile = tiles.get(n);
    const cor = CATEGORIAS[el.c].cor;

    // retrato da tabela em repouso, antes de mover a câmera
    fixarRepouso();
    const from = tile.getBoundingClientRect();

    detail.style.setProperty("--c", cor);
    detail.classList.add("open");
    detail.setAttribute("aria-hidden", "false");
    document.body.classList.add("cinema");
    history.replaceState(null, "", `#${el.s}`);

    renderPaineis(el);
    const s = slotRect();
    const S = s.size;
    const hero = criarHero(el);
    det.hero = hero;
    posicionarHero(hero, S);
    tile.classList.add("active-target");

    // 1. câmera avança na tabela
    moverCamera(n, 1300);
    warp(1);
    letterbox(true, 1100);
    backdrop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: dur(1100), easing: CINE, fill: "forwards" });

    // 2. o elemento voa até o primeiro plano
    const fcx = from.left + from.width / 2;
    const fcy = from.top + from.height / 2;
    const mx = (fcx + s.cx) / 2;
    const my = Math.min(fcy, s.cy) - 40;
    const voo = hero.animate(
      [
        { transform: heroTransform(fcx, fcy, from.width, S), opacity: 0.6, offset: 0 },
        { transform: heroTransform(mx, my, S * 0.55, S, "rotateY(-28deg) rotateX(14deg) rotateZ(-4deg)"), opacity: 1, offset: 0.55 },
        { transform: heroTransform(s.cx, s.cy, S * 1.04, S, "rotateY(6deg) rotateX(-3deg)"), offset: 0.82 },
        { transform: heroTransform(s.cx, s.cy, S, S), opacity: 1, offset: 1 },
      ],
      { duration: dur(1400), easing: "cubic-bezier(0.65, 0, 0.25, 1)", fill: "forwards" }
    );

    // 3. clarão de luz quando chega
    setTimeout(() => clarao(s.cx, s.cy, S), dur(950));

    // 4. átomo e painéis
    iniciarAtomo(el, S);
    atomCanvas.animate([{ opacity: 0, transform: "translate(-50%, -50%) scale(0.6) rotate(-20deg)" }, { opacity: 1, transform: "translate(-50%, -50%) scale(1) rotate(0deg)" }], { duration: dur(1600), delay: dur(700), easing: OUT, fill: "forwards" });
    animarPaineis(750);
    botoes.forEach((b, i) => b.animate([{ opacity: 0, transform: "scale(0.6)" }, { opacity: 1, transform: "none" }], { duration: dur(600), delay: dur(1100 + i * 80), easing: OUT, fill: "forwards" }));

    await voo.finished;
    hero.style.transform = heroTransform(s.cx, s.cy, S, S);
    voo.cancel();
    $("#d-close").focus({ preventScroll: true });
    liberar();
  }

  function clarao(cx, cy, S) {
    flash.style.left = cx - 5 + "px";
    flash.style.top = cy - 5 + "px";
    flash.animate(
      [
        { opacity: 0, transform: "scale(1)" },
        { opacity: 0.85, transform: `scale(${S / 12})`, offset: 0.25 },
        { opacity: 0, transform: `scale(${S / 3})` },
      ],
      { duration: dur(1100), easing: "ease-out" }
    );
  }

  async function navegar(n) {
    if (!det.aberto || n < 1 || n > 118) return;
    if (det.ocupado) {
      det.fila = () => navegar(n);
      return;
    }
    if (n === det.n) return;
    det.ocupado = true;
    const dir = n > det.n ? 1 : -1;
    const antigo = det.n;
    det.n = n;
    const el = elementos[n - 1];
    const cor = CATEGORIAS[el.c].cor;
    const s = slotRect();
    const S = s.size;
    history.replaceState(null, "", `#${el.s}`);

    tiles.get(antigo).classList.remove("active-target");
    tiles.get(n).classList.add("active-target");
    detail.style.setProperty("--c", cor);
    moverCamera(n, 900);

    const velho = det.hero;
    velho.animate(
      [
        { transform: heroTransform(s.cx, s.cy, S, S), opacity: 1, filter: "blur(0px)" },
        { transform: heroTransform(s.cx - dir * S * 0.9, s.cy, S * 0.7, S, `rotateY(${dir * 40}deg)`), opacity: 0, filter: "blur(12px)" },
      ],
      { duration: dur(650), easing: CINE, fill: "forwards" }
    ).finished.then(() => velho.remove());

    const hero = criarHero(el);
    det.hero = hero;
    posicionarHero(hero, S);
    const entra = hero.animate(
      [
        { transform: heroTransform(s.cx + dir * S * 0.9, s.cy, S * 0.7, S, `rotateY(${-dir * 40}deg)`), opacity: 0, filter: "blur(12px)" },
        { transform: heroTransform(s.cx, s.cy, S, S), opacity: 1, filter: "blur(0px)" },
      ],
      { duration: dur(800), delay: dur(120), easing: OUT, fill: "both" }
    );

    const saem = [...panels.querySelectorAll(".panel")].map((p, i) =>
      p.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: `translateX(${-dir * 30}px)`, filter: "blur(6px)" }], { duration: dur(260), delay: dur(i * 25), easing: "ease-in", fill: "forwards" }).finished
    );
    iniciarAtomo(el, S);
    await Promise.all(saem);
    renderPaineis(el);
    animarPaineis(0);
    await entra.finished;
    hero.style.transform = heroTransform(s.cx, s.cy, S, S);
    entra.cancel();
    liberar();
  }

  async function fecharDetalhe() {
    if (!det.aberto) return;
    if (det.ocupado) {
      det.fila = fecharDetalhe;
      return;
    }
    det.ocupado = true;
    const n = det.n;
    const tile = tiles.get(n);
    const s = slotRect();
    const S = s.size;
    const alvo = retanguloBase(n);
    history.replaceState(null, "", location.pathname + location.search);

    [...panels.querySelectorAll(".panel")].reverse().forEach((p, i) =>
      p.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(40px)", filter: "blur(8px)" }], { duration: dur(350), delay: dur(i * 30), easing: "ease-in", fill: "forwards" })
    );
    botoes.forEach((b) => b.animate([{ opacity: 1 }, { opacity: 0 }], { duration: dur(250), fill: "forwards" }));
    atomCanvas.animate([{ opacity: 1 }, { opacity: 0, transform: "translate(-50%, -50%) scale(0.5)" }], { duration: dur(500), easing: "ease-in", fill: "forwards" });

    const volta = det.hero.animate(
      [
        { transform: heroTransform(s.cx, s.cy, S, S), opacity: 1 },
        { transform: heroTransform((s.cx + alvo.left) / 2, s.cy - 30, S * 0.5, S, "rotateY(20deg) rotateX(-10deg)"), opacity: 1, offset: 0.45 },
        { transform: heroTransform(alvo.left + alvo.width / 2, alvo.top + alvo.height / 2, alvo.width, S), opacity: 0.9 },
      ],
      { duration: dur(1100), delay: dur(150), easing: CINE, fill: "forwards" }
    );
    setTimeout(() => {
      moverCamera(null, 1100);
      warp(-0.6);
      letterbox(false, 900);
      backdrop.animate([{ opacity: 1 }, { opacity: 0 }], { duration: dur(900), easing: CINE, fill: "forwards" });
      document.body.classList.remove("cinema");
    }, dur(200));

    await volta.finished;
    tile.classList.remove("active-target");
    det.hero.remove();
    det.hero = null;
    pararAtomo();
    pararSim();
    detail.classList.remove("open");
    detail.setAttribute("aria-hidden", "true");
    det.aberto = false;
    det.ocupado = false;
    det.fila = null;
    tile.focus({ preventScroll: true });
  }

  $("#d-close").addEventListener("click", fecharDetalhe);
  // destino acumulado: cliques rápidos pulam vários elementos de uma vez
  const passo = (d) => {
    const base = det.fila && det.alvo ? det.alvo : det.n;
    det.alvo = clamp(base + d, 1, 118);
    navegar(det.alvo);
  };
  $("#d-prev").addEventListener("click", () => passo(-1));
  $("#d-next").addEventListener("click", () => passo(1));
  backdrop.addEventListener("click", fecharDetalhe);
  $(".d-hero-area").addEventListener("click", (e) => { if (e.target === e.currentTarget) fecharDetalhe(); });

  document.addEventListener("keydown", (e) => {
    if (window.LAB && window.LAB.estaAberto && window.LAB.estaAberto()) return; // o laboratório tem os próprios atalhos
    if (det.aberto) {
      if (e.key === "r" || e.key === "R") aleatorio();
      else if (e.key === "Escape") fecharDetalhe();
      else if (e.key === "ArrowRight") passo(1);
      else if (e.key === "ArrowLeft") passo(-1);
      return;
    }
    if ((e.key === "r" || e.key === "R") && document.activeElement !== search && !e.metaKey && !e.ctrlKey) {
      aleatorio();
      return;
    }
    if ((e.key === "l" || e.key === "L") && document.activeElement !== search && !e.metaKey && !e.ctrlKey) {
      abrirLab("atomo");
      return;
    }
    if (e.key === "/" && document.activeElement !== search) {
      e.preventDefault();
      search.focus();
    }
  });

  // Deslizar no celular para navegar
  let toqueX = null;
  let toqueY = null;
  detail.addEventListener("touchstart", (e) => { toqueX = e.touches[0].clientX; toqueY = e.touches[0].clientY; }, { passive: true });
  detail.addEventListener("touchend", (e) => {
    if (toqueX == null) return;
    const dx = e.changedTouches[0].clientX - toqueX;
    const dy = e.changedTouches[0].clientY - toqueY;
    // só conta como "passar de elemento" se for um gesto bem horizontal
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.6 && !e.target.closest(".chart-box, input")) passo(dx < 0 ? 1 : -1);
    toqueX = null;
  });

  addEventListener("resize", () => {
    moverPill();
    ajustarVista();
    if (det.aberto && sim.cv) dimensionarSim();
    if (det.aberto && det.hero && !det.ocupado) {
      const s = slotRect();
      posicionarHero(det.hero, s.size);
      det.hero.style.transform = heroTransform(s.cx, s.cy, s.size, s.size);
      dimensionarAtomo(s.size);
    }
  });

  // ---------------------------------------------------------------------------
  // Modelo atômico animado
  // ---------------------------------------------------------------------------
  const actx = atomCanvas.getContext("2d");
  const atomo = { raf: 0, el: null, size: 0, orbitas: [], t0: 0 };

  function dimensionarAtomo(S) {
    const lado = Math.min(S * 2.3, innerWidth * 0.62, innerHeight * 0.9);
    const dpr = Math.min(devicePixelRatio || 1, 2);
    atomCanvas.width = lado * dpr;
    atomCanvas.height = lado * dpr;
    atomCanvas.style.width = atomCanvas.style.height = lado + "px";
    actx.setTransform(dpr, 0, 0, dpr, 0, 0);
    atomo.size = lado;
  }

  function iniciarAtomo(el, S) {
    dimensionarAtomo(S);
    atomo.el = el;
    atomo.t0 = performance.now();
    atomo.cor = hexRgb(CATEGORIAS[el.c].cor);
    const n = el.sh.length;
    atomo.orbitas = el.sh.map((eletrons, i) => ({
      eletrons,
      raio: 0.36 + (0.62 * (i + 1)) / (n + 1),
      inclinacao: 1.05 + ((i * 0.37) % 0.5),
      giro: i * 2.399, // ângulo de ouro: distribui as órbitas
      vel: 0.9 / (1 + i * 0.45),
      fase: Math.random() * Math.PI * 2,
    }));
    if (!atomo.raf) atomo.raf = requestAnimationFrame(desenharAtomo);
  }
  function pararAtomo() {
    cancelAnimationFrame(atomo.raf);
    atomo.raf = 0;
    actx.clearRect(0, 0, atomo.size, atomo.size);
  }

  function desenharAtomo(now) {
    atomo.raf = requestAnimationFrame(desenharAtomo);
    if (document.body.classList.contains("lab-open")) return;
    const L = atomo.size;
    const c = L / 2;
    const R = L / 2 * 0.98;
    const t = (now - atomo.t0) / 1000;
    const [r, g, b] = atomo.cor;
    const rgba = (a) => `rgba(${r},${g},${b},${a})`;
    actx.clearRect(0, 0, L, L);
    actx.globalCompositeOperation = "lighter";

    // halo do núcleo
    const halo = actx.createRadialGradient(c, c, 0, c, c, R * 0.42);
    halo.addColorStop(0, rgba(0.2));
    halo.addColorStop(1, rgba(0));
    actx.fillStyle = halo;
    actx.fillRect(0, 0, L, L);

    const giroGlobal = t * 0.12;
    const pontos = [];
    for (const o of atomo.orbitas) {
      const raio = o.raio * R;
      const ci = Math.cos(o.inclinacao), si = Math.sin(o.inclinacao);
      const ang = o.giro + giroGlobal;
      const cg = Math.cos(ang), sg = Math.sin(ang);
      const proj = (a) => {
        // círculo no plano XY, inclinado em X, girado em Z
        const x = raio * Math.cos(a);
        let y = raio * Math.sin(a);
        const z = y * si;
        y = y * ci;
        return { x: c + x * cg - y * sg, y: c + x * sg + y * cg, z: z / raio };
      };
      actx.beginPath();
      for (let k = 0; k <= 96; k++) {
        const p = proj((k / 96) * Math.PI * 2);
        k ? actx.lineTo(p.x, p.y) : actx.moveTo(p.x, p.y);
      }
      actx.strokeStyle = rgba(0.22);
      actx.lineWidth = 1;
      actx.stroke();
      for (let e = 0; e < o.eletrons; e++) {
        const a = o.fase + t * o.vel + (e / o.eletrons) * Math.PI * 2;
        pontos.push(proj(a));
      }
    }
    for (const p of pontos) {
      const s = 2.2 + (p.z + 1) * 1.4;
      const gr = actx.createRadialGradient(p.x, p.y, 0, p.x, p.y, s * 4);
      gr.addColorStop(0, "rgba(255,255,255,0.95)");
      gr.addColorStop(0.25, rgba(0.8));
      gr.addColorStop(1, rgba(0));
      actx.fillStyle = gr;
      actx.beginPath();
      actx.arc(p.x, p.y, s * 4, 0, Math.PI * 2);
      actx.fill();
    }
    actx.globalCompositeOperation = "source-over";
  }

  // ---------------------------------------------------------------------------
  // Fundo: campo de partículas com efeito de dobra no zoom
  // ---------------------------------------------------------------------------
  const pc = $("#particles");
  const pctx = pc.getContext("2d");
  let estrelas = [];
  const fundo = { w: 0, h: 0, mx: 0, my: 0, warp: 0, warpAlvo: 0 };

  function redimensionarFundo() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    fundo.w = innerWidth;
    fundo.h = innerHeight;
    pc.width = fundo.w * dpr;
    pc.height = fundo.h * dpr;
    pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const qtd = Math.round((fundo.w * fundo.h) / 9000);
    estrelas = Array.from({ length: qtd }, () => ({
      x: (Math.random() - 0.5) * fundo.w * 1.4,
      y: (Math.random() - 0.5) * fundo.h * 1.4,
      z: Math.random() * 0.9 + 0.1,
      tw: Math.random() * Math.PI * 2,
    }));
  }
  function warp(v) {
    if (reduzMovimento) return;
    fundo.warpAlvo = v;
    setTimeout(() => (fundo.warpAlvo = 0), 700);
  }
  addEventListener("pointermove", (e) => {
    fundo.mx = e.clientX / innerWidth - 0.5;
    fundo.my = e.clientY / innerHeight - 0.5;
  });

  let ultimoQuadro = 0;
  function desenharFundo(now) {
    requestAnimationFrame(desenharFundo);
    if (document.body.classList.contains("lab-open")) return; // o laboratório cobre a tela inteira
    // fora do efeito de dobra, ~30 fps bastam e aliviam o vidro desfocado por cima
    const emDobra = Math.abs(fundo.warp) > 0.02 || fundo.warpAlvo !== 0;
    if (!emDobra && now - ultimoQuadro < 32) return;
    ultimoQuadro = now;
    const { w, h } = fundo;
    fundo.warp += (fundo.warpAlvo - fundo.warp) * 0.06;
    pctx.clearRect(0, 0, w, h);
    const cx = w / 2 - fundo.mx * 30;
    const cy = h / 2 - fundo.my * 30;
    const wv = fundo.warp;
    for (const s of estrelas) {
      if (!reduzMovimento) {
        const k = 1 + wv * 0.06 * s.z;
        s.x *= k;
        s.y *= k;
        s.y -= 0.04 * s.z;
        if (Math.abs(s.x) > w * 0.75 || Math.abs(s.y) > h * 0.75 || (wv < 0 && Math.abs(s.x) < 2)) {
          s.x = (Math.random() - 0.5) * (wv > 0.05 ? w * 0.3 : w * 1.4);
          s.y = (Math.random() - 0.5) * (wv > 0.05 ? h * 0.3 : h * 1.4);
        }
      }
      const px = cx + s.x - fundo.mx * 40 * s.z;
      const py = cy + s.y - fundo.my * 40 * s.z;
      const a = (0.25 + 0.55 * s.z) * (0.6 + 0.4 * Math.sin(now / 700 + s.tw));
      if (Math.abs(wv) > 0.05) {
        const len = wv * 26 * s.z;
        const d = Math.hypot(s.x, s.y) || 1;
        pctx.strokeStyle = `rgba(200,215,255,${a})`;
        pctx.lineWidth = s.z * 1.4;
        pctx.beginPath();
        pctx.moveTo(px, py);
        pctx.lineTo(px - (s.x / d) * len, py - (s.y / d) * len);
        pctx.stroke();
      } else {
        pctx.fillStyle = `rgba(210,220,255,${a})`;
        pctx.fillRect(px, py, s.z * 1.6, s.z * 1.6);
      }
    }
  }

  // Elemento do dia: o mesmo para todo mundo, muda à meia-noite
  const diario = $("#daily");
  const hoje = elementos[Math.floor(Date.now() / 864e5 - new Date().getTimezoneOffset() / 1440) % 118];
  diario.style.setProperty("--c", CATEGORIAS[hoje.c].cor);
  diario.innerHTML = `
    <span class="dl-tile"><b>${hoje.s}</b><i>${hoje.n}</i></span>
    <span class="dl-body"><small>Elemento do dia</small><strong>${hoje.nome}</strong><span class="dl-txt">${esc(hoje.curiosidade)}</span></span>
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>`;
  diario.addEventListener("click", () => abrirDetalhe(hoje.n));

  // ---------------------------------------------------------------------------
  // Extras: aleatório, compartilhar, aviso, brilho ambiente
  // ---------------------------------------------------------------------------
  const toast = $("#toast");
  let toastT = 0;
  function avisar(msg) {
    toast.textContent = msg;
    toast.classList.add("on");
    clearTimeout(toastT);
    toastT = setTimeout(() => toast.classList.remove("on"), 2200);
  }

  function aleatorio() {
    const lista = elementos.filter((e) => !document.querySelector(`.el[data-n="${e.n}"].dim`));
    const e = lista[Math.floor(Math.random() * lista.length)] || elementos[0];
    if (det.aberto) navegar(e.n);
    else abrirDetalhe(e.n);
  }
  $("#random").addEventListener("click", aleatorio);

  $("#d-share").addEventListener("click", async () => {
    const el = elementos[det.n - 1];
    const url = `${location.origin}${location.pathname}#${el.s}`;
    try {
      if (navigator.share && toque.matches) await navigator.share({ title: `${el.nome} (${el.s})`, text: `${el.nome}, elemento ${el.n} da tabela periódica`, url });
      else { await navigator.clipboard.writeText(url); avisar(`Link de ${el.nome} copiado`); }
    } catch {
      /* cancelou o compartilhamento */
    }
  });

  // um brilho com a cor da categoria acompanha o cursor
  const ambient = $("#ambient");
  if (!toque.matches) {
    table.addEventListener("pointerover", (e) => {
      const t = e.target.closest(".el[data-n]");
      if (!t || det.aberto) return;
      const r = t.getBoundingClientRect();
      ambient.style.setProperty("--ax", `${r.left + r.width / 2}px`);
      ambient.style.setProperty("--ay", `${r.top + r.height / 2}px`);
      ambient.style.setProperty("--ac", corDe(elementos[t.dataset.n - 1]));
      ambient.classList.add("on");
    });
    table.addEventListener("pointerleave", () => ambient.classList.remove("on"));
  }

  // ---------------------------------------------------------------------------
  // Início
  // ---------------------------------------------------------------------------
  montarTabela();
  montarLegenda();
  aplicarModo();
  atualizarPreview(elementos[0]);
  ajustarVista();
  toque.addEventListener?.("change", () => ajustarVista());
  redimensionarFundo();
  addEventListener("resize", redimensionarFundo);
  requestAnimationFrame(desenharFundo);
  document.fonts?.ready.then(moverPill);
  moverPill();

  // ---------------------------------------------------------------------------
  // Laboratório (carregado só quando alguém abre, para a tabela abrir rápido)
  // ---------------------------------------------------------------------------
  const labBotao = $("#lab-open");
  const LAB_ARQUIVOS = ["js/lab/fisica.js", "js/lab/base.js", "js/lab/atomo.js", "js/lab/decaimento.js", "js/lab/reator.js", "js/lab/estrela.js", "js/lab/acelerador.js", "js/lab/lab.js"];
  let labPromessa = null;
  function carregarLab() {
    if (labPromessa) return labPromessa;
    labPromessa = new Promise((resolve, reject) => {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = "css/lab.css";
      document.head.appendChild(css);
      LAB_ARQUIVOS.forEach((src, i) => {
        const sc = document.createElement("script");
        sc.src = src;
        sc.async = false; // mantém a ordem
        sc.onerror = () => { labPromessa = null; reject(new Error("Falha ao carregar " + src)); };
        if (i === LAB_ARQUIVOS.length - 1) sc.onload = resolve;
        document.body.appendChild(sc);
      });
    });
    return labPromessa;
  }
  async function abrirLab(id = "atomo", origem = labBotao) {
    labBotao.classList.add("carregando");
    try {
      await carregarLab();
      const r = origem.getBoundingClientRect();
      window.LAB.abrir(id, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
    } catch (e) {
      avisar("Não consegui abrir o laboratório. Verifique a conexão.");
    } finally {
      labBotao.classList.remove("carregando");
    }
  }
  labBotao.addEventListener("click", () => abrirLab("atomo"));
  window.abrirLab = abrirLab;

  // Abrir direto um elemento pelo endereço (ex.: index.html#Fe) ou o laboratório (#lab/atomo)
  const hash = decodeURIComponent(location.hash.slice(1));
  if (/^lab/i.test(hash)) {
    setTimeout(() => abrirLab(hash.split("/")[1] || "atomo"), 300);
  } else if (hash) {
    const alvo = elementos.find((e) => e.s.toLowerCase() === hash.toLowerCase() || String(e.n) === hash);
    if (alvo) setTimeout(() => abrirDetalhe(alvo.n), 1400);
  }
})();
