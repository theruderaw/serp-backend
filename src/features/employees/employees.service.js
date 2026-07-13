import pool from "../../config/db.js";

const validEmployeeColumns = [
    "registrationNo",
    "employeeType",
    "department",
    "jobTitle",
    "joiningDate",
    "name",
    "gender",
    "dob",
    "bloodGroup",
    "maritalStatus",
    "mobile",
    "email",
    "phone",
    "aadhaarNumber",
    "panNumber",
    "customJobTitle",
    "qualification",
    "experience",
    "specialization",
    "shift",
    "salary",
    "bankAccountNumber",
    "ifscCode",
    "address",
    "permanentAddress",
    "state",
    "district",
    "city",
    "pincode",
    "emergencyContact",
    "emergencyRelation",
    "height",
    "weight",
    "fatherName",
    "motherName",
    "spouseName",
    "documents",
    "avatar",
    "status",
    "schoolId",
    "role",
];

async function getEmployees() {
    const { rows } = await pool.query(`
        SELECT *
        FROM employees
    `);

    return rows;
}

async function generateEmployeeId(schoolId) {
    const { rows: settingsRows } = await pool.query(
        `
        SELECT value
        FROM settings
        WHERE schoolid = $1
        AND key = 'staff_settings'
        `,
        [schoolId]
    );

    let format = null;

    if (settingsRows.length > 0) {
        try {
            const settings =
                typeof settingsRows[0].value === "string"
                    ? JSON.parse(settingsRows[0].value)
                    : settingsRows[0].value;

            if (
                settings &&
                settings.employeeIdFormat &&
                typeof settings.employeeIdFormat === "object"
            ) {
                format = settings.employeeIdFormat;
            }
        } catch {}
    }

    if (!format) {
        format = {
            blocks: [
                { type: "text", value: "EMP" },
                { type: "year", value: "YYYY" },
                { type: "sequence", length: 4 },
            ],
            separators: ["-", "-"],
        };
    }

    const date = new Date();

    const yy = String(date.getFullYear()).slice(2);
    const yyyy = String(date.getFullYear());
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    let prefix = "";
    let pattern = "";
    let seqIndex = -1;
    let seqLength = 4;

    format.blocks.forEach((block, index) => {
        let str = "";
        let isSequence = false;

        switch (block.type) {
            case "text":
                str = block.value || "";
                break;
            case "year":
                str = block.value === "YY" ? yy : yyyy;
                break;
            case "month":
                str = mm;
                break;
            case "date":
                str = dd;
                break;
            case "sequence":
                isSequence = true;
                seqIndex = index;
                seqLength = Number(block.length) || 4;
                str = "%";
                break;
        }

        if (!isSequence && seqIndex === -1) {
            prefix += str;
        }

        pattern += str;

        if (index < format.blocks.length - 1) {
            const separator = format.separators[index] || "";

            if (seqIndex === -1) {
                prefix += separator;
            }

            pattern += separator;
        }
    });

    const { rows } = await pool.query(
        `
        SELECT registrationno
        FROM employees
        WHERE schoolid = $1
        AND registrationno LIKE $2
        `,
        [schoolId, pattern]
    );

    let maxSequence = 0;

    rows.forEach((row) => {
        if (!row.registrationno) return;

        const remainder = row.registrationno.substring(prefix.length);
        const number = remainder.split(/[^0-9]/)[0];

        const value = Number(number);

        if (!Number.isNaN(value) && value > maxSequence) {
            maxSequence = value;
        }
    });

    const nextSequence = String(maxSequence + 1).padStart(seqLength, "0");

    let generatedId = "";

    format.blocks.forEach((block, index) => {
        let str = "";

        switch (block.type) {
            case "text":
                str = block.value || "";
                break;
            case "year":
                str = block.value === "YY" ? yy : yyyy;
                break;
            case "month":
                str = mm;
                break;
            case "date":
                str = dd;
                break;
            case "sequence":
                str = nextSequence;
                break;
        }

        generatedId += str;

        if (index < format.blocks.length - 1) {
            generatedId += format.separators[index] || "";
        }
    });

    return {
        generatedId,
    };
}

