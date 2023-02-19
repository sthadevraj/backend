const mongoose = require("mongoose");
const storySchema = new mongoose.Schema({
  storys:[{
    type:{
      type:String,
      default:"photo"
    },
    story:String,
  views:[{
    email:String,
    reaction:String||null
  }]
  }],
  email:String,
  addedAt:{
    type:Date,
    default:Date.now()
  },
  
  
});
module.exports=storySchema;