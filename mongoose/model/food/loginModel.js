const mongoose=require('mongoose');
const foodUserSchema=require('../../schema/food/login_schema')
const foodUserModel =new mongoose.model('foodUser',foodUserSchema)
module.exports=foodUserModel