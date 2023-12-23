import { verifyAuthJWT } from "$lib/jwt.server";
import { redirect } from "@sveltejs/kit";
import { auth } from "$lib/server/lucia";

export const handle = async ({ event, resolve }) => {
	// we can pass `event` because we used the SvelteKit middleware
	event.locals.auth = auth.handleRequest(event);

	return await resolve(event);
};