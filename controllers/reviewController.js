// const Review = require('../models/reviewModels');
// const handlerFactory = require('./handlerFactory');
import Review from '../models/reviewModels.js';
import * as handlerFactory from './handlerFactory.js';

export const setTourUserId = (req, res, next) => {
  req.body.user ||= req.user._id;
  req.body.tour ||= req.params.tourId;

  next();
};

export const getAllReviews = handlerFactory.getAll(Review);
export const getReview = handlerFactory.getOne(Review);
export const createReview = handlerFactory.createOne(Review);
export const deleteReview = handlerFactory.deleteOne(Review);
export const updateReview = handlerFactory.updateOne(Review);
