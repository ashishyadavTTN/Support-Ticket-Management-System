const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../src/backend/.env'),
});

process.env.NODE_ENV = 'test';

const sequelize = require('../src/backend/config/sequelize');
require('../src/backend/models');

beforeAll(async () => {
  await sequelize.authenticate();
});

afterAll(async () => {
  await sequelize.close();
});
