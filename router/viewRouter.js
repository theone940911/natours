// const express = require('express');
// const viewController = require('../controllers/viewController');
// const authController = require('../controllers/authController');
import express from 'express';

import * as authController from '../controllers/authController.js';
import * as viewController from '../controllers/viewController.js';
import * as bookingController from '../controllers/bookingController.js';

const router = express.Router();

router.route('/account').get(authController.protect, viewController.getAccount);
router.get('/booking', authController.protect, viewController.getBooking);

router.use(authController.isLogin);

router.get(
  '/',
  bookingController.createBookingCheckout,
  viewController.getOverview
);

router.get('/tours/:slug', viewController.getTour);

router.get('/login', viewController.getLoginForm);

// module.exports = router;
export default router;
