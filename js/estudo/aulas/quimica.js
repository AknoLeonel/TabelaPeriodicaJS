/*
 * Aulas de Química (formato em js/estudo/aula.js).
 * Cada aula leva de "nunca vi isso" até "consigo resolver e explicar".
 */
(function () {
  "use strict";
  const E = window.LAB && window.LAB.estudo;
  if (!E) return;
  const A = (E.aulas.quimica = E.aulas.quimica || {});
  const fr = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;

  A.massa = {
    tempo: 12, nivel: "Ensino médio · base para toda a química quantitativa",
    objetivos: [
      "explicar o que é massa molar e por que ela liga átomos à balança;",
      "calcular a massa molar de qualquer fórmula, com parênteses e hidratos;",
      "achar a porcentagem de cada elemento num composto (composição centesimal);",
      "evitar os erros mais comuns com índices e parênteses.",
    ],
    secoes: [
      {
        t: "A ideia em uma frase",
        h: `<p>Átomos são leves demais para pesar um por um. Por isso a química conta átomos em <b>pacotes</b>: o <b>mol</b>, que tem 6,022×10²³ unidades. A <b>massa molar</b> é quanto pesa <b>um pacote</b> de uma substância, em gramas.</p>
          <div class="analogia"><b>Analogia:</b> numa loja, ninguém conta grãos de arroz; compra-se por quilo. A massa molar é a “etiqueta de preço por pacote” de cada substância: diz quantos gramas tem 1 mol dela.</div>
          <p>O número que aparece na tabela periódica para cada elemento (por exemplo, 12,01 para o carbono) vale ao mesmo tempo em duas unidades: <b>12,01 u</b> é a massa de <i>um átomo</i> e <b>12,01 g/mol</b> é a massa de <i>um mol de átomos</i>. Essa coincidência não é sorte: o mol foi definido justamente para que fosse assim.</p>`,
      },
      {
        t: "Como calcular, passo a passo",
        h: `<p>A massa molar de uma substância é a <b>soma das massas atômicas de todos os átomos da fórmula</b>. O roteiro é sempre o mesmo:</p>
          <ol><li><b>Conte os átomos</b> de cada elemento. O índice vale só para o símbolo (ou parêntese) logo antes dele.</li>
          <li><b>Multiplique</b> a quantidade de cada elemento pela massa atômica dele (tabela periódica).</li>
          <li><b>Some</b> tudo. A unidade é g/mol.</li></ol>
          <p>Na água, H₂O: 2 átomos de H e 1 de O. M = 2 × 1,008 + 1 × 16,00 = <b>18,02 g/mol</b>. Ou seja, 1 mol de moléculas de água (6,022×10²³ moléculas) pesa 18,02 g, um pouco menos que uma colher de sopa de água.</p>`,
      },
      {
        t: "Parênteses, colchetes e hidratos",
        h: `<p>Um índice depois de um parêntese <b>multiplica tudo que está dentro</b>. Em Ca(OH)₂ há 1 Ca, <b>2</b> O e <b>2</b> H, porque o grupo OH aparece duas vezes.</p>
          <p>Em Al₂(SO₄)₃: 2 Al, 3 × 1 = 3 S e 3 × 4 = 12 O.</p>
          <p>Nos <b>hidratos</b>, o ponto (·) significa “junto com”. CuSO₄·5H₂O é um cristal com 5 moléculas de água presas para cada CuSO₄: some a massa de CuSO₄ com <b>5 vezes</b> a massa da água (5 × 18,02).</p>
          <div class="nota">Por que isso importa? O sulfato de cobre azul do laboratório é o hidrato. Se você usar a massa molar do sal anidro (159,6 g/mol) em vez da do hidrato (249,7 g/mol), sua solução sai com 36% menos cobre do que deveria.</div>`,
      },
      {
        t: "Composição centesimal: quanto de cada elemento",
        h: `<p>Sabendo a massa molar, dá para dizer que <b>fração da massa</b> vem de cada elemento:</p>
          <div class="eq">% do elemento = ${fr("massa do elemento na fórmula", "massa molar")} × 100</div>
          <p>Na água: % H = 2,016 / 18,02 × 100 ≈ 11,2% e % O ≈ 88,8%. Ou seja, quase 89% da massa da água é oxigênio, mesmo havendo o dobro de átomos de hidrogênio. Átomos pesados “pesam mais na conta”.</p>
          <p>Esse cálculo é usado para saber quanto ferro há num minério, quanto nitrogênio há num adubo ou para descobrir a fórmula de uma substância desconhecida a partir de uma análise de laboratório.</p>`,
      },
    ],
    formulas: [
      { nome: "Massa molar", eq: `M = Σ (nᵢ × Aᵢ)`, simbolos: [["M", "massa molar da substância", "g/mol"], ["nᵢ", "quantos átomos do elemento i há na fórmula", "—"], ["Aᵢ", "massa atômica do elemento i (tabela periódica)", "g/mol"]], obs: "Σ quer dizer “some para todos os elementos da fórmula”." },
      { nome: "Composição centesimal", eq: `%X = ${fr("nₓ × Aₓ", "M")} × 100`, simbolos: [["%X", "porcentagem em massa do elemento X", "%"], ["nₓ × Aₓ", "massa do elemento X dentro de 1 mol da substância", "g/mol"]], obs: "As porcentagens de todos os elementos somam 100% (confira sempre)." },
    ],
    exemplos: [
      {
        t: "direto",
        enunciado: `Calcule a massa molar do gás carbônico, CO₂. (C = 12,01; O = 16,00)`,
        passos: [`Contar os átomos: 1 C e 2 O (o índice 2 vale só para o O).`, `Multiplicar: C → 1 × 12,01 = 12,01; O → 2 × 16,00 = 32,00.`, `Somar: 12,01 + 32,00 = 44,01.`],
        resposta: `M(CO₂) = <b>44,01 g/mol</b>`,
      },
      {
        t: "com parênteses",
        enunciado: `Calcule a massa molar do sulfato de alumínio, Al₂(SO₄)₃. (Al = 26,98; S = 32,07; O = 16,00)`,
        passos: [`Abrir o parêntese: o índice 3 multiplica S e O₄. Ficam 2 Al, 3 S e 12 O.`, `Al: 2 × 26,98 = 53,96. S: 3 × 32,07 = 96,21. O: 12 × 16,00 = 192,00.`, `Somar: 53,96 + 96,21 + 192,00 = 342,17.`],
        resposta: `M = <b>342,2 g/mol</b>`,
      },
      {
        t: "hidrato e porcentagem",
        enunciado: `Que porcentagem da massa do sulfato de cobre penta-hidratado, CuSO₄·5H₂O, é água? (Cu = 63,55; S = 32,07; O = 16,00; H = 1,008)`,
        passos: [`Massa molar do CuSO₄: 63,55 + 32,07 + 4 × 16,00 = 159,62 g/mol.`, `Massa de 5 H₂O: 5 × (2 × 1,008 + 16,00) = 5 × 18,02 = 90,08 g/mol.`, `Massa molar do hidrato: 159,62 + 90,08 = 249,70 g/mol.`, `% de água = 90,08 / 249,70 × 100 ≈ 36,1%.`],
        resposta: `<b>≈ 36%</b> da massa do cristal é água`,
      },
    ],
    erros: [
      { errado: `Em Ca(OH)₂, contar 1 O e 2 H.`, certo: `O índice depois do parêntese multiplica tudo dentro dele: 2 O e 2 H.`, porque: `O grupo OH (hidróxido) aparece duas vezes no composto.` },
      { errado: `Em H₂SO₄, aplicar o 4 também ao S.`, certo: `Sem parêntese, o índice vale só para o símbolo imediatamente antes: 2 H, 1 S, 4 O.` },
      { errado: `Esquecer a água de cristalização (usar 159,6 g/mol para CuSO₄·5H₂O).`, certo: `Some n × 18,02 g/mol da água: 249,7 g/mol.`, porque: `O cristal que você pesa na balança contém a água.` },
      { errado: `Usar o número atômico (Z) no lugar da massa atômica.`, certo: `Use a massa atômica (o número com casas decimais na tabela). Para o oxigênio: Z = 8, massa = 16,00.` },
    ],
    aplicacoes: [
      `<b>Farmácia</b>: a dose de um remédio é calculada em mol (quantas moléculas agem no corpo) e convertida para miligramas pela massa molar.`,
      `<b>Agricultura</b>: o teor de nitrogênio de um adubo (ureia tem 46,6% de N) sai da composição centesimal.`,
      `<b>Laboratório</b>: toda solução preparada começa com “quantos gramas eu peso?”, e a resposta passa pela massa molar.`,
      `<b>Mineração</b>: quanto ferro dá para extrair de uma tonelada de hematita (Fe₂O₃, 70% de ferro).`,
    ],
    teste: [
      { p: `Quantos átomos de oxigênio há em Mg(NO₃)₂?`, op: ["3", "5", "6", "2"], certa: 2, explica: `O índice 2 multiplica o NO₃ inteiro: 2 × 3 = 6 átomos de O.` },
      { p: `O que significa dizer que M(H₂O) = 18 g/mol?`, op: [`Uma molécula de água pesa 18 g.`, `1 mol de moléculas de água (6,0×10²³ moléculas) tem massa de 18 g.`, `A água tem 18 átomos.`, `18 g de água ocupam 1 L.`], certa: 1, explica: `A massa molar é a massa de um pacote de 6,022×10²³ partículas. Uma molécula só pesa 18 u ≈ 3×10⁻²³ g.` },
      { p: `No CH₄ (C = 12; H = 1), qual elemento responde pela maior parte da massa?`, op: [`Hidrogênio, porque há 4 átomos dele.`, `Carbono: 12 de 16 g/mol, ou 75%.`, `Os dois igualmente.`, `Não dá para saber sem a massa da amostra.`], certa: 1, explica: `Contar átomos não basta: 4 × 1 = 4 contra 1 × 12 = 12. O carbono é 75% da massa.` },
      { p: `Para preparar uma solução usando o sal hidratado em vez do anidro, você deve…`, op: [`usar a mesma massa, tanto faz.`, `pesar mais massa, porque parte dela é água.`, `pesar menos massa.`, `secar a água antes de dissolver.`], certa: 1, explica: `Cada mol do hidrato traz água “de carona”; para ter a mesma quantidade de sal, é preciso pesar mais.` },
    ],
    resumo: [
      `Massa molar = massa de 1 mol (6,022×10²³ partículas), em g/mol.`,
      `M = soma de (quantidade de átomos × massa atômica) para cada elemento.`,
      `Índice depois de parêntese multiplica tudo dentro; sem parêntese, só o símbolo anterior.`,
      `Hidratos: some n × 18,02 g/mol de água.`,
      `% em massa = massa do elemento na fórmula ÷ M × 100.`,
    ],
    alem: {
      t: "Para ir além: de onde vêm as casas decimais da tabela?",
      h: `<p>A massa atômica de um elemento é a <b>média ponderada</b> das massas dos seus isótopos, pela abundância natural de cada um. O cloro, por exemplo, é 75,8% de ³⁵Cl (34,969 u) e 24,2% de ³⁷Cl (36,966 u):</p>
        <div class="eq">A(Cl) = 0,758 × 34,969 + 0,242 × 36,966 ≈ 35,45 u</div>
        <p>Por isso nenhuma massa atômica é inteira (exceto o ¹²C, que é a referência: exatamente 12 u). Desde 2019 o mol é definido fixando o número de Avogadro em exatamente 6,02214076×10²³ mol⁻¹, e a relação “1 u ↔ 1 g/mol” passou a valer com erro menor que uma parte em um bilhão.</p>
        <p>Em espectrometria de massas, usa-se a <b>massa monoisotópica</b> (só o isótopo mais abundante de cada elemento), não a massa molar média: a molécula individual que voa no aparelho tem isótopos definidos.</p>`,
    },
  };
})();
