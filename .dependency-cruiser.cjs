/**
 * Contratos de arquitetura verificados pelo dependency-cruiser (npm run arch).
 * O site carrega os scripts por <script>/catálogo, então as dependências via
 * require() existem só entre motores (que também rodam em Node). Os contratos
 * que dependem de globais (DOM, window.LAB) ficam em tests/arch/contratos.test.mjs.
 */
module.exports = {
	forbidden: [
		{
			name: "motor-nao-depende-de-interface",
			severity: "error",
			comment: "Motores (*-calc.js, expressao.js) são funções puras: só podem depender de outros motores e dos dados.",
			from: { path: "^js/estudo/([a-z0-9-]+-calc|expressao)\\.js$" },
			to: { pathNot: "^js/(estudo/([a-z0-9-]+-calc|expressao)|dados)\\.js$" },
		},
		{
			name: "sem-ciclos",
			severity: "error",
			from: {},
			to: { circular: true },
		},
		{
			name: "sem-caminho-quebrado",
			severity: "error",
			from: {},
			to: { couldNotResolve: true },
		},
		{
			name: "codigo-do-site-nao-usa-pacotes-npm",
			severity: "error",
			comment: "O site é estático e sem build: nada em js/ pode importar de node_modules.",
			from: { path: "^js/" },
			to: { dependencyTypes: ["npm", "npm-dev", "npm-optional", "npm-peer", "npm-no-pkg"] },
		},
	],
	options: {
		doNotFollow: { path: "node_modules" },
		exclude: { path: "^(node_modules|coverage|reports|tests)" },
		moduleSystems: ["cjs"],
	},
};
