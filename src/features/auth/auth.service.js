
import pool from "../../config/db.js";


export async function loginUser({ email, name, password, schoolId }) {

    const conditions = [];
    const params = [];

    if (email) {
        params.push(email);
        conditions.push(`email = $${params.length}`);
    }

    if (name) {
        params.push(name);
        conditions.push(`name = $${params.length}`);
    }

    if (conditions.length === 0) {
        return null;
    }

    let query = `
        SELECT *
        FROM users
        WHERE (${conditions.join(" OR ")})
    `;


    if (schoolId) {
        params.push(schoolId);

        query += `
            AND (tenantid = $${params.length} OR role = 'super_admin')
        `;
    }


    const result = await pool.query(query, params);

    const user = result.rows[0];


    if (!user) {
        return null;
    }


    // Replace with bcrypt later
    if (user.password !== password) {
        return null;
    }


    if (user.tenantid && user.role !== "super_admin") {
        await pool.query(
            "SELECT status FROM schools WHERE id = $1",
            [user.tenantid]
        );
    }


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