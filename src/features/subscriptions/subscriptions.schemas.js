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
    discountText: z.string().optional(),
    gstPercentage: z.number().optional(),

    validUntil: z.string().optional(),
    validityRemark: z.string().optional(),

    upiId: z.string().optional(),
    bankName: z.string().optional(),
    bankAccountNo: z.string().optional(),
    bankIfsc: z.string().optional(),
    bankBranch: z.string().optional(),
    bankDetails: z.string().optional(),

    qrCodeUrl: z.string().optional()
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
    receiptUrl: z.string().optional(),
    schoolRemark: z.string().optional()
});


// PUT /payments/:id/verify
export const verifyPaymentParamsSchema = z.object({
    id: z.string().min(1)
});

export const verifyPaymentBodySchema = z.object({
    status: z.string().min(1),
    validUntil: z.string().optional(),
    remark: z.string().optional()
});