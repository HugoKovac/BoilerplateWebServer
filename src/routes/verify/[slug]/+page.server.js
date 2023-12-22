import { redirect } from "@sveltejs/kit";
import {db} from '$lib/server/prisma'
import { validateEmailVerificationToken } from "$lib/server/token";
import { auth } from "$lib/server/lucia";

export async function load({params, cookies}){
    const token = params.slug
    try {
		const userId = await validateEmailVerificationToken(token);
		const user = await auth.getUser(userId);
		await auth.invalidateAllUserSessions(user.userId);
		await auth.updateUserAttributes(user.userId, {
			email_verified: true // `Number(true)` if stored as an integer
		});
		const session = await auth.createSession({
			userId: user.userId,
			attributes: {}
		});
		const sessionCookie = auth.createSessionCookie(session);
		throw redirect(303, "/", {
            headers: {
                "Set-Cookie": sessionCookie
            }
        });
	} catch (err) {
        console.error(err)
        throw redirect(303, "/login");
	}
}