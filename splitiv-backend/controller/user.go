package controller

import (
	"github.com/gofiber/fiber/v2"
	"splitiv/helpers"
	"splitiv/service"
)

func GetUsers(c *fiber.Ctx) error {
	users, err := service.GetUsers()
	if err != nil {
		return c.SendStatus(fiber.StatusBadRequest)
	}
	return c.Status(fiber.StatusOK).JSON(users)
}

func GetCurrentUser(c *fiber.Ctx) error {
	user, err := helpers.GetUserFromContext(c)
	if err != nil {
		return c.SendStatus(fiber.StatusBadRequest)
	}
	return c.Status(fiber.StatusOK).JSON(user)
}
