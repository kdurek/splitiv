package controller

import (
	"encoding/json"
	"fmt"
	"github.com/gofiber/fiber/v2"
	"splitiv/config"
	"splitiv/model"
)

type APIResponse struct {
	Sub        string `json:"sub"`
	GivenName  string `json:"given_name"`
	FamilyName string `json:"family_name"`
	Name       string `json:"name"`
	Nickname   string `json:"nickname"`
	Picture    string `json:"picture"`
	Email      string `json:"email"`
}

func Login(c *fiber.Ctx) error {
	headers := c.GetReqHeaders()
	token := headers["Authorization"]

	a := fiber.AcquireAgent()
	req := a.Request()
	req.Header.SetMethod(fiber.MethodGet)
	req.Header.Set("Authorization", token)
	req.SetRequestURI("https://splitiv.eu.auth0.com/userinfo")
	if err := a.Parse(); err != nil {
		return c.SendStatus(fiber.StatusBadRequest)
	}

	_, body, _ := a.Bytes()

	var response APIResponse
	if err := json.Unmarshal(body, &response); err != nil {
		return c.SendStatus(fiber.StatusBadRequest)
	}
	fmt.Printf("%+v\n", response)

	user := model.User{
		Sub:        response.Sub,
		GivenName:  response.GivenName,
		FamilyName: response.FamilyName,
		Name:       response.Name,
		Nickname:   response.Nickname,
		Picture:    response.Picture,
		Email:      response.Email,
	}

	if config.DB.Where("sub = ?", user.Sub).Updates(&user).RowsAffected == 0 {
		config.DB.Create(&user)
	}

	return c.Status(200).JSON(user)
}
