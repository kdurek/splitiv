package middleware

import (
	"encoding/json"
	"github.com/gofiber/fiber/v2"
	jwtware "github.com/gofiber/jwt/v3"
	"splitiv/config"
	"splitiv/helpers"
	"splitiv/model"
)

var TokenCheck = jwtware.New(jwtware.Config{
	SigningMethod:  "RS256",
	KeySetURLs:     []string{config.Env("AUTH0_JWKS")},
	SuccessHandler: onSuccess,
})

type APIResponse struct {
	Sub        string `json:"sub"`
	GivenName  string `json:"given_name"`
	FamilyName string `json:"family_name"`
	Name       string `json:"name"`
	Nickname   string `json:"nickname"`
	Picture    string `json:"picture"`
	Email      string `json:"email"`
}

func onSuccess(c *fiber.Ctx) error {
	if _, err := helpers.GetUserFromContext(c); err != nil {
		headers := c.GetReqHeaders()
		token := headers["Authorization"]

		a := fiber.AcquireAgent()
		req := a.Request()
		req.Header.SetMethod(fiber.MethodGet)
		req.Header.Set("Authorization", token)
		req.SetRequestURI("https://" + config.Env("AUTH0_DOMAIN") + "/userinfo")
		if err := a.Parse(); err != nil {
			return c.SendStatus(fiber.StatusBadRequest)
		}

		_, body, _ := a.Bytes()

		var response APIResponse
		if err := json.Unmarshal(body, &response); err != nil {
			return c.SendStatus(fiber.StatusBadRequest)
		}

		user := model.User{
			Sub:        response.Sub,
			GivenName:  response.GivenName,
			FamilyName: response.FamilyName,
			Name:       response.Name,
			Nickname:   response.Nickname,
			Picture:    response.Picture,
			Email:      response.Email,
		}

		config.DB.Create(&user)

		//if config.DB.Where("sub = ?", user.Sub).Updates(&user).RowsAffected == 0 {
		//	config.DB.Create(&user)
		//}
	}

	return c.Next()
}
