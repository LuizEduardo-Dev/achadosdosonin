const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatCurrencyBRL(cents: number): string {
  return brlFormatter.format(cents / 100);
}

export function calculateDiscountPercentage(
  priceCents: number,
  originalPriceCents: number | null,
): number | null {
  if (!originalPriceCents || originalPriceCents <= priceCents) {
    return null;
  }

  const percentage = Math.round(
    ((originalPriceCents - priceCents) / originalPriceCents) * 100,
  );

  return percentage > 0 ? percentage : null;
}

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
