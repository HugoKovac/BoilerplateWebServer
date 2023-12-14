import transporter from "$lib/emailSetup.server"
import {GOOGLE_EMAIL, BASE_URL} from '$env/static/private'
import { createJWT, verifyAuthJWT } from "$lib/jwt.server"
import { redirect } from "@sveltejs/kit"
import {z} from "zod"
import {db} from '$lib/db.server'

export async function load({params, cookies}){
    const jwt = cookies.get('auth')
    const payload = await verifyAuthJWT(jwt)
    if (payload){
        throw redirect(303, "/")
    }
}

const forgetSchema = z.object({
    email: z.string({required_error: "Email is required"})
        .min(1, {message: "Email is required"})
        .max(64, {message: "The Email should be maximum 64 characters"})
        .email({message: "Email is not valid"})
});

export const actions = {
    default: async (event) => {
        try{

            const data = Object.fromEntries(await event.request.formData());
            console.log(data);

            try{
                forgetSchema.parse(data)
            }
            catch(e){
                const {fieldErrors: errors} = e.flatten();
                console.error(errors)
                return {
                    errors
                }
            }

            try{
                const user = await db.user.findUnique({
                    where: {
                        email: data.email
                    }
                })
                const reset_token = await createJWT({
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    reset: true
                }, "1h")
    
                console.log(reset_token);
    
                const message = {
                    from: GOOGLE_EMAIL,
                    to: user.email,
                    subject: "Reset your password",
                    body: "Reset your password",
                    html: `<a href="${BASE_URL}/forgot/${reset_token}">Click here to reset your password</a>`
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
                    errors: {
                        not_registered: "This email is not registered"
                    }
                }
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
