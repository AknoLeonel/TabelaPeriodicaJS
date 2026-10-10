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

- **Vidro em cada célula**: desfoque do fundo, reflexo, brilho que segue o cursor e inclinação 3D ao passar o mouse.
- **Zoom cinematográfico**: ao clicar, a câmera avança sobre a tabela (que fica desfocada), surgem as faixas pretas de cinema, as estrelas do fundo passam em velocidade de dobra e o elemento voa até o primeiro plano com um clarão de luz.
- **Modelo atômico animado** com os elétrons distribuídos nas camadas reais do elemento.
- **Painéis de informação** que sobem em sequência: propriedades físicas (com contagem animada), configuração eletrônica, onde é encontrado e como é obtido, para que serve, descoberta e origem do nome, e uma curiosidade.
- **Navegação** entre elementos com ← →, botões ou deslizando o dedo no celular. `Esc` fecha.
- **Modos de visualização**: categoria, estado físico (com controle de temperatura de 0 a 6000 K), eletronegatividade, raio atômico e linha do tempo das descobertas.
- **Busca** por nome, símbolo ou número (atalho `/`, `Enter` abre o melhor resultado).
- Legenda interativa: passe o mouse ou clique numa categoria para destacá-la.
- Respeita a preferência do sistema por movimento reduzido.

## Arquivos

| Arquivo | Conteúdo |
| --- | --- |
| `index.html` | Estrutura da página |
| `style.css` | Visual, vidro e layout responsivo |
| `js/app.js` | Tabela, modos, animações, modelo atômico e fundo |
| `js/dados.js` | Dados físicos dos elementos ([Periodic-Table-JSON](https://github.com/Bowserinator/Periodic-Table-JSON), CC BY-SA 3.0) |
| `js/descricoes.js` | Textos em português de cada elemento |
