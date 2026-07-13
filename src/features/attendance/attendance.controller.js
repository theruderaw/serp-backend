import attendanceService from "./attendance.service.js";

export async function getAttendanceSettings(req, res, next) {
    try {
        const data = await attendanceService.getAttendanceSettings(
            req.params.schoolId
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function updateAttendanceSettings(req, res, next) {
    try {
        const data = await attendanceService.updateAttendanceSettings(
            req.params.schoolId,
            req.body
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function getStudentAttendance(req, res, next) {
    try {
        const data = await attendanceService.getStudentAttendance(
            req.params.schoolId,
            req.query
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function getStudentAttendanceReport(req, res, next) {
    try {
        const data = await attendanceService.getStudentAttendanceReport(
            req.params.schoolId,
            req.query
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function markStudentAttendance(req, res, next) {
    try {
        const data = await attendanceService.markStudentAttendance(
            req.body
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function getEmployeeAttendance(req, res, next) {
    try {
        const data = await attendanceService.getEmployeeAttendance(
            req.params.schoolId,
            req.query
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function getEmployeeAttendanceReport(req, res, next) {
    try {
        const data = await attendanceService.getEmployeeAttendanceReport(
            req.params.schoolId,
            req.query
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function markEmployeeAttendance(req, res, next) {
    try {
        const data = await attendanceService.markEmployeeAttendance(
            req.body
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}