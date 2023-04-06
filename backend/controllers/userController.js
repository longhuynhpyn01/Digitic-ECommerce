const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const uniqid = require("uniqid");
const validateMongoDbId = require("../utils/validateMongodbId");
const { generateToken } = require("../config/jwtToken");
const { generateRefreshToken } = require("../config/refreshToken");
const { sendEmail } = require("./emailController");
const {
    API_CODE_NOTFOUND,
    API_CODE_SUCCESS,
    API_CODE_UNAUTHORIZED,
    API_CODE_BY_SERVER
} = require("../constants");

// Register a user
exports.createUser = asyncHandler(async (req, res) => {
    const email = req.body.email;

    const findUser = await User.findOne({ email });

    if (!findUser) {
        // Create a new user
        const newUser = await User.create(req.body);
        res.status(201).json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: null
        });
    } else {
        // User already exists
        throw new Error("User already exists");
    }
});

// Login a user
exports.loginUser = asyncHandler(async (req, res) => {
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

        return res.status(200).json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: {
                _id: findUser?._id,
                firstName: findUser?.firstName,
                lastName: findUser?.lastName,
                email: findUser?.email,
                mobile: findUser?.mobile,
                token: generateToken(findUser?._id)
            }
        });
    } else {
        // throw new Error("Invalid Credentials");
        res.status(404).json({
            code: API_CODE_NOTFOUND,
            message: "Invalid email or password",
            data: null
        });
    }
});

// Login a admin
exports.loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // check if user exists or not
    const findAdmin = await User.findOne({ email });

    if (findAdmin.role !== "admin") {
        // throw new Error("Not Authorised");
        res.status(401).json({
            code: API_CODE_UNAUTHORIZED,
            message: "Not authorized",
            data: null
        });
    }

    if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
        const refreshToken = await generateRefreshToken(findAdmin?._id);
        const updateUser = await User.findByIdAndUpdate(
            findAdmin?._id,
            {
                refreshToken: refreshToken
            },
            {
                new: true
            }
        );
        console.log("findAdmin:", findAdmin);
        console.log("updateUser:", updateUser);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: {
                _id: findUser?._id,
                firstName: findUser?.firstName,
                lastName: findUser?.lastName,
                email: findUser?.email,
                mobile: findUser?.mobile,
                token: generateToken(findUser?._id)
            }
        });
    } else {
        res.status(404).json({
            code: API_CODE_NOTFOUND,
            message: "Invalid email or password",
            data: null
        });
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
        return res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: { accessToken }
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
        // return res.sendStatus(204); // forbidden
        return res.json({
            code: 0,
            message: "Success",
            data: null
        });
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
    // res.sendStatus(204); // forbidden
    return res.json({
        code: 0,
        message: "Success",
        data: null
    });
});

