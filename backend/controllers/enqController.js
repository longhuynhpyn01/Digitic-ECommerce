const Enquiry = require("../models/enqModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

// Create Enquiry
exports.createEnquiry = asyncHandler(async (req, res) => {
    try {
        const newEnquiry = await Enquiry.create(req.body);
        res.json(newEnquiry);
    } catch (error) {
        throw new Error(error);
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
        res.json(updateEnquiry);
    } catch (error) {
        throw new Error(error);
    }
});

// Get A Enquiry
exports.getEnquiry = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const category = await Enquiry.findById(id);

        res.json(category);
    } catch (error) {
        throw new Error(error);
    }
});

// Get All Enquiries
exports.getAllEnquiries = asyncHandler(async (req, res) => {
    try {
        const enquiries = await Enquiry.find();
        res.json(enquiries);
    } catch (error) {
        throw new Error(error);
    }
});

// Delete A Enquiry
exports.deleteEnquiry = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const deleteEnquiry = await Enquiry.findByIdAndDelete(id);
        res.json(deleteEnquiry);
    } catch (error) {
        throw new Error(error);
    }
});
