const { catchAsyncErrors } = require('../middleware/catchAsyncErrors')
const { User } = require('../models/userModels')
const { Book  } = require('../models/bookModels')
const {Errorhandle} = require('../middleware/errorMiddlewares')
const { v2 : cloudinary} = require('cloudinary')

const addBook = catchAsyncErrors(async(req, res, next)=>{
    if(!req.files || Object.keys(req.files).length === 0){
        return next(new Errorhandle("Book img is required.", 400))
    }
    const {title , author, description, source} = req.body;
    if(!title || !author || !description || !source){
        return next(new Errorhandle("please fill all fields", 400))
    }
    const {bookcover} = req.files;
        const allowedFormates = ["image/png", "image/jpeg", "image/webp"]
        if(!allowedFormates.includes(bookcover.mimetype)){
            return next(new Errorhandle("File formate not supported", 400))
        }
        let cloudinaryResponse;
        try {
            cloudinaryResponse = await cloudinary.uploader.upload(bookcover.tempFilePath, {
                folder: "Book_lab_cover"
            });
        } catch (error) {
            console.error("Cloudinary upload error:", error);
            return next(new Errorhandle("Failed to upload img to Cloudinary", 500));
        }
        // console.log(cloudinaryResponse) 
        if(!cloudinaryResponse || cloudinaryResponse.error){
            console.error("cloudinary error", cloudinaryResponse.error || "unknown cloudinary error")
            return next(new Errorhandle("Failed to upload avatar to cloudinary", 500))
        }

    const book = await Book.create({title , author, description,
        bookcover : {
        public_id : cloudinaryResponse.public_id,
        url : cloudinaryResponse.secure_url
    },source
    
});
    res.status(201).json({
        success : true,
        message : "book added successfully",
        book,
    })
})

const getAllBooks = catchAsyncErrors(async(req, res, next)=>{
    const books = await Book.find();
    res.status(200).json({
        success : true,
        books
    })
})

const deleteBook = catchAsyncErrors(async(req, res, next)=>{
    const {id} = req.params;
    const book = await Book.findById(id);
    if(!book){
        return next(new Errorhandle("book not found", 400))
    }
    await book.deleteOne();
    res.status(200).json({
        success : true,
        message : "Book deleted successfully.",
    })
})


module.exports = {addBook, deleteBook, getAllBooks}