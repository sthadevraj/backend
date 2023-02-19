const mongoose = require('mongoose');
const resturantSchema=new mongoose.Schema({
    image:String,
    resturantName:String,
    location:String,
    openTime:String,
    closeTime:String
})
module.exports=resturantSchema