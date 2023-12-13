import { fail, redirect } from "@sveltejs/kit";
import { db } from "$lib/db.server";
import bcrypt from "bcrypt";
import { createJWT, verifyAuthJWT } from "$lib/jwt.server";
import { z } from "zod";

export async function load({ params, cookies }) {
    const jwt = cookies.get('auth')
    const payload = await verifyAuthJWT(jwt)
    if (payload) {
        throw redirect(303, "/")
    }
}

const registerSchema = z.object({
    firstname: z.string({ required_error: "First name is required" })
        .min(1, { message: "First name is required" })
        .max(64, { message: "The first name should be maximum 64 characters" }),
    surname: z.string({ required_error: "Surname is required" })
        .min(1, { message: "Surname is required" })
        .max(64, { message: "The surname should be maximum 64 characters" }),
    email: z.string({ required_error: "Email is required" })
        .min(1, { message: "Email is required" })
        .max(64, { message: "The Email should be maximum 64 characters" })
        .email({ message: "Email is not valid" }),
    password: z.string({ required_error: "Password is required" })
        .min(1, { message: "Password is required" })
        .max(64, { message: "The Password should be maximum 64 characters" })
        .trim(),
    confirmpassword: z.string({ required_error: "Password is required" })
        .min(1, { message: "Password is required" })
        .max(64, { message: "The Password should be maximum 64 characters" })
        .trim()
}).superRefine(({ password }, checkPassComplexity) => {
    const containsUppercase = (ch) => /[A-Z]/.test(ch);
    const containsLowercase = (ch) => /[a-z]/.test(ch);
    const containsSpecialChar = (ch) =>
        /[`!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?~ ]/.test(ch);
    let countOfUpperCase = 0,
        countOfLowerCase = 0,
        countOfNumbers = 0,
        countOfSpecialChar = 0;

    for (let i = 0; i < password.length; i++) {
        let ch = password.charAt(i);
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
        let data = Object.fromEntries(await event.request.formData());

        try {
            const rtn = registerSchema.parse(data)
            console.log(rtn)
        }
        catch (e) {
            const { fieldErrors: errors } = e.flatten();
            console.error(errors)
            const { confirmpassword, password, ...rest } = data;
            return {
                data: rest,
                errors
            }
        }

        if (data.password != data.confirmpassword) {
            console.log("Passwords do not match")
            const { confirmpassword, password, ...rest } = data;
            return {
                data: rest,
                errors: {
                    not_match: "Passwords do not match"
                }
            }
        }

        data.password = await bcrypt.hash(data.password.toString(), 10)

        try {
            const new_user = await db.user.create({
                data: {
                    email: data.email,
                    first_name: data.firstname,
                    surname: data.surname,
                    password: data.password,
                }
            })
            const jwt = await createJWT({
                first_name: new_user.first_name,
                surname: new_user.surname,
                email: new_user.email,
                id: new_user.id,
                role: new_user.role,
            })
            event.cookies.set("auth", jwt, { path: "/" })

        }
        catch (err) {
            console.log(err)
            const { confirmpassword, password, email, ...rest } = data;
            return {
                data: rest,
                errors: {
                    db: "Email already exists"
                }
            }
        }
        throw redirect(301, "/")
    }
}