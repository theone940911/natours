// const jwt = require('jsonwebtoken');
// const { promisify } = require('util');
// const User = require('../models/userModels');
// const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');
// const sendEmail = require('../utils/email');
// const createCryptoHash = require('../utils/verifyResetToken');
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import User from '../models/userModels.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import createCryptoHash from '../utils/verifyResetToken.js';
import Email from '../utils/email.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  cookieOptions.secure = process.env.NODE_ENV === 'production';

  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({ status: 'success', token, data: { user } });
};

export const signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });

  const url = `${req.protocol}://${req.get('host')}/account`;
  await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 200, res);
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError('email and password are required', 400));

  const user = await User.findOne({ email }, { password: 1 });

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('Incorrect email / password', 401));

  createSendToken(user, 200, res);
});

export const protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  if (!req.headers.authorization?.startsWith('Bearer') && !req.cookies.jwt)
    return next(new AppError('Please Log In', 401));
  const token = req.cookies.jwt
    ? req.cookies.jwt
    : req.headers.authorization.replace('Bearer ', '');

  // 2) Verification token
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // const decode = jwt.verify(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decode.id);

  if (!currentUser)
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );

  // 4) check if user changed password after the token was issued
  if (currentUser.changePasswordAfter(decode.iat))
    return next(
      new AppError('User recently changed password. Please log in again', 401)
    );

  // 5) asign current user to request
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

export const restrictTo = (...roles) =>
  catchAsync(async (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError('You do not have permission to perform this action.', 403)
      );

    next();
  });

export const forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get userbased on POSTed email
  const currentUser = await User.findOne({ email: req.body.email });
  if (!currentUser)
    return next(new AppError('There is no user with this address.', 404));

  // 2) Generate the random reset token
  const resetToken = currentUser.createPasswordResetToken();
  await currentUser.save({ validateBeforeSave: false });

  // 3) sent it to user's email
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/forgot/${resetToken}`;
    await new Email(currentUser, resetURL).sendForgotPassWord();
  } catch (err) {
    currentUser.passwordResetToken = undefined;
    currentUser.passwordResetExpires = undefined;
    await currentUser.save({ validateBeforeSave: false });
    return next(
      new AppError('There was an error sending the email. Try again later', 500)
    );
  }

  res.status(200).json({
    status: 'success',
    resetToken,
    message: 'password reset link had sent to your email.',
  });
});

export const resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on token
  const hashedtoken = createCryptoHash(req.params.token);
  const currentUser = await User.findOne({
    passwordResetToken: hashedtoken,
    passwordResetExpires: {
      $gte: new Date(),
    },
  });

  if (!currentUser)
    return next(
      new AppError('Invalid Token. Please apply for a new token.', 404)
    );

  const { password, passwordConfirm } = req.body;
  // if (password !== passwordConfirm)
  //   return next(
  //     new AppError('Password and passwordConfirm must be the same.', 400)
  //   );

  // 2) If token has not expired, and there is user, set the new password

  currentUser.password = password;
  currentUser.passwordConfirm = passwordConfirm;
  currentUser.passwordResetToken = undefined;
  currentUser.passwordResetExpires = undefined;
  await currentUser.save();

  createSendToken(currentUser, 200, res);
});

export const updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password)))
    return next(new AppError('Incorrect password. Please try again.', 401));

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});

export const isLogin = async (req, res, next) => {
  // 1) CHECK IF LOGIN
  if (!req.cookies.jwt) return next();

  // 2) Verification token
  try {
    const token = req.cookies.jwt;
    const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decode.id);
    if (!currentUser) return next();

    // 4) check if user changed password after the token was issued
    if (currentUser.changePasswordAfter(decode.iat)) return next();

    // 5) asign current user to request
    res.locals.user = currentUser;
    next();
  } catch (err) {
    next();
  }
};

export const logout = (req, res) => {
  const cookieOptions = {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  };
  res.cookie('jwt', 'loggout', cookieOptions);
  res.status(200).json({ status: 'success' });
};
