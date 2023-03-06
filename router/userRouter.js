// const express = require('express');
// const authController = require('../controllers/authController');
// const userController = require('../controllers/userController');
import express from 'express';
import * as authController from '../controllers/authController.js';
import * as userController from '../controllers/userController.js';

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgot', authController.forgotPassword);
router.patch('/reset/:token', authController.resetPassword);

// Protect all routes after this middleware
router.use(authController.protect);

router.patch('/updatePassword', authController.updatePassword);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.patch('/deleteMe', userController.deleteMe);
router.get('/me', userController.getMe, userController.getUser);
router.get('/logout', authController.logout);

// Restrict all routes after this middleware
router.use(authController.restrictTo('admin'));

router.route('/').get(userController.getAllUsers);
router
  .route('/:id')
  .patch(userController.updateUser)
  .delete(userController.delUser)
  .get(userController.getUser);

// module.exports = router;
export default router;
