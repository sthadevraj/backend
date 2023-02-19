const mongoose=require('mongoose');
const notificationSchema=require('../schema/notification_schema');
const notificationModel=new mongoose.model('notification',notificationSchema);
module.exports = notificationModel;