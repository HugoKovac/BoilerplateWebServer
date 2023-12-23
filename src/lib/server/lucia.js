import { lucia } from "lucia";
import { prisma } from "@lucia-auth/adapter-prisma";
import { DEV } from "$env/static/private";
import { node, sveltekit } from "lucia/middleware";
import { db } from '$lib/server/prisma'

export const auth = lucia({
	adapter: prisma(db, {
		user: "user", // model User {}
		key: "key", // model Key {}
		session: "session" // model Session {}
	}),
	env: DEV ? 'DEV' : 'PROD',
	middleware: DEV ? sveltekit() : node(),
	getUserAttributes: (userData) => {
		return {
			userId: userData.id,
			email: userData.email,
			email_verified: userData.email_verified,
			first_name: userData.first_name,
			surname: userData.surname,
			role: userData.role
		}
	}
	
})
