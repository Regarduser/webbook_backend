const { catchAsyncErrors } = require("../middleware/catchAsyncErrors");
const { Errorhandle } = require("../middleware/errorMiddlewares");
const Borrow = require("../models/borrowModels");
const { Book } = require("../models/bookModels");
const User = require("../models/userModels");
const mongoose = require('mongoose');
const { calculateFine } = require("../utils/fineCalculater");


const recordBorrowedBooks = catchAsyncErrors(async(req, res ,next)=>{
    const {id} = req.params;
    const {email} = req.body;
    if (!id) {
        return next(new Errorhandle("Book ID is required", 400));
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new Errorhandle("Invalid book ID format", 400));
    }

    const book = await Book.findById(id)
    if(!book){
        return next(new Errorhandle("Book not found", 400))
    }
    const user = await User.findOne({email})
    if(!user){
        return next(new Errorhandle("User not found", 400))
    }
    if(book.quantity === 0){
        return next(new Errorhandle("Book is not avaliable", 400))
    }
    const isAlreadyBorrowed = user.borrowedBooks.find(b=>b.bookId.toString() === id && b.returned === false)
    if(isAlreadyBorrowed){
       return next(new Errorhandle("Book already saved.",400)) 
    }
    
    await book.save();
    

    user.borrowedBooks.push({
        bookId : book._id,
        bookTitle : book.title,
        bookAuthor : book.author,
        bookDescription: book.description,
        bookurl : book.source,
        borrowedDate : new Date(),
        dueDate : new Date(Date.now() + 7*24*60*60*1000), 
        returned : false,
    });
    console.log(book.source)
    await user.save()
    await Borrow.create({
        user : {
            id : user._id,
            name : user.name,
            email : user.email,
        },
        book : book._id,
        dueDate : new Date(Date.now() + 7*24*60*60*1000),
        bookurl : book.source
        
    });
    res.status(200).json({
        success : true,
        message : "book save successfully"
    })
 })
 const returnBorrowedBook = catchAsyncErrors(async(req, res ,next)=>{
    const {bookId} = req.params;
    const {email} = req.body;
    // console.log(bookId, email)
    const book = await Book.findById(bookId);
    const mongoose = require('mongoose');

if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return next(new Errorhandle("Invalid book ID format", 400));
}

    // console.log(book)
 
    if(!book){
        return next(new Errorhandle("Book not found", 400))
    }
    const user = await User.findOne({email, accountVerified : true})
    if(!user){
        return next(new Errorhandle("User not found", 400))
    }
   const borrowedBook = user.borrowedBooks.find(b=>b.bookId.toString() === bookId && b.returned === false)
    if(!borrowedBook){
        return next(new Errorhandle("you have not save this book", 400))
    }
    borrowedBook.returned = true;
    await user.save();
   
    await book.save()

    const borrow = await Borrow.findOne({
        book : bookId,
        "user.email" : email,
        returned : null,
    })
    if(!borrow){
        return next(new Errorhandle("you have not save this book", 400))
    }
    borrow.returnDate = new Date()
  
    await borrow.save()
    res.status(200).json({
        success : true,
        message : "book removed from save!"
    })
 })

const borrowedBooks = catchAsyncErrors(async(req, res ,next)=>{
    const {borrowedBooks} = req.user;
    res.status(200).json({
        success : true,
        borrowedBooks,
    })

 })

const getBorrowedBooksForAdmin = catchAsyncErrors(async(req, res ,next)=>{
    const borrowedBooks = await Borrow.find();
    res.status(200).json({
        success : true,
        borrowedBooks,
    })
 })


module.exports = {
    borrowedBooks, recordBorrowedBooks, getBorrowedBooksForAdmin, returnBorrowedBook
}