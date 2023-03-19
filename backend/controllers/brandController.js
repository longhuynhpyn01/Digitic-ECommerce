const Brand = require("../models/brandModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

// Create Brand
exports.createBrand = asyncHandler(async (req, res) => {
    try {
        const newBrand = await Brand.create(req.body);
        res.json(newBrand);
    } catch (error) {
        throw new Error(error);
    }
});

// Update Brand
exports.updateBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const updateBrand = await Brand.findByIdAndUpdate(id, req.body, {
            new: true
        });
        res.json(updateBrand);
    } catch (error) {
        throw new Error(error);
    }
});

// Get a Brand
exports.getBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const category = await Brand.findById(id);

        res.json(category);
    } catch (error) {
        throw new Error(error);
    }
});

// Get all brandes
exports.getAllBrands = asyncHandler(async (req, res) => {
    try {
        const brands = await Brand.find();
        res.json(brands);
    } catch (error) {
        throw new Error(error);
    }
});

// Delete a Brand
exports.deleteBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const deleteBrand = await Brand.findByIdAndDelete(id);
        res.json(deleteBrand);
    } catch (error) {
        throw new Error(error);
    }
});
