const mongoose = require('mongoose');
const commentSchema=new mongoose.Schema({
    postId:String,
    comments: [
        {
          email: String,
          commentText: String,
          commentImage: String,
          isNotified: {
            type:Boolean,
            default: false,
          },
          isImage:{
            type:Boolean,
            default: false
          },
          commentAt: {
            type: Date,
            default: Date.now(),
          },
          isShown: {
            type: Boolean,
            default: false,
          },
          commentReplys: [
            {
              
              email: String,
              replyText: String,
              replyImage: String,
              
              isNotified: {
                type:Boolean,
                default:false,
              },
              isImage:{
                type:Boolean,
                default:false
              },
              replyAt: {
                type: Date,
                default: Date.now(),
              },
              replyLikes: [
                {
                  userId: {
                    type: String,
                  },
                  isNotified: Boolean,
                  email: String,
                },
              ],
            },
          ],
          commentLikes: [
            {
              isNotified:{
                type:Boolean,
                default: false
              },
              email: String,
            },
          ],
          
        },
      ],
});
module.exports=commentSchema;