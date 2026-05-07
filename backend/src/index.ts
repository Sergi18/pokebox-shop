import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createCheckoutSession, getCheckoutSession } from '../api/payments/checkout';
import { handleStripeWebhook } from '../api/payments/webhook';

// Cargar variables de entorno
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware para CORS
app.use(cors());

// Webhook de Stripe necesita el body en formato raw para la verificación de firma
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const result = await handleStripeWebhook(req.body, sig as string);
    res.json(result);
  } catch (err: any) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// Otros endpoints usan JSON
app.use(express.json());

// Endpoint para crear sesión de checkout
app.post('/api/payments/checkout', async (req, res) => {
  try {
    const result = await createCheckoutSession(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para recuperar información de una sesión
app.get('/api/payments/session/:sessionId', async (req, res) => {
  try {
    const result = await getCheckoutSession(req.params.sessionId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`PokeBox Backend API running at http://localhost:${port}`);
});
