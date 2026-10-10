/*
 * Motor de física nuclear do laboratório.
 *
 * O que é real aqui:
 *  - Energia de ligação: valores experimentais para núcleos leves e importantes e a
 *    fórmula semi-empírica de massa (modelo da gota líquida, Weizsäcker) para o resto.
 *  - Valores Q de decaimento e energias de separação, derivados das energias de ligação.
 *  - Meias-vidas e modos de decaimento experimentais de ~200 núcleos (tabelas abaixo).
 *  - Para os demais: meia-vida estimada (alfa: Viola-Seaborg; beta: ordem de grandeza).
 *
 * Todas as energias em MeV, tempos em segundos.
 */
(function (raiz) {
  "use strict";

  const K = {
    MEV_U: 931.494,
    MP: 938.272,
    MN: 939.565,
    ME: 0.511,
    DM: 0.782, // (m_n - m_H) c², em MeV
    B_ALFA: 28.2957,
    AVOGADRO: 6.02214076e23,
  };
  const MIN = 60, H = 3600, D = 86400, ANO = 3.15576e7;

  // ---------------------------------------------------------------------------
  // Energia de ligação
  // ---------------------------------------------------------------------------
  // Valores experimentais (MeV), chave = Z*1000 + A
  const EXP = {
    1002: 2.2246, 1003: 8.4818, 2003: 7.718, 2004: 28.2957, 2006: 29.271, 3006: 31.994, 3007: 39.245,
    4007: 37.6, 4008: 56.5, 4009: 58.165, 4010: 64.977, 5010: 64.751, 5011: 76.205, 6011: 73.44, 6012: 92.162,
    6013: 97.108, 6014: 105.285, 7013: 94.105, 7014: 104.659, 7015: 115.492, 8015: 111.955, 8016: 127.619,
    8017: 131.762, 8018: 139.808, 9018: 137.37, 9019: 147.801, 10020: 160.645, 10022: 177.77, 11022: 174.145,
    11023: 186.564, 12024: 198.257, 12026: 216.681, 13027: 224.952, 14028: 236.537, 14030: 255.62,
    15031: 262.917, 16032: 271.781, 18040: 343.81, 19040: 341.52, 20040: 342.052, 26054: 471.76,
    26056: 492.254, 27060: 524.8, 28056: 483.988, 28058: 506.46, 28062: 545.259, 29063: 551.38, 38090: 782.63,
    53131: 1103.3, 55137: 1149.3, 82206: 1622.34, 82207: 1629.07, 82208: 1636.43, 84210: 1645.2,
    86222: 1708.2, 88226: 1731.6, 92235: 1783.87, 92238: 1801.69, 94239: 1806.9,
  };

  function semf(Z, N) {
    const A = Z + N;
    if (A < 2) return 0;
    const a13 = Math.cbrt(A);
    let b = 15.75 * A - 17.8 * a13 * a13 - (0.711 * Z * (Z - 1)) / a13 - (23.7 * (A - 2 * Z) * (A - 2 * Z)) / A;
    const par = 11.18 / Math.sqrt(A);
    if (Z % 2 === 0 && N % 2 === 0) b += par;
    else if (Z % 2 === 1 && N % 2 === 1) b -= par;
    return b;
  }
  const temExp = (Z, N) => EXP[Z * 1000 + Z + N] !== undefined;

  // Energia de ligação de um núcleo (experimental quando existe)
  function ligacao(Z, N) {
    if (Z < 0 || N < 0) return -Infinity;
    const e = EXP[Z * 1000 + Z + N];
    return e !== undefined ? e : semf(Z, N);
  }
  // Para diferenças entre vizinhos: só mistura experimental e modelo se ambos forem experimentais
  function par(Z1, N1, Z2, N2) {
    if (temExp(Z1, N1) && temExp(Z2, N2)) return [ligacao(Z1, N1), ligacao(Z2, N2)];
    return [semf(Z1, N1), semf(Z2, N2)];
  }

  const qBetaMenos = (Z, N) => { const [a, b] = par(Z, N, Z + 1, N - 1); return K.DM + b - a; };
  const qCaptura = (Z, N) => { const [a, b] = par(Z, N, Z - 1, N + 1); return -K.DM + b - a; };
  const qAlfa = (Z, N) => { const [a, b] = par(Z, N, Z - 2, N - 2); return b + K.B_ALFA - a; };
  const sNeutron = (Z, N) => { const [a, b] = par(Z, N, Z, N - 1); return a - b; };
  const sProton = (Z, N) => { const [a, b] = par(Z, N, Z - 1, N); return a - b; };

  // massa atômica em u
  const massaU = (Z, N) => Z * 1.00782503 + N * 1.00866492 - ligacao(Z, N) / K.MEV_U;

  // ---------------------------------------------------------------------------
  // Tabelas experimentais
  // ---------------------------------------------------------------------------
  const ESTAVEIS = {};
  (function () {
    const lista = {
      1: [1, 2], 2: [3, 4], 3: [6, 7], 4: [9], 5: [10, 11], 6: [12, 13], 7: [14, 15], 8: [16, 17, 18], 9: [19],
      10: [20, 21, 22], 11: [23], 12: [24, 25, 26], 13: [27], 14: [28, 29, 30], 15: [31], 16: [32, 33, 34, 36],
      17: [35, 37], 18: [36, 38, 40], 19: [39, 41], 20: [40, 42, 43, 44, 46, 48], 21: [45], 22: [46, 47, 48, 49, 50],
      23: [51], 24: [50, 52, 53, 54], 25: [55], 26: [54, 56, 57, 58], 27: [59], 28: [58, 60, 61, 62, 64],
      29: [63, 65], 30: [64, 66, 67, 68, 70], 31: [69, 71], 32: [70, 72, 73, 74, 76], 33: [75],
      34: [74, 76, 77, 78, 80, 82], 35: [79, 81], 36: [78, 80, 82, 83, 84, 86], 47: [107, 109],
      50: [112, 114, 115, 116, 117, 118, 119, 120, 122, 124], 53: [127], 54: [124, 126, 128, 129, 130, 131, 132, 134, 136],
      55: [133], 79: [197], 80: [196, 198, 199, 200, 201, 202, 204], 82: [204, 206, 207, 208], 83: [209],
    };
    for (const z in lista) for (const a of lista[z]) ESTAVEIS[z * 1000 + a] = true;
  })();

  // [meia-vida (s), ramos [[modo, probabilidade], ...]]   modos: a, b-, b+ (β⁺ ou captura), n, p
  const ISO = {};
  const iso = (Z, A, t, ramos) => { ISO[Z * 1000 + A] = [t, typeof ramos === "string" ? [[ramos, 1]] : ramos]; };

  iso(0, 1, 609, "b-");
  iso(1, 3, 12.32 * ANO, "b-");
  iso(2, 5, 7e-22, "n"); iso(2, 6, 0.8067, "b-"); iso(2, 8, 0.1191, "b-");
  iso(1, 4, 1e-22, "n");
  iso(3, 5, 3e-22, "p"); iso(3, 8, 0.8399, "b-"); iso(3, 9, 0.1783, "b-");
  iso(4, 7, 53.22 * D, "b+"); iso(4, 8, 8.19e-17, "a"); iso(4, 10, 1.387e6 * ANO, "b-");
  iso(5, 8, 0.77, "b+");
  iso(6, 10, 19.29, "b+"); iso(6, 11, 20.36 * MIN, "b+"); iso(6, 14, 5730 * ANO, "b-"); iso(6, 15, 2.449, "b-");
  iso(7, 12, 0.011, "b+"); iso(7, 13, 9.965 * MIN, "b+"); iso(7, 16, 7.13, "b-");
  iso(8, 15, 122.24, "b+"); iso(8, 19, 26.88, "b-");
  iso(9, 17, 64.49, "b+"); iso(9, 18, 109.77 * MIN, "b+"); iso(9, 20, 11.07, "b-");
  iso(10, 23, 37.15, "b-");
  iso(11, 22, 2.6029 * ANO, "b+"); iso(11, 24, 14.997 * H, "b-");
  iso(13, 26, 7.17e5 * ANO, "b+");
  iso(15, 32, 14.268 * D, "b-");
  iso(16, 35, 87.37 * D, "b-");
  iso(17, 36, 3.01e5 * ANO, "b-");
  iso(19, 40, 1.248e9 * ANO, [["b-", 0.8928], ["b+", 0.1072]]);
  iso(24, 51, 27.7 * D, "b+");
  iso(25, 54, 312.2 * D, "b+");
  iso(26, 55, 2.737 * ANO, "b+"); iso(26, 59, 44.5 * D, "b-");
  iso(27, 57, 271.7 * D, "b+"); iso(27, 60, 5.2714 * ANO, "b-");
  iso(28, 63, 101 * ANO, "b-");
  iso(29, 64, 12.7 * H, [["b+", 0.615], ["b-", 0.385]]);
  iso(30, 65, 243.9 * D, "b+");
  iso(31, 67, 3.2617 * D, "b+");
  iso(34, 75, 119.78 * D, "b+");
  iso(36, 85, 10.756 * ANO, "b-");
  iso(38, 90, 28.79 * ANO, "b-");
  iso(39, 90, 64 * H, "b-");
  iso(42, 99, 65.94 * H, "b-");
  iso(43, 99, 2.111e5 * ANO, "b-");
  iso(53, 123, 13.22 * H, "b+"); iso(53, 125, 59.4 * D, "b+"); iso(53, 129, 1.57e7 * ANO, "b-"); iso(53, 131, 8.0252 * D, "b-");
  iso(54, 133, 5.2475 * D, "b-");
  iso(55, 134, 2.0652 * ANO, "b-"); iso(55, 137, 30.17 * ANO, "b-");
  iso(56, 133, 10.51 * ANO, "b+");
  iso(61, 147, 2.6234 * ANO, "b-");
  iso(71, 177, 6.647 * D, "b-");
  iso(77, 192, 73.83 * D, [["b-", 0.95], ["b+", 0.05]]);
  iso(79, 198, 2.6941 * D, "b-");
  iso(81, 201, 72.912 * H, "b+");

  // Série do urânio-238 (4n+2)
  iso(92, 238, 4.468e9 * ANO, "a"); iso(90, 234, 24.1 * D, "b-"); iso(91, 234, 1.159 * MIN, "b-");
  iso(92, 234, 2.455e5 * ANO, "a"); iso(90, 230, 7.54e4 * ANO, "a"); iso(88, 226, 1600 * ANO, "a");
  iso(86, 222, 3.8235 * D, "a"); iso(84, 218, 3.098 * MIN, "a"); iso(82, 214, 26.8 * MIN, "b-");
  iso(83, 214, 19.9 * MIN, "b-"); iso(84, 214, 164.3e-6, "a"); iso(82, 210, 22.2 * ANO, "b-");
  iso(83, 210, 5.012 * D, "b-"); iso(84, 210, 138.376 * D, "a");
  // Série do urânio-235 (4n+3)
  iso(92, 235, 7.04e8 * ANO, "a"); iso(90, 231, 25.52 * H, "b-"); iso(91, 231, 3.276e4 * ANO, "a");
  iso(89, 227, 21.772 * ANO, [["b-", 0.986], ["a", 0.014]]); iso(90, 227, 18.68 * D, "a"); iso(88, 223, 11.43 * D, "a");
  iso(86, 219, 3.96, "a"); iso(84, 215, 1.781e-3, "a"); iso(82, 211, 36.1 * MIN, "b-");
  iso(83, 211, 2.14 * MIN, "a"); iso(81, 207, 4.77 * MIN, "b-");
  // Série do tório-232 (4n)
  iso(90, 232, 1.405e10 * ANO, "a"); iso(88, 228, 5.75 * ANO, "b-"); iso(89, 228, 6.15 * H, "b-");
  iso(90, 228, 1.9116 * ANO, "a"); iso(88, 224, 3.66 * D, "a"); iso(86, 220, 55.6, "a");
  iso(84, 216, 0.145, "a"); iso(82, 212, 10.64 * H, "b-"); iso(83, 212, 60.55 * MIN, [["b-", 0.6406], ["a", 0.3594]]);
  iso(84, 212, 2.99e-7, "a"); iso(81, 208, 3.053 * MIN, "b-");
  // Série do neptúnio-237 (4n+1)
  iso(93, 237, 2.144e6 * ANO, "a"); iso(91, 233, 26.975 * D, "b-"); iso(92, 233, 1.592e5 * ANO, "a");
  iso(90, 229, 7340 * ANO, "a"); iso(88, 225, 14.9 * D, "b-"); iso(89, 225, 9.92 * D, "a");
  iso(87, 221, 4.9 * MIN, "a"); iso(85, 217, 32.3e-3, "a"); iso(83, 213, 45.59 * MIN, [["b-", 0.9791], ["a", 0.0209]]);
  iso(84, 213, 3.72e-6, "a"); iso(81, 209, 2.162 * MIN, "b-"); iso(82, 209, 3.253 * H, "b-");
  // Outros actinídeos importantes
  iso(92, 236, 2.342e7 * ANO, "a"); iso(94, 238, 87.7 * ANO, "a"); iso(94, 239, 24110 * ANO, "a");
  iso(94, 240, 6561 * ANO, "a"); iso(95, 241, 432.6 * ANO, "a"); iso(96, 244, 18.1 * ANO, "a");
  iso(98, 252, 2.645 * ANO, "a"); iso(96, 248, 3.48e5 * ANO, "a"); iso(94, 244, 8.0e7 * ANO, "a");

  // ---------------------------------------------------------------------------
  // Decaimento: tabela experimental, depois modelo
  // ---------------------------------------------------------------------------
  // Meia-vida alfa (Viola-Seaborg, parâmetros de Sobiczewski)
  function tAlfa(Z, N, Q) {
    if (Q <= 0) return Infinity;
    const hlog = Z % 2 === 0 ? (N % 2 === 0 ? 0 : 1.066) : N % 2 === 0 ? 0.772 : 1.114;
    return Math.pow(10, (1.66175 * Z - 8.5166) / Math.sqrt(Q) - 0.20228 * Z - 33.9069 + hlog);
  }
  // Beta/captura: só a ordem de grandeza (regra de Sargent aproximada)
  function tBeta(Q) {
    if (Q <= 0) return Infinity;
    return 3162 / Math.pow(Math.max(Q, 0.003), 4);
  }

  const cacheInfo = new Map();

  function nomeElemento(Z) {
    const d = raiz.DADOS && raiz.DADOS[Z - 1];
    if (d && d.n === Z) return { s: d.s, nome: raiz.DESCRICOES && raiz.DESCRICOES[Z] ? raiz.DESCRICOES[Z][0] : d.s, cat: d.c };
    if (Z === 0) return { s: "n", nome: "Nêutron", cat: "desconhecido" };
    return { s: "Z" + Z, nome: "Elemento " + Z + " (hipotético)", cat: "desconhecido" };
  }

  // Descrição completa de um núcleo (Z prótons, N nêutrons)
  function info(Z, N) {
    const chave = Z * 1000 + N;
    const chaveA = Z * 1000 + Z + N;
    const c = cacheInfo.get(chave);
    if (c) return c;
    const A = Z + N;
    const el = nomeElemento(Z);
    const B = ligacao(Z, N);
    const r = {
      Z, N, A, simbolo: el.s, nome: el.nome, cat: el.cat,
      B, BporA: A ? B / A : 0, massaU: A ? massaU(Z, N) : 0,
      estado: "estavel", ramos: [], t: Infinity, fonte: "modelo", confianca: "alta",
    };

    if (A === 0) { r.estado = "vazio"; cacheInfo.set(chave, r); return r; }

    const tab = ISO[chaveA];
    if (tab) {
      r.estado = tab[0] < 1e-18 ? "naoligado" : "instavel"; // ressonâncias que se desfazem na hora
      r.fonte = "exp";
      r.t = tab[0];
      r.ramos = tab[1].map(([modo, p]) => ({ modo, p, t: tab[0] / p, q: qDe(Z, N, modo) }));
    } else if (ESTAVEIS[chaveA] || (Z === 1 && N === 0)) {
      r.fonte = "exp";
    } else if (Z === 0 && N >= 2) {
      r.estado = "naoligado"; r.ramos = [{ modo: "n", p: 1, t: 1e-22, q: 0 }]; r.t = 1e-22;
    } else {
      // modelo
      const leve = A < 12;
      r.confianca = leve ? "baixa" : A < 40 ? "media" : "alta";
      const sn = N > 0 ? sNeutron(Z, N) : 1;
      const sp = Z > 0 ? sProton(Z, N) : 1;
      if (sn < 0 && A > 2) {
        r.estado = "naoligado"; r.t = 1e-22; r.ramos = [{ modo: "n", p: 1, t: 1e-22, q: -sn }];
      } else if (sp < 0 && A > 2) {
        r.estado = "naoligado"; r.t = 1e-22; r.ramos = [{ modo: "p", p: 1, t: 1e-22, q: -sp }];
      } else {
        const canais = [];
        // O modelo erra por ~1 MeV: Q pequenos contam como "estável" (margem de segurança)
        if (N > 0) { const q = qBetaMenos(Z, N); if (q > 0.5) canais.push({ modo: "b-", q, t: tBeta(q) }); }
        if (Z > 0) { const q = qCaptura(Z, N); if (q > 1.0) canais.push({ modo: "b+", q, t: tBeta(q) }); }
        if (Z >= 52 && N >= 2) { const q = qAlfa(Z, N); if (q > 0) canais.push({ modo: "a", q, t: tAlfa(Z, N, q) }); }
        if (canais.length) {
          canais.sort((a, b) => a.t - b.t);
          const m = canais[0];
          // acima de ~10¹² anos, na prática, não decai
          if (m.t < 3e19) {
            r.estado = "instavel";
            r.t = m.t;
            r.ramos = [{ modo: m.modo, p: 1, t: m.t, q: m.q }];
          }
        }
      }
    }
    cacheInfo.set(chave, r);
    return r;
  }

  function qDe(Z, N, modo) {
    if (modo === "a") return qAlfa(Z, N);
    if (modo === "b-") return qBetaMenos(Z, N);
    if (modo === "b+") return qCaptura(Z, N);
    return 0;
  }

  // Núcleo filho de um decaimento
  function filho(Z, N, modo) {
    switch (modo) {
      case "a": return [Z - 2, N - 2];
      case "b-": return [Z + 1, N - 1];
      case "b+": return [Z - 1, N + 1];
      case "n": return [Z, N - 1];
      case "p": return [Z - 1, N];
      default: return [Z, N];
    }
  }

  // Escolhe o ramo de decaimento (sorteio pela probabilidade experimental)
  function sortearRamo(inf, rnd = Math.random) {
    if (!inf.ramos.length) return null;
    let x = rnd();
    for (const r of inf.ramos) { x -= r.p; if (x <= 0) return r; }
    return inf.ramos[0];
  }

  // Cadeia completa até um núcleo estável
  function cadeia(Z, N, rnd = Math.random, maximo = 40) {
    const passos = [];
    let z = Z, n = N;
    for (let i = 0; i < maximo; i++) {
      const inf = info(z, n);
      if (inf.estado === "estavel" || inf.estado === "vazio") break;
      const ramo = sortearRamo(inf, rnd);
      if (!ramo) break;
      const [z2, n2] = filho(z, n, ramo.modo);
      if (z2 < 0 || n2 < 0) break;
      passos.push({ Z: z, N: n, modo: ramo.modo, t: ramo.t, q: ramo.q, Z2: z2, N2: n2 });
      z = z2; n = n2;
    }
    return passos;
  }

  // ---------------------------------------------------------------------------
  // Utilidades
  // ---------------------------------------------------------------------------
  // Número do elemento com maior energia de ligação para uma massa A (vale da estabilidade)
  function zEstavel(A) {
    return Math.max(1, Math.round(A / (1.98 + 0.0155 * Math.pow(A, 2 / 3))));
  }
  // Energia de ligação por núcleon medida do isóbaro mais ligado, A = 1..40 (MeV)
  const BA_EXP = [0, 0, 1.112, 2.827, 7.074, 5.27, 5.332, 5.606, 7.062, 6.463, 6.475, 6.928, 7.68, 7.47, 7.476, 7.699, 7.976,
    7.751, 7.767, 7.779, 8.032, 7.972, 8.08, 8.111, 8.261, 8.223, 8.333, 8.332, 8.448, 8.449, 8.521, 8.481, 8.493, 8.498,
    8.583, 8.52, 8.576, 8.57, 8.614, 8.557, 8.595];
  // Energia de ligação por núcleon do núcleo mais ligado de massa A
  function curvaBA(A) {
    if (A < 2) return 0;
    if (A < BA_EXP.length) return BA_EXP[A];
    const z0 = zEstavel(A);
    let melhor = 0;
    for (let z = Math.max(1, z0 - 2); z <= z0 + 2; z++) {
      const n = A - z;
      if (n < 0) continue;
      melhor = Math.max(melhor, ligacao(z, n) / A);
    }
    return melhor;
  }

  const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  const sup = (n) => String(n).replace(/\d/g, (d) => SUP[+d]);
  const SUB = "₀₁₂₃₄₅₆₇₈₉";
  const sub = (n) => String(n).replace(/\d/g, (d) => SUB[+d]);

  function num(v, casas = 2) {
    return v.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
  }
  function sci(v, casas = 2) {
    if (!isFinite(v) || v === 0) return "0";
    const e = Math.floor(Math.log10(Math.abs(v)));
    const m = v / Math.pow(10, e);
    return `${num(m, casas)}×10${sup(e).replace("-", "⁻")}`.replace(/⁻/g, "⁻");
  }
  function tempo(s) {
    if (!isFinite(s)) return "estável";
    if (s < 1e-9) return `${num(s * 1e12, 0)} ps`;
    if (s < 1e-6) return `${num(s * 1e9, s * 1e9 < 10 ? 1 : 0)} ns`;
    if (s < 1e-3) return `${num(s * 1e6, s * 1e6 < 10 ? 1 : 0)} µs`;
    if (s < 1) return `${num(s * 1e3, s * 1e3 < 10 ? 1 : 0)} ms`;
    if (s < 60) return `${num(s, s < 10 ? 1 : 0)} s`;
    if (s < 3600) return `${num(s / 60, s < 600 ? 1 : 0)} min`;
    if (s < 86400) return `${num(s / 3600, s < 36000 ? 1 : 0)} h`;
    if (s < 365.25 * 86400 * 2) return `${num(s / 86400, s < 864000 ? 1 : 0)} dias`;
    const a = s / ANO;
    if (a < 1e4) return `${num(a, a < 100 ? 1 : 0)} anos`;
    if (a < 1e6) return `${num(a / 1e3, a < 1e5 ? 1 : 0)} mil anos`;
    if (a < 1e9) return `${num(a / 1e6, a < 1e8 ? 1 : 0)} milhões de anos`;
    if (a < 1e12) return `${num(a / 1e9, a < 1e11 ? 2 : 1)} bilhões de anos`;
    return `${sci(a, 1)} anos`;
  }

  const MODOS = {
    a: { nome: "Decaimento alfa (α)", curto: "α", cor: "#ffd23f" },
    "b-": { nome: "Decaimento beta menos (β⁻)", curto: "β⁻", cor: "#4da3ff" },
    b: { nome: "Beta mais ou captura eletrônica (β⁺/CE)", curto: "β⁺/CE", cor: "#ff5a7a" },
    "b+": { nome: "Beta mais ou captura eletrônica (β⁺/CE)", curto: "β⁺/CE", cor: "#ff5a7a" },
    n: { nome: "Emissão de nêutron", curto: "n", cor: "#b8c0d8" },
    p: { nome: "Emissão de próton", curto: "p", cor: "#ff8a5a" },
  };

  const API = {
    K, MIN, H, D, ANO,
    EXP, ESTAVEIS, ISO,
    semf, ligacao, par, temExp,
    qBetaMenos, qCaptura, qAlfa, sNeutron, sProton, massaU,
    tAlfa, tBeta,
    info, filho, sortearRamo, cadeia, nomeElemento,
    zEstavel, curvaBA,
    sup, sub, num, sci, tempo, MODOS,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else raiz.LabFisica = API;
})(typeof window !== "undefined" ? window : globalThis);
