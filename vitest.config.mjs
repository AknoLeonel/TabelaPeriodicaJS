import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		// no teste de mutação (STRYKER=1) o código é instrumentado pelo Stryker, o que quebraria os contratos de arquitetura
		include: [process.env.STRYKER ? "tests/{unit,integration}/**/*.test.mjs" : "tests/{unit,integration,arch}/**/*.test.mjs"],
		environment: "node",
		testTimeout: 60_000,
		coverage: {
			provider: "v8",
			// os motores e o leitor de expressões rodam em Node; a interface é coberta pelo e2e (Playwright)
			include: ["js/estudo/*-calc.js", "js/estudo/expressao.js"],
			reporter: ["text-summary", "lcov", "json-summary"],
			reportsDirectory: "coverage",
			thresholds: { lines: 70, functions: 70, statements: 70, branches: 55 },
		},
	},
});
