export function canSettleDebt(
  userId: string,
  debtorId: string,
  payerId: string,
  adminId: string,
): boolean {
  return userId === debtorId || userId === payerId || userId === adminId;
}

export function canUndoLog(
  userId: string,
  debtorId: string,
  payerId: string,
  adminId: string,
): boolean {
  return userId === debtorId || userId === payerId || userId === adminId;
}

export function canDeleteExpense(
  userId: string,
  payerId: string,
  adminId: string,
  isDebtor: boolean,
): boolean {
  return userId === payerId || userId === adminId || isDebtor;
}
