package config

import (
	"fmt"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {
	db, err := gorm.Open(sqlite.Open("main.db"), &gorm.Config{})

	if err != nil {
		panic("Failed to connect database")
	}
	fmt.Println("Connection Opened to Database")
	fmt.Println("Database Migrated")

	DB = db
}
