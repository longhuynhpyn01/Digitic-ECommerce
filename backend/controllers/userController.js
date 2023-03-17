const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const { genSalt } = require("bcrypt");
const { generateToken } = require("../config/jwtToken");

exports.createUser = asyncHandler(async (req, res) => {
    console.log("req.body:", req.body)
    const email = req.body.email;

    const findUser = await User.findOne({ email });

    if (!findUser) {
        // Create a new user
        const newUser = await User.create(req.body);
        res.json(newUser);
    } else {
        // User already exists
        throw new Error("User already exists");
    }
});

exports.loginUser = asyncHandler(async (req, res) => {
    console.log("req.body:", req.body)
    const { email, password } = req.body;

    // check if user exists or not
    const findUser = await User.findOne({ email });

    console.log("findUser.isPasswordMatched(password):", findUser.isPasswordMatched(password))

    if (findUser && (await findUser.isPasswordMatched(password))) {
        res.json({
            _id: findUser?._id,
            firstName: findUser?.firstName,
            lastName: findUser?.lastName,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: generateToken(findUser?._id)
        });
    } else {
        throw new Error("Invalid Credentials");
    }

});
