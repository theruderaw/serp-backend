import pool from "../../../config/db.js";

// ═══════════════ HOLIDAYS ═══════════════

export async function getHolidays(schoolId) {
    const { rows } = await pool.query(
        `SELECT * FROM holiday_list WHERE schoolid = $1 ORDER BY holidaydate`,
        [schoolId]
    );
    return rows;
}

export async function createHoliday(body) {
    const { schoolId, holidayDate, dayName, holidayName } = body;

    const { rows } = await pool.query(
        `INSERT INTO holiday_list (schoolid, holidaydate, dayname, holidayname)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [schoolId, holidayDate, dayName, holidayName]
    );

    return { id: rows[0].id, message: "Holiday added" };
}

export async function deleteHoliday(id) {
    await pool.query(`DELETE FROM holiday_list WHERE id = $1`, [id]);
    return { message: "Holiday deleted" };
}