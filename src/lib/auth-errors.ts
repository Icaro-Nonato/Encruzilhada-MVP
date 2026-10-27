const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "E-mail ou senha incorretos.",
  email_not_confirmed: "Confirme seu e-mail antes de entrar.",
  user_already_exists: "Já existe uma conta com este e-mail.",
  weak_password: "Senha fraca. Use pelo menos 6 caracteres.",
  over_email_send_rate_limit:
    "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
  over_request_rate_limit:
    "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
};

const FALLBACK_MESSAGE = "Algo deu errado. Tente novamente.";

// Traduz os erros do Supabase Auth para mensagens amigáveis em português.
export function translateAuthError(error: { code?: string }) {
  return (error.code && ERROR_MESSAGES[error.code]) || FALLBACK_MESSAGE;
}
