const { User } = require('../models');
const { verifyAccessToken } = require('../utils/jwt');
const HttpError = require('../utils/httpError');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HttpError(401, 'Authentication required. Provide a valid Bearer token.');
    }

    const token = authHeader.slice(7);

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new HttpError(401, 'Access token has expired. Please refresh or log in again.');
      }
      throw new HttpError(401, 'Invalid access token.');
    }

    const user = await User.findByPk(payload.userId);

    if (!user) {
      throw new HttpError(401, 'User not found. Token may be invalid.');
    }

    if (!user.isActive) {
      throw new HttpError(403, 'Account is deactivated. Contact an administrator.');
    }

    req.user = user;
    req.tokenPayload = payload;
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = authenticate;
