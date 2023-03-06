// const express = require('express');
// const tourController = require('../controllers/tourController');
// const authController = require('../controllers/authController');
// const reviewRouter = require('./reviewRouter');
import express from 'express';
import * as authController from '../controllers/authController.js';
import * as tourController from '../controllers/tourController.js';
import reviewRouter from './reviewRouter.js';

const router = express.Router();

// 1) middleware
router
  .route('/top-:id-cheap')
  .get(tourController.aliasTopTour, tourController.getAllTours);

// // 2) endpoint

router.use('/:tourId/reviews', reviewRouter);

router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/tour-monthlyPlan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getTourWithin);

router.route('/distance/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/')
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.creatTour
  )
  .get(tourController.getAllTours);

router
  .route('/:id')
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourPhoto,
    tourController.resizeTourPhoto,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.delTour
  )
  .get(tourController.getTour);

// module.exports = router;
export default router;
