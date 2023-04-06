const Blog = require("../models/blogModel");
const asyncHandler = require("express-async-handler");
const fs = require("fs");
const validateMongoDbId = require("../utils/validateMongodbId");
const {
    cloudinaryUploadImg,
    cloudinaryDeleteImg
} = require("../utils/cloudinary");
const { API_CODE_SUCCESS, API_CODE_BY_SERVER } = require("../constants");

// Create blog
exports.createBlog = asyncHandler(async (req, res) => {
    try {
        const newBlog = await Blog.create(req.body);
        res.status(201).json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: newBlog
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Update blog
exports.updateBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const updateBlog = await Blog.findByIdAndUpdate(id, req.body, {
            new: true
        });
        res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: updateBlog
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Get a blog
exports.getBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        // cập nhật lượng numViews lên 1
        const updateViews = await Blog.findByIdAndUpdate(
            id,
            {
                $inc: { numViews: 1 }
            },
            { new: true }
        )
            .populate("likes")
            .populate("dislikes");
        res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: updateViews
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Get all blogs
exports.getAllBlogs = asyncHandler(async (req, res) => {
    try {
        const blogs = await Blog.find();
        res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: blogs
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Delete a blog
exports.deleteBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const deleteBlog = await Blog.findByIdAndDelete(id);
        res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: deleteBlog
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});

// Like blog
exports.likeBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.body;
    validateMongoDbId(blogId);

    // Find the blog which you want to be liked
    const blog = await Blog.findById(blogId);
    // Find the login user
    const loginUserId = req?.user?._id;
    // Find if the user has liked the blog
    const isLiked = blog?.isLiked;
    // Find if the user has disliked the blog
    const alreadyDisliked = blog?.dislikes?.find(
        (userId) => userId.toString() === loginUserId?.toString()
    );

    if (alreadyDisliked) {
        await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: { dislikes: loginUserId }, // Remove giá trị loginUserId khỏi dislikes (như filter)
                isDisliked: false // set lại thành false
            },
            { new: true }
        );
    }

    if (isLiked) {
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: { likes: loginUserId }, // Remove giá trị loginUserId khỏi likes (như filter)
                isLiked: false
            },
            { new: true }
        );
        res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: blog
        });
    } else {
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $push: { likes: loginUserId }, // Adding giá trị loginUserId vào likes (như filter)
                isLiked: true
            },
            { new: true }
        );
        res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: blog
        });
    }
});

// dislike blog
exports.dislikeBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.body;
    validateMongoDbId(blogId);

    // Find the blog which you want to be disliked
    const blog = await Blog.findById(blogId);
    // Find the login user
    const loginUserId = req?.user?._id;
    // Find if the user has disliked the blog
    const isDisliked = blog?.isDisliked;
    // Find if the user has liked the blog
    const alreadyLiked = blog?.likes?.find(
        (userId) => userId.toString() === loginUserId?.toString()
    );

    if (alreadyLiked) {
        await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: { likes: loginUserId }, // Remove giá trị loginUserId khỏi likes (như filter)
                isLiked: false // set lại thành false
            },
            { new: true }
        );
    }

    if (isDisliked) {
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: { dislikes: loginUserId }, // Remove giá trị loginUserId khỏi disliked (như filter)
                isDisliked: false
            },
            { new: true }
        );
        res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: blog
        });
    } else {
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $push: { dislikes: loginUserId }, // Adding giá trị loginUserId vào disliked (như filter)
                isDisliked: true
            },
            { new: true }
        );
        res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: blog
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
        for (const file of files) {
            const { path } = file;
            const newPath = await uploader(path); // get được url image đã upload lên cloudinary
            urls.push(newPath);
            fs.unlinkSync(path);
        }

        const findBlog = await Blog.findById(id);
        const updateBlog = await Blog.findByIdAndUpdate(
            id,
            {
                images: urls.map((file) => file)
            },
            {
                new: true
            }
        );

        // delete image
        if (findBlog?.images?.length > 0) {
            for (const image of findBlog.images) {
                cloudinaryDeleteImg(image.public_id, "images");
            }
        }

        res.json({
            code: API_CODE_SUCCESS,
            message: "Success",
            data: updateBlog
        });
    } catch (error) {
        return res.status(500).json({
            code: API_CODE_BY_SERVER,
            message: error.message,
            data: null
        });
    }
});
