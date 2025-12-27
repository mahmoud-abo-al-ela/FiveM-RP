/**
 * Payment Provider Selection based on User Location
 */

export type PaymentProvider = 'stripe' | 'instapay' | 'wallet';

export interface PaymentProviderInfo {
  id: PaymentProvider;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  currency: 'USD' | 'EGP';
  conversionRate?: number;
}

export interface UserLocation {
  country: string;
  countryCode: string;
  isEgypt: boolean;
}

/**
 * Detect user's country from IP address
 */
export async function detectUserLocation(): Promise<UserLocation> {
  try {
    // Try to get location from IP using a free geolocation API
    const response = await fetch('https://ipapi.co/json/');
    
    if (!response.ok) {
      throw new Error('Failed to fetch location');
    }

    const data = await response.json();
    
    return {
      country: data.country_name || 'Unknown',
      countryCode: data.country_code || 'US',
      isEgypt: data.country_code === 'EG',
    };
  } catch (error) {
    console.error('Location detection failed:', error);
    // Default to US if detection fails
    return {
      country: 'United States',
      countryCode: 'US',
      isEgypt: false,
    };
  }
}

/**
 * Get available payment providers based on user location
 */
export function getAvailablePaymentProviders(isEgypt: boolean): PaymentProviderInfo[] {
  if (isEgypt) {
    // Egyptian users get InstaPay and Wallet options
    return [
      {
        id: 'instapay',
        name: 'InstaPay',
        description: 'Transfer via InstaPay',
        icon: '💳',
        enabled: true, // Always enabled for Egyptian users if they want to use it
        currency: 'EGP',
        conversionRate: 30.5,
      },
      {
        id: 'wallet',
        name: 'Mobile Wallet',
        description: 'Vodafone Cash',
        icon: '📱',
        enabled: true,
        currency: 'EGP',
        conversionRate: 30.5,
      },
    ];
  } else {
    // Global users get Stripe
    return [
      {
        id: 'stripe',
        name: 'Credit/Debit Card',
        description: 'Pay securely with Stripe',
        icon: '💳',
        enabled: !!process.env.NEXT_PUBLIC_STRIPE_ENABLED,
        currency: 'USD',
      },
    ];
  }
}

/**
 * Convert price based on payment provider
 */
export function convertPrice(
  priceUSD: number,
  provider: PaymentProviderInfo
): { amount: number; currency: string; formatted: string } {
  if (provider.currency === 'EGP' && provider.conversionRate) {
    const amountEGP = Math.round(priceUSD * provider.conversionRate);
    return {
      amount: amountEGP,
      currency: 'EGP',
      formatted: `${amountEGP} EGP`,
    };
  }

  return {
    amount: priceUSD,
    currency: 'USD',
    formatted: `$${priceUSD}`,
  };
}

/**
 * Get payment provider display name
 */
export function getPaymentProviderName(provider: PaymentProvider): string {
  const names: Record<PaymentProvider, string> = {
    stripe: 'Stripe',
    instapay: 'InstaPay',
    wallet: 'Mobile Wallet',
  };
  return names[provider] || provider;
}
