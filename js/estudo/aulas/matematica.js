/*
 * Aulas de Matemática (formato em js/estudo/aula.js).
 * Cada aula leva de "nunca vi isso" até "consigo resolver e explicar".
 */
(function () {
  "use strict";
  const E = window.LAB && window.LAB.estudo;
  if (!E) return;
  const A = (E.aulas.matematica = E.aulas.matematica || {});
  const fr = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
  const AZUL = "#4da3ff", LARANJA = "#f0a23c", VERMELHO = "#ff6b6b", CINZA = "rgba(155,167,182,.6)";

  // ======================================================================
  // 1. Equações
  // ======================================================================
  A.equacoes = {
    tempo: 18, nivel: "Ensino médio → faculdade · base de toda a matemática aplicada",
    objetivos: [
      "resolver equações do 1º grau isolando a incógnita com operações inversas;",
      "resolver equações do 2º grau por Bhaskara, por fatoração e por soma e produto;",
      "interpretar o discriminante Δ e ligar as raízes ao gráfico da parábola;",
      "resolver sistemas lineares por substituição, por adição e por escalonamento;",
      "conferir qualquer solução substituindo-a de volta na equação.",
    ],
    secoes: [
      {
        t: "A ideia em uma frase",
        h: `<p>Uma <b>equação</b> é uma pergunta escrita em símbolos: “que número x torna esta igualdade verdadeira?”. <b>Resolver</b> é transformar a equação em outras mais simples, <b>com a mesma solução</b>, até sobrar x = algum número.</p>
          <div class="analogia"><b>Analogia:</b> pense numa balança de pratos equilibrada. Você pode tirar 3 kg de um prato desde que tire 3 kg do outro; pode dobrar o que há nos dois pratos. O equilíbrio se mantém. Cada passo de uma resolução é uma operação feita <b>dos dois lados ao mesmo tempo</b>.</div>
          <p>O “passa para o outro lado trocando o sinal” que se ouve na escola é só um atalho dessa ideia: em 2x + 3 = 11, subtrair 3 dos dois lados dá 2x = 8; dividir os dois lados por 2 dá x = 4. Conferência: 2 × 4 + 3 = 11. Sempre confira: é a única forma de ter certeza.</p>`,
      },
      {
        t: "1º grau: desfazer na ordem inversa",
        h: `<p>Uma equação do 1º grau tem a forma <b>ax + b = c</b> (com a ≠ 0) e tem <b>exatamente uma</b> solução: x = (c − b)/a. O método é desfazer as operações que “embrulharam” o x na ordem inversa em que foram feitas: primeiro somas e subtrações, depois multiplicações e divisões.</p>
          <p>Exemplo com x dos dois lados: 5x − 4 = 2x + 11. Junte os termos com x de um lado: 5x − 2x = 11 + 4, ou seja, 3x = 15, logo x = 5. Conferência: 5 × 5 − 4 = 21 e 2 × 5 + 11 = 21.</p>
          <p>Com frações, multiplique tudo pelo MMC dos denominadores para sumir com elas: em x/2 + x/3 = 10, multiplicando por 6: 3x + 2x = 60, então x = 12.</p>
          <div class="nota">Dois casos especiais: se as incógnitas se cancelam e sobra algo falso (0 = 5), a equação <b>não tem solução</b>; se sobra algo sempre verdadeiro (0 = 0), <b>todo x</b> é solução (é uma identidade).</div>`,
      },
      {
        t: "2º grau: Bhaskara e o discriminante",
        h: `<p>A forma geral é <b>ax² + bx + c = 0</b>, com a ≠ 0. Ela pode ter duas, uma ou nenhuma raiz real, e quem decide é o <b>discriminante</b>:</p>
          <div class="eq">Δ = b² − 4ac &nbsp;&nbsp;&nbsp; x = ${fr("−b ± √Δ", "2a")}</div>
          <ul><li><b>Δ &gt; 0</b>: duas raízes reais diferentes (a parábola corta o eixo x em dois pontos).</li>
          <li><b>Δ = 0</b>: uma raiz dupla (a parábola só toca o eixo no vértice).</li>
          <li><b>Δ &lt; 0</b>: nenhuma raiz real (a parábola fica toda acima ou toda abaixo do eixo).</li></ul>
          <p>Em x² − 5x + 6 = 0: a = 1, b = −5, c = 6. Δ = (−5)² − 4 × 1 × 6 = 25 − 24 = 1. x = (5 ± 1)/2, logo x = 3 ou x = 2. No gráfico, são os dois pontos onde a curva cruza o eixo x; o vértice fica no meio deles, em x = −b/(2a) = 2,5.</p>`,
        grafico: {
          op: { altura: 220, modo: "cartesiano" },
          cena: { x: [-0.2, 5.2], y: [-0.8, 3.5], series: [
            { tipo: "funcao", f: (x) => x * x - 5 * x + 6, rotulo: "f(x) = x² − 5x + 6" },
            { tipo: "vline", v: 2.5, cor: CINZA, tracejado: true, largura: 1, rotulo: "eixo de simetria", etiqueta: false },
            { tipo: "marca", x: 2, y: 0, rotulo: "x = 2" },
            { tipo: "marca", x: 3, y: 0, rotulo: "x = 3" },
            { tipo: "marca", x: 2.5, y: -0.25, vazia: true, rotulo: "vértice (2,5; −0,25)" },
          ] },
          legenda: "As raízes são os cortes no eixo x; o vértice fica sempre no ponto médio entre elas.",
        },
      },
      {
        t: "Atalhos: incompletas, fatoração, soma e produto",
        h: `<p>Bhaskara sempre funciona, mas muitas vezes há caminhos mais rápidos e menos sujeitos a erro:</p>
          <ul><li><b>c = 0</b> (ex.: 2x² − 8x = 0): ponha x em evidência: 2x(x − 4) = 0. Um produto é zero só se um fator for zero: x = 0 ou x = 4.</li>
          <li><b>b = 0</b> (ex.: x² − 9 = 0): isole x² = 9 e lembre das <b>duas</b> raízes: x = ±3.</li>
          <li><b>Soma e produto</b>: se as raízes são x₁ e x₂, então x₁ + x₂ = −b/a e x₁ · x₂ = c/a. Em x² − 5x + 6 = 0, procure dois números com soma 5 e produto 6: são 2 e 3.</li>
          <li><b>Fatoração</b>: conhecendo as raízes, ax² + bx + c = a(x − x₁)(x − x₂). Assim, x² − 5x + 6 = (x − 2)(x − 3).</li></ul>
          <div class="destaque">Nunca divida os dois lados por x para “simplificar”: em x² = 3x, dividir por x dá só x = 3 e <b>perde</b> a raiz x = 0. O certo é x² − 3x = 0 → x(x − 3) = 0.</div>`,
      },
      {
        t: "Sistemas lineares: substituição, adição e escalonamento",
        h: `<p>Um sistema reúne várias equações que devem valer <b>ao mesmo tempo</b>. Com duas incógnitas, cada equação é uma reta, e a solução é o ponto onde as retas se cruzam.</p>
          <p><b>Substituição</b>: isole uma incógnita numa equação e troque na outra. Em {2x + 3y = 12; 4x − y = 10}, da segunda vem y = 4x − 10. Na primeira: 2x + 3(4x − 10) = 12 → 14x = 42 → x = 3 e y = 2.</p>
          <p><b>Adição</b>: multiplique as equações por números escolhidos para que, somadas, uma incógnita suma. Em {x + y = 10; x − y = 4}, somando: 2x = 14, x = 7 e y = 3.</p>
          <p><b>Escalonamento (Gauss)</b>: para 3×3 ou maior, elimine x das linhas de baixo, depois y, até ficar um “triângulo”. Em {x + y + z = 6; 2x − y + z = 3; x + 2y − z = 2}: L₂ − 2L₁ dá −3y − z = −9; L₃ − L₁ dá y − 2z = −4. Somando 3 × (y − 2z = −4) com (−3y − z = −9): −7z = −21, z = 3. Volte: y = −4 + 2 × 3 = 2 e x = 6 − 2 − 3 = 1.</p>
          <p>Se as retas forem paralelas, o sistema é <b>impossível</b> (0 = número); se forem a mesma reta, é <b>indeterminado</b> (infinitas soluções, aparece 0 = 0).</p>`,
      },
    ],
    formulas: [
      { nome: "1º grau", eq: `ax + b = c &nbsp;→&nbsp; x = ${fr("c − b", "a")}`, simbolos: [["a", "coeficiente de x (diferente de zero)", "—"], ["b, c", "termos constantes", "—"]], obs: "Se a = 0 não é mais equação do 1º grau: ou não há solução, ou todo x serve." },
      { nome: "Fórmula de Bhaskara", eq: `Δ = b² − 4ac &nbsp;&nbsp; x = ${fr("−b ± √Δ", "2a")}`, simbolos: [["a, b, c", "coeficientes de ax² + bx + c = 0", "—"], ["Δ", "discriminante: decide quantas raízes reais há", "—"]], obs: "Com b negativo, −b fica positivo: use parênteses ao substituir, (−5)² = 25." },
      { nome: "Soma e produto das raízes", eq: `x₁ + x₂ = ${fr("−b", "a")} &nbsp;&nbsp; x₁ · x₂ = ${fr("c", "a")}`, simbolos: [["x₁, x₂", "raízes da equação do 2º grau", "—"]], obs: "Ótimo para resolver de cabeça ou conferir Bhaskara." },
      { nome: "Vértice da parábola", eq: `x<sub>v</sub> = ${fr("−b", "2a")} &nbsp;&nbsp; y<sub>v</sub> = ${fr("−Δ", "4a")}`, simbolos: [["x<sub>v</sub>, y<sub>v</sub>", "coordenadas do ponto de máximo (a &lt; 0) ou de mínimo (a &gt; 0)", "—"]], obs: "O vértice é a média das raízes, quando elas existem." },
    ],
    exemplos: [
      {
        t: "direto",
        enunciado: `Resolva 3(x − 2) + 4 = x + 10.`,
        passos: [`Distributiva: 3x − 6 + 4 = x + 10, ou seja, 3x − 2 = x + 10.`, `Termos com x à esquerda, números à direita: 3x − x = 10 + 2 → 2x = 12.`, `Dividir por 2: x = 6.`, `Conferir: 3(6 − 2) + 4 = 16 e 6 + 10 = 16. Confere.`],
        resposta: `<b>x = 6</b>`,
      },
      {
        t: "2º grau num problema de física",
        enunciado: `Uma bola é lançada para cima e sua altura é h(t) = 20t − 5t² (h em metros, t em segundos). Em que instantes ela passa a 15 m de altura?`,
        passos: [`Igualar a 15: 20t − 5t² = 15 → 5t² − 20t + 15 = 0. Dividindo por 5: t² − 4t + 3 = 0.`, `Δ = (−4)² − 4 × 1 × 3 = 16 − 12 = 4; √Δ = 2.`, `t = (4 ± 2)/2 → t = 3 s ou t = 1 s. Soma e produto conferem: 1 + 3 = 4 e 1 × 3 = 3.`, `Interpretação: em t = 1 s ela passa subindo; em t = 3 s, descendo. O topo é no vértice, t = 2 s, a h = 40 − 20 = 20 m.`],
        resposta: `<b>t = 1 s</b> (subindo) e <b>t = 3 s</b> (descendo)`,
      },
      {
        t: "sistema de prova",
        enunciado: `Num estacionamento há carros e motos, 30 veículos e 100 rodas no total. Quantos são carros?`,
        passos: [`Incógnitas: c carros e m motos. Equações: c + m = 30 e 4c + 2m = 100.`, `Da primeira, m = 30 − c. Na segunda: 4c + 2(30 − c) = 100 → 4c + 60 − 2c = 100.`, `2c = 40 → c = 20; logo m = 10.`, `Conferir: 20 + 10 = 30 veículos; 20 × 4 + 10 × 2 = 80 + 20 = 100 rodas.`],
        resposta: `<b>20 carros</b> e 10 motos`,
      },
    ],
    erros: [
      { errado: `Em x² = 3x, dividir por x e responder só x = 3.`, certo: `x² − 3x = 0 → x(x − 3) = 0 → x = 0 ou x = 3.`, porque: `Dividir por x supõe x ≠ 0 e apaga a raiz zero.` },
      { errado: `Em x² − 5x + 6 = 0, calcular Δ = −5² − 24 = −49.`, certo: `Δ = (−5)² − 4·1·6 = 25 − 24 = 1.`, porque: `Sem parênteses, −5² vale −25: o quadrado é feito antes do sinal.` },
      { errado: `Responder x = 3 para x² = 9.`, certo: `x = 3 ou x = −3.`, porque: `(−3)² também é 9. Toda raiz quadrada de equação leva ±.` },
      { errado: `Dividir só o −b por 2a: x = −b ± √Δ/2a.`, certo: `A fração inteira vai sobre 2a: x = (−b ± √Δ)/(2a).`, porque: `O traço da fração cobre o numerador todo; na calculadora, use parênteses.` },
      { errado: `No método da adição, multiplicar só um lado da equação.`, certo: `Multiplique todos os termos, dos dois lados: 2·(x + y = 10) vira 2x + 2y = 20.`, porque: `Multiplicar só um lado quebra a igualdade (é tirar peso de um prato só).` },
    ],
    aplicacoes: [
      `<b>Física</b>: achar o instante em que um projétil atinge certa altura ou o tempo de frenagem é resolver uma equação do 2º grau.`,
      `<b>Química</b>: o equilíbrio químico (cálculo da tabela ICE) leva a uma equação do 2º grau em x; só a raiz com sentido físico (positiva e menor que a concentração inicial) vale.`,
      `<b>Economia</b>: o ponto de equilíbrio de uma empresa (receita = custo) é um sistema linear.`,
      `<b>Engenharia e computação</b>: circuitos elétricos (leis de Kirchhoff), estruturas e gráficos 3D geram sistemas com milhares de incógnitas, resolvidos por escalonamento em computador.`,
    ],
    teste: [
      { p: `O que significa Δ &lt; 0 numa equação do 2º grau?`, op: [`Que as duas raízes são negativas.`, `Que a parábola não cruza o eixo x: não há raízes reais.`, `Que a equação tem infinitas soluções.`, `Que houve erro de conta.`], certa: 1, explica: `√Δ não existe nos reais quando Δ é negativo. Graficamente, a parábola fica inteira de um lado do eixo x. Raízes negativas é outra coisa: depende dos sinais, não de Δ.` },
      { p: `Sem usar Bhaskara, quais são as raízes de x² − 7x + 10 = 0?`, op: [`−2 e −5`, `1 e 10`, `2 e 5`, `−1 e −10`], certa: 2, explica: `Soma = −b/a = 7 e produto = c/a = 10: os números são 2 e 5 (2 + 5 = 7 e 2 × 5 = 10).` },
      { p: `Ao resolver um sistema, você chega a 0 = 7. O que isso indica?`, op: [`Que x = 7.`, `Que o sistema é indeterminado.`, `Que errou a conta, com certeza.`, `Que o sistema é impossível: as retas são paralelas.`], certa: 3, explica: `Uma contradição significa que nenhum par (x, y) satisfaz as duas equações: as retas não se cruzam. (Se desse 0 = 0, seria indeterminado.)` },
      { p: `Por que dividir os dois lados de x(x − 2) = 0 por x é um erro?`, op: [`Porque perde a solução x = 0.`, `Porque dá x = −2.`, `Porque não se pode dividir equações.`, `Não é erro, é um atalho válido.`], certa: 0, explica: `Dividir por x só é permitido se x ≠ 0, e justamente x = 0 é uma das raízes. O correto é usar “produto zero → algum fator zero”.` },
      { p: `A parábola de f(x) = ax² + bx + c tem raízes 1 e 5. Onde fica o vértice?`, op: [`Em x = 5`, `Em x = 3`, `Em x = 6`, `Não dá para saber sem a.`], certa: 1, explica: `A parábola é simétrica: o eixo de simetria passa no ponto médio das raízes, (1 + 5)/2 = 3. O valor de a muda a altura do vértice, não o seu x.` },
    ],
    resumo: [
      `Resolver = fazer a mesma operação dos dois lados até isolar x; confira sempre substituindo.`,
      `1º grau: ax + b = c → x = (c − b)/a, uma única solução.`,
      `2º grau: Δ = b² − 4ac; x = (−b ± √Δ)/(2a). Δ decide se há 2, 1 ou 0 raízes reais.`,
      `Soma das raízes = −b/a; produto = c/a. Fatorada: a(x − x₁)(x − x₂).`,
      `Nunca divida por x: fatore e use “produto zero”.`,
      `Sistemas: substituição, adição ou escalonamento; 0 = k (k ≠ 0) → impossível; 0 = 0 → indeterminado.`,
    ],
    alem: {
      t: "Para ir além: de onde vem Bhaskara e o que há quando Δ é negativo",
      h: `<p>A fórmula sai de <b>completar o quadrado</b>. Divida ax² + bx + c = 0 por a e some (b/2a)² dos dois lados:</p>
        <div class="eq">(x + ${fr("b", "2a")})² = ${fr("b² − 4ac", "4a²")} &nbsp;→&nbsp; x + ${fr("b", "2a")} = ±${fr("√Δ", "2a")}</div>
        <p>É por isso que o vértice está em x = −b/(2a): é onde o quadrado vale zero. Curiosidade: o nome “Bhaskara” é um costume brasileiro; o método de completar quadrados já aparece em al-Khwarizmi (século IX), cujo livro deu origem à palavra “álgebra”.</p>
        <p>Quando Δ &lt; 0, as raízes existem nos <b>números complexos</b>, com i² = −1. Em x² + 2x + 5 = 0, Δ = 4 − 20 = −16 e x = (−2 ± 4i)/2 = −1 ± 2i. Esses números não são “imaginários” no sentido de inúteis: descrevem oscilações em circuitos de corrente alternada e na mecânica quântica.</p>
        <p>Para grau 3 e 4 também existem fórmulas (Cardano, Ferrari, século XVI), mas Abel e Galois provaram que <b>não existe</b> fórmula geral com radicais para grau 5 ou mais. Na prática, computadores acham raízes por métodos numéricos como o de Newton, e sistemas grandes são resolvidos pela eliminação de Gauss, que custa cerca de n³/3 operações para n incógnitas.</p>`,
    },
  };

  // ======================================================================
  // 2. Razão, proporção e porcentagem
  // ======================================================================
  A.proporcao = {
    tempo: 16, nivel: "Ensino médio · a matemática mais usada no dia a dia",
    objetivos: [
      "reconhecer se duas grandezas são diretamente ou inversamente proporcionais;",
      "montar e resolver regras de três simples e compostas sem decorar setinhas;",
      "calcular porcentagens, variações percentuais e o fator multiplicativo;",
      "encadear aumentos e descontos sucessivos corretamente;",
      "diferenciar juros simples de juros compostos.",
    ],
    requisitos: [{ id: "equacoes", nome: "Equações" }],
    secoes: [
      {
        t: "A ideia em uma frase",
        h: `<p>Uma <b>razão</b> compara duas quantidades por divisão (a/b). Uma <b>proporção</b> é a igualdade de duas razões: a/b = c/d. Quase todo “problema de regra de três” é só isso: uma razão que se mantém constante enquanto as quantidades mudam.</p>
          <div class="analogia"><b>Analogia:</b> uma receita de bolo para 4 pessoas usa 2 xícaras de farinha. Para 6 pessoas, você não “chuta”: mantém a razão farinha/pessoas = 0,5 xícara por pessoa, e usa 3 xícaras. A receita é a razão; o bolo maior é a proporção.</div>
          <p>Em uma proporção a/b = c/d vale a <b>propriedade fundamental</b>: o produto dos meios é igual ao dos extremos, a·d = b·c. É ela que permite achar o termo desconhecido: em 4/12 = 6/x, 4x = 72 e x = 18.</p>`,
      },
      {
        t: "Direta ou inversa? A pergunta que resolve tudo",
        h: `<p>Duas grandezas são <b>diretamente proporcionais</b> quando, dobrando uma, a outra dobra: a <b>razão</b> y/x é constante (y = k·x). Exemplos: massa e preço do arroz; distância e tempo a velocidade constante; mols e massa.</p>
          <p>São <b>inversamente proporcionais</b> quando, dobrando uma, a outra cai pela metade: o <b>produto</b> x·y é constante (y = k/x). Exemplos: número de pedreiros e dias de obra; velocidade e tempo para um trajeto fixo; pressão e volume de um gás a temperatura constante (Boyle).</p>
          <p>A pergunta-chave é sempre: “<b>se uma aumenta, a outra aumenta ou diminui, e na mesma proporção?</b>”. Cuidado: nem toda grandeza que cresce junto é proporcional. A tarifa de táxi aumenta com a distância, mas tem uma bandeirada fixa; dobrar os quilômetros não dobra o preço.</p>`,
        grafico: {
          op: { altura: 210, modo: "dados", rotX: "x", rotY: "y" },
          cena: { x: [0, 8], y: [0, 16], series: [
            { tipo: "funcao", f: (x) => 2 * x, rotulo: "direta: y = 2x", cor: AZUL },
            { tipo: "funcao", f: (x) => 12 / x, dominio: [0.75, 8], rotulo: "inversa: y = 12/x", cor: LARANJA },
          ] },
          legenda: "Direta: reta pela origem (razão constante). Inversa: hipérbole (produto constante).",
        },
      },
      {
        t: "Regra de três simples e composta",
        h: `<p><b>Simples</b>: monte a tabela com as duas grandezas, decida se a relação é direta ou inversa e resolva. Direta: 4 kg custam R$ 12; 6 kg custam x. Razão constante: 12/4 = x/6 → x = R$ 18. Inversa: 3 pedreiros fazem um muro em 12 dias; 4 pedreiros levam x dias. Produto constante: 3 × 12 = 4 × x → x = 9 dias.</p>
          <p><b>Composta</b>: há três ou mais grandezas. Compare a incógnita com <b>cada</b> outra grandeza separadamente, supondo as demais fixas. Depois multiplique o valor conhecido por uma fração para cada grandeza: a razão “novo/antigo” se a relação é direta e “antigo/novo” se é inversa.</p>
          <p>Exemplo: 10 operários, trabalhando 8 h por dia, fazem uma obra em 12 dias. Quantos dias levam 8 operários trabalhando 6 h por dia? Menos operários → mais dias (inversa); menos horas por dia → mais dias (inversa):</p>
          <div class="eq">dias = 12 × ${fr("10", "8")} × ${fr("8", "6")} = 12 × 1,25 × 1,333… = 20 dias</div>
          <p>Conferência por “trabalho total”: 10 × 8 × 12 = 960 homens-hora; 8 × 6 × 20 = 960 homens-hora. Confere.</p>`,
      },
      {
        t: "Porcentagem e fator multiplicativo",
        h: `<p><b>Porcento</b> quer dizer “por cem”: 15% = 15/100 = 0,15. Os três tipos de pergunta são:</p>
          <ul><li><b>Quanto é x% de y?</b> 15% de 240 = 0,15 × 240 = 36.</li>
          <li><b>Quanto % uma parte é do total?</b> 36 de 240 = 36/240 = 0,15 = 15%.</li>
          <li><b>Qual a variação percentual?</b> de 80 para 92: (92 − 80)/80 = 12/80 = 0,15 = aumento de 15%.</li></ul>
          <p>A ferramenta mais poderosa é o <b>fator multiplicativo</b>: aumentar 15% é multiplicar por 1,15; descontar 15% é multiplicar por 0,85. Assim, um produto de R$ 80 com 15% de aumento vai a 80 × 1,15 = R$ 92, numa conta só.</p>
          <div class="destaque">A base importa: a variação percentual é sempre calculada sobre o valor <b>de partida</b>. De 80 para 92 é +15%, mas de 92 para 80 é −13%, porque 12/92 ≈ 0,130.</div>`,
      },
      {
        t: "Aumentos e descontos sucessivos",
        h: `<p>Percentuais aplicados em sequência <b>não se somam</b>: <b>multiplicam-se os fatores</b>. Um aumento de 20% seguido de um desconto de 20% dá</p>
          <div class="eq">1,20 × 0,80 = 0,96 &nbsp;→&nbsp; queda de 4%</div>
          <p>e não “voltou ao preço original”. O desconto de 20% incide sobre um valor já maior, por isso tira mais do que o aumento pôs.</p>
          <p>Da mesma forma, dois aumentos de 10% dão 1,1 × 1,1 = 1,21, ou seja, +21% (e não +20%). Inflação de 0,5% ao mês durante 12 meses: 1,005¹² ≈ 1,0617, cerca de 6,2% ao ano.</p>
          <p>E para desfazer um desconto? Se um preço caiu 25% (fator 0,75), para voltar ao original é preciso multiplicar por 1/0,75 ≈ 1,333: um aumento de cerca de <b>33,3%</b>. Essa assimetria é cobrada em quase todo vestibular.</p>`,
      },
    ],
    formulas: [
      { nome: "Propriedade fundamental", eq: `${fr("a", "b")} = ${fr("c", "d")} &nbsp;⇔&nbsp; a·d = b·c`, simbolos: [["a, d", "extremos da proporção", "—"], ["b, c", "meios da proporção", "—"]], obs: "Vale para b e d diferentes de zero; é a base de toda regra de três." },
      { nome: "Proporcionalidade", eq: `direta: y = k·x &nbsp;&nbsp; inversa: x·y = k`, simbolos: [["k", "constante de proporcionalidade", "unidade de y/x (direta) ou de x·y (inversa)"]], obs: "Teste: dobre x e veja se y dobra (direta) ou cai pela metade (inversa)." },
      { nome: "Variação percentual e fator", eq: `Δ% = ${fr("V<sub>final</sub> − V<sub>inicial</sub>", "V<sub>inicial</sub>")} × 100 &nbsp;&nbsp; V<sub>final</sub> = V<sub>inicial</sub> × (1 ± ${fr("p", "100")})`, simbolos: [["p", "taxa percentual de aumento (+) ou desconto (−)", "%"]], obs: "Taxas sucessivas: multiplique os fatores, nunca some as porcentagens." },
    ],
    exemplos: [
      {
        t: "direto",
        enunciado: `Um carro faz 12 km por litro de gasolina. Quantos litros gasta numa viagem de 450 km?`,
        passos: [`Distância e consumo são diretamente proporcionais (o dobro de km gasta o dobro de litros).`, `Razão constante: 12 km / 1 L = 450 km / x.`, `Produto dos meios = extremos: 12x = 450 → x = 450/12 = 37,5 L.`],
        resposta: `<b>37,5 L</b>`,
      },
      {
        t: "regra de três composta",
        enunciado: `6 máquinas iguais produzem 900 peças em 5 dias. Quantas peças 8 dessas máquinas produzem em 3 dias?`,
        passos: [`Peças × máquinas: mais máquinas, mais peças (direta). Peças × dias: mais dias, mais peças (direta).`, `Multiplicar pelas razões novo/antigo: x = 900 × (8/6) × (3/5).`, `x = 900 × 1,333… × 0,6 = 900 × 0,8 = 720 peças.`, `Conferir pela taxa: cada máquina faz 900/(6 × 5) = 30 peças/dia; 8 × 3 × 30 = 720.`],
        resposta: `<b>720 peças</b>`,
      },
      {
        t: "porcentagem de prova",
        enunciado: `Uma loja aumenta todos os preços em 25% e depois anuncia “20% de desconto”. Um produto custava R$ 200 antes do aumento. Quanto custa agora? E se, em vez disso, o aumento fosse de 20% e o desconto de 25%?`,
        passos: [`Fatores: aumento de 25% → 1,25; desconto de 20% → 0,80.`, `1,25 × 0,80 = 1,00: o preço volta exatamente a R$ 200 (a “promoção” só desfaz o aumento).`, `Invertendo: 1,20 × 0,75 = 0,90 → R$ 200 × 0,90 = R$ 180.`, `Note que a ordem das taxas não importa (a multiplicação comuta); importa quais taxas são.`],
        resposta: `<b>R$ 200</b> no primeiro caso; <b>R$ 180</b> (−10%) no segundo`,
      },
    ],
    erros: [
      { errado: `Aumento de 20% e depois desconto de 20% = preço original.`, certo: `1,2 × 0,8 = 0,96: o preço final é 4% menor.`, porque: `O desconto é calculado sobre o valor já aumentado.` },
      { errado: `Resolver “3 pedreiros, 12 dias; 4 pedreiros, x dias” como direta: x = 16 dias.`, certo: `É inversa: 3 × 12 = 4 × x → x = 9 dias.`, porque: `Mais gente trabalhando termina a obra mais depressa; antes de montar a conta, pergunte se aumenta ou diminui.` },
      { errado: `Dizer que de 92 para 80 houve queda de 15%, porque de 80 para 92 foi alta de 15%.`, certo: `Queda = 12/92 ≈ 13%.`, porque: `A variação percentual é sempre relativa ao valor inicial, que mudou.` },
      { errado: `Achar que a taxa de 1% ao mês dá exatamente 12% ao ano.`, certo: `Com juros compostos: 1,01¹² ≈ 1,1268, ou seja, ≈ 12,7% ao ano.`, porque: `Cada mês rende juros sobre os juros anteriores.` },
      { errado: `Confundir “pontos percentuais” com “por cento”: juros de 10% para 12% subiram 2%.`, certo: `Subiram 2 pontos percentuais, ou 20% em termos relativos (2/10).`, porque: `Diferença de porcentagens se mede em p.p.; a variação relativa é outra conta.` },
    ],
    aplicacoes: [
      `<b>Química</b>: estequiometria é regra de três entre mols; diluição (C₁V₁ = C₂V₂) é proporção inversa entre concentração e volume.`,
      `<b>Saúde</b>: doses pediátricas em mg/kg e gotejamento de soro em gotas/min são regras de três.`,
      `<b>Finanças</b>: inflação, reajustes, rendimentos e parcelas são fatores multiplicativos encadeados.`,
      `<b>Mapas e plantas</b>: a escala 1 : 50 000 diz que 1 cm no mapa equivale a 50 000 cm = 500 m no terreno.`,
    ],
    teste: [
      { p: `A velocidade média de um ônibus num trajeto fixo dobra. O que acontece com o tempo de viagem?`, op: [`Dobra.`, `Cai pela metade.`, `Não muda.`, `Cai para um quarto.`], certa: 1, explica: `Com distância fixa, v·t = d é constante: grandezas inversamente proporcionais. Dobrar v divide t por 2.` },
      { p: `Um salário teve dois reajustes de 10%. O aumento total foi de:`, op: [`20%`, `21%`, `19%`, `11%`], certa: 1, explica: `Fatores se multiplicam: 1,1 × 1,1 = 1,21, ou seja, +21%. O segundo reajuste incide sobre o salário já reajustado.` },
      { p: `Um produto teve desconto de 50%. Que aumento o faz voltar ao preço original?`, op: [`50%`, `75%`, `150%`, `100%`], certa: 3, explica: `Fator 0,5 → para voltar é preciso multiplicar por 2, que é um aumento de 100%.` },
      { p: `A tarifa de um táxi é R$ 5 de bandeirada mais R$ 3 por km. Preço e distância são diretamente proporcionais?`, op: [`Sim, porque os dois crescem juntos.`, `Não: 2 km custam R$ 11 e 4 km custam R$ 17, que não é o dobro.`, `Sim, com constante 3.`, `Não, são inversamente proporcionais.`], certa: 1, explica: `Proporcionalidade direta exige razão constante (reta pela origem). A bandeirada fixa quebra isso: a relação é afim, não proporcional.` },
      { p: `Numa regra de três composta, como decidir se cada grandeza entra como direta ou inversa?`, op: [`Comparando cada uma com a incógnita, supondo as outras fixas.`, `Comparando as grandezas conhecidas entre si.`, `Toda grandeza com unidade de tempo é inversa.`, `Pela ordem em que aparecem no enunciado.`], certa: 0, explica: `A relação é sempre da incógnita com cada grandeza, uma de cada vez, “congelando” as demais.` },
    ],
    resumo: [
      `Razão = divisão; proporção = igualdade de razões; a/b = c/d ⇔ a·d = b·c.`,
      `Direta: razão constante (y = kx). Inversa: produto constante (xy = k).`,
      `Regra de três composta: compare a incógnita com cada grandeza separadamente.`,
      `x% de y = (x/100)·y; variação % = (final − inicial)/inicial.`,
      `Aumento de p% → × (1 + p/100); desconto → × (1 − p/100).`,
      `Taxas sucessivas se multiplicam: +20% e −20% dão −4%.`,
    ],
    alem: {
      t: "Para ir além: juros simples, juros compostos e o número e",
      h: `<p>Nos <b>juros simples</b>, o rendimento de cada período é calculado sempre sobre o capital inicial C: J = C·i·t, e o montante cresce em linha reta. Nos <b>juros compostos</b>, cada período rende sobre o montante acumulado: M = C·(1 + i)ᵗ, uma exponencial.</p>
        <p>Com C = R$ 1 000 a 1% ao mês por 12 meses: simples dá 1 000 × (1 + 0,01 × 12) = R$ 1 120; compostos dão 1 000 × 1,01¹² ≈ R$ 1 126,83. Em 10 anos (120 meses) a diferença explode: R$ 2 200 contra 1 000 × 1,01¹²⁰ ≈ R$ 3 300,39.</p>
        <p>A <b>regra do 72</b> estima o tempo para dobrar um valor: 72 ÷ (taxa em %). A 6% ao ano, dobra em cerca de 12 anos (o exato é ln 2 / ln 1,06 ≈ 11,9 anos).</p>
        <p>Se os juros forem capitalizados cada vez mais vezes (por dia, por hora, continuamente), o fator (1 + 1/n)ⁿ tende ao número <b>e ≈ 2,71828</b>. Juros contínuos dão M = C·e^(r·t), a mesma lei do crescimento de bactérias e do decaimento radioativo, que você verá na aula de logaritmos.</p>`,
    },
  };

  // ======================================================================
  // 3. Potências, raízes e logaritmos
  // ======================================================================
  A.log = {
    tempo: 18, nivel: "Ensino médio → faculdade · essencial para pH, decibéis e decaimento",
    objetivos: [
      "aplicar as propriedades das potências, inclusive expoentes negativos e fracionários;",
      "escrever e operar números em notação científica;",
      "explicar o logaritmo como “o expoente que falta” e usar suas propriedades;",
      "mudar a base de um logaritmo e resolver equações exponenciais;",
      "interpretar escalas logarítmicas como pH e decibéis.",
    ],
    requisitos: [{ id: "equacoes", nome: "Equações" }, { id: "proporcao", nome: "Razão, proporção e porcentagem" }],
    secoes: [
      {
        t: "A ideia em uma frase",
        h: `<p>A <b>potência</b> responde “quanto dá multiplicar b por ele mesmo n vezes?” (2⁵ = 32). O <b>logaritmo</b> responde a pergunta inversa: “<b>quantas vezes</b> preciso multiplicar 2 para chegar a 32?”. A resposta, 5, é o log₂ 32. Logaritmo é um expoente.</p>
          <div class="analogia"><b>Analogia:</b> uma folha de papel dobrada ao meio fica com 2 camadas; dobrada de novo, 4; depois 8, 16… A potência diz quantas camadas há depois de n dobras. O logaritmo diz quantas dobras foram feitas para chegar a um número de camadas: para 1 024 camadas, log₂ 1 024 = 10 dobras.</div>
          <p>Por isso o logaritmo “encolhe” números enormes: de 1 a 1 000 000, o log₁₀ vai só de 0 a 6. É a ferramenta natural para grandezas que variam por muitas ordens de grandeza, como acidez, som e terremotos.</p>`,
      },
      {
        t: "Propriedades das potências e raízes",
        h: `<p>Todas as regras saem da definição “multiplicar n vezes”. Com a e b positivos:</p>
          <div class="tab-rolar"><table class="tb">
            <tr><th>Regra</th><th>Exemplo</th></tr>
            <tr><td>aᵐ · aⁿ = aᵐ⁺ⁿ</td><td>2³ · 2⁴ = 2⁷ = 128</td></tr>
            <tr><td>aᵐ / aⁿ = aᵐ⁻ⁿ</td><td>10⁵ / 10² = 10³</td></tr>
            <tr><td>(aᵐ)ⁿ = aᵐ·ⁿ</td><td>(3²)³ = 3⁶ = 729</td></tr>
            <tr><td>(a·b)ⁿ = aⁿ·bⁿ</td><td>(2·5)³ = 8 · 125 = 1 000</td></tr>
            <tr><td>a⁰ = 1</td><td>7⁰ = 1 (é aⁿ/aⁿ)</td></tr>
            <tr><td>a⁻ⁿ = 1/aⁿ</td><td>2⁻³ = 1/8 = 0,125</td></tr>
            <tr><td>a<sup>p/q</sup> = <sup>q</sup>√(aᵖ)</td><td>8<sup>2/3</sup> = (∛8)² = 2² = 4</td></tr>
          </table></div>
          <p>A raiz é uma potência de expoente fracionário: √a = a<sup>1/2</sup>. Isso explica regras como √(a·b) = √a·√b. Atenção: <b>não existe</b> regra para soma: (a + b)² = a² + 2ab + b², nunca a² + b².</p>
          <div class="nota">Sinal e parênteses: −2² = −4 (o quadrado vem antes do sinal), mas (−2)² = 4. E base negativa elevada a expoente ímpar continua negativa: (−2)³ = −8.</div>`,
      },
      {
        t: "Notação científica: números gigantes e minúsculos",
        h: `<p>Um número em notação científica tem a forma <b>m × 10ⁿ</b>, com 1 ≤ m &lt; 10 e n inteiro. O expoente diz quantas casas a vírgula andou: para a direita (número pequeno) n é negativo; para a esquerda (número grande), positivo.</p>
          <ul><li>0,00045 = 4,5 × 10⁻⁴ (a vírgula andou 4 casas para a direita).</li>
          <li>602 000 000 000 000 000 000 000 = 6,02 × 10²³ (o número de Avogadro).</li>
          <li>Velocidade da luz: 300 000 000 m/s = 3,0 × 10⁸ m/s.</li></ul>
          <p>Para multiplicar, multiplique as mantissas e some os expoentes: (3 × 10⁸) × (2 × 10⁻³) = 6 × 10⁵. Para dividir, divida e subtraia. Para somar, primeiro iguale os expoentes: 3 × 10⁴ + 5 × 10³ = 3 × 10⁴ + 0,5 × 10⁴ = 3,5 × 10⁴.</p>
          <p>A <b>ordem de grandeza</b> é a potência de 10 mais próxima: uma pessoa (70 kg) tem ordem 10² kg; a Terra (6 × 10²⁴ kg), 10²⁵ kg (porque 6 &gt; √10 ≈ 3,16).</p>`,
      },
      {
        t: "Logaritmo: definição e propriedades",
        h: `<div class="eq">log<sub>b</sub> y = x &nbsp;⇔&nbsp; bˣ = y &nbsp;&nbsp; (b &gt; 0, b ≠ 1, y &gt; 0)</div>
          <p>Exemplos: log₂ 8 = 3 porque 2³ = 8; log 1 000 = 3 (sem base escrita, a base é 10); log₂ (1/4) = −2 porque 2⁻² = 1/4; log<sub>b</sub> 1 = 0 sempre. O <b>ln</b> é o logaritmo na base e ≈ 2,718.</p>
          <p>Como logaritmos são expoentes, herdam as regras das potências, “um degrau abaixo”: produto vira soma e potência vira multiplicação.</p>
          <ul><li>log(a·b) = log a + log b &nbsp;&nbsp; log(a/b) = log a − log b &nbsp;&nbsp; log(aⁿ) = n·log a</li>
          <li>Com log 2 ≈ 0,301 e log 3 ≈ 0,477: log 6 = 0,301 + 0,477 = 0,778; log 5 = log(10/2) = 1 − 0,301 = 0,699; log 18 = log(2·3²) = 0,301 + 2 × 0,477 = 1,255.</li></ul>
          <p><b>Mudança de base</b>: log<sub>b</sub> x = log x / log b. É assim que a calculadora acha log₂ 10 = 1/0,30103 ≈ 3,32.</p>
          <p>O gráfico mostra que y = 2ˣ e y = log₂ x são <b>funções inversas</b>: uma é o espelho da outra em relação à reta y = x. A exponencial nunca toca o zero; o logaritmo só existe para x &gt; 0 e cresce cada vez mais devagar.</p>`,
        grafico: {
          op: { altura: 240, modo: "cartesiano", igual: true },
          cena: { x: [-3, 6], y: [-3, 6], series: [
            { tipo: "funcao", f: (x) => Math.pow(2, x), rotulo: "y = 2ˣ", cor: LARANJA },
            { tipo: "funcao", f: (x) => Math.log2(x), dominio: [0.01, 6], rotulo: "y = log₂ x", cor: AZUL },
            { tipo: "funcao", f: (x) => x, cor: CINZA, tracejado: true, largura: 1, rotulo: "y = x" },
            { tipo: "marca", x: 2, y: 4, rotulo: "(2; 4)" },
            { tipo: "marca", x: 4, y: 2, rotulo: "(4; 2)" },
          ] },
          legenda: "Exponencial e logaritmo na base 2 são inversas: trocam x por y, espelhando-se na reta y = x.",
        },
      },
      {
        t: "Equações exponenciais e escalas logarítmicas",
        h: `<p><b>Mesma base</b>: se der para escrever os dois lados como potências da mesma base, iguale os expoentes. 3ˣ⁺¹ = 81 → 3ˣ⁺¹ = 3⁴ → x + 1 = 4 → x = 3.</p>
          <p><b>Bases diferentes</b>: aplique log dos dois lados e use log(aⁿ) = n·log a. 2ˣ = 10 → x·log 2 = log 10 → x = 1/0,30103 ≈ 3,32. Confira: 2³·³² ≈ 9,98 ≈ 10.</p>
          <p><b>Escalas logarítmicas</b> transformam multiplicação em soma de “degraus”:</p>
          <ul><li><b>pH</b> = −log[H⁺]. Suco de limão com [H⁺] = 1 × 10⁻² mol/L tem pH 2; água pura, 10⁻⁷ mol/L, pH 7. Uma unidade de pH a menos é <b>10 vezes</b> mais ácido.</li>
          <li><b>Decibéis</b>: N = 10·log(I/I₀). Dez vezes mais intensidade sonora = +10 dB; 100 vezes = +20 dB.</li>
          <li><b>Decaimento</b>: N = N₀·(1/2)^(t/T). Para restar 25% de carbono-14 (meia-vida T = 5 730 anos), passam duas meias-vidas: 11 460 anos.</li></ul>`,
      },
    ],
    formulas: [
      { nome: "Definição de logaritmo", eq: `log<sub>b</sub> y = x &nbsp;⇔&nbsp; bˣ = y`, simbolos: [["b", "base (positiva e diferente de 1)", "—"], ["y", "logaritmando (positivo)", "—"], ["x", "logaritmo: o expoente procurado", "—"]], obs: "log sem base = base 10; ln = base e ≈ 2,71828." },
      { nome: "Propriedades operatórias", eq: `log(a·b) = log a + log b &nbsp;&nbsp; log(aⁿ) = n·log a`, simbolos: [["a, b", "números positivos", "—"]], obs: "Não existe regra para log(a + b)." },
      { nome: "Mudança de base", eq: `log<sub>b</sub> x = ${fr("log x", "log b")} = ${fr("ln x", "ln b")}`, simbolos: [["b", "base desejada", "—"]], obs: "Use para calcular qualquer base na calculadora e para resolver bˣ = y: x = log y / log b." },
      { nome: "Potência fracionária", eq: `a<sup>p/q</sup> = <sup>q</sup>√(aᵖ) &nbsp;&nbsp; a⁻ⁿ = ${fr("1", "aⁿ")}`, simbolos: [["p/q", "expoente fracionário", "—"]], obs: "Para a negativo e q par, a raiz não é real." },
    ],
    exemplos: [
      {
        t: "direto",
        enunciado: `Calcule log₂ 64 + log 0,01 − log₅ 1.`,
        passos: [`log₂ 64: 2⁶ = 64, então vale 6.`, `log 0,01 = log 10⁻² = −2.`, `log₅ 1 = 0, porque 5⁰ = 1.`, `Total: 6 + (−2) − 0 = 4.`],
        resposta: `<b>4</b>`,
      },
      {
        t: "equação exponencial",
        enunciado: `Uma cultura de bactérias dobra de tamanho a cada 20 minutos. Em quanto tempo ela fica 1 000 vezes maior? (log 2 ≈ 0,301)`,
        passos: [`Depois de n duplicações, a população é multiplicada por 2ⁿ. Queremos 2ⁿ = 1 000.`, `Aplicar log: n·log 2 = log 1 000 → n·0,301 = 3.`, `n = 3/0,301 ≈ 9,97 duplicações.`, `Tempo: 9,97 × 20 min ≈ 199 min ≈ 3,3 h. (Conferência: 2¹⁰ = 1 024, quase 1 000.)`],
        resposta: `<b>≈ 200 minutos</b> (cerca de 3 h 20 min)`,
      },
      {
        t: "de prova: datação",
        enunciado: `Um fóssil tem 10% do carbono-14 que um ser vivo possui. Qual a sua idade? (meia-vida do ¹⁴C = 5 730 anos; log 2 ≈ 0,301)`,
        passos: [`Decaimento: N/N₀ = (1/2)^(t/T). Aqui: 0,1 = (1/2)^(t/5 730).`, `Aplicar log: log 0,1 = (t/5 730)·log(1/2) → −1 = (t/5 730)·(−0,301).`, `t/5 730 = 1/0,301 ≈ 3,32 meias-vidas.`, `t ≈ 3,32 × 5 730 ≈ 19 000 anos.`],
        resposta: `<b>≈ 1,9 × 10⁴ anos</b>`,
      },
    ],
    erros: [
      { errado: `log(a + b) = log a + log b.`, certo: `log(a·b) = log a + log b; para soma não há simplificação.`, porque: `O logaritmo transforma produtos em somas, não somas em somas. Ex.: log(10 + 10) = log 20 ≈ 1,30, e não 2.` },
      { errado: `2³ · 2⁴ = 4⁷.`, certo: `2³ · 2⁴ = 2⁷ = 128 (mantém a base, soma os expoentes).`, porque: `4⁷ = 16 384: multiplicar as bases está errado.` },
      { errado: `10⁻³ é um número negativo.`, certo: `10⁻³ = 1/1 000 = 0,001, positivo e pequeno.`, porque: `Expoente negativo indica inverso, não sinal.` },
      { errado: `Calcular log(−100) ou log 0.`, certo: `O logaritmando precisa ser positivo; log 0 e log de negativo não existem nos reais.`, porque: `Nenhuma potência de base positiva dá zero ou número negativo.` },
      { errado: `Achar que pH 3 é “só um pouco” mais ácido que pH 4.`, certo: `É 10 vezes mais ácido ([H⁺] = 10⁻³ contra 10⁻⁴ mol/L).`, porque: `Cada degrau de uma escala logarítmica de base 10 é um fator 10.` },
    ],
    aplicacoes: [
      `<b>Química</b>: pH, pOH e constantes de equilíbrio (pK<sub>a</sub>) são logaritmos; a equação de Nernst também.`,
      `<b>Acústica</b>: o nível sonoro em decibéis; 85 dB por 8 h já exige protetor auricular, e cada +3 dB dobra a intensidade.`,
      `<b>Geologia</b>: a magnitude de terremotos é logarítmica: um grau a mais libera cerca de 32 vezes mais energia.`,
      `<b>Medicina e arqueologia</b>: meia-vida de remédios no sangue e datação por carbono-14.`,
      `<b>Computação</b>: a busca binária encontra um item entre 1 milhão em cerca de log₂ 10⁶ ≈ 20 passos.`,
    ],
    teste: [
      { p: `O que significa log₃ 81 = 4?`, op: [`Que 81 × 3 = 4.`, `Que 4³ = 81.`, `Que 3⁴ = 81.`, `Que 81/3 = 4.`], certa: 2, explica: `Logaritmo é o expoente: a base 3 elevada a 4 dá 81.` },
      { p: `Se log x = 2,5, então log(100x) vale:`, op: [`250`, `4,5`, `5`, `102,5`], certa: 1, explica: `log(100x) = log 100 + log x = 2 + 2,5 = 4,5. Produto vira soma.` },
      { p: `Uma solução tem pH 5 e outra pH 2. Comparando [H⁺]:`, op: [`a segunda tem 3 vezes mais H⁺.`, `a segunda tem 1 000 vezes mais H⁺.`, `a primeira tem 1 000 vezes mais H⁺.`, `a segunda tem 2,5 vezes mais H⁺.`], certa: 1, explica: `[H⁺] = 10⁻ᵖᴴ: 10⁻² / 10⁻⁵ = 10³. A de pH menor é mil vezes mais ácida.` },
      { p: `Qual destas afirmações sobre y = 2ˣ e y = log₂ x é correta?`, op: [`As duas passam pela origem.`, `São inversas: o gráfico de uma é o reflexo do da outra na reta y = x.`, `log₂ x é definida para todo x real.`, `2ˣ assume valores negativos para x &lt; 0.`], certa: 1, explica: `2ˣ passa por (0; 1) e log₂ x por (1; 0); 2ˣ é sempre positiva e log₂ x só existe para x &gt; 0. Trocar x e y transforma uma na outra.` },
      { p: `8<sup>−2/3</sup> vale:`, op: [`−4`, `4`, `1/4`, `−1/4`], certa: 2, explica: `∛8 = 2; 2² = 4; o expoente negativo inverte: 1/4. Expoente negativo nunca torna o resultado negativo.` },
      { p: `Para resolver 5ˣ = 30, o passo correto é:`, op: [`x = 30/5 = 6`, `x = log 30 / log 5 ≈ 2,11`, `x = log 30 − log 5`, `x = √30`], certa: 1, explica: `Aplicando log dos dois lados: x·log 5 = log 30. Confira: 5² = 25 e 5³ = 125, então x fica entre 2 e 3.` },
    ],
    resumo: [
      `aᵐ·aⁿ = aᵐ⁺ⁿ; (aᵐ)ⁿ = aᵐⁿ; a⁰ = 1; a⁻ⁿ = 1/aⁿ; a<sup>p/q</sup> = <sup>q</sup>√aᵖ.`,
      `Notação científica: m × 10ⁿ com 1 ≤ m &lt; 10; multiplicar soma expoentes.`,
      `log<sub>b</sub> y = x ⇔ bˣ = y: o logaritmo é o expoente.`,
      `log(ab) = log a + log b; log(aⁿ) = n·log a; log(a + b) não simplifica.`,
      `Mudança de base: log<sub>b</sub> x = log x / log b; resolve bˣ = y.`,
      `Escalas log (pH, dB): cada unidade é um fator 10.`,
    ],
    alem: {
      t: "Para ir além: o número e e o logaritmo natural",
      h: `<p>Entre todas as bases, a base <b>e ≈ 2,71828</b> é a “natural” porque a função eˣ é a única (a menos de constante) que é igual à própria derivada: a taxa de crescimento de eˣ é eˣ. Por isso qualquer processo em que <b>a taxa de variação é proporcional à quantidade</b> (dN/dt = k·N) dá uma exponencial N = N₀·e^(kt): juros contínuos, crescimento de populações, decaimento radioativo, descarga de capacitores, resfriamento de Newton.</p>
        <p>O ln aparece naturalmente ao resolver essas equações. Meia-vida e constante de decaimento se ligam por T = ln 2 / k ≈ 0,693/k. E ln x é a área sob a curva 1/t entre 1 e x, o que liga logaritmos ao cálculo integral.</p>
        <p>Historicamente, os logaritmos (Napier, 1614) foram inventados para <b>facilitar contas</b>: com uma tábua de logs, astrônomos trocavam multiplicações de números de 7 dígitos por somas. A régua de cálculo, usada por engenheiros até os anos 1970, é uma tábua de logaritmos deslizante.</p>
        <p>Em gráficos científicos, eixos em escala log revelam leis de potência: se y = c·xⁿ, então log y = log c + n·log x, uma reta de inclinação n no gráfico log-log.</p>`,
    },
  };

  // ======================================================================
  // 4. Trigonometria
  // ======================================================================
  A.trig = {
    tempo: 20, nivel: "Ensino médio → faculdade · base de vetores, ondas e física",
    objetivos: [
      "definir seno, cosseno e tangente no triângulo retângulo (SOH-CAH-TOA);",
      "usar os valores exatos de 30°, 45° e 60° e a identidade sen² + cos² = 1;",
      "estender seno e cosseno a qualquer ângulo pelo círculo trigonométrico e converter graus em radianos;",
      "resolver triângulos quaisquer com as leis dos senos e dos cossenos;",
      "reconhecer seno e cosseno como funções periódicas (ondas).",
    ],
    requisitos: [{ id: "equacoes", nome: "Equações" }, { id: "proporcao", nome: "Razão, proporção e porcentagem" }],
    secoes: [
      {
        t: "A ideia em uma frase",
        h: `<p>Num triângulo retângulo, o <b>ângulo</b> sozinho determina as <b>razões</b> entre os lados. Triângulos com o mesmo ângulo agudo são semelhantes: podem ter tamanhos diferentes, mas a razão “cateto oposto ÷ hipotenusa” é sempre a mesma. Essa razão recebe um nome: o <b>seno</b> do ângulo.</p>
          <div class="analogia"><b>Analogia:</b> uma rampa de acessibilidade com inclinação fixa sobe sempre a mesma fração do comprimento percorrido, seja ela curta ou longa. Se a cada 12 m de rampa você sobe 1 m, isso vale numa rampa de 3 m (sobe 0,25 m) e numa de 24 m (sobe 2 m). A trigonometria dá nome a essas frações fixas.</div>
          <p>Com isso, dá para medir o que não se alcança: a altura de um prédio pela sombra, a largura de um rio sem atravessá-lo, a distância até a Lua. Foi para isso que a trigonometria nasceu, na astronomia e na navegação.</p>`,
      },
      {
        t: "SOH-CAH-TOA no triângulo retângulo",
        h: `<p>Para um ângulo agudo α de um triângulo retângulo, chame de <b>hipotenusa</b> o lado oposto ao ângulo reto (o maior), de <b>cateto oposto</b> o lado em frente a α e de <b>cateto adjacente</b> o que encosta em α:</p>
          <div class="eq">sen α = ${fr("oposto", "hipotenusa")} &nbsp;&nbsp; cos α = ${fr("adjacente", "hipotenusa")} &nbsp;&nbsp; tg α = ${fr("oposto", "adjacente")}</div>
          <p>O mnemônico SOH-CAH-TOA (Seno = Oposto/Hipotenusa; Cosseno = Adjacente/Hipotenusa; Tangente = Oposto/Adjacente) ajuda a lembrar. No triângulo 3-4-5 (catetos 3 e 4, hipotenusa 5, pois 3² + 4² = 25), para o ângulo α oposto ao lado 3: sen α = 3/5 = 0,6; cos α = 4/5 = 0,8; tg α = 3/4 = 0,75. Com a função inversa, α = arcsen 0,6 ≈ 36,87°.</p>
          <p>Note que tg α = sen α / cos α, e que seno e cosseno de um ângulo agudo ficam sempre entre 0 e 1 (os catetos são menores que a hipotenusa). Se der sen = 1,3, há erro.</p>`,
      },
      {
        t: "Ângulos notáveis e a identidade fundamental",
        h: `<p>Três ângulos aparecem tanto que vale saber seus valores exatos. Eles saem de figuras simples: metade de um triângulo equilátero (30° e 60°) e metade de um quadrado (45°).</p>
          <div class="tab-rolar"><table class="tb">
            <tr><th></th><th>30°</th><th>45°</th><th>60°</th></tr>
            <tr><td>sen</td><td>1/2</td><td>√2/2 ≈ 0,707</td><td>√3/2 ≈ 0,866</td></tr>
            <tr><td>cos</td><td>√3/2 ≈ 0,866</td><td>√2/2 ≈ 0,707</td><td>1/2</td></tr>
            <tr><td>tg</td><td>√3/3 ≈ 0,577</td><td>1</td><td>√3 ≈ 1,732</td></tr>
          </table></div>
          <p>Repare: o seno de um ângulo é o cosseno do seu complementar (sen 30° = cos 60°). É de onde vem o nome “co-seno”: seno do complemento.</p>
          <p>Pelo teorema de Pitágoras, (oposto)² + (adjacente)² = (hipotenusa)². Dividindo tudo por hipotenusa², sai a <b>identidade fundamental</b>:</p>
          <div class="eq">sen² α + cos² α = 1</div>
          <p>Ela permite achar uma razão a partir da outra: se sen α = 0,6 e α é agudo, cos α = √(1 − 0,36) = √0,64 = 0,8.</p>`,
      },
      {
        t: "O círculo trigonométrico e os radianos",
        h: `<p>Para ângulos maiores que 90°, usa-se um círculo de raio 1 centrado na origem. Gire um raio a partir do eixo x positivo, no sentido anti-horário, por um ângulo θ. O ponto P onde ele toca o círculo tem coordenadas</p>
          <div class="eq">P = (cos θ; sen θ)</div>
          <p>Assim, o <b>cosseno é a abscissa</b> (x) e o <b>seno é a ordenada</b> (y). Os sinais seguem os quadrantes: no 2º quadrante (90° a 180°) o seno é positivo e o cosseno negativo. Por exemplo, sen 150° = sen 30° = 1/2 e cos 150° = −cos 30° = −√3/2 (é a redução ao 1º quadrante: 150° “espelha” 30°).</p>
          <p><b>Radianos</b>: um ângulo de 1 rad abre um arco de comprimento igual ao raio. Uma volta inteira tem comprimento 2πr, então 360° = 2π rad e <b>180° = π rad</b>. Converter: 60° = 60 × π/180 = π/3 rad; 1 rad ≈ 57,3°. Em radianos, o comprimento de arco é simplesmente s = r·θ, e é por isso que física e cálculo usam radianos.</p>`,
      },
      {
        t: "Seno e cosseno como ondas",
        h: `<p>Desenrolando o círculo, tomando o ângulo x (em radianos) no eixo horizontal e sen x ou cos x no vertical, surgem as ondas abaixo. Elas são <b>periódicas</b>: repetem-se a cada 2π ≈ 6,28 rad (uma volta), e oscilam entre −1 e 1.</p>
          <p>O cosseno é o seno adiantado de 90°: cos x = sen(x + π/2). As raízes do seno estão em 0, π, 2π…; as do cosseno, em π/2, 3π/2…</p>
          <p>Uma onda geral se escreve y = A·sen(ωt + φ): A é a amplitude (altura), ω a frequência angular (ω = 2π/T) e φ a fase. Ondas sonoras, corrente alternada (a tomada de 60 Hz), marés e o movimento de um pêndulo pequeno são descritos assim.</p>`,
        grafico: {
          op: { altura: 210, modo: "cartesiano" },
          cena: { x: [-0.3, 6.6], y: [-1.4, 1.4], series: [
            { tipo: "funcao", f: (x) => Math.sin(x), rotulo: "y = sen x", cor: VERMELHO },
            { tipo: "funcao", f: (x) => Math.cos(x), rotulo: "y = cos x", cor: AZUL },
            { tipo: "vline", v: Math.PI, cor: CINZA, tracejado: true, largura: 1, rotulo: "π", legenda: false },
            { tipo: "vline", v: 2 * Math.PI, cor: CINZA, tracejado: true, largura: 1, rotulo: "2π", legenda: false },
            { tipo: "marca", x: Math.PI / 2, y: 1, rotulo: "máx em π/2" },
          ] },
          legenda: "Uma volta no círculo (0 a 2π rad) vira um período completo da onda. O cosseno está 90° (π/2) adiantado em relação ao seno.",
        },
      },
      {
        t: "Triângulos quaisquer: leis dos senos e dos cossenos",
        h: `<p>Se o triângulo não é retângulo, use as leis abaixo, com a, b e c sendo os lados opostos aos ângulos A, B e C.</p>
          <div class="eq">${fr("a", "sen A")} = ${fr("b", "sen B")} = ${fr("c", "sen C")} = 2R</div>
          <p><b>Lei dos senos</b>: use quando conhece um lado e o ângulo oposto a ele (mais um dado). R é o raio do círculo que passa pelos três vértices. Ex.: A = 30°, a = 10 e B = 45° → b = 10 × sen 45°/sen 30° = 10 × 0,7071/0,5 ≈ 14,1.</p>
          <div class="eq">a² = b² + c² − 2bc·cos A</div>
          <p><b>Lei dos cossenos</b>: use com dois lados e o ângulo entre eles (para achar o terceiro lado) ou com os três lados (para achar ângulos). É Pitágoras “corrigido”: se A = 90°, cos A = 0 e volta a a² = b² + c². No triângulo de lados 7, 8 e 9: cos A = (8² + 9² − 7²)/(2 × 8 × 9) = 96/144 ≈ 0,667, logo A ≈ 48,2°.</p>`,
      },
    ],
    formulas: [
      { nome: "Razões no triângulo retângulo", eq: `sen α = ${fr("op", "hip")} &nbsp; cos α = ${fr("adj", "hip")} &nbsp; tg α = ${fr("op", "adj")}`, simbolos: [["op, adj", "catetos oposto e adjacente ao ângulo α", "unidade de comprimento"], ["hip", "hipotenusa (oposta ao ângulo reto)", "unidade de comprimento"]], obs: "Só valem em triângulos retângulos e para os ângulos agudos." },
      { nome: "Identidade fundamental", eq: `sen² θ + cos² θ = 1 &nbsp;&nbsp; tg θ = ${fr("sen θ", "cos θ")}`, simbolos: [["θ", "qualquer ângulo", "° ou rad"]], obs: "Vale para todo ângulo, não só agudos: é Pitágoras no círculo de raio 1." },
      { nome: "Lei dos cossenos", eq: `a² = b² + c² − 2bc·cos A`, simbolos: [["a", "lado oposto ao ângulo A", "—"], ["b, c", "lados que formam o ângulo A", "—"]], obs: "Para A obtuso, cos A &lt; 0 e o termo vira soma: o lado oposto fica maior." },
      { nome: "Graus e radianos", eq: `180° = π rad &nbsp;&nbsp; s = r·θ`, simbolos: [["s", "comprimento do arco", "m"], ["r", "raio", "m"], ["θ", "ângulo central", "rad"]], obs: "Em cálculo e física (ω, derivadas de sen e cos), use sempre radianos." },
    ],
    exemplos: [
      {
        t: "direto",
        enunciado: `Uma escada de 5,0 m está apoiada numa parede, formando 60° com o chão. A que altura ela toca a parede? E a que distância da parede fica o pé da escada?`,
        passos: [`A escada é a hipotenusa (5,0 m); a altura é o cateto oposto ao ângulo de 60°; a distância é o adjacente.`, `Altura: h = 5,0 × sen 60° = 5,0 × 0,866 ≈ 4,33 m.`, `Distância: d = 5,0 × cos 60° = 5,0 × 0,5 = 2,5 m.`, `Conferir com Pitágoras: 4,33² + 2,5² = 18,75 + 6,25 = 25 = 5,0².`],
        resposta: `<b>h ≈ 4,3 m</b> e <b>d = 2,5 m</b>`,
      },
      {
        t: "círculo e radianos",
        enunciado: `Calcule sen 210°, cos 210° e o comprimento do arco de 210° num círculo de raio 3,0 cm.`,
        passos: [`210° = 180° + 30°: está no 3º quadrante, onde seno e cosseno são negativos.`, `Redução: sen 210° = −sen 30° = −1/2; cos 210° = −cos 30° = −√3/2 ≈ −0,866.`, `Em radianos: 210 × π/180 = 7π/6 ≈ 3,665 rad.`, `Arco: s = r·θ = 3,0 cm × 3,665 ≈ 11,0 cm.`],
        resposta: `<b>sen = −0,5</b>, <b>cos ≈ −0,866</b>, <b>arco ≈ 11 cm</b>`,
      },
      {
        t: "lei dos cossenos (de prova)",
        enunciado: `Dois navios partem do mesmo porto. Um navega 10 km numa direção, o outro 16 km noutra, e o ângulo entre as rotas é de 60°. Qual a distância entre eles?`,
        passos: [`Os dois lados conhecidos (10 e 16 km) formam o ângulo de 60°: lei dos cossenos.`, `d² = 10² + 16² − 2 × 10 × 16 × cos 60° = 100 + 256 − 320 × 0,5.`, `d² = 356 − 160 = 196.`, `d = √196 = 14 km.`],
        resposta: `<b>d = 14 km</b>`,
      },
    ],
    erros: [
      { errado: `Calcular sen 30 na calculadora em modo radiano e obter −0,988.`, certo: `Verifique o modo: em graus, sen 30° = 0,5. Em radianos, 30 rad é outro ângulo.`, porque: `É o erro mais comum de prova: a calculadora não sabe a unidade que você quis.` },
      { errado: `Usar SOH-CAH-TOA num triângulo que não é retângulo.`, certo: `Em triângulos quaisquer, use a lei dos senos ou a dos cossenos.`, porque: `As razões só valem quando há um ângulo reto e a hipotenusa está definida.` },
      { errado: `sen(2x) = 2·sen x.`, certo: `sen(2x) = 2·sen x·cos x. Ex.: sen 60° ≈ 0,866, mas 2·sen 30° = 1.`, porque: `Seno não é linear: não “sai” multiplicando.` },
      { errado: `Trocar o cateto oposto pelo adjacente quando o ângulo muda de vértice.`, certo: `Oposto e adjacente dependem de qual ângulo você está usando; refaça os rótulos para cada ângulo.`, porque: `O cateto oposto a α é o adjacente ao outro ângulo agudo.` },
      { errado: `Achar que sen θ = 0,5 só tem a solução θ = 30°.`, certo: `Em 0° a 360°, θ = 30° ou θ = 150° (o seno é positivo no 1º e no 2º quadrantes).`, porque: `Funções periódicas repetem valores; arcsen devolve só um deles.` },
    ],
    aplicacoes: [
      `<b>Física</b>: decompor uma força ou velocidade em componentes (F<sub>x</sub> = F·cos θ, F<sub>y</sub> = F·sen θ), plano inclinado e lançamento oblíquo.`,
      `<b>Engenharia elétrica</b>: a tensão da tomada é v(t) = 127√2·sen(2π·60·t) V; fasores e potência usam cosseno do ângulo de fase.`,
      `<b>Topografia e GPS</b>: triangulação mede distâncias inacessíveis a partir de ângulos e uma base conhecida.`,
      `<b>Computação gráfica e jogos</b>: girar uma imagem na tela é aplicar seno e cosseno a cada ponto.`,
      `<b>Química</b>: a geometria molecular usa ângulos (104,5° na água) e a difração de raios X usa a lei de Bragg, nλ = 2d·sen θ.`,
    ],
    teste: [
      { p: `Dois triângulos retângulos têm um ângulo de 35°, mas um é o dobro do outro. O sen 35° calculado neles:`, op: [`é o dobro no triângulo maior.`, `é a metade no triângulo maior.`, `é igual nos dois.`, `depende da hipotenusa.`], certa: 2, explica: `Triângulos com os mesmos ângulos são semelhantes: os lados dobram juntos e a razão oposto/hipotenusa não muda. O seno depende só do ângulo.` },
      { p: `No círculo trigonométrico, num ângulo do 2º quadrante (entre 90° e 180°):`, op: [`seno e cosseno são positivos.`, `seno é negativo e cosseno positivo.`, `seno é positivo e cosseno negativo.`, `os dois são negativos.`], certa: 2, explica: `O ponto P = (cos θ; sen θ) fica à esquerda do eixo y (x &lt; 0) e acima do eixo x (y &gt; 0).` },
      { p: `Quanto vale π/4 rad em graus?`, op: [`45°`, `90°`, `4°`, `0,785°`], certa: 0, explica: `π rad = 180°, então π/4 = 180°/4 = 45°. (0,785 é o valor numérico de π/4 em radianos, não em graus.)` },
      { p: `Você conhece os três lados de um triângulo e quer um ângulo. Qual ferramenta usar?`, op: [`SOH-CAH-TOA.`, `Lei dos senos.`, `Identidade sen² + cos² = 1.`, `Lei dos cossenos.`], certa: 3, explica: `A lei dos cossenos isola cos A = (b² + c² − a²)/(2bc) usando só os lados. A lei dos senos exigiria já conhecer um ângulo.` },
      { p: `Se cos θ = 0,6 e θ é agudo, sen θ vale:`, op: [`0,4`, `0,8`, `0,36`, `1,6`], certa: 1, explica: `sen² θ = 1 − 0,36 = 0,64, então sen θ = 0,8. (Não é 1 − 0,6: a identidade é com os quadrados.)` },
      { p: `Por que físicos e matemáticos preferem radianos?`, op: [`Porque são mais precisos que graus.`, `Porque o arco fica s = r·θ e as derivadas de sen e cos ficam simples.`, `Porque a calculadora só funciona em radianos.`, `Porque 1 rad = 1°.`], certa: 1, explica: `Em radianos, o ângulo é a razão arco/raio, sem fatores extras. Em graus, (sen x)′ = (π/180)·cos x, uma constante incômoda.` },
    ],
    resumo: [
      `SOH-CAH-TOA: sen = op/hip; cos = adj/hip; tg = op/adj (triângulo retângulo).`,
      `30°, 45°, 60°: sen = 1/2, √2/2, √3/2; cos na ordem inversa; tg 45° = 1.`,
      `sen² θ + cos² θ = 1 para qualquer ângulo.`,
      `Círculo de raio 1: P = (cos θ; sen θ); sinais dependem do quadrante.`,
      `180° = π rad; arco s = r·θ (θ em rad).`,
      `Triângulo qualquer: a/sen A = b/sen B; a² = b² + c² − 2bc·cos A.`,
    ],
    alem: {
      t: "Para ir além: fórmula de Euler e séries de Fourier",
      h: `<p>Para ângulos pequenos em radianos, sen x ≈ x e cos x ≈ 1 − x²/2 (sen 0,1 = 0,0998). Essa aproximação transforma a equação do pêndulo num oscilador simples, com período T = 2π√(L/g). Ela é o começo das <b>séries de Taylor</b>: sen x = x − x³/3! + x⁵/5! − …</p>
        <p>Comparando essas séries com a de eˣ, Euler descobriu a ligação entre exponencial e trigonometria:</p>
        <div class="eq">e<sup>iθ</sup> = cos θ + i·sen θ</div>
        <p>Com θ = π, sai e<sup>iπ</sup> + 1 = 0, que junta cinco constantes fundamentais. Na prática, engenheiros representam ondas e correntes alternadas como números complexos (fasores), porque somar ângulos vira multiplicar exponenciais.</p>
        <p>Fourier mostrou que <b>qualquer</b> sinal periódico (uma nota musical, um batimento cardíaco no ECG) é uma soma de senos e cossenos de frequências múltiplas. É a base da compressão de áudio (MP3), de imagens (JPEG), da ressonância magnética e da espectroscopia no infravermelho.</p>`,
    },
  };

  // ======================================================================
  // 5. Vetores
  // ======================================================================
  A.vetores = {
    tempo: 18, nivel: "Ensino médio → faculdade · linguagem de toda a mecânica",
    objetivos: [
      "explicar o que são módulo, direção e sentido e por que grandezas vetoriais não se somam como números;",
      "decompor um vetor em componentes e reconstruí-lo a partir delas;",
      "somar vetores pela regra do polígono, do paralelogramo e por componentes;",
      "calcular o produto escalar e o ângulo entre dois vetores;",
      "usar o produto vetorial em torque e força magnética.",
    ],
    requisitos: [{ id: "trig", nome: "Trigonometria" }],
    secoes: [
      {
        t: "A ideia em uma frase",
        h: `<p>Algumas grandezas ficam bem descritas por um número só: massa (2 kg), temperatura (25 °C), energia (100 J). São <b>escalares</b>. Outras precisam dizer também <b>para onde</b>: deslocamento, velocidade, força, campo elétrico. São <b>vetores</b>, desenhados como setas.</p>
          <div class="analogia"><b>Analogia:</b> se alguém diz “ande 5 quarteirões”, você não sabe aonde vai chegar. “Ande 5 quarteirões para o norte” resolve. E andar 3 quarteirões para o leste e depois 4 para o norte não te deixa a 7 quarteirões do início, mas a 5 (em linha reta). Vetores se somam com geometria, não com aritmética simples.</div>
          <p>Todo vetor tem três informações: <b>módulo</b> (tamanho, sempre ≥ 0, com unidade), <b>direção</b> (a reta em que ele está: horizontal, vertical, 30° com o chão) e <b>sentido</b> (para qual lado da reta a seta aponta). Dois vetores são iguais só se coincidirem nas três.</p>`,
      },
      {
        t: "Componentes: o vetor em coordenadas",
        h: `<p>Num plano com eixos x e y, todo vetor pode ser escrito pelas suas <b>componentes</b>: u = (u<sub>x</sub>; u<sub>y</sub>). É quanto ele “anda” em x e quanto “anda” em y. Do vetor às componentes, e de volta:</p>
          <div class="eq">u<sub>x</sub> = |u|·cos θ &nbsp;&nbsp; u<sub>y</sub> = |u|·sen θ &nbsp;&nbsp; |u| = √(u<sub>x</sub>² + u<sub>y</sub>²) &nbsp;&nbsp; tg θ = ${fr("u<sub>y</sub>", "u<sub>x</sub>")}</div>
          <p>θ é o ângulo medido a partir do eixo x positivo. Uma força de 10 N a 30° tem componentes F<sub>x</sub> = 10 × cos 30° ≈ 8,66 N e F<sub>y</sub> = 10 × sen 30° = 5,00 N. No sentido inverso, u = (3; 4) tem módulo √(9 + 16) = 5 e ângulo θ = arctg(4/3) ≈ 53,1°.</p>
          <p>Em 3D, acrescenta-se u<sub>z</sub>, e o módulo fica √(u<sub>x</sub>² + u<sub>y</sub>² + u<sub>z</sub>²). Cuidado com o arctg: para u = (−3; −4), arctg(4/3) também dá 53,1°, mas o vetor está no 3º quadrante (θ ≈ 233,1°). Olhe sempre os sinais das componentes.</p>`,
      },
      {
        t: "Somar vetores: polígono, paralelogramo e componentes",
        h: `<p><b>Regra do polígono</b>: ponha a origem de cada vetor na ponta do anterior; a soma vai da origem do primeiro à ponta do último. <b>Regra do paralelogramo</b>: ponha os dois vetores na mesma origem e complete o paralelogramo; a diagonal é a soma. As duas dão o mesmo resultado.</p>
          <p>Para calcular, o caminho mais seguro é <b>somar componente a componente</b>: u = (3; 4) e v = (1; −2) dão u + v = (4; 2), de módulo √(16 + 4) = √20 ≈ 4,47. Note que 4,47 é bem menor que |u| + |v| = 5 + 2,24 = 7,24: os vetores apontam em direções diferentes e se “atrapalham” em parte.</p>
          <p>Para dois vetores de módulos a e b com ângulo θ entre eles, a lei dos cossenos dá o módulo da resultante:</p>
          <div class="eq">|R|² = a² + b² + 2ab·cos θ</div>
          <p>Casos importantes: mesmo sentido (θ = 0°) → |R| = a + b; sentidos opostos (180°) → |R| = |a − b|; perpendiculares (90°) → |R| = √(a² + b²). Forças de 3 N e 4 N a 60° dão √(9 + 16 + 24 × 0,5) = √37 ≈ 6,08 N. A subtração é soma com o oposto: u − v = u + (−v).</p>`,
        grafico: {
          op: { altura: 240, modo: "cartesiano", igual: true },
          cena: { x: [-1, 5.5], y: [-2.5, 4.8], series: [
            { tipo: "vetor", para: [3, 4], cor: AZUL, rotulo: "u = (3; 4)" },
            { tipo: "vetor", para: [1, -2], cor: VERMELHO, rotulo: "v = (1; −2)" },
            { tipo: "vetor", de: [3, 4], para: [4, 2], cor: VERMELHO, tracejado: true, largura: 1.6, etiqueta: false, legenda: false },
            { tipo: "vetor", para: [4, 2], cor: LARANJA, rotulo: "u + v = (4; 2)" },
          ] },
          legenda: "Regra do polígono: a cópia tracejada de v começa na ponta de u; a soma vai da origem até a ponta final.",
        },
      },
      {
        t: "Produto escalar: quanto um vetor “ajuda” o outro",
        h: `<p>O <b>produto escalar</b> de dois vetores dá um <b>número</b> (não um vetor) e pode ser calculado de dois jeitos:</p>
          <div class="eq">u · v = u<sub>x</sub>v<sub>x</sub> + u<sub>y</sub>v<sub>y</sub> + u<sub>z</sub>v<sub>z</sub> = |u|·|v|·cos θ</div>
          <p>Igualando as duas formas, acha-se o <b>ângulo entre vetores</b>. Para u = (3; 4) e v = (1; −2): u · v = 3 × 1 + 4 × (−2) = −5; |u| = 5; |v| = √5 ≈ 2,236. Então cos θ = −5/(5 × 2,236) ≈ −0,447 e θ ≈ 116,6°. O sinal negativo já avisava: o ângulo é obtuso.</p>
          <ul><li>u · v &gt; 0: ângulo agudo (eles “concordam”).</li>
          <li>u · v = 0: <b>perpendiculares</b> (teste mais rápido de ortogonalidade).</li>
          <li>u · v &lt; 0: ângulo obtuso (eles “discordam”).</li></ul>
          <p>Na física, o <b>trabalho</b> é um produto escalar: W = F · d = F·d·cos θ. Puxar uma mala com 50 N, num ângulo de 60° com o chão, por 10 m, realiza W = 50 × 10 × 0,5 = 250 J. Só a componente da força na direção do movimento trabalha.</p>`,
      },
      {
        t: "Produto vetorial: perpendicular e com “mão direita”",
        h: `<p>O <b>produto vetorial</b> u × v (só em 3D) dá um <b>vetor perpendicular</b> aos dois, de módulo |u|·|v|·sen θ, que é a área do paralelogramo formado por u e v. O sentido segue a <b>regra da mão direita</b>: dedos de u para v, o polegar aponta u × v.</p>
          <div class="eq">u × v = (u<sub>y</sub>v<sub>z</sub> − u<sub>z</sub>v<sub>y</sub>; u<sub>z</sub>v<sub>x</sub> − u<sub>x</sub>v<sub>z</sub>; u<sub>x</sub>v<sub>y</sub> − u<sub>y</sub>v<sub>x</sub>)</div>
          <p>Exemplo: u = (2; 1; 0) e v = (1; 3; 0) dão u × v = (1·0 − 0·3; 0·1 − 2·0; 2·3 − 1·1) = (0; 0; 5). Aponta para fora do plano xy, e o paralelogramo tem área 5.</p>
          <p>Ele <b>não é comutativo</b>: v × u = −(u × v). E é zero para vetores paralelos (sen 0° = 0). Aplicações: <b>torque</b> τ = r × F (uma chave de 0,5 m com força de 20 N perpendicular dá 10 N·m), <b>força magnética</b> F = q·v × B e momento angular L = r × p.</p>`,
      },
    ],
    formulas: [
      { nome: "Módulo e componentes", eq: `|u| = √(u<sub>x</sub>² + u<sub>y</sub>²) &nbsp;&nbsp; u<sub>x</sub> = |u|·cos θ &nbsp;&nbsp; u<sub>y</sub> = |u|·sen θ`, simbolos: [["θ", "ângulo com o eixo x positivo", "° ou rad"]], obs: "Em 3D, some u<sub>z</sub>² dentro da raiz." },
      { nome: "Resultante de dois vetores", eq: `|R|² = a² + b² + 2ab·cos θ`, simbolos: [["a, b", "módulos dos vetores", "unidade da grandeza"], ["θ", "ângulo ENTRE os dois vetores (com as origens juntas)", "°"]], obs: "Sinal +: θ é o ângulo entre os vetores, não o ângulo interno do triângulo." },
      { nome: "Produto escalar", eq: `u · v = u<sub>x</sub>v<sub>x</sub> + u<sub>y</sub>v<sub>y</sub> + u<sub>z</sub>v<sub>z</sub> = |u||v|·cos θ`, simbolos: [["u · v", "número (escalar)", "produto das unidades"]], obs: "Zero ⇔ perpendiculares. Dá o ângulo: cos θ = u·v/(|u||v|)." },
      { nome: "Produto vetorial", eq: `|u × v| = |u||v|·sen θ`, simbolos: [["u × v", "vetor perpendicular a u e a v (regra da mão direita)", "produto das unidades"]], obs: "Só em 3D; anticomutativo: v × u = −u × v." },
    ],
    exemplos: [
      {
        t: "direto",
        enunciado: `Um vetor velocidade tem módulo 20 m/s e forma 30° com a horizontal. Quais as componentes?`,
        passos: [`v<sub>x</sub> = 20 × cos 30° = 20 × 0,866 ≈ 17,3 m/s.`, `v<sub>y</sub> = 20 × sen 30° = 20 × 0,5 = 10,0 m/s.`, `Conferir: √(17,32² + 10²) = √(300 + 100) = √400 = 20 m/s.`],
        resposta: `<b>v = (17,3; 10,0) m/s</b>`,
      },
      {
        t: "composição de movimentos",
        enunciado: `Um barco atravessa um rio de 80 m de largura apontando perpendicularmente à margem, a 4,0 m/s em relação à água. A correnteza é de 3,0 m/s. Qual a velocidade do barco em relação à margem, quanto tempo leva a travessia e quanto ele é arrastado rio abaixo?`,
        passos: [`Os vetores são perpendiculares: |v| = √(4,0² + 3,0²) = √25 = 5,0 m/s.`, `Tempo: só a componente perpendicular à margem atravessa o rio: t = 80 m / 4,0 m/s = 20 s.`, `Arrasto: a correnteza age durante os mesmos 20 s: 3,0 m/s × 20 s = 60 m.`, `Direção: tg θ = 3,0/4,0 → θ ≈ 36,9° em relação à perpendicular.`],
        resposta: `<b>5,0 m/s</b>, travessia em <b>20 s</b>, arrastado <b>60 m</b>`,
      },
      {
        t: "ângulo por produto escalar",
        enunciado: `Ache o ângulo entre u = (1; 2; 2) e v = (2; −2; 1). Eles são perpendiculares?`,
        passos: [`u · v = 1 × 2 + 2 × (−2) + 2 × 1 = 2 − 4 + 2 = 0.`, `Como o produto escalar é zero, cos θ = 0 e θ = 90°.`, `Conferir módulos (não precisa para o ângulo, mas ajuda): |u| = √9 = 3; |v| = √9 = 3.`],
        resposta: `<b>θ = 90°</b>: são perpendiculares`,
      },
    ],
    erros: [
      { errado: `Forças de 3 N e 4 N sempre dão resultante de 7 N.`, certo: `A resultante fica entre 1 N e 7 N, conforme o ângulo; perpendiculares dão 5 N.`, porque: `Somar módulos só vale para vetores de mesma direção e sentido.` },
      { errado: `Usar arctg(u<sub>y</sub>/u<sub>x</sub>) sem olhar os sinais e dizer que (−3; −4) aponta a 53,1°.`, certo: `(−3; −4) está no 3º quadrante: θ ≈ 53,1° + 180° = 233,1°.`, porque: `arctg não distingue (3; 4) de (−3; −4), que têm a mesma razão.` },
      { errado: `Achar que o produto escalar dá um vetor.`, certo: `u · v é um número; o produto vetorial é que dá vetor.`, porque: `Trabalho e potência (escalares) vêm do produto escalar; torque (vetor) vem do vetorial.` },
      { errado: `Calcular u × v e v × u e esperar o mesmo vetor.`, certo: `v × u = −(u × v): mesmo módulo, sentido oposto.`, porque: `A regra da mão direita depende da ordem: o polegar inverte.` },
      { errado: `Decompor com seno e cosseno trocados quando o ângulo é dado com a vertical.`, certo: `Com o ângulo medido da vertical, a componente vertical é |v|·cos e a horizontal, |v|·sen.`, porque: `O cosseno acompanha o lado adjacente ao ângulo dado, seja qual for o eixo.` },
    ],
    aplicacoes: [
      `<b>Mecânica</b>: plano inclinado (P·sen θ ao longo da rampa, P·cos θ contra ela), lançamento oblíquo e equilíbrio de corpos.`,
      `<b>Aviação e navegação</b>: o rumo de um avião corrige o vento somando vetores de velocidade.`,
      `<b>Eletromagnetismo</b>: força de Lorentz (q·v × B) em motores elétricos e espectrômetros de massa.`,
      `<b>Computação gráfica</b>: o produto escalar entre a normal de uma superfície e a direção da luz define o brilho de cada pixel.`,
      `<b>Química</b>: o momento de dipolo de uma molécula é a soma vetorial dos dipolos das ligações (no CO₂ eles se anulam; na água, não).`,
    ],
    teste: [
      { p: `Qual destas grandezas é vetorial?`, op: [`Massa`, `Energia cinética`, `Temperatura`, `Força`], certa: 3, explica: `Força exige direção e sentido. Massa, energia e temperatura ficam completas com um número e uma unidade.` },
      { p: `O produto escalar de dois vetores não nulos deu zero. Conclui-se que:`, op: [`eles são paralelos.`, `eles são perpendiculares.`, `um deles tem módulo zero.`, `eles têm sentidos opostos.`], certa: 1, explica: `u · v = |u||v| cos θ; com módulos não nulos, só pode ser cos θ = 0, ou seja, θ = 90°.` },
      { p: `Dois vetores de módulo 10 formam 120° entre si. A resultante tem módulo:`, op: [`20`, `0`, `10`, `17,3`], certa: 2, explica: `|R|² = 100 + 100 + 2 × 100 × cos 120° = 200 − 100 = 100, então |R| = 10. A 120°, eles se anulam em parte.` },
      { p: `Uma pessoa carrega uma caixa andando na horizontal com velocidade constante. A força vertical que ela faz na caixa realiza trabalho?`, op: [`Sim, positivo.`, `Sim, negativo.`, `Não: a força é perpendicular ao deslocamento.`, `Depende da massa.`], certa: 2, explica: `W = F·d·cos 90° = 0. Pode cansar o braço, mas trabalho no sentido físico só faz a componente da força ao longo do deslocamento.` },
      { p: `O que o módulo de u × v representa geometricamente?`, op: [`A área do paralelogramo formado por u e v.`, `O comprimento da soma u + v.`, `A projeção de u sobre v.`, `O ângulo entre u e v.`], certa: 0, explica: `|u × v| = |u||v| sen θ = base × altura do paralelogramo. Por isso é zero para vetores paralelos.` },
    ],
    resumo: [
      `Vetor = módulo + direção + sentido; escalar = só número e unidade.`,
      `Componentes: u<sub>x</sub> = |u| cos θ, u<sub>y</sub> = |u| sen θ; |u| = √(u<sub>x</sub>² + u<sub>y</sub>²).`,
      `Soma: componente a componente (polígono ou paralelogramo no desenho).`,
      `|R|² = a² + b² + 2ab cos θ; perpendiculares → Pitágoras.`,
      `u · v = Σ uᵢvᵢ = |u||v| cos θ: número; zero ⇔ perpendiculares; trabalho W = F · d.`,
      `u × v: vetor perpendicular, módulo |u||v| sen θ, mão direita; torque τ = r × F.`,
    ],
    alem: {
      t: "Para ir além: espaços vetoriais e por que o produto vetorial é estranho",
      h: `<p>Na álgebra linear, “vetor” é qualquer objeto que se pode somar e multiplicar por número seguindo as mesmas regras das setas: listas de n números, polinômios, funções, sinais de áudio. Um conjunto de vetores que gera todos os outros por combinações lineares, sem redundância, é uma <b>base</b>; as componentes são os coeficientes nessa base (î, ĵ, k̂ no espaço comum).</p>
        <p>O produto escalar generaliza a ideia de ângulo e comprimento para esses espaços: em estatística, a correlação entre duas variáveis é o cosseno do ângulo entre elas; em buscadores e IA, a similaridade entre textos é medida pelo cosseno entre vetores de centenas de dimensões.</p>
        <p>Já o produto vetorial só existe com essas propriedades em 3 (e, curiosamente, em 7) dimensões. Ele produz um <b>pseudovetor</b>: se você refletir o sistema num espelho, ele não se reflete como uma seta comum. É por isso que o campo magnético e o torque se comportam de modo “estranho” sob reflexão. A versão geral, válida em qualquer dimensão, é o produto exterior da álgebra geométrica, que dá um plano orientado em vez de uma seta.</p>`,
    },
  };

  // ======================================================================
  // 6. Derivadas e integrais
  // ======================================================================
  A.calculo = {
    tempo: 22, nivel: "Fim do ensino médio → 1º ano de faculdade",
    objetivos: [
      "explicar a derivada como taxa de variação instantânea e inclinação da reta tangente;",
      "derivar polinômios, produtos, quocientes, exponenciais, logaritmos, seno e cosseno, inclusive pela regra da cadeia;",
      "encontrar máximos e mínimos de problemas de otimização;",
      "interpretar a integral definida como área com sinal e calculá-la por antiderivadas (Teorema Fundamental);",
      "ligar posição, velocidade e aceleração por derivadas e integrais.",
    ],
    requisitos: [{ id: "funcoes", nome: "Funções e gráficos" }, { id: "trig", nome: "Trigonometria" }, { id: "log", nome: "Potências, raízes e logaritmos" }],
    secoes: [
      {
        t: "A ideia em uma frase",
        h: `<p>O cálculo tem duas ideias, que são inversas uma da outra. A <b>derivada</b> mede <b>quão rápido</b> algo muda num instante. A <b>integral</b> <b>acumula</b> pequenas contribuições para obter um total.</p>
          <div class="analogia"><b>Analogia:</b> no painel de um carro, o velocímetro mostra a derivada (quantos metros por segundo você está andando <i>agora</i>) e o hodômetro mostra a integral (quantos metros você acumulou desde a partida). Se você conhece um, consegue reconstruir o outro.</div>
          <p>Essas duas ferramentas, criadas por Newton e Leibniz no século XVII, são a linguagem da física (velocidade, aceleração, trabalho, fluxo), da química (velocidade de reação), da economia (custo marginal) e da biologia (crescimento de populações).</p>`,
      },
      {
        t: "De taxa média a taxa instantânea: a derivada",
        h: `<p>A <b>taxa de variação média</b> de f entre a e b é a inclinação da reta <b>secante</b> que liga os dois pontos do gráfico: [f(b) − f(a)]/(b − a). Para f(x) = x² entre 1 e 2: (4 − 1)/(2 − 1) = 3.</p>
          <p>Para saber a taxa <b>no ponto</b> x = 1, aproxime o segundo ponto: entre 1 e 1 + h, a taxa é [(1 + h)² − 1]/h = (2h + h²)/h = 2 + h. Com h = 0,1 dá 2,1; com h = 0,001 dá 2,001. Quando h tende a zero, a taxa tende a <b>2</b>. Esse valor limite é a derivada:</p>
          <div class="eq">f′(x) = lim<sub>h→0</sub> ${fr("f(x + h) − f(x)", "h")}</div>
          <p>Geometricamente, a secante gira até virar a <b>reta tangente</b>, que só “raspa” a curva naquele ponto. Para x² em x = 1, a tangente é y = 2x − 1. Onde f′ &gt; 0, a função cresce; onde f′ &lt; 0, decresce; onde f′ = 0, a tangente é horizontal.</p>`,
        grafico: {
          op: { altura: 230, modo: "cartesiano" },
          cena: { x: [-0.5, 2.6], y: [-1.2, 5], series: [
            { tipo: "funcao", f: (x) => x * x, rotulo: "f(x) = x²" },
            { tipo: "funcao", f: (x) => 3 * x - 2, cor: CINZA, tracejado: true, largura: 1.4, rotulo: "secante (inclinação 3)" },
            { tipo: "funcao", f: (x) => 2 * x - 1, cor: AZUL, largura: 1.8, rotulo: "tangente (inclinação 2)" },
            { tipo: "marca", x: 1, y: 1, rotulo: "(1; 1)" },
            { tipo: "marca", x: 2, y: 4, vazia: true, rotulo: "(2; 4)" },
          ] },
          legenda: "Aproximando o ponto (2; 4) de (1; 1), a secante vira a tangente, cuja inclinação é a derivada f′(1) = 2.",
        },
      },
      {
        t: "Regras de derivação",
        h: `<p>Ninguém calcula limites toda vez: das definições saem regras que resolvem quase tudo.</p>
          <div class="tab-rolar"><table class="tb">
            <tr><th>Função</th><th>Derivada</th><th>Exemplo</th></tr>
            <tr><td>constante c</td><td>0</td><td>(7)′ = 0</td></tr>
            <tr><td>xⁿ</td><td>n·xⁿ⁻¹</td><td>(x⁵)′ = 5x⁴; (√x)′ = 1/(2√x)</td></tr>
            <tr><td>eˣ</td><td>eˣ</td><td>(3eˣ)′ = 3eˣ</td></tr>
            <tr><td>ln x</td><td>1/x</td><td>(ln x)′ em x = 2 vale 0,5</td></tr>
            <tr><td>sen x</td><td>cos x</td><td>x em radianos</td></tr>
            <tr><td>cos x</td><td>−sen x</td><td>atenção ao sinal</td></tr>
          </table></div>
          <ul><li><b>Soma e constante</b>: (f + g)′ = f′ + g′; (c·f)′ = c·f′. Assim, (3x² + 2x − 1)′ = 6x + 2.</li>
          <li><b>Produto</b>: (f·g)′ = f′·g + f·g′. Ex.: (x²·sen x)′ = 2x·sen x + x²·cos x.</li>
          <li><b>Quociente</b>: (f/g)′ = (f′·g − f·g′)/g².</li>
          <li><b>Cadeia</b> (função dentro de função): [f(g(x))]′ = f′(g(x))·g′(x). Derive “a de fora”, mantendo a de dentro, e multiplique pela derivada “da de dentro”: [(2x + 1)⁵]′ = 5(2x + 1)⁴ · 2 = 10(2x + 1)⁴; [sen(3x²)]′ = cos(3x²)·6x.</li></ul>`,
      },
      {
        t: "Máximos e mínimos: otimização",
        h: `<p>Num pico ou num vale suave, a tangente é horizontal: <b>f′(x) = 0</b>. Esses pontos são os <b>pontos críticos</b>. Para saber se é máximo ou mínimo, olhe o sinal de f′ antes e depois (sobe-desce = máximo; desce-sobe = mínimo) ou a segunda derivada: f″ &lt; 0 indica máximo e f″ &gt; 0, mínimo.</p>
          <p>Roteiro de otimização: (1) escreva a grandeza a otimizar em função de <b>uma</b> variável, usando a restrição do problema; (2) derive e iguale a zero; (3) confira se é máximo ou mínimo e se está dentro do domínio (compare também com os extremos do intervalo).</p>
          <p>Exemplo clássico: com 100 m de cerca, qual retângulo tem a maior área? Lados x e y com 2x + 2y = 100, então y = 50 − x e A(x) = x(50 − x) = 50x − x². A′(x) = 50 − 2x = 0 → x = 25 m, y = 25 m, A = 625 m². A″ = −2 &lt; 0 confirma o máximo: o melhor retângulo é o quadrado.</p>`,
      },
      {
        t: "Integral: área, acumulação e antiderivada",
        h: `<p>A <b>integral definida</b> ∫<sub>a</sub><sup>b</sup> f(x) dx soma a “área com sinal” entre o gráfico e o eixo x, de a até b: partes acima do eixo contam positivo, partes abaixo, negativo. A ideia vem de fatiar a região em retângulos finíssimos de largura dx e altura f(x) e somar tudo (somas de Riemann).</p>
          <p>Calcular por fatias seria interminável. O <b>Teorema Fundamental do Cálculo</b> resolve: se F′ = f (F é uma <b>antiderivada</b> ou primitiva de f), então</p>
          <div class="eq">∫<sub>a</sub><sup>b</sup> f(x) dx = F(b) − F(a)</div>
          <p>Para f(x) = 3x² + 2x − 1, uma primitiva é F(x) = x³ + x² − x (derive e confira). De 0 a 2: F(2) − F(0) = (8 + 4 − 2) − 0 = <b>10</b>. No gráfico, entre 0 e 1/3 a função é negativa e essa pequena faixa (área −5/27 ≈ −0,19) é descontada do total.</p>
          <p>Regra da potência para primitivas: ∫xⁿ dx = xⁿ⁺¹/(n + 1) + C (n ≠ −1), e ∫(1/x) dx = ln|x| + C. A constante C aparece porque derivar apaga constantes: x³ e x³ + 7 têm a mesma derivada.</p>`,
        grafico: {
          op: { altura: 230, modo: "cartesiano" },
          cena: { x: [-0.6, 2.4], y: [-2, 16], series: [
            { tipo: "area", f: (x) => 3 * x * x + 2 * x - 1, a: 0, b: 2, rotulo: "área com sinal = 10", cor: LARANJA },
            { tipo: "funcao", f: (x) => 3 * x * x + 2 * x - 1, rotulo: "f(x) = 3x² + 2x − 1" },
            { tipo: "vline", v: 0, cor: CINZA, largura: 1, rotulo: "a = 0", legenda: false },
            { tipo: "vline", v: 2, cor: CINZA, largura: 1, rotulo: "b = 2", legenda: false },
          ] },
          legenda: "∫₀² (3x² + 2x − 1) dx = 10. A faixa entre 0 e 1/3, abaixo do eixo, entra com sinal negativo.",
        },
      },
    ],
    formulas: [
      { nome: "Definição de derivada", eq: `f′(x) = lim<sub>h→0</sub> ${fr("f(x + h) − f(x)", "h")}`, simbolos: [["f′(x)", "taxa de variação instantânea = inclinação da tangente", "unidade de f por unidade de x"]], obs: "Velocidade = derivada da posição; aceleração = derivada da velocidade." },
      { nome: "Regra da potência e da cadeia", eq: `(xⁿ)′ = n·xⁿ⁻¹ &nbsp;&nbsp; [f(g(x))]′ = f′(g(x))·g′(x)`, simbolos: [["n", "qualquer expoente real", "—"]], obs: "Na cadeia, não esqueça de multiplicar pela derivada de dentro." },
      { nome: "Reta tangente", eq: `y = f(x₀) + f′(x₀)·(x − x₀)`, simbolos: [["x₀", "ponto de tangência", "—"]], obs: "Também é a melhor aproximação linear de f perto de x₀." },
      { nome: "Teorema Fundamental do Cálculo", eq: `∫<sub>a</sub><sup>b</sup> f(x) dx = F(b) − F(a), &nbsp; com F′ = f`, simbolos: [["F", "antiderivada (primitiva) de f", "—"], ["a, b", "limites de integração", "—"]], obs: "Na integral definida a constante C se cancela; na indefinida, escreva + C." },
    ],
    exemplos: [
      {
        t: "direto (regra do produto)",
        enunciado: `Derive f(x) = x²·sen x e calcule a inclinação da tangente em x = 1 (radiano).`,
        passos: [`Produto de x² e sen x: f′ = (x²)′·sen x + x²·(sen x)′.`, `f′(x) = 2x·sen x + x²·cos x.`, `Em x = 1: 2 × sen 1 + 1 × cos 1 = 2 × 0,8415 + 0,5403 = 1,6829 + 0,5403.`, `f′(1) ≈ 2,223. Tangente: y ≈ 0,841 + 2,223·(x − 1).`],
        resposta: `<b>f′(x) = 2x·sen x + x²·cos x</b>; f′(1) ≈ <b>2,22</b>`,
      },
      {
        t: "otimização",
        enunciado: `De uma folha quadrada de papelão de 30 cm de lado, cortam-se quadrados de lado x nos cantos e dobram-se as abas para formar uma caixa sem tampa. Que x dá o volume máximo?`,
        passos: [`Volume: base (30 − 2x) por (30 − 2x), altura x: V(x) = x(30 − 2x)², com 0 &lt; x &lt; 15.`, `Derivada (produto + cadeia): V′ = (30 − 2x)² + x·2(30 − 2x)(−2) = (30 − 2x)(30 − 2x − 4x) = (30 − 2x)(30 − 6x).`, `V′ = 0 → x = 15 (caixa sem base, descartado) ou x = 5 cm.`, `V(5) = 5 × 20² = 2 000 cm³. Teste: V(4) = 4 × 22² = 1 936 e V(6) = 6 × 18² = 1 944, ambos menores: é máximo.`],
        resposta: `<b>x = 5 cm</b>, volume máximo de <b>2 000 cm³</b> (2 L)`,
      },
      {
        t: "integral na física",
        enunciado: `Um carro parte do repouso e sua velocidade é v(t) = 3t² (v em m/s, t em s). Quanto ele anda nos 2 primeiros segundos? E qual a aceleração em t = 2 s?`,
        passos: [`Deslocamento = integral da velocidade: Δs = ∫₀² 3t² dt.`, `Primitiva de 3t²: t³. Δs = 2³ − 0³ = 8 m.`, `Aceleração = derivada da velocidade: a(t) = 6t; em t = 2 s, a = 12 m/s².`, `Conferir unidades: (m/s) × s = m; (m/s)/s = m/s².`],
        resposta: `<b>Δs = 8 m</b> e <b>a(2) = 12 m/s²</b>`,
      },
    ],
    erros: [
      { errado: `(x²·sen x)′ = 2x·cos x (derivar cada fator e multiplicar).`, certo: `Regra do produto: 2x·sen x + x²·cos x.`, porque: `A derivada de um produto não é o produto das derivadas; teste com x·x: (x²)′ = 2x, mas 1·1 = 1.` },
      { errado: `[(2x + 1)⁵]′ = 5(2x + 1)⁴.`, certo: `5(2x + 1)⁴ · 2 = 10(2x + 1)⁴.`, porque: `Regra da cadeia: falta multiplicar pela derivada da função de dentro, (2x + 1)′ = 2.` },
      { errado: `Esquecer o + C numa integral indefinida, ou o sinal em (cos x)′ = sen x.`, certo: `∫2x dx = x² + C; (cos x)′ = −sen x.`, porque: `Infinitas funções têm a mesma derivada; e o cosseno decresce logo depois de x = 0, então sua derivada começa negativa.` },
      { errado: `Achar que a integral definida é sempre a área geométrica (positiva).`, certo: `É a área com sinal; para a área total, integre |f| ou separe os trechos onde f &lt; 0.`, porque: `∫₀^(2π) sen x dx = 0, embora haja área dos dois lados do eixo.` },
      { errado: `Concluir que todo ponto com f′ = 0 é máximo ou mínimo.`, certo: `Verifique a mudança de sinal de f′: em f(x) = x³, f′(0) = 0 mas não há extremo.`, porque: `x³ só “descansa” em x = 0 e continua crescendo (ponto de inflexão).` },
    ],
    aplicacoes: [
      `<b>Física</b>: v = ds/dt, a = dv/dt; trabalho W = ∫F dx; carga Q = ∫i dt.`,
      `<b>Química</b>: velocidade de reação é −d[A]/dt; integrar a lei de velocidade dá as equações de meia-vida.`,
      `<b>Economia</b>: custo e receita marginais são derivadas; o lucro máximo ocorre onde receita marginal = custo marginal.`,
      `<b>Medicina e farmacologia</b>: a área sob a curva de concentração no sangue (AUC) mede a exposição total a um remédio.`,
      `<b>Engenharia e IA</b>: otimizar formas, rotas e o treinamento de redes neurais (gradiente descendente) é achar onde a derivada é zero.`,
    ],
    teste: [
      { p: `O que f′(3) = −2 informa sobre f?`, op: [`Que f(3) = −2.`, `Que em x = 3 a função decresce, com inclinação −2.`, `Que x = 3 é raiz de f.`, `Que f tem mínimo em x = 3.`], certa: 1, explica: `A derivada é a inclinação da tangente, não o valor da função. Negativa → a função desce ali, 2 unidades de y por unidade de x.` },
      { p: `A posição de um corpo é s(t) = 5t² (SI). Sua velocidade em t = 3 s é:`, op: [`45 m/s`, `15 m/s`, `30 m/s`, `10 m/s`], certa: 2, explica: `v = s′ = 10t; v(3) = 30 m/s. 45 m é a posição, e 15 m/s seria a velocidade média de 0 a 3 s.` },
      { p: `∫₋₁¹ x³ dx vale:`, op: [`0`, `1/2`, `2`, `1/4`], certa: 0, explica: `x³ é ímpar: a área de −1 a 0 (negativa) cancela a de 0 a 1 (positiva). Pelo TFC: [x⁴/4] de −1 a 1 = 1/4 − 1/4 = 0.` },
      { p: `Por que existe o “+ C” nas primitivas?`, op: [`Por convenção, sem significado.`, `Porque funções que diferem por uma constante têm a mesma derivada.`, `Porque a integral sempre tem erro de arredondamento.`, `Para indicar a área.`], certa: 1, explica: `Derivar apaga constantes, então desfazer a derivada não sabe qual constante havia. Uma condição inicial (ex.: s(0) = 0) fixa o C.` },
      { p: `Num problema de otimização, você achou f′(x) = 0 em x = 4. Qual o próximo passo?`, op: [`Responder x = 4 direto.`, `Calcular f(0).`, `Verificar se é máximo ou mínimo (sinal de f′ ou f″) e se 4 está no domínio.`, `Integrar f.`], certa: 2, explica: `Pontos críticos podem ser máximos, mínimos ou inflexões, e às vezes o ótimo está na borda do domínio.` },
      { p: `Qual a derivada de e^(2x)?`, op: [`e^(2x)`, `2x·e^(2x−1)`, `2e^(2x)`, `e²`], certa: 2, explica: `Cadeia: (eᵘ)′ = eᵘ·u′, com u = 2x e u′ = 2. A regra da potência não se aplica: a variável está no expoente.` },
    ],
    resumo: [
      `Derivada = taxa de variação instantânea = inclinação da tangente.`,
      `(xⁿ)′ = nxⁿ⁻¹; (eˣ)′ = eˣ; (ln x)′ = 1/x; (sen x)′ = cos x; (cos x)′ = −sen x.`,
      `Produto: f′g + fg′. Cadeia: derivada de fora × derivada de dentro.`,
      `Máximos e mínimos: f′ = 0 e teste de sinal (ou f″).`,
      `Integral definida = área com sinal; ∫ₐᵇ f dx = F(b) − F(a), com F′ = f.`,
      `∫xⁿ dx = xⁿ⁺¹/(n + 1) + C (n ≠ −1).`,
      `Posição → (derivar) velocidade → aceleração; integrar faz o caminho de volta.`,
    ],
    alem: {
      t: "Para ir além: limites rigorosos, equações diferenciais e Taylor",
      h: `<p>A palavra “tende” foi tornada rigorosa no século XIX por Cauchy e Weierstrass: lim<sub>x→a</sub> f(x) = L quer dizer que, para todo ε &gt; 0, existe δ &gt; 0 tal que |f(x) − L| &lt; ε sempre que 0 &lt; |x − a| &lt; δ. Com essa definição, o cálculo deixou de depender de “infinitésimos” mal definidos.</p>
        <p>As leis da natureza costumam ser <b>equações diferenciais</b>: relações entre uma função e suas derivadas. A 2ª lei de Newton é m·s″ = F; o decaimento radioativo é dN/dt = −kN, cuja solução é N = N₀e^(−kt); uma mola é m·x″ = −kx, cuja solução é um seno. Resolver uma equação diferencial é integrar.</p>
        <p>A reta tangente é a aproximação de 1ª ordem; somando termos com derivadas de ordem maior, obtém-se a <b>série de Taylor</b>: f(x) ≈ f(a) + f′(a)(x − a) + f″(a)(x − a)²/2! + … É assim que calculadoras computam sen, eˣ e ln. Quando não há primitiva elementar (como para e^(−x²), a curva normal da estatística), as integrais são calculadas numericamente, por regras como a dos trapézios ou a de Simpson, que a ferramenta usa para conferir os resultados.</p>`,
    },
  };

  // ======================================================================
  // 7. Funções e gráficos
  // ======================================================================
  A.funcoes = {
    tempo: 18, nivel: "Ensino médio → faculdade · porta de entrada do cálculo",
    objetivos: [
      "explicar o que é uma função e determinar domínio e imagem;",
      "ler num gráfico raízes, sinal, intervalos de crescimento, máximos e mínimos;",
      "reconhecer as principais famílias de funções pelo formato do gráfico;",
      "prever o efeito das transformações f(x) + k, f(x − h) e a·f(x);",
      "modelar situações simples (tarifas, lançamentos, crescimento) com funções.",
    ],
    requisitos: [{ id: "equacoes", nome: "Equações" }],
    secoes: [
      {
        t: "A ideia em uma frase",
        h: `<p>Uma <b>função</b> é uma regra que associa a <b>cada</b> entrada x <b>exatamente uma</b> saída f(x). O gráfico é o desenho de todos os pares (x; f(x)): para cada x no eixo horizontal, a altura da curva é f(x).</p>
          <div class="analogia"><b>Analogia:</b> uma máquina de refrigerante: você aperta um botão (entrada) e sai uma bebida (saída). Botões diferentes podem dar a mesma bebida, mas um mesmo botão não pode dar ora coca, ora suco; isso não seria uma função. No gráfico, esse teste vira o “teste da reta vertical”: nenhuma reta vertical pode cortar a curva duas vezes.</div>
          <p>Funções descrevem dependências: o preço do táxi depende da distância, a altura de uma bola depende do tempo, o pH depende da concentração. Ler o gráfico de uma função é ler a história dessa dependência de uma só vez.</p>`,
      },
      {
        t: "Domínio e imagem",
        h: `<p>O <b>domínio</b> é o conjunto de entradas permitidas; a <b>imagem</b>, o conjunto de saídas que de fato aparecem. Ao achar o domínio, procure as três “proibições” dos reais:</p>
          <ul><li><b>Divisão por zero</b>: em f(x) = 1/(x − 3), x ≠ 3.</li>
          <li><b>Raiz par de negativo</b>: em f(x) = √(x − 2), x − 2 ≥ 0, logo x ≥ 2.</li>
          <li><b>Log de não positivo</b>: em f(x) = log(x + 1), x + 1 &gt; 0, logo x &gt; −1.</li></ul>
          <p>Para a imagem, pense no gráfico projetado no eixo y. f(x) = x² tem domínio ℝ e imagem [0; +∞), pois um quadrado nunca é negativo. f(x) = 2ˣ tem imagem (0; +∞). sen x tem imagem [−1; 1].</p>
          <p>Em modelos, o contexto também restringe o domínio: na altura h(t) = 20t − 5t² de uma bola, só faz sentido 0 ≤ t ≤ 4 s (do lançamento até voltar ao chão), mesmo que a fórmula aceite qualquer t.</p>`,
      },
      {
        t: "Lendo um gráfico: raízes, sinal, crescimento e extremos",
        h: `<p>Tome f(x) = x³ − 3x no intervalo de −3 a 3:</p>
          <ul><li><b>Raízes</b> (onde cruza o eixo x, f(x) = 0): x³ − 3x = x(x² − 3) = 0 → x = 0 ou x = ±√3 ≈ ±1,73.</li>
          <li><b>Sinal</b>: positiva entre −1,73 e 0 e depois de 1,73; negativa antes de −1,73 e entre 0 e 1,73.</li>
          <li><b>Crescimento</b>: cresce até x = −1, decresce de −1 a 1 e volta a crescer depois de 1.</li>
          <li><b>Extremos locais</b>: máximo local em (−1; 2) e mínimo local em (1; −2), onde a tangente é horizontal (f′(x) = 3x² − 3 = 0).</li></ul>
          <p>Note a palavra “local”: f(3) = 18 é maior que o “máximo” 2. Um extremo local é o maior ou o menor valor <b>na vizinhança</b>; o máximo global no intervalo [−3; 3] está na borda, em x = 3.</p>`,
        grafico: {
          op: { altura: 230, modo: "cartesiano" },
          cena: { x: [-3, 3], y: [-5, 5], series: [
            { tipo: "funcao", f: (x) => x * x * x - 3 * x, rotulo: "f(x) = x³ − 3x" },
            { tipo: "marca", x: -Math.sqrt(3), y: 0, vazia: true, rotulo: "raiz −1,73" },
            { tipo: "marca", x: 0, y: 0, vazia: true, rotulo: "raiz 0" },
            { tipo: "marca", x: Math.sqrt(3), y: 0, vazia: true, rotulo: "raiz 1,73" },
            { tipo: "marca", x: -1, y: 2, rotulo: "máx (−1; 2)" },
            { tipo: "marca", x: 1, y: -2, rotulo: "mín (1; −2)" },
          ] },
          legenda: "Raízes, máximo e mínimo locais de x³ − 3x: o mesmo que a ferramenta Gráficos calcula para qualquer f(x).",
        },
      },
      {
        t: "Famílias de funções",
        h: `<p>Reconhecer a família pela fórmula já diz o formato do gráfico:</p>
          <div class="tab-rolar"><table class="tb">
            <tr><th>Família</th><th>Forma</th><th>Gráfico e marca registrada</th></tr>
            <tr><td>Afim (1º grau)</td><td>ax + b</td><td>reta; a = inclinação (taxa constante), b = onde corta o eixo y</td></tr>
            <tr><td>Quadrática</td><td>ax² + bx + c</td><td>parábola; a &gt; 0 abre para cima; vértice em x = −b/(2a)</td></tr>
            <tr><td>Polinomial</td><td>x³ − 3x…</td><td>curva suave; grau n tem até n raízes e n − 1 extremos</td></tr>
            <tr><td>Exponencial</td><td>a·bˣ</td><td>cresce (b &gt; 1) ou decai (0 &lt; b &lt; 1) multiplicando por um fator fixo</td></tr>
            <tr><td>Logarítmica</td><td>log<sub>b</sub> x</td><td>só x &gt; 0; cresce cada vez mais devagar</td></tr>
            <tr><td>Trigonométrica</td><td>sen x, cos x</td><td>ondas periódicas entre −1 e 1</td></tr>
            <tr><td>Racional</td><td>1/x</td><td>hipérbole; assíntotas onde o denominador zera</td></tr>
            <tr><td>Modular</td><td>|x|</td><td>“V”, sempre ≥ 0</td></tr>
          </table></div>
          <p>A diferença entre afim e exponencial é cobrada sempre: a afim <b>soma</b> a mesma quantidade a cada passo (+3, +3, +3); a exponencial <b>multiplica</b> pelo mesmo fator (×2, ×2, ×2). No começo podem parecer parecidas, mas a exponencial sempre ultrapassa qualquer reta.</p>`,
      },
      {
        t: "Transformações: mover, esticar, refletir",
        h: `<p>Conhecendo o gráfico de f, dá para desenhar várias outras sem calcular ponto a ponto:</p>
          <ul><li><b>f(x) + k</b>: sobe k unidades (desce se k &lt; 0).</li>
          <li><b>f(x − h)</b>: desloca h unidades para a <b>direita</b> (com h &gt; 0). O sinal engana: f(x + 2) vai para a esquerda.</li>
          <li><b>a·f(x)</b>: estica verticalmente se |a| &gt; 1, achata se |a| &lt; 1; com a &lt; 0, reflete no eixo x.</li>
          <li><b>f(−x)</b>: reflete no eixo y.</li></ul>
          <p>Assim, g(x) = (x − 2)² + 1 é a parábola y = x² deslocada 2 para a direita e 1 para cima: vértice em (2; 1). E 2·sen x é uma onda de amplitude 2. Por isso a forma canônica da quadrática, a(x − h)² + k, mostra o vértice (h; k) diretamente.</p>`,
        grafico: {
          op: { altura: 230, modo: "cartesiano", igual: true },
          cena: { x: [-3, 5], y: [-1, 6], series: [
            { tipo: "funcao", f: (x) => x * x, rotulo: "y = x²", cor: AZUL },
            { tipo: "funcao", f: (x) => (x - 2) * (x - 2) + 1, rotulo: "y = (x − 2)² + 1", cor: LARANJA },
            { tipo: "funcao", f: (x) => 0.5 * x * x, rotulo: "y = 0,5·x²", cor: CINZA, tracejado: true, largura: 1.6 },
            { tipo: "marca", x: 0, y: 0, vazia: true, rotulo: "(0; 0)" },
            { tipo: "marca", x: 2, y: 1, rotulo: "(2; 1)" },
          ] },
          legenda: "f(x − 2) + 1 leva o vértice de (0; 0) para (2; 1); multiplicar por 0,5 deixa a parábola mais aberta.",
        },
      },
    ],
    formulas: [
      { nome: "Função afim", eq: `f(x) = a·x + b &nbsp;&nbsp; a = ${fr("Δy", "Δx")}`, simbolos: [["a", "taxa de variação (inclinação)", "unidade de y por unidade de x"], ["b", "valor inicial f(0)", "unidade de y"]], obs: "Raiz em x = −b/a." },
      { nome: "Quadrática na forma canônica", eq: `f(x) = a(x − h)² + k &nbsp;&nbsp; h = ${fr("−b", "2a")}, &nbsp; k = f(h)`, simbolos: [["(h; k)", "vértice", "—"]], obs: "Imagem: [k; +∞) se a &gt; 0, (−∞; k] se a &lt; 0." },
      { nome: "Transformações", eq: `y = a·f(x − h) + k`, simbolos: [["h", "deslocamento horizontal (para a direita se h &gt; 0)", "—"], ["k", "deslocamento vertical", "—"], ["a", "esticamento vertical (reflete se a &lt; 0)", "—"]], obs: "Aplique primeiro o esticamento, depois os deslocamentos." },
    ],
    exemplos: [
      {
        t: "função afim",
        enunciado: `Um táxi cobra R$ 5,00 de bandeirada mais R$ 2,50 por km. Escreva o preço em função da distância. Quanto custa uma corrida de 12 km? Com R$ 40, quantos km dá para rodar?`,
        passos: [`Parte fixa b = 5,00; taxa a = 2,50 por km: P(x) = 2,50x + 5,00.`, `P(12) = 2,50 × 12 + 5,00 = 30,00 + 5,00 = R$ 35,00.`, `P(x) = 40 → 2,50x = 35 → x = 14 km.`],
        resposta: `<b>P(x) = 2,5x + 5</b>; R$ 35,00 por 12 km; <b>14 km</b> com R$ 40`,
      },
      {
        t: "quadrática completa",
        enunciado: `Para f(x) = −x² + 4x + 5, ache as raízes, o vértice e a imagem.`,
        passos: [`Raízes: −x² + 4x + 5 = 0 ⇔ x² − 4x − 5 = 0. Soma 4 e produto −5: x = 5 ou x = −1.`, `Vértice: x<sub>v</sub> = −b/(2a) = −4/(−2) = 2 (média das raízes, (−1 + 5)/2 = 2). y<sub>v</sub> = −4 + 8 + 5 = 9.`, `Como a = −1 &lt; 0, a parábola abre para baixo: o vértice é máximo.`, `Imagem: (−∞; 9]. Forma canônica: f(x) = −(x − 2)² + 9.`],
        resposta: `Raízes <b>−1 e 5</b>; vértice <b>(2; 9)</b>; imagem <b>y ≤ 9</b>`,
      },
      {
        t: "domínio e função inversa",
        enunciado: `Dada f(x) = 2x + 3, ache a inversa f⁻¹. Depois, ache o domínio de g(x) = √(6 − 2x)/(x − 1).`,
        passos: [`Inversa: troque x e y em y = 2x + 3 → x = 2y + 3 → y = (x − 3)/2. Conferir: f(4) = 11 e f⁻¹(11) = 4.`, `Domínio de g, raiz: 6 − 2x ≥ 0 → x ≤ 3.`, `Denominador: x − 1 ≠ 0 → x ≠ 1.`, `Juntando: x ≤ 3 e x ≠ 1.`],
        resposta: `<b>f⁻¹(x) = (x − 3)/2</b>; domínio de g: <b>x ≤ 3, x ≠ 1</b>`,
      },
    ],
    erros: [
      { errado: `Achar que f(x − 2) desloca o gráfico 2 unidades para a esquerda.`, certo: `Desloca para a direita: o que antes acontecia em x = 0 agora acontece em x = 2.`, porque: `Para que x − 2 valha 0, x precisa ser 2.` },
      { errado: `Confundir f⁻¹(x) com 1/f(x).`, certo: `f⁻¹ desfaz f (f⁻¹(f(x)) = x); 1/f(x) é o inverso multiplicativo.`, porque: `Para f(x) = 2x + 3: f⁻¹(x) = (x − 3)/2, mas 1/f(x) = 1/(2x + 3).` },
      { errado: `Escrever f(a + b) = f(a) + f(b) para qualquer f.`, certo: `Isso só vale para funções lineares (f(x) = kx).`, porque: `Para f(x) = x², (2 + 3)² = 25, mas 2² + 3² = 13.` },
      { errado: `Dizer que o mínimo local de x³ − 3x, em (1; −2), é o menor valor da função em [−3; 3].`, certo: `f(−3) = −18 é menor: o mínimo global está na borda.`, porque: `Extremo local olha só a vizinhança; para o global, compare também os extremos do intervalo.` },
    ],
    aplicacoes: [
      `<b>Física</b>: s(t) afim no MRU e quadrática no MRUV; o gráfico de v × t tem a aceleração como inclinação e o deslocamento como área.`,
      `<b>Química</b>: curvas de titulação (pH × volume), de aquecimento (temperatura × tempo) e cinética (concentração × tempo).`,
      `<b>Economia</b>: custo, receita e lucro como funções da quantidade; o ponto de equilíbrio é onde as curvas se cruzam.`,
      `<b>Saúde pública</b>: curvas epidêmicas começam exponenciais; “achatar a curva” é mudar seu parâmetro de crescimento.`,
      `<b>Programação e dados</b>: toda função de código com entrada e saída é uma função matemática; ajustar curvas a dados é escolher a família certa.`,
    ],
    teste: [
      { p: `Qual destas relações NÃO é função de x?`, op: [`y = x²`, `y = |x|`, `x² + y² = 1 (um círculo)`, `y = 2ˣ`], certa: 2, explica: `No círculo, para x = 0 há y = 1 e y = −1: uma reta vertical corta a curva duas vezes. As outras dão um único y para cada x.` },
      { p: `O gráfico de g(x) = f(x) − 3 em relação ao de f:`, op: [`desloca 3 para a direita.`, `desloca 3 para baixo.`, `desloca 3 para a esquerda.`, `estica 3 vezes.`], certa: 1, explica: `Somar ou subtrair uma constante fora de f muda a altura de todos os pontos: −3 desce 3 unidades.` },
      { p: `Qual o domínio de f(x) = log(x − 4)?`, op: [`x ≥ 4`, `x &gt; 0`, `x &gt; 4`, `todos os reais`], certa: 2, explica: `O logaritmando precisa ser positivo: x − 4 &gt; 0. (Com ≥ 4, log 0 não existe.)` },
      { p: `Uma população cresce 10% ao ano. O modelo adequado é:`, op: [`afim: P = P₀ + 0,1t`, `quadrático`, `logarítmico`, `exponencial: P = P₀·1,1ᵗ`], certa: 3, explica: `Crescer uma porcentagem fixa é multiplicar por um fator fixo a cada ano: exponencial.` },
      { p: `Se f′(x) &gt; 0 num intervalo, o gráfico nesse intervalo:`, op: [`é crescente.`, `está acima do eixo x.`, `tem uma raiz.`, `é uma reta.`], certa: 0, explica: `Derivada positiva significa inclinação positiva: a curva sobe da esquerda para a direita. Ela pode estar abaixo do eixo x e ainda assim crescer.` },
    ],
    resumo: [
      `Função: cada x do domínio tem exatamente um f(x) (teste da reta vertical).`,
      `Domínio: evite divisão por zero, raiz par de negativo e log de não positivo.`,
      `Raízes: f(x) = 0 (cortes no eixo x); extremos locais: tangente horizontal.`,
      `Afim soma um valor fixo; exponencial multiplica por um fator fixo.`,
      `f(x) + k sobe; f(x − h) vai para a direita; a·f(x) estica (e reflete se a &lt; 0).`,
      `Quadrática: a(x − h)² + k tem vértice (h; k).`,
    ],
    alem: {
      t: "Para ir além: continuidade, assíntotas e funções como objetos",
      h: `<p>Uma função é <b>contínua</b> se o gráfico pode ser desenhado sem tirar o lápis do papel; formalmente, lim<sub>x→a</sub> f(x) = f(a). O <b>teorema do valor intermediário</b> garante que, se f é contínua e muda de sinal entre a e b, ela tem uma raiz entre eles. É assim que a ferramenta Gráficos encontra raízes numericamente: procura trocas de sinal e as refina por bissecção.</p>
        <p><b>Assíntotas</b> descrevem o comportamento “no infinito” ou perto de pontos proibidos: 1/(x − 3) tem assíntota vertical em x = 3 e horizontal em y = 0. Funções como 1/(1 + e⁻ˣ) (a logística, usada em biologia e em redes neurais) têm duas assíntotas horizontais, em 0 e em 1.</p>
        <p>Na matemática universitária, funções viram objetos que podem ser somados, compostos e derivados. A <b>composição</b> (f ∘ g)(x) = f(g(x)) é o que a regra da cadeia deriva; funções <b>injetoras</b> (cada saída vem de uma só entrada) e <b>sobrejetoras</b> (todas as saídas possíveis aparecem) são exatamente as que têm inversa. E funções de várias variáveis, como a pressão P(V, T) de um gás, levam ao cálculo multivariado.</p>`,
    },
  };
})();
