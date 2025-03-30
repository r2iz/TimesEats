import type {
    Product,
    CreateOrderRequest,
    OrderResponse,
    SalesSlot,
    ProductInventory,
    Settings,
    ApiInventoryResponse,
} from "@/lib/types";

const getApiBaseUrl = (): string => {
    if (typeof window !== "undefined") {
        try {
            const settings = localStorage.getItem("pos-settings");
            if (settings) {
                const parsedSettings = JSON.parse(settings) as Settings;
                return parsedSettings.apiBaseUrl;
            }
        } catch (e) {
            console.error("Failed to parse settings:", e);
        }
    }

    return (
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1"
    );
};

async function fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}${endpoint}`;

    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
        ...options,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
            errorData.message ||
                `API request failed with status ${response.status}`
        );
    }

    return response.json();
}

export async function fetchProducts(id?: string): Promise<Product[]> {
    if (id) {
        const product = await fetchApi<Product>(`/products/${id}`);
        return [product];
    }
    return fetchApi<Product[]>("/products");
}

export async function fetchSalesSlots(): Promise<SalesSlot[]> {
    return fetchApi<SalesSlot[]>("/sales-slots");
}

export async function fetchProductsInSalesSlot(
    salesSlotId: string
): Promise<ApiInventoryResponse[]> {
    return fetchApi<ApiInventoryResponse[]>(
        `/sales-slots/${salesSlotId}/products`
    );
}

export async function createOrder(
    orderData: CreateOrderRequest
): Promise<OrderResponse> {
    return fetchApi<OrderResponse>("/orders", {
        method: "POST",
        body: JSON.stringify(orderData),
    });
}

export async function fetchOrder(id: string): Promise<OrderResponse> {
    return fetchApi<OrderResponse>(`/orders/${id}`);
}

export async function fetchOrderByTicketNumber(
    ticketNumber: string
): Promise<OrderResponse> {
    return fetchApi<OrderResponse>(`/orders/number/${ticketNumber}`);
}

export async function updatePaymentStatus(
    orderId: string,
    transactionId: string
): Promise<OrderResponse> {
    return fetchApi<OrderResponse>(`/orders/${orderId}/payment`, {
        method: "PUT",
        body: JSON.stringify({ transactionId }),
    });
}

export async function confirmOrder(orderId: string): Promise<OrderResponse> {
    return fetchApi<OrderResponse>(`/orders/${orderId}/confirm`, {
        method: "PUT",
    });
}

export async function cancelOrder(orderId: string): Promise<OrderResponse> {
    return fetchApi<OrderResponse>(`/orders/${orderId}/cancel`, {
        method: "PUT",
    });
}

export async function updateDeliveryStatus(
    orderId: string
): Promise<OrderResponse> {
    return fetchApi<OrderResponse>(`/orders/${orderId}/delivery`, {
        method: "PUT",
    });
}
