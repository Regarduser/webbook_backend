const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true,
        trim : true
    },

    author :{
        type : String,
        required : true,
        trim : true
    },

    description : {
        type : String,
        required : true,
        trim : true
    },
    bookcover : {
        public_id : String,
        url : String,
    },
    source : {
        type : String,
        url : String,
    }
}, {timestamps : true},
)

const Book = mongoose.model("Book", bookSchema)

module.exports  = { Book }