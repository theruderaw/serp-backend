import express from "express";
import auth from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import * as financeController from "./finance.controller.js";

import {
    getTotalBillingQuerySchema,
    getStudentFeesParamsSchema,
    getBillingParamsSchema,
    getFeesParamsSchema,
    getStatsParamsSchema,
    getSalaryParamsSchema,
    createFeePaymentBodySchema,
    updateFeePaymentParamsSchema,
    updateFeePaymentBodySchema,
    getStudentFeePaymentsParamsSchema,
    getSchoolFeePaymentsParamsSchema,
} from "./finance.schemas.js";

const router = express.Router();

router.get(
    "/billing/total",
    auth,
    validate({
        query: getTotalBillingQuerySchema,
    }),
    financeController.getTotalBilling
);

router.get(
    "/fees/student/:studentId",
    auth,
    validate({
        params: getStudentFeesParamsSchema,
    }),
    financeController.getStudentFees
);

router.get(
    "/billing/:schoolId",
    auth,
    validate({
        params: getBillingParamsSchema,
    }),
    financeController.getBilling
);

router.get(
    "/fees/:schoolId",
    auth,
    validate({
        params: getFeesParamsSchema,
    }),
    financeController.getFees
);

router.get(
    "/stats/:schoolId",
    auth,
    validate({
        params: getStatsParamsSchema,
    }),
    financeController.getStats
);

router.get(
    "/salary/:employeeId",
    auth,
    validate({
        params: getSalaryParamsSchema,
    }),
    financeController.getSalary
);

router.post(
    "/fee_payments",
    auth,
    validate({
        body: createFeePaymentBodySchema,
    }),
    financeController.createFeePayment
);

router.put(
    "/fee_payments/:id",
    auth,
    validate({
        params: updateFeePaymentParamsSchema,
        body: updateFeePaymentBodySchema,
    }),
    financeController.updateFeePayment
);

router.get(
    "/fee_payments/student/:schoolId/:studentId",
    auth,
    validate({
        params: getStudentFeePaymentsParamsSchema,
    }),
    financeController.getStudentFeePayments
);

router.get(
    "/fee_payments/:schoolId",
    auth,
    validate({
        params: getSchoolFeePaymentsParamsSchema,
    }),
    financeController.getSchoolFeePayments
);

export default router;