const HttpError = require('../utils/httpError');

function checkPermission(permissionKey) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new HttpError(401, 'Authentication required'));
    }

    if (req.user.role === 'admin') {
      return next();
    }

    const permissions = req.user.getEffectivePermissions();

    if (!permissions[permissionKey]) {
      return next(
        new HttpError(
          403,
          `Insufficient permissions. Required: ${permissionKey}.`
        )
      );
    }

    return next();
  };
}

module.exports = checkPermission;
