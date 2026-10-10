/*
 * Aulas de Física, parte 2 (formato em js/estudo/aula.js): movimento, forças,
 * óptica, ondas e termologia. Só acrescenta chaves em E.aulas.fisica.
 */
(function () {
  "use strict";
  const E = window.LAB && window.LAB.estudo;
  if (!E) return;
  const A = (E.aulas.fisica = E.aulas.fisica || {});
  const fr = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;

  // ======================================================================
  // 1. Movimento: MRU e MRUV
  // ======================================================================
  A.movimento = {
    tempo: 18, nivel: "Ensino médio → faculdade · a base de toda a mecânica",
    objetivos: [
      "distinguir posição, deslocamento, distância percorrida, velocidade e aceleração;",
      "escrever e usar as equações horárias do MRU e do MRUV, inclusive a de Torricelli;",
      "ler gráficos s × t, v × t e a × t: inclinação e área de cada um;",
      "resolver problemas de frenagem e de encontro de dois móveis.",
    ],
    requisitos: [{ id: "conversor", nome: "Unidades e conversões (km/h ↔ m/s)" }],
    secoes: [
      {
        t: "A ideia em uma frase",
        h: `<p>Descrever um movimento é responder, a cada instante, <b>onde</b> o corpo está (posição), <b>quão rápido e para que lado</b> ele vai (velocidade) e <b>como essa velocidade está mudando</b> (aceleração). A cinemática não pergunta por que o corpo se move; isso fica para as leis de Newton.</p>
          <div class="analogia"><b>Analogia:</b> no painel de um carro, o hodômetro mostra quanto se andou (posição), o velocímetro mostra a velocidade e o seu corpo sendo empurrado contra o banco quando o motorista pisa fundo é a aceleração. Velocímetro parado num número: aceleração zero. Ponteiro subindo ou descendo: há aceleração.</div>
          <p>Tudo começa escolhendo um <b>eixo</b> com origem e sentido positivo. Velocidade e aceleração ganham sinal: v negativa significa andar no sentido oposto ao eixo; a com sinal oposto ao de v significa frear. Escolher o eixo no início evita metade dos erros de sinal.</p>`,
      },
      {
        t: "Movimento uniforme (MRU)",
        h: `<p>Se a velocidade é constante, o corpo percorre distâncias iguais em tempos iguais. A posição cresce (ou decresce) em linha reta com o tempo:</p>
          <div class="eq">s = s₀ + v·t</div>
          <p>Um ônibus que passa pelo quilômetro 20 de uma estrada a 60 km/h constantes estará no quilômetro 20 + 60·2 = 140 duas horas depois. No gráfico s × t, o MRU é uma <b>reta</b> cuja <b>inclinação é a velocidade</b>: quanto mais inclinada, mais rápido. Reta descendo indica velocidade negativa (movimento retrógrado).</p>
          <p>No gráfico abaixo, A sai da origem a 20 m/s e B sai de 300 m a −10 m/s (vindo em sentido contrário). O ponto em que as retas se cruzam é o <b>encontro</b>: mesmo lugar, mesmo instante.</p>`,
        grafico: {
          op: { altura: 220, modo: "dados", rotX: "t (s)", rotY: "s (m)" },
          cena: { x: [0, 15], y: [0, 320], series: [
            { tipo: "funcao", f: (t) => 20 * t, dominio: [0, 15], rotulo: "A: s = 20·t", cor: "#4da3ff" },
            { tipo: "funcao", f: (t) => 300 - 10 * t, dominio: [0, 15], rotulo: "B: s = 300 − 10·t", cor: "#f0a23c" },
            { tipo: "marca", x: 10, y: 200, rotulo: "encontro (10 s; 200 m)" },
          ] },
          legenda: "Dois móveis em MRU: a inclinação de cada reta é a velocidade; o cruzamento é o encontro.",
        },
      },
      {
        t: "Movimento uniformemente variado (MRUV)",
        h: `<p>Se a <b>aceleração é constante</b>, a velocidade muda sempre do mesmo tanto a cada segundo. Com a = 2 m/s², a velocidade aumenta 2 m/s a cada segundo:</p>
          <div class="eq">v = v₀ + a·t</div>
          <p>E a posição? Como a velocidade varia linearmente, o deslocamento é a área de um trapézio no gráfico v × t: Δs = (v₀ + v)·t/2. Substituindo v = v₀ + a·t, chega-se à equação horária do MRUV:</p>
          <div class="eq">s = s₀ + v₀·t + ${fr("a·t²", "2")}</div>
          <p>Exemplo do gráfico: v₀ = 4 m/s e a = 2 m/s². Em 5 s, v = 4 + 2·5 = 14 m/s, e a área sombreada é (4 + 14)·5/2 = <b>45 m</b>. A fórmula dá o mesmo: 4·5 + 2·25/2 = 20 + 25 = 45 m. O gráfico s × t do MRUV é uma <b>parábola</b>, porque a posição depende de t².</p>`,
        grafico: {
          op: { altura: 220, modo: "dados", rotX: "t (s)", rotY: "v (m/s)" },
          cena: { x: [0, 6], y: [0, 18], series: [
            { tipo: "area", f: (t) => 4 + 2 * t, a: 0, b: 5, rotulo: "área = Δs = 45 m", cor: "#4da3ff" },
            { tipo: "funcao", f: (t) => 4 + 2 * t, dominio: [0, 6], rotulo: "v = 4 + 2·t", cor: "#4da3ff" },
          ] },
          legenda: "No gráfico v × t, a inclinação é a aceleração e a área sob a reta é o deslocamento.",
        },
      },
      {
        t: "Torricelli: quando o tempo não aparece",
        h: `<p>Muitos problemas não dão nem pedem o tempo: “de quanto precisa a pista para o avião decolar?”, “quantos metros o carro anda até parar?”. Eliminando t entre v = v₀ + a·t e a equação da posição, obtém-se a equação de Torricelli:</p>
          <div class="eq">v² = v₀² + 2·a·Δs</div>
          <p>Aplicação clássica, a <b>distância de frenagem</b>: com v = 0, Δs = v₀²/(2·|a|). Um carro a 72 km/h (20 m/s) que freia a 5 m/s² para em 20²/10 = <b>40 m</b>. A 108 km/h (30 m/s), com a mesma frenagem, precisa de 30²/10 = <b>90 m</b>. Aumentar a velocidade em 50% mais que dobrou a distância: ela cresce com o <b>quadrado</b> da velocidade.</p>
          <div class="destaque">Por isso limites de velocidade importam tanto: a distância de frenagem cresce com v², e a energia de uma batida também.</div>`,
      },
      {
        t: "Lendo os três gráficos",
        h: `<p>Os gráficos do movimento conversam entre si por duas operações: <b>inclinação</b> (quanto o gráfico sobe por segundo) e <b>área</b> (o que se acumula ao longo do tempo).</p>
          <div class="tab-rolar"><table class="tb">
            <tr><th>Gráfico</th><th>Inclinação dá</th><th>Área sob a curva dá</th></tr>
            <tr><td>s × t</td><td>velocidade</td><td>(sem significado útil)</td></tr>
            <tr><td>v × t</td><td>aceleração</td><td>deslocamento Δs</td></tr>
            <tr><td>a × t</td><td>(variação da aceleração)</td><td>variação de velocidade Δv</td></tr>
          </table></div>
          <p>Área <b>abaixo</b> do eixo do tempo conta como negativa. Um corpo lançado para cima com 10 m/s e a = −2 m/s² para em t = 5 s e volta: de 0 a 5 s a área de v × t é +25 m e de 5 a 8 s é −9 m. O deslocamento é 16 m, mas a <b>distância percorrida</b> é 25 + 9 = 34 m. Deslocamento é “onde terminei em relação a onde comecei”; distância é “quanto o hodômetro marcou”.</p>`,
      },
      {
        t: "Encontro de dois móveis",
        h: `<p>Dois corpos se encontram quando estão <b>no mesmo lugar no mesmo instante</b>. O método é sempre o mesmo:</p>
          <ol><li>Escolha <b>um único eixo</b> para os dois (mesma origem, mesmo sentido positivo).</li>
          <li>Escreva s<sub>A</sub>(t) e s<sub>B</sub>(t), com os sinais certos das velocidades.</li>
          <li>Iguale: s<sub>A</sub>(t) = s<sub>B</sub>(t) e resolva para t. Substitua t em qualquer equação para achar o local.</li></ol>
          <p>No MRU existe um atalho, a <b>velocidade relativa</b>: se os dois vão um ao encontro do outro, a distância entre eles diminui a v<sub>A</sub> + v<sub>B</sub>; se um persegue o outro, a v<sub>A</sub> − v<sub>B</sub>. Carros a 300 m de distância, a 20 m/s e 10 m/s, frente a frente: t = 300/30 = 10 s. Se um deles acelera, a equação fica do 2º grau e pode ter dois encontros (um ultrapassa, depois é ultrapassado).</p>`,
      },
    ],
    formulas: [
      { nome: "MRU", eq: `s = s₀ + v·t`, simbolos: [["s, s₀", "posição no instante t e no instante 0", "m"], ["v", "velocidade (constante)", "m/s"], ["t", "tempo", "s"]], obs: "Só vale com velocidade constante." },
      { nome: "Velocidade no MRUV", eq: `v = v₀ + a·t`, simbolos: [["v₀", "velocidade inicial", "m/s"], ["a", "aceleração (constante)", "m/s²"]], obs: "a com sinal oposto ao de v significa frear." },
      { nome: "Posição no MRUV", eq: `s = s₀ + v₀·t + ${fr("a·t²", "2")}`, simbolos: [["s₀", "posição inicial", "m"], ["a", "aceleração", "m/s²"]], obs: "Não esqueça a divisão por 2 no termo da aceleração." },
      { nome: "Torricelli", eq: `v² = v₀² + 2·a·Δs`, simbolos: [["Δs", "deslocamento", "m"]], obs: "Use quando o tempo não é dado nem pedido." },
    ],
    exemplos: [
      {
        t: "direto",
        enunciado: `Um carro parte do repouso com aceleração constante de 3 m/s². Qual a velocidade e quanto ele andou após 6 s?`,
        passos: [`Dados: v₀ = 0, a = 3 m/s², t = 6 s.`, `Velocidade: v = 0 + 3·6 = 18 m/s (64,8 km/h).`, `Deslocamento: Δs = 0·6 + 3·6²/2 = 3·36/2 = 54 m.`, `Conferência por Torricelli: v² = 0 + 2·3·54 = 324 → v = 18 m/s ✓.`],
        resposta: `<b>v = 18 m/s</b> e <b>Δs = 54 m</b>`,
      },
      {
        t: "frenagem com tempo de reação",
        enunciado: `Um motorista a 90 km/h vê um obstáculo, demora 0,8 s para pisar no freio e então desacelera a 5 m/s². Que distância percorre desde que vê o obstáculo até parar?`,
        passos: [`Converter: 90 km/h ÷ 3,6 = 25 m/s.`, `Durante a reação o carro está em MRU: d₁ = 25·0,8 = 20 m.`, `Na frenagem, por Torricelli: 0 = 25² − 2·5·d₂ → d₂ = 625/10 = 62,5 m.`, `Total: 20 + 62,5 = 82,5 m. (O tempo de frenagem é 25/5 = 5 s.)`],
        resposta: `<b>82,5 m</b>, dos quais 20 m antes mesmo de frear`,
      },
      {
        t: "de prova: encontro com aceleração",
        enunciado: `Um carro A está parado no sinal. Quando o sinal abre, A arranca com aceleração constante de 2 m/s² no exato instante em que uma moto B passa por ele a 10 m/s constantes. Quando e onde A alcança B? Qual a velocidade de A nesse momento?`,
        passos: [`Eixo com origem no sinal: s<sub>A</sub> = 0 + 0·t + 2·t²/2 = t² e s<sub>B</sub> = 10·t.`, `Encontro: t² = 10·t → t·(t − 10) = 0 → t = 0 (a largada) ou t = 10 s.`, `Local: s = 10·10 = 100 m (confira: 10² = 100 ✓).`, `Velocidade de A: v = 0 + 2·10 = 20 m/s, o dobro da moto.`],
        resposta: `A alcança B em <b>t = 10 s</b>, a <b>100 m</b> do sinal, com <b>20 m/s</b>`,
      },
    ],
    erros: [
      { errado: `Escrever s = s₀ + v₀·t + a·t² (sem o /2).`, certo: `s = s₀ + v₀·t + a·t²/2.`, porque: `O termo vem da área de um triângulo (base t, altura a·t), que tem o fator 1/2.` },
      { errado: `Usar 72 km/h direto numa conta com a em m/s².`, certo: `Converter antes: 72 km/h ÷ 3,6 = 20 m/s.`, porque: `Misturar unidades dá números 3,6 vezes (ou 12,96 vezes, ao quadrado) errados.` },
      { errado: `Pôr a = +5 m/s² num carro que freia andando no sentido positivo.`, certo: `Frear significa a com sinal oposto ao de v: a = −5 m/s².`, porque: `Com o sinal errado, a conta descreve um carro acelerando e Torricelli dá raiz de número negativo ou distâncias absurdas.` },
      { errado: `Achar que deslocamento e distância percorrida são sempre iguais.`, certo: `Só são iguais se o corpo não inverte o sentido. Com inversão, some as áreas de v × t sem sinal para obter a distância.` },
      { errado: `Usar as equações do MRUV com aceleração que muda (carro “acelerando cada vez mais”).`, certo: `As fórmulas valem só para aceleração constante; caso contrário, divida em trechos ou use áreas de gráficos (ou cálculo).` },
    ],
    aplicacoes: [
      `<b>Trânsito</b>: a distância de segurança e os limites de velocidade são calculados com Torricelli e com o tempo de reação (cerca de 1 s).`,
      `<b>Aviação</b>: o comprimento mínimo de pista sai de v² = 2·a·Δs com a velocidade de decolagem (cerca de 80 m/s num jato comercial).`,
      `<b>Esporte</b>: análises de vídeo de velocistas medem a aceleração na largada (mais de 4 m/s² nos primeiros metros dos 100 m rasos).`,
      `<b>Radares e GPS</b>: o celular estima sua velocidade dividindo deslocamentos por intervalos de tempo, exatamente a definição de velocidade média.`,
    ],
    teste: [
      { p: `No gráfico v × t de um movimento, o que representa a área entre a curva e o eixo do tempo?`, op: [`A aceleração.`, `O deslocamento.`, `A posição inicial.`, `A velocidade média.`], certa: 1, explica: `Área de v × t = velocidade × tempo = deslocamento. A inclinação desse gráfico é que dá a aceleração.` },
      { p: `Um carro dobra a velocidade antes de frear com a mesma desaceleração. A distância de frenagem fica…`, op: [`igual.`, `duas vezes maior.`, `quatro vezes maior.`, `metade.`], certa: 2, explica: `Δs = v₀²/(2a): dobrar v₀ multiplica a distância por 2² = 4.` },
      { p: `Uma bola lançada para cima está no ponto mais alto. Nesse instante…`, op: [`velocidade e aceleração são zero.`, `a velocidade é zero, mas a aceleração continua sendo g, para baixo.`, `a aceleração é zero, mas a velocidade não.`, `velocidade e aceleração apontam para cima.`], certa: 1, explica: `A gravidade não “desliga” no topo. A velocidade zera e troca de sinal justamente porque a aceleração continua agindo.` },
      { p: `No gráfico s × t, um trecho reto e horizontal significa que o corpo está…`, op: [`em MRU com velocidade alta.`, `acelerando.`, `freando.`, `parado.`], certa: 3, explica: `A posição não muda com o tempo: inclinação zero, velocidade zero.` },
      { p: `Dois carros a 200 m um do outro vêm frente a frente, a 15 m/s e 25 m/s. Em quanto tempo se encontram?`, op: [`5 s`, `8 s`, `20 s`, `13,3 s`], certa: 0, explica: `Indo um ao encontro do outro, a distância diminui a 15 + 25 = 40 m/s: t = 200/40 = 5 s.` },
      { p: `Quando usar a equação de Torricelli em vez de v = v₀ + a·t?`, op: [`Quando a velocidade é constante.`, `Quando o problema não dá nem pede o tempo.`, `Sempre que houver atrito.`, `Só em queda livre.`], certa: 1, explica: `Torricelli é a combinação das outras duas com o tempo eliminado: liga velocidades, aceleração e deslocamento.` },
    ],
    resumo: [
      `Escolha um eixo: velocidades e acelerações ganham sinal.`,
      `MRU: s = s₀ + v·t (reta no gráfico s × t).`,
      `MRUV: v = v₀ + a·t e s = s₀ + v₀·t + a·t²/2 (parábola em s × t).`,
      `Torricelli: v² = v₀² + 2·a·Δs, para quando o tempo não aparece.`,
      `Inclinação de s × t = v; inclinação de v × t = a; área de v × t = Δs; área de a × t = Δv.`,
      `Encontro: iguale s<sub>A</sub>(t) = s<sub>B</sub>(t), com o mesmo eixo para os dois.`,
    ],
    alem: {
      t: "Para ir além: derivadas, integrais e o limite do modelo",
      h: `<p>Na faculdade, velocidade e aceleração são definidas como <b>derivadas</b>: v = ds/dt e a = dv/dt. As “inclinações” dos gráficos são exatamente isso. A operação inversa, a <b>integral</b>, é a “área sob a curva”: Δs = ∫ v dt. Com a constante, integrar duas vezes dá s = s₀ + v₀·t + a·t²/2, e a regra da cadeia (a = dv/dt = v·dv/ds) leva a Torricelli: ∫ a ds = ∫ v dv → a·Δs = (v² − v₀²)/2.</p>
        <p>O MRUV é um modelo. Um carro real tem aceleração que cai à medida que a velocidade sobe (resistência do ar, troca de marchas); um paraquedista tende a uma velocidade terminal. Nesses casos a aceleração depende do tempo ou da velocidade, e as fórmulas deste capítulo deixam de valer: resolve-se uma equação diferencial ou se integra numericamente, somando pequenos trechos em que a aceleração é quase constante.</p>
        <p>Curiosidade histórica: Galileu chegou à lei Δs ∝ t² rolando esferas em rampas suaves (para “diluir” a gravidade) e medindo tempos com relógios de água, por volta de 1604. Ele mostrou que as distâncias em segundos sucessivos crescem como 1, 3, 5, 7…, os números ímpares.</p>`,
    },
  };

  // ======================================================================
  // 2. Forças e leis de Newton
  // ======================================================================
  A.forcas = {
    tempo: 20, nivel: "Ensino médio → faculdade · dinâmica",
    objetivos: [
      "enunciar e aplicar as três leis de Newton em situações do cotidiano;",
      "desenhar o diagrama de corpo livre e decompor forças em eixos convenientes;",
      "resolver o plano inclinado com e sem atrito;",
      "decidir se um corpo desliza comparando a força com o atrito estático máximo;",
      "resolver sistemas de blocos ligados por fios e polias.",
    ],
    requisitos: [{ id: "movimento", nome: "Movimento (MRU e MRUV)" }],
    secoes: [
      {
        t: "A ideia em uma frase",
        h: `<p><b>Força é interação</b>: um empurrão, um puxão, a atração da Terra. Forças não mantêm o movimento; elas <b>mudam</b> o movimento. Um corpo sem força resultante continua como está, parado ou em linha reta com velocidade constante. Quando a resultante não é zero, ele acelera, e quanto maior a massa, mais difícil é acelerá-lo.</p>
          <div class="analogia"><b>Analogia:</b> empurrar um carrinho de supermercado vazio e um cheio com a mesma força. O vazio dispara; o cheio mal sai do lugar. A força é a mesma, a massa (a “resistência a mudar de velocidade”) é que muda. É isso que a 2ª lei diz: a = F/m.</div>
          <p>A unidade de força é o newton: 1 N é a força que dá a 1 kg uma aceleração de 1 m/s². Na superfície da Terra, um corpo de 1 kg pesa cerca de 9,8 N; uma maçã média pesa algo perto de 1 N.</p>`,
      },
      {
        t: "As três leis",
        h: `<p><b>1ª lei (inércia)</b>: se a força resultante é zero, a velocidade não muda. Num ônibus que freia, você é “jogado” para a frente porque seu corpo tende a continuar com a velocidade que tinha; ninguém o empurrou.</p>
          <p><b>2ª lei</b>: a força resultante é a massa vezes a aceleração, <b>F<sub>res</sub> = m·a</b>, e aponta para onde o corpo acelera. Atenção à palavra <b>resultante</b>: é a soma vetorial de todas as forças, não uma delas.</p>
          <p><b>3ª lei (ação e reação)</b>: se A empurra B, B empurra A com força de mesmo módulo e sentido oposto. As duas forças agem em <b>corpos diferentes</b>, por isso nunca se cancelam. Quando você anda, empurra o chão para trás e o chão o empurra para a frente.</p>
          <div class="nota">A normal <b>não</b> é a reação do peso. O peso é a Terra puxando você; a reação dele é você puxando a Terra. A normal é o chão empurrando você; a reação dela é você comprimindo o chão.</div>`,
      },
      {
        t: "Diagrama de corpo livre",
        h: `<p>Todo problema de dinâmica começa isolando o corpo e desenhando <b>só as forças que agem sobre ele</b>, cada uma como uma seta. Depois escolhem-se eixos (de preferência um deles na direção da aceleração) e aplica-se a 2ª lei em cada eixo: ΣF<sub>x</sub> = m·a<sub>x</sub>, ΣF<sub>y</sub> = m·a<sub>y</sub>.</p>
          <p>No desenho abaixo, um bloco de 10 kg (P = 100 N com g = 10 m/s²) é puxado por F = 50 N a 37° da horizontal. Decompondo: F<sub>x</sub> = 50·0,8 = 40 N e F<sub>y</sub> = 50·0,6 = 30 N. Na vertical não há aceleração: N + 30 = 100 → <b>N = 70 N</b>, menor que o peso. Com μ<sub>c</sub> = 0,2, o atrito é 0,2·70 = 14 N, e a = (40 − 14)/10 = <b>2,6 m/s²</b>.</p>`,
        grafico: {
          op: { altura: 260, modo: "cartesiano", igual: true, rotX: "x (N)", rotY: "y (N)" },
          cena: { series: [
            { tipo: "seg", de: [-120, -22], para: [120, -22], cor: "#9ba7b6", legenda: false },
            { tipo: "linha", pts: [[-22, -22], [22, -22], [22, 22], [-22, 22], [-22, -22]], cor: "#7a8799", legenda: false, leitura: false },
            { tipo: "vetor", de: [0, 0], para: [0, -100], rotulo: "P", cor: "#e5646e" },
            { tipo: "vetor", de: [0, 0], para: [0, 70], rotulo: "N", cor: "#4da3ff" },
            { tipo: "vetor", de: [0, 0], para: [40, 30], rotulo: "F", cor: "#5cc98a" },
            { tipo: "vetor", de: [0, 0], para: [-14, 0], rotulo: "Fat", cor: "#f0a23c" },
          ] },
          legenda: "Diagrama de corpo livre de um bloco puxado em ângulo: as setas estão em escala (newtons).",
        },
      },
      {
        t: "Plano inclinado",
        h: `<p>Na rampa, use um eixo <b>ao longo</b> dela e outro <b>perpendicular</b>. Assim a normal e o atrito ficam alinhados com os eixos, e só o peso precisa ser decomposto:</p>
          <div class="eq">P<sub>x</sub> = P·sen θ (rampa abaixo) &nbsp;&nbsp; P<sub>y</sub> = P·cos θ (contra a rampa)</div>
          <p>Na perpendicular não há aceleração, então <b>N = P·cos θ</b>. Sem atrito, a 2ª lei ao longo da rampa dá m·a = m·g·sen θ, ou seja, <b>a = g·sen θ</b>, independente da massa. Numa rampa de 30° com g = 10 m/s², qualquer bloco desce a 5 m/s².</p>
          <p>Com atrito cinético: a = g·(sen θ − μ<sub>c</sub>·cos θ). O ângulo entre o peso e a perpendicular à rampa é o próprio θ, porque os dois têm lados perpendiculares entre si: é o detalhe geométrico que mais confunde, e vale a pena desenhar com calma uma vez.</p>`,
      },
      {
        t: "Atrito estático e cinético",
        h: `<p>O atrito tem duas personalidades. Enquanto o corpo está parado, o <b>atrito estático</b> se ajusta e vale exatamente o necessário para impedir o deslizamento, até um limite: Fat<sub>máx</sub> = μ<sub>e</sub>·N. Depois que desliza, vale o <b>atrito cinético</b>, Fat<sub>c</sub> = μ<sub>c</sub>·N, em geral um pouco menor (μ<sub>c</sub> &lt; μ<sub>e</sub>).</p>
          <p>Para decidir se desliza: calcule a força que tenta mover (F<sub>x</sub> ou P<sub>x</sub>) e compare com μ<sub>e</sub>·N. Se for menor ou igual, o corpo fica parado e o atrito <b>é igual</b> a essa força, não a μ<sub>e</sub>·N. No gráfico, uma caixa com N = 100 N, μ<sub>e</sub> = 0,4 e μ<sub>c</sub> = 0,3: o atrito acompanha a força aplicada até 40 N, cai para 30 N quando a caixa “desgruda” e fica constante.</p>
          <p>No plano inclinado, o critério vira <b>tg θ &gt; μ<sub>e</sub></b>: o bloco desliza sozinho a partir de um ângulo crítico que não depende da massa.</p>`,
        grafico: {
          op: { altura: 210, modo: "dados", rotX: "força aplicada (N)", rotY: "atrito (N)" },
          cena: { x: [0, 80], y: [0, 50], series: [
            { tipo: "linha", pts: [[0, 0], [40, 40]], rotulo: "estático (ajusta-se)", cor: "#4da3ff" },
            { tipo: "linha", pts: [[40, 40], [40, 30], [80, 30]], rotulo: "cinético (constante)", cor: "#f0a23c" },
            { tipo: "marca", x: 40, y: 40, rotulo: "μe·N = 40 N" },
          ] },
          legenda: "O atrito estático cresce com a força aplicada até o máximo; depois do deslizamento vale o cinético.",
        },
      },
      {
        t: "Blocos ligados por fio",
        h: `<p>Com um <b>fio ideal</b> (sem massa, inextensível) passando por uma polia ideal, a tração T é a mesma nas duas pontas e os blocos têm a mesma aceleração em módulo. Escreva a 2ª lei para cada bloco, no sentido do movimento:</p>
          <div class="eq">A (na mesa): T − Fat = m<sub>A</sub>·a &nbsp;&nbsp; B (pendurado): P<sub>B</sub> − T = m<sub>B</sub>·a</div>
          <p>Somando, a tração some (é força interna do sistema): <b>P<sub>B</sub> − Fat = (m<sub>A</sub> + m<sub>B</sub>)·a</b>. Com m<sub>A</sub> = 3 kg, m<sub>B</sub> = 2 kg, sem atrito e g = 10 m/s²: a = 20/5 = 4 m/s² e T = 2·(10 − 4) = 12 N. Repare que T é <b>menor</b> que o peso de B (20 N): se fosse igual, B não aceleraria.</p>`,
      },
    ],
    formulas: [
      { nome: "2ª lei de Newton", eq: `F<sub>res</sub> = m·a`, simbolos: [["F<sub>res</sub>", "soma vetorial das forças", "N"], ["m", "massa", "kg"], ["a", "aceleração", "m/s²"]], obs: "Aplique em cada eixo separadamente." },
      { nome: "Peso e componentes na rampa", eq: `P = m·g; P<sub>x</sub> = P·sen θ; P<sub>y</sub> = P·cos θ`, simbolos: [["g", "aceleração da gravidade", "m/s²"], ["θ", "inclinação da rampa", "°"]], obs: "Sem outras forças perpendiculares, N = P·cos θ." },
      { nome: "Atrito", eq: `Fat<sub>e</sub> ≤ μ<sub>e</sub>·N; Fat<sub>c</sub> = μ<sub>c</sub>·N`, simbolos: [["μ<sub>e</sub>, μ<sub>c</sub>", "coeficientes de atrito estático e cinético", "adimensional"], ["N", "força normal", "N"]], obs: "Parado: o atrito vale o necessário, até o máximo." },
    ],
    exemplos: [
      {
        t: "desliza ou não?",
        enunciado: `Uma caixa de 10 kg está parada num piso com μ<sub>e</sub> = 0,4 e μ<sub>c</sub> = 0,3. Alguém a empurra horizontalmente com 50 N. Ela se move? Com que aceleração? (g = 10 m/s²)`,
        passos: [`Normal: N = P = 10·10 = 100 N (força horizontal não altera a normal).`, `Atrito estático máximo: 0,4·100 = 40 N. Como 50 N > 40 N, a caixa desliza.`, `Deslizando, vale o cinético: 0,3·100 = 30 N.`, `2ª lei: a = (50 − 30)/10 = 2 m/s².`],
        resposta: `Desliza, com <b>a = 2 m/s²</b>`,
      },
      {
        t: "plano inclinado com atrito",
        enunciado: `Um bloco de 10 kg é solto numa rampa de 37° (sen 37° = 0,6; cos 37° = 0,8), com μ<sub>e</sub> = μ<sub>c</sub> = 0,5 e g = 10 m/s². Qual a aceleração?`,
        passos: [`P = 100 N; P<sub>x</sub> = 100·0,6 = 60 N; P<sub>y</sub> = 100·0,8 = 80 N = N.`, `Atrito estático máximo: 0,5·80 = 40 N < 60 N → desliza (tg 37° = 0,75 > 0,5).`, `Atrito cinético: 0,5·80 = 40 N, rampa acima.`, `a = (60 − 40)/10 = 2 m/s² rampa abaixo.`],
        resposta: `<b>a = 2 m/s²</b>`,
      },
      {
        t: "de prova: blocos e polia com atrito",
        enunciado: `Um bloco A de 4 kg sobre uma mesa (μ = 0,1) está ligado por fio ideal, via polia, a um bloco B de 1 kg pendurado. Ache a aceleração e a tração (g = 10 m/s²).`,
        passos: [`Pesos: P<sub>A</sub> = 40 N, P<sub>B</sub> = 10 N. Atrito máximo em A: 0,1·40 = 4 N < 10 N → o sistema se move.`, `Sistema inteiro: P<sub>B</sub> − Fat = (m<sub>A</sub> + m<sub>B</sub>)·a → 10 − 4 = 5·a → a = 1,2 m/s².`, `Bloco B: 10 − T = 1·1,2 → T = 8,8 N.`, `Conferência em A: T − 4 = 4·1,2 → T = 8,8 N ✓.`],
        resposta: `<b>a = 1,2 m/s²</b> e <b>T = 8,8 N</b>`,
      },
    ],
    erros: [
      { errado: `Dizer que a normal é sempre igual ao peso.`, certo: `A normal é o que for preciso para equilibrar as forças perpendiculares à superfície: na rampa é P·cos θ; puxando para cima em ângulo, é P − F·sen φ.` },
      { errado: `Achar que ação e reação se anulam.`, certo: `Elas agem em corpos diferentes; só forças no mesmo corpo se somam na resultante.`, porque: `Se se anulassem, nada jamais começaria a se mover.` },
      { errado: `Usar Fat = μ<sub>e</sub>·N para um corpo que continua parado.`, certo: `Parado, o atrito vale exatamente a força que tenta movê-lo; μ<sub>e</sub>·N é apenas o teto.` },
      { errado: `Achar que é preciso uma força na direção do movimento para mantê-lo.`, certo: `Velocidade constante exige resultante nula. A força do motor só compensa o atrito e o ar.`, porque: `É a 1ª lei: a ideia aristotélica de “força mantém movimento” foi derrubada por Galileu e Newton.` },
      { errado: `No sistema de blocos, dividir pela massa de um só bloco.`, certo: `Ao somar as equações, a massa que acelera é a total: m<sub>A</sub> + m<sub>B</sub>.` },
    ],
    aplicacoes: [
      `<b>Segurança veicular</b>: cinto e airbag aumentam o tempo de frenagem do corpo, reduzindo a força (F = m·a) que ele sofre numa colisão.`,
      `<b>Engenharia de estradas</b>: rampas e curvas são projetadas com o coeficiente de atrito pneu–asfalto (μ ≈ 0,7 seco, 0,4 molhado).`,
      `<b>Elevadores</b>: o cabo exerce mais que o peso ao acelerar para cima e menos ao acelerar para baixo; é a sensação de ficar “mais pesado”.`,
      `<b>Esportes</b>: chuteiras, tênis de corrida e pneus de Fórmula 1 são desenvolvidos para maximizar μ<sub>e</sub> e permitir acelerações maiores sem derrapar.`,
    ],
    teste: [
      { p: `Um livro está parado sobre uma mesa. A reação ao peso do livro é…`, op: [`a normal que a mesa faz no livro.`, `a força com que o livro atrai a Terra.`, `o atrito da mesa.`, `não existe, pois o livro está parado.`], certa: 1, explica: `Peso é a Terra puxando o livro; o par de ação e reação é o livro puxando a Terra. A normal tem outro par: o livro comprimindo a mesa.` },
      { p: `Uma caixa de 20 kg parada (μ<sub>e</sub> = 0,5, g = 10 m/s²) é empurrada horizontalmente com 60 N. A força de atrito vale…`, op: [`100 N`, `0 N`, `40 N`, `60 N`], certa: 3, explica: `Atrito máximo = 100 N > 60 N: a caixa não se move e o atrito estático iguala a força aplicada, 60 N.` },
      { p: `Sem atrito, dois blocos de massas diferentes descem a mesma rampa. A aceleração…`, op: [`é maior no mais pesado.`, `é a mesma para os dois.`, `é maior no mais leve.`, `depende da altura da rampa.`], certa: 1, explica: `a = g·sen θ: a massa se cancela. O mais pesado sofre força maior, mas tem também mais inércia.` },
      { p: `Um carro anda em linha reta a 80 km/h constantes. A força resultante sobre ele é…`, op: [`zero.`, `para a frente, igual à força do motor.`, `para trás, igual ao atrito.`, `igual ao peso.`], certa: 0, explica: `Velocidade constante → aceleração zero → resultante zero. As forças existem, mas se equilibram.` },
      { p: `Você puxa um trenó com uma corda inclinada para cima, em vez de horizontal. O atrito…`, op: [`aumenta, porque a força é maior.`, `não muda.`, `diminui, porque a normal diminui.`, `vira zero.`], certa: 2, explica: `A componente vertical da corda alivia o apoio: N = P − F·sen φ. Atrito proporcional a N cai junto.` },
    ],
    resumo: [
      `1ª lei: sem resultante, a velocidade não muda.`,
      `2ª lei: F<sub>res</sub> = m·a, em cada eixo.`,
      `3ª lei: ação e reação agem em corpos diferentes e nunca se anulam.`,
      `Diagrama de corpo livre primeiro; depois eixos e equações.`,
      `Rampa: P<sub>x</sub> = P·sen θ, N = P·cos θ, a = g·sen θ sem atrito.`,
      `Atrito estático ajusta-se até μ<sub>e</sub>·N; deslizando, vale μ<sub>c</sub>·N.`,
      `Blocos ligados: some as equações; a tração interna se cancela.`,
    ],
    alem: {
      t: "Para ir além: de onde vem o atrito e quando Newton não basta",
      h: `<p>As leis empíricas do atrito (atrito proporcional à normal e independente da área aparente) são de Amontons (1699) e Coulomb (1785). A explicação moderna: superfícies “lisas” se tocam só em picos microscópicos, e a <b>área real de contato</b> cresce proporcionalmente à força normal. As ligações que se formam nesses pontos é que resistem ao deslizamento. Por isso μ depende dos materiais, mas não do tamanho da caixa.</p>
        <p>Um jeito prático de medir μ<sub>e</sub>: incline uma prancha aos poucos até o bloco começar a escorregar. No ângulo crítico, P·sen θ<sub>c</sub> = μ<sub>e</sub>·P·cos θ<sub>c</sub>, então <b>μ<sub>e</sub> = tg θ<sub>c</sub></b>. O mesmo vale para o ângulo de repouso de pilhas de areia e grãos.</p>
        <p>As leis de Newton valem em <b>referenciais inerciais</b>. Dentro de um ônibus freando ou de um carrossel, aparecem “forças” sem agente (a que o joga para a frente, a centrífuga): são forças fictícias, artifícios para usar F = m·a num referencial acelerado. E para velocidades próximas à da luz, F = m·a dá lugar à dinâmica relativística, em que o momento é γ·m·v.</p>`,
    },
  };

  // ======================================================================
  // 3. Óptica: espelhos esféricos e lentes
  // ======================================================================
  A.optica = {
    tempo: 18, nivel: "Ensino médio → faculdade · óptica geométrica",
    objetivos: [
      "identificar os elementos de espelhos esféricos e lentes (foco, centro, vértice);",
      "traçar os raios notáveis e prever a imagem graficamente;",
      "usar a equação de Gauss e o aumento com a convenção de sinais;",
      "classificar a imagem (real ou virtual, direita ou invertida, maior ou menor);",
      "calcular a vergência e relacioná-la ao grau dos óculos.",
    ],
    secoes: [
      {
        t: "A ideia em uma frase",
        h: `<p>Espelhos curvos e lentes <b>desviam a luz</b> de modo organizado: raios que saem de um ponto do objeto voltam a se cruzar (ou parecem sair) de um único ponto, a <b>imagem</b>. Toda a óptica geométrica é descobrir onde fica esse ponto e como é a imagem.</p>
          <div class="analogia"><b>Analogia:</b> pense numa lente convergente como um funil para a luz: raios paralelos que chegam espalhados são “afunilados” para um mesmo ponto, o foco. É por isso que uma lupa ao sol concentra a luz e queima papel.</div>
          <p>Há dois tipos de imagem. A <b>real</b> é formada pelo encontro dos próprios raios e pode ser projetada numa tela (cinema, câmera, retina). A <b>virtual</b> é formada pelos <b>prolongamentos</b> dos raios: o olho a vê, mas nenhuma tela a captura (sua imagem num espelho plano, a imagem de uma lupa).</p>`,
      },
      {
        t: "Espelhos esféricos e lentes: os elementos",
        h: `<p>Um <b>espelho esférico</b> é uma calota de esfera espelhada. No <b>côncavo</b> a face refletora é a de dentro (colher pelo lado da concha); no <b>convexo</b>, a de fora (retrovisor de moto). Elementos: vértice V, centro de curvatura C e foco F, no meio entre os dois: <b>f = R/2</b>.</p>
          <p>Uma <b>lente</b> é um bloco transparente com faces curvas. No ar, lentes de bordas finas (mais grossas no meio) são <b>convergentes</b>; lentes de bordas grossas são <b>divergentes</b>. Elas têm dois focos, um de cada lado, à distância f do centro óptico.</p>
          <p>Os três <b>raios notáveis</b> bastam para achar qualquer imagem:</p>
          <ol><li>Raio <b>paralelo ao eixo</b> → sai passando pelo foco (ou como se viesse dele, no divergente/convexo).</li>
          <li>Raio que passa pelo <b>foco</b> → sai paralelo ao eixo.</li>
          <li>Raio pelo <b>centro óptico</b> da lente → segue reto; no espelho, o raio que incide no <b>vértice</b> reflete simétrico em relação ao eixo.</li></ol>`,
      },
      {
        t: "Equação de Gauss e aumento",
        h: `<p>Para raios próximos do eixo, distâncias medidas a partir do espelho ou da lente obedecem a:</p>
          <div class="eq">${fr("1", "f")} = ${fr("1", "p")} + ${fr("1", "p′")} &nbsp;&nbsp;&nbsp; A = ${fr("i", "o")} = −${fr("p′", "p")}</div>
          <p><b>Convenção de sinais</b> (a parte que decide a prova): f &gt; 0 no espelho côncavo e na lente convergente; f &lt; 0 no convexo e na divergente. Objeto real: p &gt; 0. Se p′ &gt; 0, a imagem é real; se p′ &lt; 0, é virtual. A &lt; 0 significa imagem invertida.</p>
          <p>No diagrama: lente convergente com f = 10 cm, objeto de 3 cm a 30 cm. Gauss: 1/p′ = 1/10 − 1/30 = 2/30 → <b>p′ = 15 cm</b>. Aumento: A = −15/30 = −0,5, então a imagem tem 1,5 cm e está de cabeça para baixo: <b>real, invertida e menor</b>. Os três raios coloridos se cruzam exatamente na ponta da imagem.</p>`,
        grafico: {
          op: { altura: 240, modo: "cartesiano", rotX: "eixo (cm)", rotY: "y (cm)" },
          cena: { x: [-36, 36], y: [-4.2, 4.2], series: [
            { tipo: "seg", de: [0, -4], para: [0, 4], cor: "#9ba7b6", largura: 3, rotulo: "lente convergente", etiqueta: false },
            { tipo: "marca", x: -10, y: 0, rotulo: "F", cor: "#e8edf3", raio: 4 },
            { tipo: "marca", x: 10, y: 0, rotulo: "F′", cor: "#e8edf3", raio: 4 },
            { tipo: "seg", de: [-30, 3], para: [0, 3], cor: "#f2c14e", rotulo: "raio paralelo", etiqueta: false },
            { tipo: "seg", de: [0, 3], para: [36, -7.8], cor: "#f2c14e", legenda: false, etiqueta: false },
            { tipo: "seg", de: [-30, 3], para: [36, -3.6], cor: "#5cc98a", rotulo: "raio pelo centro", etiqueta: false },
            { tipo: "seg", de: [-30, 3], para: [0, -1.5], cor: "#c58af9", rotulo: "raio pelo foco", etiqueta: false },
            { tipo: "seg", de: [0, -1.5], para: [36, -1.5], cor: "#c58af9", legenda: false, etiqueta: false },
            { tipo: "vetor", de: [-30, 0], para: [-30, 3], rotulo: "objeto", cor: "#4da3ff", largura: 3 },
            { tipo: "vetor", de: [15, 0], para: [15, -1.5], rotulo: "imagem", cor: "#f0a23c", largura: 3 },
          ] },
          legenda: "Objeto além de 2f numa lente convergente: imagem real, invertida e menor, entre F′ e 2f.",
        },
      },
      {
        t: "A posição do objeto decide a imagem",
        h: `<p>Para espelho côncavo e lente convergente, tudo depende de onde o objeto está em relação ao foco (f) e ao dobro do foco (2f, que no espelho é o centro C):</p>
          <div class="tab-rolar"><table class="tb">
            <tr><th>Objeto</th><th>Imagem</th><th>Uso</th></tr>
            <tr><td>muito longe</td><td>real, invertida, muito menor, quase no foco</td><td>câmera, olho, telescópio</td></tr>
            <tr><td>além de 2f</td><td>real, invertida, menor</td><td>câmera fotográfica</td></tr>
            <tr><td>em 2f</td><td>real, invertida, mesmo tamanho</td><td>copiadoras antigas</td></tr>
            <tr><td>entre f e 2f</td><td>real, invertida, maior</td><td>projetor, retroprojetor</td></tr>
            <tr><td>no foco</td><td>imprópria (raios saem paralelos)</td><td>farol, lanterna</td></tr>
            <tr><td>entre f e a lente/espelho</td><td>virtual, direita, maior</td><td>lupa, espelho de maquiagem</td></tr>
          </table></div>
          <p>Espelho convexo e lente divergente são mais simples: com objeto real, a imagem é <b>sempre virtual, direita e menor</b>. Isso amplia o campo de visão, por isso o convexo é usado em retrovisores, saídas de garagem e lojas.</p>`,
      },
      {
        t: "Vergência e óculos",
        h: `<p>A <b>vergência</b> mede o “poder” de desviar a luz: V = 1/f, com f <b>em metros</b>. A unidade é a dioptria (di), popularmente o “grau”. Uma lente de f = 50 cm = 0,5 m tem V = 2 di; uma de f = −25 cm tem V = −4 di.</p>
          <p>No olho <b>míope</b>, a imagem de objetos distantes se forma antes da retina: o olho converge demais. A correção é uma lente <b>divergente</b> (grau negativo). No <b>hipermétrope</b>, a imagem de objetos próximos se formaria atrás da retina: corrige-se com lente <b>convergente</b> (grau positivo). A presbiopia (“vista cansada”), que chega por volta dos 45 anos, também se corrige com lente convergente para leitura.</p>
          <p>Lentes encostadas somam vergências: V<sub>total</sub> = V₁ + V₂. É assim que o oftalmologista combina lentes de teste até achar o grau certo.</p>`,
      },
    ],
    formulas: [
      { nome: "Equação de Gauss", eq: `${fr("1", "f")} = ${fr("1", "p")} + ${fr("1", "p′")}`, simbolos: [["f", "distância focal (+ côncavo/convergente, − convexo/divergente)", "cm ou m"], ["p", "distância do objeto", "cm ou m"], ["p′", "distância da imagem (+ real, − virtual)", "cm ou m"]], obs: "Todas as distâncias na mesma unidade." },
      { nome: "Aumento linear", eq: `A = ${fr("i", "o")} = −${fr("p′", "p")}`, simbolos: [["i, o", "alturas da imagem e do objeto", "cm"], ["A", "aumento (− = invertida)", "adimensional"]], obs: "|A| > 1: imagem maior que o objeto." },
      { nome: "Vergência", eq: `V = ${fr("1", "f")}`, simbolos: [["V", "vergência", "di (= m⁻¹)"], ["f", "distância focal", "m"]], obs: "Converta f para metros antes de inverter." },
    ],
    exemplos: [
      {
        t: "direto: espelho côncavo",
        enunciado: `Um objeto de 3 cm está a 30 cm de um espelho côncavo de distância focal 10 cm. Onde fica a imagem e como ela é?`,
        passos: [`Gauss: 1/p′ = 1/10 − 1/30 = 3/30 − 1/30 = 2/30 → p′ = 15 cm (positivo: real, na frente do espelho).`, `Aumento: A = −15/30 = −0,5.`, `Altura: i = −0,5·3 = −1,5 cm (invertida).`],
        resposta: `Imagem a <b>15 cm</b>, <b>real, invertida e menor</b> (1,5 cm)`,
      },
      {
        t: "a lupa",
        enunciado: `Uma lupa (lente convergente, f = 10 cm) está a 5 cm de uma letra de 2 mm. Como é a imagem vista?`,
        passos: [`Gauss: 1/p′ = 1/10 − 1/5 = 1/10 − 2/10 = −1/10 → p′ = −10 cm (virtual, do lado da letra).`, `Aumento: A = −(−10)/5 = +2.`, `Altura: 2·2 mm = 4 mm, direita.`],
        resposta: `Imagem <b>virtual, direita e 2 vezes maior</b>, a 10 cm da lente`,
      },
      {
        t: "de prova: projetor",
        enunciado: `Um slide de 4 cm de altura está a 30 cm de uma lente, que projeta uma imagem nítida numa tela a 120 cm dela. Ache a distância focal, a vergência e o tamanho da imagem.`,
        passos: [`Imagem projetada é real: p′ = +120 cm, p = 30 cm.`, `Gauss: 1/f = 1/30 + 1/120 = 4/120 + 1/120 = 5/120 → f = 24 cm (convergente).`, `Vergência: V = 1/0,24 m ≈ 4,17 di.`, `Aumento: A = −120/30 = −4 → i = −16 cm (por isso o slide é colocado de cabeça para baixo no projetor).`],
        resposta: `<b>f = 24 cm</b>, <b>V ≈ 4,2 di</b>, imagem de <b>16 cm</b>, invertida`,
      },
    ],
    erros: [
      { errado: `Usar f positivo para lente divergente ou espelho convexo.`, certo: `Nesses casos f é negativo: uma divergente de 20 cm entra como f = −20 cm.`, porque: `Com o sinal errado, a conta descreve outro instrumento e a imagem sai real quando deveria ser virtual.` },
      { errado: `Calcular a vergência com f em centímetros (f = 25 cm → V = 0,04 di).`, certo: `Converta: f = 0,25 m → V = 4 di.` },
      { errado: `Achar que imagem virtual pode ser projetada numa tela.`, certo: `Só a imagem real (encontro de raios de verdade) aparece numa tela; a virtual existe apenas para quem olha através do sistema.` },
      { errado: `Achar que o espelho convexo aumenta a imagem.`, certo: `Com objeto real, o convexo dá sempre imagem menor; o ganho é o campo de visão mais amplo.` },
      { errado: `Esquecer o sinal de menos no aumento: A = p′/p.`, certo: `A = −p′/p. Imagem real (p′ > 0) sai invertida (A < 0).` },
    ],
    aplicacoes: [
      `<b>Saúde</b>: óculos e lentes de contato corrigem miopia (lente divergente), hipermetropia e presbiopia (convergentes); cirurgias a laser remodelam a córnea, que é a lente mais forte do olho (cerca de 43 di).`,
      `<b>Câmeras e celulares</b>: a objetiva forma uma imagem real, invertida e menor sobre o sensor; o foco automático move a lente para ajustar p′.`,
      `<b>Energia solar</b>: espelhos côncavos e cilíndricos concentram a luz do Sol num tubo com fluido para gerar vapor e eletricidade.`,
      `<b>Segurança</b>: espelhos convexos em garagens, ônibus e retrovisores mostram uma área maior, ao custo de objetos parecerem mais distantes.`,
    ],
    teste: [
      { p: `Qual imagem pode ser projetada numa parede?`, op: [`A virtual de uma lupa.`, `A real de uma lente convergente com objeto além do foco.`, `A de um espelho plano.`, `A de um espelho convexo.`], certa: 1, explica: `Só imagens reais, formadas pelo cruzamento dos próprios raios, aparecem numa tela.` },
      { p: `Um objeto real diante de um espelho convexo sempre produz imagem…`, op: [`real e invertida.`, `virtual, direita e maior.`, `virtual, direita e menor.`, `real e do mesmo tamanho.`], certa: 2, explica: `O convexo diverge a luz; os prolongamentos se cruzam atrás dele, mais perto que o foco, com imagem reduzida.` },
      { p: `Uma lente tem vergência de −2,5 di. Ela é…`, op: [`convergente, com f = 40 cm.`, `divergente, com f = 2,5 m.`, `convergente, com f = 2,5 cm.`, `divergente, com f = 40 cm.`], certa: 3, explica: `V negativa → divergente. |f| = 1/2,5 = 0,4 m = 40 cm.` },
      { p: `Pela equação de Gauss você obteve p′ = −12 cm. Isso significa que…`, op: [`a imagem é virtual.`, `errou a conta, distância não pode ser negativa.`, `a imagem é real e invertida.`, `o objeto é virtual.`], certa: 0, explica: `Na convenção de Gauss, p′ negativo indica imagem virtual (atrás do espelho ou do mesmo lado do objeto, na lente).` },
      { p: `Para usar uma lente convergente como lupa, o objeto deve ficar…`, op: [`além de 2f.`, `exatamente no foco.`, `entre o foco e a lente.`, `em 2f.`], certa: 2, explica: `Só com o objeto dentro da distância focal a imagem é virtual, direita e ampliada.` },
      { p: `Uma pessoa míope enxerga mal de longe porque…`, op: [`o olho converge pouco e precisa de lente convergente.`, `o olho converge demais e precisa de lente divergente.`, `a retina está perto demais e precisa de lente convergente.`, `o cristalino é opaco.`], certa: 1, explica: `No míope a imagem de objetos distantes cai antes da retina; uma lente divergente “afasta” a imagem até ela.` },
    ],
    resumo: [
      `Imagem real: raios se cruzam de verdade (projetável). Virtual: só os prolongamentos.`,
      `1/f = 1/p + 1/p′ e A = −p′/p.`,
      `f > 0: côncavo e convergente; f < 0: convexo e divergente.`,
      `p′ > 0 → real; p′ < 0 → virtual; A < 0 → invertida.`,
      `Convexo e divergente: sempre virtual, direita e menor.`,
      `Vergência V = 1/f com f em metros (dioptrias = graus).`,
    ],
    alem: {
      t: "Para ir além: a equação dos fabricantes e os limites do modelo",
      h: `<p>A distância focal de uma lente fina vem do índice de refração do material (n) e dos raios das faces (R₁, R₂), pela <b>equação dos fabricantes de lentes</b>:</p>
        <div class="eq">${fr("1", "f")} = (${fr("n<sub>lente</sub>", "n<sub>meio</sub>")} − 1)·(${fr("1", "R₁")} − ${fr("1", "R₂")})</div>
        <p>Ela explica um fato surpreendente: uma lente de vidro (n = 1,5) que é convergente no ar vira <b>divergente</b> se mergulhada num líquido mais refringente que ela, porque o termo entre parênteses muda de sinal. E explica por que debaixo d'água enxergamos borrado: a córnea perde quase todo o poder de convergência, já que n da água (1,33) é próximo do dela (1,38).</p>
        <p>A equação de Gauss é uma aproximação para raios <b>paraxiais</b> (próximos do eixo e pouco inclinados). Raios na borda de um espelho esférico focam um pouco antes: é a <b>aberração esférica</b>, que se corrige com espelhos parabólicos (telescópios, antenas). Lentes também sofrem <b>aberração cromática</b>, pois n depende da cor; combina-se uma lente convergente e uma divergente de vidros diferentes (dubleto acromático) para cancelá-la.</p>`,
    },
  };

  // ======================================================================
  // 4. Ondas e som
  // ======================================================================
  A.ondas = {
    tempo: 18, nivel: "Ensino médio → faculdade · ondulatória e acústica",
    objetivos: [
      "definir amplitude, comprimento de onda, período, frequência e velocidade de uma onda;",
      "usar v = λ·f e saber o que muda quando a onda troca de meio;",
      "calcular harmônicos em cordas e em tubos abertos e fechados;",
      "calcular e interpretar níveis sonoros em decibéis;",
      "explicar e calcular o efeito Doppler.",
    ],
    secoes: [
      {
        t: "A ideia em uma frase",
        h: `<p>Uma onda é uma <b>perturbação que viaja levando energia, sem levar matéria</b>. Na “ola” de um estádio, cada torcedor só levanta e senta no lugar, mas a onda dá a volta no estádio. Na água, uma rolha sobe e desce enquanto a onda passa.</p>
          <div class="analogia"><b>Analogia:</b> uma fila de dominós em pé. Cada peça só tomba sobre a vizinha, mas o “tombamento” corre a fila inteira. O que viaja é o padrão (e a energia), não as peças.</div>
          <p>Ondas <b>mecânicas</b> (som, ondas na corda, na água, sísmicas) precisam de um meio material. Ondas <b>eletromagnéticas</b> (luz, rádio, raios X) se propagam também no vácuo, a 3,0×10⁸ m/s. Quanto à direção de vibração: na onda <b>transversal</b> o meio vibra perpendicular à propagação (corda, luz); na <b>longitudinal</b> vibra na mesma direção (som no ar, uma mola sanfonada).</p>`,
      },
      {
        t: "As grandezas de uma onda",
        h: `<p>Numa onda periódica, a <b>amplitude</b> A é o afastamento máximo da posição de equilíbrio; o <b>comprimento de onda</b> λ é a distância entre duas cristas seguidas; o <b>período</b> T é o tempo de uma oscilação completa e a <b>frequência</b> f = 1/T é o número de oscilações por segundo (Hz).</p>
          <p>Em um período a onda avança exatamente um λ, então:</p>
          <div class="eq">v = ${fr("λ", "T")} = λ·f</div>
          <p>Regra de ouro: quem determina a <b>frequência é a fonte</b>; quem determina a <b>velocidade é o meio</b>. Quando o som passa do ar (340 m/s) para a água (cerca de 1 480 m/s), a frequência continua a mesma e o comprimento de onda aumenta cerca de 4,4 vezes. Um Lá de 440 Hz tem λ = 340/440 ≈ 0,77 m no ar.</p>`,
        grafico: {
          op: { altura: 200, modo: "cartesiano", rotX: "x (m)", rotY: "y (m)" },
          cena: { x: [0, 4.5], y: [-0.85, 0.85], series: [
            { tipo: "funcao", f: (x) => 0.5 * Math.sin(Math.PI * x), rotulo: "y(x)", cor: "#4da3ff" },
            { tipo: "seg", de: [0.5, 0.65], para: [2.5, 0.65], rotulo: "λ = 2 m", cor: "#f2c14e", largura: 2 },
            { tipo: "seg", de: [3.5, 0], para: [3.5, -0.5], rotulo: "A = 0,5 m", cor: "#f0a23c", largura: 2 },
          ] },
          legenda: "Fotografia de uma onda: λ é a distância entre cristas; A, a altura de uma crista em relação ao equilíbrio.",
        },
      },
      {
        t: "Cordas, tubos e harmônicos",
        h: `<p>A velocidade de uma onda numa corda depende da tração T e da densidade linear μ (massa por metro): <b>v = √(T/μ)</b>. Esticar a corda aumenta v; cordas grossas (μ maior) são mais lentas, por isso dão notas graves.</p>
          <p>Com as pontas presas, ondas indo e voltando formam <b>ondas estacionárias</b>: pontos que nunca se movem (<b>nós</b>) e pontos de vibração máxima (<b>ventres</b>). Só “cabem” números inteiros de meios comprimentos de onda: L = n·λ/2, logo:</p>
          <div class="eq">f<sub>n</sub> = ${fr("n·v", "2L")} &nbsp; (corda presa e tubo aberto, n = 1, 2, 3…)</div>
          <p>Num <b>tubo aberto</b> nas duas pontas vale a mesma fórmula (ventres nas bocas). Num <b>tubo fechado</b> numa ponta há nó no fundo e ventre na boca; cabem números ímpares de quartos de onda: <b>f<sub>n</sub> = n·v/(4L), só n ímpar</b>. Um tubo fechado de 85 cm tem fundamental 340/(4·0,85) = 100 Hz; aberto, 200 Hz.</p>`,
        grafico: {
          op: { altura: 190, modo: "cartesiano", rotX: "x (m)", rotY: "y" },
          cena: { x: [-0.03, 1.03], y: [-1.5, 1.5], series: [
            { tipo: "funcao", f: (x) => Math.sin(Math.PI * x), dominio: [0, 1], rotulo: "1º harmônico", cor: "#4da3ff" },
            { tipo: "funcao", f: (x) => Math.sin(2 * Math.PI * x), dominio: [0, 1], rotulo: "2º harmônico", cor: "#f0a23c" },
            { tipo: "funcao", f: (x) => Math.sin(3 * Math.PI * x), dominio: [0, 1], rotulo: "3º harmônico", cor: "#5cc98a" },
            { tipo: "marca", x: 0, y: 0, rotulo: "nó" }, { tipo: "marca", x: 1, y: 0, rotulo: "nó" },
          ] },
          legenda: "Corda de 1 m presa nas pontas: o n-ésimo harmônico tem n ventres e frequência n vezes a fundamental.",
        },
      },
      {
        t: "Intensidade sonora e decibéis",
        h: `<p>A <b>intensidade</b> I é a potência que atravessa cada metro quadrado (W/m²). O ouvido humano percebe de 10⁻¹² W/m² (limiar) até cerca de 1 W/m² (limiar da dor): um fator de um trilhão. Para lidar com isso, usa-se uma escala logarítmica, o <b>nível sonoro</b>:</p>
          <div class="eq">β = 10·log(${fr("I", "I₀")}) &nbsp; (dB), &nbsp; I₀ = 10⁻¹² W/m²</div>
          <div class="tab-rolar"><table class="tb">
            <tr><th>Som</th><th>β (dB)</th><th>I (W/m²)</th></tr>
            <tr><td>limiar de audição</td><td>0</td><td>10⁻¹²</td></tr>
            <tr><td>conversa</td><td>60</td><td>10⁻⁶</td></tr>
            <tr><td>trânsito pesado</td><td>85</td><td>≈ 3×10⁻⁴</td></tr>
            <tr><td>show de rock</td><td>110</td><td>10⁻¹</td></tr>
            <tr><td>limiar da dor</td><td>≈ 130</td><td>10</td></tr>
          </table></div>
          <p>Cada <b>+10 dB multiplica I por 10</b>; +20 dB, por 100; +3 dB praticamente dobra. Dois aparelhos de 60 dB juntos dão 63 dB, não 120 dB. A exposição prolongada acima de 85 dB já causa perda auditiva permanente.</p>`,
      },
      {
        t: "Efeito Doppler",
        h: `<p>Quando a fonte e o observador se aproximam, as frentes de onda chegam “comprimidas”: a frequência percebida é <b>maior</b> (som mais agudo). Quando se afastam, ela é menor. É o “iiiiooom” da sirene que passa.</p>
          <div class="eq">f′ = f·${fr("v ± v<sub>o</sub>", "v ∓ v<sub>f</sub>")}</div>
          <p>Use o sinal que <b>aumenta</b> f′ quando há aproximação: observador se aproximando, + em cima; fonte se aproximando, − embaixo. Uma ambulância com sirene de 500 Hz chegando a 20 m/s (som a 340 m/s): f′ = 500·340/320 ≈ 531 Hz; indo embora: 500·340/360 ≈ 472 Hz.</p>
          <p>A frequência <b>emitida</b> não muda; o que muda é o ritmo com que as cristas chegam ao ouvido. Se a fonte atinge a velocidade do som, as frentes se empilham numa onda de choque: o estrondo sônico.</p>`,
      },
    ],
    formulas: [
      { nome: "Equação fundamental", eq: `v = λ·f = ${fr("λ", "T")}`, simbolos: [["v", "velocidade de propagação", "m/s"], ["λ", "comprimento de onda", "m"], ["f", "frequência", "Hz"], ["T", "período", "s"]], obs: "Ao mudar de meio, f fica e λ muda." },
      { nome: "Corda (Taylor) e harmônicos", eq: `v = √(${fr("T", "μ")}); f<sub>n</sub> = ${fr("n·v", "2L")}`, simbolos: [["T", "tração", "N"], ["μ", "densidade linear", "kg/m"], ["L", "comprimento", "m"], ["n", "número do harmônico", "—"]], obs: "Tubo fechado: f<sub>n</sub> = n·v/(4L), só n ímpar." },
      { nome: "Nível sonoro", eq: `β = 10·log(${fr("I", "I₀")})`, simbolos: [["β", "nível sonoro", "dB"], ["I", "intensidade", "W/m²"], ["I₀", "10⁻¹² W/m²", "W/m²"]], obs: "+10 dB = intensidade ×10." },
      { nome: "Doppler", eq: `f′ = f·${fr("v ± v<sub>o</sub>", "v ∓ v<sub>f</sub>")}`, simbolos: [["v<sub>o</sub>", "velocidade do observador", "m/s"], ["v<sub>f</sub>", "velocidade da fonte", "m/s"]], obs: "Aproximação aumenta a frequência percebida." },
    ],
    exemplos: [
      {
        t: "direto",
        enunciado: `Uma rádio FM transmite em 100 MHz. Qual o comprimento de onda? (c = 3,0×10⁸ m/s)`,
        passos: [`f = 100 MHz = 1,0×10⁸ Hz.`, `λ = v/f = 3,0×10⁸ / 1,0×10⁸.`, `λ = 3,0 m (por isso antenas de FM têm cerca de 75 cm a 1,5 m: λ/4 ou λ/2).`],
        resposta: `<b>λ = 3 m</b>`,
      },
      {
        t: "corda de violão",
        enunciado: `A corda Mi grave de um violão vibra a 82,4 Hz no modo fundamental, tem 0,65 m de comprimento livre e μ = 6,4 g/m. Qual a tração?`,
        passos: [`Fundamental: λ = 2L = 1,30 m.`, `Velocidade: v = λ·f = 1,30·82,4 ≈ 107,1 m/s.`, `Taylor: v² = T/μ → T = μ·v² = 0,0064·(107,1)² ≈ 0,0064·11 470 ≈ 73,4 N.`],
        resposta: `<b>T ≈ 73 N</b> (o peso de uns 7,5 kg)`,
      },
      {
        t: "de prova: decibéis e Doppler",
        enunciado: `(a) O som de uma rua passa de 60 dB para 80 dB. Quantas vezes aumentou a intensidade? (b) Uma sirene de 500 Hz se afasta de você a 20 m/s; que frequência você ouve? (v = 340 m/s)`,
        passos: [`(a) Δβ = 20 dB = 10·log(I₂/I₁) → log(I₂/I₁) = 2 → I₂/I₁ = 10² = 100.`, `(b) Fonte se afastando: sinal + no denominador.`, `f′ = 500·340/(340 + 20) = 500·340/360 ≈ 472 Hz.`],
        resposta: `(a) <b>100 vezes</b>; (b) <b>≈ 472 Hz</b>, mais grave`,
      },
    ],
    erros: [
      { errado: `Achar que a frequência muda quando a onda passa para outro meio.`, certo: `A frequência é da fonte e não muda; mudam a velocidade e o comprimento de onda.` },
      { errado: `Somar decibéis: dois sons de 60 dB = 120 dB.`, certo: `Somam-se intensidades: 2·10⁻⁶ W/m² → β = 10·log(2×10⁶) ≈ 63 dB.`, porque: `A escala é logarítmica.` },
      { errado: `Pôr harmônicos pares num tubo fechado.`, certo: `Tubo fechado numa ponta só tem n = 1, 3, 5…`, porque: `É preciso nó no fundo e ventre na boca: só números ímpares de λ/4 cabem.` },
      { errado: `Confundir amplitude com comprimento de onda.`, certo: `Amplitude é “altura” (ligada à intensidade, ao volume); λ é “distância entre cristas” (ligada à frequência, ao tom).` },
      { errado: `No Doppler, achar que a fonte passa a emitir outra frequência.`, certo: `A fonte emite sempre f; quem percebe f′ é o observador, por causa do movimento relativo.` },
    ],
    aplicacoes: [
      `<b>Medicina</b>: o ultrassom Doppler mede a velocidade do sangue nas artérias pela mudança de frequência do eco.`,
      `<b>Trânsito e meteorologia</b>: radares de velocidade e radares meteorológicos usam o Doppler de ondas de rádio.`,
      `<b>Música</b>: a afinação de instrumentos é controle de f<sub>n</sub> = n·v/(2L): apertar a tarraxa muda T; pressionar o traste muda L.`,
      `<b>Saúde ocupacional</b>: a legislação trabalhista limita a exposição a 85 dB por 8 horas, com o tempo caindo pela metade a cada 5 dB a mais.`,
      `<b>Astronomia</b>: o desvio para o vermelho da luz de galáxias distantes, um Doppler da luz, revelou que o Universo está em expansão.`,
    ],
    teste: [
      { p: `Uma onda sonora passa do ar para a água, onde é mais rápida. O que acontece?`, op: [`A frequência aumenta e λ fica igual.`, `A frequência fica igual e λ aumenta.`, `Os dois diminuem.`, `A amplitude dobra.`], certa: 1, explica: `f é imposta pela fonte. Com v maior e f igual, λ = v/f aumenta.` },
      { p: `Aumentar o nível sonoro de 50 dB para 70 dB multiplica a intensidade por…`, op: [`20`, `1,4`, `2`, `100`], certa: 3, explica: `+20 dB = 10² = 100 vezes.` },
      { p: `Ao apertar (aumentar a tração de) uma corda de violão, a nota…`, op: [`fica mais aguda, pois v e f aumentam.`, `fica mais grave.`, `não muda, pois L é o mesmo.`, `muda só de volume.`], certa: 0, explica: `v = √(T/μ) cresce com T e f = v/(2L) cresce junto.` },
      { p: `Um tubo fechado numa ponta tem fundamental de 100 Hz. Qual destas frequências ele também produz?`, op: [`200 Hz`, `300 Hz`, `400 Hz`, `150 Hz`], certa: 1, explica: `Só harmônicos ímpares: 100, 300, 500 Hz…` },
      { p: `O som de uma ambulância que passa por você fica mais grave depois que ela passa porque…`, op: [`a sirene muda de tom.`, `o som perde energia com a distância.`, `afastando-se, as frentes de onda chegam mais espaçadas.`, `o vento muda de direção.`], certa: 2, explica: `É o efeito Doppler: com afastamento, menos cristas por segundo chegam ao ouvido.` },
    ],
    resumo: [
      `Onda transporta energia, não matéria.`,
      `v = λ·f; f vem da fonte, v vem do meio.`,
      `Corda: v = √(T/μ); corda e tubo aberto: f<sub>n</sub> = n·v/(2L).`,
      `Tubo fechado: f<sub>n</sub> = n·v/(4L), só n ímpar.`,
      `β = 10·log(I/I₀); +10 dB = ×10 na intensidade.`,
      `Doppler: aproximação → frequência percebida maior.`,
    ],
    alem: {
      t: "Para ir além: a equação de onda e de onde vem √(T/μ)",
      h: `<p>Aplicando a 2ª lei de Newton a um pedacinho de corda de comprimento dx, a força vertical resultante vem da curvatura da corda: T·∂²y/∂x²·dx = μ·dx·∂²y/∂t². Daí sai a <b>equação de onda</b>:</p>
        <div class="eq">${fr("∂²y", "∂t²")} = ${fr("T", "μ")}·${fr("∂²y", "∂x²")}</div>
        <p>Qualquer função do tipo y = g(x − v·t) é solução, desde que v² = T/μ: é a forma que viaja sem se deformar. A mesma equação descreve o som (com v² = módulo de compressibilidade ÷ densidade) e, a partir das equações de Maxwell, a luz, com v = 1/√(ε₀μ₀) = c. Essa coincidência numérica foi o que convenceu Maxwell de que a luz é uma onda eletromagnética.</p>
        <p>Em análise de Fourier, qualquer som periódico é uma soma de harmônicos f, 2f, 3f… A “cor” do som (timbre) que distingue um violino de uma flauta tocando a mesma nota é justamente a proporção entre esses harmônicos; a flauta, um tubo aberto, tem todos eles, enquanto o clarinete, que se comporta como tubo fechado, realça os ímpares.</p>`,
    },
  };

  // ======================================================================
  // 5. Termologia: temperatura, calor, misturas e dilatação
  // ======================================================================
  A.termologia = {
    tempo: 20, nivel: "Ensino médio → faculdade · termologia e calorimetria",
    objetivos: [
      "diferenciar temperatura de calor e converter entre °C, °F e K;",
      "calcular calor sensível e calor latente e ler a curva de aquecimento da água;",
      "resolver problemas de equilíbrio térmico, inclusive com gelo;",
      "calcular dilatação linear, superficial e volumétrica.",
    ],
    secoes: [
      {
        t: "A ideia em uma frase",
        h: `<p><b>Temperatura</b> mede o grau de agitação das partículas de um corpo. <b>Calor</b> é energia em trânsito, que passa espontaneamente do corpo mais quente para o mais frio, até as temperaturas se igualarem (equilíbrio térmico). Um corpo “tem” temperatura, mas não “tem” calor: ele recebe ou cede calor.</p>
          <div class="analogia"><b>Analogia:</b> uma banheira cheia de água morna tem temperatura menor que uma xícara de café, mas muito mais energia interna. Jogue o café na banheira: o calor flui do café (mais quente) para a banheira, embora a banheira “tenha mais energia”. Quem manda no sentido do fluxo é a temperatura.</div>
          <p>Unidades: calor em joules (SI) ou em calorias. 1 cal é o calor que eleva 1 g de água em 1 °C, e vale 4,184 J. A “caloria” dos rótulos de alimento é a kcal: um pão de 150 kcal libera cerca de 630 kJ.</p>`,
      },
      {
        t: "Escalas termométricas",
        h: `<p>As escalas se constroem com dois pontos fixos da água a 1 atm: fusão do gelo e ebulição. Celsius usa 0 e 100; Fahrenheit, 32 e 212; Kelvin, 273,15 e 373,15. Como a mesma fração do intervalo vale em todas:</p>
          <div class="eq">${fr("T<sub>C</sub>", "5")} = ${fr("T<sub>F</sub> − 32", "9")} = ${fr("T<sub>K</sub> − 273,15", "5")}</div>
          <p>A escala Kelvin é <b>absoluta</b>: 0 K é o zero absoluto, a menor temperatura possível (−273,15 °C). Fórmulas de gases e de radiação exigem kelvin. Exemplos: corpo humano 37 °C = 98,6 °F = 310,15 K; −40 °C = −40 °F (o único ponto em que as duas coincidem, onde a reta do gráfico cruza a diagonal).</p>
          <div class="nota">Para <b>variações</b>: ΔT de 1 °C = 1 K = 1,8 °F. Uma febre que sobe 2 °C sobe 3,6 °F, e não 35,6 °F.</div>`,
        grafico: {
          op: { altura: 200, modo: "dados", rotX: "T (°C)", rotY: "T (°F)" },
          cena: { x: [-50, 110], y: [-70, 240], series: [
            { tipo: "funcao", f: (c) => 1.8 * c + 32, rotulo: "T_F = 1,8·T_C + 32", cor: "#4da3ff" },
            { tipo: "marca", x: 0, y: 32, rotulo: "gelo: 32 °F" },
            { tipo: "marca", x: 100, y: 212, rotulo: "fervura: 212 °F" },
            { tipo: "marca", x: -40, y: -40, rotulo: "−40 = −40" },
          ] },
          legenda: "A conversão Celsius → Fahrenheit é uma reta de inclinação 1,8 que passa por (0; 32).",
        },
      },
      {
        t: "Calor sensível",
        h: `<p>Quando o calor muda a temperatura (sem mudar a fase), ele é <b>sensível</b>:</p>
          <div class="eq">Q = m·c·ΔT</div>
          <p>O <b>calor específico</b> c diz quanto calor cada grama exige para subir 1 °C. A água tem c = 1 cal/(g·°C), um dos maiores valores entre substâncias comuns; o ferro tem 0,11 e o cobre 0,093. Por isso a areia da praia esquenta muito mais rápido que o mar, e cidades litorâneas têm clima mais ameno. O produto <b>C = m·c</b> é a <b>capacidade térmica</b> do corpo (cal/°C).</p>
          <p>Exemplo: aquecer 500 g de água de 20 °C a 80 °C exige Q = 500·1·60 = 30 000 cal = 30 kcal ≈ 126 kJ. Uma chaleira de 2 000 W faria isso em cerca de 63 s, se não perdesse nada para o ambiente.</p>`,
      },
      {
        t: "Calor latente e curva de aquecimento",
        h: `<p>Durante uma mudança de fase, a temperatura <b>fica parada</b>: todo o calor vai para romper ligações entre as moléculas. Esse é o <b>calor latente</b>: Q = m·L. Para a água: fusão L<sub>f</sub> = 80 cal/g; vaporização L<sub>v</sub> = 540 cal/g.</p>
          <p>Na curva abaixo, 100 g de gelo a −20 °C viram vapor a 120 °C. Os trechos inclinados são calor sensível (gelo c = 0,5; água 1,0; vapor 0,48 cal/(g·°C)); os patamares, calor latente:</p>
          <ul><li>gelo de −20 a 0 °C: 100·0,5·20 = 1 000 cal;</li><li>fusão: 100·80 = 8 000 cal;</li><li>água de 0 a 100 °C: 100·1·100 = 10 000 cal;</li><li>vaporização: 100·540 = 54 000 cal;</li><li>vapor de 100 a 120 °C: 100·0,48·20 = 960 cal.</li></ul>
          <p>Total: 73 960 cal ≈ 74 kcal. Só a vaporização consome 73% do total: é por isso que a panela demora tanto a secar e que o suor, ao evaporar, resfria tanto o corpo.</p>`,
        grafico: {
          op: { altura: 230, modo: "dados", rotX: "Q (kcal)", rotY: "T (°C)" },
          cena: { x: [0, 77], y: [-30, 135], series: [
            { tipo: "linha", pts: [[0, -20], [1, 0]], rotulo: "gelo", cor: "#7fd0ff", largura: 3 },
            { tipo: "linha", pts: [[1, 0], [9, 0]], rotulo: "fusão", cor: "#f2c14e", largura: 3 },
            { tipo: "linha", pts: [[9, 0], [19, 100]], rotulo: "água", cor: "#4da3ff", largura: 3 },
            { tipo: "linha", pts: [[19, 100], [73, 100]], rotulo: "ebulição", cor: "#f0a23c", largura: 3 },
            { tipo: "linha", pts: [[73, 100], [73.96, 120]], rotulo: "vapor", cor: "#e5646e", largura: 3 },
          ] },
          legenda: "Curva de aquecimento de 100 g de água: patamares de fusão (0 °C) e ebulição (100 °C).",
        },
      },
      {
        t: "Equilíbrio térmico e misturas",
        h: `<p>Num recipiente isolado, o calor que uns cedem os outros recebem: <b>ΣQ = 0</b>. Sem mudança de fase, a temperatura final é a média das temperaturas ponderada pelas capacidades térmicas: 200 g de água a 20 °C com 100 g a 80 °C dão (200·20 + 100·80)/300 = <b>40 °C</b>.</p>
          <p>Com <b>gelo</b>, não se pode jogar tudo numa equação de cara: primeiro descubra o <b>estado final</b>. Compare:</p>
          <ol><li>Q₁ = calor para levar o gelo a 0 °C; Q₂ = calor para derretê-lo todo (m·80).</li>
          <li>Q<sub>a</sub> = calor que a água pode ceder até chegar a 0 °C.</li>
          <li>Se Q<sub>a</sub> ≥ Q₁ + Q₂, todo o gelo derrete e a mistura termina acima de 0 °C. Se Q₁ ≤ Q<sub>a</sub> &lt; Q₁ + Q₂, só parte derrete e o final é <b>água e gelo a 0 °C</b>; a massa derretida é (Q<sub>a</sub> − Q₁)/80.</li></ol>
          <p>É por isso que um copo com bastante gelo fica a 0 °C enquanto houver gelo: o gelo “absorve” o calor sem esquentar.</p>`,
      },
      {
        t: "Dilatação térmica",
        h: `<p>Aquecidos, os átomos vibram com mais amplitude e ficam, em média, mais afastados: o corpo cresce. Para variações moderadas:</p>
          <div class="eq">ΔL = L₀·α·ΔT &nbsp;&nbsp; ΔA = A₀·β·ΔT &nbsp;&nbsp; ΔV = V₀·γ·ΔT, &nbsp; com β = 2α e γ = 3α</div>
          <p>O aço tem α ≈ 1,2×10⁻⁵ °C⁻¹: um trilho de 10 m que esquenta 50 °C cresce 10·1,2×10⁻⁵·50 = 6×10⁻³ m = <b>6 mm</b>. Daí as juntas de dilatação em trilhos, pontes e calçadas. Um furo numa chapa <b>aumenta</b> ao aquecer, como se fosse feito do próprio material.</p>
          <p>A água é a exceção famosa: entre 0 e 4 °C ela <b>contrai</b> ao ser aquecida, e tem densidade máxima a 4 °C. Por isso lagos congelam de cima para baixo e a vida no fundo sobrevive ao inverno.</p>`,
      },
    ],
    formulas: [
      { nome: "Conversão de escalas", eq: `${fr("T<sub>C</sub>", "5")} = ${fr("T<sub>F</sub> − 32", "9")} = ${fr("T<sub>K</sub> − 273,15", "5")}`, simbolos: [["T<sub>C</sub>, T<sub>F</sub>, T<sub>K</sub>", "temperaturas em Celsius, Fahrenheit e kelvin", "°C, °F, K"]], obs: "Para variações: ΔT<sub>C</sub> = ΔT<sub>K</sub> = ΔT<sub>F</sub>/1,8." },
      { nome: "Calor sensível", eq: `Q = m·c·ΔT`, simbolos: [["Q", "calor", "cal ou J"], ["m", "massa", "g ou kg"], ["c", "calor específico", "cal/(g·°C)"], ["ΔT", "variação de temperatura", "°C"]], obs: "Q > 0: recebe; Q < 0: cede." },
      { nome: "Calor latente", eq: `Q = m·L`, simbolos: [["L", "calor latente (água: L<sub>f</sub> = 80, L<sub>v</sub> = 540)", "cal/g"]], obs: "Durante a mudança de fase a temperatura não varia." },
      { nome: "Dilatação", eq: `ΔL = L₀·α·ΔT (β = 2α, γ = 3α)`, simbolos: [["α", "coeficiente de dilatação linear", "°C⁻¹"], ["L₀", "comprimento inicial", "m"]], obs: "Vale para ΔT moderados; α·ΔT ≪ 1." },
    ],
    exemplos: [
      {
        t: "direto: conversão",
        enunciado: `Um termômetro americano marca 104 °F. A pessoa está com febre? Quanto é em °C e em K?`,
        passos: [`T<sub>C</sub>/5 = (104 − 32)/9 = 72/9 = 8.`, `T<sub>C</sub> = 5·8 = 40 °C: febre alta.`, `T<sub>K</sub> = 40 + 273,15 = 313,15 K.`],
        resposta: `<b>40 °C</b> (313,15 K): sim, febre alta`,
      },
      {
        t: "mistura sem mudança de fase",
        enunciado: `Um bloco de ferro de 200 g (c = 0,11 cal/(g·°C)) a 100 °C é posto em 400 g de água a 20 °C, num recipiente isolado. Qual a temperatura final?`,
        passos: [`Capacidades térmicas: ferro 200·0,11 = 22 cal/°C; água 400·1 = 400 cal/°C.`, `ΣQ = 0: 22·(T − 100) + 400·(T − 20) = 0.`, `22T − 2 200 + 400T − 8 000 = 0 → 422T = 10 200 → T ≈ 24,2 °C.`, `O ferro cede 22·75,8 ≈ 1 668 cal e a água recebe 400·4,2 ≈ 1 668 cal ✓.`],
        resposta: `<b>T ≈ 24,2 °C</b>: a água, com capacidade térmica muito maior, quase não muda`,
      },
      {
        t: "de prova: gelo na água",
        enunciado: `Colocam-se 50 g de gelo a −10 °C em 200 g de água a 60 °C, num recipiente isolado. Qual a temperatura final? (c<sub>gelo</sub> = 0,5; c<sub>água</sub> = 1 cal/(g·°C); L<sub>f</sub> = 80 cal/g)`,
        passos: [`Gelo até 0 °C: Q₁ = 50·0,5·10 = 250 cal. Fusão: Q₂ = 50·80 = 4 000 cal.`, `Água até 0 °C pode ceder: Q<sub>a</sub> = 200·1·60 = 12 000 cal ≥ 4 250 cal → todo o gelo derrete.`, `Balanço com T final > 0: 250 + 4 000 + 50·1·(T − 0) + 200·1·(T − 60) = 0.`, `4 250 + 50T + 200T − 12 000 = 0 → 250T = 7 750 → T = 31 °C.`],
        resposta: `<b>T = 31 °C</b>, só água líquida`,
      },
    ],
    erros: [
      { errado: `Dizer que um corpo quente “tem muito calor”.`, certo: `Ele tem alta temperatura (e energia interna); calor é a energia que flui por causa da diferença de temperatura.` },
      { errado: `Com gelo, usar a média ponderada direto.`, certo: `Primeiro decida se o gelo derrete todo, comparando os calores; inclua sempre o termo m·L<sub>f</sub>.`, porque: `A média ignora os 80 cal/g da fusão e pode dar temperaturas impossíveis.` },
      { errado: `Converter uma variação de 10 °C para °F somando 32: 50 °F.`, certo: `Variações não têm o deslocamento de 32: ΔT<sub>F</sub> = 1,8·10 = 18 °F.` },
      { errado: `Achar que o furo de uma chapa diminui quando ela esquenta.`, certo: `O furo dilata como se fosse feito do mesmo material: ele aumenta.` },
      { errado: `Esquecer de usar kelvin em fórmulas de gases (por exemplo, PV = nRT com 27 °C).`, certo: `Use T = 27 + 273,15 = 300,15 K.` },
    ],
    aplicacoes: [
      `<b>Clima</b>: o alto calor específico dos oceanos modera as temperaturas do planeta e faz o clima litorâneo ser menos extremo.`,
      `<b>Saúde</b>: a transpiração resfria o corpo porque cada grama de suor que evapora leva cerca de 580 cal (L<sub>v</sub> à temperatura da pele).`,
      `<b>Engenharia civil</b>: juntas de dilatação em pontes, trilhos e pisos evitam rachaduras quando a temperatura varia dezenas de graus.`,
      `<b>Cozinha e indústria</b>: a panela de pressão eleva a temperatura de ebulição para cerca de 120 °C, cozinhando mais rápido.`,
      `<b>Termostatos</b>: lâminas bimetálicas (dois metais com α diferentes, colados) se curvam ao aquecer e abrem ou fecham contatos elétricos.`,
    ],
    teste: [
      { p: `Dois corpos estão em equilíbrio térmico quando têm o mesmo(a)…`, op: [`quantidade de calor.`, `temperatura.`, `massa.`, `calor específico.`], certa: 1, explica: `Equilíbrio térmico é igualdade de temperatura; aí o fluxo de calor cessa.` },
      { p: `Durante a fusão do gelo a 0 °C, ao receber calor, a temperatura…`, op: [`sobe lentamente.`, `cai.`, `permanece em 0 °C até todo o gelo derreter.`, `oscila.`], certa: 2, explica: `Todo o calor vai para mudar a fase (calor latente); a temperatura só volta a subir quando acabar o gelo.` },
      { p: `Areia e água recebem o mesmo calor por grama sob o sol. A areia esquenta mais porque…`, op: [`tem calor específico menor.`, `tem calor específico maior.`, `é mais densa.`, `reflete mais luz.`], certa: 0, explica: `ΔT = Q/(m·c): com c menor, a mesma quantidade de calor produz variação maior.` },
      { p: `Uma variação de 20 °C equivale a uma variação de…`, op: [`68 °F e 293 K.`, `20 °F e 20 K.`, `36 °F e 293 K.`, `36 °F e 20 K.`], certa: 3, explica: `ΔT<sub>F</sub> = 1,8·20 = 36 °F; ΔT<sub>K</sub> = ΔT<sub>C</sub> = 20 K.` },
      { p: `Uma chapa metálica com um furo circular é aquecida. O furo…`, op: [`diminui.`, `aumenta.`, `não muda.`, `vira elipse.`], certa: 1, explica: `Todas as dimensões crescem na mesma proporção, inclusive as do furo.` },
      { p: `100 g de gelo a 0 °C são postos em 100 g de água a 40 °C (L<sub>f</sub> = 80 cal/g). No equilíbrio…`, op: [`a mistura fica a 20 °C.`, `todo o gelo derrete e a mistura fica a 0 °C.`, `sobra gelo, e a mistura fica a 0 °C.`, `a água congela toda.`], certa: 2, explica: `A água cede no máximo 100·40 = 4 000 cal até 0 °C, mas derreter o gelo exige 8 000 cal. Derretem só 50 g; o final é água e gelo a 0 °C.` },
    ],
    resumo: [
      `Temperatura mede agitação; calor é energia em trânsito do quente para o frio.`,
      `T<sub>C</sub>/5 = (T<sub>F</sub> − 32)/9 = (T<sub>K</sub> − 273,15)/5; variações: 1 °C = 1 K = 1,8 °F.`,
      `Calor sensível: Q = m·c·ΔT. Latente: Q = m·L, com T constante.`,
      `Água: c = 1 cal/(g·°C), L<sub>f</sub> = 80 cal/g, L<sub>v</sub> = 540 cal/g.`,
      `Recipiente isolado: ΣQ = 0. Com gelo, decida antes o estado final.`,
      `Dilatação: ΔL = L₀·α·ΔT; β = 2α, γ = 3α.`,
    ],
    alem: {
      t: "Para ir além: por que a água é tão especial (e o que é temperatura, afinal)",
      h: `<p>Na teoria cinética, a temperatura absoluta é proporcional à <b>energia cinética média</b> das moléculas: num gás ideal monoatômico, E<sub>c</sub> média = (3/2)·k<sub>B</sub>·T, com k<sub>B</sub> = 1,38×10⁻²³ J/K. A 300 K, uma molécula de nitrogênio do ar anda, em média, a cerca de 500 m/s.</p>
        <p>O alto calor específico e os altos calores latentes da água vêm das <b>ligações de hidrogênio</b> entre as moléculas: parte da energia recebida vai para esticar e romper essas ligações, em vez de aumentar a agitação. A mesma rede de ligações, mais aberta no gelo, explica por que o gelo boia (densidade 0,92 g/cm³) e por que a água é mais densa a 4 °C.</p>
        <p>Para sólidos, a <b>lei de Dulong-Petit</b> diz que o calor específico <b>por mol</b> de muitos elementos é aproximadamente 3R ≈ 25 J/(mol·K). Confira com o cobre: 0,385 J/(g·K) × 63,5 g/mol ≈ 24,4 J/(mol·K). A baixas temperaturas essa lei falha, e explicar essa falha foi uma das primeiras vitórias da física quântica (modelos de Einstein, 1907, e Debye, 1912).</p>`,
    },
  };
})();
