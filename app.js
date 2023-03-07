// const express = require('express');
import express from 'express';
// const path = require('path');
import path from 'path';
import { fileURLToPath } from 'url';
// const morgan = require('morgan');
import morgan from 'morgan';
// const helmet = require('helmet');
import compression from 'compression';
import helmet from 'helmet';
// const crypto = require('crypto');
import crypto from 'crypto';
// const cookieParser = require('cookie-parser');
import cookieParser from 'cookie-parser';
// const mongoSanitize = require('express-mongo-sanitize');
import mongoSanitize from 'express-mongo-sanitize';
// const xss = require('xss-clean');
import xss from 'xss-clean';
// const hpp = require('hpp');
import hpp from 'hpp';
// const rateLimit = require('express-rate-limit');
import rateLimit from 'express-rate-limit';
// const globalErrorHandler = require('./controllers/errorController');
import globalErrorHandler from './controllers/errorController.js';
// const AppError = require('./utils/appError');
import AppError from './utils/appError.js';
// const tourRouter = require('./router/tourRouter');
import tourRouter from './router/tourRouter.js';
// const userRouter = require('./router/userRouter');
import userRouter from './router/userRouter.js';
// const reviewRouter = require('./router/reviewRouter');
import reviewRouter from './router/reviewRouter.js';
// const viewRouter = require('./router/viewRouter');
import viewRouter from './router/viewRouter.js';
import bookRouter from './router/bookingRouter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// 1) MIDDLEWARES
// Set security HTTP headers
// app.use(helmet());

app.use(compression());

app.use((req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString('hex');
  next();
});

// app.use(helmet());
// app.use(
//   helmet({
//     crossOriginEmbedderPolicy: false,
//   }),
//   // helmet.crossOriginEmbedderPolicy({ policy: 'credentialless' }),
//   helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }),
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: [
//         'self',
//         'https://*.stripe.com',
//         'https://*.mapbox.com',
//         'http://127.0.0.1:3000',
//         (req, res) => `'nonce-${res.locals.cspNonce}'`,
//         'data:',
//         'blob:',
//         'ws:',
//       ],
//       scriptSrc: [
//         'self',
//         'https://*.stripe.com',
//         'https://*.mapbox.com',
//         'http://127.0.0.1:3000',
//         (req, res) => `'nonce-${res.locals.cspNonce}'`,
//         'data:',
//         'blob:',
//         'ws:',
//       ],
//       imgSrc: [
//         'self',
//         'https://*.stripe.com',
//         'https://*.mapbox.com',
//         'http://127.0.0.1:3000',
//         'data:',
//       ],
//       styleSrc: [
//         'self',
//         'https://*.stripe.com',
//         'https://*.mapbox.com',
//         'http://127.0.0.1:3000',
//         'http://*.googleapis.com',
//         'data:',
//         (req, res) => `'nonce-${res.locals.cspNonce}'`,
//       ],
//       connectSrc: [
//         'self',
//         'https://*.stripe.com',
//         'https://*.mapbox.com',
//         'http://127.0.0.1:3000',
//       ],
//       frameAncestors: ['https://*.stripe.com'],
//     },
//   })
// );

// Development logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Set limit rate
const limiter = rateLimit({
  max: 10,
  windowMs: 60 * 1 * 1000,
  message: 'Too many request! Please try again in an hour',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Body parser, reading data from HTML FORM element(without API way) into req.body
app.use(express.urlencoded({ limit: '10kb', extended: false }));

// cookie parser, reading cookie from body into req.cookie
app.use(cookieParser());

// Data snaitization against NoSQL query injection
app.use(mongoSanitize());

// Data snaitization against NoSQL query injection
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'price',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// 2) ROUTES
app.use('', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/bookings', bookRouter);
app.use('/api/v1/reviews', reviewRouter);

app.use('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);
// module.exports = app;
export default app;
