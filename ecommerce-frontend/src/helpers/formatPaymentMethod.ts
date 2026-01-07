/**
 * Formats payment method for display
 * Maps backend payment method values to user-friendly display names
 */
export function formatPaymentMethod(paymentMethod: string): string {
  const paymentMethodMap: Record<string, string> = {
    'credit_card': 'Credit Card / Debit Card',
    'stripe': 'Stripe',
    'paypal': 'PayPal',
  };

  return paymentMethodMap[paymentMethod] || paymentMethod;
}

