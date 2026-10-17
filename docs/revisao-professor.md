# Kit de revisão para professores

Obrigado por revisar uma aula do Elementar. Cada aula leva de 30 a 60 minutos para revisar. Sua revisão aparece na aula com o seu nome, a sua formação e a data (só com a sua autorização).

## Como acessar a aula
1. Abra o site, entre em **Estudo**, escolha a matéria e a ferramenta, e abra a etapa **Aprender**.
2. No fim da aula, toque em **Imprimir para revisão**. Sai uma versão com todos os passos abertos e o **gabarito do teste rápido** (dá para salvar em PDF).
3. Marque no papel ou no PDF o que precisa mudar.

## Checklist por aula
Marque cada item como ✅ ok, ✏️ ajustar ou ❌ errado.

**Conceito**
- [ ] As definições estão corretas e no nível indicado (ensino médio ou faculdade).
- [ ] Não há simplificação que vire erro (ex.: "o elétron gira em órbita" sem ressalva).
- [ ] A ordem das ideias faz sentido para quem está aprendendo.

**Notação e unidades**
- [ ] Símbolos, unidades e algarismos significativos seguem o padrão (SI, vírgula decimal, unidade separada por espaço).
- [ ] Cada fórmula explica o significado de todos os símbolos.

**Exemplos resolvidos**
- [ ] Refiz as contas e os resultados batem.
- [ ] Cada passo diz **o que** se faz e **por quê**.

**Erros comuns e aplicações**
- [ ] Os erros comuns são reais (você já viu alunos cometendo).
- [ ] As aplicações estão corretas e não exageram.

**Teste rápido**
- [ ] Há uma única alternativa correta em cada pergunta.
- [ ] As alternativas erradas (distratores) são plausíveis e a explicação mostra por que estão erradas.

**Fontes**
- [ ] As referências do fim da aula são adequadas. Sugira outras, se quiser.

## Como devolver
Escolha o que for mais fácil:
- **Pelo próprio site:** em cada problema, use **Achei um erro** e descreva a correção.
- **Pelo GitHub:** abra uma Issue com o título `[Correção] Revisão da aula <nome>` e anexe o PDF marcado.
- **Por mensagem:** mande o PDF marcado para quem pediu a revisão.

Quando as correções forem feitas, a aula passa a mostrar **Revisada por Prof(a). Nome (formação) em data**.

## Para quem mantém o site
Depois de aplicar as correções, registre a revisão em `js/estudo/verificacao.js`:

```js
E.revisoes["quimica/massa"] = { por: "Prof.ª Ana Souza", formacao: "Licenciada em Química (UFMG)", data: "2026-11-02" };
```

Regras:
- Só registre depois de a revisão realmente acontecer e com autorização para mostrar o nome.
- Se a aula mudar bastante depois, peça uma nova revisão e atualize a data.
- O teste `tests/integration/aulas.test.mjs` confere que a aula existe e que nome, formação e data estão preenchidos.
