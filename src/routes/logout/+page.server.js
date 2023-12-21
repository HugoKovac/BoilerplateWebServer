import {redirect} from "@sveltejs/kit";
import { auth } from "$lib/server/lucia";

export async function load({locals}) {
    const session = await locals.auth.validate();
    if (!session) return fail(401);
    await auth.invalidateSession(session.sessionId); // invalidate session
    locals.auth.setSession(null); // remove cookie
    throw redirect(302, "/login"); // redirect to login page
}