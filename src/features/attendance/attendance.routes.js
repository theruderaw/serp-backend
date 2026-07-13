import express from "express";

import auth from "../../../middleware/auth.js";
import { validate } from "../../../middleware/validate.js";

import * as attendanceController from "./attendance.controller.js";

import {
    getAttendanceSettingsParamsSchema,
    updateAttendanceSettingsParamsSchema,
    updateAttendanceSettingsBodySchema,

    getStudentAttendanceParamsSchema,
    getStudentAttendanceQuerySchema,

    getStudentAttendanceReportParamsSchema,
    getStudentAttendanceReportQuerySchema,

    markStudentAttendanceBodySchema,

    getEmployeeAttendanceParamsSchema,
    getEmployeeAttendanceQuerySchema,

    getEmployeeAttendanceReportParamsSchema,
    getEmployeeAttendanceReportQuerySchema,

    markEmployeeAttendanceBodySchema,
} from "./attendance.schemas.js";

const router = express.Router();

// ═══════════════ ATTENDANCE SETTINGS ═══════════════

router.get(
    "/settings/:schoolId",
    auth,
    validate({
        params: getAttendanceSettingsParamsSchema,
    }),
    attendanceController.getAttendanceSettings
);

router.post(
    "/settings/:schoolId",
    auth,
    validate({
        params: updateAttendanceSettingsParamsSchema,
        body: updateAttendanceSettingsBodySchema,
    }),
    attendanceController.updateAttendanceSettings
);

// ═══════════════ STUDENT ATTENDANCE ═══════════════

router.get(
    "/students/:schoolId",
    auth,
    validate({
        params: getStudentAttendanceParamsSchema,
        query: getStudentAttendanceQuerySchema,
    }),
    attendanceController.getStudentAttendance
);

router.get(
    "/students/report/:schoolId",
    auth,
    validate({
        params: getStudentAttendanceReportParamsSchema,
        query: getStudentAttendanceReportQuerySchema,
    }),
    attendanceController.getStudentAttendanceReport
);

router.post(
    "/students/mark",
    auth,
    validate({
        body: markStudentAttendanceBodySchema,
    }),
    attendanceController.markStudentAttendance
);

// ═══════════════ EMPLOYEE ATTENDANCE ═══════════════

router.get(
    "/employees/:schoolId",
    auth,
    validate({
        params: getEmployeeAttendanceParamsSchema,
        query: getEmployeeAttendanceQuerySchema,
    }),
    attendanceController.getEmployeeAttendance
);

router.get(
    "/employees/report/:schoolId",
    auth,
    validate({
        params: getEmployeeAttendanceReportParamsSchema,
        query: getEmployeeAttendanceReportQuerySchema,
    }),
    attendanceController.getEmployeeAttendanceReport
);

router.post(
    "/employees/mark",
    auth,
    validate({
        body: markEmployeeAttendanceBodySchema,
    }),
    attendanceController.markEmployeeAttendance
);

export default router;