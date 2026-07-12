import { z } from "zod";

// ═══════════════ SEED CLASS CONFIG ═══════════════
// POST /seed-class-config — no params/query/body

// ═══════════════ CLASS CONFIG ═══════════════

export const getClassesParamsSchema = z.object({
    schoolId: z.string().min(1)
});

export const createClassBodySchema = z.object({
    schoolId: z.string().min(1),
    className: z.string().min(1),
    stream: z.string().optional(),
    sections: z.array(z.any()).optional(),
    subjects: z.array(z.any()).optional(),
    exams: z.array(z.any()).optional(),
    color: z.string().optional(),
    classTeacherId: z.string().min(1).optional().nullable()
});

export const updateClassParamsSchema = z.object({
    id: z.string().min(1)
});

export const updateClassBodySchema = z.object({
    className: z.string().min(1),
    stream: z.string().optional(),
    sections: z.array(z.any()).optional(),
    subjects: z.array(z.any()).optional(),
    exams: z.array(z.any()).optional(),
    color: z.string().optional(),
    classTeacherId: z.string().min(1).optional().nullable()
});

export const deleteClassParamsSchema = z.object({
    id: z.string().min(1)
});

// ═══════════════ AUTO-ASSIGN TEACHERS ═══════════════

export const autoAssignTeachersParamsSchema = z.object({
    schoolId: z.string().min(1)
});

// ═══════════════ TIMETABLE ═══════════════

export const getTeacherTimetableParamsSchema = z.object({
    schoolId: z.string().min(1),
    teacherId: z.string().min(1)
});

export const getTimetablesParamsSchema = z.object({
    schoolId: z.string().min(1)
});

export const getTimetableBySectionParamsSchema = z.object({
    schoolId: z.string().min(1),
    classConfigId: z.string().min(1),
    section: z.string().min(1)
});

export const upsertTimetableBodySchema = z.object({
    schoolId: z.string().min(1),
    classConfigId: z.union([z.string(), z.number()]),
    sectionName: z.string().min(1),
    periodsCount: z.number().int().positive().optional(),
    startTime: z.string().optional(),
    periodMinutes: z.number().int().positive().optional(),
    lunchMinutes: z.number().int().nonnegative().optional(),
    lunchAfterPeriod: z.number().int().nonnegative().optional(),
    hasPrayer: z.boolean().optional(),
    prayerStartTime: z.string().optional(),
    prayerDuration: z.number().int().nonnegative().optional(),
    prayerName: z.string().optional(),
    prayerDisplayMode: z.string().optional(),
    session: z.string().optional(),
    showLunchInColumn: z.boolean().optional(),
    timetableData: z.record(z.any()).optional().nullable()
});

export const autoGenerateTimetablesBodySchema = z.object({
    schoolId: z.string().min(1),
    periodsCount: z.number().int().positive(),
    startTime: z.string(),
    periodMinutes: z.number().int().positive(),
    lunchMinutes: z.number().int().nonnegative(),
    lunchAfterPeriod: z.number().int().nonnegative(),
    hasPrayer: z.boolean().optional(),
    prayerStartTime: z.string().optional(),
    prayerDuration: z.number().int().nonnegative().optional(),
    prayerName: z.string().optional(),
    prayerDisplayMode: z.string().optional(),
    session: z.string().optional(),
    showLunchInColumn: z.boolean().optional(),
    selectedClasses: z.array(
        z.object({
            classConfigId: z.union([z.string(), z.number()]),
            section: z.string().min(1)
        })
    ).optional(),
    globalSubjectRules: z.array(z.record(z.any())).optional(),
    noLabsFirstPeriod: z.boolean().optional()
});

export const deleteTimetableParamsSchema = z.object({
    id: z.string().min(1)
});

// ═══════════════ HOLIDAYS ═══════════════

export const getHolidaysParamsSchema = z.object({
    schoolId: z.string().min(1)
});

export const createHolidayBodySchema = z.object({
    schoolId: z.string().min(1),
    holidayDate: z.string().min(1),
    dayName: z.string().optional(),
    holidayName: z.string().min(1)
});

export const deleteHolidayParamsSchema = z.object({
    id: z.string().min(1)
});