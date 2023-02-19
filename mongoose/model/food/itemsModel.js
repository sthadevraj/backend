const mongoose=require('mongoose');
const itemsSchema=require('../../schema/food/items_schema')
const itemsModel=new mongoose.model('item',itemsSchema)
module.exports=itemsModel;