// require('dotenv').config({ path: "./config/config.env" });

function generateVerificationOtpEmailTemplet(otpcode){
    return ` <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 8px; background-color: #000; color: #fff;">
    <h2 style="color:#fff; text-align:center;">Verify Your Email Address</h2>
    <p style="font-size: 16px; color: #ccc;">Dear User,</p>
    <p style="font-size: 16px; color: #ccc;">To complete your registration or login, please use the following verification code:</p>

    <span style="display: block; font-size: 24px; font-weight: bold; color:#fff ; padding: 10px 20px; border-radius: 5px; background-color: #000; margin: 10px auto; text-align: center;">
        ${otpcode}
    </span>

    <p style="font-size: 16px; color: #ccc;">This code is valid for 15 minutes. Please do not share this code with anyone.</p>
    <p style="font-size: 16px; color: #ccc;">If you did not request this email, please ignore it.</p>
    
    <footer style="margin-top: 20px; text-align: center; font-size: 14px; color: #666;">
        <p>Thank you, <br> BookLab Team</p>
        <p style="font-size: 12px; color: #444;">This is an automated message. Please don't reply to this email.</p>
    </footer>
</div>

    `
}

function generateForgotPasswordEmailTemplet(resetpasswordUrl){
    return ` <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 8px; background-color: #000; color: #fff;">
    <h2 style="color:#fff; text-align:center;">Verify Your Email Address</h2>
    <p style="font-size: 16px; color: #ccc;">Dear User,</p>
    <p style="font-size: 16px; color: #ccc;">To complete your registration or login, please use the following verification code:</p>

    <span style="display: block; font-size: 24px; font-weight: bold; color:#fff ; padding: 10px 20px; border-radius: 5px; background-color: #000; margin: 10px auto; text-align: center;">
        ${resetpasswordUrl}
    </span>

    <p style="font-size: 16px; color: #ccc;">This code is valid for 15 minutes. Please do not share this code with anyone.</p>
    <p style="font-size: 16px; color: #ccc;">If you did not request this email, please ignore it.</p>
    
    <footer style="margin-top: 20px; text-align: center; font-size: 14px; color: #666;">
        <p>Thank you, <br> BookLab Team</p>
        <p style="font-size: 12px; color: #444;">This is an automated message. Please don't reply to this email.</p>
    </footer>
</div>

    `
}

module.exports = {generateVerificationOtpEmailTemplet, generateForgotPasswordEmailTemplet}