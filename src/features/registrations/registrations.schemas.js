import { z } from "zod";

export const registerSchoolBodySchema = z.object({
    schoolName: z.string().min(1),
    address: z.string().min(1),
    studentStrength: z.union([z.string(), z.number()]),
    employeeStrength: z.union([z.string(), z.number()]),
    email: z.string().email(),
    mobile: z.string().min(1),
    contactName: z.string().min(1),
    contactPosition: z.string().min(1),
    contactEmail: z.string().email(),
    contactPhone: z.string().min(1),
});

export const getRegistrationRequestsQuerySchema = z.object({});

export const updateRegistrationStatusParamsSchema = z.object({
    id: z.string().min(1),
});

export const updateRegistrationStatusBodySchema = z.object({
    status: z.string().min(1),
});

export const approveSchoolParamsSchema = z.object({
    id: z.string().min(1),
});