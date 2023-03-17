const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        // required: [true, "Please Enter Your Name"],
        // maxLength: [30, "Name cannot exceed 30 characters"],
        // minLength: [4, "Name should have more than 4 characters"],
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: [true, "Please Enter Your Email"],
        unique: true,
        // validate: [validator.isEmail, "Please Enter a valid Email"],
    },
    mobile: {
        type: String,
        required: [true, "Please Enter Your Mobile"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Please Enter Your Password"],
        // minLength: [8, "Password should be greater than 8 characters"],
        // select: false, // sẽ loại trừ trường này khi truy vấn find(), findOne()
    },
    // avatar: {
    //     public_id: {
    //         type: String,
    //         required: true,
    //     },
    //     url: {
    //         type: String,
    //         required: true,
    //     },
    // },
    // role: {
    //     type: String,
    //     default: "user",
    // },
    // createdAt: {
    //     type: Date,
    //     default: Date.now,
    // },

    // resetPasswordToken: String,
    // resetPasswordExpire: Date,
});


userSchema.pre("save", async function (next) {
    const salt = await bcrypt.genSaltSync(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare Password
userSchema.methods.isPasswordMatched = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// // khi thay đổi password ở controller trước khi save thì sẽ so sánh xem có thay đổi hay không
// // nếu có thì update password và sẽ hash lại password
// // lưu ý ở bên userModel thì sẽ thay đổi ngay khi ta thực hiện gán lại giá trị
// // nó khác ở bên controller nếu gán thì cần phải save()

// // giống như 1 middleware được thực thi trước khi thực hiện thao tác "save"
// userSchema.pre("save", async function (next) {
//     // nếu không chỉnh sửa thì next()
//     if (!this.isModified("password")) {
//         next();
//     }

//     // ngược lại thì hash mật khẩu
//     this.password = await bcrypt.hash(this.password, 10);
// });


// // Viết các phương thức cho Model này


// // JWT TOKEN - generator token
// userSchema.methods.getJWTToken = function () {
//     // payload is "id" -> user._id
//     // tạo chữ ký để có token xác thực đăng nhập
//     return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
//         expiresIn: process.env.JWT_EXPIRE,
//     });
// };


// // Compare Password
// userSchema.methods.comparePassword = async function (password) {
//     return await bcrypt.compare(password, this.password);
// };

// // Generating Password Reset Token - dùng để reset pwd bằng cách import crypto
// userSchema.methods.getResetPasswordToken = function () {
//     // Generating Token
//     const resetToken = crypto.randomBytes(20).toString("hex");

//     // Hashing and adding resetPasswordToken to userSchema
//     this.resetPasswordToken = crypto
//         .createHash("sha256")
//         .update(resetToken)
//         .digest("hex");

//     this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

//     return resetToken;
// };

module.exports = mongoose.model("User", userSchema);
