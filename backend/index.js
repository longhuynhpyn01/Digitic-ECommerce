const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dbConnect = require("./config/dbConnect");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const dotenv = require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 4000;
const cron = require("node-cron");
const authRouter = require("./routes/authRoute");
const productRouter = require("./routes/productRoute");
const blogRouter = require("./routes/blogRoute");
const categoryRouter = require("./routes/productCategoryRoute");
const blogCategoryRouter = require("./routes/blogCategoryRoute");
const brandRouter = require("./routes/brandRoute");
const couponRouter = require("./routes/couponRoute");
const colorRouter = require("./routes/colorRoute");
const enqRouter = require("./routes/enqRoute");

dbConnect();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(morgan("dev"));
app.use(bodyParser.json()); // để truyền data vào req.body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser()); // để sử dụng res.cookie

app.use("/api/user", authRouter);
app.use("/api/product", productRouter);
app.use("/api/blog", blogRouter);
app.use("/api/category", categoryRouter);
app.use("/api/blogcategory", blogCategoryRouter);
app.use("/api/brand", brandRouter);
app.use("/api/coupon", couponRouter);
app.use("/api/color", colorRouter);
app.use("/api/enquiry", enqRouter);

// phải đặt bên dưới route
app.use(notFound);
app.use(errorHandler);

//prevent hosting server shut down after 15 minutes
cron.schedule("*/15 * * * *", () => {
    console.log(`The app is still listening on port ${PORT}!`);
});

app.listen(PORT, () => {
    console.log(`Server is running at PORT ${PORT}`);
});
