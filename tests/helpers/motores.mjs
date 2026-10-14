/**
 * Carrega os motores (UMD) em Node, como no navegador: os dados da tabela
 * periódica ficam em window.DADOS e cada motor lê dali.
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
globalThis.window = globalThis;
require("../../js/dados.js");

const motor = (nome) => require(`../../js/estudo/${nome}.js`);

export const Q = motor("quimica-calc");
export const X = motor("expressao");
export const M = motor("matematica-calc");
export const P = motor("pesquisa-calc");
export const R = motor("quimica-redox-calc");
export const T = motor("quimica-termo-calc");
export const F = motor("fisica-calc");
export const F2 = motor("fisica2-calc");
export const B = motor("biologia-calc");

/** Nenhum texto gerado pode vazar "undefined" ou "NaN" para quem estuda. */
export function textoLimpo(r) {
	const t = JSON.stringify(r.passos || []) + (r.respostaHTML || "") + (r.resposta || "");
	return !/\bundefined\b|\bNaN\b/.test(t);
}
