/*
 * Módulo 2 - Decaimento radioativo
 * Uma amostra de átomos, um contador Geiger e a curva da meia-vida.
 */
(function () {
  "use strict";
  const LAB = window.LAB;
  const F = window.LabFisica;
  const { el, ui, clamp, rnd } = LAB;

  const COR_VIVO = "#2ee6b6";
  const COR_FILHO = "#6a5fd0";

  const ISOTOPOS = [
    { id: "f18", Z: 9, A: 18, uso: "Exames de PET (tomografia por emissão de pósitrons): vive só o suficiente para o exame." },
    { id: "po214", Z: 84, A: 214, uso: "Dura menos de um milésimo de segundo: faz parte da cadeia de decaimento do urânio." },
    { id: "rn222", Z: 86, A: 222, uso: "Gás radioativo que sobe do solo e se acumula em porões; é a segunda maior causa de câncer de pulmão." },
    { id: "i131", Z: 53, A: 131, uso: "Tratamento de doenças da tireoide; também é produto de fissão em reatores." },
    { id: "co60", Z: 27, A: 60, uso: "Radioterapia e esterilização de alimentos e materiais médicos." },
    { id: "sr90", Z: 38, A: 90, uso: "Produto de fissão que o corpo confunde com cálcio e guarda nos ossos." },
    { id: "cs137", Z: 55, A: 137, uso: "Medidores industriais. Em 1987, uma cápsula abandonada em Goiânia causou o maior acidente radiológico do Brasil." },
    { id: "h3", Z: 1, A: 3, uso: "Trítio: faz ponteiros de relógio brilharem sem pilha e é combustível para fusão nuclear." },
    { id: "ra226", Z: 88, A: 226, uso: "Descoberto pelos Curie. Já foi usado em tinta luminosa de mostradores, com consequências graves para as operárias." },
    { id: "am241", Z: 95, A: 241, uso: "Está dentro do detector de fumaça da sua casa." },
    { id: "c14", Z: 6, A: 14, uso: "Datação de fósseis e objetos antigos de até ~50 mil anos: tudo que viveu absorve carbono-14 em vida e para de repor ao morrer." },
    { id: "pu239", Z: 94, A: 239, uso: "Combustível nuclear. O plutônio-238 (outro isótopo) alimenta sondas espaciais como a Voyager." },
    { id: "k40", Z: 19, A: 40, uso: "Está em bananas e no seu corpo: uma pessoa de 70 kg tem cerca de 4.000 decaimentos por segundo, só de potássio-40." },
    { id: "u238", Z: 92, A: 238, uso: "Sua meia-vida é parecida com a idade da Terra. Metade do urânio-238 que existia quando o planeta se formou ainda está aí." },
  ];
  const ISO_POR_ID = Object.fromEntries(ISOTOPOS.map((i) => [i.id, i]));
  const TAMANHOS = { poucos: 40, medio: 600, muitos: 4000 };

  function criar(caixa) {
    caixa.style.setProperty("--vh", "48%");
    const vista = el("div", "mod-view");
    const canvas = el("canvas");
    const hudE = el("div", "ov ov-tl hud-dec");
    const hudD = el("div", "ov ov-tr hud-dec");
    vista.append(canvas, hudE, hudD);
    const ctl = el("div", "mod-ctl");
    caixa.append(vista, ctl);

    const S = {
      iso: ISOTOPOS.find((i) => i.id === "c14"),
      N: TAMANHOS.medio,
      tamanho: "medio",
      spH: 10, // segundos reais de tela por meia-vida
      tau: 0,
      pausado: false,
      fim: false,
      marca: null, // fração marcada na calculadora de datação (só depois que o usuário mexe)
    };
    let alive, n, cols = 1, rows = 1, cell = 4, gx = 0, gy = 0, gw = 0, gh = 0, ch = { x: 0, y: 0, w: 0, h: 0 };
    let off = null, offG = null;
    let hist = [], proxAmostra = 0;
    let flashes = [];
    let tHud = 0;
    let decaidos = 0;

    const cena = new LAB.Cena(canvas, { dprMax: 2 });
    const inf = () => F.info(S.iso.Z, S.iso.A - S.iso.Z);

    // ---------- amostra ----------
    function cor(vivo) { return vivo ? COR_VIVO : COR_FILHO; }
    function posicao(i) {
      return [gx + ((i % cols) + 0.5) * cell, gy + (Math.floor(i / cols) + 0.5) * cell];
    }
    function pintar(i, vivo) {
      const [x, y] = posicao(i);
      const g = offG;
      g.clearRect(x - cell / 2, y - cell / 2, cell, cell);
      if (S.N <= 700) {
        g.fillStyle = cor(vivo);
        if (vivo) { g.shadowColor = COR_VIVO; g.shadowBlur = cell * 0.5; } else g.shadowBlur = 0;
        g.beginPath();
        g.arc(x, y, cell * (vivo ? 0.32 : 0.2), 0, 6.2832);
        g.fill();
        g.shadowBlur = 0;
      } else {
        g.fillStyle = vivo ? COR_VIVO : "rgba(106,95,208,0.55)";
        const s = cell * 0.72;
        g.fillRect(x - s / 2, y - s / 2, s, s);
      }
    }
    function montarGrade() {
      if (!cena.w) return;
      const w = cena.w, h = cena.h;
      gw = w - 24; gh = h * 0.62;
      gx = 12; gy = 82;
      gh = Math.max(60, gh - 30);
      cols = Math.max(1, Math.ceil(Math.sqrt((S.N * gw) / gh)));
      rows = Math.ceil(S.N / cols);
      cell = Math.min(gw / cols, gh / rows);
      gx += (gw - cols * cell) / 2;
      ch = { x: 14, y: gy + gh + 22, w: w - 28, h: h - (gy + gh + 22) - 26 };
      const dpr = cena.dpr;
      off = document.createElement("canvas");
      off.width = Math.ceil(w * dpr); off.height = Math.ceil(h * dpr);
      offG = off.getContext("2d");
      offG.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (let i = 0; i < S.N; i++) pintar(i, !isDecaido(i));
    }
    const vivoMapa = { s: new Uint8Array(0) };
    const isDecaido = (i) => vivoMapa.s[i] === 1;

    function reiniciar() {
      S.N = TAMANHOS[S.tamanho];
      alive = new Int32Array(S.N);
      for (let i = 0; i < S.N; i++) alive[i] = i;
      n = S.N;
      vivoMapa.s = new Uint8Array(S.N);
      S.tau = 0; S.fim = false; decaidos = 0;
      hist = [{ t: 0, f: 1 }]; proxAmostra = 0.02;
      flashes = [];
      montarGrade();
      atualizarHUD(true);
    }

    // número de decaimentos neste quadro (Poisson/normal)
    function sortearK(media) {
      if (media <= 0) return 0;
      if (media > 30) return Math.max(0, Math.round(media + Math.sqrt(media) * gauss()));
      const L = Math.exp(-media);
      let k = 0, p = 1;
      do { k++; p *= Math.random(); } while (p > L);
      return k - 1;
    }
    function gauss() { return Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(6.2832 * Math.random()); }

    cena.aoRedimensionar = () => montarGrade();

    cena.atualizar = (dt) => {
      for (let i = flashes.length - 1; i >= 0; i--) { flashes[i].v -= dt; if (flashes[i].v <= 0) flashes.splice(i, 1); }
      if (S.pausado || S.fim) return;
      const dtau = dt / S.spH;
      S.tau += dtau;
      const p = 1 - Math.pow(2, -dtau);
      let k = Math.min(n, sortearK(n * p));
      let sons = 0;
      const modo = inf().ramos[0] ? inf().ramos[0].modo : "b-";
      while (k-- > 0) {
        const j = (Math.random() * n) | 0;
        const idx = alive[j];
        alive[j] = alive[--n];
        vivoMapa.s[idx] = 1;
        decaidos++;
        pintar(idx, false);
        if (flashes.length < 90) { const [x, y] = posicao(idx); flashes.push({ x, y, v: 0.5, max: 0.5, modo }); }
        if (sons++ < 5) LAB.som.clique(0.2 + Math.random() * 0.15);
      }
      if (S.tau >= proxAmostra) { hist.push({ t: S.tau, f: n / S.N }); proxAmostra += 0.025; }
      if (S.tau >= 7 || n === 0) { S.fim = true; atualizarHUD(true); }
    };

    cena.desenhar = (g, w, h) => {
      g.clearRect(0, 0, w, h);
      if (off) g.drawImage(off, 0, 0, w, h);
      // pulsos de decaimento
      g.globalCompositeOperation = "lighter";
      for (const f of flashes) {
        const k = f.v / f.max;
        const c = F.MODOS[f.modo] ? F.MODOS[f.modo].cor : "#fff";
        g.strokeStyle = LAB.rgba(c, k * 0.9);
        g.lineWidth = 1.5;
        g.beginPath();
        g.arc(f.x, f.y, cell * (0.4 + (1 - k) * 2.2), 0, 6.2832);
        g.stroke();
      }
      g.globalCompositeOperation = "source-over";

      // gráfico
      const { x, y, w: cw, h: chh } = ch;
      if (cw > 20 && chh > 20) {
        const X = (t) => x + (t / 7) * cw;
        const Y = (f) => y + (1 - f) * chh;
        g.fillStyle = "rgba(255,255,255,0.03)";
        g.fillRect(x, y, cw, chh);
        g.strokeStyle = "rgba(255,255,255,0.1)"; g.lineWidth = 1;
        g.fillStyle = "rgba(220,226,255,0.55)"; g.font = "10.5px Inter, sans-serif";
        for (let k = 0; k <= 7; k++) {
          g.beginPath(); g.moveTo(X(k), y); g.lineTo(X(k), y + chh); g.stroke();
          g.fillText(String(k), X(k) + 3, y + chh + 12);
        }
        g.textAlign = "right"; g.fillText("tempo em meias-vidas", x + cw - 4, y + 13); g.textAlign = "left";
        for (let k = 1; k <= 3; k++) { const f = Math.pow(0.5, k); g.fillText(k === 1 ? "½" : "1/" + 2 ** k, x + 3, Y(f) - 3); g.beginPath(); g.moveTo(x, Y(f)); g.lineTo(x + cw, Y(f)); g.stroke(); }
        // curva teórica
        g.setLineDash([5, 5]); g.strokeStyle = "rgba(255,255,255,0.45)"; g.lineWidth = 1.5;
        g.beginPath();
        for (let k = 0; k <= 70; k++) { const t = k / 10; k ? g.lineTo(X(t), Y(Math.pow(2, -t))) : g.moveTo(X(t), Y(1)); }
        g.stroke(); g.setLineDash([]);
        // medido
        g.strokeStyle = COR_VIVO; g.lineWidth = 2.5; g.lineJoin = "round";
        g.shadowColor = COR_VIVO; g.shadowBlur = 8;
        g.beginPath();
        for (let k = 0; k < hist.length; k++) { const q = hist[k]; k ? g.lineTo(X(q.t), Y(q.f)) : g.moveTo(X(q.t), Y(q.f)); }
        g.lineTo(X(S.tau), Y(n / S.N));
        g.stroke();
        g.shadowBlur = 0;
        // marcador da calculadora de datação
        if (S.marca != null) {
          g.strokeStyle = "#ffd23f"; g.lineWidth = 1.5; g.setLineDash([2, 4]);
          g.beginPath(); g.moveTo(x, Y(S.marca)); g.lineTo(x + cw, Y(S.marca)); g.stroke(); g.setLineDash([]);
          const tm = -Math.log2(S.marca);
          g.fillStyle = "#ffd23f";
          g.beginPath(); g.arc(X(Math.min(tm, 7)), Y(S.marca), 4, 0, 6.2832); g.fill();
        }
        g.fillStyle = COR_VIVO; g.beginPath(); g.arc(X(Math.min(S.tau, 7)), Y(n / S.N), 4.5, 0, 6.2832); g.fill();
      }
      if (S.pausado || S.fim) {
        g.fillStyle = "rgba(5,6,13,0.45)";
        g.fillRect(0, 0, w, h * 0.0);
      }
    };

    // ---------- HUD ----------
    function atualizarHUD(forcar) {
      const agora = performance.now();
      if (!forcar && agora - tHud < 100) return;
      tHud = agora;
      const i = inf();
      const f = n / S.N;
      hudE.innerHTML = `
        <div class="dec-num">${F.num(n, 0)}<small> / ${F.num(S.N, 0)} átomos restantes</small></div>
        <div class="dec-sub">${F.num(f * 100, f < 0.1 ? 1 : 0)}% · tempo: ${F.num(S.tau, 2)} meias-vidas ≈ <b>${F.tempo(S.tau * i.t)}</b></div>`;
      hudD.innerHTML = `
        <div class="dec-iso">${F.sup(S.iso.A)}${i.simbolo} <small>${i.nome}</small></div>
        <div class="dec-sub">${S.fim ? "fim da simulação" : S.pausado ? "pausado" : "decaindo"}</div>
        <div class="dec-leg"><span style="--c:${COR_VIVO}"><i></i>restam</span><span style="--c:${COR_FILHO}"><i></i>decaíram</span></div>`;
    }
    const origAtualizar = cena.atualizar;
    cena.atualizar = (dt, t) => { origAtualizar(dt, t); atualizarHUD(false); };

    // ---------- controles ----------
    const chips = ui.chips({
      itens: ISOTOPOS.map((x) => {
        const i = F.info(x.Z, x.A - x.Z);
        return { id: x.id, rotulo: `${F.sup(x.A)}${i.simbolo} · ${F.tempo(i.t)}` };
      }),
      onClick: (id, b) => escolher(id, b),
    });
    chips.el.classList.add("quebra");
    const cEscolha = ui.cartao("Escolha o isótopo", chips.el);
    cEscolha.insertAdjacentHTML("beforeend", `<small class="dica">Cada um tem sua meia-vida: de frações de segundo a bilhões de anos. Compare como a mesma curva aparece em todos.</small>`);

    const segTam = ui.segmentado({
      itens: [{ id: "poucos", rotulo: "Poucos átomos" }, { id: "medio", rotulo: "Médio" }, { id: "muitos", rotulo: "Muitos" }],
      valor: "medio",
      onChange: (id) => { S.tamanho = id; reiniciar(); },
    });
    const slVel = ui.slider({
      rotulo: "Velocidade", min: 3, max: 60, valor: 10, log: true,
      fmt: (v) => `1 meia-vida = ${F.num(v, 0)} s`,
      onInput: (v) => { S.spH = v; },
    });
    const btPausa = ui.botao("Pausar", () => { S.pausado = !S.pausado; btPausa.textContent = S.pausado ? "Continuar" : "Pausar"; atualizarHUD(true); }, "sec");
    const btReinicia = ui.botao("↻ Recomeçar", () => reiniciar());
    const linha = el("div", "linha-bt");
    linha.append(btReinicia, btPausa);
    const cExp = ui.cartao("Experimento", "");
    cExp.append(segTam.el, el("div", "esp"), slVel.el, el("div", "esp"), linha);
    const licao = el("small", "dica", "");
    cExp.appendChild(licao);

    const cFatos = ui.cartao("Sobre este isótopo", "");
    const fatosCorpo = el("div");
    cFatos.appendChild(fatosCorpo);

    const slData = ui.slider({
      rotulo: "Sobrou", min: 1, max: 100, valor: 50, passo: 1,
      fmt: (v) => `${F.num(v, 0)}%`,
      onInput: (v) => { S.marca = v / 100; atualizarData(); },
      cor: "#ffd23f",
    });
    const dataOut = el("div", "res-ok");
    const cData = ui.cartao("Calculadora de idade (datação)", "");
    cData.append(slData.el, el("div", "esp"), dataOut);
    cData.insertAdjacentHTML("beforeend", `<small class="dica">Arraste: a linha amarela aparece no gráfico. É assim que se descobre a idade de um fóssil — medindo quanto do isótopo ainda sobrou.</small>`);

    const cComo = ui.cartao("Por que a curva é assim?", `
      <p>Cada átomo decide sozinho, ao acaso, e ninguém sabe <i>quando</i>. Mas em uma amostra grande, <b>metade</b> decai a cada meia-vida: sobra ½, depois ¼, ⅛...</p>
      <p>Com poucos átomos, o acaso domina e cada rodada sai diferente. Só a média segue a curva tracejada. Aperte <b>Recomeçar</b> algumas vezes e compare.</p>`);

    ctl.append(cEscolha, cExp, cFatos, cData, cComo);

    function escolher(id, bt) {
      S.iso = ISO_POR_ID[id];
      chips.el.querySelectorAll(".chip2").forEach((b) => b.classList.toggle("on", b === bt));
      reiniciar();
      atualizarFatos();
      atualizarData();
    }
    function atualizarFatos() {
      const i = inf();
      const lambda = Math.LN2 / i.t;
      const ativEsp = (lambda * F.K.AVOGADRO) / S.iso.A; // Bq por grama
      const r = i.ramos[0];
      const filhoZN = r ? F.filho(S.iso.Z, S.iso.A - S.iso.Z, r.modo) : null;
      const f = filhoZN ? F.info(filhoZN[0], filhoZN[1]) : null;
      const linhas = [
        ["Meia-vida", F.tempo(i.t)],
        ["Como decai", i.ramos.map((q) => F.MODOS[q.modo].curto + (i.ramos.length > 1 ? ` ${F.num(q.p * 100, 0)}%` : "")).join(" · ")],
        ["Vira", f ? `${F.sup(f.A)}${f.simbolo} ${f.estado === "estavel" ? "<small>(estável)</small>" : "<small>(também radioativo)</small>"}` : "—"],
        ["Atividade por grama", `${F.sci(ativEsp, 1)} <small>Bq</small>`],
      ];
      fatosCorpo.innerHTML = `<dl class="lin">${linhas.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
        <p style="margin-top:10px">${S.iso.uso}</p>
        <small class="dica">1 Bq = 1 decaimento por segundo. Atividade por grama: quantos átomos de 1 g da substância decaem a cada segundo.</small>`;
    }
    function atualizarData() {
      const i = inf();
      const f = slData.get() / 100;
      const tau = -Math.log2(f);
      dataOut.innerHTML = `Se sobrou <b>${F.num(f * 100, 0)}%</b>, já passaram <b>${F.num(tau, 2)} meias-vidas</b> = <b>${F.tempo(tau * i.t)}</b>.`;
    }

    // ---------- início ----------
    const primeiro = chips.el.querySelector(".chip2:nth-child(11)");
    reiniciar();
    primeiro && primeiro.classList.add("on");
    atualizarFatos();
    atualizarData();
    const textoLicao = () => { licao.textContent = S.tamanho === "poucos" ? "Com tão poucos átomos, repare como a linha verde balança em torno da tracejada." : ""; };
    segTam.el.addEventListener("click", textoLicao);

    return {
      iniciar() { cena.iniciar(); },
      parar() { cena.parar(); },
    };
  }

  LAB.modulos.push({
    id: "decaimento",
    nome: "Decaimento",
    resumo: "Meia-vida e contador Geiger",
    cor: "#2ee6b6",
    selo: "fiel",
    icone: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="2.2"/><path d="M12 3a9 9 0 0 1 7.8 4.5L15 10"/><path d="M20.8 15A9 9 0 0 1 12 21l.2-5.5"/><path d="M3.2 15A9 9 0 0 1 4.2 7.5L9 10"/></svg>',
    nota: {
      real: [
        "A lei do decaimento: a cada meia-vida, metade dos átomos que restam decai (N = N₀·2^(−t/T)).",
        "Meias-vidas medidas e a atividade específica real (Bq por grama), calculada com λ = ln 2 / T e o número de Avogadro.",
        "O acaso: cada decaimento é sorteado independentemente (processo de Poisson), então amostras pequenas flutuam como as reais.",
      ],
      simplificado: [
        "O tempo é comprimido: uma meia-vida de bilhões de anos passa em segundos.",
        "A amostra é desenhada em grade; átomos reais não têm posição fixa.",
        "O isótopo-filho não decai de novo na simulação (veja a cadeia completa na aba Átomo).",
      ],
    },
    criar,
  });
})();
