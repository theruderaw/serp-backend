import express from "express";
import * as academicController from "./academics.controller.js";
import auth from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import {
    getClassesFlatParamsSchema,
    getClassesHierarchyParamsSchema,
    saveClassHierarchyParamsSchema,
    saveClassHierarchyBodySchema,
    deleteClassParamsSchema,
    getStudentAttendanceParamsSchema,
    getTodayAttendanceSummaryParamsSchema,
    getMarksParamsSchema,
    getHomeworkParamsSchema,
} from "./academics.schemas.js";

const router = express.Router();

// ---------- Classes ----------

// Flat (Legacy)
router.get(
    "/classes/:schoolId",
    auth,
    validate({
        params: getClassesFlatParamsSchema,
    }),
    academicController.getClassesFlat
);

// Hierarchy
router.get(
    "/classes-hierarchy/:schoolId",
    auth,
    validate({
        params: getClassesHierarchyParamsSchema,
    }),
    academicController.getClassesHierarchy
);

router.post(
    "/classes-hierarchy/:schoolId",
    auth,
    validate({
        params: saveClassHierarchyParamsSchema,
        body: saveClassHierarchyBodySchema,
    }),
    academicController.saveClassHierarchy
);

router.delete(
    "/classes-hierarchy/:schoolId/:className",
    auth,
    validate({
        params: deleteClassParamsSchema,
    }),
    academicController.deleteClass
);

// ---------- Attendance ----------

router.get(
    "/attendance/students/:schoolId",
    auth,
    validate({
        params: getStudentAttendanceParamsSchema,
    }),
    academicController.getStudentAttendance
);

router.get(
    "/attendance/today/:schoolId",
    auth,
    validate({
        params: getTodayAttendanceSummaryParamsSchema,
    }),
    academicController.getTodayAttendanceSummary
);

// ---------- Marks ----------

router.get(
    "/marks/:studentId",
    auth,
    validate({
        params: getMarksParamsSchema,
    }),
    academicController.getMarks
);

// ---------- Homework ----------

router.get(
    "/homework/:classId",
    auth,
    validate({
        params: getHomeworkParamsSchema,
    }),
    academicController.getHomework
);

export default router;