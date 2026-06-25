const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found`;
    error = new Error(message);
    error.statusCode = 404;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new Error(message);
    error.statusCode = 409;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new Error(message);
    error.statusCode = 400;
  }

  const statusCode = error.statusCode || res.statusCode || 500;

  res.status(statusCode === 200 ? 500 : statusCode).json({
    success: false,
    message: error.message || 'Server Error',
    errors: process.env.NODE_ENV === 'development' ? [err.stack] : [],
  });
};

module.exports = { errorHandler };
