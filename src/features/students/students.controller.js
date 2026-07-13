import * as studentsService from "./students.service.js";


// GET /
export async function getStudentsGlobal(req, res, next) {
    try {

        const data =
            await studentsService.getStudentsGlobal();

        res.json(data);

    } catch (error) {
        next(error);
    }
}


// GET /generate-id/:schoolId
export async function generateStudentId(req, res, next) {
    try {

        const data =
            await studentsService.generateStudentId(
                req.params.schoolId
            );

        res.json(data);

    } catch (error) {
        next(error);
    }
}


// GET /detail/:id
export async function getStudentDetail(req, res, next) {
    try {

        const data =
            await studentsService.getStudentDetail(
                req.params.id
            );

        res.json(data);

    } catch (error) {
        next(error);
    }
}


// GET /meta/filters/:schoolId
export async function getStudentFilters(req, res, next) {
    try {

        const data =
            await studentsService.getStudentFilters(
                req.params.schoolId
            );

        res.json(data);

    } catch (error) {
        next(error);
    }
}


// GET /dashboard/:id
export async function getStudentDashboard(req, res, next) {
    try {

        const data =
            await studentsService.getStudentDashboard(
                req.params.id
            );

        res.json(data);

    } catch (error) {
        next(error);
    }
}


// GET /:schoolId
export async function getStudents(req, res, next) {
    try {

        const data =
            await studentsService.getStudents(
                req.params.schoolId,
                req.query
            );

        res.json(data);

    } catch (error) {
        next(error);
    }
}


// POST /
export async function createStudent(req, res, next) {
    try {

        const data =
            await studentsService.createStudent(
                req.body
            );

        res.status(201).json(data);

    } catch (error) {
        next(error);
    }
}


// PUT /:id
export async function updateStudent(req, res, next) {
    try {

        const data =
            await studentsService.updateStudent(
                req.params.id,
                req.body
            );

        res.json(data);

    } catch (error) {
        next(error);
    }
}


// DELETE /:id
export async function archiveStudent(req, res, next) {
    try {

        const data =
            await studentsService.archiveStudent(
                req.params.id,
                req.body.remark
            );

        res.json(data);

    } catch (error) {
        next(error);
    }
}