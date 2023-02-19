const mongoose=require('mongoose');
const storySchema = require('../schema/story-schema');
const storyModel=new mongoose.model('story',storySchema);
module.exports=storyModel