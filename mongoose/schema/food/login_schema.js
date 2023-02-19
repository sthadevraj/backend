const mongoose = require('mongoose');
const foodUserSchema=new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    phone:String,
    deliveryAddress:String
})
module.exports=foodUserSchema