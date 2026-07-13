import systemService from "./system.service.js";


export async function getModules(req, res, next) {
    try {
        const data = await systemService.getModules();

        res.json(data);
    } catch (err) {
        next(err);
    }
}


export async function toggleModule(req, res, next) {
    try {
        const data = await systemService.toggleModule(
            req.params.id
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}


export async function getGlobalStats(req, res, next) {
    try {
        const data = await systemService.getGlobalStats();

        res.json(data);
    } catch (err) {
        next(err);
    }
}


export async function getSchoolStats(req, res, next) {
    try {
        const data = await systemService.getSchoolStats(
            req.params.schoolId
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}