import { z } from "zod";

export const getSchoolsQuerySchema = z.object({});

export const getSchoolParamsSchema = z.object({
    id: z.string().min(1),
});

export const getSchoolBySlugParamsSchema = z.object({
    slug: z.string().min(1),
});

export const getSchoolUsersParamsSchema = z.object({
    schoolId: z.string().min(1),
});

export const createSchoolBodySchema = z.object({
    name: z.string().min(1),
    logo: z.string().optional(),
    contactEmail: z.string().email(),
    plan: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    principal: z.string().optional(),
    established: z.string().optional(),
    website: z.string().optional(),
    academicYear: z.string().optional(),
});

export const getSchoolModulesParamsSchema = z.object({
    schoolId: z.string().min(1),
});

export const toggleSchoolModuleParamsSchema = z.object({
    schoolId: z.string().min(1),
});

export const toggleSchoolModuleBodySchema = z.object({
    moduleId: z.string().min(1),
    status: z.string().min(1),
});

export const updateSchoolStatusParamsSchema = z.object({
    id: z.string().min(1),
});

export const updateSchoolStatusBodySchema = z.object({
    status: z.string().min(1),
});

export const updateSchoolParamsSchema = z.object({
    id: z.string().min(1),
});

export const updateSchoolBodySchema = z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    logo: z.string().optional(),
    contactEmail: z.string().email(),
    principal: z.string().optional(),
    established: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    website: z.string().optional(),
    academicYear: z.string().optional(),
    workingDays: z.array(z.string()).optional(),
    loginBackground: z.string().optional(),
    plan: z.string().optional(),
});

export const resetAdminPasswordParamsSchema = z.object({
    id: z.string().min(1),
});