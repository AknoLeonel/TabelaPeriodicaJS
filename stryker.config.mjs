/**
 * Testes de mutação (npm run test:mutation): o Stryker altera o código dos
 * motores (troca + por −, < por <=...) e confere se algum teste percebe.
 * Mutantes que sobrevivem apontam contas que nenhum teste verifica de verdade.
 * Por padrão roda nos motores mais centrais; use MUTAR="js/estudo/x.js" para outro.
 */
const mutar = process.env.MUTAR ? process.env.MUTAR.split(",") : ["js/estudo/expressao.js", "js/estudo/quimica-calc.js"];

export default {
	testRunner: "vitest",
	// os testes carregam os motores com require dinâmico, então o Vitest não acha "testes relacionados"
	vitest: { configFile: "vitest.config.mjs", related: false },
	mutate: mutar,
	coverageAnalysis: "perTest",
	reporters: ["clear-text", "progress", "html"],
	htmlReporter: { fileName: "reports/mutation/index.html" },
	thresholds: { high: 80, low: 60, break: 50 },
	concurrency: 4,
	timeoutMS: 60000,
	tempDirName: ".stryker-tmp",
};
