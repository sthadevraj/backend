const mongoose=require('mongoose');
const friendListSchema=new mongoose.Schema({
    friend:String,
    me:String,
    acceptAt:{
        type:Date,
        default:Date.now()
    }
})
module.exports=friendListSchema