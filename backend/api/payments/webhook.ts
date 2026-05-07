import stripe from '../../lib/stripe';
import pool from '../../lib/db';

// POST /api/payments/webhook
export async function handleStripeWebhook(body: string, signature: string) {
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    throw new Error(`Webhook Error: ${error.message}`);
  }

  // Manejar eventos
  switch (event.type) {
    case 'checkout.session.completed':
      return await handlePaymentSuccess(event.data.object as any);

    default:
      console.log(`Unhandled event type: ${event.type}`);
      return { received: true };
  }
}

async function handlePaymentSuccess(session: any) {
  const client = await pool.connect();
  try {
    const { userId, packageId, pokecoins } = session.metadata;
    const amount = session.amount_total / 100; // Stripe lo envía en centavos

    console.log(`Payment successful for user ${userId}: ${amount} USD -> ${pokecoins} PokéCoins`);

    await client.query('BEGIN');

    // 1. Actualizar balance en wallet
    const updateWalletQuery = `
      UPDATE public.wallets 
      SET balance = balance + $1, 
          total_deposited = total_deposited + $2,
          updated_at = NOW()
      WHERE user_id = $3
    `;
    await client.query(updateWalletQuery, [pokecoins, amount, userId]);

    // 2. Registrar transacción
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
        usd_amount: amount
      })
    ]);

    await client.query('COMMIT');

    return { success: true, userId, pokecoins };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error handling payment success:', error);
    throw error;
  } finally {
    client.release();
  }
}
