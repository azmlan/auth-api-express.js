const router = require('express').Router();
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const sendConfirmationEmail = require('../config/nodemailer');
const User = require('../model/User');

const {registerValidation , loginValidation  }= require('../validation/authValidation');

dotenv.config();

router.post('/register',async (req,res)=>{

    // Validate Request
        const {error}= registerValidation(req.body)    
        
        const emailExist = await User.findOne({email:req.body.email})
        if(emailExist) return res.status(400).send("حدث خطأ اثناء التسجيل");

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await  bcrypt.hash(req.body.password, salt);

        if(error) return res.status(400).send(error.details[0].message);      
        
            const token = jwt.sign({email: req.body.email}, process.env.TOKEN_SECRET)

            const user = new User({
            name:req.body.name,
            email:req.body.email,
            password:hashedPassword,
            confirmationCode:token
            });
        try {


            user.save((err) => {
              if (err) {
                res.status(500).send({ message: err });
                     return;
                  }
                res.send({message:'تم انشاء الحساب. يرجى تفعيل الحساب عن طريق الايميل'});

                sendConfirmationEmail(
                   user.name,
                   user.email,
                   user.confirmationCode
            );
         });

        } catch (error) {
            res.status(400).send(error);
            console.log("حدث خطأ لم يتم انشاء الحساب");
        }
        
});
router.post('/login',async (req,res)=>{

        

        // Validate Request
        const {error}= loginValidation(req.body)
        if(error) return res.status(400).send(error.details[0].message);

        try {
            
            const user = await User.findOne({email:req.body.email})
            if(!user) return res.status(400).send("الايميل او كلمة المرور خاطئة ");

            
            const validPassword = await bcrypt.compare(req.body.password, user.password)
            if(!validPassword) return res.status(400).send("الايميل او كلمة المرور خاطئة ");

            if (user.status != "active") {
              return res.status(401).send("يرجى تفعيل حسابك من الايميل اولا ");
            }else{

              
              // Create a token and assign 
              const token = jwt.sign({_id:user._id,email:user.email,name:user.name},process.env.TOKEN_SECRET);
              res.header('x-auth-token',token).send(token);
            }
          
                    

        } catch (error) {
            res.send("Catch Error",error)
        }        
});

router.get('/confirm/:confirmationCode',(req,res)=>{
   
        User.findOne({
          confirmationCode: req.params.confirmationCode,
        })
          .then((user) => {
            if (!user || user.status === "active") {
              return res.status(404).send({ message: "! هذا الحساب تم تفعيله مسبقا او انه ليس موجود    " });
            }
      
            user.status = "active";
            user.save((err) => {
              if (err) {
                res.status(500).send({ message: err });
                return;
              }
              res.sendFile(__dirname + "/welcome.html");
            });
          })
          .catch();

});


module.exports= router; 