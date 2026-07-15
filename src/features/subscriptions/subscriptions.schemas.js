import { z } from "zod";


// GET /settings/:schoolId
export const getSettingsParamsSchema = z.object({
    schoolId: z.string().min(1)
});


// PUT /settings/:schoolId
export const updateSettingsParamsSchema = z.object({
    schoolId: z.string().min(1)
});


export const updateSettingsBodySchema = z.object({
    billingMode: z.string().optional(),

    perStudentPrice: z.number().optional(),
    yearlyPerStudentPrice: z.number().optional(),

    monthlyAmount: z.number().optional(),
    yearlyAmount: z.number().optional(),

    discountAmount: z.number().optional(),
    discountText: z.string().nullable().optional(),

    gstPercentage: z.number().optional(),

    validUntil: z.string().nullable().optional(),
    validityRemark: z.string().nullable().optional(),

    upiId: z.string().nullable().optional(),
    bankName: z.string().nullable().optional(),
    bankAccountNo: z.string().nullable().optional(),
    bankIfsc: z.string().nullable().optional(),
    bankBranch: z.string().nullable().optional(),
    bankDetails: z.string().nullable().optional(),

    qrCodeUrl: z.string().nullable().optional()
});


// GET /payments/:schoolId
export const getPaymentsParamsSchema = z.object({
    schoolId: z.string().min(1)
});


// POST /payments
export const createPaymentBodySchema = z.object({
    schoolId: z.string().min(1),
    amount: z.number(),

    paymentMode: z.string().min(1),

    receiptUrl: z.string().nullable().optional(),
    schoolRemark: z.string().nullable().optional()
});


// PUT /payments/:id/verify
export const verifyPaymentParamsSchema = z.object({
    id: z.string().min(1)
});


export const verifyPaymentBodySchema = z.object({
    status: z.string().min(1),
    validUntil: z.string().nullable().optional(),
    remark: z.string().nullable().optional()
});