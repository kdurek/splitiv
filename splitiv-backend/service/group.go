package service

import (
	"splitiv/config"
	"splitiv/model"
)

func GetGroupsByUser(user model.User) (groups []model.Group, err error) {
	err = config.DB.Preload("Members").
		Joins("inner join user_groups ug on ug.group_id = groups.id").
		Joins("inner join users u on u.id = ug.user_id").Where("ug.deleted_at IS NULL").
		Where("u.id = ?", user.ID).Find(&groups).Error

	return groups, err
}

func GetGroupById(id uint) (group model.Group, err error) {
	err = config.DB.Where("id = ?", id).Find(&group).Error
	return group, err
}
