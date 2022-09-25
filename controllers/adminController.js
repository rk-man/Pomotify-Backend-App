const Pomo = require("./../models/pomoModel");
const catchAsync = require("express-async-handler");
const appError = require("./../utils/appError");

exports.getAllPomos = catchAsync(async (req, res, next) => {
    const pomos = await Pomo.find();

    if (!pomos) {
        return next(new appError(404, "Couldn't get all pomos...."));
    }

    res.status(200).json({
        status: "success",
        results: pomos.length,
        data: {
            pomos,
        },
    });
});
