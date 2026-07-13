import pool from "../../config/db.js";

async function getDrafts(schoolId) {
    const { rows } = await pool.query(
        `
        SELECT *
        FROM enrollment_drafts
        WHERE school_id = $1
        ORDER BY created_at DESC
        `,
        [schoolId]
    );

    return rows;
}

async function createDraft(body) {
    const {
        id,
        schoolId,
        type,
        name,
        data
    } = body;

    const { rows } = await pool.query(
        `
        INSERT INTO enrollment_drafts (
            id,
            school_id,
            type,
            name,
            data
        )
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id)
        DO UPDATE SET
            name = $4,
            data = $5,
            updated_at = CURRENT_TIMESTAMP
        RETURNING id
        `,
        [
            id,
            schoolId,
            type,
            name || "Untitled",
            JSON.stringify(data)
        ]
    );

    return {
        success: true,
        id: rows[0].id
    };
}

async function deleteDraft(id) {
    await pool.query(
        `
        DELETE FROM enrollment_drafts
        WHERE id = $1
        `,
        [id]
    );

    return {
        success: true
    };
}

export default {
    getDrafts,
    createDraft,
    deleteDraft
};