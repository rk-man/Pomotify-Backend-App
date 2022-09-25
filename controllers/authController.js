const User = require("./../models/userModel");
const catchAsync = require("express-async-handler");
const jwt = require("jsonwebtoken");
const appError = require("./../utils/appError");

const createAndSendToken = (res, statusCode, user) => {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_CODE, {
        expiresIn: process.env.JWT_EXPIRES_IN * 24 * 60 * 60,
    });

    user.password = undefined;

    return res.status(statusCode).json({
        status: "success",
        data: {
            user,
            token,
        },
    });
};

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
        console.log(token);
    }

    if (!token) {
        return next(
            new appError(400, "User not logged in...Please log in to continue")
        );
    }

    let decoded = jwt.verify(token, process.env.JWT_SECRET_CODE);

    let currentUser = await User.findById(decoded.id);

    if (!currentUser) {
        return next(
            new appError(
                400,
                "User associated with this token no longer exists"
            )
        );
    }

    //password changed after logging in -> YET TO DO

    req.user = currentUser;

    return next();
});

exports.restrict = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new appError(
                    401,
                    `User with role "${req.user.role}" is not authorized to perform this action`
                )
            );
        }

        next();
    };
};

exports.signup = catchAsync(async (req, res, next) => {
    const user = await User.create(req.body);

    if (!user) {
        return next(new appError(401, "Couldn't create new user...."));
    }

    createAndSendToken(res, 201, user);
});

exports.login = catchAsync(async (req, res, next) => {
    const { identifier, password } = req.body;

    //check user if exist
    const user = await User.findOne({
        $or: [{ email: identifier }, { username: identifier }],
    }).select("+password");
    if (!user) {
        return next(
            new appError(404, "No user found with that email Id or username")
        );
    }

    //compare password of the user
    if (!(await user.comparePassword(password, user.password))) {
        return next(new appError(400, "Password is incorrect...try again"));
    }

    createAndSendToken(res, 200, user);
});
