const Color = require("../models/colorModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

// Create Color
exports.createColor = asyncHandler(async (req, res) => {
    try {
        const newColor = await Color.create(req.body);
        res.json(newColor);
    } catch (error) {
        throw new Error(error);
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
        res.json(updateColor);
    } catch (error) {
        throw new Error(error);
    }
});

// Get A Color
exports.getColor = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const category = await Color.findById(id);

        res.json(category);
    } catch (error) {
        throw new Error(error);
    }
});

// Get All Colors
exports.getAllColors = asyncHandler(async (req, res) => {
    try {
        const colors = await Color.find();
        res.json(colors);
    } catch (error) {
        throw new Error(error);
    }
});

// Delete A Color
exports.deleteColor = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const deleteColor = await Color.findByIdAndDelete(id);
        res.json(deleteColor);
    } catch (error) {
        throw new Error(error);
    }
});
