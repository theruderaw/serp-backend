import express from "express";

import * as systemController from "./system.controller.js";

import auth from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";

import {
    toggleModuleParamsSchema,
    getSchoolStatsParamsSchema
} from "./system.schemas.js";


const router = express.Router();


router.get(
    "/modules",
    auth,
    validate({}),
    systemController.getModules
);


router.patch(
    "/modules/:id/toggle",
    auth,
    validate({
        params: toggleModuleParamsSchema
    }),
    systemController.toggleModule
);


router.get(
    "/stats/global",
    auth,
    validate({}),
    systemController.getGlobalStats
);


router.get(
    "/stats/school/:schoolId",
    auth,
    validate({
        params: getSchoolStatsParamsSchema
    }),
    systemController.getSchoolStats
);


export default router;