// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app.js';

dotenv.config({ path: './config.env' });

// const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log('DB connection successful!');
  });

const port = process.env.PORT || 3000;

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  process.exit(1);
});

const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLE REJECTION! Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
