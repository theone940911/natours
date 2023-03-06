// const fs = require('fs');
// const Tour = require('../models/tourModels');
// const catchAsync = require('../utils/catchAsync');
// const handlerFactory = require('./handlerFactory');
// const AppError = require('../utils/appError');
import multer from 'multer';
import sharp from 'sharp';
import Tour from '../models/tourModels.js';
import catchAsync from '../utils/catchAsync.js';
import * as handlerFactory from './handlerFactory.js';
import AppError from '../utils/appError.js';

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8')
// );

// export const checkBody = (req, res, next) => {
//   const { body } = req;
//   if (!body.name || !body.price)
//     return res
//       .status(400)
//       .json({ status: 'fail', message: 'Missing name or price' });
//   next();
// };

// module.exports.checkID = (req, res, next, val) => {
//   if (!tours.some((tour) => tour.id === +val))
//     return res.status(404).send({
//       status: 'fail',
//       message: 'Invalid ID',
//     });
//   next();
// };
// -- UPDATE TOUR PHOTO --
export const uploadTourPhoto = multer({
  storage: multer.memoryStorage(),
}).fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

export const resizeTourPhoto = async (req, res, next) => {
  if (!req.files) return next();

  const { imageCover, images } = req.files;
  await Promise.all(
    [...imageCover, ...images].map(async (el, i) => {
      el.filename =
        el.fieldname === 'imageCover'
          ? `tour-${req.params.id}-cover.jpg`
          : `tour-${req.params.id}-${i}.jpg`;

      await sharp(el.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg()
        .toFile(`public/img/tours/${el.filename}`);
    })
  );

  next();
};

export const aliasTopTour = (req, res, next) => {
  req.query.sort = '-price';
  req.query.limit = +req.params.id;
  req.query.fields = 'name price ratingsAverage difficulty';
  next();
};

// '/tours-within/:distance/center/:latlng/unit/:unit',
export const getTourWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const radius = unit === 'mi' ? distance / 3958.8 : distance / 6371;
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng)
    return next(
      new AppError('Latitude or longitude is missing. Please try again.', 400)
    );
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res
    .status(200)
    .json({ status: 'success', results: tours.length, data: { data: tours } });
});

export const getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const multiplier = unit === 'mi' ? 0.00062 : 0.001;
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng)
    return next(
      new AppError('Latitude or longitude is missing. Please try again.', 400)
    );
  // const distances = await Tour.find({
  //   startLocation: {
  //     $nearSphere: { $geometry: { type: 'Point', coordinates: [+lng, +lat] } },
  //   },
  // }).select({ name: 1 });
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [+lng, +lat] },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    { $project: { name: 1, distance: 1 } },
    { $sort: { distance: 1 } },
  ]);

  res.status(200).json({
    status: 'success',
    results: distances.length,
    data: { data: distances },
  });
});

export const getAllTours = handlerFactory.getAll(Tour, { path: 'reviews' });

export const getTour = handlerFactory.getOne(Tour, { path: 'reviews' });
// export const getTour = handlerFactory.getOne(Tour);

export const creatTour = handlerFactory.createOne(Tour);

export const updateTour = handlerFactory.updateOne(Tour);

export const delTour = handlerFactory.deleteOne(Tour);

export const getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: '$difficulty',
        totalNumber: { $sum: 1 },
        totalRating: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: -1 },
    },
  ]);
  res.status(200).json({ status: 'scuess', data: { stats } });
});

export const getMonthlyPlan = catchAsync(async (req, res) => {
  const { year } = req.params;
  const monthlyPlan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        totalNumber: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { totalNumber: -1 },
    },
    {
      $limit: 3,
    },
  ]);
  res.status(200).json({ status: 'scuess', data: { monthlyPlan } });
});
