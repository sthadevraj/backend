const mongoose = require("mongoose");
const { v1: uuidv4, v2: uuidv6 } = require("uuid");
const postSchema = new mongoose.Schema({
  userId: String,
  email: String,
  posts: [
    {
      postType: String,
      post: String,
    },
  ],
  postAt: {
    type: Date,
    default: Date.now(),
  },
  status: String,
  likes: [
    {
      userId: String,
      isNotified: {
        type: Boolean,
        default: false,
      },
      email: String,
      types: String,
    },
  ],
  email: String,
  reaction: [String],
});
module.exports = postSchema;
