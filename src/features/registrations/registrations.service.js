import pool from "../../config/db.js";

async function registerSchool(body) {
    const {
        schoolName,
        address,
        studentStrength,
        employeeStrength,
        email,
        mobile,
        contactName,
        contactPosition,
        contactEmail,
        contactPhone,
    } = body;

    const { rows } = await pool.query(
        `
        INSERT INTO school_registrations
        (
            schoolname,
            address,
            studentstrength,
            employeestrength,
            email,
            mobile,
            contactname,
            contactposition,
            contactemail,
            contactphone
        )
        VALUES
        (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10
        )
        RETURNING id
        `,
        [
            schoolName,
            address,
            studentStrength,
            employeeStrength,
            email,
            mobile,
            contactName,
            contactPosition,
            contactEmail,
            contactPhone,
        ]
    );

    return {
        message: "Registration submitted successfully",
        id: rows[0].id,
    };
}

async function getRegistrationRequests() {
    const { rows } = await pool.query(`
        SELECT *
        FROM school_registrations
        ORDER BY createdat DESC
    `);

    return rows;
}

async function updateRegistrationStatus(id, status) {
    await pool.query(
        `
        UPDATE school_registrations
        SET status = $1
        WHERE id = $2
        `,
        [status, id]
    );

    return {
        message: "Status updated successfully",
    };
}

async function approveSchool(id) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const { rows } = await client.query(
            `
            SELECT *
            FROM school_registrations
            WHERE id = $1
            `,
            [id]
        );

        if (!rows.length) {
            throw new Error("Registration not found");
        }

        const reg = rows[0];

        const schoolId = `school-${Date.now()}`;
        const slug = reg.schoolname
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]/g, "");

        await client.query(
            `
            INSERT INTO schools
            (
                id,
                name,
                slug,
                contactemail,
                status,
                plan,
                principal,
                address,
                phone
            )
            VALUES
            (
                $1,$2,$3,$4,$5,$6,$7,$8,$9
            )
            `,
            [
                schoolId,
                reg.schoolname,
                slug,
                reg.email,
                "active",
                "pro",
                reg.contactname,
                reg.address,
                reg.mobile,
            ]
        );

        const adminId = `admin-${schoolId}`;

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
                reg.contactname,
                reg.contactemail,
                "admin123",
                "school_admin",
                schoolId,
                "active",
            ]
        );

        await client.query(
            `
            UPDATE school_registrations
            SET status = 'approved'
            WHERE id = $1
            `,
            [id]
        );

        await client.query("COMMIT");

        return {
            message: "School approved and created successfully",
            credentials: {
                userId: adminId,
                password: "admin123",
                loginUrl: `/${slug}/login`,
            },
        };
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}

export default {
    registerSchool,
    getRegistrationRequests,
    updateRegistrationStatus,
    approveSchool,
};