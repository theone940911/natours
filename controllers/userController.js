// const catchAsync = require('../utils/catchAsync');
// const User = require('../models/userModels');
// const AppError = require('../utils/appError');
// const filterObj = require('../utils/filterObj');
// const handlerFactory = require('./handlerFactory');
import multer from 'multer';
import sharp from 'sharp';
import catchAsync from '../utils/catchAsync.js';
import User from '../models/userModels.js';
import AppError from '../utils/appError.js';
import filterObj from '../utils/filterObj.js';
import * as handlerFactory from './handlerFactory.js';

export const getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

// --ADD MULTER MIDDLEWARE to UPLOAD USER PHOTO--
// 0) DESTINATION OPTIONS
const storage = multer.memoryStorage();

// 1) FILTER OPTIONS
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else cb(new AppError('Only image is allowed. Please tyr again.', 400));
};
export const uploadUserPhoto = multer({ storage, fileFilter }).single('photo');

// --ADD PHOTO RESIZING MIDDLEWARE--
export const resizeUserPhoto = async (req, res, next) => {
  if (!req.file) return next();
  const filename = `user-${req.user._id}${new Date().getTime()}.jpg`;
  req.file.filename = filename;

  // 0) RESIZE ==> CONVERT to JPEG ==> COMPRESS to 90% ==> UPLOAD FILE FROM BUFFER to DISK
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg()
    .toFile(`public/img/users/${filename}`);
  next();
};

export const updateMe = catchAsync(async (req, res, next) => {
  // 1) Create Error if user POSTs password data
  if (req.body.password)
    return next(
      new AppError(
        'This route is not for password udpates. Please use update my password.',
        400
      )
    );

  // 2) Update user document
  if (req.file) req.body.photo = req.file.filename;
  const updateObj = filterObj(req.body, 'name', 'email', 'photo');
  const updateUser = await User.findByIdAndUpdate(req.user._id, updateObj, {
    runValidators: true,
    new: true,
    select: { _id: 0 },
  });

  res.status(200).json({
    status: 'success',
    data: { updateUser },
  });
});

export const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, {
    active: false,
  });

  res.status(204).json({ status: 'success', data: null });
});

export const getAllUsers = handlerFactory.getAll(User);
export const getUser = handlerFactory.getOne(User);
export const updateUser = handlerFactory.updateOne(User);
export const delUser = handlerFactory.deleteOne(User);
