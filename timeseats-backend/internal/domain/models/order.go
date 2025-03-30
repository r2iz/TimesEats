package models

import (
	"time"

	"github.com/SeikoStudentCouncil/timeseats-backend/internal/domain/types"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Order struct {
	ID            types.ID `gorm:"type:uuid;primary_key;default:uuid_generate_v4()"`
	SalesSlotID   types.ID `gorm:"type:uuid"`
	Status        types.OrderStatus
	TotalAmount   int
	TicketNumber  string `gorm:"unique"`
	PaymentMethod types.PaymentMethod
	TransactionID *string
	IsPaid        bool `gorm:"default:false"`
	IsDelivered   bool `gorm:"default:false"`
	CreatedAt     time.Time
	UpdatedAt     time.Time
	DeletedAt     gorm.DeletedAt `gorm:"index"`

	SalesSlot *SalesSlot  `gorm:"foreignKey:SalesSlotID"`
	Items     []OrderItem `gorm:"foreignKey:OrderID"`
}

func (o *Order) BeforeCreate(tx *gorm.DB) error {
	if o.ID == "" {
		o.ID = types.ID(uuid.New().String())
	}
	if o.Status == 0 {
		o.Status = types.RESERVED
	}
	if o.PaymentMethod == 0 {
		o.PaymentMethod = types.CASH
	}
	return nil
}

func (o *Order) CalculateTotalAmount() {
	total := 0
	for _, item := range o.Items {
		total += item.GetSubtotal()
	}
	o.TotalAmount = total
}
