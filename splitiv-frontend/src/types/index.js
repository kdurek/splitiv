import { arrayOf, number, shape, string } from "prop-types";

export const userType = shape({
  picture: string,
  givenName: string,
  familyName: string,
  name: string,
  balance: string,
});

export const debtType = shape({
  from: number,
  to: number,
  amount: string,
});

export const expenseType = shape({
  users: arrayOf(userType),
});
