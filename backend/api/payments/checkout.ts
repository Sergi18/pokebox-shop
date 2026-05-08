import stripe from '../../lib/stripe';
import { POKECOIN_PACKAGES } from '../../lib/pokecoin-packages';
import { CheckoutSessionRequest, CheckoutSessionResponse } from '../../lib/types/stripe';
import pool from '../../lib/db';

// POST /api/payments/checkout
export async function createCheckoutSession(req: CheckoutSessionRequest): Promise<CheckoutSessionResponse> {
  try {
    console.log('Incoming checkout request:', req);
    const { packageId, amount, userId, email } = req;
    let name, description, unit_amount, pokecoins;

    if (amount !== undefined && amount !== null && amount > 0) {
      // Monto personalizado en Euros (Escala 1:1)
      pokecoins = amount; 
      unit_amount = amount * 100; // Stripe usa centavos (1€ = 100 centavos)
      name = 'PokéCoin Pack';
      description = `Purchase of ${amount} PokéCoins`;
    } else if (packageId) {
      // Paquete predefinido
      const package_ = POKECOIN_PACKAGES[packageId];
      if (!package_) {
        throw new Error(`Package ${packageId} not found`);
      }
      pokecoins = package_.pokecoins + (package_.bonus || 0);
      unit_amount = package_.price;
      name = package_.name;
      description = `${package_.pokecoins} PokéCoins${package_.bonus ? ` + ${package_.bonus} bonus` : ''}`;
    } else {
      throw new Error('No amount or packageId provided');
    }

    // Crear sesión de checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name,
              description,
            },
            unit_amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`,
      customer_email: email,
      metadata: {
        userId,
        packageId: packageId || 'custom',
        pokecoins: pokecoins.toString(),
      },
    });

    return {
      sessionId: session.id,
      clientSecret: session.client_secret || '',
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

// GET /api/payments/session/:sessionId
export async function getCheckoutSession(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      await processSuccessfulPayment(session);
    }

    return {
      id: session.id,
      status: session.payment_status,
      customer_email: session.customer_email,
      amount_total: session.amount_total,
      metadata: session.metadata,
    };
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    throw error;
  }
}

async function processSuccessfulPayment(session: any) {
  const { userId, packageId, pokecoins } = session.metadata;
  const amount = session.amount_total / 100;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const checkQuery = `
      SELECT id FROM public.transactions 
      WHERE metadata->>'stripe_session_id' = $1
    `;
    const checkResult = await client.query(checkQuery, [session.id]);

    if (checkResult.rows.length === 0) {
      console.log(`Processing manual verification for session ${session.id}`);

      const updateWalletQuery = `
        UPDATE public.wallets 
        SET balance = balance + $1, 
            total_deposited = total_deposited + $2,
            updated_at = NOW()
        WHERE user_id = $3
      `;
      await client.query(updateWalletQuery, [pokecoins, amount, userId]);

      const insertTransactionQuery = `
        INSERT INTO public.transactions (user_id, amount, type, status, metadata)
        VALUES ($1, $2, 'deposit', 'completed', $3)
      `;
      await client.query(insertTransactionQuery, [
        userId, 
        pokecoins, 
        JSON.stringify({ 
          stripe_session_id: session.id,
          package_id: packageId,
          eur_amount: amount,
          verified_via: 'session_check'
        })
      ]);
      
      console.log(`Successfully added ${pokecoins} PokéCoins to user ${userId}`);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in manual payment processing:', error);
  } finally {
    client.release();
  }
}
