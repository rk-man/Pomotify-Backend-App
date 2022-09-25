const mongoose = require("mongoose");
const slugify = require("slugify");

const pomoSchema = new mongoose.Schema({
    pomoName: {
        type: String,
        required: [true, "A pomodoro timer must have a name"],
        maxLength: [100, "pomoName can't be more than 100"],
        unique: true,
    },
    runTime: {
        type: Number,
        required: [true, "A pomodorr timer must have a run time"],
        default: 25,
    },
    breakTime: {
        type: Number,
        required: [true, "A pomodoro timer must have a break time"],
        default: 5,
    },

    longBreakTime: {
        type: Number,
        required: [true, "A pomodoro timer must have a long break"],
        default: 15,
    },
    longBreakAt: {
        type: Number,
        required: [
            true,
            "Specify after how many sets you wanna take the long break",
        ],
        default: 2,
    },
    repetitions: {
        type: Number,
        required: [true, "A Pomodoro timer must have repetitions"],
        default: 3,
    },

    tasks: {
        type: [String],
        required: [true, "It will help you if list out the tasks"],
        default: [],
    },
    user: {
        type: mongoose.Schema.ObjectId,
        required: [true, "A pomodoro timer must be associated with a user"],
        ref: "User",
    },

    slug: {
        type: String,
        unique: true,
    },

    createdAt: {
        type: Date,
        default: Date.now(),
        required: [true],
    },
});

pomoSchema.pre("save", async function (next) {
    this.slug = slugify(this.pomoName, {
        replacement: "-",
        lower: true,
    });
    await this.populate({
        path: "user",
        select: "username fullName",
    });
    return next();
});

pomoSchema.pre(/^find/, function (next) {
    this.populate({
        path: "user",
        select: "username fullName",
    });
    next();
});

const Pomo = mongoose.model("Pomo", pomoSchema);

module.exports = Pomo;
