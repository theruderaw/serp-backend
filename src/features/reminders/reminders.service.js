import pool from "../../config/db.js";

async function getReminders(schoolId) {
    const { rows } = await pool.query(
        `
        SELECT *
        FROM reminders
        WHERE schoolid = $1
        AND isread = FALSE
        ORDER BY createdat DESC
        `,
        [schoolId]
    );

    return rows;
}

async function createReminder(body) {
    const { schoolId, message } = body;

    await pool.query(
        `
        INSERT INTO reminders
        (
            schoolid,
            message
        )
        VALUES
        (
            $1,
            $2
        )
        `,
        [schoolId, message]
    );

    return {
        message: "Reminder sent successfully",
    };
}

async function markReminderRead(id) {
    await pool.query(
        `
        UPDATE reminders
        SET isread = TRUE
        WHERE id = $1
        `,
        [id]
    );

    return {
        message: "Reminder marked as read",
    };
}

export default {
    getReminders,
    createReminder,
    markReminderRead,
};