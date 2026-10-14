/*
 * Módulo 3 - Reator de fissão
 * Reação em cadeia: toque para disparar um nêutron e controle o reator.
 */
(function () {
  "use strict";
  const LAB = window.LAB;
  const F = window.LabFisica;
  const { el, ui, clamp, rnd } = LAB;

  const MAXN = 700;
  const COR_U5 = "#ffb23d", COR_U8 = "#7c8aa8", COR_RAPIDO = "#fff3b0", COR_LENTO = "#38e0ff";

  function criar(caixa) {
    caixa.style.setProperty("--vh", "52%");
    const vista = el("div", "mod-view");
    const canvas = el("canvas");
    const hudE = el("div", "ov ov-tl hud-rea");
    const hudD = el("div", "ov ov-tr hud-rea");
    const dicaToque = el("div", "ov ov-c dica-toque", "Toque no reator para disparar um nêutron");
    dicaToque.style.top = "46%";
    vista.append(canvas, hudE, hudD, dicaToque);
    const ctl = el("div", "mod-ctl");
    caixa.append(vista, ctl);

    const P = { barras: 0.4, moderador: 0.6, fissil: 0.35, fonte: 5 };
    const S = {
      calor: 0, scram: false, fissoes: 0, energia: 0, k: 1, tEstavel: 0, primeiraVez: false,
      janela: { prod: 0, perda: 0, t: 0 }, historico: new Float32Array(150), hIdx: 0, hAcum: 0, hT: 0, fissRecentes: 0, taxa: 0,
      metas: { primeira: false, cadeia: false, estavel: false, scram: false },
      combustivel: 0, gastos: 0, est: { fuga: 0, barra: 0, u8: 0, cap: 0, fis: 0, mod: 0 },
    };

    // ---------- campo ----------
    let campo = { x: 10, y: 70, w: 100, h: 100 };
    let sp = 30, rN = 8, cols = 1, rows = 1;
    let nx, ny, nt, nf, nu8; // pastilhas de combustível: x, y, tipo (0=U-235, 1=U-238, 2=gasto), flash, fissões já feitas
    const QUEIMA = 14; // cada pastilha representa muitos átomos: só se esgota depois de várias fissões
    let nCount = 0;
    let celula, celulaN, gc = 1, gr = 1;
    let rods = [];
    let bolhas = [];
    // nêutrons
    const px = new Float32Array(MAXN), py = new Float32Array(MAXN), vx = new Float32Array(MAXN), vy = new Float32Array(MAXN);
    const pr = new Uint8Array(MAXN); // 1 = rápido
    const ul = new Int16Array(MAXN).fill(-1); // último núcleo com que o nêutron interagiu (uma chance por contato)
    let nn = 0;
    const fx = [];
    const toqueMarca = [];

    const cena = new LAB.Cena(canvas, { dprMax: 2 });

    function montar() {
      if (!cena.w) return;
      const w = cena.w, h = cena.h;
      campo = { x: 10, y: 74, w: w - 20, h: h - 74 - 66 };
      sp = clamp(Math.min(campo.w / 12, campo.h / 9.5), 22, 46);
      rN = sp * 0.3;
      cols = Math.floor(campo.w / sp);
      rows = Math.floor(campo.h / (sp * 0.866));
      nCount = cols * rows;
      nx = new Float32Array(nCount); ny = new Float32Array(nCount); nt = new Uint8Array(nCount); nf = new Float32Array(nCount); nu8 = new Uint8Array(nCount);
      const ox = campo.x + (campo.w - cols * sp) / 2 + sp / 2, oy = campo.y + (campo.h - rows * sp * 0.866) / 2 + sp * 0.43;
      gc = Math.ceil(campo.w / sp) + 1; gr = Math.ceil(campo.h / sp) + 1;
      celula = new Int16Array(gc * gr * 4); celulaN = new Uint8Array(gc * gr);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          nx[i] = ox + c * sp + (r % 2 ? sp / 2 : 0) - (r % 2 ? sp * 0.25 : 0);
          ny[i] = oy + r * sp * 0.866;
          const cx = clamp(Math.floor((nx[i] - campo.x) / sp), 0, gc - 1), cy = clamp(Math.floor((ny[i] - campo.y) / sp), 0, gr - 1);
          const k = cy * gc + cx;
          if (celulaN[k] < 4) celula[k * 4 + celulaN[k]++] = i;
        }
      }
      rods = [];
      const nr = Math.max(3, Math.floor(cols / 3));
      for (let k = 0; k < nr; k++) rods.push(campo.x + ((k + 0.5) / nr) * campo.w);
      bolhas = Array.from({ length: 16 }, () => ({ x: rnd(campo.x, campo.x + campo.w), y: rnd(campo.y, campo.y + campo.h), r: rnd(2, 5), v: rnd(8, 22) }));
      recarregar(true);
    }

    function recarregar(silencioso) {
      for (let i = 0; i < nCount; i++) { nt[i] = Math.random() < P.fissil ? 0 : 1; nf[i] = 0; nu8[i] = 0; }
      nn = 0; fx.length = 0; toqueMarca.length = 0;
      S.calor = 0; S.scram = false; S.fissoes = 0; S.energia = 0; S.gastos = 0; S.k = 1; S.tEstavel = 0;
      S.janela = { prod: 0, perda: 0, t: 0 };
      S.historico.fill(0);
      S.combustivel = contarFissil();
      S.scramBarras = null;
      if (!silencioso) LAB.som.tom(440, 0.2, 0.08, "triangle", 660);
      atualizarHUD(true);
    }
    const contarFissil = () => { let c = 0; for (let i = 0; i < nCount; i++) if (nt[i] === 0) c++; return c; };

    // ---------- física ----------
    function lancar(x, y, rapido = true, ang = Math.random() * 6.283, origem = -1) {
      if (nn >= MAXN) return;
      const v = rapido ? 300 : 110;
      px[nn] = x; py[nn] = y; vx[nn] = Math.cos(ang) * v; vy[nn] = Math.sin(ang) * v; pr[nn] = rapido ? 1 : 0; ul[nn] = origem;
      nn++;
    }
    function removerN(i) {
      nn--;
      px[i] = px[nn]; py[i] = py[nn]; vx[i] = vx[nn]; vy[i] = vy[nn]; pr[i] = pr[nn]; ul[i] = ul[nn];
    }
    function barrasEfetivas() { return S.scram ? 1 : P.barras; }

    function fissionar(i) {
      if (++nu8[i] >= QUEIMA) { nt[i] = 2; S.gastos++; }
      S.fissoes++; S.fissRecentes++;
      S.energia += 202;
      const nu = Math.random() < 0.43 ? 3 : 2;
      S.janela.prod += nu;
      const a0 = Math.random() * 6.283;
      for (let k = 0; k < nu; k++) lancar(nx[i], ny[i], true, a0 + (k * 6.283) / nu + rnd(-0.4, 0.4), i);
      const a = Math.random() * 6.283;
      fx.push({ x: nx[i], y: ny[i], vx: Math.cos(a) * 46, vy: Math.sin(a) * 46, v: 1.1, max: 1.1, tipo: "frag", c: "#ff7a45" });
      fx.push({ x: nx[i], y: ny[i], vx: -Math.cos(a) * 46, vy: -Math.sin(a) * 46, v: 1.1, max: 1.1, tipo: "frag", c: "#ffd23f" });
      fx.push({ x: nx[i], y: ny[i], v: 0.6, max: 0.6, tipo: "anel", c: "#ffb23d", r: sp * 1.6 });
      nf[i] = 1;
      S.calor += 0.12;
      LAB.som.tom(160 + Math.random() * 90, 0.09, 0.05, "triangle", 70);
    }

    function passo(dt) {
      const barras = barrasEfetivas();
      const pMod = 1 - Math.exp(-P.moderador * 14 * dt);
      const espalha = P.moderador * 9 * dt;
      const comprimentoBarra = barras * campo.h;
      const rodMeia = 4;
      // fonte contínua
      if (P.fonte > 0 && Math.random() < P.fonte * dt) lancar(campo.x + 4, rnd(campo.y, campo.y + campo.h), true, rnd(-0.6, 0.6));
      for (let i = nn - 1; i >= 0; i--) {
        const rapido = pr[i] === 1;
        // moderação: o nêutron perde energia e muda de direção
        if (rapido && Math.random() < pMod) {
          pr[i] = 0; S.est.mod++;
          const a = Math.random() * 6.283;
          vx[i] = Math.cos(a) * 110; vy[i] = Math.sin(a) * 110;
        } else if (!rapido && Math.random() < espalha) {
          const a = Math.random() * 6.283;
          vx[i] = Math.cos(a) * 110; vy[i] = Math.sin(a) * 110;
        }
        px[i] += vx[i] * dt; py[i] += vy[i] * dt;
        const x = px[i], y = py[i];
        // fronteira: a água ao redor funciona como refletor para nêutrons lentos
        if (x < campo.x || x > campo.x + campo.w || y < campo.y || y > campo.y + campo.h) {
          if (Math.random() < (pr[i] ? 0.6 : 0.85)) {
            if (x < campo.x || x > campo.x + campo.w) vx[i] = -vx[i]; else vy[i] = -vy[i];
            px[i] = clamp(x, campo.x + 1, campo.x + campo.w - 1); py[i] = clamp(y, campo.y + 1, campo.y + campo.h - 1);
          } else { S.janela.perda++; S.est.fuga++; removerN(i); }
          continue;
        }
        // barras de controle
        if (comprimentoBarra > 0 && y < campo.y + comprimentoBarra) {
          let dentro = false;
          for (let r = 0; r < rods.length; r++) if (Math.abs(x - rods[r]) < rodMeia) { dentro = true; break; }
          if (dentro && Math.random() < 0.9) { S.janela.perda++; S.est.barra++; removerN(i); continue; }
        }
        // núcleos vizinhos: a seção de choque cresce quando o nêutron é lento (lei 1/v)
        const cx = clamp(Math.floor((x - campo.x) / sp), 0, gc - 1), cy = clamp(Math.floor((y - campo.y) / sp), 0, gr - 1);
        let consumido = false, tocando = false;
        for (let dy = -1; dy <= 1 && !consumido; dy++) {
          const yy = cy + dy;
          if (yy < 0 || yy >= gr) continue;
          for (let dx = -1; dx <= 1 && !consumido; dx++) {
            const xx = cx + dx;
            if (xx < 0 || xx >= gc) continue;
            const k = yy * gc + xx;
            for (let q = 0; q < celulaN[k]; q++) {
              const j = celula[k * 4 + q];
              const t = nt[j];
              if (t === 2) continue;
              const raio = t === 0 ? (rapido ? sp * 0.22 : sp * 0.7) : rapido ? sp * 0.1 : sp * 0.26;
              const ddx = nx[j] - x, ddy = ny[j] - y;
              if (ddx * ddx + ddy * ddy > raio * raio) continue;
              tocando = true;
              if (ul[i] === j) continue; // já teve a chance neste contato
              ul[i] = j;
              const r = Math.random();
              if (t === 0) {
                if (r < 0.88) { S.janela.perda++; S.est.fis++; consumido = true; fissionar(j); break; }
                if (r < 0.95) { S.janela.perda++; S.est.cap++; consumido = true; nf[j] = 0.6; break; }
              } else if (r < (rapido ? 0.12 : 0.2)) { S.janela.perda++; S.est.u8++; consumido = true; nf[j] = 0.6; break; }
            }
          }
        }
        if (!tocando) ul[i] = -1;
        if (consumido) removerN(i);
      }
      // calor: a água também refrigera
      S.calor = Math.max(0, S.calor - (3 + P.moderador * 9) * dt);
      if (S.calor >= 100 && !S.scram) {
        S.scram = true; S.calor = 100;
        S.metas.scram = true; atualizarMetas();
        LAB.som.tom(220, 0.7, 0.15, "square", 110);
        LAB.som.vibrar(120);
        avisarScram.textContent = "SCRAM! Superaquecimento: as barras de controle desceram sozinhas.";
        avisarScram.classList.add("on");
      }
      if (S.scram && S.calor < 30) { /* só reativa manualmente */ }
      // k (produção / perdas) em janelas de 1,2 s
      S.janela.t += dt;
      if (S.janela.t >= 1.2) {
        const { prod, perda } = S.janela;
        if (perda > 3) S.k += ((prod / perda) - S.k) * 0.6;
        else if (nn === 0) S.k += (0 - S.k) * 0.5;
        S.janela = { prod: 0, perda: 0, t: 0 };
      }
      // histórico de fissões por segundo
      S.hT += dt;
      if (S.hT >= 0.2) {
        S.taxa = S.fissRecentes / S.hT;
        S.historico[S.hIdx % 150] = S.taxa;
        S.hIdx++;
        S.fissRecentes = 0; S.hT = 0;
      }
      // metas
      if (S.fissoes >= 1 && !S.metas.primeira) { S.metas.primeira = true; atualizarMetas(); }
      if (S.fissoes >= 25 && !S.metas.cadeia) { S.metas.cadeia = true; atualizarMetas(); LAB.som.tom(660, 0.25, 0.08, "triangle", 990); }
      if (nn > 0 && S.k > 0.95 && S.k < 1.06 && !S.scram) { S.tEstavel += dt; if (S.tEstavel > 15 && !S.metas.estavel) { S.metas.estavel = true; atualizarMetas(); LAB.som.tom(784, 0.3, 0.08, "triangle", 1046); } }
      else S.tEstavel = Math.max(0, S.tEstavel - dt * 2);
    }

    cena.aoRedimensionar = () => montar();

    let tHud = 0;
    cena.atualizar = (dt, t) => {
      // sub-passos mantêm a física estável mesmo se um quadro demorar
      const n = dt > 1 / 45 ? 2 : 1;
      for (let i = 0; i < n; i++) passo(dt / n);
      for (let i = fx.length - 1; i >= 0; i--) {
        const f = fx[i];
        f.v -= dt;
        if (f.v <= 0) { fx.splice(i, 1); continue; }
        if (f.tipo === "frag") { f.x += f.vx * dt; f.y += f.vy * dt; }
      }
      for (let i = 0; i < nCount; i++) if (nf[i] > 0) nf[i] = Math.max(0, nf[i] - dt * 2.2);
      for (const b of bolhas) { b.y -= b.v * dt; if (b.y < campo.y) { b.y = campo.y + campo.h; b.x = rnd(campo.x, campo.x + campo.w); } }
      for (let i = toqueMarca.length - 1; i >= 0; i--) { toqueMarca[i].v -= dt; if (toqueMarca[i].v <= 0) toqueMarca.splice(i, 1); }
      atualizarHUD(false);
    };

    cena.desenhar = (g, w, h, t) => {
      g.clearRect(0, 0, w, h);
      const { x, y, w: cw, h: ch } = campo;
      // campo e água
      g.save();
      g.beginPath(); roundRect(g, x, y, cw, ch, 14); g.clip();
      const agua = g.createLinearGradient(0, y, 0, y + ch);
      agua.addColorStop(0, `rgba(40,110,255,${0.05 + P.moderador * 0.14})`);
      agua.addColorStop(1, `rgba(20,60,160,${0.08 + P.moderador * 0.2})`);
      g.fillStyle = agua; g.fillRect(x, y, cw, ch);
      if (P.moderador > 0.05) {
        g.strokeStyle = `rgba(150,200,255,${P.moderador * 0.35})`; g.lineWidth = 1;
        for (const b of bolhas) { g.beginPath(); g.arc(b.x + Math.sin(t * 2 + b.y * 0.05) * 3, b.y, b.r, 0, 6.2832); g.stroke(); }
      }
      if (S.calor > 40) { g.fillStyle = `rgba(255,70,40,${((S.calor - 40) / 60) * 0.22 + (S.scram ? Math.sin(t * 10) * 0.06 : 0)})`; g.fillRect(x, y, cw, ch); }
      // núcleos
      const sU5 = LAB.esfera(Math.max(4, Math.round(rN * 0.8)), COR_U5);
      const sU8 = LAB.esfera(Math.max(3, Math.round(rN * 0.6)), COR_U8);
      for (let i = 0; i < nCount; i++) {
        const tp = nt[i];
        if (tp === 2) {
          g.fillStyle = "rgba(255,255,255,0.14)";
          g.beginPath(); g.arc(nx[i] - 3, ny[i], 1.6, 0, 6.2832); g.arc(nx[i] + 3, ny[i] + 2, 1.6, 0, 6.2832); g.fill();
          continue;
        }
        const s = tp === 0 ? sU5 : sU8;
        const r = (tp === 0 ? rN * (0.8 - nu8[i] * 0.03) : rN * 0.6) + 3 + nf[i] * 4;
        g.drawImage(s, nx[i] - r, ny[i] - r, r * 2, r * 2);
      }
      // barras de controle
      const L = barrasEfetivas() * ch;
      if (L > 0) {
        for (const rx of rods) {
          const gr2 = g.createLinearGradient(rx - 4, 0, rx + 4, 0);
          gr2.addColorStop(0, "#2b3350"); gr2.addColorStop(0.5, "#7886b4"); gr2.addColorStop(1, "#2b3350");
          g.fillStyle = gr2;
          g.fillRect(rx - 4, y, 8, L);
          g.fillStyle = S.scram ? "#ff5a7a" : "#5df0b0";
          g.fillRect(rx - 4, y + L - 3, 8, 3);
        }
      }
      // nêutrons e efeitos
      g.globalCompositeOperation = "lighter";
      const sR = LAB.brilho(8, COR_RAPIDO, 1), sL = LAB.brilho(8, COR_LENTO, 1);
      for (let i = 0; i < nn; i++) {
        const r = pr[i] ? 8 : 7;
        g.drawImage(pr[i] ? sR : sL, px[i] - r, py[i] - r, r * 2, r * 2);
      }
      for (const f of fx) {
        const k = f.v / f.max;
        if (f.tipo === "anel") {
          g.strokeStyle = LAB.rgba(f.c, k * 0.9); g.lineWidth = 2 + k * 2;
          g.beginPath(); g.arc(f.x, f.y, f.r * (1 - k) + 4, 0, 6.2832); g.stroke();
        } else {
          g.globalAlpha = k;
          const sp2 = LAB.brilho(6, f.c, 0.9);
          g.drawImage(sp2, f.x - 7, f.y - 7, 14, 14);
          g.globalAlpha = 1;
        }
      }
      for (const m of toqueMarca) {
        const k = m.v / 0.5;
        g.strokeStyle = LAB.rgba("#ffffff", k * 0.7); g.lineWidth = 2;
        g.beginPath(); g.arc(m.x, m.y, 6 + (1 - k) * 26, 0, 6.2832); g.stroke();
      }
      g.globalCompositeOperation = "source-over";
      g.restore();
      g.strokeStyle = S.scram ? "rgba(255,90,122,0.7)" : "rgba(255,255,255,0.12)"; g.lineWidth = 1.5;
      g.beginPath(); roundRect(g, x, y, cw, ch, 14); g.stroke();

      // gráfico de fissões por segundo
      const gy = y + ch + 10, gh = h - gy - 8;
      if (gh > 20) {
        g.fillStyle = "rgba(255,255,255,0.03)"; g.fillRect(x, gy, cw, gh);
        let mx = 4;
        for (let i = 0; i < 150; i++) mx = Math.max(mx, S.historico[i]);
        const col = S.k > 1.05 ? "#ffb23d" : S.k < 0.95 ? "#4da3ff" : "#5df0b0";
        g.strokeStyle = col; g.lineWidth = 2; g.shadowColor = col; g.shadowBlur = 8;
        g.beginPath();
        for (let i = 0; i < 150; i++) {
          const v = S.historico[(S.hIdx + i) % 150];
          const px2 = x + (i / 149) * cw, py2 = gy + gh - (v / mx) * (gh - 6) - 2;
          i ? g.lineTo(px2, py2) : g.moveTo(px2, py2);
        }
        g.stroke(); g.shadowBlur = 0;
        g.fillStyle = "rgba(220,226,255,0.55)"; g.font = "10.5px Inter, sans-serif";
        g.fillText("fissões por segundo (últimos 30 s)", x + 6, gy + 12);
      }
    };

    function roundRect(g, x, y, w, h, r) {
      g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
    }

    // ---------- toque: dispara nêutron ----------
    canvas.style.touchAction = "none";
    canvas.addEventListener("pointerdown", (e) => {
      const p = cena.pos(e);
      if (p.x < campo.x || p.x > campo.x + campo.w || p.y < campo.y || p.y > campo.y + campo.h) return;
      lancar(p.x, p.y, true);
      toqueMarca.push({ x: p.x, y: p.y, v: 0.5 });
      dicaToque.style.opacity = "0";
      LAB.som.tom(900, 0.08, 0.06, "sine", 600); LAB.som.vibrar(8);
    });

    // ---------- HUD ----------
    function regime() {
      if (nn === 0 && S.fissRecentes === 0 && S.taxa < 0.2) return ["Parado", "#9aa3c8", "Sem nêutrons no reator. Toque nele para disparar um."];
      if (S.k < 0.93) return ["Subcrítico", "#4da3ff", "Cada fissão causa menos de uma nova fissão: a reação se apaga sozinha."];
      if (S.k <= 1.07) return ["Crítico", "#5df0b0", "Em média, cada fissão causa exatamente uma nova: a reação se sustenta. É onde um reator opera."];
      if (S.k <= 1.3) return ["Supercrítico", "#ffb23d", "Cada fissão causa mais de uma nova: a potência cresce exponencialmente."];
      return ["Descontrolado", "#ff5a7a", "Crescimento muito rápido. Insira as barras de controle!"];
    }
    function atualizarHUD(forcar) {
      const agora = performance.now();
      if (!forcar && agora - tHud < 120) return;
      tHud = agora;
      const [nome, cor, expl] = regime();
      hudE.innerHTML = `<div class="rea-k" style="--c:${cor}">k = ${F.num(S.k, 2)} <small>${nome}</small></div>
        <div class="dec-sub">${nn} nêutrons · ${F.num(S.taxa, 0)} fissões/s</div>`;
      hudD.innerHTML = `<div class="calor"><span>Calor</span><div class="calor-b"><i style="width:${S.calor}%;background:${S.calor > 75 ? "#ff5a7a" : S.calor > 45 ? "#ffb23d" : "#5df0b0"}"></i></div></div>
        <div class="dec-sub">${S.gastos} pastilhas esgotadas</div>`;
      explicacao.textContent = expl;
      energiaOut.innerHTML = `${F.num(S.fissoes, 0)} fissões · <b>${F.num(S.energia, 0)} MeV</b> liberados`;
    }

    // ---------- controles ----------
    const avisarScram = el("div", "res-aviso scram");
    const slBarras = ui.slider({ rotulo: "Barras de controle (absorvem nêutrons)", min: 0, max: 100, valor: 40, fmt: (v) => `${F.num(v, 0)}% inseridas`, onInput: (v) => { P.barras = v / 100; if (S.scram) { /* continua travado */ } }, cor: "#7886b4" });
    const slMod = ui.slider({ rotulo: "Moderador (água): freia os nêutrons", min: 0, max: 100, valor: 60, fmt: (v) => `${F.num(v, 0)}%`, onInput: (v) => { P.moderador = v / 100; }, cor: "#4da3ff" });
    const slFis = ui.slider({
      rotulo: "Combustível físsil (urânio-235)", min: 1, max: 100, valor: 35, log: true,
      fmt: (v) => `${F.num(v, 0)}%`,
      onInput: (v) => { P.fissil = v / 100; debounceRecarga(); }, cor: COR_U5,
    });
    const slFonte = ui.slider({ rotulo: "Fonte automática de nêutrons", min: 0, max: 20, valor: 5, fmt: (v) => `${F.num(v, 0)} /s`, onInput: (v) => { P.fonte = v; }, cor: COR_LENTO });
    let deb = 0;
    function debounceRecarga() { clearTimeout(deb); deb = setTimeout(() => recarregar(true), 220); }

    const btScram = ui.botao("⛔ SCRAM", () => { S.scram = true; avisarScram.textContent = "SCRAM manual: barras de controle totalmente inseridas."; avisarScram.classList.add("on"); LAB.som.tom(220, 0.5, 0.1, "square", 110); }, "perigo");
    const btReativar = ui.botao("Reativar barras", () => { S.scram = false; S.calor = Math.min(S.calor, 40); avisarScram.classList.remove("on"); }, "sec");
    const btRecarga = ui.botao("↻ Novo combustível", () => { avisarScram.classList.remove("on"); recarregar(); });
    const l1 = el("div", "linha-bt"); l1.append(btRecarga);
    const l2 = el("div", "linha-bt"); l2.append(btScram, btReativar);
    const cPainel = ui.cartao("Painel de controle", "");
    cPainel.append(slBarras.el, el("div", "esp"), slMod.el, el("div", "esp"), slFis.el, el("div", "esp"), slFonte.el, el("div", "esp"), l2, el("div", "esp"), l1, avisarScram);

    const explicacao = el("p");
    const energiaOut = el("p");
    energiaOut.style.marginTop = "8px";
    const cEstado = ui.cartao("O que está acontecendo", "");
    cEstado.append(explicacao, energiaOut);
    cEstado.insertAdjacentHTML("beforeend", `<small class="dica"><b>k</b> é o número médio de novas fissões causadas por cada fissão. Cada divisão libera 2 ou 3 nêutrons, mas nem todos acham outro núcleo: alguns escapam, são absorvidos pelo urânio-238 ou pelas barras.</small>`);

    const metasLista = el("div", "metas");
    const cMetas = ui.cartao("Desafios", metasLista);
    const METAS = [
      ["primeira", "Provoque a primeira fissão (toque no reator)"],
      ["cadeia", "Reação em cadeia: 25 fissões"],
      ["estavel", "Mantenha o reator crítico (k ≈ 1) por 15 s"],
      ["scram", "Provoque um superaquecimento e veja o SCRAM"],
    ];
    function atualizarMetas() {
      metasLista.innerHTML = METAS.map(([id, t]) => `<div class="${S.metas[id] ? "feita" : ""}"><i>${S.metas[id] ? "✓" : ""}</i>${t}</div>`).join("");
    }
    atualizarMetas();

    const cComo = ui.cartao("Como um reator funciona", `
      <p>Um nêutron <b>lento</b> (azul) tem muito mais chance de dividir o urânio-235 do que um <b>rápido</b> (amarelo). Por isso a água entre os núcleos: ela freia os nêutrons.</p>
      <p>As barras de controle absorvem nêutrons para segurar a reação. Cada fissão libera ~200 MeV: cerca de 50 milhões de vezes a energia de uma reação química típica.</p>`);

    ctl.append(cPainel, cEstado, cMetas, cComo);
    recarregarInicial();
    function recarregarInicial() { /* montar() é chamado no primeiro redimensionamento */ }

    // para testes
    cena.__teste = { passo, lancar, recarregar, S, P, campo: () => campo, contagem: () => ({ nn, fiss: S.fissoes, fissil: S.combustivel }) };

    return {
      iniciar() { cena.iniciar(); },
      parar() { cena.parar(); },
      _cena: cena,
    };
  }

  LAB.modulos.push({
    id: "reator",
    nome: "Reator",
    resumo: "Reação em cadeia de fissão",
    cor: "#ffb23d",
    selo: "parcial",
    icone: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><circle cx="12" cy="12" r="2.4"/></svg>',
    nota: {
      real: [
        "Cada fissão libera 2 ou 3 nêutrons (em média 2,43) e cerca de 200 MeV.",
        "Nêutrons lentos fissionam o urânio-235 com muito mais probabilidade que os rápidos; por isso existe o moderador.",
        "O urânio-238 absorve nêutrons sem fissionar e as barras de controle absorvem nêutrons: ambos seguram a reação.",
        "O fator k é a razão entre nêutrons produzidos e perdidos; k = 1 é o ponto crítico.",
      ],
      simplificado: [
        "Geometria em 2D, núcleos em grade e probabilidades ajustadas para a reação acontecer em segundos de tela.",
        "O calor e o resfriamento são um modelo simples; reatores reais têm muitas camadas de segurança.",
        "Não mostra os nêutrons atrasados, que são o que torna um reator real controlável.",
      ],
    },
    criar,
  });
})();
