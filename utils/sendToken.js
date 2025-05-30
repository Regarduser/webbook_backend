const sendToken = (user, statuscode, message, res, req)=>{
    const token = user.generateToken()
    const isLocalhost = req.headers.origin && req.headers.origin.includes("localhost");

    res.status(statuscode).cookie("token", token, {
        expires : new Date(Date.now() + process.env.COOKIE_EXPIRE*24*60*60*1000),
        httpOnly : true,
        secure: !isLocalhost,  
        sameSite: isLocalhost ? "Lax" : "None", 
    }).json({
        success : true,
        user,
        message,
        token,
    });
    
}

module.exports = {sendToken}
