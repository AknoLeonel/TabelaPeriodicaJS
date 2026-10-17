/*
 * "Achei um erro": o estudante descreve o problema e o site abre uma Issue
 * pré-preenchida no GitHub (template correcao.yml). Não há servidor: nada é
 * enviado sem o estudante clicar em "Abrir no GitHub". O evento de observabilidade
 * leva só o tipo do erro e o contexto técnico (matéria, aula ou tipo), nunca o texto digitado.
 */
(function (raiz) {
	"use strict";

	const REPO = "https://github.com/AknoLeonel/TabelaPeriodicaJS";
	const TIPOS = ["Conta ou resposta errada", "Conceito ou texto incorreto", "Enunciado confuso", "Problema na tela", "Outro"];
	const texto = (html) => {
		const d = document.createElement("div");
		d.innerHTML = String(html || "");
		return d.textContent.replace(/\s+/g, " ").trim().slice(0, 600);
	};

	/** Monta a URL da Issue. `ctx` = { onde, materia, item, enunciado }. Exportada para teste. */
	function urlIssue(ctx, tipo, comentario) {
		const local = typeof location !== "undefined" ? location.href : "";
		const nav = typeof navigator !== "undefined" ? navigator.userAgent : "";
		const titulo = `[Correção] ${tipo}: ${[ctx.materia, ctx.item].filter(Boolean).join(" / ") || ctx.onde}`;
		const oQue = [`**Tipo:** ${tipo}`, `**Onde:** ${ctx.onde}${ctx.materia ? ` · ${ctx.materia}` : ""}${ctx.item ? ` · ${ctx.item}` : ""}`, ctx.enunciado ? `**Enunciado:** ${texto(ctx.enunciado)}` : "", comentario ? `**Comentário do estudante:** ${comentario}` : ""].filter(Boolean).join("\n\n");
		const p = new URLSearchParams({ template: "correcao.yml", title: titulo.slice(0, 120), "o-que": oQue, como: `Abrir ${local}`, ambiente: nav.slice(0, 120) });
		return `${REPO}/issues/new?${p.toString()}`;
	}

	/** Botão discreto que abre o formulário logo abaixo dele. */
	function botao(ctx) {
		const w = document.createElement("div");
		w.className = "rep";
		const b = document.createElement("button");
		b.type = "button";
		b.className = "rep-bt";
		b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 21V4h11l-1.5 4L16 12H5"/></svg>Achei um erro';
		b.setAttribute("aria-expanded", "false");
		w.appendChild(b);
		let form = null;
		b.addEventListener("click", () => {
			if (form) {
				form.remove();
				form = null;
				b.setAttribute("aria-expanded", "false");
				return;
			}
			form = document.createElement("form");
			form.className = "rep-form";
			form.innerHTML = `<label>O que está errado?<select name="tipo">${TIPOS.map((t) => `<option>${t}</option>`).join("")}</select></label>
<label>Detalhes (opcional)<textarea name="obs" rows="3" maxlength="800" placeholder="Ex.: a resposta deveria ser 18,02 g/mol, segundo o livro X."></textarea></label>
<p class="rep-nota">Abre uma página do GitHub com tudo preenchido. É preciso ter conta lá para enviar. Não escreva dados pessoais.</p>
<div class="linha-bt"><button type="submit" class="bt">Abrir no GitHub</button><button type="button" class="bt sec" data-c>Cancelar</button></div>`;
			form.querySelector("[data-c]").addEventListener("click", () => b.click());
			form.addEventListener("submit", (e) => {
				e.preventDefault();
				const tipo = form.tipo.value;
				raiz.open(urlIssue(ctx, tipo, form.obs.value.trim().slice(0, 800)), "_blank", "noopener");
				if (raiz.Obs) raiz.Obs.evento("erro_reportado", { onde: ctx.onde, materia: ctx.materia || "", item: ctx.item || "", tipo });
				form.innerHTML = '<p class="rep-ok">Obrigado! Revisamos todo erro reportado.</p>';
			});
			w.appendChild(form);
			b.setAttribute("aria-expanded", "true");
			if (raiz.Movimento) raiz.Movimento.entrar(form, { y: -4, dur: raiz.Movimento.DUR.curta });
			form.tipo.focus();
		});
		return w;
	}

	raiz.Reportar = { botao, urlIssue, TIPOS };
})(typeof window !== "undefined" ? window : globalThis);
