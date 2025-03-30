"use client";

import { useState, useEffect } from "react";
import { ProductList } from "@/components/product-list";
import { Cart } from "@/components/cart";
import { PaymentModal } from "@/components/payment-modal";
import { TicketInput } from "@/components/ticket-input";
import { SalesSlotSelector } from "@/components/sales-slot-selector";
import { SettingsModal } from "@/components/settings-modal";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
    type Product,
    type CartItem,
    PaymentMethod,
    type ProductInventory,
    type ApiInventoryResponse,
    type Settings,
} from "@/lib/types";
import {
    fetchProducts,
    createOrder,
    fetchProductsInSalesSlot,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { SettingsIcon } from "lucide-react";

// デフォルト設定
const DEFAULT_SETTINGS: Settings = {
    apiBaseUrl: "http://localhost:8080/api/v1",
};

// ローカルストレージから設定を読み込む
const loadSettings = (): Settings => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;

    const savedSettings = localStorage.getItem("pos-settings");
    if (savedSettings) {
        try {
            return JSON.parse(savedSettings);
        } catch (e) {
            console.error("Failed to parse settings:", e);
        }
    }
    return DEFAULT_SETTINGS;
};

// 設定を保存する
const saveSettings = (settings: Settings): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem("pos-settings", JSON.stringify(settings));
};

