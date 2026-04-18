import jwt from 'jsonwebtoken';

export interface Payload {
    userId: string;
}

const JWT_SECRET = process.env.JWT_SECRET as string;


export const generateToken = (payload: Payload): string => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: '1h'
    });
};

export const generateRefreshToken = (payload: Payload): string => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: '7d'
    });
};

export const verifyToken = (token: string): Payload | null  => {
    try {
        return jwt.verify(token, JWT_SECRET) as Payload;
    } catch (error) {
        console.log(error);
        return null;
    }
};
