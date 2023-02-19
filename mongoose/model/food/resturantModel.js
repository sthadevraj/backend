const mongoose=require('mongoose');
const resturantSchema=require('../../schema/food/resturantSchema')
const resturantModel=new mongoose.model('resturant',resturantSchema)
module.exports=resturantModel;