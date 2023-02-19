const mongoose = require('mongoose');
const notificationSchema=new mongoose.Schema({
    email:String,
    type:String,
    seenBy:[String],
    notificationAt:{
        type:Date,
        default:Date.now()
    }
});
module.exports = notificationSchema;