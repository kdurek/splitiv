package helpers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"splitiv/config"
	"splitiv/model"
	"splitiv/service"
	"strconv"
	"strings"
)

func GetTokenFromHeader(c *fiber.Ctx) (token string, err error) {
	headers := c.GetReqHeaders()
	authorizationHeader := headers["Authorization"]
	token = strings.TrimSpace(strings.Replace(authorizationHeader, "Bearer", "", 1))
	return token, err
}

func ExtractClaimsFromToken(token string) (claims jwt.MapClaims, err error) {
	parsedToken, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
		return token, nil
	})
	claims = parsedToken.Claims.(jwt.MapClaims)
	return claims, err
}

func GetUserFromContext(c *fiber.Ctx) (user model.User, err error) {
	token, _ := GetTokenFromHeader(c)
	claims, err := ExtractClaimsFromToken(token)
	sub := claims["sub"].(string)
	user, err = service.GetUserBySub(sub)
	return user, err
}

func GetUintIdFromParams(c *fiber.Ctx, name string) (id uint) {
	_id, _ := strconv.Atoi(c.Params(name))
	return uint(_id)
}

func IsUserInGroup(user model.User, group model.Group) bool {
	userInGroup := config.DB.Where(&model.UserGroups{GroupID: group.ID, UserID: user.ID}).First(&model.UserGroups{})

	if userInGroup.RowsAffected == 0 {
		return false
	} else {
		return true
	}

}
