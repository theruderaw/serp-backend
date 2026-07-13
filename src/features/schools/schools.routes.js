import express from "express";
import auth from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";

import * as schoolsController from "./schools.controller.js";

import {
    getSchoolsQuerySchema,
    getSchoolParamsSchema,
    getSchoolBySlugParamsSchema,
    getSchoolUsersParamsSchema,
    createSchoolBodySchema,
    getSchoolModulesParamsSchema,
    toggleSchoolModuleParamsSchema,
    toggleSchoolModuleBodySchema,
    updateSchoolStatusParamsSchema,
    updateSchoolStatusBodySchema,
    updateSchoolParamsSchema,
    updateSchoolBodySchema,
    resetAdminPasswordParamsSchema,
} from "./schools.schemas.js";

const router = express.Router();

router.get(
    "/",
    auth,
    validate({
        query: getSchoolsQuerySchema,
    }),
    schoolsController.getSchools
);

router.get(
    "/slug/:slug",
    auth,
    validate({
        params: getSchoolBySlugParamsSchema,
    }),
    schoolsController.getSchoolBySlug
);

router.get(
    "/:id",
    auth,
    validate({
        params: getSchoolParamsSchema,
    }),
    schoolsController.getSchool
);

router.get(
    "/:schoolId/users",
    auth,
    validate({
        params: getSchoolUsersParamsSchema,
    }),
    schoolsController.getSchoolUsers
);

router.post(
    "/",
    auth,
    validate({
        body: createSchoolBodySchema,
    }),
    schoolsController.createSchool
);

router.get(
    "/:schoolId/modules",
    auth,
    validate({
        params: getSchoolModulesParamsSchema,
    }),
    schoolsController.getSchoolModules
);

router.post(
    "/:schoolId/modules/toggle",
    auth,
    validate({
        params: toggleSchoolModuleParamsSchema,
        body: toggleSchoolModuleBodySchema,
    }),
    schoolsController.toggleSchoolModule
);

router.patch(
    "/:id/status",
    auth,
    validate({
        params: updateSchoolStatusParamsSchema,
        body: updateSchoolStatusBodySchema,
    }),
    schoolsController.updateSchoolStatus
);

router.put(
    "/:id",
    auth,
    validate({
        params: updateSchoolParamsSchema,
        body: updateSchoolBodySchema,
    }),
    schoolsController.updateSchool
);

router.post(
    "/:id/reset-admin-password",
    auth,
    validate({
        params: resetAdminPasswordParamsSchema,
    }),
    schoolsController.resetAdminPassword
);

export default router;