import { z } from "zod";

export const getRemindersParamsSchema = z.object({
    schoolId: z.string().min(1),
});

export const createReminderBodySchema = z.object({
    schoolId: z.string().min(1),
    message: z.string().min(1),
});

export const markReminderReadParamsSchema = z.object({
    id: z.string().min(1),
});