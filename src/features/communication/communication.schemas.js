import { z } from "zod";

export const getNoticesParamsSchema = z.object({
    schoolId: z.string().min(1),
});

export const getNoticesQuerySchema = z.object({
    role: z.string().optional(),
    userId: z.string().optional(),
    classId: z.string().optional(),
});

export const createNoticeBodySchema = z.object({
    schoolId: z.string().min(1),
    title: z.string(),
    message: z.string(),
    priority: z.string().optional(),
    targetType: z.string().optional(),
    targetId: z.string().optional(),
    createdBy: z.string(),
    link: z.string().optional(),
    fileUrl: z.string().optional(),
    targetAudience: z.any().optional(),
});

export const deleteNoticeParamsSchema = z.object({
    id: z.string().min(1),
});

export const getMessagesParamsSchema = z.object({
    schoolId: z.string().min(1),
});

export const createMessageBodySchema = z.object({
    schoolId: z.string().min(1),
    type: z.string(),
    subject: z.string(),
    body: z.string(),
    recipients: z.any(),
    sentBy: z.string(),
});