import nodemailer from "nodemailer";
import {GOOGLE_EMAIL, GOOGLE_PASSWORD} from '$env/static/private'

console.log(GOOGLE_PASSWORD);

let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: GOOGLE_EMAIL,    
        pass: GOOGLE_PASSWORD,
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