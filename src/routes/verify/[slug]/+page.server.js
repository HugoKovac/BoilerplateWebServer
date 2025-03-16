import { redirect } from "@sveltejs/kit";
import {db} from '$lib/server/prisma'
import { validateEmailVerificationToken } from "$lib/server/token";
import { auth } from "$lib/server/lucia";
import { DEV } from "$env/static/private";

// https://lucia-auth.com/guidebook/email-verification-links/sveltekit/#verify-email
export async function load({params, cookies, locals}){
    const token = params.slug
	let sessionCookie;
    try {
		const userId = await validateEmailVerificationToken(token);
		const user = await auth.getUser(userId);
		await auth.invalidateAllUserSessions(user.userId);
		await auth.updateUserAttributes(user.userId, {
			email_verified: true
		});
		const session = await auth.createSession({
			userId: user.userId,
			attributes: {}
		});
		sessionCookie = auth.createSessionCookie(session);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: !DEV,
			maxAge: 60 * 60 * 24 * 30
		});
		// locals.auth.setSession(sessionCookie);
	} catch (err) {
        console.error(err)
        throw redirect(303, "/login");
	}
	throw redirect(302, "/", {
		headers: {
			"Set-Cookie": sessionCookie
		}
	});
	// throw redirect(302, "/verify/redirect");
}