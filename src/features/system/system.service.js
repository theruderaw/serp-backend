import pool from "../../config/db.js";


async function getModules() {
    const { rows } = await pool.query(
        `
        SELECT *
        FROM modules
        `
    );

    return rows;
}


async function toggleModule(id) {

    const { rows } = await pool.query(
        `
        SELECT status
        FROM modules
        WHERE id = $1
        `,
        [id]
    );


    if (rows.length === 0) {
        throw new Error("Module not found");
    }


    const newStatus =
        rows[0].status === "active"
            ? "disabled"
            : "active";


    await pool.query(
        `
        UPDATE modules
        SET status = $1
        WHERE id = $2
        `,
        [
            newStatus,
            id
        ]
    );


    return {
        success: true,
        status: newStatus
    };
}


async function getGlobalStats() {

    const { rows } = await pool.query(
        `
        SELECT
            (SELECT COUNT(*) FROM schools) AS totalSchools,
            (SELECT COUNT(*) FROM schools WHERE status = 'active') AS activeSchools,
            (SELECT COUNT(*) FROM students WHERE status != 'archived') AS totalStudents,
            (SELECT COUNT(*) FROM employees WHERE status != 'archived') AS totalEmployees
        `
    );


    return rows[0];
}


async function getSchoolStats(schoolId) {

    const { rows } = await pool.query(
        `
        SELECT
            (
                SELECT COUNT(*)
                FROM students
                WHERE schoolId = $1
                AND status != 'archived'
            ) AS totalStudents,

            (
                SELECT COUNT(*)
                FROM employees
                WHERE schoolId = $2
                AND status != 'archived'
            ) AS totalEmployees,

            (
                SELECT COUNT(*)
                FROM classes
                WHERE schoolId = $3
            ) AS totalClasses,

            (
                SELECT COUNT(*)
                FROM notices
                WHERE schoolId = $4
            ) AS activeNotices
        `,
        [
            schoolId,
            schoolId,
            schoolId,
            schoolId
        ]
    );


    return rows[0];
}


export default {
    getModules,
    toggleModule,
    getGlobalStats,
    getSchoolStats
};