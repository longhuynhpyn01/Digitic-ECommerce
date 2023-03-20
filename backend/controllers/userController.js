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

// Register a user
exports.createUser = asyncHandler(async (req, res) => {
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

// Login a admin
exports.loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // check if user exists or not
    const findAdmin = await User.findOne({ email });

    if (findAdmin.role !== "admin") {
        throw new Error("Not Authorised");
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

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        });

        res.json({
            _id: findAdmin?._id,
            firstName: findAdmin?.firstName,
            lastName: findAdmin?.lastName,
            email: findAdmin?.email,
            mobile: findAdmin?.mobile,
            token: generateToken(findAdmin?._id)
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

// Save user address
exports.saveAddress = asyncHandler(async (req, res) => {
    try {
        const { _id } = req.user;
        validateMongoDbId(_id);

        const updateUser = await User.findByIdAndUpdate(
            _id,
            {
                address: req?.body?.address
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
exports.getAllUsers = asyncHandler(async (req, res) => {
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
            message: "User Unblocked"
        });
    } catch (error) {
        throw new Error(error);
    }
});

// Update password
exports.updatePassword = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { password } = req.body;
    validateMongoDbId(_id);

    const user = await User.findById(_id);

    if (password) {
        user.password = password;
        const updatePassword = await user.save();
        res.json(updatePassword);
    } else {
        res.json(user);
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
        res.json(token);
    } catch (error) {
        throw new Error(error);
    }
});

// Reset password
exports.resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;

    // creating token hash - hash cryto để so sánh resetPasswordToken
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

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
    res.json(user);
});

// Get Wishlist: danh sách với nhiều vật dụng mà chúng ta muốn
exports.getWishlist = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);

    try {
        const findUser = await User.findById(_id).populate("wishlist");
        res.json(findUser);
    } catch (error) {
        throw new Error(error);
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
        res.json(newCart);
    } catch (error) {
        throw new Error(error);
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
        res.json(cart);
    } catch (error) {
        throw new Error(error);
    }
});

// Empty Cart
exports.emptyCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);

    try {
        const user = await User.findById(_id);
        const cart = await Cart.findOneAndRemove({ orderBy: user._id });
        res.json(cart);
    } catch (error) {
        throw new Error(error);
    }
});

// Apply Coupon
exports.applyCoupon = asyncHandler(async (req, res) => {
    const { coupon } = req.body;
    const { _id } = req.user;
    validateMongoDbId(_id);

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
    res.json(totalAfterDiscount);
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
        res.json({
            message: "success"
        });
    } catch (error) {
        throw new Error(error);
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
        res.json(userOrders);
    } catch (error) {
        throw new Error(error);
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
        res.json(updateOrderStatus);
    } catch (error) {
        throw new Error(error);
    }
});
