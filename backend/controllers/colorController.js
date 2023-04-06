const Color = require("../models/colorModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const { API_CODE_SUCCESS, API_CODE_BY_SERVER } = require("../constants");

// Create Color
exports.createColor = asyncHandler(async (req, res) => {
    try {
        const newColor = await Color.create(req.body);
        res.status(201).json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: newColor
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Update Color
exports.updateColor = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const updateColor = await Color.findByIdAndUpdate(id, req.body, {
            new: true
        });
        res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: updateColor
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Get A Color
exports.getColor = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const color = await Color.findById(id);
        res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: color
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Get All Colors
exports.getAllColors = asyncHandler(async (req, res) => {
    try {
        const colors = await Color.find();
        res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: colors
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Delete A Color
exports.deleteColor = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const deleteColor = await Color.findByIdAndDelete(id);
        res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: deleteColor
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});
