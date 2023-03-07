// import { loadStripe } from '@stripe/stripe-js';
import stripe from '../utils/stripe.js';
import catchAsync from '../utils/catchAsync.js';
// import AppError from '../utils/appError.js';
import Tour from '../models/tourModels.js';
import Booking from '../models/bookingModels.js';

export const getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) get Tour
  const tour = await Tour.findById(req.params.tourId);

  // 2) Create Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${tour._id}&user=${
      req.user._id
    }&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
          },
        },
      },
    ],
    mode: 'payment',
  });

  // 3) Response session to client
  res.status(200).json({ status: 'success', session });
  // res.redirect(303, session.url);
});

export const createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;

  if (!tour || !user || !price) return next();

  await Booking.create({ tour, user, price });
  res.redirect(303, '/');
});
