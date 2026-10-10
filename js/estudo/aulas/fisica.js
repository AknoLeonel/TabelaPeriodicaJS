/*
 * Aulas de Física (formato em js/estudo/aula.js).
 * Cada aula leva de "nunca vi isso" até "consigo resolver e explicar".
 */
(function () {
  "use strict";
  const E = window.LAB && window.LAB.estudo;
  if (!E) return;
  const A = (E.aulas.fisica = E.aulas.fisica || {});
  const fr = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;

  // ======================================================================
  // 1. Fórmulas: o método para resolver qualquer problema
  // ======================================================================
  A.formulas = {
    tempo: 16, nivel: "Ensino médio → faculdade · vale para toda a física",
    objetivos: [
      "aplicar um roteiro fixo de seis etapas a qualquer problema de física;",
      "organizar os dados com unidades e convertê-los para o SI antes de calcular;",
      "escolher a lei física certa e encadear duas ou mais fórmulas quando uma só não basta;",
      "isolar a incógnita algebricamente antes de substituir números;",
      "conferir o resultado pela unidade e pela ordem de grandeza.",
    ],
    requisitos: [{ id: "conversor", nome: "Unidades, SI e análise dimensional" }],
    secoes: [
      {
        t: "A ideia em uma frase",
        h: `<p>Resolver um problema de física não é “achar a fórmula certa e chutar números nela”. É <b>traduzir uma situação real para equações</b>, resolver a álgebra e traduzir a resposta de volta, conferindo se ela faz sentido. Quem domina esse roteiro resolve problemas que nunca viu antes.</p>
          <div class="analogia"><b>Analogia:</b> é como cozinhar seguindo uma receita. Primeiro você separa e mede os ingredientes (dados e unidades), depois escolhe o modo de preparo (a lei física), e só então vai ao fogo (as contas). Quem joga tudo na panela ao mesmo tempo raramente acerta o prato.</div>
          <p>A maior parte dos erros em prova não vem de não saber física: vem de unidade misturada, de sinal trocado ou de conta feita com números antes de a equação estar arrumada. O método abaixo ataca exatamente esses pontos.</p>`,
      },
      {
        t: "O roteiro em seis etapas",
        h: `<ol>
            <li><b>Ler e desenhar.</b> Leia o enunciado inteiro e faça um esboço: eixos, sentido positivo, forças, posição inicial e final. O desenho revela o que é dado e o que falta.</li>
            <li><b>Listar os dados com unidades</b> e a grandeza pedida, com símbolo: v₀ = 72 km/h, t = 4,0 s, v = 0 (“para”), a = ?. Palavras escondem dados: “parte do repouso” significa v₀ = 0; “cai livremente” significa a = g.</li>
            <li><b>Converter tudo para o SI</b> (m, kg, s, A, K): 72 km/h = 20 m/s; 500 g = 0,5 kg; 15 min = 900 s.</li>
            <li><b>Escolher a lei</b> que liga os dados à incógnita. Pergunte: que fenômeno é este? Movimento com aceleração constante? Forças? Energia que se conserva? Circuito?</li>
            <li><b>Isolar antes de substituir.</b> Resolva a equação para a incógnita usando só letras. Assim você enxerga a dependência (dobrar a massa muda o quê?) e erra menos.</li>
            <li><b>Calcular e conferir.</b> A unidade bate? O sinal faz sentido? A ordem de grandeza é plausível (um carro a 300 m/s está errado)?</li>
          </ol>
          <div class="destaque">Regra de ouro: <b>nunca escreva um número sem a unidade</b>. A unidade é a sua rede de segurança.</div>`,
      },
      {
        t: "Escolher a lei: um mapa rápido",
        h: `<p>Cada área da física tem poucas equações centrais. Saber <b>quando</b> cada uma vale é mais importante que decorá-las:</p>
          <div class="tab-rolar"><table class="tb">
            <tr><th>Situação</th><th>Ferramenta</th><th>Pista no enunciado</th></tr>
            <tr><td>Velocidade constante</td><td>Δs = v·Δt (MRU)</td><td>“constante”, “uniforme”</td></tr>
            <tr><td>Aceleração constante</td><td>v = v₀ + a·t; Δs = v₀·t + a·t²/2; v² = v₀² + 2·a·Δs</td><td>“freia”, “acelera uniformemente”, queda livre</td></tr>
            <tr><td>Causa do movimento</td><td>F<sub>res</sub> = m·a (2ª lei de Newton)</td><td>forças, atrito, tração, massa</td></tr>
            <tr><td>Alturas e velocidades, sem o tempo</td><td>Conservação de energia</td><td>“de que altura”, rampa, mola, sem atrito</td></tr>
            <tr><td>Circuitos</td><td>V = R·i; P = V·i</td><td>tensão, resistência, potência, aparelho</td></tr>
          </table></div>
          <p>Uma boa pergunta para escolher entre cinemática e energia: <b>o tempo aparece?</b> Se o problema não dá nem pede o tempo, a equação de Torricelli ou a conservação de energia costumam ser o caminho mais curto.</p>`,
      },
      {
        t: "Isolar antes de substituir e encadear fórmulas",
        h: `<p>Exemplo de cinemática: um carro a 72 km/h freia até parar em 4,0 s. Qual a distância de frenagem?</p>
          <p>Dados no SI: v₀ = 20 m/s, v = 0, t = 4,0 s, Δs = ?. Nenhuma fórmula liga v₀, v, t e Δs diretamente se você só lembra de v = v₀ + a·t, então faça uma <b>cadeia</b>: primeiro a aceleração, depois a distância.</p>
          <div class="eq">a = ${fr("v − v₀", "t")} = ${fr("0 − 20 m/s", "4,0 s")} = −5,0 m/s²</div>
          <div class="eq">Δs = v₀·t + ${fr("a·t²", "2")} = 20 × 4,0 + ${fr("(−5,0) × 16", "2")} = 80 − 40 = 40 m</div>
          <p>Conferência por outro caminho: a velocidade média num MRUV é (v₀ + v)/2 = 10 m/s; em 4,0 s, 10 × 4,0 = 40 m. Bate.</p>
          <p>Note o sinal: a aceleração é <b>negativa</b> porque aponta contra o movimento (escolhemos positivo no sentido da velocidade). O sinal não é enfeite: ele carrega a direção.</p>
          <div class="nota">Cadeias de fórmulas são a regra em problemas de prova: a grandeza intermediária (aceleração, força, corrente) quase nunca é pedida, mas é a ponte entre os dados e a resposta.</div>`,
      },
      {
        t: "Conferir: unidade, sinal, casos-limite e ordem de grandeza",
        h: `<p>Terminou a conta? Ainda não terminou o problema. Quatro testes rápidos pegam a maioria dos erros:</p>
          <ul>
            <li><b>Unidade:</b> se você queria uma distância e saiu m/s, há uma divisão a mais. Carregue as unidades na conta: (m/s) × s = m.</li>
            <li><b>Sinal:</b> uma altura negativa, um tempo negativo ou uma massa negativa indicam escolha de raiz errada ou sinal trocado.</li>
            <li><b>Casos-limite:</b> na fórmula literal, ponha um valor extremo. Se o atrito for zero, a aceleração vira F/m? Se o ângulo for 90°, o alcance horizontal vira zero? Se não virar, a fórmula está errada.</li>
            <li><b>Ordem de grandeza:</b> uma pessoa tem ~70 kg, um carro ~1000 kg, um chuveiro ~5000 W, uma pilha 1,5 V. Resultado mil vezes fora disso é sinal de prefixo esquecido (g em vez de kg, mA em vez de A).</li>
          </ul>
          <p>Com a prática, esses testes viram reflexo e levam segundos. São eles que separam quem “acha que acertou” de quem <b>sabe</b> que acertou.</p>`,
      },
    ],
    formulas: [
      { nome: "Torricelli (MRUV sem o tempo)", eq: `v² = v₀² + 2·a·Δs`, simbolos: [["v, v₀", "velocidades final e inicial", "m/s"], ["a", "aceleração (constante)", "m/s²"], ["Δs", "deslocamento", "m"]], obs: "Use quando o tempo não é dado nem pedido." },
      { nome: "2ª lei de Newton", eq: `F<sub>res</sub> = m·a`, simbolos: [["F<sub>res</sub>", "soma vetorial das forças", "N"], ["m", "massa", "kg"], ["a", "aceleração", "m/s²"]], obs: "F é a força resultante, não uma força qualquer: some todas com sinal." },
      { nome: "Conservação da energia mecânica", eq: `m·g·h₁ + ${fr("m·v₁²", "2")} = m·g·h₂ + ${fr("m·v₂²", "2")}`, simbolos: [["g", "aceleração da gravidade", "m/s²"], ["h", "altura em relação a uma referência", "m"]], obs: "Vale sem atrito nem resistência do ar. A massa se cancela." },
      { nome: "Potência elétrica", eq: `P = V·i`, simbolos: [["P", "potência", "W"], ["V", "tensão", "V"], ["i", "corrente", "A"]], obs: "Com a lei de Ohm (V = R·i), também P = R·i² = V²/R." },
    ],
    exemplos: [
      {
        t: "dinâmica em cadeia",
        enunciado: `Uma caixa de 50 kg, em repouso no chão, é puxada por uma força horizontal de 200 N. O coeficiente de atrito cinético é 0,20. Que velocidade ela atinge após 5,0 s? (g = 10 m/s²)`,
        passos: [
          `Dados no SI: m = 50 kg, F = 200 N, μ = 0,20, v₀ = 0, t = 5,0 s, v = ?`,
          `Normal = peso (chão horizontal): N = m·g = 50 × 10 = 500 N. Atrito: F<sub>at</sub> = μ·N = 0,20 × 500 = 100 N.`,
          `Força resultante: 200 − 100 = 100 N. Aceleração: a = 100 N / 50 kg = 2,0 m/s².`,
          `Velocidade: v = v₀ + a·t = 0 + 2,0 × 5,0 = 10 m/s. Conferência: N/kg = m/s², e (m/s²) × s = m/s.`,
        ],
        resposta: `<b>v = 10 m/s</b> (36 km/h), depois de percorrer 25 m`,
      },
      {
        t: "energia",
        enunciado: `Um carrinho de montanha-russa parte do repouso no alto de uma descida de 20 m. Desprezando atritos, qual a velocidade no ponto mais baixo? E num ponto a 15 m de altura? (g = 10 m/s²)`,
        passos: [
          `Sem tempo no enunciado e com alturas e velocidades: conservação de energia.`,
          `Isolar antes: m·g·h₁ = m·g·h₂ + m·v²/2 → v = √(2·g·(h₁ − h₂)). A massa se cancela.`,
          `No ponto mais baixo: v = √(2 × 10 × 20) = √400 = 20 m/s.`,
          `A 15 m: v = √(2 × 10 × 5) = √100 = 10 m/s. Conferência: √(m/s² × m) = √(m²/s²) = m/s.`,
        ],
        resposta: `<b>20 m/s</b> no fundo e <b>10 m/s</b> a 15 m de altura`,
      },
      {
        t: "eletricidade (de prova)",
        enunciado: `Um chuveiro de 5 500 W / 220 V fica ligado 15 minutos por dia. Qual a corrente, a resistência e a energia gasta em 30 dias, em kWh?`,
        passos: [
          `Corrente: i = P/V = 5 500 W / 220 V = 25 A.`,
          `Resistência: R = V/i = 220 V / 25 A = 8,8 Ω (ou R = V²/P = 48 400 / 5 500 = 8,8 Ω).`,
          `Tempo total: 15 min × 30 = 450 min = 7,5 h. Potência em kW: 5,5 kW.`,
          `Energia: E = P·Δt = 5,5 kW × 7,5 h = 41,25 kWh (≈ 1,5×10⁸ J).`,
        ],
        resposta: `<b>i = 25 A</b>, <b>R = 8,8 Ω</b>, <b>E ≈ 41 kWh</b> por mês`,
      },
    ],
    erros: [
      { errado: `Pôr 72 km/h direto em v = v₀ + a·t junto com o tempo em segundos.`, certo: `Converter antes: 72 km/h ÷ 3,6 = 20 m/s.`, porque: `Misturar km/h com s dá números sem sentido; a unidade do resultado nem fecha.` },
      { errado: `Usar F = m·a com uma força só (a aplicada), esquecendo o atrito.`, certo: `F em F = m·a é a força resultante: some todas as forças com sinal.`, porque: `A aceleração depende do “saldo” das forças, não de uma delas.` },
      { errado: `Escrever a = +5 m/s² num carro que freia.`, certo: `Escolha um sentido positivo; se a aceleração é contra o movimento, ela é negativa.`, porque: `Com o sinal errado, a distância de frenagem sai 120 m em vez de 40 m.` },
      { errado: `Substituir os números logo no início e ir “arrastando” contas parciais arredondadas.`, certo: `Isolar a incógnita com letras e só substituir no final.`, porque: `Arredondamentos intermediários se acumulam, e a expressão literal permite testar casos-limite.` },
      { errado: `Confundir massa (kg) com peso (N).`, certo: `Peso é força: P = m·g. Uma pessoa de 70 kg pesa cerca de 700 N.`, porque: `Na linguagem do dia a dia “peso” é dado em kg, mas na física peso é medido em newtons.` },
    ],
    aplicacoes: [
      `<b>Engenharia</b>: todo projeto (ponte, motor, instalação elétrica) começa listando dados, hipóteses e unidades, exatamente como neste roteiro.`,
      `<b>Trânsito</b>: peritos estimam a velocidade de um carro pela marca de frenagem usando v² = 2·a·d.`,
      `<b>Contas de luz</b>: potência × tempo em kWh diz quanto cada aparelho pesa no orçamento.`,
      `<b>Ciência de dados e programação</b>: conferir unidades e ordens de grandeza é o mesmo hábito que pega bugs em simulações numéricas.`,
    ],
    teste: [
      { p: `Um problema dá a velocidade inicial, a final e a distância, e pede a aceleração. Qual a equação mais direta?`, op: [`v = v₀ + a·t`, `v² = v₀² + 2·a·Δs`, `Δs = v·t`, `F = m·a`], certa: 1, explica: `Torricelli liga exatamente v, v₀, a e Δs, sem o tempo. As outras exigiriam o tempo ou a força.` },
      { p: `Você calculou uma distância e o resultado saiu em m/s. O que isso indica?`, op: [`Nada; basta trocar a unidade para m.`, `Que faltou multiplicar por g.`, `Que há um erro na fórmula ou na conta: as unidades não fecham.`, `Que o problema tem duas respostas.`], certa: 2, explica: `A unidade é uma checagem automática. Se ela não é de distância, a expressão está errada em algum ponto.` },
      { p: `Por que é melhor isolar a incógnita antes de pôr números?`, op: [`Porque a calculadora exige.`, `Porque evita arredondamentos acumulados e deixa ver como o resultado depende de cada dado.`, `Porque assim a unidade some.`, `Não faz diferença nenhuma.`], certa: 1, explica: `Com a expressão literal você testa casos-limite e unidades, e faz uma única conta no final.` },
      { p: `Na fórmula v = √(2·g·h) da queda livre, o que acontece com v se a massa do corpo dobrar?`, op: [`Dobra.`, `Cai pela metade.`, `Aumenta √2 vezes.`, `Não muda.`], certa: 3, explica: `A massa não aparece na fórmula: sem resistência do ar, corpos de massas diferentes caem juntos.` },
      { p: `O resultado de um problema diz que um elevador residencial sobe a 300 m/s. O que fazer?`, op: [`Aceitar: elevadores modernos são rápidos.`, `Desconfiar: a ordem de grandeza real é ~1 m/s, então há erro de unidade ou de conta.`, `Converter para km/h, que fica mais razoável.`, `Arredondar para 3×10² m/s.`], certa: 1, explica: `300 m/s é quase a velocidade do som. A ordem de grandeza esperada pega erros de prefixo e conversão.` },
    ],
    resumo: [
      `Roteiro: ler e desenhar → listar dados → converter para o SI → escolher a lei → isolar → calcular e conferir.`,
      `Toda grandeza leva unidade; a unidade do resultado confere a conta.`,
      `Sem tempo no problema: Torricelli ou conservação de energia.`,
      `F = m·a usa a força resultante (some todas, com sinal).`,
      `Problemas de prova costumam exigir uma cadeia de duas ou três fórmulas.`,
      `Teste casos-limite e ordem de grandeza antes de entregar a resposta.`,
    ],
    alem: {
      t: "Para ir além: modelos, hipóteses e estimativas de Fermi",
      h: `<p>Toda fórmula é um <b>modelo</b> com hipóteses: “sem atrito”, “aceleração constante”, “resistor ôhmico”. Um bom físico sempre se pergunta se as hipóteses valem no caso real. A queda de 20 m dá 20 m/s sem ar; para uma pena, o resultado real é outro, porque a resistência do ar domina.</p>
        <p>Enrico Fermi ficou famoso por estimar grandezas com pouquíssimos dados, quebrando o problema em fatores cuja ordem de grandeza se conhece. Quantos litros de água uma cidade de 1 milhão de habitantes usa por dia? Cerca de 150 L por pessoa × 10⁶ pessoas ≈ 1,5×10⁸ L ≈ 1,5×10⁵ m³. O valor real costuma estar a um fator de 2 ou 3 disso, o que basta para dimensionar uma estação de tratamento.</p>
        <p>Na faculdade, o mesmo método reaparece com outro nome: <b>modelagem</b>. Escreve-se a lei geral (uma equação diferencial, por exemplo), resolve-se no caso literal, e testam-se os limites (t → 0, t → ∞, parâmetro → 0). Se a solução não se comporta como o esperado nesses extremos, há erro antes de qualquer número.</p>`,
    },
  };

  // ======================================================================
  // 2. Circuitos elétricos
  // ======================================================================
  A.circuitos = {
    tempo: 18, nivel: "Ensino médio → faculdade",
    objetivos: [
      "explicar o que são corrente, tensão e resistência e como se relacionam pela lei de Ohm;",
      "calcular a resistência equivalente de associações em série, em paralelo e mistas;",
      "achar a corrente e a tensão em cada resistor usando divisores de tensão e de corrente;",
      "calcular potência e energia e explicar por que um curto-circuito é perigoso;",
      "aplicar as leis de Kirchhoff a circuitos com mais de uma fonte.",
    ],
    requisitos: [{ id: "formulas", nome: "Como resolver problemas de física" }],
    secoes: [
      {
        t: "A ideia em uma frase",
        h: `<p>Um circuito é um caminho fechado por onde cargas elétricas circulam. A <b>fonte</b> (pilha, tomada) dá energia às cargas, a <b>corrente</b> é o fluxo dessas cargas e os <b>resistores</b> são os trechos que dificultam a passagem e transformam energia elétrica em calor, luz ou movimento.</p>
          <div class="analogia"><b>Analogia:</b> pense em água num sistema de canos. A <b>tensão</b> é a diferença de pressão que a bomba cria; a <b>corrente</b> é a vazão (litros por segundo); a <b>resistência</b> é o estreitamento do cano. Mais pressão, mais vazão; cano mais estreito, menos vazão.</div>
          <p>Três grandezas e suas unidades: corrente <b>i</b> em ampères (1 A = 1 C/s), tensão <b>V</b> em volts (1 V = 1 J/C, energia por unidade de carga) e resistência <b>R</b> em ohms (Ω). Uma pilha comum tem 1,5 V; a tomada, 127 V ou 220 V; um celular carregando puxa cerca de 1 A a 2 A.</p>`,
      },
      {
        t: "Lei de Ohm",
        h: `<p>Num resistor <b>ôhmico</b> (fios metálicos, resistores comuns a temperatura constante), a corrente é proporcional à tensão aplicada:</p>
          <div class="eq">V = R · i</div>
          <p>Dobrou a tensão, dobra a corrente. O gráfico V × i é uma reta pela origem cuja inclinação é a resistência. No gráfico abaixo, o resistor de 20 Ω precisa do dobro da tensão do de 10 Ω para conduzir a mesma corrente.</p>
          <p>A resistência de um fio depende do material e da geometria: R = ρ·L/A. Fio mais longo, mais resistência; fio mais grosso, menos. É por isso que o chuveiro de 5 500 W exige fio grosso: a corrente de 25 A esquentaria um fio fino.</p>`,
        grafico: {
          op: { altura: 220, modo: "dados", rotX: "corrente i (A)", rotY: "tensão V (V)" },
          cena: { x: [0, 1], y: [0, 20], series: [
            { tipo: "funcao", f: (x) => 10 * x, rotulo: "R = 10 Ω", cor: "#4da3ff" },
            { tipo: "funcao", f: (x) => 20 * x, rotulo: "R = 20 Ω", cor: "#f0a23c" },
          ] },
          legenda: "Curva característica de dois resistores ôhmicos: a inclinação da reta é a resistência.",
        },
      },
      {
        t: "Associação em série e em paralelo",
        h: `<p><b>Série</b>: os resistores ficam um depois do outro, num único caminho. A <b>corrente é a mesma</b> em todos e as tensões se somam. A resistência equivalente é a soma:</p>
          <div class="eq">R<sub>eq</sub> = R₁ + R₂ + R₃ + …</div>
          <p><b>Paralelo</b>: os resistores ligam-se aos mesmos dois pontos, oferecendo caminhos alternativos. A <b>tensão é a mesma</b> em todos e as correntes se somam. Somam-se os inversos:</p>
          <div class="eq">${fr("1", "R<sub>eq</sub>")} = ${fr("1", "R₁")} + ${fr("1", "R₂")} + …</div>
          <p>Atalhos úteis: dois resistores em paralelo têm R<sub>eq</sub> = R₁·R₂/(R₁ + R₂) (“produto pela soma”); n resistores iguais a R em paralelo dão R/n. Em paralelo, o equivalente é sempre <b>menor que o menor</b> dos resistores: abrir mais caminhos facilita a passagem.</p>
          <p>Nas casas, as tomadas estão em <b>paralelo</b>: cada aparelho recebe os mesmos 127 V ou 220 V e funciona independentemente. Pisca-piscas antigos eram em série: uma lâmpada queimada apagava todas.</p>`,
      },
      {
        t: "Divisor de tensão e divisor de corrente",
        h: `<p>Em série, a tensão total se reparte <b>na proporção das resistências</b>. Para dois resistores ligados a uma fonte V:</p>
          <div class="eq">V₂ = V · ${fr("R₂", "R₁ + R₂")}</div>
          <p>Com 9 V, R₁ = 1 kΩ e R₂ = 2 kΩ: V₂ = 9 × 2/3 = 6 V e V₁ = 3 V. O resistor maior fica com a maior fatia da tensão.</p>
          <p>Em paralelo, a corrente total se reparte <b>na proporção inversa</b>: o caminho mais fácil leva mais corrente.</p>
          <div class="eq">i₁ = i · ${fr("R₂", "R₁ + R₂")}</div>
          <p>Repare que o numerador é a resistência do <b>outro</b> ramo. Com i = 2 A, R₁ = 12 Ω e R₂ = 4 Ω: i₁ = 2 × 4/16 = 0,5 A e i₂ = 1,5 A.</p>
          <div class="nota">Divisores de tensão estão em todo lugar: potenciômetros (botão de volume), sensores de luz e de temperatura ligados a microcontroladores, e a leitura de bateria do celular.</div>`,
      },
      {
        t: "Potência, energia e curto-circuito",
        h: `<p>A potência é a energia por segundo que um elemento recebe: <b>P = V·i</b>. Num resistor, usando a lei de Ohm:</p>
          <div class="eq">P = V·i = R·i² = ${fr("V²", "R")}</div>
          <p>Qual forma usar? Em série (mesma corrente), P = R·i² mostra que o resistor <b>maior</b> dissipa mais. Em paralelo (mesma tensão), P = V²/R mostra que o resistor <b>menor</b> dissipa mais. A energia consumida é E = P·Δt; na conta de luz, em kWh (1 kWh = 3,6×10⁶ J).</p>
          <p><b>Curto-circuito</b> é uma ligação de resistência quase zero entre os polos da fonte. Pela lei de Ohm, i = V/R com R → 0 faz a corrente disparar. Com 127 V e um fio de 0,05 Ω, a corrente seria da ordem de 2 500 A: o fio aquece violentamente (P = R·i²), derrete o isolamento e pode causar incêndio. Disjuntores e fusíveis existem para cortar a corrente antes disso.</p>`,
      },
    ],
    formulas: [
      { nome: "Lei de Ohm", eq: `V = R·i`, simbolos: [["V", "tensão (diferença de potencial)", "V"], ["R", "resistência", "Ω"], ["i", "corrente", "A"]], obs: "Vale para resistores ôhmicos. Isole conforme o pedido: i = V/R, R = V/i." },
      { nome: "Resistência equivalente", eq: `Série: R<sub>eq</sub> = ΣRₖ &nbsp;·&nbsp; Paralelo: ${fr("1", "R<sub>eq</sub>")} = Σ${fr("1", "Rₖ")}`, simbolos: [["Rₖ", "cada resistor da associação", "Ω"]], obs: "Em circuitos mistos, resolva de dentro para fora, como numa expressão com parênteses." },
      { nome: "Divisores", eq: `V₂ = V·${fr("R₂", "R₁ + R₂")} &nbsp;·&nbsp; i₁ = i·${fr("R₂", "R₁ + R₂")}`, simbolos: [["V, i", "tensão total (série) e corrente total (paralelo)", "V, A"]], obs: "No divisor de corrente, o numerador é a resistência do outro ramo." },
      { nome: "Potência elétrica", eq: `P = V·i = R·i² = ${fr("V²", "R")}`, simbolos: [["P", "potência", "W"]], obs: "Energia: E = P·Δt (J se P em W e Δt em s; kWh se P em kW e Δt em h)." },
    ],
    exemplos: [
      {
        t: "circuito misto",
        enunciado: `Um resistor de 6 Ω está em série com a associação em paralelo de 12 Ω e 4 Ω. O conjunto é ligado a 18 V. Ache a corrente e a tensão em cada resistor.`,
        passos: [
          `Paralelo primeiro: R<sub>p</sub> = 12 × 4 / (12 + 4) = 48/16 = 3 Ω.`,
          `Série com o de 6 Ω: R<sub>eq</sub> = 6 + 3 = 9 Ω. Corrente total: i = 18 V / 9 Ω = 2 A.`,
          `Tensão no de 6 Ω: 6 × 2 = 12 V. Sobram 18 − 12 = 6 V para o paralelo (3 Ω × 2 A = 6 V, confere).`,
          `Correntes no paralelo: 6 V / 12 Ω = 0,5 A e 6 V / 4 Ω = 1,5 A. Soma: 2 A, igual à total.`,
          `Potências: 6 Ω → 24 W; 12 Ω → 3 W; 4 Ω → 9 W. Total 36 W = 18 V × 2 A.`,
        ],
        resposta: `<b>i = 2 A</b> no de 6 Ω (12 V); <b>0,5 A</b> no de 12 Ω e <b>1,5 A</b> no de 4 Ω (6 V cada)`,
      },
      {
        t: "divisor de tensão",
        enunciado: `Uma bateria de 9 V alimenta R₁ = 1,0 kΩ e R₂ = 2,0 kΩ em série. Qual a tensão sobre R₂ e a corrente no circuito?`,
        passos: [
          `R<sub>eq</sub> = 1,0 + 2,0 = 3,0 kΩ = 3 000 Ω.`,
          `Corrente: i = 9 V / 3 000 Ω = 0,003 A = 3 mA.`,
          `Tensão em R₂: V₂ = 2 000 Ω × 0,003 A = 6 V, ou pelo divisor: 9 × 2/3 = 6 V.`,
        ],
        resposta: `<b>V₂ = 6 V</b> e <b>i = 3 mA</b>`,
      },
      {
        t: "de prova: lâmpadas em série",
        enunciado: `Uma lâmpada de 60 W / 220 V e outra de 100 W / 220 V são ligadas em série a 220 V. Qual brilha mais?`,
        passos: [
          `Resistências (pelos valores nominais): R = V²/P. R₆₀ = 48 400/60 ≈ 806,7 Ω; R₁₀₀ = 48 400/100 = 484 Ω.`,
          `Série: R<sub>eq</sub> ≈ 1 290,7 Ω e i = 220/1 290,7 ≈ 0,170 A, a mesma nas duas.`,
          `Mesma corrente → use P = R·i². P₆₀ ≈ 806,7 × 0,0291 ≈ 23,4 W; P₁₀₀ ≈ 484 × 0,0291 ≈ 14,1 W.`,
          `A de “60 W” dissipa mais, porque tem a maior resistência. Total: 37,5 W, bem menos que 160 W.`,
        ],
        resposta: `A lâmpada de <b>60 W</b> brilha mais (≈ 23 W contra ≈ 14 W)`,
      },
    ],
    erros: [
      { errado: `Achar que a corrente “se gasta” ao passar por um resistor em série.`, certo: `Em série, a corrente é a mesma em todos os pontos; o que cai de um resistor para o outro é o potencial.`, porque: `Carga não se cria nem se destrói: o que entra num ponto sai dele.` },
      { errado: `Somar resistências em paralelo: 12 Ω ∥ 4 Ω = 16 Ω.`, certo: `Somam-se os inversos: 1/R = 1/12 + 1/4 = 4/12 → R = 3 Ω.`, porque: `Em paralelo o equivalente é sempre menor que o menor resistor.` },
      { errado: `Esquecer de inverter no final: “1/R<sub>eq</sub> = 1/3, então R<sub>eq</sub> = 1/3 Ω”.`, certo: `Se 1/R<sub>eq</sub> = 1/3 Ω⁻¹, então R<sub>eq</sub> = 3 Ω.` },
      { errado: `Usar P = V²/R com a tensão da fonte para um resistor que está em série com outros.`, certo: `Use a tensão sobre aquele resistor, ou P = R·i² com a corrente dele.`, porque: `Em série a tensão da fonte se divide; nenhum resistor recebe a tensão inteira.` },
      { errado: `Pensar que a lâmpada de maior potência nominal sempre brilha mais.`, certo: `A potência nominal vale só na tensão nominal. Em série, brilha mais a de maior resistência (menor potência nominal).` },
    ],
    aplicacoes: [
      `<b>Instalação residencial</b>: tomadas em paralelo, disjuntores dimensionados pela corrente (chuveiro de 5 500 W em 220 V puxa 25 A) e bitola de fio escolhida para não aquecer.`,
      `<b>Eletrônica</b>: divisores de tensão adaptam sinais de sensores à faixa de leitura de microcontroladores (por exemplo, de 12 V para 3,3 V).`,
      `<b>Segurança</b>: fusíveis e disjuntores interrompem curtos-circuitos; o DR detecta fuga de corrente pelo corpo humano.`,
      `<b>Carros elétricos</b>: baterias combinam células em série (para somar tensão, ~400 V) e em paralelo (para somar corrente e capacidade).`,
    ],
    teste: [
      { p: `Três lâmpadas iguais estão em paralelo numa tomada. Uma queima. O que acontece com as outras?`, op: [`Apagam todas.`, `Continuam acesas com o mesmo brilho.`, `Brilham mais, porque sobra corrente.`, `Brilham menos.`], certa: 1, explica: `Em paralelo, cada lâmpada recebe a tensão da tomada independentemente das outras; a corrente total diminui, mas cada uma continua igual.` },
      { p: `Dois resistores de 10 Ω em paralelo equivalem a…`, op: [`20 Ω`, `10 Ω`, `5 Ω`, `100 Ω`], certa: 2, explica: `n resistores iguais em paralelo: R/n = 10/2 = 5 Ω. Dois caminhos iguais conduzem o dobro da corrente.` },
      { p: `Num divisor de tensão com R₁ = 1 kΩ e R₂ = 4 kΩ, qual fração da tensão total fica em R₂?`, op: [`1/5`, `1/4`, `4/5`, `1/2`], certa: 2, explica: `V₂/V = R₂/(R₁ + R₂) = 4/5. Em série, quem tem mais resistência fica com mais tensão.` },
      { p: `Por que um curto-circuito é perigoso?`, op: [`Porque a tensão da fonte aumenta muito.`, `Porque a resistência quase nula faz a corrente ficar enorme, e o calor R·i² pode derreter fios.`, `Porque a corrente para de circular.`, `Porque a energia elétrica vira magnética.`], certa: 1, explica: `i = V/R com R muito pequeno dá corrente muito grande; o aquecimento cresce com o quadrado da corrente.` },
      { p: `Um chuveiro tem chave “inverno/verão”, que muda a resistência mantendo 220 V. No inverno (mais quente), a resistência é…`, op: [`maior, para esquentar mais.`, `menor, porque P = V²/R cresce quando R diminui.`, `igual; só muda a vazão.`, `zero.`], certa: 1, explica: `Com tensão fixa, P = V²/R: menor resistência, maior potência, água mais quente.` },
      { p: `Qual afirmação vale para resistores em série?`, op: [`A tensão é a mesma em todos.`, `A corrente se divide entre eles.`, `A corrente é a mesma e as tensões se somam.`, `O equivalente é menor que o menor resistor.`], certa: 2, explica: `Série tem um único caminho: mesma corrente; a tensão total é a soma das quedas em cada resistor.` },
    ],
    resumo: [
      `Corrente (A) é fluxo de carga; tensão (V) é energia por carga; resistência (Ω) dificulta a passagem.`,
      `Lei de Ohm: V = R·i.`,
      `Série: mesma corrente, R<sub>eq</sub> = soma. Paralelo: mesma tensão, 1/R<sub>eq</sub> = soma dos inversos.`,
      `Divisor de tensão: V₂ = V·R₂/(R₁ + R₂). Divisor de corrente: i₁ = i·R₂/(R₁ + R₂).`,
      `P = V·i = R·i² = V²/R; E = P·Δt.`,
      `Curto-circuito: R ≈ 0 → corrente enorme → aquecimento perigoso.`,
    ],
    alem: {
      t: "Para ir além: leis de Kirchhoff",
      h: `<p>Quando há mais de uma fonte, ou o circuito não se reduz a série e paralelo, usam-se as duas leis de Kirchhoff (1845):</p>
        <ul><li><b>Lei dos nós</b> (conservação da carga): a soma das correntes que chegam a um nó é igual à soma das que saem.</li>
        <li><b>Lei das malhas</b> (conservação da energia): ao percorrer qualquer caminho fechado, a soma das variações de potencial é zero.</li></ul>
        <p>Exemplo: dois ramos com fontes, 12 V em série com 2 Ω e 6 V em série com 2 Ω, ligados em paralelo a um resistor de 4 Ω. Chamando de V o potencial do nó superior (o inferior é 0 V), a lei dos nós dá:</p>
        <div class="eq">${fr("12 − V", "2")} + ${fr("6 − V", "2")} = ${fr("V", "4")} → 9 = 1,25·V → V = 7,2 V</div>
        <p>Correntes: (12 − 7,2)/2 = 2,4 A saem da fonte de 12 V; (6 − 7,2)/2 = −0,6 A na outra, ou seja, 0,6 A <b>entram</b> pelo polo positivo da fonte de 6 V (ela está sendo carregada); e 7,2/4 = 1,8 A passam pelo resistor. Conferência no nó: 2,4 − 0,6 = 1,8 A.</p>
        <p>Esse método (análise nodal) é o que programas como o SPICE usam para simular circuitos com milhões de componentes: viram um grande sistema linear resolvido por computador.</p>`,
    },
  };

  // ======================================================================
  // 3. Lançamento oblíquo
  // ======================================================================
  const traj = (graus) => {
    const th = (graus * Math.PI) / 180, v0 = 20, g = 10;
    const alc = (v0 * v0 * Math.sin(2 * th)) / g;
    return { f: (x) => x * Math.tan(th) - (g * x * x) / (2 * v0 * v0 * Math.cos(th) ** 2), dominio: [0, alc] };
  };

  A.lancamento = {
    tempo: 18, nivel: "Ensino médio → faculdade",
    objetivos: [
      "decompor a velocidade inicial em componentes horizontal e vertical;",
      "explicar por que os movimentos horizontal e vertical são independentes;",
      "calcular altura máxima, tempo de voo e alcance de um lançamento oblíquo;",
      "justificar por que 45° dá o maior alcance e por que ângulos complementares empatam;",
      "resolver lançamentos horizontais a partir de uma altura.",
    ],
    requisitos: [{ id: "formulas", nome: "Como resolver problemas de física" }, { id: "conversor", nome: "Unidades e SI" }],
    secoes: [
      {
        t: "A ideia em uma frase",
        h: `<p>Um objeto lançado em ângulo, sem resistência do ar, faz <b>dois movimentos simples ao mesmo tempo</b>: na horizontal anda com velocidade constante; na vertical sobe e desce como uma pedra jogada para cima. A combinação dos dois desenha uma <b>parábola</b>.</p>
          <div class="analogia"><b>Analogia:</b> imagine a sombra de uma bola chutada. A sombra no chão (meio-dia, sol a pino) desliza com velocidade constante; a sombra numa parede lateral sobe, para e desce, como num lançamento vertical. A bola real é a soma das duas sombras.</div>
          <p>Galileu percebeu isso por volta de 1600: se o chão é plano e o ar é desprezível, a gravidade só age na vertical, então ela não tem como frear nem acelerar o movimento horizontal.</p>`,
      },
      {
        t: "Decompor a velocidade inicial",
        h: `<p>A velocidade inicial v₀, inclinada de um ângulo θ com a horizontal, é um vetor. Pela trigonometria do triângulo retângulo:</p>
          <div class="eq">v<sub>x</sub> = v₀·cos θ &nbsp;&nbsp;&nbsp; v<sub>0y</sub> = v₀·sen θ</div>
          <p>Com v₀ = 20 m/s e θ = 30°: v<sub>x</sub> = 20 × 0,866 = 17,3 m/s e v<sub>0y</sub> = 20 × 0,5 = 10 m/s. Confira: √(17,3² + 10²) ≈ 20 m/s.</p>
          <p>A partir daí, cada eixo tem sua equação (tomando o ponto de lançamento como origem e “para cima” como positivo):</p>
          <div class="eq">x = v<sub>x</sub>·t &nbsp;&nbsp;&nbsp; y = v<sub>0y</sub>·t − ${fr("g·t²", "2")} &nbsp;&nbsp;&nbsp; v<sub>y</sub> = v<sub>0y</sub> − g·t</div>
          <p>O <b>tempo</b> é a única grandeza que os dois movimentos compartilham. Em quase todo problema, você calcula o tempo por um eixo e o usa no outro.</p>`,
      },
      {
        t: "Altura máxima, tempo de voo e alcance",
        h: `<p><b>No ponto mais alto</b>, a velocidade vertical é zero (a horizontal continua!). Daí:</p>
          <div class="eq">t<sub>sub</sub> = ${fr("v₀·sen θ", "g")} &nbsp;&nbsp;&nbsp; H = ${fr("v₀²·sen²θ", "2g")}</div>
          <p><b>Tempo de voo</b> (volta ao mesmo nível): a descida é simétrica à subida, então T = 2·t<sub>sub</sub> = 2·v₀·sen θ / g.</p>
          <p><b>Alcance</b>: R = v<sub>x</sub>·T = v₀·cos θ · 2·v₀·sen θ / g. Usando 2·sen θ·cos θ = sen 2θ:</p>
          <div class="eq">R = ${fr("v₀²·sen 2θ", "g")}</div>
          <p>Para v₀ = 20 m/s e g = 10 m/s², a 30°: t<sub>sub</sub> = 1,0 s, T = 2,0 s, H = 5,0 m e R = 400 × 0,866/10 ≈ 34,6 m.</p>
          <div class="nota">Essas três fórmulas só valem quando o objeto cai no <b>mesmo nível</b> de onde saiu. Se cai num nível diferente, volte às equações de x(t) e y(t).</div>`,
      },
      {
        t: "Por que 45°? E os ângulos complementares",
        h: `<p>Na fórmula R = v₀²·sen 2θ / g, o alcance é máximo quando sen 2θ = 1, isto é, 2θ = 90° e <b>θ = 45°</b>. Com 20 m/s, o alcance máximo é 400/10 = 40 m.</p>
          <p>Como sen(180° − α) = sen α, os ângulos θ e 90° − θ dão o <b>mesmo sen 2θ</b>: 30° e 60° têm alcances iguais (≈ 34,6 m), 15° e 75° também. A diferença está na altura e no tempo: a 60° a bola sobe 15 m e fica 3,5 s no ar; a 30°, sobe só 5 m e fica 2,0 s.</p>
          <p>O gráfico mostra as três trajetórias com a mesma v₀ = 20 m/s. Passe o dedo para ler alturas em cada ponto.</p>`,
        grafico: {
          op: { altura: 240, modo: "dados", rotX: "x (m)", rotY: "y (m)", igual: true },
          cena: { x: [0, 42], y: [0, 16], series: [
            { tipo: "funcao", ...traj(30), rotulo: "30°", cor: "#4da3ff" },
            { tipo: "funcao", ...traj(45), rotulo: "45°", cor: "#f0a23c" },
            { tipo: "funcao", ...traj(60), rotulo: "60°", cor: "#e5646e" },
          ] },
          legenda: "Mesma v₀ = 20 m/s, g = 10 m/s²: 45° alcança 40 m; 30° e 60° empatam em ≈ 34,6 m, com alturas de 5 m e 15 m.",
        },
      },
      {
        t: "Lançamento horizontal",
        h: `<p>Se o objeto sai na horizontal de uma altura h (θ = 0°), a velocidade vertical inicial é zero. A queda é exatamente uma queda livre:</p>
          <div class="eq">h = ${fr("g·t²", "2")} → t = √${fr("2h", "g")} &nbsp;&nbsp;&nbsp; alcance x = v₀·t</div>
          <p>Consequência surpreendente: uma bala disparada na horizontal e outra largada da mesma altura, no mesmo instante, <b>chegam juntas ao chão</b>. A velocidade horizontal não muda o tempo de queda.</p>
          <p>A velocidade ao tocar o chão tem duas componentes: v<sub>x</sub> = v₀ (não muda) e v<sub>y</sub> = g·t. O módulo é √(v<sub>x</sub>² + v<sub>y</sub>²) e o ângulo abaixo da horizontal sai de tg α = v<sub>y</sub>/v<sub>x</sub>.</p>`,
      },
    ],
    formulas: [
      { nome: "Componentes", eq: `v<sub>x</sub> = v₀·cos θ &nbsp;·&nbsp; v<sub>0y</sub> = v₀·sen θ`, simbolos: [["v₀", "módulo da velocidade inicial", "m/s"], ["θ", "ângulo com a horizontal", "°"]], obs: "Primeiro passo de todo lançamento oblíquo." },
      { nome: "Altura máxima", eq: `H = ${fr("v₀²·sen²θ", "2g")}`, simbolos: [["H", "altura máxima acima do ponto de lançamento", "m"], ["g", "gravidade", "m/s²"]], obs: "Vem de Torricelli na vertical com v<sub>y</sub> = 0 no topo." },
      { nome: "Tempo de voo", eq: `T = ${fr("2·v₀·sen θ", "g")}`, simbolos: [["T", "tempo até voltar ao nível inicial", "s"]], obs: "Só para chegada no mesmo nível da saída." },
      { nome: "Alcance", eq: `R = ${fr("v₀²·sen 2θ", "g")}`, simbolos: [["R", "distância horizontal até voltar ao nível inicial", "m"]], obs: "Máximo em 45°; ângulos complementares dão o mesmo R." },
    ],
    exemplos: [
      {
        t: "direto",
        enunciado: `Uma bola é lançada a 20 m/s, a 30° com a horizontal, de um chão plano. Ache a altura máxima, o tempo de voo e o alcance. (g = 10 m/s²)`,
        passos: [
          `Componentes: v<sub>x</sub> = 20 × cos 30° ≈ 17,32 m/s; v<sub>0y</sub> = 20 × sen 30° = 10 m/s.`,
          `Subida: t<sub>sub</sub> = 10/10 = 1,0 s. Altura: H = 10²/(2 × 10) = 5,0 m.`,
          `Tempo de voo: T = 2 × 1,0 = 2,0 s.`,
          `Alcance: R = v<sub>x</sub>·T = 17,32 × 2,0 ≈ 34,6 m (ou 20² × sen 60°/10 = 34,6 m).`,
        ],
        resposta: `<b>H = 5,0 m</b>, <b>T = 2,0 s</b>, <b>R ≈ 34,6 m</b>`,
      },
      {
        t: "lançamento horizontal",
        enunciado: `Uma bolinha rola sobre uma mesa de 1,25 m de altura e sai pela borda a 3,0 m/s. A que distância do pé da mesa ela toca o chão, e com que velocidade? (g = 10 m/s²)`,
        passos: [
          `Tempo de queda (vertical, começa com v<sub>y</sub> = 0): t = √(2 × 1,25/10) = √0,25 = 0,50 s.`,
          `Distância horizontal: x = 3,0 m/s × 0,50 s = 1,5 m.`,
          `Velocidade vertical ao chegar: v<sub>y</sub> = 10 × 0,50 = 5,0 m/s; horizontal continua 3,0 m/s.`,
          `Módulo: √(3,0² + 5,0²) = √34 ≈ 5,8 m/s.`,
        ],
        resposta: `Cai a <b>1,5 m</b> da mesa, a <b>≈ 5,8 m/s</b>`,
      },
      {
        t: "de prova: dois ângulos",
        enunciado: `Um jogador chuta uma bola a 72 km/h e ela cai a 20 m de distância, no mesmo nível. Que ângulos de chute são possíveis? Qual fica mais tempo no ar? (g = 10 m/s²)`,
        passos: [
          `Converter: 72 km/h ÷ 3,6 = 20 m/s.`,
          `Isolar: sen 2θ = R·g/v₀² = 20 × 10/400 = 0,5.`,
          `2θ = 30° ou 2θ = 150° (senos iguais) → θ = 15° ou θ = 75°.`,
          `Tempos: T = 2·v₀·sen θ/g. A 15°: 40 × 0,259/10 ≈ 1,0 s. A 75°: 40 × 0,966/10 ≈ 3,9 s.`,
        ],
        resposta: `<b>15° ou 75°</b>; o chute a 75° fica ≈ 3,9 s no ar, contra ≈ 1,0 s`,
      },
    ],
    erros: [
      { errado: `Dizer que no ponto mais alto a velocidade da bola é zero.`, certo: `No topo só a componente vertical é zero; a horizontal continua v₀·cos θ.`, porque: `Se a velocidade fosse zero, a bola cairia na vertical a partir dali.` },
      { errado: `Usar R = v₀²·sen 2θ/g para um objeto lançado de cima de um prédio.`, certo: `Com desnível, escreva y(t) = h₀ + v<sub>0y</sub>·t − g·t²/2 = 0 e resolva para t.`, porque: `A fórmula do alcance supõe saída e chegada no mesmo nível.` },
      { errado: `Trocar seno e cosseno: v<sub>x</sub> = v₀·sen θ.`, certo: `Com θ medido a partir da horizontal: v<sub>x</sub> = v₀·cos θ e v<sub>y</sub> = v₀·sen θ.`, porque: `O cateto adjacente ao ângulo é o horizontal. Teste: θ = 0° deve dar v<sub>y</sub> = 0.` },
      { errado: `Pensar que uma bala disparada na horizontal demora mais para cair do que uma largada.`, certo: `As duas chegam juntas: o tempo de queda só depende da altura.`, porque: `Os movimentos horizontal e vertical são independentes.` },
      { errado: `Calcular sen 2θ com a calculadora em radianos.`, certo: `Confira o modo da calculadora (DEG para graus).`, porque: `sen(60) em radianos dá −0,305, e o alcance sai negativo.` },
    ],
    aplicacoes: [
      `<b>Esportes</b>: no basquete, um arremesso mais alto (ângulo maior) aumenta a “janela” de entrada da bola na cesta; no futebol, o chute em cobertura usa o ângulo complementar.`,
      `<b>Combate a incêndio e irrigação</b>: o alcance de um jato de água é planejado pela pressão (que define v₀) e pelo ângulo do bico.`,
      `<b>Balística e defesa civil</b>: estimar até onde chegam fragmentos de uma explosão ou detritos de uma erupção.`,
      `<b>Jogos e animação</b>: motores de física calculam trajetórias parabólicas quadro a quadro com x = v<sub>x</sub>·t e y = v<sub>y</sub>·t − g·t²/2.`,
    ],
    teste: [
      { p: `Durante o voo (sem ar), o que acontece com a componente horizontal da velocidade?`, op: [`Diminui até zero no topo.`, `Aumenta na descida.`, `Permanece constante.`, `Inverte de sentido no topo.`], certa: 2, explica: `A gravidade é vertical; sem resistência do ar, nada age na horizontal, então v<sub>x</sub> não muda.` },
      { p: `Duas bolas são lançadas com a mesma velocidade, a 20° e a 70°. Sobre os alcances:`, op: [`O de 70° é maior.`, `São iguais.`, `O de 20° é maior.`, `Depende da massa das bolas.`], certa: 1, explica: `20° e 70° são complementares: sen 40° = sen 140°. O de 70° sobe mais e demora mais, mas cai no mesmo lugar.` },
      { p: `Se a velocidade de lançamento dobrar (mesmo ângulo), o alcance…`, op: [`dobra.`, `quadruplica.`, `fica igual.`, `aumenta √2 vezes.`], certa: 1, explica: `R é proporcional a v₀². Dobrar v₀ multiplica o alcance (e a altura máxima) por 4; o tempo de voo só dobra.` },
      { p: `Qual a aceleração da bola no ponto mais alto da trajetória?`, op: [`Zero.`, `g, para baixo.`, `g, para cima.`, `Horizontal, igual a v<sub>x</sub>/t.`], certa: 1, explica: `A única força é o peso durante todo o voo, então a aceleração é sempre g para baixo, inclusive no topo.` },
      { p: `Um avião voa na horizontal e solta uma caixa. Visto do chão, sem ar, a caixa…`, op: [`cai em linha reta vertical.`, `descreve uma parábola e fica sempre embaixo do avião.`, `fica para trás do avião.`, `segue em frente do avião.`], certa: 1, explica: `A caixa mantém a velocidade horizontal do avião; os dois avançam juntos na horizontal enquanto ela cai.` },
    ],
    resumo: [
      `Decomponha: v<sub>x</sub> = v₀·cos θ (constante) e v<sub>0y</sub> = v₀·sen θ (muda com −g·t).`,
      `Os movimentos horizontal e vertical são independentes; o tempo é a ponte entre eles.`,
      `No topo, v<sub>y</sub> = 0, mas v<sub>x</sub> continua.`,
      `Mesmo nível: H = v₀²·sen²θ/(2g), T = 2·v₀·sen θ/g, R = v₀²·sen 2θ/g.`,
      `Alcance máximo a 45°; ângulos complementares dão o mesmo alcance.`,
      `Lançamento horizontal: t = √(2h/g), x = v₀·t.`,
    ],
    alem: {
      t: "Para ir além: desnível e resistência do ar",
      h: `<p>Quando o lançamento parte de uma altura h acima do ponto de chegada, o ângulo ótimo fica <b>abaixo de 45°</b>. A conta (derivando o alcance em relação a θ) dá:</p>
        <div class="eq">tg θ* = ${fr("v₀", "√(v₀² + 2·g·h)")}</div>
        <p>Para um arremesso de peso com v₀ = 13 m/s saindo a 2,0 m de altura (g = 9,8 m/s²): tg θ* = 13/√(169 + 39,2) ≈ 0,90, θ* ≈ 42°. Atletas reais usam cerca de 37°, porque o corpo humano consegue imprimir mais velocidade em ângulos mais baixos.</p>
        <p>Com <b>resistência do ar</b>, a força de arrasto (aproximadamente proporcional a v² em velocidades de esporte) freia mais a bola na subida, quando ela é mais rápida. A trajetória deixa de ser parábola: a descida fica mais íngreme que a subida, o alcance cai bastante e o ângulo ótimo fica tipicamente entre 30° e 40°. Uma bola de golfe ainda ganha sustentação pelo efeito Magnus (giro para trás). Esses casos não têm fórmula fechada simples e são resolvidos numericamente, passo a passo no tempo, exatamente como fazem os simuladores de jogos.</p>`,
    },
  };

  // ======================================================================
  // 4. Unidades, SI e análise dimensional
  // ======================================================================
  A.conversor = {
    tempo: 15, nivel: "Ensino médio → faculdade · base para toda a física",
    objetivos: [
      "reconhecer as sete unidades de base do SI e os prefixos mais usados;",
      "escrever números em notação científica e estimar ordens de grandeza;",
      "converter unidades em cadeia com fatores unitários, inclusive áreas, volumes e km/h ↔ m/s;",
      "usar análise dimensional para conferir fórmulas e detectar erros.",
    ],
    secoes: [
      {
        t: "A ideia em uma frase",
        h: `<p>Toda medida é <b>um número vezes uma unidade</b>. “Distância: 5” não significa nada; “5 km” e “5 mm” diferem por um fator de um milhão. Converter unidades é trocar a unidade sem mudar a grandeza: 1 km e 1 000 m são a mesma distância.</p>
          <div class="analogia"><b>Analogia:</b> unidades funcionam como moedas. R$ 100 e US$ 20 podem valer a mesma coisa, mas você não pode somar 100 com 20. Antes de qualquer conta, converta tudo para a mesma “moeda”, que na física é o SI.</div>
          <p>O Sistema Internacional (SI) é o padrão adotado por quase todo o mundo e por toda a ciência. Usá-lo em todas as contas evita fatores esquecidos: força em N, energia em J, potência em W saem automaticamente certas se as entradas estiverem em m, kg e s.</p>`,
      },
      {
        t: "As unidades de base e os prefixos",
        h: `<p>O SI tem <b>sete unidades de base</b>; todas as outras são combinações delas:</p>
          <div class="tab-rolar"><table class="tb">
            <tr><th>Grandeza</th><th>Unidade</th><th>Símbolo</th></tr>
            <tr><td>comprimento</td><td>metro</td><td>m</td></tr>
            <tr><td>massa</td><td>quilograma</td><td>kg</td></tr>
            <tr><td>tempo</td><td>segundo</td><td>s</td></tr>
            <tr><td>corrente elétrica</td><td>ampère</td><td>A</td></tr>
            <tr><td>temperatura</td><td>kelvin</td><td>K</td></tr>
            <tr><td>quantidade de matéria</td><td>mol</td><td>mol</td></tr>
            <tr><td>intensidade luminosa</td><td>candela</td><td>cd</td></tr>
          </table></div>
          <p>Unidades derivadas: newton (N = kg·m/s²), joule (J = N·m = kg·m²/s²), watt (W = J/s), pascal (Pa = N/m²), volt (V = W/A), ohm (Ω = V/A).</p>
          <p>Prefixos multiplicam a unidade por potências de 10: giga G = 10⁹, mega M = 10⁶, quilo k = 10³, centi c = 10⁻², mili m = 10⁻³, micro μ = 10⁻⁶, nano n = 10⁻⁹. Atenção: o próprio kg já tem prefixo; 1 g = 10⁻³ kg.</p>`,
      },
      {
        t: "Notação científica e ordem de grandeza",
        h: `<p>Em notação científica, escreve-se um número como <b>a × 10ⁿ</b>, com 1 ≤ a &lt; 10. A velocidade da luz é 3,00×10⁸ m/s; a massa de um elétron, 9,11×10⁻³¹ kg. Multiplicar e dividir fica fácil: somam-se ou subtraem-se os expoentes.</p>
          <div class="eq">(3×10⁸) × (2×10⁻³) = 6×10⁵ &nbsp;&nbsp;&nbsp; ${fr("6×10⁵", "2×10²")} = 3×10³</div>
          <p>A <b>ordem de grandeza</b> é a potência de 10 mais próxima do valor. Regra prática: se a ≥ √10 ≈ 3,16, arredonda-se para a potência seguinte. Assim, 2,5×10⁹ tem ordem 10⁹, mas 4×10⁹ tem ordem 10¹⁰.</p>
          <p>Ordens de grandeza são ótimas para conferir respostas e para estimar: a altura de uma pessoa é da ordem de 1 m, de um prédio de 10 andares 10 m (30 m está mais perto de 10¹ que de 10²), e a distância Terra–Sol, 1,5×10¹¹ m, é da ordem de 10¹¹ m.</p>`,
      },
      {
        t: "Conversões em cadeia com fatores unitários",
        h: `<p>O método mais seguro é multiplicar por <b>frações que valem 1</b> (porque numerador e denominador são a mesma quantidade), arranjadas para que a unidade antiga se cancele:</p>
          <div class="eq">72 ${fr("km", "h")} × ${fr("1 000 m", "1 km")} × ${fr("1 h", "3 600 s")} = ${fr("72 000 m", "3 600 s")} = 20 ${fr("m", "s")}</div>
          <p>Daí vem o atalho: <b>km/h → m/s divide por 3,6</b>; m/s → km/h multiplica por 3,6.</p>
          <p>Em <b>áreas e volumes</b>, o fator vai ao quadrado ou ao cubo, porque a unidade aparece duas ou três vezes: 1 m² = (100 cm)² = 10⁴ cm²; 1 m³ = (10 dm)³ = 1 000 dm³ = 1 000 L. Um erro clássico é achar que 1 m² = 100 cm².</p>
          <p><b>Temperatura</b> não é só multiplicar: T(K) = T(°C) + 273,15 e T(°F) = 1,8·T(°C) + 32. Mas uma <b>variação</b> de 1 °C é igual a uma variação de 1 K.</p>`,
      },
      {
        t: "Análise dimensional: o teste das unidades",
        h: `<p>Toda equação física válida é <b>dimensionalmente homogênea</b>: os dois lados (e cada parcela de uma soma) têm a mesma dimensão. Usando M (massa), L (comprimento) e T (tempo):</p>
          <div class="eq">[v] = L·T⁻¹ &nbsp;&nbsp; [a] = L·T⁻² &nbsp;&nbsp; [F] = M·L·T⁻² &nbsp;&nbsp; [E] = M·L²·T⁻²</div>
          <p>Teste de v² = v₀² + 2·a·Δs: [v²] = L²T⁻²; [a·Δs] = L·T⁻² · L = L²T⁻². Homogênea. Já “v = a·Δs” daria L²T⁻² ≠ L·T⁻¹: está errada, com certeza.</p>
          <p>A análise dimensional também <b>adivinha</b> fórmulas. O período de um pêndulo só pode depender do comprimento L e de g (a massa não pode entrar, porque nada mais tem M para cancelá-la). A única combinação com dimensão de tempo é √(L/g); a fórmula completa é T = 2π·√(L/g). O 2π, número puro, a análise não revela.</p>
          <div class="nota">Argumentos de funções como sen, cos, log e exponencial têm de ser <b>adimensionais</b>: e<sup>−t</sup> só faz sentido como e<sup>−t/τ</sup>, com τ em segundos.</div>`,
      },
    ],
    formulas: [
      { nome: "Fator unitário", eq: `valor novo = valor antigo × ${fr("unidade nova", "unidade antiga")}`, simbolos: [["fração", "igualdade de unidades escrita como razão que vale 1 (ex.: 1 000 m / 1 km)", "—"]], obs: "Arrume a fração para que a unidade antiga fique no denominador e se cancele." },
      { nome: "Velocidade", eq: `1 m/s = 3,6 km/h`, simbolos: [["km/h → m/s", "divida por 3,6", ""], ["m/s → km/h", "multiplique por 3,6", ""]], obs: "Vem de 1 000 m / 3 600 s." },
      { nome: "Temperatura", eq: `T(K) = T(°C) + 273,15 &nbsp;·&nbsp; T(°F) = 1,8·T(°C) + 32`, simbolos: [["K", "kelvin (escala absoluta)", "K"], ["°C, °F", "Celsius e Fahrenheit", ""]], obs: "Em leis de gases e radiação use sempre kelvin." },
      { nome: "Homogeneidade dimensional", eq: `[lado esquerdo] = [lado direito]`, simbolos: [["M, L, T", "dimensões de massa, comprimento e tempo", ""]], obs: "Passar no teste não prova que a fórmula está certa; falhar prova que está errada." },
    ],
    exemplos: [
      {
        t: "direto",
        enunciado: `O limite de velocidade numa rodovia é 108 km/h. Quanto é isso em m/s? E quantos metros o carro percorre em 2,0 s de distração?`,
        passos: [
          `Fatores unitários: 108 km/h × (1 000 m/1 km) × (1 h/3 600 s) = 108 000 m / 3 600 s = 30 m/s. (Atalho: 108 ÷ 3,6 = 30.)`,
          `Distância em 2,0 s: d = 30 m/s × 2,0 s = 60 m.`,
        ],
        resposta: `<b>30 m/s</b>; em 2 s de distração, <b>60 m</b> “às cegas”`,
      },
      {
        t: "densidade e volume",
        enunciado: `A densidade da água é 1,0 g/cm³. Escreva-a em kg/m³ e calcule a massa de água numa caixa de 1 000 L.`,
        passos: [
          `Massa: 1,0 g × (1 kg / 1 000 g) = 10⁻³ kg.`,
          `Volume: 1 cm³ = (10⁻² m)³ = 10⁻⁶ m³ (o fator vai ao cubo).`,
          `Densidade: 10⁻³ kg / 10⁻⁶ m³ = 10³ kg/m³ = 1 000 kg/m³.`,
          `Caixa: 1 000 L = 1 m³, então m = 1 000 kg/m³ × 1 m³ = 1 000 kg (uma tonelada).`,
        ],
        resposta: `<b>1 000 kg/m³</b>; a caixa cheia tem <b>1 t</b> de água`,
      },
      {
        t: "ordem de grandeza (de prova)",
        enunciado: `Qual a ordem de grandeza do número de segundos numa vida de 80 anos?`,
        passos: [
          `Cadeia: 80 anos × 365,25 dias/ano × 24 h/dia × 3 600 s/h.`,
          `80 × 365,25 = 29 220 dias; 29 220 × 86 400 s ≈ 2,52×10⁹ s.`,
          `Como 2,52 &lt; 3,16 (√10), a ordem de grandeza é 10⁹.`,
        ],
        resposta: `Cerca de 2,5×10⁹ s: ordem de grandeza <b>10⁹ s</b>`,
      },
    ],
    erros: [
      { errado: `1 m² = 100 cm².`, certo: `1 m² = (100 cm)² = 10 000 cm².`, porque: `A unidade de área é comprimento × comprimento: o fator de conversão entra ao quadrado.` },
      { errado: `Converter 72 km/h multiplicando por 3,6 (dando 259,2 m/s).`, certo: `km/h → m/s: divida por 3,6 → 20 m/s.`, porque: `O metro por segundo é a unidade “maior”: o mesmo valor em m/s é um número menor.` },
      { errado: `Converter 27 °C para kelvin multiplicando, ou usar °C numa lei de gases.`, certo: `T = 27 + 273 = 300 K, e use kelvin em PV = nRT.`, porque: `As escalas Celsius e Kelvin diferem por um deslocamento, não por um fator.` },
      { errado: `Usar a massa em gramas em F = m·a com a em m/s².`, certo: `No SI a massa é em kg: 500 g = 0,5 kg.`, porque: `O newton é kg·m/s²; com gramas o resultado sai mil vezes maior.` },
    ],
    aplicacoes: [
      `<b>Aviação</b>: em 1983, um Boeing 767 da Air Canada ficou sem combustível em pleno voo porque a carga foi calculada em libras em vez de quilogramas (o “Planador de Gimli”).`,
      `<b>Exploração espacial</b>: em 1999 a NASA perdeu a sonda Mars Climate Orbiter porque um software entregava impulso em libra-força·segundo e outro esperava newton·segundo.`,
      `<b>Saúde</b>: doses de remédio em mg/kg e conversões de mL para gotas exigem fatores corretos; erro de prefixo (mg × μg) é causa conhecida de intoxicação.`,
      `<b>Cozinha e indústria</b>: receitas e processos em escala convertem volumes e massas com fatores unitários e densidades.`,
    ],
    teste: [
      { p: `Quantos litros cabem em 1 m³?`, op: [`10 L`, `100 L`, `1 000 L`, `1 000 000 L`], certa: 2, explica: `1 m³ = (10 dm)³ = 1 000 dm³, e 1 dm³ = 1 L.` },
      { p: `A fórmula “E = m·v” para a energia cinética passa na análise dimensional?`, op: [`Sim, porque m e v são grandezas físicas.`, `Não: m·v tem dimensão M·L·T⁻¹, e energia tem M·L²·T⁻².`, `Sim, se v estiver em m/s.`, `Não, porque falta o fator 1/2.`], certa: 1, explica: `Falta um fator de velocidade. A forma correta, m·v²/2, tem dimensão M·L²·T⁻². O 1/2 é adimensional e a análise não o detecta.` },
      { p: `Qual é a ordem de grandeza de 4,0×10⁵?`, op: [`10⁴`, `10⁵`, `10⁶`, `4`], certa: 2, explica: `Como 4,0 > 3,16 (√10), arredonda-se para a potência seguinte: 10⁶.` },
      { p: `Uma variação de temperatura de 10 °C equivale a quanto em kelvin?`, op: [`283 K`, `10 K`, `−263 K`, `18 K`], certa: 1, explica: `As duas escalas têm graus do mesmo tamanho; só o zero é diferente. Variações são iguais.` },
      { p: `Por que se usa o fator (1 h / 3 600 s) e não (3 600 s / 1 h) para converter km/h em m/s?`, op: [`Tanto faz, os dois valem 1.`, `Porque a hora precisa ficar no numerador para cancelar a hora que está no denominador de km/h.`, `Porque segundo é unidade do SI.`, `Porque 3 600 é maior que 1.`], certa: 1, explica: `Os dois valem 1, mas só um arranjo faz a unidade antiga (h, no denominador) se cancelar.` },
      { p: `O argumento de uma exponencial, como em e<sup>−kt</sup>, precisa ser…`, op: [`em segundos.`, `adimensional, então k tem unidade s⁻¹.`, `positivo.`, `em radianos.`], certa: 1, explica: `Funções como exp, log, sen e cos só aceitam números puros; por isso k·t não pode ter unidade.` },
    ],
    resumo: [
      `Toda medida é número × unidade; converta tudo para o SI antes de calcular.`,
      `Base do SI: m, kg, s, A, K, mol, cd. Derivadas: N, J, W, Pa, V, Ω…`,
      `Fatores unitários: multiplique por frações que valem 1 até a unidade antiga se cancelar.`,
      `km/h ÷ 3,6 = m/s; áreas e volumes elevam o fator ao quadrado e ao cubo.`,
      `Ordem de grandeza: potência de 10 mais próxima (limiar em 3,16).`,
      `Equações físicas são dimensionalmente homogêneas: use isso para pegar erros.`,
    ],
    alem: {
      t: "Para ir além: o SI de 2019 e o teorema Π",
      h: `<p>Até 2019, o quilograma era definido por um cilindro de platina e irídio guardado em Sèvres, na França. Cópias espalhadas pelo mundo foram se afastando dele em dezenas de microgramas ao longo de um século. Desde 20 de maio de 2019, <b>todas as unidades do SI são definidas fixando constantes da natureza</b>: a velocidade da luz c = 299 792 458 m/s, a constante de Planck h = 6,626 070 15×10⁻³⁴ J·s, a carga elementar e = 1,602 176 634×10⁻¹⁹ C, a constante de Boltzmann k = 1,380 649×10⁻²³ J/K, o número de Avogadro, a frequência de transição do césio-133 e a eficácia luminosa K<sub>cd</sub>. Qualquer laboratório bem equipado pode reproduzir o quilograma sem visitar Paris.</p>
        <p>Na faculdade, a análise dimensional vira o <b>teorema Π de Buckingham</b>: se um fenômeno envolve n grandezas com k dimensões independentes, ele pode ser descrito por n − k grupos adimensionais. É assim que engenheiros testam aviões e navios em miniatura: mantendo iguais números adimensionais como o de Reynolds (ρ·v·L/μ), o escoamento no modelo reproduz o real.</p>`,
    },
  };
})();
