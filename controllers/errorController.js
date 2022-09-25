const appError = require("./../utils/appError");

const sendErrorDev = (err, res) => {
    return res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

const sendErrorProd = (err, res) => {
    return res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

const handleValidationErrorDB = (err) => {
    //errors variables is gonna hold an array of messages from all validation error
    const errors = Object.values(err.errors).map((el) => {
        return el.message;
    });

    const message = `Invalid input data : ${errors.join(". ")}`;

    return new appError(err.statusCode, message);
};

const handleDuplicateErrorDB = (err) => {
    const value = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];

    const message = `Duplicate field value : ${value}`;

    return new appError(err.statusCode, message);
};

module.exports = function (err, req, res, next) {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "fail";

    if (process.env.NODE_ENV === "development") {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === "production") {
        let error = { ...err };

        //when I or app send an error, it will have a message but when sometimes message is not present in err.message....hence we create our own appError using these function
        error.message = err.message;

        if (err.name === "ValidationError") {
            error = handleValidationErrorDB(error);
        }

        if (err.code === 11000) {
            error = handleDuplicateErrorDB(error);
        }
        sendErrorProd(error, res);
        next();
    }
};
