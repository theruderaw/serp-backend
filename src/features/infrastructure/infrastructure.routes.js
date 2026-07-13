import express from "express";
import auth from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";

import * as infrastructureController from "./infrastructure.controller.js";

import {
    getTransportVehiclesParamsSchema,
    getHostelsParamsSchema,
    getHostelRoomsParamsSchema,
} from "./infrastructure.schemas.js";

const router = express.Router();

router.get(
    "/transport/:schoolId",
    auth,
    validate({
        params: getTransportVehiclesParamsSchema,
    }),
    infrastructureController.getTransportVehicles
);

router.get(
    "/hostels/:schoolId",
    auth,
    validate({
        params: getHostelsParamsSchema,
    }),
    infrastructureController.getHostels
);

router.get(
    "/hostels/rooms/:hostelId",
    auth,
    validate({
        params: getHostelRoomsParamsSchema,
    }),
    infrastructureController.getHostelRooms
);

export default router;