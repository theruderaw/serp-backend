import { z } from "zod";

export const getAttendanceTrendParamsSchema = z.object({
    schoolId: z.string().min(1),
});

export const getAttendanceTrendQuerySchema = z.object({
    period: z.string().optional(),
    role: z.string().optional(),
});

export const getDebugFeesParamsSchema = z.object({
    schoolId: z.string().min(1),
});

export const getFeeTrendParamsSchema = z.object({
    schoolId: z.string().min(1),
});

export const getFeeTrendQuerySchema = z.object({
    period: z.string().optional(),
});