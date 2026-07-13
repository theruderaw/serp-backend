import express from "express";
import auth from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";

import * as remindersController from "./reminders.controller.js";

import {
    getRemindersParamsSchema,
    createReminderBodySchema,
    markReminderReadParamsSchema,
} from "./reminders.schemas.js";

const router = express.Router();

router.get(
    "/:schoolId",
    auth,
    validate({
        params: getRemindersParamsSchema,
    }),
    remindersController.getReminders
);

router.post(
    "/",
    auth,
    validate({
        body: createReminderBodySchema,
    }),
    remindersController.createReminder
);

router.put(
    "/:id/read",
    auth,
    validate({
        params: markReminderReadParamsSchema,
    }),
    remindersController.markReminderRead
);

export default router;