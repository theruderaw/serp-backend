import pool from "../../../config/db.js";

async function grantClassTeacherPermissions(teacherId) {
    if (!teacherId) return;
    try {
        const { rows } = await pool.query(
            `SELECT permissions FROM users WHERE id = $1`,
            [teacherId]
        );
        if (rows.length === 0) return;

        let perms = [];
        if (typeof rows[0].permissions === "string") {
            try { perms = JSON.parse(rows[0].permissions); } catch (e) {}
        } else if (Array.isArray(rows[0].permissions)) {
            perms = rows[0].permissions;
        }

        const requiredPerms = [
            "manage_students",
            "manage_exams",
            "attendance_own_class",
            "idcard_settings",
            "notification_own_class"
        ];
        const newPerms = [...new Set([...perms, ...requiredPerms])];

        await pool.query(
            `UPDATE users SET permissions = $1 WHERE id = $2`,
            [JSON.stringify(newPerms), teacherId]
        );
    } catch (err) {
        console.error("Error granting CT perms:", err);
    }
}

async function processTeacherPermissions(classTeacherId, sections) {
    const allTeacherIds = new Set();
    if (classTeacherId) allTeacherIds.add(classTeacherId);
    if (sections && Array.isArray(sections)) {
        sections.forEach((s) => {
            if (s && s.classTeacherId) allTeacherIds.add(s.classTeacherId);
        });
    }
    for (const tId of allTeacherIds) {
        await grantClassTeacherPermissions(tId);
    }
}


