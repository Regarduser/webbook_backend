const { catchAsyncErrors } = require('../middleware/catchAsyncErrors')
const { User } = require('../models/userModels')
const { Book  } = require('../models/bookModels')
const {Errorhandle} = require('../middleware/errorMiddlewares')

const addBook = catchAsyncErrors(async(req, res, next)=>{
    const {title , author, description, price, quantity} = req.body;
    if(!title || !author || !description || !price || !quantity){
        return next(new Errorhandle("please fill all fields", 400))
    }
    const book = await Book.create({title , author, description, price,  quantity});
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