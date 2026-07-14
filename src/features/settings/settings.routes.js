import express from "express";
import * as settingsController from "./settings.controller.js";

import auth from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";

import {
    getSettingsParamsSchema,
    getSettingParamsSchema,
    saveSettingParamsSchema,
    saveSettingBodySchema,
    deleteSettingParamsSchema,
    schoolDetailsParamsSchema
} from "./settings.schemas.js";


const router = express.Router();


router.get(
    "/:schoolId",
    auth,
    validate({
        params: getSettingsParamsSchema
    }),
    settingsController.getSettings
);

router.get(
    '/:schoolId/school_details',
    // auth,
    validate({
        params: schoolDetailsParamsSchema
    }),
    settingsController.getSchoolDetails
);



router.get(
    "/:schoolId/:key",
    auth,
    validate({
        params: getSettingParamsSchema
    }),
    settingsController.getSetting
);


router.put(
    "/:schoolId/:key",
    auth,
    validate({
        params: saveSettingParamsSchema,
        body: saveSettingBodySchema
    }),
    settingsController.saveSetting
);



router.delete(
    "/:schoolId/:key",
    auth,
    validate({
        params: deleteSettingParamsSchema
    }),
    settingsController.deleteSetting
);

export default router;