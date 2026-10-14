/*
 * Aula: transforma os dados de uma aula (js/estudo/aulas/*.js) numa página de
 * estudo com o mesmo roteiro em todas as matérias:
 *
 *   objetivos → ideia → explicação → fórmulas (cada símbolo explicado) →
 *   exemplos resolvidos (um passo de cada vez) → erros comuns → onde aparece →
 *   teste rápido (com correção e explicação) → resumo → para ir além.
 *
 * Formato de uma aula:
 * {
 *   tempo: 12, nivel: "Ensino médio",
 *   objetivos: ["..."], requisitos: [{ id, nome }],
 *   secoes: [{ t: "título", h: "<p>html</p>", grafico?: { op, cena } }],
 *   formulas: [{ nome, eq: "html", simbolos: [["M", "massa molar", "g/mol"]], obs: "html" }],
 *   exemplos: [{ t, enunciado: "html", passos: ["html", ...], resposta: "html" }],
 *   erros: [{ errado: "html", certo: "html", porque: "html" }],
 *   aplicacoes: ["html"],
 *   teste: [{ p: "html", op: ["html", ...], certa: 0, explica: "html" }],
 *   resumo: ["html"],
 *   alem: { t: "título", h: "html" }
 * }
 */
(function () {
  "use strict";
  const LAB = window.LAB;
  if (!LAB || !LAB.estudo) return;
  const { el, ui } = LAB;
  const E = LAB.estudo;
  const MV = window.Movimento || { revelar: () => Promise.resolve(), barra: null };

  const IC = {
    alvo: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/></svg>',
    lampada: '<svg viewBox="0 0 24 24"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.6 1 2.5h6c0-.9.2-1.7 1-2.5A6 6 0 0 0 12 3z"/></svg>',
    formula: '<svg viewBox="0 0 24 24"><path d="M5 5h14M5 19h14"/><path d="M7 5l6 7-6 7"/></svg>',
    lapis: '<svg viewBox="0 0 24 24"><path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/></svg>',
    alerta: '<svg viewBox="0 0 24 24"><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/></svg>',
    mundo: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M4 12l5 5L20 6"/></svg>',
    lista: '<svg viewBox="0 0 24 24"><path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h.5M4 12h.5M4 18h.5"/></svg>',
    subir: '<svg viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
  };
  const bloco = (cls, icone, titulo, id) => {
    const s = el("section", "aula-b " + cls);
    if (id) s.id = id;
    s.innerHTML = `<h4 class="aula-h"><span class="aula-ic">${icone}</span>${titulo}</h4>`;
    return s;
  };
  let seq = 0;

  function renderAula(raiz, A, ctx) {
    const pref = "aula" + ++seq + "-";
    raiz.innerHTML = "";
    raiz.classList.add("aula");
    const prog = E.progresso.ler(ctx.chave);

    // ---------- abertura ----------
    const topo = el("header", "aula-topo");
    const meta = [A.tempo ? `≈ ${A.tempo} min` : "", A.nivel || "", prog.aula ? "concluída ✓" : ""].filter(Boolean);
    topo.innerHTML = `<p class="aula-meta">Aula${meta.length ? " · " + meta.join(" · ") : ""}</p>`;
    if (A.objetivos && A.objetivos.length) {
      const ob = el("div", "aula-obj");
      ob.innerHTML = `<b>Ao final desta aula você vai saber:</b><ul>${A.objetivos.map((o) => `<li>${o}</li>`).join("")}</ul>`;
      topo.appendChild(ob);
    }
    if (A.requisitos && A.requisitos.length) {
      const rq = el("p", "aula-req", "Ajuda já saber: ");
      A.requisitos.forEach((r, i) => {
        const b = el("button", "aula-link", r.nome);
        b.type = "button";
        b.addEventListener("click", () => ctx.irPara && ctx.irPara(r.id));
        rq.append(b, document.createTextNode(i < A.requisitos.length - 1 ? ", " : "."));
      });
      topo.appendChild(rq);
    }
    raiz.appendChild(topo);

    // progresso de leitura: quanto da aula já passou pela tela
    if (MV.barra) {
      const leitura = MV.barra("aula-leitura");
      leitura.el.setAttribute("aria-label", "Progresso de leitura da aula");
      raiz.prepend(leitura.el);
      const rolador = raiz.closest(".mod") || document.scrollingElement;
      let quadro = 0;
      const medir = () => {
        quadro = 0;
        if (!raiz.isConnected) { rolador.removeEventListener("scroll", aoRolar); return; }
        const r = raiz.getBoundingClientRect(), vh = rolador.clientHeight || innerHeight;
        const total = r.height - vh * 0.6;
        leitura.definir(total > 0 ? (vh * 0.4 - r.top) / total : 1);
      };
      const aoRolar = () => { if (!quadro) quadro = requestAnimationFrame(medir); };
      rolador.addEventListener("scroll", aoRolar, { passive: true });
      requestAnimationFrame(medir);
    }

    // ---------- índice ----------
    const partes = [];
    (A.secoes || []).forEach((s, i) => partes.push({ id: pref + "s" + i, nome: s.t }));
    if (A.formulas && A.formulas.length) partes.push({ id: pref + "f", nome: "Fórmulas" });
    if (A.exemplos && A.exemplos.length) partes.push({ id: pref + "x", nome: "Exemplos resolvidos" });
    if (A.erros && A.erros.length) partes.push({ id: pref + "e", nome: "Erros comuns" });
    if (A.aplicacoes && A.aplicacoes.length) partes.push({ id: pref + "a", nome: "Onde aparece" });
    if (A.teste && A.teste.length) partes.push({ id: pref + "t", nome: "Teste rápido" });
    if (A.resumo && A.resumo.length) partes.push({ id: pref + "r", nome: "Resumo" });
    if (A.alem) partes.push({ id: pref + "al", nome: "Para ir além" });
    const ind = el("nav", "aula-ind");
    ind.setAttribute("aria-label", "Partes da aula");
    ind.innerHTML = `<b>Nesta aula</b>`;
    const ol = el("ol");
    partes.forEach((p) => {
      const li = el("li");
      const b = el("button", "", p.nome);
      b.type = "button";
      b.addEventListener("click", () => document.getElementById(p.id)?.scrollIntoView({ behavior: "smooth", block: "start" }));
      li.appendChild(b);
      ol.appendChild(li);
    });
    ind.appendChild(ol);
    raiz.appendChild(ind);

    // ---------- explicação ----------
    (A.secoes || []).forEach((s, i) => {
      const b = bloco("aula-sec", i === 0 ? IC.lampada : IC.lista, s.t, pref + "s" + i);
      const c = el("div", "teoria-c", s.h);
      b.appendChild(c);
      if (s.grafico && E.grafico) {
        const gr = E.grafico({ interativo: false, ...(s.grafico.op || {}) });
        b.appendChild(gr.el);
        if (s.grafico.legenda) b.appendChild(el("p", "aula-leg", s.grafico.legenda));
        requestAnimationFrame(() => gr.definir(s.grafico.cena));
      }
      raiz.appendChild(b);
    });

    // ---------- fórmulas ----------
    if (A.formulas && A.formulas.length) {
      const b = bloco("aula-form", IC.formula, "Fórmulas e o que cada letra significa", pref + "f");
      for (const f of A.formulas) {
        const c = el("div", "aula-fcard");
        c.innerHTML = `${f.nome ? `<p class="aula-fnome">${f.nome}</p>` : ""}<div class="eq">${f.eq}</div>` +
          (f.simbolos && f.simbolos.length ? `<div class="tab-rolar"><table class="tb aula-sim"><thead><tr><th>Símbolo</th><th>Significa</th><th>Unidade (SI)</th></tr></thead><tbody>${f.simbolos.map(([s, n, u]) => `<tr><td class="aula-s">${s}</td><td>${n}</td><td>${u || "—"}</td></tr>`).join("")}</tbody></table></div>` : "") +
          (f.obs ? `<p class="aula-fobs">${f.obs}</p>` : "");
        b.appendChild(c);
      }
      raiz.appendChild(b);
    }

    // ---------- exemplos resolvidos ----------
    if (A.exemplos && A.exemplos.length) {
      const b = bloco("aula-ex", IC.lapis, "Exemplos resolvidos", pref + "x");
      b.appendChild(el("p", "aula-dica", "Tente resolver no caderno antes de abrir cada passo. É assim que a conta vira sua."));
      A.exemplos.forEach((x, i) => {
        const c = el("div", "aula-excard");
        c.innerHTML = `<p class="aula-exn">Exemplo ${i + 1}${x.t ? " · " + x.t : ""}</p><div class="aula-exen">${x.enunciado}</div>`;
        const ol = el("ol", "passos");
        const lis = x.passos.map((p, k) => {
          const li = el("li", "passo oculto");
          li.innerHTML = `<span class="pn">${k + 1}</span><div class="pb"><div class="pc">${p}</div></div>`;
          ol.appendChild(li);
          return li;
        });
        const resp = el("div", "resp oculto");
        resp.innerHTML = `<small>Resposta</small><div class="resp-v">${x.resposta}</div>`;
        let vis = 0;
        const linha = el("div", "linha-bt");
        const prox = ui.botao(`Mostrar o passo 1 de ${x.passos.length}`, () => {
          if (vis < lis.length) { lis[vis].classList.remove("oculto"); MV.revelar(lis[vis]); vis++; }
          if (vis >= lis.length) { resp.classList.remove("oculto"); MV.revelar(resp); prox.remove(); tudo.remove(); }
          else prox.textContent = `Mostrar o passo ${vis + 1} de ${x.passos.length}`;
        });
        const tudo = ui.botao("Ver tudo", () => { lis.forEach((l) => l.classList.remove("oculto")); resp.classList.remove("oculto"); vis = lis.length; prox.remove(); tudo.remove(); }, "sec");
        linha.append(prox, tudo);
        c.append(ol, resp, linha);
        b.appendChild(c);
      });
      raiz.appendChild(b);
    }

    // ---------- erros comuns ----------
    if (A.erros && A.erros.length) {
      const b = bloco("aula-err", IC.alerta, "Erros comuns (e como evitar)", pref + "e");
      for (const e of A.erros) {
        const c = el("div", "aula-errcard");
        c.innerHTML = `<div class="aula-errado"><span>✗</span><div>${e.errado}</div></div><div class="aula-certo"><span>✓</span><div>${e.certo}</div></div>${e.porque ? `<p class="aula-porque">${e.porque}</p>` : ""}`;
        b.appendChild(c);
      }
      raiz.appendChild(b);
    }

    // ---------- aplicações ----------
    if (A.aplicacoes && A.aplicacoes.length) {
      const b = bloco("aula-apl", IC.mundo, "Onde isso aparece", pref + "a");
      b.appendChild(el("ul", "aula-apll", A.aplicacoes.map((a) => `<li>${a}</li>`).join("")));
      raiz.appendChild(b);
    }

    // ---------- teste rápido ----------
    if (A.teste && A.teste.length) {
      const b = bloco("aula-teste", IC.alvo, "Teste rápido", pref + "t");
      b.appendChild(el("p", "aula-dica", `${A.teste.length} perguntas de conceito. Acerte pelo menos 75% para marcar a aula como concluída.`));
      const placar = el("p", "aula-placar");
      let respondidas = 0, acertos = 0;
      A.teste.forEach((t, i) => {
        const c = el("div", "aula-q");
        c.innerHTML = `<p class="aula-qp"><b>${i + 1}.</b> ${t.p}</p>`;
        const ops = el("div", "ex-opcoes");
        const exp = el("div", "aula-exp");
        exp.hidden = true;
        t.op.forEach((o, k) => {
          const bt = el("button", "ex-op", `<i>${"ABCDE"[k]}</i><span>${o}</span>`);
          bt.type = "button";
          bt.addEventListener("click", () => {
            ops.querySelectorAll(".ex-op").forEach((x, j) => { x.disabled = true; x.classList.toggle("certa", j === t.certa); x.classList.toggle("errada", j === k && k !== t.certa); });
            const ok = k === t.certa;
            exp.hidden = false;
            MV.revelar(exp);
            exp.className = "aula-exp " + (ok ? "ok" : "nao");
            exp.innerHTML = `<b>${ok ? "Isso!" : "Não é essa."}</b> ${t.explica || ""}`;
            respondidas++; if (ok) acertos++;
            placar.textContent = `${acertos} de ${respondidas} certas${respondidas === A.teste.length ? "" : ` · faltam ${A.teste.length - respondidas}`}`;
            if (respondidas === A.teste.length) {
              const frac = acertos / A.teste.length;
              E.progresso.registrarTeste(ctx.chave, frac);
              if (window.Obs) window.Obs.evento("estudo.aula_teste", { aula: ctx.chave, acertos, perguntas: A.teste.length, concluida: frac >= 0.75 });
              fim.hidden = false;
              fim.className = "aula-fim " + (frac >= 0.75 ? "ok" : "");
              fim.innerHTML = frac >= 0.75
                ? `<b>Aula concluída!</b> Você acertou ${acertos} de ${A.teste.length}. Agora aplique em problemas de verdade.`
                : `<b>${acertos} de ${A.teste.length}.</b> Releia as partes ligadas às perguntas que errou (as explicações acima ajudam) e tente de novo.`;
              fim.appendChild(acoes());
              if (frac < 0.75) {
                const rb = ui.botao("Refazer o teste", () => renderAula(raiz, A, ctx), "sec");
                fim.querySelector(".linha-bt").prepend(rb);
              }
            }
          });
          ops.appendChild(bt);
        });
        c.append(ops, exp);
        b.appendChild(c);
      });
      const fim = el("div", "aula-fim");
      fim.hidden = true;
      b.append(placar, fim);
      raiz.appendChild(b);
    }

    // ---------- resumo ----------
    if (A.resumo && A.resumo.length) {
      const b = bloco("aula-res", IC.check, "Resumo para revisar", pref + "r");
      b.appendChild(el("ul", "aula-resl", A.resumo.map((r) => `<li>${r}</li>`).join("")));
      raiz.appendChild(b);
    }
    if (A.alem) {
      const d = el("details", "aula-alem");
      d.id = pref + "al";
      d.innerHTML = `<summary>${A.alem.t || "Para ir além"}</summary><div class="teoria-c">${A.alem.h}</div>`;
      raiz.appendChild(d);
    }

    function acoes() {
      const l = el("div", "linha-bt");
      l.appendChild(ui.botao("Resolver um problema →", () => ctx.irEtapa("resolver")));
      if (ctx.temPratica) l.appendChild(ui.botao("Praticar com exercícios", () => ctx.irEtapa("treino"), "sec"));
      return l;
    }
    const rod = el("div", "aula-rod");
    rod.appendChild(acoes());
    const sobe = el("button", "aula-sobe", `${IC.subir}<span>Voltar ao início da aula</span>`);
    sobe.type = "button";
    sobe.addEventListener("click", () => topo.scrollIntoView({ behavior: "smooth", block: "start" }));
    rod.appendChild(sobe);
    raiz.appendChild(rod);
  }

  E.renderAula = renderAula;
})();
