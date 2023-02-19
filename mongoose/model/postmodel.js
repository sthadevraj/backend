const mongoose=require('mongoose');
const postSchema = require('../schema/post-schema');
const postModel=new mongoose.model('post',postSchema);
module.exports=postModel