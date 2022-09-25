const Pomo = require("./../models/pomoModel");
const catchAsync = require("express-async-handler");
const appError = require("./../utils/appError");
const { default: slugify } = require("slugify");

exports.checkIfUserCreatedPomo = catchAsync(async (req, res, next) => {
    const pomo = await Pomo.findOne({
        slug: req.params.pomoSlug,
    });

    if (!pomo) {
        return next(new appError(400, "There is no pomo with this name"));
    }

    if (String(pomo.user._id) !== String(req.user._id)) {
        return next(
            new appError(
                401,
                "You do not have authorization to access this pomodoro timer"
            )
        );
    }

    req.pomo = pomo;

    next();
});

exports.createPomo = catchAsync(async (req, res, next) => {
    const pomo = await Pomo.create({ ...req.body, user: req.user._id });

    if (!pomo) {
        return next(new appError(400, "Couldn't create a new pomo"));
    }

    res.status(201).json({
        status: "success",
        data: {
            pomo,
        },
    });
});

exports.getUserPomos = catchAsync(async (req, res, next) => {
    const pomos = await Pomo.find({ user: req.user._id });

    if (!pomos) {
        return next(
            new appError(
                400,
                "Couldn't get user pomos...something went wrong on server side"
            )
        );
    }

    return res.status(200).json({
        status: "success",
        results: pomos.length,
        data: {
            pomos,
        },
    });
});

exports.getOneUserPomo = catchAsync(async (req, res, next) => {
    return res.status(200).json({
        status: "success",
        data: {
            pomo: req.pomo,
        },
    });
});

exports.updateOneUserPomo = catchAsync(async (req, res, next) => {
    req.body.slug = slugify(req.body.pomoName, {
        replacement: "-",
        lower: true,
    });
    const updatedPomo = await Pomo.findByIdAndUpdate(req.pomo._id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!updatedPomo) {
        return next(new appError(400, "Couldn't update pomo"));
    }

    return res.status(200).json({
        status: "success",
        data: {
            pomo: updatedPomo,
        },
    });
});

exports.deleteOneUserPomo = catchAsync(async (req, res, next) => {
    await Pomo.findByIdAndDelete(req.pomo._id);

    return res.status(200).json({
        status: "success",
        data: null,
    });
});
