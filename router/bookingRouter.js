import express from 'express';
import * as authController from '../controllers/authController.js';
import * as bookingController from '../controllers/bookingController.js';

const router = express.Router();

router.get(
  '/checkout-session/:tourId',
  authController.protect,
  bookingController.getCheckoutSession
);

export default router;