export async function seedClassConfig() {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const { rows: schools } = await client.query(`SELECT id FROM schools`);

        const exams = [
            { name: "Unit Test 1" },
            { name: "Unit Test 2" },
            { name: "Unit Test 3" },
            { name: "Mid Term Exam" },
            { name: "End Term Exam" }
        ];

        const defaultMarks = {
            "Unit Test 1": 20,
            "Unit Test 2": 20,
            "Unit Test 3": 20,
            "Mid Term Exam": 50,
            "End Term Exam": 100
        };

        const createSubject = (name, teacherId = null) => ({
            name,
            teacherId,
            examMarks: { ...defaultMarks }
        });

        const subUpto5 = ["Science", "SST", "English", "Hindi", "Maths", "Sanskrit", "Computer", "Game", "Drawing"];
        const sub6to10 = [...subUpto5, "Science Lab 1", "Science Lab 2", "Science Lab 3"];
        const sub11_12_sec1 = ["Physics", "Chemistry", "Maths", "English", "Hindi", "Computer"];
        const sub11_12_sec2 = ["Physics", "Chemistry", "Biology", "English", "Hindi", "PHE"];
        const sub11_12_sec3 = ["Geography", "Civics", "Economics", "Hindi", "English", "History"];

        for (const school of schools) {
            const schoolId = school.id;

            const { rows: teachers } = await client.query(
                `SELECT id FROM employees WHERE schoolid = $1 AND role = 'Teacher'`,
                [schoolId]
            );
            const teacherIds = teachers.map((t) => t.id);
            const getRndTeacher = () =>
                teacherIds.length > 0 ? teacherIds[Math.floor(Math.random() * teacherIds.length)] : null;

            // Clear old configs
            await client.query(`DELETE FROM class_config WHERE schoolid = $1`, [schoolId]);

            // Get unique classes grouped by name and stream
            // NOTE: MySQL's GROUP_CONCAT → Postgres's string_agg
            const { rows: classes } = await client.query(
                `SELECT name, stream, string_agg(section, ',') AS sections
                 FROM classes
                 WHERE schoolid = $1
                 GROUP BY name, stream`,
                [schoolId]
            );

            for (const cls of classes) {
                const className = cls.name;
                const stream = cls.stream || "None";
                const sectionsList = cls.sections ? cls.sections.split(",").sort() : ["A"];
                let subjects = [];

                if (["Nursery", "LKG", "UKG", "Prep", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5"].includes(className)) {
                    subjects = subUpto5.map((s) => createSubject(s, getRndTeacher()));
                } else if (["Class 6", "Class 7", "Class 8", "Class 9", "Class 10"].includes(className)) {
                    subjects = sub6to10.map((s) => createSubject(s, getRndTeacher()));
                } else if (["Class 11", "Class 12"].includes(className)) {
                    if (stream === "Science" || sectionsList.includes("S")) {
                        subjects = sub11_12_sec1.map((s) => createSubject(s, getRndTeacher()));
                    } else if (stream === "Commerce" || sectionsList.includes("C")) {
                        subjects = sub11_12_sec2.map((s) => createSubject(s, getRndTeacher()));
                    } else if (stream === "Arts" || sectionsList.includes("A")) {
                        subjects = sub11_12_sec3.map((s) => createSubject(s, getRndTeacher()));
                    } else {
                        subjects = sub11_12_sec1.map((s) => createSubject(s, getRndTeacher()));
                    }
                } else {
                    subjects = subUpto5.map((s) => createSubject(s, getRndTeacher()));
                }

                await client.query(
                    `INSERT INTO class_config (schoolid, classname, stream, sections, subjects, exams)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [schoolId, className, stream, JSON.stringify(sectionsList), JSON.stringify(subjects), JSON.stringify(exams)]
                );
            }
        }

        await client.query("COMMIT");
        return { message: "Class config seeded successfully" };
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}

// ═══════════════ CLASS CONFIG ═══════════════

export async function getClasses(schoolId) {
    const { rows } = await pool.query(
        `SELECT * FROM class_config WHERE schoolid = $1 ORDER BY classname`,
        [schoolId]
    );

    rows.forEach((r) => {
        try { r.sections = typeof r.sections === "string" ? JSON.parse(r.sections) : r.sections; } catch (e) { r.sections = []; }
        try { r.subjects = typeof r.subjects === "string" ? JSON.parse(r.subjects) : r.subjects; } catch (e) { r.subjects = []; }
        try { r.exams = typeof r.exams === "string" ? JSON.parse(r.exams) : r.exams; } catch (e) { r.exams = []; }

        if (Array.isArray(r.sections)) {
            r.sectionNames = r.sections.map((s) => (typeof s === "object" ? s.name : s)).filter(Boolean);
        } else {
            r.sectionNames = [];
            r.sections = [];
        }
    });

    return rows;
}

export async function createClass(body) {
    const { schoolId, className, stream, sections, subjects, exams, color, classTeacherId } = body;

    const { rows } = await pool.query(
        `INSERT INTO class_config
            (schoolid, classname, stream, sections, subjects, exams, color, classteacherid)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [
            schoolId,
            className,
            stream || "NA",
            JSON.stringify(sections || []),
            JSON.stringify(subjects || []),
            JSON.stringify(exams || []),
            color || "#1e293b",
            classTeacherId || null
        ]
    );

    await processTeacherPermissions(classTeacherId, sections);

    return { id: rows[0].id, message: "Class created" };
}

export async function updateClass(id, body) {
    const { className, stream, sections, subjects, exams, color, classTeacherId } = body;

    await pool.query(
        `UPDATE class_config
         SET classname = $1, stream = $2, sections = $3, subjects = $4, exams = $5, color = $6, classteacherid = $7
         WHERE id = $8`,
        [
            className,
            stream || "NA",
            JSON.stringify(sections || []),
            JSON.stringify(subjects || []),
            JSON.stringify(exams || []),
            color || "#1e293b",
            classTeacherId || null,
            id
        ]
    );

    await processTeacherPermissions(classTeacherId, sections);

    return { message: "Class updated" };
}

export async function deleteClass(id) {
    await pool.query(`DELETE FROM class_config WHERE id = $1`, [id]);
    await pool.query(`DELETE FROM timetable_config WHERE classconfigid = $1`, [id]);
    return { message: "Class deleted" };
}