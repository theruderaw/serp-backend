import { z } from "zod";


// PATCH /modules/:id/toggle
export const toggleModuleParamsSchema = z.object({
    id: z.string().min(1)
});


// GET /stats/school/:schoolId
export const getSchoolStatsParamsSchema = z.object({
    schoolId: z.string().min(1)
});