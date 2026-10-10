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

## Arquivos

| Arquivo | Conteúdo |
| --- | --- |
| `index.html` | Estrutura da página |
| `style.css` | Visual, vidro e layout responsivo |
| `js/app.js` | Tabela, modos, animações, modelo atômico e fundo |
| `js/dados.js` | Dados físicos dos elementos ([Periodic-Table-JSON](https://github.com/Bowserinator/Periodic-Table-JSON), CC BY-SA 3.0) |
| `js/descricoes.js` | Textos em português de cada elemento |
