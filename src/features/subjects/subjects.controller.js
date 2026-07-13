import subjectsService from "./subjects.service.js";


export async function getSubjects(req, res, next) {
    try {
        const data = await subjectsService.getSubjects(
            req.params.schoolId
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}


export async function createSubject(req, res, next) {
    try {
        const data = await subjectsService.createSubject(
            req.body
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}


export async function updateSubject(req, res, next) {
    try {
        const data = await subjectsService.updateSubject(
            req.params.id,
            req.body
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}


export async function deleteSubject(req, res, next) {
    try {
        const data = await subjectsService.deleteSubject(
            req.params.id
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}


export async function seedSubjects(req, res, next) {
    try {
        const data = await subjectsService.seedSubjects(
            req.params.schoolId
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}


export async function seedAllSubjects(req, res, next) {
    try {
        const data = await subjectsService.seedAllSubjects();

        res.json(data);
    } catch (err) {
        next(err);
    }
}