const mongoose=require('mongoose');
const userSchema = require('../schema/user-schema');
const userModel=new mongoose.model('user',userSchema);
// const db=require('../db/db');
module.exports=userModel