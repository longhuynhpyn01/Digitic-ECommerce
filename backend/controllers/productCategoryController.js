const Category = require("../models/productCategoryModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

// Create Category
exports.createCategory = asyncHandler(async (req, res) => {
    try {
        const newCategory = await Category.create(req.body);
        res.json(newCategory);
    } catch (error) {
        throw new Error(error);
    }
});

// Update Category
exports.updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const updateCategory = await Category.findByIdAndUpdate(id, req.body, {
            new: true
        });
        res.json(updateCategory);
    } catch (error) {
        throw new Error(error);
    }
});

// Get a category
exports.getCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const category = await Category.findById(id);

        res.json(category);
    } catch (error) {
        throw new Error(error);
    }
});

// Get all categories
exports.getAllCategories = asyncHandler(async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        throw new Error(error);
    }
});

// Delete a category
exports.deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const deleteCategory = await Category.findByIdAndDelete(id);
        res.json(deleteCategory);
    } catch (error) {
        throw new Error(error);
    }
});
