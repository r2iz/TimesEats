package api

import (
	"github.com/SeikoStudentCouncil/timeseats-backend/internal/api/handlers"
	_ "github.com/SeikoStudentCouncil/timeseats-backend/internal/docs"
	"github.com/SeikoStudentCouncil/timeseats-backend/internal/domain/services"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/swagger"
)

// @title TimesEats API
// @version 1.0
// @description TimesEats backend API documentation
// @host localhost:8080
// @BasePath /api/v1
func SetupRouter(
	app *fiber.App,
	productService services.ProductService,
	salesSlotService services.SalesSlotService,
	orderService services.OrderService,
) {
	app.Use(cors.New())

	api := app.Group("/api/v1")

	productHandler := handlers.NewProductHandler(productService)
	salesSlotHandler := handlers.NewSalesSlotHandler(salesSlotService)
	orderHandler := handlers.NewOrderHandler(orderService)

	app.Get("/swagger/*", swagger.HandlerDefault)

	products := api.Group("/products")
	{
		products.Post("/", productHandler.Create)
		products.Get("/", productHandler.GetAll)
		products.Get("/:id", productHandler.GetByID)
		products.Put("/:id", productHandler.Update)
		products.Delete("/:id", productHandler.Delete)
	}

	salesSlots := api.Group("/sales-slots")
	{
		salesSlots.Post("/", salesSlotHandler.Create)
		salesSlots.Get("/", salesSlotHandler.GetAll)
		salesSlots.Get("/:id", salesSlotHandler.GetByID)
		salesSlots.Put("/:id/activate", salesSlotHandler.Activate)
		salesSlots.Put("/:id/deactivate", salesSlotHandler.Deactivate)
		salesSlots.Post("/:id/products", salesSlotHandler.AddProduct)
		salesSlots.Get("/:id/products", salesSlotHandler.GetProducts)
	}

	orders := api.Group("/orders")
	{
		orders.Post("/", orderHandler.Create)
		orders.Get("/", orderHandler.GetAll)
		orders.Get("/:id", orderHandler.GetByID)
		orders.Get("/status", orderHandler.GetByStatus)
		orders.Put("/:id/cancel", orderHandler.Cancel)
		orders.Put("/:id/confirm", orderHandler.Confirm)
		orders.Post("/:id/items", orderHandler.AddItems)
		orders.Get("/number/:ticketNumber", orderHandler.GetByTicketNumber)
		orders.Put("/:id/payment", orderHandler.UpdatePayment)
		orders.Put("/:id/delivery", orderHandler.UpdateDelivery)
	}
}
