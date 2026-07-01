/**
 * OPay Payment Integration
 *
 * This module handles:
 * 1. Customer payments (accepting payments via OPay Cashier)
 * 2. Vendor payouts (disbursing funds to vendor OPay accounts)
 *
 * Integration uses OPay's API endpoints:
 * - Payment: POST /api/v3/cashier/initialize
 * - Transfer: POST /api/v3/transfer/toWallet
 *
 * In production, replace MERCHANT_ID, PUBLIC_KEY, and SECRET_KEY
 * with your actual OPay merchant credentials.
 */

const OPAY_CONFIG = {
    merchantId: 'YOUR_OPAY_MERCHANT_ID',
    publicKey: 'YOUR_OPAY_PUBLIC_KEY',
    secretKey: 'YOUR_OPAY_SECRET_KEY',
    baseUrl: 'https://cashierapi.opayweb.com',
    callbackUrl: window.location.origin + '/payment-callback',
    currency: 'NGN',
    country: 'NG',
    receiverAccount: '9160773043',
    receiverName: 'Daniel Oluwasegun Afolabi'
};

class OpayPayment {
    constructor(config) {
        this.config = config;
    }

    generateReference() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `ADT-${timestamp}-${random}`.toUpperCase();
    }

    async initializePayment(orderData) {
        const reference = this.generateReference();

        const payload = {
            reference: reference,
            mchShortName: "Amen Drumtech",
            productName: "Drum Equipment Order",
            productDesc: `Order: ${orderData.items.map(i => i.name).join(', ')}`,
            userPhone: orderData.phone,
            userRequestIp: "127.0.0.1",
            amount: orderData.amount.toString(),
            currency: this.config.currency,
            payChannel: "BalancePayment,BonusPayment,OWealth",
            payTypes: ["BalancePayment", "BankCard", "BankAccount"],
            callbackUrl: this.config.callbackUrl,
            returnUrl: window.location.origin + '/cart.html?status=success&ref=' + reference,
            expireAt: "30",
            receiver: {
                name: this.config.receiverName,
                accountNumber: this.config.receiverAccount,
                type: "OPAYWALLET"
            },
            customerInfo: {
                name: orderData.name,
                email: orderData.email,
                phone: orderData.phone
            }
        };

        // In production, this would be a server-side call with HMAC signature
        // For demo, we simulate the API response
        return this.simulatePaymentInit(payload);
    }

    simulatePaymentInit(payload) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    reference: payload.reference,
                    orderNo: 'OPY-' + Date.now().toString(36).toUpperCase(),
                    cashierUrl: `${this.config.baseUrl}/cashier/${payload.reference}`,
                    status: 'PENDING'
                });
            }, 1500);
        });
    }

    async processPayment(reference) {
        // Simulates payment completion (in production, this is handled by OPay callback)
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    reference: reference,
                    status: 'SUCCESS',
                    message: 'Payment completed successfully',
                    transactionId: 'OPY-TXN-' + Math.floor(Math.random() * 99999)
                });
            }, 2000);
        });
    }

    async initiateTransfer(transferData) {
        const reference = this.generateReference();

        const payload = {
            reference: reference,
            amount: transferData.amount.toString(),
            currency: this.config.currency,
            country: this.config.country,
            receiver: {
                name: transferData.vendorName,
                phoneNumber: transferData.accountNumber,
                type: "OPAYWALLET"
            },
            reason: transferData.description || "Vendor payout"
        };

        return this.simulateTransfer(payload);
    }

    simulateTransfer(payload) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    reference: payload.reference,
                    orderNo: 'OPY-TXN-' + Math.floor(Math.random() * 99999),
                    amount: payload.amount,
                    receiver: payload.receiver.name,
                    status: 'SUCCESS',
                    message: `₦${parseInt(payload.amount).toLocaleString()} sent to ${payload.receiver.name}`
                });
            }, 2500);
        });
    }

    async checkTransactionStatus(reference) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    reference: reference,
                    status: 'SUCCESS',
                    amount: '0',
                    timestamp: new Date().toISOString()
                });
            }, 500);
        });
    }
}

const opay = new OpayPayment(OPAY_CONFIG);
