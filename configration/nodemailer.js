const nodemailer = require('nodemailer');

// module.exports.transporter = nodemailer.createTransport({
//     host: process.env.NODEMAILER_HOST,
//     port: process.env.MAIL_PORT, 
//     auth: {
//       user:process.env.NODEMAILER_USERNAME,
//       pass:process.env.NODEMAILER_PASSWORD
//     },
//     secure: true,
// });


// for testing mod

module.exports.transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'emerald.durgan38@ethereal.email',
        pass: 'DSvHBBnD932grU6qkK'
    }
});
