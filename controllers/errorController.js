// const AppError = require('../utils/appError');
import AppError from '../utils/appError.js';

const handleJWTErrorDB = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredErrorDB = () =>
  new AppError('Your token has expired. Please log in again!', 401);

const handleValidatorErrorDB = (err) => {
  const keys = Object.keys(err);
  const values = keys.map((key) => err[key].message);
  const message = keys.map((key, i) => `${key}: ${values[i]}`).join('. ');
  return new AppError(`Invalid inputs: ${message}`, 400);
};

const handleDuplicateErrorDB = (err) =>
  // new AppError(`Duplicate Error: ${err.keyValue}`, 400);
  {
    const value = err.message.match(/(?:"[^"]*"|^[^"]*$)/g)[0];
    return new AppError(`Duplicate field error: ${value}`, 400);
  };

const handleCastErrorDB = (err) =>
  new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const sendError = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  } else {
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.isOperational ? err.message : 'Something went wrong',
    });
  } else {
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.isOperational ? err.message : '',
    });
  }
};

export default (err, req, res, next) => {
  err.statusCode ??= 500;
  err.status ??= 'error';
  if (process.env.NODE_ENV === 'development') sendError(err, req, res);
  else if (process.env.NODE_ENV === 'production') {
    let error;
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateErrorDB(err);
    if (err.name === 'ValidationError')
      error = handleValidatorErrorDB(err.errors);
    if (err.name === 'JsonWebTokenError') error = handleJWTErrorDB();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredErrorDB();

    error ||= err;
    sendErrorProd(error, req, res);
  }
};
