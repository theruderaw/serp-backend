// auth.schemas.js

import { z } from "zod";

// ---------- Login ----------

export const loginBodySchema = z.object({
    email: z.email().optional(),
    name: z.string().min(1).optional(),
    password: z.string().min(1),
    schoolId: z.string().min(1).optional(),
}).refine(
    ({ email, name }) => email || name,
    {
        message: "Either email or name is required.",
        path: ["email"],
    }
);

// ---------- Get Profile ----------

export const getProfileParamsSchema = z.object({
    userId: z.string().min(1),
});

// ---------- Reset Password ----------

export const resetPasswordParamsSchema = z.object({
    userId: z.string().min(1),
});

// ---------- Update Permissions ----------

export const updatePermissionsParamsSchema = z.object({
    userId: z.string().min(1),
});

export const updatePermissionsBodySchema = z.object({
    permissions: z.array(z.string()),
});