export function PosSystem() {
    const [products, setProducts] = useState<Product[]>([]);
    const [inventory, setInventory] = useState<Map<string, ProductInventory>>(
        new Map()
    );
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [ticketNumber, setTicketNumber] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSalesSlot, setSelectedSalesSlot] = useState<string | null>(
        null
    );
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

    // 初期化時に設定を読み込む
    useEffect(() => {
        const loadedSettings = loadSettings();
        setSettings(loadedSettings);
    }, []);

    // 販売枠が選択されたら商品を読み込む
    useEffect(() => {
        if (!selectedSalesSlot) return;

        const loadProductsAndInventory = async () => {
            try {
                setIsLoading(true);

                // 実際のAPIから商品と在庫情報を取得
                try {
                    console.log("販売枠ID:", selectedSalesSlot);
                    const inventoryData = (await fetchProductsInSalesSlot(
                        selectedSalesSlot
                    )) as ApiInventoryResponse[];
                    console.log("取得した在庫データ:", inventoryData);

                    // 在庫データが空または不正な形式でないかチェック
                    if (
                        !Array.isArray(inventoryData) ||
                        inventoryData.length === 0
                    ) {
                        throw new Error("在庫データが取得できませんでした");
                    }

                    // 在庫データを処理して必要な形式に変換
                    const processedInventoryData: ProductInventory[] =
                        inventoryData.map((item) => {
                            return {
                                id: item.ID,
                                productId: item.ProductID,
                                salesSlotId: item.SalesSlotID,
                                initialQuantity: item.InitialQuantity,
                                reservedQuantity: item.ReservedQuantity,
                                soldQuantity: item.SoldQuantity,
                                createdAt: item.CreatedAt,
                                updatedAt: item.UpdatedAt,
                                product: item.Product
                                    ? {
                                          id: item.Product.ID,
                                          name: item.Product.Name,
                                          price: item.Product.Price,
                                          createdAt: item.Product.CreatedAt,
                                          updatedAt: item.Product.UpdatedAt,
                                      }
                                    : undefined,
                            };
                        });

                    // 在庫データをMapに変換
                    const inventoryMap = new Map<string, ProductInventory>(
                        processedInventoryData.map((item) => {
                            if (!item.productId) {
                                console.warn(
                                    "productIdが存在しない項目があります:",
                                    item
                                );
                            }
                            return [item.productId, item];
                        })
                    );
                    console.log("変換後の在庫Map:", [
                        ...inventoryMap.entries(),
                    ]);
                    setInventory(inventoryMap);

                    // 在庫データから商品情報を直接抽出
                    const products: Product[] = inventoryData
                        .map((item) => {
                            if (!item.Product) {
                                console.warn(
                                    "Productが存在しない項目があります:",
                                    item
                                );
                                return null;
                            }
                            return {
                                id: item.Product.ID,
                                name: item.Product.Name,
                                price: item.Product.Price,
                            };
                        })
                        .filter(
                            (product): product is Product => product !== null
                        );

                    // 重複を除去
                    const uniqueProducts = Array.from(
                        new Map(products.map((p) => [p.id, p])).values()
                    );

                    console.log("処理後の商品リスト:", uniqueProducts);
                    setProducts(uniqueProducts);
                } catch (error) {
                    console.error("API error:", error);

                    toast({
                        title: "APIエラー",
                        description:
                            "APIからのデータ取得に失敗しました: " +
                            (error instanceof Error
                                ? error.message
                                : "不明なエラー"),
                        variant: "destructive",
                    });
                    console.error(error);
                } finally {
                    setIsLoading(false);
                }
            } catch (error) {
                console.error("Failed to load products and inventory:", error);
                toast({
                    title: "エラー",
                    description: "商品と在庫の読み込みに失敗しました",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };
        loadProductsAndInventory();
    }, [selectedSalesSlot]);

    const addToCart = (product: Product) => {
        // 在庫チェック
        const inventoryItem = inventory.get(product.id);
        if (!inventoryItem) {
            toast({
                title: "在庫なし",
                description: "この商品は現在の販売枠では販売されていません",
                variant: "destructive",
            });
            return;
        }

        const availableQuantity =
            inventoryItem.initialQuantity -
            inventoryItem.soldQuantity -
            inventoryItem.reservedQuantity;
        if (availableQuantity <= 0) {
            toast({
                title: "売切れ",
                description: "この商品は売切れです",
                variant: "destructive",
            });
            return;
        }

        // カート内の現在の数量を確認
        const currentCartItem = cartItems.find(
            (item) => item.productId === product.id
        );
        const currentQuantity = currentCartItem ? currentCartItem.quantity : 0;

        // 追加後の数量が在庫を超える場合
        if (currentQuantity + 1 > availableQuantity) {
            toast({
                title: "在庫不足",
                description: `この商品の在庫は残り${availableQuantity}個です`,
                variant: "destructive",
            });
            return;
        }

        setCartItems((prevItems) => {
            const existingItem = prevItems.find(
                (item) => item.productId === product.id
            );

            if (existingItem) {
                return prevItems.map((item) =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                return [
                    ...prevItems,
                    {
                        productId: product.id,
                        name: product.name,
                        price: product.price,
                        quantity: 1,
                    },
                ];
            }
        });
    };

    const removeFromCart = (productId: string) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find(
                (item) => item.productId === productId
            );

            if (existingItem && existingItem.quantity > 1) {
                return prevItems.map((item) =>
                    item.productId === productId
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                );
            } else {
                return prevItems.filter((item) => item.productId !== productId);
            }
        });
    };

    const clearCart = () => {
        setCartItems([]);
        setTicketNumber("");
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            toast({
                title: "カートが空です",
                description: "商品をカートに追加してください",
                variant: "destructive",
            });
            return;
        }

        if (!ticketNumber) {
            toast({
                title: "伝票番号が必要です",
                description: "伝票番号を入力してください",
                variant: "destructive",
            });
            return;
        }

        if (!selectedSalesSlot) {
            toast({
                title: "販売時間枠が選択されていません",
                description: "販売時間枠を選択してください",
                variant: "destructive",
            });
            return;
        }

        setIsPaymentModalOpen(true);
    };

    const handlePayment = async (
        paymentMethod: PaymentMethod,
        transactionId?: string
    ) => {
        try {
            if (!selectedSalesSlot) {
                throw new Error("販売枠が選択されていません");
            }

            const orderItems = cartItems.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
            }));

            const orderData = {
                salesSlotId: selectedSalesSlot,
                ticketNumber,
                paymentMethod,
                items: orderItems,
            };

            const response = await createOrder(orderData);

            // If payment method is Square, we would handle the Square payment here
            if (paymentMethod === PaymentMethod.SQUARE && transactionId) {
                // Update payment with transaction ID
                // This would be implemented in a real app
            }

            toast({
                title: "注文完了",
                description: `注文番号: ${response.id}`,
            });

            clearCart();
            setIsPaymentModalOpen(false);

            // 注文後に在庫と商品データを更新
            if (selectedSalesSlot) {
                const updatedInventoryData = (await fetchProductsInSalesSlot(
                    selectedSalesSlot
                )) as ApiInventoryResponse[];

                // 在庫データを適切な形式に変換
                const processedInventory = updatedInventoryData.map((item) => ({
                    id: item.ID,
                    productId: item.ProductID,
                    salesSlotId: item.SalesSlotID,
                    initialQuantity: item.InitialQuantity,
                    soldQuantity: item.SoldQuantity,
                    reservedQuantity: item.ReservedQuantity,
                    createdAt: item.CreatedAt,
                    updatedAt: item.UpdatedAt,
                    product: item.Product
                        ? {
                              id: item.Product.ID,
                              name: item.Product.Name,
                              price: item.Product.Price,
                              createdAt: item.Product.CreatedAt,
                              updatedAt: item.Product.UpdatedAt,
                          }
                        : undefined,
                }));

                // 変換した在庫データをMapに設定
                const updatedInventoryMap = new Map(
                    processedInventory.map((item) => [item.productId, item])
                );
                setInventory(updatedInventoryMap);

                // 商品データを更新
                const uniqueProducts = updatedInventoryData
                    .filter((item) => item.Product)
                    .map((item) => ({
                        id: item.Product.ID,
                        name: item.Product.Name,
                        price: item.Product.Price,
                        createdAt: item.Product.CreatedAt,
                        updatedAt: item.Product.UpdatedAt,
                    }));

                // 重複を除去して設定
                setProducts(
                    Array.from(
                        new Map(uniqueProducts.map((p) => [p.id, p])).values()
                    )
                );
            }
        } catch (error) {
            toast({
                title: "エラー",
                description: "注文の処理に失敗しました",
                variant: "destructive",
            });
            console.error(error);
        }
    };

    const handleSaveSettings = (newSettings: Settings) => {
        setSettings(newSettings);
        saveSettings(newSettings);

        // 設定が変更されたら商品を再読み込み
        if (selectedSalesSlot) {
            setIsLoading(true);
            fetchProductsInSalesSlot(selectedSalesSlot)
                .then((inventoryData) => {
                    const apiData = inventoryData as ApiInventoryResponse[];

                    // 在庫データを適切な形式に変換
                    const processedInventory = apiData.map((item) => ({
                        id: item.ID,
                        productId: item.ProductID,
                        salesSlotId: item.SalesSlotID,
                        initialQuantity: item.InitialQuantity,
                        soldQuantity: item.SoldQuantity,
                        reservedQuantity: item.ReservedQuantity,
                        createdAt: item.CreatedAt,
                        updatedAt: item.UpdatedAt,
                        product: item.Product
                            ? {
                                  id: item.Product.ID,
                                  name: item.Product.Name,
                                  price: item.Product.Price,
                                  createdAt: item.Product.CreatedAt,
                                  updatedAt: item.Product.UpdatedAt,
                              }
                            : undefined,
                    }));

                    // 在庫データをMapに設定
                    const inventoryMap = new Map(
                        processedInventory.map((item) => [item.productId, item])
                    );
                    setInventory(inventoryMap);

                    // 商品データを更新
                    const products = apiData
                        .filter((item) => item.Product)
                        .map((item) => ({
                            id: item.Product.ID,
                            name: item.Product.Name,
                            price: item.Product.Price,
                            createdAt: item.Product.CreatedAt,
                            updatedAt: item.Product.UpdatedAt,
                        }));

                    // 重複を除去して設定
                    setProducts(
                        Array.from(
                            new Map(products.map((p) => [p.id, p])).values()
                        )
                    );
                })
                .catch((error) => {
                    console.error(
                        "Failed to reload data after settings change:",
                        error
                    );
                    toast({
                        title: "エラー",
                        description: "データの再読み込みに失敗しました",
                        variant: "destructive",
                    });
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    };

    const totalAmount = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">
                        聖光祭 食品販売システム
                    </h1>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setIsSettingsModalOpen(true)}
                    >
                        <SettingsIcon className="h-4 w-4" />
                        <span className="sr-only">設定</span>
                    </Button>
                </div>

                <SalesSlotSelector
                    selectedSlotId={selectedSalesSlot}
                    onSelectSlot={setSelectedSalesSlot}
                />

                <TicketInput
                    ticketNumber={ticketNumber}
                    setTicketNumber={setTicketNumber}
                />

                <ProductList
                    products={products}
                    inventory={Array.from(inventory.values())}
                    addToCart={addToCart}
                    isLoading={isLoading}
                />
            </div>
            <div>
                <Cart
                    items={cartItems}
                    addItem={(item) => {
                        const product = products.find((p) => p.id === item.id);
                        if (product) addToCart(product);
                    }}
                    removeItem={removeFromCart}
                    clearCart={clearCart}
                    totalAmount={totalAmount}
                    onCheckout={handleCheckout}
                />
            </div>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onPayment={handlePayment}
                totalAmount={totalAmount}
            />

            <SettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                settings={settings}
                onSave={handleSaveSettings}
            />

            <Toaster />
        </div>
    );
}
