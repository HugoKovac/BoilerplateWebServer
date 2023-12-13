import { verifyAuthJWT } from "$lib/jwt.server";
import { redirect } from "@sveltejs/kit";

export async function handle({event, resolve}){
    const jwt = event.cookies.get("auth")

    const payload = await verifyAuthJWT(jwt)
    if (payload && payload.role === "NOT_AUTHENTICATED" && !event.url.pathname.startsWith('/verify')){  
        console.log("Not authenticated");
        throw redirect(303, "/verify")
    }
    event.locals.user = payload;

    const response = await resolve(event);

    return response;
}