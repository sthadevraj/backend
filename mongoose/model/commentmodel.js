const mongoose=require('mongoose');
const commentSchema = require('../schema/comment-schema');
const commentModel=new mongoose.model('comment',commentSchema);
module.exports=commentModel