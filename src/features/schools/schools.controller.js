import schoolsService from "./schools.service.js";

export async function getSchools(req, res, next) {
    try {
        const data = await schoolsService.getSchools();
        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function getSchool(req, res, next) {
    try {
        const data = await schoolsService.getSchool(req.params.id);
        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function getSchoolBySlug(req, res, next) {
    try {
        const data = await schoolsService.getSchoolBySlug(
            req.params.slug
        );
        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function getSchoolUsers(req, res, next) {
    try {
        const data = await schoolsService.getSchoolUsers(
            req.params.schoolId
        );
        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function createSchool(req, res, next) {
    try {
        const data = await schoolsService.createSchool(req.body);
        res.status(201).json(data);
    } catch (err) {
        next(err);
    }
}

export async function getSchoolModules(req, res, next) {
    try {
        const data = await schoolsService.getSchoolModules(
            req.params.schoolId
        );
        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function toggleSchoolModule(req, res, next) {
    try {
        const data = await schoolsService.toggleSchoolModule(
            req.params.schoolId,
            req.body
        );
        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function updateSchoolStatus(req, res, next) {
    try {
        const data = await schoolsService.updateSchoolStatus(
            req.params.id,
            req.body.status
        );
        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function updateSchool(req, res, next) {
    try {
        const data = await schoolsService.updateSchool(
            req.params.id,
            req.body
        );
        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function resetAdminPassword(req, res, next) {
    try {
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({
                message: "newPassword is required",
            });
        }

        const data =
            await schoolsService.resetAdminPassword(
                req.params.id,
                newPassword
            );

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function updateCompany(req, res, next) {
    try {
        const data =
            await schoolsService.updateCompany(
                req.params.id,
                req.body
            );

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function updatePlan(req, res, next) {
    try {
        const data =
            await schoolsService.updatePlan(
                req.params.id,
                req.body.plan
            );

        res.json(data);
    } catch (err) {
        next(err);
    }
}