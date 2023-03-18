const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const nodemailer = require("nodemailer");

const sendEmail = asyncHandler(async (data, req, res) => {
    let transporter = nodemailer.createTransport({
        host: process.env.SMPT_HOST,
        port: process.env.SMPT_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMPT_MAIL,
            pass: process.env.SMPT_PASSWORD
        }
    });

    let info = await transporter.sendMail({
        from: process.env.SMPT_MAIL, // email người gửi
        to: data.to, // email người nhận
        subject: data.subject, // Tên tiêu đề
        text: data.text,
        html: data.html
    });
});

module.exports = { sendEmail };
