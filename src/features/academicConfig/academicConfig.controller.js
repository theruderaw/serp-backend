import * as classConfigService from "./services/classConfig.service.js";
import * as timetableService from "./services/timetable.service.js";
import * as holidayService from "./services/holiday.service.js";
import * as teacherAssignmentService from "./services/teacherAssignment.service.js";

// ═══════════════ SEED CLASS CONFIG ═══════════════

export async function seedClassConfig(req, res, next) {
    try {
        const data = await classConfigService.seedClassConfig();
        res.json(data);
    } catch (err) {
        next(err);
    }
}

// ═══════════════ CLASS CONFIG ═══════════════

export async function getClasses(req, res, next) {
    try {
        const data = await classConfigService.getClasses(req.params.schoolId);
        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function createClass(req, res, next) {
    try {
        const data = await classConfigService.createClass(req.body);
        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function updateClass(req, res, next) {
    try {
        const data = await classConfigService.updateClass(req.params.id, req.body);
        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function deleteClass(req, res, next) {
    try {
        const data = await classConfigService.deleteClass(req.params.id);
        res.json(data);
    } catch (err) {
        next(err);
    }
}

// ═══════════════ AUTO-ASSIGN TEACHERS ═══════════════

export async function autoAssignTeachers(req, res, next) {
    try {
        const data = await teacherAssignmentService.autoAssignTeachers(req.params.schoolId);
        res.json(data);
    } catch (err) {
        next(err);
    }
}

// ═══════════════ TIMETABLE ═══════════════

export async function getTeacherTimetable(req, res, next) {
    try {
        const data = await timetableService.getTeacherTimetable(
            req.params.schoolId,
            req.params.teacherId
        );
        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function getTimetables(req, res, next) {
    try {
        const data = await timetableService.getTimetables(req.params.schoolId);
        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function getTimetableBySection(req, res, next) {
    try {
        const data = await timetableService.getTimetableBySection(
            req.params.schoolId,
            req.params.classConfigId,
            req.params.section
        );
        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function upsertTimetable(req, res, next) {
    try {
        const data = await timetableService.upsertTimetable(req.body);
        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function autoGenerateTimetables(req, res, next) {
    try {
        const data = await timetableService.autoGenerateTimetables(req.body);
        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function deleteTimetable(req, res, next) {
    try {
        const data = await timetableService.deleteTimetable(req.params.id);
        res.json(data);
    } catch (err) {
        next(err);
    }
}

// ═══════════════ HOLIDAYS ═══════════════

export async function getHolidays(req, res, next) {
    try {
        const data = await holidayService.getHolidays(req.params.schoolId);
        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function createHoliday(req, res, next) {
    try {
        const data = await holidayService.createHoliday(req.body);
        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function deleteHoliday(req, res, next) {
    try {
        const data = await holidayService.deleteHoliday(req.params.id);
        res.json(data);
    } catch (err) {
        next(err);
    }
}