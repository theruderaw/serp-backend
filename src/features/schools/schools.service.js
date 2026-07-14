import pool from "../../config/db.js";

async function getSchools() {
    const { rows } = await pool.query(`
        SELECT
            s.*,
            COALESCE(st.cnt, 0) AS "studentCount",
            COALESCE(em.cnt, 0) AS "employeeCount",
            COALESCE(cl.cnt, 0) AS "classCount"
        FROM schools s
        LEFT JOIN (
            SELECT schoolid, COUNT(*) AS cnt
            FROM students
            GROUP BY schoolid
        ) st ON st.schoolid = s.id
        LEFT JOIN (
            SELECT school_id, COUNT(*) AS cnt
            FROM employees
            GROUP BY school_id
        ) em ON em.school_id = s.id
        LEFT JOIN (
            SELECT schoolid, COUNT(*) AS cnt
            FROM classes
            GROUP BY schoolid
        ) cl ON cl.schoolid = s.id
        ORDER BY s.name ASC
    `);

    return rows;
}

async function getSchool(id) {
    const { rows } = await pool.query(
        `
        SELECT *
        FROM schools
        WHERE id = $1
        `,  
        [id]
    );

    if (!rows.length) {
        return null;
    }

    const school = rows[0];

    const { rows: modules } = await pool.query(
        `
        SELECT moduleid
        FROM school_modules
        WHERE schoolid = $1
        AND status = 'active'
        `,
        [id]
    );

    school.activeModules = modules.map((m) => m.moduleid);

    if (typeof school.features === "string") {
        try {
            school.features = JSON.parse(school.features);
        } catch {
            school.features = [];
        }
    }

    if (!school.features) {
        school.features = [];
    }

    if (typeof school.workingdays === "string") {
        try {
            school.workingdays = JSON.parse(school.workingdays);
        } catch {
            school.workingdays = [];
        }
    }

    if (!school.logo) {
        try {
            const { rows: settings } = await pool.query(
                `
                SELECT settingvalue
                FROM school_settings
                WHERE schoolid = $1
                AND settingkey = 'school_details'
                `,
                [id]
            );

            if (settings.length) {
                let details = settings[0].settingvalue;

                if (typeof details === "string") {
                    details = JSON.parse(details);
                }

                if (details?.logo) {
                    school.logo = details.logo;

                    await pool.query(
                        `
                        UPDATE schools
                        SET logo = $1
                        WHERE id = $2
                        `,
                        [details.logo, id]
                    );
                }
            }
        } catch {}
    }

    return school;
}

async function getSchoolBySlug(slug) {
    const { rows } = await pool.query(
        `
        SELECT *
        FROM schools
        WHERE slug = $1
        `,
        [slug]
    );

    if (!rows.length) {
        return null;
    }

    const school = rows[0];

    const { rows: modules } = await pool.query(
        `
        SELECT moduleid
        FROM school_modules
        WHERE schoolid = $1
        AND status = 'active'
        `,
        [school.id]
    );

    school.activeModules = modules.map((m) => m.moduleid);

    if (typeof school.features === "string") {
        try {
            school.features = JSON.parse(school.features);
        } catch {
            school.features = [];
        }
    }

    if (!school.features) {
        school.features = [];
    }

    if (typeof school.workingdays === "string") {
        try {
            school.workingdays = JSON.parse(school.workingdays);
        } catch {
            school.workingdays = [];
        }
    }

    return school;
}

async function getSchoolUsers(schoolId) {
    const { rows } = await pool.query(
        `
        SELECT
            id,
            name,
            role,
            avatar
        FROM users
        WHERE tenantid = $1
        AND role != 'super_admin'
        AND status = 'active'
        `,
        [schoolId]
    );

    return rows;
}

