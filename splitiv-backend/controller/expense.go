package controller

import (
	"fmt"
	"github.com/gofiber/fiber/v2"
	"splitiv/config"
	"splitiv/helpers"
	"splitiv/model"
	"splitiv/service"
	"splitiv/utilities"
)

func CreateExpense(c *fiber.Ctx) error {
	groupId := helpers.GetUintIdFromParams(c, "groupId")

	payload := model.Expense{}

	if err := c.BodyParser(&payload); err != nil {
		fmt.Println(err)
		return c.SendStatus(fiber.StatusBadRequest)
	}

	if payload.Type == "" {
		payload.Type = "expense"
	}

	var newRepayments []model.Debt
	newRepayments = utilities.GenerateDebts(payload.Users)

	newExpense := model.Expense{
		Name:    payload.Name,
		Amount:  payload.Amount,
		Users:   payload.Users,
		GroupID: groupId,
		Type:    payload.Type,
	}

	if err := config.DB.Create(&newExpense).Error; err != nil {
		return c.SendStatus(fiber.StatusBadRequest)
	}

	response := struct {
		model.Expense
		Repayments []model.Debt `json:"repayments"`
	}{
		Expense:    newExpense,
		Repayments: newRepayments,
	}

	return c.Status(fiber.StatusCreated).JSON(response)
}

func GetExpensesByGroup(c *fiber.Ctx) error {
	groupId := helpers.GetUintIdFromParams(c, "groupId")

	expenses, err := service.GetExpensesByGroup(groupId)
	if err != nil {
		return c.SendStatus(fiber.StatusBadRequest)
	}

	return c.Status(fiber.StatusOK).JSON(expenses)
}

func DeleteExpense(c *fiber.Ctx) error {
	expenseId := helpers.GetUintIdFromParams(c, "expenseId")
	expense, _ := service.GetExpenseById(expenseId)

	if err := expense.Delete(); err != nil {
		return c.SendStatus(fiber.StatusBadRequest)
	}

	return c.SendStatus(fiber.StatusOK)
}
