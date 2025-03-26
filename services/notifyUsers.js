const cron = require('node-cron')
const Borrow = require('../models/borrowModels');
const User = require('../models/userModels');
const {sendEmail} = require('../utils/sendEmail')

const notifyUsers = ()=>{
    cron.schedule("*/10 * * * * *", async()=>{
        try {
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000) 
            const borrowers = await Borrow.find({
                dueDate : {
                    $lt : oneDayAgo
                },
                returnDate : null,
                notified : false,
            });
            for(const element of borrowers){
                if(element.user && element.user.email){
                    sendEmail({
                        email : element.user.email,
                        subject : "Book Return reminder",
                        message : `retrun my book`
                    })
                    element.notified = true;
                    await element.save()
                    console.log(`Email sent to ${element.user.email}`)
                }
            }
        } catch (error) {
            console.error("some error occured while notfiying users. ",error)
        }
    });
}
module.exports = notifyUsers