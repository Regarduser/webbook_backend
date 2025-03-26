const sendToken = (user, statuscode, message, res)=>{
    const token = user.generateToken()
    res.status(statuscode).cookie("token", token, {
        expires : new Date(Date.now() + process.env.COOKIE_EXPIRE*24*60*60*1000),
        httpOnly : "true"
    }).json({
        success : true,
        user,
        message,
        token,
    });
    
}

module.exports = {sendToken}