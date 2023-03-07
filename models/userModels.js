// const mongoose = require('mongoose');
import mongoose from 'mongoose';
// const validator = require('validator');
import validator from 'validator';
// const bcrypt = require('bcrypt');
import bcrypt from 'bcrypt';
// const crypto = require('crypto');
import crypto from 'crypto';
// const createCryptoHash = require('../utils/verifyResetToken');
import createCryptoHash from '../utils/verifyResetToken.js';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name!'],
  },
  password: {
    type: String,
    required: [true, 'A user must have a password!'],
    minlength: [8, 'A password must above 8 characters'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'A user must have a passwordConfirm!'],
    validate: [
      function (val) {
        return val === this.password;
      },
      'passwordConfirm and passeord are not the same!',
    ],
  },
  role: {
    type: String,
    default: 'user',
    enum: { values: ['user', 'guide', 'lead-guide', 'admin'] },
  },
  photo: { type: String, default: 'default.jpg' },
  email: {
    type: String,
    required: [true, 'A user must have a email!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  changePasswordAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: { type: Boolean, select: false, default: true },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.new) return next();

  this.changePasswordAt = new Date() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });

  next();
});

userSchema.methods.correctPassword = async (candidatPassword, userPassword) =>
  await bcrypt.compare(candidatPassword, userPassword);

userSchema.methods.changePasswordAfter = function (tokenIssuedAt) {
  if (this.changePasswordAt)
    return this.changePasswordAt > tokenIssuedAt * 1000;

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = createCryptoHash(resetToken);
  this.passwordResetToken = resetTokenHash;
  this.passwordResetExpires = new Date(new Date().getTime() + 10 * 60 * 1000);

  return resetToken;
};

const User = mongoose.model('User', userSchema);

// module.exports = User;
export default User;
