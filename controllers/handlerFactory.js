// const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');
// const ApiFeature = require('../utils/apiFeature');
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import ApiFeature from '../utils/apiFeature.js';

export const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) return next(new AppError('No tour found with that ID', 404));
    res.status(204).json({ status: 'success', data: null });
  });

export const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    if (req.files.imageCover)
      req.body.imageCover = req.files.imageCover[0].filename;

    if (req.files.images)
      req.body.images = req.files.images.map((el) => el.filename);

    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
      new: true,
    });

    if (!doc) return next(new AppError('No tour found with that ID', 404));
    res.status(200).json({ status: 'success', data: { data: doc } });
  });

export const createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({ status: 'success', data: { data: doc } });
  });

export const getOne = (Model, populateOption) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOption) query = query.populate(populateOption);
    const doc = await query;
    if (!doc) return next(new AppError('No request found with that ID', 404));

    res.status(200).json({ status: 'success', data: { data: doc } });
  });

export const getAll = (Model, populateOption) =>
  catchAsync(async (req, res, next) => {
    const { tourId } = req.params;
    const filter = tourId ? { tour: tourId } : {};
    const features = new ApiFeature(Model.find(filter), req.query)
      .filter()
      .sort()
      .limit()
      .paginate();
    let { query } = features;
    if (populateOption) query = query.populate(populateOption);
    const models = await query;
    res.status(200).json({
      status: 'success',
      results: models.length,
      data: { data: models },
    });
  });
