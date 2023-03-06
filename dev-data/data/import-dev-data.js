const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');

const ModelName = process.argv[3];

let Model;
if (ModelName === 'users') Model = require('../../models/userModels');

if (ModelName === 'reviews') Model = require('../../models/reviewModels');

if (ModelName === 'tours') Model = require('../../models/tourModels');

if (!['users', 'reviews', 'tours'].includes(ModelName)) {
  console.log('Please specify the model name');
  process.exit();
}
dotenv.config({ path: './config.env' });

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

const models = JSON.parse(
  fs.readFileSync(`${__dirname}/${ModelName}.json`, 'utf-8')
);

const importData = async () => {
  try {
    await Model.create(models);
    console.log('Data successfully loaded!');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async () => {
  try {
    await Model.deleteMany();
    console.log('Data successfully deleted!');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === '--import') importData();
if (process.argv[2] === '--delete') deleteData();
