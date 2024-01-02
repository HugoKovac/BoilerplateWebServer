import nodemailer from "nodemailer";
import {SMTP_EMAIL, SMTP_PASSWORD, SMTP_PORT, SMTP_SERVER} from '$env/static/private'

console.log(GOOGLE_PASSWORD);

let transporter = nodemailer.createTransport({
    host: SMTP_SERVER,
    port: SMTP_PORT,
    secure: true,
    auth: {
        user: SMTP_EMAIL,    
        pass: SMTP_PASSWORD,
    },
});

transporter.verify(function(error, success) {
    if (error) {
        console.log(error);
    } else {
        console.log("Server is ready to take our messages");
    }
});

export default transporter;
