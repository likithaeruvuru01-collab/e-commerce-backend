const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map(
      (error) => error.message
    );

    return res.status(400).json({
      status: false,
      message: messages[0],
      errors: messages
    });
  }

  // Invalid MongoDB ObjectId
  if (err.name === "CastError") {
    return res.status(400).json({
      status: false,
      message: "Invalid ID format"
    });
  }

  // Duplicate MongoDB unique key
  if (err.code === 11000) {
    return res.status(400).json({
      status: false,
      message: "Duplicate value already exists"
    });
  }

  res.status(500).json({
    status: false,
    message: "Internal Server Error"
  });
};

module.exports = errorHandler;
