const bodyParser = require("body-parser");
const express = require("express");
const dbConnect = require("./config/dbConnect");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const dotenv = require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 4000;
const authRouter = require("./routes/authRoute");


dbConnect();

// để truyền data vào req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/user", authRouter);

// phải đặt bên dưới route
app.use(notFound);
app.use(errorHandler);



app.listen(PORT, () => {
    console.log(`Server is running at PORT ${PORT}`);
});
