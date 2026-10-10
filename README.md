# Elementar

Tabela periódica, laboratório de simulações e ferramentas de estudo passo a passo para química, física, matemática e pesquisa, em português. Feito para quem está no ensino médio, na faculdade ou estuda sozinho: cada resultado mostra a conta inteira, para você conferir e aprender o caminho.

## Como abrir

Não precisa de build nem de dependências. Abra o `index.html` no navegador ou sirva a pasta:

```bash
python3 -m http.server 8000
# depois acesse http://localhost:8000
```

Endereços diretos: `#Fe` ou `#79` (elemento), `#lab/atomo` (laboratório), `#estudo/fisica` (estudo). Na primeira visita aparece o guia **Como usar**, que sempre pode ser reaberto pelo botão ou pela tecla `?`.

## Identidade visual

A interface segue a ideia de um **caderno de laboratório**: fundo quadriculado discreto, superfícies sólidas com linhas finas, cor só onde ela informa (categoria do elemento, matéria do estudo, estado de um núcleo) e números em fonte monoespaçada, como no visor de um instrumento. Não há brilhos decorativos, desfoques ou partículas de enfeite.

| Elemento | Escolha |
| --- | --- |
| Marca | Ladrilho amarelo “El” (como uma célula da tabela) + nome **Elementar** |
| Tipografia | IBM Plex Sans (texto) e IBM Plex Mono (números, equações, entradas) |
| Fundo e superfícies | Grafite `#0f1318`, painéis `#161b22`, linhas `#2b3441` |
| Cor de ação | Amarelo `#f2c14e` (Estudo, foco do teclado) |
| Cores por matéria | Química verde, Física azul, Matemática âmbar, Pesquisa rosa |
| Categorias da tabela | Paleta sóbria de 11 cores, usada como faixa no topo de cada célula |

Os tokens ficam em `:root` no `style.css`; os componentes do laboratório e do estudo usam só essas variáveis.

## Tabela

- **Ficha do elemento**: tags rápidas e mapa de posição, propriedades, gráfico comparativo com toda a tabela, simulador de temperatura (sólido, líquido, gás), configuração eletrônica, onde é encontrado, como é obtido, usos, descoberta e curiosidades.
- **Zoom cinematográfico**: a câmera avança sobre a tabela e o elemento vem para o primeiro plano, com o modelo atômico (elétrons nas camadas reais).
- **Modos**: categoria, estado físico (0 a 6000 K), eletronegatividade, raio atômico e linha do tempo das descobertas.
- **Busca** por nome, símbolo ou número (`/`), elemento aleatório (`R`), navegação com ← →.
- **No celular**: pince para ampliar (quanto mais perto, mais informação em cada célula), cartão de elemento do dia e atalhos para Estudo e Laboratório.

## Estudo

Botão **Estudo** (tecla `E`). Todas as ferramentas seguem o mesmo padrão:

- **Entenda a teoria**: o conceito em linguagem simples, as fórmulas e os erros comuns.
- **Resolver**: você digita o que o problema dá e recebe a resposta e o **passo a passo** (com botão Copiar). No modo **guiado** os passos aparecem um de cada vez, para tentar antes de ver.
- **Praticar**: exercícios novos a cada clique, corrigidos pelo mesmo motor que resolve, com placar.

Aceita `1,5`, `1e-3`, `1,5x10^-3` e `1/3`.

