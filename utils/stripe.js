import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config({ path: './config.env' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
(async () =>
  await stripe.customers.create({ email: 'pojungchen8@gmail.com' }))();

export default stripe;
