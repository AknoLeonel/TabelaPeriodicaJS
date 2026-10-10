/*
 * Aulas de Química avançada (formato em js/estudo/aula.js):
 * oxirredução, reações iônicas, eletroquímica, termoquímica, equilíbrio e cinética.
 * Cada aula acompanha a ferramenta de mesmo id (quimica-redox.js / quimica-termo.js).
 */
(function () {
  "use strict";
  const E = window.LAB && window.LAB.estudo;
  if (!E) return;
  const A = (E.aulas.quimica = E.aulas.quimica || {});
  const fr = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
  const AZUL = "#7fb2e5", VERM = "#e5646e", CINZA = "#9ba7b6";

  // perfil de energia "reagentes → estado de transição → produtos" (curva suave)
  const degrau = (x) => { const t = Math.min(1, Math.max(0, (x - 0.2) / 0.6)); return t * t * (3 - 2 * t); };
  const perfil = (R, P, h) => (x) => R + (P - R) * degrau(x) + h * Math.exp(-(((x - 0.5) / 0.11) ** 2));

  // =====================================================================
  // Nox e oxirredução
  // =====================================================================
  A.redox = {
    tempo: 18, nivel: "Ensino médio → faculdade",
    objetivos: [
      "calcular o número de oxidação (Nox) de qualquer elemento numa substância ou íon;",
      "identificar numa reação quem se oxida, quem se reduz, o agente oxidante e o agente redutor;",
      "balancear equações redox pelo método das semirreações (íon-elétron) em meio ácido e em meio básico;",
      "conferir um balanceamento por átomos, por carga e por elétrons trocados.",
    ],
    requisitos: [{ id: "eletrons", nome: "Distribuição eletrônica" }, { id: "balancear", nome: "Balanceamento" }],
    secoes: [
      {
        t: "A ideia em uma frase",
        h: `<p>Uma reação de <b>oxirredução</b> (redox) é uma <b>transferência de elétrons</b>: alguém perde elétrons (<b>oxida</b>) e alguém ganha exatamente esses elétrons (<b>reduz</b>). Uma coisa nunca acontece sem a outra, porque elétron não some nem aparece do nada.</p>
          <div class="analogia"><b>Analogia:</b> pense numa transferência bancária. O dinheiro que sai de uma conta é o mesmo que entra na outra. O <b>número de oxidação</b> é o “extrato” de cada átomo: mostra quem ficou com saldo maior (perdeu elétrons, Nox sobe) e quem ficou com saldo menor (ganhou elétrons, Nox desce).</div>
          <p>Ferrugem, pilha, bafômetro, fotossíntese, respiração celular, alvejante e a extração do ferro no alto-forno são todos redox. Dominar o Nox é a porta de entrada da eletroquímica.</p>`,
      },
      {
        t: "Número de oxidação: as regras e a ordem de prioridade",
        h: `<p>O <b>Nox</b> é a carga que o átomo teria se todas as suas ligações fossem iônicas, isto é, se o átomo mais eletronegativo de cada ligação ficasse com os dois elétrons. É uma contabilidade, não uma carga real (exceto em íons simples). As regras, em ordem de prioridade:</p>
          <ol><li><b>Substância simples</b> (Fe, O₂, Cl₂, P₄): Nox = 0.</li>
          <li><b>Íon monoatômico</b>: Nox = carga (Na⁺ = +1, S²⁻ = −2).</li>
          <li><b>Flúor</b> = −1 sempre. <b>Metais alcalinos</b> (grupo 1) = +1; <b>alcalinoterrosos</b> (grupo 2) = +2; alumínio = +3.</li>
          <li><b>Hidrogênio</b> = +1 com ametais; −1 nos hidretos metálicos (NaH, CaH₂).</li>
          <li><b>Oxigênio</b> = −2; −1 nos peróxidos (H₂O₂, Na₂O₂); +2 no OF₂.</li>
          <li><b>Soma</b> dos Nox = 0 numa substância neutra, ou = carga do íon.</li></ol>
          <p>O elemento “desconhecido” (geralmente o central: Mn, Cr, S, N, Cl) sai da última regra. No KMnO₄: (+1) + x + 4(−2) = 0 → <b>x = +7</b>. No íon SO₄²⁻: x + 4(−2) = −2 → <b>x = +6</b>. No NH₄⁺: x + 4(+1) = +1 → <b>x = −3</b>.</p>
          <div class="nota">Nox fracionário é possível e significa média: no Fe₃O₄, 3x = +8 → x = +8/3, porque o cristal tem um Fe²⁺ e dois Fe³⁺ por fórmula.</div>`,
      },
      {
        t: "O mesmo elemento, muitos Nox",
        h: `<p>Ametais do meio da tabela, como nitrogênio, enxofre e cloro, aparecem com Nox muito diferentes. O nitrogênio vai de −3 a +5, ou seja, de “cheio de elétrons” a “quase sem elétrons de valência”. Quanto <b>maior</b> o Nox, mais a espécie tende a <b>receber</b> elétrons (ser oxidante): o HNO₃ (N = +5) ataca até o cobre. Quanto <b>menor</b>, mais tende a <b>doar</b> (ser redutora): a amônia (N = −3) só pode se oxidar.</p>
          <p>Uma espécie com Nox intermediário (como o NO₂, N = +4, ou a água oxigenada, O = −1) pode agir dos dois jeitos, conforme o parceiro. Quando ela reage consigo mesma, oxidando e reduzindo ao mesmo tempo, a reação se chama <b>desproporcionamento</b>: 2 H₂O₂ → 2 H₂O + O₂ (O vai de −1 a −2 e a 0).</p>`,
        grafico: {
          op: { altura: 230, modo: "dados", rotY: "Nox do N" },
          cena: {
            x: [0.3, 9.7], y: [-4, 6.4],
            series: [
              { tipo: "barras", barras: [[1, -3], [2, -2], [3, -1], [4, 0], [5, 1], [6, 2], [7, 3], [8, 4], [9, 5]].map(([i, v]) => ({ a: i - 0.36, b: i + 0.36, v })) },
              ...[["NH₃", -3], ["N₂H₄", -2], ["NH₂OH", -1], ["N₂", 0], ["N₂O", 1], ["NO", 2], ["N₂O₃", 3], ["NO₂", 4], ["HNO₃", 5]].map(([t, v], i) => ({ tipo: "texto", x: i + 1, y: v >= 0 ? v + 0.75 : v - 0.65, texto: t })),
            ],
          },
          legenda: "A escada do nitrogênio: do NH₃ (−3, só pode oxidar) ao HNO₃ (+5, só pode reduzir).",
        },
      },
      {
        t: "Quem oxida, quem reduz, quem é agente",
        h: `<p>Compare o Nox de cada elemento antes e depois da reação:</p>
          <ul><li><b>Oxidação</b>: perda de elétrons → Nox <b>aumenta</b>.</li>
          <li><b>Redução</b>: ganho de elétrons → Nox <b>diminui</b> (reduz o número, daí o nome).</li>
          <li><b>Agente oxidante</b>: a espécie que <b>contém</b> o elemento que se reduz. Ela “provoca” a oxidação do outro roubando seus elétrons.</li>
          <li><b>Agente redutor</b>: a espécie que <b>contém</b> o elemento que se oxida.</li></ul>
          <p>Na pilha de Daniell, Zn + Cu²⁺ → Zn²⁺ + Cu: o Zn vai de 0 a +2 (oxida, é o redutor); o Cu vai de +2 a 0 (reduz; o Cu²⁺ é o oxidante). Cada Zn entrega 2 elétrons a um Cu²⁺.</p>
          <div class="destaque">O agente é sempre a <b>espécie inteira</b> do lado dos reagentes. No KMnO₄ + HCl, o oxidante é o KMnO₄ (ou o íon MnO₄⁻), não “o Mn”, e o redutor é o HCl (o cloro vai de −1 a 0).</div>`,
      },
      {
        t: "Balanceamento pelo método íon-elétron",
        h: `<p>Contar átomos “no olho” falha em redox complicadas. O método das <b>semirreações</b> separa a oxidação e a redução e garante que os elétrons perdidos sejam iguais aos ganhos.</p>
          <h5>Em meio ácido</h5>
          <ol><li>Escreva as duas semirreações (quem muda de Nox).</li>
          <li>Balanceie os átomos que não são O nem H.</li>
          <li>Balanceie O com <b>H₂O</b>; depois H com <b>H⁺</b>.</li>
          <li>Balanceie a carga com <b>elétrons</b> (do lado mais positivo).</li>
          <li>Multiplique as semirreações para igualar os elétrons, some e simplifique.</li></ol>
          <p>Exemplo: MnO₄⁻ → Mn²⁺ vira MnO₄⁻ + 8 H⁺ + 5 e⁻ → Mn²⁺ + 4 H₂O (carga: −1 + 8 − 5 = +2 dos dois lados).</p>
          <h5>Em meio básico</h5>
          <p>Faça tudo como em meio ácido e, no fim, <b>some OH⁻ dos dois lados</b> em número igual ao de H⁺. Cada H⁺ + OH⁻ vira H₂O; depois cancele as águas repetidas. Assim a equação final não tem H⁺, que praticamente não existe em solução básica.</p>
          <div class="nota">Confira sempre três coisas: átomos de cada elemento, carga total dos dois lados e elétrons perdidos = ganhos. A ferramenta “Reação redox” faz exatamente esses passos.</div>`,
      },
    ],
    formulas: [
      { nome: "Soma dos Nox", eq: `Σ (nᵢ × Noxᵢ) = carga da espécie`, simbolos: [["nᵢ", "quantos átomos do elemento i há na fórmula", "—"], ["Noxᵢ", "número de oxidação do elemento i", "—"]], obs: "Para substância neutra a soma é 0; para íon, é a carga (SO₄²⁻ → −2)." },
      { nome: "Conservação dos elétrons", eq: `elétrons perdidos (oxidação) = elétrons ganhos (redução)`, simbolos: [["e⁻ perdidos", "variação de Nox × nº de átomos que oxidam", "mol"], ["e⁻ ganhos", "variação de Nox × nº de átomos que reduzem", "mol"]], obs: "É a regra que fixa os coeficientes das espécies que mudam de Nox." },
    ],
    exemplos: [
      {
        t: "direto",
        enunciado: `Qual o Nox do crômio no dicromato de potássio, K₂Cr₂O₇?`,
        passos: [`Nox conhecidos: K = +1 (alcalino), O = −2 (não é peróxido).`, `Soma = 0: 2(+1) + 2x + 7(−2) = 0.`, `2 + 2x − 14 = 0 → 2x = 12 → x = +6.`],
        resposta: `Nox(Cr) = <b>+6</b>`,
      },
      {
        t: "meio ácido",
        enunciado: `Balanceie, em meio ácido: MnO₄⁻ + Fe²⁺ → Mn²⁺ + Fe³⁺. Indique oxidante e redutor.`,
        passos: [`Redução: Mn vai de +7 a +2. MnO₄⁻ + 8 H⁺ + 5 e⁻ → Mn²⁺ + 4 H₂O.`, `Oxidação: Fe vai de +2 a +3. Fe²⁺ → Fe³⁺ + e⁻.`, `Igualar elétrons: multiplique a oxidação por 5 (5 e⁻ de cada lado).`, `Somar: MnO₄⁻ + 8 H⁺ + 5 Fe²⁺ → Mn²⁺ + 5 Fe³⁺ + 4 H₂O.`, `Conferir carga: esquerda −1 + 8 + 10 = +17; direita +2 + 15 = +17.`],
        resposta: `<b>MnO₄⁻ + 8 H⁺ + 5 Fe²⁺ → Mn²⁺ + 5 Fe³⁺ + 4 H₂O</b>; oxidante: MnO₄⁻; redutor: Fe²⁺`,
      },
      {
        t: "meio básico (de prova)",
        enunciado: `Balanceie, em meio básico: MnO₄⁻ + I⁻ → MnO₂ + I₂.`,
        passos: [`Redução (Mn: +7 → +4), primeiro como se fosse ácido: MnO₄⁻ + 4 H⁺ + 3 e⁻ → MnO₂ + 2 H₂O.`, `Some 4 OH⁻ dos dois lados (4 H⁺ + 4 OH⁻ = 4 H₂O) e cancele: MnO₄⁻ + 2 H₂O + 3 e⁻ → MnO₂ + 4 OH⁻.`, `Oxidação (I: −1 → 0): 2 I⁻ → I₂ + 2 e⁻.`, `MMC de 3 e 2 é 6: redução × 2 e oxidação × 3.`, `Somar: 2 MnO₄⁻ + 6 I⁻ + 4 H₂O → 2 MnO₂ + 3 I₂ + 8 OH⁻.`, `Conferir: O 8 + 4 = 12 = 4 + 8; H 8 = 8; carga −2 − 6 = −8 = −8.`],
        resposta: `<b>2 MnO₄⁻ + 6 I⁻ + 4 H₂O → 2 MnO₂ + 3 I₂ + 8 OH⁻</b>`,
      },
    ],
    erros: [
      { errado: `Dizer que o agente oxidante é a espécie que se oxida.`, certo: `O agente oxidante é quem se <b>reduz</b>; ele oxida o outro.`, porque: `“Agente” é quem causa o efeito no parceiro, como um agente de limpeza que limpa outra coisa.` },
      { errado: `Usar O = −2 na água oxigenada, H₂O₂, e concluir que H = +2.`, certo: `Em peróxidos, O = −1. H continua +1.`, porque: `As regras têm prioridade: H = +1 vem antes do O = −2, e a soma tem de fechar.` },
      { errado: `Balancear só os átomos e esquecer a carga: MnO₄⁻ + Fe²⁺ + 8 H⁺ → Mn²⁺ + Fe³⁺ + 4 H₂O.`, certo: `Os elétrons trocados precisam bater: 5 Fe²⁺ para cada MnO₄⁻.`, porque: `Com 1 Fe²⁺ os átomos fecham, mas a carga fica +9 à esquerda e +5 à direita.` },
      { errado: `Colocar H⁺ na equação final de uma reação em meio básico.`, certo: `Neutralize cada H⁺ com OH⁻ (somando OH⁻ dos dois lados) e simplifique a água.`, porque: `Em pH alto a concentração de H⁺ é desprezível; a espécie que reage é o OH⁻ ou a água.` },
    ],
    aplicacoes: [
      `<b>Bafômetro químico</b>: o dicromato (Cr = +6, laranja) oxida o etanol do hálito e vira Cr³⁺ (verde). A mudança de cor mede o álcool.`,
      `<b>Siderurgia</b>: no alto-forno, o CO reduz o Fe₂O₃ (Fe = +3) a ferro metálico (Fe = 0), enquanto o C se oxida a CO₂.`,
      `<b>Saneamento</b>: o cloro e o hipoclorito (Cl = +1) oxidam a matéria orgânica e a membrana de micro-organismos na água tratada.`,
      `<b>Titulação redox</b>: a permanganometria mede ferro em comprimidos e água oxigenada em farmácias usando a reação de MnO₄⁻ em meio ácido.`,
      `<b>Biologia</b>: na respiração celular, a glicose (C ≈ 0) é oxidada a CO₂ (C = +4) e o O₂ é reduzido a água; a energia liberada vira ATP.`,
    ],
    teste: [
      { p: `Na reação 2 Na + Cl₂ → 2 NaCl, qual é o agente oxidante?`, op: [`Na`, `Cl₂`, `NaCl`, `Não há oxidante: é uma síntese.`], certa: 1, explica: `O cloro vai de 0 a −1 (reduz), então o Cl₂ é o oxidante. Síntese e redox não se excluem: muitas sínteses são redox.` },
      { p: `Qual o Nox do enxofre no tiossulfato, S₂O₃²⁻?`, op: [`+4`, `+6`, `−2`, `+2`], certa: 3, explica: `2x + 3(−2) = −2 → 2x = 4 → x = +2 (valor médio dos dois enxofres).` },
      { p: `Uma espécie com o elemento no Nox máximo possível (como Mn +7 no MnO₄⁻) só pode agir como…`, op: [`oxidante, porque só pode ganhar elétrons.`, `redutor, porque tem muitos elétrons.`, `oxidante ou redutor, conforme o parceiro.`, `espectador, porque já está estável.`], certa: 0, explica: `No Nox máximo o elemento não tem mais elétrons de valência para perder; só pode descer de Nox, ou seja, reduzir-se, o que faz dele oxidante.` },
      { p: `Ao balancear uma semirreação em meio básico, o que se faz com os H⁺?`, op: [`Trocam-se por H₂.`, `Simplesmente apagam-se.`, `Somam-se OH⁻ em igual número dos dois lados, formando água.`, `Multiplica-se a equação por −1.`], certa: 2, explica: `Somar o mesmo OH⁻ dos dois lados não altera o balanço; H⁺ + OH⁻ vira H₂O e a equação passa a mostrar o meio real.` },
      { p: `Em 2 H₂O₂ → 2 H₂O + O₂, o oxigênio…`, op: [`só se oxida.`, `só se reduz.`, `não muda de Nox.`, `se oxida e se reduz ao mesmo tempo.`], certa: 3, explica: `Parte do O vai de −1 a 0 (O₂) e parte vai de −1 a −2 (H₂O): é um desproporcionamento.` },
    ],
    resumo: [
      `Redox = transferência de elétrons: oxidação (perde e⁻, Nox sobe) e redução (ganha e⁻, Nox desce) sempre juntas.`,
      `Regras do Nox: simples = 0; íon simples = carga; F = −1; H = +1 (−1 em hidreto); O = −2 (−1 em peróxido); soma = carga.`,
      `Agente oxidante é quem se reduz; agente redutor é quem se oxida.`,
      `Íon-elétron (ácido): átomos → O com H₂O → H com H⁺ → carga com e⁻ → igualar e⁻ e somar.`,
      `Meio básico: some OH⁻ para neutralizar os H⁺ e cancele a água.`,
      `Confira átomos, carga e elétrons antes de dar a resposta.`,
    ],
    alem: {
      t: "Para ir além: Nox, eletronegatividade e o diagrama de Latimer",
      h: `<p>O Nox é uma convenção baseada na <b>eletronegatividade</b>: em cada ligação, os elétrons vão inteiros para o átomo mais eletronegativo; em ligações entre átomos iguais, dividem-se meio a meio. Por isso o Nox de um carbono orgânico depende dos vizinhos: no CH₄ é −4, no CH₃OH é −2, no HCHO é 0, no HCOOH é +2 e no CO₂ é +4. Essa “escada” é a sequência de oxidação de um álcool até gás carbônico que o fígado e os catalisadores industriais percorrem.</p>
        <p>Na química inorgânica, os potenciais entre estados de oxidação de um elemento são resumidos no <b>diagrama de Latimer</b>, uma linha com as espécies em ordem decrescente de Nox e o E° de cada passo. Se o E° à direita de uma espécie for maior que o da esquerda, ela é instável e se desproporciona (é o caso do Cu⁺ em água: 2 Cu⁺ → Cu + Cu²⁺). Os diagramas de Frost, que plotam n·E° contra o Nox, mostram a mesma informação de forma gráfica: espécies “em vale” são estáveis; “em morro”, tendem a se desproporcionar.</p>`,
    },
  };

  // =====================================================================
  // Reações em solução aquosa e equações iônicas
  // =====================================================================
  A.ionica = {
    tempo: 16, nivel: "Ensino médio → faculdade",
    objetivos: [
      "diferenciar dissociação iônica de ionização e eletrólitos fortes de fracos;",
      "prever, pelas regras de solubilidade, se uma mistura de soluções forma precipitado;",
      "reconhecer as três forças motrizes das reações de dupla troca: precipitado, gás e água (ou eletrólito fraco);",
      "escrever as equações molecular, iônica completa e iônica líquida, identificando os íons espectadores;",
      "calcular a massa de precipitado formada, com reagente limitante.",
    ],
    requisitos: [{ id: "solucoes", nome: "Soluções e concentração" }, { id: "balancear", nome: "Balanceamento" }, { id: "estequiometria", nome: "Estequiometria" }],
    secoes: [
      {
        t: "A ideia em uma frase",
        h: `<p>Na água, muitas substâncias não ficam como “moléculas inteiras”: elas se separam em <b>íons</b> soltos. Uma reação em solução só acontece de verdade quando alguns desses íons <b>saem de circulação</b>: viram um sólido que cai (precipitado), um gás que escapa ou uma molécula pouco ionizada, como a água.</p>
          <div class="analogia"><b>Analogia:</b> imagine um salão de baile cheio de pares que se soltaram e circulam. Juntar duas soluções é abrir a porta entre dois salões. Se dois dançarinos de salões diferentes se agarram e não se soltam mais (formam um sólido ou uma molécula estável), houve reação. Se todos continuam circulando soltos, só houve mistura.</div>
          <p>Por isso misturar NaCl com KNO₃ não dá reação nenhuma (todos os íons continuam soltos), mas misturar AgNO₃ com NaCl produz na hora um pó branco de AgCl.</p>`,
      },
      {
        t: "Dissociação, ionização e eletrólitos",
        h: `<p>Há dois jeitos de uma substância virar íons em água:</p>
          <ul><li><b>Dissociação iônica</b>: compostos iônicos (sais, hidróxidos metálicos) <b>já são feitos de íons</b>; a água só os separa e os envolve (solvatação). NaCl(s) → Na⁺(aq) + Cl⁻(aq).</li>
          <li><b>Ionização</b>: compostos moleculares (ácidos) <b>formam íons</b> ao reagir com a água. HCl(g) + H₂O → H₃O⁺(aq) + Cl⁻(aq).</li></ul>
          <p>Quanto à extensão, os <b>eletrólitos fortes</b> se separam quase 100%: sais solúveis, ácidos fortes (HCl, HBr, HI, HNO₃, H₂SO₄, HClO₄) e bases fortes (hidróxidos do grupo 1, Ca, Sr, Ba). Os <b>eletrólitos fracos</b> se ionizam pouco: ácido acético (cerca de 1% numa solução 0,1 mol/L), amônia, ácido carbônico. Os <b>não eletrólitos</b> (açúcar, etanol) dissolvem sem formar íons.</p>
          <div class="nota">Regra de escrita: na equação iônica, só se escrevem separados os <b>eletrólitos fortes dissolvidos</b>. Sólidos, gases, água e eletrólitos fracos ficam inteiros, porque é assim que existem na solução.</div>`,
      },
      {
        t: "Regras de solubilidade",
        h: `<p>Para prever um precipitado, basta saber quais combinações de íons são insolúveis. As regras práticas (a 25 °C):</p>
          <div class="tab-rolar"><table class="tb"><thead><tr><th>Íons</th><th>Regra</th><th>Exceções</th></tr></thead><tbody>
          <tr><td>Grupo 1 (Li⁺, Na⁺, K⁺…) e NH₄⁺</td><td>sempre solúveis</td><td>—</td></tr>
          <tr><td>NO₃⁻, CH₃COO⁻, ClO₄⁻</td><td>solúveis</td><td>—</td></tr>
          <tr><td>Cl⁻, Br⁻, I⁻</td><td>solúveis</td><td>Ag⁺, Pb²⁺, Hg₂²⁺</td></tr>
          <tr><td>SO₄²⁻</td><td>solúveis</td><td>Ca²⁺ (pouco), Sr²⁺, Ba²⁺, Pb²⁺</td></tr>
          <tr><td>CO₃²⁻, PO₄³⁻, S²⁻</td><td>insolúveis</td><td>grupo 1 e NH₄⁺</td></tr>
          <tr><td>OH⁻</td><td>insolúveis</td><td>grupo 1; Ca, Sr, Ba pouco solúveis</td></tr>
          </tbody></table></div>
          <p>Método: troque os parceiros (dupla troca) e verifique cada novo par na tabela. Em Pb(NO₃)₂ + KI, os novos pares são PbI₂ (iodeto de chumbo: exceção, insolúvel, amarelo) e KNO₃ (solúvel). Logo forma-se PbI₂(s).</p>`,
      },
      {
        t: "As três forças motrizes e a equação iônica líquida",
        h: `<p>Uma dupla troca em solução acontece quando se forma pelo menos um destes:</p>
          <ol><li><b>Precipitado</b>: Ag⁺ + Cl⁻ → AgCl(s).</li>
          <li><b>Gás</b>: carbonatos com ácido dão CO₂: CO₃²⁻ + 2 H⁺ → H₂O + CO₂(g). Sulfetos dão H₂S; sais de amônio com base forte dão NH₃.</li>
          <li><b>Água ou eletrólito fraco</b>: a neutralização ácido forte + base forte é sempre H⁺ + OH⁻ → H₂O.</li></ol>
          <p>Escreve-se a reação em três níveis. Para AgNO₃ + NaCl:</p>
          <div class="eq">Molecular: AgNO₃(aq) + NaCl(aq) → AgCl(s) + NaNO₃(aq)</div>
          <div class="eq">Iônica completa: Ag⁺ + NO₃⁻ + Na⁺ + Cl⁻ → AgCl(s) + Na⁺ + NO₃⁻</div>
          <div class="eq">Iônica líquida: Ag⁺(aq) + Cl⁻(aq) → AgCl(s)</div>
          <p>Na⁺ e NO₃⁻ aparecem iguais dos dois lados: são <b>íons espectadores</b>, assistem sem participar. A equação líquida mostra só o que muda e vale para <b>qualquer</b> par de sais solúveis de prata e de cloreto.</p>`,
      },
      {
        t: "Vendo os íons sumirem: condutividade",
        h: `<p>Íons livres conduzem corrente elétrica; por isso a condutividade de uma solução “conta” os íons dissolvidos. Uma experiência clássica: goteja-se ácido sulfúrico numa solução de hidróxido de bário com um condutivímetro mergulhado.</p>
          <div class="eq">Ba²⁺ + 2 OH⁻ + 2 H⁺ + SO₄²⁻ → BaSO₄(s) + 2 H₂O</div>
          <p>Aqui <b>nenhum íon é espectador</b>: todos saem de circulação, uns como precipitado, outros como água. A condutividade cai até quase zero no ponto de equivalência (na figura, 50 mL de Ba(OH)₂ 0,10 mol/L precisam de 20 mL de H₂SO₄ 0,25 mol/L, pois 5,0 mmol de base reagem com 5,0 mmol de ácido). Depois disso, o ácido em excesso volta a pôr H⁺ e SO₄²⁻ na solução e a condutividade sobe. Se fosse HCl, o Cl⁻ ficaria como espectador e o mínimo não chegaria perto de zero.</p>`,
        grafico: {
          op: { altura: 220, modo: "dados", rotX: "H₂SO₄ adicionado (mL)", rotY: "condutividade relativa" },
          cena: {
            x: [0, 40], y: [0, 105],
            series: [
              { tipo: "linha", pts: [[0, 100], [5, 75.5], [10, 51], [15, 26.5], [20, 2], [25, 22], [30, 40], [35, 56], [40, 70]], rotulo: "condutividade" },
              { tipo: "vline", v: 20, tracejado: true, cor: CINZA, rotulo: "equivalência" },
            ],
          },
          legenda: "Titulação de Ba(OH)₂ com H₂SO₄: todos os íons saem da solução e a condutividade quase zera no ponto de equivalência.",
        },
      },
    ],
    formulas: [
      { nome: "Equação iônica líquida", eq: `iônica completa − íons espectadores`, simbolos: [["espectador", "íon que aparece igual nos dois lados", "—"]], obs: "Escreva separados só os eletrólitos fortes em solução; sólidos, gases, água e ácidos fracos ficam inteiros." },
      { nome: "Quantidade de cada íon", eq: `n(íon) = ν × C × V`, simbolos: [["ν", "quantos íons daquele tipo por fórmula (2 Cl⁻ no CaCl₂)", "—"], ["C", "concentração do sal", "mol/L"], ["V", "volume da solução", "L"]], obs: "Use para achar o reagente limitante de uma precipitação." },
    ],
    exemplos: [
      {
        t: "direto",
        enunciado: `Mistura-se BaCl₂(aq) com Na₂SO₄(aq). Há reação? Escreva a equação iônica líquida.`,
        passos: [`Trocar os parceiros: BaSO₄ e NaCl.`, `Tabela: sulfato de bário é exceção (insolúvel); NaCl é solúvel.`, `Iônica completa: Ba²⁺ + 2 Cl⁻ + 2 Na⁺ + SO₄²⁻ → BaSO₄(s) + 2 Na⁺ + 2 Cl⁻.`, `Cancelar os espectadores Na⁺ e Cl⁻.`],
        resposta: `Sim: <b>Ba²⁺(aq) + SO₄²⁻(aq) → BaSO₄(s)</b>`,
      },
      {
        t: "formação de gás",
        enunciado: `Escreva as equações molecular e iônica líquida de carbonato de sódio com ácido clorídrico em excesso.`,
        passos: [`Dupla troca: Na₂CO₃ + 2 HCl → 2 NaCl + H₂CO₃.`, `O H₂CO₃ é instável e se decompõe: H₂CO₃ → H₂O + CO₂(g).`, `Molecular: Na₂CO₃(aq) + 2 HCl(aq) → 2 NaCl(aq) + H₂O(l) + CO₂(g).`, `Iônica completa: 2 Na⁺ + CO₃²⁻ + 2 H⁺ + 2 Cl⁻ → 2 Na⁺ + 2 Cl⁻ + H₂O + CO₂. Espectadores: Na⁺ e Cl⁻.`],
        resposta: `<b>CO₃²⁻(aq) + 2 H⁺(aq) → H₂O(l) + CO₂(g)</b>`,
      },
      {
        t: "massa de precipitado (de prova)",
        enunciado: `Misturam-se 50,0 mL de Pb(NO₃)₂ 0,100 mol/L com 50,0 mL de KI 0,300 mol/L. Que massa de PbI₂ se forma? (Pb = 207,2; I = 126,9)`,
        passos: [`Equação líquida: Pb²⁺ + 2 I⁻ → PbI₂(s).`, `n(Pb²⁺) = 0,100 mol/L × 0,0500 L = 5,00×10⁻³ mol; n(I⁻) = 0,300 × 0,0500 = 1,50×10⁻² mol.`, `Para 5,00×10⁻³ mol de Pb²⁺ são necessários 1,00×10⁻² mol de I⁻: há sobra de I⁻, logo o Pb²⁺ é o limitante.`, `n(PbI₂) = 5,00×10⁻³ mol; M(PbI₂) = 207,2 + 2 × 126,9 = 461,0 g/mol.`, `m = 5,00×10⁻³ mol × 461,0 g/mol = 2,305 g.`],
        resposta: `<b>≈ 2,31 g</b> de PbI₂ (sobram 5,00×10⁻³ mol de I⁻ em 100 mL, 0,0500 mol/L)`,
      },
    ],
    erros: [
      { errado: `Escrever AgCl(s) separado em Ag⁺ + Cl⁻ na equação iônica.`, certo: `Precipitados ficam inteiros, com (s).`, porque: `Um sólido insolúvel não está dissociado na solução; separá-lo esconde justamente a reação.` },
      { errado: `Escrever o ácido acético como H⁺ + CH₃COO⁻ na equação iônica.`, certo: `Ácido fraco fica molecular: CH₃COOH + OH⁻ → CH₃COO⁻ + H₂O.`, porque: `Só cerca de 1% dele está ionizado; a espécie que reage de fato é a molécula.` },
      { errado: `Achar que toda mistura de dois sais dá reação.`, certo: `Se nenhum produto for insolúvel, gás ou eletrólito fraco, todos os íons continuam livres: não há reação.`, porque: `NaCl + KNO₃ dá só uma solução com Na⁺, K⁺, Cl⁻ e NO₃⁻.` },
      { errado: `Cancelar espécies diferentes que “parecem iguais”, como Cl⁻ de um lado e Cl₂ do outro.`, certo: `Só se cancela a mesma espécie, com a mesma carga e o mesmo estado físico.`, porque: `Cl⁻ e Cl₂ têm Nox diferentes: se um vira o outro, isso é parte da reação.` },
    ],
    aplicacoes: [
      `<b>Saúde</b>: o sulfato de bário é usado como contraste em radiografias justamente por ser insolúvel; o íon Ba²⁺ livre seria tóxico.`,
      `<b>Tratamento de água</b>: sulfato de alumínio e cal formam Al(OH)₃, um precipitado gelatinoso que arrasta a sujeira (floculação).`,
      `<b>Antiácidos</b>: o bicarbonato reage com o HCl do estômago: HCO₃⁻ + H⁺ → H₂O + CO₂ (daí o arroto).`,
      `<b>Química analítica</b>: a análise gravimétrica pesa precipitados (AgCl, BaSO₄) para medir cloreto ou sulfato numa amostra.`,
      `<b>Cavernas e encanamentos</b>: o CaCO₃ precipita quando o CO₂ escapa da água dura, formando estalactites e incrustações em chuveiros.`,
    ],
    teste: [
      { p: `Qual destas misturas de soluções NÃO produz reação?`, op: [`AgNO₃ + KBr`, `HCl + NaOH`, `KNO₃ + NaCl`, `Na₂CO₃ + HNO₃`], certa: 2, explica: `KCl e NaNO₃ são solúveis e nada de gás ou água se forma; os quatro íons apenas se misturam.` },
      { p: `Na reação HCl(aq) + NaOH(aq), a equação iônica líquida é…`, op: [`H⁺ + OH⁻ → H₂O`, `Na⁺ + Cl⁻ → NaCl`, `HCl + NaOH → NaCl + H₂O`, `H⁺ + Cl⁻ → HCl`], certa: 0, explica: `Na⁺ e Cl⁻ são espectadores; o que muda é só o encontro de H⁺ com OH⁻.` },
      { p: `Por que um ácido fraco deve ser escrito na forma molecular na equação iônica?`, op: [`Porque ácidos nunca formam íons.`, `Porque é quase todo não ionizado em solução, e é a molécula que reage.`, `Porque é um gás.`, `Por convenção sem motivo químico.`], certa: 1, explica: `A equação iônica mostra as espécies como existem na solução; um ácido fraco está, na maior parte, como molécula.` },
      { p: `A condutividade de Ba(OH)₂ titulado com H₂SO₄ quase zera na equivalência porque…`, op: [`a água destrói os íons.`, `o sulfato de bário conduz pouca corrente.`, `os íons espectadores se cancelam.`, `todos os íons viram BaSO₄(s) ou H₂O, sem espectadores.`], certa: 3, explica: `Ba²⁺ e SO₄²⁻ precipitam e H⁺ e OH⁻ formam água; não sobra quase nenhum íon livre.` },
      { p: `Ao misturar soluções de CuSO₄ e NaOH, forma-se…`, op: [`um gás azul.`, `Cu(OH)₂(s), azul, porque hidróxidos de metais de transição são insolúveis.`, `nada, pois sulfatos são solúveis.`, `Na₂SO₄(s), branco.`], certa: 1, explica: `Cu²⁺ + 2 OH⁻ → Cu(OH)₂(s). O Na₂SO₄ é solúvel e fica dissolvido.` },
    ],
    resumo: [
      `Dissociação: compostos iônicos se separam; ionização: moléculas formam íons ao reagir com a água.`,
      `Eletrólitos fortes (sais solúveis, ácidos e bases fortes) se escrevem separados; o resto fica inteiro.`,
      `Há reação se se forma precipitado, gás ou água (eletrólito fraco).`,
      `Solúveis: grupo 1, NH₄⁺, nitratos, acetatos; exceções clássicas: AgCl, PbI₂, BaSO₄.`,
      `Equação iônica líquida = iônica completa sem os íons espectadores.`,
      `Em precipitação, ache o limitante pelos mols de cada íon (n = ν·C·V).`,
    ],
    alem: {
      t: "Para ir além: por que uns sais dissolvem e outros não?",
      h: `<p>Dissolver um sal é um cabo de guerra entre a <b>energia de rede</b> (que mantém os íons no cristal) e a <b>energia de hidratação</b> (liberada quando a água envolve cada íon), mais a variação de entropia. Íons pequenos e de carga alta, como Mg²⁺ e PO₄³⁻, têm redes muito fortes; quando os dois parceiros são “duros” e de carga alta, a rede costuma vencer e o sal é insolúvel. Por isso fosfatos e carbonatos de metais 2+ e 3+ são pouco solúveis, enquanto sais de íons grandes e monovalentes (K⁺, NO₃⁻) dissolvem bem.</p>
        <p>As “regras de solubilidade” são um resumo qualitativo do <b>produto de solubilidade</b>, K<sub>ps</sub>, que você verá na aula de equilíbrio. “Insolúvel” significa apenas solubilidade muito baixa: no AgCl, K<sub>ps</sub> = 1,8×10⁻¹⁰, o que dá cerca de 1,3×10⁻⁵ mol/L, ou 1,9 mg por litro. Para a química analítica isso já é pouco o bastante para pesar o precipitado com precisão.</p>`,
    },
  };

  // =====================================================================
  // Eletroquímica
  // =====================================================================
  A.eletroq = {
    tempo: 20, nivel: "Ensino médio → faculdade",
    objetivos: [
      "montar uma pilha a partir de dois potenciais-padrão: cátodo, ânodo, polos, sentido dos elétrons e reação global;",
      "calcular a ddp padrão e decidir a espontaneidade por E° e por ΔG° = −nFE°;",
      "usar a equação de Nernst para pilhas fora das condições-padrão;",
      "explicar a eletrólise e calcular massa depositada ou tempo pelas leis de Faraday.",
    ],
    requisitos: [{ id: "redox", nome: "Nox e oxirredução" }, { id: "termo", nome: "Termoquímica" }],
    secoes: [
      {
        t: "A ideia em uma frase",
        h: `<p>Eletroquímica é <b>redox com os parceiros separados</b>. Se a oxidação acontece num recipiente e a redução em outro, os elétrons são obrigados a passar por um fio, e isso é corrente elétrica. Quando a reação é espontânea, temos uma <b>pilha</b> (química → eletricidade); quando forçamos uma reação não espontânea com uma fonte, temos uma <b>eletrólise</b> (eletricidade → química).</p>
          <div class="analogia"><b>Analogia:</b> a pilha é uma cachoeira: a água (os elétrons) desce sozinha e você aproveita a queda para girar uma roda. A eletrólise é a bomba d’água: você gasta energia para levar a água morro acima.</div>
          <p>Se você mergulha zinco numa solução de Cu²⁺, o cobre deposita no zinco e a solução esquenta: a energia virou calor. Separando os dois numa pilha, a mesma energia sai como trabalho elétrico.</p>`,
      },
      {
        t: "Anatomia de uma pilha: a pilha de Daniell",
        h: `<p>Na pilha de Daniell, uma placa de zinco fica em ZnSO₄(aq) e uma placa de cobre em CuSO₄(aq), ligadas por um fio e por uma <b>ponte salina</b>.</p>
          <ul><li><b>Ânodo</b> = onde ocorre a <b>oxidação</b>: Zn → Zn²⁺ + 2 e⁻. A placa de zinco é corroída (perde massa). Na pilha é o <b>polo negativo</b>, porque é de onde saem os elétrons.</li>
          <li><b>Cátodo</b> = onde ocorre a <b>redução</b>: Cu²⁺ + 2 e⁻ → Cu. A placa de cobre engorda e a solução azul descora. É o <b>polo positivo</b>.</li>
          <li>Os <b>elétrons</b> andam pelo fio, do ânodo para o cátodo. Os <b>íons</b> andam pela solução e pela ponte salina.</li>
          <li>A <b>ponte salina</b> (KNO₃ ou KCl em gel) fecha o circuito e mantém cada lado neutro: ânions migram para o ânodo, onde sobra carga positiva (Zn²⁺ novos), e cátions migram para o cátodo, onde falta carga positiva. Sem ela, a corrente para em instantes.</li></ul>
          <p>Notação de célula: <b>Zn | Zn²⁺(1 mol/L) || Cu²⁺(1 mol/L) | Cu</b> (ânodo à esquerda, “||” é a ponte salina).</p>
          <div class="destaque">Memorize pelas vogais e consoantes: <b>Â</b>nodo–<b>O</b>xidação (vogais), <b>C</b>átodo–<b>R</b>edução (consoantes).</div>`,
      },
      {
        t: "Potencial-padrão e tabela de potenciais",
        h: `<p>Cada semirreação tem um <b>potencial-padrão de redução</b>, E°, medido contra o eletrodo-padrão de hidrogênio (2 H⁺ + 2 e⁻ → H₂, E° = 0 por definição) a 25 °C, 1 mol/L e 1 atm. Quanto <b>maior</b> o E°, maior a tendência de a espécie se reduzir (melhor oxidante).</p>
          <div class="tab-rolar"><table class="tb"><thead><tr><th>Semirreação de redução</th><th>E° (V)</th></tr></thead><tbody>
          <tr><td>F₂ + 2 e⁻ → 2 F⁻</td><td>+2,87</td></tr>
          <tr><td>Cl₂ + 2 e⁻ → 2 Cl⁻</td><td>+1,36</td></tr>
          <tr><td>Ag⁺ + e⁻ → Ag</td><td>+0,80</td></tr>
          <tr><td>Cu²⁺ + 2 e⁻ → Cu</td><td>+0,34</td></tr>
          <tr><td>2 H⁺ + 2 e⁻ → H₂</td><td>0,00</td></tr>
          <tr><td>Fe²⁺ + 2 e⁻ → Fe</td><td>−0,44</td></tr>
          <tr><td>Zn²⁺ + 2 e⁻ → Zn</td><td>−0,76</td></tr>
          <tr><td>Mg²⁺ + 2 e⁻ → Mg</td><td>−2,37</td></tr>
          <tr><td>Li⁺ + e⁻ → Li</td><td>−3,04</td></tr>
          </tbody></table></div>
          <p>Numa pilha, <b>o de maior E° vira cátodo</b> (reduz) e o outro vira ânodo (é obrigado a oxidar). A força eletromotriz padrão é</p>
          <div class="eq">ΔE° = E°<sub>cátodo</sub> − E°<sub>ânodo</sub></div>
          <p>Daniell: ΔE° = 0,34 − (−0,76) = <b>1,10 V</b>. Atenção: o E° <b>não se multiplica</b> quando se multiplica a semirreação; ele é intensivo, como a altura de uma cachoeira, que não muda se mais água cair.</p>`,
      },
      {
        t: "Espontaneidade, ΔG e a equação de Nernst",
        h: `<p>A ddp mede o “empurrão” por elétron; multiplicando pela carga transportada temos a energia disponível para trabalho:</p>
          <div class="eq">ΔG° = −n·F·ΔE°</div>
          <p>com n = mols de elétrons trocados na equação balanceada e F = 96 485 C/mol (constante de Faraday). ΔE° &gt; 0 ⇔ ΔG° &lt; 0 ⇔ reação espontânea. Para Daniell: ΔG° = −2 × 96 485 C/mol × 1,10 V = −2,12×10⁵ J/mol ≈ <b>−212 kJ/mol</b>.</p>
          <p>Fora de 1 mol/L, o potencial muda. A <b>equação de Nernst</b> (a 25 °C) corrige pelo quociente de reação Q:</p>
          <div class="eq">E = E° − ${fr("0,0592", "n")} · log Q</div>
          <p>Conforme a pilha funciona, os produtos se acumulam, Q cresce e E cai. Quando E chega a zero, Q = K: a pilha “morreu” porque atingiu o equilíbrio. Na Daniell, log K = 2 × 1,10 / 0,0592 ≈ 37, ou seja, K ≈ 10³⁷: a reação vai praticamente até o fim.</p>`,
        grafico: {
          op: { altura: 220, rotX: "log Q", rotY: "E (V)" },
          cena: {
            x: [-4, 42], y: [-0.15, 1.3],
            series: [
              { tipo: "funcao", f: (q) => 1.10 - (0.0592 / 2) * q, rotulo: "E = 1,10 − 0,0296·log Q" },
              { tipo: "marca", x: 0, y: 1.10, rotulo: "Q = 1: E = E°" },
              { tipo: "marca", x: 37.16, y: 0, cor: VERM, rotulo: "Q = K: E = 0" },
            ],
          },
          legenda: "Pilha de Daniell: a ddp cai 29,6 mV a cada fator 10 em Q e zera no equilíbrio (log K ≈ 37).",
        },
      },
      {
        t: "Eletrólise e leis de Faraday",
        h: `<p>Na <b>eletrólise</b> uma fonte externa força uma reação com ΔE° &lt; 0. Os nomes continuam ligados ao processo: no <b>cátodo</b> há redução, no <b>ânodo</b> há oxidação; mas agora o cátodo é o polo <b>negativo</b> (ligado ao − da fonte, que empurra elétrons para ele) e o ânodo, o positivo.</p>
          <ul><li><b>Ígnea</b> (sal fundido, sem água): NaCl(l) dá Na no cátodo e Cl₂ no ânodo. É assim que se produzem sódio, magnésio e alumínio.</li>
          <li><b>Aquosa</b>: a água compete. Cátions de metais muito ativos (grupo 1, 2, Al³⁺) não se reduzem; no lugar deles a água vira H₂ + OH⁻. Ânions oxigenados (SO₄²⁻, NO₃⁻) não se oxidam; no lugar deles a água vira O₂ + H⁺. Já os haletos (Cl⁻, Br⁻, I⁻) se oxidam antes da água na prática. Por isso a salmoura dá H₂, Cl₂ e NaOH.</li></ul>
          <p>A quantidade de produto segue as <b>leis de Faraday</b>: a massa é proporcional à carga que passou. Carga = corrente × tempo (Q = i·t); 1 mol de elétrons tem 96 485 C. Para depositar um metal Mⁿ⁺ são precisos n mols de elétrons por mol de metal:</p>
          <div class="eq">m = ${fr("M · i · t", "n · F")}</div>
          <p>Ex.: 2,00 A durante 30,0 min sobre Cu²⁺: Q = 2,00 A × 1800 s = 3600 C → 3600 / 96 485 = 0,0373 mol de e⁻ → 0,0187 mol de Cu → <b>1,19 g</b> de cobre.</p>`,
      },
    ],
    formulas: [
      { nome: "Força eletromotriz padrão", eq: `ΔE° = E°<sub>cátodo</sub> − E°<sub>ânodo</sub>`, simbolos: [["E°", "potencial-padrão de redução (tabela)", "V"]], obs: "Use os dois valores como potenciais de REDUÇÃO, sem trocar sinal à mão, e não multiplique E° pelos coeficientes." },
      { nome: "Energia livre da pilha", eq: `ΔG° = −n · F · ΔE°`, simbolos: [["n", "mols de elétrons trocados na equação", "mol"], ["F", "constante de Faraday, 96 485", "C/mol"], ["ΔE°", "ddp padrão", "V"]], obs: "Dá J (por mol de reação); divida por 1000 para kJ." },
      { nome: "Equação de Nernst (25 °C)", eq: `E = E° − ${fr("0,0592", "n")} · log Q`, simbolos: [["Q", "quociente de reação (produtos/reagentes, só espécies em solução e gases)", "—"], ["n", "elétrons trocados", "—"]], obs: "Forma geral: E = E° − (RT/nF)·ln Q. Sólidos puros valem 1 em Q." },
      { nome: "Lei de Faraday", eq: `m = ${fr("M · i · t", "n · F")}`, simbolos: [["M", "massa molar do produto", "g/mol"], ["i", "corrente", "A"], ["t", "tempo", "s"], ["n", "elétrons por fórmula do produto", "—"]], obs: "Converta o tempo para segundos. Q = i·t em coulombs." },
    ],
    exemplos: [
      {
        t: "direto",
        enunciado: `Monte a pilha cobre/prata (E° Cu²⁺/Cu = +0,34 V; E° Ag⁺/Ag = +0,80 V): cátodo, ânodo, reação global e ΔE°.`,
        passos: [`Maior E°: Ag⁺/Ag (+0,80 V) → cátodo: Ag⁺ + e⁻ → Ag.`, `Ânodo: Cu → Cu²⁺ + 2 e⁻.`, `Igualar elétrons: cátodo × 2 → 2 Ag⁺ + 2 e⁻ → 2 Ag (o E° continua 0,80 V).`, `Global: Cu + 2 Ag⁺ → Cu²⁺ + 2 Ag.`, `ΔE° = 0,80 − 0,34 = 0,46 V.`],
        resposta: `ΔE° = <b>+0,46 V</b>; cátodo de prata (+), ânodo de cobre (−)`,
      },
      {
        t: "Nernst",
        enunciado: `Calcule a ddp de uma pilha de Daniell com [Zn²⁺] = 1,0 mol/L e [Cu²⁺] = 0,010 mol/L, a 25 °C.`,
        passos: [`Reação: Zn + Cu²⁺ → Zn²⁺ + Cu; n = 2; E° = 1,10 V.`, `Q = [Zn²⁺]/[Cu²⁺] = 1,0 / 0,010 = 100 (sólidos não entram).`, `log Q = 2.`, `E = 1,10 − (0,0592/2) × 2 = 1,10 − 0,0592 = 1,04 V.`],
        resposta: `E ≈ <b>1,04 V</b> (menor que 1,10 V: há menos oxidante disponível)`,
      },
      {
        t: "Faraday (de prova)",
        enunciado: `Quanto tempo uma corrente de 1,50 A leva para depositar 6,04 g de prata numa peça? (Ag = 107,87; F = 96 485 C/mol)`,
        passos: [`Semirreação: Ag⁺ + e⁻ → Ag (n = 1).`, `n(Ag) = 6,04 g / 107,87 g/mol = 0,0560 mol → 0,0560 mol de e⁻.`, `Q = 0,0560 mol × 96 485 C/mol = 5,40×10³ C.`, `t = Q / i = 5,40×10³ C / 1,50 A = 3,60×10³ s.`],
        resposta: `t ≈ <b>3,6×10³ s = 1,00 h</b>`,
      },
    ],
    erros: [
      { errado: `Multiplicar o E° por 2 ao multiplicar Ag⁺ + e⁻ → Ag por 2.`, certo: `O E° fica 0,80 V; só os coeficientes mudam.`, porque: `Potencial é energia por carga (J/C), uma grandeza intensiva. Quem escala com a quantidade é o ΔG = −nFE.` },
      { errado: `Dizer que o cátodo é sempre o polo negativo (ou sempre o positivo).`, certo: `Cátodo é onde há redução. Na pilha é o polo +; na eletrólise é o polo −.`, porque: `O sinal depende de quem empurra os elétrons: a própria reação (pilha) ou a fonte externa (eletrólise).` },
      { errado: `Calcular ΔE° = E°ânodo − E°cátodo e obter valor negativo para uma pilha que funciona.`, certo: `ΔE° = E°cátodo − E°ânodo, com o cátodo sendo o de maior E°.`, porque: `Uma pilha real sempre tem ΔE° &gt; 0; sinal negativo indica troca de papéis.` },
      { errado: `Na eletrólise de NaCl aquoso, prever sódio metálico no cátodo.`, certo: `Forma-se H₂ (a água se reduz) e a solução fica com OH⁻.`, porque: `Na⁺ (E° = −2,71 V) é muito mais difícil de reduzir que a água (−0,83 V em meio básico).` },
      { errado: `Usar o tempo em minutos na lei de Faraday.`, certo: `Converta para segundos: 1 C = 1 A·s.`, porque: `Com minutos o resultado sai 60 vezes menor.` },
    ],
    aplicacoes: [
      `<b>Baterias de íon-lítio</b>: o lítio tem o menor E° da tabela (−3,04 V), o que dá células de cerca de 3,7 V com pouca massa, ideais para celulares e carros elétricos.`,
      `<b>Proteção contra corrosão</b>: blocos de magnésio ou zinco presos a cascos de navios e tubulações se oxidam no lugar do ferro (ânodo de sacrifício); a galvanização cobre o aço com zinco.`,
      `<b>Alumínio</b>: o processo Hall-Héroult faz eletrólise ígnea de Al₂O₃ dissolvido em criolita. Cada tonelada de Al exige cerca de 1,1×10¹⁰ C, por isso as fábricas ficam perto de hidrelétricas.`,
      `<b>Galvanoplastia</b>: cromagem, douração de joias e prateação usam Faraday para controlar a espessura da camada.`,
      `<b>Medicina</b>: o glicosímetro é um sensor eletroquímico; a corrente medida é proporcional à glicose oxidada por uma enzima.`,
    ],
    teste: [
      { p: `Numa pilha zinco/cobre, o que acontece com a massa das placas com o tempo?`, op: [`As duas aumentam.`, `A de zinco diminui e a de cobre aumenta.`, `A de zinco aumenta e a de cobre diminui.`, `Nenhuma muda; só os elétrons andam.`], certa: 1, explica: `O Zn se oxida e vai para a solução como Zn²⁺; o Cu²⁺ se reduz e deposita como Cu na placa.` },
      { p: `Para que serve a ponte salina?`, op: [`Levar elétrons de um lado ao outro.`, `Aumentar a ddp.`, `Manter a neutralidade elétrica das soluções, fechando o circuito com íons.`, `Impedir que a reação aconteça.`], certa: 2, explica: `Elétrons andam pelo fio; a ponte deixa íons migrarem para compensar as cargas que se acumulariam em cada lado.` },
      { p: `Uma reação redox tem ΔE° = −0,30 V. O que se pode afirmar?`, op: [`É espontânea e serve como pilha.`, `ΔG° &lt; 0.`, `Não é espontânea; só ocorre forçada, por eletrólise.`, `Está em equilíbrio.`], certa: 2, explica: `ΔG° = −nFΔE° &gt; 0 quando ΔE° &lt; 0: no sentido escrito a reação não é espontânea.` },
      { p: `Por que o magnésio protege o aço de um navio?`, op: [`Porque tem E° menor que o ferro, então se oxida no lugar dele.`, `Porque tem E° maior e se reduz no lugar do ferro.`, `Porque forma uma tinta impermeável.`, `Porque neutraliza a água do mar.`], certa: 0, explica: `Mg (−2,37 V) é mais redutor que Fe (−0,44 V); ligado ao ferro, vira o ânodo e é ele que corrói.` },
      { p: `Dobrando a corrente e mantendo o tempo de uma eletrólise, a massa depositada…`, op: [`cai pela metade.`, `não muda.`, `quadruplica.`, `dobra.`], certa: 3, explica: `m = M·i·t/(nF): a massa é diretamente proporcional à carga i·t.` },
      { p: `Conforme uma pilha funciona, sua ddp diminui porque…`, op: [`o E° dos eletrodos diminui.`, `os produtos se acumulam, Q aumenta e, pela equação de Nernst, E cai até zero no equilíbrio.`, `a ponte salina se esgota primeiro.`, `os elétrons ficam mais pesados.`], certa: 1, explica: `E° é constante; quem muda é Q. Quando Q = K, E = 0 e ΔG = 0.` },
    ],
    resumo: [
      `Pilha: reação espontânea gera corrente; eletrólise: corrente força uma reação não espontânea.`,
      `Ânodo = oxidação; cátodo = redução. Na pilha, ânodo é − e cátodo é +; na eletrólise, ao contrário.`,
      `Maior E° de redução vira cátodo; ΔE° = E°cátodo − E°ânodo; não multiplique E°.`,
      `ΔG° = −nFΔE°; ΔE° &gt; 0 significa espontânea.`,
      `Nernst (25 °C): E = E° − (0,0592/n)·log Q; E = 0 quando Q = K.`,
      `Faraday: m = M·i·t/(nF), com t em segundos e F = 96 485 C/mol.`,
    ],
    alem: {
      t: "Para ir além: de onde vem o 0,0592 e por que a bateria esquenta",
      h: `<p>A equação de Nernst vem de ΔG = ΔG° + RT ln Q. Substituindo ΔG = −nFE e ΔG° = −nFE° e dividindo por −nF:</p>
        <div class="eq">E = E° − ${fr("RT", "nF")} ln Q</div>
        <p>A 298,15 K, RT/F = 8,314 × 298,15 / 96 485 = 0,02569 V; multiplicando por ln 10 = 2,303, dá 0,0592 V. Em outras temperaturas o fator muda, por isso o “0,0592” só vale a 25 °C. Esse mesmo termo explica o potencial de membrana dos neurônios, que obedece a uma equação de Nernst para íons K⁺ e Na⁺.</p>
        <p>Uma pilha real entrega menos que o ΔE° calculado quando há corrente: parte da energia se perde na <b>resistência interna</b> (aquecimento, i²r) e em <b>sobrepotenciais</b>, barreiras cinéticas nas superfícies dos eletrodos. É o sobrepotencial alto do O₂ que faz o Cl₂, e não o O₂, sair no ânodo da eletrólise da salmoura, embora o E° do O₂ (1,23 V) seja menor que o do Cl₂ (1,36 V).</p>`,
    },
  };

  // =====================================================================
  // Termoquímica
  // =====================================================================
  A.termo = {
    tempo: 22, nivel: "Ensino médio → faculdade",
    objetivos: [
      "explicar o que é entalpia e diferenciar reações exotérmicas (ΔH &lt; 0) de endotérmicas (ΔH &gt; 0);",
      "calcular o ΔH de uma reação por entalpias de formação, pela lei de Hess e por energias de ligação;",
      "medir calor de reação num calorímetro com q = m·c·ΔT e convertê-lo em kJ/mol;",
      "decidir a espontaneidade com ΔG = ΔH − TΔS e achar a temperatura em que ela se inverte.",
    ],
    requisitos: [{ id: "mol", nome: "Mol e conversões" }, { id: "balancear", nome: "Balanceamento" }, { id: "estequiometria", nome: "Estequiometria" }],
    secoes: [
      {
        t: "A ideia em uma frase",
        h: `<p>Toda reação química quebra ligações e forma outras, e isso sempre envolve energia. A <b>termoquímica</b> mede o <b>calor</b> que uma reação troca com o ambiente. A pressão constante (frasco aberto, atmosfera, corpo humano), esse calor se chama <b>variação de entalpia, ΔH</b>.</p>
          <div class="analogia"><b>Analogia:</b> pense na entalpia como a “conta de energia” guardada nas ligações. Se os produtos têm conta menor que os reagentes, a diferença sai como calor (a reação esquenta o ambiente). Se têm conta maior, a reação precisa “pagar” a diferença puxando calor de fora (o ambiente esfria).</div>
          <p>Não dá para medir a entalpia absoluta de uma substância, só a <b>variação</b>: ΔH = H(produtos) − H(reagentes). Por isso tudo na termoquímica é medido em relação a um ponto de referência combinado, as substâncias simples no estado-padrão (25 °C, 1 bar).</p>
          <p>Um número para guardar: queimar 1 mol de metano (16 g, o gás natural) libera cerca de <b>890 kJ</b>, o bastante para aquecer 2,7 L de água de 20 °C até a fervura.</p>`,
      },
      {
        t: "Exotérmica e endotérmica: o diagrama de entalpia",
        h: `<p>O sinal de ΔH é sempre visto <b>do ponto de vista da reação</b> (o sistema):</p>
          <ul><li><b>Exotérmica, ΔH &lt; 0</b>: o sistema perde energia, que sai como calor. Ex.: combustões, neutralização ácido-base, respiração celular, formação de gelo, CaO + H₂O (cal virgem esquenta).</li>
          <li><b>Endotérmica, ΔH &gt; 0</b>: o sistema absorve calor. Ex.: fusão do gelo, evaporação do suor, fotossíntese, decomposição do CaCO₃ no forno de cal, dissolução do NH₄NO₃ (bolsa de gelo instantâneo).</li></ul>
          <p>No diagrama abaixo, o eixo horizontal é o “caminho da reação”. A altura dos reagentes e dos produtos dá o ΔH; o morro no meio é a <b>energia de ativação</b>, a barreira que precisa ser vencida para a reação começar. O ΔH não depende do morro: ele só compara o começo e o fim.</p>
          <div class="nota">Toda reação endotérmica num sentido é exotérmica no sentido inverso, com o mesmo valor e sinal trocado: H₂O(l) → H₂O(g) tem ΔH = +44,0 kJ/mol; a condensação tem −44,0 kJ/mol.</div>`,
        grafico: {
          op: { altura: 230, modo: "dados", rotX: "caminho da reação", rotY: "H (kJ/mol)" },
          cena: {
            x: [-0.05, 2.35], y: [-115, 140],
            series: [
              { tipo: "funcao", f: perfil(0, -90, 105), dominio: [0, 1], cor: AZUL, rotulo: "exotérmica" },
              { tipo: "funcao", f: (x) => perfil(0, 70, 75)(x - 1.3), dominio: [1.3, 2.3], cor: VERM, rotulo: "endotérmica" },
              { tipo: "seg", de: [0.97, 0], para: [0.97, -90], cor: AZUL, tracejado: true },
              { tipo: "seg", de: [2.27, 0], para: [2.27, 70], cor: VERM, tracejado: true },
              { tipo: "texto", x: 0.84, y: -32, texto: "ΔH = −90" },
              { tipo: "texto", x: 1.98, y: 35, texto: "ΔH = +70" },
              { tipo: "texto", x: 0.12, y: 14, texto: "reagentes" },
              { tipo: "texto", x: 1.42, y: 14, texto: "reagentes" },
            ],
          },
          legenda: "Exotérmica: produtos abaixo dos reagentes (ΔH < 0). Endotérmica: produtos acima (ΔH > 0). O morro é a energia de ativação.",
        },
      },
      {
        t: "ΔH a partir das entalpias de formação",
        h: `<p>A <b>entalpia padrão de formação</b>, ΔH<sub>f</sub>°, é o ΔH para formar <b>1 mol</b> da substância a partir das substâncias simples na forma mais estável, a 25 °C e 1 bar. Por definição, substância simples no estado-padrão (O₂(g), H₂(g), C(grafite), Fe(s)) tem ΔH<sub>f</sub>° = 0.</p>
          <div class="tab-rolar"><table class="tb"><thead><tr><th>Substância</th><th>ΔH<sub>f</sub>° (kJ/mol)</th><th>Substância</th><th>ΔH<sub>f</sub>° (kJ/mol)</th></tr></thead><tbody>
          <tr><td>CO₂(g)</td><td>−393,5</td><td>CH₄(g)</td><td>−74,6</td></tr>
          <tr><td>H₂O(l)</td><td>−285,8</td><td>C₃H₈(g)</td><td>−104,7</td></tr>
          <tr><td>H₂O(g)</td><td>−241,8</td><td>C₂H₅OH(l)</td><td>−277,6</td></tr>
          <tr><td>CO(g)</td><td>−110,5</td><td>NH₃(g)</td><td>−45,9</td></tr>
          <tr><td>CaCO₃(s)</td><td>−1207,6</td><td>CaO(s)</td><td>−634,9</td></tr></tbody></table></div>
          <p>Com a tabela, qualquer ΔH sai de uma conta só: <b>ΔH° = Σ n·ΔH<sub>f</sub>°(produtos) − Σ n·ΔH<sub>f</sub>°(reagentes)</b>, com n = coeficientes da equação balanceada. Para a combustão do metano, CH₄ + 2 O₂ → CO₂ + 2 H₂O(l):</p>
          <div class="eq">ΔH° = [−393,5 + 2(−285,8)] − [−74,6 + 2(0)] = −965,1 + 74,6 = −890,5 kJ</div>
          <div class="destaque">O estado físico importa: H₂O(l) e H₂O(g) diferem em 44 kJ/mol. Com água gasosa, a mesma combustão dá −802,5 kJ. Esse é o “poder calorífico inferior” dos engenheiros.</div>`,
      },
      {
        t: "Lei de Hess e energias de ligação",
        h: `<p><b>Lei de Hess</b>: como H é uma função de estado, o ΔH total depende só do estado inicial e do final, não do caminho. Então podemos somar equações conhecidas como se fossem equações algébricas, com duas regras:</p>
          <ul><li><b>Inverter</b> uma equação troca o sinal do ΔH.</li>
          <li><b>Multiplicar</b> uma equação por um número multiplica o ΔH pelo mesmo número.</li></ul>
          <p>Exemplo clássico: o ΔH de C(grafite) + ½ O₂ → CO não se mede direto (sempre sai um pouco de CO₂). Mas C + O₂ → CO₂ (ΔH = −393,5 kJ) e CO + ½ O₂ → CO₂ (ΔH = −283,0 kJ) são fáceis de medir. Mantendo a primeira e invertendo a segunda: ΔH = −393,5 + 283,0 = <b>−110,5 kJ</b>.</p>
          <h5>Energias de ligação</h5>
          <p>Romper uma ligação sempre <b>custa</b> energia (endotérmico); formar uma ligação sempre <b>libera</b> (exotérmico). Com energias médias de ligação (C−H 413, O=O 498, C=O 799, O−H 463 kJ/mol), estima-se ΔH ≈ Σ(rompidas) − Σ(formadas). Para CH₄ + 2 O₂ → CO₂ + 2 H₂O(g): rompe-se 4(413) + 2(498) = 2648 kJ; formam-se 2(799) + 4(463) = 3450 kJ; ΔH ≈ <b>−802 kJ</b>, muito perto do valor tabelado.</p>
          <div class="nota">Energias de ligação são médias de muitas moléculas e valem para gases. Use-as para estimativas; quando houver ΔH<sub>f</sub>°, ele é mais exato.</div>`,
      },
      {
        t: "Calorimetria: medindo o calor",
        h: `<p>No laboratório, o calor de uma reação é medido pela variação de temperatura de uma massa conhecida de água (ou de solução) num recipiente isolado, o <b>calorímetro</b>:</p>
          <div class="eq">q = m · c · ΔT</div>
          <p>com c(água) = 4,18 J/(g·°C). Uma variação de 1 °C é igual a uma de 1 K, por isso ΔT pode ser lido em qualquer das duas escalas. O calor que a água ganha é o calor que a reação perdeu: <b>q<sub>reação</sub> = −q<sub>água</sub></b>. Para obter o ΔH em kJ/mol, divida pela quantidade (em mol) do reagente que reagiu.</p>
          <p>Exemplo de neutralização: 50,0 mL de HCl 1,00 mol/L + 50,0 mL de NaOH 1,00 mol/L, temperatura sobe 6,7 °C. Considerando 100 g de solução com c ≈ 4,18 J/(g·°C): q = 100 × 4,18 × 6,7 = 2,80×10³ J = 2,80 kJ. Reagiram 0,0500 mol de H⁺, então ΔH = −2,80 kJ / 0,0500 mol = <b>−56 kJ/mol</b>, próximo do valor de livro para H⁺ + OH⁻ → H₂O (cerca de −56 kJ/mol).</p>
          <div class="destaque">O sinal é decisão do químico, não do termômetro: se a água esquentou, a reação foi exotérmica e o ΔH é negativo.</div>`,
      },
      {
        t: "Entropia e energia livre: quando a reação é espontânea?",
        h: `<p>Liberar calor ajuda, mas não basta: o gelo derrete sozinho a 25 °C, e isso é endotérmico. O outro ingrediente é a <b>entropia (S)</b>, uma medida do número de maneiras de distribuir a energia e as partículas. Grosso modo, ΔS &gt; 0 quando aumenta o número de mols de gás, quando um sólido funde ou se dissolve, ou quando uma molécula se quebra em várias.</p>
          <p>A <b>energia livre de Gibbs</b> junta os dois efeitos, a T e P constantes:</p>
          <div class="eq">ΔG = ΔH − T·ΔS</div>
          <p><b>ΔG &lt; 0</b>: espontânea no sentido escrito; <b>ΔG &gt; 0</b>: não espontânea (a inversa é que é); <b>ΔG = 0</b>: equilíbrio. Os quatro casos de sinal:</p>
          <div class="tab-rolar"><table class="tb"><thead><tr><th>ΔH</th><th>ΔS</th><th>Espontânea?</th><th>Exemplo</th></tr></thead><tbody>
          <tr><td>−</td><td>+</td><td>sempre</td><td>2 H₂O₂ → 2 H₂O + O₂</td></tr>
          <tr><td>+</td><td>−</td><td>nunca</td><td>3 O₂ → 2 O₃</td></tr>
          <tr><td>−</td><td>−</td><td>a baixa T</td><td>água congelando</td></tr>
          <tr><td>+</td><td>+</td><td>a alta T</td><td>gelo fundindo; CaCO₃ → CaO + CO₂</td></tr></tbody></table></div>
          <p>Nos dois últimos casos há uma temperatura de inversão, onde ΔG = 0: <b>T = ΔH/ΔS</b>. Para o gelo, 6010 J/mol ÷ 22,0 J/(mol·K) = 273 K, exatamente 0 °C. Para o calcário (ΔH° = +179,2 kJ/mol, ΔS° = +160,2 J/(mol·K)), T = 179,2 / 0,1602 ≈ 1119 K ≈ 846 °C: é por isso que os fornos de cal trabalham acima de 850 °C.</p>`,
        grafico: {
          op: { altura: 220, modo: "dados", rotX: "T (K)", rotY: "ΔG° (kJ/mol)" },
          cena: {
            x: [0, 1600], y: [-90, 200],
            series: [
              { tipo: "funcao", f: (T) => 179.2 - 0.1602 * T, rotulo: "ΔG° = 179,2 − 0,1602·T" },
              { tipo: "hline", v: 0, cor: CINZA, tracejado: true },
              { tipo: "marca", x: 298.15, y: 131.4, rotulo: "25 °C: +131 kJ/mol" },
              { tipo: "marca", x: 1118.6, y: 0, cor: VERM, rotulo: "T = 1119 K: ΔG° = 0" },
            ],
          },
          legenda: "Decomposição do CaCO₃: ΔG° cai com T porque ΔS > 0; abaixo de 1119 K não é espontânea, acima é.",
        },
      },
    ],
    formulas: [
      { nome: "ΔH por entalpias de formação", eq: `ΔH° = Σ n·ΔH<sub>f</sub>°(produtos) − Σ n·ΔH<sub>f</sub>°(reagentes)`, simbolos: [["n", "coeficiente estequiométrico", "mol"], ["ΔH<sub>f</sub>°", "entalpia padrão de formação", "kJ/mol"]], obs: "Substância simples no estado-padrão tem ΔH<sub>f</sub>° = 0. Confira o estado físico (l ou g)." },
      { nome: "ΔH por energias de ligação", eq: `ΔH ≈ Σ E(rompidas) − Σ E(formadas)`, simbolos: [["E", "energia média de ligação", "kJ/mol"]], obs: "Reagentes menos produtos (ordem inversa da fórmula de formação). Estimativa para gases." },
      { nome: "Calorimetria", eq: `q = m·c·ΔT &nbsp;&nbsp; ΔH = −${fr("q", "n")}`, simbolos: [["q", "calor absorvido pela água/solução", "J"], ["m", "massa da água/solução", "g"], ["c", "calor específico (água: 4,18)", "J/(g·°C)"], ["ΔT", "T final − T inicial", "°C ou K"], ["n", "quantidade de reagente", "mol"]], obs: "O sinal de menos: calor ganho pela água é calor perdido pela reação." },
      { nome: "Energia livre de Gibbs", eq: `ΔG = ΔH − T·ΔS &nbsp;&nbsp; T<sub>inversão</sub> = ${fr("ΔH", "ΔS")}`, simbolos: [["ΔG", "energia livre", "kJ/mol"], ["ΔH", "entalpia", "kJ/mol"], ["T", "temperatura absoluta", "K"], ["ΔS", "entropia (divida por 1000 para kJ)", "J/(mol·K)"]], obs: "Converta ΔS para kJ/(mol·K) antes de multiplicar por T; T sempre em kelvin." },
    ],
    exemplos: [
      {
        t: "direto",
        enunciado: `Calcule o ΔH° de combustão do propano, C₃H₈(g) + 5 O₂(g) → 3 CO₂(g) + 4 H₂O(l), e o calor liberado por um botijão de 13 kg (M = 44,10 g/mol).`,
        passos: [`Produtos: 3(−393,51) + 4(−285,83) = −1180,53 − 1143,32 = −2323,85 kJ.`, `Reagentes: −104,7 + 5(0) = −104,7 kJ.`, `ΔH° = −2323,85 − (−104,7) = −2219,2 kJ por mol de propano.`, `n = 13 000 g ÷ 44,10 g/mol = 294,8 mol.`, `Calor = 294,8 mol × 2219,2 kJ/mol = 6,54×10⁵ kJ.`],
        resposta: `ΔH° ≈ <b>−2219 kJ/mol</b>; um botijão libera cerca de <b>6,5×10⁵ kJ</b>`,
      },
      {
        t: "lei de Hess",
        enunciado: `Use as reações (1) C(grafite) + O₂ → CO₂, ΔH = −393,5 kJ; (2) H₂ + ½ O₂ → H₂O(l), ΔH = −285,8 kJ; (3) CH₄ + 2 O₂ → CO₂ + 2 H₂O(l), ΔH = −890,3 kJ para achar o ΔH de C(grafite) + 2 H₂ → CH₄.`,
        passos: [`C aparece como reagente em (1): mantenha (1), ΔH = −393,5 kJ.`, `Precisamos de 2 H₂ como reagente: (2) × 2, ΔH = −571,6 kJ.`, `CH₄ deve ser produto: inverta (3), ΔH = +890,3 kJ.`, `Somando, cancelam-se 2 O₂, CO₂ e 2 H₂O: sobra C + 2 H₂ → CH₄.`, `ΔH = −393,5 − 571,6 + 890,3 = −74,8 kJ.`],
        resposta: `ΔH<sub>f</sub>°(CH₄) ≈ <b>−74,8 kJ/mol</b>`,
      },
      {
        t: "calorimetria (de prova)",
        enunciado: `Queimar 1,00 g de etanol (M = 46,07 g/mol) aquece 500 g de água de 20,0 °C para 33,0 °C. Estime o ΔH de combustão e compare com o tabelado (−1367 kJ/mol).`,
        passos: [`q(água) = 500 g × 4,18 J/(g·°C) × 13,0 °C = 27 170 J = 27,2 kJ.`, `n(etanol) = 1,00 g ÷ 46,07 g/mol = 0,02171 mol.`, `ΔH = −27,17 kJ ÷ 0,02171 mol = −1,25×10³ kJ/mol.`, `Diferença: 1252 / 1367 ≈ 0,92, ou seja, cerca de 8% do calor se perdeu para o ar e o recipiente.`],
        resposta: `ΔH ≈ <b>−1,25×10³ kJ/mol</b> (o valor real é mais negativo: perdas de calor)`,
      },
    ],
    erros: [
      { errado: `Esquecer os coeficientes: usar ΔH<sub>f</sub>°(H₂O) uma vez só quando a equação tem 2 H₂O.`, certo: `Multiplique cada ΔH<sub>f</sub>° pelo seu coeficiente.`, porque: `ΔH<sub>f</sub>° é por mol; a equação diz quantos mols entram e saem.` },
      { errado: `Fazer “produtos − reagentes” também com energias de ligação.`, certo: `Com ligações é rompidas (reagentes) − formadas (produtos).`, porque: `Energia de ligação é energia para <b>romper</b>; formar libera esse mesmo valor com sinal trocado.` },
      { errado: `Calcular ΔG = ΔH − TΔS com ΔH = −92 kJ e ΔS = −199 J/K direto: −92 − 298(−199).`, certo: `Converta: ΔS = −0,199 kJ/K. ΔG = −92 + 59,3 = −32,7 kJ.`, porque: `Misturar kJ e J faz o termo TΔS ficar mil vezes maior e inverte a conclusão.` },
      { errado: `Dizer que a reação é endotérmica porque a água do calorímetro esquentou.`, certo: `Água esquentou ⇒ a reação liberou calor ⇒ exotérmica, ΔH &lt; 0.`, porque: `O ΔH é do sistema (reação); o termômetro mede a vizinhança.` },
      { errado: `Concluir que ΔG &lt; 0 significa reação rápida.`, certo: `ΔG diz <b>se</b> pode acontecer; a velocidade é assunto de cinética.`, porque: `Diamante → grafite tem ΔG° &lt; 0, mas é lentíssima à temperatura ambiente.` },
    ],
    aplicacoes: [
      `<b>Combustíveis</b>: a comparação entre gasolina, etanol, GNV e hidrogênio é feita pelo ΔH de combustão por grama e por litro; o H₂ libera cerca de 142 kJ/g, contra 48 kJ/g da gasolina.`,
      `<b>Nutrição</b>: as “calorias” dos rótulos vêm de calorimetria de bomba; carboidratos e proteínas dão cerca de 17 kJ/g (4 kcal/g) e gorduras cerca de 37 kJ/g (9 kcal/g).`,
      `<b>Bolsas térmicas</b>: a dissolução do NH₄NO₃ em água é endotérmica (bolsa fria); a cristalização do acetato de sódio é exotérmica (bolsa quente reutilizável).`,
      `<b>Indústria da cal e do cimento</b>: a decomposição do CaCO₃ só se torna espontânea acima de cerca de 850 °C, o que define a temperatura dos fornos e o seu gasto de energia.`,
      `<b>Bioquímica</b>: a hidrólise do ATP (ΔG ≈ −30 kJ/mol) é acoplada a reações com ΔG &gt; 0 para que a soma fique negativa e a célula consiga sintetizar proteínas.`,
    ],
    teste: [
      { p: `A dissolução do nitrato de amônio em água deixa o copo gelado. Essa dissolução é…`, op: [`exotérmica, com ΔH &lt; 0.`, `endotérmica, com ΔH &gt; 0.`, `nem uma coisa nem outra: dissolução não é reação.`, `exotérmica, porque o calor sai do copo.`], certa: 1, explica: `O sistema (sal + água) puxa calor da vizinhança, que esfria. Calor entrando no sistema = endotérmico.` },
      { p: `Por que o ΔH<sub>f</sub>° do O₂(g) é zero e o do O₃(g) não é?`, op: [`Porque o O₃ é mais pesado.`, `Porque o O₃ é um íon.`, `Por acaso experimental.`, `Porque o zero é definido para a forma mais estável da substância simples, que é o O₂.`], certa: 3, explica: `A referência é a forma mais estável a 25 °C e 1 bar. O O₃ precisa de +142,7 kJ/mol para se formar a partir de O₂.` },
      { p: `Se A → B tem ΔH = −50 kJ, quanto vale 2 B → 2 A?`, op: [`+100 kJ`, `−100 kJ`, `+50 kJ`, `−25 kJ`], certa: 0, explica: `Inverter troca o sinal (+50 kJ) e dobrar a equação dobra o valor (+100 kJ). É a lei de Hess.` },
      { p: `Uma reação tem ΔH &lt; 0 e ΔS &lt; 0. Ela é espontânea…`, op: [`em qualquer temperatura.`, `em nenhuma temperatura.`, `só abaixo de T = ΔH/ΔS.`, `só acima de T = ΔH/ΔS.`], certa: 2, explica: `Em T baixa, o termo −TΔS (positivo) é pequeno e o ΔH negativo vence. Em T alta, −TΔS domina e ΔG fica positivo.` },
      { p: `Romper 1 mol de ligações H−H exige 436 kJ. Então, formar 1 mol de ligações H−H…`, op: [`exige 436 kJ.`, `libera 218 kJ.`, `libera 436 kJ.`, `não envolve energia.`], certa: 2, explica: `Formar é o inverso de romper: mesmo valor, sinal trocado. Formar ligações é sempre exotérmico.` },
      { p: `Qual destes processos tem ΔS &gt; 0?`, op: [`N₂(g) + 3 H₂(g) → 2 NH₃(g)`, `H₂O(l) → H₂O(s)`, `Ag⁺(aq) + Cl⁻(aq) → AgCl(s)`, `CaCO₃(s) → CaO(s) + CO₂(g)`], certa: 3, explica: `A decomposição do calcário cria 1 mol de gás a partir de sólido; nas outras opções o número de mols de gás diminui ou forma-se um sólido.` },
    ],
    resumo: [
      `ΔH = calor trocado a pressão constante; ΔH &lt; 0 exotérmica, ΔH &gt; 0 endotérmica (sempre do ponto de vista da reação).`,
      `ΔH° = Σ n·ΔH<sub>f</sub>°(produtos) − Σ n·ΔH<sub>f</sub>°(reagentes); substância simples estável tem ΔH<sub>f</sub>° = 0.`,
      `Hess: ΔH não depende do caminho; inverter troca o sinal, multiplicar multiplica o ΔH.`,
      `Ligações: ΔH ≈ rompidas − formadas; romper custa, formar libera.`,
      `Calorimetria: q = m·c·ΔT (c da água = 4,18 J/(g·°C)) e ΔH = −q/n.`,
      `ΔG = ΔH − TΔS (T em K, ΔS em kJ); ΔG &lt; 0 é espontânea; inversão em T = ΔH/ΔS.`,
    ],
    alem: {
      t: "Para ir além: por que ΔG, e não ΔS do universo?",
      h: `<p>A segunda lei da termodinâmica diz que um processo espontâneo aumenta a entropia do <b>universo</b>: ΔS<sub>univ</sub> = ΔS<sub>sistema</sub> + ΔS<sub>vizinhança</sub> &gt; 0. A pressão e temperatura constantes, o calor que a reação libera vai para a vizinhança, cuja entropia aumenta de −ΔH/T. Então:</p>
        <div class="eq">ΔS<sub>univ</sub> = ΔS − ${fr("ΔH", "T")} &gt; 0 &nbsp;⇔&nbsp; ΔH − TΔS &lt; 0</div>
        <p>Multiplicando por −T, aparece o ΔG. Ele é só uma forma de olhar a entropia do universo usando apenas grandezas do sistema. Fisicamente, −ΔG é o <b>trabalho útil máximo</b> (além da expansão) que a reação pode fornecer: numa pilha, ΔG = −nFE; numa célula, é o que sobra para sintetizar moléculas.</p>
        <p>ΔH e ΔS variam pouco com a temperatura, mas não são constantes: a correção vem da capacidade calorífica (lei de Kirchhoff, dΔH/dT = ΔC<sub>p</sub>). E o ΔG° se liga ao equilíbrio por ΔG° = −RT ln K: cada 5,7 kJ/mol de ΔG° a 25 °C corresponde a um fator 10 em K. É a ponte entre esta aula e a de equilíbrio químico.</p>`,
    },
  };

  // =====================================================================
  // Equilíbrio químico
  // =====================================================================
  A.equilibrio = {
    tempo: 24, nivel: "Ensino médio → faculdade",
    objetivos: [
      "explicar por que o equilíbrio químico é dinâmico e o que a constante K informa;",
      "escrever Kc e Kp, converter um no outro e prever o sentido de uma reação comparando Q com K;",
      "resolver problemas de equilíbrio com a tabela ICE;",
      "prever com o princípio de Le Chatelier o efeito de concentração, pressão, temperatura e catalisador;",
      "calcular solubilidade a partir do Kps e o pH de um tampão pela equação de Henderson-Hasselbalch.",
    ],
    requisitos: [{ id: "solucoes", nome: "Soluções e concentração" }, { id: "ph", nome: "pH" }, { id: "termo", nome: "Termoquímica" }],
    secoes: [
      {
        t: "A ideia em uma frase",
        h: `<p>Muitas reações não vão “até o fim”: os produtos também reagem entre si e refazem os reagentes. Quando a velocidade da reação direta fica <b>igual</b> à da inversa, as concentrações param de mudar. Isso é o <b>equilíbrio químico</b>, e ele é <b>dinâmico</b>: as duas reações continuam acontecendo o tempo todo, só que se compensam.</p>
          <div class="analogia"><b>Analogia:</b> uma loja cheia num sábado. Gente entra e gente sai o tempo todo, mas, depois de um tempo, o número de pessoas lá dentro fica estável porque entra tanta gente quanto sai. Olhando de longe parece que “nada acontece”; olhando a porta, há movimento constante.</div>
          <p>Equilíbrio <b>não</b> quer dizer concentrações iguais. Quer dizer concentrações <b>constantes</b>. Num equilíbrio pode sobrar 99,9% de reagente (K pequeno) ou quase nada (K grande). Quem diz isso é a constante de equilíbrio.</p>
          <p>A seta dupla ⇌ indica que a reação é reversível. Experimentos com isótopos confirmam a dinâmica: ao colocar um pouco de HI marcado com iodo radioativo num equilíbrio H₂ + I₂ ⇌ 2 HI, logo aparece radioatividade também no I₂.</p>`,
      },
      {
        t: "A constante K e o quociente Q",
        h: `<p>Para a reação a A + b B ⇌ c C + d D, no equilíbrio, vale sempre (a uma dada temperatura):</p>
          <div class="eq">K<sub>c</sub> = ${fr("[C]<sup>c</sup> [D]<sup>d</sup>", "[A]<sup>a</sup> [B]<sup>b</sup>")}</div>
          <ul><li>Os coeficientes viram <b>expoentes</b>.</li>
          <li><b>Sólidos e líquidos puros não entram</b> (sua “concentração” é constante). Água como solvente também não.</li>
          <li><b>K ≫ 1</b>: no equilíbrio predominam produtos. <b>K ≪ 1</b>: predominam reagentes.</li>
          <li>Inverter a equação inverte K (1/K); multiplicar a equação por n eleva K à potência n.</li></ul>
          <p>O <b>quociente Q</b> tem a mesma fórmula, mas com as concentrações de um instante qualquer. Ele diz para onde a reação vai: <b>Q &lt; K</b>, falta produto e a reação anda para a direita; <b>Q &gt; K</b>, sobra produto e ela anda para a esquerda; <b>Q = K</b>, está em equilíbrio.</p>
          <p>O gráfico mostra H₂ + I₂ ⇌ 2 HI (K<sub>c</sub> ≈ 49 a cerca de 440 °C), partindo de 1,00 mol/L de H₂ e de I₂: as curvas se achatam quando Q chega a K.</p>`,
        grafico: {
          op: { altura: 230, modo: "dados", rotX: "tempo", rotY: "concentração (mol/L)" },
          cena: {
            x: [0, 10], y: [0, 1.75],
            series: [
              { tipo: "funcao", f: (t) => 1.556 * (1 - Math.exp(-t / 1.3)), cor: VERM, rotulo: "[HI]" },
              { tipo: "funcao", f: (t) => 0.222 + 0.778 * Math.exp(-t / 1.3), cor: AZUL, rotulo: "[H₂] = [I₂]" },
              { tipo: "vline", v: 6, cor: CINZA, tracejado: true, rotulo: "equilíbrio" },
              { tipo: "texto", x: 8.2, y: 1.42, texto: "1,56" },
              { tipo: "texto", x: 8.2, y: 0.34, texto: "0,22" },
            ],
          },
          legenda: "As concentrações mudam rápido no começo e tendem a valores constantes: 1,56² / 0,222² ≈ 49 = Kc.",
        },
      },
      {
        t: "Tabela ICE e Kc ↔ Kp",
        h: `<p>Quase todo problema de equilíbrio se resolve com uma tabela de três linhas: <b>I</b>nicial, <b>C</b>, de “change” em inglês, que aqui chamamos de variação, e <b>E</b>quilíbrio (daí o nome ICE). A mudança segue a proporção dos coeficientes: se A some x, então em a A + b B → c C cada espécie muda −a·x, −b·x, +c·x. Depois substitua a linha E na expressão de K e resolva para x.</p>
          <div class="tab-rolar"><table class="tb"><thead><tr><th></th><th>H₂</th><th>I₂</th><th>2 HI</th></tr></thead><tbody>
          <tr><td>Inicial</td><td>1,00</td><td>1,00</td><td>0</td></tr>
          <tr><td>Variação</td><td>−x</td><td>−x</td><td>+2x</td></tr>
          <tr><td>Equilíbrio</td><td>1,00 − x</td><td>1,00 − x</td><td>2x</td></tr></tbody></table></div>
          <p>Quando K é muito pequeno (K/[inicial] &lt; 10⁻³, mais ou menos), x é desprezível perto da concentração inicial e a conta vira uma raiz simples. Sempre confira a aproximação no fim (x menor que 5% do inicial).</p>
          <h5>Gases: Kp</h5>
          <p>Para gases, pode-se usar pressões parciais (em atm ou bar) no lugar de concentrações, o que dá o <b>K<sub>p</sub></b>. Como P = (n/V)RT, os dois se relacionam por <b>K<sub>p</sub> = K<sub>c</sub>·(RT)<sup>Δn</sup></b>, com R = 0,08206 L·atm/(mol·K), T em kelvin e Δn = mols de gás dos produtos − mols de gás dos reagentes. Se Δn = 0 (caso do H₂ + I₂ ⇌ 2 HI), K<sub>p</sub> = K<sub>c</sub>.</p>`,
      },
      {
        t: "Le Chatelier: como o equilíbrio responde",
        h: `<p><b>Princípio de Le Chatelier</b>: se um sistema em equilíbrio sofre uma perturbação, ele se desloca no sentido que <b>atenua</b> essa perturbação. Por baixo disso está o Q: a perturbação faz Q ≠ K, e a reação anda até Q voltar a K.</p>
          <ul><li><b>Concentração</b>: adicionar reagente (ou retirar produto) desloca para a direita. K não muda.</li>
          <li><b>Pressão (por compressão)</b>: favorece o lado com <b>menos mols de gás</b>. Se os dois lados têm o mesmo número, não há efeito. Adicionar gás inerte a volume constante não desloca nada.</li>
          <li><b>Temperatura</b>: aquecer favorece o sentido <b>endotérmico</b>; resfriar, o exotérmico. É a <b>única</b> perturbação que muda o valor de K.</li>
          <li><b>Catalisador</b>: acelera as duas reações igualmente; o equilíbrio chega mais cedo, mas na mesma posição.</li></ul>
          <p>Síntese de Haber: N₂ + 3 H₂ ⇌ 2 NH₃, ΔH = −92 kJ. Alta pressão favorece a amônia (4 mols de gás → 2). Baixa temperatura também, mas deixa a reação lenta demais; por isso a indústria usa um meio-termo, cerca de 450 °C e 200 atm, com catalisador de ferro, e retira o NH₃ liquefeito para puxar o equilíbrio.</p>
          <div class="nota">Le Chatelier é qualitativo. Para dizer “quanto” desloca, refaça a tabela ICE com a nova condição.</div>`,
      },
      {
        t: "Kps: o equilíbrio de sais pouco solúveis",
        h: `<p>Um sal “insolúvel” se dissolve um pouco, e a solução saturada é um equilíbrio entre o sólido e os íons. Para M<sub>x</sub>A<sub>y</sub>(s) ⇌ x M<sup>y+</sup> + y A<sup>x−</sup>, o sólido não entra na expressão:</p>
          <div class="eq">K<sub>ps</sub> = [M<sup>y+</sup>]<sup>x</sup> · [A<sup>x−</sup>]<sup>y</sup></div>
          <p>Chamando de <b>s</b> a solubilidade molar (mol/L de sal que se dissolve), [M] = x·s e [A] = y·s. Exemplos a 25 °C:</p>
          <ul><li>AgCl: K<sub>ps</sub> = 1,8×10⁻¹⁰ = s² → s = 1,3×10⁻⁵ mol/L.</li>
          <li>CaF₂: K<sub>ps</sub> = 3,9×10⁻¹¹ = s·(2s)² = 4s³ → s = 2,1×10⁻⁴ mol/L.</li></ul>
          <p><b>Efeito do íon comum</b>: em NaCl 0,10 mol/L, o Cl⁻ já presente empurra o equilíbrio para o sólido: s = 1,8×10⁻¹⁰ / 0,10 = 1,8×10⁻⁹ mol/L, dez mil vezes menos que em água pura.</p>
          <p><b>Vai precipitar?</b> Calcule Q com as concentrações após a mistura: Q &gt; K<sub>ps</sub> → precipita; Q &lt; K<sub>ps</sub> → não precipita.</p>
          <div class="destaque">Só compare solubilidades pelo K<sub>ps</sub> quando os sais têm a mesma proporção de íons. Ag₂CrO₄ tem K<sub>ps</sub> = 1,1×10⁻¹² (menor que o do AgCl), mas s = 6,5×10⁻⁵ mol/L, cinco vezes <b>mais</b> solúvel.</div>`,
      },
      {
        t: "Ácidos fracos e tampões",
        h: `<p>Um ácido fraco se ioniza só em parte: HA ⇌ H⁺ + A⁻, com <b>K<sub>a</sub> = [H⁺][A⁻]/[HA]</b> e pK<sub>a</sub> = −log K<sub>a</sub>. O ácido acético (vinagre) tem K<sub>a</sub> = 1,8×10⁻⁵ (pK<sub>a</sub> = 4,74): numa solução 0,10 mol/L, só cerca de 1,3% das moléculas se ionizam e o pH é 2,9.</p>
          <p>Um <b>tampão</b> é a mistura de um ácido fraco com sua base conjugada (CH₃COOH + CH₃COO⁻) em quantidades parecidas. Ele resiste a mudanças de pH porque tem “estoque” dos dois lados: H⁺ adicionado é consumido pelo A⁻ (vira HA); OH⁻ adicionado é consumido pelo HA (vira A⁻ + H₂O). Rearranjando o K<sub>a</sub> e tomando o log:</p>
          <div class="eq">pH = pK<sub>a</sub> + log ${fr("[A⁻]", "[HA]")}</div>
          <p>Essa é a <b>equação de Henderson-Hasselbalch</b>. Com [A⁻] = [HA], pH = pK<sub>a</sub>. O tampão funciona bem dentro de pK<sub>a</sub> ± 1 (razão entre 1:10 e 10:1), e resiste mais quanto maiores as concentrações (é a <b>capacidade tamponante</b>).</p>
          <p>O sangue usa o par H₂CO₃/HCO₃⁻ (pK<sub>a</sub> ≈ 6,1) com razão [HCO₃⁻]/[H₂CO₃] ≈ 20: pH = 6,1 + log 20 = 6,1 + 1,3 = <b>7,4</b>.</p>`,
      },
    ],
    formulas: [
      { nome: "Constante de equilíbrio", eq: `K<sub>c</sub> = ${fr("[C]<sup>c</sup>[D]<sup>d</sup>", "[A]<sup>a</sup>[B]<sup>b</sup>")}`, simbolos: [["[X]", "concentração no equilíbrio", "mol/L"], ["a, b, c, d", "coeficientes da equação balanceada", "—"]], obs: "Sólidos, líquidos puros e o solvente não entram. Q tem a mesma forma com valores fora do equilíbrio." },
      { nome: "Kc ↔ Kp", eq: `K<sub>p</sub> = K<sub>c</sub>·(RT)<sup>Δn</sup>`, simbolos: [["R", "0,08206", "L·atm/(mol·K)"], ["T", "temperatura absoluta", "K"], ["Δn", "mols de gás (produtos − reagentes)", "—"]], obs: "Δn conta só gases. Com Δn = 0, os dois são iguais." },
      { nome: "Produto de solubilidade", eq: `K<sub>ps</sub> = [M]<sup>x</sup>[A]<sup>y</sup> = (x·s)<sup>x</sup>(y·s)<sup>y</sup>`, simbolos: [["s", "solubilidade molar", "mol/L"], ["x, y", "índices do sal MₓAᵧ", "—"]], obs: "AB: Kps = s². AB₂ ou A₂B: Kps = 4s³. Com íon comum, use a concentração dele no lugar de y·s." },
      { nome: "Henderson-Hasselbalch", eq: `pH = pK<sub>a</sub> + log ${fr("[A⁻]", "[HA]")}`, simbolos: [["pK<sub>a</sub>", "−log K<sub>a</sub>", "—"], ["[A⁻]", "base conjugada", "mol/L"], ["[HA]", "ácido fraco", "mol/L"]], obs: "Vale para tampões (as duas espécies em quantidade apreciável). Pode usar mols no lugar de concentrações: o volume se cancela." },
    ],
    exemplos: [
      {
        t: "direto",
        enunciado: `No equilíbrio N₂O₄(g) ⇌ 2 NO₂(g) a 25 °C, [N₂O₄] = 0,0450 mol/L e [NO₂] = 0,0144 mol/L. Calcule Kc e Kp.`,
        passos: [`Kc = [NO₂]² / [N₂O₄] = (0,0144)² / 0,0450.`, `(0,0144)² = 2,074×10⁻⁴ → Kc = 2,074×10⁻⁴ / 0,0450 = 4,61×10⁻³.`, `Δn = 2 − 1 = 1; RT = 0,08206 × 298,15 = 24,47 L·atm/mol.`, `Kp = 4,61×10⁻³ × 24,47 = 0,113.`],
        resposta: `Kc ≈ <b>4,61×10⁻³</b>; Kp ≈ <b>0,113</b> (pressões em atm)`,
      },
      {
        t: "tabela ICE",
        enunciado: `Coloca-se 1,00 mol de H₂ e 1,00 mol de I₂ num frasco de 1,00 L a cerca de 440 °C, onde Kc = 49 para H₂ + I₂ ⇌ 2 HI. Quais as concentrações no equilíbrio?`,
        passos: [`ICE: H₂ = 1,00 − x; I₂ = 1,00 − x; HI = 2x.`, `Kc = (2x)² / (1,00 − x)² = 49. É um quadrado perfeito: tire a raiz dos dois lados.`, `2x / (1,00 − x) = 7 → 2x = 7 − 7x → 9x = 7 → x = 0,778 mol/L.`, `[HI] = 2 × 0,778 = 1,56 mol/L; [H₂] = [I₂] = 1,00 − 0,778 = 0,222 mol/L.`, `Conferência: 1,556² / 0,222² = 2,421 / 0,0493 ≈ 49.`],
        resposta: `[HI] ≈ <b>1,56 mol/L</b>; [H₂] = [I₂] ≈ <b>0,222 mol/L</b>`,
      },
      {
        t: "tampão (de prova)",
        enunciado: `Um litro de tampão tem 0,100 mol de CH₃COOH e 0,100 mol de CH₃COONa (pKa = 4,74). Qual o pH antes e depois de adicionar 0,010 mol de HCl? Compare com 1 L de água pura.`,
        passos: [`Antes: pH = 4,74 + log(0,100/0,100) = 4,74 + 0 = 4,74.`, `O H⁺ reage com o acetato: CH₃COO⁻ + H⁺ → CH₃COOH.`, `Depois: acetato = 0,100 − 0,010 = 0,090 mol; ácido = 0,100 + 0,010 = 0,110 mol.`, `pH = 4,74 + log(0,090/0,110) = 4,74 + (−0,087) = 4,65.`, `Em água pura: [H⁺] = 0,010 mol/L → pH = 2,00 (queda de 5 unidades, contra 0,09 no tampão).`],
        resposta: `pH vai de <b>4,74</b> para <b>4,65</b>; na água pura iria de 7,00 para 2,00`,
      },
    ],
    erros: [
      { errado: `Achar que no equilíbrio as concentrações de reagentes e produtos são iguais.`, certo: `No equilíbrio as concentrações são <b>constantes</b>; podem ser muito diferentes.`, porque: `O que se iguala são as <b>velocidades</b> direta e inversa.` },
      { errado: `Incluir o CaCO₃(s) e o CaO(s) no Kc de CaCO₃(s) ⇌ CaO(s) + CO₂(g).`, certo: `Kc = [CO₂]; Kp = P(CO₂).`, porque: `A “concentração” de um sólido puro é constante e já está embutida no K.` },
      { errado: `Dizer que um catalisador aumenta o rendimento no equilíbrio.`, certo: `Ele só faz o equilíbrio ser alcançado mais depressa.`, porque: `Ele baixa a energia de ativação dos dois sentidos igualmente; K não muda.` },
      { errado: `Afirmar que adicionar reagente aumenta o valor de K.`, certo: `Adicionar reagente deixa Q abaixo de K; a reação anda para a direita até Q voltar a K, e K continua o mesmo.`, porque: `K só depende da temperatura (para uma dada equação).` },
      { errado: `Concluir que o Ag₂CrO₄ é menos solúvel que o AgCl só porque tem Kps menor.`, certo: `Calcule s: Ag₂CrO₄ tem s = 6,5×10⁻⁵ mol/L, maior que os 1,3×10⁻⁵ mol/L do AgCl.`, porque: `Os Kps têm fórmulas diferentes (4s³ e s²); só se comparam direto sais de mesma proporção.` },
    ],
    aplicacoes: [
      `<b>Fertilizantes</b>: o processo Haber-Bosch, guiado por Le Chatelier (pressão alta, remoção do NH₃), produz mais de 150 milhões de toneladas de amônia por ano.`,
      `<b>Sangue e medicina</b>: o tampão bicarbonato mantém o pH em 7,35–7,45; acidose e alcalose são desvios desse equilíbrio, compensados pela respiração (CO₂) e pelos rins (HCO₃⁻).`,
      `<b>Hemoglobina e altitude</b>: Hb + O₂ ⇌ HbO₂ se desloca para a esquerda com menos O₂ no ar; o corpo responde produzindo mais hemoglobina, o que atletas exploram ao treinar em altitude.`,
      `<b>Saúde bucal</b>: o esmalte é hidroxiapatita, Ca₅(PO₄)₃OH; ácidos consomem OH⁻ e o dissolvem. O flúor forma fluorapatita, de Kps menor e mais resistente.`,
      `<b>Análise química e radiologia</b>: o BaSO₄ (Kps ≈ 1×10⁻¹⁰) é tão pouco solúvel que pode ser ingerido como contraste de raio X, embora o Ba²⁺ livre seja tóxico.`,
    ],
    teste: [
      { p: `Em N₂ + 3 H₂ ⇌ 2 NH₃ (ΔH &lt; 0), o que aumenta a quantidade de NH₃ no equilíbrio?`, op: [`Aquecer o sistema.`, `Adicionar um catalisador.`, `Comprimir o sistema (aumentar a pressão).`, `Aumentar o volume do recipiente.`], certa: 2, explica: `Comprimir favorece o lado com menos mols de gás (2 contra 4). Aquecer favorece o sentido endotérmico (inverso); o catalisador não desloca.` },
      { p: `Para uma reação com K = 1×10³, mede-se Q = 5×10⁴. O que acontece?`, op: [`A reação anda para a direita.`, `A reação anda para a esquerda, consumindo produtos.`, `Já está em equilíbrio.`, `K aumenta até igualar Q.`], certa: 1, explica: `Q &gt; K: há produto demais em relação ao equilíbrio; a reação inversa predomina até Q baixar a K.` },
      { p: `Qual perturbação muda o valor numérico de K?`, op: [`Mudar a temperatura.`, `Adicionar reagente.`, `Comprimir o sistema.`, `Adicionar catalisador.`], certa: 0, explica: `As outras deslocam o equilíbrio (ou não) sem alterar K. Só a temperatura muda K, de acordo com o sinal de ΔH.` },
      { p: `Adicionar NaCl a uma solução saturada de AgCl…`, op: [`aumenta a solubilidade do AgCl.`, `não muda nada, porque o Kps é constante.`, `dissolve mais AgCl, porque aumenta a força iônica.`, `faz precipitar mais AgCl (efeito do íon comum).`], certa: 3, explica: `O Cl⁻ extra deixa Q = [Ag⁺][Cl⁻] maior que Kps; o sistema precipita AgCl até voltar a Kps. O Kps é constante, a solubilidade não.` },
      { p: `Um tampão HA/A⁻ com [A⁻] = 10·[HA] tem pH igual a…`, op: [`pKa − 1`, `pKa`, `pKa + 1`, `10·pKa`], certa: 2, explica: `pH = pKa + log 10 = pKa + 1. Esse é o limite útil do tampão.` },
      { p: `Por que o equilíbrio químico é chamado de dinâmico?`, op: [`Porque as concentrações oscilam o tempo todo.`, `Porque as reações direta e inversa continuam ocorrendo, com a mesma velocidade.`, `Porque a reação acaba e recomeça periodicamente.`, `Porque depende do movimento do recipiente.`], certa: 1, explica: `No nível molecular nada para; só o efeito líquido é nulo. Isótopos marcados mostram as moléculas trocando de lado.` },
    ],
    resumo: [
      `Equilíbrio: velocidades direta e inversa iguais; concentrações constantes (não iguais).`,
      `Kc = [produtos]<sup>coef</sup> / [reagentes]<sup>coef</sup>, sem sólidos nem líquidos puros; K ≫ 1 favorece produtos.`,
      `Q &lt; K → direita; Q &gt; K → esquerda; Q = K → equilíbrio.`,
      `Tabela ICE: Inicial, Variação (proporcional aos coeficientes), Equilíbrio; substitua em K e resolva x.`,
      `Kp = Kc·(RT)<sup>Δn</sup>, R = 0,08206 L·atm/(mol·K). Só a temperatura muda K; catalisador não desloca.`,
      `Kps = (xs)<sup>x</sup>(ys)<sup>y</sup>; íon comum reduz a solubilidade; Q &gt; Kps precipita.`,
      `Tampão: pH = pKa + log([A⁻]/[HA]); funciona em pKa ± 1.`,
    ],
    alem: {
      t: "Para ir além: de onde vem K e como ele muda com a temperatura",
      h: `<p>A termodinâmica dá o elo entre equilíbrio e energia: ΔG = ΔG° + RT ln Q. No equilíbrio, ΔG = 0 e Q = K, logo <b>ΔG° = −RT ln K</b>. Um ΔG° de −20 kJ/mol a 25 °C dá K = e<sup>20000/(8,314 × 298)</sup> ≈ 3×10³; um de +20 kJ/mol dá K ≈ 3×10⁻⁴. Por isso K varia em tantas ordens de grandeza.</p>
        <p>Combinando com ΔG° = ΔH° − TΔS° chega-se à equação de <b>van ’t Hoff</b>:</p>
        <div class="eq">ln ${fr("K₂", "K₁")} = −${fr("ΔH°", "R")} (${fr("1", "T₂")} − ${fr("1", "T₁")})</div>
        <p>Ela é a versão quantitativa do Le Chatelier térmico: com ΔH° &lt; 0, aquecer diminui K. Para a síntese da amônia, K cai mais de dez milhões de vezes entre 25 °C e 300 °C.</p>
        <p>Rigorosamente, K usa <b>atividades</b>, não concentrações: a atividade é a concentração dividida por 1 mol/L (ou a pressão dividida por 1 bar), corrigida por um coeficiente que se afasta de 1 em soluções concentradas. É por isso que K não tem unidade e que sólidos puros (atividade 1) somem da expressão.</p>`,
    },
  };

  // =====================================================================
  // Cinética química
  // =====================================================================
  A.cinetica = {
    tempo: 22, nivel: "Ensino médio → faculdade",
    objetivos: [
      "definir velocidade de reação e explicar, pela teoria das colisões, o que a acelera;",
      "escrever a lei de velocidade e determinar as ordens pelo método das velocidades iniciais;",
      "usar as leis integradas e a meia-vida para prever concentrações ao longo do tempo;",
      "calcular a energia de ativação e o efeito da temperatura com a equação de Arrhenius;",
      "explicar como um catalisador acelera a reação sem alterar ΔH nem o equilíbrio.",
    ],
    requisitos: [{ id: "termo", nome: "Termoquímica" }, { id: "equilibrio", nome: "Equilíbrio químico" }, { id: "solucoes", nome: "Soluções e concentração" }],
    secoes: [
      {
        t: "A ideia em uma frase",
        h: `<p>A termodinâmica diz <b>se</b> uma reação pode acontecer; a <b>cinética</b> diz <b>com que rapidez</b> ela acontece e <b>por qual caminho</b>. São perguntas independentes: o diamante virar grafite é espontâneo, mas leva bilhões de anos; uma explosão de TNT se completa em microssegundos.</p>
          <div class="analogia"><b>Analogia:</b> uma bola num vale alto, separada de um vale mais baixo por uma colina. Que ela “quer” descer (ΔG &lt; 0) não basta: ela precisa de um empurrão para passar pelo topo. A altura desse topo é a <b>energia de ativação</b>, e é ela que decide a velocidade.</div>
          <p>Pela <b>teoria das colisões</b>, as moléculas só reagem quando se chocam com <b>energia suficiente</b> (pelo menos a energia de ativação, E<sub>a</sub>) e com a <b>orientação certa</b>. Por isso a velocidade aumenta com a concentração (mais choques), com a temperatura (choques mais fortes), com a superfície de contato (palha de aço queima, prego não) e com catalisadores (topo mais baixo).</p>`,
      },
      {
        t: "Velocidade e lei de velocidade",
        h: `<p>A <b>velocidade</b> de uma reação é a rapidez com que um reagente some ou um produto aparece, dividida pelo coeficiente para que o valor seja o mesmo qualquer que seja a espécie. Para 2 N₂O₅ → 4 NO₂ + O₂:</p>
          <div class="eq">v = −${fr("1", "2")}${fr("Δ[N₂O₅]", "Δt")} = ${fr("1", "4")}${fr("Δ[NO₂]", "Δt")} = ${fr("Δ[O₂]", "Δt")}</div>
          <p>A <b>lei de velocidade</b> mostra como v depende das concentrações:</p>
          <div class="eq">v = k·[A]<sup>m</sup>·[B]<sup>n</sup></div>
          <p>k é a <b>constante de velocidade</b> (depende da temperatura e do catalisador); m e n são as <b>ordens</b> em relação a A e a B, e m + n é a ordem global. As ordens <b>vêm de experimentos</b>, não dos coeficientes. Em NO₂ + CO → NO + CO₂, a lei medida é v = k[NO₂]²: o CO nem aparece. Isso acontece porque a reação ocorre em etapas, e a etapa <b>lenta</b> (a determinante) é 2 NO₂ → NO₃ + NO. Só para uma <b>etapa elementar</b> os coeficientes são as ordens.</p>
          <p>A unidade de k muda com a ordem global: mol/(L·s) na ordem 0, s⁻¹ na 1ª, L/(mol·s) na 2ª, L²/(mol²·s) na 3ª. Ela tem de fazer v sair em mol/(L·s).</p>
          <h5>Método das velocidades iniciais</h5>
          <p>Faça experimentos variando uma concentração de cada vez e compare as velocidades. Se dobrar [A] dobra v, m = 1; se quadruplica, m = 2; se não muda, m = 0. Em geral, m = log(razão de v) / log(razão de [A]).</p>`,
      },
      {
        t: "Leis integradas e meia-vida",
        h: `<p>Integrando a lei de velocidade, obtém-se a concentração em função do tempo. Cada ordem gera uma reta num gráfico diferente, e é assim que se descobre a ordem a partir de dados de [A] × t:</p>
          <div class="tab-rolar"><table class="tb"><thead><tr><th>Ordem</th><th>Lei integrada</th><th>Gráfico reto</th><th>Meia-vida</th></tr></thead><tbody>
          <tr><td>0</td><td>[A] = [A]₀ − kt</td><td>[A] × t</td><td>[A]₀ / (2k)</td></tr>
          <tr><td>1</td><td>ln[A] = ln[A]₀ − kt</td><td>ln[A] × t</td><td>ln 2 / k</td></tr>
          <tr><td>2</td><td>1/[A] = 1/[A]₀ + kt</td><td>1/[A] × t</td><td>1 / (k[A]₀)</td></tr></tbody></table></div>
          <p>A <b>meia-vida</b> (t<sub>½</sub>) é o tempo para a concentração cair à metade. Na <b>1ª ordem</b> ela é <b>constante</b>, não depende de quanto se começou: é o que acontece no decaimento radioativo e na eliminação da maioria dos fármacos. Depois de n meias-vidas resta (½)ⁿ do inicial; após 10 meias-vidas, menos de 0,1%.</p>
          <p>No gráfico, [A]₀ = 0,80 mol/L e k = 0,0231 min⁻¹, então t<sub>½</sub> = 0,693 / 0,0231 = 30,0 min: 0,80 → 0,40 → 0,20 → 0,10 mol/L a cada 30 minutos.</p>`,
        grafico: {
          op: { altura: 230, modo: "dados", rotX: "t (min)", rotY: "[A] (mol/L)" },
          cena: {
            x: [0, 150], y: [0, 0.9],
            series: [
              { tipo: "funcao", f: (t) => 0.8 * Math.exp(-0.0231 * t), rotulo: "[A] = 0,80·e^(−0,0231·t)" },
              { tipo: "marca", x: 30, y: 0.4, cor: VERM, rotulo: "t½: 0,40" },
              { tipo: "marca", x: 60, y: 0.2, cor: VERM, rotulo: "2 t½: 0,20" },
              { tipo: "marca", x: 90, y: 0.1, cor: VERM, rotulo: "3 t½: 0,10" },
              { tipo: "seg", de: [30, 0], para: [30, 0.4], cor: CINZA, tracejado: true },
              { tipo: "seg", de: [60, 0], para: [60, 0.2], cor: CINZA, tracejado: true },
              { tipo: "seg", de: [90, 0], para: [90, 0.1], cor: CINZA, tracejado: true },
            ],
          },
          legenda: "Primeira ordem: a cada meia-vida (30 min) a concentração cai à metade, não importa o ponto de partida.",
        },
      },
      {
        t: "Energia de ativação e a equação de Arrhenius",
        h: `<p>Numa amostra, as moléculas têm energias muito variadas (distribuição de Maxwell-Boltzmann). A fração com energia acima de E<sub>a</sub> é proporcional a e<sup>−Ea/RT</sup>, e cresce muito com a temperatura. Arrhenius resumiu isso em:</p>
          <div class="eq">k = A · e<sup>−Ea/(RT)</sup></div>
          <p>A é o <b>fator de frequência</b> (choques por segundo com a orientação certa), E<sub>a</sub> está em J/mol, R = 8,314 J/(mol·K) e T em kelvin. Tomando o ln: ln k = ln A − (E<sub>a</sub>/R)·(1/T). Um gráfico de ln k contra 1/T é uma reta de inclinação −E<sub>a</sub>/R: é assim que se mede E<sub>a</sub>.</p>
          <p>Com duas temperaturas, A se cancela:</p>
          <div class="eq">ln ${fr("k₂", "k₁")} = ${fr("Ea", "R")} (${fr("1", "T₁")} − ${fr("1", "T₂")})</div>
          <p>Para E<sub>a</sub> = 50 kJ/mol, passar de 25 °C para 35 °C dá ln(k₂/k₁) = (50 000 / 8,314) × (1/298,15 − 1/308,15) = 0,655, ou k₂/k₁ = 1,9. Daí a regra prática de que “10 °C a mais dobram a velocidade”, válida só para E<sub>a</sub> em torno de 50 kJ/mol perto da temperatura ambiente. É por isso que a geladeira conserva alimentos e que a febre acelera o metabolismo.</p>`,
      },
      {
        t: "Catalisadores",
        h: `<p>Um <b>catalisador</b> oferece um <b>caminho alternativo</b> com energia de ativação menor. Ele participa das etapas, mas é regenerado no fim, por isso aparece na lei de velocidade e não na equação global. Como a barreira cai para os dois sentidos, ele acelera igualmente a reação direta e a inversa: <b>não muda ΔH, ΔG nem K</b>; só faz o equilíbrio chegar mais cedo.</p>
          <p>A decomposição da água oxigenada, 2 H₂O₂ → 2 H₂O + O₂ (ΔH = −98 kJ por mol de H₂O₂), tem E<sub>a</sub> ≈ 75 kJ/mol e é lenta no frasco. Com íons iodeto, E<sub>a</sub> cai para cerca de 56 kJ/mol. Se A não muda, a 25 °C isso multiplica k por e<sup>19 000/(8,314 × 298)</sup> ≈ 2×10³. A enzima catalase, no sangue, baixa ainda mais a barreira: é a espuma que aparece quando se põe água oxigenada num machucado.</p>
          <ul><li><b>Homogêneo</b>: na mesma fase dos reagentes (I⁻ em solução, enzimas).</li>
          <li><b>Heterogêneo</b>: em outra fase, geralmente um sólido onde os gases se adsorvem (Pt, Pd e Rh do catalisador automotivo; Fe na síntese da amônia).</li></ul>
          <div class="nota">Venenos de catalisador (chumbo, enxofre) bloqueiam a superfície ativa. Foi por isso que a gasolina com chumbo teve de sair do mercado quando os carros ganharam catalisadores.</div>`,
        grafico: {
          op: { altura: 230, modo: "dados", rotX: "caminho da reação", rotY: "energia (kJ/mol)" },
          cena: {
            x: [-0.02, 1.02], y: [-115, 100],
            series: [
              { tipo: "funcao", f: perfil(0, -98, 122.5), dominio: [0, 1], cor: VERM, rotulo: "sem catalisador" },
              { tipo: "funcao", f: perfil(0, -98, 103), dominio: [0, 1], cor: AZUL, rotulo: "com catalisador" },
              { tipo: "seg", de: [0.08, 0], para: [0.08, 75], cor: VERM },
              { tipo: "seg", de: [0.08, 75], para: [0.48, 75], cor: VERM, tracejado: true },
              { tipo: "seg", de: [0.24, 0], para: [0.24, 56], cor: AZUL },
              { tipo: "seg", de: [0.24, 56], para: [0.48, 56], cor: AZUL, tracejado: true },
              { tipo: "texto", x: 0.1, y: 87, texto: "Ea = 75" },
              { tipo: "texto", x: 0.33, y: 36, texto: "Ea = 56" },
              { tipo: "seg", de: [0.92, 0], para: [0.92, -98], cor: CINZA, tracejado: true },
              { tipo: "texto", x: 0.8, y: -45, texto: "ΔH = −98" },
            ],
          },
          legenda: "O catalisador abaixa o topo (Ea), mas reagentes e produtos ficam no mesmo nível: ΔH e K não mudam.",
        },
      },
    ],
    formulas: [
      { nome: "Lei de velocidade", eq: `v = k·[A]<sup>m</sup>·[B]<sup>n</sup>`, simbolos: [["v", "velocidade", "mol/(L·s)"], ["k", "constante de velocidade", "depende da ordem"], ["m, n", "ordens parciais (experimentais)", "—"]], obs: "As ordens só coincidem com os coeficientes em etapas elementares." },
      { nome: "Primeira ordem", eq: `[A] = [A]₀·e<sup>−kt</sup> &nbsp;&nbsp; t<sub>½</sub> = ${fr("ln 2", "k")}`, simbolos: [["[A]₀", "concentração inicial", "mol/L"], ["k", "constante de velocidade", "s⁻¹ (ou min⁻¹, h⁻¹)"], ["t", "tempo", "mesma unidade de 1/k"]], obs: "Equivale a ln[A] = ln[A]₀ − kt. A meia-vida não depende de [A]₀." },
      { nome: "Arrhenius", eq: `k = A·e<sup>−Ea/(RT)</sup> &nbsp;&nbsp; ln ${fr("k₂", "k₁")} = ${fr("Ea", "R")}(${fr("1", "T₁")} − ${fr("1", "T₂")})`, simbolos: [["Ea", "energia de ativação", "J/mol"], ["R", "8,314", "J/(mol·K)"], ["T", "temperatura absoluta", "K"], ["A", "fator de frequência", "mesma unidade de k"]], obs: "Use ln (não log), T em kelvin e Ea em J/mol." },
    ],
    exemplos: [
      {
        t: "direto",
        enunciado: `Um fármaco é eliminado em cinética de 1ª ordem com meia-vida de 6,0 h. Uma pessoa tem 500 mg dele no corpo. Quanto resta após 24 h? Em quanto tempo restam 50 mg?`,
        passos: [`24 h = 24 / 6,0 = 4 meias-vidas → resta (½)⁴ = 1/16.`, `m = 500 mg / 16 = 31,25 mg.`, `k = ln 2 / t½ = 0,693 / 6,0 h = 0,1155 h⁻¹.`, `ln(500/50) = k·t → t = ln 10 / 0,1155 h⁻¹ = 2,303 / 0,1155 = 19,9 h.`],
        resposta: `Restam <b>31 mg</b> após 24 h; chega a 50 mg em <b>≈ 19,9 h</b>`,
      },
      {
        t: "velocidades iniciais",
        enunciado: `Para A + B → produtos: exp. 1, [A] = 0,10 e [B] = 0,10 mol/L, v = 2,0×10⁻³ mol/(L·s); exp. 2, [A] = 0,20 e [B] = 0,10, v = 8,0×10⁻³; exp. 3, [A] = 0,10 e [B] = 0,20, v = 4,0×10⁻³. Ache a lei de velocidade e k.`,
        passos: [`Exp. 1 → 2: [A] dobra e v quadruplica (8,0/2,0 = 4 = 2²) → ordem 2 em A.`, `Exp. 1 → 3: [B] dobra e v dobra (4,0/2,0 = 2 = 2¹) → ordem 1 em B.`, `v = k[A]²[B], ordem global 3.`, `k = v / ([A]²[B]) = 2,0×10⁻³ / (0,10² × 0,10) = 2,0×10⁻³ / 1,0×10⁻³ = 2,0.`, `Unidade: (mol/(L·s)) / (mol/L)³ = L²/(mol²·s).`],
        resposta: `<b>v = 2,0·[A]²[B]</b>, com k = 2,0 L²/(mol²·s)`,
      },
      {
        t: "Arrhenius (de prova)",
        enunciado: `A constante de velocidade de uma reação dobra quando a temperatura sobe de 25 °C para 35 °C. Qual é a energia de ativação?`,
        passos: [`T₁ = 298,15 K; T₂ = 308,15 K; k₂/k₁ = 2.`, `1/T₁ − 1/T₂ = 0,0033540 − 0,0032452 = 1,0884×10⁻⁴ K⁻¹.`, `ln 2 = Ea/R × 1,0884×10⁻⁴ → Ea = 8,314 × 0,6931 / 1,0884×10⁻⁴.`, `Ea = 5,763 / 1,0884×10⁻⁴ = 5,29×10⁴ J/mol.`],
        resposta: `Ea ≈ <b>53 kJ/mol</b>`,
      },
    ],
    erros: [
      { errado: `Escrever a lei de velocidade direto da equação: para 2 NO₂ + F₂ → 2 NO₂F, v = k[NO₂]²[F₂].`, certo: `As ordens são medidas; para essa reação o experimento dá v = k[NO₂][F₂].`, porque: `A reação ocorre em etapas e a lei reflete a etapa lenta, não a equação global.` },
      { errado: `Usar T em °C na equação de Arrhenius.`, certo: `Sempre em kelvin: 25 °C = 298,15 K.`, porque: `A equação vem da distribuição de energia, que depende da temperatura absoluta; em °C, 1/T nem existe a 0 °C.` },
      { errado: `Dizer que um catalisador aumenta o rendimento ou torna exotérmica uma reação endotérmica.`, certo: `Ele só diminui Ea; ΔH, ΔG e K não mudam.`, porque: `O nível de energia de reagentes e produtos é o mesmo nos dois caminhos.` },
      { errado: `Achar que a meia-vida de uma reação de 1ª ordem diminui conforme a reação avança.`, certo: `Na 1ª ordem, t½ = ln 2/k é constante.`, porque: `Só na ordem 0 e na 2ª a meia-vida depende de [A]₀ (e por isso muda ao longo da reação).` },
      { errado: `Misturar log e ln: t½ = log 2 / k.`, certo: `t½ = ln 2 / k = 0,693/k.`, porque: `As leis integradas vêm de integrais de 1/[A], que dão logaritmo natural; log 2 = 0,301 erraria o resultado por um fator 2,3.` },
    ],
    aplicacoes: [
      `<b>Conservação de alimentos</b>: refrigerar de 25 °C para 4 °C reduz a velocidade das reações de deterioração várias vezes (para Ea ≈ 50 kJ/mol, cerca de 4,6 vezes).`,
      `<b>Farmacologia</b>: a meia-vida de eliminação define o intervalo entre doses; após cerca de 5 meias-vidas a droga é considerada eliminada (resta ~3%).`,
      `<b>Catalisador automotivo</b>: Pt, Pd e Rh convertem CO, hidrocarbonetos e NOₓ em CO₂, H₂O e N₂ em milissegundos, dentro do escapamento.`,
      `<b>Datação por carbono-14</b>: o decaimento é de 1ª ordem com t½ = 5730 anos; medir a fração restante de ¹⁴C dá a idade de restos orgânicos.`,
      `<b>Enzimas</b>: aceleram reações biológicas por fatores de até 10¹⁷; sem elas, a digestão de uma refeição levaria anos.`,
    ],
    teste: [
      { p: `Por que a palha de aço queima na chama e um prego de ferro, não?`, op: [`A palha de aço tem outra composição.`, `A palha tem muito mais superfície de contato com o O₂.`, `O prego tem energia de ativação negativa.`, `O ΔH da combustão do prego é positivo.`], certa: 1, explica: `É o mesmo ferro e a mesma reação (mesmo ΔH e Ea). A palha expõe muito mais átomos ao oxigênio, então há muito mais colisões por segundo.` },
      { p: `Uma reação tem v = k[A]²[B]. Se [A] e [B] forem ambas dobradas, a velocidade…`, op: [`dobra.`, `quadruplica.`, `fica 6 vezes maior.`, `fica 8 vezes maior.`], certa: 3, explica: `2² × 2¹ = 8. Os fatores das concentrações se multiplicam, elevados às suas ordens.` },
      { p: `O que um catalisador muda numa reação reversível?`, op: [`Diminui a energia de ativação dos dois sentidos, e o equilíbrio é atingido mais rápido.`, `Desloca o equilíbrio para os produtos.`, `Torna o ΔH mais negativo.`, `Aumenta a constante de equilíbrio.`], certa: 0, explica: `O catalisador abre um caminho de barreira menor para ida e volta. O estado inicial e o final não mudam, logo ΔH e K também não.` },
      { p: `Numa reação de 1ª ordem com t½ = 10 min, que fração do reagente resta após 40 min?`, op: [`1/4`, `1/8`, `1/16`, `0, pois já acabou`], certa: 2, explica: `40 min são 4 meias-vidas: (½)⁴ = 1/16. Uma reação de 1ª ordem nunca “acaba” de forma exata, só se aproxima de zero.` },
      { p: `Por que aumentar a temperatura acelera tanto as reações?`, op: [`Porque aumenta a energia de ativação.`, `Porque muda as ordens de reação.`, `Porque a fração de choques com energia acima de Ea cresce exponencialmente.`, `Porque diminui o ΔH.`], certa: 2, explica: `Ea é praticamente constante; o que cresce é e<sup>−Ea/RT</sup>, a fração de moléculas energéticas o bastante. O número total de choques aumenta bem menos.` },
      { p: `Um gráfico de ln[A] × t para uma reação é uma reta de inclinação −0,05 s⁻¹. O que se conclui?`, op: [`A reação é de ordem zero com k = 0,05 mol/(L·s).`, `A reação é de 2ª ordem.`, `A reação é de 1ª ordem com k = 0,05 s⁻¹ e t½ ≈ 13,9 s.`, `Nada: é preciso saber a equação química.`], certa: 2, explica: `Reta em ln[A] × t é a assinatura da 1ª ordem; a inclinação é −k. t½ = 0,693/0,05 = 13,9 s.` },
    ],
    resumo: [
      `Cinética = rapidez e caminho; termodinâmica = possibilidade. Espontâneo não é sinônimo de rápido.`,
      `Teoria das colisões: choques com energia ≥ Ea e orientação certa. Concentração, temperatura, superfície e catalisador aceleram.`,
      `v = k[A]<sup>m</sup>[B]<sup>n</sup>; ordens vêm de experimentos (velocidades iniciais), não dos coeficientes.`,
      `1ª ordem: [A] = [A]₀e<sup>−kt</sup>, t½ = ln 2/k, constante; reta em ln[A] × t.`,
      `Arrhenius: k = A·e<sup>−Ea/RT</sup>; ln(k₂/k₁) = (Ea/R)(1/T₁ − 1/T₂), T em K, Ea em J/mol.`,
      `Catalisador baixa Ea pelos dois sentidos; não muda ΔH, ΔG nem K.`,
    ],
    alem: {
      t: "Para ir além: mecanismos, estado estacionário e a teoria do estado de transição",
      h: `<p>Uma lei de velocidade é a “impressão digital” de um <b>mecanismo</b>, a sequência de etapas elementares. Se a primeira etapa é lenta, ela dita a lei. Se há um intermediário que se forma e some depressa, usa-se a <b>aproximação do estado estacionário</b> (d[I]/dt ≈ 0) para eliminá-lo. É assim que nasce a equação de <b>Michaelis-Menten</b> das enzimas, v = v<sub>máx</sub>[S]/(K<sub>M</sub> + [S]): de 1ª ordem com pouco substrato e de ordem zero quando a enzima satura.</p>
        <p>A <b>teoria do estado de transição</b> (Eyring, 1935) dá sentido físico ao fator A: o topo da barreira é um complexo ativado em quase-equilíbrio com os reagentes, e</p>
        <div class="eq">k = ${fr("k<sub>B</sub>T", "h")} · e<sup>ΔS‡/R</sup> · e<sup>−ΔH‡/RT</sup></div>
        <p>com k<sub>B</sub>T/h ≈ 6×10¹² s⁻¹ a 25 °C. O termo de entropia de ativação, ΔS‡, explica por que reações que exigem uma orientação muito precisa (ΔS‡ muito negativo) são lentas mesmo com barreira baixa. Também mostra a ligação entre cinética e equilíbrio: para uma etapa elementar, K = k<sub>direta</sub>/k<sub>inversa</sub>, e é exatamente por isso que o catalisador, que multiplica as duas pelo mesmo fator, não altera K.</p>`,
    },
  };
})();
