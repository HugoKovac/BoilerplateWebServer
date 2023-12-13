const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function login(email, password){
    const payload = JSON.stringify({'username': email,'password': password})
    console.log("base");
    console.log("base:", API_BASE_URL);
    const response = await fetch(`${API_BASE_URL}/api/auth/user`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: payload
    })
    const data = await response.json()
    return data

}

export async function register(email, password, password_confirm){
    if (password != password_confirm){
        return {'error': 'passwords do not match'}
    }
    const payload = JSON.stringify({'email': email,'password_hash': password})
    const response = await fetch(`${API_BASE_URL}/api/auth/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: payload
    })
    const data = await response.json()
    return data

}