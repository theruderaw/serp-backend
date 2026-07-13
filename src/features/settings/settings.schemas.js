import { z } from "zod";


export const getSettingsParamsSchema = z.object({
    schoolId: z.string().min(1)
});


export const getSettingParamsSchema = z.object({
    schoolId: z.string().min(1),
    key: z.string().min(1)
});


export const saveSettingParamsSchema = z.object({
    schoolId: z.string().min(1),
    key: z.string().min(1)
});


export const saveSettingBodySchema = z.object({
    value: z.any()
});


export const deleteSettingParamsSchema = z.object({
    schoolId: z.string().min(1),
    key: z.string().min(1)
});