import registrationsService from "./registrations.service.js";

export async function registerSchool(req, res, next) {
    try {
        const data = await registrationsService.registerSchool(req.body);
        res.status(201).json(data);
    } catch (err) {
        next(err);
    }
}

export async function getRegistrationRequests(req, res, next) {
    try {
        const data = await registrationsService.getRegistrationRequests();
        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function updateRegistrationStatus(req, res, next) {
    try {
        const data = await registrationsService.updateRegistrationStatus(
            req.params.id,
            req.body.status
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function approveSchool(req, res, next) {
    try {
        const data = await registrationsService.approveSchool(
            req.params.id
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}