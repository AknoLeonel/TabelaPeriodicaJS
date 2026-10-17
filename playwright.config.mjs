import { defineConfig, devices } from "@playwright/test";

const PORTA = Number(process.env.PORTA_E2E || 4173);

export default defineConfig({
	testDir: "tests/e2e",
	timeout: 120_000,
	expect: { timeout: 10_000 },
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
	use: {
		baseURL: `http://127.0.0.1:${PORTA}`,
		trace: "retain-on-failure",
		screenshot: "only-on-failure",
		// o service worker (sw.js) atenderia as requisições antes do page.route; só o teste de PWA o liga
		serviceWorkers: "block",
	},
	projects: [
		{ name: "celular", use: { ...devices["Pixel 7"], browserName: "chromium" } },
		{ name: "computador", use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 860 } } },
	],
	webServer: {
		command: `python3 -m http.server ${PORTA} --bind 127.0.0.1`,
		url: `http://127.0.0.1:${PORTA}/index.html`,
		reuseExistingServer: !process.env.CI,
		stdout: "ignore",
		stderr: "pipe",
	},
});
