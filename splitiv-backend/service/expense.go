package service

import (
	"splitiv/config"
	"splitiv/model"
	"splitiv/utilities"
)

type APIExpense struct {
	model.Expense
	Repayments []model.Debt `json:"repayments"`
}

func GetExpensesByGroup(id uint) (response []APIExpense, err error) {
	var expenses []model.Expense
	err = config.DB.Where("group_id = ?", id).Order("created_at desc").Preload("Users.User").Find(&expenses).Error

	for _, expense := range expenses {
		newRepayments := utilities.GenerateDebts(expense.Users)

		memberBalance := APIExpense{
			Expense:    expense,
			Repayments: newRepayments,
		}

		response = append(response, memberBalance)
	}

	return response, err
}

func GetExpenseById(id uint) (expense model.Expense, err error) {
	err = config.DB.Where("id = ?", id).Find(&expense).Error

	return expense, err
}
