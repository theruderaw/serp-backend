import { generateToken } from "../../utils/jwt.js";
import {
    loginUser,
    getUserProfile,
    resetUserPassword,
    updateUserPermissions
} from "./auth.service.js";


export async function login(req, res) {
    try {
        const user = await loginUser(req.body);

        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials or user not found"
            });
        }

        const {password, ...safeUser} = user;

        const token = generateToken({
            id: user.id,
            role: user.role,
            tenantid: user.tenantid
        });

        res.json({
            user: safeUser,
            token: token
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
}


export async function getProfile(req, res) {
    try {
        const user = await getUserProfile(req.params.userId);
        res.json(user || null);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
}


export async function resetPassword(req, res) {
    try {
        const result = await resetUserPassword(req.params.userId);

        if (!result) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json(result);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
}


export async function updatePermissions(req, res) {
    try {
        await updateUserPermissions(
            req.params.userId,
            req.body.permissions
        );

        res.json({
            message: "Permissions updated successfully"
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
}