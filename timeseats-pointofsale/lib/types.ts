export interface Product {
    id: string;
    name: string;
    price: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
}

export enum PaymentMethod {
    UNKNOWN = 0,
    CASH = 1,
    PAYPAY = 2,
    SQUARE = 3,
}

export interface OrderItem {
    productId: string;
    quantity: number;
}

export interface CreateOrderRequest {
    salesSlotId: string;
    ticketNumber: string;
    paymentMethod: PaymentMethod;
    items: OrderItem[];
}

export interface OrderResponse {
    id: string;
    ticketNumber: string;
    salesSlotId: string;
    status: string;
    isPaid: boolean;
    isDelivered: boolean;
    paymentMethod: string;
    transactionId?: string;
    totalAmount: number;
    items: {
        id: string;
        productId: string;
        quantity: number;
        price: number;
    }[];
    createdAt: string;
    updatedAt: string;
}

export interface SalesSlot {
    id: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ProductInventory {
    id: string;
    productId: string;
    salesSlotId: string;
    initialQuantity: number;
    soldQuantity: number;
    reservedQuantity: number;
    createdAt: string;
    updatedAt: string;
    product?: {
        id: string;
        name: string;
        price: number;
        createdAt: string;
        updatedAt: string;
    };
}

export interface ApiInventoryResponse {
    ID: string;
    SalesSlotID: string;
    ProductID: string;
    InitialQuantity: number;
    ReservedQuantity: number;
    SoldQuantity: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: null | string;
    SalesSlot: {
        ID: string;
        StartTime: string;
        EndTime: string;
        IsActive: boolean;
        CreatedAt: string;
        UpdatedAt: string;
        DeletedAt: null | string;
    };
    Product: {
        ID: string;
        Name: string;
        Price: number;
        CreatedAt: string;
        UpdatedAt: string;
        DeletedAt: null | string;
    };
}

export interface Settings {
    apiBaseUrl: string;
}
