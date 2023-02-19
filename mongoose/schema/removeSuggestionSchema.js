const mongoose=require('mongoose');
const removeSuggestinSchema=new mongoose.Schema({
    removed:[String]
})
module.exports = removeSuggestinSchema