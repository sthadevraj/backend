const mongoose=require('mongoose');
const removeSuggestinSchema=require('../schema/removeSuggestionSchema');
const removeSuggestionModel=new mongoose.model('removesuggestion',removeSuggestinSchema);
module.exports=removeSuggestionModel;