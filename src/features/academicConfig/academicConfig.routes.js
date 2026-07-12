import express from "express";
import * as academicConfigController from "./academicConfig.controller.js";
import auth from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import {
    getClassesParamsSchema,
    createClassBodySchema,
    updateClassParamsSchema,
    updateClassBodySchema,
    deleteClassParamsSchema,
    autoAssignTeachersParamsSchema,
    getTeacherTimetableParamsSchema,
    getTimetablesParamsSchema,
    getTimetableBySectionParamsSchema,
    upsertTimetableBodySchema,
    autoGenerateTimetablesBodySchema,
    deleteTimetableParamsSchema,
    getHolidaysParamsSchema,
    createHolidayBodySchema,
    deleteHolidayParamsSchema
} from "./academicConfig.schemas.js";

const router = express.Router();

// ═══════════════ SEED CLASS CONFIG ═══════════════

router.post(
    "/seed-class-config",
    auth,
    academicConfigController.seedClassConfig
);

// ═══════════════ CLASS CONFIG ═══════════════

router.get(
    "/classes/:schoolId",
    auth,
    validate({
        params: getClassesParamsSchema
    }),
    academicConfigController.getClasses
);

router.post(
    "/classes",
    auth,
    validate({
        body: createClassBodySchema
    }),
    academicConfigController.createClass
);

router.put(
    "/classes/:id",
    auth,
    validate({
        params: updateClassParamsSchema,
        body: updateClassBodySchema
    }),
    academicConfigController.updateClass
);

router.delete(
    "/classes/:id",
    auth,
    validate({
        params: deleteClassParamsSchema
    }),
    academicConfigController.deleteClass
);

// ═══════════════ AUTO-ASSIGN TEACHERS ═══════════════

router.post(
    "/auto-assign-teachers/:schoolId",
    auth,
    validate({
        params: autoAssignTeachersParamsSchema
    }),
    academicConfigController.autoAssignTeachers
);

// ═══════════════ TIMETABLE ═══════════════

// IMPORTANT: must stay before "/timetables/:schoolId/:classConfigId/:section",
// otherwise Express treats "teacher" as a classConfigId param.
router.get(
    "/timetables/teacher/:schoolId/:teacherId",
    auth,
    validate({
        params: getTeacherTimetableParamsSchema
    }),
    academicConfigController.getTeacherTimetable
);

router.get(
    "/timetables/:schoolId",
    auth,
    validate({
        params: getTimetablesParamsSchema
    }),
    academicConfigController.getTimetables
);

router.get(
    "/timetables/:schoolId/:classConfigId/:section",
    auth,
    validate({
        params: getTimetableBySectionParamsSchema
    }),
    academicConfigController.getTimetableBySection
);

router.post(
    "/timetables",
    auth,
    validate({
        body: upsertTimetableBodySchema
    }),
    academicConfigController.upsertTimetable
);

router.post(
    "/timetables/auto-generate",
    auth,
    validate({
        body: autoGenerateTimetablesBodySchema
    }),
    academicConfigController.autoGenerateTimetables
);

router.delete(
    "/timetables/:id",
    auth,
    validate({
        params: deleteTimetableParamsSchema
    }),
    academicConfigController.deleteTimetable
);

// ═══════════════ HOLIDAYS ═══════════════

router.get(
    "/holidays/:schoolId",
    auth,
    validate({
        params: getHolidaysParamsSchema
    }),
    academicConfigController.getHolidays
);

router.post(
    "/holidays",
    auth,
    validate({
        body: createHolidayBodySchema
    }),
    academicConfigController.createHoliday
);

router.delete(
    "/holidays/:id",
    auth,
    validate({
        params: deleteHolidayParamsSchema
    }),
    academicConfigController.deleteHoliday
);

export default router;