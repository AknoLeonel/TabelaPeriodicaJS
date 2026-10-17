# Roteiro 10/10

Este é o plano vivo do Elementar. Ele nasceu da avaliação do "conselho" (5 conselheiros críticos), que deu nota média **6,4**. Cada item tem uma Issue; o estado real fica na Issue, e este arquivo dá o mapa.

## Por que (os furos apontados)
| Conselheiro | Nota | Furo |
|---|---|---|
| Cético | 5 | aulas sem revisão humana; progresso preso ao navegador; ferramentas demais |
| Investigador | 6 | nenhum ciclo de feedback dentro do app |
| Estrategista | 8 | falta distribuição (professor/turma), ENEM, offline |
| Forasteiro | 6 | a página inicial vende a tabela, não o estudo; não aparece quem revisou |
| Executor | 7 | nunca houve teste com estudantes reais |

## Itens
| Issue | Item | Quem faz | Situação |
|---|---|---|---|
| #18 | Observabilidade só com OTel + Sentry; roteiro de teste com estudantes | agente | ✅ feito (o teste em si é do dono) |
| #13 | Botão "Achei um erro" (abre Issue pré-preenchida) | agente | ✅ feito |
| #16 | Faixa "Estude para a prova" na página inicial + PWA offline | agente | ✅ feito |
| #15 | Exportar/importar progresso por código | agente | ✅ feito (sem QR: exigiria biblioteca) |
| #14 | Selo de revisão, fontes, página "Como verificamos", kit do professor | agente (parte técnica) + **dono** (professores) | parte técnica ✅; falta: revisões reais e testes que conferem os exemplos das aulas pelo motor |
| #17 | Login professor/aluno, provas individuais por semente, correção no servidor, painel, ENEM | agente, **bloqueado** pelas decisões do dono | aguardando |

## O que depende do dono do projeto (manual)
1. **Supabase (#17):** criar o projeto em supabase.com e passar a URL e a chave `anon` (pública). Nunca envie a `service_role`.
2. **Gabarito (#17):** decidir se o aluno vê a resolução logo após a prova ou só quando o professor liberar.
3. **Professores revisores (#14):** um por matéria, usando `docs/revisao-professor.md`. Ao revisar, preencha `revisao` na aula.
4. **Teste com estudantes (#18):** 5 a 8 alunos, seguindo `docs/teste-usuarios.md`. Abra uma Issue por problema encontrado.
5. **Codecov:** segredo `CODECOV_TOKEN` no repositório (Settings → Secrets → Actions).
6. **Sentry (opcional):** criar o projeto e colar o DSN em `js/config.js`.
7. **Política de privacidade e termos (#17):** revisão por alguém responsável antes de abrir contas para menores de idade.

## Decisões já tomadas
- O site continua estático e sem build; o login (quando vier) usa Supabase via CDN.
- O aluno entra sem e-mail (código da turma + apelido + senha), por causa da LGPD.
- A correção das provas do professor roda no servidor; o aluno nunca recebe o gabarito.
- Cada aluno recebe uma semente própria: mesmo tema e dificuldade, números diferentes.
