import express from "express";

import * as subscriptionsController from "./subscriptions.controller.js";

import auth from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";

import {
    getSettingsParamsSchema,
    updateSettingsParamsSchema,
    updateSettingsBodySchema,
    getPaymentsParamsSchema,
    createPaymentBodySchema,
    verifyPaymentParamsSchema,
    verifyPaymentBodySchema
} from "./subscriptions.schemas.js";


const router = express.Router();


router.get(
    "/settings/:schoolId",
    auth,
    validate({
        params: getSettingsParamsSchema
    }),
    subscriptionsController.getSettings
);


router.put(
    "/settings/:schoolId",
    auth,
    validate({
        params: updateSettingsParamsSchema,
        body: updateSettingsBodySchema
    }),
    subscriptionsController.updateSettings
);


router.get(
    "/payments/:schoolId",
    auth,
    validate({
        params: getPaymentsParamsSchema
    }),
    subscriptionsController.getPayments
);


router.post(
    "/payments",
    auth,
    validate({
        body: createPaymentBodySchema
    }),
    subscriptionsController.createPayment
);


router.put(
    "/payments/:id/verify",
    auth,
    validate({
        params: verifyPaymentParamsSchema,
        body: verifyPaymentBodySchema
    }),
    subscriptionsController.verifyPayment
);


export default router;