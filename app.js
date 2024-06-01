
require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const PORT = process.env.PORT || 8000;
const MONGO_URL = process.env.MONGO_URL;

app.use(express.json());
app.use(express.urlencoded({extended:true}))


//db connection
mongoose.connect(MONGO_URL)
.then(() => console.log('Connected with server'))
.catch((err) => console.log('mongodb Error',err))

//schema
const userSchema = new mongoose.Schema({
    firstName : {
        type:String,
        required:true
    },
    lastName:{
        type:String
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    }
    

})

//password save
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

const User = mongoose.model('User',userSchema)


//routes
app.post('/signup',async (req,res)=>{
    let reqbody = req.body;
    console.log('reqbody>>>>>>>>>>>>>>>>>>',reqbody);
    if( !reqbody || !reqbody.first_name || !reqbody.last_name || !reqbody.email || !reqbody.password){
        return res.status(400).json({msg:"All fields Are Mandatory"})
    }
    const result = await User.create({
        firstName :reqbody.first_name,
        lastName: reqbody.last_name,
        email:reqbody.email,
        password: reqbody.password
    })

    return res.status(201).json({msg:"User Created", id : result._id})

})

app.post('/signin',async (req,res)=>{
    let reqbody = req.body;
    if( !reqbody ||  !reqbody.email || !reqbody.password){
        return res.status(400).json({msg:"email and password Are Mandatory"})
    }
    const user = await User.findOne({email:reqbody.email})

    console.log(user);
    if (!user || !await bcrypt.compare(reqbody.password, user.password)) {
        return res.status(400).send('Invalid credentials');
    }
    else{
        return res.status(201).json({msg:"User sign in", id : user._id})
    }

})

app.listen(PORT,(req,res)=>{
    console.log(`Server listning on port ${PORT}`);
})