/*
 * Aulas de Pesquisa (formato em js/estudo/aula.js).
 * Método científico e tratamento de dados para relatórios, TCC e iniciação científica.
 */
(function () {
  "use strict";
  const E = window.LAB && window.LAB.estudo;
  if (!E) return;
  const A = (E.aulas.pesquisa = E.aulas.pesquisa || {});
  const fr = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;

  // =====================================================================
  // Ajuste linear
  // =====================================================================
  A.ajuste = {
    tempo: 18, nivel: "Ensino médio (laboratório) → faculdade",
    objetivos: [
      "explicar o que o método dos mínimos quadrados minimiza e por que isso dá “a melhor reta”;",
      "calcular a inclinação a e o intercepto b com suas incertezas, e interpretar os resíduos;",
      "usar R² com senso crítico, sabendo o que ele não diz (quarteto de Anscombe);",
      "linearizar relações exponenciais e de potência para obter seus parâmetros com uma reta;",
      "distinguir interpolação de extrapolação e decidir quando usar o ajuste ponderado.",
    ],
    requisitos: [{ id: "incerteza", nome: "Incertezas e propagação" }, { id: "estat", nome: "Estatística de medidas repetidas" }],
    secoes: [
      {
        t: "A ideia em uma frase",
        h: `<p>Quando duas grandezas devem obedecer a uma relação linear, <b>y = a·x + b</b>, os pontos medidos nunca caem exatamente sobre uma reta: cada medida tem um pouco de ruído. O <b>ajuste linear</b> escolhe, entre todas as retas possíveis, aquela que fica <b>mais perto de todos os pontos ao mesmo tempo</b>, e diz quanto podemos confiar na inclinação e no intercepto encontrados.</p>
          <div class="analogia"><b>Analogia:</b> imagine cada ponto preso à reta por um elástico vertical. Pontos distantes puxam com mais força (a energia do elástico cresce com o quadrado da distância). A reta de mínimos quadrados é a posição de equilíbrio: onde a soma dos “puxões ao quadrado” é a menor possível.</div>
          <p>Por que justamente uma reta? Porque é o modelo mais simples que faz uma previsão testável, e porque muitas leis físicas são lineares (v = g·t + v₀ na queda livre, V = R·i na lei de Ohm, F = k·x na mola). Quando a lei não é linear, muitas vezes dá para <b>transformá-la</b> em reta, como veremos. Além disso, a inclinação e o intercepto costumam ter significado físico: no gráfico de velocidade por tempo de um corpo em queda, a inclinação <i>é</i> a aceleração da gravidade.</p>`,
      },
      {
        t: "Resíduos e o critério dos mínimos quadrados",
        h: `<p>Para cada ponto (xᵢ, yᵢ), o <b>resíduo</b> é a distância vertical entre o valor medido e o valor que a reta prevê: <b>rᵢ = yᵢ − (a·xᵢ + b)</b>. Resíduo positivo: o ponto está acima da reta; negativo: abaixo. O método escolhe a e b que tornam mínima a <b>soma dos quadrados dos resíduos</b>, SQR = Σrᵢ². Elevamos ao quadrado para que resíduos positivos e negativos não se cancelem e para que desvios grandes sejam fortemente penalizados.</p>
          <p>Derivando SQR em relação a a e b e igualando a zero, sai uma solução fechada. Com x̄ e ȳ as médias, defina S<sub>xx</sub> = Σ(xᵢ − x̄)² e S<sub>xy</sub> = Σ(xᵢ − x̄)(yᵢ − ȳ). Então a = S<sub>xy</sub>/S<sub>xx</sub> e b = ȳ − a·x̄. Uma consequência curiosa: a reta ajustada sempre passa pelo ponto (x̄, ȳ).</p>
          <p>Os resíduos são o melhor diagnóstico do ajuste. Se a reta é o modelo certo, eles se espalham <b>ao acaso</b> em torno de zero, sem padrão. Se formam um “sorriso” (positivos nas pontas, negativos no meio), a relação é curva. Se crescem com x, o ruído não é constante e um ajuste ponderado seria mais adequado. Um único resíduo enorme aponta um ponto suspeito, que deve ser investigado, não apagado.</p>`,
        grafico: {
          op: { altura: 230, modo: "dados", rotX: "t (s)", rotY: "v (m/s)" },
          cena: {
            x: [0, 0.6], y: [0, 6],
            series: [
              { tipo: "funcao", f: (x) => 9.79 * x + 0.019, dominio: [0, 0.6], rotulo: "reta ajustada: v = 9,79·t + 0,02" },
              { tipo: "pontos", pts: [[0.1, 1.02, 0.05], [0.2, 1.94, 0.05], [0.3, 2.98, 0.05], [0.4, 3.91, 0.05], [0.5, 4.93, 0.05]], rotulo: "medidas (± 0,05 m/s)", cor: "#e8edf3" },
            ],
          },
          legenda: "Velocidade de um corpo em queda livre medida a cada 0,1 s. A inclinação da reta é a aceleração: g = (9,79 ± 0,11) m/s².",
        },
      },
      {
        t: "Incerteza de a e b, e os limites do R²",
        h: `<p>Os pontos têm ruído, logo a e b também têm. Primeiro estima-se o espalhamento típico dos pontos em torno da reta, <b>s = √(SQR/(n − 2))</b>. Dividimos por n − 2, e não por n, porque dois parâmetros foram tirados dos mesmos dados: com só 2 pontos a reta passa exatamente por eles e não sobra informação sobre o ruído. Daí saem σ<sub>a</sub> = s/√S<sub>xx</sub> e σ<sub>b</sub> = s·√(1/n + x̄²/S<sub>xx</sub>). Note que σ<sub>a</sub> diminui quando S<sub>xx</sub> cresce: <b>espalhar bem os valores de x</b> no experimento melhora a inclinação.</p>
          <p>O <b>coeficiente de determinação</b> R² = 1 − SQR/S<sub>yy</sub> é a fração da variação de y que a reta explica. Ele é útil, mas muito superestimado em relatórios:</p>
          <ul><li>R² alto <b>não prova</b> que a relação é linear: uma curva suave pode dar R² = 0,98.</li>
          <li>R² não diz nada sobre a <b>incerteza</b> da inclinação, que é o que você quer relatar.</li>
          <li>R² depende do intervalo de x: o mesmo instrumento dá R² maior se você varrer uma faixa maior.</li></ul>
          <div class="destaque"><b>Quarteto de Anscombe (1973):</b> quatro conjuntos de 11 pontos com a mesma média de x (9,0), a mesma média de y (7,50), a mesma reta ajustada (y = 0,500·x + 3,00) e o mesmo R² ≈ 0,67. No gráfico, um é uma nuvem linear, outro é uma parábola perfeita, outro é uma reta exata com um ponto fora, e o último tem todos os x iguais exceto um. Lição: <b>sempre faça o gráfico</b> e olhe os resíduos antes de confiar em qualquer número.</div>`,
      },
      {
        t: "Linearização: exponenciais e potências",
        h: `<p>Muitas leis não são retas, mas viram retas com logaritmos:</p>
          <ul><li><b>Exponencial</b> y = A·e<sup>k·x</sup> (decaimento radioativo, descarga de capacitor, crescimento de bactérias). Tomando ln: <b>ln y = k·x + ln A</b>. Gráfico de ln y contra x: inclinação k, intercepto ln A.</li>
          <li><b>Potência</b> y = A·x<sup>p</sup> (período do pêndulo T ∝ L<sup>1/2</sup>, lei de Kepler T² ∝ r³). Tomando ln dos dois lados: <b>ln y = p·ln x + ln A</b>. Gráfico log-log: inclinação p, o expoente.</li></ul>
          <p>Depois do ajuste, volte aos parâmetros originais: A = e<sup>b</sup> e, pela propagação, σ<sub>A</sub> ≈ A·σ<sub>b</sub>. O expoente de uma lei de potência sai direto como inclinação, o que é ótimo para <b>descobrir</b> uma lei: se o ajuste log-log dá p = 0,502 ± 0,008, a hipótese T ∝ √L está confirmada.</p>
          <div class="nota">Cuidado: o logaritmo deforma o ruído. Um erro de ±5 em y = 1000 vira ±0,005 em ln y, mas ±5 em y = 50 vira ±0,1. Se o ruído absoluto de y é constante, os pontos com y pequeno deveriam pesar menos, o que pede um ajuste ponderado com σ<sub>ln y</sub> = σ<sub>y</sub>/y. Por isso também não se pode linearizar dados com y ≤ 0.</div>`,
      },
      {
        t: "Ajuste ponderado, interpolar e extrapolar",
        h: `<p>Quando cada ponto tem sua própria incerteza σᵢ (por exemplo, medidas feitas com escalas diferentes), não é justo que todos pesem igual. No <b>ajuste ponderado</b>, cada ponto recebe o peso <b>wᵢ = 1/σᵢ²</b> e minimiza-se χ² = Σ(rᵢ/σᵢ)². Um ponto com metade da incerteza vale por quatro. A qualidade do ajuste é medida pelo <b>χ² reduzido</b>, χ²/(n − 2): perto de 1, os resíduos são do tamanho esperado; muito acima de 1, as incertezas foram subestimadas ou o modelo está errado; muito abaixo de 1, as incertezas foram superestimadas.</p>
          <p>Com a reta em mãos, é natural usá-la para prever. <b>Interpolar</b> é prever dentro da faixa medida: é seguro, e a incerteza da previsão é pequena, mínima em x = x̄. <b>Extrapolar</b> é prever fora dela, e é arriscado por dois motivos: a incerteza cresce com a distância a x̄ (o termo (x₀ − x̄)²/S<sub>xx</sub>), e, pior, nada garante que a lei continue linear lá fora. Um resistor medido até 0,25 A pode esquentar e mudar de resistência a 1 A; uma mola pode deformar permanentemente.</p>
          <p>A incerteza de uma previsão ŷ(x₀) = a·x₀ + b não é √(σ<sub>a</sub>² x₀² + σ<sub>b</sub>²), porque a e b são correlacionados (mexer na inclinação obriga a mexer no intercepto). A fórmula correta é σ<sub>ŷ</sub> = s·√(1/n + (x₀ − x̄)²/S<sub>xx</sub>).</p>`,
      },
    ],
    formulas: [
      { nome: "Coeficientes da reta", eq: `a = ${fr("S<sub>xy</sub>", "S<sub>xx</sub>")} &nbsp;&nbsp; b = ȳ − a·x̄`, simbolos: [["a", "inclinação (coeficiente angular)", "unid. de y / unid. de x"], ["b", "intercepto (valor de y em x = 0)", "unid. de y"], ["S<sub>xx</sub>", "Σ(xᵢ − x̄)²", "unid. de x²"], ["S<sub>xy</sub>", "Σ(xᵢ − x̄)(yᵢ − ȳ)", "unid. de x · unid. de y"]], obs: "A reta sempre passa por (x̄, ȳ)." },
      { nome: "Incertezas dos coeficientes", eq: `s = √${fr("SQR", "n − 2")} &nbsp;&nbsp; σ<sub>a</sub> = ${fr("s", "√S<sub>xx</sub>")} &nbsp;&nbsp; σ<sub>b</sub> = s·√(${fr("1", "n")} + ${fr("x̄²", "S<sub>xx</sub>")})`, simbolos: [["SQR", "soma dos quadrados dos resíduos, Σ(yᵢ − a·xᵢ − b)²", "unid. de y²"], ["s", "desvio-padrão dos resíduos", "unid. de y"], ["n", "número de pontos", "—"]], obs: "Exige n ≥ 3. Com poucos pontos, um intervalo de confiança usa t de Student com n − 2 graus de liberdade." },
      { nome: "Coeficiente de determinação", eq: `R² = 1 − ${fr("SQR", "S<sub>yy</sub>")}`, simbolos: [["S<sub>yy</sub>", "Σ(yᵢ − ȳ)²", "unid. de y²"]], obs: "Mede a fração da variação explicada, não a validade do modelo nem a incerteza dos parâmetros." },
      { nome: "Ajuste ponderado", eq: `wᵢ = ${fr("1", "σᵢ²")} &nbsp;&nbsp; χ²<sub>red</sub> = ${fr("Σ wᵢ rᵢ²", "n − 2")}`, simbolos: [["σᵢ", "incerteza do ponto i em y", "unid. de y"], ["χ²<sub>red</sub>", "qui-quadrado reduzido", "—"]], obs: "χ²_red ≈ 1 indica resíduos compatíveis com as incertezas declaradas." },
    ],
    exemplos: [
      {
        t: "direto: g pela queda livre",
        enunciado: `Mediu-se a velocidade de um corpo em queda: t (s) = 0,10; 0,20; 0,30; 0,40; 0,50 e v (m/s) = 1,02; 1,94; 2,98; 3,91; 4,93. Ajuste v = a·t + b e dê a com sua incerteza.`,
        passos: [
          `Médias: t̄ = 0,30 s; v̄ = (1,02 + 1,94 + 2,98 + 3,91 + 4,93)/5 = 14,78/5 = 2,956 m/s.`,
          `S<sub>tt</sub> = 0,2² + 0,1² + 0 + 0,1² + 0,2² = 0,100 s². S<sub>tv</sub> = (−0,2)(−1,936) + (−0,1)(−1,016) + 0 + (0,1)(0,954) + (0,2)(1,974) = 0,979 m.`,
          `a = 0,979/0,100 = 9,79 m/s²; b = 2,956 − 9,79 × 0,30 = 0,019 m/s.`,
          `Resíduos: 0,022; −0,037; 0,024; −0,025; 0,016 m/s → SQR = 0,00331 (m/s)². s = √(0,00331/3) = 0,0332 m/s.`,
          `σ<sub>a</sub> = 0,0332/√0,100 = 0,105 m/s² → 0,11 (começa com 1: dois algarismos). σ<sub>b</sub> = 0,0332 × √(0,2 + 0,09/0,100) = 0,035 m/s.`,
        ],
        resposta: `<b>g = (9,79 ± 0,11) m/s²</b> e b = (0,02 ± 0,03) m/s, compatível com zero (o corpo partiu do repouso). R² = 0,9997.`,
      },
      {
        t: "linearização: meia-vida",
        enunciado: `A atividade de uma amostra radioativa, em contagens por minuto, foi: t (min) = 0, 10, 20, 30, 40, 50 e N = 1000, 705, 498, 350, 248, 176. Ache a constante de decaimento e a meia-vida.`,
        passos: [
          `Modelo N = N₀·e<sup>k·t</sup> → ln N = k·t + ln N₀. Calcule ln N: 6,908; 6,558; 6,211; 5,858; 5,513; 5,171.`,
          `Ajuste de ln N contra t: t̄ = 25 min, S<sub>tt</sub> = 1750 min², S<sub>t,lnN</sub> = −60,87 min → k = −60,87/1750 = −0,03478 min⁻¹.`,
          `Resíduos da ordem de 0,003 → s = 0,0031 e σ<sub>k</sub> = 0,0031/√1750 = 7×10⁻⁵ min⁻¹. Intercepto b = 6,906 → N₀ = e<sup>6,906</sup> ≈ 998 ± 2 contagens/min.`,
          `t₁/₂ = ln 2/|k| = 0,6931/0,03478 = 19,93 min; σ = ln 2 · σ<sub>k</sub>/k² = 0,6931 × 7,45×10⁻⁵/0,001210 = 0,04 min.`,
        ],
        resposta: `k = (−0,03478 ± 0,00007) min⁻¹ e <b>t₁/₂ = (19,93 ± 0,04) min</b>`,
      },
      {
        t: "interpolar × extrapolar",
        enunciado: `Num resistor, i (A) = 0,05; 0,10; 0,15; 0,20; 0,25 e V (V) = 1,1; 2,0; 3,1; 4,0; 5,1. O ajuste dá R = a = (20,0 ± 0,4) Ω, b = (0,06 ± 0,07) V, s = 0,063 V. Preveja V em 0,18 A e em 1,00 A, com incertezas.`,
        passos: [
          `Dados: n = 5, ī = 0,15 A, S<sub>ii</sub> = 0,025 A².`,
          `Em 0,18 A: V = 20,0 × 0,18 + 0,06 = 3,66 V; σ = 0,063 × √(1/5 + 0,03²/0,025) = 0,063 × √0,236 = 0,031 V.`,
          `Em 1,00 A: V = 20,0 × 1,00 + 0,06 = 20,06 V; σ = 0,063 × √(0,2 + 0,85²/0,025) = 0,063 × √29,1 = 0,34 V, onze vezes maior.`,
          `Além disso, a 1 A o resistor dissipa P = V·i ≈ 20 W (contra 1,3 W no máximo medido): ele esquentaria e R mudaria. O modelo linear não foi testado ali.`,
        ],
        resposta: `Interpolação: <b>V = (3,66 ± 0,03) V</b>, confiável. Extrapolação: (20,1 ± 0,3) V é só estatisticamente correta <b>se</b> a lei continuar linear, o que não foi verificado.`,
      },
    ],
    erros: [
      { errado: `“R² = 0,998, então a relação é linear.”`, certo: `Olhe o gráfico de resíduos: se eles formam uma curva sistemática, o modelo linear está errado, mesmo com R² alto.`, porque: `R² mede quanto da variação a reta captura, não se sobra padrão. Anscombe mostrou conjuntos com o mesmo R² e formas completamente diferentes.` },
      { errado: `Relatar a inclinação como 9,790321 m/s² copiado da planilha, sem incerteza.`, certo: `Relatar (9,79 ± 0,11) m/s²: incerteza com 1 ou 2 algarismos e o valor arredondado na mesma casa decimal.`, porque: `Sem incerteza, o número não pode ser comparado com nada; os algarismos extras são ruído.` },
      { errado: `Forçar a reta a passar pela origem “porque a teoria diz que b = 0”.`, certo: `Ajuste com b livre e verifique se b é compatível com zero. Só fixe b = 0 com justificativa forte.`, porque: `Um intercepto não nulo pode revelar um erro sistemático (zero do instrumento, tempo de reação). Forçá-lo a zero esconde o problema e distorce a inclinação.` },
      { errado: `Linearizar com log₁₀ e depois usar A = e<sup>b</sup>.`, certo: `Se usou log₁₀, então A = 10<sup>b</sup>; se usou ln, A = e<sup>b</sup>. A inclinação de uma lei de potência é a mesma nas duas bases.`, porque: `Para a exponencial, a inclinação também muda: com log₁₀, ela vale k/ln 10 = k/2,303.` },
      { errado: `Usar a reta para prever bem fora da faixa medida como se fosse tão confiável quanto dentro.`, certo: `Interpole com confiança; extrapole só com uma razão física para crer que a lei continua valendo, e com a incerteza que cresce com |x₀ − x̄|.` },
    ],
    aplicacoes: [
      `<b>Química analítica</b>: a curva de calibração de um espectrofotômetro (absorbância × concentração, lei de Beer-Lambert) é um ajuste linear; a concentração de uma amostra desconhecida sai por interpolação.`,
      `<b>Engenharia de materiais</b>: o módulo de Young é a inclinação do trecho linear da curva tensão × deformação num ensaio de tração.`,
      `<b>Medicina nuclear</b>: a meia-vida efetiva de um radiofármaco no corpo sai do ajuste de ln(atividade) × tempo.`,
      `<b>Biologia</b>: leis de escala alométrica (metabolismo ∝ massa<sup>3/4</sup>) foram descobertas com ajustes log-log.`,
      `<b>Economia e ciências sociais</b>: regressão linear é a ferramenta básica para estimar relações entre variáveis, com as mesmas armadilhas de correlação e extrapolação.`,
    ],
    teste: [
      { p: `O que o método dos mínimos quadrados minimiza?`, op: [`A soma dos resíduos.`, `A soma dos quadrados das distâncias verticais entre os pontos e a reta.`, `A maior distância entre um ponto e a reta.`, `A soma das distâncias perpendiculares à reta.`], certa: 1, explica: `A soma simples dos resíduos é sempre zero para a reta ajustada (positivos e negativos se cancelam), então não serve. Minimiza-se Σrᵢ², com rᵢ medido na vertical, porque supõe-se que só y tem incerteza.` },
      { p: `Um ajuste deu R² = 0,995, mas os resíduos são positivos nas pontas e negativos no meio. O que concluir?`, op: [`O ajuste é excelente; R² perto de 1 garante o modelo.`, `Há um ponto discrepante que deve ser removido.`, `Faltam medidas; com mais pontos o padrão some.`, `A relação provavelmente é curva; a reta não é o modelo adequado.`], certa: 3, explica: `Resíduos com padrão sistemático (aqui, um “sorriso”) indicam curvatura. R² alto apenas diz que a reta acompanha a tendência geral.` },
      { p: `Para medir melhor a inclinação de uma reta com o mesmo número de pontos, o mais eficaz é…`, op: [`espalhar os valores de x por uma faixa maior.`, `concentrar todos os pontos perto da média de x.`, `forçar a reta a passar pela origem.`, `usar mais casas decimais na planilha.`], certa: 0, explica: `σ_a = s/√S_xx e S_xx = Σ(xᵢ − x̄)² cresce quando os x estão espalhados. Com x concentrados, pequenos ruídos em y giram muito a reta.` },
      { p: `Você suspeita que y = A·x<sup>p</sup>. Que gráfico vira reta e o que dá a inclinação?`, op: [`ln y contra x; inclinação = p.`, `y contra ln x; inclinação = A.`, `ln y contra ln x; inclinação = p.`, `y contra x²; inclinação = p.`], certa: 2, explica: `ln y = p·ln x + ln A: no gráfico log-log a inclinação é o expoente p e o intercepto é ln A.` },
      { p: `Num ajuste ponderado, obteve-se χ²<sub>red</sub> = 0,08. A interpretação mais provável é:`, op: [`O ajuste é perfeito e as incertezas estão corretas.`, `As incertezas atribuídas aos pontos foram superestimadas.`, `O modelo linear está errado.`, `Há poucos pontos para calcular χ².`], certa: 1, explica: `Se os resíduos são bem menores que as barras de erro, as barras estão grandes demais. Modelo errado ou incertezas subestimadas dariam χ²_red bem maior que 1.` },
      { p: `Por que dividimos SQR por n − 2 (e não por n) para obter s?`, op: [`Porque os dois pontos extremos são descartados.`, `Por convenção, sem razão matemática.`, `Para deixar a incerteza menor.`, `Porque a e b foram estimados dos próprios dados, consumindo dois graus de liberdade.`], certa: 3, explica: `Com n = 2 a reta passa exatamente pelos pontos e SQR = 0, sem informação sobre o ruído. Cada parâmetro ajustado “gasta” um grau de liberdade; dividir por n − 2 torna s² um estimador sem viés.` },
    ],
    resumo: [
      `Mínimos quadrados: a reta que minimiza Σ(yᵢ − a·xᵢ − b)²; a = S_xy/S_xx, b = ȳ − a·x̄.`,
      `Incertezas: s = √(SQR/(n − 2)), σ_a = s/√S_xx, σ_b = s·√(1/n + x̄²/S_xx).`,
      `Olhe sempre o gráfico e os resíduos: R² alto não prova linearidade (quarteto de Anscombe).`,
      `Exponencial: ln y × x (inclinação k). Potência: ln y × ln x (inclinação p). A = e^b.`,
      `Pontos com incertezas diferentes: ajuste ponderado (w = 1/σ²) e confira χ²_red ≈ 1.`,
      `Interpolar é seguro; extrapolar exige justificar que a lei continua válida.`,
    ],
    alem: {
      t: "Para ir além: de onde vem a fórmula, e quando ela não basta",
      h: `<p>Se os erros em y são independentes, normais e de mesma variância σ², a probabilidade de observar os dados é proporcional a exp(−Σrᵢ²/2σ²). Maximizar essa verossimilhança é exatamente minimizar Σrᵢ²: mínimos quadrados é o estimador de <b>máxima verossimilhança</b> nesse caso, e o teorema de Gauss-Markov garante que, mesmo sem normalidade, ele é o estimador linear sem viés de menor variância.</p>
        <p>Em forma matricial, com a matriz de projeto X (uma coluna de x e uma de 1), os parâmetros são β = (XᵀWX)⁻¹XᵀWy e a <b>matriz de covariância</b> é (XᵀWX)⁻¹. O termo fora da diagonal, cov(a, b) = −x̄·s²/S<sub>xx</sub>, é o que torna a incerteza de uma previsão menor que a soma ingênua. Essa mesma estrutura generaliza para polinômios e qualquer modelo linear nos parâmetros.</p>
        <p>Quando x também tem incerteza relevante, o método usual subestima a inclinação (“diluição da regressão”). Saídas: o método da variância efetiva (σ<sub>ef</sub>² = σ<sub>y</sub>² + a²σ<sub>x</sub>², iterando), a regressão de Deming ou a regressão de distância ortogonal. Para modelos não lineares de verdade (como y = A·sen(ωt + φ)), usa-se o algoritmo de Levenberg-Marquardt, que exige um bom chute inicial.</p>`,
    },
  };

  // =====================================================================
  // Incertezas e propagação
  // =====================================================================
  A.incerteza = {
    tempo: 18, nivel: "Ensino médio (laboratório) → faculdade",
    objetivos: [
      "distinguir erro de incerteza e avaliar incertezas do tipo A e do tipo B;",
      "estimar a incerteza de um instrumento a partir da sua resolução ou especificação;",
      "propagar incertezas em somas, produtos e potências e pela fórmula geral com derivadas parciais;",
      "identificar qual medida domina a incerteza do resultado e escrever o resultado final corretamente.",
    ],
    requisitos: [{ id: "sig", nome: "Algarismos significativos" }, { id: "estat", nome: "Estatística de medidas repetidas" }],
    secoes: [
      {
        t: "A ideia em uma frase",
        h: `<p>Nenhuma medida é perfeita. A <b>incerteza</b> é um número que diz <b>quão longe do valor medido o valor verdadeiro pode razoavelmente estar</b>. Um resultado sem incerteza não pode ser comparado com nada: “g = 9,6 m/s²” discorda do valor de referência 9,78 m/s²? Depende: se a incerteza é 0,3 m/s², concorda; se é 0,02 m/s², há algo errado no experimento.</p>
          <div class="analogia"><b>Analogia:</b> a incerteza é como a margem de erro de uma pesquisa eleitoral. “42% ± 2%” diz que o candidato pode ter de 40% a 44%. Sem a margem, você não sabe se dois candidatos com 42% e 45% estão empatados ou não.</div>
          <p>É importante separar duas palavras que o dia a dia mistura. <b>Erro</b> é a diferença entre o valor medido e o valor verdadeiro; como o verdadeiro é desconhecido, o erro também é. <b>Incerteza</b> é a nossa estimativa do tamanho típico desse erro, e essa sim podemos calcular. Além disso, existem erros <b>aleatórios</b> (flutuam de uma medida para outra e diminuem com a média) e <b>sistemáticos</b> (deslocam todas as medidas para o mesmo lado, como uma balança mal zerada, e não diminuem repetindo).</p>`,
      },
      {
        t: "Tipo A, tipo B e a incerteza do instrumento",
        h: `<p>O GUM (Guia para a Expressão da Incerteza de Medição, adotado pelo Inmetro) classifica as incertezas pela <b>forma como são avaliadas</b>:</p>
          <ul><li><b>Tipo A</b>: por estatística de medidas repetidas. Com n medidas e desvio-padrão s, a incerteza da média é s/√n.</li>
          <li><b>Tipo B</b>: por qualquer outro meio: resolução do instrumento, certificado de calibração, especificação do fabricante, valor de tabela.</li></ul>
          <p>Para a resolução de um instrumento <b>digital</b>, o valor verdadeiro pode estar em qualquer lugar dentro de ± meia unidade do último dígito, com igual chance (distribuição retangular). A incerteza-padrão é a meia-largura dividida por √3: um cronômetro que mostra 0,01 s tem u = 0,005/√3 ≈ 0,003 s. Em instrumentos <b>analógicos</b> (régua, proveta), muitos professores usam a convenção prática de <b>metade da menor divisão</b> (régua milimetrada: ± 0,5 mm); o importante é declarar qual critério você usou.</p>
          <p>Fontes independentes se combinam em quadratura: u = √(u<sub>A</sub>² + u<sub>B</sub>²). Exemplo: dez medidas do período de um pêndulo com cronômetro manual dão s = 0,05 s; u<sub>A</sub> = 0,05/√10 = 0,016 s, muito maior que a resolução do cronômetro (0,003 s). Aqui quem manda é o tempo de reação humano, não o aparelho.</p>
          <div class="nota">Incerteza <b>relativa</b> = u/|x|. Ela permite comparar medidas de naturezas diferentes: 1 mm em 1 m (0,1%) é muito mais preciso que 1 mm em 2 cm (5%).</div>`,
      },
      {
        t: "Regras de propagação: soma, produto e potência",
        h: `<p>Quase nunca o resultado é medido diretamente: calcula-se uma grandeza a partir de outras. Se as medidas são <b>independentes</b>, as incertezas se somam <b>em quadratura</b> (como catetos de um triângulo), porque é improvável que todos os erros estejam no mesmo sentido ao mesmo tempo.</p>
          <ul><li><b>Soma e subtração</b> (q = x + y ou x − y): somam-se as incertezas <b>absolutas</b> em quadratura: u<sub>q</sub> = √(u<sub>x</sub>² + u<sub>y</sub>²). Atenção: mesmo na subtração os quadrados se somam.</li>
          <li><b>Produto e divisão</b> (q = x·y ou x/y): somam-se as incertezas <b>relativas</b> em quadratura: u<sub>q</sub>/|q| = √((u<sub>x</sub>/x)² + (u<sub>y</sub>/y)²).</li>
          <li><b>Potência</b> (q = xⁿ): a incerteza relativa é multiplicada por |n|: u<sub>q</sub>/|q| = |n|·u<sub>x</sub>/|x|. Uma raiz quadrada (n = 1/2) <b>reduz</b> pela metade; um quadrado dobra.</li>
          <li><b>Constante exata</b> (q = c·x): u<sub>q</sub> = |c|·u<sub>x</sub>. Números como 2, π e 4π² não acrescentam incerteza.</li></ul>
          <p>Uma consequência importante da quadratura: a maior contribuição domina. Se uma incerteza relativa é 4% e a outra 0,8%, o total é √(16 + 0,64) ≈ 4,1%. Melhorar a medida de 0,8% para 0,1% quase não muda nada; é a de 4% que precisa melhorar. Por isso a ferramenta mostra <b>qual medida mais pesa</b>.</p>`,
      },
      {
        t: "A fórmula geral (GUM) com derivadas parciais",
        h: `<p>Todas as regras acima são casos particulares de uma única fórmula. Se q = f(x₁, x₂, …, xₙ) com xᵢ independentes, aproxima-se f por uma reta perto dos valores medidos (expansão de Taylor de 1ª ordem) e obtém-se:</p>
          <div class="eq">u<sub>q</sub>² = Σ (∂f/∂xᵢ)² · u<sub>xᵢ</sub>²</div>
          <p>A derivada parcial ∂f/∂xᵢ, chamada <b>coeficiente de sensibilidade</b>, diz quanto q muda quando só xᵢ muda um pouco. Cada termo (∂f/∂xᵢ · u<sub>xᵢ</sub>) é a contribuição de xᵢ, na unidade de q. Verifique: para q = x·y, ∂q/∂x = y e ∂q/∂y = x, e u<sub>q</sub>² = y²u<sub>x</sub>² + x²u<sub>y</sub>²; dividindo por q² = x²y², recupera-se a regra do produto.</p>
          <p>A fórmula geral resolve casos que as regras simples não resolvem, como q = x/(x + y), em que x aparece duas vezes. Aplicar as regras parte por parte, tratando o x do numerador e o do denominador como independentes, dá uma incerteza errada (em geral maior). Ela também mostra o limite do método: se f é muito curva na escala da incerteza (por exemplo, sen θ perto de 90°, onde a derivada se anula), a aproximação linear falha, e é preciso ir à segunda ordem ou usar simulação de Monte Carlo.</p>`,
      },
      {
        t: "Como escrever o resultado",
        h: `<p>O formato padrão é <b>valor ± incerteza, unidade</b>, com regras de arredondamento coerentes:</p>
          <ol><li>Arredonde a <b>incerteza</b> para <b>1 algarismo significativo</b>, ou 2 se o primeiro for 1 (0,0349 → 0,03; 0,105 → 0,11). Com 1 só, “0,1” poderia ser qualquer coisa de 0,05 a 0,15, uma variação de 3 vezes.</li>
          <li>Arredonde o <b>valor</b> na <b>mesma casa decimal</b> da incerteza: 9,8107 ± 0,0998 → 9,81 ± 0,10.</li>
          <li>Use parênteses com potência de dez ou unidade: (9,81 ± 0,10) m/s²; (2,72 ± 0,12) × 10³ kg/m³. Também se usa a forma concisa 9,81(10) m/s².</li>
          <li>Faça todas as contas com todos os algarismos e só arredonde no fim.</li></ol>
          <p>Diga também <b>o que</b> a incerteza representa: incerteza-padrão (cerca de 68% de confiança, se a distribuição for normal) ou <b>expandida</b> U = k·u, com fator de abrangência k = 2 (cerca de 95%). Para comparar com um valor de referência, calcule a discrepância em unidades de incerteza: |x − x<sub>ref</sub>|/u. Abaixo de 2, há concordância; acima de 3, há um problema real a investigar.</p>`,
      },
    ],
    formulas: [
      { nome: "Soma ou subtração", eq: `q = x ± y &nbsp;→&nbsp; u<sub>q</sub> = √(u<sub>x</sub>² + u<sub>y</sub>²)`, simbolos: [["u<sub>x</sub>, u<sub>y</sub>", "incertezas-padrão absolutas", "unid. de q"]], obs: "Vale também para a diferença: as incertezas nunca se subtraem." },
      { nome: "Produto ou divisão", eq: `${fr("u<sub>q</sub>", "|q|")} = √((${fr("u<sub>x</sub>", "x")})² + (${fr("u<sub>y</sub>", "y")})²)`, simbolos: [["u<sub>q</sub>/|q|", "incerteza relativa do resultado", "— (ou %)"]], obs: "Para q = xⁿ, a relativa fica |n|·u_x/|x|." },
      { nome: "Fórmula geral (GUM)", eq: `u<sub>q</sub> = √(Σ (${fr("∂f", "∂xᵢ")})² u<sub>xᵢ</sub>²)`, simbolos: [["∂f/∂xᵢ", "coeficiente de sensibilidade de q a xᵢ", "unid. de q / unid. de xᵢ"], ["u<sub>xᵢ</sub>", "incerteza-padrão de xᵢ", "unid. de xᵢ"]], obs: "Supõe variáveis independentes e f aproximadamente linear na escala das incertezas." },
      { nome: "Incerteza de resolução (digital)", eq: `u = ${fr("Δ", "2√3")}`, simbolos: [["Δ", "resolução (menor incremento do mostrador)", "unid. da medida"]], obs: "Distribuição retangular de largura Δ. Combine com o tipo A em quadratura." },
    ],
    exemplos: [
      {
        t: "produto e divisão: densidade",
        enunciado: `Um sólido tem m = (12,5 ± 0,1) g e V = (4,6 ± 0,2) cm³. Calcule a densidade com incerteza.`,
        passos: [
          `ρ = m/V = 12,5 g / 4,6 cm³ = 2,7174 g/cm³.`,
          `Relativas: u<sub>m</sub>/m = 0,1/12,5 = 0,008 (0,8%); u<sub>V</sub>/V = 0,2/4,6 = 0,0435 (4,3%).`,
          `Combinação: √(0,008² + 0,0435²) = √(0,000064 + 0,00189) = 0,0442 (4,4%).`,
          `u<sub>ρ</sub> = 0,0442 × 2,7174 = 0,120 g/cm³ → começa com 1: dois algarismos, 0,12.`,
        ],
        resposta: `<b>ρ = (2,72 ± 0,12) g/cm³</b>. Quase toda a incerteza vem do volume: melhorar a balança não adiantaria.`,
      },
      {
        t: "potência: g com pêndulo",
        enunciado: `Com um pêndulo simples, L = (1,000 ± 0,002) m e T = (2,006 ± 0,010) s. Calcule g = 4π²L/T² com incerteza.`,
        passos: [
          `g = 4π² × 1,000 m / (2,006 s)² = 39,478 / 4,0240 = 9,8107 m/s².`,
          `Relativa de L: 0,002/1,000 = 0,0020. Relativa de T: 0,010/2,006 = 0,00499, multiplicada por 2 (expoente): 0,00997.`,
          `4π² é exato. Total: √(0,0020² + 0,00997²) = √(0,0000040 + 0,0000994) = 0,0102.`,
          `u<sub>g</sub> = 0,0102 × 9,8107 = 0,0998 m/s² → 0,10 m/s².`,
        ],
        resposta: `<b>g = (9,81 ± 0,10) m/s²</b>. O período responde por 96% da variância (0,0000994 de 0,0001034): para melhorar, cronometre mais oscilações.`,
      },
      {
        t: "fórmula geral: energia potencial",
        enunciado: `E = m·g·h com m = (2,00 ± 0,01) kg, g = (9,81 ± 0,02) m/s² e h = (3,00 ± 0,05) m. Use as derivadas parciais.`,
        passos: [
          `E = 2,00 × 9,81 × 3,00 = 58,86 J.`,
          `Sensibilidades: ∂E/∂m = g·h = 29,43 J/kg; ∂E/∂g = m·h = 6,00 kg·m; ∂E/∂h = m·g = 19,62 N.`,
          `Contribuições: 29,43 × 0,01 = 0,294 J; 6,00 × 0,02 = 0,120 J; 19,62 × 0,05 = 0,981 J.`,
          `u<sub>E</sub> = √(0,294² + 0,120² + 0,981²) = √(0,0865 + 0,0144 + 0,962) = √1,063 = 1,03 J → 1,0 J.`,
        ],
        resposta: `<b>E = (58,9 ± 1,0) J</b>, dominada pela medida da altura.`,
      },
    ],
    erros: [
      { errado: `Na subtração, subtrair as incertezas: (10,0 ± 0,3) − (4,0 ± 0,2) = 6,0 ± 0,1.`, certo: `u = √(0,3² + 0,2²) = 0,36 → 6,0 ± 0,4.`, porque: `Cada medida pode errar para qualquer lado; a incerteza de uma diferença nunca é menor que a maior das parcelas.` },
      { errado: `Somar incertezas absolutas num produto: u(x·y) = u<sub>x</sub> + u<sub>y</sub>.`, certo: `Em produtos e divisões combine as incertezas <b>relativas</b>, em quadratura.`, porque: `As unidades nem batem: u_x em gramas mais u_y em cm³ não pode ser incerteza de g/cm³.` },
      { errado: `Escrever g = 9,8107 ± 0,0998 m/s² ou g = 9,8 ± 0,0998 m/s².`, certo: `g = (9,81 ± 0,10) m/s²: incerteza com 1 ou 2 algarismos e valor na mesma casa decimal.`, porque: `Os últimos algarismos de 9,8107 já estão dentro da incerteza: não carregam informação.` },
      { errado: `Esquecer o expoente: tratar T² como se tivesse a mesma incerteza relativa de T.`, certo: `Para T², a incerteza relativa dobra; para √L, cai pela metade.`, porque: `Um erro de 1% em T vira cerca de 2% em T², pois (1,01)² ≈ 1,02.` },
      { errado: `Acreditar que repetir a medida 100 vezes elimina um erro sistemático.`, certo: `A média reduz só a parte aleatória (s/√n). Erros sistemáticos se combatem com calibração, mudança de método e comparação com padrões.` },
    ],
    aplicacoes: [
      `<b>Metrologia legal</b>: balanças de supermercado e bombas de combustível são fiscalizadas pelo Inmetro com tolerâncias definidas a partir de incertezas.`,
      `<b>Saúde</b>: um exame de glicemia tem incerteza de alguns por cento; resultados perto do limite de diagnóstico (126 mg/dL em jejum) costumam ser repetidos por isso.`,
      `<b>Engenharia</b>: no projeto de uma peça, a tolerância final depende de como as incertezas das cotas se propagam (empilhamento de tolerâncias).`,
      `<b>Física de partículas</b>: a descoberta do bóson de Higgs (2012) exigiu um sinal 5 desvios-padrão acima do esperado; sem incerteza bem estimada, não haveria descoberta.`,
      `<b>Química</b>: na titulação, a incerteza da concentração vem da bureta, da pipeta, da massa do padrão e da leitura do ponto de viragem; o orçamento de incertezas mostra qual delas melhorar.`,
    ],
    teste: [
      { p: `Qual a diferença entre erro e incerteza?`, op: [`São sinônimos.`, `Erro é a diferença (desconhecida) até o valor verdadeiro; incerteza é a estimativa do tamanho típico desse erro.`, `Incerteza é o erro do aluno; erro é o do instrumento.`, `Erro é sempre aleatório e incerteza é sempre sistemática.`], certa: 1, explica: `Não conhecemos o valor verdadeiro, logo não conhecemos o erro de uma medida. A incerteza quantifica a dúvida e é calculável.` },
      { p: `A largura de uma mesa é medida 8 vezes e o desvio-padrão é usado para estimar a incerteza. Essa avaliação é do tipo…`, op: [`B, porque usa uma régua.`, `B, porque é uma medida de comprimento.`, `A, porque é estatística sobre medidas repetidas.`, `nenhum dos dois; é um erro sistemático.`], certa: 2, explica: `Tipo A e tipo B se referem ao método de avaliação. Estatística sobre repetições é tipo A; resolução, certificados e tabelas são tipo B.` },
      { p: `q = x/y, com u<sub>x</sub>/x = 3% e u<sub>y</sub>/y = 4%. A incerteza relativa de q é:`, op: [`1%`, `7%`, `12%`, `5%`], certa: 3, explica: `Na divisão combinam-se as relativas em quadratura: √(3² + 4²) = 5%. Somar (7%) superestima; subtrair (1%) não faz sentido.` },
      { p: `A incerteza relativa do raio de uma esfera é 2%. A do volume (V = 4πr³/3) é aproximadamente:`, op: [`6%`, `2%`, `8%`, `0,7%`], certa: 0, explica: `Potência 3 multiplica a relativa por 3: 6%. As constantes 4π/3 são exatas e não contribuem.` },
      { p: `Duas fontes contribuem para a incerteza de um resultado: 5% e 1%. Vale a pena investir para reduzir a de 1% a zero?`, op: [`Sim, o total cairia de 6% para 5%.`, `Sim, o total cairia pela metade.`, `Não: o total passaria de 5,1% para 5,0%, quase nada.`, `Não, porque incertezas pequenas não se propagam.`], certa: 2, explica: `√(25 + 1) = 5,10%. Zerando a menor, fica 5,00%. Em quadratura a maior domina; é nela que se deve investir.` },
      { p: `Por que as incertezas independentes se somam em quadratura, e não diretamente?`, op: [`Porque é mais fácil de calcular.`, `Porque erros independentes raramente estão todos no mesmo sentido; parte deles se compensa.`, `Porque assim o resultado fica sempre menor que cada parcela.`, `Porque o GUM proíbe somar incertezas.`], certa: 1, explica: `As variâncias de variáveis independentes se somam. A soma direta corresponde ao pior caso, todos os erros alinhados, que é improvável.` },
    ],
    resumo: [
      `Incerteza = estimativa de quão longe o valor verdadeiro pode estar; sem ela, o resultado não se compara a nada.`,
      `Tipo A: estatística de repetições (s/√n). Tipo B: resolução, certificados, tabelas. Combine em quadratura.`,
      `Soma/diferença: absolutas em quadratura. Produto/divisão: relativas em quadratura. Potência n: relativa × |n|.`,
      `Fórmula geral: u_q² = Σ(∂f/∂xᵢ)²·u_xᵢ², para variáveis independentes.`,
      `A maior contribuição domina: melhore a medida que mais pesa.`,
      `Escreva (valor ± incerteza) unidade, incerteza com 1 ou 2 algarismos e valor na mesma casa.`,
    ],
    alem: {
      t: "Para ir além: correlação, Monte Carlo e o orçamento de incertezas",
      h: `<p>Se duas variáveis estão <b>correlacionadas</b>, a fórmula ganha termos cruzados: u<sub>q</sub>² = Σ(∂f/∂xᵢ)²uᵢ² + 2ΣΣ(∂f/∂xᵢ)(∂f/∂xⱼ)·cov(xᵢ, xⱼ). Isso acontece quando duas grandezas foram medidas com o mesmo instrumento mal calibrado, ou quando ambas vêm do mesmo ajuste (como a e b de uma reta). Ignorar a correlação pode tanto inflar quanto esconder incerteza.</p>
        <p>Quando o modelo é muito não linear ou as incertezas são grandes, o Suplemento 1 do GUM recomenda o <b>método de Monte Carlo</b>: sorteiam-se milhares de valores para cada entrada conforme sua distribuição, calcula-se q para cada sorteio e lê-se a incerteza diretamente da distribuição resultante, sem derivadas. É fácil de fazer numa planilha ou em Python e serve para conferir a propagação linear.</p>
        <p>Em laboratórios acreditados, a incerteza é apresentada num <b>orçamento de incertezas</b>: uma tabela com cada fonte, seu tipo (A ou B), distribuição, coeficiente de sensibilidade, contribuição e graus de liberdade. Os graus de liberdade efetivos (fórmula de Welch-Satterthwaite) determinam o fator k para 95% quando alguma componente do tipo A vem de poucas medidas.</p>`,
    },
  };

  // =====================================================================
  // Algarismos significativos
  // =====================================================================
  A.sig = {
    tempo: 14, nivel: "Ensino médio → faculdade",
    objetivos: [
      "contar algarismos significativos, incluindo os casos com zeros;",
      "usar notação científica para deixar a precisão inequívoca;",
      "aplicar as regras de soma/subtração e de multiplicação/divisão;",
      "arredondar corretamente e manter coerência entre valor e incerteza.",
    ],
    secoes: [
      {
        t: "A ideia em uma frase",
        h: `<p>Os <b>algarismos significativos</b> de uma medida são os que realmente foram medidos: todos os algarismos certos mais o primeiro duvidoso. Eles são uma forma compacta de comunicar a precisão de um número. Escrever 2,50 m é diferente de escrever 2,5 m: o primeiro diz que você mediu até o centímetro; o segundo, só até o decímetro.</p>
          <div class="analogia"><b>Analogia:</b> se alguém diz que a viagem levou “umas 3 horas”, ninguém responde “então foram 10 800,000 segundos”. Os zeros e casas decimais extras inventam uma precisão que não existe. Algarismos significativos são a etiqueta de honestidade de um número.</div>
          <p>Numa régua milimetrada, ao medir um lápis cuja ponta fica entre 14,3 cm e 14,4 cm, você lê 14,3 com certeza e estima o próximo algarismo, por exemplo 14,36 cm. Os quatro algarismos são significativos; o 6 é o duvidoso. Escrever 14,362 cm seria inventar, e escrever 14 cm seria jogar informação fora.</p>`,
      },
      {
        t: "O que conta e o que não conta: os zeros",
        h: `<p>Algarismos de 1 a 9 sempre contam. O problema está nos zeros:</p>
          <ul><li><b>Zeros à esquerda</b> não contam: só posicionam a vírgula. 0,00340 tem 3 significativos (3, 4 e o 0 final). Em notação científica fica 3,40 × 10⁻³, e os zeros iniciais somem.</li>
          <li><b>Zeros entre algarismos</b> contam: 1005 tem 4; 2,07 tem 3.</li>
          <li><b>Zeros à direita depois da vírgula</b> contam: 2,500 tem 4. Foram medidos; se não fossem, não deveriam estar escritos.</li>
          <li><b>Zeros à direita sem vírgula</b> são ambíguos: 1500 pode ter 2, 3 ou 4 significativos. A convenção mais comum conta só até o último algarismo não nulo (2), mas o certo é eliminar a dúvida com notação científica: 1,5 × 10³ (2), 1,50 × 10³ (3) ou 1,500 × 10³ (4).</li></ul>
          <p>Números <b>exatos</b>, que vêm de contagem ou de definição, têm infinitos significativos e nunca limitam o resultado: 12 ovos, o 2 em “raio = diâmetro/2”, 1 pol = 2,54 cm (exato por definição), ou a velocidade da luz, 299 792 458 m/s (exata no SI desde 1983).</p>
          <div class="nota">Trocar de unidade não muda a quantidade de significativos: 0,0250 kg = 25,0 g = 2,50 × 10⁴ mg. Sempre 3.</div>`,
      },
      {
        t: "Regras para contas",
        h: `<p>O resultado de uma conta não pode ser mais preciso que os dados. As duas regras práticas:</p>
          <ul><li><b>Soma e subtração</b>: o resultado fica com o mesmo número de <b>casas decimais</b> da parcela que tem menos casas. 12,52 m + 3,1 m = 15,62 → <b>15,6 m</b>, porque 3,1 não informa nada sobre a segunda casa decimal.</li>
          <li><b>Multiplicação e divisão</b>: o resultado fica com o mesmo número de <b>algarismos significativos</b> do fator que tem menos. 3,14 × 2,1 = 6,594 → <b>6,6</b> (2 significativos, por causa do 2,1).</li></ul>
          <p>Note a diferença: na soma importa a <b>posição</b> (casas decimais); no produto importa a <b>quantidade</b> de algarismos. Isso espelha as regras de incerteza: na soma combinam-se incertezas absolutas; no produto, relativas.</p>
          <p>Uma armadilha da subtração: 25,37 − 25,12 = 0,25. Cada dado tem 4 significativos, mas o resultado tem só 2. Subtrair números próximos “come” algarismos (cancelamento catastrófico), e por isso medidas que dependem de diferenças pequenas são difíceis.</p>
          <p>Em contas com várias etapas, <b>não arredonde no meio</b>: carregue todos os algarismos (ou pelo menos 2 a mais) e arredonde só o resultado final. Arredondar a cada passo acumula erro.</p>`,
      },
      {
        t: "Arredondamento",
        h: `<p>Para arredondar para n algarismos, olhe o <b>primeiro algarismo descartado</b>:</p>
          <ul><li>menor que 5: os mantidos ficam iguais (2,7432 → 2,74 com 3 a.s.);</li>
          <li>5 ou mais: o último mantido sobe uma unidade (2,7462 → 2,75; 0,09961 → 0,0996; 9,96 → 10,0 com 3 a.s.).</li></ul>
          <p>Essa é a regra escolar, usada pela ferramenta. Em normas técnicas (ABNT NBR 5891) e em estatística usa-se às vezes uma variante quando o descartado é <b>exatamente 5</b> seguido só de zeros: arredonda-se para o algarismo <b>par</b> (2,45 → 2,4; 2,35 → 2,4). Assim, em muitas operações, os arredondamentos para cima e para baixo se equilibram. Escolha uma regra e use-a consistentemente.</p>
          <p>Cuidado com o “vai um”: 9,96 arredondado para 2 a.s. vira 10, e para manter 2 significativos visíveis escreve-se 1,0 × 10¹.</p>`,
      },
      {
        t: "Coerência entre valor e incerteza",
        h: `<p>Quando se conhece a incerteza, ela é que manda nos algarismos, não as regras práticas. A incerteza tem 1 algarismo significativo (2 se começar por 1), e o valor é arredondado <b>na mesma casa decimal</b> da incerteza:</p>
          <div class="eq">9,8107 ± 0,0998 m/s² → (9,81 ± 0,10) m/s²</div>
          <div class="eq">1234,56 ± 23,4 Ω → (1,23 ± 0,02) × 10³ Ω</div>
          <p>São erros de coerência: 9,8107 ± 0,1 (valor com casas além da incerteza) e 9,8 ± 0,0998 (incerteza mais “precisa” que o valor). Em ambos, quem lê não sabe em qual número confiar.</p>
          <p>As regras de soma e de produto são uma <b>aproximação</b> da propagação de incertezas: funcionam bem quando você não tem as incertezas, mas podem errar por um algarismo. Por exemplo, 9,8 × 1,02 = 9,996: pela regra, 2 significativos, “10”; mas a incerteza relativa de 9,8 é de cerca de 1% (0,1/9,8), e o resultado com 3 significativos, 10,0, reflete melhor essa precisão. Por isso, em relatórios sérios, calcule a incerteza e arredonde a partir dela.</p>`,
      },
    ],
    formulas: [
      { nome: "Notação científica", eq: `x = m × 10ᵉ, &nbsp;com 1 ≤ |m| &lt; 10`, simbolos: [["m", "mantissa: todos os seus algarismos são significativos", "—"], ["e", "expoente inteiro", "—"]], obs: "A forma mais clara de mostrar quantos algarismos são significativos." },
      { nome: "Soma e subtração", eq: `casas(resultado) = min(casas das parcelas)`, simbolos: [["casas", "número de casas decimais (com a mesma unidade)", "—"]], obs: "Converta todas as parcelas para a mesma unidade antes de comparar." },
      { nome: "Multiplicação e divisão", eq: `a.s.(resultado) = min(a.s. dos fatores)`, simbolos: [["a.s.", "quantidade de algarismos significativos", "—"]], obs: "Números exatos (contagens, definições) não limitam o resultado." },
    ],
    exemplos: [
      {
        t: "contar",
        enunciado: `Quantos algarismos significativos há em 0,004050 g, em 30,0 mL e em 1,200 × 10⁵ Pa?`,
        passos: [
          `0,004050: os três zeros iniciais só posicionam a vírgula; contam 4, 0, 5 e o 0 final → 4 a.s. (4,050 × 10⁻³).`,
          `30,0: zero entre algarismos e zero após a vírgula contam → 3 a.s.`,
          `1,200 × 10⁵: tudo na mantissa conta → 4 a.s.`,
        ],
        resposta: `<b>4, 3 e 4</b> algarismos significativos`,
      },
      {
        t: "conta mista",
        enunciado: `Um bloco tem massa 25,4 g e foi medido com régua: 2,50 cm × 1,2 cm × 3,05 cm. Calcule a densidade.`,
        passos: [
          `Volume: 2,50 × 1,2 × 3,05 = 9,15 cm³ (guardar sem arredondar).`,
          `Densidade: 25,4 g / 9,15 cm³ = 2,7760 g/cm³.`,
          `O fator com menos a.s. é 1,2 cm (2 a.s.), e ele limita todo o produto e a divisão.`,
          `Arredondar a 2 a.s.: 2,7760 → 2,8.`,
        ],
        resposta: `<b>ρ ≈ 2,8 g/cm³</b>. Medir a largura de 1,2 cm com uma casa a mais (1,20 cm) daria um resultado com 3 algarismos.`,
      },
      {
        t: "soma com unidades diferentes",
        enunciado: `Some 1,25 m + 37 cm + 4,6 mm.`,
        passos: [
          `Converter tudo para metros: 1,25 m; 0,37 m; 0,0046 m.`,
          `Somar com todos os algarismos: 1,25 + 0,37 + 0,0046 = 1,6246 m.`,
          `Menor número de casas decimais (em m): 2 casas (1,25 e 0,37).`,
          `Arredondar a 2 casas: 1,6246 → 1,62 m.`,
        ],
        resposta: `<b>1,62 m</b>`,
      },
    ],
    erros: [
      { errado: `Dizer que 0,0052 tem 5 algarismos significativos.`, certo: `Tem 2 (5,2 × 10⁻³). Zeros à esquerda só posicionam a vírgula.` },
      { errado: `Copiar o resultado da calculadora: 25,4/9,15 = 2,775956284 g/cm³.`, certo: `Arredondar conforme os dados (2,8 g/cm³) ou conforme a incerteza calculada.`, porque: `A calculadora não sabe a precisão dos dados; os algarismos extras são invenção.` },
      { errado: `Na soma, usar a regra dos a.s.: 102,5 + 0,13 = 1,0 × 10² “porque 0,13 tem 2 a.s.”.`, certo: `Na soma valem as casas decimais: 102,63 → 102,6.`, porque: `Somar 0,13 não destrói a precisão de 102,5; o que limita é a casa do décimo.` },
      { errado: `Arredondar a cada passo de uma conta longa.`, certo: `Carregar todos os algarismos e arredondar só no fim.`, porque: `Erros de arredondamento acumulados podem mudar o último algarismo do resultado.` },
      { errado: `Achar que 2,5 e 2,50 são o mesmo resultado num relatório.`, certo: `2,50 afirma uma precisão 10 vezes maior. Escreva o número de algarismos que você realmente mediu.` },
    ],
    aplicacoes: [
      `<b>Farmácia</b>: uma prescrição de 0,5 mg e outra de 5 mg diferem por um zero mal colocado; por isso normas de segurança proíbem escrever “,5 mg” sem o zero à esquerda e “5,0 mg”, em que a vírgula pode sumir e o 5,0 virar 50.`,
      `<b>Engenharia</b>: desenhos técnicos indicam a tolerância pela quantidade de casas: 25,0 mm e 25,00 mm exigem processos de usinagem de custos muito diferentes.`,
      `<b>Química analítica</b>: o número de casas de uma bureta (0,01 mL) e de uma balança analítica (0,1 mg) define quantos algarismos o resultado da titulação pode ter.`,
      `<b>Jornalismo e dados públicos</b>: “população de 203 062 512 habitantes” sugere uma precisão que nenhum censo tem; arredondar para 203,1 milhões é mais honesto.`,
    ],
    teste: [
      { p: `Quantos algarismos significativos tem 0,07020?`, op: [`6`, `3`, `4`, `5`], certa: 2, explica: `Os zeros iniciais não contam; contam 7, 0 (entre algarismos), 2 e o 0 final após a vírgula: 7,020 × 10⁻².` },
      { p: `Por que 4500 m é um valor ambíguo?`, op: [`Porque não tem vírgula.`, `Porque os zeros finais podem ser medidos ou só posicionais; pode ter 2, 3 ou 4 a.s.`, `Porque números inteiros não têm algarismos significativos.`, `Porque deveria estar em quilômetros.`], certa: 1, explica: `Sem vírgula, não dá para saber se os zeros foram medidos. 4,5 × 10³, 4,50 × 10³ ou 4,500 × 10³ m eliminam a dúvida.` },
      { p: `Na soma 13,2 + 0,0458, o resultado deve ter…`, op: [`1 casa decimal: 13,2.`, `3 algarismos significativos, como 0,0458: 13,2.`, `4 casas decimais: 13,2458.`, `2 algarismos significativos: 13.`], certa: 0, explica: `Na soma vale a menor quantidade de casas decimais (13,2 tem 1). O resultado coincide com a opção dos 3 a.s., mas pela razão errada; no exemplo 102,5 + 0,13 a diferença aparece.` },
      { p: `Você calculou 6,02 × 3 ovos por caixa, sendo 3 um número exato. Quantos a.s. o resultado deve ter?`, op: [`1, por causa do 3.`, `2`, `infinitos`, `3, por causa de 6,02.`], certa: 3, explica: `Números exatos (contagem) têm infinitos a.s. e não limitam a conta; quem limita é 6,02, com 3.` },
      { p: `Qual destas escritas é coerente?`, op: [`(9,812 ± 0,1) m/s²`, `(9,8 ± 0,013) m/s²`, `(9,81 ± 0,02) m/s²`, `(9,8 ± 0,02) m/s²`], certa: 2, explica: `O valor deve terminar na mesma casa decimal da incerteza, e a incerteza deve ter 1 algarismo (2 se começar com 1).` },
    ],
    resumo: [
      `Algarismos significativos = os medidos com certeza + o primeiro duvidoso.`,
      `Zeros à esquerda não contam; entre algarismos e à direita após a vírgula contam; à direita sem vírgula são ambíguos.`,
      `Notação científica elimina a ambiguidade: tudo na mantissa é significativo.`,
      `Soma/subtração: menor número de casas decimais. Produto/divisão: menor número de a.s.`,
      `Números exatos não limitam. Arredonde só no fim (descartado ≥ 5 sobe).`,
      `Com incerteza conhecida: incerteza com 1 ou 2 a.s. e valor na mesma casa.`,
    ],
    alem: {
      t: "Para ir além: por que as regras funcionam (e quando falham)",
      h: `<p>Escrever um número com n algarismos significativos equivale a dizer que a incerteza é de cerca de meia unidade da última casa. Assim, 2,5 implica uma incerteza relativa de até 0,05/2,5 = 2%, mas 9,5 implica 0,05/9,5 ≈ 0,5%. Ou seja, números com o mesmo número de a.s. podem ter precisões relativas que diferem por um fator de 10, dependendo do primeiro algarismo. É por isso que as regras práticas às vezes erram um algarismo e por isso uma incerteza que começa com 1 merece 2 algarismos.</p>
        <p>Em computação, o mesmo problema reaparece: o formato <i>double</i> (IEEE 754) guarda cerca de 15 a 17 algarismos decimais, e números como 0,1 não têm representação binária exata (0,1 + 0,2 = 0,30000000000000004 em JavaScript). O cancelamento catastrófico também: calcular (1 − cos x) para x pequeno perde quase todos os algarismos, e reescrever como 2·sen²(x/2) resolve. Análise numérica é, em boa parte, a arte de não perder algarismos significativos.</p>
        <p>Uma última sutileza: em resultados intermediários que serão usados em outras contas, mantenha um algarismo de guarda além do que a incerteza justifica. O arredondamento final é para comunicar, não para calcular.</p>`,
    },
  };

  // =====================================================================
  // Estatística de medidas repetidas
  // =====================================================================
  A.estat = {
    tempo: 18, nivel: "Ensino médio (laboratório) → faculdade",
    objetivos: [
      "calcular média, mediana, desvio-padrão amostral e erro-padrão da média;",
      "explicar a diferença entre o espalhamento das medidas (s) e a incerteza da média (s/√n);",
      "construir um intervalo de confiança com o t de Student;",
      "avaliar valores suspeitos com o critério de Chauvenet sem descartar dados indevidamente;",
      "distinguir precisão de exatidão.",
    ],
    requisitos: [{ id: "sig", nome: "Algarismos significativos" }],
    secoes: [
      {
        t: "A ideia em uma frase",
        h: `<p>Repetir uma medida não dá sempre o mesmo número: o tempo de reação ao cronometrar, pequenas vibrações e a leitura da escala variam. A estatística transforma essa variação em informação: a <b>média</b> é a melhor estimativa do valor, o <b>desvio-padrão</b> diz quanto as medidas se espalham e o <b>erro-padrão da média</b> diz quão bem conhecemos a média.</p>
          <div class="analogia"><b>Analogia:</b> pense num arqueiro. Cada flecha é uma medida. O desvio-padrão é o tamanho do agrupamento das flechas. Mas o centro do agrupamento (a média) é conhecido com muito mais precisão que a posição de qualquer flecha isolada, e fica mais bem definido quanto mais flechas forem atiradas.</div>
          <p>A <b>mediana</b> (o valor do meio, com as medidas em ordem) é uma alternativa robusta à média: não se deixa levar por um único valor absurdo. Se a média e a mediana diferem muito, desconfie de valores discrepantes ou de uma distribuição assimétrica. Para 2,01; 1,98; 2,03; 2,00; 1,99; 2,02 s, a mediana é a média de 2,00 e 2,01 = 2,005 s, igual à média: sinal de dados bem comportados.</p>`,
      },
      {
        t: "Desvio-padrão e erro-padrão da média",
        h: `<p>O <b>desvio-padrão amostral</b> é a distância típica de cada medida até a média:</p>
          <div class="eq">s = √( Σ(xᵢ − x̄)² / (n − 1) )</div>
          <p>Por que n − 1 e não n? Porque os desvios são medidos em relação a x̄, que foi calculada com os mesmos dados e fica, por construção, “no meio” deles. Isso faz Σ(xᵢ − x̄)² ser sistematicamente menor do que seria em relação ao valor verdadeiro. Dividir por n − 1 (os <b>graus de liberdade</b>, já que os n desvios somam zero e só n − 1 são livres) corrige esse viés. É a <b>correção de Bessel</b>; nas calculadoras, a tecla costuma ser σₙ₋₁ ou s.</p>
          <p>O desvio-padrão <b>não diminui</b> ao fazer mais medidas: ele descreve o processo de medição. O que diminui é a incerteza da média, o <b>erro-padrão</b>:</p>
          <div class="eq">σ<sub>x̄</sub> = s / √n</div>
          <p>Para reduzir a incerteza da média pela metade, é preciso <b>quadruplicar</b> o número de medidas. Esse retorno decrescente explica por que, depois de umas 10 a 30 medidas, costuma valer mais a pena melhorar o método que repetir. E lembre: s/√n só reduz erros aleatórios; um sistemático continua inteiro na média.</p>`,
      },
      {
        t: "A distribuição normal",
        h: `<p>Quando o erro de uma medida resulta da soma de muitas pequenas perturbações independentes, as medidas se distribuem segundo a <b>curva normal</b> (gaussiana), em forma de sino, centrada no valor médio μ e com largura σ. Esse é o conteúdo do <b>teorema central do limite</b>, e por isso a normal aparece em toda parte.</p>
          <ul><li>Entre μ − σ e μ + σ ficam <b>68,3%</b> das medidas.</li>
          <li>Entre μ − 2σ e μ + 2σ ficam <b>95,4%</b> (a faixa de exatamente 95% é ±1,96σ).</li>
          <li>Entre μ − 3σ e μ + 3σ ficam <b>99,7%</b>.</li></ul>
          <p>Então uma medida a mais de 3σ da média é rara: acontece em cerca de 3 a cada 1000. É por isso que a incerteza-padrão corresponde a cerca de 68% de confiança, e a incerteza expandida com k = 2, a cerca de 95%. Mesmo quando as medidas individuais não são normais, a <b>média</b> de várias delas tende a ser, o que justifica usar a normal para intervalos de confiança.</p>`,
        grafico: {
          op: { altura: 220, modo: "cartesiano", rotX: "z = (x − μ)/σ" },
          cena: {
            x: [-4, 4], y: [0, 0.45],
            series: [
              { tipo: "area", f: (z) => Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI), a: -2, b: 2, rotulo: "±2σ: 95,4%", cor: "#6c9bd2" },
              { tipo: "area", f: (z) => Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI), a: -1, b: 1, rotulo: "±1σ: 68,3%", cor: "#d9648c" },
              { tipo: "funcao", f: (z) => Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI), rotulo: "densidade normal", cor: "#e8edf3" },
            ],
          },
          legenda: "Curva normal padronizada. A faixa central (±1σ) contém 68,3% das medidas; a faixa até ±2σ contém 95,4%; até ±3σ, 99,7%.",
        },
      },
      {
        t: "Intervalo de confiança e t de Student",
        h: `<p>Um <b>intervalo de confiança de 95%</b> é uma faixa x̄ ± (fator)·σ<sub>x̄</sub> construída de modo que, se o experimento fosse repetido muitas vezes, 95% dos intervalos assim obtidos conteriam o valor verdadeiro. Se σ fosse conhecido, o fator seria 1,96. Mas usamos s, que também é incerto quando n é pequeno; para compensar, o fator vem da <b>distribuição t de Student</b>, com ν = n − 1 graus de liberdade:</p>
          <div class="tab-rolar"><table class="tb"><thead><tr><th>ν = n − 1</th><th>2</th><th>4</th><th>5</th><th>9</th><th>19</th><th>29</th><th>∞</th></tr></thead>
          <tbody><tr><td>t (95%)</td><td>4,303</td><td>2,776</td><td>2,571</td><td>2,262</td><td>2,093</td><td>2,045</td><td>1,960</td></tr>
          <tr><td>t (99%)</td><td>9,925</td><td>4,604</td><td>4,032</td><td>3,250</td><td>2,861</td><td>2,756</td><td>2,576</td></tr></tbody></table></div>
          <p>Com 3 medidas (ν = 2), o fator para 95% é mais que o dobro do valor para muitas medidas. O t de Student foi publicado em 1908 por William Gosset, químico da cervejaria Guinness, que trabalhava com amostras pequenas e assinava “Student” por exigência do empregador.</p>
          <div class="destaque"><b>Precisão × exatidão:</b> precisão é o quanto as medidas concordam entre si (s pequeno); exatidão é o quanto concordam com o valor verdadeiro (sem erro sistemático). Um cronômetro que começa sempre 0,2 s atrasado dá medidas precisas e inexatas. Estatística mede a precisão; exatidão exige calibração e comparação com referências.</div>`,
      },
      {
        t: "Valores suspeitos e o critério de Chauvenet",
        h: `<p>De vez em quando uma medida fica muito longe das outras. Pode ser engano (leitura errada, anotação trocada, alguém esbarrou na bancada) ou só um valor legítimo e raro. O <b>critério de Chauvenet</b> dá um limite objetivo: calcule z = |x − x̄|/s e a probabilidade P de uma medida normal cair tão longe ou mais; se <b>n·P &lt; 0,5</b>, ou seja, se num conjunto de n medidas se esperaria menos de meia medida tão extrema, o valor é candidato a descarte.</p>
          <p>O limite z depende de n: cerca de 1,54 para n = 4, 1,73 para n = 6, 1,96 para n = 10 e 2,24 para n = 20. Quanto mais medidas, mais natural é aparecer uma extrema, e mais exigente fica o critério.</p>
          <p>Regras de bom senso, que importam mais que a fórmula:</p>
          <ul><li>O critério <b>aponta</b> suspeitos; descartar é uma decisão sua. Procure a causa no caderno de laboratório.</li>
          <li>Aplique-o <b>uma vez só</b>. Reaplicá-lo após cada exclusão acaba eliminando dados legítimos.</li>
          <li>Se excluir, <b>relate</b> no texto qual valor saiu e por quê. Excluir em silêncio é manipulação de dados.</li>
          <li>Se os “suspeitos” são frequentes, a distribuição não é normal ou há um problema no método; descartar não resolve.</li></ul>`,
      },
    ],
    formulas: [
      { nome: "Média e desvio-padrão amostral", eq: `x̄ = ${fr("Σxᵢ", "n")} &nbsp;&nbsp; s = √${fr("Σ(xᵢ − x̄)²", "n − 1")}`, simbolos: [["x̄", "média aritmética", "unid. da medida"], ["s", "desvio-padrão amostral (espalhamento de uma medida)", "unid. da medida"], ["n", "número de medidas", "—"]], obs: "Use n − 1 (correção de Bessel) porque a média foi estimada dos mesmos dados." },
      { nome: "Erro-padrão da média", eq: `σ<sub>x̄</sub> = ${fr("s", "√n")}`, simbolos: [["σ<sub>x̄</sub>", "incerteza-padrão (tipo A) da média", "unid. da medida"]], obs: "Cai com √n: 4 vezes mais medidas, metade da incerteza." },
      { nome: "Intervalo de confiança", eq: `x̄ ± t<sub>ν</sub>·${fr("s", "√n")}, &nbsp;ν = n − 1`, simbolos: [["t<sub>ν</sub>", "fator de Student para o nível de confiança escolhido", "—"]], obs: "Para n grande, t → 1,96 (95%). Supõe erros aleatórios aproximadamente normais." },
      { nome: "Critério de Chauvenet", eq: `z = ${fr("|xᵢ − x̄|", "s")}; &nbsp;suspeito se n · P(|Z| ≥ z) &lt; 0,5`, simbolos: [["P(|Z| ≥ z)", "probabilidade normal bilateral de um desvio ≥ z", "—"]], obs: "Só aponta candidatos. Aplique uma vez e relate qualquer exclusão." },
    ],
    exemplos: [
      {
        t: "direto: período de um pêndulo",
        enunciado: `Seis medidas do período de um pêndulo: 2,01; 1,98; 2,03; 2,00; 1,99; 2,02 s. Calcule média, desvio-padrão, erro-padrão e o intervalo de 95%.`,
        passos: [
          `Média: (2,01 + 1,98 + 2,03 + 2,00 + 1,99 + 2,02)/6 = 12,03/6 = 2,005 s.`,
          `Desvios (s): 0,005; −0,025; 0,025; −0,005; −0,015; 0,015. Quadrados somados: 0,000025 + 0,000625 + 0,000625 + 0,000025 + 0,000225 + 0,000225 = 0,00175 s².`,
          `s = √(0,00175/5) = √0,00035 = 0,0187 s.`,
          `σ<sub>x̄</sub> = 0,0187/√6 = 0,0187/2,449 = 0,0076 s.`,
          `ν = 5 → t = 2,571. Semilargura = 2,571 × 0,0076 = 0,0196 s → 0,020 s.`,
        ],
        resposta: `T = (2,005 ± 0,008) s (incerteza-padrão) ou <b>T = (2,005 ± 0,020) s com 95% de confiança</b>`,
      },
      {
        t: "Chauvenet: valor suspeito",
        enunciado: `Dez medidas de g (m/s²): 9,78; 9,82; 9,80; 9,85; 9,79; 9,81; 9,83; 9,80; 9,81; 9,31. O caderno registra que na última o fio do pêndulo escorregou. Avalie e dê o resultado.`,
        passos: [
          `Com os 10 valores: x̄ = 9,760 m/s² e s = 0,159 m/s².`,
          `Para 9,31: z = |9,31 − 9,760|/0,159 = 2,82. P(|Z| ≥ 2,82) ≈ 0,0047; n·P = 10 × 0,0047 = 0,047 &lt; 0,5 → suspeito (limite para n = 10: z = 1,96).`,
          `Há causa documentada (o fio escorregou): exclui-se e relata-se a exclusão. Os demais têm z &lt; 0,6, sem problemas.`,
          `Com 9 valores: x̄ = 9,810 m/s², s = 0,0212 m/s², σ<sub>x̄</sub> = 0,0212/3 = 0,0071 m/s².`,
          `ν = 8 → t = 2,306; semilargura = 2,306 × 0,0071 = 0,016 m/s².`,
        ],
        resposta: `<b>g = (9,810 ± 0,016) m/s² (95%)</b>, com uma medida excluída por causa identificada. Note como um único valor puxou a média em 0,05 m/s² e inflou s em 7 vezes.`,
      },
      {
        t: "planejamento: quantas medidas?",
        enunciado: `Medidas de tempo com cronômetro manual têm s ≈ 0,10 s. Quantas medidas são necessárias para que o erro-padrão da média seja 0,02 s?`,
        passos: [
          `σ<sub>x̄</sub> = s/√n → √n = s/σ<sub>x̄</sub> = 0,10/0,02 = 5.`,
          `n = 5² = 25 medidas.`,
          `Para chegar a 0,01 s seriam 100 medidas. Alternativa melhor: cronometrar 10 oscilações de uma vez divide a incerteza do período por 10, porque o tempo de reação entra só no início e no fim.`,
        ],
        resposta: `<b>n = 25</b>; e vale mais mudar o método (cronometrar várias oscilações) que só repetir.`,
      },
    ],
    erros: [
      { errado: `Usar o desvio-padrão s como incerteza da média.`, certo: `A incerteza (tipo A) da média é s/√n.`, porque: `s descreve o espalhamento de uma medida isolada; a média de n medidas é √n vezes mais precisa.` },
      { errado: `Dividir por n no desvio-padrão de uma amostra pequena (tecla σₙ da calculadora).`, certo: `Use n − 1 (tecla σₙ₋₁ ou s).`, porque: `Com a média estimada dos próprios dados, dividir por n subestima a dispersão, e o efeito é grande para n pequeno (com n = 5, cerca de 11% em s).` },
      { errado: `Usar ± 2σ<sub>x̄</sub> como intervalo de 95% com 4 medidas.`, certo: `Com n = 4, ν = 3 e t = 3,182: o intervalo é ± 3,18 σ<sub>x̄</sub>.`, porque: `Com poucas medidas, o próprio s é incerto; o t de Student compensa.` },
      { errado: `Descartar os valores que “estragam” o resultado, até o desvio ficar pequeno.`, certo: `Avaliar uma vez (Chauvenet), procurar a causa e relatar qualquer exclusão.`, porque: `Descartar dados por conveniência é uma forma de fabricar resultados e é considerado má conduta científica.` },
      { errado: `“Meu desvio-padrão é pequeno, então meu resultado está certo.”`, certo: `s pequeno indica precisão; exatidão exige verificar erros sistemáticos (calibração, comparação com referência).` },
    ],
    aplicacoes: [
      `<b>Controle de qualidade</b>: gráficos de controle industriais marcam limites em ±3σ; um ponto fora indica que o processo saiu do controle.`,
      `<b>Saúde</b>: os “valores de referência” de um exame de sangue costumam ser a faixa que contém 95% da população saudável (cerca de ±2σ); 1 em cada 20 pessoas saudáveis cai fora dela.`,
      `<b>Pesquisas de opinião</b>: a margem de erro é um intervalo de confiança de 95% (em geral ±1,96 erro-padrão) e cai com a raiz do tamanho da amostra.`,
      `<b>Ensaios clínicos</b>: o efeito de um remédio é relatado com intervalo de confiança; se o intervalo inclui zero, o efeito não foi demonstrado.`,
      `<b>Física de partículas</b>: “5 sigma” (probabilidade de cerca de 3 em 10 milhões, unilateral) é o padrão exigido para anunciar uma descoberta.`,
    ],
    teste: [
      { p: `Você dobra o número de medidas. O que acontece com s e com σ<sub>x̄</sub>?`, op: [`Ambos caem pela metade.`, `s fica mais ou menos igual; σ<sub>x̄</sub> cai por um fator √2 ≈ 1,41.`, `s cai por √2; σ<sub>x̄</sub> fica igual.`, `Ambos ficam iguais.`], certa: 1, explica: `s descreve o processo de medida e não depende de n (só fica mais bem estimado). σ_x̄ = s/√n cai com √n.` },
      { p: `Um termômetro mal calibrado lê sempre 0,8 °C a mais, mas as leituras variam só ±0,05 °C. Ele é:`, op: [`preciso e exato.`, `impreciso e exato.`, `impreciso e inexato.`, `preciso e inexato.`], certa: 3, explica: `Pouca variação = precisão. O desvio de 0,8 °C, sempre no mesmo sentido, é um erro sistemático = falta de exatidão. Repetir não corrige; calibrar, sim.` },
      { p: `Por que o intervalo de 95% com 3 medidas usa t = 4,30 em vez de 1,96?`, op: [`Porque com poucas medidas o desvio-padrão s também é muito incerto.`, `Porque a distribuição das medidas deixa de ser normal.`, `Porque com 3 medidas a média é tendenciosa.`, `É uma margem de segurança arbitrária.`], certa: 0, explica: `O fator 1,96 supõe σ conhecido. Com s estimado de poucos dados, a razão (x̄ − μ)/(s/√n) segue a distribuição t, de caudas mais largas.` },
      { p: `Num conjunto de 6 medidas, uma tem z = 1,9 e o limite de Chauvenet é 1,73. O procedimento correto é:`, op: [`excluí-la imediatamente e recalcular, aplicando o critério de novo.`, `mantê-la sempre, pois excluir dados é proibido.`, `tratá-la como candidata, procurar uma causa e, se excluir, relatar no texto.`, `substituí-la pela média das outras.`], certa: 2, explica: `O critério só sinaliza. A decisão depende de evidência (anotações, condições), e qualquer exclusão deve ser declarada. Reaplicar repetidamente ou substituir dados não é aceitável.` },
      { p: `Que fração das medidas de uma distribuição normal cai fora da faixa μ ± 2σ?`, op: [`cerca de 32%`, `cerca de 0,3%`, `cerca de 5%`, `exatamente 2%`], certa: 2, explica: `Dentro de ±2σ estão 95,4%; fora, 4,6%, ou cerca de 1 em 22. Fora de ±1σ seriam 32%; fora de ±3σ, 0,3%.` },
      { p: `Por que o desvio-padrão amostral divide por n − 1?`, op: [`Para descartar a maior medida.`, `Porque os desvios são calculados em relação à média amostral, que já se ajusta aos dados; n − 1 corrige o viés.`, `Porque a primeira medida costuma ser de treino.`, `Para que s seja sempre maior que a média.`], certa: 1, explica: `Os n desvios em relação a x̄ somam zero, então só n − 1 são independentes (graus de liberdade). Dividir por n subestimaria a variância.` },
    ],
    resumo: [
      `Média = melhor estimativa; mediana = alternativa robusta a valores extremos.`,
      `s = √(Σ(xᵢ − x̄)²/(n − 1)) descreve o espalhamento de uma medida; não cai com n.`,
      `Erro-padrão da média: s/√n. Quadruplicar n reduz a incerteza à metade.`,
      `Normal: ±1σ ≈ 68%, ±2σ ≈ 95%, ±3σ ≈ 99,7%.`,
      `Intervalo de confiança: x̄ ± t·s/√n, com t de Student para ν = n − 1 (t → 1,96 para n grande).`,
      `Chauvenet aponta suspeitos (n·P < 0,5); excluir exige causa e deve ser relatado.`,
      `Precisão (s pequeno) não é exatidão (ausência de erro sistemático).`,
    ],
    alem: {
      t: "Para ir além: limites do Chauvenet e alternativas robustas",
      h: `<p>Um fato pouco conhecido: com n medidas, nenhum valor pode ficar a mais de (n − 1)/√n desvios-padrão da média amostral, porque o próprio valor extremo infla s. Para n = 3 esse máximo é 2/√3 ≈ 1,15 e para n = 4 é 1,5, ambos <b>abaixo</b> do limite de Chauvenet (1,38 e 1,54). Ou seja, com 3 ou 4 medidas o critério nunca rejeita nada, por mais absurdo que seja o valor. No exemplo com n = 10, o suspeito teve z = 2,82, perto do máximo possível de 9/√10 = 2,85.</p>
        <p>Por isso estatísticos preferem testes desenhados para isso, como o <b>teste de Grubbs</b> (que usa a distribuição exata do maior z) ou o <b>teste Q de Dixon</b> para amostras pequenas, e estimadores <b>robustos</b> que dispensam a decisão de excluir: a mediana e o <b>desvio absoluto mediano</b> (MAD), em que 1,4826·MAD estima σ para dados normais sem se abalar com alguns valores loucos.</p>
        <p>Outra ponte importante: a interpretação de “95% de confiança” é sobre o <b>procedimento</b> (95% dos intervalos construídos assim acertam), não sobre um intervalo específico. A frase “há 95% de probabilidade de o valor verdadeiro estar neste intervalo” é a interpretação bayesiana, que exige uma distribuição a priori. Para dados bem comportados e priori pouco informativa, os números coincidem, mas os conceitos não.</p>`,
    },
  };

  // =====================================================================
  // Constantes físicas e o SI
  // =====================================================================
  A.constantes = {
    tempo: 13, nivel: "Ensino médio → faculdade",
    objetivos: [
      "explicar o que é uma constante fundamental e por que ela não depende de convenções humanas;",
      "descrever como o SI de 2019 define as sete unidades de base a partir de constantes com valor exato;",
      "distinguir constantes exatas de constantes medidas e ler a notação concisa de incerteza do CODATA;",
      "escolher quantos algarismos de uma constante usar numa conta e citar a fonte corretamente.",
    ],
    requisitos: [{ id: "sig", nome: "Algarismos significativos" }, { id: "incerteza", nome: "Incertezas e propagação" }],
    secoes: [
      {
        t: "A ideia em uma frase",
        h: `<p>Uma <b>constante física fundamental</b> é um número que a natureza fixa e que aparece nas leis da física sempre com o mesmo valor, em qualquer lugar e época: a velocidade da luz no vácuo c, a constante de Planck h, a carga elementar e, a constante da gravitação G. O valor numérico depende das unidades escolhidas, mas a grandeza em si não.</p>
          <div class="analogia"><b>Analogia:</b> a altura de uma porta pode ser dita em metros ou em pés, mas a porta é a mesma. Durante séculos, fizemos o contrário: escolhíamos “portas” humanas (uma barra de metal, um cilindro guardado em Paris) e medíamos a natureza com elas. Desde 2019 o SI usa as “portas” da natureza como referência.</div>
          <p>Nem todo número de tabela é fundamental. A aceleração da gravidade g ≈ 9,8 m/s² depende do planeta, da latitude e da altitude: é um parâmetro local, não uma constante fundamental. Já a densidade da água varia com a temperatura. Constantes fundamentais, até onde se sabe com medidas de altíssima precisão, não variam.</p>`,
      },
      {
        t: "O SI de 2019: unidades definidas por constantes exatas",
        h: `<p>Até 2019, o quilograma era a massa de um cilindro de platina-irídio guardado perto de Paris (o “protótipo internacional”). Comparações mostraram que as cópias e o original divergiam em cerca de 50 microgramas em um século, e ninguém podia dizer quem tinha mudado. Desde 20 de maio de 2019, as sete unidades de base são definidas fixando o valor <b>exato</b> de sete constantes:</p>
          <div class="tab-rolar"><table class="tb"><thead><tr><th>Constante</th><th>Valor exato</th><th>Define</th></tr></thead><tbody>
          <tr><td>Frequência do césio-133, Δν<sub>Cs</sub></td><td>9 192 631 770 Hz</td><td>segundo</td></tr>
          <tr><td>Velocidade da luz, c</td><td>299 792 458 m/s</td><td>metro</td></tr>
          <tr><td>Constante de Planck, h</td><td>6,626 070 15 × 10⁻³⁴ J·s</td><td>quilograma</td></tr>
          <tr><td>Carga elementar, e</td><td>1,602 176 634 × 10⁻¹⁹ C</td><td>ampère</td></tr>
          <tr><td>Constante de Boltzmann, k</td><td>1,380 649 × 10⁻²³ J/K</td><td>kelvin</td></tr>
          <tr><td>Constante de Avogadro, N<sub>A</sub></td><td>6,022 140 76 × 10²³ mol⁻¹</td><td>mol</td></tr>
          <tr><td>Eficácia luminosa, K<sub>cd</sub></td><td>683 lm/W</td><td>candela</td></tr></tbody></table></div>
          <p>Esses números não têm incerteza: são definições. Medir uma massa agora significa, em última instância, compará-la com h, por exemplo com a <b>balança de Kibble</b>, que equilibra um peso com uma força eletromagnética medida por efeitos quânticos. Constantes derivadas dessas também ficam exatas: R = N<sub>A</sub>·k e F = N<sub>A</sub>·e.</p>`,
      },
      {
        t: "Constantes medidas, incerteza e CODATA",
        h: `<p>Outras constantes continuam sendo <b>medidas</b> e têm incerteza: a constante gravitacional G, a massa do elétron mₑ, a constante de estrutura fina α. Ironia da redefinição: a permeabilidade do vácuo μ₀, que antes era exata (4π × 10⁻⁷ N/A²), passou a ser medida, porque agora é e que está fixa.</p>
          <p>Os valores recomendados são publicados pelo <b>CODATA</b> (Comitê de Dados para Ciência e Tecnologia), que a cada quatro anos combina todas as medidas do mundo num ajuste global de mínimos quadrados. A ferramenta usa a revisão CODATA 2018; a revisão de 2022 mudou alguns valores na última casa, sem efeito em contas de laboratório de ensino.</p>
          <p>O CODATA usa a <b>notação concisa</b>: o número entre parênteses é a incerteza-padrão nos últimos algarismos. Assim, G = 6,674 30(15) × 10⁻¹¹ m³·kg⁻¹·s⁻² significa (6,674 30 ± 0,000 15) × 10⁻¹¹, uma incerteza relativa de 2,2 × 10⁻⁵. Parece pequena, mas G é de longe a constante fundamental menos conhecida: a massa do elétron, 9,109 383 7015(28) × 10⁻³¹ kg, tem incerteza relativa de 3 × 10⁻¹⁰, cem mil vezes menor. Medir a gravidade entre massas de laboratório é dificílimo porque ela é fraquíssima.</p>`,
      },
      {
        t: "Usando constantes com o número certo de algarismos",
        h: `<p>Uma constante exata ou muito bem conhecida <b>não deve limitar</b> a precisão da sua conta: use pelo menos <b>um ou dois algarismos a mais</b> do que os dados medidos têm. Se você mediu um comprimento de onda com 3 algarismos, usar h = 6,626 × 10⁻³⁴ J·s e c = 2,998 × 10⁸ m/s é suficiente. Usar c = 3 × 10⁸ m/s (1 algarismo) introduz um erro de 0,07%, irrelevante numa medida de 1%, mas não numa de 0,01%.</p>
          <p>Ao contrário, usar a constante com 10 algarismos não melhora em nada um dado com 3. A regra prática: o erro de arredondamento da constante deve ser pelo menos dez vezes menor que a incerteza relativa dos seus dados; assim ele some na quadratura.</p>
          <p>Cuidado especial com <b>parâmetros que parecem constantes</b>:</p>
          <ul><li>g varia de 9,780 m/s² no equador a 9,832 m/s² nos polos (ao nível do mar); o valor “padrão” 9,806 65 m/s² é uma convenção. Para um experimento preciso, use o g local.</li>
          <li>O volume molar de um gás ideal depende da pressão de referência: 22,414 L/mol a 101,325 kPa e 22,711 L/mol a 100 kPa, ambos a 0 °C.</li></ul>
          <p>Ao citar, informe a fonte e a revisão: “valores de constantes do CODATA 2018 (Tiesinga et al., Rev. Mod. Phys. 93, 025010, 2021)”.</p>`,
      },
    ],
    formulas: [
      { nome: "Notação concisa", eq: `6,674 30(15) &nbsp;=&nbsp; 6,674 30 ± 0,000 15`, simbolos: [["(15)", "incerteza-padrão, alinhada aos últimos algarismos do valor", "mesma unidade"]], obs: "Os parênteses cobrem as últimas casas: 9,109 383 7015(28) = 9,109 383 7015 ± 0,000 000 0028." },
      { nome: "Incerteza relativa", eq: `u<sub>r</sub> = ${fr("u", "|valor|")}`, simbolos: [["u<sub>r</sub>", "incerteza relativa padrão", "—"]], obs: "Exatas: u_r = 0. G: 2,2×10⁻⁵. mₑ: 3,0×10⁻¹⁰." },
      { nome: "Constantes derivadas exatas", eq: `R = N<sub>A</sub>·k &nbsp;&nbsp; F = N<sub>A</sub>·e`, simbolos: [["R", "constante dos gases = 8,314 462 618… J/(mol·K)", "J·mol⁻¹·K⁻¹"], ["F", "constante de Faraday = 96 485,332 12… C/mol", "C/mol"]], obs: "Produtos de constantes exatas são exatos (embora com infinitas casas)." },
    ],
    exemplos: [
      {
        t: "derivar uma constante exata",
        enunciado: `Mostre que a constante dos gases R vale 8,314 J/(mol·K) a partir das constantes definidoras.`,
        passos: [
          `R = N<sub>A</sub>·k = 6,022 140 76 × 10²³ mol⁻¹ × 1,380 649 × 10⁻²³ J/K.`,
          `Mantissas: 6,022 140 76 × 1,380 649 = 8,314 462 618…; potências: 10²³ × 10⁻²³ = 1.`,
          `Como os dois fatores são exatos, R também é: 8,314 462 618… J/(mol·K).`,
        ],
        resposta: `<b>R = 8,314 462 618… J/(mol·K)</b>, exato (truncado na escrita, não por incerteza)`,
      },
      {
        t: "quantos algarismos usar",
        enunciado: `Um laser verde tem λ = (532 ± 1) nm. Calcule a energia de um fóton em joules e em elétron-volts.`,
        passos: [
          `E = h·c/λ = 6,626 070 15 × 10⁻³⁴ J·s × 299 792 458 m/s / 532 × 10⁻⁹ m = 3,7339 × 10⁻¹⁹ J.`,
          `Em eV: 3,7339 × 10⁻¹⁹ J / 1,602 176 634 × 10⁻¹⁹ J/eV = 2,3305 eV.`,
          `h, c e e são exatos; a incerteza vem só de λ: relativa 1/532 = 0,19%. u<sub>E</sub> = 0,0019 × 2,3305 = 0,0044 eV.`,
          `Usar h = 6,63 × 10⁻³⁴ e c = 3,00 × 10⁸ dá 2,327 eV, erro de 0,15%, quase igual à incerteza do dado: aceitável só por pouco.`,
        ],
        resposta: `<b>E = (2,330 ± 0,004) eV</b> = (3,734 ± 0,007) × 10⁻¹⁹ J`,
      },
      {
        t: "ler a notação concisa",
        enunciado: `O CODATA 2018 dá a massa do próton como m<sub>p</sub> = 1,672 621 923 69(51) × 10⁻²⁷ kg. Qual a incerteza absoluta e a relativa?`,
        passos: [
          `Os parênteses (51) alinham com os dois últimos algarismos (…69): u = 0,000 000 000 51 × 10⁻²⁷ kg = 5,1 × 10⁻³⁷ kg.`,
          `Relativa: 5,1 × 10⁻³⁷ / 1,6726 × 10⁻²⁷ = 3,0 × 10⁻¹⁰.`,
        ],
        resposta: `<b>u = 5,1 × 10⁻³⁷ kg; u<sub>r</sub> = 3,0 × 10⁻¹⁰</b> (três partes em dez bilhões)`,
      },
    ],
    erros: [
      { errado: `Atribuir incerteza à velocidade da luz: c = (2,998 ± 0,001) × 10⁸ m/s.`, certo: `c = 299 792 458 m/s exatamente; você pode arredondá-la, mas ela não tem incerteza.`, porque: `Desde 1983 o metro é definido a partir de c; a constante é uma definição, não uma medida.` },
      { errado: `Tratar g = 9,8 m/s² como constante fundamental.`, certo: `g é um parâmetro local (9,78 a 9,83 m/s² na superfície). A constante fundamental é G.` },
      { errado: `Usar π = 3,14 e c = 3 × 10⁸ m/s numa medida com precisão de 0,01%.`, certo: `Use constantes com pelo menos 1 ou 2 algarismos a mais que os dados.`, porque: `π = 3,14 já tem erro de 0,05%: ele passaria a dominar a incerteza.` },
      { errado: `Ler 6,674 30(15) como 6,674 30 ± 15.`, certo: `O (15) vale nas duas últimas casas: ± 0,000 15.` },
    ],
    aplicacoes: [
      `<b>GPS</b>: os satélites usam relógios atômicos de césio e rubídio, ligados à definição do segundo; um erro de 1 μs no tempo daria cerca de 300 m de erro na posição (c × 1 μs).`,
      `<b>Metrologia elétrica</b>: o volt e o ohm são realizados pelos efeitos Josephson e Hall quântico, que dependem apenas de h e e; com os dois exatos, essas realizações ficaram coerentes com o SI.`,
      `<b>Indústria farmacêutica</b>: massas de microgramas são rastreáveis à constante de Planck através de cadeias de calibração de balanças.`,
      `<b>Química</b>: com N<sub>A</sub> exato, o mol passou a ser simplesmente um número de entidades (6,022 140 76 × 10²³), sem depender do carbono-12.`,
    ],
    teste: [
      { p: `Por que a constante de Planck não tem incerteza no SI atual?`, op: [`Porque foi medida com perfeição em 2019.`, `Porque seu valor foi fixado por definição, e o quilograma passou a ser definido a partir dela.`, `Porque é uma constante muito pequena.`, `Porque é uma constante matemática, como π.`], certa: 1, explica: `Em 2019 o valor numérico de h foi fixado. A incerteza que antes estava em h foi transferida para as realizações práticas do quilograma.` },
      { p: `Qual destas grandezas NÃO é uma constante fundamental?`, op: [`A carga elementar e.`, `A velocidade da luz no vácuo c.`, `A aceleração da gravidade g.`, `A constante de Boltzmann k.`], certa: 2, explica: `g depende do local (latitude, altitude, geologia). e, c e k são as mesmas em todo o universo.` },
      { p: `O que significa mₑ = 9,109 383 7015(28) × 10⁻³¹ kg?`, op: [`mₑ = (9,109 383 7015 ± 0,000 000 0028) × 10⁻³¹ kg.`, `mₑ = (9,109 383 7015 ± 28) × 10⁻³¹ kg.`, `mₑ = (9,109 383 7015 ± 0,28) × 10⁻³¹ kg.`, `O valor tem 28 algarismos significativos.`], certa: 0, explica: `Na notação concisa, os algarismos entre parênteses se alinham com os últimos algarismos do valor.` },
      { p: `Seus dados têm incerteza relativa de 2%. Que versão de c é adequada?`, op: [`299 792 458 m/s, sempre com todos os algarismos.`, `3 × 10⁸ m/s não serve, o erro seria de 7%.`, `Qualquer valor entre 2 × 10⁸ e 4 × 10⁸ m/s.`, `3,00 × 10⁸ m/s basta: o erro de 0,07% é desprezível perto de 2%.`], certa: 3, explica: `O erro de arredondamento da constante deve ser bem menor que a incerteza dos dados. 0,07% ≪ 2%. Usar mais algarismos não faz mal, mas não melhora o resultado.` },
      { p: `Qual constante fundamental é conhecida com a MAIOR incerteza relativa?`, op: [`A massa do elétron.`, `A constante da gravitação G.`, `A carga elementar.`, `A constante de Avogadro.`], certa: 1, explica: `G tem incerteza relativa de cerca de 2×10⁻⁵, porque a gravidade entre massas de laboratório é extremamente fraca. e e N_A são exatas; mₑ é conhecida a 3×10⁻¹⁰.` },
    ],
    resumo: [
      `Constante fundamental: mesmo valor em toda parte; g, por exemplo, não é uma.`,
      `SI de 2019: sete constantes com valor exato (Δν_Cs, c, h, e, k, N_A, K_cd) definem as sete unidades de base.`,
      `Constantes exatas não têm incerteza; produtos delas (R, F) também são exatos.`,
      `Constantes medidas (G, mₑ, α, μ₀) têm incerteza, publicada pelo CODATA a cada 4 anos.`,
      `Notação concisa: 6,674 30(15) = 6,674 30 ± 0,000 15.`,
      `Use constantes com 1 ou 2 algarismos a mais que os dados e cite a fonte e a revisão.`,
    ],
    alem: {
      t: "Para ir além: constantes adimensionais e a busca por variações",
      h: `<p>O valor numérico de c depende de escolhermos metros e segundos; trocando de unidades ele pode valer 1 (como fazem os físicos teóricos com “unidades naturais”). Já certas combinações <b>adimensionais</b> não dependem de unidade nenhuma. A mais famosa é a <b>constante de estrutura fina</b>, α = e²/(4πε₀ħc) ≈ 1/137,036, que mede a intensidade da interação eletromagnética. Outra é a razão entre as massas do próton e do elétron, ≈ 1836,15. Se α fosse alguns por cento diferente, a química das estrelas e dos átomos seria outra.</p>
        <p>Por isso a pergunta “as constantes variam no tempo?” só faz sentido para as adimensionais. Relógios atômicos ópticos comparados ao longo de anos limitam a variação de α a menos de cerca de 10⁻¹⁸ por ano, e espectros de quasares distantes testam α há bilhões de anos. Até agora, nenhuma variação convincente foi encontrada.</p>
        <p>Curiosidade histórica: a medida de α pelo momento magnético do elétron e a medida por recuo atômico (com átomos de césio e rubídio) concordam em partes por bilhão, mas não perfeitamente: a pequena tensão entre elas é um dos testes mais precisos da eletrodinâmica quântica.</p>`,
    },
  };

  // =====================================================================
  // Como apresentar dados: tabelas e gráficos
  // =====================================================================
  A.tabela = {
    tempo: 14, nivel: "Ensino médio (laboratório) → TCC e iniciação científica",
    objetivos: [
      "montar tabelas com cabeçalhos que trazem grandeza, unidade e incerteza;",
      "padronizar algarismos e casas decimais de acordo com a incerteza de cada coluna;",
      "construir gráficos com eixos, unidades, barras de erro e legenda adequados;",
      "evitar os erros mais comuns de relatórios e exportar dados em CSV e LaTeX sem armadilhas.",
    ],
    requisitos: [{ id: "sig", nome: "Algarismos significativos" }, { id: "incerteza", nome: "Incertezas e propagação" }, { id: "ajuste", nome: "Ajuste linear" }],
    secoes: [
      {
        t: "A ideia em uma frase",
        h: `<p>Uma tabela ou um gráfico bem feito deve ser entendido <b>sozinho</b>, sem que o leitor precise caçar no texto o que é cada coluna, em que unidade está e quão confiável é cada número. Em relatórios, TCCs e artigos, muitos avaliadores leem primeiro as figuras e tabelas; se elas forem confusas, o trabalho perde credibilidade antes de o texto ser lido.</p>
          <div class="analogia"><b>Analogia:</b> uma tabela de dados é como a tabela nutricional de um alimento: cada linha tem o nome da grandeza, a unidade e a porção de referência. Ninguém aceitaria “Proteína: 8” sem saber se são gramas por 100 g ou por porção.</div>
          <p>Use <b>tabelas</b> quando os valores exatos importam (o leitor vai querer copiar os números) e <b>gráficos</b> quando o que importa é a tendência, a comparação ou a forma de uma relação. Muitas vezes os dois coexistem: a tabela com as medidas e o gráfico com o ajuste. Não repita a mesma informação nos dois sem necessidade.</p>`,
      },
      {
        t: "Tabelas: cabeçalho, unidade, incerteza e algarismos",
        h: `<p>Regras de uma boa tabela científica:</p>
          <ol><li><b>Cabeçalho com grandeza e unidade</b>: “t (s)”, “V (V)”, “ρ (g/cm³)”. Nunca repita a unidade em cada célula.</li>
          <li><b>Incerteza</b>: se é a mesma para toda a coluna, ponha no cabeçalho, “L (cm) ± 0,05”; se varia, crie uma coluna “σ<sub>V</sub> (V)” ou escreva cada célula como 3,66 ± 0,03.</li>
          <li><b>Casas decimais coerentes</b> com a incerteza em cada coluna, todas iguais na mesma coluna, alinhadas pela vírgula.</li>
          <li><b>Potências de dez no cabeçalho</b> para evitar números enormes: “I (10⁻³ A)” ou, melhor, a unidade com prefixo, “I (mA)”.</li>
          <li><b>Título acima</b> da tabela, numerado e descritivo: “Tabela 1: Período de oscilação em função do comprimento do pêndulo”. Pela ABNT (NBR 14724 e normas do IBGE), a fonte vai abaixo.</li></ol>
          <div class="tab-rolar"><table class="tb"><thead><tr><th>L (m)</th><th>T (s)</th><th>σ<sub>T</sub> (s)</th><th>T² (s²)</th></tr></thead><tbody>
          <tr><td>0,200</td><td>0,898</td><td>0,005</td><td>0,806</td></tr>
          <tr><td>0,400</td><td>1,270</td><td>0,005</td><td>1,613</td></tr>
          <tr><td>0,600</td><td>1,555</td><td>0,006</td><td>2,418</td></tr>
          <tr><td>0,800</td><td>1,795</td><td>0,006</td><td>3,222</td></tr></tbody></table></div>
          <p>Note que a coluna T² é calculada; deixe isso claro na legenda ou numa nota da tabela. Evite linhas verticais e grades pesadas: três linhas horizontais (topo, sob o cabeçalho e base) são o padrão de publicações.</p>`,
      },
      {
        t: "Gráficos: eixos, escalas e barras de erro",
        h: `<p>Escolha dos eixos: a <b>variável independente</b> (a que você controla, como o tempo ou o comprimento) vai no eixo horizontal; a <b>dependente</b> (a que você mede como resposta) vai no vertical. Cada eixo precisa de nome da grandeza e unidade, “T² (s²)”, com marcações em números redondos.</p>
          <ul><li><b>Escala</b>: os dados devem ocupar a maior parte da área. A origem só precisa aparecer se ela tem significado (por exemplo, para checar se a reta passa por zero).</li>
          <li><b>Pontos medidos</b> são marcadores, sem ligar uns aos outros; <b>modelos e ajustes</b> são linhas contínuas. Ligar pontos com segmentos sugere que você sabe o que acontece entre eles.</li>
          <li><b>Barras de erro</b> mostram a incerteza-padrão de cada ponto (diga na legenda se são ±1σ ou um intervalo de 95%). Se forem menores que o marcador, diga isso na legenda.</li>
          <li><b>Escalas logarítmicas</b> são a escolha certa quando os dados cobrem várias ordens de grandeza ou quando você testa uma lei de potência (gráfico log-log).</li>
          <li><b>Legenda abaixo</b> da figura, numerada e completa: o que foi medido, as condições, o que as barras representam e os parâmetros do ajuste com incerteza.</li></ul>
          <p>Para conferir um ajuste, um <b>gráfico de resíduos</b> abaixo do gráfico principal, com o mesmo eixo x, revela padrões que o olho não vê na figura principal.</p>`,
      },
      {
        t: "Erros comuns e exportação para CSV e LaTeX",
        h: `<p>Problemas frequentes em relatórios: números copiados da planilha com 8 casas; colunas sem unidade; gráficos de linha ligando pontos medidos; eixos começando em valores arbitrários sem aviso; cores como única forma de diferenciar séries (inacessível para daltônicos e na impressão em preto e branco; use também marcadores diferentes); gráficos de pizza ou 3D para dados experimentais; e figuras copiadas como imagem de baixa resolução.</p>
          <p><b>CSV e a vírgula decimal</b>: no padrão americano, a vírgula separa colunas e o ponto separa decimais. Em português, a vírgula é decimal, então planilhas brasileiras exportam CSV com <b>ponto e vírgula</b> como separador. Ao abrir um CSV de outra fonte, confira: “1,5” pode virar 15, uma data ou duas colunas. Para trocar dados com programas (Python, R, Origin), prefira o ponto decimal e declare o separador.</p>
          <p><b>LaTeX</b>: a vírgula decimal precisa de chaves em modo matemático, 9{,}81, para não ganhar um espaço extra; o pacote siunitx alinha colunas pela vírgula e formata 9,81 ± 0,10 com a unidade. A ferramenta Tabelas gera esse código pronto, com a vírgula e o número de casas padronizados.</p>
          <p>Por fim, guarde os <b>dados brutos</b> (as medidas como foram anotadas) separados dos tratados. Em iniciação científica e TCC, isso é parte da integridade da pesquisa: qualquer pessoa deve conseguir refazer suas contas.</p>`,
      },
    ],
    formulas: [
      { nome: "Cabeçalho de coluna", eq: `grandeza (unidade) &nbsp;→&nbsp; T (s), &nbsp;I (mA), &nbsp;E (10³ J)`, simbolos: [["grandeza", "símbolo ou nome, em itálico quando é símbolo", "—"], ["unidade", "unidade SI ou com prefixo, entre parênteses", "—"]], obs: "Os números nas células ficam sem unidade. “E (10³ J)” com célula 2,5 significa E = 2,5 × 10³ J." },
      { nome: "Casas decimais de uma coluna", eq: `casas(valor) = casas(incerteza arredondada)`, simbolos: [["incerteza arredondada", "1 algarismo significativo (2 se começar por 1)", "unid. da coluna"]], obs: "Todas as linhas da coluna com o mesmo número de casas, se tiverem a mesma incerteza." },
    ],
    exemplos: [
      {
        t: "consertar uma tabela",
        enunciado: `Um aluno apresentou a coluna “Corrente: 0.0123 A; 0.024567 A; 0.0371 A”, medida com amperímetro de incerteza ± 0,0005 A. Reescreva corretamente.`,
        passos: [
          `Unidade no cabeçalho, com prefixo para evitar zeros: I (mA). A incerteza ± 0,0005 A = ± 0,5 mA.`,
          `Incerteza com 1 algarismo na casa do décimo de mA → valores com 1 casa decimal.`,
          `0,0123 A = 12,3 mA; 0,024567 A = 24,567 mA → 24,6 mA; 0,0371 A = 37,1 mA.`,
          `Vírgula decimal (português) e incerteza no cabeçalho.`,
        ],
        resposta: `Cabeçalho <b>I (mA) ± 0,5</b>, células <b>12,3; 24,6; 37,1</b>`,
      },
      {
        t: "escolher os eixos",
        enunciado: `Você variou o comprimento L de um pêndulo e mediu o período T. Que gráfico fazer para obter g com uma reta?`,
        passos: [
          `Teoria: T = 2π√(L/g) → T² = (4π²/g)·L. Relação linear entre T² e L.`,
          `L é a variável que você controla: eixo x = L (m). Eixo y = T² (s²), com barras de erro σ<sub>T²</sub> = 2T·σ<sub>T</sub>.`,
          `Inclinação a = 4π²/g → g = 4π²/a. Com a tabela acima, a ≈ 4,03 s²/m → g ≈ 39,48/4,03 ≈ 9,80 m/s².`,
          `A reta deve passar perto da origem; um intercepto significativo sugere erro sistemático em L (por exemplo, não medir até o centro da massa).`,
        ],
        resposta: `Gráfico de <b>T² (s²) × L (m)</b>, pontos com barras de erro e reta ajustada; g = 4π²/inclinação.`,
      },
      {
        t: "CSV brasileiro",
        enunciado: `Um colega mandou o arquivo “t;v” com linhas “0,10;1,02” e “0,20;1,94”. Um programa em Python leu tudo como texto. O que aconteceu e como resolver?`,
        passos: [
          `O separador é ponto e vírgula e o decimal é vírgula (padrão brasileiro).`,
          `Leitores no padrão americano esperam vírgula como separador e ponto como decimal; “0,10;1,02” vira uma coluna só, de texto.`,
          `Solução: informar ao leitor separador “;” e decimal “,” (em pandas: sep=";", decimal=","), ou exportar com ponto decimal.`,
        ],
        resposta: `<b>Declare separador e decimal</b> ao ler ou exportar; nunca troque vírgulas por pontos “no olho” em dados com separador de colunas.`,
      },
    ],
    erros: [
      { errado: `Cabeçalho “Tempo” e células “2,3 s”, “4,61 s”, “7,0 s”.`, certo: `Cabeçalho “t (s)” e células 2,30; 4,61; 7,00 (casas coerentes com a incerteza).`, porque: `Unidade nas células polui; casas diferentes na mesma coluna sugerem precisões diferentes que não existem.` },
      { errado: `Ligar os pontos medidos com segmentos de reta (o “gráfico de linhas” padrão da planilha).`, certo: `Pontos isolados com barras de erro, mais a curva do modelo ajustado.`, porque: `Segmentos entre pontos afirmam algo sobre valores que você não mediu.` },
      { errado: `Gráfico sem unidades, com eixos “x” e “y” e título “Gráfico 1”.`, certo: `Eixos “L (m)” e “T² (s²)” e uma legenda descritiva com condições e parâmetros do ajuste.` },
      { errado: `Escrever no relatório o resultado do ajuste copiado: “a = 4,02891736”.`, certo: `“a = (4,03 ± 0,02) s²/m”, com a incerteza dada pelo ajuste e algarismos coerentes.` },
      { errado: `Diferenciar três séries só pela cor (vermelho e verde).`, certo: `Usar também marcadores (círculo, quadrado, triângulo) ou tipos de linha.`, porque: `Cerca de 8% dos homens têm alguma deficiência na visão de cores, e relatórios costumam ser impressos em preto e branco.` },
    ],
    aplicacoes: [
      `<b>Publicação científica</b>: revistas exigem figuras com eixos rotulados, barras de erro definidas e, cada vez mais, os dados brutos em repositório aberto.`,
      `<b>Indústria</b>: laudos de ensaio (tração, composição, calibração) seguem formatos padronizados de tabela com unidade, incerteza e norma de referência.`,
      `<b>Saúde pública</b>: os painéis de casos durante a pandemia de covid-19 mostraram como escalas (linear × log) e médias móveis mudam a leitura de um gráfico.`,
      `<b>Ciência de dados</b>: o formato CSV é a base de troca de dados; erros de separador e de decimal são uma das causas mais comuns de análises erradas.`,
    ],
    teste: [
      { p: `Onde deve ficar a unidade numa tabela de dados?`, op: [`No cabeçalho da coluna, entre parênteses.`, `Em cada célula, ao lado do número.`, `Só no texto do relatório.`, `Na última linha da tabela.`], certa: 0, explica: `A unidade no cabeçalho vale para toda a coluna e deixa as células limpas e alinhadas.` },
      { p: `Num gráfico de dados experimentais com um ajuste, o mais adequado é:`, op: [`ligar os pontos em sequência e dispensar o ajuste.`, `mostrar só a reta ajustada, sem os pontos.`, `mostrar pontos com barras de erro e o modelo como linha contínua.`, `usar barras verticais para cada medida.`], certa: 2, explica: `Os pontos mostram o que foi medido e sua incerteza; a linha mostra o modelo. Ligar pontos inventa dados intermediários; omitir pontos esconde a qualidade do ajuste.` },
      { p: `Uma coluna tem incerteza ± 0,02 cm. Como escrever 12,3 cm nela?`, op: [`12,3`, `12,30`, `12,300`, `12`], certa: 1, explica: `As casas do valor seguem a incerteza: centésimos de cm. 12,30 diz que o centésimo foi medido (e é zero).` },
      { p: `Quando um gráfico log-log é a melhor escolha?`, op: [`Sempre que houver números grandes.`, `Quando a relação é exponencial.`, `Nunca em relatórios de ensino.`, `Para testar uma lei de potência ou quando os dados cobrem várias ordens de grandeza.`], certa: 3, explica: `Uma lei y = A·xᵖ vira reta no log-log, com inclinação p. Uma exponencial vira reta no gráfico semilog (só y em log).` },
      { p: `Por que um CSV brasileiro costuma usar ponto e vírgula como separador?`, op: [`Por exigência da ABNT.`, `Porque a vírgula já é usada como separador decimal.`, `Porque o ponto e vírgula ocupa menos espaço.`, `Por compatibilidade com LaTeX.`], certa: 1, explica: `Com vírgula decimal, usar vírgula também para separar colunas tornaria “1,5,2,3” ambíguo.` },
    ],
    resumo: [
      `Tabelas e gráficos devem ser compreensíveis sozinhos.`,
      `Cabeçalho = grandeza (unidade); incerteza no cabeçalho ou em coluna própria; casas coerentes com a incerteza.`,
      `Título da tabela acima; legenda da figura abaixo, numerada e descritiva.`,
      `Variável controlada no eixo x; pontos com barras de erro; modelo como linha contínua.`,
      `Log-log para leis de potência; semilog para exponenciais.`,
      `CSV: declare separador e decimal; LaTeX: 9{,}81 ou siunitx. Guarde os dados brutos.`,
    ],
    alem: {
      t: "Para ir além: percepção visual e dados reprodutíveis",
      h: `<p>Estudos clássicos de percepção (Cleveland e McGill, 1984) mostraram que avaliamos com mais precisão <b>posições ao longo de uma escala comum</b> do que comprimentos, ângulos, áreas ou cores. Por isso gráficos de pontos e de barras vencem gráficos de pizza, e por isso efeitos 3D, que distorcem posições e áreas, atrapalham. Edward Tufte resumiu isso no princípio da razão dados-tinta: cada traço do gráfico deve carregar informação.</p>
        <p>Barras de erro também enganam: duas médias cujas barras de ±1 erro-padrão <b>não se sobrepõem</b> não são necessariamente diferentes ao nível de 95%, e barras de intervalos de 95% que se sobrepõem um pouco podem indicar diferença significativa. A comparação correta usa a incerteza da diferença, √(u₁² + u₂²). Por isso a legenda deve dizer o que as barras representam.</p>
        <p>Em pesquisa, a tendência é tornar tudo <b>reprodutível</b>: os dados brutos em formato aberto (CSV com metadados), o código que gera tabelas e figuras (Python, R, notebooks) e um caderno de laboratório datado. Assim, qualquer figura do TCC pode ser regenerada a partir dos dados, e um erro encontrado é corrigido em todas as figuras de uma vez.</p>`,
    },
  };
})();
