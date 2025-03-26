const { catchAsyncErrors }  =  require('../middleware/catchAsyncErrors');
const { sendVerificationCode } =  require('../utils/sendVerification')

const {Errorhandle} = require('../middleware/errorMiddlewares');

const User = require('../models/userModels');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { NONAME } = require('dns');
const { sendToken } = require('../utils/sendToken');
const { sendEmail } = require('../utils/sendEmail');
const { generateForgotPasswordEmailTemplet } = require('../utils/emailTemplets');

const register = catchAsyncErrors(async(req, res , next)=>{
    try{
        const {name, email, password} = req.body;
        if(!name || !email || !password){
            return next(new Errorhandle("Please enter all fields ", 400));
        }
        const isRegistered = await User.findOne({email, accountVerified : true});
        if(isRegistered){
           return next(new Errorhandle("User already exits", 400)) 
        }
        const registerationAttemptsByUser = await User.find({
            email,
            accountVerified : false
        });
        if(registerationAttemptsByUser.length >= 5){
            return next(new Errorhandle("you have exceeded the number of registration Attempt. please contact attempt", 400))
        }
        if(password.length < 8 || password.length > 16){
            return next(new Errorhandle("password length must be between 8 or 16 character.", 400))
        }
        const hashedPassword  = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password : hashedPassword,
        })
        const verificationCode = user.generateVerificationCode();
        await user.save()
        await sendVerificationCode(verificationCode, email, res);
       

    }catch(error){
    
        next(error);
       
    }
});

const verifyOTP = catchAsyncErrors(async(req, res, next)=>{
    const {email, otp} = req.body;
    console.log(`Incoming request: email=${email}, otp=${otp}`);
    if(!otp){
        return next(new Errorhandle("email or otp is missing.", 400))
    }
    try {
        const userAllEntries = await User.find({
            email,
            accountVerified : false,
        }).sort({createdAt : -1})

        if(!userAllEntries){
            return next(new Errorhandle("User not found." , 404))
        }

        let user;
        if(userAllEntries.length > 1){
            user = userAllEntries[0];
            await User.deleteMany({
                _id : {$ne : user._id},
                email,
                accountVerified : false,
            })
        }
        else{
            user = userAllEntries[0];
        }
        if(user.verificationCode !== Number(otp)){
            return next(new Errorhandle("Invaild Otp.", 400))
        }
        const currentTime = Date.now();
        const verificationCodeExpire = new Date(user.verificationCodeExpire).getTime();
        if(currentTime>verificationCodeExpire){
            return next(new Errorhandle("otp expired.", 400))
        }
        user.accountVerified = true;
        user.verificationCode = null
        user.verificationCodeExpire = null
        await user.save({validateModifiedOnly : true})

        sendToken(user, 200, "Account Verified.", res);
        
    } catch (error) {
        return next(new Errorhandle("internal server error.", 500))
        
    }
})

const login = catchAsyncErrors(async(req, res, next)=>{
    const {email, password} = req.body;
    if(!email || !password){
        return next(new Errorhandle("please enter all fields.", 400));
    }

    const user = await User.findOne({email, accountVerified : true}).select("+password");
    if(!user){
        return next(new Errorhandle("User is not verified ", 400))
    }
    
    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if(!isPasswordMatched){
        return next(new Errorhandle("invaild email or password ", 400))
    }
    sendToken(user, 200, "user login successfully!", res)
})

const logout = catchAsyncErrors(async(req, res, next)=>{
    res.status(200).cookie("token", "",{
        expires: new Date(Date.now()),
        httpOnly : true,
    }).json({
        success : true,
        message : "logout successfully !"
    })


})

const getuser = catchAsyncErrors(async(req, res, next)=>{
    const user = req.user
    res.status(200).json({
        success : true,
        user,
    })
})

const forgotpassword = catchAsyncErrors(async(req, res, next)=>{
    if(!req.body.email){
        return next(new Errorhandle("email is required. ",400))
    }
    const user = await User.findOne({
        email: req.body.email,
        accountVerified : true
    })
    if(!user){
        return next(new Errorhandle("Invaild Email. ",400))
    }
    const resetPasswordToken = user.getResetPasswordToken();

    await user.save({validateBeforeSave : false});

    const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetPasswordToken}`
    const message = generateForgotPasswordEmailTemplet(resetPasswordUrl);
    console.log("working till herer")
    try {
        await sendEmail({email : user.email, subject : "BOOK LAB password recovery",
            message
        });
        res.status(200).json({
            success : true,
            message : `Email sent to ${user.email} successfully`,
        })
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({validateBeforeSave: false})
        return next(new Errorhandle(error.message, 500))
    }
})

const resetPassword = catchAsyncErrors(async(req, res, next) => {
    const { token } = req.params;

    console.log(`Incoming token: ${token}`);

    // Hash the token to match the resetPasswordToken stored in the database
    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");

    console.log(`Hashed token: ${resetPasswordToken}`);

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
        return next(new Errorhandle("Reset password token is invalid or has expired", 400));
    }

    if (!req.body.password || !req.body.confirmPassword) {
        return next(new Errorhandle("Password or confirm password is missing", 400));
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new Errorhandle("Password and confirm password don't match", 400));
    }

    if (req.body.password.length < 8 || req.body.password.length > 16) {
        return next(new Errorhandle("Password must be between 8 and 16 characters.", 400));
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Password reset successfully!",
    });
});


const updatePassword = catchAsyncErrors(async(req, res, next) => {
    const user = await User.findById(req.user._id).select("+password");
    const {currentPassword, newPassword, confirmNewPassword} = req.body;
    if(!currentPassword || !newPassword || !confirmNewPassword){
        return next(new Errorhandle("please enter all fields.", 400))
    }  
    const isPasswordMatched = await bcrypt.compare(currentPassword, user.password);

    if(!isPasswordMatched){
        return next(new Errorhandle("current password is incorrect !", 400))
    }
    if ((req.body.newPassword).length < 8 || (req.body.newPassword).length > 16) {
        return next(new Errorhandle("Password must be between 8 and 16 characters.", 400));
    }
    if (req.body.newPassword !== req.body.confirmNewPassword) {
        return next(new Errorhandle("Password and confirm password don't match", 400));
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({
        success : true,
        message : "password updated !"
    })
})

module.exports = {
    register,
    verifyOTP,
    login,
    logout,
    getuser,
    forgotpassword,
    resetPassword,
    updatePassword
};

