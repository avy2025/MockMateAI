const logger = require('../utils/logger');

const errorMiddleware = (err, req, res, next) => {
  let { statusCode, message } = err;

  if (!statusCode) {
    statusCode = 500;
  }

  res.locals.errorMessage = err.message;

  const response = {
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  if (process.env.NODE_ENV === 'development') {
    logger.error({
      msg: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  } else if (statusCode >= 500) {
    logger.error({
      msg: err.message,
      path: req.path,
      method: req.method,
      requestId: req.id,
    });
  }

  res.status(statusCode).send(response);
};

module.exports = errorMiddleware;
