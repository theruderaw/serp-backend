import pool from "../../config/db.js";

async function getTotalBilling() {
    const { rows } = await pool.query(`
        SELECT
            COALESCE(SUM(amount), 0) AS "totalAmount",
            COUNT(*) AS "schoolCount"
        FROM billing
    `);

    return rows[0];
}

async function getStudentFees(studentId) {
    const { rows } = await pool.query(
        `
        SELECT *
        FROM fee_structures
        WHERE studentid = $1
        LIMIT 1
        `,
        [studentId]
    );

    return rows[0] || {
        status: "pending",
        amount: 0,
    };
}

async function getBilling(schoolId) {
    const { rows } = await pool.query(
        `
        SELECT *
        FROM billing
        WHERE schoolid = $1
        `,
        [schoolId]
    );

    return rows;
}

async function getFees(schoolId) {
    const { rows } = await pool.query(
        `
        SELECT *
        FROM fee_structures
        WHERE schoolid = $1
        `,
        [schoolId]
    );

    return rows;
}

async function getStats(schoolId) {
    const { rows } = await pool.query(
        `
        SELECT
            COALESCE(SUM(amount),0) AS "totalReceivables",

            (
                SELECT COUNT(*)
                FROM students
                WHERE schoolid = $1
                AND feestatus = 'paid'
            ) AS "paidCount",

            (
                SELECT COUNT(*)
                FROM students
                WHERE schoolid = $1
                AND feestatus = 'pending'
            ) AS "pendingCount"

        FROM fee_structures
        WHERE schoolid = $1
        `,
        [schoolId]
    );

    return rows[0] || {
        totalReceivables: 0,
        paidCount: 0,
        pendingCount: 0,
    };
}

async function getSalary(employeeId) {
    const { rows } = await pool.query(
        `
        SELECT *
        FROM salary_slips
        WHERE employeeid = $1
        `,
        [employeeId]
    );

    return rows;
}

async function createFeePayment(body) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const {
            schoolId,
            studentId,
            amount,
            paymentMode,
            month,
            remarks,
            feeDetails,
        } = body;

        const id = `FEE-${Date.now()}`;
        const receiptNo = `REC-${Date.now().toString().slice(-6)}`;

        await client.query(
            `
            INSERT INTO fee_payments
            (
                id,
                schoolid,
                studentid,
                receiptno,
                amount,
                paymentdate,
                paymentmode,
                month,
                remarks,
                feedetails
            )
            VALUES
            (
                $1,$2,$3,$4,$5,CURRENT_DATE,$6,$7,$8,$9
            )
            `,
            [
                id,
                schoolId,
                studentId,
                receiptNo,
                amount,
                paymentMode,
                month,
                remarks,
                JSON.stringify(feeDetails),
            ]
        );

        await client.query(
            `
            UPDATE students
            SET feestatus = 'paid'
            WHERE id = $1
            `,
            [studentId]
        );

        await client.query("COMMIT");

        return {
            success: true,
            receiptNo,
            id,
        };
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}

async function updateFeePayment(id, body) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const {
            amountToAdd,
            updatedFeeDetails,
            updatedMonthString,
        } = body;

        const { rows } = await client.query(
            `
            SELECT *
            FROM fee_payments
            WHERE id = $1
            `,
            [id]
        );

        if (!rows.length) {
            throw new Error("Not found");
        }

        const existing = rows[0];

        const newAmount =
            Number(existing.amount) + Number(amountToAdd);

        const newMonth =
            updatedMonthString ?? existing.month;

        await client.query(
            `
            UPDATE fee_payments
            SET
                amount = $1,
                feedetails = $2,
                month = $3
            WHERE id = $4
            `,
            [
                newAmount,
                JSON.stringify(updatedFeeDetails),
                newMonth,
                id,
            ]
        );

        await client.query("COMMIT");

        return {
            success: true,
            receiptNo: existing.receiptno,
        };
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}

async function getStudentFeePayments(
    schoolId,
    studentId
) {
    const { rows } = await pool.query(
        `
        SELECT *
        FROM fee_payments
        WHERE schoolid = $1
        AND studentid = $2
        ORDER BY createdat DESC
        `,
        [schoolId, studentId]
    );

    return rows;
}

async function getSchoolFeePayments(schoolId) {
    const { rows } = await pool.query(
        `
        SELECT
            fp.*,
            s.name AS "studentName",
            s.rollno,
            c.name AS "className"
        FROM fee_payments fp
        JOIN students s
            ON fp.studentid = s.id
        LEFT JOIN classes c
            ON s.classid = c.id
        WHERE fp.schoolid = $1
        ORDER BY fp.createdat DESC
        `,
        [schoolId]
    );

    return rows;
}

export default {
    getTotalBilling,
    getStudentFees,
    getBilling,
    getFees,
    getStats,
    getSalary,
    createFeePayment,
    updateFeePayment,
    getStudentFeePayments,
    getSchoolFeePayments,
};