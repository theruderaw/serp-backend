import pool from "../../config/db.js";

async function getAttendanceSettings(schoolId) {
    const { rows } = await pool.query(
        `
        SELECT
            id,
            classname,
            attendanceconfig
        FROM class_config
        WHERE schoolid = $1
        ORDER BY classname
        `,
        [schoolId]
    );

    return rows.map((cls) => {
        let config = { type: "Day Wise" };

        if (cls.attendanceconfig) {
            try {
                config =
                    typeof cls.attendanceconfig === "string"
                        ? JSON.parse(cls.attendanceconfig)
                        : cls.attendanceconfig;
            } catch (_) {}
        }

        return {
            classId: cls.id,
            className: cls.classname,
            attendanceConfig: config,
        };
    });
}

async function updateAttendanceSettings(schoolId, body) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const { settings } = body;

        for (const setting of settings) {
            await client.query(
                `
                UPDATE class_config
                SET attendanceconfig = $1
                WHERE id = $2
                  AND schoolid = $3
                `,
                [
                    JSON.stringify(setting.attendanceConfig),
                    setting.classId,
                    schoolId,
                ]
            );
        }

        await client.query("COMMIT");

        return {
            message: "Attendance settings updated successfully",
        };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

async function getStudentAttendance(schoolId, query) {
    const { date, classId, attendanceType } = query;

    let sql = `
        SELECT
            a.*,
            s.name,
            s.rollno
        FROM attendance_students a
        JOIN students s
            ON a.studentid = s.id
        WHERE a.schoolid = $1
    `;

    const params = [schoolId];
    let index = 2;

    if (date) {
        sql += ` AND a.date = $${index++}`;
        params.push(date);
    }

    if (classId && classId !== "All") {
        sql += ` AND s.classid = $${index++}`;
        params.push(classId);
    }

    if (attendanceType) {
        sql += ` AND a.attendancetype = $${index++}`;
        params.push(attendanceType);
    }

    const { rows } = await pool.query(sql, params);

    return rows;
}

async function getStudentAttendanceReport(schoolId, query) {
    const { startDate, endDate, classId, studentId } = query;

    let sql = `
        SELECT
            a.*,
            s.name,
            s.rollno
        FROM attendance_students a
        JOIN students s
            ON a.studentid = s.id
        WHERE a.schoolid = $1
    `;

    const params = [schoolId];
    let index = 2;

    if (startDate && endDate) {
        sql += ` AND a.date >= $${index++} AND a.date <= $${index++}`;
        params.push(startDate, endDate);
    }

    if (classId && classId !== "All") {
        sql += ` AND s.classid = $${index++}`;
        params.push(classId);
    }

    if (studentId) {
        sql += ` AND a.studentid = $${index++}`;
        params.push(studentId);
    }

    const { rows } = await pool.query(sql, params);

    return rows;
}

async function markStudentAttendance(body) {
    const { records } = body;

    if (!records || records.length === 0) {
        return {
            message: "No records to save",
        };
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        for (const record of records) {
            await client.query(
                `
                INSERT INTO attendance_students (
                    studentid,
                    schoolid,
                    date,
                    status,
                    remark,
                    markedby,
                    attendancetype,
                    editedby
                )
                VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8
                )
                ON CONFLICT (
                    studentid,
                    schoolid,
                    date,
                    attendancetype
                )
                DO UPDATE SET
                    status = EXCLUDED.status,
                    remark = EXCLUDED.remark,
                    editedby = EXCLUDED.editedby
                `,
                [
                    record.studentId,
                    record.schoolId,
                    record.date,
                    record.status,
                    record.remark || "",
                    record.markedBy || null,
                    record.attendanceType || "Daily",
                    record.editedBy || record.markedBy || null,
                ]
            );
        }

        await client.query("COMMIT");

        return {
            message: "Student attendance saved successfully",
        };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

async function getEmployeeAttendance(schoolId, query) {
    const { date, attendanceType } = query;

    let sql = `
        SELECT
            a.*,
            e.name,
            e.role
        FROM attendance_employees a
        JOIN employees e
            ON a.employeeid = e.id
        WHERE a.schoolid = $1
    `;

    const params = [schoolId];
    let index = 2;

    if (date) {
        sql += ` AND a.date = $${index++}`;
        params.push(date);
    }

    if (attendanceType) {
        sql += ` AND a.attendancetype = $${index++}`;
        params.push(attendanceType);
    }

    const { rows } = await pool.query(sql, params);

    return rows;
}

async function getEmployeeAttendanceReport(schoolId, query) {
    const { startDate, endDate, employeeId } = query;

    let sql = `
        SELECT
            a.*,
            e.name,
            e.role
        FROM attendance_employees a
        JOIN employees e
            ON a.employeeid = e.id
        WHERE a.schoolid = $1
    `;

    const params = [schoolId];
    let index = 2;

    if (startDate && endDate) {
        sql += ` AND a.date >= $${index++} AND a.date <= $${index++}`;
        params.push(startDate, endDate);
    }

    if (employeeId) {
        sql += ` AND a.employeeid = $${index++}`;
        params.push(employeeId);
    }

    const { rows } = await pool.query(sql, params);

    return rows;
}

async function markEmployeeAttendance(body) {
    const { records } = body;

    if (!records || records.length === 0) {
        return {
            message: "No records to save",
        };
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        for (const record of records) {
            await client.query(
                `
                INSERT INTO attendance_employees (
                    employeeid,
                    schoolid,
                    date,
                    status,
                    remark,
                    markedby,
                    attendancetype,
                    editedby
                )
                VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8
                )
                ON CONFLICT (
                    employeeid,
                    schoolid,
                    date,
                    attendancetype
                )
                DO UPDATE SET
                    status = EXCLUDED.status,
                    remark = EXCLUDED.remark,
                    editedby = EXCLUDED.editedby
                `,
                [
                    record.employeeId,
                    record.schoolId,
                    record.date,
                    record.status,
                    record.remark || "",
                    record.markedBy || null,
                    record.attendanceType || "Morning",
                    record.editedBy || record.markedBy || null,
                ]
            );
        }

        await client.query("COMMIT");

        return {
            message: "Employee attendance saved successfully",
        };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export default {
    getAttendanceSettings,
    updateAttendanceSettings,
    getStudentAttendance,
    getStudentAttendanceReport,
    markStudentAttendance,
    getEmployeeAttendance,
    getEmployeeAttendanceReport,
    markEmployeeAttendance,
};