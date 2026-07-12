import pool from "../../../config/db.js";

export async function autoAssignTeachers(schoolId) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const { rows: teachers } = await client.query(
            `SELECT id, name, specialization
             FROM employees
             WHERE schoolid = $1 AND role = 'Teacher' AND status != 'archived'`,
            [schoolId]
        );

        // Build subject → teacher map (first teacher who has that specialization wins)
        const subjectTeacherMap = {};
        teachers.forEach((t) => {
            let specs = [];
            if (t.specialization) {
                try {
                    specs = typeof t.specialization === "string" && t.specialization.startsWith("[")
                        ? JSON.parse(t.specialization)
                        : [t.specialization];
                } catch (e) { specs = [t.specialization]; }
            }
            specs.forEach((s) => {
                if (s && s.trim()) {
                    const key = s.trim().toLowerCase();
                    if (!subjectTeacherMap[key]) {
                        subjectTeacherMap[key] = { id: t.id, name: t.name };
                    }
                }
            });
        });

        const { rows: configs } = await client.query(
            `SELECT * FROM class_config WHERE schoolid = $1`,
            [schoolId]
        );

        let updatedClasses = 0;
        let assignedSubjects = 0;

        for (const cfg of configs) {
            let subjects = [];
            let sections = [];
            try { subjects = typeof cfg.subjects === "string" ? JSON.parse(cfg.subjects) : (cfg.subjects || []); } catch (e) {}
            try { sections = typeof cfg.sections === "string" ? JSON.parse(cfg.sections) : (cfg.sections || []); } catch (e) {}

            let changed = false;

            subjects = subjects.map((sub) => {
                const subKey = (sub.name || "").trim().toLowerCase();
                let matched = subjectTeacherMap[subKey];
                if (!matched) {
                    for (const [key, teacher] of Object.entries(subjectTeacherMap)) {
                        if (subKey.includes(key) || key.includes(subKey)) {
                            matched = teacher;
                            break;
                        }
                    }
                }
                if (matched) {
                    const newSub = { ...sub, teacherId: matched.id };
                    const sectionTeachers = {};
                    sections.forEach((sec) => {
                        const secName = typeof sec === "object" ? sec.name : sec;
                        if (secName) sectionTeachers[secName] = matched.id;
                    });
                    newSub.sectionTeachers = sectionTeachers;
                    changed = true;
                    assignedSubjects++;
                    return newSub;
                }
                return sub;
            });

            // NOTE: cfg.classteacherid comes back lowercase from Postgres (unquoted column)
            let classTeacherId = cfg.classteacherid || null;
            if (sections.length > 0 && typeof sections[0] === "object" && sections[0].classTeacherId) {
                classTeacherId = sections[0].classTeacherId;
            }

            if (changed) {
                await client.query(
                    `UPDATE class_config SET subjects = $1, classteacherid = $2 WHERE id = $3`,
                    [JSON.stringify(subjects), classTeacherId, cfg.id]
                );
                updatedClasses++;
            }
        }

        await client.query("COMMIT");

        return {
            message: "Auto-assignment complete",
            updatedClasses,
            assignedSubjects,
            teacherMap: Object.fromEntries(Object.entries(subjectTeacherMap).map(([k, v]) => [k, v.name]))
        };
    } catch (err) {
        try { await client.query("ROLLBACK"); } catch (e) {}
        throw err;
    } finally {
        client.release();
    }
}


