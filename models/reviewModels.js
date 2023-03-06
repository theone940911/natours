// const mongoose = require('mongoose');
// const Tour = require('./tourModels');
import mongoose from 'mongoose';
import Tour from './tourModels.js';

const updateTourReview = async (tourId, stats) => {
  await Tour.findByIdAndUpdate(tourId, {
    ratingsAverage: stats ? stats[0].ratingsAverage : 4.5,
    ratingsQuantity: stats ? stats[0].ratingsQuantity : 0,
  });
};

const reviewSchema = new mongoose.Schema({
  review: { type: String, required: [true, 'Review can not be empty.'] },
  rating: {
    type: Number,
    required: [true, 'Must have a rating.'],
    min: 1,
    max: 5,
  },
  createdAt: { type: Date, default: new Date() },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Review must belong to a tour.'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to an user.'],
  },
});

reviewSchema.pre('save', function (next) {
  this.populate({ path: 'user', select: '-__v -_id -changePasswordAt' });
  // this.populate('tour');
  next();
});

reviewSchema.statics.calcAverageRating = async function (tourId) {
  return await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        ratingsAverage: { $avg: '$rating' },
        ratingsQuantity: { $sum: 1 },
      },
    },
  ]);
};

// Check for Duplicated Review
// reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// Update Tour Review for every NEW review
reviewSchema.post('save', async function () {
  const tourId = this.tour;
  const stats = await this.constructor.calcAverageRating(tourId);
  await updateTourReview(tourId, stats);
});

// Update Tour Review for each UPDATE and DELETE review
reviewSchema.post(/^findOneAnd/, async (doc) => {
  const tourId = doc.tour;
  const stats = await doc.constructor.calcAverageRating(tourId);
  await updateTourReview(tourId, stats);
});

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name photo' });

  next();
});

const Review = mongoose.model('Review', reviewSchema);

// module.exports = Review;
export default Review;
