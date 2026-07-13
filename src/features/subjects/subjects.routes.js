import express from "express";
import * as subjectsController from "./subjects.controller.js";

import auth from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";

import {
    getSubjectsParamsSchema,
    createSubjectBodySchema,
    updateSubjectParamsSchema,
    updateSubjectBodySchema,
    deleteSubjectParamsSchema,
    seedSubjectsParamsSchema,
    seedAllSubjectsBodySchema
} from "./subjects.schemas.js";


const router = express.Router();


router.get(
    "/:schoolId",
    auth,
    validate({
        params: getSubjectsParamsSchema
    }),
    subjectsController.getSubjects
);


router.post(
    "/",
    auth,
    validate({
        body: createSubjectBodySchema
    }),
    subjectsController.createSubject
);


router.put(
    "/:id",
    auth,
    validate({
        params: updateSubjectParamsSchema,
        body: updateSubjectBodySchema
    }),
    subjectsController.updateSubject
);


router.delete(
    "/:id",
    auth,
    validate({
        params: deleteSubjectParamsSchema
    }),
    subjectsController.deleteSubject
);


router.post(
    "/seed/:schoolId",
    auth,
    validate({
        params: seedSubjectsParamsSchema
    }),
    subjectsController.seedSubjects
);


router.post(
    "/seed-all",
    auth,
    validate({
        body: seedAllSubjectsBodySchema
    }),
    subjectsController.seedAllSubjects
);


export default router;