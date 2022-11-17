package model

type Debt struct {
	ExpenseID uint   `json:"expenseId,omitempty"`
	FromID    uint   `json:"from,omitempty"`
	ToID      uint   `json:"to,omitempty"`
	Amount    string `json:"amount,omitempty"`
}
