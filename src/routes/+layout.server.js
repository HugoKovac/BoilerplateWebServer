export async function load(event){
    let avatar_letters = ""
    const session = await event.locals.auth.validate()
    if (session && session.user){
        avatar_letters = session.user.first_name[0] + session.user.surname[0]
    }

    const display_log_btn = (event.url.pathname.startsWith('/register') || event.url.pathname.startsWith('/login'));

    return {
        avatar_letters,
        display_log_btn
    }
}