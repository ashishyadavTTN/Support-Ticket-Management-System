const HttpError = require('../utils/httpError');

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new HttpError(401, 'Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new HttpError(
          403,
          `Access denied. Required role: ${roles.join(' or ')}.`
        )
      );
    }

    return next();
  };
}

module.exports = authorize;