async function getEmployeeDetail(id) {
    const { rows } = await pool.query(
        `
        SELECT *
        FROM employees
        WHERE id = $1
        `,
        [id]
    );

    if (!rows.length) {
        throw new Error("Employee not found");
    }

    const employee = rows[0];

    if (employee.metadata) {
        employee.metadata = JSON.parse(employee.metadata);
    }

    if (employee.documents) {
        employee.documents = JSON.parse(employee.documents);
    }

    return employee;
}

async function getSchoolEmployees(schoolId, query) {
    const { type, search, status } = query;

    let sql = `
        SELECT *
        FROM employees
        WHERE schoolid = $1
    `;

    const values = [schoolId];
    let index = 2;

    if (status) {
        sql += ` AND status = $${index}`;
        values.push(status);
        index++;
    } else {
        sql += ` AND status != 'archived'`;
    }

    if (type && type !== "all") {
        if (type === "teaching") {
            sql += ` AND role = 'Teacher'`;
        } else {
            sql += ` AND role != 'Teacher'`;
        }
    }

    if (search) {
        sql += `
            AND (
                name ILIKE $${index}
                OR registrationno ILIKE $${index}
                OR email ILIKE $${index}
            )
        `;

        values.push(`%${search}%`);
        index++;
    }

    sql += `
        ORDER BY name ASC
    `;

    const { rows } = await pool.query(sql, values);

    return rows;
}

async function createEmployee(body) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const userId = `emp-${Date.now()}`;
        const schoolId = body.schoolId;
        const name = body.name || "Unknown";
        const email = body.email || `${userId}@erp.com`;

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
            VALUES ($1,$2,$3,$4,$5,$6,$7)
            `,
            [
                userId,
                name,
                email,
                "emp123",
                "employee",
                schoolId,
                "active",
            ]
        );

        const columns = ["id"];
        const placeholders = ["$1"];
        const values = [userId];

        let parameter = 2;

        for (const [key, value] of Object.entries(body)) {
            if (!validEmployeeColumns.includes(key)) continue;

            columns.push(key);

            if (key === "documents") {
                values.push(JSON.stringify(value));
            } else {
                values.push(value);
            }

            placeholders.push(`$${parameter++}`);
        }

        await client.query(
            `
            INSERT INTO employees
            (${columns.join(", ")})
            VALUES (${placeholders.join(", ")})
            `,
            values
        );

        await client.query("COMMIT");

        return {
            id: userId,
            message: "Employee added correctly",
        };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

async function updateEmployee(id, body) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const updates = [];
        const values = [];

        let parameter = 1;

        for (const [key, value] of Object.entries(body)) {
            if (!validEmployeeColumns.includes(key)) continue;

            updates.push(`${key} = $${parameter++}`);

            if (key === "documents") {
                values.push(JSON.stringify(value));
            } else {
                values.push(value);
            }
        }

        if (!updates.length) {
            await client.query("ROLLBACK");

            return {
                message: "No changes made",
            };
        }

        values.push(id);

        await client.query(
            `
            UPDATE employees
            SET ${updates.join(", ")}
            WHERE id = $${parameter}
            `,
            values
        );

        const userUpdates = [];
        const userValues = [];
        let userParameter = 1;

        if (body.name !== undefined) {
            userUpdates.push(`name = $${userParameter++}`);
            userValues.push(body.name);
        }

        if (body.email !== undefined) {
            userUpdates.push(`email = $${userParameter++}`);
            userValues.push(body.email);
        }

        if (body.avatar !== undefined) {
            userUpdates.push(`avatar = $${userParameter++}`);
            userValues.push(body.avatar);
        }

        if (userUpdates.length) {
            userValues.push(id);

            await client.query(
                `
                UPDATE users
                SET ${userUpdates.join(", ")}
                WHERE id = $${userParameter}
                `,
                userValues
            );
        }

        await client.query("COMMIT");

        return {
            message: "Employee updated successfully",
        };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

async function deleteEmployee(id, remark = "Archived") {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await client.query(
            `
            UPDATE employees
            SET
                status = $1,
                archive_remark = $2
            WHERE id = $3
            `,
            ["archived", remark, id]
        );

        await client.query(
            `
            UPDATE users
            SET status = $1
            WHERE id = $2
            `,
            ["inactive", id]
        );

        await client.query("COMMIT");

        return {
            message: "Employee archived",
        };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export default {
    getEmployees,
    generateEmployeeId,
    getEmployeeDetail,
    getSchoolEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
};