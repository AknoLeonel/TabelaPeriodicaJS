/*
 * Motor de física, parte 2: movimento (MRU/MRUV e encontro), forças (Newton, plano
 * inclinado, atrito, blocos ligados), óptica geométrica (espelhos e lentes),
 * ondas (v = λf, cordas, tubos, decibéis, Doppler) e termologia (escalas, calor,
 * curva de aquecimento, misturas com gelo, dilatação).
 * Funções puras (testáveis em Node). Cada uma devolve { ok, passos, resposta,
 * respostaHTML, valor, ... } ou { ok: false, erro }. Textos em português.
 */
(function (raiz) {
  "use strict";
  const NODE = typeof module !== "undefined" && module.exports;
  const Q = NODE ? require("./quimica-calc.js") : raiz.QCalc;
  const F1 = NODE ? (() => { try { return require("./fisica-calc.js"); } catch (_e) { return null; } })() : raiz.FCalc;
  const { lerNumero } = Q;
  const PI = Math.PI;
  const gPadrao = () => (F1 && F1.config && F1.config.g) || 9.8;

  const R = (t, h) => ({ t, h });
  const frac = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
  const eqH = (h) => `<div class="eq">${h}</div>`;
  const limpa = (x) => (Math.abs(x) < 1e-12 ? 0 : x);
  const n = (x, s = 4) => Q.num(limpa(x), s).replace(/-/g, "−");
  const par = (x) => (limpa(x) < 0 ? `(${n(x)})` : n(x));
  const sg = (x) => (limpa(x) < 0 ? `− ${n(-x)}` : `+ ${n(x)}`);
  const rad = (d) => (d * PI) / 180;
  const fin = (...xs) => xs.every((x) => typeof x === "number" && isFinite(x));
  const COR = { P: "#e5646e", N: "#4da3ff", Fat: "#f0a23c", F: "#5cc98a", T: "#c58af9", comp: "#9ba7b6", corpo: "#7a8799" };

  // ===========================================================================
  // 1. Movimento: MRU, MRUV e encontro
  // ===========================================================================
  function passosMovimento({ s0 = 0, v0, a = 0, t }) {
    if (!fin(s0, v0, a, t)) return { ok: false, erro: "Preencha s₀, v₀, a e t com números (use 0 quando não houver)." };
    if (!(t > 0)) return { ok: false, erro: "O instante t precisa ser maior que zero." };
    if (t > 1e6 || Math.abs(v0) > 1e8 || Math.abs(a) > 1e8) return { ok: false, erro: "Valores grandes demais para este modelo." };
    const s = s0 + v0 * t + (a * t * t) / 2, v = v0 + a * t, ds = s - s0;
    const mru = a === 0;
    const tinv = !mru && v0 * a < 0 ? -v0 / a : null;
    const inverte = tinv != null && tinv < t - 1e-12;
    const sInv = inverte ? s0 + v0 * tinv + (a * tinv * tinv) / 2 : null;
    const dist = inverte ? Math.abs(sInv - s0) + Math.abs(s - sInv) : Math.abs(ds);
    const passos = [];
    let tipoTxt;
    if (mru) tipoTxt = v0 === 0 ? `<p>Velocidade e aceleração nulas: o corpo está em <b>repouso</b> na posição ${n(s0)} m.</p>` : `<p>A aceleração é zero, então a velocidade não muda: é um <b>movimento retilíneo uniforme (MRU)</b>. A posição muda sempre ${n(Math.abs(v0))} m a cada segundo, ${v0 > 0 ? "no sentido positivo da trajetória (movimento progressivo)" : "no sentido negativo da trajetória (movimento retrógrado)"}.</p>`;
    else tipoTxt = `<p>A aceleração é constante e diferente de zero: é um <b>movimento retilíneo uniformemente variado (MRUV)</b>. ${v0 === 0 ? "O móvel parte do repouso e ganha velocidade." : v0 * a > 0 ? "No início, velocidade e aceleração têm o mesmo sinal: o movimento é <b>acelerado</b> (a rapidez aumenta)." : "No início, velocidade e aceleração têm sinais opostos: o movimento é <b>retardado</b> (o móvel está freando)."}</p>`;
    passos.push(R("Que movimento é este?", tipoTxt + `<p>Dados no SI: s₀ = ${n(s0)} m, v₀ = ${n(v0)} m/s, a = ${n(a)} m/s², t = ${n(t)} s.</p>`));
    passos.push(R("Monte as equações horárias", mru
      ? `<p>No MRU a posição cresce linearmente com o tempo:</p>${eqH("s(t) = s₀ + v·t")}${eqH(`s(t) = ${n(s0)} ${sg(v0)}·t &nbsp; (SI)`)}`
      : `<p>No MRUV a posição é um polinômio do 2º grau no tempo e a velocidade é uma reta:</p>${eqH(`s(t) = s₀ + v₀·t + ${frac("a", "2")}·t²`)}${eqH(`s(t) = ${n(s0)} ${sg(v0)}·t ${sg(a / 2)}·t²`)}${eqH(`v(t) = v₀ + a·t = ${n(v0)} ${sg(a)}·t`)}<p>O coeficiente de t² é a/2 = ${n(a / 2)}: é aí que muita gente erra, esquecendo de dividir a aceleração por 2.</p>`));
    passos.push(R(`Posição em t = ${n(t)} s`, mru
      ? `${eqH(`s = ${n(s0)} + ${par(v0)}·${par(t)} = <b>${n(s)}</b> m`)}<p>Deslocamento: Δs = s − s₀ = ${n(ds)} m.</p>`
      : `${eqH(`s = ${n(s0)} + ${par(v0)}·${par(t)} + ${frac(par(a), "2")}·${par(t)}² = ${n(s0)} ${sg(v0 * t)} ${sg((a * t * t) / 2)} = <b>${n(s)}</b> m`)}<p>Deslocamento: Δs = s − s₀ = ${n(ds)} m.</p>`));
    if (!mru) {
      passos.push(R(`Velocidade em t = ${n(t)} s`, `${eqH(`v = ${n(v0)} + ${par(a)}·${par(t)} = <b>${n(v)}</b> m/s`)}${v * v0 < 0 ? `<p>O sinal mudou: o móvel agora anda no sentido ${v > 0 ? "positivo" : "negativo"}.</p>` : ""}`));
      passos.push(R("Confira com Torricelli (equação sem o tempo)", `<p>Torricelli liga velocidades e deslocamento sem passar pelo tempo; serve de conferência:</p>${eqH("v² = v₀² + 2·a·Δs")}${eqH(`v² = ${par(v0)}² + 2·${par(a)}·${par(ds)} = ${n(v0 * v0)} ${sg(2 * a * ds)} = ${n(v0 * v0 + 2 * a * ds)}`)}${eqH(`|v| = √${n(Math.max(v0 * v0 + 2 * a * ds, 0))} = ${n(Math.sqrt(Math.max(v0 * v0 + 2 * a * ds, 0)))} m/s ✓`)}`));
    }
    if (inverte) passos.push(R("O móvel para e volta", `<p>Como v₀ e a têm sinais opostos, a velocidade zera antes de t = ${n(t)} s:</p>${eqH(`0 = ${n(v0)} ${sg(a)}·t → t<sub>inv</sub> = ${frac(n(-v0), n(a))} = <b>${n(tinv)}</b> s`)}<p>Nesse instante a posição é s = ${n(sInv)} m (o ponto de retorno). Por isso a <b>distância percorrida</b> é maior que o deslocamento:</p>${eqH(`d = |${n(sInv)} − ${par(s0)}| + |${n(s)} − ${par(sInv)}| = <b>${n(dist)}</b> m &nbsp; (|Δs| = ${n(Math.abs(ds))} m)`)}`));
    const areaTxt = inverte
      ? `<p>A área se divide em dois triângulos: um acima do eixo (deslocamento ${v0 > 0 ? "positivo" : "negativo"}) e outro abaixo. Somando com sinal:</p>${eqH(`Δs = ${frac(`${par(v0)}·${par(tinv)}`, "2")} + ${frac(`${par(v)}·${par(t - tinv)}`, "2")} = ${n((v0 * tinv) / 2)} ${sg((v * (t - tinv)) / 2)} = <b>${n(ds)}</b> m`)}<p>Somando as áreas sem sinal, obtém-se a distância percorrida, ${n(dist)} m.</p>`
      : mru ? `<p>O gráfico v × t é uma reta horizontal; a área sob ela é um retângulo:</p>${eqH(`Δs = v·t = ${par(v0)}·${par(t)} = <b>${n(ds)}</b> m ✓`)}`
        : `<p>O gráfico v × t é uma reta; a área sob ela, de 0 a t, é um trapézio:</p>${eqH(`Δs = ${frac("(v₀ + v)", "2")}·t = ${frac(`(${n(v0)} + ${par(v)})`, "2")}·${par(t)} = <b>${n(ds)}</b> m ✓`)}`;
    passos.push(R("A área sob o gráfico v × t é o deslocamento", areaTxt));
    return {
      ok: true, passos, s0, v0, a, t, s, v, ds, dist, tinv: inverte ? tinv : null, sInv, mru, valor: s,
      resposta: `s = ${n(s)} m, v = ${n(v)} m/s, Δs = ${n(ds)} m`,
      respostaHTML: `s(${n(t)} s) = <b>${n(s)}</b> m · v = <b>${n(v)}</b> m/s · Δs = <b>${n(ds)}</b> m${inverte ? ` · distância percorrida <b>${n(dist)}</b> m` : ""}`,
    };
  }

  function passosEncontro({ sA, vA, aA = 0, sB, vB, aB = 0 }) {
    if (!fin(sA, vA, aA, sB, vB, aB)) return { ok: false, erro: "Preencha posição, velocidade e aceleração dos dois móveis (use 0 quando não houver)." };
    const A2 = (aA - aB) / 2, B1 = vA - vB, C0 = sA - sB;
    const eqM = (s0, v, a) => (a ? `${n(s0)} ${sg(v)}·t ${sg(a / 2)}·t²` : `${n(s0)} ${sg(v)}·t`);
    const passos = [R("Equação horária de cada móvel", `<p>Use o mesmo eixo e a mesma origem para os dois (velocidade negativa = andando no sentido negativo):</p>${eqH(`s<sub>A</sub>(t) = ${eqM(sA, vA, aA)}`)}${eqH(`s<sub>B</sub>(t) = ${eqM(sB, vB, aB)}`)}`)];
    if (C0 === 0) return { ok: false, erro: "Os dois começam no mesmo ponto: eles já estão juntos em t = 0." };
    let t, t2 = null;
    const igual = `<p>No encontro, os dois estão no mesmo lugar ao mesmo tempo: s<sub>A</sub>(t) = s<sub>B</sub>(t).</p>`;
    if (Math.abs(A2) < 1e-12) {
      if (Math.abs(B1) < 1e-12) return { ok: false, erro: "Os móveis têm a mesma velocidade e a mesma aceleração: a distância entre eles nunca muda, então não se encontram." };
      t = -C0 / B1;
      passos.push(R("Iguale as posições", `${igual}${eqH(`${eqM(sA, vA, 0)} = ${eqM(sB, vB, 0)}`)}${eqH(`(${n(vA)} − ${par(vB)})·t = ${n(sB)} − ${par(sA)} → t = ${frac(n(-C0), n(B1))}`)}<p>Atalho da <b>velocidade relativa</b>: a distância inicial (${n(Math.abs(C0))} m) é “comida” à razão de |v<sub>A</sub> − v<sub>B</sub>| = ${n(Math.abs(B1))} m/s.</p>`));
      if (!(t > 1e-12)) return { ok: false, erro: "Com esses dados os móveis se afastam: não há encontro depois de t = 0." };
    } else {
      const D = B1 * B1 - 4 * A2 * C0;
      passos.push(R("Iguale as posições", `${igual}${eqH(`${n(A2)}·t² ${sg(B1)}·t ${sg(C0)} = 0`)}<p>É uma equação do 2º grau. Δ = b² − 4ac = ${par(B1)}² − 4·${par(A2)}·${par(C0)} = ${n(D)}.</p>`));
      if (D < 0) return { ok: false, erro: "Δ negativo: as posições nunca coincidem, então os móveis não se encontram." };
      const r1 = (-B1 - Math.sqrt(D)) / (2 * A2), r2 = (-B1 + Math.sqrt(D)) / (2 * A2);
      const pos = [r1, r2].filter((x) => x > 1e-12).sort((x, y) => x - y);
      if (!pos.length) return { ok: false, erro: "As raízes são negativas: o encontro teria acontecido antes de t = 0." };
      t = pos[0]; t2 = pos.length > 1 && pos[1] - pos[0] > 1e-9 ? pos[1] : null;
      passos.push(R("Raízes da equação", `${eqH(`t = ${frac(`−b ± √Δ`, "2a")} = ${frac(`${n(-B1)} ± ${n(Math.sqrt(D))}`, n(2 * A2))}`)}<p>Raízes: ${n(r1)} s e ${n(r2)} s. Só valem tempos positivos.${t2 ? ` Há <b>dois encontros</b>: em ${n(t)} s e em ${n(t2)} s (um ultrapassa o outro e depois é ultrapassado).` : ""}</p>`));
    }
    const s = sA + vA * t + (aA * t * t) / 2;
    const sBt = sB + vB * t + (aB * t * t) / 2;
    passos.push(R("Onde se encontram", `<p>Substitua t = ${n(t)} s em qualquer uma das equações:</p>${eqH(`s<sub>A</sub> = ${n(s)} m &nbsp; e &nbsp; s<sub>B</sub> = ${n(sBt)} m ✓`)}`));
    return {
      ok: true, passos, t, t2, s, sA, vA, aA, sB, vB, aB, valor: t,
      resposta: `encontro em t = ${n(t)} s, na posição ${n(s)} m`,
      respostaHTML: `Encontro em t = <b>${n(t)}</b> s, na posição s = <b>${n(s)}</b> m${t2 ? ` · segundo encontro em ${n(t2)} s` : ""}`,
    };
  }

  // ===========================================================================
  // 2. Forças: plano inclinado, bloco puxado, blocos ligados por fio
  // ===========================================================================
  const vet = (para, rotulo, cor, extra) => Object.assign({ tipo: "vetor", de: [0, 0], para, rotulo, cor }, extra || {});
  const comp = (de, para, rotulo) => ({ tipo: "vetor", de, para, rotulo, cor: COR.comp, tracejado: true, largura: 1.6, legenda: false });
  const caixa = (c, u, v, h) => { const p = (a, b) => [c[0] + u[0] * a * h + v[0] * b * h, c[1] + u[1] * a * h + v[1] * b * h]; return { tipo: "linha", pts: [p(-1, -1), p(1, -1), p(1, 1), p(-1, 1), p(-1, -1)], cor: COR.corpo, largura: 2, legenda: false, leitura: false }; };
  const atritoTxt = (muE, muC) => (muE || muC ? `μ<sub>e</sub> = ${n(muE)}, μ<sub>c</sub> = ${n(muC)}` : "sem atrito");
  function checarMu(muE, muC) {
    if (!fin(muE, muC) || muE < 0 || muC < 0) return "Os coeficientes de atrito devem ser números ≥ 0.";
    if (muC > muE + 1e-12) return "O atrito cinético não pode ser maior que o estático (μc ≤ μe). Se só souber um, use o mesmo valor nos dois.";
    return null;
  }

  function passosPlano({ m, th, muE = 0, muC = 0, g = gPadrao() }) {
    if (!(m > 0)) return { ok: false, erro: "Informe a massa (maior que zero)." };
    if (!fin(th) || th < 0 || th >= 90) return { ok: false, erro: "Use um ângulo de inclinação entre 0° e 90° (sem incluir 90°)." };
    const e = checarMu(muE, muC); if (e) return { ok: false, erro: e };
    const r = rad(th), P = m * g, Px = P * Math.sin(r), Py = P * Math.cos(r), N = Py;
    const semAtrito = muE === 0 && muC === 0;
    const FatMax = muE * N, Fc = muC * N;
    let desliza, a, Fat;
    if (semAtrito) { desliza = Px > 1e-12; a = Px / m; Fat = 0; }
    else if (Px <= FatMax + 1e-9) { desliza = false; a = 0; Fat = Px; }
    else { desliza = true; Fat = Fc; a = (Px - Fc) / m; }
    const passos = [];
    passos.push(R("Desenhe as forças no bloco", `<p>Três agentes tocam ou puxam o bloco:</p><ul><li><b>Peso P</b>, vertical para baixo: P = m·g = ${n(m)}·${n(g)} = <b>${n(P)}</b> N.</li><li><b>Normal N</b>, perpendicular à rampa, empurrando o bloco para fora dela.</li>${semAtrito ? "<li>Sem atrito: a rampa só empurra na perpendicular.</li>" : "<li><b>Atrito Fat</b>, paralelo à rampa, contra a tendência de descer (aponta rampa acima).</li>"}</ul>`));
    passos.push(R("Decomponha o peso nos eixos da rampa", `<p>Escolha um eixo ao longo da rampa e outro perpendicular a ela: assim N e Fat ficam cada um num eixo e só o peso precisa ser decomposto. O ângulo entre P e a perpendicular à rampa é o próprio θ.</p>${eqH(`P<sub>x</sub> = P·sen θ = ${n(P)}·sen ${n(th)}° = <b>${n(Px)}</b> N &nbsp; (puxa rampa abaixo)`)}${eqH(`P<sub>y</sub> = P·cos θ = ${n(P)}·cos ${n(th)}° = <b>${n(Py)}</b> N &nbsp; (aperta contra a rampa)`)}`));
    passos.push(R("Normal", `<p>Na direção perpendicular o bloco não acelera (não afunda nem levanta da rampa), então as forças se equilibram:</p>${eqH(`N = P<sub>y</sub> = <b>${n(N)}</b> N`)}<p>Repare que N é <b>menor</b> que o peso (${n(P)} N): a normal só é igual a P em superfície horizontal sem outras forças verticais.</p>`));
    if (!semAtrito) passos.push(R("O bloco desliza?", `<p>O atrito estático se ajusta até um máximo:</p>${eqH(`Fat<sub>máx</sub> = μ<sub>e</sub>·N = ${n(muE)}·${n(N)} = <b>${n(FatMax)}</b> N`)}<p>A força que tenta fazer o bloco descer é P<sub>x</sub> = ${n(Px)} N. ${desliza ? `Como ${n(Px)} N > ${n(FatMax)} N, o atrito estático <b>não dá conta</b>: o bloco <b>desliza</b> e passa a valer o atrito cinético.` : `Como ${n(Px)} N ≤ ${n(FatMax)} N, o atrito estático segura: o bloco <b>fica parado</b>.`}</p><p>Critério equivalente: desliza se tg θ > μ<sub>e</sub> (aqui tg ${n(th)}° = ${n(Math.tan(r))}).</p>`));
    if (semAtrito) passos.push(R("Aceleração (2ª lei de Newton)", `<p>Ao longo da rampa só P<sub>x</sub> atua:</p>${eqH(`m·a = P<sub>x</sub> → a = ${frac("m·g·sen θ", "m")} = g·sen θ = ${n(g)}·sen ${n(th)}° = <b>${n(a)}</b> m/s²`)}<p>A massa se cancela: sem atrito, qualquer bloco desce a rampa com a mesma aceleração.</p>`));
    else if (desliza) passos.push(R("Aceleração (2ª lei de Newton)", `${eqH(`Fat<sub>c</sub> = μ<sub>c</sub>·N = ${n(muC)}·${n(N)} = ${n(Fc)} N`)}${eqH(`m·a = P<sub>x</sub> − Fat<sub>c</sub> → a = ${frac(`${n(Px)} − ${n(Fc)}`, n(m))} = <b>${n(a)}</b> m/s²`)}<p>Forma literal: a = g·(sen θ − μ<sub>c</sub>·cos θ), que também não depende da massa.</p>`));
    else passos.push(R("Equilíbrio", `<p>Parado, a resultante é zero. O atrito estático vale exatamente o necessário:</p>${eqH(`Fat = P<sub>x</sub> = <b>${n(Fat)}</b> N &nbsp; (e não μ<sub>e</sub>·N = ${n(FatMax)} N, que é só o limite)`)}`));
    // diagrama em newtons, com o centro do bloco na origem
    const d = [Math.cos(r), -Math.sin(r)], nr = [Math.sin(r), Math.cos(r)], h = 0.2 * P;
    const c0 = [-nr[0] * h, -nr[1] * h], L = 1.45 * P;
    const T = [c0[0] - d[0] * L, c0[1] - d[1] * L], B = [c0[0] + d[0] * L, c0[1] + d[1] * L];
    const series = [{ tipo: "linha", pts: [T, B, [T[0], B[1]], T], cor: COR.comp, largura: 1.5, legenda: false, leitura: false }, caixa([0, 0], d, nr, h)];
    if (th > 0) series.push({ tipo: "arco", c: B, r: 0.32 * P, a0: PI - r, a1: PI, rotulo: "θ", cor: COR.comp });
    if (th > 0) { series.push(comp([0, 0], [d[0] * Px, d[1] * Px], "Px")); series.push(comp([0, 0], [-nr[0] * Py, -nr[1] * Py], "Py")); }
    series.push(vet([0, -P], "P", COR.P), vet([nr[0] * N, nr[1] * N], "N", COR.N));
    if (Fat > 1e-9) series.push(vet([-d[0] * Fat, -d[1] * Fat], "Fat", COR.Fat));
    return {
      ok: true, passos, P, Px, Py, N, Fat, FatMax, a, desliza, valor: a,
      cena: { series, nomeX: "x (N)", nomeY: "y (N)" },
      resposta: desliza ? `desliza com a = ${n(a)} m/s²` : `fica em repouso (Fat = ${n(Fat)} N)`,
      respostaHTML: desliza ? `O bloco <b>desliza</b>: a = <b>${n(a)}</b> m/s² · N = ${n(N)} N${Fat ? ` · Fat = ${n(Fat)} N` : ""}` : th === 0 ? `Superfície horizontal: o bloco <b>fica em repouso</b> · N = ${n(N)} N` : `O bloco <b>fica em repouso</b>: atrito estático de <b>${n(Fat)}</b> N (máximo possível ${n(FatMax)} N)`,
    };
  }

  function passosPuxado({ m, F, phi = 0, muE = 0, muC = 0, g = gPadrao() }) {
    if (!(m > 0)) return { ok: false, erro: "Informe a massa (maior que zero)." };
    if (!fin(F) || F < 0) return { ok: false, erro: "Informe a força aplicada (≥ 0)." };
    if (!fin(phi) || phi < 0 || phi >= 90) return { ok: false, erro: "Use um ângulo da força entre 0° e 90° (acima da horizontal)." };
    const e = checarMu(muE, muC); if (e) return { ok: false, erro: e };
    const r = rad(phi), Fx = F * Math.cos(r), Fy = F * Math.sin(r), P = m * g, N = P - Fy;
    if (N < -1e-9) return { ok: false, erro: `A componente vertical da força (${n(Fy)} N) é maior que o peso (${n(P)} N): o bloco sai do chão e o modelo de bloco apoiado não vale mais.` };
    const semAtrito = muE === 0 && muC === 0;
    const FatMax = muE * N, Fc = muC * N;
    let desliza, a, Fat;
    if (semAtrito) { desliza = Fx > 1e-12; a = Fx / m; Fat = 0; }
    else if (Fx <= FatMax + 1e-9) { desliza = false; a = 0; Fat = Fx; }
    else { desliza = true; Fat = Fc; a = (Fx - Fc) / m; }
    const passos = [];
    passos.push(R("Desenhe as forças no bloco", `<ul><li><b>Peso</b>: P = m·g = ${n(m)}·${n(g)} = <b>${n(P)}</b> N, para baixo.</li><li><b>Força aplicada</b> F = ${n(F)} N, ${phi ? `a ${n(phi)}° acima da horizontal` : "horizontal"}.</li><li><b>Normal</b> N, do chão para cima.</li>${semAtrito ? "<li>Sem atrito.</li>" : "<li><b>Atrito</b>, horizontal, contra a tendência de movimento.</li>"}</ul>`));
    if (phi) passos.push(R("Decomponha a força aplicada", `${eqH(`F<sub>x</sub> = F·cos φ = ${n(F)}·cos ${n(phi)}° = <b>${n(Fx)}</b> N &nbsp; (puxa para frente)`)}${eqH(`F<sub>y</sub> = F·sen φ = ${n(F)}·sen ${n(phi)}° = <b>${n(Fy)}</b> N &nbsp; (alivia o apoio)`)}`));
    passos.push(R("Normal", `<p>Na vertical não há aceleração: N + F<sub>y</sub> = P.</p>${eqH(`N = P − F<sub>y</sub> = ${n(P)} − ${n(Fy)} = <b>${n(N)}</b> N`)}${phi ? "<p>Puxar inclinado para cima diminui a normal e, com ela, o atrito. Empurrar inclinado para baixo faria o contrário.</p>" : "<p>Com a força horizontal, a normal equilibra o peso.</p>"}`));
    if (!semAtrito) passos.push(R("Desliza ou não?", `${eqH(`Fat<sub>máx</sub> = μ<sub>e</sub>·N = ${n(muE)}·${n(N)} = <b>${n(FatMax)}</b> N`)}<p>${desliza ? `F<sub>x</sub> = ${n(Fx)} N supera o atrito estático máximo: o bloco <b>entra em movimento</b>.` : `F<sub>x</sub> = ${n(Fx)} N não supera ${n(FatMax)} N: o bloco <b>continua parado</b>.`}</p>`));
    if (desliza) passos.push(R("Aceleração (2ª lei de Newton)", `${semAtrito ? "" : eqH(`Fat<sub>c</sub> = μ<sub>c</sub>·N = ${n(muC)}·${n(N)} = ${n(Fc)} N`)}${eqH(`F<sub>res</sub> = F<sub>x</sub>${semAtrito ? "" : " − Fat<sub>c</sub>"} = ${n(Fx - Fat)} N`)}${eqH(`a = ${frac("F<sub>res</sub>", "m")} = ${frac(n(Fx - Fat), n(m))} = <b>${n(a)}</b> m/s²`)}`));
    else passos.push(R("Equilíbrio", `<p>Parado: a resultante horizontal é zero e o atrito estático iguala F<sub>x</sub>.</p>${eqH(`Fat = F<sub>x</sub> = <b>${n(Fat)}</b> N`)}`));
    const h = 0.22 * Math.max(P, F);
    const S = Math.max(P, F, N);
    const series = [{ tipo: "seg", de: [-1.4 * S, -h], para: [1.4 * S, -h], cor: COR.comp, largura: 2, legenda: false }, caixa([0, 0], [1, 0], [0, 1], h)];
    if (phi && F > 0) { series.push(comp([0, 0], [Fx, 0], "Fx")); series.push(comp([Fx, 0], [Fx, Fy], "Fy")); }
    series.push(vet([0, -P], "P", COR.P));
    if (N > 1e-9) series.push(vet([0, N], "N", COR.N));
    if (F > 0) series.push(vet([Fx, Fy], "F", COR.F));
    if (Fat > 1e-9) series.push(vet([-Fat, 0], "Fat", COR.Fat));
    return {
      ok: true, passos, P, Fx, Fy, N, Fat, FatMax, a, desliza, valor: a,
      cena: { series, nomeX: "x (N)", nomeY: "y (N)" },
      resposta: desliza ? `a = ${n(a)} m/s²` : `repouso (Fat = ${n(Fat)} N)`,
      respostaHTML: desliza ? `O bloco acelera: a = <b>${n(a)}</b> m/s² · N = ${n(N)} N${Fat ? ` · Fat = ${n(Fat)} N` : ""}` : `O bloco <b>fica parado</b>: atrito estático de <b>${n(Fat)}</b> N · N = ${n(N)} N`,
    };
  }

  function passosFio({ mA, mB, muE = 0, muC = 0, g = gPadrao() }) {
    if (!(mA > 0) || !(mB > 0)) return { ok: false, erro: "Informe as duas massas (maiores que zero)." };
    const e = checarMu(muE, muC); if (e) return { ok: false, erro: e };
    const PA = mA * g, PB = mB * g, N = PA, FatMax = muE * N, Fc = muC * N;
    const semAtrito = muE === 0 && muC === 0;
    let desliza, a, T, Fat;
    if (semAtrito) { desliza = true; Fat = 0; a = PB / (mA + mB); }
    else if (PB <= FatMax + 1e-9) { desliza = false; a = 0; Fat = PB; }
    else { desliza = true; Fat = Fc; a = (PB - Fc) / (mA + mB); }
    T = desliza ? mB * (g - a) : PB;
    const passos = [];
    passos.push(R("A situação", `<p>O bloco A (${n(mA)} kg) está sobre uma mesa horizontal (${atritoTxt(muE, muC)}); um fio ideal passa por uma polia sem atrito e sustenta o bloco B (${n(mB)} kg), pendurado. Fio ideal: mesma tração T nas duas pontas e mesma aceleração para os dois blocos.</p>${eqH(`P<sub>A</sub> = ${n(PA)} N &nbsp; P<sub>B</sub> = ${n(PB)} N &nbsp; N = P<sub>A</sub> = ${n(N)} N`)}`));
    if (!semAtrito) passos.push(R("O sistema se move?", `<p>Quem puxa o conjunto é o peso de B; quem segura é o atrito em A.</p>${eqH(`Fat<sub>máx</sub> = μ<sub>e</sub>·N = ${n(muE)}·${n(N)} = <b>${n(FatMax)}</b> N`)}<p>${desliza ? `P<sub>B</sub> = ${n(PB)} N > ${n(FatMax)} N: o sistema <b>entra em movimento</b>.` : `P<sub>B</sub> = ${n(PB)} N ≤ ${n(FatMax)} N: o sistema <b>fica parado</b>, com T = P<sub>B</sub> = ${n(PB)} N e atrito estático de ${n(PB)} N.`}</p>`));
    if (desliza) {
      passos.push(R("2ª lei para cada bloco", `<p>Escolha o sentido do movimento como positivo (A para a direita, B para baixo):</p>${eqH(`Bloco A: T${semAtrito ? "" : " − Fat<sub>c</sub>"} = m<sub>A</sub>·a`)}${eqH("Bloco B: P<sub>B</sub> − T = m<sub>B</sub>·a")}<p>Somando as duas, a tração (força interna) se cancela:</p>${eqH(`P<sub>B</sub>${semAtrito ? "" : " − Fat<sub>c</sub>"} = (m<sub>A</sub> + m<sub>B</sub>)·a`)}`));
      passos.push(R("Aceleração", `${semAtrito ? "" : eqH(`Fat<sub>c</sub> = μ<sub>c</sub>·N = ${n(muC)}·${n(N)} = ${n(Fc)} N`)}${eqH(`a = ${frac(semAtrito ? n(PB) : `${n(PB)} − ${n(Fc)}`, `${n(mA)} + ${n(mB)}`)} = <b>${n(a)}</b> m/s²`)}<p>Bem menor que g: o peso de B precisa acelerar as duas massas.</p>`));
      passos.push(R("Tração no fio", `<p>Use a equação do bloco B (ou a de A, que dá o mesmo):</p>${eqH(`T = m<sub>B</sub>·(g − a) = ${n(mB)}·(${n(g)} − ${n(a)}) = <b>${n(T)}</b> N`)}<p>Conferência pelo bloco A: T = ${semAtrito ? "" : "Fat<sub>c</sub> + "}m<sub>A</sub>·a = ${semAtrito ? "" : `${n(Fc)} + `}${n(mA)}·${n(a)} = ${n(Fat + mA * a)} N ✓. Note que T < P<sub>B</sub>: se fossem iguais, B não aceleraria.</p>`));
    }
    // diagrama: A na origem, B pendurado à direita
    const S = Math.max(PA, PB, T), h = 0.22 * S, hB = 0.18 * S, rp = 0.1 * S;
    const xt = 1.15 * S, Bx = xt + rp, By = -1.5 * S;
    const series = [
      { tipo: "seg", de: [-1.6 * S, -h], para: [xt, -h], cor: COR.comp, largura: 2, legenda: false },
      { tipo: "seg", de: [h, 0], para: [xt, 0], cor: COR.comp, largura: 1.2, legenda: false },
      { tipo: "circulo", c: [xt, -rp], r: rp, cor: COR.comp },
      { tipo: "seg", de: [Bx, -rp], para: [Bx, By + hB], cor: COR.comp, largura: 1.2, legenda: false },
      caixa([0, 0], [1, 0], [0, 1], h), caixa([Bx, By], [1, 0], [0, 1], hB),
      vet([0, -PA], "P(A)", COR.P), vet([0, N], "N", COR.N), vet([T, 0], "T", COR.T),
      vet([Bx, By - PB], "P(B)", COR.P, { de: [Bx, By] }), vet([Bx, By + T], "T", COR.T, { de: [Bx, By], legenda: false }),
    ];
    if (Fat > 1e-9) series.push(vet([-Fat, 0], "Fat", COR.Fat));
    return {
      ok: true, passos, a, T, N, Fat, FatMax, desliza, valor: a,
      cena: { series, nomeX: "x (N)", nomeY: "y (N)" },
      resposta: desliza ? `a = ${n(a)} m/s², T = ${n(T)} N` : `repouso, T = ${n(T)} N`,
      respostaHTML: desliza ? `a = <b>${n(a)}</b> m/s² · tração T = <b>${n(T)}</b> N` : `O sistema <b>fica parado</b> · T = <b>${n(T)}</b> N`,
    };
  }

  // ===========================================================================
  // 3. Óptica geométrica: espelhos esféricos e lentes delgadas (Gauss)
  // ===========================================================================
  const OPT = {
    concavo: { nome: "espelho côncavo", um: "um espelho côncavo", espelho: true, pos: true },
    convexo: { nome: "espelho convexo", um: "um espelho convexo", espelho: true, pos: false },
    convergente: { nome: "lente convergente", um: "uma lente convergente", espelho: false, pos: true },
    divergente: { nome: "lente divergente", um: "uma lente divergente", espelho: false, pos: false },
  };
  function natureza(pi, A) {
    if (pi == null) return "imprópria (no infinito)";
    const t = Math.abs(A);
    return `${pi > 0 ? "real" : "virtual"}, ${A > 0 ? "direita" : "invertida"} e ${Math.abs(t - 1) < 1e-9 ? "do mesmo tamanho" : t > 1 ? "maior" : "menor"}`;
  }
  function passosOptica({ tipo, f, p, o = 2 }) {
    const T = OPT[tipo];
    if (!T) return { ok: false, erro: "Escolha o tipo de espelho ou lente." };
    if (!(f > 0)) return { ok: false, erro: "Informe a distância focal (em módulo, maior que zero)." };
    if (!(p > 0)) return { ok: false, erro: "Informe a distância do objeto (maior que zero)." };
    if (!(o > 0)) return { ok: false, erro: "A altura do objeto deve ser maior que zero." };
    const fs = T.pos ? f : -f;
    const passos = [];
    passos.push(R("Convenção de sinais (Gauss)", `<p>Para ${T.nome}: f = <b>${T.pos ? "+" : "−"}${n(f)}</b> cm (${T.pos ? "foco real" : "foco virtual: f negativo"}). Objeto real: p = +${n(p)} cm.</p><ul><li>p′ &gt; 0: imagem <b>real</b> (${T.espelho ? "na frente do espelho" : "do outro lado da lente"}); p′ &lt; 0: imagem <b>virtual</b> (${T.espelho ? "atrás do espelho" : "do mesmo lado do objeto"}).</li><li>A &gt; 0: imagem direita; A &lt; 0: invertida.</li></ul>`));
    if (Math.abs(p - fs) < 1e-9 * Math.max(p, 1)) {
      passos.push(R("Objeto no foco", `${eqH(`${frac("1", "p′")} = ${frac("1", "f")} − ${frac("1", "p")} = ${frac("1", n(fs))} − ${frac("1", n(p))} = 0`)}<p>p′ tende ao infinito: os raios saem <b>paralelos</b> e não formam imagem. Dizemos que a imagem é <b>imprópria</b>. É assim que funcionam faróis e lanternas (lâmpada no foco do espelho côncavo).</p>`));
      return { ok: true, passos, tipo, f: fs, p, o, pi: null, A: null, i: null, nat: natureza(null), valor: Infinity, cena: cenaOptica(T, fs, p, o, null, null), resposta: "imagem imprópria (objeto no foco)", respostaHTML: "Objeto no foco: imagem <b>imprópria</b> (raios paralelos, no infinito)" };
    }
    const pi = (p * fs) / (p - fs), A = -pi / p, i = A * o;
    passos.push(R("Equação de Gauss", `${eqH(`${frac("1", "f")} = ${frac("1", "p")} + ${frac("1", "p′")} → ${frac("1", "p′")} = ${frac("1", "f")} − ${frac("1", "p")}`)}${eqH(`${frac("1", "p′")} = ${frac("1", par(fs))} − ${frac("1", n(p))} = ${n(1 / fs - 1 / p, 4)} cm⁻¹`)}${eqH(`p′ = ${frac("p·f", "p − f")} = ${frac(`${n(p)}·${par(fs)}`, `${n(p)} − ${par(fs)}`)} = <b>${n(pi)}</b> cm`)}`));
    passos.push(R("Aumento e tamanho da imagem", `${eqH(`A = −${frac("p′", "p")} = −${frac(par(pi), n(p))} = <b>${n(A)}</b>`)}${eqH(`i = A·o = ${par(A)}·${n(o)} = <b>${n(i)}</b> cm`)}<p>${A < 0 ? "Sinal negativo: a imagem fica de cabeça para baixo." : "Sinal positivo: a imagem fica em pé."} Ela tem ${n(Math.abs(A))} vez(es) o tamanho do objeto.</p>`));
    const onde = T.espelho ? (pi > 0 ? `${n(pi)} cm na frente do espelho` : `${n(-pi)} cm atrás do espelho`) : pi > 0 ? `${n(pi)} cm do outro lado da lente` : `${n(-pi)} cm antes da lente, do lado do objeto`;
    let posObj = "";
    if (T.pos) {
      const C = 2 * fs;
      posObj = Math.abs(p - C) < 1e-9 ? "sobre o centro de curvatura (2f)" : p > C ? "além de 2f" : p > fs ? "entre f e 2f" : "entre o foco e " + (T.espelho ? "o espelho" : "a lente");
      posObj = `<p>O objeto está ${posObj}. Para ${T.nome}: além de 2f → real, invertida e menor; em 2f → mesmo tamanho; entre f e 2f → real, invertida e maior; entre f e ${T.espelho ? "o espelho" : "a lente"} → virtual, direita e maior.</p>`;
    } else posObj = `<p>${T.espelho ? "Espelho convexo" : "Lente divergente"} com objeto real dá <b>sempre</b> imagem virtual, direita e menor, entre ${T.espelho ? "o espelho" : "a lente"} e o foco: por isso ${T.espelho ? "retrovisores e espelhos de garagem ampliam o campo de visão" : "lentes para miopia “encolhem” o que se vê através delas"}.</p>`;
    passos.push(R("Natureza da imagem", `<p>A imagem é <b>${natureza(pi, A)}</b> e fica ${onde}.</p>${posObj}`));
    if (!T.espelho) passos.push(R("Vergência (grau da lente)", `<p>A vergência é o inverso da distância focal <b>em metros</b>; a unidade é a dioptria (di), o “grau” dos óculos.</p>${eqH(`V = ${frac("1", "f")} = ${frac("1", `${par(fs / 100)} m`)} = <b>${n(100 / fs)}</b> di`)}`));
    else passos.push(R("Raio de curvatura", `<p>Num espelho esférico (raios próximos do eixo), o foco fica no meio do caminho entre o vértice e o centro de curvatura: R = 2·|f| = ${n(2 * f)} cm.</p>`));
    return {
      ok: true, passos, tipo, f: fs, p, o, pi, A, i, nat: natureza(pi, A), V: T.espelho ? null : 100 / fs, valor: pi,
      cena: cenaOptica(T, fs, p, o, pi, i),
      resposta: `p′ = ${n(pi)} cm, A = ${n(A)}, imagem ${natureza(pi, A)}`,
      respostaHTML: `p′ = <b>${n(pi)}</b> cm · A = <b>${n(A)}</b> · i = ${n(i)} cm<br>Imagem <b>${natureza(pi, A)}</b>`,
    };
  }
  function cenaOptica(T, fs, p, o, pi, i) {
    const fa = Math.abs(fs);
    const xi = pi == null ? null : T.espelho ? -pi : pi;
    const X = Math.max(p, 2 * fa, xi == null ? 0 : Math.min(Math.abs(xi), 4 * Math.max(p, 2 * fa))) * 1.2;
    const ia = i == null ? 0 : Math.min(Math.abs(i), 4 * o);
    const H = Math.max(o, ia) * 1.35;
    const series = [];
    // elemento óptico
    if (T.espelho) {
      const k = 0.035 * X * (T.pos ? -1 : 1), pts = [];
      for (let j = -20; j <= 20; j++) { const y = (H * 0.95 * j) / 20; pts.push([k * (j / 20) * (j / 20), y]); }
      series.push({ tipo: "linha", pts, cor: "#9ba7b6", largura: 3, rotulo: T.nome, leitura: false });
      series.push({ tipo: "marca", x: -fs, y: 0, rotulo: "F", cor: "#e8edf3", raio: 4 });
      series.push({ tipo: "marca", x: -2 * fs, y: 0, rotulo: "C", cor: "#9ba7b6", raio: 4 });
    } else {
      series.push({ tipo: "seg", de: [0, -H * 0.95], para: [0, H * 0.95], cor: "#9ba7b6", largura: 3, rotulo: T.nome, etiqueta: false });
      series.push({ tipo: "marca", x: -fa, y: 0, rotulo: T.pos ? "F" : "F′", cor: "#e8edf3", raio: 4 });
      series.push({ tipo: "marca", x: fa, y: 0, rotulo: T.pos ? "F′" : "F", cor: "#e8edf3", raio: 4 });
    }
    // raios notáveis
    const O = [-p, o], saida = T.espelho ? -1 : 1;
    const cores = ["#f2c14e", "#5cc98a", "#c58af9"];
    const raios = [];
    if (xi == null) {
      // objeto no foco: raios saem paralelos
      const d1 = T.espelho ? [-fs, -o] : [fs, -o], d2 = T.espelho ? [-p, -o] : [p, -o];
      [[o, d1], [0, d2]].forEach(([yh, dd], k) => {
        const t = X / Math.abs(dd[0]);
        raios.push({ yh, fim: [dd[0] * t, yh + dd[1] * t], cor: cores[k] });
      });
    } else {
      const ys = [o, 0];
      if (Math.abs(i) < 6 * H) ys.push(i);
      ys.forEach((yh, k) => {
        const Hh = [0, yh], I = [xi, i];
        const real = xi * saida > 0;
        const dir = real ? [I[0] - Hh[0], I[1] - Hh[1]] : [Hh[0] - I[0], Hh[1] - I[1]];
        const t = X / Math.abs(dir[0]);
        raios.push({ yh, fim: [dir[0] * t, yh + dir[1] * t], cor: cores[k], virt: real ? null : I });
      });
    }
    const nomesR = ["raio paralelo ao eixo", T.espelho ? "raio no vértice" : "raio pelo centro óptico", "raio pelo foco"];
    raios.forEach((r, k) => {
      series.push({ tipo: "seg", de: O, para: [0, r.yh], cor: r.cor, largura: 1.6, rotulo: nomesR[k], etiqueta: false });
      series.push({ tipo: "seg", de: [0, r.yh], para: r.fim, cor: r.cor, largura: 1.6, legenda: false, etiqueta: false });
      if (r.virt) series.push({ tipo: "seg", de: [0, r.yh], para: r.virt, cor: r.cor, largura: 1.2, tracejado: true, legenda: false, etiqueta: false });
    });
    series.push({ tipo: "vetor", de: [-p, 0], para: [-p, o], rotulo: "objeto", cor: "#4da3ff", largura: 3 });
    if (xi != null) series.push({ tipo: "vetor", de: [xi, 0], para: [xi, i], rotulo: pi > 0 ? "imagem real" : "imagem virtual", cor: "#f0a23c", largura: 3, tracejado: pi < 0 });
    return { x: [-X, X], y: [-H, H], series, nomeX: "x (cm)", nomeY: "y (cm)", rotX: "eixo (cm)", rotY: "y (cm)" };
  }

  // ===========================================================================
  // 4. Ondas
  // ===========================================================================
  function passosOnda({ v = null, lam = null, f = null }) {
    const dados = [v, lam, f].filter((x) => x != null);
    if (dados.length < 2) return { ok: false, erro: "Informe duas das três grandezas: velocidade, comprimento de onda e frequência." };
    if (![v, lam, f].every((x) => x == null || x > 0)) return { ok: false, erro: "Os valores devem ser positivos." };
    const passos = [];
    passos.push(R("A relação fundamental", `<p>Em um período T a onda avança exatamente um comprimento de onda λ. Velocidade = distância ÷ tempo:</p>${eqH(`v = ${frac("λ", "T")} = λ·f`)}`));
    let alvo;
    if (v == null) { v = lam * f; alvo = "v"; passos.push(R("Velocidade", eqH(`v = λ·f = ${n(lam)}·${n(f)} = <b>${n(v)}</b> m/s`))); }
    else if (lam == null) { lam = v / f; alvo = "lam"; passos.push(R("Comprimento de onda", eqH(`λ = ${frac("v", "f")} = ${frac(n(v), n(f))} = <b>${n(lam)}</b> m`))); }
    else if (f == null) { f = v / lam; alvo = "f"; passos.push(R("Frequência", eqH(`f = ${frac("v", "λ")} = ${frac(n(v), n(lam))} = <b>${n(f)}</b> Hz`))); }
    else { alvo = "v"; passos.push(R("Conferência", `<p>Você deu as três. λ·f = ${n(lam * f)} m/s ${Math.abs(lam * f - v) <= 0.01 * v ? "bate com" : "<b>não</b> bate com"} v = ${n(v)} m/s.</p>`)); }
    const T = 1 / f;
    passos.push(R("Período", `<p>O período é o inverso da frequência: o tempo de uma oscilação completa.</p>${eqH(`T = ${frac("1", "f")} = ${frac("1", n(f))} = <b>${n(T)}</b> s`)}<p>Lembre: quem define a frequência é a <b>fonte</b>; quem define a velocidade é o <b>meio</b>. Ao mudar de meio, f fica e λ muda.</p>`));
    const val = { v, lam, f }[alvo];
    return { ok: true, passos, v, lam, f, T, valor: val, resposta: `v = ${n(v)} m/s, λ = ${n(lam)} m, f = ${n(f)} Hz, T = ${n(T)} s`, respostaHTML: `v = <b>${n(v)}</b> m/s · λ = <b>${n(lam)}</b> m · f = <b>${n(f)}</b> Hz · T = <b>${n(T)}</b> s` };
  }

  function passosCorda({ Tr, mu, L, nh = 1 }) {
    if (!(Tr > 0) || !(mu > 0) || !(L > 0)) return { ok: false, erro: "Informe tração (N), densidade linear (kg/m) e comprimento (m), todos positivos." };
    if (!(Number.isInteger(nh) && nh >= 1 && nh <= 50)) return { ok: false, erro: "O harmônico deve ser um inteiro de 1 a 50." };
    const v = Math.sqrt(Tr / mu), lam = (2 * L) / nh, f = (nh * v) / (2 * L), f1 = v / (2 * L);
    const passos = [
      R("Velocidade da onda na corda (Taylor)", `<p>Quanto mais esticada e mais leve a corda, mais rápido o pulso corre:</p>${eqH(`v = √(${frac("T", "μ")}) = √(${frac(n(Tr), n(mu))}) = <b>${n(v)}</b> m/s`)}`),
      R("Onda estacionária: extremidades fixas", `<p>As pontas presas são <b>nós</b>. Cabem na corda números inteiros de meios comprimentos de onda: L = n·λ/2.</p>${eqH(`λ<sub>${nh}</sub> = ${frac("2L", "n")} = ${frac(`2·${n(L)}`, nh)} = <b>${n(lam)}</b> m`)}`),
      R(`Frequência do ${nh}º harmônico`, `${eqH(`f<sub>n</sub> = ${frac("n·v", "2L")} = ${frac(`${nh}·${n(v)}`, `2·${n(L)}`)} = <b>${n(f)}</b> Hz`)}<p>Fundamental: f₁ = ${n(f1)} Hz. Os harmônicos são múltiplos inteiros dele: ${[1, 2, 3, 4].map((k) => n(k * f1)).join(", ")} Hz… O ${nh}º harmônico tem ${nh + 1} nós e ${nh} ventre(s).</p>`),
    ];
    return { ok: true, passos, v, lam, f, f1, nh, L, valor: f, resposta: `v = ${n(v)} m/s, f${nh} = ${n(f)} Hz`, respostaHTML: `v = <b>${n(v)}</b> m/s · λ<sub>${nh}</sub> = <b>${n(lam)}</b> m · f<sub>${nh}</sub> = <b>${n(f)}</b> Hz` };
  }

  function passosTubo({ L, v = 340, nh = 1, fechado = false }) {
    if (!(L > 0) || !(v > 0)) return { ok: false, erro: "Informe o comprimento do tubo e a velocidade do som (positivos)." };
    if (!(Number.isInteger(nh) && nh >= 1 && nh <= 51)) return { ok: false, erro: "O harmônico deve ser um inteiro de 1 a 51." };
    if (fechado && nh % 2 === 0) return { ok: false, erro: "Tubo fechado só tem harmônicos ímpares (1, 3, 5, …): escolha um número ímpar." };
    const lam = fechado ? (4 * L) / nh : (2 * L) / nh, f = fechado ? (nh * v) / (4 * L) : (nh * v) / (2 * L), f1 = fechado ? v / (4 * L) : v / (2 * L);
    const passos = [
      R(fechado ? "Tubo fechado: nó no fundo, ventre na boca" : "Tubo aberto: ventres nas duas pontas", fechado
        ? `<p>Na ponta fechada o ar não se desloca (nó); na boca aberta ele oscila ao máximo (ventre). Cabem números <b>ímpares</b> de quartos de onda: L = n·λ/4, com n = 1, 3, 5…</p>`
        : `<p>Nas duas bocas o ar oscila livremente (ventres). Cabem números inteiros de meios comprimentos de onda: L = n·λ/2, com n = 1, 2, 3…</p>`),
      R("Comprimento de onda", eqH(`λ<sub>${nh}</sub> = ${frac(fechado ? "4L" : "2L", "n")} = ${frac(`${fechado ? 4 : 2}·${n(L)}`, nh)} = <b>${n(lam)}</b> m`)),
      R("Frequência", `${eqH(`f<sub>${nh}</sub> = ${frac("n·v", fechado ? "4L" : "2L")} = ${frac(`${nh}·${n(v)}`, `${fechado ? 4 : 2}·${n(L)}`)} = <b>${n(f)}</b> Hz`)}<p>Série de harmônicos: ${(fechado ? [1, 3, 5, 7] : [1, 2, 3, 4]).map((k) => n(k * f1)).join(", ")} Hz… ${fechado ? "Um tubo fechado de mesmo comprimento soa uma oitava abaixo do aberto (f₁ = v/4L contra v/2L)." : ""}</p>`),
    ];
    return { ok: true, passos, lam, f, f1, nh, L, fechado, valor: f, resposta: `f${nh} = ${n(f)} Hz`, respostaHTML: `λ<sub>${nh}</sub> = <b>${n(lam)}</b> m · f<sub>${nh}</sub> = <b>${n(f)}</b> Hz (fundamental ${n(f1)} Hz)` };
  }

  const I0 = 1e-12;
  function passosDecibel({ I = null, beta = null }) {
    const passos = [];
    if (I != null) {
      if (!(I > 0)) return { ok: false, erro: "A intensidade deve ser positiva (em W/m²)." };
      beta = 10 * Math.log10(I / I0);
      passos.push(R("Compare com o limiar de audição", `<p>O ouvido percebe razões, não diferenças; por isso usamos logaritmo. Referência: I₀ = 10⁻¹² W/m², o som mais fraco audível.</p>${eqH(`${frac("I", "I₀")} = ${frac(n(I), "10⁻¹²")} = ${n(I / I0)}`)}`));
      passos.push(R("Nível sonoro", `${eqH(`β = 10·log(${frac("I", "I₀")}) = 10·log(${n(I / I0)}) = 10·${n(Math.log10(I / I0))} = <b>${n(beta)}</b> dB`)}`));
    } else if (beta != null) {
      if (!fin(beta)) return { ok: false, erro: "Informe o nível em dB." };
      I = I0 * Math.pow(10, beta / 10);
      passos.push(R("Desfaça o logaritmo", `${eqH(`β = 10·log(${frac("I", "I₀")}) → I = I₀·10<sup>β/10</sup>`)}${eqH(`I = 10⁻¹²·10<sup>${n(beta / 10)}</sup> = <b>${n(I)}</b> W/m²`)}`));
    } else return { ok: false, erro: "Informe a intensidade (W/m²) ou o nível sonoro (dB)." };
    passos.push(R("Como ler o resultado", `<p>Cada +10 dB multiplica a intensidade por 10; +3 dB praticamente a dobra; +20 dB multiplica por 100. Referências: conversa ≈ 60 dB, trânsito pesado ≈ 85 dB (exposição longa já lesa a audição), show ≈ 110 dB, limiar da dor ≈ 120–130 dB.</p>`));
    return { ok: true, passos, I, beta, valor: beta, resposta: `β = ${n(beta)} dB, I = ${n(I)} W/m²`, respostaHTML: `β = <b>${n(beta)}</b> dB · I = <b>${n(I)}</b> W/m²` };
  }

  // vo > 0: observador se aproxima da fonte; vf > 0: fonte se aproxima do observador
  function passosDoppler({ f, v = 340, vo = 0, vf = 0 }) {
    if (!(f > 0) || !(v > 0)) return { ok: false, erro: "Informe a frequência emitida e a velocidade do som (positivas)." };
    if (!fin(vo, vf)) return { ok: false, erro: "Informe as velocidades (0 se parado)." };
    if (vf >= v) return { ok: false, erro: "A fonte não pode se aproximar com velocidade igual ou maior que a do som (aí surge a onda de choque, o “estrondo sônico”)." };
    if (-vo >= v) return { ok: false, erro: "O observador se afasta mais rápido que o som: a onda nunca o alcança." };
    const fl = (f * (v + vo)) / (v - vf);
    const txtV = (x, quem) => (x > 0 ? `${quem} se aproxima a ${n(x)} m/s` : x < 0 ? `${quem} se afasta a ${n(-x)} m/s` : `${quem} parado`);
    const passos = [
      R("Fórmula e sinais", `${eqH(`f′ = f·${frac("v ± v<sub>o</sub>", "v ∓ v<sub>f</sub>")}`)}<p>Regra prática: <b>aproximação aumenta</b> a frequência percebida. Observador se aproximando: + no numerador; fonte se aproximando: − no denominador. Afastando, os sinais se invertem.</p><p>Aqui: ${txtV(vo, "observador")}; ${txtV(vf, "fonte")}.</p>`),
      R("Substitua", `${eqH(`f′ = ${n(f)}·${frac(`${n(v)} ${sg(vo)}`, `${n(v)} ${sg(-vf)}`)} = ${n(f)}·${n((v + vo) / (v - vf))} = <b>${n(fl)}</b> Hz`)}`),
      R("Interprete", `<p>${fl > f ? `O som chega <b>mais agudo</b> (${n(fl)} Hz > ${n(f)} Hz): há aproximação.` : fl < f ? `O som chega <b>mais grave</b> (${n(fl)} Hz < ${n(f)} Hz): há afastamento.` : "Sem movimento relativo: a frequência não muda."} A frequência <b>emitida</b> pela fonte não muda; o que muda é o ritmo com que as frentes de onda chegam ao observador.</p>`),
    ];
    return { ok: true, passos, f, fl, v, vo, vf, valor: fl, resposta: `f′ = ${n(fl)} Hz`, respostaHTML: `Frequência percebida f′ = <b>${n(fl)}</b> Hz (emitida: ${n(f)} Hz)` };
  }

  // ===========================================================================
  // 5. Termologia
  // ===========================================================================
  function passosEscala({ valor, de = "C" }) {
    if (!fin(valor)) return { ok: false, erro: "Digite a temperatura." };
    const C = de === "C" ? valor : de === "F" ? ((valor - 32) * 5) / 9 : valor - 273.15;
    const Fh = (C * 9) / 5 + 32, K = C + 273.15;
    if (K < -1e-9) return { ok: false, erro: "Abaixo do zero absoluto (0 K = −273,15 °C = −459,67 °F) não existe temperatura." };
    const passos = [
      R("A relação entre as escalas", `<p>Compare os pontos fixos da água (fusão e ebulição a 1 atm): 0 e 100 °C, 32 e 212 °F, 273,15 e 373,15 K. A mesma fração do intervalo vale nas três:</p>${eqH(`${frac("T<sub>C</sub>", "5")} = ${frac("T<sub>F</sub> − 32", "9")} = ${frac("T<sub>K</sub> − 273,15", "5")}`)}`),
    ];
    if (de === "F") passos.push(R("Fahrenheit → Celsius", eqH(`T<sub>C</sub> = ${frac("5·(T<sub>F</sub> − 32)", "9")} = ${frac(`5·(${n(valor)} − 32)`, "9")} = <b>${n(C)}</b> °C`)));
    if (de === "K") passos.push(R("Kelvin → Celsius", eqH(`T<sub>C</sub> = T<sub>K</sub> − 273,15 = ${n(valor, 6)} − 273,15 = <b>${n(C, 5)}</b> °C`)));
    if (de !== "F") passos.push(R("Celsius → Fahrenheit", eqH(`T<sub>F</sub> = ${frac("9·T<sub>C</sub>", "5")} + 32 = 1,8·${par(C)} + 32 = <b>${n(Fh, 5)}</b> °F`)));
    if (de !== "K") passos.push(R("Celsius → Kelvin", `${eqH(`T<sub>K</sub> = T<sub>C</sub> + 273,15 = ${n(C, 5)} + 273,15 = <b>${n(K, 5)}</b> K`)}<p>Em muitas provas usa-se 273 em vez de 273,15; a diferença é pequena.</p>`));
    passos.push(R("Variações de temperatura", `<p>Uma <b>variação</b> de 1 °C é igual a uma variação de 1 K e a 1,8 °F. Por isso ΔT<sub>C</sub> = ΔT<sub>K</sub>, mas ΔT<sub>F</sub> = 1,8·ΔT<sub>C</sub> (sem o 32!).</p>`));
    return { ok: true, passos, C, F: Fh, K, valor: C, resposta: `${n(C, 5)} °C = ${n(Fh, 5)} °F = ${n(K, 5)} K`, respostaHTML: `<b>${n(C, 5)}</b> °C = <b>${n(Fh, 5)}</b> °F = <b>${n(K, 5)}</b> K` };
  }

  // água (cal, g, °C)
  const AGUA = { cg: 0.5, ca: 1.0, cv: 0.48, Lf: 80, Lv: 540 };
  function passosAquecimento({ m, Ti, Tf }) {
    if (!(m > 0)) return { ok: false, erro: "Informe a massa de água (em gramas)." };
    if (!fin(Ti, Tf)) return { ok: false, erro: "Informe as temperaturas inicial e final." };
    if (Ti < -273.15 || Tf < -273.15) return { ok: false, erro: "Temperatura abaixo do zero absoluto." };
    if (Ti > 1000 || Tf > 1000) return { ok: false, erro: "Use temperaturas até 1000 °C." };
    if (Ti === Tf) return { ok: false, erro: "As temperaturas inicial e final são iguais: não há aquecimento." };
    const resf = Tf < Ti;
    const a = Math.min(Ti, Tf), b = Math.max(Ti, Tf);
    const trechos = [];
    const sens = (nome, c, t0, t1, fase) => { if (t1 > t0) trechos.push({ nome, Q: m * c * (t1 - t0), conta: `Q = m·c·ΔT = ${n(m)}·${n(c)}·(${n(t1)} − ${par(t0)})`, t0, t1, fase }); };
    sens("Aquecer o gelo", AGUA.cg, a, Math.min(b, 0), "gelo");
    if (a <= 0 && b > 0) trechos.push({ nome: "Derreter o gelo (fusão a 0 °C)", Q: m * AGUA.Lf, conta: `Q = m·L<sub>f</sub> = ${n(m)}·80`, t0: 0, t1: 0, fase: "fusão" });
    sens("Aquecer a água líquida", AGUA.ca, Math.max(a, 0), Math.min(b, 100), "água");
    if (a <= 100 && b > 100) trechos.push({ nome: "Vaporizar a água (ebulição a 100 °C)", Q: m * AGUA.Lv, conta: `Q = m·L<sub>v</sub> = ${n(m)}·540`, t0: 100, t1: 100, fase: "ebulição" });
    sens("Aquecer o vapor", AGUA.cv, Math.max(a, 100), b, "vapor");
    const Qt = trechos.reduce((s, t) => s + t.Q, 0);
    const passos = [R("Divida o caminho em trechos", `<p>Enquanto a temperatura muda, use <b>calor sensível</b> Q = m·c·ΔT. Durante uma mudança de fase a temperatura fica parada e usa-se <b>calor latente</b> Q = m·L. Constantes da água (cal, g, °C): c<sub>gelo</sub> = 0,5; c<sub>água</sub> = 1,0; c<sub>vapor</sub> = 0,48; L<sub>f</sub> = 80 cal/g; L<sub>v</sub> = 540 cal/g.</p><p>${resf ? `Resfriamento de ${n(Ti)} °C para ${n(Tf)} °C: o calor <b>liberado</b> é igual ao que seria absorvido no caminho inverso.` : `Aquecimento de ${n(Ti)} °C para ${n(Tf)} °C.`}</p>`)];
    trechos.forEach((t, k) => passos.push(R(`${k + 1}. ${t.nome}`, eqH(`${t.conta} = <b>${n(t.Q)}</b> cal`))));
    passos.push(R("Some os trechos", `${eqH(`Q<sub>total</sub> = ${trechos.map((t) => n(t.Q)).join(" + ")} = <b>${n(Qt)}</b> cal ≈ ${n(Qt / 1000)} kcal ≈ ${n((Qt * 4.184) / 1000)} kJ`)}<p>Repare no tamanho dos patamares: ${trechos.some((t) => t.fase === "ebulição") ? "vaporizar consome 540 cal/g, mais que aquecer a água de 0 a 100 °C (100 cal/g) e que derreter o gelo (80 cal/g)." : "derreter o gelo (80 cal/g) custa quase o mesmo que aquecer a água de 0 °C a 80 °C."}</p>`));
    // curva T × Q (em kcal), sempre no sentido do aquecimento
    const pts = [[0, a]];
    let acc = 0;
    trechos.forEach((t) => { acc += t.Q; pts.push([acc / 1000, t.t1]); });
    return { ok: true, passos, Q: resf ? -Qt : Qt, Qt, trechos, pts, resf, valor: Qt, resposta: `${resf ? "calor liberado" : "Q"} = ${n(Qt)} cal`, respostaHTML: `${resf ? "Calor liberado" : "Calor necessário"}: <b>${n(Qt)}</b> cal = <b>${n(Qt / 1000)}</b> kcal ≈ ${n((Qt * 4.184) / 1000)} kJ` };
  }

  function passosMistura({ corpos }) {
    const cs = (corpos || []).filter((c) => c && c.m != null);
    if (cs.length < 2) return { ok: false, erro: "Informe pelo menos dois corpos (massa, calor específico e temperatura)." };
    for (const c of cs) if (!(c.m > 0) || !(c.c > 0) || !fin(c.T)) return { ok: false, erro: "Cada corpo precisa de massa e calor específico positivos e de uma temperatura." };
    const C = cs.map((c) => c.m * c.c), soma = C.reduce((s, x) => s + x, 0);
    const Te = cs.reduce((s, c, k) => s + C[k] * c.T, 0) / soma;
    const nome = (c, k) => c.nome || `corpo ${k + 1}`;
    const passos = [
      R("Princípio: o calor que um perde, o outro ganha", `<p>Num recipiente isolado, a soma dos calores trocados é zero: ΣQ = 0, com Q = m·c·(T<sub>e</sub> − T<sub>inicial</sub>). Suposição: <b>não há mudança de fase</b>.</p>`),
      R("Capacidade térmica de cada corpo", cs.map((c, k) => eqH(`C<sub>${k + 1}</sub> = m·c = ${n(c.m)}·${n(c.c)} = ${n(C[k])} cal/°C &nbsp; (${nome(c, k)}, a ${n(c.T)} °C)`)).join("")),
      R("Equação do equilíbrio", `${eqH(cs.map((c, k) => `${n(C[k])}·(T<sub>e</sub> − ${par(c.T)})`).join(" + ") + " = 0")}${eqH(`T<sub>e</sub> = ${frac(cs.map((c, k) => `${n(C[k])}·${par(c.T)}`).join(" + "), cs.map((c, k) => n(C[k])).join(" + "))} = <b>${n(Te)}</b> °C`)}<p>T<sub>e</sub> é uma <b>média ponderada</b> das temperaturas, com pesos m·c: fica sempre entre a menor e a maior temperatura inicial, mais perto da do corpo com maior capacidade térmica.</p>`),
      R("Confira: os calores somam zero", `<div class="tab-rolar"><table class="tb"><thead><tr><th>Corpo</th><th>Q = m·c·ΔT</th><th></th></tr></thead><tbody>${cs.map((c, k) => { const q = C[k] * (Te - c.T); return `<tr><td>${nome(c, k)}</td><td>${n(q)} cal</td><td>${q > 0 ? "recebe" : q < 0 ? "cede" : "—"}</td></tr>`; }).join("")}</tbody></table></div>`),
    ];
    return { ok: true, passos, Te, valor: Te, resposta: `Te = ${n(Te)} °C`, respostaHTML: `Temperatura de equilíbrio T<sub>e</sub> = <b>${n(Te)}</b> °C` };
  }

  // água (ma, Ta ≥ 0) + gelo (mg, Tg ≤ 0), em cal, g e °C
  function passosGelo({ ma, Ta, mg, Tg }) {
    if (!(ma > 0) || !(mg > 0)) return { ok: false, erro: "Informe as massas de água e de gelo (em gramas)." };
    if (!fin(Ta, Tg)) return { ok: false, erro: "Informe as temperaturas." };
    if (Ta < 0 || Ta >= 100) return { ok: false, erro: "A água líquida deve estar entre 0 °C e 100 °C." };
    if (Tg > 0 || Tg < -273.15) return { ok: false, erro: "O gelo deve estar a 0 °C ou abaixo." };
    const { cg, ca, Lf } = AGUA;
    const Q1 = mg * cg * (0 - Tg), Q2 = mg * Lf, Qa = ma * ca * Ta, Qcong = ma * Lf;
    const passos = [R("Estratégia: compare os calores disponíveis", `<p>Não dá para jogar tudo numa equação só: é preciso descobrir <b>em que estado</b> o sistema termina. Calcule quanto calor cada etapa exige ou libera, tudo até 0 °C (c<sub>gelo</sub> = 0,5; c<sub>água</sub> = 1; L<sub>f</sub> = 80 cal/g).</p>${eqH(`Aquecer o gelo até 0 °C: Q₁ = ${n(mg)}·0,5·(0 − ${par(Tg)}) = <b>${n(Q1)}</b> cal`)}${eqH(`Derreter todo o gelo: Q₂ = ${n(mg)}·80 = <b>${n(Q2)}</b> cal`)}${eqH(`A água pode ceder, até chegar a 0 °C: Q<sub>a</sub> = ${n(ma)}·1·${n(Ta)} = <b>${n(Qa)}</b> cal`)}`)];
    let Te, caso, derrete = 0, sobraGelo = 0, congela = 0;
    if (Qa >= Q1 + Q2 - 1e-9) {
      caso = "tudo";
      Te = (ma * ca * Ta - Q1 - Q2) / ((ma + mg) * ca);
      derrete = mg;
      passos.push(R("Decisão: o gelo derrete todo", `<p>Q<sub>a</sub> = ${n(Qa)} cal ≥ Q₁ + Q₂ = ${n(Q1 + Q2)} cal: sobra calor depois de derreter tudo, e a mistura (${n(ma + mg)} g de água) termina acima de 0 °C.</p>${eqH(`${n(ma)}·1·(T<sub>e</sub> − ${n(Ta)}) + ${n(Q1)} + ${n(Q2)} + ${n(mg)}·1·(T<sub>e</sub> − 0) = 0`)}${eqH(`T<sub>e</sub> = ${frac(`${n(Qa)} − ${n(Q1 + Q2)}`, `${n(ma)} + ${n(mg)}`)} = <b>${n(Te)}</b> °C`)}`));
    } else if (Qa >= Q1 - 1e-9) {
      caso = "parte";
      Te = 0; derrete = (Qa - Q1) / Lf; sobraGelo = mg - derrete;
      passos.push(R("Decisão: só parte do gelo derrete", `<p>Q₁ ≤ Q<sub>a</sub> < Q₁ + Q₂ (${n(Q1)} ≤ ${n(Qa)} < ${n(Q1 + Q2)} cal): a água consegue levar o gelo a 0 °C mas não derretê-lo inteiro. O sistema termina com água e gelo juntos, a <b>0 °C</b>.</p>${eqH(`massa derretida = ${frac(`Q<sub>a</sub> − Q₁`, "L<sub>f</sub>")} = ${frac(`${n(Qa)} − ${n(Q1)}`, "80")} = <b>${n(derrete)}</b> g`)}<p>Sobram ${n(sobraGelo)} g de gelo, boiando em ${n(ma + derrete)} g de água.</p>`));
    } else if (Qa + Qcong >= Q1 - 1e-9) {
      caso = "congela";
      Te = 0; congela = (Q1 - Qa) / Lf; sobraGelo = mg + congela;
      passos.push(R("Decisão: parte da água congela", `<p>Até esfriar a 0 °C a água libera só ${n(Qa)} cal, menos que os ${n(Q1)} cal que o gelo precisa para chegar a 0 °C. A água então começa a <b>congelar</b>, liberando 80 cal por grama. Final: água e gelo a <b>0 °C</b>.</p>${eqH(`massa de água que congela = ${frac("Q₁ − Q<sub>a</sub>", "L<sub>f</sub>")} = ${frac(`${n(Q1)} − ${n(Qa)}`, "80")} = <b>${n(congela)}</b> g`)}`));
    } else {
      caso = "gelo";
      Te = (ma * ca * Ta + ma * Lf + mg * cg * Tg) / ((ma + mg) * cg);
      sobraGelo = ma + mg;
      passos.push(R("Decisão: tudo vira gelo", `<p>Mesmo congelando toda a água (${n(Qa + Qcong)} cal liberados), o gelo não chega a 0 °C. Tudo termina sólido, abaixo de 0 °C.</p>${eqH(`T<sub>e</sub> = ${frac(`${n(Qa)} + ${n(Qcong)} + ${n(mg)}·0,5·${par(Tg)}`, `(${n(ma)} + ${n(mg)})·0,5`)} = <b>${n(Te)}</b> °C`)}`));
    }
    passos.push(R("Por que não usar a fórmula da média direto?", `<p>A média ponderada só vale sem mudança de fase. Com gelo, os 80 cal/g da fusão “somem” do balanço térmico sem mudar a temperatura: ignorá-los dá uma resposta errada (às vezes até uma temperatura impossível, abaixo de 0 °C com tudo líquido).</p>`));
    const estado = caso === "tudo" ? "só água líquida" : caso === "gelo" ? "só gelo" : "água e gelo";
    return {
      ok: true, passos, caso, Te, derrete, sobraGelo, congela, Q1, Q2, Qa, valor: Te,
      resposta: `Te = ${n(Te)} °C (${estado})`,
      respostaHTML: `T<sub>e</sub> = <b>${n(Te)}</b> °C · estado final: <b>${estado}</b>${caso === "parte" ? ` · derretem ${n(derrete)} g, sobram ${n(sobraGelo)} g de gelo` : caso === "congela" ? ` · congelam ${n(congela)} g de água` : ""}`,
    };
  }

  function passosDilatacao({ X0, alfa, dT, dim = 1 }) {
    if (!(X0 > 0)) return { ok: false, erro: "Informe a dimensão inicial (positiva)." };
    if (!(alfa > 0)) return { ok: false, erro: "Informe o coeficiente de dilatação linear α (positivo, em 1/°C)." };
    if (!fin(dT)) return { ok: false, erro: "Informe a variação de temperatura." };
    if (![1, 2, 3].includes(dim)) return { ok: false, erro: "Escolha linear, superficial ou volumétrica." };
    const k = dim * alfa, dX = X0 * k * dT, X = X0 + dX;
    const nomes = { 1: ["linear", "L", "α", "comprimento"], 2: ["superficial", "A", "β", "área"], 3: ["volumétrica", "V", "γ", "volume"] }[dim];
    const passos = [
      R(`Dilatação ${nomes[0]}`, `<p>Aquecido, cada átomo vibra mais e “empurra” os vizinhos: o ${nomes[3]} cresce proporcionalmente ao tamanho inicial e à variação de temperatura.</p>${eqH(`Δ${nomes[1]} = ${nomes[1]}₀·${nomes[2]}·ΔT`)}${dim > 1 ? `<p>Coeficiente ${nomes[0]}: ${nomes[2]} = ${dim}·α = ${dim}·${n(alfa)} = ${n(k)} °C⁻¹ (aproximação válida porque α é muito pequeno).</p>` : ""}`),
      R("Substitua", `${eqH(`Δ${nomes[1]} = ${n(X0)}·${n(k)}·${par(dT)} = <b>${n(dX)}</b>`)}${eqH(`${nomes[1]} = ${nomes[1]}₀ + Δ${nomes[1]} = ${n(X0)} ${sg(dX)} = <b>${n(X, 7)}</b>`)}<p>A variação relativa é ${n((dX / X0) * 100)}% (na mesma unidade de ${nomes[1]}₀). ${dT < 0 ? "ΔT negativo: o corpo contrai." : ""}</p>`),
    ];
    return { ok: true, passos, dX, X, valor: dX, resposta: `Δ${nomes[1]} = ${n(dX)}, ${nomes[1]} = ${n(X, 7)}`, respostaHTML: `Δ${nomes[1]} = <b>${n(dX)}</b> · ${nomes[1]} final = <b>${n(X, 7)}</b> (mesma unidade de ${nomes[1]}₀)` };
  }

  // ===========================================================================
  // Exercícios
  // ===========================================================================
  const sorteia = (a) => a[Math.floor(Math.random() * a.length)];
  const embaralhar = (corretas, erradas) => {
    const ops = [corretas, ...erradas].map((h, k) => ({ h, k }));
    for (let i = ops.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ops[i], ops[j]] = [ops[j], ops[i]]; }
    return { opcoes: ops.map((o) => o.h), resposta: ops.findIndex((o) => o.k === 0) };
  };
  const num = (x, un, rel = 0.02, tol = 0) => ({ resposta: x, rel, tol, unidade: un, texto: `${n(x)} ${un}`.trim() });
  const G10 = 10;

  const EX = {
    "mov-pos"() {
      const s0 = sorteia([0, 5, 10, 20, -10]), v0 = sorteia([2, 4, 5, 10, -5]), a = sorteia([2, 4, -2, 1, 3]), t = sorteia([2, 3, 4, 5]);
      const r = passosMovimento({ s0, v0, a, t });
      return { enunciado: `Um móvel em MRUV tem equação horária s(t) = ${n(s0)} ${sg(v0)}·t ${sg(a / 2)}·t² (SI). Qual a posição em t = ${t} s?`, ...num(r.s, "m", 0.01, 0.15), passos: r.passos };
    },
    "mov-vel"() {
      const kmh = sorteia([36, 54, 72, 90, 108]), a = sorteia([2, 2.5, 4, 5]);
      const v0 = kmh / 3.6, t = v0 / a;
      const r = passosMovimento({ s0: 0, v0, a: -a, t });
      return { enunciado: `Um carro a ${kmh} km/h freia com desaceleração constante de ${n(a)} m/s². Quanto tempo leva para parar?`, ...num(t, "s"), passos: [R("Converta a velocidade", eqH(`v₀ = ${kmh} km/h ÷ 3,6 = ${n(v0)} m/s`)), R("Use v = v₀ + a·t com v = 0", eqH(`0 = ${n(v0)} − ${n(a)}·t → t = ${frac(n(v0), n(a))} = <b>${n(t)}</b> s`)), ...r.passos.slice(2, 3)] };
    },
    "mov-torr"() {
      const kmh = sorteia([36, 54, 72, 90, 108]), a = sorteia([4, 5, 8, 10]);
      const v0 = kmh / 3.6, d = (v0 * v0) / (2 * a);
      return { enunciado: `Um carro a ${kmh} km/h freia uniformemente com desaceleração de ${n(a)} m/s² até parar. Qual a distância de frenagem?`, ...num(d, "m"), passos: [R("Converta a velocidade", eqH(`v₀ = ${kmh} ÷ 3,6 = ${n(v0)} m/s`)), R("O tempo não aparece: use Torricelli", `${eqH("v² = v₀² + 2·a·Δs, com v = 0 e a = −" + n(a) + " m/s²")}${eqH(`0 = ${n(v0)}² − 2·${n(a)}·Δs → Δs = ${frac(`${n(v0)}²`, `2·${n(a)}`)} = <b>${n(d)}</b> m`)}`), R("Repare", `<p>A distância cresce com o <b>quadrado</b> da velocidade: a ${kmh * 2} km/h, a frenagem seria 4 vezes maior (${n(4 * d)} m).</p>`)] };
    },
    "mov-enc"() {
      const D = sorteia([100, 120, 150, 200, 300, 360]), vA = sorteia([10, 15, 20, 25]), vB = sorteia([5, 10, 15, 20]);
      const contra = Math.random() < 0.6;
      if (!contra && vA <= vB) return EX["mov-enc"]();
      const r = passosEncontro({ sA: 0, vA, sB: D, vB: contra ? -vB : vB });
      return { enunciado: contra ? `Dois carros estão a ${D} m um do outro e andam em sentidos opostos, um em direção ao outro, com velocidades constantes de ${vA} m/s e ${vB} m/s. Após quanto tempo se encontram?` : `Um carro A a ${vA} m/s persegue um carro B que está ${D} m à frente, a ${vB} m/s, na mesma direção e sentido (velocidades constantes). Em quanto tempo A alcança B?`, ...num(r.t, "s"), passos: r.passos };
    },
    "mov-graf"() {
      const v0 = sorteia([0, 2, 4, 5, 10]), v1 = sorteia([10, 12, 15, 20]), t1 = sorteia([4, 5, 6, 8, 10]);
      if (v1 === v0) return EX["mov-graf"]();
      const ds = ((v0 + v1) / 2) * t1;
      const a = (v1 - v0) / t1;
      const cena = { x: [0, t1 * 1.1], y: [0, Math.max(v0, v1) * 1.2], rotX: "t (s)", rotY: "v (m/s)", series: [{ tipo: "area", f: (x) => v0 + a * x, a: 0, b: t1, cor: "#4da3ff" }, { tipo: "linha", pts: [[0, v0], [t1, v1]], cor: "#4da3ff" }, { tipo: "marca", x: 0, y: v0 }, { tipo: "marca", x: t1, y: v1 }] };
      return { enunciado: `O gráfico mostra a velocidade de um móvel em função do tempo: de ${v0} m/s em t = 0 até ${v1} m/s em t = ${t1} s. Qual o deslocamento nesse intervalo?`, grafico: cena, graficoOp: { modo: "dados", altura: 200, rotX: "t (s)", rotY: "v (m/s)" }, ...num(ds, "m"), passos: [R("Deslocamento = área sob v × t", `<p>A figura sob a reta, de t = 0 a t = ${t1} s, é um ${v0 === 0 ? "triângulo" : "trapézio"}.</p>`), R("Calcule a área", eqH(v0 === 0 ? `Δs = ${frac("base·altura", "2")} = ${frac(`${t1}·${v1}`, "2")} = <b>${n(ds)}</b> m` : `Δs = ${frac("(B + b)·h", "2")} = ${frac(`(${v1} + ${v0})·${t1}`, "2")} = <b>${n(ds)}</b> m`)), R("Bônus: a aceleração é a inclinação", eqH(`a = ${frac("Δv", "Δt")} = ${frac(`${v1} − ${v0}`, t1)} = ${n(a)} m/s²`))] };
    },
    "for-plano"() {
      const th = sorteia([30, 37, 45, 53, 60]), m = sorteia([2, 4, 5, 10]);
      const comAtrito = Math.random() < 0.6;
      let muC = 0;
      if (comAtrito) { muC = sorteia([0.1, 0.2, 0.25, 0.3, 0.4, 0.5]); if (muC >= Math.tan(rad(th)) * 0.9) muC = 0.1; }
      const r = passosPlano({ m, th, muE: muC, muC, g: G10 });
      return { enunciado: `Um bloco de ${m} kg é solto numa rampa inclinada de ${th}° com a horizontal${comAtrito ? `; o coeficiente de atrito cinético é ${n(muC)} (considere μe = μc)` : ", sem atrito"}. Use g = 10 m/s². Qual a aceleração do bloco?`, ...num(r.a, "m/s²"), passos: r.passos };
    },
    "for-puxado"() {
      const m = sorteia([2, 4, 5, 8, 10]), phi = sorteia([0, 0, 30, 37, 53, 60]), muC = sorteia([0, 0.1, 0.2, 0.25, 0.3]);
      const P = m * G10;
      let F = Math.round((muC * P * 1.5 + sorteia([10, 20, 30, 40])) / 5) * 5;
      if (F * Math.sin(rad(phi)) >= P) F = Math.round(P / 2);
      const r = passosPuxado({ m, F, phi, muE: muC, muC, g: G10 });
      if (!r.ok || !r.desliza) return EX["for-puxado"]();
      return { enunciado: `Um bloco de ${m} kg num piso horizontal é puxado por uma força de ${F} N ${phi ? `inclinada ${phi}° acima da horizontal` : "horizontal"}. ${muC ? `O coeficiente de atrito cinético é ${n(muC)} (μe = μc).` : "Despreze o atrito."} Com g = 10 m/s², qual a aceleração?`, ...num(r.a, "m/s²"), passos: r.passos };
    },
    "for-normal"() {
      const m = sorteia([4, 5, 8, 10, 20]), phi = sorteia([30, 37, 53, 60]), F = sorteia([10, 20, 25, 40, 50]);
      const r = passosPuxado({ m, F, phi, g: G10 });
      if (!r.ok || r.N <= 0) return EX["for-normal"]();
      return { enunciado: `Um caixote de ${m} kg está sobre um piso horizontal e é puxado por uma corda que faz ${phi}° com a horizontal, com força de ${F} N. Qual a força normal que o piso exerce? (g = 10 m/s²)`, ...num(r.N, "N"), passos: r.passos.slice(0, 3) };
    },
    "for-fio"() {
      const mA = sorteia([2, 3, 4, 6, 8]), mB = sorteia([1, 2, 3, 4]), mu = sorteia([0, 0, 0.1, 0.2, 0.25]);
      const r = passosFio({ mA, mB, muE: mu, muC: mu, g: G10 });
      if (!r.desliza) return EX["for-fio"]();
      const pedeT = Math.random() < 0.4;
      return { enunciado: `Um bloco A de ${mA} kg sobre uma mesa horizontal ${mu ? `(coeficiente de atrito ${n(mu)})` : "sem atrito"} está ligado por um fio ideal, que passa por uma polia, a um bloco B de ${mB} kg pendurado. Com g = 10 m/s², qual ${pedeT ? "a tração no fio" : "a aceleração do sistema"}?`, ...(pedeT ? num(r.T, "N") : num(r.a, "m/s²")), passos: r.passos };
    },
    "for-desliza"() {
      const m = sorteia([2, 4, 5, 10]), muE = sorteia([0.3, 0.4, 0.5, 0.6]), muC = muE - sorteia([0.1, 0.2]);
      const N = m * G10, FatMax = muE * N, Fc = muC * N;
      const desliza = Math.random() < 0.5;
      const F = desliza ? Math.round(FatMax + sorteia([2, 4, 5, 10])) : Math.round((Fc + FatMax) / 2);
      if (!desliza && (F <= Fc || F >= FatMax)) return EX["for-desliza"]();
      const r = passosPuxado({ m, F, phi: 0, muE, muC, g: G10 });
      const aR = (F - Fc) / m;
      const certa = desliza ? `Desliza, com aceleração de ${n(aR)} m/s²` : `Fica em repouso; o atrito estático vale ${n(F)} N`;
      const erradas = desliza
        ? [`Fica em repouso; o atrito estático vale ${n(F)} N`, `Desliza, com aceleração de ${n(F / m)} m/s²`, `Fica em repouso; o atrito vale ${n(FatMax)} N`]
        : [`Desliza, com aceleração de ${n(aR)} m/s²`, `Fica em repouso; o atrito vale ${n(FatMax)} N`, `Desliza, com aceleração de ${n(F / m)} m/s²`];
      const e = embaralhar(certa, erradas);
      return { tipo: "escolha", enunciado: `Uma caixa de ${m} kg está parada num piso horizontal (μe = ${n(muE)}, μc = ${n(muC)}, g = 10 m/s²). Alguém a empurra horizontalmente com ${F} N. O que acontece?`, ...e, passos: r.passos, texto: certa };
    },
    "opt-gauss"() {
      const tipo = sorteia(["concavo", "convergente", "convexo", "divergente", "concavo", "convergente"]);
      const f = sorteia([10, 12, 15, 20, 30]), p = sorteia([5, 10, 15, 20, 30, 40, 60]);
      if (OPT[tipo].pos && Math.abs(p - f) < 1e-9) return EX["opt-gauss"]();
      const r = passosOptica({ tipo, f, p });
      if (Math.abs(r.pi) > 400) return EX["opt-gauss"]();
      return { enunciado: `Um objeto está a ${p} cm de ${OPT[tipo].um} de distância focal ${f} cm (em módulo). Pela equação de Gauss, qual a posição p′ da imagem? (Imagem virtual: p′ negativo.)`, ...num(r.pi, "cm"), passos: r.passos };
    },
    "opt-aumento"() {
      const tipo = sorteia(["concavo", "convergente", "convergente"]);
      const f = sorteia([10, 15, 20]), p = sorteia([15, 30, 40, 60, 5]), o = sorteia([2, 3, 4, 5, 6]);
      if (Math.abs(p - f) < 1e-9) return EX["opt-aumento"]();
      const r = passosOptica({ tipo, f, p, o });
      return { enunciado: `Um objeto de ${o} cm de altura está a ${p} cm de ${OPT[tipo].um} de distância focal ${f} cm. Qual a altura da imagem, em módulo?`, ...num(Math.abs(r.i), "cm"), passos: r.passos };
    },
    "opt-f"() {
      const p = sorteia([20, 30, 40, 60]), pi = sorteia([20, 30, 60, 120, -60, -30]);
      if (pi < 0 && -pi <= p) return EX["opt-f"]();
      const f = (p * pi) / (p + pi);
      return { enunciado: `Uma lente forma, de um objeto a ${p} cm dela, uma imagem ${pi > 0 ? "real" : "virtual"} a ${Math.abs(pi)} cm da lente (p′ = ${n(pi)} cm). Qual a distância focal da lente?`, ...num(f, "cm"), passos: [R("Gauss com p e p′", eqH(`${frac("1", "f")} = ${frac("1", "p")} + ${frac("1", "p′")} = ${frac("1", p)} + ${frac("1", par(pi))}`)), R("Calcule", `${eqH(`f = ${frac("p·p′", "p + p′")} = ${frac(`${p}·${par(pi)}`, `${p} + ${par(pi)}`)} = <b>${n(f)}</b> cm`)}<p>f positivo: lente <b>convergente</b>.${pi < 0 ? " Imagem virtual e maior com objeto entre o foco e a lente: é a lupa." : ""}</p>`)] };
    },
    "opt-vergencia"() {
      if (Math.random() < 0.5) {
        const f = sorteia([20, 25, 40, 50, 100, -50, -25, -20]);
        const V = 100 / f;
        return { enunciado: `Qual a vergência (em dioptrias) de uma lente ${f > 0 ? "convergente" : "divergente"} de distância focal ${Math.abs(f)} cm? (Use sinal: divergente é negativa.)`, ...num(V, "di"), passos: [R("Distância focal em metros", eqH(`f = ${n(f)} cm = ${n(f / 100)} m`)), R("Vergência", eqH(`V = ${frac("1", "f")} = ${frac("1", par(f / 100))} = <b>${n(V)}</b> di`))] };
      }
      const V = sorteia([2, 2.5, 4, 5, -2, -4]);
      const f = 100 / V;
      return { enunciado: `Uma receita indica lente de ${n(V)} di (“${n(Math.abs(V))} graus” de ${V > 0 ? "hipermetropia" : "miopia"}). Qual a distância focal, em cm (com sinal)?`, ...num(f, "cm"), passos: [R("Inverta a vergência", eqH(`f = ${frac("1", "V")} = ${frac("1", par(V))} = ${n(1 / V)} m`)), R("Em centímetros", eqH(`f = <b>${n(f)}</b> cm ${V < 0 ? "(negativa: lente divergente)" : "(lente convergente)"}`))] };
    },
    "opt-natureza"() {
      const tipo = sorteia(["concavo", "convergente", "convexo", "divergente", "concavo", "convergente"]);
      const f = sorteia([10, 20]), p = sorteia([0.5, 1.5, 2, 3]) * f;
      const r = passosOptica({ tipo, f, p });
      const todas = ["real, invertida e menor", "real, invertida e maior", "real, invertida e do mesmo tamanho", "virtual, direita e maior", "virtual, direita e menor"];
      const certa = r.nat;
      const outras = todas.filter((x) => x !== certa);
      for (let i = outras.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [outras[i], outras[j]] = [outras[j], outras[i]]; }
      const e = embaralhar(certa, outras.slice(0, 3));
      return { tipo: "escolha", enunciado: `Um objeto real é colocado a ${n(p)} cm de ${OPT[tipo].um} cuja distância focal tem módulo ${f} cm. Como é a imagem?`, ...e, passos: r.passos, texto: certa };
    },
    "ond-vlf"() {
      const caso = sorteia(["v", "lam", "f"]);
      const lam = sorteia([0.5, 1, 1.5, 2, 4, 0.2]), f = sorteia([10, 20, 50, 85, 170, 340]);
      const v = lam * f;
      const r = passosOnda(caso === "v" ? { lam, f } : caso === "lam" ? { v, f } : { v, lam });
      const en = caso === "v" ? `Uma onda tem comprimento de onda ${n(lam)} m e frequência ${f} Hz. Qual a sua velocidade?` : caso === "lam" ? `Uma onda se propaga a ${n(v)} m/s com frequência ${f} Hz. Qual o comprimento de onda?` : `Uma onda de comprimento de onda ${n(lam)} m se propaga a ${n(v)} m/s. Qual a frequência?`;
      return { enunciado: en, ...(caso === "v" ? num(v, "m/s") : caso === "lam" ? num(lam, "m") : num(f, "Hz")), passos: r.passos };
    },
    "ond-corda"() {
      const Tr = sorteia([40, 90, 100, 160, 250, 360]), mu = sorteia([0.01, 0.004, 0.025, 0.001]), L = sorteia([0.5, 0.6, 0.8, 1, 1.2]), nh = sorteia([1, 1, 2, 3]);
      const r = passosCorda({ Tr, mu, L, nh });
      return { enunciado: `Uma corda de ${n(L)} m, presa nas duas pontas, tem densidade linear ${n(mu)} kg/m e está tracionada com ${Tr} N. Qual a frequência do ${nh === 1 ? "modo fundamental (1º harmônico)" : nh + "º harmônico"}?`, ...num(r.f, "Hz"), passos: r.passos };
    },
    "ond-tubo"() {
      const fechado = Math.random() < 0.5, L = sorteia([0.17, 0.25, 0.34, 0.5, 0.85, 1.7]), nh = fechado ? sorteia([1, 1, 3]) : sorteia([1, 1, 2]);
      const r = passosTubo({ L, v: 340, nh, fechado });
      return { enunciado: `Um tubo sonoro ${fechado ? "fechado em uma das extremidades" : "aberto nas duas extremidades"} tem ${n(L)} m de comprimento. Com o som a 340 m/s, qual a frequência do ${nh === 1 ? "som fundamental" : nh + "º harmônico"}?`, ...num(r.f, "Hz"), passos: r.passos };
    },
    "ond-db"() {
      if (Math.random() < 0.5) {
        const k = sorteia([-6, -5, -4, -3, -2]), c = sorteia([1, 1, 1, 2, 5]);
        const I = c * Math.pow(10, k);
        const r = passosDecibel({ I });
        return { enunciado: `Um som chega ao ouvido com intensidade de ${c === 1 ? "" : c + "×"}10${String(k).replace("-", "⁻").replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[+d])} W/m². Qual o nível sonoro, em dB? (I₀ = 10⁻¹² W/m²)`, ...num(r.beta, "dB", 0.01, 0.3), passos: r.passos };
      }
      const d = sorteia([10, 20, 30, 40]), fator = Math.pow(10, d / 10);
      return { enunciado: `Um ruído passa de 60 dB para ${60 + d} dB. Por quanto fica multiplicada a intensidade sonora?`, ...num(fator, "vezes"), passos: [R("Diferença de níveis", eqH(`Δβ = 10·log(${frac("I₂", "I₁")}) → ${d} = 10·log(${frac("I₂", "I₁")})`)), R("Desfaça o log", eqH(`${frac("I₂", "I₁")} = 10<sup>${d}/10</sup> = 10<sup>${d / 10}</sup> = <b>${n(fator)}</b>`)), R("Repare", `<p>O nível em dB não é proporcional à intensidade: +${d} dB é ${n(fator)} vezes mais energia por segundo e por metro quadrado.</p>`)] };
    },
    "ond-doppler"() {
      const f = sorteia([400, 500, 680, 850, 1000]), vf = sorteia([0, 10, 20, 34]), vo = vf === 0 ? sorteia([10, 17, 20]) : 0;
      const sinal = Math.random() < 0.6 ? 1 : -1;
      const r = passosDoppler({ f, v: 340, vo: sinal * vo, vf: sinal * vf });
      const quem = vf ? `Uma ambulância com sirene de ${f} Hz ${sinal > 0 ? "se aproxima" : "se afasta"} de uma pessoa parada, a ${vf} m/s.` : `Uma pessoa de bicicleta, a ${vo} m/s, ${sinal > 0 ? "se aproxima" : "se afasta"} de uma sirene parada que emite ${f} Hz.`;
      return { enunciado: `${quem} Com o som a 340 m/s, qual a frequência percebida?`, ...num(r.fl, "Hz", 0.005), passos: r.passos };
    },
    "ter-escala"() {
      const caso = sorteia(["FC", "CF", "CK", "KC"]);
      if (caso === "FC") { const C = sorteia([-40, -10, 0, 20, 25, 30, 37, 40, 100]), F = (C * 9) / 5 + 32; const r = passosEscala({ valor: F, de: "F" }); return { enunciado: `Um termômetro marca ${n(F)} °F. Quanto é isso em °C?`, ...num(C, "°C", 0, 0.3), passos: r.passos }; }
      if (caso === "CF") { const C = sorteia([-40, -10, 15, 20, 25, 35, 40, 60, 100]); const r = passosEscala({ valor: C, de: "C" }); return { enunciado: `Converta ${n(C)} °C para a escala Fahrenheit.`, ...num(r.F, "°F", 0, 0.3), passos: r.passos }; }
      if (caso === "CK") { const C = sorteia([-196, -73, 0, 27, 37, 100, 127]); const r = passosEscala({ valor: C, de: "C" }); return { enunciado: `Converta ${n(C)} °C para kelvin.`, ...num(r.K, "K", 0, 0.3), passos: r.passos }; }
      const K = sorteia([77, 200, 300, 310, 373, 500]); const r = passosEscala({ valor: K, de: "K" });
      return { enunciado: `Converta ${K} K para graus Celsius.`, ...num(r.C, "°C", 0, 0.3), passos: r.passos };
    },
    "ter-calor"() {
      const mat = sorteia([["água", 1], ["alumínio", 0.22], ["ferro", 0.11], ["cobre", 0.093], ["óleo", 0.5]]);
      const m = sorteia([100, 200, 250, 500, 1000]), Ti = sorteia([10, 20, 25]), Tf = sorteia([50, 60, 80, 100]);
      const Q = m * mat[1] * (Tf - Ti);
      return { enunciado: `Quanto calor (em cal) é preciso para aquecer ${m} g de ${mat[0]} (c = ${n(mat[1])} cal/(g·°C)) de ${Ti} °C a ${Tf} °C?`, ...num(Q, "cal"), passos: [R("Calor sensível", `<p>Não há mudança de fase, só de temperatura: Q = m·c·ΔT.</p>${eqH(`ΔT = ${Tf} − ${Ti} = ${Tf - Ti} °C`)}`), R("Substitua", eqH(`Q = ${m}·${n(mat[1])}·${Tf - Ti} = <b>${n(Q)}</b> cal ≈ ${n((Q * 4.184) / 1000)} kJ`))] };
    },
    "ter-curva"() {
      const m = sorteia([10, 20, 50, 100, 200]), Ti = sorteia([-20, -10, 0, -5]), Tf = sorteia([0, 20, 40, 50, 100]);
      if (Tf === Ti) return EX["ter-curva"]();
      const r = passosAquecimento({ m, Ti, Tf });
      const emK = r.Qt >= 10000;
      return { enunciado: `Quanto calor é preciso para transformar ${m} g de gelo a ${n(Ti)} °C em água a ${n(Tf)} °C? (c<sub>gelo</sub> = 0,5 cal/(g·°C), L<sub>f</sub> = 80 cal/g, c<sub>água</sub> = 1 cal/(g·°C))${Tf === 0 ? " Considere que todo o gelo derrete." : ""} Responda em ${emK ? "kcal" : "cal"}.`, ...num(emK ? r.Qt / 1000 : r.Qt, emK ? "kcal" : "cal"), passos: r.passos };
    },
    "ter-mistura"() {
      const ma = sorteia([100, 200, 300, 400]), Ta = sorteia([20, 25, 30]);
      if (Math.random() < 0.5) {
        const mb = sorteia([100, 200, 300]), Tb = sorteia([60, 70, 80, 90]);
        const r = passosMistura({ corpos: [{ m: ma, c: 1, T: Ta, nome: "água fria" }, { m: mb, c: 1, T: Tb, nome: "água quente" }] });
        return { enunciado: `Misturam-se ${ma} g de água a ${Ta} °C com ${mb} g de água a ${Tb} °C, num recipiente isolado de capacidade térmica desprezível. Qual a temperatura de equilíbrio?`, ...num(r.Te, "°C", 0.01, 0.2), passos: r.passos };
      }
      const met = sorteia([["alumínio", 0.22], ["ferro", 0.11], ["cobre", 0.093]]), mm = sorteia([100, 200, 500]), Tm = sorteia([100, 150, 200]);
      const r = passosMistura({ corpos: [{ m: ma, c: 1, T: Ta, nome: "água" }, { m: mm, c: met[1], T: Tm, nome: met[0] }] });
      return { enunciado: `Um bloco de ${met[0]} de ${mm} g (c = ${n(met[1])} cal/(g·°C)) a ${Tm} °C é mergulhado em ${ma} g de água a ${Ta} °C, num recipiente isolado. Qual a temperatura final?`, ...num(r.Te, "°C", 0.01, 0.2), passos: r.passos };
    },
    "ter-gelo"() {
      const ma = sorteia([100, 200, 300, 400, 500]), Ta = sorteia([20, 30, 40, 50, 60, 80]), mg = sorteia([20, 40, 50, 100, 200]), Tg = sorteia([0, -10, -20]);
      const r = passosGelo({ ma, Ta, mg, Tg });
      if (r.caso === "congela" || r.caso === "gelo") return EX["ter-gelo"]();
      const base = `Num recipiente isolado, colocam-se ${mg} g de gelo a ${n(Tg)} °C em ${ma} g de água a ${Ta} °C (c<sub>gelo</sub> = 0,5; c<sub>água</sub> = 1 cal/(g·°C); L<sub>f</sub> = 80 cal/g).`;
      if (r.caso === "tudo") return { enunciado: `${base} Qual a temperatura final de equilíbrio?`, ...num(r.Te, "°C", 0.01, 0.2), passos: r.passos };
      return { enunciado: `${base} Quantos gramas de gelo sobram no equilíbrio?`, ...num(r.sobraGelo, "g", 0.01, 0.3), passos: r.passos };
    },
    "ter-gelo-esc"() {
      const ma = sorteia([100, 200, 300, 500]), Ta = sorteia([10, 20, 40, 60, 80]), mg = sorteia([10, 20, 50, 100, 200, 400]), Tg = sorteia([0, -10, -20, -40]);
      const r = passosGelo({ ma, Ta, mg, Tg });
      const media = (ma * Ta + mg * Tg) / (ma + mg);
      const ops = { tudo: `Só água líquida, a ${n(r.caso === "tudo" ? r.Te : Math.max(media, 1))} °C`, parte: "Água e gelo juntos, a 0 °C", gelo: `Só gelo, a ${n(r.caso === "gelo" ? r.Te : -5)} °C`, media: `Só água líquida, a ${n(media)} °C (média ponderada)` };
      const chave = r.caso === "congela" ? "parte" : r.caso;
      if (chave === "tudo" && Math.abs(media - r.Te) < 0.05) return EX["ter-gelo-esc"]();
      if (chave !== "tudo" && ops.tudo === ops.media) ops.tudo = `Só água líquida, a ${n(Math.max(media, 0) + 2)} °C`;
      const certa = ops[chave], erradas = ["tudo", "parte", "gelo", "media"].filter((k) => k !== chave).map((k) => ops[k]);
      const e = embaralhar(certa, erradas);
      return { tipo: "escolha", enunciado: `Colocam-se ${mg} g de gelo a ${n(Tg)} °C em ${ma} g de água a ${Ta} °C, num recipiente isolado (c<sub>gelo</sub> = 0,5; c<sub>água</sub> = 1 cal/(g·°C); L<sub>f</sub> = 80 cal/g). Qual o estado final?`, ...e, passos: r.passos, texto: certa };
    },
    "ter-dilat"() {
      const mat = sorteia([["aço", 1.2e-5], ["alumínio", 2.4e-5], ["cobre", 1.7e-5], ["concreto", 1.2e-5]]);
      const L0 = sorteia([1, 2, 5, 10, 20, 100]), dT = sorteia([20, 30, 40, 50, 100]);
      const r = passosDilatacao({ X0: L0, alfa: mat[1], dT, dim: 1 });
      const mm = r.dX * 1000;
      return { enunciado: `Uma barra de ${mat[0]} (α = ${n(mat[1] * 1e5)}×10⁻⁵ °C⁻¹) tem ${L0} m a 20 °C. Quanto ela se dilata, em milímetros, ao ser aquecida em ${dT} °C?`, ...num(mm, "mm"), passos: [...r.passos, R("Em milímetros", eqH(`ΔL = ${n(r.dX)} m × 1000 = <b>${n(mm)}</b> mm`))] };
    },
  };
  const GRUPOS = {
    mov: ["mov-pos", "mov-vel", "mov-torr", "mov-enc", "mov-graf"],
    forcas: ["for-plano", "for-puxado", "for-normal", "for-fio", "for-desliza"],
    optica: ["opt-gauss", "opt-aumento", "opt-f", "opt-vergencia", "opt-natureza", "opt-natureza"],
    ondas: ["ond-vlf", "ond-corda", "ond-tubo", "ond-db", "ond-doppler"],
    termo: ["ter-escala", "ter-calor", "ter-curva", "ter-mistura", "ter-gelo", "ter-gelo-esc", "ter-dilat"],
  };
  const TIPOS = [...Object.keys(GRUPOS), ...Object.keys(EX)];
  function gerarExercicio(tipo) {
    if (GRUPOS[tipo]) tipo = sorteia(GRUPOS[tipo]);
    const f = EX[tipo];
    if (!f) return null;
    return f();
  }

  const API = {
    passosMovimento, passosEncontro, passosPlano, passosPuxado, passosFio, passosOptica, cenaOptica, natureza,
    passosOnda, passosCorda, passosTubo, passosDecibel, passosDoppler,
    passosEscala, passosAquecimento, passosMistura, passosGelo, passosDilatacao,
    AGUA, OPT, COR, TIPOS, GRUPOS, gerarExercicio, conferir: Q.conferir, lerNumero, num: n,
  };
  if (NODE) module.exports = API;
  else raiz.FCalc2 = API;
})(typeof window !== "undefined" ? window : globalThis);
