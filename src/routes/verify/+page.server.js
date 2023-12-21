import transporter from "$lib/emailSetup.server"
import {GOOGLE_EMAIL, BASE_URL} from '$env/static/private'
import { createJWT, verifyAuthJWT } from "$lib/jwt.server"
import { redirect } from "@sveltejs/kit"

export const actions = {
    default: async (event) => {
        try{
            const session = await event.locals.auth.validate()
            const verify_token = await createJWT({
                id: session.user.userId,
                email: session.user.email,
                role: session.user.role,
                verified: true
            }, "1h")

            console.log(verify_token);

            const message = {
                from: GOOGLE_EMAIL,
                to: session.user.email,
                subject: "Verify your email",
                body: "Verify your email",
                html: `<a href="${BASE_URL}/verify/${verify_token}">Click here to verify your email</a>`
            }
            
            const sendMail = async (message) => {
                new Promise((resolve, reject) => {
                    transporter.sendMail(message, (err, info) => {
                        if (err) {
                            console.error(err);
                            reject(err);
                        }
                        else {
                            console.log(info);
                            resolve(info);
                        }
                    });
                });
            }
            
            await sendMail(message);
            
            return {
                success: "Email sent"
            }
        }
        catch(e){
            console.error(e);
            return {
                error: "Error sending email"
            }
        }
    }
}

export async function load({locals}){
    const session = await locals.auth.validate()
    if (!session){
        throw redirect(303, "/login")
    }
    else if (session.user && session.user.role !== "NOT_AUTHENTICATED"){
        throw redirect(301, "/")
    }
}
