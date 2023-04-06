const Coupon = require("../models/couponModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const { API_CODE_SUCCESS, API_CODE_BY_SERVER } = require("../constants");

// Create a coupon
exports.createCoupon = asyncHandler(async (req, res) => {
    try {
        const newCoupon = await Coupon.create(req.body);
        res.status(201).json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: newCoupon
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Update Coupon
exports.updateCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const updateCoupon = await Coupon.findByIdAndUpdate(id, req.body, {
            new: true
        });
        res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: updateCoupon
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Get a coupon
exports.getCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const findCoupon = await Coupon.findById(id);
        res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: findCoupon
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Get all coupons
exports.getAllCoupons = asyncHandler(async (req, res) => {
    try {
        const coupons = await Coupon.find();
        res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: coupons
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Delete a Coupon
exports.deleteCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const deleteCoupon = await Coupon.findByIdAndDelete(id);
        res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: deleteCoupon
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});
