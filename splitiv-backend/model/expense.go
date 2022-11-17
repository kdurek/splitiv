package model

import (
	"gorm.io/gorm"
	"splitiv/config"
	"time"
)

type ExpenseUsers struct {
	ID        uint           `json:"id,omitempty" gorm:"primarykey"`
	CreatedAt time.Time      `json:"createdAt,omitempty"`
	UpdatedAt time.Time      `json:"updatedAt,omitempty"`
	DeletedAt gorm.DeletedAt `json:"deletedAt,omitempty" gorm:"index"`

	Owed      string `json:"owed,omitempty"`
	Paid      string `json:"paid,omitempty"`
	ExpenseID uint   `json:"expenseId,omitempty"`
	UserID    uint   `json:"userId,omitempty"`
	User      User   `json:"user,omitempty"`
}

type Expense struct {
	ID        uint           `json:"id,omitempty" gorm:"primarykey"`
	CreatedAt time.Time      `json:"createdAt,omitempty"`
	UpdatedAt time.Time      `json:"updatedAt,omitempty"`
	DeletedAt gorm.DeletedAt `json:"deletedAt,omitempty" gorm:"index"`

	Name    string         `json:"name,omitempty"`
	Amount  string         `json:"amount,omitempty"`
	Users   []ExpenseUsers `json:"users,omitempty"`
	GroupID uint           `json:"groupId,omitempty"`
	Type    string         `json:"type,omitempty"`
}

func (e *Expense) Delete() (err error) {
	err = config.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("expense_id = ?", e.ID).Delete(&ExpenseUsers{}).Error; err != nil {
			return err
		}

		if err := tx.Delete(&e).Error; err != nil {
			return err
		}

		return nil
	})

	return err
}
