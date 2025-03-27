
const mongoose = require("mongoose")
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true,
    },
    email : {
        type : String,
        required : true,
        lowercase : true,
    },
    password : {
        type : String,
        required : true,
        select : false, //baad mai samjhayenge
    },
    role : {
        type : String,
        enum : ["Admin", "user"],
        default : "user",
    },
    accountVerified: {
        type : Boolean,
        default : false,
    },
    isBanned : {
        type : Boolean,
        default : false,
    },
    borrowedBooks : [
        {
        bookId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Borrow",
        },
        returned : {
            type : Boolean,
            default : false,
        },
        bookTitle : String,
        borrowedDate : Date,
        bookurl : String,
        dueDate : Date,

    },
    ],
    avatar : {
        public_id : String,
        url : String,
    },
    verificationCode : Number,
    verificationCodeExpire : Date,
    resetPasswordToken : String,
    resetPasswordTokenExpire : Date,
}, {
    timestamps : true,
}
)

userSchema.methods.generateVerificationCode = function(){
    function generateRandomFiveDigitNumber(){
        const firstDigit = Math.floor(Math.random()*9) + 1;
        const remainingDigits = Math.floor(Math.random() * 10000).toString().padStart(4, 0);
        return parseInt(firstDigit + remainingDigits)
    }
    const verificationCode = generateRandomFiveDigitNumber();
    this.verificationCode = verificationCode;
    this.verificationCodeExpire = Date.now() + 15*60*1000;
    return verificationCode

}

userSchema.methods.generateToken = function(){
    return jwt.sign({id : this._id}, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRE,
    })
}

userSchema.methods.getResetPasswordToken = function(){
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest('hex')
    this.resetPasswordTokenExpire = Date.now() + 15 * 60 *1000
    return resetToken
}

 

const User = mongoose.model("User", userSchema);
module.exports = User