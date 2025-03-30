"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PaymentMethod } from "@/lib/types";
import { CreditCard, Banknote, Smartphone } from "lucide-react";
import { SquarePayment } from "@/components/square-payment";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPayment: (method: PaymentMethod, transactionId?: string) => void;
    totalAmount: number;
    orderId: string;
}

export function PaymentModal({
    isOpen,
    onClose,
    onPayment,
    totalAmount,
    orderId,
}: PaymentModalProps) {
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
        null
    );
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePaymentMethodSelect = (method: PaymentMethod) => {
        setSelectedMethod(method);
    };

    const handlePaymentConfirm = async () => {
        if (!selectedMethod) return;

        setIsProcessing(true);

        try {
            if (selectedMethod === PaymentMethod.SQUARE) {
                // Square payment is handled by the SquarePayment component
                return;
            }

            // For cash and PayPay, we just process the payment directly
            await onPayment(selectedMethod);
        } catch (error) {
            console.error("Payment error:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSquarePaymentComplete = async (transactionId: string) => {
        await onPayment(PaymentMethod.SQUARE, transactionId);
    };

    const resetState = () => {
        setSelectedMethod(null);
        setIsProcessing(false);
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl">
                        お支払い方法を選択
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    <p className="text-lg font-bold mb-4">
                        合計: ¥{totalAmount.toLocaleString()}
                    </p>

                    {!selectedMethod ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Button
                                variant="outline"
                                className="flex flex-col items-center justify-center h-24 p-4"
                                onClick={() =>
                                    handlePaymentMethodSelect(
                                        PaymentMethod.CASH
                                    )
                                }
                            >
                                <Banknote className="h-8 w-8 mb-2" />
                                <span>現金</span>
                            </Button>

                            <Button
                                variant="outline"
                                className="flex flex-col items-center justify-center h-24 p-4"
                                onClick={() =>
                                    handlePaymentMethodSelect(
                                        PaymentMethod.PAYPAY
                                    )
                                }
                            >
                                <Smartphone className="h-8 w-8 mb-2" />
                                <span>PayPay</span>
                            </Button>

                            <Button
                                variant="outline"
                                className="flex flex-col items-center justify-center h-24 p-4"
                                onClick={() =>
                                    handlePaymentMethodSelect(
                                        PaymentMethod.SQUARE
                                    )
                                }
                            >
                                <CreditCard className="h-8 w-8 mb-2" />
                                <span>Square</span>
                            </Button>
                        </div>
                    ) : selectedMethod === PaymentMethod.SQUARE ? (
                        <SquarePayment
                            amount={totalAmount}
                            orderId={orderId}
                            onComplete={handleSquarePaymentComplete}
                            onCancel={() => setSelectedMethod(null)}
                        />
                    ) : (
                        <div className="space-y-4">
                            <div className="p-4 border rounded-lg">
                                <h3 className="font-medium mb-2">
                                    {selectedMethod === PaymentMethod.CASH
                                        ? "現金支払い"
                                        : "PayPay支払い"}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {selectedMethod === PaymentMethod.CASH
                                        ? "お客様から現金を受け取り、お釣りをお渡しください。"
                                        : "お客様にPayPayアプリでお支払いいただいてください。"}
                                </p>
                            </div>

                            <div className="flex justify-between">
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedMethod(null)}
                                    disabled={isProcessing}
                                >
                                    戻る
                                </Button>
                                <Button
                                    onClick={handlePaymentConfirm}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? "処理中..." : "支払い完了"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
