/*
 * Sorteio com semente: a base das provas individuais (Issue #17).
 *
 * Os motores sorteiam com Math.random(). Para que a mesma semente gere sempre
 * a mesma questão (no navegador do aluno e, depois, no servidor que corrige),
 * `comSemente` troca Math.random por um gerador determinístico só durante a
 * chamada (síncrona) e devolve o original em seguida, mesmo se der erro.
 *
 *   semente("prova-42|aluno-7")                 → inteiro de 32 bits
 *   comSemente(s, () => motor.gerarExercicio(t)) → sempre o mesmo exercício
 *   gerarProva(semente, itens, n)                → lista de { item, ex }, determinística
 *
 * Funções puras (testáveis em Node). Não use para nada de segurança: o objetivo é
 * reprodutibilidade, não segredo; o gabarito protegido fica no servidor.
 */
(function (raiz) {
  "use strict";

  /** Hash de texto para semente (cyrb53 reduzido a 32 bits). */
  function semente(texto) {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    const s = String(texto);
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i);
      h1 = Math.imul(h1 ^ c, 2654435761);
      h2 = Math.imul(h2 ^ c, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (h1 ^ h2) >>> 0;
  }

  /** Gerador mulberry32: números em [0, 1), sempre a mesma sequência para a mesma semente. */
  function gerador(s) {
    let a = s >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** Executa fn() com Math.random determinístico. fn precisa ser síncrona. */
  function comSemente(s, fn) {
    const original = Math.random;
    Math.random = gerador(typeof s === "number" ? s : semente(s));
    try {
      return fn();
    } finally {
      Math.random = original;
    }
  }

  /**
   * Monta uma prova determinística: `itens` = [{ motor, tipo, ... }] (os tópicos
   * escolhidos pelo professor), `n` questões, em rodízio embaralhado pela semente.
   * Cada questão tem a própria semente derivada, para poder ser regenerada sozinha
   * (é o que o servidor faz para corrigir uma resposta).
   */
  function gerarProva(s, itens, n) {
    const base = typeof s === "number" ? s : semente(s);
    const ordem = comSemente(base, () => {
      const o = [];
      while (o.length < n) {
        const lote = itens.slice();
        for (let i = lote.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [lote[i], lote[j]] = [lote[j], lote[i]];
        }
        o.push(...lote);
      }
      return o.slice(0, n);
    });
    return ordem.map((item, k) => {
      const sq = semente(`${base}|${k}`);
      return { item, semente: sq, ex: questao(item, sq) };
    });
  }

  /** Regenera uma questão a partir do item e da semente dela. */
  function questao(item, sq) {
    return comSemente(sq, () => item.motor.gerarExercicio(item.tipo));
  }

  const API = { semente, gerador, comSemente, gerarProva, questao };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else raiz.Sorteio = API;
})(typeof window !== "undefined" ? window : globalThis);
