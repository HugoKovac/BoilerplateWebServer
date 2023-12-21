import { verifyAuthJWT, createJWT } from "$lib/jwt.server";
import { redirect } from "@sveltejs/kit";
import {db} from '$lib/server/prisma'

export async function load({params, cookies}){
    const payload = await verifyAuthJWT(params.slug)
    if (payload && payload.verified){
        const user = await db.user.findUnique({
			where: {
				email: payload.email
			}
		})
		user.role = "USER"
        await db.user.update({
            where: {
                id: user.id
            },
            data: user
        })

        const jwt = await createJWT({
            first_name: user.first_name,
            surname: user.surname,
            email: user.email,
            id: user.id,
            role: user.role,
        })

        cookies.set("session_token", jwt, {path: "/"})

        throw redirect(301, "/")
    }
    else{
        throw redirect(303, "/verify")
    }
    
}