// services/preferences.service.js

import pool from "../../../config/db.js";

export async function updatePreferences(body) {
    const {
        userId,
        contactId,
        action,
    } = body;

    await pool.query(
        `
        INSERT INTO chat_preferences (
            user_id,
            contact_id
        )
        VALUES ($1, $2)
        ON CONFLICT (user_id, contact_id)
        DO NOTHING
        `,
        [
            userId,
            contactId,
        ]
    );

    switch (action) {
        case "pin":
            await pool.query(
                `
                UPDATE chat_preferences
                SET is_pinned = TRUE
                WHERE user_id = $1
                  AND contact_id = $2
                `,
                [
                    userId,
                    contactId,
                ]
            );
            break;

        case "unpin":
            await pool.query(
                `
                UPDATE chat_preferences
                SET is_pinned = FALSE
                WHERE user_id = $1
                  AND contact_id = $2
                `,
                [
                    userId,
                    contactId,
                ]
            );
            break;

        case "clear":
            await pool.query(
                `
                UPDATE chat_preferences
                SET cleared_at = NOW()
                WHERE user_id = $1
                  AND contact_id = $2
                `,
                [
                    userId,
                    contactId,
                ]
            );
            break;

        case "delete":
            await pool.query(
                `
                UPDATE chat_preferences
                SET
                    cleared_at = NOW(),
                    deleted_at = NOW(),
                    is_pinned = FALSE
                WHERE user_id = $1
                  AND contact_id = $2
                `,
                [
                    userId,
                    contactId,
                ]
            );
            break;

        default:
            throw new Error("Invalid preference action");
    }

    return {
        success: true,
    };
}

export default {
    updatePreferences,
};