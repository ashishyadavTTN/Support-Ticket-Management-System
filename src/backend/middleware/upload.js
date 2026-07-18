const multer = require('multer');
const HttpError = require('../utils/httpError');
const {
  ALLOWED_MIME_TYPES,
  MAX_FILES_PER_UPLOAD,
  MAX_FILE_SIZE_BYTES,
} = require('../constants/attachments');

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter(req, file, cb) {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new HttpError(400, 'Only image files (JPEG, PNG, GIF, WebP) are allowed.'));
  },
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: MAX_FILES_PER_UPLOAD,
  },
});

function handleMulterError(err, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_COUNT') {
      next(new HttpError(400, `Maximum ${MAX_FILES_PER_UPLOAD} images per upload.`));
      return;
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
      next(
        new HttpError(400, `Each image must be under ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB.`)
      );
      return;
    }
    next(new HttpError(400, err.message));
    return;
  }
  next(err);
}

function optionalMultipart(fieldName = 'attachments') {
  return (req, res, next) => {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      next();
      return;
    }

    upload.array(fieldName, MAX_FILES_PER_UPLOAD)(req, res, (err) => {
      if (err) {
        handleMulterError(err, next);
        return;
      }
      next();
    });
  };
}

module.exports = { optionalMultipart, MAX_FILES_PER_UPLOAD };
