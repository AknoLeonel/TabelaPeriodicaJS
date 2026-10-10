/*
 * Aulas de Química básica (formato em js/estudo/aula.js):
 * mol, balanceamento, estequiometria, soluções, pH, gases e distribuição eletrônica.
 * Cada aula conversa com a ferramenta de mesmo id em js/estudo/quimica.js.
 */
(function () {
  "use strict";
  const E = window.LAB && window.LAB.estudo;
  if (!E) return;
  const A = (E.aulas.quimica = E.aulas.quimica || {});
  const fr = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;

  // ===========================================================================
  // 1. Mol e conversões
  // ===========================================================================
  A.mol = {
    tempo: 15, nivel: "Ensino médio → faculdade",
    objetivos: [
      "explicar o que é o mol e por que o número de Avogadro é tão grande;",
      "converter massa ↔ mol ↔ número de partículas, sempre passando pelo mol;",
      "calcular o volume de um gás a partir da quantidade em mol (CNTP e condições ambiente);",
      "contar átomos dentro de moléculas e achar a massa de uma única partícula.",
    ],
    requisitos: [{ id: "massa", nome: "Massa molar" }],
    secoes: [
      {
        t: "A ideia em uma frase",
        h: `<p>O <b>mol</b> é uma unidade de <b>contagem</b>, como a dúzia, só que gigantesca: 1 mol = <b>6,022×10²³</b> unidades (o <b>número de Avogadro</b>, N<sub>A</sub>). Com ele, a química conta átomos e moléculas pesando amostras na balança.</p>
          <div class="analogia"><b>Analogia:</b> um banco não conta moedas uma a uma; pesa o saco. Se cada moeda tem 5 g e o saco tem 5 kg, há 1 000 moedas. O mol faz o mesmo com átomos: a massa molar é o “peso do saco padrão” e o N<sub>A</sub> é quantas moedas há nele.</div>
          <p>Por que um número tão grande? Porque átomos são minúsculos: uma molécula de água tem massa de cerca de 3×10⁻²³ g. Para juntar uma quantidade que se vê e se pesa (18 g, um gole), são necessárias 6×10²³ moléculas. Se você contasse uma molécula por segundo, levaria cerca de 2×10¹⁶ anos para contar um único mol, mais de um milhão de vezes a idade do Universo.</p>`,
      },
      {
        t: "O mapa das conversões: tudo passa pelo mol",
        h: `<p>Quase todo problema de quantidade em química é uma viagem entre quatro “cidades”: <b>massa</b> (g), <b>quantidade de matéria</b> (mol), <b>número de partículas</b> e <b>volume de gás</b> (L). O mol é a estação central: de qualquer cidade se chega ao mol, e do mol se chega a qualquer outra.</p>
          <div class="eq">massa ⇄ (÷ M | × M) ⇄ <b>mol</b> ⇄ (× N<sub>A</sub> | ÷ N<sub>A</sub>) ⇄ partículas</div>
          <div class="eq"><b>mol</b> ⇄ (× V<sub>m</sub> | ÷ V<sub>m</sub>) ⇄ volume de gás</div>
          <ol><li><b>Massa → mol</b>: divida pela massa molar (n = m/M).</li>
          <li><b>Mol → partículas</b>: multiplique pelo número de Avogadro (N = n × N<sub>A</sub>).</li>
          <li><b>Mol → volume de gás</b>: multiplique pelo volume molar (V = n × V<sub>m</sub>), que depende da temperatura e da pressão.</li></ol>
          <p>A ferramenta “Mol e conversões” faz exatamente esse caminho: você informa o que tem, ela calcula n e, a partir dele, todas as outras grandezas. Note que a massa e o número de partículas mudam de proporção conforme a substância (a massa molar é diferente), mas o mol é sempre o mesmo pacote.</p>`,
        grafico: {
          op: { altura: 220, modo: "dados", rotX: "n (mol)", rotY: "massa (g)" },
          cena: { x: [0, 3], y: [0, 140], series: [
            { tipo: "funcao", f: (n) => 18.02 * n, rotulo: "H₂O (18,02 g/mol)" },
            { tipo: "funcao", f: (n) => 44.01 * n, rotulo: "CO₂ (44,01 g/mol)" },
            { tipo: "marca", x: 2, y: 36.04, rotulo: "2 mol de água = 36,0 g" },
          ] },
          legenda: "Massa é proporcional ao mol; a inclinação de cada reta é a massa molar. O mesmo 1 mol pesa 18 g de água ou 44 g de gás carbônico.",
        },
      },
      {
        t: "Moléculas, átomos e íons: conte o que foi pedido",
        h: `<p>“1 mol de quê?” é a pergunta que evita metade dos erros. Em <b>1 mol de H₂O</b> há 6,022×10²³ <i>moléculas</i>, mas <b>2 mol de átomos de H</b> (1,204×10²⁴ átomos) e <b>1 mol de átomos de O</b>. Em 1 mol de moléculas de água há 3 mol de átomos no total.</p>
          <p>Para compostos iônicos, falamos em <b>fórmulas unitárias</b>: 1 mol de CaCl₂ fornece 1 mol de Ca²⁺ e 2 mol de Cl⁻ quando dissolvido, ou seja, 3 mol de íons.</p>
          <p>O caminho do mol também dá a <b>massa de uma única partícula</b>: basta dividir a massa molar por N<sub>A</sub>.</p>
          <div class="eq">m(1 molécula de H₂O) = ${fr("18,02 g/mol", "6,022×10²³ mol⁻¹")} ≈ 2,99×10⁻²³ g</div>
          <div class="destaque">Dica de prova: leia o fim da pergunta antes de começar. “Quantos átomos”, “quantas moléculas” e “quantos íons” dão respostas diferentes para a mesma amostra; o fator que falta costuma ser o índice da fórmula.</div>`,
      },
      {
        t: "Volume molar dos gases: CNTP e condições ambiente",
        h: `<p>Pela lei de Avogadro, <b>volumes iguais de gases diferentes</b>, na mesma temperatura e pressão, contêm o <b>mesmo número de moléculas</b>. Logo, 1 mol de qualquer gás (que se comporte como ideal) ocupa o mesmo volume, o <b>volume molar</b> V<sub>m</sub>, que só depende de T e P (vem de V = nRT/P):</p>
          <div class="tab-rolar"><table class="tb"><thead><tr><th>Condição</th><th>T e P</th><th>V<sub>m</sub></th></tr></thead><tbody>
          <tr><td>CNTP (padrão dos livros brasileiros)</td><td>0 °C (273,15 K) e 1 atm</td><td><b>22,4 L/mol</b></td></tr>
          <tr><td>STP atual da IUPAC</td><td>0 °C e 1 bar (100 kPa)</td><td>22,7 L/mol</td></tr>
          <tr><td>Ambiente (CATP / “25 °C e 1 atm”)</td><td>25 °C (298,15 K) e 1 atm</td><td><b>24,5 L/mol</b></td></tr>
          </tbody></table></div>
          <p>Assim, 44 g de CO₂ (1 mol) e 2 g de H₂ (1 mol) ocupam ambos 22,4 L nas CNTP, apesar de o CO₂ ser 22 vezes mais pesado: num gás, as moléculas estão tão afastadas que o tamanho delas quase não conta.</p>
          <div class="nota">O volume molar vale <b>só para gases</b>. 1 mol de água líquida ocupa cerca de 18 mL, não 22,4 L. A ferramenta usa 22,414 L/mol (CNTP); se o problema der outra condição, use V = nRT/P (aula de gases).</div>`,
      },
    ],
    formulas: [
      { nome: "Quantidade de matéria a partir da massa", eq: `n = ${fr("m", "M")}`, simbolos: [["n", "quantidade de matéria", "mol"], ["m", "massa da amostra", "g"], ["M", "massa molar", "g/mol"]], obs: "A ponte mais usada da química: confira se a massa está em gramas." },
      { nome: "Número de partículas", eq: `N = n × N<sub>A</sub>`, simbolos: [["N", "número de partículas (moléculas, átomos, íons)", "—"], ["N<sub>A</sub>", "constante de Avogadro = 6,022×10²³", "mol⁻¹"]], obs: "Multiplique depois pelo índice da fórmula se a pergunta for sobre átomos." },
      { nome: "Volume de gás", eq: `V = n × V<sub>m</sub>`, simbolos: [["V", "volume do gás", "L"], ["V<sub>m</sub>", "volume molar (22,4 L/mol nas CNTP; 24,5 L/mol a 25 °C e 1 atm)", "L/mol"]], obs: "Só para gases. Em outras condições, V = nRT/P." },
    ],
    exemplos: [
      {
        t: "direto",
        enunciado: `Quantos mols e quantas moléculas há em 36 g de água? (M = 18,02 g/mol)`,
        passos: [`Massa → mol: n = m/M = 36 g ÷ 18,02 g/mol = 1,998 mol ≈ 2,00 mol.`, `Mol → moléculas: N = 1,998 mol × 6,022×10²³ mol⁻¹ = 1,203×10²⁴ moléculas.`, `Átomos de H (bônus): 2 por molécula → 2 × 1,203×10²⁴ = 2,41×10²⁴ átomos.`],
        resposta: `<b>≈ 2,0 mol</b> e <b>≈ 1,2×10²⁴ moléculas</b>`,
      },
      {
        t: "partículas → massa e volume",
        enunciado: `Uma amostra contém 3,01×10²³ moléculas de CO₂. Qual a massa e o volume que ela ocupa nas CNTP? (M = 44,01 g/mol)`,
        passos: [`Partículas → mol: n = N/N<sub>A</sub> = 3,01×10²³ ÷ 6,022×10²³ mol⁻¹ = 0,500 mol.`, `Mol → massa: m = n × M = 0,500 mol × 44,01 g/mol = 22,0 g.`, `Mol → volume (CNTP): V = 0,500 mol × 22,4 L/mol = 11,2 L.`],
        resposta: `<b>22,0 g</b> e <b>11,2 L</b> nas CNTP`,
      },
      {
        t: "de prova",
        enunciado: `Quantos átomos de oxigênio há em 4,90 g de ácido sulfúrico, H₂SO₄? (M = 98,08 g/mol)`,
        passos: [`Massa → mol de moléculas: n = 4,90 g ÷ 98,08 g/mol = 0,0500 mol de H₂SO₄.`, `Cada molécula tem 4 átomos de O: n(O) = 4 × 0,0500 = 0,200 mol de átomos de O.`, `Mol → átomos: N = 0,200 mol × 6,022×10²³ mol⁻¹ = 1,20×10²³ átomos.`],
        resposta: `<b>≈ 1,20×10²³ átomos de O</b>`,
      },
    ],
    erros: [
      { errado: `Multiplicar a massa pela massa molar para achar o mol (n = m × M).`, certo: `Dividir: n = m/M. 36 g de água são 36/18 = 2 mol, não 648.`, porque: `Confira pelas unidades: g ÷ (g/mol) = mol. Se a unidade não fecha, a conta está invertida.` },
      { errado: `Responder o número de moléculas quando a pergunta pede átomos.`, certo: `Multiplicar pelo número de átomos daquele elemento na fórmula (2 H em H₂O, 4 O em H₂SO₄).`, porque: `1 mol de moléculas contém vários mols de átomos.` },
      { errado: `Usar 22,4 L/mol para um líquido ou para um gás a 25 °C.`, certo: `22,4 L/mol só para gás a 0 °C e 1 atm; a 25 °C e 1 atm use 24,5 L/mol; para líquidos e sólidos, use a densidade.`, porque: `O volume molar vem de V = nRT/P e depende de T e P.` },
      { errado: `Achar que 1 mol de H₂ e 1 mol de O₂ têm a mesma massa.`, certo: `Têm o mesmo número de moléculas; as massas são 2,016 g e 32,00 g.`, porque: `O mol fixa a contagem, não a massa.` },
    ],
    aplicacoes: [
      `<b>Saúde</b>: exames de sangue informam glicose em mmol/L (milimols por litro); converter para mg/dL exige a massa molar (180,16 g/mol).`,
      `<b>Airbag</b>: a quantidade de azida de sódio é calculada para gerar, em mol, o volume de N₂ que enche a bolsa em cerca de 30 ms.`,
      `<b>Indústria</b>: reatores trabalham com vazões em kmol/h, porque é o número de moléculas, e não a massa, que define quanto reage.`,
      `<b>Meio ambiente</b>: emissões de CO₂ em toneladas viram mol para estimar volumes de gás e balanços de carbono.`,
    ],
    teste: [
      { p: `O que 1 mol de ferro e 1 mol de alumínio têm em comum?`, op: [`A mesma massa.`, `O mesmo número de átomos.`, `O mesmo volume.`, `A mesma densidade.`], certa: 1, explica: `Mol é contagem: os dois têm 6,022×10²³ átomos. As massas (55,85 g e 26,98 g) e os volumes são diferentes.` },
      { p: `Quantos mols de átomos há em 1 mol de moléculas de C₆H₁₂O₆ (glicose)?`, op: [`1`, `6`, `12`, `24`], certa: 3, explica: `Cada molécula tem 6 + 12 + 6 = 24 átomos, então 1 mol de moléculas contém 24 mol de átomos.` },
      { p: `Nas mesmas T e P, 1 L de H₂ e 1 L de CO₂ contêm…`, op: [`o mesmo número de moléculas.`, `a mesma massa.`, `mais moléculas de CO₂, que é maior.`, `mais moléculas de H₂, que é menor.`], certa: 0, explica: `Lei de Avogadro: volumes iguais de gases nas mesmas condições têm o mesmo número de moléculas, qualquer que seja o gás.` },
      { p: `Por que 18 g de água líquida NÃO ocupam 22,4 L a 0 °C e 1 atm?`, op: [`Porque a água tem massa molar baixa.`, `Porque 18 g não é 1 mol.`, `Porque o volume molar de 22,4 L vale só para gases; no líquido as moléculas estão encostadas.`, `Porque a 0 °C a água ferve.`], certa: 2, explica: `No gás, o volume é quase todo espaço vazio e não depende da molécula. No líquido, ele depende do tamanho e do empacotamento: 18 g de água ocupam cerca de 18 mL.` },
      { p: `Qual destas amostras tem MAIS moléculas? (H₂O = 18; CO₂ = 44; O₂ = 32 g/mol)`, op: [`44 g de CO₂`, `32 g de O₂`, `36 g de H₂O`, `Todas têm o mesmo número.`], certa: 2, explica: `Converta para mol: 44 g de CO₂ = 1 mol; 32 g de O₂ = 1 mol; 36 g de H₂O = 2 mol. Mais mol, mais moléculas.` },
    ],
    resumo: [
      `1 mol = 6,022×10²³ partículas (constante de Avogadro).`,
      `n = m/M: divida a massa pela massa molar.`,
      `N = n × N<sub>A</sub>; para átomos, multiplique também pelo índice da fórmula.`,
      `Gases: V = n × V<sub>m</sub>, com 22,4 L/mol nas CNTP (0 °C, 1 atm) e 24,5 L/mol a 25 °C e 1 atm.`,
      `Sempre passe pelo mol: massa → mol → partículas ou volume.`,
      `Pergunte sempre “mol de quê?”: moléculas, átomos ou íons.`,
    ],
    alem: {
      t: "Para ir além: o mol depois de 2019",
      h: `<p>Até 2019 o mol era definido como a quantidade de entidades contidas em exatamente 12 g de carbono-12; o número de Avogadro era <i>medido</i>. Na redefinição do SI, a lógica se inverteu: N<sub>A</sub> passou a ser <b>exato</b>, 6,02214076×10²³ mol⁻¹, e o mol virou simplesmente “esse número de entidades”.</p>
        <p>Como se mediu esse número com tanta precisão? O projeto Avogadro construiu esferas quase perfeitas de silício-28 monocristalino (cerca de 1 kg). Conhecendo o volume da esfera (medido por interferometria), o espaçamento entre átomos no cristal (por difração de raios X) e a massa, contam-se os átomos com incerteza de algumas partes em 10⁸.</p>
        <p>Há também um parente próximo: a <b>constante de Faraday</b>, F = N<sub>A</sub> × e ≈ 96 485 C/mol, que é a carga de 1 mol de elétrons. Ela liga o mol à eletricidade e aparece em eletroquímica (galvanoplastia, baterias). E a <b>constante dos gases</b> R = N<sub>A</sub> × k<sub>B</sub> liga o mol à energia térmica de uma molécula: a química macroscópica é a física molecular multiplicada por N<sub>A</sub>.</p>`,
    },
  };

  // ===========================================================================
  // 2. Balanceamento de equações
  // ===========================================================================
  A.balancear = {
    tempo: 15, nivel: "Ensino médio → faculdade",
    objetivos: [
      "explicar por que uma equação química precisa ser balanceada (conservação dos átomos e da carga);",
      "balancear equações pelo método das tentativas, escolhendo a ordem certa dos elementos;",
      "montar e resolver o sistema do método algébrico quando a tentativa emperra;",
      "conferir um balanceamento contando átomos e carga dos dois lados.",
    ],
    secoes: [
      {
        t: "A ideia em uma frase",
        h: `<p>Numa reação química os átomos <b>não são criados nem destruídos</b>, apenas trocam de parceiros. Balancear é escolher quantas unidades de cada substância participam para que <b>cada elemento apareça na mesma quantidade</b> dos dois lados da seta.</p>
          <div class="analogia"><b>Analogia:</b> pense em peças de Lego. Você desmonta carrinhos e monta casinhas; pode mudar a forma, mas o número de peças vermelhas, azuis e amarelas no fim é o mesmo do começo. Os coeficientes dizem quantos carrinhos desmontar e quantas casinhas montar.</div>
          <p>Esse é o princípio de <b>Lavoisier</b> (conservação da massa, 1789). Se cada átomo se conserva, a massa total também se conserva. Uma equação desbalanceada descreve uma reação impossível e, pior, dá proporções erradas para tudo o que vem depois: estequiometria, rendimento, custo de reagentes.</p>`,
      },
      {
        t: "Coeficientes, não índices",
        h: `<p>Numa fórmula como H₂O, o <b>índice</b> 2 faz parte da identidade da substância: H₂O é água, H₂O₂ é água oxigenada, outra substância. Por isso, ao balancear, só se mexe nos <b>coeficientes</b>, os números escritos na frente das fórmulas.</p>
          <div class="eq">2 H₂ + O₂ → 2 H₂O</div>
          <p>Leia assim: “2 moléculas de H₂ reagem com 1 molécula de O₂ formando 2 moléculas de H₂O”, ou, em escala de laboratório, “2 mol de H₂ com 1 mol de O₂ formam 2 mol de H₂O”. O coeficiente 1 não se escreve.</p>
          <p>Convenção: usam-se os <b>menores números inteiros</b> possíveis. 4 H₂ + 2 O₂ → 4 H₂O está correto em proporção, mas não está simplificado. Frações (como ½ O₂) são aceitas em termoquímica, quando se quer a energia “por mol de produto”.</p>
          <div class="nota">Em equações com íons, além dos átomos, a <b>carga total</b> tem de ser a mesma dos dois lados. Exemplo: Cu + 2 Ag⁺ → Cu²⁺ + 2 Ag (carga +2 à esquerda e +2 à direita).</div>`,
      },
      {
        t: "Método das tentativas, com ordem",
        h: `<p>“Tentativa” não quer dizer chute. Há uma ordem que quase sempre funciona:</p>
          <ol><li>Comece pelo elemento que aparece em <b>uma só substância de cada lado</b> e que tem o maior índice (em geral, metais e depois o carbono).</li>
          <li>Depois ajuste os <b>não metais</b> que não sejam H nem O.</li>
          <li>Deixe <b>H</b> e, por último, <b>O</b>, que costumam aparecer em várias substâncias.</li>
          <li>Se sobrar fração, multiplique a equação inteira pelo denominador.</li>
          <li><b>Confira</b> contando todos os elementos.</li></ol>
          <p>Combustão do propano: C₃H₈ + O₂ → CO₂ + H₂O. Carbono: 3 C à esquerda → 3 CO₂. Hidrogênio: 8 H → 4 H₂O. Oxigênio à direita: 3 × 2 + 4 × 1 = 10 átomos → 5 O₂.</p>
          <div class="eq">C₃H₈ + 5 O₂ → 3 CO₂ + 4 H₂O</div>
          <p>Em combustões de hidrocarbonetos o oxigênio fica sempre para o fim, porque ele é o único que aparece em dois produtos.</p>`,
      },
      {
        t: "Método algébrico: quando a tentativa emperra",
        h: `<p>Dê uma letra para cada coeficiente e escreva <b>uma equação por elemento</b> (átomos à esquerda = átomos à direita). É o que a ferramenta “Balancear equações” faz e mostra passo a passo.</p>
          <p>Exemplo: a Fe₂O₃ + b CO → c Fe + d CO₂</p>
          <div class="tab-rolar"><table class="tb"><thead><tr><th>Elemento</th><th>Equação</th></tr></thead><tbody>
          <tr><td>Fe</td><td>2a = c</td></tr><tr><td>C</td><td>b = d</td></tr><tr><td>O</td><td>3a + b = 2d</td></tr></tbody></table></div>
          <p>Faça a = 1. Então c = 2. Substituindo d = b na equação do O: 3 + b = 2b, logo b = 3 e d = 3.</p>
          <div class="eq">Fe₂O₃ + 3 CO → 2 Fe + 3 CO₂</div>
          <p>Há sempre uma incógnita a mais que o necessário, porque a equação só fixa <b>proporções</b>: por isso se escolhe uma letra valendo 1 e, no fim, multiplica-se tudo para obter os menores inteiros. Se o sistema tiver mais de uma família de soluções, a “equação” é na verdade a soma de duas reações independentes, e a ferramenta avisa.</p>`,
      },
      {
        t: "Conferência: o passo que ninguém deveria pular",
        h: `<p>Monte uma tabelinha com cada elemento, os átomos nos reagentes e nos produtos. Lembre que o coeficiente multiplica <b>todos</b> os átomos da fórmula, inclusive os que estão em parênteses:</p>
          <div class="eq">3 Ca(OH)₂ + 2 H₃PO₄ → Ca₃(PO₄)₂ + 6 H₂O</div>
          <div class="tab-rolar"><table class="tb"><thead><tr><th>Elemento</th><th>Reagentes</th><th>Produtos</th></tr></thead><tbody>
          <tr><td>Ca</td><td>3 × 1 = 3</td><td>3</td></tr>
          <tr><td>P</td><td>2 × 1 = 2</td><td>2 × 1 = 2</td></tr>
          <tr><td>O</td><td>3 × 2 + 2 × 4 = 14</td><td>2 × 4 + 6 × 1 = 14</td></tr>
          <tr><td>H</td><td>3 × 2 + 2 × 3 = 12</td><td>6 × 2 = 12</td></tr></tbody></table></div>
          <p>Truque para neutralizações: trate grupos que passam intactos (PO₄, SO₄, NO₃) como um bloco só. Aqui, “2 PO₄ de cada lado” resolve P e parte do O de uma vez.</p>`,
      },
    ],
    formulas: [
      { nome: "Conservação dos átomos", eq: `Σ (coeficiente × índice)<sub>reagentes</sub> = Σ (coeficiente × índice)<sub>produtos</sub>`, simbolos: [["coeficiente", "número na frente da fórmula", "—"], ["índice", "quantos átomos do elemento há na fórmula", "—"]], obs: "Vale para cada elemento separadamente." },
      { nome: "Conservação da carga", eq: `Σ cargas<sub>reagentes</sub> = Σ cargas<sub>produtos</sub>`, simbolos: [["carga", "coeficiente × carga de cada íon", "—"]], obs: "Obrigatória em equações iônicas e de oxirredução." },
    ],
    exemplos: [
      {
        t: "direto",
        enunciado: `Balanceie a combustão do metano: CH₄ + O₂ → CO₂ + H₂O.`,
        passos: [`C: 1 de cada lado. Coeficiente 1 no CH₄ e no CO₂.`, `H: 4 à esquerda → 2 H₂O à direita (2 × 2 = 4).`, `O à direita: 1 × 2 + 2 × 1 = 4 átomos → 2 O₂ à esquerda.`, `Conferir: C 1 = 1; H 4 = 4; O 4 = 4.`],
        resposta: `<b>CH₄ + 2 O₂ → CO₂ + 2 H₂O</b>`,
      },
      {
        t: "com fração",
        enunciado: `Balanceie a combustão do etano: C₂H₆ + O₂ → CO₂ + H₂O.`,
        passos: [`C: 2 → 2 CO₂. H: 6 → 3 H₂O.`, `O à direita: 2 × 2 + 3 × 1 = 7 átomos → 7/2 O₂.`, `Eliminar a fração: multiplicar tudo por 2.`, `Conferir: C 4 = 4; H 12 = 12; O 14 = 4 × 2 + 6 × 1 = 14.`],
        resposta: `<b>2 C₂H₆ + 7 O₂ → 4 CO₂ + 6 H₂O</b>`,
      },
      {
        t: "de prova",
        enunciado: `Balanceie pelo método algébrico: Al + O₂ → Al₂O₃.`,
        passos: [`Letras: a Al + b O₂ → c Al₂O₃.`, `Al: a = 2c. O: 2b = 3c.`, `Fazendo c = 1: a = 2 e b = 3/2.`, `Multiplicar por 2: a = 4, b = 3, c = 2. Conferir: Al 4 = 4; O 6 = 6.`],
        resposta: `<b>4 Al + 3 O₂ → 2 Al₂O₃</b>`,
      },
    ],
    erros: [
      { errado: `Mudar o índice para fechar a conta: H₂ + O₂ → H₂O₂.`, certo: `Mudar só coeficientes: 2 H₂ + O₂ → 2 H₂O.`, porque: `H₂O₂ é outra substância (água oxigenada). Mexer no índice muda a reação.` },
      { errado: `Esquecer que o coeficiente multiplica o parêntese: em 3 Ca(OH)₂, contar 3 O.`, certo: `3 × 2 = 6 O e 6 H.`, porque: `O coeficiente multiplica a fórmula inteira, e o índice do parêntese multiplica o que está dentro.` },
      { errado: `Começar pelo oxigênio numa combustão.`, certo: `Acertar C e H primeiro; O por último.`, porque: `O aparece em vários produtos; fixá-lo cedo obriga a refazer tudo depois.` },
      { errado: `Achar que a equação está balanceada porque “o número de moléculas” é igual nos dois lados.`, certo: `O que se conserva são os átomos de cada elemento (e a carga), não o número de moléculas.`, porque: `2 H₂ + O₂ → 2 H₂O tem 3 moléculas à esquerda e 2 à direita, e está correta.` },
    ],
    aplicacoes: [
      `<b>Motores</b>: a razão ar/combustível ideal da gasolina (≈ 14,7 : 1 em massa) sai da equação balanceada da combustão.`,
      `<b>Siderurgia</b>: Fe₂O₃ + 3 CO → 2 Fe + 3 CO₂ define quanto carvão é necessário por tonelada de ferro.`,
      `<b>Tratamento de água</b>: a dose de cal ou de sulfato de alumínio é calculada a partir de reações balanceadas.`,
      `<b>Farmácia</b>: o antiácido de hidróxido de magnésio neutraliza HCl na proporção Mg(OH)₂ + 2 HCl → MgCl₂ + 2 H₂O.`,
    ],
    teste: [
      { p: `Por que não se pode balancear H₂ + O₂ → H₂O trocando H₂O por H₂O₂?`, op: [`Porque H₂O₂ não existe.`, `Porque mudaria a substância formada: seria outra reação.`, `Porque a massa não se conservaria.`, `Porque frações não são permitidas.`], certa: 1, explica: `Os índices definem a substância. H₂O₂ existe (água oxigenada), mas não é o produto dessa reação.` },
      { p: `Em 2 Al₂(SO₄)₃, quantos átomos de oxigênio há?`, op: [`12`, `8`, `24`, `14`], certa: 2, explica: `Cada fórmula tem 3 × 4 = 12 O; duas fórmulas têm 24.` },
      { p: `Qual grandeza NÃO precisa ser igual dos dois lados de uma equação balanceada?`, op: [`Número de átomos de cada elemento.`, `Massa total.`, `Carga elétrica total.`, `Número total de moléculas.`], certa: 3, explica: `Moléculas podem se juntar ou se partir (2 H₂ + O₂ → 2 H₂O: 3 → 2). Átomos, massa e carga se conservam.` },
      { p: `No método algébrico, por que se pode fixar um coeficiente em 1?`, op: [`Porque a equação só determina proporções entre os coeficientes.`, `Porque o primeiro reagente sempre tem coeficiente 1.`, `Porque o sistema sempre tem mais equações que incógnitas.`, `Porque o 1 nunca se escreve.`], certa: 0, explica: `Se (1, 3, 2, 3) é solução, (2, 6, 4, 6) também é. Fixar uma letra escolhe uma escala; depois se ajusta para os menores inteiros.` },
      { p: `A equação Fe³⁺ + Cu → Fe²⁺ + Cu²⁺ está com átomos iguais dos dois lados. Ela está balanceada?`, op: [`Sim, os átomos batem.`, `Não: a carga é +3 à esquerda e +4 à direita; o certo é 2 Fe³⁺ + Cu → 2 Fe²⁺ + Cu²⁺.`, `Não, falta água.`, `Sim, carga não importa.`], certa: 1, explica: `Em equações iônicas, a carga também se conserva: com 2 Fe³⁺ e 2 Fe²⁺, a carga fica +6 dos dois lados.` },
    ],
    resumo: [
      `Átomos não se criam nem se destroem: cada elemento tem a mesma quantidade nos dois lados.`,
      `Mude só os coeficientes, nunca os índices.`,
      `Tentativas: metais, depois não metais, depois H e por último O.`,
      `Algébrico: uma letra por substância, uma equação por elemento, fixe uma letra em 1.`,
      `Use os menores inteiros; elimine frações multiplicando tudo.`,
      `Em equações iônicas, a carga total também se conserva.`,
      `Sempre confira com uma tabela de átomos.`,
    ],
    alem: {
      t: "Para ir além: álgebra linear e oxirredução",
      h: `<p>O método algébrico é um <b>sistema linear homogêneo</b>: monta-se a matriz de composição (linhas = elementos, colunas = substâncias, com sinal negativo para os produtos) e procura-se o seu <b>núcleo</b>. Se o núcleo tem dimensão 1, a reação tem balanceamento único (a menos de escala). Se tem dimensão 2 ou mais, a “equação” mistura reações independentes e existem infinitos balanceamentos válidos, um problema real em química de combustão e atmosférica.</p>
        <p>Equações de <b>oxirredução</b> grandes ficam mais fáceis pelo método do número de oxidação: os elétrons perdidos por quem se oxida têm de ser iguais aos ganhos por quem se reduz. Exemplo clássico:</p>
        <div class="eq">2 KMnO₄ + 16 HCl → 2 KCl + 2 MnCl₂ + 5 Cl₂ + 8 H₂O</div>
        <p>O Mn vai de +7 a +2 (ganha 5 e⁻); cada Cl que vira Cl₂ vai de −1 a 0 (perde 1 e⁻). Para 2 Mn (10 e⁻ ganhos) são necessários 10 Cl oxidados, isto é, 5 Cl₂. O resto sai por contagem. Confira: Cl à esquerda 16; à direita 2 + 4 + 10 = 16.</p>`,
    },
  };

  // ===========================================================================
  // 3. Estequiometria
  // ===========================================================================
  A.estequiometria = {
    tempo: 20, nivel: "Ensino médio → faculdade",
    objetivos: [
      "usar os coeficientes da equação balanceada como proporção em mol;",
      "calcular massa, mol ou volume de um produto a partir de um reagente;",
      "identificar o reagente limitante e calcular o excesso que sobra;",
      "aplicar rendimento e pureza a problemas reais.",
    ],
    requisitos: [{ id: "mol", nome: "Mol e conversões" }, { id: "balancear", nome: "Balanceamento de equações" }],
    secoes: [
      {
        t: "A ideia em uma frase",
        h: `<p>A equação balanceada é uma <b>receita</b>: os coeficientes dizem em que <b>proporção de mol</b> os reagentes se combinam e os produtos se formam. Estequiometria é usar essa receita para responder “quanto”.</p>
          <div class="analogia"><b>Analogia:</b> a receita diz 2 ovos para 1 xícara de farinha, rendendo 1 bolo. Com 6 ovos e 2 xícaras, você faz 2 bolos (a farinha acaba primeiro) e sobram 2 ovos. A farinha é o <b>reagente limitante</b>; os ovos estão em <b>excesso</b>.</div>
          <p>O ponto crucial: a receita está em <b>mol</b>, não em gramas. Em N₂ + 3 H₂ → 2 NH₃, 1 mol de N₂ reage com 3 mol de H₂; em massa, isso é 28 g de N₂ para 6 g de H₂, proporção que não aparece nos coeficientes.</p>`,
      },
      {
        t: "O roteiro em três passos",
        h: `<p>Todo problema de estequiometria segue o mesmo caminho, como na ferramenta “Estequiometria”:</p>
          <ol><li><b>Ida</b>: converta o dado para mol (n = m/M, n = V/V<sub>m</sub> ou n = C × V).</li>
          <li><b>Ponte</b>: use a proporção dos coeficientes para passar do mol do dado para o mol do que se pede.</li>
          <li><b>Volta</b>: converta o mol pedido para a unidade pedida (g, L, partículas).</li></ol>
          <div class="eq">n<sub>pedido</sub> = n<sub>dado</sub> × ${fr("coeficiente do pedido", "coeficiente do dado")}</div>
          <p>Exemplo: quantos mols de NH₃ se formam com 6 mol de H₂? Pela receita, 3 H₂ → 2 NH₃, então n(NH₃) = 6 × 2/3 = 4 mol. Atalho útil: a razão n/coeficiente é a mesma para todas as substâncias que reagem por completo; aqui, 6/3 = 4/2 = 2 “rodadas da receita”.</p>
          <div class="nota">Antes de tudo, a equação tem de estar <b>balanceada</b>. Com coeficientes errados, todas as contas seguintes saem erradas, mesmo com aritmética perfeita.</div>`,
      },
      {
        t: "Reagente limitante e reagente em excesso",
        h: `<p>Quando se informam as quantidades de <b>dois ou mais reagentes</b>, quase nunca eles estão na proporção exata. Um deles acaba primeiro: é o <b>limitante</b>, e é ele que decide quanto produto se forma. O outro sobra.</p>
          <p>Teste rápido: divida o mol de cada reagente pelo seu coeficiente. O <b>menor quociente</b> indica o limitante (ele permite menos “rodadas da receita”).</p>
          <p>No gráfico, 2,0 mol de H₂ reagem com quantidades crescentes de O₂ em 2 H₂ + O₂ → 2 H₂O. Enquanto há pouco O₂, ele é o limitante e a água cresce em linha reta. A partir de 1,0 mol de O₂ (a proporção exata), o H₂ passa a limitar e a água para em 2,0 mol: O₂ extra só sobra.</p>`,
        grafico: {
          op: { altura: 220, modo: "dados", rotX: "n(O₂) adicionado (mol)", rotY: "n(H₂O) (mol)" },
          cena: { x: [0, 2], y: [0, 2.5], series: [
            { tipo: "linha", pts: [[0, 0], [1, 2], [2, 2]], rotulo: "H₂O formada" },
            { tipo: "vline", v: 1, tracejado: true, rotulo: "proporção exata" },
            { tipo: "texto", x: 0.45, y: 1.6, texto: "O₂ limitante" },
            { tipo: "texto", x: 1.5, y: 2.25, texto: "H₂ limitante" },
          ] },
          legenda: "Com 2,0 mol de H₂ fixos, a água formada cresce com o O₂ até 1,0 mol de O₂; depois o H₂ acaba e o produto não aumenta mais.",
        },
      },
      {
        t: "Pureza e rendimento: o mundo real",
        h: `<p><b>Pureza</b>: reagentes reais têm impurezas. Um calcário com 80% de CaCO₃ tem só 80 g de CaCO₃ em cada 100 g. Aplique a pureza <b>no começo</b>, antes de converter para mol:</p>
          <div class="eq">m<sub>puro</sub> = m<sub>amostra</sub> × ${fr("pureza (%)", "100")}</div>
          <p><b>Rendimento</b>: a reação raramente produz tudo o que a conta prevê (reações incompletas, perdas na filtração, reações paralelas). O valor calculado pela estequiometria é o <b>rendimento teórico</b>; o que se obtém de fato é o <b>real</b>. Aplique o rendimento <b>no fim</b>, sobre o produto:</p>
          <div class="eq">rendimento (%) = ${fr("quantidade real", "quantidade teórica")} × 100</div>
          <p>Rendimento e pureza se aplicam em lugares diferentes da conta, mas ambos <b>multiplicam</b> (por um número menor que 1). Se o problema pede “quanto reagente é preciso” para obter certo produto, a lógica se inverte e você <b>divide</b> pelo rendimento e pela pureza (precisa de mais reagente).</p>`,
      },
    ],
    formulas: [
      { nome: "Proporção estequiométrica", eq: `${fr("n<sub>A</sub>", "a")} = ${fr("n<sub>B</sub>", "b")}`, simbolos: [["n<sub>A</sub>, n<sub>B</sub>", "quantidades de A e B que reagem ou se formam", "mol"], ["a, b", "coeficientes de A e B na equação balanceada", "—"]], obs: "Só vale em mol (ou em volume de gases nas mesmas T e P), nunca direto em gramas." },
      { nome: "Rendimento", eq: `η = ${fr("real", "teórico")} × 100%`, simbolos: [["η", "rendimento percentual", "%"], ["teórico", "quantidade calculada pelo limitante", "g ou mol"]], obs: "Real = teórico × η/100." },
      { nome: "Pureza", eq: `m<sub>puro</sub> = m<sub>amostra</sub> × p/100`, simbolos: [["p", "teor do reagente na amostra", "%"]], obs: "Aplique antes de converter a massa do reagente para mol." },
    ],
    exemplos: [
      {
        t: "direto",
        enunciado: `Quantos gramas de amônia se formam a partir de 56,0 g de N₂, com H₂ em excesso? N₂ + 3 H₂ → 2 NH₃ (N₂ = 28,02; NH₃ = 17,03 g/mol)`,
        passos: [`Ida: n(N₂) = 56,0 g ÷ 28,02 g/mol = 2,00 mol.`, `Ponte: 1 N₂ → 2 NH₃, então n(NH₃) = 2,00 × 2/1 = 4,00 mol.`, `Volta: m = 4,00 mol × 17,03 g/mol = 68,1 g.`],
        resposta: `<b>≈ 68,1 g de NH₃</b>`,
      },
      {
        t: "reagente limitante",
        enunciado: `Misturam-se 10,0 g de H₂ e 64,0 g de O₂, que reagem formando água: 2 H₂ + O₂ → 2 H₂O. Qual o limitante, quanto de água se forma e quanto sobra do excesso? (H₂ = 2,016; O₂ = 32,00; H₂O = 18,02 g/mol)`,
        passos: [`Para mol: n(H₂) = 10,0 ÷ 2,016 = 4,96 mol; n(O₂) = 64,0 ÷ 32,00 = 2,00 mol.`, `Dividir pelos coeficientes: H₂ → 4,96/2 = 2,48; O₂ → 2,00/1 = 2,00. Menor: O₂ é o limitante.`, `Produto: n(H₂O) = 2 × n(O₂) = 4,00 mol → m = 4,00 × 18,02 = 72,1 g.`, `H₂ consumido: 2 × 2,00 = 4,00 mol = 4,00 × 2,016 = 8,06 g. Sobra: 10,0 − 8,06 = 1,94 g de H₂.`, `Conferir a massa: 64,0 + 8,06 = 72,1 g de água. ✓`],
        resposta: `Limitante: <b>O₂</b>; forma <b>72,1 g de H₂O</b>; sobram <b>1,94 g de H₂</b>`,
      },
      {
        t: "de prova (pureza + rendimento)",
        enunciado: `Aquecem-se 200 g de calcário com 80,0% de CaCO₃: CaCO₃ → CaO + CO₂. Com rendimento de 90,0%, quantos gramas de cal (CaO) se obtêm? (CaCO₃ = 100,09; CaO = 56,08 g/mol)`,
        passos: [`Pureza (no começo): m(CaCO₃) = 200 g × 0,800 = 160 g.`, `Ida: n(CaCO₃) = 160 ÷ 100,09 = 1,599 mol.`, `Ponte 1 : 1 → n(CaO) = 1,599 mol; teórico: 1,599 × 56,08 = 89,7 g.`, `Rendimento (no fim): 89,7 g × 0,900 = 80,7 g.`],
        resposta: `<b>≈ 80,7 g de CaO</b>`,
      },
    ],
    erros: [
      { errado: `Usar os coeficientes como proporção em massa: “1 g de N₂ dá 2 g de NH₃”.`, certo: `Coeficientes são proporção em mol. Converta para mol, aplique a proporção e volte para gramas.`, porque: `Cada substância tem uma massa molar diferente.` },
      { errado: `Escolher como limitante o reagente com menor massa (ou menor número de mols).`, certo: `Compare n/coeficiente; o menor quociente é o limitante.`, porque: `10 g de H₂ é menos massa que 64 g de O₂, mas o H₂ está em excesso: ele tem massa molar pequena e a receita pede 2 H₂ por O₂.` },
      { errado: `Calcular o produto a partir do reagente em excesso.`, certo: `Calcular sempre a partir do limitante.`, porque: `O excesso não reage todo; usá-lo superestima o produto.` },
      { errado: `Aplicar o rendimento ao reagente, dividindo, quando se quer o produto.`, certo: `Para achar o produto real, multiplique o teórico pelo rendimento. Para achar o reagente necessário, divida.`, porque: `Rendimento menor sempre significa menos produto ou mais reagente necessário; confira se o seu resultado vai nessa direção.` },
    ],
    aplicacoes: [
      `<b>Fertilizantes</b>: o processo Haber-Bosch (N₂ + 3 H₂ → 2 NH₃) produz cerca de 150 milhões de toneladas de amônia por ano, e cada tonelada é planejada por estequiometria.`,
      `<b>Farmácia</b>: na síntese da aspirina, o anidrido acético é usado em excesso para garantir que o ácido salicílico (mais caro) seja o limitante.`,
      `<b>Cimento e cal</b>: a calcinação do calcário (CaCO₃ → CaO + CO₂) libera cerca de 0,44 t de CO₂ por tonelada de CaCO₃, número central nas contas de emissões.`,
      `<b>Motores</b>: mistura “pobre” (excesso de ar) ou “rica” (excesso de combustível) é a linguagem do reagente limitante aplicada à combustão.`,
    ],
    teste: [
      { p: `Em N₂ + 3 H₂ → 2 NH₃, o que os coeficientes 1 : 3 : 2 representam?`, op: [`Proporção em massa.`, `Proporção em mol (ou em moléculas).`, `Proporção em volume de líquidos.`, `Número de átomos de cada substância.`], certa: 1, explica: `Coeficientes contam partículas, logo mols. Para gases nas mesmas T e P, também volumes, mas nunca massas.` },
      { p: `Com 3 mol de A e 3 mol de B em A + 2 B → C, qual é o limitante?`, op: [`A, porque aparece primeiro.`, `Nenhum, as quantidades são iguais.`, `B, porque 3/2 = 1,5 &lt; 3/1 = 3.`, `A, porque tem coeficiente menor.`], certa: 2, explica: `B permite só 1,5 “rodadas da receita”; A permitiria 3. B acaba primeiro.` },
      { p: `O rendimento de uma reação deu 112%. O que isso provavelmente indica?`, op: [`A reação foi muito eficiente.`, `O produto está impuro ou úmido (ou houve erro de cálculo).`, `O reagente em excesso também virou produto.`, `É normal em reações rápidas.`], certa: 1, explica: `A massa não se cria: acima de 100% indica água, solvente ou impurezas no produto pesado, ou conta feita com o reagente errado.` },
      { p: `Numa amostra de minério com 60% de pureza, onde a pureza entra na conta?`, op: [`No começo: multiplica-se a massa da amostra por 0,60 antes de converter para mol.`, `No fim: multiplica-se o produto por 0,60.`, `Divide-se a massa molar por 0,60.`, `Não entra, pois a impureza não reage.`], certa: 0, explica: `Só a parte pura reage. Corrige-se a massa do reagente antes de tudo; o rendimento é que entra no fim.` },
      { p: `Ao adicionar mais do reagente que está em excesso, a quantidade de produto…`, op: [`aumenta na mesma proporção.`, `diminui.`, `dobra.`, `não muda, porque o limitante continua o mesmo.`], certa: 3, explica: `O produto é decidido pelo limitante. Mais excesso só aumenta a sobra (o patamar do gráfico).` },
    ],
    resumo: [
      `A equação balanceada dá a proporção em mol: n<sub>A</sub>/a = n<sub>B</sub>/b.`,
      `Roteiro: dado → mol → proporção → mol pedido → unidade pedida.`,
      `Limitante: menor n/coeficiente; o produto se calcula sempre por ele.`,
      `Excesso que sobra = inicial − consumido pela proporção.`,
      `Pureza entra no começo (multiplica a amostra); rendimento entra no fim (multiplica o produto).`,
      `Confira com a conservação da massa.`,
    ],
    alem: {
      t: "Para ir além: avanço de reação e economia atômica",
      h: `<p>Em engenharia química usa-se o <b>avanço da reação</b>, ξ (em mol): cada substância varia de n<sub>i</sub> = n<sub>i,0</sub> + ν<sub>i</sub> ξ, com ν negativo para reagentes e positivo para produtos. O limitante é o reagente que zera primeiro, ou seja, ξ<sub>máx</sub> = mínimo de n<sub>i,0</sub>/|ν<sub>i</sub>|. É o mesmo teste do “menor quociente”, escrito de forma geral, e é a variável natural para tratar equilíbrio químico (nem todo reagente chega a zero).</p>
        <p>A química verde acrescenta a <b>economia atômica</b>: a fração da massa dos reagentes que acaba no produto desejado. Na calcinação do calcário, mesmo com rendimento de 100%, só 56,08/100,09 ≈ 56% da massa vira cal; o resto sai como CO₂. Rendimento alto não significa processo limpo: uma síntese pode ter 95% de rendimento e gerar quilos de subproduto por quilo de remédio. Indústrias farmacêuticas acompanham o <b>fator E</b> (kg de resíduo por kg de produto), que costuma ficar entre 25 e 100.</p>`,
    },
  };

  // ===========================================================================
  // 4. Soluções
  // ===========================================================================
  A.solucoes = {
    tempo: 20, nivel: "Ensino médio → faculdade",
    objetivos: [
      "distinguir e calcular concentração comum (g/L), molaridade (mol/L), título, porcentagem e ppm;",
      "converter entre essas unidades usando massa molar e densidade;",
      "resolver diluições com C₁V₁ = C₂V₂ e calcular quanto solvente adicionar;",
      "calcular a concentração final ao misturar soluções do mesmo soluto.",
    ],
    requisitos: [{ id: "mol", nome: "Mol e conversões" }],
    secoes: [
      {
        t: "A ideia em uma frase",
        h: `<p>Uma <b>solução</b> é uma mistura homogênea de um <b>soluto</b> (o que se dissolve) num <b>solvente</b> (quase sempre a água). <b>Concentração</b> é a resposta à pergunta “quanto soluto há em cada porção de solução?”.</p>
          <div class="analogia"><b>Analogia:</b> um suco forte e um suco fraco podem ter a mesma quantidade de pó; a diferença é a quantidade de água. Concentração não é “quanto pó”, é “quanto pó <i>por copo</i>”. Um gole de um copo de suco tem a mesma concentração que o copo inteiro.</div>
          <p>Essa última frase é importante: concentração é uma propriedade <b>intensiva</b>. Se você tira 10 mL de uma solução 0,5 mol/L, esses 10 mL continuam 0,5 mol/L; o que muda é a quantidade de soluto que você tirou (0,005 mol).</p>`,
      },
      {
        t: "As várias maneiras de medir concentração",
        h: `<p>Cada área prefere uma unidade, mas todas dizem a mesma coisa de formas diferentes:</p>
          <div class="tab-rolar"><table class="tb"><thead><tr><th>Nome</th><th>Definição</th><th>Unidade</th></tr></thead><tbody>
          <tr><td>Concentração comum</td><td>massa de soluto ÷ volume de solução</td><td>g/L</td></tr>
          <tr><td>Molaridade</td><td>mol de soluto ÷ volume de solução</td><td>mol/L</td></tr>
          <tr><td>Título em massa (τ)</td><td>massa de soluto ÷ massa de solução</td><td>adimensional (0 a 1)</td></tr>
          <tr><td>Porcentagem</td><td>τ × 100 (m/m), ou g por 100 mL (m/V)</td><td>%</td></tr>
          <tr><td>ppm</td><td>partes de soluto por milhão de partes de solução</td><td>mg/kg (≈ mg/L em água diluída)</td></tr></tbody></table></div>
          <p>Ligações entre elas: C (g/L) = M (mol/L) × massa molar; e, com a densidade d da solução em g/mL, <b>C = 1000 × d × τ</b>. O soro fisiológico é 0,9% (m/V): 0,9 g de NaCl em 100 mL, ou seja, 9 g/L, que dá 9 ÷ 58,44 = 0,154 mol/L.</p>
          <div class="nota">Atenção ao denominador: em g/L e mol/L o volume é o da <b>solução</b> (soluto + solvente), não o da água adicionada. Por isso, no laboratório, dissolve-se o soluto e completa-se até a marca do balão volumétrico.</div>`,
      },
      {
        t: "Diluição: só o solvente muda",
        h: `<p>Ao acrescentar água, o volume aumenta e a concentração cai, mas a <b>quantidade de soluto não muda</b>. Como n = C × V antes e depois:</p>
          <div class="eq">C₁ × V₁ = C₂ × V₂</div>
          <p>Diluir 50 mL de HCl 2,0 mol/L até 200 mL reduz a concentração 4 vezes: C₂ = 2,0 × 50/200 = 0,50 mol/L. Volume de água adicionado: 200 − 50 = 150 mL. É a conta que a ferramenta “Soluções”, na aba Diluição, resolve deixando um campo em branco.</p>
          <p>Como C₂ = C₁V₁/V₂, a concentração cai de forma <b>inversamente proporcional</b> ao volume final: dobrar o volume divide a concentração por 2, e não por 4. As unidades de volume podem ser mL ou L, desde que iguais nos dois lados.</p>
          <div class="destaque">Segurança: dilui-se ácido concentrado colocando o <b>ácido na água</b>, devagar, e nunca o contrário. A diluição do ácido sulfúrico libera muito calor, e um pouco de água jogada sobre o ácido pode ferver e espirrar ácido.</div>`,
        grafico: {
          op: { altura: 220, modo: "dados", rotX: "volume final V₂ (mL)", rotY: "C₂ (mol/L)" },
          cena: { x: [0, 500], y: [0, 2.2], series: [
            { tipo: "funcao", f: (v) => (2.0 * 50) / v, dominio: [50, 500], rotulo: "C₂ = 2,0 × 50 / V₂" },
            { tipo: "marca", x: 200, y: 0.5, rotulo: "200 mL → 0,50 mol/L" },
          ] },
          legenda: "Diluindo 50 mL de solução 2,0 mol/L: a concentração cai na proporção inversa do volume final (hipérbole).",
        },
      },
      {
        t: "Mistura de soluções",
        h: `<p><b>Mesmo soluto, sem reação</b>: os mols (ou as massas) de soluto se somam, e os volumes também (aproximação boa para soluções aquosas diluídas):</p>
          <div class="eq">C<sub>f</sub> = ${fr("C₁V₁ + C₂V₂", "V₁ + V₂")}</div>
          <p>Exemplo: 100 mL de NaCl 0,20 mol/L + 300 mL de NaCl 0,60 mol/L. Soluto: 0,020 + 0,180 = 0,200 mol em 0,400 L → C<sub>f</sub> = 0,500 mol/L. Note que o resultado é uma <b>média ponderada pelos volumes</b> e fica sempre entre as duas concentrações iniciais, mais perto da que entrou em maior volume.</p>
          <p><b>Solutos diferentes que não reagem</b> (NaCl + KCl): cada um apenas se dilui no volume total, como se a outra solução fosse água. <b>Solutos que reagem</b> (ácido + base): primeiro se faz a estequiometria em mol para saber o que sobra, depois se divide pelo volume total. É o princípio da <b>titulação</b>, em que se mede o volume de uma solução de concentração conhecida necessário para reagir exatamente com outra.</p>`,
      },
    ],
    formulas: [
      { nome: "Concentração molar (molaridade)", eq: `M = ${fr("n", "V")} = ${fr("m", "MM × V")}`, simbolos: [["M", "concentração em quantidade de matéria", "mol/L"], ["m", "massa do soluto", "g"], ["MM", "massa molar do soluto", "g/mol"], ["V", "volume da solução", "L"]], obs: "V em litros: 250 mL = 0,250 L." },
      { nome: "Concentração comum e relação com densidade", eq: `C = ${fr("m", "V")} = M × MM = 1000 × d × τ`, simbolos: [["C", "concentração comum", "g/L"], ["d", "densidade da solução", "g/mL"], ["τ", "título em massa", "—"]], obs: "O 1000 converte mL em L. Não confunda densidade (massa de solução por volume) com concentração (massa de soluto por volume)." },
      { nome: "Diluição", eq: `C₁V₁ = C₂V₂`, simbolos: [["C₁, V₁", "concentração e volume antes", "—"], ["C₂, V₂", "concentração e volume depois", "—"]], obs: "Mesma unidade dos dois lados. Água adicionada = V₂ − V₁." },
      { nome: "Mistura (mesmo soluto)", eq: `C<sub>f</sub> = ${fr("C₁V₁ + C₂V₂", "V₁ + V₂")}`, simbolos: [["C<sub>f</sub>", "concentração final", "mol/L ou g/L"]], obs: "Só sem reação química entre os solutos." },
    ],
    exemplos: [
      {
        t: "direto",
        enunciado: `Dissolvem-se 4,0 g de NaOH em água até completar 250 mL de solução. Qual a molaridade e a concentração em g/L? (NaOH = 40,00 g/mol)`,
        passos: [`Mol de soluto: n = 4,0 g ÷ 40,00 g/mol = 0,100 mol.`, `Volume em litros: 250 mL = 0,250 L.`, `M = 0,100 mol ÷ 0,250 L = 0,400 mol/L.`, `C = 4,0 g ÷ 0,250 L = 16 g/L (ou 0,400 × 40,00 = 16 g/L).`],
        resposta: `<b>0,400 mol/L</b> e <b>16 g/L</b>`,
      },
      {
        t: "diluição",
        enunciado: `Que volume de água deve ser adicionado a 50 mL de HCl 2,0 mol/L para obter uma solução 0,50 mol/L?`,
        passos: [`C₁V₁ = C₂V₂ → V₂ = C₁V₁/C₂.`, `V₂ = 2,0 mol/L × 50 mL ÷ 0,50 mol/L = 200 mL.`, `Água adicionada: 200 mL − 50 mL = 150 mL.`],
        resposta: `<b>150 mL de água</b> (volume final 200 mL)`,
      },
      {
        t: "de prova",
        enunciado: `O ácido clorídrico concentrado comercial tem 37,0% de HCl em massa e densidade 1,19 g/mL. Qual sua molaridade, e que volume dele é preciso para preparar 500 mL de HCl 1,00 mol/L? (HCl = 36,46 g/mol)`,
        passos: [`C = 1000 × d × τ = 1000 × 1,19 g/mL × 0,370 = 440 g/L.`, `M = C ÷ MM = 440 g/L ÷ 36,46 g/mol = 12,1 mol/L.`, `Diluição: V₁ = C₂V₂/C₁ = 1,00 × 500 mL ÷ 12,08 = 41,4 mL.`, `Na prática: 41,4 mL do ácido concentrado, adicionados a cerca de 300 mL de água, completando depois até 500 mL.`],
        resposta: `<b>≈ 12,1 mol/L</b>; usar <b>≈ 41,4 mL</b>`,
      },
    ],
    erros: [
      { errado: `Usar o volume em mL na molaridade: 0,1 mol ÷ 250 mL = 0,0004 mol/L.`, certo: `Converter para litros: 0,1 mol ÷ 0,250 L = 0,4 mol/L.`, porque: `Molaridade é mol por litro; com mL o resultado sai 1000 vezes menor.` },
      { errado: `Achar que o volume da solução é o volume de água usado.`, certo: `V é o volume final da solução, depois de dissolver o soluto e completar.`, porque: `O soluto também ocupa volume; por isso se usa balão volumétrico.` },
      { errado: `Na diluição, responder V₂ quando se pergunta quanta água adicionar.`, certo: `Água adicionada = V₂ − V₁.`, porque: `V₂ é o volume final, que já inclui a solução original.` },
      { errado: `Confundir densidade da solução (g/mL) com concentração (g/L).`, certo: `Densidade é massa de solução por volume; concentração é massa de soluto por volume. C = 1000 × d × τ.`, porque: `Água pura tem densidade 1 g/mL e concentração de soluto zero.` },
    ],
    aplicacoes: [
      `<b>Saúde</b>: soro fisiológico (0,9% de NaCl) e soro glicosado (5% de glicose) têm concentrações próximas às do sangue para não danificar as hemácias.`,
      `<b>Água potável</b>: o flúor é dosado em torno de 0,7 mg/L (≈ 0,7 ppm); a legislação brasileira limita o fluoreto a 1,5 mg/L.`,
      `<b>Laboratório</b>: soluções-estoque concentradas são diluídas na hora (C₁V₁ = C₂V₂) para economizar espaço e reagente.`,
      `<b>Limpeza</b>: a água sanitária tem 2,0 a 2,5% de cloro ativo; diluída 1 : 100 (10 mL por litro), serve para desinfetar alimentos.`,
      `<b>Meio ambiente</b>: o CO₂ atmosférico passou de cerca de 280 ppm (era pré-industrial) para mais de 420 ppm.`,
    ],
    teste: [
      { p: `Você retira 10 mL de uma garrafa de solução 0,5 mol/L. A concentração desses 10 mL é…`, op: [`0,05 mol/L`, `0,5 mol/L`, `5 mol/L`, `depende do volume da garrafa`], certa: 1, explica: `Concentração é intensiva: qualquer porção de uma solução homogênea tem a mesma concentração.` },
      { p: `Ao dobrar o volume de uma solução com água, a concentração…`, op: [`dobra.`, `cai para um quarto.`, `não muda, porque o soluto é o mesmo.`, `cai pela metade.`], certa: 3, explica: `C₂ = C₁V₁/V₂ com V₂ = 2V₁: a mesma quantidade de soluto em volume duas vezes maior.` },
      { p: `Misturam-se volumes iguais de NaCl 0,2 mol/L e 0,6 mol/L. A concentração final é…`, op: [`0,8 mol/L, a soma.`, `0,4 mol/L, a média.`, `0,6 mol/L, a maior.`, `0,2 mol/L, a menor.`], certa: 1, explica: `Com volumes iguais, a média ponderada vira média simples: (0,2V + 0,6V)/2V = 0,4 mol/L.` },
      { p: `Uma água tem 2 ppm de chumbo. O que isso significa, aproximadamente?`, op: [`2 g de chumbo por litro.`, `2% de chumbo.`, `2 mg de chumbo por litro de água.`, `2 mol de chumbo por milhão de litros.`], certa: 2, explica: `ppm = mg/kg; como 1 L de água diluída tem massa ≈ 1 kg, 2 ppm ≈ 2 mg/L (muito acima do permitido para chumbo, 0,01 mg/L).` },
      { p: `Para converter porcentagem em massa em molaridade, você precisa de…`, op: [`só a massa molar.`, `só a densidade.`, `a densidade da solução e a massa molar do soluto.`, `o volume do frasco.`], certa: 2, explica: `A densidade transforma volume de solução em massa de solução (C = 1000 × d × τ); a massa molar transforma g/L em mol/L.` },
    ],
    resumo: [
      `Concentração = quantidade de soluto por quantidade de solução; é intensiva.`,
      `C (g/L) = m/V; M (mol/L) = n/V = m/(MM × V); C = M × MM = 1000 × d × τ.`,
      `V é o volume da solução, em litros.`,
      `Diluição: C₁V₁ = C₂V₂; água adicionada = V₂ − V₁.`,
      `Mistura do mesmo soluto: C<sub>f</sub> = (C₁V₁ + C₂V₂)/(V₁ + V₂).`,
      `ppm ≈ mg/L em água diluída; % m/V = g por 100 mL.`,
    ],
    alem: {
      t: "Para ir além: molalidade, atividade e volumes que não somam",
      h: `<p>A molaridade depende da temperatura, porque o volume da solução dilata com o calor. Em física-química usa-se a <b>molalidade</b>, b = mol de soluto por <b>kg de solvente</b>, que não muda com T. É ela que aparece nas propriedades coligativas: a elevação do ponto de ebulição e o abaixamento do ponto de congelação são proporcionais à molalidade de partículas (por isso o sal, que se dissocia em 2 íons, derrete gelo melhor que o açúcar na mesma molalidade).</p>
        <p>Outro limite do modelo: volumes nem sempre se somam. Misturar 50 mL de etanol com 50 mL de água dá cerca de 96 mL, porque as moléculas se encaixam por ligações de hidrogênio. Em soluções concentradas, a fórmula da mistura C<sub>f</sub> = (C₁V₁ + C₂V₂)/(V₁ + V₂) é só uma aproximação.</p>
        <p>Por fim, em soluções iônicas concentradas, os íons “se atrapalham” e se comportam como se houvesse menos deles. A química rigorosa troca concentração por <b>atividade</b>, a = γ × c, onde o coeficiente γ (entre 0 e 1) é estimado pela teoria de Debye-Hückel. É por isso que o pH medido de HCl 1 mol/L não é exatamente 0.</p>`,
    },
  };

  // ===========================================================================
  // 5. pH e pOH
  // ===========================================================================
  A.ph = {
    tempo: 20, nivel: "Ensino médio → faculdade",
    objetivos: [
      "explicar a autoionização da água, o Kw e por que pH + pOH = 14 a 25 °C;",
      "calcular o pH de ácidos e bases fortes, inclusive os que liberam mais de um H⁺ ou OH⁻;",
      "calcular o pH de ácidos e bases fracos a partir de Ka ou Kb e o grau de ionização;",
      "interpretar a escala logarítmica: uma unidade de pH é um fator 10 em [H⁺].",
    ],
    requisitos: [{ id: "solucoes", nome: "Soluções" }, { id: "equilibrio", nome: "Equilíbrio químico" }],
    secoes: [
      {
        t: "A ideia em uma frase",
        h: `<p>O <b>pH</b> é um jeito compacto de dizer quanto H⁺ (mais exatamente, H₃O⁺) há numa solução: <b>pH = −log[H⁺]</b>. Quanto mais H⁺, mais ácido e <b>menor</b> o pH.</p>
          <div class="analogia"><b>Analogia:</b> a escala Richter de terremotos e os decibéis do som também são logarítmicos. Um terremoto de magnitude 6 não é “um pouco” maior que um de 5; é muito maior. Com o pH é igual: suco de limão (pH ≈ 2) não é “um pouco mais ácido” que tomate (pH ≈ 4); tem cerca de 100 vezes mais H⁺.</div>
          <p>Por que usar logaritmo? Porque [H⁺] em soluções comuns vai de cerca de 1 mol/L até 10⁻¹⁴ mol/L, catorze ordens de grandeza. O logaritmo transforma 0,0000001 mol/L num simples “7”. O sinal de menos existe só para que os números fiquem positivos.</p>`,
      },
      {
        t: "A água se ioniza: Kw e a escala de 0 a 14",
        h: `<p>Mesmo a água pura tem um pouquinho de H⁺ e OH⁻, porque uma molécula de água pode passar um próton para outra (<b>autoionização</b>):</p>
          <div class="eq">H₂O + H₂O ⇌ H₃O⁺ + OH⁻ &nbsp;&nbsp; K<sub>w</sub> = [H⁺][OH⁻] = 1,0×10⁻¹⁴ (25 °C)</div>
          <p>Na água pura, [H⁺] = [OH⁻] = √(10⁻¹⁴) = 10⁻⁷ mol/L, por isso o neutro é <b>pH 7</b> a 25 °C. Aplicando −log aos dois lados de K<sub>w</sub>:</p>
          <div class="eq">pH + pOH = 14 &nbsp; (25 °C)</div>
          <p>Esse produto constante é uma gangorra: se um ácido aumenta [H⁺] 1000 vezes, [OH⁻] diminui 1000 vezes. Uma solução ácida <b>ainda tem OH⁻</b>, só que muito pouco. Ácido: pH &lt; 7; neutro: pH = 7; básico: pH &gt; 7 (sempre a 25 °C).</p>
          <div class="nota">A escala não para em 0 e 14: HCl 2 mol/L tem pH ≈ −0,3, e NaOH 2 mol/L tem pH ≈ 14,3. O “0 a 14” cobre as soluções do dia a dia.</div>`,
      },
      {
        t: "Ácidos e bases fortes: ionização total",
        h: `<p>Ácidos fortes (HCl, HBr, HI, HNO₃, HClO₄ e a 1ª ionização do H₂SO₄) e bases fortes (hidróxidos dos metais alcalinos, como NaOH e KOH, e de Ca, Sr, Ba) se ionizam praticamente <b>100%</b> em água. Então a concentração de H⁺ (ou OH⁻) sai direto da estequiometria:</p>
          <div class="eq">[H⁺] = ν × C &nbsp;&nbsp; (ν = H⁺ liberados por fórmula)</div>
          <ul><li>HCl 0,010 mol/L → [H⁺] = 10⁻² → <b>pH 2</b>.</li>
          <li>NaOH 0,0010 mol/L → [OH⁻] = 10⁻³ → pOH 3 → <b>pH 11</b>.</li>
          <li>Ca(OH)₂ 0,0050 mol/L → ν = 2 → [OH⁻] = 0,010 → pOH 2 → <b>pH 12</b>.</li></ul>
          <p>Para bases, o caminho é sempre: [OH⁻] → pOH → pH = 14 − pOH. Na ferramenta “pH”, escolha “Ácido forte” ou “Base forte” e informe ν (HCl = 1, H₂SO₄ = 2, Ca(OH)₂ = 2).</p>
          <div class="nota">Tratar o H₂SO₄ como liberando 2 H⁺ é a aproximação usual de vestibular. Na verdade, a 2ª ionização (HSO₄⁻ ⇌ H⁺ + SO₄²⁻) é parcial, com K<sub>a2</sub> ≈ 1,0×10⁻²; em soluções concentradas o pH real fica um pouco acima do calculado.</div>`,
        grafico: {
          op: { altura: 230, modo: "dados", rotX: "log C (C em mol/L)", rotY: "pH" },
          cena: { x: [-6, 0], y: [0, 8], series: [
            { tipo: "funcao", f: (x) => -x, rotulo: "ácido forte (pH = −log C)" },
            { tipo: "funcao", f: (x) => { const K = 1.8e-5, C = Math.pow(10, x); return -Math.log10((-K + Math.sqrt(K * K + 4 * K * C)) / 2); }, rotulo: "ácido acético (Ka = 1,8×10⁻⁵)" },
            { tipo: "hline", v: 7, tracejado: true, rotulo: "neutro (25 °C)" },
          ] },
          legenda: "Cada passo de 10 vezes na concentração muda o pH em 1 unidade (ácido forte) ou em cerca de 0,5 (ácido fraco). Muito diluído, o ácido fraco se ioniza quase todo e encosta na curva do forte.",
        },
      },
      {
        t: "Ácidos e bases fracos: Ka, Kb e grau de ionização",
        h: `<p>Ácidos fracos (acético, fórmico, HF, HCN, carbônico) se ionizam só parcialmente e chegam a um <b>equilíbrio</b>. Para HA ⇌ H⁺ + A⁻ com concentração inicial C, se x mol/L ionizam:</p>
          <div class="eq">K<sub>a</sub> = ${fr("[H⁺][A⁻]", "[HA]")} = ${fr("x²", "C − x")}</div>
          <p>Se x for pequeno perto de C (menos de 5%), C − x ≈ C e vale o atalho <b>x ≈ √(K<sub>a</sub> × C)</b>. Se não, resolve-se a equação do 2º grau x² + K<sub>a</sub>x − K<sub>a</sub>C = 0, como a ferramenta faz e compara com o atalho.</p>
          <p>O <b>grau de ionização</b> α = x/C diz que fração das moléculas se ionizou. No ácido acético 0,10 mol/L, α ≈ 1,3%: de cada 1000 moléculas, só 13 liberaram H⁺. Ao diluir, α aumenta (lei da diluição de Ostwald: α ≈ √(K<sub>a</sub>/C)), mas [H⁺] ainda diminui.</p>
          <p>Para bases fracas (amônia, aminas), a lógica é a mesma com K<sub>b</sub>, calculando [OH⁻]: B + H₂O ⇌ BH⁺ + OH⁻. E para um par conjugado vale <b>K<sub>a</sub> × K<sub>b</sub> = K<sub>w</sub></b>: o NH₄⁺ tem K<sub>a</sub> = 10⁻¹⁴/1,8×10⁻⁵ = 5,6×10⁻¹⁰.</p>
          <div class="destaque">“Forte” e “concentrado” são coisas diferentes. Forte fala de <b>quanto ioniza</b> (α); concentrado fala de <b>quanto há</b> (C). HCl 10⁻⁴ mol/L é forte e diluído (pH 4); ácido acético 1 mol/L é fraco e concentrado (pH ≈ 2,4).</div>`,
      },
    ],
    formulas: [
      { nome: "pH, pOH e Kw", eq: `pH = −log[H⁺] &nbsp; pOH = −log[OH⁻] &nbsp; pH + pOH = 14`, simbolos: [["[H⁺]", "concentração de H⁺ (H₃O⁺)", "mol/L"], ["K<sub>w</sub>", "produto iônico da água = [H⁺][OH⁻] = 1,0×10⁻¹⁴ a 25 °C", "—"]], obs: "Volta: [H⁺] = 10<sup>−pH</sup>. O “14” só vale a 25 °C." },
      { nome: "Ácido ou base forte", eq: `[H⁺] = ν × C &nbsp; ou &nbsp; [OH⁻] = ν × C`, simbolos: [["ν", "H⁺ (ou OH⁻) liberados por fórmula", "—"], ["C", "concentração do ácido ou da base", "mol/L"]], obs: "Para bases, calcule o pOH e faça pH = 14 − pOH." },
      { nome: "Ácido fraco", eq: `K<sub>a</sub> = ${fr("x²", "C − x")} &nbsp; ⇒ &nbsp; x ≈ √(K<sub>a</sub> × C)`, simbolos: [["x", "[H⁺] no equilíbrio", "mol/L"], ["K<sub>a</sub>", "constante de acidez", "—"], ["α = x/C", "grau de ionização", "—"]], obs: "Use o atalho só se x/C &lt; 5%; senão, resolva o 2º grau. Para base fraca, troque K<sub>a</sub> por K<sub>b</sub> e x por [OH⁻]." },
    ],
    exemplos: [
      {
        t: "direto",
        enunciado: `Qual o pH de uma solução de Ca(OH)₂ 0,0050 mol/L (base forte)?`,
        passos: [`Cada Ca(OH)₂ libera 2 OH⁻: [OH⁻] = 2 × 0,0050 = 0,010 mol/L = 10⁻² mol/L.`, `pOH = −log(10⁻²) = 2.`, `pH = 14 − 2 = 12.`],
        resposta: `<b>pH = 12</b>`,
      },
      {
        t: "ácido fraco",
        enunciado: `Calcule o pH e o grau de ionização do ácido acético 0,10 mol/L (vinagre diluído). Ka = 1,8×10⁻⁵.`,
        passos: [`Atalho: x ≈ √(Ka × C) = √(1,8×10⁻⁵ × 0,10) = √(1,8×10⁻⁶) = 1,34×10⁻³ mol/L.`, `Conferir o atalho: x/C = 1,34×10⁻³ / 0,10 = 1,3% &lt; 5%. Pode usar.`, `pH = −log(1,34×10⁻³) = 2,87. (A conta exata pelo 2º grau dá x = 1,33×10⁻³ e pH = 2,88.)`, `α = 1,3%: só cerca de 13 em cada 1000 moléculas ionizam.`],
        resposta: `<b>pH ≈ 2,87</b>, <b>α ≈ 1,3%</b>`,
      },
      {
        t: "de prova",
        enunciado: `Uma solução de amônia (NH₃) 0,10 mol/L tem Kb = 1,8×10⁻⁵. Qual o seu pH? Compare com NaOH na mesma concentração.`,
        passos: [`NH₃ + H₂O ⇌ NH₄⁺ + OH⁻: [OH⁻] ≈ √(Kb × C) = √(1,8×10⁻⁶) = 1,34×10⁻³ mol/L.`, `pOH = −log(1,34×10⁻³) = 2,87 → pH = 14 − 2,87 = 11,13.`, `NaOH 0,10 mol/L: [OH⁻] = 0,10 → pOH = 1 → pH = 13.`, `Diferença de quase 2 unidades: o NaOH tem cerca de 75 vezes mais OH⁻ (0,10 ÷ 1,34×10⁻³ ≈ 75).`],
        resposta: `Amônia: <b>pH ≈ 11,1</b>; NaOH: <b>pH = 13</b>`,
      },
    ],
    erros: [
      { errado: `Achar que pH 3 é “um pouco mais ácido” que pH 4.`, certo: `pH 3 tem 10 vezes mais H⁺ que pH 4; pH 2 tem 100 vezes mais.`, porque: `A escala é logarítmica: cada unidade é um fator 10.` },
      { errado: `Calcular o pH de NaOH 0,001 mol/L como −log(0,001) = 3.`, certo: `−log[OH⁻] dá o pOH = 3; o pH é 14 − 3 = 11.`, porque: `Para bases, a conta direta dá pOH; falta o último passo.` },
      { errado: `Usar [H⁺] = C para um ácido fraco.`, certo: `Usar Ka: [H⁺] = x, com Ka = x²/(C − x) ≈ x²/C.`, porque: `Ácido fraco ioniza só um pouco; ácido acético 0,1 mol/L tem pH 2,9, não 1.` },
      { errado: `Diluir HCl 10⁻⁶ mol/L mais 100 vezes e dizer que o pH vira 8.`, certo: `O pH se aproxima de 7 (fica pouco abaixo dele), nunca passa para básico.`, porque: `Com tão pouco ácido, os 10⁻⁷ mol/L de H⁺ da própria água passam a dominar.` },
      { errado: `Dizer que solução ácida “não tem OH⁻”.`, certo: `Toda solução aquosa tem H⁺ e OH⁻, com [H⁺][OH⁻] = 10⁻¹⁴.`, porque: `Em pH 3, [OH⁻] = 10⁻¹¹ mol/L: pouquíssimo, mas não zero.` },
    ],
    aplicacoes: [
      `<b>Medicina</b>: o sangue é mantido entre pH 7,35 e 7,45 pelo tampão bicarbonato; fora dessa faixa há acidose ou alcalose, que podem ser fatais.`,
      `<b>Agricultura</b>: solos ácidos (pH &lt; 5,5) prendem nutrientes e liberam alumínio tóxico; a calagem (aplicação de calcário) eleva o pH.`,
      `<b>Piscinas</b>: o pH ideal fica entre 7,2 e 7,6; acima disso, o cloro (ácido hipocloroso) perde eficiência.`,
      `<b>Meio ambiente</b>: a chuva normal tem pH ≈ 5,6 (CO₂ dissolvido); a chuva ácida, com H₂SO₄ e HNO₃, pode ficar abaixo de 4,5.`,
      `<b>Digestão</b>: o suco gástrico tem pH entre 1 e 2; antiácidos são bases fracas que neutralizam o excesso sem levar o estômago a pH básico.`,
    ],
    teste: [
      { p: `O pH de uma solução passou de 5 para 2. A concentração de H⁺…`, op: [`aumentou 3 vezes.`, `diminuiu 1000 vezes.`, `aumentou 1000 vezes.`, `aumentou 2,5 vezes.`], certa: 2, explica: `3 unidades de pH a menos = 10³ = 1000 vezes mais H⁺.` },
      { p: `HCl 0,1 mol/L e ácido acético 0,1 mol/L têm…`, op: [`o mesmo pH, porque a concentração é a mesma.`, `pH diferentes: o HCl ioniza totalmente (pH 1) e o acético só cerca de 1% (pH ≈ 2,9).`, `o acético mais ácido, porque tem mais átomos de H.`, `pH 7 os dois, porque são diluídos.`], certa: 1, explica: `Força é grau de ionização, não concentração nem número de H na fórmula.` },
      { p: `A 25 °C uma solução tem pOH = 4. Ela é…`, op: [`básica, com pH 10.`, `ácida, com pH 4.`, `ácida, com pH 10.`, `neutra.`], certa: 0, explica: `pH = 14 − 4 = 10, maior que 7: básica.` },
      { p: `Por que a água pura tem pH 7 a 25 °C?`, op: [`Porque não tem H⁺ nem OH⁻.`, `Porque o H₂O tem pH 7 por definição.`, `Porque o oxigênio neutraliza os hidrogênios.`, `Porque a autoionização gera [H⁺] = [OH⁻] = √Kw = 10⁻⁷ mol/L.`], certa: 3, explica: `Neutro significa [H⁺] = [OH⁻], não ausência de íons. Com Kw = 10⁻¹⁴, cada um vale 10⁻⁷ mol/L.` },
      { p: `Ao diluir um ácido fraco, o grau de ionização α…`, op: [`diminui, e o pH também diminui.`, `aumenta, mas o pH também aumenta (menos ácido).`, `fica igual, porque Ka é constante.`, `vai a zero.`], certa: 1, explica: `Ostwald: α ≈ √(Ka/C) cresce quando C cai. Mesmo assim, [H⁺] = αC diminui, então o pH sobe.` },
      { p: `Qual destas é uma base FRACA?`, op: [`NaOH`, `KOH`, `NH₃`, `Ba(OH)₂`], certa: 2, explica: `A amônia reage pouco com a água (Kb = 1,8×10⁻⁵). Os hidróxidos de metais alcalinos e de Ba se dissociam totalmente.` },
    ],
    resumo: [
      `pH = −log[H⁺]; [H⁺] = 10<sup>−pH</sup>. Uma unidade de pH = fator 10.`,
      `Kw = [H⁺][OH⁻] = 10⁻¹⁴ a 25 °C ⇒ pH + pOH = 14; neutro = 7.`,
      `Forte: [H⁺] = ν × C (ou [OH⁻] = ν × C e pH = 14 − pOH).`,
      `Fraco: Ka = x²/(C − x); atalho x ≈ √(Ka × C) se x/C &lt; 5%.`,
      `α = x/C; diluir aumenta α, mas o pH sobe mesmo assim.`,
      `Par conjugado: Ka × Kb = Kw.`,
      `Forte ≠ concentrado: força é ionização, concentração é quantidade.`,
    ],
    alem: {
      t: "Para ir além: o neutro muda com a temperatura",
      h: `<p>K<sub>w</sub> é uma constante de equilíbrio e, como toda constante, depende de T. A autoionização é endotérmica, então aquecer favorece os íons: a 37 °C, K<sub>w</sub> ≈ 2,4×10⁻¹⁴ e o neutro fica em <b>pH ≈ 6,8</b>; a 100 °C, K<sub>w</sub> ≈ 5×10⁻¹³ e o neutro é pH ≈ 6,1. Água fervendo com pH 6,1 <b>não é ácida</b>: [H⁺] continua igual a [OH⁻]. Neutro é igualdade, não “pH 7”.</p>
        <p>Outro limite: soluções muito diluídas. Para HCl 1,0×10⁻⁸ mol/L, a conta ingênua dá pH 8 (básico!), o que é absurdo. O certo é somar o H⁺ da água: [H⁺] = C + [OH⁻] com [OH⁻] = K<sub>w</sub>/[H⁺], o que leva a [H⁺]² − C[H⁺] − K<sub>w</sub> = 0. Resolvendo, [H⁺] = 1,05×10⁻⁷ mol/L e <b>pH = 6,98</b>: levemente ácido, como deveria.</p>
        <p>Por fim, a definição moderna é pH = −log a<sub>H⁺</sub>, com a atividade em vez da concentração, e o pH é medido com um eletrodo de vidro cujo potencial varia cerca de 59 mV por unidade de pH a 25 °C (a equação de Nernst, da eletroquímica).</p>`,
    },
  };

  // ===========================================================================
  // 6. Gases ideais
  // ===========================================================================
  A.gases = {
    tempo: 20, nivel: "Ensino médio → faculdade",
    objetivos: [
      "usar a equação de Clapeyron (PV = nRT) com unidades coerentes de P, V e T;",
      "resolver transformações isotérmicas, isobáricas e isocóricas com a equação geral P₁V₁/T₁ = P₂V₂/T₂;",
      "calcular a densidade e a massa molar de um gás;",
      "aplicar a lei de Dalton das pressões parciais a misturas gasosas.",
    ],
    requisitos: [{ id: "mol", nome: "Mol e conversões" }],
    secoes: [
      {
        t: "A ideia em uma frase",
        h: `<p>Num gás, as moléculas estão muito afastadas e voam em todas as direções, batendo nas paredes. A <b>pressão</b> é o efeito dessas batidas; a <b>temperatura</b> mede a agitação delas. Um <b>gás ideal</b> é o modelo em que as moléculas não têm volume próprio nem se atraem, e para ele vale uma lei simples:</p>
          <div class="eq">P × V = n × R × T</div>
          <div class="analogia"><b>Analogia:</b> pense numa sala com bolinhas de pingue-pongue quicando. Mais bolinhas (n) ou bolinhas mais rápidas (T) → mais batidas na parede (P). Sala maior (V) → cada parede recebe menos batidas. A equação é só essa intuição escrita com números.</div>
          <p>O modelo funciona muito bem para o ar e a maioria dos gases perto da pressão ambiente (erros de menos de 1%). Ele falha quando o gás está muito comprimido ou perto de virar líquido.</p>`,
      },
      {
        t: "Unidades: onde mais se erra",
        h: `<p>A temperatura tem de estar em <b>kelvin</b>, sempre. A escala Kelvin começa no zero absoluto, onde a agitação térmica é mínima; em °C, o zero é arbitrário (o gelo) e daria pressões negativas, sem sentido.</p>
          <div class="eq">T (K) = θ (°C) + 273,15 &nbsp;&nbsp; (27 °C = 300 K)</div>
          <p>A constante R tem valores diferentes conforme as unidades escolhidas para P e V:</p>
          <div class="tab-rolar"><table class="tb"><thead><tr><th>R</th><th>Use quando</th></tr></thead><tbody>
          <tr><td>0,082 atm·L/(mol·K)</td><td>P em atm e V em L</td></tr>
          <tr><td>62,4 mmHg·L/(mol·K)</td><td>P em mmHg e V em L</td></tr>
          <tr><td>8,314 J/(mol·K) = 8,314 Pa·m³/(mol·K)</td><td>P em Pa e V em m³ (SI); também kPa e L</td></tr></tbody></table></div>
          <p>Conversões de pressão: <b>1 atm = 760 mmHg = 101 325 Pa = 101,325 kPa = 1,013 bar</b>. Volume: 1 m³ = 1000 L; 1 L = 1000 mL = 1 dm³.</p>
          <p>Nas <b>CNTP</b> (0 °C e 1 atm), 1 mol de gás ideal ocupa V = 1 × 0,08206 × 273,15 / 1 = <b>22,4 L</b>; a 25 °C e 1 atm, 24,5 L. A ferramenta “Gases ideais” aceita P e V em várias unidades e T em °C ou K, e mostra as conversões antes da conta.</p>`,
      },
      {
        t: "Transformações gasosas: quando n é constante",
        h: `<p>Se a quantidade de gás não muda, PV/T = nR é constante. Daí sai a <b>equação geral dos gases</b>, P₁V₁/T₁ = P₂V₂/T₂, e três casos particulares:</p>
          <ul><li><b>Isotérmica</b> (T constante, lei de Boyle): P₁V₁ = P₂V₂. Comprimir pela metade dobra a pressão.</li>
          <li><b>Isobárica</b> (P constante, lei de Charles): V₁/T₁ = V₂/T₂. Um balão encolhe no freezer.</li>
          <li><b>Isocórica</b> ou isovolumétrica (V constante, lei de Gay-Lussac): P₁/T₁ = P₂/T₂. A pressão do pneu sobe depois de rodar e esquentar.</li></ul>
          <p>No gráfico, cada curva é uma <b>isoterma</b> de 1 mol de gás: P = nRT/V é uma hipérbole. A isoterma mais quente fica acima, porque, no mesmo volume, moléculas mais agitadas batem com mais força e mais vezes.</p>`,
        grafico: {
          op: { altura: 230, modo: "dados", rotX: "V (L)", rotY: "P (atm)" },
          cena: { x: [0, 50], y: [0, 6], series: [
            { tipo: "funcao", f: (v) => (0.082057 * 273.15) / v, dominio: [3, 50], rotulo: "0 °C (273 K)" },
            { tipo: "funcao", f: (v) => (0.082057 * 373.15) / v, dominio: [3, 50], rotulo: "100 °C (373 K)" },
            { tipo: "marca", x: 22.41, y: 1, rotulo: "CNTP: 22,4 L a 1 atm" },
          ] },
          legenda: "Isotermas de 1 mol de gás ideal (P = nRT/V). Ao longo de cada curva, P × V é constante (lei de Boyle).",
        },
      },
      {
        t: "Densidade, massa molar e misturas (lei de Dalton)",
        h: `<p>Trocando n por m/M em PV = nRT, chega-se a uma fórmula muito útil:</p>
          <div class="eq">d = ${fr("m", "V")} = ${fr("P × M", "R × T")}</div>
          <p>A densidade de um gás é proporcional à sua massa molar. O ar tem M média ≈ 29 g/mol; gases mais leves (He = 4, H₂ = 2, CH₄ = 16) sobem, e gases mais pesados (CO₂ = 44, propano = 44) se acumulam no chão, por isso vazamentos de gás de cozinha (GLP) são perigosos em lugares baixos. Medindo d, P e T, descobre-se a massa molar de um gás desconhecido.</p>
          <p><b>Lei de Dalton</b>: numa mistura de gases ideais, cada gás se comporta como se estivesse sozinho no recipiente. A pressão total é a soma das <b>pressões parciais</b>, e cada uma é proporcional à fração em mol:</p>
          <div class="eq">P<sub>total</sub> = P<sub>A</sub> + P<sub>B</sub> + … &nbsp;&nbsp; P<sub>A</sub> = x<sub>A</sub> × P<sub>total</sub></div>
          <p>Exemplo: 2,0 mol de N₂ e 0,50 mol de O₂ a 5,0 atm. x(O₂) = 0,50/2,50 = 0,20 → P(O₂) = 0,20 × 5,0 = 1,0 atm. No ar ao nível do mar, P(O₂) ≈ 0,21 atm; no alto do Everest, com P total ≈ 0,33 atm, cai para cerca de 0,07 atm.</p>`,
      },
    ],
    formulas: [
      { nome: "Equação de Clapeyron", eq: `PV = nRT`, simbolos: [["P", "pressão", "atm"], ["V", "volume", "L"], ["n", "quantidade de gás", "mol"], ["R", "constante dos gases = 0,082 atm·L/(mol·K) = 8,314 J/(mol·K)", "—"], ["T", "temperatura absoluta", "K"]], obs: "T sempre em kelvin. Escolha R de acordo com as unidades de P e V." },
      { nome: "Equação geral (n constante)", eq: `${fr("P₁V₁", "T₁")} = ${fr("P₂V₂", "T₂")}`, simbolos: [["1, 2", "estados inicial e final", "—"]], obs: "Corte o que for constante: T (Boyle), P (Charles) ou V (Gay-Lussac). Unidades de P e V só precisam ser iguais dos dois lados; T em K." },
      { nome: "Densidade de um gás", eq: `d = ${fr("PM", "RT")}`, simbolos: [["d", "densidade", "g/L"], ["M", "massa molar", "g/mol"]], obs: "Para achar M de um gás desconhecido: M = dRT/P." },
      { nome: "Lei de Dalton", eq: `P<sub>i</sub> = x<sub>i</sub> × P<sub>total</sub>`, simbolos: [["P<sub>i</sub>", "pressão parcial do gás i", "atm"], ["x<sub>i</sub>", "fração em mol = n<sub>i</sub>/n<sub>total</sub>", "—"]], obs: "As frações em mol somam 1; as pressões parciais somam a total." },
    ],
    exemplos: [
      {
        t: "direto",
        enunciado: `Qual a pressão de 2,0 mol de um gás ideal num cilindro de 10 L a 27 °C? (R = 0,082 atm·L/(mol·K))`,
        passos: [`Temperatura em kelvin: T = 27 + 273 = 300 K.`, `Isolar P: P = nRT/V.`, `P = 2,0 mol × 0,082 atm·L/(mol·K) × 300 K ÷ 10 L = 4,92 atm.`],
        resposta: `<b>P ≈ 4,9 atm</b>`,
      },
      {
        t: "transformação geral",
        enunciado: `Um gás ocupa 5,0 L a 1,0 atm e 27 °C. Ele é comprimido para 2,0 L e aquecido até 127 °C. Qual a nova pressão?`,
        passos: [`Temperaturas em K: T₁ = 300 K; T₂ = 400 K.`, `Equação geral: P₂ = P₁ × (V₁/V₂) × (T₂/T₁).`, `P₂ = 1,0 atm × (5,0/2,0) × (400/300) = 1,0 × 2,5 × 1,333 = 3,33 atm.`],
        resposta: `<b>P₂ ≈ 3,3 atm</b>`,
      },
      {
        t: "de prova",
        enunciado: `Um balão de 1,00 L contém 1,30 g de um gás desconhecido a 1,00 atm e 27 °C. Qual a massa molar do gás? Que gás poderia ser?`,
        passos: [`Densidade: d = 1,30 g ÷ 1,00 L = 1,30 g/L. T = 300 K.`, `M = dRT/P = 1,30 g/L × 0,082 atm·L/(mol·K) × 300 K ÷ 1,00 atm.`, `M = 1,30 × 24,6 = 32,0 g/mol.`, `Massa molar 32 g/mol: compatível com O₂ (32,00 g/mol).`],
        resposta: `<b>M ≈ 32 g/mol</b>, provavelmente <b>O₂</b>`,
      },
    ],
    erros: [
      { errado: `Usar a temperatura em °C: dobrar de 20 °C para 40 °C “dobra a pressão”.`, certo: `Em kelvin, 293 K → 313 K: a pressão sobe só cerca de 7%.`, porque: `As leis dos gases são proporcionais à temperatura absoluta.` },
      { errado: `Usar R = 0,082 com pressão em mmHg ou kPa.`, certo: `Converter P para atm (÷ 760 ou ÷ 101,325) ou usar o R correspondente.`, porque: `O valor de R depende das unidades; misturá-las erra o resultado por fatores de 100 ou mais.` },
      { errado: `Aplicar 22,4 L/mol em qualquer condição.`, certo: `22,4 L/mol só nas CNTP (0 °C, 1 atm). Fora delas, V = nRT/P.`, porque: `O volume molar depende de T e P.` },
      { errado: `Em mistura de gases, achar que o gás mais pesado tem maior pressão parcial.`, certo: `A pressão parcial depende da fração em mol, não da massa molar.`, porque: `No gás ideal, cada molécula contribui igual para a pressão, leve ou pesada.` },
    ],
    aplicacoes: [
      `<b>Mergulho</b>: a 10 m de profundidade a pressão é cerca de 2 atm; pela lei de Boyle, o ar nos pulmões ocupa metade do volume. Subir prendendo a respiração pode romper os alvéolos.`,
      `<b>Airbag e pneus</b>: a quantidade de gás (n) é calculada por PV = nRT para atingir a pressão certa na temperatura de uso.`,
      `<b>Meteorologia</b>: o ar quente é menos denso (d = PM/RT), sobe e forma correntes de convecção e nuvens; é também por isso que balões de ar quente voam.`,
      `<b>Medicina</b>: a oxigenoterapia hiperbárica aumenta a pressão parcial de O₂ (Dalton) para dissolver mais oxigênio no sangue.`,
    ],
    teste: [
      { p: `Por que a temperatura deve estar em kelvin em PV = nRT?`, op: [`Porque é a unidade do SI e os livros exigem.`, `Porque a lei é proporcional à temperatura absoluta; em °C o zero é arbitrário e daria resultados absurdos (até pressão negativa).`, `Porque kelvin é sempre um número maior.`, `Não precisa; °C funciona igual.`], certa: 1, explica: `A 0 °C o gás ainda tem pressão; a proporcionalidade P ∝ T só funciona a partir do zero absoluto (0 K = −273,15 °C).` },
      { p: `Numa transformação isotérmica, se o volume cai para um terço, a pressão…`, op: [`cai para um terço.`, `não muda.`, `dobra.`, `triplica.`], certa: 3, explica: `Boyle: P₁V₁ = P₂V₂. Com V₂ = V₁/3, P₂ = 3P₁.` },
      { p: `Nas mesmas T e P, qual gás é mais denso?`, op: [`CO₂ (44 g/mol)`, `O₂ (32 g/mol)`, `N₂ (28 g/mol)`, `He (4 g/mol)`], certa: 0, explica: `d = PM/RT: com P e T iguais, a densidade é proporcional à massa molar.` },
      { p: `Uma mistura tem 1 mol de He e 3 mol de Ar a 8 atm. A pressão parcial do He é…`, op: [`4 atm`, `2 atm`, `6 atm`, `1 atm`], certa: 1, explica: `x(He) = 1/4 = 0,25; P(He) = 0,25 × 8 = 2 atm. A massa molar não entra.` },
      { p: `Em que situação um gás real se afasta MAIS do comportamento ideal?`, op: [`Alta temperatura e baixa pressão.`, `Temperatura ambiente e 1 atm.`, `Baixa temperatura e alta pressão, perto de liquefazer.`, `Em qualquer situação, igualmente.`], certa: 2, explica: `Comprimidas e lentas, as moléculas ficam próximas: o volume delas e as atrações passam a contar.` },
    ],
    resumo: [
      `PV = nRT; T em kelvin (K = °C + 273,15).`,
      `R = 0,082 atm·L/(mol·K) = 8,314 J/(mol·K); combine com as unidades.`,
      `1 atm = 760 mmHg = 101,325 kPa.`,
      `n constante: P₁V₁/T₁ = P₂V₂/T₂ (Boyle, Charles, Gay-Lussac).`,
      `CNTP: 0 °C e 1 atm → 22,4 L/mol; 25 °C e 1 atm → 24,5 L/mol.`,
      `d = PM/RT: gás mais pesado é mais denso.`,
      `Dalton: P<sub>i</sub> = x<sub>i</sub> × P<sub>total</sub>.`,
    ],
    alem: {
      t: "Para ir além: de onde vem PV = nRT e onde ela falha",
      h: `<p>A <b>teoria cinética</b> deriva a lei: calculando o momento transferido pelas colisões das moléculas com as paredes, obtém-se PV = ⅓ N m v̄², onde v̄² é a velocidade quadrática média. Comparando com PV = nRT, conclui-se que a energia cinética média de translação é <b>(3/2) k<sub>B</sub>T</b> por molécula: temperatura é, literalmente, agitação molecular. A velocidade típica fica v<sub>rms</sub> = √(3RT/M); para o N₂ a 25 °C, √(3 × 8,314 × 298 / 0,028) ≈ 515 m/s, mais rápido que um avião comercial.</p>
        <p>Gases reais desviam do ideal por dois motivos, e a equação de <b>van der Waals</b> corrige os dois:</p>
        <div class="eq">(P + a·n²/V²)(V − n·b) = nRT</div>
        <p>O termo <b>b</b> desconta o volume ocupado pelas próprias moléculas; o termo <b>a</b> leva em conta as atrações, que reduzem a força das batidas na parede. O desvio é medido pelo fator de compressibilidade Z = PV/(nRT), que vale 1 no gás ideal. Para o CO₂ perto da liquefação, Z pode cair abaixo de 0,3; para hidrogênio a centenas de atmosferas, passa de 1,2. Projetos de tanques de gás natural e de H₂ precisam dessas correções.</p>`,
    },
  };

  // ===========================================================================
  // 7. Distribuição eletrônica
  // ===========================================================================
  A.eletrons = {
    tempo: 20, nivel: "Ensino médio → faculdade",
    objetivos: [
      "distribuir os elétrons de qualquer átomo em subníveis pelo diagrama de Pauling;",
      "aplicar o princípio de Pauli e a regra de Hund para preencher orbitais;",
      "determinar os quatro números quânticos de um elétron e a camada de valência;",
      "fazer a distribuição de íons e reconhecer as exceções do Cr e do Cu;",
      "ligar a configuração eletrônica à posição do elemento na tabela periódica.",
    ],
    secoes: [
      {
        t: "A ideia em uma frase",
        h: `<p>Os elétrons de um átomo não ficam em qualquer lugar: ocupam regiões de energia bem definida, preenchidas <b>da menor energia para a maior</b>. A distribuição eletrônica é o “endereço” de cada elétron, e é ela que explica por que o sódio reage com a água, por que o neônio é inerte e por que a tabela periódica tem o formato que tem.</p>
          <div class="analogia"><b>Analogia:</b> pense num prédio em que os moradores (elétrons) sempre escolhem o apartamento mais barato disponível. Andares são as <b>camadas</b> (níveis), cada andar tem tipos de apartamento (<b>subníveis</b> s, p, d, f), cada apartamento é um <b>orbital</b> e cabe no máximo um casal (2 elétrons). A surpresa: alguns apartamentos do 4º andar (4s) são mais baratos que alguns do 3º (3d).</div>`,
      },
      {
        t: "Níveis, subníveis e orbitais",
        h: `<p>Cada <b>nível</b> (camada) é indicado por n = 1, 2, 3… ou pelas letras K, L, M, N, O, P, Q. Dentro dele há <b>subníveis</b>, e cada subnível tem um número fixo de <b>orbitais</b>, cada orbital com no máximo 2 elétrons:</p>
          <div class="tab-rolar"><table class="tb"><thead><tr><th>Subnível</th><th>ℓ</th><th>Orbitais</th><th>Máx. de elétrons</th></tr></thead><tbody>
          <tr><td>s</td><td>0</td><td>1</td><td>2</td></tr><tr><td>p</td><td>1</td><td>3</td><td>6</td></tr>
          <tr><td>d</td><td>2</td><td>5</td><td>10</td></tr><tr><td>f</td><td>3</td><td>7</td><td>14</td></tr></tbody></table></div>
          <p>O nível n tem n subníveis (o 1º só tem 1s; o 2º tem 2s e 2p; o 3º tem 3s, 3p e 3d) e comporta até 2n² elétrons: 2, 8, 18, 32. Nos átomos conhecidos, as camadas O, P e Q não chegam a encher: o máximo observado é K 2, L 8, M 18, N 32, O 32, P 18, Q 8.</p>
          <p>Notação: <b>3p⁵</b> significa “5 elétrons no subnível p do nível 3”. O expoente é o número de elétrons, não uma potência.</p>`,
      },
      {
        t: "O diagrama de Pauling: a ordem de energia",
        h: `<p>A energia de um subnível depende de n e de ℓ. Seguindo as diagonais do diagrama de Linus Pauling (ou a regra de <b>n + ℓ</b>: menor soma primeiro; empate, menor n primeiro), a ordem de preenchimento é:</p>
          <div class="eq">1s 2s 2p 3s 3p <b>4s 3d</b> 4p 5s 4d 5p 6s 4f 5d 6p 7s 5f 6d 7p</div>
          <p>O ponto delicado é o <b>4s antes do 3d</b>: 4s tem n + ℓ = 4 + 0 = 4, e 3d tem 3 + 2 = 5. Exemplo, ferro (Z = 26):</p>
          <div class="eq">1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d⁶ &nbsp;&nbsp; (2+2+6+2+6+2+6 = 26)</div>
          <p>Esta é a ordem <b>energética</b> (de preenchimento). Reescrevendo por camadas, tem-se a ordem <b>geométrica</b>: 1s² 2s² 2p⁶ 3s² 3p⁶ 3d⁶ 4s², ou seja, K 2, L 8, M 14, N 2. A forma abreviada usa o gás nobre anterior: Fe = [Ar] 4s² 3d⁶.</p>
          <p>A <b>camada de valência</b> é a mais externa (maior n), e não o último subnível preenchido. No ferro, o último subnível é o 3d, mas a valência é a camada N (4s²), com 2 elétrons. É isso que a ferramenta “Distribuição eletrônica” mostra no passo “Camadas e elétrons de valência”.</p>`,
      },
      {
        t: "Pauli, Hund e os números quânticos",
        h: `<p>Cada elétron é descrito por <b>quatro números quânticos</b>:</p>
          <ul><li><b>n</b> (principal): o nível, 1, 2, 3…</li>
          <li><b>ℓ</b> (secundário ou azimutal): o subnível, de 0 a n − 1 (s = 0, p = 1, d = 2, f = 3).</li>
          <li><b>mℓ</b> (magnético): o orbital, de −ℓ a +ℓ (num p: −1, 0, +1).</li>
          <li><b>mₛ</b> (spin): +½ ou −½ (↑ ou ↓).</li></ul>
          <p><b>Princípio de exclusão de Pauli</b>: dois elétrons do mesmo átomo não podem ter os quatro números iguais; por isso cada orbital tem no máximo 2 elétrons, com spins opostos.</p>
          <p><b>Regra de Hund</b>: num subnível, os elétrons primeiro ocupam <b>um por orbital</b>, com spins paralelos; só depois formam pares. No nitrogênio, 2p³ fica ↑ ↑ ↑ (três desemparelhados), não ↑↓ ↑ _. Elétrons desemparelhados tornam a substância atraída por ímãs (<b>paramagnetismo</b>).</p>
          <div class="nota">Convenção usada aqui e na ferramenta: os orbitais são preenchidos do menor mℓ para o maior, e o primeiro elétron de cada orbital tem spin +½. Alguns livros usam a convenção oposta; confira a do seu professor antes de responder questões de números quânticos.</div>`,
      },
      {
        t: "Íons, exceções e a tabela periódica",
        h: `<p><b>Ânions</b> ganham elétrons no próximo lugar livre: Cl (… 3p⁵) + 1 e⁻ → Cl⁻ (… 3p⁶), com a configuração do argônio. <b>Cátions</b> perdem elétrons da <b>camada mais externa</b> primeiro, não do último subnível preenchido: Fe = [Ar] 4s² 3d⁶ → Fe²⁺ = [Ar] 3d⁶ → Fe³⁺ = [Ar] 3d⁵. O 4s sai antes do 3d.</p>
          <p><b>Exceções</b>: o cromo e o cobre preferem subníveis d semicheios ou cheios, que são extra estáveis:</p>
          <div class="eq">Cr (24): [Ar] 4s¹ 3d⁵ &nbsp; (e não 4s² 3d⁴) &nbsp;&nbsp; Cu (29): [Ar] 4s¹ 3d¹⁰ &nbsp; (e não 4s² 3d⁹)</div>
          <p>A tabela periódica é um mapa da distribuição eletrônica:</p>
          <ul><li><b>Período</b> = número de camadas ocupadas (maior n). Fe: n = 4 → 4º período.</li>
          <li><b>Bloco</b> = subnível que recebe o último elétron (Pauling): s (grupos 1–2), p (13–18), d (3–12, metais de transição), f (lantanídeos e actinídeos).</li>
          <li><b>Grupo</b>: bloco s → número de elétrons s da valência; bloco p → 12 + elétrons s e p da valência (Cl: 2 + 5 = 7 → grupo 17); bloco d → elétrons s + d (Fe: 2 + 6 = 8 → grupo 8).</li></ul>
          <p>Elementos do mesmo grupo têm a mesma configuração de valência (todos os halogênios terminam em ns² np⁵), por isso têm química parecida.</p>`,
      },
    ],
    formulas: [
      { nome: "Capacidade de nível e de subnível", eq: `máx(nível) = 2n² &nbsp;&nbsp; máx(subnível) = 2(2ℓ + 1)`, simbolos: [["n", "número quântico principal (nível)", "—"], ["ℓ", "número quântico secundário (s = 0, p = 1, d = 2, f = 3)", "—"]], obs: "2ℓ + 1 é o número de orbitais do subnível; cada orbital comporta 2 elétrons." },
      { nome: "Ordem de preenchimento (regra de n + ℓ)", eq: `1s 2s 2p 3s 3p 4s 3d 4p 5s 4d 5p 6s 4f 5d 6p 7s 5f 6d 7p`, simbolos: [["n + ℓ", "menor soma enche primeiro; empate, menor n", "—"]], obs: "Exceções importantes: Cr (4s¹ 3d⁵) e Cu (4s¹ 3d¹⁰)." },
      { nome: "Valores permitidos dos números quânticos", eq: `ℓ = 0 … n − 1 &nbsp; mℓ = −ℓ … +ℓ &nbsp; mₛ = ±½`, simbolos: [["mℓ", "orbital dentro do subnível", "—"], ["mₛ", "spin do elétron", "—"]], obs: "Pauli: nenhum par de elétrons do átomo tem os quatro iguais." },
    ],
    exemplos: [
      {
        t: "direto",
        enunciado: `Faça a distribuição eletrônica do cloro (Z = 17), diga a camada de valência e a posição na tabela.`,
        passos: [`Pauling até somar 17: 1s² 2s² 2p⁶ 3s² 3p⁵ (2 + 2 + 6 + 2 + 5 = 17).`, `Camadas: K 2, L 8, M 7. Valência: camada M (n = 3), com 3s² 3p⁵ = 7 elétrons.`, `Período 3 (maior n); bloco p; grupo 12 + 7 = 17 (halogênios).`, `Cl⁻: ganha 1 elétron → 3p⁶, configuração do argônio.`],
        resposta: `<b>1s² 2s² 2p⁶ 3s² 3p⁵</b>; 7 elétrons de valência; 3º período, grupo 17`,
      },
      {
        t: "íon de transição",
        enunciado: `Escreva as configurações do Fe (Z = 26), do Fe²⁺ e do Fe³⁺, e diga quantos elétrons desemparelhados tem cada um.`,
        passos: [`Fe: 1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d⁶ = [Ar] 4s² 3d⁶.`, `Fe²⁺: saem os 2 elétrons da camada mais externa (4s) → [Ar] 3d⁶.`, `Fe³⁺: sai mais 1, agora do 3d → [Ar] 3d⁵.`, `Hund no 3d: d⁶ = ↑↓ ↑ ↑ ↑ ↑ → 4 desemparelhados (Fe e Fe²⁺); d⁵ = ↑ ↑ ↑ ↑ ↑ → 5 desemparelhados (Fe³⁺).`],
        resposta: `Fe <b>[Ar] 4s² 3d⁶</b> (4); Fe²⁺ <b>[Ar] 3d⁶</b> (4); Fe³⁺ <b>[Ar] 3d⁵</b> (5)`,
      },
      {
        t: "de prova (números quânticos)",
        enunciado: `O elétron mais energético de um átomo neutro, no estado fundamental, tem n = 3, ℓ = 2, mℓ = −1 e mₛ = −½. Qual é o elemento? (Convenção: orbitais do menor mℓ para o maior; primeiro elétron de cada orbital com +½.)`,
        passos: [`n = 3 e ℓ = 2 → subnível 3d. Orbitais: mℓ = −2, −1, 0, +1, +2.`, `Os 5 primeiros elétrons entram com +½, um em cada orbital (Hund). Os seguintes entram com −½: o 6º em mℓ = −2, o 7º em mℓ = −1.`, `Então o subnível é 3d⁷: [Ar] 4s² 3d⁷.`, `Z = 18 (Ar) + 2 + 7 = 27.`],
        resposta: `<b>Z = 27: cobalto (Co)</b>`,
      },
    ],
    erros: [
      { errado: `Escrever o ferro como 1s² 2s² 2p⁶ 3s² 3p⁶ 3d⁸.`, certo: `1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d⁶.`, porque: `O 4s tem energia menor que o 3d e enche antes (n + ℓ = 4 contra 5).` },
      { errado: `Tirar os elétrons do 3d ao formar Fe²⁺: [Ar] 4s² 3d⁴.`, certo: `Tirar primeiro da camada mais externa: Fe²⁺ = [Ar] 3d⁶.`, porque: `Depois que o 3d está ocupado, o 4s fica mais externo e é o primeiro a perder elétrons.` },
      { errado: `Dizer que a camada de valência do ferro é a 3d, por ser o último subnível preenchido.`, certo: `A valência é a camada de maior n: no ferro, a camada 4 (4s²), com 2 elétrons.`, porque: `Último subnível (ordem energética) e camada mais externa (ordem geométrica) são coisas diferentes.` },
      { errado: `Preencher o 2p do nitrogênio como ↑↓ ↑ _ .`, certo: `↑ ↑ ↑: um elétron em cada orbital antes de emparelhar (Hund).`, porque: `Elétrons em orbitais separados se repelem menos, e spins paralelos baixam a energia.` },
      { errado: `Escrever o cobre como [Ar] 4s² 3d⁹.`, certo: `[Ar] 4s¹ 3d¹⁰.`, porque: `O subnível d cheio é mais estável; o mesmo ocorre com o Cr ([Ar] 4s¹ 3d⁵, d semicheio).` },
    ],
    aplicacoes: [
      `<b>Fogos de artifício e lâmpadas</b>: as cores (sódio amarelo, estrôncio vermelho, cobre azul-esverdeado) vêm de elétrons que saltam entre níveis e emitem luz de energia definida.`,
      `<b>Ímãs e ressonância magnética</b>: elétrons desemparelhados (Fe, Co, Ni, Gd) dão origem ao magnetismo; o gadolínio (4f⁷) é usado como contraste em ressonância.`,
      `<b>Semicondutores</b>: o silício tem 4 elétrons de valência (3s² 3p²); dopá-lo com P (5) ou B (3) cria os materiais n e p dos chips e das células solares.`,
      `<b>Biologia</b>: o ferro da hemoglobina alterna configurações eletrônicas ao ligar o O₂; o monóxido de carbono se liga ao mesmo ferro com mais força e bloqueia o transporte de oxigênio.`,
    ],
    teste: [
      { p: `Por que o 4s é preenchido antes do 3d?`, op: [`Porque 4 é maior que 3.`, `Porque o 4s tem energia menor (n + ℓ = 4, contra 5 do 3d).`, `Porque o subnível d está sempre vazio nos metais.`, `É uma exceção, como no cobre.`], certa: 1, explica: `A ordem segue a energia, e a regra de n + ℓ resume isso. Não é exceção: vale para todos os elementos a partir do potássio.` },
      { p: `Quantos elétrons cabem no máximo num orbital?`, op: [`1`, `6`, `8`, `2`], certa: 3, explica: `Pauli: dois elétrons num mesmo orbital já têm n, ℓ e mℓ iguais; só podem diferir no spin (+½ e −½).` },
      { p: `Qual é a configuração do Na⁺ (Z = 11)?`, op: [`1s² 2s² 2p⁶ 3s¹`, `1s² 2s² 2p⁶`, `1s² 2s² 2p⁶ 3s²`, `1s² 2s² 2p⁵ 3s¹`], certa: 1, explica: `O Na perde o elétron 3s (o mais externo) e fica com 10 elétrons, como o neônio.` },
      { p: `Um elemento termina em ns² np⁴ na camada de valência, com n = 3. Onde ele fica na tabela?`, op: [`Período 3, grupo 16 (é o enxofre).`, `Período 4, grupo 14.`, `Período 3, grupo 4.`, `Período 6, grupo 16.`], certa: 0, explica: `Maior n = 3 → 3º período. Bloco p com 2 + 4 = 6 elétrons de valência → grupo 12 + 6 = 18? Não: 12 + 6 = 18 seria com np⁶. Aqui são 6 elétrons s + p, então grupo 10 + 6 = 16. Regra prática: grupo = 10 + elétrons de valência no bloco p (equivalente a 12 + elétrons p).` },
      { p: `Quantos elétrons desemparelhados tem o oxigênio (Z = 8, 2p⁴)?`, op: [`0`, `4`, `2`, `1`], certa: 2, explica: `Hund: os 4 elétrons do 2p ficam ↑↓ ↑ ↑. Dois desemparelhados, o que ajuda a explicar o paramagnetismo do oxigênio.` },
    ],
    resumo: [
      `Capacidades: s 2, p 6, d 10, f 14; nível n até 2n² elétrons.`,
      `Ordem de Pauling: 1s 2s 2p 3s 3p 4s 3d 4p 5s 4d 5p 6s 4f 5d 6p 7s…`,
      `Pauli: no máximo 2 elétrons por orbital, com spins opostos. Hund: um por orbital antes de emparelhar.`,
      `Números quânticos: n, ℓ (0 a n − 1), mℓ (−ℓ a +ℓ), mₛ (±½).`,
      `Valência = camada de maior n, não o último subnível preenchido.`,
      `Cátions perdem primeiro da camada mais externa (4s antes de 3d). Exceções: Cr 4s¹ 3d⁵ e Cu 4s¹ 3d¹⁰.`,
      `Período = maior n; bloco = último subnível; grupo sai dos elétrons de valência.`,
    ],
    alem: {
      t: "Para ir além: o que é, de fato, um orbital",
      h: `<p>Na mecânica quântica, o elétron não segue uma órbita: ele é descrito por uma <b>função de onda</b> ψ, solução da equação de Schrödinger. O orbital é essa função, e |ψ|² dá a probabilidade de encontrar o elétron em cada ponto. Os números n, ℓ e mℓ aparecem naturalmente como condições para que a solução faça sentido (não exploda no infinito, volte ao mesmo valor ao dar uma volta completa). O spin, por outro lado, só surge na teoria relativística de Dirac.</p>
        <p>No átomo de hidrogênio, a energia depende só de n: 2s e 2p têm a mesma energia. Em átomos com vários elétrons, os elétrons internos <b>blindam</b> a carga do núcleo, e um elétron s, que “penetra” mais perto do núcleo, sente carga efetiva maior e fica com energia menor que um p ou d do mesmo nível. É isso que a regra de n + ℓ tenta resumir, e é por isso que ela tem exceções: além do Cr e do Cu, há Mo, Ag, Au, Pd (4d¹⁰ 5s⁰), La e outros.</p>
        <p>Um detalhe sutil: depois de preenchido, o 3d fica com energia <b>menor</b> que o 4s nos metais de transição. O 4s enche primeiro porque a configuração total do átomo fica mais estável assim, mas sai primeiro na ionização. As duas afirmações parecem contraditórias e não são: a energia de um orbital depende de quais outros estão ocupados.</p>`,
    },
  };
})();
