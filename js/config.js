/*
 * Configuração de observabilidade (js/obs.js). Tudo desligado por padrão:
 * sem chaves aqui, nenhum dado sai do navegador.
 *
 * O DSN do Sentry é público por natureza: fica no código do site de qualquer jeito. Nunca coloque aqui tokens de API ou chaves secretas.
 *
 * Para ativar um serviço, preencha o bloco dele e faça deploy. Detalhes no
 * README, seção "Observabilidade".
 */
window.ELEMENTAR_CONFIG = window.ELEMENTAR_CONFIG || {
	servico: "elementar",
	versao: "1.0.0",
	ambiente: location.hostname === "localhost" || location.hostname === "127.0.0.1" ? "desenvolvimento" : "producao",
	// fração das sessões que enviam dados (1 = todas, 0.2 = 20%)
	amostragem: 1,
	// respeita "Do Not Track" e "Global Privacy Control" do navegador
	respeitarPrivacidade: true,

	// OpenTelemetry (OTLP/HTTP, JSON). Ex.: "https://otel.seu-dominio.com" (o coletor precisa aceitar CORS)
	otlp: { endpoint: "", cabecalhos: {} },

	// Sentry: https://docs.sentry.io/platforms/javascript/
	sentry: { dsn: "", amostragemTraces: 0.2 },
};
