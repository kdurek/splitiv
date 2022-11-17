package main

import (
	"fmt"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"log"
	"splitiv/config"
	"splitiv/model"
	"splitiv/router"
)

func main() {
	app := fiber.New()
	app.Use(logger.New())
	app.Use(cors.New())

	config.ConnectDB()
	model.Init()
	router.Initialize(app)

	url := fmt.Sprintf(
		"%s:%s",
		config.Env("SERVER_HOST"),
		config.Env("SERVER_PORT"),
	)

	log.Fatal(app.Listen(url))
}
