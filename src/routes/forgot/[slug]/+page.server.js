import { verifyAuthJWT, createJWT } from "$lib/jwt.server";
import { redirect } from "@sveltejs/kit";
import {db} from '$lib/server/prisma'
import bcrypt from "bcrypt";
import {z} from "zod";

export async function load({params, cookies}){
    const payload = await verifyAuthJWT(params.slug)
    console.log(payload)
    if (!payload || !payload.reset){
        throw redirect(303, "/login")
    }
}

const forgetSchema = z.object({
    newpassword: z.string({required_error: "New Password is required"})
        .min(8, {message: "New Password should be minimum 8 characters"})
        .max(64, {message: "New Password should be maximum 64 characters"}),
    confirmnewpassword: z.string({required_error: "Confirm Password is required"})
        .min(8, {message: "Confirm Password should be minimum 8 characters"})
        .max(64, {message: "Confirm Password should be maximum 64 characters"})
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

        try{
            forgetSchema.parse(data)
        }
        catch(e){
            console.error(e)
            const {fieldErrors: errors} = e.flatten();
            console.error(errors)
            return {
                errors
            }
        }

        const payload = await verifyAuthJWT(event.params.slug)
        console.log(payload)
        if (!payload || !payload.reset){
            throw redirect(303, "/login")
        }

        if (data.newpassword !== data.confirmnewpassword){
            return {
                errors: {
                    not_match: "Passwords do not match"
                }
            }
        }


        const newpassword = await bcrypt.hash(data.newpassword, 10)
        const user = await db.user.update({
            where: {
                id: payload.id
            },
            data: {
                password: newpassword
            }
        })
        
        const jwt = await createJWT({
            first_name: user.first_name,
            surname: user.surname,
            email: user.email,
            id: user.id,
            role: user.role,
        })

        event.cookies.set("session_token", jwt, {path: "/"})

        throw redirect(301, "/")


        
    }
}