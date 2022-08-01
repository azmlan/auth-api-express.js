const nodemailer = require("nodemailer");
const dotenv = require('dotenv');

dotenv.config();

const user = process.env.EMAIL_USER
const pass = process.env.EMAIL_PASSWORD
const URL = process.env.URL

const transport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: user,
      pass: pass,
    },
  });

  const sendConfirmationEmail = (name, email, confirmationCode) => {
    transport.sendMail({
      from: user,
      to: email,
      subject: "طواف و سعي  ",
      html: `<h1>رسالة تفعيل حساب</h1>
          <h2> ${name} مرحبا </h2>
          <p>شكرا لاستخدامك تطبيق طواف وسعي. الرجاء الضغط على الرابط لتفعيل الحساب وشكرا.</p>
          <a href=${URL}/users/confirm/${confirmationCode}>اضغط هنا </a>
          </div>`,
    }).catch(err => console.log(err));
  };

  module.exports= sendConfirmationEmail
  