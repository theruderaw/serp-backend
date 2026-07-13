import { z } from "zod";

export const getAttendanceSettingsParamsSchema = z.object({
    schoolId: z.string().min(1),
});

export const updateAttendanceSettingsParamsSchema = z.object({
    schoolId: z.string().min(1),
});

export const updateAttendanceSettingsBodySchema = z.object({
    settings: z.array(
        z.object({
            classId: z.union([z.string(), z.number()]),
            attendanceConfig: z.any(),
        })
    ),
});

export const getStudentAttendanceParamsSchema = z.object({
    schoolId: z.string().min(1),
});

export const getStudentAttendanceQuerySchema = z.object({
    date: z.string().optional(),
    classId: z.string().optional(),
    section: z.string().optional(),
    attendanceType: z.string().optional(),
});

export const getStudentAttendanceReportParamsSchema = z.object({
    schoolId: z.string().min(1),
});

export const getStudentAttendanceReportQuerySchema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    classId: z.string().optional(),
    studentId: z.string().optional(),
});

export const markStudentAttendanceBodySchema = z.object({
    records: z.array(
        z.object({
            studentId: z.union([z.string(), z.number()]),
            schoolId: z.union([z.string(), z.number()]),
            date: z.string(),
            status: z.string(),
            remark: z.string().optional(),
            markedBy: z.union([z.string(), z.number()]).nullable().optional(),
            attendanceType: z.string().optional(),
            editedBy: z.union([z.string(), z.number()]).nullable().optional(),
        })
    ),
});

export const getEmployeeAttendanceParamsSchema = z.object({
    schoolId: z.string().min(1),
});

export const getEmployeeAttendanceQuerySchema = z.object({
    date: z.string().optional(),
    attendanceType: z.string().optional(),
});

export const getEmployeeAttendanceReportParamsSchema = z.object({
    schoolId: z.string().min(1),
});

export const getEmployeeAttendanceReportQuerySchema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    employeeId: z.string().optional(),
});

export const markEmployeeAttendanceBodySchema = z.object({
    records: z.array(
        z.object({
            employeeId: z.union([z.string(), z.number()]),
            schoolId: z.union([z.string(), z.number()]),
            date: z.string(),
            status: z.string(),
            remark: z.string().optional(),
            markedBy: z.union([z.string(), z.number()]).nullable().optional(),
            attendanceType: z.string().optional(),
            editedBy: z.union([z.string(), z.number()]).nullable().optional(),
        })
    ),
});