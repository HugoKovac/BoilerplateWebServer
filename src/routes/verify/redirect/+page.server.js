import { redirect } from "@sveltejs/kit";
import {db} from '$lib/server/prisma'
import { validateEmailVerificationToken } from "$lib/server/token";
import { auth } from "$lib/server/lucia";
import { DEV } from "$env/static/private";

export async function load({params, cookies}){
	throw redirect(302, "/");
}