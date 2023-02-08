export function polishPlurals(
  singularNominativ: string,
  pluralNominativ: string,
  pluralGenitive: string,
  value: number
) {
  const absValue = Math.abs(value);
  if (absValue === 1) {
    return singularNominativ;
  }
  if (
    absValue % 10 >= 2 &&
    absValue % 10 <= 4 &&
    (absValue % 100 < 10 || absValue % 100 >= 20)
  ) {
    return pluralNominativ;
  }
  return pluralGenitive;
}
