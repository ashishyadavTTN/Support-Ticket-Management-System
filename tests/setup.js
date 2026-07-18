const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../src/backend/.env'),
});

process.env.NODE_ENV = 'test';

const sequelize = require('../src/backend/config/sequelize');
require('../src/backend/models');

// Verify DB connectivity early for integration suites. Pure unit tests (which
// never touch the DB) should still run without a live database, so a failed
// connection here is warned about rather than thrown — integration tests will
// fail naturally at query time with a clear error if the DB is unavailable.
beforeAll(async () => {
  try {
    await sequelize.authenticate();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(
      `[tests] Database not reachable during setup: ${err.message}. ` +
        'Unit tests will still run; integration tests require a live database.'
    );
  }
});

afterAll(async () => {
  try {
    await sequelize.close();
  } catch {
    // no-op: connection may never have been established (unit-only run)
  }
});
