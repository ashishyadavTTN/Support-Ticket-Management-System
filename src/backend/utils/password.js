const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

async function hashPassword(plainText) {
  return bcrypt.hash(plainText, SALT_ROUNDS);
}

async function comparePassword(plainText, passwordHash) {
  if (!passwordHash) return false;
  return bcrypt.compare(plainText, passwordHash);
}

module.exports = {
  hashPassword,
  comparePassword,
};
