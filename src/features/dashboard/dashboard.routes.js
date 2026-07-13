import express from "express";

import auth from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";

import * as dashboardController from "./dashboard.controller.js";

import {
    getAttendanceTrendParamsSchema,
    getAttendanceTrendQuerySchema,

    getDebugFeesParamsSchema,

    getFeeTrendParamsSchema,
    getFeeTrendQuerySchema,
} from "./dashboard.schemas.js";

const router = express.Router();

// ═══════════════ ATTENDANCE TREND ═══════════════

router.get(
    "/attendance-trend/:schoolId",
    auth,
    validate({
        params: getAttendanceTrendParamsSchema,
        query: getAttendanceTrendQuerySchema,
    }),
    dashboardController.getAttendanceTrend
);

// ═══════════════ DEBUG FEES ═══════════════

router.get(
    "/debug-fees/:schoolId",
    auth,
    validate({
        params: getDebugFeesParamsSchema,
    }),
    dashboardController.getDebugFees
);

// ═══════════════ FEE TREND ═══════════════

router.get(
    "/fee-trend/:schoolId",
    auth,
    validate({
        params: getFeeTrendParamsSchema,
        query: getFeeTrendQuerySchema,
    }),
    dashboardController.getFeeTrend
);

export default router;