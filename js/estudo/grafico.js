/*
 * Gráfico do Estudo: um componente para todas as matérias (funções, dados com
 * barras de erro, histogramas, vetores, trajetórias, círculo trigonométrico).
 *
 *   const gr = LAB.estudo.grafico({ modo: "cartesiano" | "dados", altura, rotX, rotY, igual, interativo });
 *   raiz.appendChild(gr.el);
 *   gr.definir({ x: [a, b], y: [c, d], series: [...] });
 *
 * Séries: funcao {f}, area {f, a, b}, linha {pts}, pontos {pts: [[x, y, σy]]},
 * barras {barras: [{a, b, v}]}, vetor {de, para}, seg {de, para}, hline/vline {v},
 * marca {x, y}, circulo {c, r}, arco {c, r, a0, a1}, texto {x, y, texto}.
 * Todas aceitam cor, rotulo (legenda/etiqueta) e tracejado.
 *
 * Desenha só quando algo muda (dados, tamanho, ponteiro): nada de laço contínuo.
 */
(function () {
  "use strict";
  const LAB = window.LAB;
  if (!LAB || !LAB.estudo) return;
  const { el } = LAB;

  const tema = () => {
    const s = getComputedStyle(document.documentElement);
    const v = (n, p) => s.getPropertyValue(n).trim() || p;
    return {
      grade: v("--line-soft", "#222a35"), eixo: v("--muted", "#9ba7b6"), texto: v("--text", "#e8edf3"),
      fraco: v("--faint", "#7a8799"), fundo: "#0b0e12", erro: v("--err", "#e5646e"), linha: v("--line", "#2b3441"),
    };
  };
  const MONO = "'IBM Plex Mono', ui-monospace, monospace";
  const SANS = "'IBM Plex Sans', system-ui, sans-serif";

  // ---------- números ----------
  function passoBom(span, alvo) {
    const bruto = span / Math.max(alvo, 1);
    const p = Math.pow(10, Math.floor(Math.log10(bruto)));
    for (const m of [1, 2, 5, 10]) if (m * p >= bruto * 0.999) return m * p;
    return 10 * p;
  }
  const casasDo = (passo) => Math.max(0, Math.min(10, -Math.floor(Math.log10(passo) + 1e-9)));
  function fmtEixo(v, passo) {
    if (Math.abs(v) < passo * 1e-6) return "0";
    const a = Math.abs(v);
    if (a >= 1e6 || (a < 1e-3 && a > 0)) return v.toExponential(1).replace(".", ",").replace("e+", "e").replace("-", "−");
    let t = v.toFixed(casasDo(passo));
    if (t.includes(".")) t = t.replace(/0+$/, "").replace(/\.$/, "");
    return t.replace(".", ",").replace("-", "−");
  }
  function fmtSig(v, sig = 4) {
    if (!isFinite(v)) return "—";
    if (v === 0) return "0";
    const a = Math.abs(v);
    let t;
    if (a >= 1e6 || a < 1e-4) t = v.toExponential(sig - 1).replace("e+", "e");
    else t = String(+v.toPrecision(sig));
    return t.replace(".", ",").replace(/-/g, "−");
  }
  const marcasEixo = (a, b, passo) => {
    const r = [];
    for (let k = Math.ceil(a / passo - 1e-9); k * passo <= b + passo * 1e-9; k++) r.push(k * passo);
    return r;
  };

  // ---------- componente ----------
  function grafico(op = {}) {
    const modo = op.modo || "cartesiano";
    const interativo = op.interativo ?? modo === "cartesiano";
    const raiz = el("figure", "gf");
    const cv = el("canvas", "gf-cv");
    cv.setAttribute("role", "img");
    cv.setAttribute("aria-label", op.aria || "Gráfico");
    const rod = el("figcaption", "gf-rod");
    const leg = el("div", "gf-leg");
    const leitura = el("div", "gf-leitura");
    const ctl = el("div", "gf-ctl");
    rod.append(leg, leitura, ctl);
    raiz.append(cv, rod);
    const comLeitura = op.leitura !== false;
    if (!comLeitura) leitura.hidden = true;
    const dicaPadrao = interativo
      ? (matchMedia("(pointer: coarse)").matches ? "Toque para ler valores · pince para ampliar" : "Passe o mouse para ler valores · arraste para mover")
      : (matchMedia("(pointer: coarse)").matches ? "Toque no gráfico para ler valores" : "Passe o mouse para ler valores");
    leitura.textContent = dicaPadrao;
    if (interativo) {
      const bt = (txt, titulo, fn) => { const b = el("button", "gf-bt", txt); b.type = "button"; b.title = titulo; b.setAttribute("aria-label", titulo); b.addEventListener("click", fn); ctl.appendChild(b); return b; };
      bt("−", "Afastar", () => zoom(1.5));
      bt("+", "Aproximar", () => zoom(1 / 1.5));
      bt("⤢", "Enquadrar de novo", () => { vista = null; desenhar(); });
    }

    let cena = null, auto = null, vista = null, ponteiro = null, _tamanho = { w: 0, h: 0 }, layout = null;

    // ---------- enquadramento automático ----------
    function enquadrar() {
      const S = cena.series || [];
      const xs = [], ys = [];
      const add = (x, y) => { if (isFinite(x)) xs.push(x); if (isFinite(y)) ys.push(y); };
      for (const s of S) {
        if (s.tipo === "linha" || s.tipo === "pontos") s.pts.forEach((p) => { add(p[0], p[1]); if (p[2]) { add(NaN, p[1] + p[2]); add(NaN, p[1] - p[2]); } });
        else if (s.tipo === "barras") s.barras.forEach((b) => { add(b.a, 0); add(b.b, b.v); });
        else if (s.tipo === "vetor" || s.tipo === "seg") { const de = s.de || [0, 0]; add(de[0], de[1]); add(s.para[0], s.para[1]); }
        else if (s.tipo === "marca") add(s.x, s.y);
        else if (s.tipo === "circulo") { add(s.c[0] - s.r, s.c[1] - s.r); add(s.c[0] + s.r, s.c[1] + s.r); }
        else if (s.tipo === "hline") add(NaN, s.v);
        else if (s.tipo === "vline") add(s.v, NaN);
      }
      let [x0, x1] = cena.x || (xs.length ? [Math.min(...xs), Math.max(...xs)] : [-10, 10]);
      if (!cena.x && xs.length) { const p = (x1 - x0 || 1) * (modo === "dados" ? 0.06 : 0.12); x0 -= p; x1 += p; }
      if (x1 - x0 < 1e-12) { x0 -= 1; x1 += 1; }
      // funções: amostra e ignora picos de assíntotas (percentis), salvo se a função é limitada
      const fy = [];
      for (const s of S) if (s.tipo === "funcao" || s.tipo === "area") {
        const a = s.tipo === "area" ? Math.min(s.a, s.b) : Math.max(x0, s.dominio ? s.dominio[0] : -Infinity);
        const b = s.tipo === "area" ? Math.max(s.a, s.b) : Math.min(x1, s.dominio ? s.dominio[1] : Infinity);
        for (let i = 0; i <= 400; i++) { const y = avaliar(s.f, a + ((b - a) * i) / 400); if (isFinite(y)) fy.push(y); }
        if (s.tipo === "area") fy.push(0);
      }
      if (fy.length) {
        fy.sort((p, q) => p - q);
        const lo = fy[Math.floor(fy.length * 0.02)], hi = fy[Math.ceil(fy.length * 0.98) - 1];
        const min = fy[0], max = fy[fy.length - 1];
        if (max - min <= 3 * (hi - lo) + 1e-9) ys.push(min, max); else ys.push(lo, hi);
      }
      let [y0, y1] = cena.y || (ys.length ? [Math.min(...ys), Math.max(...ys)] : [-10, 10]);
      if (!cena.y) {
        if (modo === "cartesiano" || cena.zeroY) {
          const span = y1 - y0 || Math.abs(y0) || 1;
          if (y0 > 0 && y0 < 1.5 * span) y0 = 0;
          if (y1 < 0 && -y1 < 1.5 * span) y1 = 0;
        }
        if (y1 - y0 < 1e-12) { const d = Math.abs(y0) * 0.5 || 1; y0 -= d; y1 += d; }
        const p = (y1 - y0) * 0.1; y0 -= p; y1 += p;
      }
      return { x0, x1, y0, y1 };
    }
    function avaliar(f, x) { try { const y = f(x); return typeof y === "number" ? y : NaN; } catch (_e) { return NaN; } }

    // ---------- desenho ----------
    function medir() {
      const w = Math.max(cv.clientWidth || raiz.clientWidth || 320, 200);
      const h = typeof op.altura === "function" ? op.altura(w) : op.altura || Math.round(Math.min(Math.max(w * 0.6, 220), 340));
      return { w, h };
    }
    // lazy: só desenha quando o gráfico chega perto da tela; antes disso, mostra o esqueleto
    let visivel = false, revelado = false;
    function reservarAltura() {
      const { h } = medir();
      if (cv.style.height !== `${h}px`) cv.style.height = `${h}px`;
    }
    function desenhar() {
      if (!cena) return;
      if (!visivel) { reservarAltura(); return; }
      const { w, h } = medir();
      if (cv.style.height !== h + "px") cv.style.height = h + "px";
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
      _tamanho = { w, h };
      const g = cv.getContext("2d");
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);
      const T = tema();
      const corBase = getComputedStyle(raiz).getPropertyValue("--m-c").trim() || "#f2c14e";
      let { x0, x1, y0, y1 } = vista || auto;

      // margens: no modo "dados" os números ficam fora da área do gráfico
      g.font = `11px ${MONO}`;
      let m = { l: 6, r: 6, t: 6, b: 6 };
      let passoY = passoBom(y1 - y0, h / 46);
      if (modo === "dados") {
        const labs = marcasEixo(y0, y1, passoY).map((v) => fmtEixo(v, passoY));
        m = { l: Math.ceil(Math.max(...labs.map((t) => g.measureText(t).width), 10)) + 12, r: 14, t: op.rotY || cena.rotY ? 24 : 10, b: op.rotX || cena.rotX ? 40 : 24 };
      }
      const W = w - m.l - m.r, H = h - m.t - m.b;
      if (op.igual) { // mesma escala nos dois eixos (círculos continuam redondos)
        const ex = (x1 - x0) / W, ey = (y1 - y0) / H;
        // no modo "dados" o início dos eixos fica onde está (o chão continua no chão)
        if (ex > ey) { if (modo === "dados") y1 = y0 + ex * H; else { const c = (y0 + y1) / 2, s = (ex * H) / 2; y0 = c - s; y1 = c + s; } }
        else { if (modo === "dados") x1 = x0 + ey * W; else { const c = (x0 + x1) / 2, s = (ey * W) / 2; x0 = c - s; x1 = c + s; } }
        passoY = passoBom(y1 - y0, h / 46);
      }
      const X = (x) => m.l + ((x - x0) / (x1 - x0)) * W;
      const Y = (y) => m.t + H - ((y - y0) / (y1 - y0)) * H;
      const passoX = op.igual ? passoY : passoBom(x1 - x0, W / 78);
      layout = { m, W, H, X, Y, x0, x1, y0, y1, Xi: (px) => x0 + ((px - m.l) / W) * (x1 - x0), Yi: (py) => y0 + ((m.t + H - py) / H) * (y1 - y0) };

      // grade
      g.lineWidth = 1;
      g.strokeStyle = T.grade;
      const mx = marcasEixo(x0, x1, passoX), my = marcasEixo(y0, y1, passoY);
      g.beginPath();
      for (const x of mx) { const p = Math.round(X(x)) + 0.5; g.moveTo(p, m.t); g.lineTo(p, m.t + H); }
      for (const y of my) { const p = Math.round(Y(y)) + 0.5; g.moveTo(m.l, p); g.lineTo(m.l + W, p); }
      g.stroke();

      // eixos e números
      g.fillStyle = T.fraco;
      g.font = `11px ${MONO}`;
      if (modo === "dados") {
        g.strokeStyle = T.eixo;
        g.beginPath(); g.moveTo(m.l + 0.5, m.t); g.lineTo(m.l + 0.5, m.t + H + 0.5); g.lineTo(m.l + W, m.t + H + 0.5); g.stroke();
        g.textAlign = "right"; g.textBaseline = "middle";
        for (const y of my) g.fillText(fmtEixo(y, passoY), m.l - 6, Y(y));
        g.textAlign = "center"; g.textBaseline = "top";
        let ultimo = -Infinity;
        for (const x of mx) { const t = fmtEixo(x, passoX), wt = g.measureText(t).width, p = X(x); if (p - wt / 2 < ultimo + 6) continue; g.fillText(t, p, m.t + H + 6); ultimo = p + wt / 2; }
        g.font = `500 12px ${SANS}`; g.fillStyle = T.eixo;
        if (op.rotX || cena.rotX) { g.textAlign = "right"; g.textBaseline = "bottom"; g.fillText(cena.rotX || op.rotX, m.l + W, h - 3); }
        if (op.rotY || cena.rotY) { g.textAlign = "left"; g.textBaseline = "top"; g.fillText(cena.rotY || op.rotY, 4, 4); }
      } else {
        const ox = Math.min(Math.max(X(0), m.l), m.l + W), oy = Math.min(Math.max(Y(0), m.t), m.t + H);
        g.strokeStyle = T.eixo; g.lineWidth = 1.2;
        g.beginPath(); g.moveTo(m.l, Math.round(oy) + 0.5); g.lineTo(m.l + W, Math.round(oy) + 0.5); g.moveTo(Math.round(ox) + 0.5, m.t); g.lineTo(Math.round(ox) + 0.5, m.t + H); g.stroke();
        // números ao longo dos eixos, presos dentro do quadro e sem se encostar
        const embaixo = oy + 16 < m.t + H;
        g.textAlign = "center"; g.textBaseline = embaixo ? "top" : "bottom";
        let ultimo = -Infinity;
        for (const x of mx) {
          if (Math.abs(x) < passoX * 1e-6) continue;
          const t = fmtEixo(x, passoX), wt = g.measureText(t).width, p = X(x);
          if (p - wt / 2 < ultimo + 8 || p - wt / 2 < m.l || p + wt / 2 > m.l + W) continue;
          g.fillText(t, p, embaixo ? oy + 4 : oy - 4); ultimo = p + wt / 2;
        }
        const direita = ox + 40 < m.l + W;
        g.textAlign = direita ? "left" : "right"; g.textBaseline = "middle";
        let largY = 0;
        for (const y of my) {
          if (Math.abs(y) < passoY * 1e-6) continue;
          const p = Y(y); if (p < m.t + 7 || p > m.t + H - 7) continue;
          const t = fmtEixo(y, passoY);
          largY = Math.max(largY, g.measureText(t).width);
          g.fillText(t, direita ? ox + 5 : ox - 5, p);
        }
        const zeroEsq = ox - 12 > m.l;
        if (X(0) >= m.l && X(0) <= m.l + W && Y(0) >= m.t && Y(0) <= m.t + H) { g.textAlign = zeroEsq ? "right" : "left"; g.textBaseline = "top"; g.fillText("0", zeroEsq ? ox - 4 : ox + 4, oy + 4); }
        g.font = `italic 500 12px ${SANS}`; g.fillStyle = T.eixo;
        g.textAlign = "right"; g.textBaseline = embaixo ? "bottom" : "top"; g.fillText(cena.rotX || op.rotX || "x", m.l + W - 4, embaixo ? oy - 4 : oy + 4);
        // título do eixo y do lado oposto aos números (ou depois deles, se o eixo está na borda)
        const ty = cena.rotY || op.rotY || "y", wt = g.measureText(ty).width;
        if (direita && ox - 6 - wt < m.l) { g.textAlign = "left"; g.textBaseline = "top"; g.fillText(ty, ox + 5 + largY + 8, m.t + 2); }
        else { g.textAlign = direita ? "right" : "left"; g.textBaseline = "top"; g.fillText(ty, direita ? ox - 6 : ox + 6, m.t + 2); }
      }

      // séries (recortadas no quadro)
      g.save();
      g.beginPath(); g.rect(m.l, m.t, W, H); g.clip();
      const etiquetas = [];
      const S = cena.series || [];
      for (const s of S) {
        const cor = s.cor || corBase;
        g.setLineDash(s.tracejado ? [6, 5] : []);
        g.lineJoin = "round"; g.lineCap = "round";
        if (s.tipo === "funcao") { g.strokeStyle = cor; g.lineWidth = s.largura || 2.4; tracarFuncao(g, s, layout); }
        else if (s.tipo === "area") {
          const a = Math.min(s.a, s.b), b = Math.max(s.a, s.b), n = Math.max(60, Math.round(((X(b) - X(a)) / 2)));
          const caminho = () => { g.beginPath(); g.moveTo(X(a), Y(0)); for (let i = 0; i <= n; i++) { const x = a + ((b - a) * i) / n, y = avaliar(s.f, x); g.lineTo(X(x), Y(isFinite(y) ? Math.max(Math.min(y, y1 + (y1 - y0)), y0 - (y1 - y0)) : 0)); } g.lineTo(X(b), Y(0)); g.closePath(); };
          for (const [lado, c] of [[1, cor], [-1, s.corNeg || T.erro]]) {
            g.save(); g.beginPath();
            if (lado > 0) g.rect(m.l, m.t, W, Y(0) - m.t); else g.rect(m.l, Y(0), W, m.t + H - Y(0));
            g.clip(); caminho(); g.globalAlpha = 0.22; g.fillStyle = c; g.fill(); g.restore();
          }
        }
        else if (s.tipo === "linha") {
          g.strokeStyle = cor; g.lineWidth = s.largura || 2.4; g.beginPath();
          s.pts.forEach((p, i) => (i ? g.lineTo(X(p[0]), Y(p[1])) : g.moveTo(X(p[0]), Y(p[1])))); g.stroke();
        }
        else if (s.tipo === "seg") {
          const de = s.de || [0, 0];
          g.strokeStyle = cor; g.lineWidth = s.largura || 2; g.beginPath(); g.moveTo(X(de[0]), Y(de[1])); g.lineTo(X(s.para[0]), Y(s.para[1])); g.stroke();
          if (s.rotulo && s.etiqueta !== false) etiquetas.push({ x: (X(de[0]) + X(s.para[0])) / 2, y: (Y(de[1]) + Y(s.para[1])) / 2, t: s.rotulo, cor });
        }
        else if (s.tipo === "hline" || s.tipo === "vline") {
          g.strokeStyle = cor; g.lineWidth = s.largura || 1.4; g.beginPath();
          if (s.tipo === "hline") { g.moveTo(m.l, Y(s.v)); g.lineTo(m.l + W, Y(s.v)); } else { g.moveTo(X(s.v), m.t); g.lineTo(X(s.v), m.t + H); }
          g.stroke();
          if (s.rotulo && s.etiqueta !== false) etiquetas.push(s.tipo === "hline" ? { x: m.l + W - 4, y: Y(s.v), t: s.rotulo, cor, fixo: "acima-esq" } : { x: X(s.v), y: m.t + 4, t: s.rotulo, cor, fixo: "dir-baixo" });
        }
        else if (s.tipo === "barras") {
          g.setLineDash([]);
          for (const b of s.barras) {
            const xa = X(b.a) + 1.5, xb = X(b.b) - 1.5, yt = Y(b.v);
            g.globalAlpha = 0.35; g.fillStyle = b.cor || cor; g.fillRect(xa, yt, Math.max(xb - xa, 1), Y(0) - yt);
            g.globalAlpha = 1; g.strokeStyle = b.cor || cor; g.lineWidth = 1.5; g.beginPath(); g.moveTo(xa, Y(0)); g.lineTo(xa, yt); g.lineTo(xb, yt); g.lineTo(xb, Y(0)); g.stroke();
          }
        }
        else if (s.tipo === "circulo") {
          g.strokeStyle = cor; g.lineWidth = s.largura || 1.5;
          g.beginPath(); g.ellipse(X(s.c[0]), Y(s.c[1]), Math.abs(X(s.c[0] + s.r) - X(s.c[0])), Math.abs(Y(s.c[1] + s.r) - Y(s.c[1])), 0, 0, Math.PI * 2); g.stroke();
        }
        else if (s.tipo === "arco") {
          g.strokeStyle = cor; g.lineWidth = s.largura || 2;
          const rx = Math.abs(X(s.c[0] + s.r) - X(s.c[0]));
          g.beginPath(); g.arc(X(s.c[0]), Y(s.c[1]), rx, -s.a0, -s.a1, s.a1 > s.a0); g.stroke();
          if (s.rotulo) { const am = (s.a0 + s.a1) / 2; etiquetas.push({ x: X(s.c[0]) + (rx + 10) * Math.cos(am), y: Y(s.c[1]) - (rx + 10) * Math.sin(am), t: s.rotulo, cor, fixo: "centro" }); }
        }
        else if (s.tipo === "vetor") {
          const de = s.de || [0, 0];
          const ax = X(de[0]), ay = Y(de[1]), bx = X(s.para[0]), by = Y(s.para[1]);
          const ang = Math.atan2(by - ay, bx - ax), L = Math.hypot(bx - ax, by - ay), cab = Math.min(11, L * 0.4);
          g.strokeStyle = g.fillStyle = cor; g.lineWidth = s.largura || 2.6;
          g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx - cab * 0.7 * Math.cos(ang), by - cab * 0.7 * Math.sin(ang)); g.stroke();
          g.setLineDash([]);
          g.beginPath(); g.moveTo(bx, by); g.lineTo(bx - cab * Math.cos(ang - 0.42), by - cab * Math.sin(ang - 0.42)); g.lineTo(bx - cab * Math.cos(ang + 0.42), by - cab * Math.sin(ang + 0.42)); g.closePath(); g.fill();
          if (s.rotulo && s.etiqueta !== false) etiquetas.push({ x: bx, y: by, t: s.rotulo, cor, dir: ang });
        }
      }
      g.setLineDash([]);
      // pontos e marcas por cima das linhas
      for (const s of S) {
        const cor = s.cor || corBase;
        if (s.tipo === "pontos") {
          for (const p of s.pts) {
            const px = X(p[0]), py = Y(p[1]);
            if (p[2]) { g.strokeStyle = s.corErro || T.texto; g.lineWidth = 1.3; g.beginPath(); g.moveTo(px, Y(p[1] - p[2])); g.lineTo(px, Y(p[1] + p[2])); g.moveTo(px - 4, Y(p[1] - p[2])); g.lineTo(px + 4, Y(p[1] - p[2])); g.moveTo(px - 4, Y(p[1] + p[2])); g.lineTo(px + 4, Y(p[1] + p[2])); g.stroke(); }
            g.fillStyle = cor; g.strokeStyle = T.fundo; g.lineWidth = 1.5;
            g.beginPath(); g.arc(px, py, s.raio || 4, 0, Math.PI * 2); g.fill(); g.stroke();
          }
        } else if (s.tipo === "marca") {
          const px = X(s.x), py = Y(s.y);
          g.fillStyle = s.vazia ? T.fundo : cor; g.strokeStyle = s.vazia ? cor : T.fundo; g.lineWidth = 2;
          g.beginPath(); g.arc(px, py, s.raio || 5, 0, Math.PI * 2); g.fill(); g.stroke();
          if (s.rotulo) etiquetas.push({ x: px, y: py, t: s.rotulo, cor, r: (s.raio || 5) + 3 });
        } else if (s.tipo === "texto") {
          etiquetas.push({ x: X(s.x), y: Y(s.y), t: s.texto, cor: s.cor || T.texto, fixo: s.alinhar || "centro" });
        }
      }
      g.restore();
      desenharEtiquetas(g, etiquetas, m, W, H, T);
      desenharPonteiro(g, T, corBase);
      legenda(corBase);
    }

    function tracarFuncao(g, s, L) {
      const { x0, x1, y0, y1, X, Y, W } = L;
      const a = Math.max(x0, s.dominio ? s.dominio[0] : -Infinity), b = Math.min(x1, s.dominio ? s.dominio[1] : Infinity);
      if (!(b > a)) return;
      const n = Math.ceil(W * 1.5), span = y1 - y0;
      g.beginPath();
      let ant = null, desenhando = false;
      for (let i = 0; i <= n; i++) {
        const x = a + ((b - a) * i) / n, y = avaliar(s.f, x);
        if (!isFinite(y)) { desenhando = false; ant = null; continue; }
        // assíntota: salto enorme entre vizinhos com sinais opostos fora do quadro
        if (ant != null && Math.abs(y - ant) > span * 4 && (y - (y0 + y1) / 2) * (ant - (y0 + y1) / 2) < 0) desenhando = false;
        const yc = Math.max(Math.min(y, y1 + span * 4), y0 - span * 4);
        if (!desenhando) { g.moveTo(X(x), Y(yc)); desenhando = true; } else g.lineTo(X(x), Y(yc));
        ant = y;
      }
      g.stroke();
    }

    // etiquetas sem sobreposição: tenta 4 posições em volta do ponto
    function desenharEtiquetas(g, lista, m, W, H, T) {
      g.font = `600 12px ${SANS}`;
      g.textBaseline = "middle";
      const ocupados = [];
      const livre = (r) => r.x >= m.l + 2 && r.y >= m.t + 2 && r.x + r.w <= m.l + W - 2 && r.y + r.h <= m.t + H - 2 && !ocupados.some((o) => r.x < o.x + o.w && o.x < r.x + r.w && r.y < o.y + o.h && o.y < r.y + r.h);
      for (const e of lista) {
        const tw = g.measureText(e.t).width + 8, th = 18, d = e.r || 7;
        let cands;
        if (e.fixo === "centro") cands = [[e.x - tw / 2, e.y - th / 2]];
        else if (e.fixo === "acima-esq") cands = [[e.x - tw, e.y - th - 2], [e.x - tw, e.y + 2]];
        else if (e.fixo === "dir-baixo") cands = [[e.x + 4, e.y], [e.x - tw - 4, e.y]];
        else if (e.dir != null) { const cx = e.x + Math.cos(e.dir) * 12, cy = e.y + Math.sin(e.dir) * 12; cands = [[cx - tw / 2, cy - th / 2], [e.x + d, e.y - th - 2], [e.x - tw - d, e.y - th - 2], [e.x + d, e.y + 2], [e.x - tw - d, e.y + 2]]; }
        else cands = [[e.x + d, e.y - th - 2], [e.x - tw - d, e.y - th - 2], [e.x + d, e.y + 2], [e.x - tw - d, e.y + 2], [e.x - tw / 2, e.y - th - d], [e.x - tw / 2, e.y + d]];
        let r = cands.map(([x, y]) => ({ x, y, w: tw, h: th })).find(livre);
        if (!r) { const [x, y] = cands[0]; r = { x: Math.min(Math.max(x, m.l + 2), m.l + W - tw - 2), y: Math.min(Math.max(y, m.t + 2), m.t + H - th - 2), w: tw, h: th }; }
        ocupados.push(r);
        g.fillStyle = "rgba(11, 14, 18, 0.88)";
        g.beginPath(); g.roundRect ? g.roundRect(r.x, r.y, r.w, r.h, 4) : g.rect(r.x, r.y, r.w, r.h); g.fill();
        g.fillStyle = e.cor || T.texto; g.textAlign = "left";
        g.fillText(e.t, r.x + 4, r.y + th / 2 + 0.5);
      }
    }

    // ---------- leitura de valores ----------
    function alvoDoPonteiro() {
      if (!comLeitura || !ponteiro || !layout) return null;
      const { X, Y, Xi, m, W, H } = layout;
      const { px, py } = ponteiro;
      if (px < m.l || px > m.l + W || py < m.t || py > m.t + H) return null;
      const S = cena.series || [];
      // 1) ponto ou marca mais próxima
      let melhor = null;
      const testar = (x, y, rot, cor, extra) => { const d = Math.hypot(X(x) - px, Y(y) - py); if (d < 22 && (!melhor || d < melhor.d)) melhor = { d, x, y, rot, cor, extra }; };
      for (const s of S) {
        if (s.tipo === "pontos") s.pts.forEach((p) => testar(p[0], p[1], s.rotulo, s.cor, p[2] ? `± ${fmtSig(p[2], 2)}` : ""));
        if (s.tipo === "marca") testar(s.x, s.y, s.rotulo, s.cor);
        if (s.tipo === "vetor") testar(s.para[0], s.para[1], s.rotulo, s.cor);
      }
      if (melhor) return { tipo: "ponto", ...melhor };
      // 2) funções: valor em x
      const x = Xi(px);
      const fs = S.filter((s) => s.tipo === "funcao" && (!s.dominio || (x >= s.dominio[0] && x <= s.dominio[1])));
      if (fs.length) return { tipo: "funcao", x, ys: fs.map((s) => ({ y: avaliar(s.f, x), s })) };
      // 3) linha (ex.: trajetória): ponto mais próximo na horizontal
      const ln = S.find((s) => s.tipo === "linha" && s.leitura !== false && s.pts.length > 1);
      if (ln) {
        let best = null;
        for (const p of ln.pts) { const d = Math.abs(X(p[0]) - px); if (!best || d < best.d) best = { d, p }; }
        if (best && best.d < 30) return { tipo: "ponto", x: best.p[0], y: best.p[1], rot: ln.rotulo, cor: ln.cor, extra: ln.extraLeitura ? ln.extraLeitura(best.p) : "" };
      }
      const barras = S.find((s) => s.tipo === "barras");
      if (barras) { const b = barras.barras.find((b) => x >= b.a && x <= b.b); if (b) return { tipo: "barra", b }; }
      return null;
    }
    function desenharPonteiro(g, T, corBase) {
      const a = alvoDoPonteiro();
      const nx = cena.nomeX || "x", _ny = cena.nomeY || "y";
      if (!a) { leitura.textContent = dicaPadrao; leitura.classList.remove("on"); return; }
      const { X, Y, m, H } = layout;
      leitura.classList.add("on");
      g.save();
      if (a.tipo === "funcao") {
        g.strokeStyle = T.eixo; g.setLineDash([3, 4]); g.lineWidth = 1;
        g.beginPath(); g.moveTo(X(a.x), m.t); g.lineTo(X(a.x), m.t + H); g.stroke(); g.setLineDash([]);
        for (const { y, s } of a.ys) if (isFinite(y)) { g.fillStyle = s.cor || corBase; g.strokeStyle = T.fundo; g.lineWidth = 2; g.beginPath(); g.arc(X(a.x), Y(y), 5, 0, 7); g.fill(); g.stroke(); }
        leitura.innerHTML = `<b>${nx} = ${fmtSig(a.x)}</b>` + a.ys.map(({ y, s }) => ` · ${s.rotulo || "f(x)"} = <b>${fmtSig(y)}</b>`).join("");
      } else if (a.tipo === "barra") {
        leitura.innerHTML = `${fmtSig(a.b.a)} a ${fmtSig(a.b.b)}: <b>${fmtSig(a.b.v)}</b>${a.b.nota ? " " + a.b.nota : ""}`;
      } else {
        g.strokeStyle = a.cor || corBase; g.lineWidth = 2;
        g.beginPath(); g.arc(X(a.x), Y(a.y), 9, 0, 7); g.stroke();
        leitura.innerHTML = `${a.rot ? a.rot + ": " : ""}<b>(${fmtSig(a.x)}; ${fmtSig(a.y)})</b>${a.extra ? " " + a.extra : ""}`;
      }
      g.restore();
    }

    function legenda(corBase) {
      const itens = (cena.series || []).filter((s) => s.legenda !== false && s.rotulo && ["funcao", "linha", "pontos", "area", "barras", "vetor", "hline", "vline", "seg"].includes(s.tipo));
      const chave = itens.map((s) => s.rotulo + (s.cor || "")).join("|");
      rod.hidden = !comLeitura && !interativo && !itens.length;
      if (leg.dataset.k === chave) return;
      leg.dataset.k = chave;
      leg.innerHTML = itens.map((s) => `<span><i class="gf-sw ${s.tipo === "pontos" ? "pt" : s.tracejado ? "tr" : ""}" style="--c:${s.cor || corBase}"></i>${s.rotulo}</span>`).join("");
    }

    // ---------- interação ----------
    function zoom(f, cx, cy) {
      if (!layout) return;
      const v = vista || { ...auto };
      const { x0, x1, y0, y1 } = layout;
      const px = cx != null ? layout.Xi(cx) : (x0 + x1) / 2, py = cy != null ? layout.Yi(cy) : (y0 + y1) / 2;
      vista = { x0: px - (px - x0) * f, x1: px + (x1 - px) * f, y0: py - (py - y0) * f, y1: py + (y1 - py) * f };
      if (!(vista.x1 - vista.x0 > 1e-9 && vista.x1 - vista.x0 < 1e9)) vista = v;
      desenhar();
    }
    const ptrs = new Map();
    let arrasto = null, pinca = null;
    const pos = (e) => { const r = cv.getBoundingClientRect(); return { px: e.clientX - r.left, py: e.clientY - r.top }; };
    cv.addEventListener("pointerdown", (e) => {
      ptrs.set(e.pointerId, pos(e));
      ponteiro = pos(e);
      if (interativo && ptrs.size === 2) {
        const [a, b] = [...ptrs.values()];
        pinca = { d: Math.hypot(a.px - b.px, a.py - b.py), v: { ...layout } };
        arrasto = null;
      } else if (interativo && e.pointerType === "mouse" && e.button === 0) {
        arrasto = { px: ponteiro.px, py: ponteiro.py, v: { ...layout }, moveu: false };
        cv.setPointerCapture(e.pointerId);
      }
      desenhar();
    });
    cv.addEventListener("pointermove", (e) => {
      const p = pos(e);
      if (ptrs.has(e.pointerId)) ptrs.set(e.pointerId, p);
      if (pinca && ptrs.size === 2) {
        const [a, b] = [...ptrs.values()];
        const d = Math.hypot(a.px - b.px, a.py - b.py);
        const f = pinca.d / Math.max(d, 1);
        const v = pinca.v, cx = v.Xi((a.px + b.px) / 2), cy = v.Yi((a.py + b.py) / 2);
        vista = { x0: cx - (cx - v.x0) * f, x1: cx + (v.x1 - cx) * f, y0: cy - (cy - v.y0) * f, y1: cy + (v.y1 - cy) * f };
        ponteiro = null; desenhar(); return;
      }
      ponteiro = p;
      if (arrasto && e.buttons & 1) {
        const v = arrasto.v, dx = ((p.px - arrasto.px) / v.W) * (v.x1 - v.x0), dy = ((p.py - arrasto.py) / v.H) * (v.y1 - v.y0);
        if (Math.abs(p.px - arrasto.px) + Math.abs(p.py - arrasto.py) > 3) arrasto.moveu = true;
        if (arrasto.moveu) { vista = { x0: v.x0 - dx, x1: v.x1 - dx, y0: v.y0 + dy, y1: v.y1 + dy }; cv.classList.add("arrastando"); }
      }
      desenhar();
    });
    const soltar = (e) => {
      ptrs.delete(e.pointerId);
      if (ptrs.size < 2) pinca = null;
      if (arrasto) { arrasto = null; cv.classList.remove("arrastando"); }
      if (e.pointerType !== "mouse" && e.type !== "pointerleave") { /* no toque a leitura fica até o próximo toque */ }
    };
    cv.addEventListener("pointerup", soltar);
    cv.addEventListener("pointercancel", (e) => { soltar(e); ponteiro = null; desenhar(); });
    cv.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") { ponteiro = null; desenhar(); } });
    if (interativo) {
      cv.addEventListener("wheel", (e) => { if (!(e.ctrlKey || e.metaKey)) return; e.preventDefault(); const p = pos(e); zoom(e.deltaY > 0 ? 1.2 : 1 / 1.2, p.px, p.py); }, { passive: false });
      cv.addEventListener("dblclick", () => { vista = null; desenhar(); });
    }
    cv.classList.toggle("gf-interativo", interativo);

    let quadro = 0;
    const agendar = () => { cancelAnimationFrame(quadro); quadro = requestAnimationFrame(desenhar); };
    new ResizeObserver(agendar).observe(raiz);
    raiz.classList.add("gf-esperando");
    const MV = window.Movimento;
    const aparecer = () => {
      visivel = true;
      raiz.classList.remove("gf-esperando");
      desenhar();
      // primeira vez: a curva é revelada da esquerda para a direita (momento raro, curto)
      if (!revelado && cena && MV && !MV.reduz() && cv.animate) {
        cv.animate([{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }], { duration: 520, easing: MV.EASE.entra });
      }
      revelado = true;
    };
    if (MV) MV.quandoVisivel(raiz, aparecer);
    else aparecer();

    return {
      el: raiz,
      canvas: cv,
      definir(c, { manterVista = false } = {}) {
        cena = c;
        auto = enquadrar();
        if (!manterVista) vista = null;
        raiz.hidden = false;
        desenhar();
      },
      esconder() { raiz.hidden = true; },
      redesenhar: desenhar,
    };
  }

  LAB.estudo.grafico = grafico;
  LAB.estudo.fmtSig = fmtSig;
})();
