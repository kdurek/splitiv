package controller

import (
	"github.com/gofiber/fiber/v2"
	"github.com/shopspring/decimal"
	"splitiv/config"
	"splitiv/helpers"
	"splitiv/model"
	"splitiv/service"
	"splitiv/utilities"
)

func GetGroups(c *fiber.Ctx) error {
	user, err := helpers.GetUserFromContext(c)
	if err != nil {
		return c.SendStatus(fiber.StatusBadRequest)
	}

	groups, err := service.GetGroupsByUser(user)
	if err != nil {
		return c.SendStatus(fiber.StatusBadRequest)
	}

	return c.Status(fiber.StatusOK).JSON(groups)
}

func GetGroup(c *fiber.Ctx) error {
	groupId := helpers.GetUintIdFromParams(c, "groupId")

	var group model.Group
	if result := config.DB.Preload("Members").First(&group, groupId); result.Error != nil {
		return c.SendStatus(fiber.StatusOK)
	}

	var expenses []model.Expense
	config.DB.Where("group_id = ?", groupId).Preload("Users").Find(&expenses)

	var expenseUsers []model.ExpenseUsers
	for _, expense := range expenses {
		expenseUsers = append(expenseUsers, expense.Users...)
	}

	type MemberWithBalance struct {
		model.User
		Balance string `json:"balance"`
	}
	var newMembers []MemberWithBalance
	for _, member := range group.Members {
		var newBalance decimal.Decimal
		for _, expenseUser := range expenseUsers {
			if member.ID == expenseUser.UserID {
				paidFloat, _ := decimal.NewFromString(expenseUser.Paid)
				owedFloat, _ := decimal.NewFromString(expenseUser.Owed)
				calculatedBalance := paidFloat.Sub(owedFloat)
				newBalance = newBalance.Add(calculatedBalance)
			}
		}

		memberBalance := MemberWithBalance{
			User:    member,
			Balance: newBalance.StringFixed(2),
		}
		newMembers = append(newMembers, memberBalance)
	}

	type GroupWithNewMembers struct {
		model.Group
		Members []MemberWithBalance `json:"members"`
	}

	resp := GroupWithNewMembers{
		Group:   group,
		Members: newMembers,
	}

	debts := utilities.GenerateDebts(expenseUsers)

	response := struct {
		GroupWithNewMembers
		Debts []model.Debt `json:"debts"`
	}{
		GroupWithNewMembers: resp,
		Debts:               debts,
	}

	return c.Status(fiber.StatusOK).JSON(response)
}

func CreateGroup(c *fiber.Ctx) error {
	user, _ := helpers.GetUserFromContext(c)

	payload := new(model.Group)
	if err := c.BodyParser(payload); err != nil {
		return c.SendStatus(fiber.StatusBadRequest)
	}

	newGroup := model.Group{
		Name:  payload.Name,
		Admin: user.ID,
	}

	if err := newGroup.Create(); err != nil {
		return c.SendStatus(fiber.StatusBadRequest)
	}
	if err := newGroup.AddUser(user); err != nil {
		return c.SendStatus(fiber.StatusBadRequest)
	}

	return c.JSON(newGroup)
}

func DeleteGroup(c *fiber.Ctx) error {

	groupId := helpers.GetUintIdFromParams(c, "groupId")

	group, err := service.GetGroupById(groupId)
	if err != nil {
		return c.Status(500).SendString("No group found with ID")
	}

	if err := group.Delete(); err != nil {
		return c.SendStatus(fiber.StatusBadRequest)
	}

	//db.Model(&model.Group{ID: uint(groupId)}).Association("Members").Clear()
	return c.SendStatus(fiber.StatusOK)
}

func AddUserToGroup(c *fiber.Ctx) error {
	groupId := helpers.GetUintIdFromParams(c, "groupId")

	// Parse payload
	payload := new(struct {
		UserID uint `json:"userId"`
	})
	if err := c.BodyParser(&payload); err != nil {
		return c.SendStatus(fiber.StatusBadRequest)
	}

	group, _ := service.GetGroupById(groupId)
	user, _ := service.GetUserById(payload.UserID)

	if helpers.IsUserInGroup(user, group) {
		return c.Status(500).SendString("User already in group")
	}

	userGroup, _ := service.GetUserGroup(user, group)

	if userGroup.DeletedAt.Valid {
		if err := config.DB.Unscoped().Model(&model.UserGroups{}).Where("group_id", group.ID).Where("user_id", user.ID).Update("deleted_at", nil).Error; err != nil {
			return c.SendStatus(fiber.StatusBadRequest)
		}

		return c.SendString("OK")
	}

	if err := group.AddUser(user); err != nil {
		return c.SendStatus(fiber.StatusBadRequest)
	}

	return c.SendString("OK")
}

func DeleteUserFromGroup(c *fiber.Ctx) error {
	groupId := helpers.GetUintIdFromParams(c, "groupId")

	// Parse payload
	payload := new(struct {
		UserID uint `json:"userId"`
	})
	if err := c.BodyParser(&payload); err != nil {
		return c.SendStatus(fiber.StatusBadRequest)
	}

	group, _ := service.GetGroupById(groupId)
	user, _ := service.GetUserById(payload.UserID)

	// Check if user is in group
	if !helpers.IsUserInGroup(user, group) {
		return c.Status(500).SendString("User not found in group")
	}

	if err := group.DeleteUser(user); err != nil {
		return c.SendStatus(fiber.StatusBadRequest)
	}

	return c.SendString("OK")
}
