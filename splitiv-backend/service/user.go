package service

import (
	"splitiv/config"
	"splitiv/model"
)

func GetUsers() (users []model.User, err error) {
	err = config.DB.Preload("Groups").Find(&users).Error
	return users, err
}

func GetUserById(id uint) (user model.User, err error) {
	err = config.DB.Preload("Groups").First(&user, id).Error
	return user, err
}

func GetUserBySub(sub string) (user model.User, err error) {
	err = config.DB.Where("sub = ?", sub).First(&user).Error
	return user, err
}
