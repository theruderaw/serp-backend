import { z } from "zod";

export const getTotalBillingQuerySchema = z.object({});

export const getStudentFeesParamsSchema = z.object({
    studentId: z.string().min(1),
});

export const getBillingParamsSchema = z.object({
    schoolId: z.string().min(1),
});

export const getFeesParamsSchema = z.object({
    schoolId: z.string().min(1),
});

export const getStatsParamsSchema = z.object({
    schoolId: z.string().min(1),
});

export const getSalaryParamsSchema = z.object({
    employeeId: z.string().min(1),
});

export const createFeePaymentBodySchema = z.object({
    schoolId: z.string().min(1),
    studentId: z.string().min(1),
    amount: z.union([z.number(), z.string()]),
    paymentMode: z.string().min(1),
    month: z.string().min(1),
    remarks: z.string().optional(),
    feeDetails: z.any(),
});

export const updateFeePaymentParamsSchema = z.object({
    id: z.string().min(1),
});

export const updateFeePaymentBodySchema = z.object({
    amountToAdd: z.union([z.number(), z.string()]),
    updatedFeeDetails: z.any(),
    updatedMonthString: z.string().optional(),
});

export const getStudentFeePaymentsParamsSchema = z.object({
    schoolId: z.string().min(1),
    studentId: z.string().min(1),
});

export const getSchoolFeePaymentsParamsSchema = z.object({
    schoolId: z.string().min(1),
});