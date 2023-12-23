import transporter from "$lib/emailSetup.server"
import { GOOGLE_EMAIL, BASE_URL } from '$env/static/private'
import { redirect } from "@sveltejs/kit"
import { generateEmailVerificationToken } from "$lib/server/token"
import { db } from "$lib/server/prisma"

export const actions = {
    default: async (event) => {
        try {
            const session = await event.locals.auth.validate()

            console.log(session.user)
            const user = await db.user.findUnique({
                where:{
                    id: session.user.userId
                }
            })

            console.log(user)

            if (!user){
                return {
                    error: "Error sending email"
                }
            }

            const token = await generateEmailVerificationToken(user.id);

            const message = {
                from: GOOGLE_EMAIL,
                to: session.user.email,
                subject: "Verify your email",
                body: "Verify your email",
                html: `<a href="${BASE_URL}/verify/${token}">Click here to verify your email</a>`
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
        catch (e) {
            console.error(e);
            return {
                error: "Error sending email"
            }
        }
    }
}

export async function load({ locals }) {
    const session = await locals.auth.validate()
    console.log(session)
    if (!session) {
        throw redirect(303, "/login")
    }
    else if (session.user && session.user.email_verified === true) {
        throw redirect(301, "/")
    }
}
