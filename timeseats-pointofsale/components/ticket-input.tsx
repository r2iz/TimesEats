"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

interface TicketInputProps {
  ticketNumber: string
  setTicketNumber: (value: string) => void
}

export function TicketInput({ ticketNumber, setTicketNumber }: TicketInputProps) {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="ticketNumber" className="text-lg font-semibold">
            伝票番号
          </Label>
          <Input
            type="text"
            id="ticketNumber"
            placeholder="伝票番号を入力してください"
            value={ticketNumber}
            onChange={(e) => setTicketNumber(e.target.value)}
            className="text-lg h-12"
          />
        </div>
      </CardContent>
    </Card>
  )
}

