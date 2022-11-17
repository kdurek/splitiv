package model

import (
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"splitiv/config"
	"time"
)

type Group struct {
	ID        uint           `json:"id,omitempty" gorm:"primarykey"`
	CreatedAt time.Time      `json:"createdAt,omitempty"`
	UpdatedAt time.Time      `json:"updatedAt,omitempty"`
	DeletedAt gorm.DeletedAt `json:"deletedAt,omitempty" gorm:"index"`
	Name      string         `json:"name,omitempty"`
	Admin     uint           `json:"admin"`
	Members   []User         `json:"members,omitempty" gorm:"many2many:user_groups;"`
}

func (g *Group) Create() (err error) {
	return config.DB.Create(&g).Error
}

func (g *Group) Delete() (err error) {
	// Delete group, expenses and expense users
	err = config.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Delete(&g).Error; err != nil {
			return err
		}

		var groupExpenses []Expense
		if err := tx.Clauses(clause.Returning{}).Where("group_id = ?", g.ID).Delete(&groupExpenses).Error; err != nil {
			return err
		}

		for _, expense := range groupExpenses {
			if err := tx.Where("expense_id = ?", expense.ID).Delete(&ExpenseUsers{}).Error; err != nil {
				return err
			}
		}

		if err := tx.Where("group_id = ?", g.ID).Delete(&UserGroups{}).Error; err != nil {
			return err
		}

		return nil
	})

	return err
}

func (g *Group) AddUser(user User) (err error) {
	return config.DB.Create(&UserGroups{
		GroupID: g.ID,
		UserID:  user.ID,
	}).Error
}

func (g *Group) DeleteUser(user User) (err error) {
	// TODO User balance have to be zeroed before he can be removed from group

	return config.DB.Delete(&UserGroups{
		GroupID: g.ID,
		UserID:  user.ID,
	}).Error
}
