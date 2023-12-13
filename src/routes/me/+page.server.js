import {redirect} from "@sveltejs/kit"
import {z} from "zod"
import {verifyAuthJWT, createJWT} from "$lib/jwt.server"
import {db} from "$lib/db.server"

export function load({ locals }) {
    if (!locals.user){
        throw redirect(303, "/login")
    }
    return {
        user: locals.user
    }

}

const editSchema = z.object({
    firstname: z.string({ required_error: "First name is required" })
        .min(1, { message: "First name is required" })
        .max(64, { message: "The first name should be maximum 64 characters" })
        .optional(),
    surname: z.string({ required_error: "Surname is required" })
        .min(1, { message: "Surname is required" })
        .max(64, { message: "The surname should be maximum 64 characters" })
        .optional(),
    email: z.string({ required_error: "Email is required" })
        .min(1, { message: "Email is required" })
        .max(64, { message: "The Email should be maximum 64 characters" })
        .email({ message: "Email is not valid" })
        .optional(),
    password: z.string({ required_error: "Password is required" })
        .max(64, { message: "The Password should be maximum 64 characters" })
        .trim()
        .optional(),
    confirmpassword: z.string({ required_error: "Password is required" })
        .max(64, { message: "The Password should be maximum 64 characters" })
        .trim()
        .optional()
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
        const token = event.cookies.get('auth')
        console.log()
		const payload = await verifyAuthJWT(token)
		if (!payload){
			throw redirect(303, "/login")
		}
		

		const data = Object.fromEntries(await event.request.formData());
        console.log(data)
		try{
			editSchema.parse(data)
		}
		catch(e){
			const {fieldErrors: errors} = e.flatten();
            console.error(errors)

            if (!(Object.keys(errors).length === 1 && data.password === '')){
                const {password, ...rest} = data;
                return {
                    data: rest,
                    errors
                }
            }
		}
        if (data.password && !data.confirmpassword){
            const {password, ...rest} = data;
            return {
				data: rest,
				errors: {
                    password: "Password confirmation is required"
                }
			}
        }
        if (data.password != data.confirmpassword){
            const {password, ...rest} = data;
            return {
                data: rest,
                errors: {
                    password: "Passwords do not match"
                }
            }
        }

        const user = await db.user.findUnique({
            where: {
                id: payload.id
            }
        })

        console.log(user)

        if (data.firstname){
            user.first_name = data.firstname
        }
        if (data.surname){
            user.surname = data.surname
        }

        if (data.email){
            user.email = data.email
        }

        if (data.password){
            user.password = await bcrypt.hash(data.password.toString(), 10)
        }

        const new_user = await db.user.update({
            where: {
                id: payload.id
            },
            data: user
        })

        console.log(new_user)

        const jwt = await createJWT({
            first_name: new_user.first_name,
            surname: new_user.surname,
            email: new_user.email,
            id: new_user.id,
            role: new_user.role,
        })
        event.cookies.set("auth", jwt, { path: "/" })

        return {
            data: {
                firstname: new_user.first_name,
                surname: new_user.surname,
                email: new_user.email,
            }
        }
    }
}