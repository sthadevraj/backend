const mongoose = require('mongoose');
const itemsSchema=new mongoose.Schema({
    category:String,
    subCategory:String,
    name:String,
    resturantName:String,
    rate:Number,
    price:Number,
    image:String,
    description:String
})
module.exports=itemsSchema