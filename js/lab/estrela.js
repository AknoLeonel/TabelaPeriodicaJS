/*
 * Módulo 4 - Fusão estelar
 * O interior de uma estrela: temperatura, cadeia de fusões e a curva de energia de ligação.
 */
(function () {
  "use strict";
  const LAB = window.LAB;
  const F = window.LabFisica;
  const { el, ui, clamp, lerp, rnd } = LAB;

  const Bn = (Z, A) => F.ligacao(Z, A - Z);

  // Estágios de fusão. Q em MeV vem das energias de ligação medidas.
  const ESTAGIOS = [
    { id: "H", nome: "Hidrogênio → Hélio", T: 4e6, cor: "#6cb4ff", reacao: "4 ¹H → ⁴He + 2 e⁺ + 2 ν", Q: 26.73, de: 1, para: 4, fonte: "p", txt: "A cadeia próton-próton que alimenta o Sol. A primeira etapa é raríssima: um próton precisa virar nêutron durante o choque." },
    { id: "He", nome: "Hélio → Carbono", T: 1e8, cor: "#ffd24d", reacao: "3 ⁴He → ¹²C", Q: Bn(6, 12) - 3 * Bn(2, 4), de: 4, para: 12, fonte: "He4", txt: "Processo triplo-alfa. O berílio-8 vive só 10⁻¹⁶ s: o terceiro hélio precisa chegar a tempo, por isso é preciso muita temperatura e densidade." },
    { id: "C", nome: "Carbono → Neônio", T: 6e8, cor: "#ff9a4d", reacao: "¹²C + ¹²C → ²⁰Ne + ⁴He", Q: Bn(10, 20) + Bn(2, 4) - 2 * Bn(6, 12), de: 12, para: 20, fonte: "C12", txt: "Só estrelas com mais de ~8 massas solares chegam aqui. A repulsão elétrica entre núcleos de carbono é bem maior." },
    { id: "Ne", nome: "Neônio → Oxigênio + Magnésio", T: 1.2e9, cor: "#ff5fa8", reacao: "2 ²⁰Ne → ¹⁶O + ²⁴Mg", Q: Bn(8, 16) + Bn(12, 24) - 2 * Bn(10, 20), de: 20, para: 24, fonte: "Ne20", txt: "Os raios gama já são tão energéticos que quebram parte dos núcleos de neônio, liberando hélio que alimenta outras fusões." },
    { id: "O", nome: "Oxigênio → Silício", T: 1.5e9, cor: "#ff4d4d", reacao: "¹⁶O + ¹⁶O → ²⁸Si + ⁴He", Q: Bn(14, 28) + Bn(2, 4) - 2 * Bn(8, 16), de: 16, para: 28, fonte: "O16", txt: "Gera enxofre, silício e fósforo: elementos essenciais para a vida e para rochas." },
    { id: "Si", nome: "Silício → Ferro e Níquel", T: 2.7e9, cor: "#b06bff", reacao: "2 ²⁸Si → ⁵⁶Ni (→ ⁵⁶Fe)", Q: Bn(28, 56) - 2 * Bn(14, 28), de: 28, para: 56, fonte: "Si28", txt: "A última etapa dura cerca de um dia. O resultado é o núcleo mais estável: sobra pouca energia para extrair." },
  ];
  const COR_FERRO = "#cfd8e8";

  const PRESETS = [
    { id: "ana", rotulo: "Anã vermelha", massa: "0,3 M☉", maxT: 1.2e7, cor: "#ff6a4d", dur: { H: "cerca de 1 trilhão de anos" }, destino: "Queima o hidrogênio com calma por trilhões de anos (mais que a idade do Universo) e termina como uma anã branca de hélio. Nunca chega à fusão do hélio." },
    { id: "sol", rotulo: "Sol", massa: "1 M☉", maxT: 2.2e8, cor: "#ffd860", dur: { H: "cerca de 10 bilhões de anos", He: "cerca de 100 milhões de anos" }, destino: "Daqui a ~5 bilhões de anos vira uma gigante vermelha, funde hélio em carbono e oxigênio e termina como anã branca. Nunca chega ao neônio." },
    { id: "med", rotulo: "8 massas solares", massa: "8 M☉", maxT: 1.0e9, cor: "#9ec8ff", dur: { H: "cerca de 40 milhões de anos", He: "cerca de 5 milhões de anos", C: "alguns séculos" }, destino: "Funde carbono e pode chegar ao neônio. Termina como anã branca de oxigênio-neônio ou, no limite, numa supernova rara." },
    { id: "gig", rotulo: "25 massas solares", massa: "25 M☉", maxT: 4.2e9, cor: "#8fb0ff", dur: { H: "7 milhões de anos", He: "500 mil anos", C: "600 anos", Ne: "cerca de 1 ano", O: "cerca de 6 meses", Si: "cerca de 1 dia" }, destino: "Funde até o ferro. Quando o núcleo vira ferro, a fusão deixa de render energia, o centro colapsa em menos de um segundo e a estrela explode como supernova, deixando uma estrela de nêutrons ou um buraco negro." },
  ];

  // espécies da lente de partículas
  const ESP = {
    p: { A: 1, cor: "#9ad0ff", n: "¹H" }, D: { A: 2, cor: "#7ae0ff", n: "²H" }, He3: { A: 3, cor: "#ffe9a0", n: "³He" }, He4: { A: 4, cor: "#ffd24d", n: "⁴He" },
    Be8: { A: 8, cor: "#ff8a4d", n: "⁸Be" }, C12: { A: 12, cor: "#b8b8c8", n: "¹²C" }, O16: { A: 16, cor: "#ff5a5a", n: "¹⁶O" }, Ne20: { A: 20, cor: "#ff5fa8", n: "²⁰Ne" },
    Mg24: { A: 24, cor: "#5fffa0", n: "²⁴Mg" }, Si28: { A: 28, cor: "#b06bff", n: "²⁸Si" }, Ni56: { A: 56, cor: "#cfd8e8", n: "⁵⁶Ni" },
  };

  function criar(caixa) {
    caixa.style.setProperty("--vh", "58%");
    const vista = el("div", "mod-view");
    const canvas = el("canvas");
    const hudE = el("div", "ov ov-tl hud-est");
    const hudD = el("div", "ov ov-tr hud-est");
    vista.append(canvas, hudE, hudD);
    const ctl = el("div", "mod-ctl");
    caixa.append(vista, ctl);

    const S = {
      preset: PRESETS[1], T: 1.5e7, evoluindo: false, prog: 0, velocidade: 1,
      supernova: -1, colapso: 0, fusoesSeg: 0, energia: 0, fRec: 0, tF: 0, ultimoEstagio: -1,
    };
    const T_MIN = 1e6, T_MAX = 5e9;
    let L = { w: 0, h: 0, sx: 0, sy: 0, sr: 0, lx: 0, ly: 0, lr: 0, gx: 0, gy: 0, gw: 0, gh: 0 };
    const part = [];
    const fx = [];
    const ejeta = Array.from({ length: 150 }, () => ({ a: rnd(0, 6.283), v: rnd(0.35, 1), c: ESTAGIOS[Math.floor(rnd(0, 6))].cor, r: rnd(2, 5) }));
    let curva = null;
    let marcaA = null;

    const cena = new LAB.Cena(canvas, { dprMax: 2 });

    const logT = (T) => Math.log10(T);
    function estagioAtivo(T) {
      let a = -1;
      for (let i = 0; i < ESTAGIOS.length; i++) if (T >= ESTAGIOS[i].T) a = i;
      return a;
    }

    // ---------- curva de energia de ligação ----------
    function montarCurva() {
      curva = new Float32Array(251);
      for (let A = 2; A <= 250; A++) curva[A] = F.curvaBA(A);
      curva[1] = 0;
    }

    cena.aoRedimensionar = (w, h) => {
      const topo = h * 0.6;
      const r = Math.min(w * 0.23, topo * 0.4);
      L = { w, h, sx: w * 0.27, sy: topo * 0.55, sr: r, lx: w * 0.73, ly: topo * 0.55, lr: Math.min(w * 0.21, topo * 0.38), gx: 40, gy: topo + 20, gw: w - 54, gh: h - topo - 46 };
      L.scale = L.lr / 70;
    };

    // ---------- lente de partículas ----------
    const rEsp = (t) => (3.2 + 2.1 * Math.cbrt(ESP[t].A)) * L.scale;
    function novaParticula(tipo, borda = true) {
      const r = rEsp(tipo);
      let x, y;
      if (borda) { const a = rnd(0, 6.283); x = L.lx + Math.cos(a) * (L.lr - r); y = L.ly + Math.sin(a) * (L.lr - r); }
      else { const a = rnd(0, 6.283), d = Math.sqrt(Math.random()) * (L.lr - r); x = L.lx + Math.cos(a) * d; y = L.ly + Math.sin(a) * d; }
      const a2 = rnd(0, 6.283);
      return { tipo, x, y, vx: Math.cos(a2), vy: Math.sin(a2), vida: 99, cd: 0 };
    }
    function adicionar(tipo, borda) { if (part.length < 70) { const p = novaParticula(tipo, borda); part.push(p); return p; } return null; }

    let estagioLente = -2;
    function configurarLente(i) {
      estagioLente = i;
      part.length = 0;
      const fonte = ESTAGIOS[Math.max(i, 0)].fonte;
      for (let k = 0; k < 24; k++) adicionar(fonte, false);
    }

    function prob(T, est, passo = 1) {
      // fator tipo Gamow: sobe depressa com a temperatura e quase some abaixo do limiar
      const Tth = est.T;
      const f = 0.3 * Math.exp(-2.6 * (Math.sqrt(Tth / T) - 1));
      return clamp(f * passo, 0, 0.8);
    }

    function flash(x, y, cor, r = 26) { fx.push({ x, y, v: 0.5, max: 0.5, cor, r }); }

    function fundir(a, b, est) {
      const x = (a.x + b.x) / 2, y = (a.y + b.y) / 2;
      const T = S.T;
      const id = est.id;
      let sai = [];
      if (id === "H") {
        if (a.tipo === "p" && b.tipo === "p") { a.tipo = "D"; b.vida = -1; }
        else if ((a.tipo === "D" && b.tipo === "p") || (a.tipo === "p" && b.tipo === "D")) { a.tipo = "He3"; b.vida = -1; }
        else if (a.tipo === "He3" && b.tipo === "He3") { a.tipo = "He4"; b.tipo = "p"; sai = ["p"]; }
        else return false;
      } else if (id === "He") {
        if (a.tipo === "He4" && b.tipo === "He4") { a.tipo = "Be8"; a.vida = 0.4; b.vida = -1; }
        else if ((a.tipo === "Be8" && b.tipo === "He4") || (a.tipo === "He4" && b.tipo === "Be8")) { a.tipo = "C12"; a.vida = 99; b.vida = -1; }
        else return false;
      } else if (id === "C") { a.tipo = "Ne20"; b.tipo = "He4"; }
      else if (id === "Ne") { a.tipo = "O16"; b.tipo = "Mg24"; }
      else if (id === "O") { a.tipo = "Si28"; b.tipo = "He4"; }
      else if (id === "Si") { a.tipo = "Ni56"; b.vida = -1; }
      // produtos somem aos poucos (a lente se renova)
      const combustivel = id === "H" ? "p" : est.fonte;
      for (const q of [a, b]) {
        if (q.vida < 0 || q.tipo === combustivel || q.tipo === "Be8") continue;
        q.vida = q.tipo === "D" || q.tipo === "He3" ? 14 : 3.5;
      }
      flash(x, y, est.cor, 18 + (id === "H" ? 0 : 14));
      S.fusoesSeg++; S.energia += id === "H" ? 4 : est.Q;
      LAB.som.tom(300 + rnd(0, 300), 0.06, 0.03, "triangle", 200);
      return true;
    }

    cena.atualizar = (dt, t) => {
      // tempo da estrela
      if (S.evoluindo && S.supernova < 0) {
        S.prog += dt / (26 / S.velocidade);
        const a = Math.log10(2e6), b = Math.log10(S.preset.maxT);
        S.T = Math.pow(10, a + (b - a) * clamp(S.prog, 0, 1));
        slT.set(S.T);
        if (S.prog >= 1) {
          S.evoluindo = false;
          btVida.textContent = "▶ Viver a vida da estrela";
          if (S.preset.id === "gig") { S.colapso = 1; setTimeout(() => iniciarSupernova(), 900); }
          else { fimDaVida(); }
        }
      }
      if (S.colapso > 0) S.colapso = Math.max(0, S.colapso - dt * 0.6);
      if (S.supernova >= 0) S.supernova += dt;

      const idx = estagioAtivo(S.T);
      if (idx !== estagioLente && S.supernova < 0) configurarLente(idx);
      const est = ESTAGIOS[Math.max(idx, 0)];
      const quente = idx >= 0;
      // velocidade térmica
      const vt = (40 + 110 * clamp(Math.sqrt(S.T / est.T), 0.15, 2.2)) * L.scale;

      for (let i = part.length - 1; i >= 0; i--) {
        const p = part[i];
        if (p.vida < 90) {
          p.vida -= dt;
          if (p.vida <= 0) {
            if (p.tipo === "Be8") { // o berílio-8 desfaz-se de volta em dois núcleos de hélio
              p.tipo = "He4"; p.vida = 99;
              const q = adicionar("He4", false);
              if (q) { q.x = p.x; q.y = p.y; q.vx = -p.vx; q.vy = -p.vy; }
            } else { part.splice(i, 1); continue; }
          }
        }
        p.cd = Math.max(0, p.cd - dt);
        const v = Math.hypot(p.vx, p.vy) || 1;
        const sz = Math.sqrt(ESP[p.tipo].A);
        const alvo = vt / Math.sqrt(sz);
        const m = 1 + (alvo / v - 1) * Math.min(1, dt * 3);
        p.vx *= m; p.vy *= m;
        p.vx += (Math.random() - 0.5) * 60 * dt * L.scale; p.vy += (Math.random() - 0.5) * 60 * dt * L.scale;
        p.x += p.vx * dt; p.y += p.vy * dt;
        // parede circular da lente
        const dx = p.x - L.lx, dy = p.y - L.ly, d = Math.hypot(dx, dy), lim = L.lr - rEsp(p.tipo);
        if (d > lim) {
          const nx = dx / d, ny = dy / d;
          const dot = p.vx * nx + p.vy * ny;
          if (dot > 0) { p.vx -= 2 * dot * nx; p.vy -= 2 * dot * ny; }
          p.x = L.lx + nx * lim; p.y = L.ly + ny * lim;
        }
      }
      // choques
      const n = part.length;
      for (let i = 0; i < n; i++) {
        const a = part[i];
        for (let j = i + 1; j < n; j++) {
          const b = part[j];
          const rr = (rEsp(a.tipo) + rEsp(b.tipo)) * 0.95;
          const dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy;
          if (d2 > rr * rr || d2 === 0) continue;
          // pode fundir?
          const fusivel = quente && podeFundir(a, b, est);
          if (fusivel && a.cd <= 0 && b.cd <= 0) {
            a.cd = b.cd = 0.18;
            let passo = 1;
            if (est.id === "H" && a.tipo === "p" && b.tipo === "p") passo = 0.12; // a etapa mais lenta
            if (est.id === "He" && (a.tipo === "Be8" || b.tipo === "Be8")) passo = 3;
            if (Math.random() < prob(S.T, est, passo)) { fundir(a, b, est); continue; }
          }
          // repulsão (barreira de Coulomb): quica
          const d = Math.sqrt(d2), nx = dx / d, ny = dy / d;
          const dv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (dv < 0) { const mA = ESP[a.tipo].A, mB = ESP[b.tipo].A, k = (2 * dv) / (mA + mB); a.vx += k * mB * nx; a.vy += k * mB * ny; b.vx -= k * mA * nx; b.vy -= k * mA * ny; }
          const sob = (rr - d) / 2; a.x -= nx * sob; a.y -= ny * sob; b.x += nx * sob; b.y += ny * sob;
        }
      }
      // reposição de combustível
      let comb = 0;
      const fonteTipos = est.id === "H" ? ["p"] : [est.fonte];
      for (const p of part) if (fonteTipos.includes(p.tipo)) comb++;
      if (S.supernova < 0 && comb < 18 && part.length < 52) adicionar(fonteTipos[0], true);

      for (let i = fx.length - 1; i >= 0; i--) { fx[i].v -= dt; if (fx[i].v <= 0) fx.splice(i, 1); }
      S.tF += dt;
      if (S.tF >= 1) { S.fRec = S.fusoesSeg / S.tF; S.fusoesSeg = 0; S.tF = 0; }
      atualizarHUD(false);
    };
    function podeFundir(a, b, est) {
      const x = a.tipo, y = b.tipo;
      switch (est.id) {
        case "H": return (x === "p" && y === "p") || (x === "D" && y === "p") || (x === "p" && y === "D") || (x === "He3" && y === "He3");
        case "He": return (x === "He4" && y === "He4") || (x === "Be8" && y === "He4") || (x === "He4" && y === "Be8");
        case "C": return x === "C12" && y === "C12";
        case "Ne": return x === "Ne20" && y === "Ne20";
        case "O": return x === "O16" && y === "O16";
        case "Si": return x === "Si28" && y === "Si28";
      }
      return false;
    }

    // ---------- fim de vida ----------
    function iniciarSupernova() {
      S.supernova = 0;
      LAB.som.estouro(0.5); LAB.som.vibrar(150);
      avisoFim.innerHTML = `<b>Supernova!</b> O núcleo de ferro colapsou e a estrela explodiu, espalhando oxigênio, silício, ferro e muito mais pelo espaço. O ferro do seu sangue e o cálcio dos seus ossos foram feitos assim. Os elementos mais pesados, como o ouro, vêm de colisões de estrelas de nêutrons.`;
      avisoFim.classList.add("on");
    }
    function fimDaVida() {
      avisoFim.innerHTML = `<b>Fim da fusão.</b> ${S.preset.destino}`;
      avisoFim.classList.add("on");
    }

    // ---------- desenho ----------
    function corRingue(i) { return ESTAGIOS[i].cor; }
    cena.desenhar = (g, w, h, t) => {
      g.clearRect(0, 0, w, h);
      const idx = estagioAtivo(S.T);
      // ---- estrela em camadas ----
      const { sx, sy, sr } = L;
      const sn = S.supernova;
      if (sn < 0) {
        const pulso = 1 + Math.sin(t * 2.4) * 0.012 - S.colapso * 0.25;
        const R = sr * pulso;
        g.globalCompositeOperation = "lighter";
        const halo = LAB.brilho(64, S.preset.cor, 0.15);
        g.globalAlpha = 0.7;
        g.drawImage(halo, sx - R * 1.9, sy - R * 1.9, R * 3.8, R * 3.8);
        g.globalAlpha = 1;
        g.globalCompositeOperation = "source-over";
        // envelope (hidrogênio) e camadas internas
        const cam = [["H", 1], ["He", 0.78], ["C", 0.6], ["Ne", 0.46], ["O", 0.36], ["Si", 0.25]];
        const base = g.createRadialGradient(sx - R * 0.3, sy - R * 0.3, R * 0.1, sx, sy, R);
        base.addColorStop(0, "#fff");
        base.addColorStop(0.35, S.preset.cor);
        base.addColorStop(1, LAB.rgba(S.preset.cor, 0.55));
        g.fillStyle = base;
        g.beginPath(); g.arc(sx, sy, R, 0, 6.2832); g.fill();
        for (let k = 1; k < cam.length; k++) {
          const ei = ESTAGIOS.findIndex((e) => e.id === cam[k][0]);
          if (ei > idx) break;
          const r = R * cam[k][1];
          g.fillStyle = LAB.rgba(corRingue(ei), 0.88);
          g.beginPath(); g.arc(sx, sy, r, 0, 6.2832); g.fill();
          g.strokeStyle = "rgba(255,255,255,0.35)"; g.lineWidth = 1;
          g.beginPath(); g.arc(sx, sy, r, 0, 6.2832); g.stroke();
        }
        // núcleo de ferro quando o silício já queima
        if (idx >= 5) {
          const rf = R * (0.12 + 0.08 * S.prog);
          g.fillStyle = COR_FERRO; g.beginPath(); g.arc(sx, sy, rf, 0, 6.2832); g.fill();
        }
        // granulação: arcos girando
        g.strokeStyle = "rgba(255,255,255,0.14)"; g.lineWidth = 1.5;
        for (let k = 0; k < 7; k++) {
          const a0 = t * (0.3 + k * 0.07) + k * 1.9, rr = R * (0.2 + k * 0.12);
          g.beginPath(); g.arc(sx, sy, rr, a0, a0 + 0.9); g.stroke();
        }
        g.fillStyle = "rgba(235,240,255,0.8)"; g.font = "600 11px Inter, sans-serif"; g.textAlign = "center";
        g.fillText(S.preset.massa, sx, sy + R + 16);
        g.textAlign = "left";
      } else {
        // supernova: onda de choque e ejetos
        const k = sn;
        if (k < 0.5) { g.fillStyle = `rgba(255,255,255,${(1 - k * 2) * 0.9})`; g.fillRect(0, 0, w, L.h * 0.6); }
        g.globalCompositeOperation = "lighter";
        const R = sr * (0.4 + k * 2.4);
        g.strokeStyle = `rgba(255,220,160,${Math.max(0, 1 - k / 3.5)})`; g.lineWidth = 6 * Math.max(0.2, 1 - k / 3.5);
        g.beginPath(); g.arc(sx, sy, R, 0, 6.2832); g.stroke();
        const brilho = (c) => LAB.brilho(6, c, 0.9);
        for (const e of ejeta) {
          const d = e.v * sr * (0.2 + k * 1.9);
          g.globalAlpha = Math.max(0, 1 - k / 4);
          g.drawImage(brilho(e.c), sx + Math.cos(e.a) * d - e.r * 1.6, sy + Math.sin(e.a) * d - e.r * 1.6, e.r * 3.2, e.r * 3.2);
        }
        g.globalAlpha = 1;
        g.globalCompositeOperation = "source-over";
        // remanescente
        g.fillStyle = "#e8ecff";
        g.beginPath(); g.arc(sx, sy, 3 + Math.sin(t * 20) * 0.6, 0, 6.2832); g.fill();
      }

      // ---- lente ----
      const { lx, ly, lr } = L;
      const est = ESTAGIOS[Math.max(idx, 0)];
      g.fillStyle = "rgba(2,3,10,0.85)";
      g.beginPath(); g.arc(lx, ly, lr, 0, 6.2832); g.fill();
      g.strokeStyle = LAB.rgba(est.cor, idx >= 0 ? 0.9 : 0.3); g.lineWidth = 2.5;
      g.shadowColor = est.cor; g.shadowBlur = idx >= 0 ? 12 : 0;
      g.beginPath(); g.arc(lx, ly, lr, 0, 6.2832); g.stroke(); g.shadowBlur = 0;
      g.save();
      g.beginPath(); g.arc(lx, ly, lr - 1, 0, 6.2832); g.clip();
      const sprites = {};
      for (const p of part) {
        const r = rEsp(p.tipo);
        const s = sprites[p.tipo] || (sprites[p.tipo] = LAB.esfera(Math.max(3, Math.round(r)), ESP[p.tipo].cor));
        const fade = p.vida < 90 ? clamp(p.vida / 1.2, 0, 1) : 1;
        g.globalAlpha = fade;
        g.drawImage(s, p.x - r - 3, p.y - r - 3, r * 2 + 6, r * 2 + 6);
      }
      g.globalAlpha = 1;
      g.globalCompositeOperation = "lighter";
      for (const f of fx) {
        const k = f.v / f.max;
        g.strokeStyle = LAB.rgba(f.cor, k); g.lineWidth = 2;
        g.beginPath(); g.arc(f.x, f.y, f.r * L.scale * (1 - k) + 4, 0, 6.2832); g.stroke();
        const br = LAB.brilho(10, "#ffffff", 1);
        g.globalAlpha = k;
        g.drawImage(br, f.x - 12, f.y - 12, 24, 24);
        g.globalAlpha = 1;
      }
      g.globalCompositeOperation = "source-over";
      g.restore();
      if (idx < 0) {
        g.fillStyle = "rgba(235,240,255,0.85)"; g.font = "600 11px Inter, sans-serif"; g.textAlign = "center";
        g.fillText("frio demais para fundir", lx, ly + lr + 16); g.textAlign = "left";
      } else {
        g.fillStyle = "rgba(235,240,255,0.7)"; g.font = "500 11px Inter, sans-serif"; g.textAlign = "center";
        g.fillText("zoom no núcleo", lx, ly + lr + 16); g.textAlign = "left";
      }

      // ---- gráfico B/A ----
      const { gx, gy, gw, gh } = L;
      if (!curva) montarCurva();
      const X = (A) => gx + (A / 250) * gw;
      const Y = (b) => gy + (1 - b / 9.4) * gh;
      g.fillStyle = "rgba(255,255,255,0.03)"; g.fillRect(gx, gy, gw, gh);
      // regiões
      const gf = g.createLinearGradient(X(0), 0, X(56), 0);
      gf.addColorStop(0, "rgba(77,163,255,0.14)"); gf.addColorStop(1, "rgba(77,163,255,0.02)");
      g.fillStyle = gf; g.fillRect(X(0), gy, X(56) - X(0), gh);
      const gs = g.createLinearGradient(X(56), 0, X(250), 0);
      gs.addColorStop(0, "rgba(255,178,61,0.02)"); gs.addColorStop(1, "rgba(255,178,61,0.14)");
      g.fillStyle = gs; g.fillRect(X(56), gy, X(250) - X(56), gh);
      g.fillStyle = "rgba(160,200,255,0.9)"; g.font = "600 10.5px Inter, sans-serif";
      g.fillText("← fusão libera energia", gx + 6, gy + gh - 8);
      g.textAlign = "right"; g.fillStyle = "rgba(255,200,120,0.9)";
      g.fillText("fissão libera energia →", gx + gw - 6, gy + gh - 8); g.textAlign = "left";
      // eixos
      g.strokeStyle = "rgba(255,255,255,0.1)"; g.lineWidth = 1; g.fillStyle = "rgba(220,226,255,0.55)"; g.font = "10px Inter, sans-serif";
      for (const b of [0, 2, 4, 6, 8]) { g.beginPath(); g.moveTo(gx, Y(b)); g.lineTo(gx + gw, Y(b)); g.stroke(); g.fillText(String(b), gx - 12, Y(b) + 3); }
      for (const A of [0, 50, 100, 150, 200, 250]) g.fillText(String(A), X(A) - 6, gy + gh + 13);
      g.save(); g.translate(10, gy + gh / 2 + 36); g.rotate(-Math.PI / 2); g.fillText("energia por núcleon (MeV)", 0, 0); g.restore();
      g.fillText("número de massa A", gx + gw / 2 - 40, gy + gh + 25);
      // curva
      g.strokeStyle = "#5df0b0"; g.lineWidth = 2.2; g.shadowColor = "#5df0b0"; g.shadowBlur = 8; g.lineJoin = "round";
      g.beginPath();
      for (let A = 2; A <= 250; A++) { const px = X(A), py = Y(curva[A]); A === 2 ? g.moveTo(px, py) : g.lineTo(px, py); }
      g.stroke(); g.shadowBlur = 0;
      // marcos
      const marcos = [[2, "²H"], [4, "⁴He"], [12, "¹²C"], [56, "⁵⁶Fe"], [235, "²³⁵U"]];
      for (const [A, nome] of marcos) {
        const px = X(A), py = Y(curva[A]);
        g.fillStyle = A === 56 ? "#fff" : "rgba(255,255,255,0.8)";
        g.beginPath(); g.arc(px, py, A === 56 ? 4.5 : 3, 0, 6.2832); g.fill();
        g.fillStyle = A === 56 ? "#fff" : "rgba(235,240,255,0.8)"; g.font = (A === 56 ? "700 " : "500 ") + "10.5px Inter, sans-serif";
        g.textAlign = A === 235 ? "right" : "left";
        g.fillText(nome, px + (A === 235 ? -4 : 6), py - 7); g.textAlign = "left";
      }
      // fusão em curso: de -> para
      if (idx >= 0) {
        const a = ESTAGIOS[idx];
        const x1 = X(a.de), y1 = Y(curva[a.de] || 0), x2 = X(a.para), y2 = Y(curva[a.para]);
        g.strokeStyle = a.cor; g.lineWidth = 2; g.setLineDash([4, 4]);
        g.beginPath(); g.moveTo(x1, y1); g.quadraticCurveTo((x1 + x2) / 2, Math.min(y1, y2) - 30, x2, y2); g.stroke(); g.setLineDash([]);
        const pulso = 4 + Math.sin(t * 6) * 1.5;
        g.fillStyle = a.cor; g.beginPath(); g.arc(x1, y1, pulso, 0, 6.2832); g.fill();
        g.beginPath(); g.arc(x2, y2, pulso, 0, 6.2832); g.fill();
      }
      // marcador do usuário
      if (marcaA) {
        const px = X(marcaA), py = Y(curva[marcaA]);
        g.strokeStyle = "#fff"; g.lineWidth = 1; g.beginPath(); g.moveTo(px, gy); g.lineTo(px, gy + gh); g.stroke();
        g.fillStyle = "#fff"; g.beginPath(); g.arc(px, py, 4, 0, 6.2832); g.fill();
        const txt = `A = ${marcaA}: ${F.num(curva[marcaA], 2)} MeV/núcleon`;
        g.font = "600 11px Inter, sans-serif";
        const tw = g.measureText(txt).width;
        g.fillStyle = "rgba(5,6,13,0.85)"; g.fillRect(clamp(px - tw / 2, gx, gx + gw - tw - 8) - 4, gy + 4, tw + 12, 20);
        g.fillStyle = "#fff"; g.fillText(txt, clamp(px - tw / 2, gx, gx + gw - tw - 8) + 2, gy + 18);
      }
    };

    // toque no gráfico: explora a curva
    canvas.style.touchAction = "none";
    let arrasta = false;
    const pickA = (e) => {
      const p = cena.pos(e);
      if (p.y < L.gy - 12 || p.y > L.gy + L.gh + 30) return false;
      marcaA = clamp(Math.round(((p.x - L.gx) / L.gw) * 250), 2, 250);
      return true;
    };
    canvas.addEventListener("pointerdown", (e) => { if (pickA(e)) { arrasta = true; canvas.setPointerCapture(e.pointerId); } });
    canvas.addEventListener("pointermove", (e) => { if (arrasta) pickA(e); });
    canvas.addEventListener("pointerup", () => { arrasta = false; });

    // ---------- HUD ----------
    let tHud = 0;
    function fmtT(T) { return T < 1e9 ? `${F.num(T / 1e6, T < 1e7 ? 1 : 0)} milhões de K` : `${F.num(T / 1e9, 2)} bilhões de K`; }
    function atualizarHUD(forcar) {
      const agora = performance.now();
      if (!forcar && agora - tHud < 150) return;
      tHud = agora;
      const idx = estagioAtivo(S.T);
      hudE.innerHTML = `<div class="est-T">${fmtT(S.T)}</div><div class="dec-sub">${F.num(S.fRec, 0)} fusões/s · ${F.num(S.energia, 0)} MeV liberados</div>`;
      const nome = idx < 0 ? "Sem fusão" : ESTAGIOS[idx].nome;
      hudD.innerHTML = `<div class="est-fase" style="--c:${idx < 0 ? "#9aa3c8" : ESTAGIOS[idx].cor}">${nome}</div>`;
      atualizarFase(idx);
    }

    // ---------- controles ----------
    const seg = ui.segmentado({
      itens: PRESETS.map((p) => ({ id: p.id, rotulo: p.rotulo })),
      valor: "sol",
      onChange: (id) => escolher(id),
    });
    const cEstrela = ui.cartao("Escolha a estrela", seg.el);
    const infoEstrela = el("p");
    infoEstrela.style.marginTop = "10px";
    cEstrela.appendChild(infoEstrela);

    const btVida = ui.botao("▶ Viver a vida da estrela", () => {
      if (S.evoluindo) { S.evoluindo = false; btVida.textContent = "▶ Continuar"; return; }
      if (S.supernova >= 0 || S.prog >= 1) reiniciarVida();
      S.evoluindo = true; btVida.textContent = "⏸ Pausar";
      avisoFim.classList.remove("on");
    });
    const slVel = ui.slider({ rotulo: "Velocidade", min: 0.4, max: 3, passo: 0.1, valor: 1, fmt: (v) => `${F.num(v, 1)}×`, onInput: (v) => { S.velocidade = v; } });
    const slT = ui.slider({
      rotulo: "Temperatura do núcleo", min: T_MIN, max: T_MAX, valor: S.T, log: true, fmt: fmtT,
      onInput: (v) => { S.evoluindo = false; btVida.textContent = "▶ Viver a vida da estrela"; S.T = v; S.supernova = -1; avisoFim.classList.remove("on"); atualizarHUD(true); },
      cor: "#ff7a45",
    });
    const avisoFim = el("div", "res-fis fim");
    const cControle = ui.cartao("Controles", "");
    cControle.append(btVida, el("div", "esp"), slVel.el, el("div", "esp"), slT.el, avisoFim);

    const faseCorpo = el("div");
    const cFase = ui.cartao("Fase atual", faseCorpo);
    function atualizarFase(idx) {
      if (S.ultimoEstagio === idx && !forcaFase) return;
      forcaFase = false;
      S.ultimoEstagio = idx;
      if (idx < 0) { faseCorpo.innerHTML = `<p>Abaixo de ~4 milhões de graus os núcleos de hidrogênio se repelem eletricamente e não chegam perto o bastante para fundir. Aumente a temperatura.</p>`; return; }
      const e = ESTAGIOS[idx];
      const dur = S.preset.dur[e.id];
      faseCorpo.innerHTML = `
        <div class="est-reacao" style="--c:${e.cor}">${e.reacao}</div>
        <dl class="lin"><div><dt>Energia por reação</dt><dd>${F.num(e.Q, 1)} <small>MeV</small></dd></div>
        <div><dt>A partir de</dt><dd>${fmtT(e.T)}</dd></div>
        <div class="larga"><dt>Quanto dura nesta estrela</dt><dd>${dur || "não chega a acontecer"}</dd></div></dl>
        <p style="margin-top:10px">${e.txt}</p>`;
    }
    let forcaFase = false;

    const cFerro = ui.cartao("Por que o ferro é o fim?", `
      <p>Toque no gráfico para explorar. A curva mostra quanta energia cada núcleon guarda no núcleo. Núcleos mais leves que o <b>ferro-56</b> liberam energia ao <b>fundir</b>; mais pesados, ao <b>dividir</b> (fissão).</p>
      <p>O ferro está no topo: fundi-lo <i>consome</i> energia em vez de liberar. Quando o núcleo da estrela vira ferro, a pressão que a sustentava some e ela colapsa.</p>`);

    const linhasTab = ESTAGIOS.map((e) => `<div class="tab-est" data-t="${e.T}" style="--c:${e.cor}"><b>${e.nome}</b><span>${F.num(e.Q, 1)} MeV · ${fmtT(e.T)}</span></div>`).join("");
    const cTab = ui.cartao("Os estágios (toque para ir até lá)", `<div class="tab-est-lista">${linhasTab}</div>`);
    cTab.addEventListener("click", (e) => {
      const l = e.target.closest(".tab-est");
      if (!l) return;
      S.evoluindo = false; btVida.textContent = "▶ Viver a vida da estrela"; S.supernova = -1;
      S.T = +l.dataset.t * 1.15; slT.set(S.T); atualizarHUD(true);
    });

    ctl.append(cEstrela, cControle, cFase, cFerro, cTab);

    function escolher(id) {
      S.preset = PRESETS.find((p) => p.id === id);
      infoEstrela.textContent = S.preset.destino;
      reiniciarVida();
    }
    function reiniciarVida() {
      S.prog = 0; S.supernova = -1; S.colapso = 0; S.evoluindo = false; S.energia = 0;
      S.T = 1.5e6; slT.set(S.T);
      btVida.textContent = "▶ Viver a vida da estrela";
      avisoFim.classList.remove("on");
      forcaFase = true; estagioLente = -2;
      atualizarHUD(true);
    }
    infoEstrela.textContent = S.preset.destino;
    S.T = 1.5e7; slT.set(S.T);
    montarCurva();
    atualizarHUD(true);

    return {
      iniciar() { cena.iniciar(); },
      parar() { cena.parar(); },
    };
  }

  LAB.modulos.push({
    id: "estrela",
    nome: "Estrela",
    resumo: "Fusão nuclear e a curva de energia",
    cor: "#ff7a45",
    selo: "parcial",
    icone: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg>',
    nota: {
      real: [
        "As reações de cada estágio e a energia liberada em cada uma, calculadas com as energias de ligação medidas (por exemplo, 7,27 MeV no triplo-alfa).",
        "As temperaturas aproximadas em que cada combustível começa a queimar e quanto tempo dura cada fase numa estrela de 25 massas solares.",
        "A curva de energia de ligação por núcleon, com o máximo no ferro-56.",
        "A chance de fusão sobe muito rápido com a temperatura (efeito da barreira elétrica e do túnel quântico).",
      ],
      simplificado: [
        "A lente de partículas é uma ilustração: poucos núcleos, em 2D, e a probabilidade de fusão é calibrada para ser visível.",
        "A estrela em camadas é um esquema (as proporções e as cores não são reais).",
        "A evolução é comprimida: milhões de anos viram segundos, e o limite de cada tipo de estrela é aproximado.",
      ],
    },
    criar,
  });
})();
