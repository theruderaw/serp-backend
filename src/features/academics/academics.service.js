import pool from '../../config/db.js';

// Auto-add capacity column if not exists
const initTables = async () => {
    try {
        await pool.query("ALTER TABLE classes ADD COLUMN capacity INT DEFAULT 40");
    } catch (e) {
        // column already exists (or other non-fatal error) - ignore, matches original behavior
    }
};
initTables();

// ---------- Classes ----------

async function getClassesFlat(schoolId) {
    const { rows } = await pool.query(
        'SELECT * FROM classes WHERE schoolId = $1 ORDER BY grade, name, section',
        [schoolId]
    );
    return rows;
}

async function getClassesHierarchy(schoolId) {
    const { rows } = await pool.query(
        'SELECT * FROM classes WHERE schoolId = $1 ORDER BY grade, name, section',
        [schoolId]
    );

    const hierarchy = [];
    rows.forEach(row => {
        let cls = hierarchy.find(c => c.name === row.name);
        if (!cls) {
            cls = { name: row.name, grade: row.grade, stream: row.stream || 'None', sections: [] };
            hierarchy.push(cls);
        }
        cls.sections.push({
            id: row.id,
            name: row.section,
            capacity: row.capacity || 40,
            studentCount: row.studentCount || 0,
            teacherId: row.teacherId
        });
    });

    return hierarchy;
}

async function saveClassHierarchy(schoolId, { name, grade, stream, sections }) {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        for (const sec of sections) {
            // Check if class already exists with this name and section for legacy and seeding compatibility
            const [existing] = await conn.query(
                'SELECT id FROM classes WHERE schoolId = ? AND name = ? AND section = ?',
                [schoolId, name, sec.name]
            );

            const clsId = (existing && existing.length > 0)
                ? existing[0].id
                : `cls-${schoolId.split('-').pop() || '0'}-${name.replace(/\s+/g, '')}-${sec.name}`;

            const params = [clsId, name, sec.name, grade || 0, schoolId, sec.teacherId || null, sec.capacity || 40, stream || 'None'];
            console.log('PARAMS:', params);

            await conn.query(
                `INSERT INTO classes (id, name, section, grade, schoolId, teacherId, studentCount, capacity, stream) 
                 VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
                 ON DUPLICATE KEY UPDATE capacity=VALUES(capacity), grade=VALUES(grade), stream=VALUES(stream)`,
                [clsId, name, sec.name, grade || 0, schoolId, sec.teacherId || null, sec.capacity || 40, stream || 'None']
            );

            // Also insert into sections table to maintain legacy compatibility
            await conn.query(
                `INSERT IGNORE INTO sections (id, classId, name, studentCount, status) VALUES (?, ?, ?, 0, 'active')`,
                [`sec-${clsId}`, clsId, sec.name]
            );
        }

        await conn.commit();
    } catch (error) {
        console.error('ORIGINAL QUERY ERROR:', error);
        try { await conn.rollback(); } catch (e) { }
        throw error;
    } finally {
        conn.release();
    }
}

async function deleteClass(schoolId, className) {
    await pool.query('DELETE FROM classes WHERE schoolId = ? AND name = ?', [schoolId, className]);
}

// ---------- Attendance ----------

async function getStudentAttendance(schoolId) {
    const { rows } = await pool.query('SELECT * FROM attendance_students WHERE schoolId = $1', [schoolId]);
    return rows;
}

async function getTodayAttendanceSummary(schoolId) {
    const todayStr = new Date().toISOString().split('T')[0];

    // Student stats
    const { rows: [{ totalstudents }] } = await pool.query(
        `SELECT COUNT(*) as totalstudents FROM students WHERE schoolid = $1 AND status = 'active'`,
        [schoolId]
    );
    const { rows: [{ presentstudents }] } = await pool.query(
        `SELECT COUNT(*) as presentstudents FROM attendance_students WHERE schoolid = $1 AND date = $2 AND (status = 'present' OR status = 'Present')`,
        [schoolId, todayStr]
    );

    // Employee stats
    const { rows: [{ totalemployees }] } = await pool.query(
        `SELECT COUNT(*) as totalemployees FROM employees WHERE schoolid = $1 AND status = 'Active'`,
        [schoolId]
    );
    const { rows: [{ presentemployees }] } = await pool.query(
        `SELECT COUNT(*) as presentemployees FROM attendance_employees WHERE schoolid = $1 AND date = $2 AND (status = 'present' OR status = 'Present')`,
        [schoolId, todayStr]
    );

    return {
        students: {
            present: Number(presentstudents) || 0,
            total: Number(totalstudents) || 0
        },
        employees: {
            present: Number(presentemployees) || 0,
            total: Number(totalemployees) || 0
        }
    };
}

// ---------- Marks ----------

async function getMarks(studentId) {
    const [rows] = await pool.query('SELECT * FROM marks WHERE studentId = ?', [studentId]);
    return rows;
}

// ---------- Homework ----------

async function getHomework(classId) {
    const [rows] = await pool.query('SELECT * FROM homework WHERE classId = ?', [classId]);
    return rows;
}

export default {
    getClassesFlat,
    getClassesHierarchy,
    saveClassHierarchy,
    deleteClass,
    getStudentAttendance,
    getTodayAttendanceSummary,
    getMarks,
    getHomework
};