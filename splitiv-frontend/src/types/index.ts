export interface Group {
  id: number;
  name: string;
  admin: number;
  members: User[];
  debts: Debt[];
}

export interface User {
  id: number;
  givenName: string;
  familyName: string;
  name: string;
  nickname: string;
  picture: string;
  email: string;
  groups: Group[];
  balance: string;
}

export interface ExpenseUser {
  id: number;
  owed: string;
  paid: string;
  expenseId: number;
  userId: number;
  user: User;
}

export interface Expense {
  id: number;
  name: string;
  amount: string;
  users: ExpenseUser[];
  groupId: number;
  type: string;
  repayments: Debt[];
}

export interface Debt {
  expenseId: number;
  from: number;
  to: number;
  amount: string;
}
