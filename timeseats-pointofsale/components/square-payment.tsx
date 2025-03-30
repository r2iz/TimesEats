"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SquarePaymentProps {
    amount: number;
    orderId: string;
    onComplete: (transactionId: string) => void;
    onCancel: () => void;
}

export function SquarePayment({
    amount,
    orderId,
    onComplete,
    onCancel,
}: SquarePaymentProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [transactionId, setTransactionId] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!transactionId) return;

        setIsLoading(true);

        try {
            // コールバックURLを動的に生成
            const callbackUrl = `${window.location.origin}/api/square-callback`;

            const dataParameter = {
                amount_money: {
                    amount: amount,
                    currency_code: "JPY",
                },
                callback_url: callbackUrl,
                client_id: process.env.NEXT_PUBLIC_SQUARE_CLIENT_ID,
                version: "1.3",
                notes: `注文番号: ${orderId}`,
                options: {
                    supported_tender_types: [
                        "CREDIT_CARD",
                        "CASH",
                        "OTHER",
                        "SQUARE_GIFT_CARD",
                        "CARD_ON_FILE",
                    ],
                },
            };

            // URLパラメータをチェック（コールバックからの戻り）
            const urlParams = new URLSearchParams(window.location.search);
            const status = urlParams.get("status");
            const returnedOrderId = urlParams.get("orderId");
            const returnedTransactionId = urlParams.get("transactionId");

            if (
                status === "success" &&
                returnedOrderId === orderId &&
                returnedTransactionId
            ) {
                onComplete(returnedTransactionId);
                return;
            }

            // Square POSアプリを開く
            window.location.href =
                "square-commerce-v1://payment/create?data=" +
                encodeURIComponent(JSON.stringify(dataParameter));
        } catch (error) {
            console.error("Square payment error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <Card className="p-4">
                <h3 className="font-medium mb-4">Square決済</h3>

                <p className="text-sm text-muted-foreground mb-4">
                    実際の実装では、ここにSquareの決済フォームが表示されます。
                    デモのため、トランザクションIDを手動で入力してください。
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">金額</Label>
                        <Input
                            id="amount"
                            value={`¥${amount.toLocaleString()}`}
                            disabled
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="transactionId">
                            トランザクションID
                        </Label>
                        <Input
                            id="transactionId"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            placeholder="sq_xxxxxxxxxxxx"
                            required
                        />
                    </div>

                    <div className="flex justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            戻る
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || !transactionId}
                        >
                            {isLoading ? "処理中..." : "支払い完了"}
                        </Button>
                    </div>
                </form>
            </Card>

            <div className="text-sm text-muted-foreground">
                <p>
                    注意: 実際の実装では、Square Web Payments SDKを使用して
                    クレジットカード情報を安全に処理します。
                </p>
            </div>
        </div>
    );
}
