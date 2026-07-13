import financeService from "./finance.service.js";

export async function getTotalBilling(req, res, next) {
    try {
        const data = await financeService.getTotalBilling();
        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function getStudentFees(req, res, next) {
    try {
        const data = await financeService.getStudentFees(
            req.params.studentId
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function getBilling(req, res, next) {
    try {
        const data = await financeService.getBilling(
            req.params.schoolId
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function getFees(req, res, next) {
    try {
        const data = await financeService.getFees(
            req.params.schoolId
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function getStats(req, res, next) {
    try {
        const data = await financeService.getStats(
            req.params.schoolId
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function getSalary(req, res, next) {
    try {
        const data = await financeService.getSalary(
            req.params.employeeId
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function createFeePayment(req, res, next) {
    try {
        const data = await financeService.createFeePayment(
            req.body
        );

        res.status(201).json(data);
    } catch (err) {
        next(err);
    }
}

export async function updateFeePayment(req, res, next) {
    try {
        const data = await financeService.updateFeePayment(
            req.params.id,
            req.body
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function getStudentFeePayments(req, res, next) {
    try {
        const data = await financeService.getStudentFeePayments(
            req.params.schoolId,
            req.params.studentId
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function getSchoolFeePayments(req, res, next) {
    try {
        const data = await financeService.getSchoolFeePayments(
            req.params.schoolId
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}