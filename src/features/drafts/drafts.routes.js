import express from "express";
import * as draftsController from "./drafts.controller.js";
import auth from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import {
    getDraftsParamsSchema,
    createDraftBodySchema,
    deleteDraftParamsSchema
} from "./drafts.schemas.js";

const router = express.Router();

router.get(
    "/:schoolId",
    auth,
    validate({
        params: getDraftsParamsSchema
    }),
    draftsController.getDrafts
);

router.post(
    "/",
    auth,
    validate({
        body: createDraftBodySchema
    }),
    draftsController.createDraft
);

router.delete(
    "/:id",
    auth,
    validate({
        params: deleteDraftParamsSchema
    }),
    draftsController.deleteDraft
);

export default router;