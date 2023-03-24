const config = require('../../../config')
const nodemailer = require("nodemailer");

async function sendMail(to, subject, htmlContent){
    try {
        let transporter = nodemailer.createTransport({
            host:  config.email_service.host,
            port:  config.email_service.port,
            secure: false, // true for 465, false for other ports
            auth: {
              user: config.email_service.username, // generated ethereal user
              pass:  config.email_service.password, // generated ethereal password
            },
            
        });
        const mailOptions = { // thiết lập đối tượng, nội dung gửi mail
            from: config.email_service.from,
            to: to,
            subject: subject,
            text: 'You recieved message from ' +  config.email_service.from,
            html: htmlContent
        }
        await transporter.sendMail(mailOptions);
       
    } catch (error) {
        console.log(error)
    }
    

}

module.exports = sendMail