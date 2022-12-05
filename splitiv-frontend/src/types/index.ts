export interface Group {
  id: string;
  name: string;
  admin: string;
  members: User[];
  debts: Debt[];
}

export interface User {
  id: string;
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
  id: string;
  owed: string;
  paid: string;
  expenseId: string;
  userId: string;
  user: User;
}

export interface Expense {
  id: string;
  name: string;
  amount: string;
  users: ExpenseUser[];
  groupId: string;
  type: string;
  repayments: Debt[];
}

export interface Debt {
  expenseId: string;
  fromId: string;
  toId: string;
  amount: string;
}
