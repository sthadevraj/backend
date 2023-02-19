const mongoose=require('mongoose');
const db=mongoose.connect('mongodb://localhost:27017/facebook',{
    useNewUrlParser:true,
useUnifiedTopology:true,
}).then(()=>{
console.log(`successfully connected`);
}).catch((e)=>{
console.log(`not connected ${e}`);
})
module.exports=db;