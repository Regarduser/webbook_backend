const {isAuthenticated, isAuthorized} = require('../middleware/authMiddleware')
const express = require('express')
const { borrowedBooks,recordBorrowedBooks, getBorrowedBooksForAdmin, returnBorrowedBook,  } = require('../controllers/borrowController')
const router = express.Router()

router.post("/record-borrow-book/:id", isAuthenticated,recordBorrowedBooks )
router.put("/return-borrowed-book/:bookId", isAuthenticated,returnBorrowedBook )
router.get("/borrowed-book-by-users", isAuthenticated, getBorrowedBooksForAdmin )
router.get("/my-borrowed-book", isAuthenticated, borrowedBooks )

module.exports = router