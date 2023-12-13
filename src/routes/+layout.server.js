export function load(event){
    let avatar_letters = ""
    if (event.locals.user){
        avatar_letters = event.locals.user.first_name[0] + event.locals.user.surname[0]
    }

    const display_log_btn = (event.url.pathname.startsWith('/register') || event.url.pathname.startsWith('/login'));

    return {
        avatar_letters,
        display_log_btn
    }
}