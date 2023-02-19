const mongoose=require("mongoose");
const friendRequestSchema = require("../schema/friendRequest-schema");
const friendRequestModel=new mongoose.model('frieend_request',friendRequestSchema);
module.exports=friendRequestModel;