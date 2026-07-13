import { z } from "zod";


// GET /:schoolId
export const getSubjectsParamsSchema = z.object({
    schoolId: z.string().min(1)
});


// POST /
export const createSubjectBodySchema = z.object({
    schoolId: z.string().min(1),
    name: z.string().min(1),
    code: z.string().optional(),
    type: z.enum(["subject", "lab"]).optional(),
    category: z.string().optional(),
    color: z.string().optional(),
    sortOrder: z.number().optional()
});


// PUT /:id
export const updateSubjectParamsSchema = z.object({
    id: z.string().min(1)
});

export const updateSubjectBodySchema = z.object({
    name: z.string().min(1),
    code: z.string().optional(),
    category: z.string().optional(),
    color: z.string().optional(),
    sortOrder: z.number().optional()
});


// DELETE /:id
export const deleteSubjectParamsSchema = z.object({
    id: z.string().min(1)
});


// POST /seed/:schoolId
export const seedSubjectsParamsSchema = z.object({
    schoolId: z.string().min(1)
});


// POST /seed-all
export const seedAllSubjectsBodySchema = z.object({});