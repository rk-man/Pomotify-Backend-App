const catchAsync = require("express-async-handler");
const appError = require("./../utils/appError");
const User = require("./../models/userModel");
const cloudinary = require("./../config/cloudinary");

exports.checkIfLoggedInAndRequestingUserAreSame = catchAsync(
    async (req, res, next) => {
        const user = await User.findOne({
            username: req.params.userSlug,
            _id: req.user._id,
        });

        if (!user) {
            return next(
                new appError(
                    403,
                    "You don't have authorization to access this account's or user's data"
                )
            );
        }

        next();
    }
);

exports.getSingleUser = catchAsync(async (req, res, next) => {
    if (!req.user) {
        return next(new appError(404, "Couldn't get the logged in user..."));
    }
    return res.status(200).json({
        status: "success",
        data: {
            user: req.user,
        },
    });
});

exports.getMe = catchAsync(async (req, res, next) => {
    if (req.user) {
        return res.status(200).json({
            status: "success",
            data: {
                user: req.user,
            },
        });
    } else {
        return next(
            new appError(
                401,
                "You are not logged in...please log in to access your info"
            )
        );
    }
});

exports.uploadImageCloudinary = catchAsync(async (req, res, next) => {
    // console.log(req.body.uploadingFile);

    try {
        const cloudinaryRes = await cloudinary.uploader.upload(
            req.body.uploadingFile,
            {
                upload_preset: "ml_default",
                folder: "Pomodoro-Timer-App",
                overwrite: true,
                unique_filename: true,
                format: "jpeg",
            }
        );

        console.log(cloudinaryRes);

        req.uploadedImageUrl = cloudinaryRes.url;
    } catch (err) {
        return next(
            new appError(400, "Couldn;t upload image to the cloudinary...")
        );
    }

    next();
});

exports.updateUserProfileImage = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findOneAndUpdate(
        {
            username: req.params.userSlug,
            _id: req.user._id,
        },
        {
            profileImage: req.uploadedImageUrl,
        },
        {
            runValidators: true,
            new: true,
        }
    );

    if (!updatedUser) {
        return next(
            new appError(
                400,
                "Couldn't update the user's profile image...try again"
            )
        );
    }

    return res.status(200).json({
        status: "success",
        data: {
            user: updatedUser,
        },
    });
});

exports.updateUserAcccount = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findOneAndUpdate(
        {
            _id: req.user._id,
        },
        req.body,
        {
            new: true,
            runValidators: true,
        }
    );

    if (!updatedUser) {
        return next(
            new appError(
                400,
                "Couldn't update user account details...try again"
            )
        );
    }
    return res.status(200).json({
        status: "success",
        data: {
            user: updatedUser,
        },
    });
});

exports.updateUserPassword = catchAsync(async (req, res, next) => {
    const { oldPassword, newPassword, passwordConfirm } = req.body;

    if (newPassword != passwordConfirm) {
        return next(new appError(400, "Passwords do not match..try again"));
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
        return next(
            new appError(400, "User must be logged in to update his password")
        );
    }

    if (!(await user.comparePassword(oldPassword, user.password))) {
        return next(
            new appError(400, "Your current password is incorrect...try again")
        );
    }

    user.password = newPassword;
    user.passwordConfirm = passwordConfirm;
    await user.save({ validateBeforeSave: true });
    user.password = undefined;
    return res.status(200).json({
        status: "success",
        data: {
            user,
        },
    });
});
