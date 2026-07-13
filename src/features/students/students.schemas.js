import { z } from "zod";


// GET /
export const getStudentsGlobalParamsSchema = z.object({});


// GET /generate-id/:schoolId
export const generateStudentIdParamsSchema = z.object({
    schoolId: z.string().min(1)
});


// GET /detail/:id
export const getStudentDetailParamsSchema = z.object({
    id: z.string().min(1)
});


// GET /meta/filters/:schoolId
export const getStudentFiltersParamsSchema = z.object({
    schoolId: z.string().min(1)
});


// GET /dashboard/:id
export const getStudentDashboardParamsSchema = z.object({
    id: z.string().min(1)
});


// GET /:schoolId
export const getStudentsParamsSchema = z.object({
    schoolId: z.string().min(1)
});


export const getStudentsQuerySchema = z.object({
    className: z.string().optional(),
    section: z.string().optional(),
    stream: z.string().optional(),
    feeStatus: z.string().optional(),
    academicStatus: z.string().optional(),
    search: z.string().optional(),
    classId: z.string().optional(),
    status: z.string().optional()
});


// POST /
export const createStudentBodySchema = z.object({

    schoolId: z.string().min(1),

    name: z.string().optional(),
    middleName: z.string().optional(),
    lastName: z.string().optional(),

    gender: z.string().optional(),
    dob: z.string().optional(),

    bloodGroup: z.string().optional(),
    category: z.string().optional(),
    religion: z.string().optional(),
    nationality: z.string().optional(),

    aadhaarNumber: z.string().optional(),

    mobile: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),

    admissionDate: z.string().optional(),
    sessionYear: z.string().optional(),

    classId: z.string().optional(),
    section: z.string().optional(),
    rollNo: z.string().optional(),
    enrollmentNo: z.string().optional(),

    previousSchool: z.string().optional(),
    previousBoard: z.string().optional(),
    previousClass: z.string().optional(),
    previousPercentage: z.number().optional(),

    medium: z.string().optional(),
    stream: z.string().optional(),
    course: z.string().optional(),
    semester: z.string().optional(),


    fatherName: z.string().optional(),
    fatherMobile: z.string().optional(),
    fatherContact: z.string().optional(),
    fatherOccupation: z.string().optional(),

    motherName: z.string().optional(),
    motherMobile: z.string().optional(),
    motherContact: z.string().optional(),
    motherOccupation: z.string().optional(),


    guardianName: z.string().optional(),
    guardianRelation: z.string().optional(),
    guardianMobile: z.string().optional(),
    guardianEmail: z.string().optional(),


    annualIncome: z.number().optional(),

    address: z.string().optional(),
    permanentAddress: z.string().optional(),

    state: z.string().optional(),
    district: z.string().optional(),
    city: z.string().optional(),
    pincode: z.string().optional(),


    busRequired: z.boolean().optional(),
    route: z.string().optional(),
    pickupPoint: z.string().optional(),

    hostelRequired: z.boolean().optional(),
    hostelRoom: z.string().optional(),


    admissionFee: z.number().optional(),
    tuitionFee: z.number().optional(),
    scholarship: z.number().optional(),
    discount: z.number().optional(),

    paymentMode: z.string().optional(),
    transactionId: z.string().optional(),


    height: z.number().optional(),
    weight: z.number().optional(),

    avatar: z.string().optional(),

    feeStatus: z.string().optional(),
    academicStatus: z.string().optional(),
    status: z.string().optional(),


    documents: z.array(
        z.any()
    ).optional()

});


// PUT /:id
export const updateStudentParamsSchema = z.object({
    id: z.string().min(1)
});


export const updateStudentBodySchema =
    createStudentBodySchema
        .partial()
        .extend({
            documents: z.array(
                z.any()
            ).optional()
        });


// DELETE /:id
export const archiveStudentParamsSchema = z.object({
    id: z.string().min(1)
});


export const archiveStudentBodySchema = z.object({
    remark: z.string().optional()
});