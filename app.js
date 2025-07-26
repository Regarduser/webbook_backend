const express = require("express")
require('dotenv').config({path : "./config/config.env"})
const cookieParser = require("cookie-parser");
const cors = require("cors");
const  connectDB  = require("./database/db");
const {errorMiddleware} = require("./middleware/errorMiddlewares")
const authRouter = require('./routes/authRouter')
const bookRouter = require('./routes/bookRouter')
const borrowRouter = require('./routes/borrowRouter')
const userRouter = require('./routes/userRouter')
const {google} = require('googleapis');
const fileUpload = require("express-fileupload");
const removeUnverifiedAccount = require("./services/removeUnverifiedAccount");


const app = express()

require("dotenv").config();


app.use((err, req, res, next) => {
    console.error("🔥 ERROR:", err); // ✅ Print full error details
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});

app.use(cors({
    origin : [process.env.FRONTEND_URL],
    methods : ["GET", "POST", "PUT", "DELETE"],
    credentials : true,
}))



app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended : true}))


app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: `${__dirname}/temp`
}));

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/book', bookRouter)
app.use('/api/v1/borrow', borrowRouter)
app.use('/api/v1/user', userRouter)



removeUnverifiedAccount()
connectDB()
app.use(errorMiddleware)
module.exports = app;