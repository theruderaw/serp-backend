import express from "express";
import {
    login,
    getProfile,
    resetPassword,
    updatePermissions
} from "./auth.controller.js";

import auth from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import {
    loginBodySchema,
    getProfileParamsSchema,
    resetPasswordParamsSchema,
    updatePermissionsParamsSchema,
    updatePermissionsBodySchema
} from "./auth.schemas.js";

const router = express.Router();

router.post(
    "/login",
    validate({
        body: loginBodySchema,
    }),
    login
);

router.get(
    "/profile/:userId",
    auth,
    validate({
        params: getProfileParamsSchema,
    }),
    getProfile
);

router.post(
    "/reset-password/:userId",
    validate({
        params: resetPasswordParamsSchema,
    }),
    resetPassword
);

router.put(
    "/permissions/:userId",
    validate({
        params: updatePermissionsParamsSchema,
        body: updatePermissionsBodySchema,
    }),
    updatePermissions
);

export default router;