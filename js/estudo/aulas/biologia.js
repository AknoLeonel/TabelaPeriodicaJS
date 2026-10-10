/*
 * Aulas de Biologia (formato em js/estudo/aula.js).
 * Genética mendeliana, probabilidade e heredogramas, Hardy-Weinberg,
 * do DNA à proteína e populações / fluxo de energia.
 */
(function () {
  "use strict";
  const E = window.LAB && window.LAB.estudo;
  if (!E) return;
  const A = (E.aulas.biologia = E.aulas.biologia || {});
  const fr = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;

  // ===========================================================================
  // 1. Cruzamentos (genética mendeliana)
  // ===========================================================================
  A.genetica = {
    tempo: 18, nivel: "Ensino médio → genética básica da faculdade",
    objetivos: [
      "explicar a diferença entre gene, alelo, genótipo e fenótipo;",
      "formar os gametas de qualquer genótipo e montar um quadro de Punnett;",
      "prever proporções genotípicas e fenotípicas (3 : 1, 1 : 2 : 1, 9 : 3 : 3 : 1, 2 : 1) e o que muda com dominância incompleta, codominância e genes letais;",
      "resolver cruzamentos com vários genes pela regra do produto, sem desenhar quadros gigantes;",
      "usar o cruzamento-teste para descobrir o genótipo de um indivíduo com fenótipo dominante.",
    ],
    secoes: [
      {
        t: "A ideia em uma frase",
        h: `<p>Cada característica hereditária depende de <b>genes</b>, e você carrega <b>duas versões</b> de cada gene, uma herdada da mãe e outra do pai. Essas versões se chamam <b>alelos</b>. Na formação dos gametas (óvulos e espermatozoides), cada gameta leva <b>só uma</b> das duas versões, sorteada. A fecundação junta de novo duas, e esse sorteio duplo explica as proporções que aparecem nos filhos.</p>
          <div class="analogia"><b>Analogia:</b> imagine um livro de receitas em que cada receita vem em duas cópias, uma escrita pela mãe e outra pelo pai. As cópias podem ser iguais ou diferentes (bolo com ou sem açúcar). Para montar o livro de um filho, cada genitor arranca, ao acaso, <i>uma</i> das suas duas cópias de cada receita e manda para ele.</div>
          <p>Vocabulário que vamos usar o tempo todo:</p>
          <ul><li><b>Genótipo</b>: o par de alelos (AA, Aa ou aa). <b>Fenótipo</b>: o que se observa (cor, forma, tipo sanguíneo, uma doença).</li>
          <li><b>Homozigoto</b>: dois alelos iguais (AA ou aa). <b>Heterozigoto</b>: alelos diferentes (Aa).</li>
          <li><b>Dominante</b> (letra maiúscula): o alelo que se manifesta mesmo em dose única. <b>Recessivo</b> (minúscula): só aparece em homozigose (aa).</li></ul>`,
      },
      {
        t: "Mendel e a 1ª lei: a segregação dos alelos",
        h: `<p>Gregor Mendel cruzou ervilhas de linhagens puras, com semente amarela (AA) e verde (aa). Toda a geração F1 saiu amarela (Aa): o alelo verde não sumiu, só ficou escondido. Cruzando F1 × F1, o verde reapareceu em cerca de um quarto das sementes: Mendel contou <b>6022 amarelas e 2001 verdes</b>, razão de 3,01 : 1.</p>
          <p>A explicação é a <b>1ª lei de Mendel</b> (lei da segregação): os dois alelos de um gene se separam na meiose, e cada gameta recebe um deles, com chance ½ para cada. O quadro de Punnett organiza o encontro dos gametas:</p>
          <div class="tab-rolar"><table class="tb"><tr><th>Aa × Aa</th><th>A (½)</th><th>a (½)</th></tr><tr><th>A (½)</th><td>AA (¼)</td><td>Aa (¼)</td></tr><tr><th>a (½)</th><td>Aa (¼)</td><td>aa (¼)</td></tr></table></div>
          <p>Genótipos: <b>1 AA : 2 Aa : 1 aa</b>. Como AA e Aa são amarelos, os fenótipos ficam <b>3 amarelas : 1 verde</b>. Note que o 3 : 1 é uma <b>probabilidade</b>: com 4 sementes, sair exatamente 3 e 1 é apenas o resultado mais provável; com milhares, a proporção observada se aproxima de 3 : 1.</p>
          <p>Hoje sabemos o porquê físico: os dois alelos ficam em cromossomos homólogos, que são separados na anáfase I da meiose.</p>`,
      },
      {
        t: "Quando o heterozigoto é diferente: incompleta, codominância e letais",
        h: `<p>A dominância completa é só um dos casos. Em três situações muito cobradas, o 3 : 1 muda:</p>
          <ul><li><b>Dominância incompleta</b>: o heterozigoto tem fenótipo <i>intermediário</i>. Na planta maravilha (<i>Mirabilis jalapa</i>), VV é vermelha, vv é branca e Vv é <b>rosa</b>. Vv × Vv dá 1 vermelha : 2 rosas : 1 branca. Como cada genótipo tem seu fenótipo, a proporção fenotípica é igual à genotípica, <b>1 : 2 : 1</b>.</li>
          <li><b>Codominância</b>: o heterozigoto mostra os <i>dois</i> fenótipos ao mesmo tempo, lado a lado. No gado shorthorn, o animal ruão tem pelos vermelhos e brancos misturados. No sangue humano, I<sup>A</sup>I<sup>B</sup> produz os antígenos A <b>e</b> B: tipo AB. Também dá 1 : 2 : 1.</li>
          <li><b>Alelos letais</b>: algumas combinações matam o embrião. Em camundongos, o alelo da pelagem amarela é dominante para a cor, mas letal em homozigose. Aa × Aa daria 1 AA : 2 Aa : 1 aa, porém os AA não nascem: entre os nascidos sobram <b>2 amarelos : 1 aguti</b>, ou seja, 2/3 e 1/3.</li></ul>
          <div class="nota">Dica de prova: se o enunciado diz que um cruzamento entre dois iguais deu 2 : 1, pense em gene letal. Se deu 1 : 2 : 1 com três fenótipos, pense em dominância incompleta ou codominância.</div>`,
      },
      {
        t: "Dois genes ou mais: a 2ª lei e a regra do produto",
        h: `<p>Mendel também acompanhou duas características juntas: cor (A amarela, a verde) e forma (B lisa, b rugosa). Cruzando duplos heterozigotos AaBb × AaBb, obteve <b>315 lisas amarelas, 108 lisas verdes, 101 rugosas amarelas e 32 rugosas verdes</b>: muito perto de <b>9 : 3 : 3 : 1</b>.</p>
          <p>A <b>2ª lei de Mendel</b> (segregação independente) diz que genes situados em cromossomos diferentes se separam de forma independente na meiose. Um indivíduo AaBb forma quatro gametas igualmente prováveis: <b>AB, Ab, aB e ab</b> (¼ cada). Regra geral: um indivíduo com n genes heterozigotos forma <b>2ⁿ</b> tipos de gameta.</p>
          <p>O atalho que resolve quase tudo é a <b>regra do produto</b>: cruze cada gene separadamente e multiplique as frações.</p>
          <div class="eq">P(A_B_) = P(A_) × P(B_) = ${fr(3, 4)} × ${fr(3, 4)} = ${fr(9, 16)}</div>
          <p>Do mesmo jeito: A_bb = ¾ × ¼ = 3/16; aaB_ = 3/16; aabb = ¼ × ¼ = 1/16. Daí o 9 : 3 : 3 : 1. Num tri-híbrido AaBbCc × AaBbCc, o quadro teria 8 × 8 = 64 casas, mas P(aabbcc) sai na hora: (¼)³ = 1/64.</p>`,
      },
      {
        t: "O cruzamento-teste: descobrindo o genótipo escondido",
        h: `<p>Um animal de fenótipo dominante pode ser AA ou Aa: pela aparência não dá para saber. A solução é cruzá-lo com um <b>homozigoto recessivo</b> (aa), que só produz gametas a. Assim, o fenótipo de cada filho revela qual alelo veio do indivíduo testado:</p>
          <ul><li>Se ele for <b>AA</b>: todos os filhos serão Aa, com fenótipo dominante (100%).</li>
          <li>Se ele for <b>Aa</b>: metade dos filhos Aa e metade aa, proporção <b>1 : 1</b>.</li></ul>
          <p>Basta aparecer <b>um</b> filho recessivo para concluir que o indivíduo é Aa. O contrário não é certeza absoluta: com 5 filhos dominantes, um Aa ainda teria chance (½)⁵ = 1/32 ≈ 3% de produzir esse resultado por acaso. Quanto mais filhos, mais confiável a conclusão.</p>
          <p>Com dois genes, o cruzamento-teste AaBb × aabb dá <b>1 : 1 : 1 : 1</b>, porque cada um dos quatro gametas do duplo heterozigoto aparece diretamente no fenótipo do filho. É esse cruzamento que os geneticistas usam para medir ligação gênica (veja “Para ir além”).</p>`,
      },
    ],
    formulas: [
      { nome: "Tipos de gameta", eq: `tipos de gameta = 2ⁿ`, simbolos: [["n", "número de genes em heterozigose no indivíduo", "—"]], obs: "AaBbCC: n = 2 (CC é homozigoto), logo 4 tipos de gameta: ABC, AbC, aBC, abC." },
      { nome: "Regra do produto (genes independentes)", eq: `P(combinação) = P(gene 1) × P(gene 2) × …`, simbolos: [["P(gene i)", "probabilidade da classe pedida, obtida cruzando só aquele gene", "—"]], obs: "Vale para genes em cromossomos diferentes (ou muito distantes no mesmo cromossomo)." },
      { nome: "Autofecundação de n heterozigotos", eq: `casas = 4ⁿ &nbsp;·&nbsp; genótipos = 3ⁿ &nbsp;·&nbsp; fenótipos = 2ⁿ`, simbolos: [["n", "número de genes heterozigotos no cruzamento Aa…× Aa…", "—"]], obs: "O número de fenótipos 2ⁿ vale com dominância completa em todos os genes; com dominância incompleta seriam 3ⁿ." },
    ],
    exemplos: [
      {
        t: "direto",
        enunciado: `Em ervilhas, A (amarela) domina a (verde). Cruzam-se duas plantas Aa. Qual a probabilidade de uma semente ser verde? E, entre as amarelas, que fração é heterozigota?`,
        passos: [`Gametas de cada genitor: A (½) e a (½).`, `Quadro: AA ¼, Aa ½ (as duas casas Aa), aa ¼.`, `Verde = aa: P = <b>¼</b> (25%).`, `Amarelas = AA + Aa = ¼ + ½ = ¾. Heterozigotas entre elas: ½ ÷ ¾ = <b>2/3</b>.`],
        resposta: `P(verde) = <b>1/4</b>; entre as amarelas, <b>2/3</b> são Aa`,
      },
      {
        t: "di-híbrido pela regra do produto",
        enunciado: `Genes A e B em cromossomos diferentes, com dominância completa. No cruzamento AaBb × aaBb, qual a probabilidade de um descendente aabb? E de um descendente A_B_?`,
        passos: [`Gene A: Aa × aa → Aa ½, aa ½. Logo P(A_) = ½ e P(aa) = ½.`, `Gene B: Bb × Bb → BB ¼, Bb ½, bb ¼. Logo P(B_) = ¾ e P(bb) = ¼.`, `P(aabb) = ½ × ¼ = 1/8.`, `P(A_B_) = ½ × ¾ = 3/8.`],
        resposta: `P(aabb) = <b>1/8</b> (12,5%) e P(A_B_) = <b>3/8</b> (37,5%)`,
      },
      {
        t: "tri-híbrido (nível prova)",
        enunciado: `No cruzamento AaBbCc × AaBbCc (genes independentes, dominância completa), quantos tipos de gameta cada genitor forma? Quantas casas teria o quadro de Punnett? Qual a probabilidade de um filho A_B_C_ e de um filho AaBbCc?`,
        passos: [`Gametas: n = 3 genes heterozigotos → 2³ = 8 tipos.`, `Casas: 8 × 8 = 64 (ou 4³).`, `P(A_B_C_) = ¾ × ¾ × ¾ = 27/64 ≈ 42,2%.`, `P(AaBbCc) = ½ × ½ × ½ = 1/8 = 8/64 = 12,5%.`],
        resposta: `8 gametas, 64 casas; P(A_B_C_) = <b>27/64</b>; P(AaBbCc) = <b>1/8</b>`,
      },
    ],
    erros: [
      { errado: `Escrever os gametas de AaBb como “Aa” e “Bb”.`, certo: `Cada gameta leva um alelo de <b>cada</b> gene: AB, Ab, aB, ab.`, porque: `Gametas são haploides: têm uma cópia de cada gene, nunca duas do mesmo.` },
      { errado: `Usar 9 : 3 : 3 : 1 para qualquer cruzamento com dois genes.`, certo: `O 9 : 3 : 3 : 1 vale só para AaBb × AaBb. Para AaBb × aabb é 1 : 1 : 1 : 1; para AaBb × Aabb é 3 : 3 : 1 : 1.`, porque: `As proporções dependem dos genótipos dos pais; na dúvida, cruze gene a gene e multiplique.` },
      { errado: `Com gene letal, responder que ½ dos filhotes amarelos nascidos são Aa (calculando sobre 4 partes).`, certo: `Retire os letais do total: das 3 partes que nascem, 2 são Aa, então 2/3.`, porque: `Probabilidades “entre os nascidos” usam como universo só quem nasce.` },
      { errado: `Achar que, se um casal Aa × Aa teve 3 filhos normais, o 4º “tem que” ser aa.`, certo: `Cada filho tem chance ¼ de ser aa, independentemente dos irmãos.`, porque: `Cada fecundação é um sorteio novo; os gametas não têm memória.` },
      { errado: `Confundir dominante com “mais frequente” ou “mais forte”.`, certo: `Dominância diz só qual alelo aparece no heterozigoto. A polidactilia é dominante e rara.`, porque: `Frequência de um alelo na população é outro assunto (Hardy-Weinberg).` },
    ],
    aplicacoes: [
      `<b>Melhoramento genético</b>: criadores usam cruzamentos-teste para confirmar se um touro ou uma semente é homozigoto antes de usá-lo como matriz.`,
      `<b>Aconselhamento genético</b>: famílias com doenças hereditárias (fibrose cística, anemia falciforme) recebem as probabilidades calculadas exatamente com essas regras.`,
      `<b>Agricultura</b>: variedades híbridas de milho são produzidas cruzando linhagens puras; a F1 é uniforme e vigorosa, mas a F2 segrega, por isso o agricultor compra semente nova todo ano.`,
      `<b>Pesquisa</b>: camundongos e moscas com mutações conhecidas são mantidos por cruzamentos planejados; um alelo letal exige manter a linhagem em heterozigose.`,
    ],
    teste: [
      { p: `Um indivíduo AaBBCcDd forma quantos tipos de gameta?`, op: [`4`, `8`, `16`, `6`], certa: 1, explica: `São 3 genes heterozigotos (A, C, D); BB é homozigoto. 2³ = 8.` },
      { p: `No cruzamento Vv × Vv da planta maravilha (dominância incompleta), a proporção fenotípica é:`, op: [`3 : 1`, `9 : 3 : 3 : 1`, `1 : 2 : 1`, `2 : 1`], certa: 2, explica: `Na dominância incompleta o heterozigoto (rosa) é distinguível; cada genótipo é um fenótipo: 1 vermelha : 2 rosas : 1 branca.` },
      { p: `Cruzando dois camundongos amarelos, nasceram 2 amarelos para cada aguti. A melhor explicação é:`, op: [`o alelo amarelo é recessivo`, `o alelo amarelo é letal em homozigose`, `há dominância incompleta`, `os genes estão ligados`], certa: 1, explica: `Aa × Aa daria 1 : 2 : 1; se AA morre, sobram 2 Aa (amarelos) : 1 aa (aguti).` },
      { p: `Para saber se uma cobaia de pelo preto (dominante) é homozigota, deve-se cruzá-la com:`, op: [`uma cobaia preta heterozigota`, `uma cobaia preta homozigota`, `outra cobaia de genótipo desconhecido`, `uma cobaia de pelo recessivo (aa)`], certa: 3, explica: `No cruzamento-teste com aa, qualquer filho recessivo revela que a cobaia é Aa; com AA, todos os filhos saem pretos.` },
      { p: `Mendel obteve 9 : 3 : 3 : 1 em AaBb × AaBb porque:`, op: [`os genes de cor e forma estão em cromossomos que se separam de forma independente na meiose`, `os dois genes são o mesmo gene`, `cor e forma estão no mesmo cromossomo, bem próximos`, `os alelos dominantes são mais frequentes`], certa: 0, explica: `A segregação independente faz as quatro combinações de gametas serem igualmente prováveis; genes muito próximos no mesmo cromossomo não obedeceriam essa proporção.` },
      { p: `Em AaBb × AaBb, qual a probabilidade de um filho ser AaBb?`, op: [`1/16`, `1/4`, `9/16`, `1/2`], certa: 1, explica: `Gene a gene: P(Aa) = ½ e P(Bb) = ½. Multiplicando: ¼ (4 das 16 casas).` },
    ],
    resumo: [
      `Cada pessoa tem dois alelos de cada gene; cada gameta leva um só (1ª lei de Mendel).`,
      `Aa × Aa: genótipos 1 : 2 : 1; fenótipos 3 : 1 com dominância completa.`,
      `Dominância incompleta e codominância: o heterozigoto é distinguível e o fenotípico vira 1 : 2 : 1. Letal em homozigose: 2 : 1.`,
      `Genes independentes: n heterozigotos formam 2ⁿ gametas; AaBb × AaBb dá 9 : 3 : 3 : 1.`,
      `Regra do produto: cruze gene a gene e multiplique as frações.`,
      `Cruzamento-teste (× aa): 100% dominantes indica AA; 1 : 1 indica Aa.`,
    ],
    alem: {
      t: "Para ir além: quando a 2ª lei falha (ligação gênica e epistasia)",
      h: `<p>A segregação independente vale para genes em cromossomos diferentes. Genes <b>próximos no mesmo cromossomo</b> tendem a ser herdados juntos: estão <b>ligados</b>. Eles só se separam quando ocorre <b>permutação</b> (crossing-over) entre eles na prófase I. Thomas Morgan observou isso em <i>Drosophila</i> por volta de 1910, e seu aluno Alfred Sturtevant percebeu que a frequência de recombinantes mede a distância entre os genes: em 1913 publicou o primeiro mapa genético.</p>
        <div class="eq">distância (cM) ≈ ${fr("nº de recombinantes", "total de descendentes")} × 100</div>
        <p>No cruzamento-teste AaBb × aabb com genes ligados, em vez de 1 : 1 : 1 : 1 aparecem duas classes parentais frequentes e duas recombinantes raras. Se 17% dos filhos são recombinantes, os genes estão a cerca de 17 centimorgans. A frequência de recombinação nunca passa de 50%, que é exatamente o que a segregação independente produziria.</p>
        <p>Outra exceção é a <b>epistasia</b>: um gene mascara o efeito de outro. Na ervilha-de-cheiro, a cor púrpura exige pelo menos um alelo dominante em cada um de dois genes; AaBb × AaBb dá <b>9 púrpuras : 7 brancas</b>. Em cães labradores, um gene define preto ou chocolate e outro decide se o pigmento é depositado no pelo; o resultado é 9 pretos : 3 chocolates : 4 amarelos. As proporções mudam, mas são sempre agrupamentos das 16 casas do quadro: a regra do produto continua sendo a base do cálculo.</p>`,
    },
  };

  // ===========================================================================
  // 2. Probabilidade e heredogramas
  // ===========================================================================
  A.probabilidade = {
    tempo: 20, nivel: "Ensino médio (ENEM e vestibulares) → aconselhamento genético",
    objetivos: [
      "aplicar as regras do “e” (produto) e do “ou” (soma) a problemas de herança;",
      "calcular probabilidades condicionais, como o 2/3 dos heredogramas;",
      "ler um heredograma e decidir se a herança é dominante ou recessiva, autossômica ou ligada ao X;",
      "usar a distribuição binomial para vários filhos;",
      "prever tipos sanguíneos ABO e Rh dos filhos e dizer quem pode doar para quem.",
    ],
    requisitos: [{ id: "genetica", nome: "Cruzamentos" }],
    secoes: [
      {
        t: "A ideia em uma frase",
        h: `<p>Em genética, cada filho é um <b>sorteio independente</b>: o quadro de Punnett não diz o que <i>vai</i> acontecer, diz a <b>chance</b> de cada resultado. Quase todo problema se resolve com quatro ferramentas: a regra do “e”, a regra do “ou”, a probabilidade condicional e a binomial.</p>
          <div class="analogia"><b>Analogia:</b> um casal Aa × Aa é como lançar duas moedas, uma de cada genitor. Sair “a” nas duas (filho aa) tem chance ½ × ½ = ¼, e as moedas não lembram o que saiu nos lançamentos anteriores. Ter tido três filhos normais não aumenta nem diminui a chance do quarto.</div>
          <p>O cuidado principal é com o <b>universo</b> da pergunta. “Qual a chance de uma <i>criança</i> ser menino afetado?” é diferente de “qual a chance de um <i>filho homem</i> ser afetado?”. No primeiro caso ainda não se sabe o sexo; no segundo, já se sabe. Antes de calcular, sublinhe no enunciado <b>quem</b> já se sabe que é o quê.</p>`,
      },
      {
        t: "As regras do “e”, do “ou” e a condicional",
        h: `<p><b>Regra do “e”</b> (produto): para eventos independentes acontecerem juntos, multiplique. Um casal Aa × Aa ter uma <b>menina e albina</b>: ½ × ¼ = <b>1/8</b>. Ter dois filhos albinos seguidos: ¼ × ¼ = 1/16.</p>
          <p><b>Regra do “ou”</b> (soma): para eventos que não podem ocorrer ao mesmo tempo, some. Ser AA <i>ou</i> Aa: ¼ + ½ = ¾. Num casal com dois filhos, “um albino e um normal, em qualquer ordem” = (¼ × ¾) + (¾ × ¼) = 6/16 = 3/8.</p>
          <p><b>Condicional</b>: quando uma informação reduz as possibilidades, o denominador muda. Se um filho de Aa × Aa é <b>normal</b>, ele não é aa; sobram AA (¼) e Aa (½):</p>
          <div class="eq">P(Aa | normal) = ${fr("P(Aa)", "P(normal)")} = ${fr("1/2", "3/4")} = ${fr(2, 3)}</div>
          <p>Esse <b>2/3</b> aparece em quase todo heredograma de prova: irmão normal de um afetado por doença recessiva, filho de pais normais, tem 2/3 de chance de ser portador. Esquecer esse fator é o erro mais comum nesses problemas.</p>`,
      },
      {
        t: "Lendo heredogramas",
        h: `<p>Um heredograma é a árvore genealógica com símbolos padronizados: <b>quadrado</b> = homem, <b>círculo</b> = mulher, símbolo <b>preenchido</b> = afetado, traço horizontal = casamento, traço vertical = filhos. Para descobrir o tipo de herança, procure duas pistas:</p>
          <ul><li><b>Pais normais com filho afetado</b> → a característica é <b>recessiva</b>: os pais são portadores (Aa) que esconderam o alelo.</li>
          <li><b>Pais afetados com filho normal</b> → a característica é <b>dominante</b>: os pais são Aa e o filho herdou a dos dois.</li>
          <li>Se, numa herança recessiva, uma <b>filha</b> afetada tem <b>pai normal</b>, ela não pode ser ligada ao X (o pai lhe daria um X normal): é <b>autossômica recessiva</b>.</li>
          <li>Na herança recessiva ligada ao X, os afetados são quase só homens, e o alelo costuma “pular” uma geração passando por mulheres portadoras.</li></ul>
          <p>Depois de achar o tipo de herança, escreva o genótipo certo de cada pessoa que puder (todo afetado recessivo é aa; todo pai de um aa tem pelo menos um a) e marque com “A_” quem ficar em dúvida. Só então calcule, encadeando as probabilidades com a regra do “e”.</p>`,
      },
      {
        t: "Herança ligada ao X",
        h: `<p>Genes no cromossomo X seguem uma lógica própria porque mulheres são XX e homens XY, e o Y não carrega a maioria desses genes. O homem tem <b>uma só cópia</b> (é <i>hemizigoto</i>): se o X dele traz o alelo recessivo, ele manifesta a condição. Exemplos clássicos: <b>daltonismo</b> vermelho-verde (cerca de 8% dos homens de origem europeia e menos de 1% das mulheres) e <b>hemofilia A</b> (falta do fator VIII da coagulação).</p>
          <ul><li>O pai passa o X para <b>todas as filhas</b> e o Y para <b>todos os filhos</b>. Por isso pai afetado nunca transmite a condição ao filho homem.</li>
          <li>O filho homem recebe o X <b>sempre da mãe</b>.</li></ul>
          <div class="tab-rolar"><table class="tb"><tr><th>X<sup>D</sup>X<sup>d</sup> × X<sup>D</sup>Y</th><th>X<sup>D</sup> (pai)</th><th>Y (pai)</th></tr><tr><th>X<sup>D</sup> (mãe)</th><td>X<sup>D</sup>X<sup>D</sup> filha normal</td><td>X<sup>D</sup>Y filho normal</td></tr><tr><th>X<sup>d</sup> (mãe)</th><td>X<sup>D</sup>X<sup>d</sup> filha portadora</td><td>X<sup>d</sup>Y filho daltônico</td></tr></table></div>
          <p>Para esse casal: entre os <b>filhos homens</b>, ½ daltônicos; entre as <b>filhas</b>, nenhuma afetada e ½ portadoras; para uma <b>criança</b> de sexo ainda desconhecido, P(menino daltônico) = ½ × ½ = ¼.</p>`,
      },
      {
        t: "Vários filhos: a binomial",
        h: `<p>“Qual a chance de, em 4 filhos, exatamente 2 serem albinos?” Uma ordem específica, por exemplo albino, albino, normal, normal, tem chance (¼)² × (¾)². Mas há outras ordens que também servem: AANN, ANAN, ANNA, NAAN, NANA, NNAA, ou seja, <b>C(4, 2) = 6</b>. Pela regra do “ou”, multiplicamos:</p>
          <div class="eq">P(k em n) = C(n, k) · p<sup>k</sup> · q<sup>n−k</sup> &nbsp;&nbsp; C(n, k) = ${fr("n!", "k! (n − k)!")}</div>
          <p>Com p = ¼ e q = ¾: P = 6 × (1/16) × (9/16) = 54/256 = <b>27/128 ≈ 21%</b>. Para “pelo menos um”, use o complemento: P(pelo menos 1 albino em 3 filhos) = 1 − (¾)³ = 1 − 27/64 = <b>37/64 ≈ 58%</b>.</p>
          <p>A mesma conta vale para o sexo dos filhos (p = q = ½): a chance de 2 meninos e 2 meninas em 4 filhos é C(4, 2)/16 = 6/16 = 3/8, menor do que muita gente imagina.</p>`,
      },
      {
        t: "Grupos sanguíneos ABO e Rh",
        h: `<p>O sistema ABO é um caso de <b>alelos múltiplos</b>: três alelos, I<sup>A</sup>, I<sup>B</sup> e i. I<sup>A</sup> e I<sup>B</sup> são <b>codominantes</b> entre si, e ambos dominam i. Fenótipos: A (I<sup>A</sup>I<sup>A</sup> ou I<sup>A</sup>i), B (I<sup>B</sup>I<sup>B</sup> ou I<sup>B</sup>i), AB (I<sup>A</sup>I<sup>B</sup>) e O (ii). Um casal I<sup>A</sup>i × I<sup>B</sup>i pode ter filhos dos <b>quatro</b> tipos, ¼ cada.</p>
          <p>Na transfusão de hemácias, o que importa são os <b>antígenos da hemácia do doador</b> e os <b>anticorpos do plasma do receptor</b>. Quem é A tem anti-B; quem é B tem anti-A; O tem os dois; AB não tem nenhum. Por isso <b>O⁻</b> é o doador universal de hemácias e <b>AB⁺</b> o receptor universal.</p>
          <p>O fator <b>Rh</b> é outro gene (herança independente): Rh⁺ é dominante (R_), Rh⁻ é rr. Uma pessoa Rh⁻ só produz anti-Rh depois de exposta a sangue Rh⁺. Isso explica a <b>doença hemolítica do recém-nascido</b>: mãe Rh⁻ com filho Rh⁺ pode ser sensibilizada no primeiro parto, e os anticorpos atacam as hemácias de um segundo filho Rh⁺. A prevenção é aplicar imunoglobulina anti-D na mãe.</p>`,
      },
    ],
    formulas: [
      { nome: "Regra do “e” e do “ou”", eq: `P(A e B) = P(A) × P(B) &nbsp;&nbsp; P(A ou B) = P(A) + P(B)`, simbolos: [["P(A), P(B)", "probabilidades de cada evento", "0 a 1"]], obs: "O produto exige eventos independentes; a soma exige eventos que não acontecem juntos (mutuamente exclusivos)." },
      { nome: "Probabilidade condicional", eq: `P(A | B) = ${fr("P(A e B)", "P(B)")}`, simbolos: [["P(A | B)", "probabilidade de A sabendo que B ocorreu", "0 a 1"]], obs: "Ex.: P(portador | normal) = (1/2) ÷ (3/4) = 2/3 para filhos de Aa × Aa." },
      { nome: "Binomial", eq: `P(k em n) = C(n, k) · p<sup>k</sup> · q<sup>n − k</sup>`, simbolos: [["n", "número de filhos", "—"], ["k", "quantos com a característica", "—"], ["p, q", "chance de ter / não ter em cada filho (q = 1 − p)", "0 a 1"]], obs: "Para “pelo menos 1”, use 1 − qⁿ." },
    ],
    exemplos: [
      {
        t: "heredograma com o 2/3",
        enunciado: `Ana é normal, tem pais normais e um irmão albino (autossômico recessivo). Ela se casa com Pedro, normal, cuja mãe é albina. Qual a probabilidade de o primeiro filho do casal ser albino?`,
        passos: [`O irmão albino é aa, então os pais de Ana são Aa × Aa.`, `Ana é normal: P(Ana ser Aa) = 2/3 (condicional).`, `Pedro é normal e a mãe dele é aa, logo ele recebeu um a: Pedro é Aa com certeza.`, `Se Ana for Aa: Aa × Aa → P(aa) = 1/4.`, `Regra do “e”: P = 2/3 × 1 × 1/4 = 2/12 = 1/6.`],
        resposta: `P = <b>1/6</b> ≈ 16,7%`,
      },
      {
        t: "ligada ao X",
        enunciado: `Uma mulher de visão normal, cujo pai era daltônico, casa-se com um homem de visão normal. Qual a probabilidade de o casal ter (a) um filho homem daltônico, entre os filhos homens; (b) uma criança que seja menino daltônico?`,
        passos: [`O pai dela era X<sup>d</sup>Y e lhe deu o X<sup>d</sup>; ela tem visão normal, logo é X<sup>D</sup>X<sup>d</sup>.`, `Marido normal: X<sup>D</sup>Y.`, `Filho homem recebe o X da mãe: X<sup>D</sup> ou X<sup>d</sup>, ½ cada. (a) P = ½.`, `(b) A criança precisa ser menino (½) e receber X<sup>d</sup> (½): ½ × ½ = ¼.`],
        resposta: `(a) <b>1/2</b>; (b) <b>1/4</b>`,
      },
      {
        t: "binomial e ABO (nível prova)",
        enunciado: `Um homem I<sup>A</sup>i e uma mulher I<sup>B</sup>i planejam 3 filhos. Qual a probabilidade de exatamente 2 deles terem sangue tipo O?`,
        passos: [`I<sup>A</sup>i × I<sup>B</sup>i: tipo O (ii) = ½ × ½ = ¼ por filho. Logo p = 1/4, q = 3/4.`, `C(3, 2) = 3 ordens possíveis (OON, ONO, NOO).`, `P = 3 × (1/4)² × (3/4) = 3 × 1/16 × 3/4 = 9/64.`],
        resposta: `P = <b>9/64</b> ≈ 14,1%`,
      },
    ],
    erros: [
      { errado: `No heredograma, usar P(Aa) = 1/2 para o irmão normal de um afetado.`, certo: `Sabendo que ele é normal, P(Aa) = 2/3.`, porque: `A casa aa já está descartada: o universo são as 3 casas normais, 2 delas Aa.` },
      { errado: `Responder 1/2 para “qual a chance de a próxima criança ser um menino daltônico” (mãe portadora, pai normal).`, certo: `P = ½ (ser menino) × ½ (receber X<sup>d</sup>) = 1/4. O 1/2 responde “entre os filhos homens”.`, porque: `Se o sexo ainda não é conhecido, ele entra na conta como mais um evento.` },
      { errado: `Para “exatamente 1 afetado em 3 filhos”, calcular só ¼ × ¾ × ¾.`, certo: `Multiplique pelas 3 ordens possíveis: 3 × ¼ × (¾)² = 27/64.`, porque: `O afetado pode ser o 1º, o 2º ou o 3º filho; cada ordem é um caso diferente.` },
      { errado: `Dizer que um homem daltônico transmite o daltonismo ao filho homem.`, certo: `Ele passa o Y para os filhos homens e o X<sup>d</sup> para todas as filhas, que serão ao menos portadoras.`, porque: `O filho homem recebe o X sempre da mãe.` },
      { errado: `Achar que o tipo O, por ser “doador universal”, também pode receber de todos.`, certo: `O tipo O tem anti-A e anti-B no plasma: só recebe hemácias O.`, porque: `Doar depende dos antígenos da hemácia; receber depende dos anticorpos do plasma.` },
    ],
    aplicacoes: [
      `<b>Aconselhamento genético</b>: casais com histórico familiar recebem riscos calculados exatamente assim (por exemplo, 1/6 no caso de Ana e Pedro) antes de decidir sobre testes genéticos.`,
      `<b>Teste do pezinho</b>: triagem neonatal de doenças recessivas, como fenilcetonúria e anemia falciforme, que costumam surgir em filhos de pais normais portadores.`,
      `<b>Bancos de sangue</b>: a compatibilidade ABO e Rh decide cada transfusão; estoques de O⁻ são guardados para emergências em que não há tempo de tipar o paciente.`,
      `<b>Obstetrícia</b>: gestantes Rh⁻ recebem imunoglobulina anti-D para evitar a doença hemolítica do recém-nascido.`,
      `<b>Medicina legal</b>: antes do DNA, os tipos ABO serviam para excluir paternidade (um pai AB não pode ter filho O).`,
    ],
    teste: [
      { p: `Um casal normal tem uma filha afetada por uma doença. O que se conclui?`, op: [`A doença é dominante ligada ao X.`, `A doença é autossômica dominante.`, `A doença é recessiva ligada ao X.`, `A doença é autossômica recessiva.`], certa: 3, explica: `Pais normais com filho afetado: recessiva. Filha afetada com pai normal exclui a ligação ao X (o pai lhe daria um X normal).` },
      { p: `Um casal Aa × Aa já teve três filhos aa. A chance de o quarto filho ser aa é:`, op: [`1/4`, `quase zero`, `1/64`, `1/256`], certa: 0, explica: `Cada filho é um sorteio independente; o histórico não muda a probabilidade de ¼.` },
      { p: `Por que o daltonismo é muito mais comum em homens?`, op: [`Porque o alelo é dominante nos homens.`, `Porque o homem tem um só X: um único alelo recessivo já se manifesta.`, `Porque o gene fica no cromossomo Y.`, `Porque as mulheres não herdam o X do pai.`], certa: 1, explica: `O homem é hemizigoto para genes do X. A mulher precisa de dois alelos recessivos, o que é bem mais raro.` },
      { p: `Para um filho de Aa × Aa que é normal, a chance de ser portador é 2/3 porque:`, op: [`o alelo dominante aparece duas vezes`, `a casa aa fica fora do universo, sobrando 1 AA e 2 Aa`, `há três genótipos possíveis`, `a probabilidade do “e” é 2/3`], certa: 1, explica: `É uma probabilidade condicional: das 3 casas compatíveis com “normal”, 2 são Aa.` },
      { p: `Uma pessoa B⁻ precisa de hemácias. Qual doador é compatível?`, op: [`AB⁻`, `B⁺`, `O⁻`, `A⁻`], certa: 2, explica: `Ela tem anti-A e não pode receber Rh⁺. O⁻ não tem antígenos A, B nem Rh: é compatível.` },
      { p: `Qual a probabilidade de um casal ter 3 filhos, todos meninos?`, op: [`1/2`, `1/3`, `3/8`, `1/8`], certa: 3, explica: `Regra do “e”: ½ × ½ × ½ = 1/8.` },
    ],
    resumo: [
      `“E” com eventos independentes: multiplique. “Ou” com eventos exclusivos: some.`,
      `Irmão normal de um afetado recessivo, com pais normais: P(portador) = 2/3.`,
      `Pais normais com filho afetado → recessiva; pais afetados com filho normal → dominante.`,
      `Ligada ao X: o filho homem recebe o X da mãe; pai afetado tem todas as filhas portadoras e nenhum filho afetado.`,
      `Binomial: P(k em n) = C(n, k)·pᵏ·qⁿ⁻ᵏ; “pelo menos 1” = 1 − qⁿ.`,
      `ABO: I<sup>A</sup> e I<sup>B</sup> codominantes, i recessivo. O⁻ doa hemácias para todos; AB⁺ recebe de todos.`,
    ],
    alem: {
      t: "Para ir além: o teorema de Bayes no aconselhamento genético",
      h: `<p>O 2/3 é uma aplicação simples do <b>teorema de Bayes</b>, que atualiza uma probabilidade quando chega informação nova. Ele permite usar também informação sobre os <i>filhos</i> de uma pessoa.</p>
        <p>Exemplo: uma mulher cuja mãe é portadora de hemofilia A tem, a priori, chance ½ de ser portadora. Ela já teve <b>3 filhos homens, todos normais</b>. Se fosse portadora, a chance disso seria (½)³ = 1/8; se não fosse, seria 1. Pela regra de Bayes:</p>
        <div class="eq">P(portadora | 3 filhos normais) = ${fr("½ × 1/8", "½ × 1/8 + ½ × 1")} = ${fr("1/16", "9/16")} = ${fr(1, 9)}</div>
        <p>A informação dos filhos derrubou o risco de 50% para cerca de 11%. É assim que serviços de genética médica calculam riscos em famílias reais, combinando o heredograma com resultados de exames.</p>
        <p>Dois detalhes que os modelos de prova costumam ignorar: a <b>penetrância incompleta</b> (nem todo portador do genótipo manifesta a doença, como em muitas mutações de BRCA1) e as <b>mutações novas</b> (cerca de um terço dos casos de hemofilia A surgem de mutação nova, sem histórico familiar). Ambos mudam as contas, e o aconselhamento real precisa levá-los em conta.</p>`,
    },
  };
  // ===========================================================================
  // 3. Hardy-Weinberg
  // ===========================================================================
  A.hardy = {
    tempo: 18, nivel: "Ensino médio → genética de populações (faculdade)",
    objetivos: [
      "explicar o que são frequências alélicas e genotípicas e por que elas não mudam numa população em equilíbrio;",
      "deduzir p² + 2pq + q² = 1 e usá-la para estimar portadores a partir da frequência de afetados;",
      "calcular p e q a partir de contagens de genótipos, contando alelos;",
      "testar se uma população está em equilíbrio com o qui-quadrado;",
      "relacionar os desvios do equilíbrio às forças evolutivas (seleção, deriva, migração, mutação, endogamia).",
    ],
    requisitos: [{ id: "genetica", nome: "Cruzamentos" }, { id: "probabilidade", nome: "Probabilidade e heredogramas" }],
    secoes: [
      {
        t: "A ideia em uma frase",
        h: `<p>Até agora olhamos para <b>um casal</b>. A genética de populações olha para <b>todos</b> os indivíduos de uma espécie num lugar, e pergunta: com que frequência cada alelo aparece? O princípio de Hardy-Weinberg responde que, se nada perturbar a população, as frequências dos alelos <b>ficam constantes</b> geração após geração, e as dos genótipos podem ser calculadas só a partir delas.</p>
          <div class="analogia"><b>Analogia:</b> pense na população como um grande pote de gametas. Se 70% das bolinhas são A e 30% são a, cada filho é formado tirando duas bolinhas ao acaso. A chance de tirar A e A é 0,7 × 0,7; de tirar a e a, 0,3 × 0,3. Os filhos devolvem ao pote, na próxima geração, as mesmas 70% e 30%: a mistura não muda sozinha.</div>
          <p>Notação: <b>p</b> = frequência do alelo dominante A; <b>q</b> = frequência do recessivo a. Se só há esses dois alelos, <b>p + q = 1</b>. Um ponto importante: ser dominante <b>não</b> faz um alelo ficar mais comum. Dominância diz o que acontece dentro do heterozigoto; frequência é outra coisa.</p>`,
      },
      {
        t: "De onde vem p² + 2pq + q²",
        h: `<p>Com cruzamentos ao acaso, o óvulo e o espermatozoide são sorteados independentemente do pote. Pela regra do “e”:</p>
          <ul><li>P(AA) = p × p = <b>p²</b></li>
          <li>P(aa) = q × q = <b>q²</b></li>
          <li>P(Aa) = p × q (A do pai, a da mãe) + q × p (a do pai, A da mãe) = <b>2pq</b>. O 2 vem dessas duas formas de formar o heterozigoto.</li></ul>
          <div class="eq">(p + q)² = p² + 2pq + q² = 1</div>
          <p>Exemplo com p = 0,7 e q = 0,3: AA = 0,49, Aa = 2 × 0,7 × 0,3 = 0,42 e aa = 0,09. Soma: 1. E os alelos da geração seguinte? A = 0,49 + ½ × 0,42 = 0,70. Voltamos ao mesmo p: é o <b>equilíbrio</b>. Se uma população começa fora dessas proporções, uma única geração de cruzamentos ao acaso já a leva para elas (para um gene autossômico).</p>
          <p>O gráfico mostra como as três frequências genotípicas dependem de p. Repare que o heterozigoto atinge no máximo 50%, quando p = q = 0,5, e que, para p perto de 1, quase todos os alelos a estão escondidos em heterozigotos.</p>`,
        grafico: {
          op: { altura: 220, modo: "dados", rotX: "p (frequência de A)", rotY: "frequência" },
          cena: { x: [0, 1], y: [0, 1.05], nomeX: "p", series: [
            { tipo: "funcao", f: (p) => p * p, rotulo: "AA = p²", cor: "#4da3ff" },
            { tipo: "funcao", f: (p) => 2 * p * (1 - p), rotulo: "Aa = 2pq", cor: "#9ccc65" },
            { tipo: "funcao", f: (p) => (1 - p) * (1 - p), rotulo: "aa = q²", cor: "#f0a23c" },
          ] },
          legenda: "Frequências genotípicas no equilíbrio em função da frequência p do alelo A.",
        },
      },
      {
        t: "Do afetado ao portador: o uso mais cobrado",
        h: `<p>Numa doença recessiva, só os aa são reconhecíveis pelo fenótipo; os portadores (Aa) parecem normais. Mas, se a população está em equilíbrio, a fração de afetados é q², e dela sai todo o resto:</p>
          <ol><li>q² = fração de afetados → <b>q = √(q²)</b></li><li><b>p = 1 − q</b></li><li>portadores = <b>2pq</b></li></ol>
          <p>A fibrose cística afeta cerca de 1 em 2500 nascidos em populações de origem europeia. Então q² = 0,0004, q = 0,02, p = 0,98 e 2pq = 2 × 0,98 × 0,02 = 0,0392: cerca de <b>1 pessoa em 25</b> é portadora. Para cada afetado há 98 portadores!</p>
          <div class="destaque">Alelos recessivos raros se escondem nos heterozigotos. Por isso eliminar os afetados (como tentaram as políticas eugenistas do século XX) quase não muda a frequência do alelo: a imensa maioria das cópias está em pessoas saudáveis.</div>
          <p>Com contagens reais, não precisamos supor equilíbrio para achar p: basta <b>contar alelos</b>. Cada AA tem dois A, cada Aa tem um, e há 2N alelos no total: p = (2·AA + Aa) / 2N.</p>`,
      },
      {
        t: "As condições do equilíbrio e as forças evolutivas",
        h: `<p>O equilíbrio é um modelo ideal. Ele exige cinco condições, e cada condição violada corresponde a uma <b>força evolutiva</b>:</p>
          <ul><li><b>População muito grande</b>. Em populações pequenas, o acaso muda as frequências: é a <b>deriva genética</b>. Efeito fundador: entre os amish do condado de Lancaster (EUA), descendentes de poucos casais, a síndrome de Ellis-van Creveld é muito mais comum que no resto do mundo.</li>
          <li><b>Cruzamentos ao acaso</b> (panmixia). A <b>endogamia</b> (cruzamento entre parentes) aumenta os homozigotos e diminui os heterozigotos, sem mudar p.</li>
          <li><b>Ausência de seleção natural</b>. Se um genótipo sobrevive ou se reproduz mais, seus alelos aumentam. No caso da anemia falciforme, os heterozigotos resistem melhor à malária, e o alelo chega a frequências acima de 10% em regiões da África.</li>
          <li><b>Ausência de migração</b> (fluxo gênico), que traz ou leva alelos.</li>
          <li><b>Ausência de mutação</b>, que cria alelos novos (lentamente: taxas típicas de 10⁻⁵ a 10⁻⁸ por gene por geração).</li></ul>
          <p>Por isso Hardy-Weinberg é a “hipótese nula” da evolução: quando uma população real foge do equilíbrio, alguma dessas forças está agindo, e o desvio ajuda a descobrir qual.</p>`,
      },
      {
        t: "Testando o equilíbrio com o qui-quadrado",
        h: `<p>Como saber se uma diferença entre o observado e o esperado é real ou só acaso de amostragem? O teste <b>χ²</b> (qui-quadrado) mede o tamanho da diferença:</p>
          <div class="eq">χ² = Σ ${fr("(observado − esperado)²", "esperado")}</div>
          <p>Roteiro: (1) calcule p e q contando alelos; (2) calcule os esperados N·p², N·2pq e N·q²; (3) some (O − E)²/E das três classes; (4) compare com o valor crítico. Há 3 classes, menos 1 (o total é fixo), menos 1 (p foi estimado dos próprios dados): <b>1 grau de liberdade</b>, e o valor crítico a 5% é <b>3,84</b>.</p>
          <p>Se χ² ≤ 3,84, os dados são compatíveis com o equilíbrio: a diferença cabe no acaso. Se χ² &gt; 3,84, rejeitamos o equilíbrio. Um padrão revelador é a <b>falta de heterozigotos</b> (observado bem menor que 2pq·N), que aponta para endogamia ou para mistura de duas subpopulações com frequências diferentes (efeito Wahlund).</p>`,
      },
    ],
    formulas: [
      { nome: "Frequências alélicas", eq: `p + q = 1 &nbsp;&nbsp; p = ${fr("2·AA + Aa", "2N")}`, simbolos: [["p", "frequência do alelo A", "0 a 1"], ["q", "frequência do alelo a", "0 a 1"], ["AA, Aa", "números de indivíduos de cada genótipo", "indivíduos"], ["N", "total de indivíduos", "indivíduos"]], obs: "Conte alelos, não indivíduos: cada pessoa tem dois." },
      { nome: "Equilíbrio de Hardy-Weinberg", eq: `p² + 2pq + q² = 1`, simbolos: [["p²", "frequência de AA", "—"], ["2pq", "frequência de Aa (portadores)", "—"], ["q²", "frequência de aa", "—"]], obs: "Só vale se a população estiver em equilíbrio; para achar q a partir dos afetados, tire a raiz: q = √(q²)." },
      { nome: "Qui-quadrado", eq: `χ² = Σ ${fr("(O − E)²", "E")}`, simbolos: [["O", "número observado em cada classe", "indivíduos"], ["E", "número esperado (N × frequência)", "indivíduos"]], obs: "1 grau de liberdade no teste de Hardy-Weinberg com dois alelos; crítico 3,84 (α = 0,05)." },
    ],
    exemplos: [
      {
        t: "direto",
        enunciado: `A fibrose cística (autossômica recessiva) afeta 1 em cada 2500 pessoas de uma população em equilíbrio. Calcule q, p, a frequência de portadores e quantos portadores há numa cidade de 200 000 habitantes.`,
        passos: [`q² = 1/2500 = 0,0004 → q = √0,0004 = 0,02.`, `p = 1 − 0,02 = 0,98.`, `2pq = 2 × 0,98 × 0,02 = 0,0392 (≈ 3,9%, cerca de 1 em 25).`, `Na cidade: 0,0392 × 200 000 = 7840 portadores (e só 0,0004 × 200 000 = 80 afetados).`],
        resposta: `q = <b>0,02</b>, p = <b>0,98</b>, portadores = <b>0,0392</b> ≈ <b>7840 pessoas</b>`,
      },
      {
        t: "contagens e χ²",
        enunciado: `Numa amostra de 1000 indivíduos há 500 AA, 300 Aa e 200 aa. Calcule p e diga se a população está em equilíbrio de Hardy-Weinberg.`,
        passos: [`p = (2 × 500 + 300) / (2 × 1000) = 1300 / 2000 = 0,65; q = 0,35.`, `Esperados: AA = 1000 × 0,65² = 422,5; Aa = 1000 × 2 × 0,65 × 0,35 = 455; aa = 1000 × 0,35² = 122,5.`, `χ² = 77,5²/422,5 + 155²/455 + 77,5²/122,5 = 14,2 + 52,8 + 49,0 ≈ 116.`, `116 ≫ 3,84: não está em equilíbrio. Faltam heterozigotos (300 contra 455 esperados), sinal de endogamia ou subdivisão.`],
        resposta: `p = <b>0,65</b>; χ² ≈ <b>116</b>: <b>fora do equilíbrio</b>`,
      },
      {
        t: "fenótipo dominante (nível prova)",
        enunciado: `Numa população em equilíbrio, 36% das pessoas não sentem o gosto amargo da feniltiocarbamida (característica recessiva, tt). Entre as pessoas que sentem o gosto, que fração é heterozigota?`,
        passos: [`q² = 0,36 → q = 0,6; p = 0,4.`, `Sentem o gosto: p² + 2pq = 0,16 + 0,48 = 0,64.`, `Condicional: P(Tt | sente) = 2pq / (p² + 2pq) = 0,48 / 0,64 = 0,75.`],
        resposta: `<b>75%</b> dos que sentem o gosto são heterozigotos`,
      },
    ],
    erros: [
      { errado: `Usar q = 0,0004 quando 1 em 2500 é afetado.`, certo: `0,0004 é q² (a fração de aa). q = √0,0004 = 0,02.`, porque: `Afetados são o encontro de dois alelos a: frequência q × q.` },
      { errado: `Achar que a frequência de portadores é q (ou q²).`, certo: `Portadores são heterozigotos: 2pq.`, porque: `q é a frequência de um alelo, não de pessoas; q² são os afetados.` },
      { errado: `Calcular p dividindo o número de AA pelo total de indivíduos.`, certo: `Conte alelos: p = (2·AA + Aa)/2N.`, porque: `Os heterozigotos também carregam um alelo A, e cada indivíduo tem dois alelos.` },
      { errado: `Pensar que um alelo dominante tende a aumentar até chegar a 75%.`, certo: `Sem forças evolutivas, as frequências ficam constantes, seja o alelo dominante ou recessivo.`, porque: `Foi exatamente essa a objeção que Hardy respondeu em 1908.` },
      { errado: `Achar que o equilíbrio exige p = q = 0,5.`, certo: `Qualquer valor de p pode estar em equilíbrio; o que importa é se os genótipos estão nas proporções p², 2pq, q².`, porque: `Equilíbrio significa “não muda”, não “meio a meio”.` },
    ],
    aplicacoes: [
      `<b>Saúde pública</b>: estimar quantos portadores de fibrose cística, anemia falciforme ou talassemia existem numa região, para planejar triagem neonatal e aconselhamento.`,
      `<b>Genética forense</b>: a probabilidade de um perfil de DNA aparecer por acaso é calculada com p² e 2pq para cada marcador, multiplicando entre marcadores.`,
      `<b>Conservação</b>: déficit de heterozigotos em populações pequenas de animais ameaçados (como o mico-leão-dourado) é sinal de endogamia e orienta programas de translocação.`,
      `<b>Estudos de associação genômica</b>: marcadores que fogem muito do equilíbrio nos controles costumam indicar erro de genotipagem e são descartados.`,
    ],
    teste: [
      { p: `Numa população em equilíbrio, 16% são aa. A frequência de heterozigotos é:`, op: [`0,16`, `0,48`, `0,40`, `0,24`], certa: 1, explica: `q² = 0,16 → q = 0,4, p = 0,6; 2pq = 2 × 0,6 × 0,4 = 0,48.` },
      { p: `Qual destas situações NÃO tira uma população do equilíbrio de Hardy-Weinberg?`, op: [`Seleção natural contra os aa`, `Chegada de muitos migrantes`, `Cruzamentos ao acaso numa população enorme`, `Casamentos preferenciais entre primos`], certa: 2, explica: `Panmixia em população grande é justamente uma das condições do equilíbrio; as outras alternativas são forças que alteram frequências.` },
      { p: `Por que alelos recessivos raros são difíceis de eliminar por seleção contra os afetados?`, op: [`Porque sofrem mutação constante`, `Porque quase todas as cópias estão em heterozigotos, que não são afetados`, `Porque são dominantes nos portadores`, `Porque a seleção só age sobre alelos dominantes`], certa: 1, explica: `Com q pequeno, 2pq é muito maior que q²: os portadores “escondem” a maior parte do alelo.` },
      { p: `Uma amostra tem 360 AA, 480 Aa e 160 aa. Qual o valor de p?`, op: [`0,36`, `0,84`, `0,50`, `0,60`], certa: 3, explica: `p = (2 × 360 + 480)/2000 = 1200/2000 = 0,6. E essa amostra está exatamente em p² : 2pq : q².` },
      { p: `Num teste χ² de Hardy-Weinberg com dois alelos, obteve-se χ² = 1,2. A conclusão é:`, op: [`os dados são compatíveis com o equilíbrio`, `a população está fora do equilíbrio`, `há seleção natural com certeza`, `é preciso usar 2 graus de liberdade`], certa: 0, explica: `1,2 é menor que o valor crítico 3,84 (1 grau de liberdade, α = 0,05): a diferença cabe no acaso.` },
    ],
    resumo: [
      `p + q = 1 (frequências dos alelos); p² + 2pq + q² = 1 (frequências dos genótipos no equilíbrio).`,
      `Afetados recessivos = q²: tire a raiz para achar q.`,
      `Portadores = 2pq; para alelos raros, há muito mais portadores que afetados.`,
      `Com contagens, conte alelos: p = (2·AA + Aa)/2N.`,
      `Equilíbrio exige população grande, panmixia e ausência de seleção, migração e mutação.`,
      `χ² com 1 grau de liberdade: acima de 3,84, rejeite o equilíbrio.`,
    ],
    alem: {
      t: "Para ir além: um matemático, uma objeção e os genes do X",
      h: `<p>Em 1908, o geneticista Reginald Punnett levou a G. H. Hardy, matemático puro de Cambridge, uma objeção que circulava contra o mendelismo: se a braquidactilia (dedos curtos) é dominante, por que ela não fica cada vez mais comum, até atingir 3/4 da população? Hardy mostrou em uma página, publicada na revista <i>Science</i>, que nada empurra as frequências: elas se mantêm. No mesmo ano, o médico alemão Wilhelm Weinberg chegou ao mesmo resultado de forma independente.</p>
        <p>Para genes no <b>cromossomo X</b>, o equilíbrio tem outra cara. Homens têm um X só, então a frequência de homens afetados é igual a <b>q</b>, e a de mulheres afetadas é <b>q²</b>. Se 8% dos homens são daltônicos, q = 0,08 e:</p>
        <div class="eq">mulheres daltônicas = q² = 0,0064 ≈ 0,6% &nbsp;·&nbsp; portadoras = 2pq = 2 × 0,92 × 0,08 ≈ 15%</div>
        <p>É por isso que doenças recessivas ligadas ao X aparecem quase só em homens. Já a <b>deriva genética</b> pode ser modelada como um sorteio: numa população de N indivíduos, a heterozigosidade esperada cai cerca de 1/(2N) por geração. Populações pequenas perdem variabilidade depressa, e esse é um dos argumentos centrais da biologia da conservação para manter populações grandes e conectadas.</p>`,
    },
  };

  // ===========================================================================
  // 4. Do DNA à proteína
  // ===========================================================================
  A.dna = {
    tempo: 20, nivel: "Ensino médio → biologia molecular básica",
    objetivos: [
      "descrever a estrutura do DNA e as regras de pareamento (A–T, C–G) e de Chargaff;",
      "escrever a fita complementar e o RNAm transcrito, respeitando as orientações 5' e 3';",
      "traduzir um RNAm em aminoácidos com a tabela do código genético, a partir do AUG;",
      "classificar mutações (silenciosa, de sentido trocado, sem sentido, deslocamento do quadro de leitura) e prever seu efeito.",
    ],
    secoes: [
      {
        t: "A ideia em uma frase",
        h: `<p>O DNA é um texto escrito com quatro letras (A, T, C, G). Um <b>gene</b> é um trecho desse texto que é <b>copiado</b> para RNA (transcrição) e depois <b>lido de três em três letras</b> pelo ribossomo, que monta uma proteína aminoácido por aminoácido (tradução). Francis Crick chamou esse fluxo de <b>dogma central</b>: DNA → RNA → proteína.</p>
          <div class="analogia"><b>Analogia:</b> o DNA é o livro de receitas guardado na biblioteca (o núcleo), que não pode sair de lá. Para cozinhar, tira-se uma fotocópia da receita (o RNAm), que vai até a cozinha (o ribossomo). Lá, cada palavra de três letras (códon) indica um ingrediente (aminoácido), e os ingredientes são encadeados na ordem do texto.</div>
          <p>Isso explica por que uma única letra trocada pode causar uma doença: muda uma palavra, muda um ingrediente, e a proteína pode perder a forma e a função. O genoma humano tem cerca de 3,1 bilhões de pares de bases e uns 20 mil genes que codificam proteínas, mas só cerca de 1,5% dele é sequência codificante.</p>`,
      },
      {
        t: "A dupla-hélice e o pareamento de bases",
        h: `<p>Cada nucleotídeo tem três partes: um <b>fosfato</b>, um açúcar de cinco carbonos (<b>desoxirribose</b> no DNA, ribose no RNA) e uma <b>base nitrogenada</b>. As bases são púricas (A e G, dois anéis) ou pirimídicas (C, T e, no RNA, U, um anel).</p>
          <p>Em 1953, James Watson e Francis Crick propuseram a dupla-hélice, apoiados nas imagens de difração de raios X de Rosalind Franklin e Raymond Gosling. As duas fitas se ligam pelas bases: <b>A com T</b> (duas pontes de hidrogênio) e <b>C com G</b> (três pontes). Sempre uma púrica com uma pirimídica, o que mantém a largura da hélice constante (cerca de 2 nm).</p>
          <p>Consequência direta: num DNA de fita dupla, <b>%A = %T</b> e <b>%C = %G</b> (regras de Chargaff). Se 30% das bases são A, então 30% são T e sobram 40% para C + G, ou seja, 20% cada.</p>
          <p>As fitas são <b>antiparalelas</b>: uma corre de 5' para 3' e a outra de 3' para 5' (os números indicam carbonos do açúcar). Por isso, ao escrever a complementar de 5'-ATGCC-3', o resultado é 3'-TACGG-5'. Na replicação, cada fita serve de molde para uma nova: a replicação é <b>semiconservativa</b>, como Meselson e Stahl demonstraram em 1958.</p>`,
      },
      {
        t: "Transcrição: do DNA ao RNAm",
        h: `<p>A enzima <b>RNA-polimerase</b> abre a dupla-hélice num gene e usa <b>uma</b> das fitas como molde. Ela lê o molde no sentido 3' → 5' e constrói o RNA no sentido 5' → 3', pareando: A do molde → U; T → A; C → G; G → C.</p>
          <div class="eq">molde 3'-TAC GGT CAA GCT ATT-5' &nbsp;→&nbsp; RNAm 5'-AUG CCA GUU CGA UAA-3'</div>
          <p>Repare num atalho útil: o RNAm é <b>igual à outra fita</b>, a <b>codificante</b>, só trocando T por U (5'-ATG CCA GTT CGA TAA-3'). Por isso as bases de dados de genes mostram sempre a fita codificante.</p>
          <p>Nos eucariotos, o RNA recém-transcrito ainda é processado no núcleo antes de sair: recebe um <b>capuz</b> na ponta 5', uma <b>cauda poli-A</b> na 3' e passa pelo <b>splicing</b>, que remove os <b>íntrons</b> (trechos não codificantes) e junta os <b>éxons</b>. Bactérias não têm núcleo nem, em geral, íntrons: lá a tradução começa enquanto o RNA ainda está sendo transcrito.</p>`,
      },
      {
        t: "O código genético e a tradução",
        h: `<p>Com 4 bases, palavras de 3 letras dão 4³ = <b>64 códons</b>: 61 codificam os 20 aminoácidos e 3 são de <b>parada</b> (UAA, UAG, UGA). O códon <b>AUG</b> codifica metionina e marca o <b>início</b> da tradução. O primeiro códon decifrado foi UUU (fenilalanina), por Nirenberg e Matthaei em 1961.</p>
          <ul><li><b>Degenerado</b> (redundante): vários códons para o mesmo aminoácido. Leucina tem seis; quase sempre a diferença está na 3ª base.</li>
          <li><b>Não ambíguo</b>: cada códon indica um só aminoácido.</li>
          <li><b>Quase universal</b>: o mesmo de bactérias a humanos, com poucas exceções (nas mitocôndrias de vertebrados, UGA codifica triptofano).</li>
          <li><b>Sem vírgulas</b>: lido em sequência, de 3 em 3, a partir do AUG; o ponto de partida define o <b>quadro de leitura</b>.</li></ul>
          <p>No ribossomo, cada códon é reconhecido por um <b>RNA transportador</b> (RNAt) cujo <b>anticódon</b> é complementar a ele e que traz o aminoácido correspondente. O ribossomo liga os aminoácidos por ligações peptídicas até chegar a um códon de parada, quando fatores de liberação soltam a proteína. No exemplo acima: AUG CCA GUU CGA UAA → <b>Met-Pro-Val-Arg</b>, e a leitura para no UAA.</p>`,
      },
      {
        t: "Mutações: quando o texto muda",
        h: `<p>Uma <b>mutação</b> é uma mudança na sequência do DNA. Pelo efeito na proteína, as mutações pontuais se classificam assim:</p>
          <ul><li><b>Silenciosa</b>: o códon muda, mas o aminoácido não (CCA → CCG, ambos prolina). Graças à degeneração do código.</li>
          <li><b>De sentido trocado</b> (missense): um aminoácido é trocado. Na <b>anemia falciforme</b>, GAG → GTG troca ácido glutâmico por valina na 6ª posição da cadeia beta da hemoglobina; as hemácias se deformam em foice quando falta oxigênio.</li>
          <li><b>Sem sentido</b> (nonsense): o códon vira parada (CGA → UGA) e a proteína sai truncada.</li>
          <li><b>Deslocamento do quadro de leitura</b> (frameshift): inserção ou deleção de bases em número que não é múltiplo de 3. Todos os códons seguintes mudam; costuma ser a mais grave.</li></ul>
          <p>Inserções ou deleções de 3 bases mantêm o quadro e acrescentam ou removem um aminoácido: a forma mais comum de fibrose cística (ΔF508) é a perda de 3 nucleotídeos que remove a fenilalanina 508 da proteína CFTR. Já a doença de Huntington vem da <b>expansão</b> de repetições CAG (glutamina): acima de cerca de 36 a 40 repetições, a proteína se torna tóxica para os neurônios.</p>
          <div class="nota">Nem toda mutação é ruim: mutações são a matéria-prima da evolução. A persistência da lactase em adultos, comum em populações com tradição de pecuária leiteira, vem de mutações numa região reguladora do gene.</div>`,
      },
    ],
    formulas: [
      { nome: "Regras de Chargaff (DNA dupla-fita)", eq: `%A = %T &nbsp;&nbsp; %C = %G &nbsp;&nbsp; %A + %T + %C + %G = 100%`, simbolos: [["%X", "porcentagem da base X no DNA", "%"]], obs: "Não vale para DNA de fita simples nem para RNA." },
      { nome: "Tamanho mínimo da região codificante", eq: `nucleotídeos = 3 × (nº de aminoácidos + 1)`, simbolos: [["+1", "o códon de parada, que não traz aminoácido", "códon"]], obs: "Mínimo: o RNAm real tem regiões não traduzidas nas pontas, e o gene eucariótico ainda tem íntrons." },
      { nome: "Número de códons", eq: `4³ = 64 códons = 61 com aminoácido + 3 de parada`, simbolos: [["4", "tipos de base", "—"], ["3", "bases por códon", "—"]], obs: "Com códons de 2 bases seriam só 16 combinações, menos que os 20 aminoácidos." },
    ],
    exemplos: [
      {
        t: "direto: transcrição e tradução",
        enunciado: `A fita molde de um gene (lida 3'→5') é TAC GGT CAA GCT ATT. Escreva o RNAm e o peptídeo produzido.`,
        passos: [`Pareie cada base do molde: T→A, A→U, C→G, G→C.`, `TAC → AUG; GGT → CCA; CAA → GUU; GCT → CGA; ATT → UAA.`, `RNAm 5'-AUG CCA GUU CGA UAA-3'.`, `Tabela do código: AUG = Met (início), CCA = Pro, GUU = Val, CGA = Arg, UAA = parada.`],
        resposta: `RNAm <b>AUG CCA GUU CGA UAA</b> → <b>Met-Pro-Val-Arg</b> (4 aminoácidos)`,
      },
      {
        t: "Chargaff",
        enunciado: `Uma molécula de DNA de fita dupla tem 30% de adenina. Quais as porcentagens de T, C e G?`,
        passos: [`%T = %A = 30%.`, `A + T = 60%, então C + G = 100% − 60% = 40%.`, `%C = %G = 40% ÷ 2 = 20%.`],
        resposta: `T = <b>30%</b>, C = <b>20%</b>, G = <b>20%</b>`,
      },
      {
        t: "mutações (nível prova)",
        enunciado: `No mesmo molde TAC GGT CAA GCT ATT, preveja o efeito de: (a) a 10ª base G trocada por A; (b) a 5ª base (G) deletada.`,
        passos: [`(a) O molde fica TAC GGT CAA ACT ATT; o 4º códon do RNAm passa de CGA para UGA.`, `UGA é parada: o peptídeo vira Met-Pro-Val, truncado. Mutação <b>sem sentido</b>.`, `(b) Sem a 5ª base, o molde vira TAC GTC AAG CTA TT; o RNAm é AUG CAG UUC GAU AA.`, `Leitura: Met-Gln-Phe-Asp e nenhum códon de parada no trecho: todos os códons depois da deleção mudaram. <b>Deslocamento do quadro de leitura</b>.`],
        resposta: `(a) <b>sem sentido</b>: Met-Pro-Val; (b) <b>frameshift</b>: Met-Gln-Phe-Asp…`,
      },
    ],
    erros: [
      { errado: `Escrever o RNAm com T (AUG CCA GTT…).`, certo: `No RNA, a timina é substituída por uracila: AUG CCA GUU…`, porque: `O RNA usa U; T só existe no DNA.` },
      { errado: `Achar que o RNAm é complementar à fita codificante.`, certo: `O RNAm é complementar à fita <b>molde</b> e igual à codificante (com U no lugar de T).`, porque: `A RNA-polimerase lê o molde; a codificante é a “outra” fita, com a mesma sequência do RNA.` },
      { errado: `Começar a ler os códons pela primeira base do RNAm, mesmo que o AUG esteja mais adiante.`, certo: `A tradução começa no primeiro AUG, e a leitura segue de 3 em 3 a partir dele.`, porque: `O ribossomo percorre a região 5' não traduzida até achar o códon de início.` },
      { errado: `Contar o códon de parada como um aminoácido.`, certo: `UAA, UAG e UGA não têm RNAt correspondente: encerram a tradução.`, porque: `São reconhecidos por fatores de liberação, não por RNAt com aminoácido.` },
      { errado: `Dizer que toda mutação altera a proteína.`, certo: `Mutações silenciosas e em regiões não codificantes podem não mudar nada.`, porque: `O código é degenerado e só cerca de 1,5% do genoma humano codifica proteínas.` },
    ],
    aplicacoes: [
      `<b>Medicina</b>: o sequenciamento de genes identifica mutações causadoras de doenças (como as de BRCA1 e BRCA2 no câncer de mama hereditário) e orienta tratamentos.`,
      `<b>Vacinas de RNAm</b>: as vacinas contra a covid-19 entregam às células um RNAm com a receita da proteína S do vírus; o ribossomo a traduz e o sistema imune aprende a reconhecê-la.`,
      `<b>Biotecnologia</b>: a insulina humana é produzida por bactérias que receberam o gene humano, graças à universalidade do código genético.`,
      `<b>Forense e parentesco</b>: o pareamento de bases é a base da PCR, que copia trechos de DNA milhões de vezes a partir de uma amostra minúscula.`,
    ],
    teste: [
      { p: `Se uma fita de DNA tem a sequência 5'-ATGC-3', a fita complementar é:`, op: [`5'-TACG-3'`, `3'-TACG-5'`, `5'-AUGC-3'`, `3'-UACG-5'`], certa: 1, explica: `A pareia com T e C com G, e as fitas são antiparalelas: a complementar corre de 3' para 5'. RNA (com U) não entra aqui.` },
      { p: `Por que uma mutação na 3ª base de um códon muitas vezes não muda a proteína?`, op: [`Porque a 3ª base não é lida pelo ribossomo`, `Porque o código é degenerado: códons que diferem na 3ª base costumam codificar o mesmo aminoácido`, `Porque a 3ª base é sempre removida no splicing`, `Porque o RNAt corrige o erro`], certa: 1, explica: `É a degeneração do código (e o pareamento oscilante na 3ª posição do anticódon).` },
      { p: `Uma deleção de 1 base no início de um gene costuma ser mais grave que a troca de 1 base porque:`, op: [`remove um aminoácido só`, `cria sempre um códon de início`, `desloca o quadro de leitura e altera todos os códons seguintes`, `impede a transcrição`], certa: 2, explica: `Sem uma base, a leitura de 3 em 3 fica “torta” daí em diante; logo surge um códon de parada fora do lugar.` },
      { p: `Uma proteína tem 200 aminoácidos. O número mínimo de nucleotídeos da região codificante do RNAm, incluindo o códon de parada, é:`, op: [`600`, `603`, `200`, `400`], certa: 1, explica: `3 × (200 + 1) = 603: 200 códons de aminoácidos e 1 de parada.` },
      { p: `Qual destes NÃO é encontrado no RNA?`, op: [`uracila`, `ribose`, `fosfato`, `timina`], certa: 3, explica: `O RNA tem ribose e uracila; a timina (e a desoxirribose) são exclusivas do DNA.` },
      { p: `Na anemia falciforme, GAG muda para GTG no gene da β-globina. Que tipo de mutação é essa?`, op: [`de sentido trocado (missense)`, `silenciosa`, `sem sentido (nonsense)`, `deslocamento do quadro de leitura`], certa: 0, explica: `Uma troca de base que substitui um aminoácido por outro (Glu → Val): missense. O quadro de leitura não muda.` },
    ],
    resumo: [
      `Dogma central: DNA → (transcrição) → RNA → (tradução) → proteína.`,
      `Pareamento: A–T (2 pontes de H) e C–G (3 pontes); no RNA, U no lugar de T. Chargaff: %A = %T e %C = %G.`,
      `Fitas antiparalelas; o RNAm é complementar ao molde e igual à fita codificante (com U).`,
      `64 códons: 61 com aminoácido, 3 de parada (UAA, UAG, UGA); AUG = início (metionina).`,
      `O código é degenerado, não ambíguo e quase universal; leitura de 3 em 3 a partir do AUG.`,
      `Mutações: silenciosa, de sentido trocado, sem sentido e frameshift (a mais drástica).`,
    ],
    alem: {
      t: "Para ir além: um gene, muitas proteínas, e um código com exceções",
      h: `<p>Os cerca de 20 mil genes humanos produzem muito mais tipos de proteína graças ao <b>splicing alternativo</b>: o mesmo RNA pode ter éxons combinados de jeitos diferentes. Estima-se que mais de 90% dos genes humanos com vários éxons passem por splicing alternativo. O gene <i>Dscam</i> da mosca-das-frutas, no extremo, pode gerar dezenas de milhares de variantes.</p>
        <p>Em 1966, Crick propôs a hipótese da <b>oscilação</b> (wobble): a 1ª base do anticódon (que pareia com a 3ª do códon) tem pareamento mais flexível. Com isso, um mesmo RNAt reconhece mais de um códon, e a célula funciona com bem menos que 61 tipos de RNAt.</p>
        <p>O código também tem “letras extras”. A <b>selenocisteína</b>, o 21º aminoácido, é inserida num códon UGA quando o RNAm tem uma estrutura especial (elemento SECIS); a <b>pirrolisina</b>, o 22º, é codificada por UAG em algumas arqueias. E a biologia sintética já cria bactérias com bases artificiais e aminoácidos não naturais, expandindo deliberadamente o alfabeto da vida.</p>`,
    },
  };

  // ===========================================================================
  // 5. Populações e energia
  // ===========================================================================
  A.populacoes = {
    tempo: 18, nivel: "Ensino médio → ecologia de populações (faculdade)",
    objetivos: [
      "explicar por que populações sem limites crescem de forma exponencial e calcular N(t) e o tempo de duplicação;",
      "usar o modelo logístico e interpretar a capacidade de suporte K e a curva em S;",
      "identificar em que tamanho a população cresce mais rápido (K/2) e por que isso importa no manejo;",
      "aplicar a regra dos 10% ao fluxo de energia e explicar a forma das pirâmides ecológicas.",
    ],
    secoes: [
      {
        t: "A ideia em uma frase",
        h: `<p>Uma população cresce <b>proporcionalmente ao seu próprio tamanho</b>: mais indivíduos geram mais filhotes. Enquanto há recursos sobrando, isso produz um crescimento <b>exponencial</b>, que parece lento no começo e explode depois. Mas nenhum ambiente é infinito: comida, espaço, predadores e doenças acabam freando o crescimento perto de um teto, a <b>capacidade de suporte</b>.</p>
          <div class="analogia"><b>Analogia:</b> é como juros compostos. Uma dívida de 2% ao mês parece pequena, mas os juros incidem sobre os juros, e em três anos ela dobra. Populações fazem o mesmo com nascimentos: os filhos também têm filhos.</div>
          <p>A escala surpreende. Em condições ideais, a bactéria <i>Escherichia coli</i> se divide a cada 20 minutos. Em 24 horas seriam 72 duplicações: 2⁷² ≈ 4,7 × 10²¹ células. Com cerca de 1 picograma cada, dariam uns 4,7 bilhões de gramas, ou 4700 toneladas, a partir de uma só célula. Isso nunca acontece porque o meio se esgota muito antes: o crescimento exponencial é sempre uma fase passageira.</p>`,
      },
      {
        t: "Crescimento exponencial e tempo de duplicação",
        h: `<p>Se a taxa per capita de crescimento <b>r</b> (nascimentos menos mortes, por indivíduo e por unidade de tempo) é constante, a população cresce segundo dN/dt = r·N, cuja solução é:</p>
          <div class="eq">N(t) = N₀ · e<sup>r·t</sup></div>
          <p>Exemplo: 1000 bactérias com r = 0,1 por hora. Após 12 h: N = 1000 · e<sup>1,2</sup> = 1000 × 3,32 = <b>3320 células</b>.</p>
          <p>A marca registrada do crescimento exponencial é o <b>tempo de duplicação constante</b>. Fazendo N = 2N₀, e<sup>rt</sup> = 2, logo:</p>
          <div class="eq">t<sub>d</sub> = ${fr("ln 2", "r")} ≈ ${fr("0,693", "r")}</div>
          <p>Para as bactérias acima, t<sub>d</sub> = 0,693/0,1 = 6,9 h. A “regra do 70” dá o mesmo de cabeça: 70 dividido pela taxa em %. A população humana, que passou de 8 bilhões em 2022, cresce perto de 0,9% ao ano: dobraria em cerca de 77 anos se a taxa se mantivesse (e ela vem caindo).</p>
          <p>Espécies que se reproduzem em épocas definidas, como aves com uma ninhada por ano, seguem a versão discreta: <b>N(t) = N₀·(1 + r)<sup>t</sup></b>. Oitenta aves crescendo 25% ao ano viram 80 × 1,25⁵ ≈ 244 em cinco anos.</p>`,
      },
      {
        t: "O freio: crescimento logístico e capacidade de suporte",
        h: `<p>Em 1838, Pierre-François Verhulst propôs incluir um freio que aumenta à medida que a população se aproxima de <b>K</b>, a capacidade de suporte do ambiente:</p>
          <div class="eq">${fr("dN", "dt")} = r · N · (1 − ${fr("N", "K")}) &nbsp;&nbsp;⇒&nbsp;&nbsp; N(t) = ${fr("K", "1 + A·e<sup>−rt</sup>")}, &nbsp; A = ${fr("K − N₀", "N₀")}</div>
          <p>Quando N é pequeno, o termo (1 − N/K) vale quase 1 e o crescimento é praticamente exponencial. Quando N se aproxima de K, ele tende a zero e o crescimento para. O resultado é a <b>curva em S</b> (sigmoide), que o ecólogo russo Georgy Gause observou em culturas de paramécios na década de 1930.</p>
          <p>Exemplo: K = 1000, N₀ = 50, r = 0,5 por mês. Então A = 950/50 = 19 e, após 10 meses, N = 1000 / (1 + 19 · e<sup>−5</sup>) = 1000 / 1,128 ≈ <b>887</b>. Sem freio, seriam 50 · e⁵ ≈ 7421.</p>
          <p>O ponto de inflexão da curva fica em <b>N = K/2</b>: é ali que dN/dt é máxima, igual a rK/4 (125 indivíduos por mês no exemplo). A pesca e o manejo de caça usam essa ideia, o <b>rendimento máximo sustentável</b>: manter o estoque perto de K/2 permite retirar o máximo a cada ano sem esgotá-lo.</p>`,
        grafico: {
          op: { altura: 230, modo: "dados", rotX: "t (meses)", rotY: "N" },
          cena: { x: [0, 14], y: [0, 1150], nomeX: "t", nomeY: "N", series: [
            { tipo: "funcao", f: (t) => { const v = 50 * Math.exp(0.5 * t); return v <= 1150 ? v : NaN; }, rotulo: "exponencial", cor: "#f0a23c", tracejado: true },
            { tipo: "funcao", f: (t) => 1000 / (1 + 19 * Math.exp(-0.5 * t)), rotulo: "logístico", cor: "#9ccc65" },
            { tipo: "hline", v: 1000, cor: "rgba(155,167,182,.7)", tracejado: true, largura: 1, rotulo: "K = 1000", legenda: false },
            { tipo: "hline", v: 500, cor: "rgba(155,167,182,.35)", tracejado: true, largura: 1, rotulo: "K/2", legenda: false },
          ] },
          legenda: "N₀ = 50, r = 0,5 por mês, K = 1000. As curvas coincidem no início; a logística se curva em K/2 e estaciona em K.",
        },
      },
      {
        t: "O que regula as populações",
        h: `<p>A “resistência do meio” do modelo logístico resume vários fatores reais. Os <b>dependentes da densidade</b> pesam mais quanto mais cheia está a população: competição por alimento e território, predação, parasitas e doenças contagiosas (que se espalham melhor em populações densas). Os <b>independentes da densidade</b> atingem uma fração parecida da população qualquer que seja o tamanho: geadas, secas, incêndios, enchentes.</p>
          <p>As espécies também diferem na estratégia. As chamadas <b>estrategistas r</b> (muitas bactérias, insetos, plantas pioneiras) investem em muitos descendentes pequenos e pouco cuidados, crescem rápido e se dão bem em ambientes instáveis. As <b>estrategistas K</b> (elefantes, grandes primatas, árvores de floresta madura) têm poucos filhotes, com muito investimento, e populações próximas de K. É um contínuo, não duas caixas.</p>
          <p>Na vida real, as populações oscilam em torno de K, às vezes de forma regular. O caso clássico é o da lebre-americana e do lince no Canadá, com ciclos de cerca de 10 anos registrados nas peles compradas pela Companhia da Baía de Hudson.</p>`,
      },
      {
        t: "Energia: a regra dos 10% e as pirâmides",
        h: `<p>A energia entra nos ecossistemas pela fotossíntese dos <b>produtores</b> e passa para os consumidores primários (herbívoros), secundários e terciários. Em cada passagem, a maior parte se perde: é gasta na respiração celular e sai como <b>calor</b>, fica em partes não comidas ou não digeridas (raízes, ossos, fezes) e vai para os decompositores. Em média, só cerca de <b>10%</b> chega ao nível seguinte, regra associada a Raymond Lindeman (1942).</p>
          <div class="eq">E<sub>n</sub> = E<sub>1</sub> × 0,1<sup>n − 1</sup> &nbsp;&nbsp; 20 000 → 2000 → 200 → 20 kcal/m²·ano</div>
          <p>Consequências: as cadeias raramente passam de 4 ou 5 níveis; grandes predadores são poucos e precisam de áreas enormes; e comer mais perto dos produtores sustenta mais gente com a mesma área (cerca de 100 kg de capim para 1 kg de consumidor secundário).</p>
          <p>A <b>pirâmide de energia nunca é invertida</b>, porque a energia sempre diminui ao subir. Já a de <b>biomassa</b> pode inverter (no mar, o fitoplâncton, de vida muito curta, pode ter menos massa num instante que o zooplâncton que o come), e a de <b>números</b> também (uma árvore sustenta milhares de insetos).</p>
          <div class="nota">O 10% é uma média didática. Eficiências medidas vão de cerca de 2% a 20%: costumam ser maiores em cadeias aquáticas e entre animais de sangue frio, que gastam menos energia mantendo a temperatura do corpo.</div>`,
      },
    ],
    formulas: [
      { nome: "Crescimento exponencial", eq: `N(t) = N₀ · e<sup>r·t</sup> &nbsp;&nbsp; t<sub>d</sub> = ${fr("ln 2", "r")}`, simbolos: [["N₀", "população inicial", "indivíduos"], ["r", "taxa intrínseca de crescimento", "1/tempo"], ["t", "tempo", "mesma unidade de r"], ["t<sub>d</sub>", "tempo de duplicação", "tempo"]], obs: "r em fração (2% = 0,02), na mesma unidade de tempo que t." },
      { nome: "Gerações discretas", eq: `N(t) = N₀ · (1 + r)<sup>t</sup>`, simbolos: [["r", "aumento fracionário por período", "—"], ["t", "número de períodos", "—"]], obs: "Para reprodução sazonal; para r pequeno, quase igual ao modelo contínuo." },
      { nome: "Crescimento logístico", eq: `N(t) = ${fr("K", "1 + ((K − N₀)/N₀) · e<sup>−r·t</sup>")} &nbsp;&nbsp; (dN/dt)<sub>máx</sub> = ${fr("r·K", "4")} em N = K/2`, simbolos: [["K", "capacidade de suporte", "indivíduos"]], obs: "Vale para N₀ abaixo ou acima de K: a população sempre tende a K." },
      { nome: "Regra dos 10%", eq: `E<sub>n</sub> = E<sub>1</sub> × (eficiência)<sup>n − 1</sup>`, simbolos: [["E<sub>1</sub>", "energia fixada pelos produtores", "kcal/m²·ano"], ["n", "nível trófico (1 = produtores)", "—"]], obs: "Eficiência média de 0,1, mas varia entre ecossistemas." },
    ],
    exemplos: [
      {
        t: "direto: exponencial",
        enunciado: `Uma cultura começa com 1000 bactérias e cresce exponencialmente com r = 0,1 por hora. Quantas haverá após 12 h? Qual o tempo de duplicação?`,
        passos: [`N(12) = 1000 · e<sup>0,1 × 12</sup> = 1000 · e<sup>1,2</sup>.`, `e<sup>1,2</sup> ≈ 3,320, então N ≈ 3320 bactérias.`, `t<sub>d</sub> = ln 2 / r = 0,693 / 0,1 ≈ 6,93 h.`],
        resposta: `N(12) ≈ <b>3320</b> bactérias; t<sub>d</sub> ≈ <b>6,9 h</b>`,
      },
      {
        t: "logístico",
        enunciado: `Uma população de peixes num lago tem K = 1000, N₀ = 50 e r = 0,5 por mês. Qual o tamanho após 10 meses? Em que tamanho ela cresce mais rápido, e quanto?`,
        passos: [`A = (K − N₀)/N₀ = 950/50 = 19.`, `e<sup>−0,5 × 10</sup> = e<sup>−5</sup> ≈ 0,00674; 1 + 19 × 0,00674 ≈ 1,128.`, `N(10) = 1000 / 1,128 ≈ 887 peixes.`, `Crescimento máximo em N = K/2 = 500, com dN/dt = rK/4 = 0,5 × 1000 / 4 = 125 peixes por mês.`],
        resposta: `N(10) ≈ <b>887</b>; máximo de <b>125 peixes/mês</b> quando N = <b>500</b>`,
      },
      {
        t: "energia (nível prova)",
        enunciado: `Numa cadeia capim → preá → cobra → gavião, o capim fixa 20 000 kcal/m²·ano. Pela regra dos 10%, quanta energia chega ao gavião? Que porcentagem da energia do capim é essa?`,
        passos: [`Preá (nível 2): 20 000 × 0,1 = 2000 kcal/m²·ano.`, `Cobra (nível 3): 2000 × 0,1 = 200.`, `Gavião (nível 4): 200 × 0,1 = 20 kcal/m²·ano.`, `20 / 20 000 = 0,001 = 0,1%.`],
        resposta: `<b>20 kcal/m²·ano</b>, só <b>0,1%</b> da energia dos produtores`,
      },
    ],
    erros: [
      { errado: `Usar r = 2 para uma taxa de 2% ao ano.`, certo: `Converta para fração: r = 0,02 por ano.`, porque: `Na fórmula e<sup>rt</sup>, r multiplica o tempo; 2 por ano significaria crescer 639% ao ano no modelo contínuo.` },
      { errado: `Misturar unidades: r por dia com t em semanas.`, certo: `Ponha r e t na mesma unidade de tempo antes de calcular.`, porque: `O produto r·t precisa ser um número puro.` },
      { errado: `Achar que a população logística cresce mais rápido no começo.`, certo: `O crescimento absoluto (dN/dt) é máximo em N = K/2; no começo, com N pequeno, ele é lento.`, porque: `dN/dt = rN(1 − N/K) é pequeno tanto com N perto de 0 quanto perto de K.` },
      { errado: `Dizer que uma pirâmide de energia pode ser invertida.`, certo: `Só as pirâmides de números e de biomassa podem se inverter; a de energia sempre afina para cima.`, porque: `A cada nível parte da energia vira calor, e ela não pode ser criada no caminho.` },
      { errado: `Achar que os 90% “perdidos” somem do universo.`, certo: `Eles saem principalmente como calor da respiração e como matéria orgânica que vai para os decompositores.`, porque: `Energia se conserva; o que se perde é a energia disponível para o próximo nível.` },
    ],
    aplicacoes: [
      `<b>Pesca e manejo</b>: cotas de captura baseadas no rendimento máximo sustentável (estoques perto de K/2) buscam evitar o colapso de populações, como o do bacalhau da Terra Nova nos anos 1990.`,
      `<b>Epidemiologia</b>: no início de uma epidemia, os casos crescem quase exponencialmente; o tempo de duplicação é um dos primeiros números acompanhados pelas autoridades de saúde.`,
      `<b>Microbiologia e indústria</b>: fermentações (pão, cerveja, antibióticos, insulina) são planejadas pela curva de crescimento dos microrganismos.`,
      `<b>Alimentação e clima</b>: a regra dos 10% explica por que produzir carne exige muito mais área e água que produzir o mesmo valor energético em grãos.`,
      `<b>Espécies invasoras</b>: o javali no Brasil e o caramujo-africano mostram crescimento quase exponencial quando chegam a um ambiente sem predadores.`,
    ],
    teste: [
      { p: `Uma população cresce exponencialmente e dobra a cada 10 anos. Partindo de 1000 indivíduos, quantos haverá em 30 anos?`, op: [`3000`, `6000`, `8000`, `4000`], certa: 2, explica: `30 anos são 3 duplicações: 1000 × 2³ = 8000. O tempo de duplicação constante é a marca do crescimento exponencial.` },
      { p: `No modelo logístico, o crescimento da população (dN/dt) é máximo quando:`, op: [`N = K/2`, `N é muito pequeno`, `N = K`, `N ultrapassa K`], certa: 0, explica: `dN/dt = rN(1 − N/K) é uma parábola em N, com máximo no meio do caminho, N = K/2.` },
      { p: `Qual pirâmide ecológica NUNCA pode aparecer invertida?`, op: [`de números`, `de biomassa`, `de energia`, `todas podem`], certa: 2, explica: `A energia diminui a cada nível trófico (perdas como calor); números e biomassa podem se inverter.` },
      { p: `Por que as cadeias alimentares raramente têm mais de 4 ou 5 níveis?`, op: [`Porque os predadores de topo são maiores`, `Porque a energia disponível cai cerca de 10 vezes a cada nível`, `Porque os decompositores consomem o topo`, `Porque os produtores não fazem fotossíntese suficiente`], certa: 1, explica: `No 5º nível sobra cerca de 0,01% da energia dos produtores: pouco demais para sustentar uma população viável.` },
      { p: `Um fator que reduz a sobrevivência mais intensamente quando a população é densa é:`, op: [`uma geada forte`, `uma erupção vulcânica`, `uma doença contagiosa`, `uma enchente`], certa: 2, explica: `Doenças contagiosas se espalham melhor quando os indivíduos estão próximos: fator dependente da densidade. Os demais atingem a população independentemente do tamanho.` },
    ],
    resumo: [
      `Sem limites: N(t) = N₀·e<sup>rt</sup>, com tempo de duplicação constante t<sub>d</sub> = ln 2 / r (regra do 70).`,
      `Reprodução sazonal: N(t) = N₀·(1 + r)<sup>t</sup>.`,
      `Com limite: dN/dt = rN(1 − N/K), curva em S que tende à capacidade de suporte K.`,
      `O crescimento é máximo em N = K/2 e vale rK/4 (base do rendimento máximo sustentável).`,
      `Só cerca de 10% da energia passa de um nível trófico ao seguinte; o resto sai principalmente como calor.`,
      `Pirâmide de energia nunca se inverte; as de biomassa e de números podem.`,
    ],
    alem: {
      t: "Para ir além: predadores, presas e o caos",
      h: `<p>Populações não vivem isoladas. Nos anos 1920, Alfred Lotka e Vito Volterra acoplaram as equações de uma presa (N) e de um predador (P):</p>
        <div class="eq">${fr("dN", "dt")} = aN − bNP &nbsp;&nbsp;&nbsp; ${fr("dP", "dt")} = cNP − dP</div>
        <p>A presa cresce sozinha e é comida em proporção aos encontros (NP); o predador cresce comendo e morre sem comida. A solução são <b>ciclos</b>: muitas presas → os predadores aumentam → as presas caem → os predadores morrem de fome → as presas se recuperam, com o pico dos predadores atrasado em relação ao das presas, como nos dados de lebres e linces.</p>
        <p>Outra surpresa veio em 1976, quando Robert May estudou a versão discreta do modelo logístico, x<sub>n+1</sub> = R·x<sub>n</sub>(1 − x<sub>n</sub>). Para R pequeno a população se estabiliza; aumentando R, ela passa a oscilar entre 2, depois 4, 8 valores… e, acima de R ≈ 3,57, entra em <b>caos</b>: o comportamento parece aleatório e é extremamente sensível às condições iniciais, embora a regra seja totalmente determinística. Foi um dos trabalhos que fundaram a teoria do caos, e mostra que flutuações erráticas em populações reais não exigem, necessariamente, um ambiente imprevisível.</p>`,
    },
  };
})();
