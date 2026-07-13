import dashboardService from "./dashboard.service.js";

export async function getAttendanceTrend(req, res, next) {
    try {
        const data = await dashboardService.getAttendanceTrend(
            req.params.schoolId,
            req.query
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function getDebugFees(req, res, next) {
    try {
        const data = await dashboardService.getDebugFees(
            req.params.schoolId
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function getFeeTrend(req, res, next) {
    try {
        const data = await dashboardService.getFeeTrend(
            req.params.schoolId,
            req.query
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}