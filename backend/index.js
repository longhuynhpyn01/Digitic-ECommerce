const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const morgan = require("morgan");
const dbConnect = require("./config/dbConnect");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const dotenv = require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 4000;
const authRouter = require("./routes/authRoute");
const productRouter = require("./routes/productRoute");

dbConnect();

app.use(morgan("dev"));
app.use(bodyParser.json()); // để truyền data vào req.body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser()); // để sử dụng res.cookie

app.use("/api/user", authRouter);
app.use("/api/product", productRouter);

// phải đặt bên dưới route
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running at PORT ${PORT}`);
});
