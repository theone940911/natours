// const mongoose = require('mongoose');
// const slugify = require('slugify');
import mongoose from 'mongoose';
import slugify from 'slugify';

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name!'],
      unique: true,
      trim: true,
      maxlength: [40, 'A name must below 40 characters'],
      minlength: [10, 'A name must above 10 characters'],
    },
    start: Date,
    secretTour: { type: Boolean, default: false },
    slug: String,
    rating: { type: Number, default: 4.5 },
    price: { type: Number, required: [true, 'A tour must have a price'] },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: `Discount price {VALUE} must lower than regular price`,
      },
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      set: (val) => Math.round(10 * val) / 10,
    },
    ratingsQuantity: { type: Number, default: 0 },
    images: [String],
    startDates: [Date],
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration!'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size!'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty!'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy, medium or difficult',
      },
    },
    summary: { type: String, trim: true },
    description: {
      type: String,
      required: [true, 'A tour must have a description!'],
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image!'],
    },
    createdAt: { type: Date, default: Date.now(), select: false },
    startLocation: {
      // GeoJson
      type: { type: String, default: 'Point', enum: ['Point'] },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeek').get(function () {
  return this.duration / 7;
});

// Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// DOCUMENT MIDDLEWARE (only work for "save()" and "crate()")
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });

  next();
});

// tourSchema.pre('save', async function (next) {
//   const guidesPromise = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromise);

//   next();
// });

// QUERY MIDDLEWAR
// BEFORE QUERY (pre)
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = new Date();
  next();
});

// Populate guides
tourSchema.pre(/^find/, function (next) {
  this.populate({ path: 'guides', select: '-__v -changePasswordAt' });

  next();
});

// AFTER QUERY (post)
// tourSchema.post(/^find/, function (docs, next) {
//   console.log(`Query took ${new Date() - this.start} milliseconds!`);
//   next();
// });

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
  if (this.pipeline()[0].$geoNear) return next();

  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

// tourSchema.post('aggregate', function (docs, next) {
//   console.log(789);
//   next();
// });
const Tour = mongoose.model('Tour', tourSchema);

// module.exports = Tour;
export default Tour;
