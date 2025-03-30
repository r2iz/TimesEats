package handlers

import (
	"time"

	"github.com/SeikoStudentCouncil/timeseats-backend/internal/domain/models"
	"github.com/SeikoStudentCouncil/timeseats-backend/internal/domain/types"
)

type ErrorResponse struct {
	Message string `json:"message"`
}

type CreateProductRequest struct {
	Name  string `json:"name"`
	Price int    `json:"price"`
}

type UpdateProductRequest struct {
	Name  string `json:"name"`
	Price int    `json:"price"`
}

type ProductResponse struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Price     int       `json:"price"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func NewProductResponse(p *models.Product) ProductResponse {
	return ProductResponse{
		ID:        string(p.ID),
		Name:      p.Name,
		Price:     p.Price,
		CreatedAt: p.CreatedAt,
		UpdatedAt: p.UpdatedAt,
	}
}

func NewProductResponseList(products []models.Product) []ProductResponse {
	result := make([]ProductResponse, len(products))
	for i, p := range products {
		result[i] = NewProductResponse(&p)
	}
	return result
}

type CreateSalesSlotRequest struct {
	StartTime string `json:"startTime"`
	EndTime   string `json:"endTime"`
}

type UpdateSalesSlotRequest struct {
	StartTime string `json:"startTime"`
	EndTime   string `json:"endTime"`
}

type SalesSlotResponse struct {
	ID        string    `json:"id"`
	StartTime time.Time `json:"startTime"`
	EndTime   time.Time `json:"endTime"`
	IsActive  bool      `json:"isActive"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func NewSalesSlotResponse(s *models.SalesSlot) SalesSlotResponse {
	return SalesSlotResponse{
		ID:        string(s.ID),
		StartTime: s.StartTime,
		EndTime:   s.EndTime,
		IsActive:  s.IsActive,
		CreatedAt: s.CreatedAt,
		UpdatedAt: s.UpdatedAt,
	}
}

func NewSalesSlotResponseList(slots []models.SalesSlot) []SalesSlotResponse {
	result := make([]SalesSlotResponse, len(slots))
	for i, s := range slots {
		result[i] = NewSalesSlotResponse(&s)
	}
	return result
}

type AddProductToSlotRequest struct {
	ProductID       string `json:"productId"`
	InitialQuantity int    `json:"initialQuantity"`
}

type ProductInventoryResponse struct {
	ID               string    `json:"id"`
	SalesSlotID      string    `json:"salesSlotId"`
	ProductID        string    `json:"productId"`
	InitialQuantity  int       `json:"initialQuantity"`
	ReservedQuantity int       `json:"reservedQuantity"`
	SoldQuantity     int       `json:"soldQuantity"`
	CreatedAt        time.Time `json:"createdAt"`
	UpdatedAt        time.Time `json:"updatedAt"`
}

type CreateOrderRequest struct {
	SalesSlotID   string                 `json:"salesSlotId"`
	Items         []OrderItemCreateInput `json:"items"`
	TicketNumber  string                 `json:"ticketNumber"`
	PaymentMethod types.PaymentMethod    `json:"paymentMethod"`
}

type OrderItemCreateInput struct {
	ProductID string `json:"productId"`
	Quantity  int    `json:"quantity"`
}

type PaymentUpdateRequest struct {
	TransactionID string `json:"transactionId"`
}

type OrderResponse struct {
	ID            string              `json:"id"`
	SalesSlotID   string              `json:"salesSlotId"`
	Status        string              `json:"status"`
	TotalAmount   int                 `json:"totalAmount"`
	TicketNumber  string              `json:"ticketNumber"`
	PaymentMethod string              `json:"paymentMethod"`
	TransactionID *string             `json:"transactionId"`
	IsPaid        bool                `json:"isPaid"`
	IsDelivered   bool                `json:"isDelivered"`
	Items         []OrderItemResponse `json:"items"`
	CreatedAt     time.Time           `json:"createdAt"`
	UpdatedAt     time.Time           `json:"updatedAt"`
}

type OrderItemResponse struct {
	ID        string `json:"id"`
	ProductID string `json:"productId"`
	Quantity  int    `json:"quantity"`
	Price     int    `json:"price"`
}

func NewOrderItemResponse(item *models.OrderItem) OrderItemResponse {
	return OrderItemResponse{
		ID:        string(item.ID),
		ProductID: string(item.ProductID),
		Quantity:  item.Quantity,
		Price:     item.Price,
	}
}

func NewOrderResponse(o *models.Order) OrderResponse {
	items := make([]OrderItemResponse, len(o.Items))
	for i, item := range o.Items {
		items[i] = NewOrderItemResponse(&item)
	}

	return OrderResponse{
		ID:            string(o.ID),
		SalesSlotID:   string(o.SalesSlotID),
		Status:        o.Status.String(),
		TotalAmount:   o.TotalAmount,
		TicketNumber:  o.TicketNumber,
		PaymentMethod: o.PaymentMethod.String(),
		TransactionID: o.TransactionID,
		IsPaid:        o.IsPaid,
		IsDelivered:   o.IsDelivered,
		Items:         items,
		CreatedAt:     o.CreatedAt,
		UpdatedAt:     o.UpdatedAt,
	}
}

func NewOrderResponseList(orders []models.Order) []OrderResponse {
	result := make([]OrderResponse, len(orders))
	for i, o := range orders {
		result[i] = NewOrderResponse(&o)
	}
	return result
}
