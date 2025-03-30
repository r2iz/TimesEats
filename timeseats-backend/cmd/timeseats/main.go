package main

import (
	"errors"
	"log"
	"os"

	"github.com/SeikoStudentCouncil/timeseats-backend/internal/api"
	"github.com/SeikoStudentCouncil/timeseats-backend/internal/domain/services"
	"github.com/SeikoStudentCouncil/timeseats-backend/internal/infrastructure/database"
	"github.com/SeikoStudentCouncil/timeseats-backend/internal/infrastructure/repositories"
	"github.com/gofiber/fiber/v2"
)

// @title TimesEats API
// @version 1.0
// @description 第66回聖光祭食品システムバックエンドサーバー
// @host localhost:8080
// @BasePath /api/v1
// @schemes http https
// @produce application/json
// @consume application/json
func main() {
	if err := database.Init(); err != nil {
		log.Fatal(err)
	}
	defer func() {
		err := database.Close()
		if err != nil {
			log.Fatal(err)
		}
	}()

	db := database.GetDB()

	productRepo := repositories.NewProductRepository(db)
	salesSlotRepo := repositories.NewSalesSlotRepository(db)
	productInventoryRepo := repositories.NewProductInventoryRepository(db)
	orderRepo := repositories.NewOrderRepository(db)

	productService := services.NewProductService(productRepo)
	salesSlotService := services.NewSalesSlotService(salesSlotRepo, productInventoryRepo, productRepo)
	orderService := services.NewOrderService(orderRepo, salesSlotRepo, productInventoryRepo, productRepo)

	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			var e *fiber.Error
			if errors.As(err, &e) {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{
				"error": err.Error(),
			})
		},
		Prefork: false,
	})

	api.SetupRouter(app, productService, salesSlotService, orderService)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	if err := app.Listen(":" + port); err != nil {
		log.Fatal(err)
	}
}
