exports.advErrorHandler = (message, status, data) => {
  const error = new Error(message);
  if (data) error.data = data;
  error.statusCode = status;
  throw error;
};

exports.errorHandler = (err, next) => {
  if (!err.statusCode) err.statusCode = 500;
  next(err);
};