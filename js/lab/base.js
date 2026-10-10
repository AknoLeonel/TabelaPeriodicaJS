/*
 * Base compartilhada do laboratório: laço de animação com qualidade adaptativa,
 * sprites pré-renderizados, som e componentes de interface.
 *
 * Regras para manter 60 fps em celular:
 *  - nada de gradientes ou objetos novos dentro do laço: tudo vira sprite (drawImage);
 *  - resolução do canvas adapta sozinha se os quadros começarem a atrasar;
 *  - a física usa dt limitado, então um engasgo nunca "teleporta" as partículas;
 *  - só o módulo visível anima, e nada anima com a aba escondida.
 */
(function () {
  "use strict";
  const LAB = (window.LAB = window.LAB || { modulos: [] });
  const F = window.LabFisica;
  const reduzMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const toque = matchMedia("(pointer: coarse)").matches;
  LAB.reduzMovimento = reduzMovimento;
  LAB.toque = toque;
  LAB.metricas = { quadro: 0, trabalho: 0, qualidade: 1 };

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rnd = (a = 0, b = 1) => a + Math.random() * (b - a);
  LAB.clamp = clamp; LAB.lerp = lerp; LAB.rnd = rnd;
  LAB.hexRgb = (hex) => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  LAB.rgba = (hex, a) => { const [r, g, b] = LAB.hexRgb(hex); return `rgba(${r},${g},${b},${a})`; };

  // ---------------------------------------------------------------------------
  // Cena: canvas + laço de animação
  // ---------------------------------------------------------------------------
  class Cena {
    constructor(canvas, { dprMax = 2, alpha = true } = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d", { alpha, desynchronized: true });
      this.dprMax = dprMax;
      this.q = 1;
      this.w = 0; this.h = 0; this.dpr = 1;
      this.ativa = false;
      this._raf = 0; this._ult = 0; this._ema = 16.7; this._min = 1e9; this._lento = 0; this._rapido = 0; this._n = 0;
      this._loop = this._loop.bind(this);
      this._ro = new ResizeObserver(() => this.redimensionar());
      this._ro.observe(canvas.parentElement || canvas);
      this.adaptar = true;
    }
    redimensionar() {
      const r = (this.canvas.parentElement || this.canvas).getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      this.w = r.width; this.h = r.height;
      this.dpr = Math.min(window.devicePixelRatio || 1, this.dprMax) * this.q;
      this.canvas.width = Math.max(1, Math.round(this.w * this.dpr));
      this.canvas.height = Math.max(1, Math.round(this.h * this.dpr));
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      if (this.aoRedimensionar) this.aoRedimensionar(this.w, this.h);
      if (!this.ativa && this.desenhar) this.desenhar(this.ctx, this.w, this.h, 0);
    }
    iniciar() {
      if (this.ativa) return;
      this.ativa = true;
      this._ult = 0;
      this.redimensionar();
      this._raf = requestAnimationFrame(this._loop);
    }
    parar() {
      this.ativa = false;
      cancelAnimationFrame(this._raf);
    }
    _loop(t) {
      if (!this.ativa) return;
      this._raf = requestAnimationFrame(this._loop);
      if (document.hidden) { this._ult = 0; return; }
      if (!this._ult) { this._ult = t; return; }
      const di = t - this._ult;
      this._ult = t;
      const dt = Math.min(di / 1000, 1 / 20);
      const t0 = performance.now();
      this.atualizar(dt, t / 1000);
      this.desenhar(this.ctx, this.w, this.h, t / 1000);
      const trabalho = performance.now() - t0;

      LAB.metricas.trabalho += (trabalho - LAB.metricas.trabalho) * 0.1;
      LAB.metricas.quadro += (di - LAB.metricas.quadro) * 0.1;
      this._n++;
      this._ema += (di - this._ema) * 0.12;
      if (this._n > 30 && di > 3 && di < this._min) this._min = di;
      if (!this.adaptar || this._n < 60) return;
      // quadros bem acima do melhor intervalo visto = o aparelho não está dando conta
      if (this._ema > this._min * 1.55 + 1.5) { this._lento++; this._rapido = 0; }
      else { this._rapido++; this._lento = 0; }
      if (this._lento > 40 && this.q > 0.55) {
        this.q = Math.max(0.55, this.q - 0.15);
        this._lento = 0; this._min = 1e9; this._n = 30;
        LAB.metricas.qualidade = this.q;
        this.redimensionar();
        if (this.aoQualidade) this.aoQualidade(this.q);
      }
    }
    // coordenadas do ponteiro relativas ao canvas
    pos(e) {
      const r = this.canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }
  }
  LAB.Cena = Cena;

  // ---------------------------------------------------------------------------
  // Sprites
  // ---------------------------------------------------------------------------
  const cacheSpr = new Map();
  const sprite = (chave, lado, desenhar) => {
    let c = cacheSpr.get(chave);
    if (c) return c;
    c = document.createElement("canvas");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = c.height = Math.ceil(lado * dpr);
    const g = c.getContext("2d");
    g.scale(dpr, dpr);
    desenhar(g, lado);
    cacheSpr.set(chave, c);
    return c;
  };
  // brilho suave (partículas luminosas); desenhar com "lighter"
  LAB.brilho = (raio, cor, nucleo = 0.9) =>
    sprite(`b${raio}${cor}${nucleo}`, raio * 2, (g, L) => {
      const gr = g.createRadialGradient(L / 2, L / 2, 0, L / 2, L / 2, L / 2);
      gr.addColorStop(0, `rgba(255,255,255,${nucleo})`);
      gr.addColorStop(0.22, LAB.rgba(cor, 0.85));
      gr.addColorStop(0.6, LAB.rgba(cor, 0.22));
      gr.addColorStop(1, LAB.rgba(cor, 0));
      g.fillStyle = gr;
      g.fillRect(0, 0, L, L);
    });
  // esfera sólida com luz de cima-esquerda (nucleons)
  LAB.esfera = (raio, cor) =>
    sprite(`e${raio}${cor}`, raio * 2 + 6, (g, L) => {
      const c = L / 2;
      const halo = g.createRadialGradient(c, c, raio * 0.6, c, c, c);
      halo.addColorStop(0, LAB.rgba(cor, 0.5));
      halo.addColorStop(1, LAB.rgba(cor, 0));
      g.fillStyle = halo;
      g.fillRect(0, 0, L, L);
      const gr = g.createRadialGradient(c - raio * 0.35, c - raio * 0.4, raio * 0.1, c, c, raio);
      gr.addColorStop(0, "#fff");
      gr.addColorStop(0.25, cor);
      gr.addColorStop(1, LAB.rgba(cor, 0.55));
      g.fillStyle = gr;
      g.beginPath();
      g.arc(c, c, raio, 0, 6.2832);
      g.fill();
    });

  // ---------------------------------------------------------------------------
  // Som (WebAudio, criado só depois de um toque)
  // ---------------------------------------------------------------------------
  const som = (LAB.som = {
    ctx: null, mudo: false, ruido: null, _t0: 0, _n: 0,
    preparar() {
      if (this.ctx) { if (this.ctx.state === "suspended") this.ctx.resume(); return; }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      const n = Math.floor(this.ctx.sampleRate * 0.03);
      const b = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
      const d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
      this.ruido = b;
    },
    _limite() {
      const agora = performance.now();
      if (agora - this._t0 > 1000) { this._t0 = agora; this._n = 0; }
      return ++this._n > 60;
    },
    clique(vol = 0.25, vel = 1) {
      if (this.mudo || !this.ctx || this._limite()) return;
      const s = this.ctx.createBufferSource();
      s.buffer = this.ruido;
      s.playbackRate.value = vel * (0.85 + Math.random() * 0.4);
      const g = this.ctx.createGain();
      g.gain.value = vol;
      s.connect(g).connect(this.ctx.destination);
      s.start();
    },
    tom(freq, dur = 0.12, vol = 0.12, tipo = "sine", fim = freq) {
      if (this.mudo || !this.ctx || this._limite()) return;
      const t = this.ctx.currentTime;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = tipo;
      o.frequency.setValueAtTime(freq, t);
      o.frequency.exponentialRampToValueAtTime(Math.max(fim, 20), t + dur);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(this.ctx.destination);
      o.start(t);
      o.stop(t + dur + 0.02);
    },
    estouro(vol = 0.3) {
      if (this.mudo || !this.ctx) return;
      this.tom(120, 0.5, vol, "sawtooth", 30);
      this.clique(vol, 0.3);
    },
    vibrar(ms = 10) {
      if (navigator.vibrate && LAB.toque && !this.mudo) navigator.vibrate(ms);
    },
  });
  document.addEventListener("pointerdown", () => som.preparar(), { passive: true });

  // ---------------------------------------------------------------------------
  // Componentes de interface
  // ---------------------------------------------------------------------------
  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };
  LAB.el = el;

  const ui = (LAB.ui = {});

  ui.cartao = (titulo, corpo, cls = "") => {
    const c = el("section", "lc " + cls);
    if (titulo) c.appendChild(el("h4", "", titulo));
    if (typeof corpo === "string") c.insertAdjacentHTML("beforeend", corpo);
    else if (corpo) c.appendChild(corpo);
    return c;
  };

  // controle deslizante com valor ao vivo (linear ou logarítmico)
  ui.slider = ({ rotulo, min, max, passo = 1, valor, fmt = (v) => String(v), log = false, onInput, cor }) => {
    const raiz = el("label", "ls");
    const topo = el("div", "ls-topo");
    const rot = el("span", "", rotulo);
    const out = el("output");
    topo.append(rot, out);
    const inp = el("input");
    inp.type = "range";
    if (cor) raiz.style.setProperty("--c", cor);
    const L = log ? { min: Math.log(min), max: Math.log(max) } : null;
    const paraPos = (v) => (log ? ((Math.log(v) - L.min) / (L.max - L.min)) * 1000 : v);
    const deLinha = (p) => (log ? Math.exp(L.min + (p / 1000) * (L.max - L.min)) : +p);
    inp.min = log ? 0 : min; inp.max = log ? 1000 : max; inp.step = log ? 1 : passo;
    inp.value = paraPos(valor);
    let v = valor;
    const atualizar = () => {
      const pct = ((inp.value - inp.min) / (inp.max - inp.min)) * 100;
      inp.style.setProperty("--p", pct + "%");
      out.textContent = fmt(v);
    };
    inp.addEventListener("input", () => { v = deLinha(inp.value); atualizar(); onInput && onInput(v); });
    raiz.append(topo, inp);
    atualizar();
    return {
      el: raiz,
      get: () => v,
      set(novo, emitir = false) { v = novo; inp.value = paraPos(novo); atualizar(); if (emitir && onInput) onInput(v); },
      rotulo: (t) => (rot.textContent = t),
      // troca os limites (e o valor) sem recriar o controle
      config(nmin, nmax, nvalor) {
        min = nmin; max = nmax;
        if (log) { L.min = Math.log(min); L.max = Math.log(max); } else { inp.min = min; inp.max = max; }
        v = nvalor; inp.value = paraPos(v); atualizar();
      },
    };
  };

  // botões segmentados (escolha única)
  ui.segmentado = ({ itens, valor, onChange, cls = "" }) => {
    const raiz = el("div", "seg " + cls);
    raiz.setAttribute("role", "tablist");
    const bt = new Map();
    for (const it of itens) {
      const b = el("button", "", it.rotulo);
      b.type = "button";
      b.dataset.id = it.id;
      if (it.titulo) b.title = it.titulo;
      b.addEventListener("click", () => { definir(it.id); onChange && onChange(it.id); });
      bt.set(it.id, b);
      raiz.appendChild(b);
    }
    const definir = (id) => bt.forEach((b, k) => { b.classList.toggle("on", k === id); b.setAttribute("aria-selected", k === id); });
    definir(valor);
    return { el: raiz, set: definir };
  };

  // contador com + e − grandes (segurar repete)
  ui.stepper = ({ rotulo, sub, cor, valor, min = 0, max = 999, onChange }) => {
    const raiz = el("div", "st");
    raiz.style.setProperty("--c", cor);
    const menos = el("button", "st-b", "−");
    const mais = el("button", "st-b", "+");
    menos.type = mais.type = "button";
    menos.setAttribute("aria-label", "Remover " + rotulo);
    mais.setAttribute("aria-label", "Adicionar " + rotulo);
    const meio = el("div", "st-m");
    const val = el("b", "", String(valor));
    meio.append(val, el("span", "", rotulo), sub ? el("small", "", sub) : el("small"));
    raiz.append(menos, meio, mais);
    let v = valor;
    const definir = (n, emitir) => {
      n = clamp(n, min, max);
      if (n === v) return false;
      v = n; val.textContent = n;
      if (emitir && onChange) onChange(n);
      return true;
    };
    const segurar = (botao, passo) => {
      let t1 = 0, t2 = 0;
      const parar = () => { clearTimeout(t1); clearInterval(t2); };
      botao.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        if (definir(v + passo, true)) som.vibrar(6);
        t1 = setTimeout(() => { t2 = setInterval(() => definir(v + passo, true), 70); }, 380);
      });
      ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => botao.addEventListener(ev, parar));
      botao.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); definir(v + passo, true); } });
    };
    segurar(menos, -1); segurar(mais, 1);
    return {
      el: raiz,
      get: () => v,
      set: (n) => definir(n, false),
      sub: (t) => { meio.lastChild.textContent = t; },
    };
  };

  ui.chips = ({ itens, onClick, cls = "" }) => {
    const raiz = el("div", "chips " + cls);
    for (const it of itens) {
      const b = el("button", "chip2", it.rotulo);
      b.type = "button";
      if (it.cor) b.style.setProperty("--c", it.cor);
      if (it.titulo) b.title = it.titulo;
      b.addEventListener("click", () => onClick(it.id, b));
      raiz.appendChild(b);
    }
    return { el: raiz };
  };

  ui.botao = (rotulo, onClick, cls = "") => {
    const b = el("button", "bt " + cls, rotulo);
    b.type = "button";
    b.addEventListener("click", onClick);
    return b;
  };

  ui.numero = (v, casas = 2) => F.num(v, casas);

  // Linhas "rótulo / valor" para fichas de informação
  ui.linhas = (pares) =>
    `<dl class="lin">${pares.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>`;

  // Selo de fidelidade científica
  LAB.selos = {
    fiel: { texto: "Fiel à física", cls: "fiel" },
    parcial: { texto: "Parcialmente fiel", cls: "parcial" },
    ilustrativo: { texto: "Ilustrativo", cls: "ilus" },
  };
})();
