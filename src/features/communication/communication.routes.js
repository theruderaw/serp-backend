import express from "express";

import auth from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";

import * as communicationController from "./communication.controller.js";

import {
    getNoticesParamsSchema,
    getNoticesQuerySchema,

    createNoticeBodySchema,

    deleteNoticeParamsSchema,

    getMessagesParamsSchema,

    createMessageBodySchema,
} from "./communication.schemas.js";

const router = express.Router();

// ═══════════════ NOTICES ═══════════════

router.get(
    "/notices/:schoolId",
    auth,
    validate({
        params: getNoticesParamsSchema,
        query: getNoticesQuerySchema,
    }),
    communicationController.getNotices
);

router.post(
    "/notices",
    auth,
    validate({
        body: createNoticeBodySchema,
    }),
    communicationController.createNotice
);

router.delete(
    "/notices/:id",
    auth,
    validate({
        params: deleteNoticeParamsSchema,
    }),
    communicationController.deleteNotice
);

// ═══════════════ MESSAGES ═══════════════

router.get(
    "/messages/:schoolId",
    auth,
    validate({
        params: getMessagesParamsSchema,
    }),
    communicationController.getMessages
);

router.post(
    "/messages",
    auth,
    validate({
        body: createMessageBodySchema,
    }),
    communicationController.createMessage
);

export default router;