const mongoose = require("mongoose");

const enqSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: [true, "Please enter your email"]
        },
        mobile: {
            type: String,
            required: [true, "Please enter your mobile"]
        },
        comment: {
            type: String,
            required: true
        },
        status: {
            type: String,
            default: "Submitted",
            enum: ["Submitted", "Contacted", "In Progress"]
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Enquiry", enqSchema);
