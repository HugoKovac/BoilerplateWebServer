import transporter from "$lib/emailSetup.server"
import {GOOGLE_EMAIL, BASE_URL} from '$env/static/private'
import { createJWT, verifyAuthJWT } from "$lib/jwt.server"
import { redirect } from "@sveltejs/kit"

export const actions = {
    default: async (event) => {
        try{

            const verify_token = await createJWT({
                id: event.locals.user.id,
                email: event.locals.user.email,
                role: event.locals.user.role,
                verified: true
            }, "1h")

            console.log(verify_token);

            const message = {
                from: GOOGLE_EMAIL,
                to: event.locals.user.email,
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

export async function load({cookies}){
    const jwt = cookies.get("auth")
    const payload = await verifyAuthJWT(jwt)
    if (!payload){
        throw redirect(303, "/login")
    }
    else if (payload && payload.role !== "NOT_AUTHENTICATED"){  
        throw redirect(301, "/")
    }
}
