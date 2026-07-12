import jwt from "jsonwebtoken";
import "../config/env.js"

export function generateToken(user) {
    console.log(process.env.JWT_SECRET);
    return jwt.sign(
        {
            id: user.id,
            role: user.role,
            tenantid: user.tenantid
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
}