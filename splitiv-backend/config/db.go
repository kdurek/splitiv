package config

import (
	"fmt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s dbname=%s sslmode=disable password=%s",
		Env("DB_HOST"),
		Env("DB_PORT"),
		Env("DB_USER"),
		Env("DB_NAME"),
		Env("DB_PASSWORD"),
	)
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("Failed to connect database")
	}
	fmt.Println("Connection Opened to Database")
	fmt.Println("Database Migrated")

	DB = db
}
