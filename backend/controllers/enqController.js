const Enquiry = require("../models/enqModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const { API_CODE_SUCCESS, API_CODE_BY_SERVER } = require("../constants");

// Create Enquiry
exports.createEnquiry = asyncHandler(async (req, res) => {
    try {
        const newEnquiry = await Enquiry.create(req.body);
        res.status(201).json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: newEnquiry
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Update Enquiry
exports.updateEnquiry = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const updateEnquiry = await Enquiry.findByIdAndUpdate(id, req.body, {
            new: true
        });
        res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: updateEnquiry
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Get A Enquiry
exports.getEnquiry = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const enquiry = await Enquiry.findById(id);
        res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: enquiry
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Get All Enquiries
exports.getAllEnquiries = asyncHandler(async (req, res) => {
    try {
        const enquiries = await Enquiry.find();
        res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: enquiries
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Delete A Enquiry
exports.deleteEnquiry = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const deleteEnquiry = await Enquiry.findByIdAndDelete(id);
        res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: deleteEnquiry
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});
