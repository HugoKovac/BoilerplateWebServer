import * as jose from "jose";
import { JWT_SECRET_KEY } from '$env/static/private'

export const createJWT = async (payload) => {
    const secret = new TextEncoder().encode(JWT_SECRET_KEY);
    const jwt = await new jose.SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .sign(secret)
    return jwt
}

export const verifyAuthJWT = async (token) => {
    try {
        const { payload } = await jose.jwtVerify(
            token,
            new TextEncoder().encode(JWT_SECRET_KEY)
        );
        return payload;
    } catch {
        return null;
    }
};