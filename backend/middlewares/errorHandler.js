
// Not found
const notFound = (req, res, next) => {
    const error = new Error(`Not found: ${req.originalUrl}`);
    console.log("error:", error);
    res.status(404);
    next(error);
};

// Error Handler
const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    console.log("statusCode:", statusCode);
    res.status(statusCode);
    res.json({
        message: err?.message,
        stack: err?.stack
    });
};

module.exports = { errorHandler, notFound };
