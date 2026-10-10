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
  const ZOOM = 3.4;
  const camera = { base: null, transform: "none", filter: "none" };

  function centroLocal(n) {
    const t = tiles.get(n);
    return { x: t.offsetLeft + t.offsetWidth / 2, y: t.offsetTop + t.offsetHeight / 2 };
  }
  function moverCamera(alvo, ms) {
    let transform = "translate(0px, 0px) scale(1)";
    let filter = "blur(0px) brightness(1) saturate(1)";
    if (alvo) {
      const p = centroLocal(alvo);
      transform = `translate(${p.x * (1 - ZOOM)}px, ${p.y * (1 - ZOOM)}px) scale(${ZOOM})`;
      filter = "blur(9px) brightness(0.55) saturate(1.3)";
    }
    const from = { transform: camera.transform === "none" ? "translate(0px, 0px) scale(1)" : camera.transform, filter: camera.filter === "none" ? "blur(0px) brightness(1) saturate(1)" : camera.filter };
    table.getAnimations().forEach((a) => a.cancel());
    table.style.transform = transform;
    table.style.filter = filter;
    camera.transform = transform;
    camera.filter = filter;
    return table.animate([from, { transform, filter }], { duration: dur(ms), easing: CINE });
  }
  function retanguloBase(n) {
    // posição da célula na tela com a câmera em repouso
    const t = tiles.get(n);
    return {
      left: camera.base.left + t.offsetLeft,
      top: camera.base.top + t.offsetTop,
      width: t.offsetWidth,
      height: t.offsetHeight,
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

  function renderPaineis(el) {
    const cat = CATEGORIAS[el.c];
    const fase = ESTADOS[el.f].nome + (el.n > 99 && el.mp == null ? " (previsto)" : "");
    const grupo = el.g ? `Grupo ${el.g}` : el.c === "lantanideo" ? "Série dos lantanídeos" : "Série dos actinídeos";
    const unidDens = el.f === "g" ? "g/L" : "g/cm³";
    const camadas = el.sh.map((n, i) => `<span>${n}<small>${CAMADAS[i]}</small></span>`).join("");
    panels.innerHTML = `
      <div class="panel p-title">
        <div class="eyebrow">${cat.nome}</div>
        <h2 id="d-name">${el.nome}</h2>
        <div class="sub">Número atômico ${el.n} · Período ${el.p} · ${grupo} · Bloco ${el.b}</div>
      </div>
      <div class="panel glass">
        <h3>${icone("prop")}Propriedades</h3>
        <div class="stats">
          ${stat("Massa atômica", el.m, 3, "u")}
          ${stat("Estado a 25 °C", null)}
          ${stat("Densidade", el.d, el.d < 10 ? 3 : 2, unidDens, el.d != null && el.f !== "g" ? el.d / 22.6 : null)}
          ${stat("Eletronegatividade", el.en, 2, "Pauling", el.en != null ? el.en / 4 : null)}
          ${stat("Fusão", el.mp != null ? celsius(el.mp) : null, 1, "°C")}
          ${stat("Ebulição", el.bp != null ? celsius(el.bp) : null, 1, "°C")}
          ${stat("1ª energia de ionização", el.ie, 1, "kJ/mol", el.ie != null ? el.ie / 2400 : null)}
          ${stat("Raio atômico", el.r, 0, "pm", el.r != null ? el.r / 300 : null)}
        </div>
      </div>
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
    // o estado físico é texto, não número
    const estadoStat = panels.querySelectorAll(".stat")[1];
    $(".v", estadoStat).textContent = fase;
    panels.scrollTop = 0;
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
    const h = innerWidth < 860 ? "4vh" : "7vh";
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
    camera.base = { left: table.getBoundingClientRect().left, top: table.getBoundingClientRect().top };
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
    if (det.aberto) {
      if (e.key === "Escape") fecharDetalhe();
      else if (e.key === "ArrowRight") passo(1);
      else if (e.key === "ArrowLeft") passo(-1);
      return;
    }
    if (e.key === "/" && document.activeElement !== search) {
      e.preventDefault();
      search.focus();
    }
  });

  // Deslizar no celular para navegar
  let toqueX = null;
  detail.addEventListener("touchstart", (e) => (toqueX = e.touches[0].clientX), { passive: true });
  detail.addEventListener("touchend", (e) => {
    if (toqueX == null) return;
    const dx = e.changedTouches[0].clientX - toqueX;
    if (Math.abs(dx) > 60) passo(dx < 0 ? 1 : -1);
    toqueX = null;
  });

  addEventListener("resize", () => {
    moverPill();
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
    halo.addColorStop(0, rgba(0.35));
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

  // ---------------------------------------------------------------------------
  // Início
  // ---------------------------------------------------------------------------
  montarTabela();
  montarLegenda();
  aplicarModo();
  atualizarPreview(elementos[0]);
  redimensionarFundo();
  addEventListener("resize", redimensionarFundo);
  requestAnimationFrame(desenharFundo);
  document.fonts?.ready.then(moverPill);
  moverPill();

  // Abrir direto um elemento pelo endereço (ex.: index.html#Fe)
  const hash = decodeURIComponent(location.hash.slice(1));
  if (hash) {
    const alvo = elementos.find((e) => e.s.toLowerCase() === hash.toLowerCase() || String(e.n) === hash);
    if (alvo) setTimeout(() => abrirDetalhe(alvo.n), 1400);
  }
})();
