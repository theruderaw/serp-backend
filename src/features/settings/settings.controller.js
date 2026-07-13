import * as settingsService from "./settings.service.js";


export async function getSettings(req, res, next) {
    try {
        const data = await settingsService.getSettings(
            req.params.schoolId
        );

        res.json(data);

    } catch (error) {
        next(error);
    }
}


export async function getSetting(req, res, next) {
    try {

        const data = await settingsService.getSetting(
            req.params.schoolId,
            req.params.key
        );

        res.json(data);

    } catch (error) {
        next(error);
    }
}


export async function saveSetting(req, res, next) {
    try {

        const data = await settingsService.saveSetting(
            req.params.schoolId,
            req.params.key,
            req.body.value
        );

        res.json(data);

    } catch (error) {
        next(error);
    }
}


export async function deleteSetting(req, res, next) {
    try {

        const data = await settingsService.deleteSetting(
            req.params.schoolId,
            req.params.key
        );

        res.json(data);

    } catch (error) {
        next(error);
    }
}