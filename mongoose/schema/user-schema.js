const mongoose=require('mongoose');
const userSchema=new mongoose.Schema({
    email:{
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
    },
    name:String,
    profile:String,
    dob:Date,
    join_at:{
        type:Date,
        default:Date.now()
    },
    password:String,
    gender:String
});
module.exports=userSchema;