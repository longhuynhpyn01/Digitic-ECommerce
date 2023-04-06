const Product = require("../models/productModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const fs = require("fs");
const validateMongoDbId = require("../utils/validateMongodbId");
const {
    cloudinaryUploadImg,
    cloudinaryDeleteImg
} = require("../utils/cloudinary");
const { API_CODE_BY_SERVER, API_CODE_SUCCESS } = require("../constants");

// Create a product
exports.createProduct = asyncHandler(async (req, res) => {
    if (req.body.title) {
        req.body.slug = slugify(req.body.title);
    }

    try {
        const newProduct = await Product.create(req.body);
        res.status(201).json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: newProduct
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Get a product
exports.getProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const findProduct = await Product.findById(id);
        res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: findProduct
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Get all product
exports.getAllProducts = asyncHandler(async (req, res) => {
    try {
        // Filtering
        // /api/product?price[gte]=6000&price[lte]=10000
        const queryObj = { ...req.query };
        const excludeFields = ["page", "sort", "limit", "fields"];

        // xóa bỏ các trường có key cần xóa như trên (trường mang ý nghĩa nhất định)
        excludeFields.forEach((el) => delete queryObj[el]);

        // http://localhost:5000/api/v1/products?&category=Laptop&price[gt]=1200&price[lt]=2000
        // lọc theo name là product1, category là Laptop, 1200 < price < 2000
        let queryStr = JSON.stringify(queryObj);
        // để lọc cho price có gt lớn hay nhỏ hơn {"category":"Laptop","price":{"$gt":"1200","$lt":"2000"}}
        queryStr = queryStr.replace(
            /\b(gt|gte|lt|lte)\b/g,
            (match) => `$${match}`
        );
        let query = Product.find(JSON.parse(queryStr));

        // Sorting
        // /api/product?sort=-category,price
        // category giảm dần, price tăng dần (ưu tiên sort category sau đó price)
        if (req.query.sort) {
            const sortBy = req.query.sort.split(",").join(" ");
            query = query.sort(sortBy);
        } else {
            query = query.sort("-createdAt"); // mặc định sort theo ngày tạo giảm dần (ưu tiên mới nhất)
        }

        // Limiting the fields
        // /api/product?fields=title,price
        // trả về dữ liệu bao gồm 2 field là title, price
        if (req.query.fields) {
            const fields = req.query.fields.split(",").join(" ");
            query = query.select(fields); // title price
        } else {
            query = query.select("-__v"); // mặc định loại bỏ field __v ở trong database
        }

        // Pagination
        // /api/product?page=1&limit=5

        const page = req.query.page; // trang hiện tại
        const limit = req.query.limit; // số phần tử mỗi trang
        const skip = (page - 1) * limit; // hiển thị bắt đầu từ index cần query, mặc đinh là từ 0 (lấy all)
        // vd page=1&limit=5 lấy từ index=0, page=1&limit=5 lấy từ index=5
        query = query.skip(skip).limit(limit); //

        if (req.query.page) {
            const productCount = await Product.countDocuments();
            if (skip >= productCount) {
                throw new Error("This Page does not exists");
            }
        }

        const products = await query;
        res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: products
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Update a product
exports.updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

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
        res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: updateProduct
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Delete a product
exports.deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }

        const deleteProduct = await Product.findOneAndDelete({ _id: id });
        res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: deleteProduct
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Add To Wish List
exports.addToWishList = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { productId } = req.body;
    validateMongoDbId(_id);
    validateMongoDbId(productId);

    try {
        const user = await User.findById(_id);
        const alreadyAdded = user?.wishlist?.find(
            (id) => id.toString() === productId
        );

        if (alreadyAdded) {
            let user = await User.findByIdAndUpdate(
                _id,
                {
                    $pull: { wishlist: productId }
                },
                {
                    new: true
                }
            );
            res.json({
                code: API_CODE_SUCCESS,
                message: "Success",
                data: user
            });
        } else {
            let user = await User.findByIdAndUpdate(
                _id,
                {
                    $push: { wishlist: productId }
                },
                {
                    new: true
                }
            );
            res.json({
                code: API_CODE_SUCCESS,
                message: "Success",
                data: user
            });
        }
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Rating
exports.rating = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { productId, star, comment } = req.body;
    validateMongoDbId(_id);
    validateMongoDbId(productId);

    try {
        const product = await Product.findById(productId);
        const alreadyRated = product?.ratings?.find(
            (userId) => userId.postedBy.toString() === _id.toString()
        );

        if (alreadyRated) {
            const updateRating = await Product.updateOne(
                {
                    ratings: {
                        $elemMatch: alreadyRated
                    }
                },
                {
                    $set: {
                        "ratings.$.star": star,
                        "ratings.$.comment": comment
                    }
                },
                {
                    new: true
                }
            );
        } else {
            const rateProduct = await Product.findByIdAndUpdate(
                productId,
                {
                    $push: {
                        ratings: {
                            star: star,
                            comment: comment,
                            postedBy: _id
                        }
                    }
                },
                {
                    new: true
                }
            );
        }

        const getAllRatings = await Product.findById(productId);
        let totalRating = getAllRatings.ratings.length;
        let ratingSum = getAllRatings.ratings
            .map((item) => item.star)
            .reduce((sum, rating) => sum + rating, 0);
        let actualRating = Math.round(ratingSum / totalRating);
        let finalProduct = await Product.findByIdAndUpdate(
            productId,
            {
                totalRating: actualRating
            },
            { new: true }
        );
        res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: finalProduct
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Upload Images
exports.uploadImages = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const uploader = (path) => cloudinaryUploadImg(path, "images");
        const urls = [];
        const files = req.files;

        if (files) {
            for (const file of files) {
                const { path } = file;
                const newPath = await uploader(path); // get được url image đã upload lên cloudinary
                urls.push(newPath);
                fs.unlinkSync(path);
            }

            const findProduct = await Product.findById(id);
            const updateProduct = await Product.findByIdAndUpdate(
                id,
                {
                    images: urls.map((file) => file)
                },
                {
                    new: true
                }
            );

            // delete image
            if (findProduct?.images?.length > 0) {
                for (const image of findProduct.images) {
                    cloudinaryDeleteImg(image.public_id, "images");
                }
            }

            res.json({
                code: API_CODE_SUCCESS,
                message: "Success",
                data: updateProduct
            });
        } else {
            throw new Error("No images found");
        }
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Delete Images
exports.deleteImages = asyncHandler(async (req, res) => {
    const { id } = req.params; // truyền public_id

    try {
        cloudinaryDeleteImg(id, "images");
        res.json({
            code: API_CODE_SUCCESS,
            message: "Delete Image",
            data: null
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});
