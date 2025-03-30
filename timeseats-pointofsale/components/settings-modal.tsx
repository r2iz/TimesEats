"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import type { Settings } from "@/lib/types"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  settings: Settings
  onSave: (settings: Settings) => void
}

export function SettingsModal({ isOpen, onClose, settings, onSave }: SettingsModalProps) {
  const [apiBaseUrl, setApiBaseUrl] = useState(settings.apiBaseUrl)

  useEffect(() => {
    setApiBaseUrl(settings.apiBaseUrl)
  }, [settings, isOpen])

  const handleSave = () => {
    if (!apiBaseUrl) {
      toast({
        title: "エラー",
        description: "API Base URLを入力してください",
        variant: "destructive",
      })
      return
    }

    onSave({
      ...settings,
      apiBaseUrl,
    })

    toast({
      title: "設定を保存しました",
      description: "アプリケーションの設定が更新されました",
    })

    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">アプリケーション設定</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiBaseUrl">API Base URL</Label>
            <Input
              id="apiBaseUrl"
              value={apiBaseUrl}
              onChange={(e) => setApiBaseUrl(e.target.value)}
              placeholder="http://localhost:8080/api/v1"
            />
            <p className="text-xs text-muted-foreground">バックエンドAPIのベースURLを入力してください</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={handleSave}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