async function createSchool(body) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const id = `school-${Date.now()}`;
        const slug = body.name
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");

        const joinedDate = new Date().toISOString().split("T")[0];

        const adminUsername =
            "admin@" + body.name.toLowerCase().replace(/\s+/g, "");

        const adminPassword = "admin123";

        await client.query(
            `
            INSERT INTO schools
            (
                id,
                name,
                slug,
                logo,
                contactemail,
                status,
                plan,
                studentcount,
                employeecount,
                theme,
                joineddate,
                address,
                phone,
                principal,
                established,
                website,
                academicyear
            )
            VALUES
            (
                $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
                $11,$12,$13,$14,$15,$16,$17
            )
            `,
            [
                id,
                body.name,
                slug,
                body.logo ?? null,
                body.contactEmail,
                "active",
                body.plan || "basic",
                0,
                0,
                "light",
                joinedDate,
                body.address ?? null,
                body.phone ?? null,
                body.principal ?? null,
                body.established ?? null,
                body.website ?? null,
                body.academicYear ?? null,
            ]
        );

        const adminId = `admin-${id}`;

        await client.query(
            `
            INSERT INTO users
            (
                id,
                name,
                email,
                password,
                role,
                tenantid,
                status
            )
            VALUES
            (
                $1,$2,$3,$4,$5,$6,$7
            )
            `,
            [
                adminId,
                "School Principal",
                adminUsername,
                adminPassword,
                "school_admin",
                id,
                "active",
            ]
        );

        const { rows: modules } = await client.query(`
            SELECT id
            FROM modules
            WHERE status = 'active'
        `);

        for (const module of modules) {
            await client.query(
                `
                INSERT INTO school_modules
                (
                    schoolid,
                    moduleid,
                    status
                )
                VALUES
                (
                    $1,$2,$3
                )
                `,
                [id, module.id, "active"]
            );
        }

        await client.query("COMMIT");

        return {
            id,
            slug,
            ...body,
            adminUsername,
            adminPassword,
        };
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}

async function getSchoolModules(schoolId) {
    const { rows } = await pool.query(
        `
        SELECT
            m.*,
            COALESCE(sm.status, 'inactive') AS "activeStatus"
        FROM modules m
        LEFT JOIN school_modules sm
            ON m.id = sm.moduleid
            AND sm.schoolid = $1
        `,
        [schoolId]
    );

    return rows;
}

async function toggleSchoolModule(schoolId, body) {
    const { moduleId, status } = body;

    await pool.query(
        `
        INSERT INTO school_modules
        (
            schoolid,
            moduleid,
            status
        )
        VALUES
        (
            $1,$2,$3
        )
        ON CONFLICT (schoolid, moduleid)
        DO UPDATE SET status = EXCLUDED.status
        `,
        [schoolId, moduleId, status]
    );

    return {
        success: true,
    };
}

async function updateSchoolStatus(id, status) {
    await pool.query(
        `
        UPDATE schools
        SET status = $1
        WHERE id = $2
        `,
        [status, id]
    );

    return {
        success: true,
    };
}

async function updateSchool(id, body) {
    await pool.query(
        `
        UPDATE schools
        SET
            name = $1,
            slug = $2,
            logo = $3,
            contactemail = $4,
            principal = $5,
            established = $6,
            address = $7,
            phone = $8,
            website = $9,
            academicyear = $10,
            workingdays = $11,
            loginbackground = $12,
            plan = $13
        WHERE id = $14
        `,
        [
            body.name,
            body.slug,
            body.logo,
            body.contactEmail,
            body.principal,
            body.established,
            body.address,
            body.phone,
            body.website,
            body.academicYear,
            JSON.stringify(body.workingDays || []),
            body.loginBackground,
            body.plan || "basic",
            id,
        ]
    );

    return {
        success: true,
    };
}

async function resetAdminPassword(schoolId) {
    const { rows } = await pool.query(
        `
        SELECT id
        FROM users
        WHERE tenantid = $1
        AND role = 'school_admin'
        LIMIT 1
        `,
        [schoolId]
    );

    if (!rows.length) {
        throw new Error("School admin not found for this school");
    }

    const adminId = rows[0].id;
    const defaultPassword = "admin123";

    await pool.query(
        `
        UPDATE users
        SET password = $1
        WHERE id = $2
        `,
        [defaultPassword, adminId]
    );

    return {
        message: "admin password reset to admin123",
        defaultPassword,
    };
}

export default {
    getSchools,
    getSchool,
    getSchoolBySlug,
    getSchoolUsers,
    createSchool,
    getSchoolModules,
    toggleSchoolModule,
    updateSchoolStatus,
    updateSchool,
    resetAdminPassword,
};