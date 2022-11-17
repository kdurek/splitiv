package router

import (
	"github.com/gofiber/fiber/v2"
	"splitiv/controller"
	"splitiv/middleware"
)

func Initialize(router *fiber.App) {
	groups := router.Group("/groups", middleware.TokenCheck)
	groups.Get("/", controller.GetGroups)
	groups.Post("/", controller.CreateGroup)

	group := router.Group("/groups/:groupId", middleware.TokenCheck)
	group.Get("/", controller.GetGroup)
	group.Delete("/", controller.DeleteGroup)

	groupUsers := router.Group("/groups/:groupId/users", middleware.TokenCheck)
	groupUsers.Post("/", controller.AddUserToGroup)
	groupUsers.Delete("/", controller.DeleteUserFromGroup)

	groupExpenses := router.Group("/groups/:groupId/expenses", middleware.TokenCheck)
	groupExpenses.Get("/", controller.GetExpensesByGroup)
	groupExpenses.Post("/", controller.CreateExpense)
	groupExpenses.Delete("/:expenseId", controller.DeleteExpense)

	users := router.Group("/users", middleware.TokenCheck)
	users.Get("/", controller.GetUsers)
	users.Get("/me", controller.GetCurrentUser)

	auth := router.Group("/auth", middleware.TokenCheck)
	auth.Get("/login", controller.Login)
}
