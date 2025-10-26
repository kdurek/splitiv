export const pluralize = (
  count: number,
  singular: string,
  plural234: string,
  plural5: string
): string => {
  const pluralRules = new Intl.PluralRules("pl-PL");
  const category = pluralRules.select(count);

  if (count === 0) {
    return plural5; // For 0, use the plural5 form (e.g., 0 kotów)
  }

  switch (category) {
    case "one":
      return singular;
    case "few":
      return plural234;
    case "many":
    case "other": // 'other' category often covers cases like 5, 6, 7, ... and 0
      return plural5;
    default:
      return plural5;
  }
};
