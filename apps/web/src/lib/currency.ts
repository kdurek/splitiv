export const formatCurrency = (amount: number) =>
  Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    currencySign: "accounting",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
