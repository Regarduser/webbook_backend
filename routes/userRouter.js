const express = require('express')
const {getAllUsers, registerNewAdmin, updateAvatar} = require('../controllers/userController')
const {isAuthenticated, isAuthorized} = require('../middleware/authMiddleware')

const router = express.Router()

router.get("/all", isAuthenticated, getAllUsers)
router.post("/add/newAdmin", isAuthenticated, isAuthorized("Admin"), registerNewAdmin)
router.put("/updateavatar", isAuthenticated, updateAvatar )

module.exports = router