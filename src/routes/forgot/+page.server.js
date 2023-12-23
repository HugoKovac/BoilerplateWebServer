import transporter from "$lib/emailSetup.server"
import {GOOGLE_EMAIL, BASE_URL} from '$env/static/private'
import { redirect } from "@sveltejs/kit"
import {z} from "zod"
import {db} from '$lib/server/prisma'
import {generatePasswordResetToken} from "$lib/server/token"


export async function load({params, cookies, locals}){
    const session = await locals.auth.validate()
    if (session){
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
                const session = await event.locals.auth.validate()

                console.log(user)

                if (!user){
                    return {
                        error: "Error sending email"
                    }
                }

                const reset_token = await generatePasswordResetToken(user.id);
    
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
