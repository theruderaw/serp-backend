
import pool from "../../config/db.js";


import bcrypt from "bcrypt";

export async function loginUser({ email, name, password, schoolId }) {
    const conditions = [];
    const params = [];

    if (email) {
        params.push(email);
        conditions.push(`u.email = $${params.length}`);
    }

    if (name) {
        params.push(name);
        conditions.push(`u.name = $${params.length}`);
    }

    if (conditions.length === 0) {
        return null;
    }

    let query = `
        SELECT
            u.*,
            r.name AS role_name,
            r.permissions
        FROM users u
        JOIN roles r
            ON r.id = u.role_id
        WHERE (${conditions.join(" OR ")})
          AND u.is_active = TRUE
    `;

    if (schoolId) {
        params.push(schoolId);

        query += `
            AND (
                u.school_id = $${params.length}
                OR r.name = 'super_admin'
            )
        `;
    }

    const { rows } = await pool.query(query, params);
    const user = rows[0];

    if (!user) {
        return null;
    }

    if (!user.password) {
        return null;
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
        return null;
    }

    if (user.school_id && user.role_name !== "super_admin") {
        const { rows: schoolRows } = await pool.query(
            `SELECT status FROM schools WHERE id = $1`,
            [user.school_id]
        );

        if (!schoolRows.length || schoolRows[0].status !== "active") {
            return null;
        }
    }

    delete user.password;

    return user;
}


export async function getUserProfile(userId) {

    const result = await pool.query(
        "SELECT * FROM users WHERE id = $1",
        [userId]
    );

    return result.rows[0];
}



export async function resetUserPassword(userId) {

    const result = await pool.query(
        "SELECT role FROM users WHERE id = $1",
        [userId]
    );

    const user = result.rows[0];

    if (!user) {
        return null;
    }


    let defaultPassword = "Welcome123";

    if (user.role === "school_admin") {
        defaultPassword = "admin123";
    }
    else if (user.role === "employee") {
        defaultPassword = "staff123";
    }
    else if (user.role === "student") {
        defaultPassword = "student123";
    }


    await pool.query(
        "UPDATE users SET password = $1 WHERE id = $2",
        [defaultPassword, userId]
    );


    return {
        message: `Password reset to default for ${user.role}`,
        defaultPassword
    };
}



export async function updateUserPermissions(userId, permissions) {

    await pool.query(
        "UPDATE users SET permissions = $1 WHERE id = $2",
        [
            JSON.stringify(permissions),
            userId
        ]
    );

}