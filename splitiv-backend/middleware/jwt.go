package middleware

import (
	"github.com/gofiber/fiber/v2"
	jwtware "github.com/gofiber/jwt/v3"
	"splitiv/config"
	"splitiv/helpers"
)

var TokenCheck = jwtware.New(jwtware.Config{
	SigningMethod:  "RS256",
	KeySetURLs:     []string{config.Env("AUTH0_JWKS")},
	SuccessHandler: attachUser,
})

func attachUser(c *fiber.Ctx) error {
	user, _ := helpers.GetUserFromContext(c)

	c.Locals("user", user)
	c.Locals("user_id", user.ID)

	return c.Next()
}
