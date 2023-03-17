const { default: mongoose } = require("mongoose");

// const dbConnect = () => {
//     mongoose
//         .connect(process.env.DB_URI, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//             // useCreateIndex: true,
//         })
//         .then((data) => {
//             console.log(`Mongodb connected with server: ${data.connection.host}`);
//         })
//         .catch((err) => {
//             console.log(err);
//             // process.exit(1);
//         });
// };


const dbConnect = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(error.message);
        // process.exit(1);
    }
};


module.exports = dbConnect;
