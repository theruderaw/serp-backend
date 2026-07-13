// services/settings.service.js

import pool from "../../../config/db.js";

export async function getChatSettings(schoolId) {
    const { rows } = await pool.query(
        `
        SELECT setting_value
        FROM school_settings
        WHERE school_id = $1
          AND setting_key = $2
        `,
        [schoolId, "chat_settings"]
    );

    if (rows.length > 0) {
        try {
            return typeof rows[0].setting_value === "string"
                ? JSON.parse(rows[0].setting_value)
                : rows[0].setting_value;
        } catch (_) {}
    }

    return {
        studentConnectWith: "all",
        studentCanCreateGroup: false,
        enableAttachmentStudent: true,
        enableAttachmentStaff: true,
        enableLinksStudent: true,
        enableLinksStaff: true,
    };
}

export default {
    getChatSettings,
};