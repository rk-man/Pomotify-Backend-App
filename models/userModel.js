const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcryptjs");

function checkPasswordValidation(value) {
    const isWhitespace = /^(?=.*\s)/;
    if (isWhitespace.test(value)) {
        return "Password must not contain Whitespaces.";
    }

    const isContainsUppercase = /^(?=.*[A-Z])/;
    if (!isContainsUppercase.test(value)) {
        return "Password must have at least one Uppercase Character.";
    }

    const isContainsLowercase = /^(?=.*[a-z])/;
    if (!isContainsLowercase.test(value)) {
        return "Password must have at least one Lowercase Character.";
    }

    const isContainsNumber = /^(?=.*[0-9])/;
    if (!isContainsNumber.test(value)) {
        return "Password must contain at least one Digit.";
    }

    const isContainsSymbol = /^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹])/;
    if (!isContainsSymbol.test(value)) {
        return "Password must contain at least one Special Symbol.";
    }

    const isValidLength = /^.{10,50}$/;
    if (!isValidLength.test(value)) {
        return "Password must be between 10-16 Characters Long.";
    }

    return null;
}

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "First Name is necessary"],
        maxLength: [100, "First Name can only be 100 characters long"],
        minLength: [2, "Must be at least 5 characters long"],
    },

    lastName: {
        type: String,
        required: [true, "First Name is necessary"],
        maxLength: [100, "First Name can only be 100 characters long"],
        minLength: [2, "Must be at least 5 characters long"],
    },

    fullName: {
        type: String,
    },

    username: {
        type: String,
        required: [true, "Username is necessary"],
        maxLength: [50, "username can only be 50 characters long"],
        minLength: [5, "Must be at least 5 characters long"],
        unique: true,
        match: /^\S*$/,
    },

    email: {
        type: String,
        required: [true, "An account must have a email"],
        unique: true,
        validate: [isEmail, "Invalid Email"],
    },

    password: {
        type: String,
        match: [
            /^(?!.*\s)(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹]).{10,50}$/,
            "A password must have at least one small letter, one capital letter, one special symbol and must be more than 10 characters long",
        ],
        required: [true, "An account must have a password"],
        //when I query the data, password won't be displayed
        select: false,
    },

    passwordConfirm: {
        type: String,
        required: [true, "You must confirm your password"],
        validate: {
            validator: function (pass) {
                return this.password == pass;
            },
            message: "Your confirmation password is wrong",
        },
    },

    role: {
        type: String,
        required: [true, "A User must have a role"],
        enum: {
            values: ["user", "admin"],
        },
        default: "user",
    },

    profileImage: {
        type: String,
        required: [true, "User must have a profile image"],
        default: "/user-profile-images/default-profile.png",
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        required: [true],
    },
});

//1 hash the password
userSchema.pre("save", async function (next) {
    //if the password is not modified
    if (!this.isModified("password")) {
        return next();
    }

    //if the password is created or updated
    this.password = await bcrypt.hash(this.password, 12);
    this.fullName = this.firstName + " " + this.lastName;
    this.passwordConfirm = undefined;
    next();
});

//2 compare the password
userSchema.methods.comparePassword = async function (
    enteredPassword,
    storedPassword
) {
    return await bcrypt.compare(enteredPassword, storedPassword);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
