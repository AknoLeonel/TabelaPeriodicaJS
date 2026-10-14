# AGENTS.md — como trabalhar neste repositório

Este arquivo vale para **qualquer agente de IA de qualquer modelo** (Claude, GPT/Codex, Copilot, Cursor, Gemini, Windsurf…) e para pessoas. Leia antes de mudar qualquer coisa. Os arquivos `CLAUDE.md` e `.github/copilot-instructions.md` apontam para cá.

## 1. Fluxo obrigatório: Issue → branch → PR → deploy

Toda tarefa precisa de uma Issue no GitHub antes de começar, sem exceção, inclusive as pequenas.

1. **Issue.** Abra (ou encontre) a Issue da tarefa usando um dos templates em `.github/ISSUE_TEMPLATE/`. O título começa pelo tipo:
   - `[Correção]` — algo quebrado ou errado (rótulo `bug`);
   - `[Melhoria]` — algo que já existe e vai ficar melhor (rótulo `enhancement`);
   - `[Nova função]` — algo que ainda não existe (rótulo `enhancement`).
   Descreva o contexto, o que fazer em checklist e o critério de aceite.
2. **Branch.** Uma branch por Issue, a partir do `master` atualizado: `tipo/numero-descricao-curta` (ex.: `feat/8-motion-esqueletos`, `fix/14-grafico-negativo`). Se a sua ferramenta impõe um nome de branch, use o dela e cite a Issue no PR.
3. **Commits** no padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/), validado pelo commitlint: `feat(estudo): ...`, `fix(lab): ...`, `test: ...`, `docs: ...`, `build: ...`, `refactor: ...`, `chore: ...`. Cite a Issue no rodapé (`Refs #8` ou `Closes #8`).
4. **Pull Request** para `master`, usando o template. A descrição **sempre menciona a Issue** com `Closes #N` (ou `Refs #N` quando não fecha). Um PR pode fechar várias Issues relacionadas; liste todas.
5. **CI verde** (veja a seção 3) antes de pedir revisão. Não pule, não desligue e não marque testes como ignorados para passar.
6. **Deploy.** A Vercel publica o `master` automaticamente. Todo deploy é, portanto, um PR mesclado. Os PRs também ganham uma prévia da Vercel. Nunca faça push direto no `master`.

## 2. O projeto em 30 segundos

Site **estático, sem build** (HTML, CSS e JavaScript puro), publicado na Vercel. O `package.json` existe só para ferramentas de desenvolvimento; `vercel.json` desliga instalação e build no deploy.

- `index.html`, `style.css`, `js/app.js` — tabela periódica (página inicial).
- `js/lab/` — casca do laboratório e do estudo (`lab.js`, com o catálogo de módulos carregados sob demanda) e as simulações.
- `js/estudo/*-calc.js` e `expressao.js` — **motores**: funções puras que rodam no navegador e em Node.
- `js/estudo/*.js` (sem `-calc`) — interfaces de cada matéria; `aula.js` renderiza as aulas; `provas.js` faz os simulados.
- `js/estudo/aulas/*.js` — **conteúdo** das aulas (só dados).
- `js/movimento.js` — utilitários de animação; `js/obs.js` + `js/config.js` — observabilidade.
- `tests/` — `unit/`, `integration/`, `arch/` (Vitest) e `e2e/` (Playwright).

## 3. Qualidade: o que precisa passar

```bash
npm ci                 # instala as ferramentas (usa .npmrc com legacy-peer-deps)
npm run lint           # Biome (lint; o formatador está desligado de propósito)
npm run arch           # contratos de arquitetura (dependency-cruiser)
npm run knip           # arquivos, exportações e dependências sem uso
npm run test:coverage  # unitários + integração + contratos, com cobertura
npm run test:e2e       # Playwright em celular e computador
npm run check          # lint + arch + knip + testes com cobertura
npm run test:mutation  # Stryker (lento; roda semanalmente no CI)
```

