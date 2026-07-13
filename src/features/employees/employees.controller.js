import employeesService from "./employees.service.js";

export async function getEmployees(req, res, next) {
    try {
        const data = await employeesService.getEmployees();

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function generateEmployeeId(req, res, next) {
    try {
        const data = await employeesService.generateEmployeeId(
            req.params.schoolId
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function getEmployeeDetail(req, res, next) {
    try {
        const data = await employeesService.getEmployeeDetail(
            req.params.id
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function getSchoolEmployees(req, res, next) {
    try {
        const data = await employeesService.getSchoolEmployees(
            req.params.schoolId,
            req.query
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function createEmployee(req, res, next) {
    try {
        const data = await employeesService.createEmployee(
            req.body
        );

        res.status(201).json(data);
    } catch (err) {
        next(err);
    }
}

export async function updateEmployee(req, res, next) {
    try {
        const data = await employeesService.updateEmployee(
            req.params.id,
            req.body
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function deleteEmployee(req, res, next) {
    try {
        const data = await employeesService.deleteEmployee(
            req.params.id,
            req.body.remark
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}