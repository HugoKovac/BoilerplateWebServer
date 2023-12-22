/** @type {import('./$types').Actions} */
import {db} from '$lib/server/prisma'
import { redirect } from "@sveltejs/kit";
import {z} from "zod";
import { auth } from "$lib/server/lucia";

export async function load({locals}){
    const session = await locals.auth.validate()
    if (session){
        throw redirect(302, "/")
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

		try{

			const key = await auth.useKey("email", data.email.toLowerCase(), data.password)
			const session = await auth.createSession({
				userId: key.userId,
				attributes: {}
			});
			event.locals.auth.setSession(session);
			if (session.user.email_verified === false){
				throw redirect(303, '/verify')
			}
		}
		catch (err){
			console.error(err)
			const {password, ...rest} = data;
			return {
				data: rest,
				errors: {
					invalid: "Invalid email or password"
				}
			}
		}

		throw redirect(302, "/")
	}
};
