const Brand = require("../models/brandModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const { API_CODE_SUCCESS, API_CODE_BY_SERVER } = require("../constants");

// Create Brand
exports.createBrand = asyncHandler(async (req, res) => {
    try {
        const newBrand = await Brand.create(req.body);
        res.status(201).json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: newBrand
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
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
        res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: updateBrand
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Get A Brand
exports.getBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const brand = await Brand.findById(id);
        res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: brand
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Get All Brands
exports.getAllBrands = asyncHandler(async (req, res) => {
    try {
        const brands = await Brand.find();
        res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: brands
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Delete A Brand
exports.deleteBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const deleteBrand = await Brand.findByIdAndDelete(id);
        res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: deleteBrand
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});
