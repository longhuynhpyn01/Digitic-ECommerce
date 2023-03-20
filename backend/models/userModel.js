const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const validateEmail = function (email) {
    const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return regex.test(email);
};

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: [true, "Please enter your email"],
            validate: [validateEmail, "Please enter a valid email"],
            unique: true
        },
        mobile: {
            type: String,
            required: [true, "Please enter your mobile"],
            unique: true
        },
        password: {
            type: String,
            required: [true, "Please enter your password"]
            // select: false, // sẽ loại trừ trường này khi truy vấn find(), findOne()
        },
        role: {
            type: String,
            default: "user"
        },
        isBlocked: {
            type: Boolean,
            default: false
        },
        cart: {
            type: Array,
            default: []
        },
        address: {
            type: String
        },
        wishlist: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            }
        ],
        refreshToken: {
            type: String
        },
        passwordChangedAt: String,
        passwordResetToken: String,
        passwordResetExpires: Date
    },
    {
        timestamps: true
    }
);

// khi thay đổi password ở controller trước khi save thì sẽ so sánh xem có thay đổi hay không
// nếu có thì update password và sẽ hash lại password
// lưu ý ở bên userModel thì sẽ thay đổi ngay khi ta thực hiện gán lại giá trị
// nó khác ở bên controller nếu gán thì cần phải save()
// giống như 1 middleware được thực thi trước khi thực hiện thao tác "save"
userSchema.pre("save", async function (next) {
    // nếu không chỉnh sửa thì next()
    if (!this.isModified("password")) {
        next();
    }

    const salt = await bcrypt.genSaltSync(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare Password
userSchema.methods.isPasswordMatched = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generating Password Reset Token - dùng để reset pwd bằng cách import crypto
userSchema.methods.createPasswordResetToken = async function () {
    // Generating Token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hashing and adding passwordResetToken to userSchema
    this.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    this.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes

    return resetToken;
};

module.exports = mongoose.model("User", userSchema);