| Matéria | Ferramentas |
| --- | --- |
| **Química** | Massa molar · mol e conversões · balanceamento (álgebra exata) · estequiometria (limitante e rendimento) · soluções e diluição · pH · gases ideais · distribuição eletrônica · **Nox e oxirredução** (agentes, elétrons, balanceamento em meio ácido/básico) · **equações iônicas** (precipitação, neutralização, íons espectadores) · **eletroquímica** (pilhas, Nernst, Faraday, tabela de E°) · **termoquímica** (ΔH por formação, Hess, ΔG, calorimetria, energias de ligação) · **equilíbrio** (K, Q × K, tabela ICE, Kc ↔ Kp, Kps, tampões) · **cinética** (leis integradas, ordem a partir de dados, velocidades iniciais, Arrhenius) |
| **Física** | Resolvedor de fórmulas em 7 assuntos (escolhe a fórmula ou a cadeia de fórmulas, converte para o SI, isola, calcula e confere a dimensão) · circuitos série/paralelo · lançamento oblíquo com trajetória · conversor de unidades · formulário pesquisável |
| **Matemática** | Equações do 1º e 2º grau (Bhaskara com gráfico) e sistemas 2×2/3×3 com frações exatas · regra de três simples e composta, porcentagem · potências, logaritmos e notação científica · trigonometria (círculo, triângulo retângulo, leis dos senos e cossenos) · vetores 2D/3D · derivadas e integrais simbólicas · gráficos de funções |
| **Pesquisa** | Ajuste linear por mínimos quadrados (com incertezas, R², resíduos e linearizações) · propagação de incertezas (GUM) · algarismos significativos · estatística de medidas (t de Student, Chauvenet) · constantes CODATA 2018 · tabelas para relatório (CSV, LaTeX, Markdown) |

**Confiabilidade.** Os resultados vêm de algoritmos, não de IA. Cada motor (`js/estudo/*-calc.js`) roda também em Node e é testado com valores de livro, ida e volta (isolar e substituir devolve o valor original), conferências numéricas (derivadas por diferenças finitas, integrais por Simpson) e centenas de exercícios gerados. Os limites de cada modelo (gases ideais, sem resistência do ar, integrais só com regras elementares etc.) estão escritos no próprio app.

## Laboratório

Botão **Laboratório** (tecla `L`). Cada módulo tem um selo dizendo o que é fiel à física e o que é simplificado.

| Módulo | O que dá para fazer |
| --- | --- |
| **Átomo** | Monte qualquer átomo; veja estabilidade, meia-vida e energia de ligação; faça o núcleo decair (inclusive a série do urânio-238), divida o átomo ou desmonte-o; mapa de núcleos com o vale da estabilidade. |
| **Decaimento** | Amostra com contador Geiger e curva da meia-vida, 14 isótopos reais, atividade e datação. |
| **Reator** | Reação em cadeia: nêutrons, barras de controle, moderador, combustível, fator k e superaquecimento. |
| **Estrela** | Vida de estrelas de 0,3 a 25 massas solares, estágios de fusão, curva de energia de ligação e supernova. |
| **Acelerador** | Feixes num anel de 27 km com os números reais, detector com trajetórias no campo magnético, o pico do Z⁰ e o Higgs. |

**Desempenho.** O laboratório e o estudo só são baixados quando alguém os abre; os laços de animação não criam objetos, a resolução do canvas se adapta e só o módulo visível anima.

## Arquivos

| Arquivo | Conteúdo |
| --- | --- |
| `index.html` | Estrutura da página e guia “Como usar” |
| `style.css` | Identidade visual (tokens) e layout responsivo |
| `js/app.js` | Tabela, modos, ficha, modelo atômico, guia e carregamento sob demanda |
| `js/dados.js` | Dados físicos dos elementos ([Periodic-Table-JSON](https://github.com/Bowserinator/Periodic-Table-JSON), CC BY-SA 3.0) |
| `js/descricoes.js` | Textos em português de cada elemento |
| `js/lab/*.js` | Motor nuclear (`fisica.js`), base de animação (`base.js`), módulos e casca (`lab.js`) |
| `css/lab.css` | Componentes do laboratório e do estudo |
| `js/estudo/base-estudo.js` | Componentes comuns do estudo: campos, passo a passo, prática e a casca de cada matéria |
| `js/estudo/expressao.js` | Leitor e avaliador de expressões matemáticas (sem `eval`) |
| `js/estudo/quimica-calc.js`, `quimica-redox-calc.js`, `quimica-termo-calc.js` | Motores de química |
| `js/estudo/fisica-calc.js`, `matematica-calc.js`, `pesquisa-calc.js` | Motores de física, matemática e pesquisa |
| `js/estudo/quimica*.js`, `fisica-estudo.js`, `matematica.js`, `pesquisa.js` | Interfaces de cada matéria |
| `css/estudo-*.css` | Estilos específicos de algumas ferramentas |
