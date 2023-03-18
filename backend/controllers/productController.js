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
            console.log("fields:", fields);
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
        console.log(page, limit, skip);

        if (req.query.page) {
            const productCount = await Product.countDocuments();
            if (skip >= productCount) {
                throw new Error("This Page does not exists");
            }
        }

        const products = await query;
        // console.log("products:", products);
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
