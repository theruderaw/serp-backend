import { z } from "zod";

export const getDraftsParamsSchema = z.object({
    schoolId: z.string().min(1)
});

export const createDraftBodySchema = z.object({
    id: z.string().min(1),
    schoolId: z.string().min(1),
    type: z.string().min(1),
    name: z.string().optional(),
    data: z.object({})
});

export const deleteDraftParamsSchema = z.object({
    id: z.string().min(1)
});