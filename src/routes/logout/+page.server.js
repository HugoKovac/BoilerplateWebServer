import {redirect} from "@sveltejs/kit";

export function load(event) {
    event.cookies.set("auth", "", {path: "/"})
    throw redirect(303, "/login")
}