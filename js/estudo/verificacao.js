/*
 * Verificação das aulas (só dados):
 *
 *   E.fontes[materia]   → referências usadas como base em todas as aulas da matéria.
 *                          Uma aula pode acrescentar as suas em `fontes: [...]`.
 *   E.revisoes["materia/aula"] → quem revisou a aula. Preencha SÓ depois de um
 *                          professor revisar de verdade (veja docs/revisao-professor.md):
 *     "quimica/massa": { por: "Prof.ª Nome Sobrenome", formacao: "Licenciada em Química (USP)", data: "2026-11-02" },
 *
 * Sem revisão registrada, a aula mostra "aguardando revisão de professor".
 */
(function () {
  "use strict";
  const E = window.LAB && window.LAB.estudo;
  if (!E) return;

  E.fontes = E.fontes || {};
  E.fontes.quimica = [
    "ATKINS, P.; JONES, L.; LAVERMAN, L. Princípios de Química: questionando a vida moderna e o meio ambiente. Porto Alegre: Bookman.",
    "FLOWERS, P. et al. Chemistry 2e. Houston: OpenStax (Rice University), 2019. Livre em openstax.org.",
    "IUPAC. Compendium of Chemical Terminology (Gold Book) e tabela de massas atômicas padrão.",
  ];
  E.fontes.fisica = [
    "HALLIDAY, D.; RESNICK, R.; WALKER, J. Fundamentos de Física. Rio de Janeiro: LTC.",
    "NUSSENZVEIG, H. M. Curso de Física Básica. São Paulo: Blucher.",
    "LING, S. J. et al. University Physics. Houston: OpenStax (Rice University). Livre em openstax.org.",
  ];
  E.fontes.matematica = [
    "IEZZI, G. et al. Fundamentos de Matemática Elementar. São Paulo: Atual.",
    "STEWART, J. Cálculo, vol. 1. São Paulo: Cengage Learning.",
    "ABRAMSON, J. Precalculus 2e. Houston: OpenStax (Rice University). Livre em openstax.org.",
  ];
  E.fontes.biologia = [
    "URRY, L. A. et al. Biologia de Campbell. Porto Alegre: Artmed.",
    "ALBERTS, B. et al. Biologia Molecular da Célula. Porto Alegre: Artmed.",
    "CLARK, M. A.; DOUGLAS, M.; CHOI, J. Biology 2e. Houston: OpenStax (Rice University). Livre em openstax.org.",
  ];
  E.fontes.pesquisa = [
    "VUOLO, J. H. Fundamentos da Teoria de Erros. São Paulo: Blucher.",
    "INMETRO. Avaliação de dados de medição: guia para a expressão de incerteza de medição (GUM 2008).",
    "BUSSAB, W. O.; MORETTIN, P. A. Estatística Básica. São Paulo: Saraiva.",
  ];

  // Preencha aqui as revisões feitas por professores (nunca invente uma revisão).
  E.revisoes = E.revisoes || {};
})();
