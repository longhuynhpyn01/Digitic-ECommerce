const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { generateToken } = require("../config/jwtToken");
const { validateMongoDbId } = require("../utils/validateMongodbId");
const { generateRefreshToken } = require("../config/refreshToken");

// Register a user
exports.createUser = asyncHandler(async (req, res) => {
    console.log("req.body:", req.body);
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

// Login a user
exports.loginUser = asyncHandler(async (req, res) => {
    console.log("req.body:", req.body);
    const { email, password } = req.body;

    // check if user exists or not
    const findUser = await User.findOne({ email });

    if (findUser && (await findUser.isPasswordMatched(password))) {
        const refreshToken = await generateRefreshToken(findUser?._id);
        const updateUser = await User.findByIdAndUpdate(
            findUser?._id,
            {
                refreshToken: refreshToken
            },
            {
                new: true
            }
        );

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        });

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

// Handle refresh token
exports.handleRefreshToken = asyncHandler(async (req, res) => {
    const cookie = req.cookies;

    if (!cookie?.refreshToken) {
        throw new Error("No Refresh Token in Cookies");
    }

    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });

    if (!user) {
        throw new Error("No Refresh Token present in database or not matched");
    }

    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err || user.id !== decoded.id) {
            throw new Error("There is something wrong with refresh token");
        }

        const accessToken = generateToken(user?._id);
        res.json({
            accessToken
        });
    });
});

// Logout user
exports.logoutUser = asyncHandler(async (req, res) => {
    const cookie = req.cookies;

    if (!cookie?.refreshToken) {
        throw new Error("No Refresh Token in Cookies");
    }

    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });

    if (!user) {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true
        });
        return res.sendStatus(204); // forbidden
    }

    await User.findOneAndUpdate(
        { refreshToken },
        {
            refreshToken: ""
        }
    );

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true
    });
    res.sendStatus(204); // forbidden
});

// Update a user
exports.updateUser = asyncHandler(async (req, res) => {
    try {
        const { _id } = req.user;
        validateMongoDbId(_id);

        const updateUser = await User.findByIdAndUpdate(
            _id,
            {
                firstName: req?.body?.firstName,
                lastName: req?.body?.lastName,
                email: req?.body?.email,
                mobile: req?.body?.mobile
            },
            {
                new: true
            }
        );

        res.json(updateUser);
    } catch (error) {
        throw new Error(error);
    }
});

// Get all users
exports.getAllUser = asyncHandler(async (req, res) => {
    try {
        const users = await User.find();

        res.json(users);
    } catch (error) {
        throw new Error(error);
    }
});

// Get a single user
exports.getUser = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        validateMongoDbId(id);

        const user = await User.findById(id);

        res.json({
            user
        });
    } catch (error) {
        throw new Error(error);
    }
});

// Delete a user
exports.deleteUser = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        validateMongoDbId(id);

        const deleteUser = await User.findByIdAndDelete(id);

        res.json({
            deleteUser
        });
    } catch (error) {
        throw new Error(error);
    }
});

// Block user
exports.blockUser = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        validateMongoDbId(id);

        const block = await User.findByIdAndUpdate(
            id,
            {
                isBlocked: true
            },
            {
                new: true
            }
        );

        res.json({
            message: "User Blocked"
        });
    } catch (error) {
        throw new Error(error);
    }
});

// Unblock user
exports.unblockUser = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        validateMongoDbId(id);

        const block = await User.findByIdAndUpdate(
            id,
            {
                isBlocked: false
            },
            {
                new: true
            }
        );

        res.json({
            message: "User Unblocked"
        });
    } catch (error) {
        throw new Error(error);
    }
});
