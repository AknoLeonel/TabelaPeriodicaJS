/*
 * Casca do laboratório: abertura em "portal", navegação entre módulos, selo de
 * fidelidade científica e som.
 */
(function () {
  "use strict";
  const LAB = window.LAB;
  const { el } = LAB;
  const raiz = document.getElementById("lab");
  const OUT = "cubic-bezier(0.16, 1, 0.3, 1)";

  const IC = {
    voltar: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
    som: '<svg viewBox="0 0 24 24"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
    mudo: '<svg viewBox="0 0 24 24"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="m16 9 5 6M21 9l-5 6"/></svg>',
    estudo: '<svg viewBox="0 0 24 24"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 19.5V5.5"/><path d="M9 8h6M9 12h6"/></svg>',
    lab: '<svg viewBox="0 0 24 24"><path d="M9 3h6"/><path d="M10 3v6.2L4.6 18.3A2 2 0 0 0 6.3 21h11.4a2 2 0 0 0 1.7-2.7L14 9.2V3"/><path d="M7.5 14h9"/></svg>',
  };

  raiz.innerHTML = `
    <header class="lab-top surf">
      <button class="lab-back" id="lab-back" type="button" aria-label="Voltar para a tabela">${IC.voltar}<span class="txt">Tabela</span></button>
      <div class="lab-titulo"><h2 id="lab-h">Laboratório</h2><p id="lab-p"></p></div>
      <button class="selo" id="lab-selo" type="button" aria-haspopup="dialog"></button>
      <button class="lab-ic" id="lab-grupo" type="button"></button>
      <button class="lab-ic" id="lab-som" type="button" aria-label="Som">${IC.som}</button>
    </header>
    <div class="lab-pop surf" id="lab-pop" role="dialog" aria-label="O que é real e o que é simplificado"></div>
    <div class="lab-corpo" id="lab-corpo"></div>
    <nav class="lab-nav surf" id="lab-nav" aria-label="Módulos do laboratório"></nav>`;

  const $ = (s) => raiz.querySelector(s);
  const corpo = $("#lab-corpo");
  const nav = $("#lab-nav");
  const pop = $("#lab-pop");
  const selo = $("#lab-selo");
  const somBt = $("#lab-som");
  const grupoBt = $("#lab-grupo");
  let grupoAtual = "lab";
  const grupoDe = (m) => m.grupo || "lab";
  const modulosDoGrupo = (g = grupoAtual) => LAB.modulos.filter((m) => grupoDe(m) === g);

  const telas = new Map(); // id -> { caixa, instancia }
  let atual = null;
  let aberto = false;
  let anima = null;

  function montarNav() {
    nav.innerHTML = "";
    for (const m of modulosDoGrupo()) {
      const b = el("button", m.emBreve ? "breve" : "", `${m.icone}<span>${m.nome}</span>${m.emBreve ? "<em>em breve</em>" : ""}`);
      b.type = "button";
      b.dataset.id = m.id;
      b.style.setProperty("--m-c", m.cor);
      b.addEventListener("click", () => ativar(m.id));
      nav.appendChild(b);
    }
    const outro = grupoAtual === "lab" ? "estudo" : "lab";
    grupoBt.innerHTML = IC[outro];
    grupoBt.setAttribute("aria-label", outro === "estudo" ? "Ir para o modo Estudo" : "Ir para o Laboratório");
    grupoBt.title = outro === "estudo" ? "Estudo (química e física passo a passo)" : "Laboratório (simulações)";
    nav.classList.toggle("dois", modulosDoGrupo().length <= 3);
  }

  function ativar(id) {
    const m = LAB.modulos.find((x) => x.id === id) || LAB.modulos[0];
    if (!m || atual === m.id) return;
    if (m.emBreve) { LAB.avisar(`${m.nome} chega em breve. Por enquanto, a Química já está pronta.`); return; }
    if (grupoDe(m) !== grupoAtual || !nav.children.length) { grupoAtual = grupoDe(m); montarNav(); }
    if (atual) {
      const t = telas.get(atual);
      t.instancia.parar();
      t.caixa.classList.remove("on");
    }
    let t = telas.get(m.id);
    if (!t) {
      const caixa = el("div", "mod");
      caixa.style.setProperty("--m-c", m.cor);
      corpo.appendChild(caixa);
      t = { caixa, instancia: m.criar(caixa) };
      telas.set(m.id, t);
    }
    t.caixa.classList.add("on");
    atual = m.id;
    raiz.style.setProperty("--lab-c", m.cor);
    $("#lab-h").textContent = m.nome;
    $("#lab-p").textContent = m.resumo;
    const s = LAB.selos[m.selo] || LAB.selos.parcial;
    selo.className = "selo " + s.cls;
    selo.textContent = s.texto;
    pop.classList.remove("on");
    pop.innerHTML = `
      <h5 class="r">O que é real aqui</h5><ul>${m.nota.real.map((x) => `<li>${x}</li>`).join("")}</ul>
      <h5 class="s">O que é simplificado</h5><ul>${m.nota.simplificado.map((x) => `<li>${x}</li>`).join("")}</ul>`;
    nav.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.id === m.id));
    t.instancia.iniciar();
    if (aberto) history.replaceState(null, "", `#${grupoDe(m) === "estudo" ? "estudo" : "lab"}/${m.id}`);
  }

  function abrir(id = "atomo", origem) {
    const jaAberto = aberto;
    aberto = true;
    ativar(id);
    if (jaAberto) return;
    raiz.classList.add("on");
    raiz.setAttribute("aria-hidden", "false");
    const x = origem ? origem.x : innerWidth / 2;
    const y = origem ? origem.y : innerHeight / 2;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 20;
    anima?.cancel();
    if (LAB.reduzMovimento) {
      document.body.classList.add("lab-open");
    } else {
      anima = raiz.animate(
        [{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${r}px at ${x}px ${y}px)` }],
        { duration: 700, easing: OUT }
      );
      anima.finished.then(() => { if (aberto) document.body.classList.add("lab-open"); }).catch(() => {});
    }
    history.replaceState(null, "", `#${atual && LAB.modulos.find((x) => x.id === atual) && grupoDe(LAB.modulos.find((x) => x.id === atual)) === "estudo" ? "estudo" : "lab"}/${atual}`);
  }

  function fechar() {
    if (!aberto) return;
    aberto = false;
    pop.classList.remove("on");
    document.body.classList.remove("lab-open");
    const t = telas.get(atual);
    const b = document.getElementById("lab-open");
    const rb = b ? b.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
    const x = rb.left + rb.width / 2, y = rb.top + rb.height / 2;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 20;
    anima?.cancel();
    const fim = () => {
      raiz.classList.remove("on");
      raiz.setAttribute("aria-hidden", "true");
      if (t) t.instancia.parar();
      atual = null;
    };
    history.replaceState(null, "", location.pathname + location.search);
    if (LAB.reduzMovimento) return fim();
    anima = raiz.animate(
      [{ clipPath: `circle(${r}px at ${x}px ${y}px)` }, { clipPath: `circle(0px at ${x}px ${y}px)` }],
      { duration: 520, easing: "cubic-bezier(0.7, 0, 0.2, 1)", fill: "forwards" }
    );
    anima.finished.then(() => { anima.cancel(); fim(); }).catch(() => {});
    // o módulo para de animar logo, para não competir com a transição
    if (t) t.instancia.parar();
  }

  $("#lab-back").addEventListener("click", fechar);
  grupoBt.addEventListener("click", () => {
    const alvo = grupoAtual === "lab" ? "estudo" : "lab";
    const m = modulosDoGrupo(alvo).find((x) => !x.emBreve);
    if (m) ativar(m.id);
  });
  selo.addEventListener("click", () => pop.classList.toggle("on"));
  corpo.addEventListener("pointerdown", () => pop.classList.remove("on"));
  somBt.addEventListener("click", () => {
    LAB.som.mudo = !LAB.som.mudo;
    somBt.classList.toggle("off", LAB.som.mudo);
    somBt.innerHTML = LAB.som.mudo ? IC.mudo : IC.som;
  });
  document.addEventListener("keydown", (e) => {
    if (!aberto) return;
    if (e.key === "Escape") { if (pop.classList.contains("on")) pop.classList.remove("on"); else fechar(); return; }
    if (e.target.matches && e.target.matches("input, textarea")) return;
    const n = +e.key;
    const lista = modulosDoGrupo();
    if (n >= 1 && n <= lista.length) ativar(lista[n - 1].id);
  });

  // aviso rápido (usa o mesmo balão da página principal)
  LAB.avisar = (msg) => {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("on");
    clearTimeout(LAB._tt);
    LAB._tt = setTimeout(() => t.classList.remove("on"), 2600);
  };
  LAB.abrir = abrir;
  LAB.fechar = fechar;
  LAB.ativar = ativar;
  LAB.estaAberto = () => aberto;
  LAB.instancia = (id) => telas.get(id)?.instancia;
  LAB.pronto = true;
})();
