package model

import (
	"gorm.io/gorm"
	"time"
)

type UserGroups struct {
	UserID    uint           `json:"userId,omitempty" gorm:"primaryKey"`
	GroupID   uint           `json:"groupId,omitempty" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"createdAt,omitempty"`
	UpdatedAt time.Time      `json:"updatedAt,omitempty"`
	DeletedAt gorm.DeletedAt `json:"deletedAt,omitempty" gorm:"index"`
}
