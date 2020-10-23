require('dotenv').config()
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASS
  }
});

const sendConfirmationMail = (email) => {
  const confirmationUrl = 'http://localhost:3000/users/confirmation'
  const signupOptions = {
    from: process.env.EMAIL_SENDER,
    to: email,
    subject: 'Welcome to our e-commerce site.',
    html: `<h2>Welcome to e-commerce site</h2>
          <p>Please confirm your email by clicking here: <a href=${confirmationUrl}>Confirm</a></p>`
  };
  transporter.sendMail(signupOptions)
}

module.exports = {
  sendConfirmationMail
}