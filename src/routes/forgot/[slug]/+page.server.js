import { redirect } from "@sveltejs/kit";
import { db } from '$lib/server/prisma'
import { z } from "zod";
import { auth } from "$lib/server/lucia";
import { validatePasswordResetToken } from "$lib/server/token";
import { DEV } from "$env/static/private";

export async function load({ locals }) {
    const session = await locals.auth.validate()
    if (session) {
        throw redirect(303, "/login")
    }
}

const forgetSchema = z.object({
    newpassword: z.string({ required_error: "New Password is required" })
        .min(8, { message: "New Password should be minimum 8 characters" })
        .max(64, { message: "New Password should be maximum 64 characters" }),
    confirmnewpassword: z.string({ required_error: "Confirm Password is required" })
        .min(8, { message: "Confirm Password should be minimum 8 characters" })
        .max(64, { message: "Confirm Password should be maximum 64 characters" })
}).superRefine(({ newpassword }, checkPassComplexity) => {
    const containsUppercase = (ch) => /[A-Z]/.test(ch);
    const containsLowercase = (ch) => /[a-z]/.test(ch);
    const containsSpecialChar = (ch) =>
        /[`!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?~ ]/.test(ch);
    let countOfUpperCase = 0,
        countOfLowerCase = 0,
        countOfNumbers = 0,
        countOfSpecialChar = 0;

    for (let i = 0; i < newpassword.length; i++) {
        let ch = newpassword.charAt(i);
        if (!isNaN(+ch)) countOfNumbers++;
        else if (containsUppercase(ch)) countOfUpperCase++;
        else if (containsLowercase(ch)) countOfLowerCase++;
        else if (containsSpecialChar(ch)) countOfSpecialChar++;
    }

    let errObj = {
        upperCase: { pass: true, message: "one upper case" },
        lowerCase: { pass: true, message: "one lower case" },
        specialCh: { pass: true, message: "one special character" },
        totalNumber: { pass: true, message: "one number" },
    };

    if (countOfLowerCase < 1) {
        errObj = { ...errObj, lowerCase: { ...errObj.lowerCase, pass: false } };
    }
    if (countOfNumbers < 1) {
        errObj = {
            ...errObj,
            totalNumber: { ...errObj.totalNumber, pass: false },
        };
    }
    if (countOfUpperCase < 1) {
        errObj = { ...errObj, upperCase: { ...errObj.upperCase, pass: false } };
    }
    if (countOfSpecialChar < 1) {
        errObj = { ...errObj, specialCh: { ...errObj.specialCh, pass: false } };
    }

    if (
        countOfLowerCase < 1 ||
        countOfUpperCase < 1 ||
        countOfSpecialChar < 1 ||
        countOfNumbers < 1
    ) {
        checkPassComplexity.addIssue({
            code: "custom",
            path: ["policy"],
            message: errObj,
        });
    }
});

export const actions = {
    default: async (event) => {
        const data = Object.fromEntries(await event.request.formData());

        try {
            forgetSchema.parse(data)
        }
        catch (e) {
            console.error(e)
            const { fieldErrors: errors } = e.flatten();
            console.error(errors)
            return {
                errors
            }
        }

        if (data.newpassword !== data.confirmnewpassword) {
            return {
                errors: {
                    not_match: "Passwords do not match"
                }
            }
        }

        try {
            const userId = await validatePasswordResetToken(event.params.slug);
            let user = await auth.getUser(userId);
            await auth.invalidateAllUserSessions(user.userId);
            await auth.updateKeyPassword("email", user.email, data.newpassword);

            console.log(user ? user : "No user found");
            if (!user.email_verified) {
                user = await auth.updateUserAttributes(user.userId, {
                    email_verified: true
                });
            }

            const session = await auth.createSession({
                userId: user.userId,
                attributes: {}
            });
            const sessionCookie = auth.createSessionCookie(session);
            event.cookies.set(sessionCookie.name, sessionCookie.value, {
                path: '/',
                httpOnly: true,
                sameSite: 'strict',
                secure: !DEV,
                maxAge: 60 * 60 * 24 * 30
            });
    

        } catch (e) {
            console.error(e);
            return {
                errors: {
                    token: e.message
                }
            }
        }
        throw redirect(303, "/");
    }

}