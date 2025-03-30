"use client"

import type { CartItem } from "@/lib/types"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MinusCircle, PlusCircle, Trash2 } from "lucide-react"

interface CartProps {
  items: CartItem[]
  addItem: (item: { id: string; name: string; price: number }) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  totalAmount: number
  onCheckout: () => void
}

export function Cart({ items, addItem, removeItem, clearCart, totalAmount, onCheckout }: CartProps) {
  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>カート</CardTitle>
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCart}
              className="h-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              クリア
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        {items.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">カートに商品がありません</p>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.productId} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    ¥{item.price.toLocaleString()} × {item.quantity}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => removeItem(item.productId)}>
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                  <span className="w-6 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => addItem({ id: item.productId, name: item.name, price: item.price })}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <CardFooter className="flex flex-col">
        <div className="flex justify-between w-full py-4 border-t">
          <p className="font-semibold">合計</p>
          <p className="font-bold text-xl">¥{totalAmount.toLocaleString()}</p>
        </div>
        <Button className="w-full" size="lg" onClick={onCheckout} disabled={items.length === 0}>
          会計へ進む
        </Button>
      </CardFooter>
    </Card>
  )
}

