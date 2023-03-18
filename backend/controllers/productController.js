const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");

// Create a product
exports.createProduct = asyncHandler(async (req, res) => {
    console.log("req.body:", req.body);

    if (req.body.title) {
        req.body.slug = slugify(req.body.title);
    }

    try {
        const newProduct = await Product.create(req.body);
        res.json(newProduct);
    } catch (error) {
        throw new Error(error);
    }
});

// Get a product
exports.getProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        const findProduct = await Product.findById(id);

        res.json(findProduct);
    } catch (error) {
        throw new Error(error);
    }
});

// Get all product
exports.getAllProduct = asyncHandler(async (req, res) => {
    console.log(req.query);
    try {
        const products = await Product.find();

        res.json(products);
    } catch (error) {
        throw new Error(error);
    }
});

// Update a product
exports.updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    console.log("params:", req.params);
    console.log("id:", id);

    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }

        const updateProduct = await Product.findOneAndUpdate(
            { _id: id },
            req.body,
            {
                new: true
            }
        );
        res.json(updateProduct);
    } catch (error) {
        throw new Error(error);
    }
});

// Delete a product
exports.deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }

        const deleteProduct = await Product.findOneAndDelete({ _id: id });
        console.log("deleteProduct:", deleteProduct);
        res.json(deleteProduct);
    } catch (error) {
        throw new Error(error);
    }
});
