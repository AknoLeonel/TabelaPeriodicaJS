/** Conventional Commits (veja AGENTS.md). Ex.: "feat(estudo): aula de óptica (#12)". */
module.exports = {
	extends: ["@commitlint/config-conventional"],
	rules: {
		"subject-case": [0],
		"body-max-line-length": [0],
		"footer-max-line-length": [0],
		"header-max-length": [2, "always", 120],
	},
};
