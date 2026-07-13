import draftsService from "./drafts.service.js";

export async function getDrafts(req, res, next) {
    try {
        const data = await draftsService.getDrafts(
            req.params.schoolId
        );

        res.json(data);
    } catch (error) {
        next(error);
    }
}

export async function createDraft(req, res, next) {
    try {
        const data = await draftsService.createDraft(
            req.body
        );

        res.json(data);
    } catch (error) {
        next(error);
    }
}

export async function deleteDraft(req, res, next) {
    try {
        const data = await draftsService.deleteDraft(
            req.params.id
        );

        res.json(data);
    } catch (error) {
        next(error);
    }
}