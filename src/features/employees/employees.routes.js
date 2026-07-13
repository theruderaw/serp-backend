import express from "express";
import auth from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";

import * as employeesController from "./employees.controller.js";

import {
    getEmployeesQuerySchema,
    generateEmployeeIdParamsSchema,
    getEmployeeDetailParamsSchema,
    getSchoolEmployeesParamsSchema,
    getSchoolEmployeesQuerySchema,
    createEmployeeBodySchema,
    updateEmployeeParamsSchema,
    updateEmployeeBodySchema,
    deleteEmployeeParamsSchema,
    deleteEmployeeBodySchema,
} from "./employees.schemas.js";

const router = express.Router();

router.get(
    "/",
    auth,
    validate({
        query: getEmployeesQuerySchema,
    }),
    employeesController.getEmployees
);

router.get(
    "/generate-id/:schoolId",
    auth,
    validate({
        params: generateEmployeeIdParamsSchema,
    }),
    employeesController.generateEmployeeId
);

router.get(
    "/detail/:id",
    auth,
    validate({
        params: getEmployeeDetailParamsSchema,
    }),
    employeesController.getEmployeeDetail
);

router.get(
    "/school/:schoolId",
    auth,
    validate({
        params: getSchoolEmployeesParamsSchema,
        query: getSchoolEmployeesQuerySchema,
    }),
    employeesController.getSchoolEmployees
);

router.post(
    "/",
    auth,
    validate({
        body: createEmployeeBodySchema,
    }),
    employeesController.createEmployee
);

router.put(
    "/:id",
    auth,
    validate({
        params: updateEmployeeParamsSchema,
        body: updateEmployeeBodySchema,
    }),
    employeesController.updateEmployee
);

router.delete(
    "/:id",
    auth,
    validate({
        params: deleteEmployeeParamsSchema,
        body: deleteEmployeeBodySchema,
    }),
    employeesController.deleteEmployee
);

export default router;