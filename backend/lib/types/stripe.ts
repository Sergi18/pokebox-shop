export interface PokeCoinPackage {
  id: string;
  name: string;
  pokecoins: number;
  price: number; // en centavos
  bonus?: number; // pokecoins bonus
}

export interface CheckoutSessionRequest {
  packageId?: string;
  amount?: number;
  userId: string;
  email: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  clientSecret: string;
}

export interface PaymentWebhook {
  type: string;
  data: {
    object: {
      id: string;
      status: string;
      customer_email?: string;
      metadata?: {
        userId?: string;
        packageId?: string;
        pokecoins?: string;
      };
      amount_total?: number;
      currency?: string;
    };
  };
}
