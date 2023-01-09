import { polishPlurals } from "utils/polishPlurals";

export const unitsList = [
  {
    singularNominativ: "gram",
    pluralNominativ: "gramy",
    pluralGenitive: "gramów",
  },
  {
    singularNominativ: "kilogram",
    pluralNominativ: "kilogramy",
    pluralGenitive: "kilogramów",
  },
  {
    singularNominativ: "mililitr",
    pluralNominativ: "mililitry",
    pluralGenitive: "mililitrów",
  },
  {
    singularNominativ: "litr",
    pluralNominativ: "litry",
    pluralGenitive: "litrów",
  },
  {
    singularNominativ: "szczypta",
    pluralNominativ: "szczypty",
    pluralGenitive: "szczypt",
  },
  {
    singularNominativ: "łyżka",
    pluralNominativ: "łyżki",
    pluralGenitive: "łyżek",
  },
  {
    singularNominativ: "łyżeczka",
    pluralNominativ: "łyżeczki",
    pluralGenitive: "łyżeczek",
  },
  {
    singularNominativ: "szklanka",
    pluralNominativ: "szklanki",
    pluralGenitive: "szklanek",
  },
  {
    singularNominativ: "sztuka",
    pluralNominativ: "sztuki",
    pluralGenitive: "sztuk",
  },
  {
    singularNominativ: "opakowanie",
    pluralNominativ: "opakowania",
    pluralGenitive: "opakowań",
  },
];

export const correctUnit = (unit: string, value: number) => {
  const foundUnit = unitsList.find(
    (unitMap) => unitMap.singularNominativ === unit
  );

  if (!foundUnit) return unit;

  const plur = polishPlurals(
    foundUnit.singularNominativ,
    foundUnit.pluralNominativ,
    foundUnit.pluralGenitive,
    value
  );

  return plur;
};
