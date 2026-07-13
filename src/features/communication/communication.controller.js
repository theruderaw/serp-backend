import communicationService from "./communication.service.js";

export async function getNotices(req, res, next) {
    try {
        const data = await communicationService.getNotices(
            req.params.schoolId,
            req.query
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function createNotice(req, res, next) {
    try {
        const data = await communicationService.createNotice(
            req.body
        );

        res.status(201).json(data);
    } catch (err) {
        next(err);
    }
}

export async function deleteNotice(req, res, next) {
    try {
        const data = await communicationService.deleteNotice(
            req.params.id
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function getMessages(req, res, next) {
    try {
        const data = await communicationService.getMessages(
            req.params.schoolId
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function createMessage(req, res, next) {
    try {
        const data = await communicationService.createMessage(
            req.body
        );

        res.status(201).json(data);
    } catch (err) {
        next(err);
    }
}