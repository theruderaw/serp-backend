import express from "express";
import auth from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";

import * as registrationsController from "./registrations.controller.js";

import {
    registerSchoolBodySchema,
    getRegistrationRequestsQuerySchema,
    updateRegistrationStatusParamsSchema,
    updateRegistrationStatusBodySchema,
    approveSchoolParamsSchema,
} from "./registrations.schemas.js";

const router = express.Router();

router.post(
    "/register",
    validate({
        body: registerSchoolBodySchema,
    }),
    registrationsController.registerSchool
);

router.get(
    "/requests",
    auth,
    validate({
        query: getRegistrationRequestsQuerySchema,
    }),
    registrationsController.getRegistrationRequests
);

router.patch(
    "/requests/:id",
    auth,
    validate({
        params: updateRegistrationStatusParamsSchema,
        body: updateRegistrationStatusBodySchema,
    }),
    registrationsController.updateRegistrationStatus
);

router.post(
    "/approve/:id",
    auth,
    validate({
        params: approveSchoolParamsSchema,
    }),
    registrationsController.approveSchool
);

export default router;