- O CI (`.github/workflows/ci.yml`) roda tudo isso em todo PR, valida as mensagens de commit e envia a cobertura ao **Codecov**.
- Cobertura mínima dos motores: 70% das linhas (configurada no `vitest.config.mjs`). Código novo em motor vem com teste.
- Mudou um motor? Acrescente testes com **valores de livro** em `tests/unit/` (e confira a conta à mão).
- Novo tipo de exercício? Ele entra automaticamente no teste de integração, que gera exercícios e confere se a própria resposta é aceita.
- Nova aula? O teste `tests/integration/aulas.test.mjs` exige o roteiro completo (veja a seção 5).
- Mudou interface? Rode o e2e e olhe as telas em 390 px e 1366 px de largura: nada sobreposto, sem rolagem horizontal, sem erro no console.

## 4. Arquitetura (contratos verificados por teste)

- **Motores são puros**: não usam DOM, `LAB`, `localStorage`, `fetch` nem dependem de interface; exportam com `module.exports` (UMD) e podem depender só de outros motores e de `js/dados.js`.
- **Aulas são só dados**: nada de `document`, eventos, timers ou `innerHTML` nos arquivos de `js/estudo/aulas/`.
- **O laboratório não depende do estudo** (o contrário é permitido).
- **Nada de `eval` ou `new Function`** em `js/`.
- **Nada de pacotes npm em `js/`**: o site não tem build.
- Todo arquivo citado no catálogo de `js/lab/lab.js` precisa existir.
- Resultados de motor: `{ ok: true, passos: [{ t, h }], resposta, respostaHTML, valor }` ou `{ ok: false, erro }`. Os passos explicam o que se faz **e por quê**, com contas e unidades.

## 5. Conteúdo didático

- Público: ensino médio, faculdade e autodidatas. Português do Brasil, vírgula decimal, unidade separada por espaço, rigor científico total.
- Cada aula segue o roteiro de `js/estudo/aula.js`: objetivos (3+), seções (3+, cada uma com 250+ caracteres), fórmulas com o significado de cada símbolo, exemplos resolvidos (2+, idealmente 3), erros comuns (3+), aplicações (3+), teste rápido (4+ perguntas de conceito, com a resposta certa variando de posição e explicação), resumo (4+) e "para ir além".
- Nunca escreva `${` ou crase dentro do texto das aulas (são template strings).

## 6. Motion (animação)

Seguimos a skill [design-motion-principles](https://github.com/kylezantos/design-motion-principles): app educacional ⇒ Jakub Krehel (polimento sutil) como lente principal, Jhey Tompkins (descoberta, raro) como secundária e Emil Kowalski (restrição) nas interações frequentes.

- Use os tokens de `style.css` (`--dur-*`, `--ease-entra`, `--ease-sai`, `--ease-troca`) e o `js/movimento.js` (`entrar`, `sair`, `alternar`, `deslizar`, `revelar`, `barra`, `esqueleto`, `quandoVisivel`).
- Toda tela que carrega mostra **esqueleto** e, quando der, **progresso real**; conteúdo pesado (gráficos, blocos longos) é **lazy**.
- Entrar com ease-out, sair com ease-in, progresso linear; a saída é mais curta e sutil que a entrada; nada começa de `scale(0)`; anime só `transform` e `opacity`.
- Interação frequente (digitar, recalcular, trocar de aba) fica rápida ou instantânea.
- Evite "AI-slop": pulsos em loop, blur em tudo, escala no hover de tudo, stagger em toda lista, animar texto estático.
- `prefers-reduced-motion` é obrigatório (há teste e2e para isso).

## 7. Observabilidade

- Use `window.Obs` (`span`, `evento`, `metrica`, `erro`) em carregamentos, ações importantes e falhas. **Nunca envie dados pessoais** (nada de nomes, e-mails, respostas digitadas livremente).
- Os serviços (OpenTelemetry/OTLP, Sentry, Datadog RUM, New Relic) são ligados em `js/config.js`; sem configuração nada sai do navegador. Só chaves públicas de navegador vão para o código; tokens secretos nunca.

## 8. Antes de abrir o PR (checklist)

- [ ] Existe uma Issue e o PR tem `Closes #N`.
- [ ] Commits em Conventional Commits.
- [ ] `npm run check` e `npm run test:e2e` passam.
- [ ] Testes novos para o comportamento novo (valores de livro nos motores).
- [ ] Telas conferidas em celular e computador, com e sem movimento reduzido.
- [ ] Nenhum segredo, dado pessoal ou `console.log` de depuração no código.
- [ ] README/AGENTS.md atualizados se o jeito de trabalhar mudou.
