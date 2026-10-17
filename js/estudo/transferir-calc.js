/*
 * Transferir o progresso entre aparelhos, sem conta e sem servidor.
 * Funções puras (testáveis em Node):
 *   codificar({ progresso, historico }) → código de texto ("EL1." + base64url do JSON)
 *   decodificar(codigo) → { ok: true, progresso, historico } | { ok: false, erro }
 *   mesclar(atual, vindo) → { progresso, historico } (nunca perde o que já existe)
 */
(function (raiz) {
  "use strict";

  const PREFIXO = "EL1.";

  function paraBase64url(texto) {
    const bytes = new TextEncoder().encode(texto);
    let bin = "";
    for (const b of bytes) bin += String.fromCharCode(b);
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function deBase64url(s) {
    const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64 + "===".slice((b64.length + 3) % 4));
    return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
  }

  // só os campos conhecidos, com tipos conferidos (o código pode vir de qualquer lugar)
  function limparItem(p) {
    if (!p || typeof p !== "object") return null;
    const h = Array.isArray(p.h) ? p.h.filter((x) => x === 0 || x === 1).slice(-12) : [];
    const teste = Number.isFinite(p.teste) ? Math.min(1, Math.max(0, p.teste)) : 0;
    const t = Number.isFinite(p.t) && p.t > 0 ? p.t : 0;
    return { aula: p.aula === true, teste, h, t };
  }
  function limparHist(h) {
    if (!h || typeof h !== "object") return null;
    const n = Number(h.n), ok = Number(h.ok), data = Number(h.data), tempo = Number(h.tempo) || 0;
    if (!Number.isInteger(n) || n <= 0 || !Number.isInteger(ok) || ok < 0 || ok > n || !Number.isFinite(data)) return null;
    const materias = Array.isArray(h.materias) ? h.materias.filter((m) => typeof m === "string").map((m) => m.slice(0, 40)).slice(0, 10) : [];
    return { ...h, n, ok, data, tempo, materias };
  }
  const CHAVE_OK = /^[a-z0-9-]{1,40}\/[a-z0-9-]{1,60}$/i;

  function codificar({ progresso = {}, historico = [] } = {}) {
    const p = {};
    for (const [k, v] of Object.entries(progresso)) {
      const item = CHAVE_OK.test(k) && limparItem(v);
      if (item) p[k] = item;
    }
    const h = (historico || []).map(limparHist).filter(Boolean);
    return PREFIXO + paraBase64url(JSON.stringify({ v: 1, p, h }));
  }

  function decodificar(codigo) {
    const s = String(codigo || "").trim().replace(/\s+/g, "");
    if (!s) return { ok: false, erro: "Cole o código gerado no outro aparelho." };
    if (!s.startsWith(PREFIXO)) return { ok: false, erro: "Este não parece um código do Elementar (ele começa com EL1.)." };
    let dados;
    try {
      dados = JSON.parse(deBase64url(s.slice(PREFIXO.length)));
    } catch (_e) {
      return { ok: false, erro: "O código está incompleto ou foi alterado. Copie de novo, inteiro." };
    }
    if (!dados || dados.v !== 1 || typeof dados.p !== "object") return { ok: false, erro: "Código de uma versão que este aparelho não conhece." };
    const progresso = {};
    for (const [k, v] of Object.entries(dados.p || {})) {
      const item = CHAVE_OK.test(k) && limparItem(v);
      if (item) progresso[k] = item;
    }
    const historico = (Array.isArray(dados.h) ? dados.h : []).map(limparHist).filter(Boolean);
    return { ok: true, progresso, historico };
  }

  function mesclar(atual, vindo) {
    const progresso = {};
    const a = atual.progresso || {}, b = vindo.progresso || {};
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      const x = limparItem(a[k]), y = limparItem(b[k]);
      if (!x || !y) { progresso[k] = x || y; continue; }
      const recente = y.t > x.t ? y : x;
      progresso[k] = { aula: x.aula || y.aula, teste: Math.max(x.teste, y.teste), h: recente.h.slice(), t: Math.max(x.t, y.t) };
    }
    const vistos = new Set();
    const historico = [...(atual.historico || []), ...(vindo.historico || [])]
      .map(limparHist).filter(Boolean)
      .filter((h) => { const id = `${h.data}|${h.n}|${h.ok}`; if (vistos.has(id)) return false; vistos.add(id); return true; })
      .sort((p, q) => p.data - q.data);
    return { progresso, historico };
  }

  const API = { codificar, decodificar, mesclar, PREFIXO };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else raiz.Transferir = API;
})(typeof window !== "undefined" ? window : globalThis);
