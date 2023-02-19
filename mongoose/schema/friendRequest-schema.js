const mongoose=require('mongoose');
const friendRequestSchema=new mongoose.Schema({
    sender:String,
    receiver:String,
    sendAt:{
        type:Date,
        default:Date.now()
    },
    status:{
        type:String,
        default:"NA"
    }
})
module.exports=friendRequestSchema;