/*
 * Módulo 1 - Bancada atômica
 * Monte qualquer átomo, veja a estabilidade, o decaimento, a fissão e o mapa de núcleos.
 */
(function () {
  "use strict";
  const LAB = window.LAB;
  const F = window.LabFisica;
  const { el, ui, clamp, lerp, rnd } = LAB;

  const COR_P = "#ff5a7a", COR_N = "#8da4e0", COR_E = "#38e0ff";
  const ESTADO_COR = { estavel: [255, 255, 255], "b-": [77, 163, 255], "b+": [255, 90, 122], a: [255, 210, 63], n: [150, 140, 175], p: [150, 140, 175] };
  const MAGICOS = [2, 8, 20, 28, 50, 82, 126];
  const NMAX = 179, ZMAX = 120;

  // Pontos em espiral de Fibonacci: posição de cada "vaga" dentro do núcleo
  const VAGAS = (() => {
    const v = [];
    for (let i = 0; i < 420; i++) {
      // sequência R2 (dois irracionais independentes): cobre a esfera de forma uniforme
      const f = (i * 0.7548776662 + 0.5) % 1;
      const phi = Math.acos(1 - 2 * f);
      const th = ((i * 0.5698402910 + 0.25) % 1) * 6.2832;
      v.push([Math.sin(phi) * Math.cos(th), Math.cos(phi), Math.sin(phi) * Math.sin(th)]);
    }
    return v;
  })();

  // Camadas de elétrons para Z prótons e E elétrons
  const CAP = [2, 8, 18, 32, 32, 18, 8];
  function camadas(Z, E) {
    if (E <= 0) return [];
    let base = null;
    const d = window.DADOS && window.DADOS[Z - 1];
    if (d && d.n === Z) base = d.sh.slice();
    if (!base) {
      base = [];
      let r = E;
      for (let i = 0; r > 0 && i < CAP.length; i++) { const c = Math.min(CAP[i], r); base.push(c); r -= c; }
      return base;
    }
    let tot = base.reduce((a, b) => a + b, 0);
    while (tot > E) { // íon positivo: perde da camada mais externa
      const i = base.length - 1;
      base[i]--; tot--;
      if (base[i] === 0) base.pop();
    }
    while (tot < E) { // íon negativo: ganha na mais externa, abrindo outra se encher
      let i = base.length - 1;
      const cap = i === 0 ? 2 : 8;
      if (base[i] >= cap) { base.push(0); i++; }
      base[i]++; tot++;
    }
    return base;
  }

  const PRESETS = [
    { id: "h", rotulo: "Hidrogênio-1", Z: 1, N: 0 },
    { id: "d", rotulo: "Deutério", Z: 1, N: 1 },
    { id: "he", rotulo: "Hélio-4", Z: 2, N: 2 },
    { id: "c12", rotulo: "Carbono-12", Z: 6, N: 6 },
    { id: "c14", rotulo: "Carbono-14 ☢", Z: 6, N: 8 },
    { id: "o", rotulo: "Oxigênio-16", Z: 8, N: 8 },
    { id: "fe", rotulo: "Ferro-56", Z: 26, N: 30 },
    { id: "au", rotulo: "Ouro-197", Z: 79, N: 118 },
    { id: "pb", rotulo: "Chumbo-208", Z: 82, N: 126 },
    { id: "u5", rotulo: "Urânio-235 ☢", Z: 92, N: 143 },
    { id: "u8", rotulo: "Urânio-238 ☢", Z: 92, N: 146 },
    { id: "og", rotulo: "Oganessônio-294", Z: 118, N: 176 },
  ];
  const FISSEIS = { 92233: 1, 92235: 1, 94239: 1, 94241: 1, 92238: 2, 90232: 2 }; // 1 = lento, 2 = só rápido

  let pendente = null;

  function criar(caixa) {
    // ---------- DOM ----------
    caixa.style.setProperty("--vh", "50%");
    const vista = el("div", "mod-view");
    const canvas = el("canvas");
    vista.appendChild(canvas);
    const hudNotacao = el("div", "ov ov-tl");
    const hudEstado = el("div", "ov ov-tr");
    const bandeja = el("div", "ov ov-bc bandeja");
    bandeja.innerHTML = `
      <button type="button" data-t="p" aria-label="Arraste ou toque para adicionar um próton"><i style="--c:${COR_P}"></i><span>Próton</span></button>
      <button type="button" data-t="n" aria-label="Arraste ou toque para adicionar um nêutron"><i style="--c:${COR_N}"></i><span>Nêutron</span></button>
      <button type="button" data-t="e" aria-label="Arraste ou toque para adicionar um elétron"><i style="--c:${COR_E}"></i><span>Elétron</span></button>`;
    vista.append(hudNotacao, hudEstado, bandeja);
    const ctl = el("div", "mod-ctl");
    caixa.append(vista, ctl);

    // ---------- estado ----------
    const S = { Z: 6, N: 6, E: 6, quarks: false, auto: true, ocupado: false, pendenteFissao: null };
    const nuc = []; // { t: 1 próton | 0 nêutron, x, y, z, tx, ty, tz, ph, esc, oculto }
    const fx = []; // partículas de efeito
    let arrasto = null;
    let yaw = 0, flash = 0, abalo = 0, fase = 0;
    let telaNuc = []; // posições na tela (para pegar com o dedo)
    let telaEle = [];
    let cam = camadas(S.Z, S.E);
    let layout = { cx: 0, cy: 0, Rv: 100, rN: 8, Rnuc: 20 };

    const cena = new LAB.Cena(canvas, { dprMax: 2 });

    // ---------- núcleo ----------
    function novaParticula(t, de) {
      const p = { t, x: 0, y: 0, z: 0, tx: 0, ty: 0, tz: 0, ph: Math.random() * 6.28, esc: de ? 0.5 : 0.01, oculto: false };
      if (de) { p.x = de.x; p.y = de.y; }
      nuc.push(p);
      return p;
    }
    function recalcularAlvos() {
      const A = nuc.length;
      const Rv = layout.Rv;
      const rN = Rv * (0.1 / Math.pow(1 + A / 60, 0.38));
      const Rn = rN * 1.15 * Math.cbrt(Math.max(A, 1));
      layout.rN = rN; layout.Rnuc = Rn;
      for (let i = 0; i < A; i++) {
        const v = VAGAS[i];
        const r = A === 1 ? 0 : Rn * Math.cbrt((i + 0.5) / A) * 0.92;
        const p = nuc[i];
        p.tx = v[0] * r; p.ty = v[1] * r; p.tz = v[2] * r;
      }
    }
    function sincronizarNucleo(de) {
      const contar = (t) => nuc.reduce((a, p) => a + (p.t === t ? 1 : 0), 0);
      let ps = contar(1), ns = contar(0);
      while (ps < S.Z) { novaParticula(1, de); ps++; }
      while (ns < S.N) { novaParticula(0, de); ns++; }
      for (const [t, alvo] of [[1, S.Z], [0, S.N]]) {
        let c = t === 1 ? ps : ns;
        for (let i = nuc.length - 1; i >= 0 && c > alvo; i--) if (nuc[i].t === t) { nuc.splice(i, 1); c--; }
      }
      recalcularAlvos();
    }
    // monta Z+N partículas misturadas (prótons e nêutrons intercalados)
    function reconstruir(Z, N) {
      const prot = nuc.filter((p) => p.t === 1), neut = nuc.filter((p) => p.t === 0);
      nuc.length = 0;
      const A = Z + N;
      let pi = 0, ni = 0, acum = 0;
      for (let i = 0; i < A; i++) {
        acum += Z / A;
        const querP = acum >= 1 - 1e-9 && pi < Z || ni >= N;
        if (querP) acum -= 1;
        const t = querP ? 1 : 0;
        const reuso = t ? prot[pi] : neut[ni];
        const p = reuso || novaParticula(t, null);
        if (reuso) { reuso.fissao = null; nuc.push(p); }
        t ? pi++ : ni++;
      }
      recalcularAlvos();
    }

    // ---------- efeitos ----------
    function emitir(o) {
      const p = { x: 0, y: 0, vx: 0, vy: 0, vida: 1, max: 1, cor: "#fff", r: 6, tipo: "g", arr: 0, ...o };
      p.max = p.vida;
      if (fx.length >= 220) fx.shift();
      fx.push(p);
      return p;
    }
    function rajada(x, y, cor, n, vel = 120, r = 5) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * 6.283, v = vel * (0.3 + Math.random());
        emitir({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vida: 0.5 + Math.random() * 0.5, cor, r, arr: 2.5 });
      }
    }
    function anel(x, y, cor, r1 = 160, vida = 0.7) { emitir({ x, y, tipo: "anel", cor, r: r1, vida }); }

    // ---------- informações ----------
    function inf() { return F.info(S.Z, S.N); }

    function atualizarHUD() {
      const i = inf();
      const q = S.Z - S.E;
      const carga = q === 0 ? "" : `<span class="q">${Math.abs(q) > 1 ? Math.abs(q) : ""}${q > 0 ? "+" : "−"}</span>`;
      hudNotacao.innerHTML = `
        <div class="notacao"><span class="nn"><span>${S.Z + S.N}</span><span>${S.Z}</span></span>${i.simbolo}${carga}</div>
        <div class="nome-el">${i.nome}${q !== 0 ? ` <small>(íon ${q > 0 ? "positivo" : "negativo"})</small>` : ""}</div>`;
      let tag;
      if (i.estado === "vazio") tag = `<span class="estado-tag vz">Vazio</span>`;
      else if (i.estado === "estavel") tag = `<span class="estado-tag ok">● Estável</span>`;
      else if (i.estado === "naoligado") tag = `<span class="estado-tag nl">● Não ligado</span>`;
      else tag = `<span class="estado-tag rad">☢ Radioativo</span>`;
      hudEstado.innerHTML = tag;
    }

    const cInfo = ui.cartao("Este núcleo", "");
    const cInfoCorpo = el("div");
    cInfo.appendChild(cInfoCorpo);
    function atualizarInfo() {
      const i = inf();
      const q = S.Z - S.E;
      const linhas = [];
      if (i.estado === "vazio") { cInfoCorpo.innerHTML = `<p>Adicione prótons e nêutrons para formar um núcleo.</p>`; return; }
      linhas.push(["Elemento", `${i.nome} <small>(${i.simbolo})</small>`]);
      linhas.push(["Massa", `${F.num(i.massaU, 4)} <small>u</small>`]);
      linhas.push(["Energia de ligação", `${F.num(i.B, 1)} <small>MeV</small>`]);
      linhas.push(["Por núcleon", `${F.num(i.BporA, 2)} <small>MeV</small>`]);
      let est;
      if (i.estado === "estavel") est = "Estável";
      else if (i.estado === "naoligado") est = "Não ligado";
      else est = `${F.tempo(i.t)} <small>meia-vida</small>`;
      linhas.push(["Estabilidade", est]);
      linhas.push(["Carga do átomo", q === 0 ? "Neutro" : q > 0 ? `+${q}` : `−${-q}`]);
      let extra = "";
      if (i.ramos.length) {
        const modos = i.ramos.map((r) => `${F.MODOS[r.modo].nome}${i.ramos.length > 1 ? ` (${F.num(r.p * 100, 0)}%)` : ""}`).join("<br>");
        linhas.push(["Como decai", modos]);
        linhas[linhas.length - 1].push("larga");
      }
      if (i.estado === "naoligado") extra = `<small class="dica">Este núcleo não consegue segurar todos os seus nucleons: ele ejeta ${i.ramos[0].modo === "n" ? "um nêutron" : "um próton"} quase instantaneamente. É o limite da "linha de gotejamento" do mapa de núcleos.</small>`;
      else if (i.fonte === "modelo" && i.estado !== "estavel") extra = `<small class="dica">Meia-vida estimada pelo modelo da gota líquida${i.confianca === "baixa" ? " (pouco confiável para núcleos tão leves)" : ""}. Dados medidos existem só para os núcleos mais estudados.</small>`;
      else if (i.fonte === "modelo") extra = `<small class="dica">Previsão do modelo: sem canal de decaimento energeticamente favorável.</small>`;
      cInfoCorpo.innerHTML = `<dl class="lin">${linhas.map(([k, v, c]) => `<div class="${c || ""}"><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>${extra}`;
    }

    // ---------- controles ----------
    const stP = ui.stepper({ rotulo: "Prótons", cor: COR_P, valor: S.Z, max: ZMAX, onChange: (v) => mudar("Z", v) });
    const stN = ui.stepper({ rotulo: "Nêutrons", cor: COR_N, valor: S.N, max: NMAX, onChange: (v) => mudar("N", v) });
    const stE = ui.stepper({ rotulo: "Elétrons", cor: COR_E, valor: S.E, max: ZMAX + 10, onChange: (v) => mudar("E", v) });
    const sts = el("div", "sts");
    sts.append(stP.el, stN.el, stE.el);
    const cMontar = ui.cartao("Monte seu átomo", sts);
    const presets = ui.chips({ itens: PRESETS, onClick: (id) => { const p = PRESETS.find((x) => x.id === id); definir(p.Z, p.N); }, cls: "" });
    cMontar.appendChild(el("div", "esp"));
    cMontar.appendChild(presets.el);
    cMontar.appendChild(el("small", "dica", "Mexa nos números, toque nos atalhos ou arraste partículas direto no átomo."));

    const seg = ui.segmentado({
      itens: [{ id: "n", rotulo: "Núcleo" }, { id: "q", rotulo: "Ver quarks" }],
      valor: "n",
      onChange: (id) => { S.quarks = id === "q"; },
    });

    const btDecair = ui.botao("☢ Deixar decair", () => decair(true));
    const btPasso = ui.botao("1 passo", () => decair(false), "sec");
    const btFissao = ui.botao("⚡ Dividir o átomo", () => fissao(), "perigo");
    const btDesmontar = ui.botao("Desmontar tudo", () => desmontar(), "sec");
    const cAcoes = ui.cartao("Experimentos", "");
    const linhaDec = el("div", "linha-bt");
    linhaDec.append(btDecair, btPasso);
    const linhaFis = el("div", "linha-bt");
    linhaFis.append(btFissao, btDesmontar);
    cAcoes.append(linhaDec, el("div", "esp"), linhaFis, el("div", "esp"), seg.el);
    const resultado = el("div", "resultado");
    cAcoes.appendChild(resultado);

    const cCadeia = ui.cartao("Cadeia de decaimento", "");
    const tl = el("div", "timeline");
    cCadeia.appendChild(tl);
    cCadeia.hidden = true;

    // mapa de núcleos
    const mapaCanvas = el("canvas", "mapa");
    const mapaSeg = ui.segmentado({
      itens: [{ id: "perto", rotulo: "Perto de mim" }, { id: "tudo", rotulo: "Mapa inteiro" }],
      valor: "perto",
      onChange: (id) => { mapaModo = id; desenharMapa(); },
    });
    const cMapa = ui.cartao("Mapa de núcleos", "");
    cMapa.append(mapaSeg.el, mapaCanvas);
    cMapa.insertAdjacentHTML("beforeend", `
      <div class="leg mapa-leg">
        <span style="--c:#fff"><i></i>Estável</span><span style="--c:#4da3ff"><i></i>β⁻</span>
        <span style="--c:#ff5a7a"><i></i>β⁺/CE</span><span style="--c:#ffd23f"><i></i>α</span>
      </div>
      <small class="dica">Cada pixel é um núcleo possível (nêutrons →, prótons ↑). A faixa branca é o "vale da estabilidade". Toque ou arraste no mapa para visitar qualquer núcleo. As linhas tracejadas são os números mágicos.</small>`);

    const cComo = ui.cartao("Como funciona", `
      <p>O <b>número de prótons</b> define o elemento. Mudar os <b>nêutrons</b> cria isótopos. Os <b>elétrons</b> só mudam a carga (íons).</p>
      <p>A energia de ligação vem de dados medidos quando existem e, para o resto, do modelo da gota líquida. Os átomos não estão em escala: se o núcleo fosse uma bola de gude, o átomo teria o tamanho de um estádio.</p>`);

    ctl.append(cMontar, cInfo, cAcoes, cCadeia, cMapa, cComo);

    // ---------- mapa ----------
    let mapaModo = "perto";
    const img = document.createElement("canvas");
    img.width = NMAX + 1; img.height = ZMAX + 1;
    let imgPronta = false;
    function prepararImagem() {
      const g = img.getContext("2d");
      const d = g.createImageData(img.width, img.height);
      for (let z = 0; z <= ZMAX; z++) {
        for (let n = 0; n <= NMAX; n++) {
          const o = ((ZMAX - z) * img.width + n) * 4;
          if (z + n === 0) continue;
          const i = F.info(z, n);
          let c, a = 255;
          if (i.estado === "estavel") c = ESTADO_COR.estavel;
          else if (i.estado === "naoligado") { c = [120, 100, 150]; a = 70; }
          else { c = ESTADO_COR[i.ramos[0].modo] || ESTADO_COR.n; a = i.t > 1e-3 ? 235 : 150; }
          d.data[o] = c[0]; d.data[o + 1] = c[1]; d.data[o + 2] = c[2]; d.data[o + 3] = a;
        }
      }
      g.putImageData(d, 0, 0);
      imgPronta = true;
    }
    const mapaGeom = { cel: 4, n0: 0, z0: 0, w: 0, h: 0 };
    function desenharMapa() {
      if (!imgPronta) return;
      const r = mapaCanvas.getBoundingClientRect();
      if (r.width < 10) return;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const w = Math.round(r.width), h = Math.round(r.height);
      if (mapaCanvas.width !== w * dpr) { mapaCanvas.width = w * dpr; mapaCanvas.height = h * dpr; }
      const g = mapaCanvas.getContext("2d");
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);
      g.fillStyle = "rgba(0,0,0,0.35)";
      g.fillRect(0, 0, w, h);
      let cel, n0, z0;
      if (mapaModo === "tudo") {
        cel = Math.min(w / (NMAX + 2), h / (ZMAX + 2));
        n0 = -(w / cel - (NMAX + 1)) / 2; z0 = -(h / cel - (ZMAX + 1)) / 2;
      } else {
        cel = w / 34;
        const nw = w / cel, nh = h / cel;
        n0 = clamp(S.N - nw / 2, -2, NMAX + 3 - nw);
        z0 = clamp(S.Z - nh / 2, -2, ZMAX + 3 - nh);
      }
      Object.assign(mapaGeom, { cel, n0, z0, w, h });
      const X = (n) => (n - n0) * cel;
      const Y = (z) => h - (z - z0 + 1) * cel; // topo da célula
      g.imageSmoothingEnabled = false;
      g.drawImage(img, X(0), Y(ZMAX), (NMAX + 1) * cel, (ZMAX + 1) * cel);
      // números mágicos
      g.strokeStyle = "rgba(255,255,255,0.16)"; g.lineWidth = 1; g.setLineDash([3, 4]);
      for (const m of MAGICOS) {
        g.beginPath(); g.moveTo(X(m), 0); g.lineTo(X(m), h); g.stroke();
        g.beginPath(); g.moveTo(0, Y(m) + cel); g.lineTo(w, Y(m) + cel); g.stroke();
      }
      g.setLineDash([]);
      // seleção
      const sx = X(S.N) + cel / 2, sy = Y(S.Z) + cel / 2;
      g.strokeStyle = "#fff"; g.lineWidth = 2;
      g.shadowColor = "#fff"; g.shadowBlur = 10;
      g.beginPath(); g.arc(sx, sy, Math.max(cel * 1.2, 6), 0, 6.2832); g.stroke();
      g.shadowBlur = 0;
      g.fillStyle = "rgba(255,255,255,0.7)"; g.font = "11px Inter, sans-serif";
      g.fillText("nêutrons →", w - 66, h - 6);
      g.save(); g.translate(12, 66); g.rotate(-Math.PI / 2); g.fillText("prótons →", 0, 0); g.restore();
    }
    function mapaPonto(e) {
      const r = mapaCanvas.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const n = Math.floor(mapaGeom.n0 + x / mapaGeom.cel);
      const z = Math.floor(mapaGeom.z0 + (mapaGeom.h - y) / mapaGeom.cel);
      return [clamp(z, 0, ZMAX), clamp(n, 0, NMAX)];
    }
    let mapaArrasta = false;
    mapaCanvas.style.touchAction = "none";
    mapaCanvas.addEventListener("pointerdown", (e) => {
      mapaCanvas.setPointerCapture(e.pointerId);
      mapaArrasta = true;
      const [z, n] = mapaPonto(e);
      definir(z, n, { suave: true, mantemMapa: true });
    });
    mapaCanvas.addEventListener("pointermove", (e) => {
      if (!mapaArrasta) return;
      const [z, n] = mapaPonto(e);
      if (z !== S.Z || n !== S.N) definir(z, n, { suave: true, mantemMapa: true });
    });
    const fimMapa = () => { mapaArrasta = false; desenharMapa(); };
    mapaCanvas.addEventListener("pointerup", fimMapa);
    mapaCanvas.addEventListener("pointercancel", fimMapa);

    // ---------- mudanças de estado ----------
    function aplicar(opts = {}) {
      cam = camadas(S.Z, S.E);
      stP.set(S.Z); stN.set(S.N); stE.set(S.E);
      stP.sub("→ " + F.nomeElemento(S.Z).nome);
      stN.sub("A = " + (S.Z + S.N));
      const q = S.Z - S.E;
      stE.sub(q === 0 ? "neutro" : q > 0 ? `íon +${q}` : `íon −${-q}`);
      atualizarHUD();
      atualizarInfo();
      const i = inf();
      btDecair.disabled = btPasso.disabled = !(i.estado === "instavel" || i.estado === "naoligado") || S.ocupado;
      btFissao.disabled = S.Z + S.N < 2 || S.ocupado;
      btDesmontar.disabled = S.Z + S.N < 2 || S.ocupado;
      if (!opts.mantemMapa || mapaModo === "perto") desenharMapa();
      else desenharMapa();
    }
    // depois de uma fissão os pedaços ficam afastados até o usuário escolher outro núcleo
    function limparFissao() {
      if (!S.pendenteFissao) return;
      S.pendenteFissao = null; S.ocupado = false;
      for (const p of nuc) p.fissao = null;
    }
    function mudar(que, v) {
      limparFissao();
      S[que] = v;
      if (que !== "E") { sincronizarNucleo(); }
      resultado.innerHTML = "";
      aplicar();
      const d = que === "Z" ? COR_P : que === "N" ? COR_N : COR_E;
      anel(layout.cx, layout.cy, d, layout.Rv * 0.5, 0.5);
      LAB.som.tom(que === "E" ? 660 : que === "Z" ? 440 : 330, 0.08, 0.06, "triangle");
    }
    function definir(Z, N, o = {}) {
      limparFissao();
      S.Z = clamp(Z, 0, ZMAX); S.N = clamp(N, 0, NMAX);
      S.E = o.E != null ? o.E : S.Z;
      reconstruir(S.Z, S.N);
      resultado.innerHTML = "";
      aplicar(o);
      if (!o.suave) { anel(layout.cx, layout.cy, "#fff", layout.Rv * 0.8, 0.7); LAB.som.tom(520, 0.15, 0.07, "triangle", 780); }
      const i = inf();
      if (i.estado === "naoligado" && !S.ocupado) setTimeout(() => { if (!S.ocupado && inf().estado === "naoligado") decair(false); }, 900);
    }

    // ---------- decaimento ----------
    const esperar = (ms) => new Promise((r) => setTimeout(r, LAB.reduzMovimento ? Math.min(ms, 60) : ms));
    function posTela(p) { return project(p.x, p.y, p.z); }
    function removerNucleons(t, n) {
      const saiu = [];
      for (let i = nuc.length - 1; i >= 0 && saiu.length < n; i--) if (nuc[i].t === t) saiu.push(...nuc.splice(i, 1));
      return saiu;
    }
    async function passoDecaimento(ramo) {
      const { cx, cy, Rv } = layout;
      const [Z2, N2] = F.filho(S.Z, S.N, ramo.modo);
      if (Z2 < 0 || N2 < 0) return false;
      abalo = 1; LAB.som.tom(200, 0.4, 0.1, "sawtooth", 90);
      await esperar(380);
      const ang = Math.random() * 6.283, dx = Math.cos(ang), dy = Math.sin(ang);
      const flashCor = F.MODOS[ramo.modo].cor;
      if (ramo.modo === "a") {
        const grupo = [...removerNucleons(1, 2), ...removerNucleons(0, 2)];
        for (const p of grupo) { const s = posTela(p); emitir({ x: s.x, y: s.y, vx: dx * 520 + rnd(-30, 30), vy: dy * 520 + rnd(-30, 30), vida: 1.3, cor: p.t ? COR_P : COR_N, r: layout.rN * 0.9, tipo: "esf", arr: 0 }); }
        emitir({ x: cx + dx * layout.Rnuc, y: cy + dy * layout.Rnuc, vx: dx * 520, vy: dy * 520, vida: 1.3, cor: "#ffd23f", r: layout.rN * 3.2, tipo: "g", arr: 0 });
        LAB.som.clique(0.5, 0.5); LAB.som.tom(900, 0.25, 0.08, "sine", 300);
      } else if (ramo.modo === "b-") {
        const n = nuc.slice().reverse().find((p) => p.t === 0);
        if (n) { n.t = 1; const s = posTela(n); rajada(s.x, s.y, "#4da3ff", 10, 90, 6); }
        emitir({ x: cx, y: cy, vx: dx * 460, vy: dy * 460, vida: 1.1, cor: COR_E, r: 9, tipo: "g" });
        emitir({ x: cx, y: cy, vx: -dx * 600, vy: -dy * 600, vida: 0.9, cor: "#9aa3c8", r: 5, tipo: "g" });
        LAB.som.tom(1200, 0.12, 0.07, "sine", 500);
      } else if (ramo.modo === "b+") {
        const p = nuc.slice().reverse().find((q) => q.t === 1);
        const positron = ramo.q > 1.022;
        if (p) { p.t = 0; const s = posTela(p); rajada(s.x, s.y, "#ff5a7a", 10, 90, 6); }
        if (positron) emitir({ x: cx, y: cy, vx: dx * 460, vy: dy * 460, vida: 1.1, cor: "#ff9ec0", r: 9, tipo: "g" });
        else emitir({ x: cx + dx * Rv * 0.5, y: cy + dy * Rv * 0.5, vx: -dx * 220, vy: -dy * 220, vida: 0.7, cor: COR_E, r: 8, tipo: "g" });
        emitir({ x: cx, y: cy, vx: -dx * 600, vy: -dy * 600, vida: 0.9, cor: "#9aa3c8", r: 5, tipo: "g" });
        LAB.som.tom(900, 0.12, 0.07, "sine", 400);
      } else {
        const t = ramo.modo === "n" ? 0 : 1;
        for (const p of removerNucleons(t, 1)) { const s = posTela(p); emitir({ x: s.x, y: s.y, vx: dx * 420, vy: dy * 420, vida: 1.2, cor: t ? COR_P : COR_N, r: layout.rN, tipo: "esf" }); }
      }
      flash = 1;
      anel(cx, cy, flashCor, Rv * 1.1, 0.8);
      LAB.som.vibrar(25);
      S.Z = Z2; S.N = N2;
      if (S.auto) S.E = S.Z;
      sincronizarNucleo();
      aplicar();
      await esperar(520);
      return true;
    }
    async function decair(tudo) {
      if (S.ocupado) return;
      let i = inf();
      if (i.estado !== "instavel" && i.estado !== "naoligado") return;
      S.ocupado = true; aplicar();
      resultado.innerHTML = "";
      if (tudo) { cCadeia.hidden = false; tl.innerHTML = ""; }
      let tTotal = 0, passos = 0;
      for (let k = 0; k < 40; k++) {
        i = inf();
        if (i.estado !== "instavel" && i.estado !== "naoligado") break;
        const ramo = F.sortearRamo(i);
        if (!ramo) break;
        const antes = i;
        const ok = await passoDecaimento(ramo);
        if (!ok) break;
        passos++;
        tTotal += ramo.t;
        cCadeia.hidden = false;
        if (!tudo && passos === 1) tl.innerHTML = "";
        const nova = inf();
        const linha = el("div", "", `<span class="m" style="color:${F.MODOS[ramo.modo].cor}">${F.MODOS[ramo.modo].curto}</span><span>${F.sup(antes.A)}${antes.simbolo} → ${F.sup(nova.A)}${nova.simbolo}</span><span class="t">${F.tempo(ramo.t)}</span>`);
        tl.appendChild(linha);
        tl.scrollTop = tl.scrollHeight;
        if (!tudo) break;
      }
      S.ocupado = false;
      aplicar();
      i = inf();
      if (passos && (i.estado === "estavel")) {
        resultado.innerHTML = `<div class="res-ok">Chegou a um núcleo <b>estável</b>: ${F.sup(i.A)}${i.simbolo}. Tempo típico acumulado da cadeia: <b>${F.tempo(tTotal)}</b>.</div>`;
        LAB.som.tom(784, 0.3, 0.08, "triangle", 1046);
      }
    }

    // ---------- fissão ----------
    function planoFissao(Z, N) {
      // núcleo composto = alvo + 1 nêutron; divisão assimétrica típica
      const Nc = N + 1, Ac = Z + Nc;
      const nu = Math.random() < 0.43 ? 3 : 2;
      const Apesado = Math.round(clamp(Ac * 0.59, 120, 150));
      const Aleve = Ac - Apesado - nu;
      // a carga tem de fechar (Z1 + Z2 = Z): escolhe a divisão mais ligada
      let melhor = null;
      const z0 = Math.round((Z * Aleve) / Ac);
      for (let z1 = z0 - 5; z1 <= z0 + 5; z1++) {
        const z2 = Z - z1, n1 = Aleve - z1, n2 = Apesado - z2;
        if (z1 < 1 || z2 < 1 || n1 < 1 || n2 < 1) continue;
        const b = F.semf(z1, n1) + F.semf(z2, n2);
        if (!melhor || b > melhor.b) melhor = { b, z1, z2, n1, n2 };
      }
      const a = { Z: melhor.z1, N: melhor.n1 }, b = { Z: melhor.z2, N: melhor.n2 };
      const Q = melhor.b - F.semf(Z, Nc);
      return { Nc, a, b, nu, Q, Ac };
    }
    async function fissao() {
      if (S.ocupado) return;
      const A = S.Z + S.N;
      const chave = S.Z * 1000 + A;
      if (A < 200) {
        resultado.innerHTML = `<div class="res-aviso"><b>Esse núcleo é estável demais para dividir.</b> Núcleos leves e médios liberam energia ao <b>fundir</b> (veja a aba Estrela). A fissão só compensa nos muito pesados, como o urânio.<br><small>Experimente: Urânio-235 ou Plutônio-239.</small></div>`;
        LAB.som.tom(180, 0.2, 0.08, "square");
        return;
      }
      const tipo = FISSEIS[chave];
      if (!tipo) {
        resultado.innerHTML = `<div class="res-aviso"><b>${S.Z === 92 ? "Esse isótopo" : "Esse núcleo"} não fissiona bem com nêutron lento.</b> Os físseis conhecidos são urânio-233, urânio-235, plutônio-239 e plutônio-241.<br><small>Quer ver mesmo assim? O urânio-238 só fissiona com nêutrons rápidos.</small></div>`;
        LAB.som.tom(180, 0.2, 0.08, "square");
        return;
      }
      S.ocupado = true; aplicar();
      resultado.innerHTML = "";
      const { cx, cy, Rv } = layout;
      // 1. um nêutron lento chega
      const ang = Math.random() * 6.283;
      const nx = Math.cos(ang), ny = Math.sin(ang);
      const e = emitir({ x: cx + nx * Rv * 1.1, y: cy + ny * Rv * 1.1, vx: -nx * Rv * 1.5, vy: -ny * Rv * 1.5, vida: 0.75, cor: COR_N, r: 10, tipo: "g" });
      LAB.som.tom(300, 0.7, 0.05, "sine", 520);
      await esperar(750);
      const plano = planoFissao(S.Z, S.N);
      S.N += 1; sincronizarNucleo(); aplicar();
      flash = 0.6; abalo = 2.4;
      // 2. o núcleo composto oscila e se alonga
      LAB.som.tom(90, 0.9, 0.12, "sawtooth", 50);
      for (let k = 0; k < 28; k++) { fissaoForma = k / 28; await esperar(30); }
      // 3. divisão
      const eixoX = Math.cos(ang + 1.57), eixoY = Math.sin(ang + 1.57);
      const grupoA = [], grupoB = [];
      const lado = (p) => p.tx * eixoX + p.ty * eixoY;
      const ordenados = nuc.slice().sort((p, q) => lado(p) - lado(q));
      const nA = plano.a.Z + plano.a.N;
      ordenados.forEach((p, i) => (i < nA ? grupoA : grupoB).push(p));
      // nêutrons livres: os últimos de cada grupo
      const livres = [];
      for (let k = 0; k < plano.nu; k++) {
        const g = k % 2 ? grupoB : grupoA;
        const idx = g.findIndex((p) => p.t === 0);
        if (idx >= 0) livres.push(...g.splice(idx, 1));
      }
      const velA = Rv * 0.9;
      for (const p of grupoA) p.fissao = { dx: -eixoX * velA, dy: -eixoY * velA };
      for (const p of grupoB) p.fissao = { dx: eixoX * velA * 0.65, dy: eixoY * velA * 0.65 };
      for (const p of livres) {
        const s = posTela(p);
        const a2 = Math.random() * 6.283;
        emitir({ x: s.x, y: s.y, vx: Math.cos(a2) * 480, vy: Math.sin(a2) * 480, vida: 1.2, cor: COR_N, r: layout.rN, tipo: "esf" });
        nuc.splice(nuc.indexOf(p), 1);
      }
      fissaoForma = 0; flash = 1.4; abalo = 3;
      anel(cx, cy, "#ffb23d", Rv * 1.5, 1);
      anel(cx, cy, "#fff", Rv * 0.9, 0.6);
      rajada(cx, cy, "#ffb23d", 40, 260, 8);
      LAB.som.estouro(0.35); LAB.som.vibrar(60);
      await esperar(1300);
      // 4. resultado
      const Q = plano.Q;
      S.pendenteFissao = plano;
      resultado.innerHTML = `
        <div class="res-fis">
          <h5>Fissão concluída</h5>
          <div class="frag"><b>${F.sup(plano.a.Z + plano.a.N)}${F.nomeElemento(plano.a.Z).s}</b> + <b>${F.sup(plano.b.Z + plano.b.N)}${F.nomeElemento(plano.b.Z).s}</b> + <b>${plano.nu}</b> nêutrons livres</div>
          <div class="energia">≈ <b>${F.num(Q, 0)} MeV</b> liberados <small>(estimativa pelo modelo; o valor medido é cerca de 200 MeV)</small></div>
          <small class="dica">Cada um desses nêutrons pode dividir outro núcleo: é a reação em cadeia (veja a aba Reator). Escolha um fragmento para continuar:</small>
          <div class="linha-bt"></div>
        </div>`;
      const lb = resultado.querySelector(".linha-bt");
      lb.append(
        ui.botao(`${F.sup(plano.a.Z + plano.a.N)}${F.nomeElemento(plano.a.Z).s}`, () => { S.ocupado = false; definir(plano.a.Z, plano.a.N); }, "sec"),
        ui.botao(`${F.sup(plano.b.Z + plano.b.N)}${F.nomeElemento(plano.b.Z).s}`, () => { S.ocupado = false; definir(plano.b.Z, plano.b.N); }, "sec")
      );
      // mostra os dois pedaços até o usuário escolher
      S.ocupado = true;
    }
    let fissaoForma = 0;

    // ---------- desmontar ----------
    async function desmontar() {
      if (S.ocupado || nuc.length < 2) return;
      S.ocupado = true; aplicar();
      const i = inf();
      const { cx, cy, Rv } = layout;
      LAB.som.tom(80, 1.2, 0.1, "sawtooth", 200);
      for (const p of nuc) {
        const a = Math.random() * 6.283, v = Rv * (0.6 + Math.random() * 0.8);
        p.fissao = { dx: Math.cos(a) * v, dy: Math.sin(a) * v };
      }
      flash = 0.8; abalo = 2;
      resultado.innerHTML = `<div class="res-ok">Para separar todos os nucleons é preciso fornecer <b>${F.num(i.B, 1)} MeV</b> (a energia de ligação). É essa energia que o núcleo guarda — e que fusão e fissão liberam em parte.<br><small>${F.num(i.BporA, 2)} MeV por nucleon.</small></div>`;
      await esperar(1700);
      for (const p of nuc) p.fissao = null;
      anel(cx, cy, "#5df0b0", Rv * 1.0, 0.8);
      LAB.som.tom(300, 0.5, 0.1, "triangle", 900);
      S.ocupado = false; aplicar();
    }

    // ---------- projeção e desenho ----------
    let cY = 1, sY = 0, cX = 1, sX = 0;
    function project(x, y, z) {
      const x1 = x * cY + z * sY, z1 = -x * sY + z * cY;
      const y2 = y * cX - z1 * sX, z2 = y * sX + z1 * cX;
      const k = 1 / (1 - z2 / (layout.Rv * 3.2));
      return { x: layout.cx + x1 * k, y: layout.cy + y2 * k, z: z2, k };
    }

    cena.aoRedimensionar = (w, h) => {
      const tray = 66;
      layout.cx = w / 2;
      layout.cy = (h - tray) / 2 + 4;
      layout.Rv = Math.min(w / 2, (h - tray) / 2) * 0.96;
      recalcularAlvos();
    };

    let tPulso = 0;
    cena.atualizar = (dt, t) => {
      fase += dt;
      yaw += dt * 0.32;
      const tilt = 0.42 + Math.sin(t * 0.25) * 0.1;
      cY = Math.cos(yaw); sY = Math.sin(yaw); cX = Math.cos(tilt); sX = Math.sin(tilt);
      flash = Math.max(0, flash - dt * 2.4);
      abalo = Math.max(0, abalo - dt * 2.2);
      tPulso += dt;
      const k = Math.min(1, dt * 9);
      for (const p of nuc) {
        let tx = p.tx, ty = p.ty, tz = p.tz;
        if (p.fissao) { tx += p.fissao.dx; ty += p.fissao.dy; }
        else if (fissaoForma > 0) { // alongamento antes de dividir
          const s = 1 + fissaoForma * 0.55;
          tx *= s; ty *= s; tz *= 1 - fissaoForma * 0.2;
        }
        const kk = p.fissao ? Math.min(1, dt * 3.5) : k;
        p.x += (tx - p.x) * kk; p.y += (ty - p.y) * kk; p.z += (tz - p.z) * kk;
        p.esc += (1 - p.esc) * Math.min(1, dt * 7);
      }
      for (let i = fx.length - 1; i >= 0; i--) {
        const p = fx[i];
        p.vida -= dt;
        if (p.vida <= 0) { fx.splice(i, 1); continue; }
        if (p.tipo === "anel") continue;
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.arr) { p.vx *= 1 - p.arr * dt; p.vy *= 1 - p.arr * dt; }
      }
    };

    cena.desenhar = (g, w, h, t) => {
      g.clearRect(0, 0, w, h);
      const { cx, cy, Rv } = layout;
      const i = inf();
      const sh = abalo > 0 ? (Math.random() - 0.5) * abalo * 5 : 0;
      const sv = abalo > 0 ? (Math.random() - 0.5) * abalo * 5 : 0;
      g.save();
      g.translate(sh, sv);
      g.globalCompositeOperation = "lighter";

      // halo do núcleo conforme a estabilidade
      let corHalo = "#5df0b0", forca = 0.22;
      if (i.estado === "instavel") { corHalo = "#ffd23f"; forca = 0.28 + Math.sin(t * 5) * 0.12; }
      else if (i.estado === "naoligado") { corHalo = "#ff5a7a"; forca = 0.4 + Math.sin(t * 17) * 0.2; }
      else if (i.estado === "vazio") forca = 0;
      if (forca > 0) {
        const hr = Math.max(layout.Rnuc * 2.6, 40);
        g.globalAlpha = clamp(forca + flash * 0.5, 0, 1);
        const spr = LAB.brilho(64, corHalo, 0.2);
        g.drawImage(spr, cx - hr, cy - hr, hr * 2, hr * 2);
        g.globalAlpha = 1;
      }

      // elétrons: órbitas e partículas
      telaEle.length = 0;
      const n = cam.length;
      if (n) {
        const rIn = Math.max(0.42 * Rv, layout.Rnuc * 1.45 + 6), rOut = 0.97 * Rv;
        const spr = LAB.brilho(9, COR_E, 0.95);
        for (let s = 0; s < n; s++) {
          const r = n === 1 ? (rIn + rOut) / 2 : rIn + ((rOut - rIn) * s) / (n - 1);
          const incl = 1.0 + ((s * 0.47) % 0.9);
          const giro = s * 2.4 + yaw * 0.35;
          const ca = Math.cos(incl), sa = Math.sin(incl), cg = Math.cos(giro), sg = Math.sin(giro);
          // base (u, v) do plano da órbita
          const ux = cg, uy = sg, uz = 0;
          const vx = -sg * ca, vy = cg * ca, vz = sa;
          g.strokeStyle = LAB.rgba(COR_E, 0.13);
          g.lineWidth = 1;
          g.beginPath();
          for (let k = 0; k <= 56; k++) {
            const a = (k / 56) * 6.2832, c = Math.cos(a) * r, d = Math.sin(a) * r;
            const p = project(c * ux + d * vx, c * uy + d * vy, c * uz + d * vz);
            k ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y);
          }
          g.stroke();
          const cnt = cam[s];
          const vel = 1.1 / (1 + s * 0.5);
          for (let e = 0; e < cnt; e++) {
            const a = t * vel + (e / cnt) * 6.2832 + s;
            const c = Math.cos(a) * r, d = Math.sin(a) * r;
            const p = project(c * ux + d * vx, c * uy + d * vy, c * uz + d * vz);
            const rr = 7 * p.k + 3;
            if (arrasto && arrasto.origem === "atomo" && arrasto.tipo === "e" && arrasto.idx === telaEle.length) { telaEle.push([p.x, p.y, rr]); continue; }
            g.drawImage(spr, p.x - rr, p.y - rr, rr * 2, rr * 2);
            telaEle.push([p.x, p.y, rr]);
          }
        }
      }
      g.globalCompositeOperation = "source-over";

      // núcleo: duas passadas (fundo e frente) evitam ordenar
      telaNuc.length = 0;
      const ps = nuc;
      const rN = layout.rN;
      const sP = LAB.esfera(Math.max(3, Math.round(rN)), COR_P);
      const sN = LAB.esfera(Math.max(3, Math.round(rN)), COR_N);
      const jit = rN * 0.09 * (i.estado === "naoligado" ? 3.5 : i.estado === "instavel" ? 1.6 : 1);
      for (let passada = 0; passada < 2; passada++) {
        for (let k = 0; k < ps.length; k++) {
          const p = ps[k];
          const jx = Math.sin(t * 7 + p.ph) * jit, jy = Math.cos(t * 6.3 + p.ph * 1.7) * jit, jz = Math.sin(t * 5.1 + p.ph * 2.3) * jit;
          const q = project(p.x + jx, p.y + jy, p.z + jz);
          if ((q.z >= 0) !== (passada === 1)) continue;
          const dragIt = arrasto && arrasto.origem === "atomo" && arrasto.idx === k && arrasto.tipo === "nuc";
          telaNuc[k] = [q.x, q.y, rN * q.k];
          if (dragIt) continue;
          const rr = (rN + 3) * q.k * p.esc;
          g.globalAlpha = 0.72 + 0.28 * clamp((q.z / (rN * 3)) * 0.5 + 0.5, 0, 1);
          g.drawImage(p.t ? sP : sN, q.x - rr, q.y - rr, rr * 2, rr * 2);
          if (S.quarks && ps.length <= 60) {
            const qr = rN * q.k * 0.34;
            const cores = ["#ff4d4d", "#4dff7a", "#4d8bff"];
            g.globalAlpha = 1;
            for (let c = 0; c < 3; c++) {
              const a = t * 2.4 + p.ph + (c * 6.2832) / 3;
              g.fillStyle = cores[c];
              g.beginPath();
              g.arc(q.x + Math.cos(a) * rN * q.k * 0.45, q.y + Math.sin(a) * rN * q.k * 0.45, qr, 0, 6.2832);
              g.fill();
            }
          }
        }
      }
      g.globalAlpha = 1;

      // efeitos
      g.globalCompositeOperation = "lighter";
      for (let k = 0; k < fx.length; k++) {
        const p = fx[k];
        const f = p.vida / p.max;
        if (p.tipo === "anel") {
          g.strokeStyle = LAB.rgba(p.cor, f * 0.8);
          g.lineWidth = 2 + f * 3;
          g.beginPath(); g.arc(p.x, p.y, p.r * (1 - f), 0, 6.2832); g.stroke();
        } else if (p.tipo === "esf") {
          g.globalAlpha = Math.min(1, f * 2);
          const r = p.r * 1.6;
          g.drawImage(LAB.brilho(Math.max(4, Math.round(p.r)), p.cor, 0.8), p.x - r, p.y - r, r * 2, r * 2);
          g.globalAlpha = 1;
        } else {
          g.globalAlpha = Math.min(1, f * 1.6);
          const r = p.r * (0.6 + f * 0.8) * 1.6;
          g.drawImage(LAB.brilho(Math.max(4, Math.round(p.r)), p.cor, 0.9), p.x - r, p.y - r, r * 2, r * 2);
          g.globalAlpha = 1;
        }
      }
      g.globalCompositeOperation = "source-over";
      g.restore();

      if (flash > 0) {
        g.fillStyle = `rgba(255,255,255,${clamp(flash * 0.18, 0, 0.3)})`;
        g.fillRect(0, 0, w, h);
      }

      // partícula arrastada
      if (arrasto && arrasto.mover) {
        const cor = arrasto.tipo === "p" ? COR_P : arrasto.tipo === "n" ? COR_N : arrasto.tipo === "e" ? COR_E : arrasto.cor;
        const r = arrasto.tipo === "e" ? 12 : Math.max(10, rN);
        g.globalAlpha = 0.95;
        g.drawImage(arrasto.tipo === "e" ? LAB.brilho(12, COR_E, 0.95) : LAB.esfera(Math.round(r), cor), arrasto.x - r * 1.6, arrasto.y - r * 1.6, r * 3.2, r * 3.2);
        g.globalAlpha = 1;
        // guia de soltura
        g.strokeStyle = "rgba(255,255,255,0.25)"; g.setLineDash([5, 6]); g.lineWidth = 1;
        g.beginPath(); g.arc(cx, cy, arrasto.origem === "atomo" && arrasto.tipo !== "e" ? layout.Rnuc * 1.5 + 8 : Rv * 0.99, 0, 6.2832); g.stroke(); g.setLineDash([]);
      }
    };

    // ---------- arrastar partículas ----------
    function iniciarArraste(info, e) {
      arrasto = { ...info, x: 0, y: 0, mover: false, id: e.pointerId, ini: cena.pos(e) };
      const mv = (ev) => {
        if (ev.pointerId !== arrasto.id) return;
        const p = cena.pos(ev);
        arrasto.x = p.x; arrasto.y = p.y;
        if (!arrasto.mover && Math.hypot(p.x - arrasto.ini.x, p.y - arrasto.ini.y) > 6) arrasto.mover = true;
      };
      const up = (ev) => {
        if (ev.pointerId !== arrasto.id) return;
        window.removeEventListener("pointermove", mv);
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", up);
        soltar(ev.type === "pointercancel");
      };
      window.addEventListener("pointermove", mv);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", up);
    }
    function soltar(cancelou) {
      const a = arrasto;
      arrasto = null;
      if (!a || S.ocupado) return;
      const { cx, cy, Rv } = layout;
      const d = Math.hypot(a.x - cx, a.y - cy);
      if (a.origem === "bandeja") {
        if (cancelou) return;
        if (!a.mover || d < Rv * 1.05) {
          const q = { x: a.mover ? a.x - cx : 0, y: a.mover ? a.y - cy : Rv * 0.9 };
          adicionar(a.tipo, q);
        }
      } else if (a.origem === "atomo") {
        if (cancelou) return;
        const limite = a.tipo === "nuc" ? layout.Rnuc * 1.5 + 8 : Rv * 0.99;
        if (d > limite) retirar(a);
      }
    }
    function adicionar(tipo, de) {
      if (tipo === "e") {
        if (S.E >= ZMAX + 10) return;
        S.E++;
        emitir({ x: layout.cx + de.x, y: layout.cy + de.y, vx: -de.x * 6, vy: -de.y * 6, vida: 0.4, cor: COR_E, r: 9, tipo: "g" });
        aplicar();
        LAB.som.tom(700, 0.1, 0.06, "triangle");
        return;
      }
      if (tipo === "p" && S.Z >= ZMAX) return;
      if (tipo === "n" && S.N >= NMAX) return;
      if (tipo === "p") S.Z++; else S.N++;
      novaParticula(tipo === "p" ? 1 : 0, de);
      recalcularAlvos();
      resultado.innerHTML = "";
      aplicar();
      anel(layout.cx, layout.cy, tipo === "p" ? COR_P : COR_N, layout.Rv * 0.5, 0.5);
      LAB.som.tom(tipo === "p" ? 440 : 330, 0.1, 0.07, "triangle"); LAB.som.vibrar(8);
    }
    function retirar(a) {
      const vx = (a.x - layout.cx) * 3, vy = (a.y - layout.cy) * 3;
      if (a.tipo === "e") {
        if (S.E <= 0) return;
        S.E--;
        emitir({ x: a.x, y: a.y, vx, vy, vida: 0.9, cor: COR_E, r: 9, tipo: "g" });
        LAB.som.tom(900, 0.12, 0.06, "triangle", 300);
      } else {
        const p = nuc[a.idx];
        if (!p) return;
        if (p.t) S.Z--; else S.N--;
        nuc.splice(a.idx, 1);
        recalcularAlvos();
        emitir({ x: a.x, y: a.y, vx, vy, vida: 1, cor: p.t ? COR_P : COR_N, r: layout.rN, tipo: "esf" });
        LAB.som.tom(260, 0.15, 0.07, "triangle", 120);
      }
      resultado.innerHTML = "";
      aplicar();
      LAB.som.vibrar(8);
    }
    bandeja.addEventListener("pointerdown", (e) => {
      const b = e.target.closest("button[data-t]");
      if (!b || S.ocupado) return;
      e.preventDefault();
      iniciarArraste({ origem: "bandeja", tipo: b.dataset.t }, e);
    });
    bandeja.querySelectorAll("button").forEach((b) => { b.style.touchAction = "none"; });
    canvas.addEventListener("pointerdown", (e) => {
      if (S.ocupado) return;
      const p = cena.pos(e);
      // elétron mais perto
      let melhor = null, dm = 22;
      for (let i = 0; i < telaEle.length; i++) { const q = telaEle[i]; const d = Math.hypot(q[0] - p.x, q[1] - p.y); if (d < dm) { dm = d; melhor = { origem: "atomo", tipo: "e", idx: i }; } }
      // nucleon mais perto (o da frente tem prioridade)
      let dn = 1e9;
      for (let i = 0; i < telaNuc.length; i++) {
        const q = telaNuc[i];
        if (!q) continue;
        const d = Math.hypot(q[0] - p.x, q[1] - p.y);
        if (d < Math.max(q[2] * 1.5, 14) && d < dn && (!melhor || d < dm)) { dn = d; melhor = { origem: "atomo", tipo: "nuc", idx: i }; }
      }
      if (melhor) { canvas.setPointerCapture(e.pointerId); iniciarArraste(melhor, e); arrasto.x = p.x; arrasto.y = p.y; }
    });

    // ---------- inicialização ----------
    cena.aoQualidade = () => {};
    reconstruir(S.Z, S.N);
    aplicar();
    // o mapa é calculado depois do primeiro desenho, para a tela abrir na hora
    setTimeout(() => { prepararImagem(); desenharMapa(); }, 30);
    new ResizeObserver(() => desenharMapa()).observe(mapaCanvas);

    const api = {
      iniciar() {
        cena.iniciar();
        if (pendente) { const p = pendente; pendente = null; definir(p.Z, p.N); }
      },
      parar() { cena.parar(); },
      definir,
    };
    LAB.atomo = api;
    return api;
  }

  LAB.atomoDefinir = (Z, N) => {
    if (LAB.atomo) LAB.atomo.definir(Z, N);
    else pendente = { Z, N };
  };

  LAB.modulos.push({
    id: "atomo",
    nome: "Átomo",
    resumo: "Monte, decaia e divida qualquer átomo",
    cor: "#38b6ff",
    selo: "parcial",
    icone: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-60 12 12)"/></svg>',
    nota: {
      real: [
        "O elemento é definido pelo número de prótons; nêutrons criam isótopos; elétrons criam íons.",
        "Energias de ligação: valores medidos para os núcleos mais conhecidos e a fórmula semi-empírica de massa para os demais.",
        "Meias-vidas e modos de decaimento medidos (cerca de 200 núcleos) e as quatro séries radioativas naturais completas.",
        "Valores Q e a linha de gotejamento (núcleos que não se seguram) saem das energias de ligação.",
      ],
      simplificado: [
        "O átomo não está em escala (o núcleo é ~100 mil vezes menor que o átomo) e os elétrons não são bolinhas: são nuvens de probabilidade.",
        "Meias-vidas de núcleos pouco estudados são estimativas de ordem de grandeza.",
        "A fissão usa uma divisão típica e a energia vem do modelo (o valor real é ~200 MeV).",
        "Os quarks são só uma ilustração: quarks não são esferas coloridas.",
      ],
    },
    criar,
  });
})();
