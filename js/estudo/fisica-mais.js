/*
 * Estudo: Física, ferramentas extras — movimento (MRU/MRUV), forças, óptica,
 * ondas e termologia. Entram na lista da Física (criada em fisica-estudo.js),
 * que é reordenada no fim deste arquivo.
 */
(function () {
  "use strict";
  const LAB = window.LAB;
  const F = window.FCalc;
  const X = window.FCalc2;
  if (!LAB || !LAB.estudo || !F || !X) return;
  const { el, ui } = LAB;
  const E = LAB.estudo;
  const { campo, grade, mostrar, resultadoBox, dicaInicial, debounce } = E;
  const FERR = (E.ferramentas.fisica = E.ferramentas.fisica || []);

  // prática: os tipos novos vão para o motor 2
  const anterior = F.gerarExercicio;
  F.gerarExercicio = (t) => (X.TIPOS.includes(t) ? X.gerarExercicio(t) : anterior(t));

  // ---------- utilidades ----------
  const fmt = (v, s = 3) => E.fmtSig(v, s);
  const g = () => F.config.g;
  const vazio = (res, txt) => { res.innerHTML = ""; res._r = null; res.appendChild(dicaInicial(txt)); };
  const erro = (res, txt) => { res.innerHTML = ""; res._r = null; res.appendChild(el("div", "res-erro", `<b>Hmm:</b> ${txt}`)); };
  const nomeCampo = (c) => (c.el.querySelector(".c-rot") || {}).textContent || "um campo";
  // lê campos: { chave: campo } → { chave: número | null } ou { _erro }
  function ler(cs) {
    const o = {};
    for (const [k, c] of Object.entries(cs)) {
      if (!c) continue;
      if (c.texto() === "") { o[k] = null; continue; }
      const v = c.num();
      if (!isFinite(v)) return { _erro: `não entendi o valor de “${nomeCampo(c)}”. Use vírgula ou ponto (ex.: 9,8 ou 1,2e-5).` };
      o[k] = v;
    }
    return o;
  }
  const ligar = (cs, fn) => { const d = debounce(fn, 220); cs.forEach((c) => { if (!c) return; const i = c.input || c; i.addEventListener(i.tagName === "SELECT" ? "change" : "input", d); if (c.sel) c.sel.addEventListener("change", d); }); };
  const exemplos = (lista, fn) => { const w = el("div", "f2-ex"); w.append(el("small", "f2-rot", "Exemplos:"), ui.chips({ cls: "quebra", itens: lista.map((x, i) => ({ id: String(i), rotulo: x.r })), onClick: (id) => fn(lista[+id]) }).el); return w; };
  const preencher = (cs, vals) => Object.entries(vals).forEach(([k, v]) => { if (cs[k]) cs[k].set(v == null ? "" : String(v).replace(".", ",")); });
  function subAbas(raiz, itens, montar) {
    const area = el("div", "f2-sub");
    const seg = ui.segmentado({ itens, valor: itens[0].id, onChange: (id) => abrir(id) });
    raiz.append(seg.el, area);
    let api = null;
    function abrir(id) { area.innerHTML = ""; api = montar(id, area) || null; }
    abrir(itens[0].id);
    return { recalcular: () => api && api.recalcular && api.recalcular() };
  }
  // gráfico com título; altura proporcional à largura
  const alt = (k, min, max) => (w) => Math.round(Math.min(Math.max(w * k, min), max));
  function caixaGraf(titulo, op) {
    const gr = E.grafico(op);
    const w = el("div", "f2-g");
    if (titulo) w.appendChild(el("p", "f2-gt", titulo));
    w.appendChild(gr.el);
    return { gr, el: w, mostrar(c, o) { w.hidden = false; gr.definir(c, o); }, esconder() { w.hidden = true; } };
  }
  // faixa [mín, máx] de uma função num intervalo, sempre incluindo o zero
  function faixa(f, a, b, extra = []) {
    let lo = 0, hi = 0;
    for (let i = 0; i <= 80; i++) { const y = f(a + ((b - a) * i) / 80); if (isFinite(y)) { lo = Math.min(lo, y); hi = Math.max(hi, y); } }
    extra.forEach((y) => { lo = Math.min(lo, y); hi = Math.max(hi, y); });
    const p = (hi - lo || 1) * 0.12;
    return [lo < 0 ? lo - p : 0, hi > 0 ? hi + p : p];
  }
  const ZERO = { tipo: "hline", v: 0, cor: "#7a8799", largura: 1, legenda: false };

  // =====================================================================
  // 1. Movimento (MRU, MRUV, encontro)
  // =====================================================================
  FERR.push({
    id: "movimento", nome: "Movimento (MRU e MRUV)", prat: "mov",
    resumo: "Posição e velocidade com as equações horárias e Torricelli, gráficos s × t, v × t e a × t e encontro de dois móveis.",
    teoria: `<p>No <b>MRU</b> a velocidade é constante: s = s₀ + v·t. No <b>MRUV</b> a aceleração é constante:</p><div class="eq">s = s₀ + v₀·t + a·t²/2 &nbsp; v = v₀ + a·t &nbsp; v² = v₀² + 2·a·Δs</div><p>No gráfico v × t, a <b>inclinação</b> é a aceleração e a <b>área</b> sob a curva é o deslocamento. Para achar o encontro de dois móveis, iguale as posições: s<sub>A</sub>(t) = s<sub>B</sub>(t).</p>`,
    montar(raiz) {
      return subAbas(raiz, [{ id: "um", rotulo: "Um móvel" }, { id: "enc", rotulo: "Encontro de dois móveis" }], (id, a) => (id === "um" ? montarUm(a) : montarEncontro(a)));
    },
  });
  function montarUm(a) {
    const cs = {
      s0: campo({ rotulo: "Posição inicial s₀", ph: "0", sufixo: "m", valor: "0" }),
      v0: campo({ rotulo: "Velocidade inicial v₀", ph: "Ex.: 20", unidades: ["m/s", "km/h"], unidadePadrao: "m/s", valor: "20" }),
      a: campo({ rotulo: "Aceleração a", ph: "0 no MRU", sufixo: "m/s²", valor: "-5" }),
      t: campo({ rotulo: "Instante t", ph: "Ex.: 4", sufixo: "s", valor: "4" }),
    };
    const ex = exemplos([
      { r: "Carro freando (72 km/h)", v: { s0: 0, v0: 72, a: -5, t: 4 }, u: "km/h" },
      { r: "MRU (5 m/s)", v: { s0: -20, v0: 5, a: 0, t: 10 } },
      { r: "Queda livre por 3 s", v: { s0: 0, v0: 0, a: 9.8, t: 3 } },
      { r: "Sobe, para e volta", v: { s0: 0, v0: 10, a: -2, t: 8 } },
      { r: "Arrancada (0 a 100 km/h)", v: { s0: 0, v0: 0, a: 3.5, t: 8 } },
    ], (e) => { preencher(cs, e.v); cs.v0.sel.value = e.u || "m/s"; calc(); });
    const gS = caixaGraf("Posição × tempo", { modo: "dados", rotX: "t (s)", rotY: "s (m)", altura: alt(0.5, 190, 260), aria: "Gráfico da posição em função do tempo" });
    const gV = caixaGraf("Velocidade × tempo (a área é o deslocamento)", { modo: "dados", rotX: "t (s)", rotY: "v (m/s)", altura: alt(0.5, 190, 260), aria: "Gráfico da velocidade em função do tempo" });
    const gA = caixaGraf("Aceleração × tempo (a área é Δv)", { modo: "dados", rotX: "t (s)", rotY: "a (m/s²)", altura: alt(0.36, 150, 200), aria: "Gráfico da aceleração em função do tempo" });
    const grafs = el("div", "f2-grafs");
    grafs.append(gS.el, gV.el, gA.el);
    const res = resultadoBox();
    a.append(grade(cs.s0, cs.v0, cs.a, cs.t), el("small", "f2-dica", "Escolha um sentido positivo para a trajetória: velocidade ou aceleração contra ele entram com sinal negativo (freando = a com sinal oposto ao de v₀)."), ex, grafs, res);
    function calc() {
      const d = ler(cs);
      if (d._erro) { grafs.hidden = true; return erro(res, d._erro); }
      if (d.v0 == null || d.t == null) { grafs.hidden = true; return vazio(res, "Preencha pelo menos a velocidade inicial e o instante t (s₀ e a valem 0 se ficarem vazios)."); }
      let v0 = d.v0;
      if (cs.v0.unidade() === "km/h") v0 /= 3.6;
      const r = X.passosMovimento({ s0: d.s0 || 0, v0, a: d.a || 0, t: d.t });
      if (r.ok && cs.v0.unidade() === "km/h") r.passos.unshift({ t: "Converta para o SI", h: `<div class="eq">v₀ = ${fmt(d.v0, 4)} km/h ÷ 3,6 = <b>${fmt(v0, 4)}</b> m/s</div>` });
      mostrar(res, r);
      if (!r.ok) { grafs.hidden = true; return; }
      grafs.hidden = false;
      const T = r.t, fs = (x) => r.s0 + r.v0 * x + (r.a * x * x) / 2, fv = (x) => r.v0 + r.a * x, fa = () => r.a;
      const marcas = [{ tipo: "marca", x: 0, y: r.s0, rotulo: "s₀" }, { tipo: "marca", x: T, y: r.s, rotulo: `s = ${fmt(r.s)} m` }];
      if (r.tinv != null) marcas.push({ tipo: "marca", x: r.tinv, y: r.sInv, vazia: true, rotulo: "retorno" });
      gS.mostrar({ x: [0, T], y: faixa(fs, 0, T), nomeX: "t", nomeY: "s", series: [ZERO, { tipo: "funcao", f: fs, dominio: [0, T], rotulo: "s(t)" }, ...marcas] });
      gV.mostrar({ x: [0, T], y: faixa(fv, 0, T), nomeX: "t", nomeY: "v", series: [{ tipo: "area", f: fv, a: 0, b: T, rotulo: `área = Δs = ${fmt(r.ds)} m` }, ZERO, { tipo: "funcao", f: fv, dominio: [0, T], rotulo: "v(t)", cor: "#4da3ff" }, ...(r.tinv != null ? [{ tipo: "marca", x: r.tinv, y: 0, vazia: true, rotulo: "v = 0" }] : [])] });
      gA.mostrar({ x: [0, T], y: faixa(fa, 0, T), nomeX: "t", nomeY: "a", series: [{ tipo: "area", f: fa, a: 0, b: T, cor: "#f0a23c", rotulo: `área = Δv = ${fmt(r.v - r.v0)} m/s` }, ZERO, { tipo: "funcao", f: fa, dominio: [0, T], rotulo: "a(t)", cor: "#f0a23c" }] });
    }
    ligar(Object.values(cs), calc);
    calc();
    return { recalcular: calc };
  }
  function montarEncontro(a) {
    const A = { s: campo({ rotulo: "A: posição inicial", sufixo: "m", valor: "0" }), v: campo({ rotulo: "A: velocidade", sufixo: "m/s", valor: "20" }), a: campo({ rotulo: "A: aceleração", sufixo: "m/s²", valor: "0" }) };
    const B = { s: campo({ rotulo: "B: posição inicial", sufixo: "m", valor: "300" }), v: campo({ rotulo: "B: velocidade", sufixo: "m/s", valor: "-10" }), a: campo({ rotulo: "B: aceleração", sufixo: "m/s²", valor: "0" }) };
    const ex = exemplos([
      { r: "Frente a frente", v: [0, 20, 0, 300, -10, 0] },
      { r: "Perseguição", v: [0, 25, 0, 200, 15, 0] },
      { r: "Carro parte quando a moto passa", v: [0, 0, 2, 0.0001, 10, 0] },
      { r: "Ultrapassa e é ultrapassado", v: [0, 20, -2, 50, 5, 0] },
    ], (e) => { [A.s, A.v, A.a, B.s, B.v, B.a].forEach((c, k) => c.set(String(e.v[k]).replace(".", ","))); calc(); });
    const gr = caixaGraf("Posição × tempo dos dois móveis", { modo: "dados", rotX: "t (s)", rotY: "s (m)", altura: alt(0.55, 220, 320), aria: "Posições dos dois móveis em função do tempo" });
    const res = resultadoBox();
    a.append(grade(A.s, B.s, A.v, B.v, A.a, B.a), el("small", "f2-dica", "Use o mesmo eixo para os dois: quem anda no sentido negativo tem velocidade negativa."), ex, gr.el, res);
    function calc() {
      const d = ler({ sA: A.s, vA: A.v, aA: A.a, sB: B.s, vB: B.v, aB: B.a });
      if (d._erro) { gr.esconder(); return erro(res, d._erro); }
      const p = { sA: d.sA || 0, vA: d.vA || 0, aA: d.aA || 0, sB: d.sB || 0, vB: d.vB || 0, aB: d.aB || 0 };
      const r = X.passosEncontro(p);
      mostrar(res, r);
      const T = r.ok ? (r.t2 || r.t) * 1.3 : 20;
      const fA = (x) => p.sA + p.vA * x + (p.aA * x * x) / 2, fB = (x) => p.sB + p.vB * x + (p.aB * x * x) / 2;
      const yr = faixa((x) => Math.max(fA(x), fB(x)), 0, T, [faixa((x) => Math.min(fA(x), fB(x)), 0, T)[0]]);
      const series = [ZERO, { tipo: "funcao", f: fA, dominio: [0, T], rotulo: "s_A(t)", cor: "#4da3ff" }, { tipo: "funcao", f: fB, dominio: [0, T], rotulo: "s_B(t)", cor: "#f0a23c" }];
      if (r.ok) { series.push({ tipo: "marca", x: r.t, y: r.s, rotulo: `encontro: t = ${fmt(r.t)} s` }); if (r.t2) series.push({ tipo: "marca", x: r.t2, y: fA(r.t2), rotulo: "2º encontro" }); }
      gr.mostrar({ x: [0, T], y: yr, nomeX: "t", nomeY: "s", series });
    }
    ligar([...Object.values(A), ...Object.values(B)], calc);
    calc();
    return { recalcular: calc };
  }

  // =====================================================================
  // 2. Forças (Newton, plano inclinado, atrito, blocos ligados)
  // =====================================================================
  FERR.push({
    id: "forcas", nome: "Forças e leis de Newton", prat: "forcas",
    resumo: "Diagrama de corpo livre, plano inclinado com e sem atrito, bloco puxado em ângulo, atrito estático × cinético e dois blocos ligados por fio.",
    teoria: `<p>Roteiro: <b>isole o corpo</b>, desenhe todas as forças (peso, normal, atrito, trações, forças aplicadas), escolha eixos e aplique a 2ª lei em cada eixo: ΣF<sub>x</sub> = m·a<sub>x</sub>, ΣF<sub>y</sub> = m·a<sub>y</sub>.</p><ul><li>No plano inclinado: P<sub>x</sub> = P·sen θ (ao longo da rampa), P<sub>y</sub> = P·cos θ = N.</li><li>Atrito estático: se ajusta até μ<sub>e</sub>·N. Só se o necessário passar disso o corpo desliza, e aí vale μ<sub>c</sub>·N.</li><li>Fio ideal: mesma tração nas duas pontas e mesma aceleração para os blocos.</li></ul>`,
    montar(raiz) {
      return subAbas(raiz, [{ id: "plano", rotulo: "Plano inclinado" }, { id: "puxado", rotulo: "Bloco puxado" }, { id: "fio", rotulo: "Dois blocos e fio" }], (id, a) => montarForca(id, a));
    },
  });
  function montarForca(modo, a) {
    const mu = { muE: campo({ rotulo: "Atrito estático μe", ph: "0 = sem atrito", valor: "0,5" }), muC: campo({ rotulo: "Atrito cinético μc", ph: "0 = sem atrito", valor: "0,4" }) };
    let cs, lista, fn, dica;
    if (modo === "plano") {
      cs = { m: campo({ rotulo: "Massa", sufixo: "kg", valor: "10" }), th: campo({ rotulo: "Inclinação θ", sufixo: "°", valor: "37" }), ...mu };
      lista = [{ r: "Sem atrito, 30°", v: { m: 2, th: 30, muE: 0, muC: 0 } }, { r: "Desliza com atrito", v: { m: 10, th: 37, muE: 0.5, muC: 0.4 } }, { r: "Fica parado", v: { m: 5, th: 20, muE: 0.5, muC: 0.4 } }, { r: "No limite (tg θ = μe)", v: { m: 4, th: 26.57, muE: 0.5, muC: 0.4 } }];
      fn = (d) => X.passosPlano({ m: d.m, th: d.th ?? 0, muE: d.muE || 0, muC: d.muC || 0, g: g() });
      dica = "O bloco é solto parado na rampa. Para estudar sem atrito, deixe μ = 0 nos dois campos.";
    } else if (modo === "puxado") {
      cs = { m: campo({ rotulo: "Massa", sufixo: "kg", valor: "10" }), F: campo({ rotulo: "Força aplicada F", sufixo: "N", valor: "50" }), phi: campo({ rotulo: "Ângulo de F com a horizontal", sufixo: "°", valor: "37" }), ...mu };
      cs.muE.set("0,3"); cs.muC.set("0,2");
      lista = [{ r: "F = m·a (sem atrito)", v: { m: 4, F: 20, phi: 0, muE: 0, muC: 0 } }, { r: "Puxado a 37°", v: { m: 10, F: 50, phi: 37, muE: 0.3, muC: 0.2 } }, { r: "Força fraca: não sai do lugar", v: { m: 20, F: 50, phi: 0, muE: 0.4, muC: 0.3 } }, { r: "Puxar inclinado ajuda", v: { m: 20, F: 90, phi: 30, muE: 0.5, muC: 0.4 } }];
      fn = (d) => X.passosPuxado({ m: d.m, F: d.F, phi: d.phi || 0, muE: d.muE || 0, muC: d.muC || 0, g: g() });
      dica = "O bloco está parado num piso horizontal. Ângulo 0° = força horizontal.";
    } else {
      cs = { mA: campo({ rotulo: "Massa de A (na mesa)", sufixo: "kg", valor: "3" }), mB: campo({ rotulo: "Massa de B (pendurado)", sufixo: "kg", valor: "2" }), ...mu };
      cs.muE.set("0"); cs.muC.set("0");
      lista = [{ r: "Mesa lisa", v: { mA: 3, mB: 2, muE: 0, muC: 0 } }, { r: "Com atrito 0,1", v: { mA: 4, mB: 1, muE: 0.1, muC: 0.1 } }, { r: "Atrito segura", v: { mA: 10, mB: 2, muE: 0.3, muC: 0.25 } }];
      fn = (d) => X.passosFio({ mA: d.mA, mB: d.mB, muE: d.muE || 0, muC: d.muC || 0, g: g() });
      dica = "Fio e polia ideais (sem massa e sem atrito). O atrito é entre A e a mesa.";
    }
    const ex = exemplos(lista, (e) => { preencher(cs, e.v); calc(); });
    const gr = caixaGraf("Diagrama de corpo livre (forças em newtons)", { modo: "cartesiano", igual: true, rotX: "x (N)", rotY: "y (N)", altura: alt(0.72, 260, 400), aria: "Diagrama de corpo livre com as forças sobre o bloco" });
    const res = resultadoBox();
    a.append(grade(...Object.values(cs)), el("small", "f2-dica", `${dica} g = ${String(g()).replace(".", ",")} m/s² (mude em “Ajustes”).`), ex, gr.el, res);
    function calc() {
      const d = ler(cs);
      if (d._erro) { gr.esconder(); return erro(res, d._erro); }
      const r = fn(d);
      mostrar(res, r);
      if (r.ok) gr.mostrar(r.cena); else gr.esconder();
    }
    ligar(Object.values(cs), calc);
    calc();
    return { recalcular: calc };
  }

  // =====================================================================
  // 3. Óptica (espelhos esféricos e lentes)
  // =====================================================================
  FERR.push({
    id: "optica", nome: "Espelhos e lentes", prat: "optica",
    resumo: "Equação de Gauss, aumento, natureza da imagem e vergência, com o diagrama de raios desenhado.",
    teoria: `<div class="eq">1/f = 1/p + 1/p′ &nbsp;&nbsp; A = i/o = −p′/p &nbsp;&nbsp; V = 1/f (f em metros)</div><ul><li>f &gt; 0: espelho côncavo e lente convergente; f &lt; 0: espelho convexo e lente divergente.</li><li>p′ &gt; 0: imagem real; p′ &lt; 0: virtual. A &gt; 0: direita; A &lt; 0: invertida.</li><li>Raios notáveis: o paralelo ao eixo sai pelo foco; o que passa pelo foco sai paralelo; o que passa pelo centro óptico (ou incide no vértice) é fácil de traçar.</li></ul>`,
    montar(raiz) {
      let tipo = "convergente";
      const seg = ui.segmentado({ itens: [{ id: "convergente", rotulo: "Lente convergente" }, { id: "divergente", rotulo: "Lente divergente" }, { id: "concavo", rotulo: "Espelho côncavo" }, { id: "convexo", rotulo: "Espelho convexo" }], valor: tipo, onChange: (id) => { tipo = id; calc(); } });
      const cs = {
        f: campo({ rotulo: "Distância focal |f|", sufixo: "cm", valor: "10" }),
        p: campo({ rotulo: "Distância do objeto p", sufixo: "cm", valor: "30" }),
        o: campo({ rotulo: "Altura do objeto o", sufixo: "cm", valor: "3" }),
      };
      const ex = exemplos([
        { r: "Lupa", t: "convergente", v: { f: 10, p: 6, o: 2 } },
        { r: "Projetor (imagem grande)", t: "convergente", v: { f: 10, p: 12, o: 2 } },
        { r: "Câmera (objeto longe)", t: "convergente", v: { f: 5, p: 60, o: 6 } },
        { r: "Objeto em 2f", t: "concavo", v: { f: 10, p: 20, o: 3 } },
        { r: "Espelho de maquiagem", t: "concavo", v: { f: 30, p: 15, o: 3 } },
        { r: "Retrovisor", t: "convexo", v: { f: 20, p: 60, o: 6 } },
        { r: "Óculos de miopia", t: "divergente", v: { f: 25, p: 50, o: 4 } },
        { r: "Objeto no foco", t: "concavo", v: { f: 10, p: 10, o: 3 } },
      ], (e) => { tipo = e.t; seg.set(e.t); preencher(cs, e.v); calc(); });
      const gr = caixaGraf("Diagrama de raios", { modo: "cartesiano", rotX: "eixo (cm)", rotY: "y (cm)", altura: alt(0.56, 250, 380), aria: "Diagrama de raios com objeto, imagem, focos e raios notáveis" });
      const res = resultadoBox();
      raiz.append(seg.el, grade(cs.f, cs.p), cs.o.el, el("small", "f2-dica", "Digite |f| sem sinal: o tipo escolhido acima define o sinal. Linhas tracejadas são prolongamentos (imagem virtual)."), ex, gr.el, res);
      function calc() {
        const d = ler(cs);
        if (d._erro) { gr.esconder(); return erro(res, d._erro); }
        if (d.f == null || d.p == null) { gr.esconder(); return vazio(res, "Preencha a distância focal e a distância do objeto."); }
        const r = X.passosOptica({ tipo, f: d.f, p: d.p, o: d.o || 2 });
        mostrar(res, r);
        if (r.ok) gr.mostrar(r.cena); else gr.esconder();
      }
      ligar(Object.values(cs), calc);
      calc();
      return { recalcular: calc };
    },
  });

  // =====================================================================
  // 4. Ondas
  // =====================================================================
  FERR.push({
    id: "ondas", nome: "Ondas e som", prat: "ondas",
    resumo: "v = λ·f e período, ondas em cordas, harmônicos em cordas e tubos, nível sonoro em decibéis e efeito Doppler.",
    teoria: `<div class="eq">v = λ·f &nbsp;&nbsp; T = 1/f &nbsp;&nbsp; v<sub>corda</sub> = √(T/μ)</div><ul><li>Corda presa nas pontas e tubo aberto: f<sub>n</sub> = n·v/(2L), n = 1, 2, 3…</li><li>Tubo fechado numa ponta: f<sub>n</sub> = n·v/(4L), só n ímpar.</li><li>Nível sonoro: β = 10·log(I/I₀), I₀ = 10⁻¹² W/m². +10 dB = intensidade ×10.</li><li>Doppler: f′ = f·(v ± v<sub>o</sub>)/(v ∓ v<sub>f</sub>); aproximação aumenta a frequência.</li></ul>`,
    montar(raiz) {
      return subAbas(raiz, [{ id: "vlf", rotulo: "v = λ·f" }, { id: "corda", rotulo: "Corda" }, { id: "tubo", rotulo: "Tubos" }, { id: "db", rotulo: "Decibéis" }, { id: "dop", rotulo: "Doppler" }], (id, a) => montarOnda(id, a));
    },
  });
  function montarOnda(modo, a) {
    const res = resultadoBox();
    let cs, lista, fn, dica = "", gr, desenhar;
    if (modo === "vlf") {
      cs = { v: campo({ rotulo: "Velocidade v", sufixo: "m/s", valor: "340" }), lam: campo({ rotulo: "Comprimento de onda λ", sufixo: "m", ph: "deixe vazio para calcular" }), f: campo({ rotulo: "Frequência f", sufixo: "Hz", valor: "170" }), A: campo({ rotulo: "Amplitude (só para o desenho)", sufixo: "m", valor: "0,5" }) };
      dica = "Preencha duas das três grandezas (v, λ, f) e deixe a outra vazia.";
      lista = [{ r: "Som a 170 Hz", v: { v: 340, lam: "", f: 170 } }, { r: "Lá de 440 Hz", v: { v: 340, lam: "", f: 440 } }, { r: "Rádio FM 100 MHz", v: { v: 3e8, lam: "", f: 1e8 } }, { r: "Onda no mar", v: { v: "", lam: 20, f: 0.25 } }, { r: "Luz verde (550 nm)", v: { v: 3e8, lam: 5.5e-7, f: "" } }];
      fn = (d) => X.passosOnda({ v: d.v, lam: d.lam, f: d.f });
      gr = caixaGraf("Forma da onda num instante (y × x)", { modo: "cartesiano", rotX: "x (m)", rotY: "y (m)", altura: alt(0.45, 200, 280), aria: "Onda senoidal com o comprimento de onda e a amplitude marcados" });
      desenhar = (r, d) => {
        const A = d.A > 0 ? d.A : 1, L = r.lam, k = (2 * Math.PI) / L;
        gr.mostrar({ x: [0, 2.25 * L], y: [-1.7 * A, 1.7 * A], nomeX: "x", nomeY: "y", series: [
          { tipo: "funcao", f: (x) => A * Math.sin(k * x), rotulo: "y(x)", cor: "#4da3ff" },
          { tipo: "seg", de: [L / 4, 1.3 * A], para: [(5 * L) / 4, 1.3 * A], rotulo: `λ = ${fmt(L)} m`, cor: "#f2c14e", largura: 2 },
          { tipo: "seg", de: [L / 4, 1.15 * A], para: [L / 4, 1.45 * A], cor: "#f2c14e", legenda: false },
          { tipo: "seg", de: [(5 * L) / 4, 1.15 * A], para: [(5 * L) / 4, 1.45 * A], cor: "#f2c14e", legenda: false },
          { tipo: "seg", de: [(7 * L) / 4, 0], para: [(7 * L) / 4, -A], rotulo: `A = ${fmt(A)} m`, cor: "#f0a23c", largura: 2 },
          { tipo: "marca", x: L / 4, y: A, vazia: true }, { tipo: "marca", x: (5 * L) / 4, y: A, vazia: true },
        ] });
      };
    } else if (modo === "corda") {
      cs = { Tr: campo({ rotulo: "Tração T", sufixo: "N", valor: "100" }), mu: campo({ rotulo: "Densidade linear μ", sufixo: "kg/m", valor: "0,01" }), L: campo({ rotulo: "Comprimento L", sufixo: "m", valor: "0,5" }), nh: campo({ rotulo: "Harmônico n", ph: "1, 2, 3…", valor: "1" }) };
      lista = [{ r: "Fundamental", v: { Tr: 100, mu: 0.01, L: 0.5, nh: 1 } }, { r: "3º harmônico", v: { Tr: 100, mu: 0.01, L: 0.5, nh: 3 } }, { r: "Corda de violão (Mi grave)", v: { Tr: 70, mu: 0.0064, L: 0.65, nh: 1 } }];
      fn = (d) => X.passosCorda({ Tr: d.Tr, mu: d.mu, L: d.L, nh: d.nh == null ? 1 : d.nh });
      dica = "Corda presa nas duas pontas. μ = massa ÷ comprimento (ex.: 5 g em 0,5 m → 0,01 kg/m).";
      gr = caixaGraf("Onda estacionária na corda", { modo: "cartesiano", rotX: "x (m)", rotY: "y", altura: alt(0.38, 180, 240), aria: "Onda estacionária com nós e ventres" });
      desenhar = (r) => {
        const L = r.L, k = (r.nh * Math.PI) / L, series = [];
        [1, 0.5, -0.5, -1].forEach((c, j) => series.push({ tipo: "funcao", f: (x) => c * Math.sin(k * x), dominio: [0, L], cor: j === 0 ? "#4da3ff" : "rgba(77,163,255,.35)", largura: j === 0 ? 2.4 : 1.4, rotulo: j === 0 ? `${r.nh}º harmônico: ${fmt(r.f)} Hz` : undefined, legenda: j === 0 }));
        for (let i = 0; i <= r.nh; i++) series.push({ tipo: "marca", x: (i * L) / r.nh, y: 0, rotulo: i === 0 ? "nó" : undefined });
        gr.mostrar({ x: [-0.05 * L, 1.05 * L], y: [-1.6, 1.6], nomeX: "x", nomeY: "y", series });
      };
    } else if (modo === "tubo") {
      let fechado = false;
      const seg = ui.segmentado({ itens: [{ id: "a", rotulo: "Aberto nas duas pontas" }, { id: "f", rotulo: "Fechado numa ponta" }], valor: "a", onChange: (id) => { fechado = id === "f"; calc(); } });
      a.appendChild(seg.el);
      cs = { L: campo({ rotulo: "Comprimento do tubo L", sufixo: "m", valor: "0,85" }), v: campo({ rotulo: "Velocidade do som", sufixo: "m/s", valor: "340" }), nh: campo({ rotulo: "Harmônico n", ph: "1, 2, 3…", valor: "1" }) };
      lista = [{ r: "Flauta (aberto, 0,6 m)", v: { L: 0.6, v: 340, nh: 1 }, fe: false }, { r: "Garrafa (fechado, 0,25 m)", v: { L: 0.25, v: 340, nh: 1 }, fe: true }, { r: "Fechado, 3º harmônico", v: { L: 0.85, v: 340, nh: 3 }, fe: true }];
      fn = (d) => X.passosTubo({ L: d.L, v: d.v == null ? 340 : d.v, nh: d.nh == null ? 1 : d.nh, fechado });
      dica = "No tubo fechado só existem harmônicos ímpares. O desenho mostra a amplitude de vibração do ar.";
      gr = caixaGraf("Vibração do ar dentro do tubo", { modo: "cartesiano", rotX: "x (m)", rotY: "", altura: alt(0.36, 170, 230), aria: "Padrão de vibração do ar no tubo" });
      desenhar = (r) => {
        const L = r.L, f = r.fechado ? (x) => Math.sin((r.nh * Math.PI * x) / (2 * L)) : (x) => Math.cos((r.nh * Math.PI * x) / L);
        const series = [
          { tipo: "seg", de: [0, 1.25], para: [L, 1.25], cor: "#9ba7b6", largura: 3, legenda: false },
          { tipo: "seg", de: [0, -1.25], para: [L, -1.25], cor: "#9ba7b6", largura: 3, legenda: false },
          { tipo: "funcao", f, dominio: [0, L], cor: "#4da3ff", rotulo: `${r.nh}º harmônico: ${fmt(r.f)} Hz` },
          { tipo: "funcao", f: (x) => -f(x), dominio: [0, L], cor: "#4da3ff", legenda: false },
        ];
        if (r.fechado) series.push({ tipo: "seg", de: [0, -1.25], para: [0, 1.25], cor: "#9ba7b6", largura: 4, legenda: false });
        gr.mostrar({ x: [-0.06 * L, 1.06 * L], y: [-1.7, 1.7], nomeX: "x", nomeY: "amplitude", series });
      };
      a._tubo = (fe) => { fechado = fe; seg.set(fe ? "f" : "a"); };
    } else if (modo === "db") {
      let entrada = "I";
      const seg = ui.segmentado({ itens: [{ id: "I", rotulo: "Tenho a intensidade" }, { id: "b", rotulo: "Tenho o nível em dB" }], valor: "I", onChange: (id) => { entrada = id; cs.I.el.hidden = id !== "I"; cs.beta.el.hidden = id === "I"; calc(); } });
      a.appendChild(seg.el);
      cs = { I: campo({ rotulo: "Intensidade I", sufixo: "W/m²", valor: "1e-5" }), beta: campo({ rotulo: "Nível sonoro β", sufixo: "dB", valor: "85" }) };
      cs.beta.el.hidden = true;
      lista = [{ r: "10⁻⁵ W/m²", v: { I: "1e-5" }, e: "I" }, { r: "Show: 1 W/m²", v: { I: 1 }, e: "I" }, { r: "Conversa: 60 dB", v: { beta: 60 }, e: "b" }, { r: "Fone alto: 100 dB", v: { beta: 100 }, e: "b" }];
      fn = (d) => (entrada === "I" ? X.passosDecibel({ I: d.I }) : X.passosDecibel({ beta: d.beta }));
      dica = "Escreva potências de dez como 1e-5 (= 10⁻⁵).";
      gr = caixaGraf("Comparação com sons do dia a dia (dB)", { modo: "dados", leitura: false, rotX: "", rotY: "nível (dB)", altura: alt(0.45, 200, 270), aria: "Barras com níveis sonoros de referência" });
      const REF = [["limiar", 0], ["sussurro", 30], ["conversa", 60], ["trânsito", 85], ["show", 110], ["dor", 130]];
      desenhar = (r) => {
        const b = Math.max(Math.min(r.beta, 180), -10);
        const series = [{ tipo: "barras", barras: REF.map(([, v], k) => ({ a: k + 0.15, b: k + 0.85, v })), cor: "#7a8799", rotulo: "referências", leitura: false }, { tipo: "barras", barras: [{ a: 6.15, b: 6.85, v: b }], cor: "#4da3ff", rotulo: `seu som: ${fmt(r.beta)} dB` }];
        REF.forEach(([t, v], k) => series.push({ tipo: "texto", x: k + 0.5, y: v + 9, texto: t, cor: "#9ba7b6" }));
        series.push({ tipo: "texto", x: 6.5, y: b + 9, texto: "seu som", cor: "#4da3ff" });
        gr.mostrar({ x: [0, 7], y: [Math.min(0, b) - 5, Math.max(145, b + 18)], series });
      };
      a._db = (e) => { entrada = e; seg.set(e); cs.I.el.hidden = e !== "I"; cs.beta.el.hidden = e === "I"; };
    } else {
      cs = { f: campo({ rotulo: "Frequência emitida f", sufixo: "Hz", valor: "500" }), v: campo({ rotulo: "Velocidade do som v", sufixo: "m/s", valor: "340" }), vf: campo({ rotulo: "Fonte (+ aproxima, − afasta)", sufixo: "m/s", valor: "20" }), vo: campo({ rotulo: "Observador (+ aproxima, − afasta)", sufixo: "m/s", valor: "0" }) };
      lista = [{ r: "Ambulância chegando", v: { f: 500, v: 340, vf: 20, vo: 0 } }, { r: "Ambulância indo embora", v: { f: 500, v: 340, vf: -20, vo: 0 } }, { r: "Ciclista vai até a sirene", v: { f: 1000, v: 340, vf: 0, vo: 17 } }, { r: "Os dois se aproximam", v: { f: 680, v: 340, vf: 20, vo: 20 } }];
      fn = (d) => X.passosDoppler({ f: d.f, v: d.v == null ? 340 : d.v, vf: d.vf || 0, vo: d.vo || 0 });
      dica = "Velocidades em relação ao ar. Sinal +: aproximando-se do outro; sinal −: afastando-se.";
      gr = caixaGraf("Frentes de onda (fonte em movimento)", { modo: "cartesiano", igual: true, rotX: "", rotY: "", altura: alt(0.55, 220, 320), aria: "Frentes de onda circulares emitidas por uma fonte em movimento" });
      desenhar = (r) => {
        const beta = Math.max(Math.min(r.vf / r.v, 0.95), -0.95), series = [];
        for (let k = 1; k <= 6; k++) series.push({ tipo: "circulo", c: [-beta * k, 0], r: k, cor: `rgba(77,163,255,${0.9 - k * 0.11})` });
        series.push({ tipo: "marca", x: 0, y: 0, rotulo: "fonte", cor: "#f0a23c" }, { tipo: "marca", x: 8, y: 0, rotulo: "observador", cor: "#5cc98a" });
        if (Math.abs(beta) > 0.01) series.push({ tipo: "vetor", de: [0, 0], para: [beta * 4, 0], cor: "#f0a23c", rotulo: "v fonte" });
        if (Math.abs(r.vo) > 0.01) series.push({ tipo: "vetor", de: [8, 0], para: [8 - (Math.max(Math.min(r.vo / r.v, 0.95), -0.95)) * 4, 0], cor: "#5cc98a", rotulo: "v obs." });
        gr.mostrar({ x: [-7.5, 9.5], y: [-6.8, 6.8], nomeX: "x", nomeY: "y", series });
      };
    }
    const ex = exemplos(lista, (e) => { if (a._tubo) a._tubo(e.fe); if (a._db) a._db(e.e); preencher(cs, e.v); calc(); });
    a.append(grade(...Object.values(cs)), el("small", "f2-dica", dica), ex, gr.el, res);
    function calc() {
      const d = ler(cs);
      if (d._erro) { gr.esconder(); return erro(res, d._erro); }
      if (d.nh != null && !Number.isInteger(d.nh)) { gr.esconder(); return erro(res, "o número do harmônico deve ser inteiro (1, 2, 3…)."); }
      const r = fn(d);
      mostrar(res, r);
      if (r.ok) desenhar(r, d); else gr.esconder();
    }
    ligar(Object.values(cs), calc);
    calc();
    return { recalcular: calc };
  }

  // =====================================================================
  // 5. Termologia
  // =====================================================================
  FERR.push({
    id: "termologia", nome: "Calor e temperatura", prat: "termo",
    resumo: "Escalas °C, °F e K, calor sensível e latente com a curva de aquecimento da água, misturas (inclusive com gelo) e dilatação.",
    teoria: `<div class="eq">T<sub>C</sub>/5 = (T<sub>F</sub> − 32)/9 = (T<sub>K</sub> − 273,15)/5</div><ul><li>Calor sensível (muda a temperatura): Q = m·c·ΔT.</li><li>Calor latente (muda a fase, temperatura constante): Q = m·L. Água: L<sub>f</sub> = 80 cal/g, L<sub>v</sub> = 540 cal/g.</li><li>Recipiente isolado: ΣQ = 0. Com gelo, primeiro descubra se ele derrete todo.</li><li>Dilatação: ΔL = L₀·α·ΔT; β = 2α; γ = 3α.</li></ul>`,
    montar(raiz) {
      return subAbas(raiz, [{ id: "esc", rotulo: "Escalas" }, { id: "curva", rotulo: "Curva de aquecimento" }, { id: "mist", rotulo: "Misturas" }, { id: "gelo", rotulo: "Gelo + água" }, { id: "dil", rotulo: "Dilatação" }], (id, a) => montarTermo(id, a));
    },
  });
  function montarTermo(modo, a) {
    const res = resultadoBox();
    let cs, lista, fn, dica = "", gr, desenhar, extra = null;
    if (modo === "esc") {
      let de = "C";
      const seg = ui.segmentado({ itens: [{ id: "C", rotulo: "°C" }, { id: "F", rotulo: "°F" }, { id: "K", rotulo: "K" }], valor: "C", onChange: (id) => { de = id; calc(); } });
      cs = { valor: campo({ rotulo: "Temperatura", valor: "37" }) };
      extra = el("div", "f2-linha"); extra.append(cs.valor.el, seg.el);
      lista = [{ r: "Corpo humano (98,6 °F)", v: { valor: 98.6 }, d: "F" }, { r: "−40 (igual em °C e °F)", v: { valor: -40 }, d: "C" }, { r: "Nitrogênio líquido (77 K)", v: { valor: 77 }, d: "K" }, { r: "Zero absoluto", v: { valor: 0 }, d: "K" }, { r: "Forno a 180 °C", v: { valor: 180 }, d: "C" }];
      fn = (d) => X.passosEscala({ valor: d.valor, de });
      a._esc = (x) => { de = x; seg.set(x); };
      gr = caixaGraf("Fahrenheit em função de Celsius", { modo: "dados", rotX: "T (°C)", rotY: "T (°F)", altura: alt(0.45, 200, 270), aria: "Reta de conversão de Celsius para Fahrenheit" });
      desenhar = (r) => {
        const a0 = Math.min(-50, r.C - 20), b0 = Math.max(110, r.C + 20);
        gr.mostrar({ x: [a0, b0], y: faixa((c) => 1.8 * c + 32, a0, b0), nomeX: "°C", nomeY: "°F", series: [ZERO, { tipo: "funcao", f: (c) => 1.8 * c + 32, dominio: [a0, b0], rotulo: "T_F = 1,8·T_C + 32", cor: "#4da3ff" }, { tipo: "marca", x: 0, y: 32, vazia: true, rotulo: "água congela" }, { tipo: "marca", x: 100, y: 212, vazia: true, rotulo: "ferve" }, { tipo: "marca", x: r.C, y: r.F, rotulo: `${fmt(r.C)} °C = ${fmt(r.F)} °F` }] });
      };
    } else if (modo === "curva") {
      cs = { m: campo({ rotulo: "Massa de água", sufixo: "g", valor: "100" }), Ti: campo({ rotulo: "Temperatura inicial", sufixo: "°C", valor: "-20" }), Tf: campo({ rotulo: "Temperatura final", sufixo: "°C", valor: "120" }) };
      lista = [{ r: "Gelo a −20 °C → vapor a 120 °C", v: { m: 100, Ti: -20, Tf: 120 } }, { r: "Derreter gelo e aquecer a 30 °C", v: { m: 200, Ti: -10, Tf: 30 } }, { r: "Ferver a água de 20 °C", v: { m: 500, Ti: 20, Tf: 100 } }, { r: "Esfriar água até virar gelo", v: { m: 100, Ti: 25, Tf: -5 } }];
      fn = (d) => X.passosAquecimento({ m: d.m, Ti: d.Ti, Tf: d.Tf });
      dica = "A 1 atm. Em 100 °C considero a água toda vaporizada se a temperatura final passar de 100 °C.";
      gr = caixaGraf("Curva de aquecimento: T × Q", { modo: "dados", rotX: "Q (kcal)", rotY: "T (°C)", altura: alt(0.55, 220, 320), aria: "Curva de aquecimento da água com patamares de fusão e ebulição" });
      desenhar = (r) => {
        const cores = { gelo: "#7fd0ff", "fusão": "#f2c14e", "água": "#4da3ff", "ebulição": "#f0a23c", vapor: "#e5646e" };
        const series = [{ tipo: "hline", v: 0, cor: "#7a8799", largura: 1, tracejado: true, legenda: false }, { tipo: "hline", v: 100, cor: "#7a8799", largura: 1, tracejado: true, legenda: false }];
        let acc = 0;
        r.trechos.forEach((t) => { const q0 = acc / 1000; acc += t.Q; series.push({ tipo: "linha", pts: [[q0, t.t0], [acc / 1000, t.t1]], cor: cores[t.fase], rotulo: t.fase, largura: 3 }); });
        series.push({ tipo: "marca", x: 0, y: r.pts[0][1] }, { tipo: "marca", x: r.Qt / 1000, y: r.pts[r.pts.length - 1][1] });
        const ys = r.pts.map((p) => p[1]);
        const lo = Math.min(...ys, 0), hi = Math.max(...ys, 0);
        gr.mostrar({ x: [0, (r.Qt / 1000) * 1.04], y: [lo - (hi - lo) * 0.1 - 2, hi + (hi - lo) * 0.12 + 2], nomeX: "Q (kcal)", nomeY: "T (°C)", series });
      };
    } else if (modo === "mist") {
      const sub = "₀₁₂₃";
      const corpo = (k, m, c, T) => ({ [`m${k}`]: campo({ rotulo: `m${sub[k]} (g)`, valor: m, ph: k === 3 ? "opcional" : "" }), [`c${k}`]: campo({ rotulo: `c${sub[k]} (cal/g·°C)`, valor: c }), [`T${k}`]: campo({ rotulo: `T${sub[k]} (°C)`, valor: T }) });
      cs = { ...corpo(1, "200", "1", "20"), ...corpo(2, "100", "1", "80"), ...corpo(3, "", "", "") };
      extra = el("div", "campos f2-tres"); Object.values(cs).forEach((c) => extra.appendChild(c.el));
      lista = [{ r: "Água fria + água quente", v: { m1: 200, c1: 1, T1: 20, m2: 100, c2: 1, T2: 80, m3: "", c3: "", T3: "" } }, { r: "Ferro quente na água", v: { m1: 400, c1: 1, T1: 20, m2: 200, c2: 0.11, T2: 100, m3: "", c3: "", T3: "" } }, { r: "Calorímetro de alumínio", v: { m1: 300, c1: 1, T1: 20, m2: 100, c2: 0.22, T2: 20, m3: 150, c3: 0.093, T3: 150 } }];
      fn = (d) => X.passosMistura({ corpos: [1, 2, 3].map((k) => ({ m: d[`m${k}`], c: d[`c${k}`], T: d[`T${k}`] })).filter((c, k) => k < 2 || c.m != null) });
      dica = "Sem mudança de fase (para gelo, use a aba “Gelo + água”). Água: c = 1; alumínio 0,22; ferro 0,11; cobre 0,093 cal/(g·°C). O corpo 3 é opcional.";
      gr = caixaGraf("Cada corpo vai da sua temperatura até T_e", { modo: "dados", rotX: "corpo", rotY: "T (°C)", altura: alt(0.45, 200, 270), aria: "Temperaturas iniciais e de equilíbrio" });
      desenhar = (r, d) => {
        const Ts = [1, 2, 3].map((k) => d[`T${k}`]).filter((x, k) => k < 2 || d[`m${k + 1}`] != null);
        const series = [{ tipo: "hline", v: r.Te, cor: "#f2c14e", rotulo: `T_e = ${fmt(r.Te)} °C`, tracejado: true }];
        Ts.forEach((T, k) => { const cor = T > r.Te ? "#e5646e" : "#4da3ff"; series.push({ tipo: "marca", x: k + 1, y: T, cor }); if (Math.abs(T - r.Te) > 1e-9) series.push({ tipo: "vetor", de: [k + 1, T], para: [k + 1, r.Te], cor, rotulo: T > r.Te ? "cede calor" : "recebe calor", legenda: false }); });
        const lo = Math.min(...Ts, r.Te), hi = Math.max(...Ts, r.Te), p = (hi - lo || 10) * 0.15;
        gr.mostrar({ x: [0.4, Ts.length + 0.6], y: [Math.min(lo - p, 0), hi + p], nomeX: "corpo", nomeY: "T", series });
      };
    } else if (modo === "gelo") {
      cs = { ma: campo({ rotulo: "Massa de água", sufixo: "g", valor: "200" }), Ta: campo({ rotulo: "Temperatura da água", sufixo: "°C", valor: "60" }), mg: campo({ rotulo: "Massa de gelo", sufixo: "g", valor: "50" }), Tg: campo({ rotulo: "Temperatura do gelo", sufixo: "°C", valor: "-10" }) };
      lista = [{ r: "Gelo derrete todo", v: { ma: 200, Ta: 60, mg: 50, Tg: -10 } }, { r: "Sobra gelo", v: { ma: 100, Ta: 20, mg: 100, Tg: -10 } }, { r: "Gelo no refrigerante", v: { ma: 300, Ta: 25, mg: 60, Tg: -5 } }, { r: "Água congela em parte", v: { ma: 50, Ta: 5, mg: 100, Tg: -40 } }];
      fn = (d) => X.passosGelo({ ma: d.ma, Ta: d.Ta, mg: d.mg, Tg: d.Tg });
      dica = "Recipiente isolado e de capacidade térmica desprezível; a 1 atm.";
      gr = caixaGraf("Quem pede e quem pode ceder calor (até 0 °C)", { modo: "dados", leitura: false, rotX: "", rotY: "Q (cal)", altura: alt(0.45, 200, 270), aria: "Barras comparando os calores envolvidos" });
      desenhar = (r) => {
        const series = [
          { tipo: "barras", barras: [{ a: 0.15, b: 0.85, v: r.Q1 }], cor: "#7fd0ff", rotulo: "aquecer o gelo a 0 °C" },
          { tipo: "barras", barras: [{ a: 0.15, b: 0.85, v: r.Q1 + r.Q2 }], cor: "#4da3ff", rotulo: "+ derreter todo o gelo" },
          { tipo: "barras", barras: [{ a: 1.15, b: 1.85, v: r.Qa + 80 * cs.ma.num() }], cor: "#e5646e", rotulo: "+ congelar toda a água" },
          { tipo: "barras", barras: [{ a: 1.15, b: 1.85, v: r.Qa }], cor: "#f0a23c", rotulo: "água esfriando até 0 °C" },
          { tipo: "texto", x: 0.5, y: (r.Q1 + r.Q2) * 1.08 + 1, texto: "gelo pede", cor: "#9ba7b6" },
          { tipo: "texto", x: 1.5, y: (r.Qa + 80 * cs.ma.num()) * 1.06 + 1, texto: "água pode ceder", cor: "#9ba7b6" },
        ];
        gr.mostrar({ x: [0, 2], y: [0, Math.max(r.Q1 + r.Q2, r.Qa + 80 * cs.ma.num()) * 1.22 + 1], series });
      };
    } else {
      let dim = 1;
      const seg = ui.segmentado({ itens: [{ id: "1", rotulo: "Linear" }, { id: "2", rotulo: "Superficial" }, { id: "3", rotulo: "Volumétrica" }], valor: "1", onChange: (id) => { dim = +id; calc(); } });
      a.appendChild(seg.el);
      cs = { X0: campo({ rotulo: "Tamanho inicial (L₀, A₀ ou V₀)", ph: "Ex.: 10", valor: "10" }), alfa: campo({ rotulo: "Coeficiente linear α", sufixo: "°C⁻¹", valor: "1,2e-5" }), dT: campo({ rotulo: "Variação de temperatura ΔT", sufixo: "°C", valor: "50" }) };
      lista = [{ r: "Trilho de aço de 10 m", v: { X0: 10, alfa: "1,2e-5", dT: 50 }, d: 1 }, { r: "Ponte de concreto de 100 m", v: { X0: 100, alfa: "1,2e-5", dT: 40 }, d: 1 }, { r: "Chapa de alumínio 2 m²", v: { X0: 2, alfa: "2,4e-5", dT: 100 }, d: 2 }, { r: "Tanque de 1000 L (aço)", v: { X0: 1000, alfa: "1,2e-5", dT: 30 }, d: 3 }];
      fn = (d) => X.passosDilatacao({ X0: d.X0, alfa: d.alfa, dT: d.dT, dim });
      dica = "α típicos (°C⁻¹): aço 1,2e-5; alumínio 2,4e-5; cobre 1,7e-5; vidro comum 9e-6. A resposta sai na mesma unidade do tamanho inicial.";
      a._dil = (x) => { dim = x; seg.set(String(x)); };
      gr = caixaGraf("Variação de tamanho × variação de temperatura", { modo: "dados", rotX: "ΔT (°C)", rotY: "variação", altura: alt(0.42, 190, 250), aria: "Reta da dilatação em função da variação de temperatura" });
      desenhar = (r, d) => {
        const k = d.X0 * dim * d.alfa, a0 = Math.min(0, d.dT * 1.3), b0 = Math.max(0, d.dT * 1.3) || 1;
        gr.mostrar({ x: [a0, b0], y: faixa((x) => k * x, a0, b0), nomeX: "ΔT", nomeY: "Δ", series: [ZERO, { tipo: "funcao", f: (x) => k * x, dominio: [a0, b0], rotulo: "dilatação ∝ ΔT", cor: "#4da3ff" }, { tipo: "marca", x: d.dT, y: r.dX, rotulo: `${fmt(r.dX)}` }] });
      };
    }
    const ex = exemplos(lista, (e) => { if (a._esc && e.d) a._esc(e.d); if (a._dil && e.d) a._dil(e.d); preencher(cs, e.v); calc(); });
    a.append(extra || grade(...Object.values(cs)), ...(dica ? [el("small", "f2-dica", dica)] : []), ex, gr.el, res);
    function calc() {
      const d = ler(cs);
      if (d._erro) { gr.esconder(); return erro(res, d._erro); }
      const r = fn(d);
      mostrar(res, r);
      if (r.ok) desenhar(r, d); else gr.esconder();
    }
    ligar(Object.values(cs), calc);
    calc();
    return { recalcular: calc };
  }

  // ---------- ordem final das ferramentas da Física ----------
  const ORDEM = ["movimento", "lancamento", "forcas", "formulas", "circuitos", "ondas", "optica", "termologia", "conversor", "formulario"];
  const pos = (f) => { const i = ORDEM.indexOf(f.id); return i < 0 ? ORDEM.length : i; };
  FERR.sort((p, q) => pos(p) - pos(q));
})();
