const express=require('express');
const cors=require('cors');
const session=require('express-session');
const bodyParser=require('body-parser');
const router=require('./router/route');
const app=express();
const PORT=process.env.PORT ||8000;
const db=require('./mongoose/db/db');
app.set('trust proxy', 1) //
app.use(cors());
app.use(bodyParser.urlencoded({ extended:false}));
app.use(bodyParser.json());
app.use(express.json());
app.use(session({
    resave:false,
    saveUninitialized:true,
    secret:'secret_key',
    cookie:{secure:true,maxAge:400000000}
}))
// app.use(db)
app.use(router);
app.listen(PORT,(err)=>console.log('listening on port '+PORT));
