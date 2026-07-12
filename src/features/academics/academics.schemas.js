// academics.schemas.js

import { z } from "zod";

// ---------- Classes ----------

export const getClassesFlatParamsSchema = z.object({
    schoolId: z.string().min(1),
});

export const getClassesHierarchyParamsSchema = z.object({
    schoolId: z.string().min(1),
});

export const saveClassHierarchyParamsSchema = z.object({
    schoolId: z.string().min(1),
});

export const saveClassHierarchyBodySchema = z.object({
    name: z.string().min(1),
    grade: z.number().int().nonnegative(),
    stream: z.string().optional(),
    sections: z.array(
        z.object({
            name: z.string().min(1),
            teacherId: z.string().nullable().optional(),
            capacity: z.number().int().positive().optional(),
        })
    ).min(1),
});

export const deleteClassParamsSchema = z.object({
    schoolId: z.string().min(1),
    className: z.string().min(1),
});

// ---------- Attendance ----------

export const getStudentAttendanceParamsSchema = z.object({
    schoolId: z.string().min(1),
});

export const getTodayAttendanceSummaryParamsSchema = z.object({
    schoolId: z.string().min(1),
});

// ---------- Marks ----------

export const getMarksParamsSchema = z.object({
    studentId: z.string().min(1),
});

// ---------- Homework ----------

export const getHomeworkParamsSchema = z.object({
    classId: z.string().min(1),
});