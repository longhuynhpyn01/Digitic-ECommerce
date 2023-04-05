const Blog = require("../models/blogModel");
const asyncHandler = require("express-async-handler");
const fs = require("fs");
const validateMongoDbId = require("../utils/validateMongodbId");
const {
    cloudinaryUploadImg,
    cloudinaryDeleteImg
} = require("../utils/cloudinary");

// Create blog
exports.createBlog = asyncHandler(async (req, res) => {
    try {
        const newBlog = await Blog.create(req.body);
        res.json(newBlog);
    } catch (error) {
        throw new Error(error);
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
        res.json(updateBlog);
    } catch (error) {
        throw new Error(error);
    }
});

// Get a blog
exports.getBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const blog = await Blog.findById(id)
            .populate("likes")
            .populate("dislikes");
        // cập nhật lượng numViews lên 1
        const updateViews = await Blog.findByIdAndUpdate(
            id,
            {
                $inc: { numViews: 1 }
            },
            { new: true }
        );
        res.json(updateViews);
    } catch (error) {
        throw new Error(error);
    }
});

// Get all blogs
exports.getAllBlogs = asyncHandler(async (req, res) => {
    try {
        const blogs = await Blog.find();
        res.json(blogs);
    } catch (error) {
        throw new Error(error);
    }
});

// Delete a blog
exports.deleteBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);

    try {
        const deleteBlog = await Blog.findByIdAndDelete(id);
        res.json(deleteBlog);
    } catch (error) {
        throw new Error(error);
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
        res.json(blog);
    } else {
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $push: { likes: loginUserId }, // Adding giá trị loginUserId vào likes (như filter)
                isLiked: true
            },
            { new: true }
        );
        res.json(blog);
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
        res.json(blog);
    } else {
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $push: { dislikes: loginUserId }, // Adding giá trị loginUserId vào disliked (như filter)
                isDisliked: true
            },
            { new: true }
        );
        res.json(blog);
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

        res.json(updateBlog);
    } catch (error) {
        throw new Error(error);
    }
});
