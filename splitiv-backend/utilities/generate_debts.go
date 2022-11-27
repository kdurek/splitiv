package utilities

import (
	"github.com/shopspring/decimal"
	"sort"
	"splitiv/model"
)

func GenerateDebts(users []model.ExpenseUsers) []model.Debt {
	debts := make([]model.Debt, 0)

	usersBalance := map[uint]decimal.Decimal{}

	for _, user := range users {
		paidAmount, _ := decimal.NewFromString(user.Paid)
		owedAmount, _ := decimal.NewFromString(user.Owed)
		net := paidAmount.Sub(owedAmount)
		usersBalance[user.UserID] = usersBalance[user.UserID].Add(net)
	}

	usersBalanceKeys := make([]int, 0)
	for k, _ := range usersBalance {
		usersBalanceKeys = append(usersBalanceKeys, int(k))
	}
	sort.Ints(usersBalanceKeys)

	for _, paidId := range usersBalanceKeys {
		paidAmount := usersBalance[uint(paidId)]

		if paidAmount.Sign() == 0 {
			continue
		}

		for _, owedId := range usersBalanceKeys {
			owedAmount := usersBalance[uint(owedId)]

			if paidId == owedId || paidAmount == owedAmount || owedAmount.Sign() == 0 {
				continue
			}

			if paidAmount.Sign() < 0 && owedAmount.Sign() < 0 {
				continue
			}

			if paidAmount.Sign() > 0 && owedAmount.Sign() > 0 {
				continue
			}

			if owedAmount.Sign() > 0 {
				usersBalance[uint(paidId)] = paidAmount.Sub(paidAmount)
				usersBalance[uint(owedId)] = owedAmount.Add(paidAmount)
				debts = append(debts, model.Debt{
					FromID: uint(paidId),
					ToID:   uint(owedId),
					Amount: paidAmount.Abs().StringFixed(2),
				})
				break
			}

			if owedAmount.Sign() < 0 {
				usersBalance[uint(paidId)] = paidAmount.Add(owedAmount)
				usersBalance[uint(owedId)] = owedAmount.Sub(owedAmount)
				debts = append(debts, model.Debt{
					FromID: uint(owedId),
					ToID:   uint(paidId),
					Amount: owedAmount.Abs().StringFixed(2),
				})
				break
			}
		}

	}
	return debts
}
