const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatDatePtBR(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate));
}

export function formatAchadosCount(count: number, store: string | null): string {
  const noun = count === 1 ? "achado" : "achados";
  if (store) {
    return `${count} ${noun} em ${store}`;
  }
  return `${count} ${noun}`;
}