// Update a user
exports.updateUser = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);

    try {
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

        return res.json({
            code: API_CODE_SUCCESS,
            message: "Update account successfully",
            data: updateUser
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Save user address
exports.saveAddress = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);

    try {
        const updateUser = await User.findByIdAndUpdate(
            _id,
            {
                address: req?.body?.address
            },
            {
                new: true
            }
        );

        return res.json({
            code: API_CODE_SUCCESS,
            message: "Update address successfully",
            data: updateUser
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Get all users
exports.getAllUsers = asyncHandler(async (req, res) => {
    try {
        const users = await User.find();

        return res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: users
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Get a single user
exports.getUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const user = await User.findById(id);

        return res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: user
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Delete a user
exports.deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const deleteUser = await User.findByIdAndDelete(id);

        res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: null
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Block user
exports.blockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        await User.findByIdAndUpdate(
            id,
            {
                isBlocked: true
            },
            {
                new: true
            }
        );

        res.json({
            code: API_CODE_SUCCESS,
            message: "User Blocked",
            data: null
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Unblock user
exports.unblockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        await User.findByIdAndUpdate(
            id,
            {
                isBlocked: false
            },
            {
                new: true
            }
        );

        res.json({
            code: API_CODE_SUCCESS,
            message: "User Unblocked",
            data: null
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Update password
exports.updatePassword = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { password } = req.body;
    validateMongoDbId(_id);

    try {
        const user = await User.findById(_id);

        if (password) {
            user.password = password;
            const updatePassword = await user.save();

            return res.json({
                code: API_CODE_SUCCESS,
                message: "Password has been updated",
                data: updatePassword
            });
        } else {
            return res.json({
                code: API_CODE_SUCCESS,
                message: "Success",
                data: user
            });
        }
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Forgot password token
exports.forgotPasswordToken = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("User not found with this email");
    }

    try {
        const token = await user.createPasswordResetToken();
        await user.save();
        const resetURL = `Hi. Please follow this link to reset your password. This link is valid till 10 minutes from now. <a href='http://localhost:5000/api/user/reset-password/${token}'>Click Here</a>`;
        const data = {
            to: email,
            subject: "Forgot Password Link",
            text: "Hey user",
            html: resetURL
        };
        sendEmail(data);
        return res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: { token }
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Reset password
exports.resetPassword = asyncHandler(async (req, res) => {
    try {
        const { password } = req.body;
        const { token } = req.params;

        // creating token hash - hash cryto để so sánh resetPasswordToken
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            throw new Error("Token Expired. Please try again later");
        }

        // sau khi cập nhật password thì xóa đi resetPasswordToken
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save();
        return res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: user
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Get Wishlist: danh sách với nhiều vật dụng mà chúng ta muốn
exports.getWishlist = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);

    try {
        const findUser = await User.findById(_id).populate("wishlist");
        return res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: findUser
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});
// Post User Cart
exports.userCart = asyncHandler(async (req, res) => {
    const { cart } = req.body;
    const { _id } = req.user;
    validateMongoDbId(_id);

    try {
        let products = [];
        const user = await User.findById(_id);
        // check if user already have product in cart
        const alreadyExistCart = await Cart.findOne({ orderBy: user._id });

        // nếu user đã có giỏ hàng thì cần xóa trước khi add mới vào
        if (alreadyExistCart) {
            await Cart.deleteOne({
                _id: alreadyExistCart._id
            });
        }

        for (let i = 0; i < cart.length; i++) {
            let object = {};
            object.product = cart[i]._id;
            object.count = cart[i].count;
            object.color = cart[i].color;
            let getPrice = await Product.findById(cart[i]._id)
                .select("price")
                .exec();
            object.price = getPrice.price;
            products.push(object);
        }

        let cartTotal = 0;
        for (let i = 0; i < products.length; i++) {
            cartTotal += products[i].price * products[i].count;
        }

        let newCart = await new Cart({
            products,
            cartTotal,
            orderBy: user?._id
        }).save();
        return res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: newCart
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Get User Cart
exports.getUserCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);

    try {
        const cart = await Cart.findOne({ orderBy: _id }).populate(
            "products.product"
        );
        return res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: cart
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Empty Cart
exports.emptyCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);

    try {
        const user = await User.findById(_id);
        const cart = await Cart.findOneAndRemove({ orderBy: user._id });
        return res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: cart
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Apply Coupon
exports.applyCoupon = asyncHandler(async (req, res) => {
    const { coupon } = req.body;
    const { _id } = req.user;
    validateMongoDbId(_id);

    try {
        const validCoupon = await Coupon.findOne({ name: coupon });
        if (validCoupon === null) {
            throw new Error("Invalid Coupon");
        }

        const user = await User.findOne({ _id });
        let { cartTotal } = await Cart.findOne({
            orderBy: user?._id
        }).populate("products.product");
        let totalAfterDiscount = (
            cartTotal -
            (cartTotal * validCoupon.discount) / 100
        ).toFixed(2);
        await Cart.findOneAndUpdate(
            {
                orderBy: user?._id
            },
            {
                totalAfterDiscount
            },
            { new: true }
        );
        return res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: totalAfterDiscount
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Create Order
exports.createOrder = asyncHandler(async (req, res) => {
    const { COD, couponApplied } = req.body;
    const { _id } = req.user;
    validateMongoDbId(_id);

    try {
        if (!COD) {
            throw new Error("Create cash order failed");
        }

        const user = await User.findById(_id);
        let userCart = await Cart.findOne({ orderBy: user._id });
        let finalAmount = 0;

        if (couponApplied && userCart.totalAfterDiscount) {
            finalAmount = userCart.totalAfterDiscount;
        } else {
            finalAmount = userCart.cartTotal;
        }

        let newOrder = await new Order({
            products: userCart.products,
            paymentIntent: {
                id: uniqid(),
                method: "COD",
                amount: finalAmount,
                status: "Cash on Delivery",
                created: Date.now(),
                currency: "USD"
            },
            orderStatus: "Cash on Delivery",
            orderBy: user._id
        }).save();
        // cập nhật lại quantity và sold của các sản phẩm trong đơn hàng được tạo
        let update = userCart.products.map((item) => {
            return {
                updateOne: {
                    filter: {
                        _id: item.product._id
                    },
                    update: {
                        $inc: {
                            quantity: -item.count,
                            sold: +item.count
                        }
                    }
                }
            };
        });
        const updated = await Product.bulkWrite(update, {});
        return res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: null
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Get Orders
exports.getOrders = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);

    try {
        const userOrders = await Order.find({ orderBy: _id }).populate(
            "products.product"
        );
        return res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: userOrders
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Update Order Status
exports.updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const updateOrderStatus = await Order.findByIdAndUpdate(
            id,
            {
                orderStatus: status,
                paymentIntent: {
                    status: status
                }
            },
            { new: true }
        );
        return res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: updateOrderStatus
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});
