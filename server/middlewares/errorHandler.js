import mongoose from "mongoose";
import AppError from "../utils/AppError.js";

const errorConverter = (err, req, res, next) => {
  let error = err;

  // Tạo ánh xạ lỗi
  const statusText = {
    400: "Bad Request",
    500: "Internal Server Error",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    409: "Conflict",
    422: "Unprocessable Entity",
  };

  if (!(error instanceof AppError)) {
    const statusCode = error.statusCode || (error instanceof mongoose.Error ? 400 : 500);
    const message = error.message || statusText[statusCode] || "Unknown Error";

    error = new AppError(statusCode, message, null, false, err.stack);
  }

  next(error);
};

const errorHandler = (err, req, res, next) => {
  console.log("ERROR LOG ", new Date().toLocaleString());
  console.log("Request:", req.method, req.originalUrl);
  console.log("Params:", req.params);
  console.log("Body:", req.body);
  console.log("Query:", req.query);
  console.log("Error: ", err);
  console.log("Error stack: ", err.stack);
  console.log("--------------------------------------------------------------------------------------");
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    statusCode,
    message: err.message || "Internal server error",
    errors: err.errors || null,
    stack: err.stack,
    // stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

export { errorConverter, errorHandler };
