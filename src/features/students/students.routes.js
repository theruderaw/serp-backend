import express from "express";

import * as studentsController from "./students.controller.js";

import auth from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";

import {
    getStudentsGlobalParamsSchema,
    generateStudentIdParamsSchema,
    getStudentDetailParamsSchema,
    getStudentFiltersParamsSchema,
    getStudentDashboardParamsSchema,
    getStudentsParamsSchema,
    getStudentsQuerySchema,
    createStudentBodySchema,
    updateStudentParamsSchema,
    updateStudentBodySchema,
    archiveStudentParamsSchema,
    archiveStudentBodySchema
} from "./students.schemas.js";


const router = express.Router();



router.get(
    "/",
    auth,
    validate({
        params: getStudentsGlobalParamsSchema
    }),
    studentsController.getStudentsGlobal
);



router.get(
    "/generate-id/:schoolId",
    auth,
    validate({
        params: generateStudentIdParamsSchema
    }),
    studentsController.generateStudentId
);



router.get(
    "/detail/:id",
    auth,
    validate({
        params: getStudentDetailParamsSchema
    }),
    studentsController.getStudentDetail
);



router.get(
    "/meta/filters/:schoolId",
    auth,
    validate({
        params: getStudentFiltersParamsSchema
    }),
    studentsController.getStudentFilters
);



router.get(
    "/dashboard/:id",
    auth,
    validate({
        params: getStudentDashboardParamsSchema
    }),
    studentsController.getStudentDashboard
);



router.get(
    "/:schoolId",
    auth,
    validate({
        params: getStudentsParamsSchema,
        query: getStudentsQuerySchema
    }),
    studentsController.getStudents
);



router.post(
    "/",
    auth,
    validate({
        body: createStudentBodySchema
    }),
    studentsController.createStudent
);



router.put(
    "/:id",
    auth,
    validate({
        params: updateStudentParamsSchema,
        body: updateStudentBodySchema
    }),
    studentsController.updateStudent
);



router.delete(
    "/:id",
    auth,
    validate({
        params: archiveStudentParamsSchema,
        body: archiveStudentBodySchema
    }),
    studentsController.archiveStudent
);



export default router;