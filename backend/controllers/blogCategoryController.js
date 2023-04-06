const BlogCategory = require("../models/blogCategoryModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const { API_CODE_SUCCESS, API_CODE_BY_SERVER } = require("../constants");

// Create Category
exports.createCategory = asyncHandler(async (req, res) => {
    try {
        const newCategory = await BlogCategory.create(req.body);
        res.status(201).json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: newCategory
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Update Category
exports.updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const updateCategory = await BlogCategory.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true
            }
        );
        res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: updateCategory
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Get a category
exports.getCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const category = await BlogCategory.findById(id);
        res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: category
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Get all categories
exports.getAllCategories = asyncHandler(async (req, res) => {
    try {
        const categories = await BlogCategory.find();
        res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: categories
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Delete a category
exports.deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const deleteCategory = await BlogCategory.findByIdAndDelete(id);
        res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: deleteCategory
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});
