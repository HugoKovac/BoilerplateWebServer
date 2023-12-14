/** @type {import('./$types').Actions} */
import {db} from '$lib/db.server'
import { fail, redirect } from "@sveltejs/kit";
import bcrypt from "bcrypt";
import {createJWT, verifyAuthJWT} from "$lib/jwt.server";
import {HOSTNAME} from '$env/static/private'
import {z} from "zod";

export async function load({params, cookies}){
    const jwt = cookies.get('auth')
    const payload = await verifyAuthJWT(jwt)
    if (payload){
        throw redirect(303, "/")
    }
}

const loginSchema = z.object({
	email: z.string({required_error: "Email is required"})
		.min(1, {message: "Email is required"})
		.max(64, {message: "The Email should be maximum 64 characters"})
		.email({message: "Email is not valid"}),
	password: z.string({required_error: "Password is required"})
		.min(1, {message: "Password is required"})
		.max(64, {message: "The Password should be maximum 64 characters"})
		.trim()
});

export const actions = {
	default: async (event) => {
		const token = event.cookies.get('auth')
		const payload = await verifyAuthJWT(token)
		if (payload){
			return { status: 200 }
		}
		

		const data = Object.fromEntries(await event.request.formData());
		try{
			loginSchema.parse(data)
		}
		catch(e){
			const {fieldErrors: errors} = e.flatten();
			console.error(errors)
			const {password, ...rest} = data;
			return {
				data: rest,
				errors
			}
		}
		const user = await db.user.findUnique({
			where: {
				email: data.email
			}
		})
		
		const result = await bcrypt.compare(data.password, user.password)

		console.log(result)
		if (!result){
			console.log("Passwords do not match")
			const {password, ...rest} = data;
			return {
				data: rest,
				errors: {
					invalid: "Invalid email or password"
				}
			}
		}

		const jwt = await createJWT({
			first_name: user.first_name,
			surname: user.surname,
			email: user.email,
			id: user.id,
			role: user.role,
		})

		event.cookies.set("auth", jwt, {path: "/", domain: HOSTNAME})

		throw redirect(301, "/")
	}
};
