import pool from "../../config/db.js";

const DEFAULT_SUBJECTS = [
    "Hindi",
    "English",
    "Mathematics",
    "Science",
    "Social Studies (SST)",
    "Computer Science",
    "Physical Education (PE)",
    "Art & Craft",
    "Music",
    "Sanskrit",
    "EVS",
    "General Knowledge (GK)",
    "Moral Science",
    "Physics",
    "Chemistry",
    "Biology",
    "History",
    "Geography",
    "Civics",
    "Economics",
    "Accountancy",
    "Business Studies",
    "Political Science",
    "Home Science",
    "Drawing",
    "Yoga",
    "Value Education"
];

const DEFAULT_LABS = [
    "Science Lab",
    "Computer Lab",
    "Language Lab",
    "Maths Lab",
    "Physics Lab",
    "Chemistry Lab",
    "Biology Lab",
    "Home Science Lab"
];


async function getSubjects(schoolId) {
    const { rows } = await pool.query(
        `
        SELECT *
        FROM school_subjects
        WHERE schoolId = $1
        AND isActive = 1
        ORDER BY type, sortOrder, name
        `,
        [schoolId]
    );

    return rows;
}


async function createSubject(body) {
    const {
        schoolId,
        name,
        code = null,
        type = "subject",
        category = "General",
        color = "#4f46e5",
        sortOrder = 0
    } = body;

    const { rows } = await pool.query(
        `
        INSERT INTO school_subjects
        (
            schoolId,
            name,
            code,
            type,
            category,
            color,
            sortOrder
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        ON CONFLICT (schoolId, name, type)
        DO NOTHING
        RETURNING id
        `,
        [
            schoolId,
            name.trim(),
            code,
            type,
            category,
            color,
            sortOrder
        ]
    );

    return {
        id: rows[0]?.id ?? null,
        message: "Subject added"
    };
}


async function updateSubject(id, body) {
    const {
        name,
        code = null,
        category = "General",
        color = "#4f46e5",
        sortOrder = 0
    } = body;

    await pool.query(
        `
        UPDATE school_subjects
        SET
            name = $1,
            code = $2,
            category = $3,
            color = $4,
            sortOrder = $5
        WHERE id = $6
        `,
        [
            name,
            code,
            category,
            color,
            sortOrder,
            id
        ]
    );

    return {
        message: "Updated"
    };
}


async function deleteSubject(id) {
    await pool.query(
        `
        UPDATE school_subjects
        SET isActive = 0
        WHERE id = $1
        `,
        [id]
    );

    return {
        message: "Deleted"
    };
}


async function seedSubjects(schoolId) {
    let added = 0;

    for (let i = 0; i < DEFAULT_SUBJECTS.length; i++) {
        const { rowCount } = await pool.query(
            `
            INSERT INTO school_subjects
            (
                schoolId,
                name,
                type,
                sortOrder
            )
            VALUES ($1,$2,'subject',$3)
            ON CONFLICT (schoolId, name, type)
            DO NOTHING
            `,
            [
                schoolId,
                DEFAULT_SUBJECTS[i],
                i
            ]
        );

        added += rowCount;
    }


    for (let i = 0; i < DEFAULT_LABS.length; i++) {
        const { rowCount } = await pool.query(
            `
            INSERT INTO school_subjects
            (
                schoolId,
                name,
                type,
                sortOrder
            )
            VALUES ($1,$2,'lab',$3)
            ON CONFLICT (schoolId, name, type)
            DO NOTHING
            `,
            [
                schoolId,
                DEFAULT_LABS[i],
                i
            ]
        );

        added += rowCount;
    }

    return {
        message: `Seeded ${added} subjects/labs`,
        added
    };
}


async function seedAllSubjects() {
    const { rows: schools } = await pool.query(
        `
        SELECT id
        FROM schools
        `
    );

    let total = 0;

    for (const school of schools) {
        const result = await seedSubjects(school.id);
        total += result.added;
    }


    const { rows: classConfigs } = await pool.query(
        `
        SELECT *
        FROM class_config
        `
    );


    for (const cfg of classConfigs) {
        try {
            const subjects =
                typeof cfg.subjects === "string"
                    ? JSON.parse(cfg.subjects)
                    : (cfg.subjects || []);


            const { rows: schoolSubjects } = await pool.query(
                `
                SELECT name
                FROM school_subjects
                WHERE schoolId = $1
                AND type = 'subject'
                AND isActive = 1
                `,
                [cfg.schoolId]
            );


            const validNames = schoolSubjects.map(
                subject => subject.name.toLowerCase()
            );


            const matched = subjects.filter(subject => {
                const name = (subject.name || "").toLowerCase();

                return validNames.some(
                    valid =>
                        valid.includes(name) ||
                        name.includes(valid.split(" ")[0])
                );
            });


            if (matched.length !== subjects.length) {
                await pool.query(
                    `
                    UPDATE class_config
                    SET subjects = $1
                    WHERE id = $2
                    `,
                    [
                        JSON.stringify(
                            matched.length > 0
                                ? matched
                                : subjects
                        ),
                        cfg.id
                    ]
                );
            }

        } catch {}
    }


    return {
        message: `Seeded ${total} subjects/labs across ${schools.length} schools`
    };
}


export default {
    getSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
    seedSubjects,
    seedAllSubjects
};