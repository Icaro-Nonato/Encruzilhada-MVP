const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "America/Sao_Paulo",
});

// Ex.: "27 de out. de 2026"
export function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}
