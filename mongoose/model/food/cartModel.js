const mongoose= require('mongoose');
const cartSchema= require('../../schema/food/cart_schema');
const cartModel=mongoose.model("cart",cartSchema);
module.exports=cartModel;