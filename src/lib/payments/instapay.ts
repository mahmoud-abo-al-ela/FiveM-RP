/**
 * InstaPay Integration for Egyptian Users
 * InstaPay is a popular payment gateway in Egypt
 */

export interface InstaPayConfig {
  apiKey: string;
  merchantId: string;
  baseUrl: string;
}

export interface CreateInstaPayPaymentParams {
  itemId: number;
  itemName: string;
  price: number;
  userId: string;
  userEmail: string;
  userPhone?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface InstaPayPaymentResponse {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  error?: string;
}

class InstaPayService {
  private config: InstaPayConfig;

  constructor() {
    this.config = {
      apiKey: process.env.INSTAPAY_API_KEY || '',
      merchantId: process.env.INSTAPAY_MERCHANT_ID || '',
      baseUrl: process.env.INSTAPAY_BASE_URL || 'https://api.instapay.com.eg',
    };

    if (!this.config.apiKey || !this.config.merchantId) {
      console.warn('InstaPay credentials not configured. InstaPay payments will not work.');
    }
  }

  async createPayment(params: CreateInstaPayPaymentParams): Promise<InstaPayPaymentResponse> {
    const {
      itemId,
      itemName,
      price,
      userId,
      userEmail,
      userPhone,
      successUrl,
      cancelUrl,
      metadata = {},
    } = params;

    if (!this.config.apiKey || !this.config.merchantId) {
      return {
        success: false,
        error: 'InstaPay is not configured',
      };
    }

    try {
      // Convert USD to EGP (approximate rate, should be fetched from API in production)
      const priceInEGP = Math.round(price * 30.5); // 1 USD ≈ 30.5 EGP

      const payload = {
        merchant_id: this.config.merchantId,
        amount: priceInEGP,
        currency: 'EGP',
        order_id: `STORE_${itemId}_${Date.now()}`,
        description: itemName,
        customer_email: userEmail,
        customer_phone: userPhone,
        success_url: successUrl,
        cancel_url: cancelUrl,
        webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/instapay`,
        metadata: {
          userId,
          itemId: itemId.toString(),
          paymentProvider: 'instapay',
          ...metadata,
        },
      };

      const response = await fetch(`${this.config.baseUrl}/v1/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'InstaPay API request failed');
      }

      const data = await response.json();

      return {
        success: true,
        transactionId: data.transaction_id,
        paymentUrl: data.payment_url,
      };
    } catch (error: any) {
      console.error('InstaPay payment creation failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to create InstaPay payment',
      };
    }
  }

  async verifyPayment(transactionId: string): Promise<boolean> {
    if (!this.config.apiKey) {
      return false;
    }

    try {
      const response = await fetch(
        `${this.config.baseUrl}/v1/payments/${transactionId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
        }
      );

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.status === 'completed' || data.status === 'success';
    } catch (error) {
      console.error('InstaPay verification failed:', error);
      return false;
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    // Implement webhook signature verification based on InstaPay's documentation
    // This is a placeholder implementation
    const webhookSecret = process.env.INSTAPAY_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      return false;
    }

    // TODO: Implement actual signature verification
    // Usually involves HMAC-SHA256 or similar
    return true;
  }
}

export const instapay = new InstaPayService();
