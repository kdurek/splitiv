package service

import (
	"splitiv/config"
	"splitiv/model"
)

func GetUserGroup(user model.User, group model.Group) (userGroup model.UserGroups, err error) {
	err = config.DB.Unscoped().Where(&model.UserGroups{GroupID: group.ID, UserID: user.ID}).First(&userGroup).Error

	return userGroup, err
}
