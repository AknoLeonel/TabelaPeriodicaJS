# Tabela Periódica Interativa

Tabela periódica em tela cheia com efeito *glassmorphism*, zoom cinematográfico e fichas detalhadas de todos os 118 elementos, em português.

## Como abrir

Não precisa de build nem de dependências. Abra o `index.html` no navegador ou sirva a pasta:

```bash
python3 -m http.server 8000
# depois acesse http://localhost:8000
```

Dá para abrir direto um elemento pelo endereço: `index.html#Fe`, `index.html#79`.

## O que tem

- **Vidro em cada célula**: desfoque do fundo, reflexo, brilho que segue o cursor (com a cor da categoria) e inclinação 3D ao passar o mouse.
- **Zoom cinematográfico**: ao clicar, a câmera avança sobre a tabela, surgem as faixas de cinema, as estrelas passam em velocidade de dobra e o elemento voa até o primeiro plano com um clarão de luz.
- **Ficha do elemento**, na ordem em que se lê melhor:
  - tags rápidas (estado, metal ou não, grupo, período, bloco, radioativo/sintético) e um mapa com a posição dele na tabela;
  - propriedades com contagem animada;
  - **gráfico comparativo**: eletronegatividade, raio, ionização, densidade ou fusão ao longo de toda a tabela, com o elemento em destaque e a posição no ranking;
  - **simulador de temperatura**: arraste e veja o elemento virar sólido, líquido ou gás, com as partículas se movendo;
  - configuração eletrônica, onde é encontrado e como é obtido, para que serve, descoberta, origem do nome e curiosidade.
- **Modelo atômico animado** com os elétrons nas camadas reais, e contagem de prótons, elétrons e nêutrons.
- **Navegação** com ← →, botões ou deslizando o dedo; `R` ou "Surpreenda-me" abre um elemento aleatório; o botão de link copia/compartilha o endereço do elemento.
- **Modos de visualização**: categoria, estado físico (temperatura de 0 a 6000 K), eletronegatividade, raio atômico e linha do tempo das descobertas.
- **Busca** por nome, símbolo ou número (atalho `/`, `Enter` abre o melhor resultado).

### No celular

- Em pé, a tabela inteira cabe na tela. **Pince para ampliar e arraste para mover** (ou use os botões + − ⤢); quanto mais você amplia, mais informação aparece em cada célula.
- Há um cartão de **elemento do dia** abaixo da tabela.
- Deitado, a tabela ocupa a tela toda.
- Sem desfoque pesado nas células e sem efeito de hover, para ficar leve em aparelhos mais fracos. A ficha respeita as áreas seguras (notch e barra inferior).
- Respeita a preferência do sistema por movimento reduzido.

## Laboratório

Um espaço de experimentos de física, aberto pelo botão **Laboratório** (ou tecla `L`; `#lab/atomo` no endereço abre direto). Cada módulo tem um selo dizendo o que é fiel à física e o que é simplificado.

| Módulo | O que dá para fazer |
| --- | --- |
| **Átomo** | Monte qualquer átomo arrastando prótons, nêutrons e elétrons. Veja estabilidade, meia-vida e energia de ligação, faça o núcleo decair (inclusive a cadeia completa do urânio-238 até o chumbo-206), divida o átomo (fissão) ou desmonte-o. Um mapa de núcleos mostra o vale da estabilidade e os números mágicos. |
| **Decaimento** | Uma amostra de átomos com contador Geiger e a curva da meia-vida, com 14 isótopos reais (de 164 µs a bilhões de anos), atividade em Bq/g e calculadora de datação. Poucos átomos mostram as flutuações do acaso. |
| **Reator** | Reação em cadeia de fissão: toque para disparar nêutrons, controle barras, moderador e combustível, acompanhe o fator k e provoque (ou evite) o superaquecimento. |
| **Estrela** | A vida de estrelas de 0,3 a 25 massas solares: cada estágio de fusão, a lente de partículas no núcleo, a curva de energia de ligação (por que o ferro é o fim) e a supernova. |
| **Acelerador** | Feixes de p, e⁻, e⁺, p̄ e Pb num anel de 27 km, com os números reais (γ, velocidade, campo dos ímãs, radiação síncrotron), um detector com trajetórias curvadas pelo campo magnético, o pico do Z⁰ e a descoberta do Higgs. |

**O que é real e o que não é.** Energias de ligação, meias-vidas, séries radioativas, valores Q, fórmulas relativísticas, o raio de curvatura das trajetórias e a curva do Z⁰ são físicas reais. Os eventos de colisão são sorteados por um modelo educativo (não por um gerador de física completo), os dados do Higgs são sintéticos e geometrias como a do reator são simplificadas.

**Desempenho.** Nada é criado dentro dos laços de animação: partículas viram sprites pré-renderizados, a resolução do canvas se adapta sozinha se os quadros atrasarem, a física usa passos limitados e só o módulo visível anima. O laboratório só é baixado quando alguém o abre.

## Arquivos

| Arquivo | Conteúdo |
| --- | --- |
| `index.html` | Estrutura da página |
| `style.css` | Visual, vidro e layout responsivo |
| `js/app.js` | Tabela, modos, animações, modelo atômico e fundo |
| `js/dados.js` | Dados físicos dos elementos ([Periodic-Table-JSON](https://github.com/Bowserinator/Periodic-Table-JSON), CC BY-SA 3.0) |
| `js/descricoes.js` | Textos em português de cada elemento |
| `js/lab/fisica.js` | Motor de física nuclear (testável em Node) |
| `js/lab/base.js` | Laço de animação, sprites, som e componentes do laboratório |
| `js/lab/*.js` | Um arquivo por módulo e a casca (`lab.js`) |
| `css/lab.css` | Estilos do laboratório |
