import jwt from "jsonwebtoken";

export const generateToken = (userId) => {
    if (!process.env.SECRET_KEY) {
        throw new Error("SECRET_KEY is not defined in environment variables");
    }

    const token = jwt.sign(
        { userId },
        process.env.SECRET_KEY,
        { expiresIn: "7d" } // token expires in 7 days
    );

    return token;
};