// pages/api/products.js
import Stripe from 'stripe';

// Aquí inicializamos Stripe con tu clave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  try {
    // Aquí solicitamos los productos desde Stripe
    const products = await stripe.products.list();

    // Devolvemos los productos en formato JSON
    res.status(200).json(products.data);
  } catch (error) {
    // Si hay un error, devolvemos un mensaje de error
    res.status(500).json({ error: error.message });
  }
}
