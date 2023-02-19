const mongoose=require('mongoose');
const friendListSchema=require('../schema/friend_list_schema');
const friendListModel=new mongoose.model('friend_list',friendListSchema);
module.exports=friendListModel