/*
 * Provas: o laboratório de testes do Estudo.
 *
 * - Painel: domínio por matéria e por tópico, pontos fracos e histórico.
 * - Simulado: questões geradas pelos mesmos motores das ferramentas, de
 *   várias matérias, com cronômetro opcional; no modo "prova" a correção
 *   sai no fim, no modo "treino" a cada questão.
 * - Resultado: nota, tempo, desempenho por tópico, revisão de cada questão
 *   com a resolução e atalho para a aula de cada tópico errado.
 */
(function () {
  "use strict";
  const LAB = window.LAB;
  if (!LAB || !LAB.estudo) return;
  const { el, ui } = LAB;
  const E = LAB.estudo;
  const P = E.progresso;
  const MV = window.Movimento || { deslizar: () => Promise.resolve(), barra: null };
  const COR = "#f2c14e";
  const HIST = "estudo.provas.historico";

  const embaralhar = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const pct = (x) => `${Math.round(x * 100)}%`;
  const materiasCom = () => Object.values(E.materias).filter((m) => m.cfg.id !== "provas" && m.ferr.some((f) => f.prat));
  const topicosDe = (m) => m.ferr.filter((f) => f.prat).map((f) => ({ materia: m.cfg.id, nomeMateria: m.cfg.nome, cor: m.cfg.cor, id: f.id, nome: f.nome, prat: f.prat, motor: m.cfg.motor, chave: `${m.cfg.id}/${f.id}` }));
  const barra = (frac, cor) => `<span class="pv-barra"><i style="width:${Math.round(frac * 100)}%;${cor ? `background:${cor}` : ""}"></i></span>`;

  function criar(caixa) {
    caixa.classList.add("est", "pv");
    const raiz = el("div", "pv-wrap");
    caixa.appendChild(raiz);
    let sessao = null, relogio = 0;
    const topo = () => caixa.scrollTo({ top: 0 });

    // =====================================================================
    // Painel
    // =====================================================================
    function painel() {
      clearInterval(relogio);
      sessao = null;
      raiz.innerHTML = "";
      const mats = materiasCom();
      const cab = el("header", "pv-cab");
      cab.innerHTML = `<p class="est-kicker">Laboratório de testes</p><h3>Provas e simulados</h3><p class="est-resumo">Teste o que você aprendeu com questões novas a cada vez, misturando matérias, com ou sem cronômetro. Cada resposta atualiza o seu domínio de cada tópico, e o app aponta o que revisar.</p>`;
      raiz.appendChild(cab);

      // atalhos
      const at = el("div", "pv-atalhos");
      const card = (titulo, txt, fn, prim) => { const b = el("button", "pv-at" + (prim ? " prim" : ""), `<b>${titulo}</b><span>${txt}</span>`); b.type = "button"; b.addEventListener("click", fn); at.appendChild(b); };
      const todos = mats.flatMap(topicosDe);
      card("Simulado rápido", "10 questões de todas as matérias, correção no fim.", () => iniciar({ topicos: todos, n: 10, modo: "prova", tempo: 0 }), true);
      card("Revisar pontos fracos", "Questões dos tópicos em que seu domínio está mais baixo.", () => iniciar({ topicos: todos, n: 10, modo: "treino", tempo: 0, fracos: true }));
      card("Montar simulado", "Escolha matérias, tópicos, quantidade, modo e tempo.", () => montar());
      raiz.appendChild(at);

      // domínio por matéria
      const sec = el("section", "pv-sec");
      sec.innerHTML = `<h4 class="pv-h">Seu domínio</h4><p class="pv-sub">Calculado com a aula (teste rápido) e as últimas respostas em exercícios e simulados de cada tópico.</p>`;
      for (const m of mats) {
        const tps = topicosDe(m);
        const ds = tps.map((t) => P.dominio(t.chave));
        const media = ds.reduce((a, b) => a + b, 0) / Math.max(ds.length, 1);
        const d = el("details", "pv-mat");
        d.style.setProperty("--c", m.cfg.cor);
        d.innerHTML = `<summary><span class="pv-mat-ic">${m.cfg.icone}</span><b>${m.cfg.nome}</b>${barra(media, m.cfg.cor)}<em>${pct(media)}</em></summary>`;
        const lista = el("div", "pv-tops");
        tps.forEach((t, i) => {
          const linha = el("button", "pv-top", `<span>${t.nome}</span>${barra(ds[i], m.cfg.cor)}<em>${P.nivel(ds[i])}</em>`);
          linha.type = "button";
          linha.title = `Abrir ${t.nome}`;
          linha.addEventListener("click", () => irPara(t.materia, t.id));
          lista.appendChild(linha);
        });
        const bt = ui.botao(`Simulado de ${m.cfg.nome}`, () => iniciar({ topicos: tps, n: 10, modo: "prova", tempo: 0 }), "sec");
        d.append(lista, bt);
        sec.appendChild(d);
      }
      raiz.appendChild(sec);

      // pontos fracos (tópicos já começados com domínio baixo)
      const comecados = todos.map((t) => ({ t, d: P.dominio(t.chave), p: P.ler(t.chave) })).filter((x) => x.p.h.length || x.p.aula);
      if (comecados.length) {
        const fr = comecados.sort((a, b) => a.d - b.d).slice(0, 4);
        const s2 = el("section", "pv-sec");
        s2.innerHTML = `<h4 class="pv-h">O que revisar agora</h4>`;
        const l = el("div", "pv-revisar");
        fr.forEach(({ t, d }) => {
          const b = el("button", "pv-rev", `<b>${t.nome}</b><small>${t.nomeMateria} · domínio ${pct(d)}</small><span>Abrir a aula →</span>`);
          b.type = "button"; b.style.setProperty("--c", t.cor);
          b.addEventListener("click", () => irPara(t.materia, t.id, "teoria"));
          l.appendChild(b);
        });
        s2.appendChild(l);
        raiz.appendChild(s2);
      }

      // histórico
      const hist = E.ler(HIST, []);
      const s3 = el("section", "pv-sec");
      s3.innerHTML = `<h4 class="pv-h">Histórico</h4>`;
      if (!hist.length) s3.appendChild(el("div", "est-vazio", "Seus simulados aparecem aqui, com a nota de cada um."));
      else {
        if (hist.length >= 2 && E.grafico) {
          const gr = E.grafico({ modo: "dados", interativo: false, altura: 180, aria: "Notas dos simulados ao longo do tempo" });
          s3.appendChild(gr.el);
          const pts = hist.slice(-20).map((h, i) => [i + 1, Math.round((100 * h.ok) / h.n)]);
          requestAnimationFrame(() => gr.definir({ x: [0.5, pts.length + 0.5], y: [0, 105], rotX: "simulado", rotY: "nota (%)", nomeX: "simulado", nomeY: "nota", series: [{ tipo: "hline", v: 70, cor: "rgba(155,167,182,.6)", tracejado: true, rotulo: "meta 70%", legenda: false }, { tipo: "linha", pts, cor: COR, rotulo: "nota" }, { tipo: "pontos", pts, cor: COR, legenda: false }] }));
        }
        const tab = el("div", "tab-rolar");
        tab.innerHTML = `<table class="tb"><thead><tr><th>Data</th><th>Matérias</th><th>Nota</th><th>Tempo</th></tr></thead><tbody>${hist.slice(-8).reverse().map((h) => `<tr><td>${new Date(h.data).toLocaleDateString("pt-BR")} ${new Date(h.data).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</td><td>${h.materias.join(", ")}</td><td><b>${h.ok}/${h.n}</b> (${pct(h.ok / h.n)})</td><td>${mmss(h.tempo)}</td></tr>`).join("")}</tbody></table>`;
        s3.appendChild(tab);
      }
      raiz.appendChild(s3);

      const zera = el("button", "pv-zerar", "Apagar meu progresso e histórico");
      zera.type = "button";
      zera.addEventListener("click", () => {
        if (!confirm("Apagar todo o progresso (domínio, aulas concluídas) e o histórico de simulados deste aparelho?")) return;
        P.zerar(); E.guardar(HIST, []); painel();
      });
      raiz.appendChild(zera);
      topo();
    }

    function irPara(materia, ferr, etapa) {
      LAB.ativar(materia).then(() => {
        const inst = LAB.instancia(materia);
        if (inst && inst.abrir) inst.abrir(ferr);
        if (etapa) requestAnimationFrame(() => document.querySelector(`.mod.on .est-etapas button:nth-child(${etapa === "teoria" ? 1 : etapa === "resolver" ? 2 : 3})`)?.click());
      });
    }

    // =====================================================================
    // Montar simulado
    // =====================================================================
    function montar() {
      raiz.innerHTML = "";
      const mats = materiasCom();
      const cab = el("header", "pv-cab");
      cab.innerHTML = `<p class="est-kicker">Laboratório de testes</p><h3>Montar simulado</h3>`;
      raiz.appendChild(cab);
      const escolhidos = new Set(mats.flatMap(topicosDe).map((t) => t.chave));
      const sec = el("section", "pv-sec");
      sec.innerHTML = `<h4 class="pv-h">Tópicos</h4><p class="pv-sub">Toque numa matéria para marcar ou desmarcar todos os tópicos dela.</p>`;
      const grupos = el("div", "pv-grupos");
      const atualizar = () => { grupos.querySelectorAll("input[data-k]").forEach((i) => { i.checked = escolhidos.has(i.dataset.k); }); grupos.querySelectorAll(".pv-gm").forEach((g) => { const ks = [...g.querySelectorAll("input[data-k]")].map((i) => i.dataset.k); g.querySelector(".pv-gt").classList.toggle("parcial", ks.some((k) => escolhidos.has(k)) && !ks.every((k) => escolhidos.has(k))); g.querySelector(".pv-gt").classList.toggle("on", ks.every((k) => escolhidos.has(k))); }); resumo(); };
      for (const m of mats) {
        const g = el("div", "pv-gm");
        g.style.setProperty("--c", m.cfg.cor);
        const tg = el("button", "pv-gt", `${m.cfg.icone}<span>${m.cfg.nome}</span>`);
        tg.type = "button";
        const tps = topicosDe(m);
        tg.addEventListener("click", () => { const todos = tps.every((t) => escolhidos.has(t.chave)); tps.forEach((t) => (todos ? escolhidos.delete(t.chave) : escolhidos.add(t.chave))); atualizar(); });
        const lst = el("div", "pv-gl");
        tps.forEach((t) => {
          const l = el("label", "pv-ck");
          const i = el("input"); i.type = "checkbox"; i.dataset.k = t.chave;
          i.addEventListener("change", () => { i.checked ? escolhidos.add(t.chave) : escolhidos.delete(t.chave); atualizar(); });
          l.append(i, el("span", "", t.nome));
          lst.appendChild(l);
        });
        g.append(tg, lst);
        grupos.appendChild(g);
      }
      sec.appendChild(grupos);
      raiz.appendChild(sec);

      const cfg = el("section", "pv-sec");
      cfg.innerHTML = `<h4 class="pv-h">Formato</h4>`;
      let n = 10, modo = "prova", tempo = 0, fracos = false;
      const rot = (t) => el("p", "est-ajustes-rot", t);
      cfg.append(
        rot("Quantidade de questões"), ui.segmentado({ itens: [5, 10, 20, 30].map((k) => ({ id: String(k), rotulo: String(k) })), valor: "10", onChange: (id) => { n = +id; resumo(); } }).el,
        rot("Correção"), ui.segmentado({ itens: [{ id: "prova", rotulo: "No fim (como prova)" }, { id: "treino", rotulo: "A cada questão" }], valor: "prova", onChange: (id) => { modo = id; } }).el,
        rot("Tempo"), ui.segmentado({ itens: [{ id: "0", rotulo: "Sem limite" }, { id: "60", rotulo: "1 min/questão" }, { id: "120", rotulo: "2 min/questão" }, { id: "180", rotulo: "3 min/questão" }], valor: "0", onChange: (id) => { tempo = +id; resumo(); } }).el,
        rot("Escolha das questões"), ui.segmentado({ itens: [{ id: "n", rotulo: "Equilibrada" }, { id: "f", rotulo: "Mais dos meus pontos fracos" }], valor: "n", onChange: (id) => { fracos = id === "f"; } }).el,
      );
      raiz.appendChild(cfg);
      const res = el("p", "pv-resumo");
      function resumo() { res.textContent = `${n} questões de ${escolhidos.size} tópico(s)${tempo ? ` · ${mmss(n * tempo)} no total` : ""}.`; }
      const bts = el("div", "linha-bt");
      bts.append(ui.botao("Começar →", () => {
        const tps = mats.flatMap(topicosDe).filter((t) => escolhidos.has(t.chave));
        if (!tps.length) { LAB.avisar("Marque pelo menos um tópico."); return; }
        iniciar({ topicos: tps, n, modo, tempo, fracos });
      }), ui.botao("Voltar", () => painel(), "sec"));
      raiz.append(res, bts);
      atualizar();
      topo();
    }

    // =====================================================================
    // Simulado
    // =====================================================================
    function gerarQuestoes(topicos, n, fracos) {
      // sorteio: cada tópico entra em rodízio; com "fracos", tópicos de domínio baixo pesam mais
      const peso = (t) => (fracos ? 0.15 + (1 - P.dominio(t.chave)) ** 2 : 1);
      const qs = [];
      let tentativas = 0;
      const ordem = [];
      while (ordem.length < n) {
        const lote = embaralhar(topicos.slice());
        if (fracos) lote.sort((a, b) => peso(b) * Math.random() - peso(a) * Math.random());
        ordem.push(...lote);
      }
      for (const t of ordem) {
        if (qs.length >= n || tentativas > n * 6) break;
        tentativas++;
        try {
          const ex = t.motor.gerarExercicio(t.prat);
          if (ex && ex.enunciado) qs.push({ t, ex, resp: null, certo: null, marcada: false });
        } catch (_e) { /* gerador falhou: tenta o próximo tópico */ }
      }
      return embaralhar(qs);
    }

    function iniciar({ topicos, n, modo, tempo, fracos, questoes }) {
      const qs = questoes || gerarQuestoes(topicos, n, fracos);
      if (!qs.length) { LAB.avisar("Não consegui gerar questões para esses tópicos."); return; }
      sessao = { qs, i: 0, modo, limite: tempo ? tempo * qs.length : 0, inicio: Date.now(), gasto: 0, entregue: false };
      raiz.innerHTML = "";
      const barraTopo = el("div", "pv-barra-topo");
      const prog = el("div", "pv-prog");
      const relog = el("span", "pv-relogio");
      const info = el("span", "pv-info");
      barraTopo.append(info, relog, prog);
      // progresso do simulado: questões respondidas
      const feitas = MV.barra ? MV.barra("pv-feitas") : null;
      if (feitas) { feitas.el.setAttribute("aria-label", "Questões respondidas"); barraTopo.appendChild(feitas.el); }
      const zona = el("div", "pv-zona");
      const nav = el("div", "linha-bt pv-nav");
      const btAnt = ui.botao("← Anterior", () => ir(sessao.i - 1), "sec");
      const btMarca = ui.botao("Marcar para revisar", () => { const q = sessao.qs[sessao.i]; q.marcada = !q.marcada; pintar(); }, "sec");
      const btProx = ui.botao("Próxima →", () => ir(sessao.i + 1));
      const btEntregar = ui.botao("Entregar", () => entregar(false), "sec");
      nav.append(btAnt, btMarca, btProx, btEntregar);
      raiz.append(barraTopo, zona, nav);
      // Enter no campo leva à próxima questão (no modo prova)
      zona.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.matches("input") && sessao.modo === "prova") { e.preventDefault(); if (sessao.i < sessao.qs.length - 1) ir(sessao.i + 1); else entregar(false); } });

      let atual = null;
      function guardarDigitado() {
        const q = sessao.qs[sessao.i];
        if (atual && q.ex.tipo !== "escolha" && sessao.modo === "prova") { const v = atual.inp.value.trim(); q.resp = v || null; }
      }
      function ir(k) {
        if (k < 0 || k >= sessao.qs.length) return;
        guardarDigitado();
        const direcao = k >= sessao.i ? 1 : -1;
        const trocou = k !== sessao.i || !zona.childElementCount;
        sessao.i = k;
        const q = sessao.qs[k];
        atual = E.questao(zona, q.ex, {
          motor: q.t.motor,
          corrigirNaHora: sessao.modo === "treino",
          reportar: { onde: "prova", materia: q.t.nomeMateria, item: q.t.nome },
          rotulo: `Questão ${k + 1} · ${q.t.nomeMateria} · ${q.t.nome}`,
          aoResponder(c, valor) {
            q.resp = valor;
            if (sessao.modo === "treino") { q.certo = c; P.registrarResposta(q.t.chave, c); }
            pintar();
          },
        });
        if (sessao.modo === "prova" && q.resp != null) {
          if (q.ex.tipo === "escolha") zona.querySelectorAll(".ex-op").forEach((b, j) => b.classList.toggle("marcada", j === q.resp));
          else atual.inp.value = q.resp;
        }
        if (sessao.modo === "treino" && q.certo != null) atual.revelar(q.resp);
        if (trocou) MV.deslizar(zona.firstElementChild, direcao);
        pintar();
        atual.focar();
        topo();
      }
      function pintar() {
        if (feitas) feitas.definir(sessao.qs.filter((x) => x.resp != null).length / sessao.qs.length);
        const s = sessao, q = s.qs[s.i];
        info.innerHTML = `<b>${s.i + 1}</b> de ${s.qs.length} · ${s.modo === "prova" ? "correção no fim" : "correção na hora"}`;
        prog.innerHTML = "";
        s.qs.forEach((x, j) => {
          const b = el("button", "pv-pt" + (j === s.i ? " atual" : "") + (x.resp != null ? " feita" : "") + (x.marcada ? " marcada" : "") + (x.certo === true ? " certa" : x.certo === false ? " errada" : ""), String(j + 1));
          b.type = "button";
          b.setAttribute("aria-label", `Questão ${j + 1}${x.resp != null ? ", respondida" : ""}${x.marcada ? ", marcada" : ""}`);
          b.addEventListener("click", () => ir(j));
          prog.appendChild(b);
        });
        btAnt.disabled = s.i === 0;
        btMarca.textContent = q.marcada ? "Desmarcar" : "Marcar para revisar";
        const ultima = s.i === s.qs.length - 1;
        btProx.hidden = ultima;
        btEntregar.classList.toggle("sec", !ultima);
        btEntregar.textContent = s.modo === "treino" && ultima ? "Ver resultado" : "Entregar";
      }
      function tique() {
        const s = sessao; if (!s || s.entregue) return;
        s.gasto = (Date.now() - s.inicio) / 1000;
        if (s.limite) {
          const resta = Math.max(0, s.limite - s.gasto);
          relog.textContent = `⏱ ${mmss(resta)}`;
          relog.classList.toggle("pouco", resta < 60);
          if (resta <= 0) entregar(true);
        } else relog.textContent = `⏱ ${mmss(s.gasto)}`;
      }
      clearInterval(relogio);
      relogio = setInterval(tique, 1000);
      tique();
      function entregar(esgotou) {
        guardarDigitado();
        const faltam = sessao.qs.filter((q) => q.resp == null).length;
        if (!esgotou && faltam && !confirm(`Há ${faltam} questão(ões) em branco. Entregar assim mesmo?`)) return;
        sessao.entregue = true;
        clearInterval(relogio);
        resultado(esgotou);
      }
      ir(0);
    }

    // =====================================================================
    // Resultado
    // =====================================================================
    function resultado(esgotou) {
      const s = sessao;
      // corrige (no modo prova a correção acontece aqui)
      for (const q of s.qs) {
        if (q.certo == null) {
          let c = false;
          if (q.resp != null && q.resp !== "") c = q.ex.tipo === "escolha" ? q.resp === q.ex.resposta : q.t.motor.conferir(q.ex, String(q.resp)) === true;
          q.certo = c;
          if (s.modo === "prova") P.registrarResposta(q.t.chave, c);
        }
      }
      const ok = s.qs.filter((q) => q.certo).length, n = s.qs.length;
      const materias = [...new Set(s.qs.map((q) => q.t.nomeMateria))];
      const hist = E.ler(HIST, []);
      hist.push({ data: Date.now(), n, ok, tempo: Math.round(s.gasto), materias });
      E.guardar(HIST, hist.slice(-60));
      if (window.Obs) window.Obs.evento("provas.entregue", { questoes: n, acertos: ok, segundos: Math.round(s.gasto), modo: s.modo, materias: materias.length, esgotou: !!esgotou });

      raiz.innerHTML = "";
      const nota = ok / n;
      const cab = el("header", "pv-res");
      const msg = nota >= 0.9 ? "Excelente! Você domina esses tópicos." : nota >= 0.7 ? "Bom resultado. Revise os tópicos marcados abaixo para chegar lá." : nota >= 0.5 ? "No caminho. As aulas dos tópicos com erro vão ajudar bastante." : "Vale voltar às aulas antes do próximo simulado: comece pelos tópicos abaixo.";
      cab.innerHTML = `<div class="pv-nota" style="--p:${nota}"><b>${Math.round(nota * 100)}%</b><small>${ok} de ${n}</small></div><div><p class="est-kicker">${esgotou ? "Tempo esgotado" : "Simulado entregue"} · ${mmss(s.gasto)}</p><h3>${msg}</h3></div>`;
      raiz.appendChild(cab);

      // por tópico
      const por = new Map();
      for (const q of s.qs) { const k = q.t.chave; const x = por.get(k) || { t: q.t, ok: 0, n: 0 }; x.n++; if (q.certo) x.ok++; por.set(k, x); }
      const sec = el("section", "pv-sec");
      sec.innerHTML = `<h4 class="pv-h">Por tópico</h4>`;
      const lista = el("div", "pv-tops");
      [...por.values()].sort((a, b) => a.ok / a.n - b.ok / b.n).forEach((x) => {
        const l = el("div", "pv-top pv-top-res", `<span><b>${x.t.nome}</b> <small>${x.t.nomeMateria}</small></span>${barra(x.ok / x.n, x.t.cor)}<em>${x.ok}/${x.n}</em>`);
        if (x.ok < x.n) {
          const b = el("button", "pv-link", "Revisar a aula →");
          b.type = "button"; b.addEventListener("click", () => irPara(x.t.materia, x.t.id, "teoria"));
          l.appendChild(b);
        }
        lista.appendChild(l);
      });
      sec.appendChild(lista);
      raiz.appendChild(sec);

      // revisão de cada questão
      const rev = el("section", "pv-sec");
      rev.innerHTML = `<h4 class="pv-h">Revisão das questões</h4><p class="pv-sub">Abra cada questão para ver a sua resposta, a certa e a resolução completa.</p>`;
      s.qs.forEach((q, j) => {
        const d = el("details", "pv-q " + (q.certo ? "ok" : "nao"));
        d.innerHTML = `<summary><span class="pv-qn">${j + 1}</span><span class="pv-qt">${q.t.nome} <small>${q.t.nomeMateria}</small></span><span class="pv-qs">${q.certo ? "✓ certa" : q.resp == null ? "em branco" : "✗ errada"}</span></summary>`;
        const corpo = el("div", "pv-qc");
        d.appendChild(corpo);
        d.addEventListener("toggle", () => { if (d.open && !corpo.childElementCount) { const v = E.questao(corpo, q.ex, { motor: q.t.motor, corrigirNaHora: false, rotulo: `Questão ${j + 1}` }); v.revelar(q.resp); } }, { once: false });
        rev.appendChild(d);
      });
      raiz.appendChild(rev);

      const bts = el("div", "linha-bt");
      const erradas = s.qs.filter((q) => !q.certo);
      if (erradas.length) bts.appendChild(ui.botao(`Refazer as ${erradas.length} erradas`, () => iniciar({ modo: "treino", tempo: 0, questoes: erradas.map((q) => ({ t: q.t, ex: q.ex, resp: null, certo: null, marcada: false })) })));
      bts.append(ui.botao("Novo simulado", () => montar(), "sec"), ui.botao("Painel", () => painel(), "sec"));
      raiz.appendChild(bts);
      topo();
    }

    painel();
    return {
      iniciar() { if (!sessao) painel(); },
      parar() { /* o cronômetro continua contando no simulado em andamento */ },
      abrir: () => painel(),
    };
  }

  LAB.modulos.push({
    id: "provas", grupo: "estudo", nome: "Provas", resumo: "Simulados com correção, domínio por tópico e histórico.", cor: COR, selo: "verificavel",
    nota: {
      real: ["As questões são geradas e corrigidas pelos mesmos motores das ferramentas, com a resolução completa de cada uma.", "O domínio de cada tópico combina o teste rápido da aula com as suas últimas respostas."],
      simplificado: ["O progresso fica guardado só neste aparelho (no navegador).", "O sorteio de questões não segue o peso de um vestibular específico."],
    },
    criar,
  });
})();
