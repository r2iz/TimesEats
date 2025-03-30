"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import type { SalesSlot } from "@/lib/types"
import { fetchSalesSlots } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"
import { formatDateTime } from "@/lib/utils"

interface SalesSlotSelectorProps {
  selectedSlotId: string | null
  onSelectSlot: (slotId: string) => void
}

export function SalesSlotSelector({ selectedSlotId, onSelectSlot }: SalesSlotSelectorProps) {
  const [salesSlots, setSalesSlots] = useState<SalesSlot[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSalesSlots = async () => {
      try {
        setIsLoading(true)
        const slots = await fetchSalesSlots()
        setSalesSlots(slots)

        // 自動的にアクティブな時間枠を選択
        const activeSlot = slots.find((slot) => slot.isActive)
        if (activeSlot && !selectedSlotId) {
          onSelectSlot(activeSlot.id)
        } else if (slots.length > 0 && !selectedSlotId) {
          onSelectSlot(slots[0].id)
        }
      } catch (error) {
        console.error("Failed to load sales slots:", error)
        toast({
          title: "エラー",
          description: "販売時間枠の読み込みに失敗しました",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSalesSlots()
  }, [onSelectSlot, selectedSlotId])

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid w-full items-center gap-1.5">
            <Label className="text-lg font-semibold">販売時間枠</Label>
            <Select disabled>
              <SelectTrigger>
                <SelectValue placeholder="読み込み中..." />
              </SelectTrigger>
            </Select>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="salesSlot" className="text-lg font-semibold">
            販売時間枠
          </Label>
          <Select value={selectedSlotId || ""} onValueChange={onSelectSlot} disabled={salesSlots.length === 0}>
            <SelectTrigger id="salesSlot">
              <SelectValue placeholder="販売時間枠を選択" />
            </SelectTrigger>
            <SelectContent>
              {salesSlots.length === 0 ? (
                <SelectItem value="none" disabled>
                  販売時間枠がありません
                </SelectItem>
              ) : (
                salesSlots.map((slot) => (
                  <SelectItem key={slot.id} value={slot.id}>
                    <div className="flex items-center gap-2">
                      <span>
                        {formatDateTime(slot.startTime)} - {formatDateTime(slot.endTime)}
                      </span>
                      {slot.isActive && (
                        <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 border-green-200">
                          アクティブ
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}

