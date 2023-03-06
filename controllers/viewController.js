// const Tour = require('../models/tourModels');
// const catchAsync = require('../utils/catchAsync');
import Tour from '../models/tourModels.js';
import Booking from '../models/bookingModels.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

export const getOverview = catchAsync(async (req, res, next) => {
  // 1) Get Tour data from collection
  const tours = await Tour.find();

  // 2) Build template

  // 3) Render that template using tour data from 1)
  res.status(200).render('overview', { title: 'All Tours', tours });
});

export const getTour = catchAsync(async (req, res, next) => {
  // 1) Get the data, for the requested tour (includeing reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    select: { review: 1, user: 1, rating: 1 },
  });
  if (!tour) return next(new AppError('There is no tour with that name', 404));

  // 2) Build template
  const mapFeatures = tour.locations.map((el) => ({
    type: 'Feature',
    geometry: {
      type: el.type,
      coordinates: el.coordinates,
    },
    properties: {
      description: el.description,
    },
  }));
  // 3) Render that template using tour form 1)
  res.status(200).render('tour', {
    title: 'Tour detail',
    tour,
    mapFeatures,
  });
});

export const getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

export const getAccount = (req, res, next) => {
  res.status(200).render('account', { title: 'Your account' });
};

export const getBooking = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user._id });
  const tourIds = bookings.map((el) => el.tour._id);
  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).render('overview', { tours });
});
