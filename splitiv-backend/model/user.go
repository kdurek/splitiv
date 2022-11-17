package model

import (
	"gorm.io/gorm"
	"time"
)

type User struct {
	ID         uint           `json:"id,omitempty" gorm:"primarykey"`
	CreatedAt  time.Time      `json:"createdAt,omitempty"`
	UpdatedAt  time.Time      `json:"updatedAt,omitempty"`
	DeletedAt  gorm.DeletedAt `json:"deletedAt,omitempty" gorm:"index"`
	Sub        string         `json:"sub,omitempty"`
	GivenName  string         `json:"givenName,omitempty"`
	FamilyName string         `json:"familyName,omitempty"`
	Name       string         `json:"name,omitempty"`
	Nickname   string         `json:"nickname,omitempty"`
	Picture    string         `json:"picture,omitempty"`
	Email      string         `json:"email,omitempty"`
	Groups     []Group        `json:"groups,omitempty" gorm:"many2many:user_groups;"`
}
