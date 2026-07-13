import { z } from "zod";

export const getEmployeesQuerySchema = z.object({});

export const generateEmployeeIdParamsSchema = z.object({
    schoolId: z.string().min(1),
});

export const getEmployeeDetailParamsSchema = z.object({
    id: z.string().min(1),
});

export const getSchoolEmployeesParamsSchema = z.object({
    schoolId: z.string().min(1),
});

export const getSchoolEmployeesQuerySchema = z.object({
    type: z.string().optional(),
    search: z.string().optional(),
    status: z.string().optional(),
});

export const createEmployeeBodySchema = z.object({
    schoolId: z.string().min(1),
    registrationNo: z.string().optional(),
    employeeType: z.string().optional(),
    department: z.string().optional(),
    jobTitle: z.string().optional(),
    joiningDate: z.string().optional(),
    name: z.string().min(1),
    gender: z.string().optional(),
    dob: z.string().optional(),
    bloodGroup: z.string().optional(),
    maritalStatus: z.string().optional(),
    mobile: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    aadhaarNumber: z.string().optional(),
    panNumber: z.string().optional(),
    customJobTitle: z.string().optional(),
    qualification: z.string().optional(),
    experience: z.union([z.string(), z.number()]).optional(),
    specialization: z.string().optional(),
    shift: z.string().optional(),
    salary: z.union([z.string(), z.number()]).optional(),
    bankAccountNumber: z.string().optional(),
    ifscCode: z.string().optional(),
    address: z.string().optional(),
    permanentAddress: z.string().optional(),
    state: z.string().optional(),
    district: z.string().optional(),
    city: z.string().optional(),
    pincode: z.string().optional(),
    emergencyContact: z.string().optional(),
    emergencyRelation: z.string().optional(),
    height: z.union([z.string(), z.number()]).optional(),
    weight: z.union([z.string(), z.number()]).optional(),
    fatherName: z.string().optional(),
    motherName: z.string().optional(),
    spouseName: z.string().optional(),
    documents: z.any().optional(),
    avatar: z.string().optional(),
    status: z.string().optional(),
    role: z.string().optional(),
});

export const updateEmployeeParamsSchema = z.object({
    id: z.string().min(1),
});

export const updateEmployeeBodySchema = createEmployeeBodySchema.partial();

export const deleteEmployeeParamsSchema = z.object({
    id: z.string().min(1),
});

export const deleteEmployeeBodySchema = z.object({
    remark: z.string().optional(),
});