var express = require('express');
const router = express.Router();
const {register, verifyOTP, login, logout, getuser, forgotpassword, resetPassword, updatePassword, deleteUser, banUser} = require('../controllers/authController');
const {isAuthenticated, isAuthorized} = require('../middleware/authMiddleware');

router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);
router.get("/logout",isAuthenticated, logout)
router.get("/me",isAuthenticated, getuser)
router.post("/password/forgot", forgotpassword)
router.put("/password/reset/:token", resetPassword)
router.put("/password/update",isAuthenticated, updatePassword)
router.delete("/delete/:email", isAuthenticated, isAuthorized("Admin"), deleteUser)
router.put("/ban/:email", isAuthenticated, isAuthorized("Admin"), banUser )

module.exports = router