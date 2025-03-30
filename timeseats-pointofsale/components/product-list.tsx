"use client"

import type { Product, ProductInventory } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

interface ProductListProps {
  products: Product[]
  inventory: ProductInventory[]
  addToCart: (product: Product) => void
  isLoading: boolean
}

export function ProductList({ products, inventory, addToCart, isLoading }: ProductListProps) {
  if (isLoading) {
    return (
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">商品一覧</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // 在庫情報と商品情報をマージ
  const productsWithInventory = products.map((product) => {
    const inventoryItem = inventory.find((item) => item.productId === product.id)
    const availableQuantity = inventoryItem
      ? inventoryItem.initialQuantity - inventoryItem.soldQuantity - inventoryItem.reservedQuantity
      : 0

    return {
      ...product,
      inventoryId: inventoryItem?.id,
      availableQuantity,
      hasInventory: !!inventoryItem,
    }
  })

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">商品一覧</h2>
      {productsWithInventory.length === 0 ? (
        <p className="text-center py-8">商品がありません</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {productsWithInventory.map((product) => (
            <Card
              key={product.id}
              className={`overflow-hidden ${!product.hasInventory || product.availableQuantity <= 0 ? "opacity-60" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium">{product.name}</h3>
                  {product.hasInventory && (
                    <Badge
                      variant={
                        product.availableQuantity <= 0
                          ? "destructive"
                          : product.availableQuantity < 5
                            ? "outline"
                            : "secondary"
                      }
                      className="text-xs"
                    >
                      残{product.availableQuantity}
                    </Badge>
                  )}
                </div>
                <p className="text-lg font-bold mb-2">¥{product.price.toLocaleString()}</p>
                <Button
                  onClick={() => addToCart(product)}
                  className="w-full"
                  disabled={!product.hasInventory || product.availableQuantity <= 0}
                >
                  {!product.hasInventory ? "在庫なし" : product.availableQuantity <= 0 ? "売切れ" : "追加"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

