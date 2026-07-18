const { validationResult } = require('express-validator');

/**
 * Runs express-validator chains and returns 400 on failure.
 */
function validate(validations) {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    return next();
  };
}

module.exports = { validate };
