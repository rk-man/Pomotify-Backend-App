//these are the errors that are thrown because of the user
class appError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "success";
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = appError;
