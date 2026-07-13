import subscriptionsService from "./subscriptions.service.js";


export async function getSettings(req, res, next) {
    try {
        const data = await subscriptionsService.getSettings(
            req.params.schoolId
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}


export async function updateSettings(req, res, next) {
    try {
        const data = await subscriptionsService.updateSettings(
            req.params.schoolId,
            req.body
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}


export async function getPayments(req, res, next) {
    try {
        const data = await subscriptionsService.getPayments(
            req.params.schoolId
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}


export async function createPayment(req, res, next) {
    try {
        const data = await subscriptionsService.createPayment(
            req.body
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}


export async function verifyPayment(req, res, next) {
    try {
        const data = await subscriptionsService.verifyPayment(
            req.params.id,
            req.body
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}