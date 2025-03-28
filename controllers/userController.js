const { catchAsyncErrors } = require("../middleware/catchAsyncErrors");
const {Errorhandle, errorMiddleware} = require('../middleware/errorMiddlewares');
const User = require('../models/userModels');
const bcrypt = require('bcrypt')
const { v2 : cloudinary} = require('cloudinary')

const getAllUsers = catchAsyncErrors(async(req, res, next)=>{
    const users = await User.find({accountVerified : true})
    res.status(200).json({
        success : true,
        users
    });
});

const registerNewAdmin = catchAsyncErrors(async(req, res, next)=>{
    if(!req.files || Object.keys(req.files).length === 0){
        return next(new Errorhandle("Admin avatar is required.", 400))
    }
    const {name , email , password} = req.body;
    if(!name || !email || !password ){
        return next(new Errorhandle("please fill all fields", 400))
    }
    const isRegistered = await User.findOne({email, accountVerified : true}) ;
    if(isRegistered){
        return next(new Errorhandle("User is already registered.", 400))
    }
    if(password.length < 8 || password.length > 16){
        return next(new Errorhandle("password must be between 8 and 16 character"))
    }
    const {avatar} = req.files;
    const allowedFormates = ["image/png", "image/jpeg", "image/webp"]
    if(!allowedFormates.includes(avatar.mimetype)){
        return next(new Errorhandle("File formate not supported", 400))
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    let cloudinaryResponse;
    try {
        cloudinaryResponse = await cloudinary.uploader.upload(avatar.tempFilePath, {
            folder: "Book_lab_avatar"
        });
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        return next(new Errorhandle("Failed to upload avatar to Cloudinary", 500));
    }
    // console.log(cloudinaryResponse) 
    if(!cloudinaryResponse || cloudinaryResponse.error){
        console.error("cloudinary error", cloudinaryResponse.error || "unknown cloudinary error")
        return next(new Errorhandle("Failed to upload avatar to cloudinary", 500))
    }
    const admin = await User.create({
        name, email, password : hashedPassword,
        role : "Admin",
        accountVerified : true,
        avatar : {
            public_id : cloudinaryResponse.public_id,
            url : cloudinaryResponse.secure_url
        }
    })
    res.status(201).json({
        success : true,
        message : "Admin registred successfully",
        admin
    })
})



const updateAvatar = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        return next(new Errorhandle("User not found", 404));
    }

    if (!req.files || !req.files.avatar) {
        return next(new Errorhandle("Please upload an img", 400));
    }

    const { avatar } = req.files;
    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedFormats.includes(avatar.mimetype)) {
        return next(new Errorhandle("File format not supported", 400));
    }

    // Delete previous avatar from Cloudinary (if exists)
    if (user.avatar && user.avatar.public_id) {
        await cloudinary.uploader.destroy(user.avatar.public_id);
    }

    // Upload new avatar to Cloudinary
    let cloudinaryResponse;
    try {
        cloudinaryResponse = await cloudinary.uploader.upload(avatar.tempFilePath, {
            folder: "Book_lab_avatar",
        });

        if (!cloudinaryResponse || !cloudinaryResponse.secure_url) {
            throw new Error("Cloudinary upload failed");
        }
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        return next(new Errorhandle("Failed to upload img", 500));
    }

    // Update user avatar details in DB
    user.avatar = {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
    };
    await user.save();

    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        avatar: user.avatar,
    });
});





module.exports = { getAllUsers, registerNewAdmin, updateAvatar}