const mongoose=require('mongoose');
const cartSchema=mongoose.Schema({
quantity:Number,
itemId:String,
userId:String
})
module.exports=cartSchema;