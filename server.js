const express = require('express');
const app = express();
const router = require('express').Router();
const path = require('path');

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 8080 ;
const DB_CONNECT= process.env.DB_CONNECT
const URL = process.env.URL
// connect db
mongoose.connect(DB_CONNECT,()=>console.log("DB connected !"));





// Import Routes 
const authRoutes = require('./routes/auth');


//Middlewares 
app.use(express.json());

app.get('/privacy-policy',(req,res)=>{
    res.sendFile(path.join(__dirname, './views/privacy-policy.html'));
});

app.get('/',(req,res)=>{
  res.redirect('/privacy-policy')
});

// Routes Middlwares 
app.use("/users",authRoutes);






app.listen(PORT,()=>console.log(`running on port ${PORT}`));