package model

import (
	"splitiv/config"
)

func Init() {
	if err := config.DB.SetupJoinTable(&User{}, "Groups", &UserGroups{}); err != nil {
		panic(err)
	}

	if err := config.DB.AutoMigrate(&Group{}, &Expense{}, &ExpenseUsers{}, &User{}); err != nil {
		panic(err)
	}
}
