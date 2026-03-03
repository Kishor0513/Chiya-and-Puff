import { jwtVerify, SignJWT } from 'jose';

const getJwtSecretKey = () => {
    const secret = process.env.JWT_SECRET || 'super-secret-key-chiya-puff';
    return new TextEncoder().encode(secret);
};

export async function verifyAuth(token: string) {
    try {
        const verified = await jwtVerify(token, getJwtSecretKey());
        return verified.payload;
    } catch (err) {
        throw new Error('Your token has expired.');
    }
}

export async function signAuth(payload: { id: string; role: string; name: string }) {
    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1d')
        .sign(getJwtSecretKey());

    return token;
}
