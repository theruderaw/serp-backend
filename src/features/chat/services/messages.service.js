// services/messages.service.js

import pool from "../../../config/db.js";
import { randomUUID } from "crypto";

export async function getMessages(
    schoolId,
    userId,
    contactId,
    isGroup = false
) {
    const { rows: prefs } = await pool.query(
        `
        SELECT cleared_at
        FROM chat_preferences
        WHERE user_id = $1
          AND contact_id = $2
        `,
        [userId, contactId]
    );

    const clearedAt =
        prefs.length && prefs[0].cleared_at
            ? prefs[0].cleared_at
            : new Date(0);

    if (isGroup) {
        const { rows } = await pool.query(
            `
            SELECT
                m.*,
                COALESCE(s.name, u.name) AS "senderName",
                COALESCE(s.avatar, u.avatar) AS "senderAvatar"
            FROM chat_messages m
            LEFT JOIN students s
                ON m.sender_id = s.id
            LEFT JOIN users u
                ON m.sender_id = u.id
            WHERE m.school_id = $1
              AND m.group_id = $2
              AND m.created_at > $3
            ORDER BY m.created_at ASC
            `,
            [schoolId, contactId, clearedAt]
        );

        return rows;
    }

    const { rows } = await pool.query(
        `
        SELECT *
        FROM chat_messages
        WHERE school_id = $1
          AND group_id IS NULL
          AND (
                (sender_id = $2 AND receiver_id = $3)
             OR (sender_id = $3 AND receiver_id = $2)
          )
          AND created_at > $4
        ORDER BY created_at ASC
        `,
        [schoolId, userId, contactId, clearedAt]
    );

    return rows;
}

export async function sendMessage(body) {
    const {
        schoolId,
        senderId,
        senderRole,
        receiverId,
        receiverRole,
        message,
        attachmentUrl,
        groupId,
    } = body;

    if (!message && !attachmentUrl) {
        throw new Error("Message or attachment required");
    }

    const id = randomUUID();

    await pool.query(
        `
        INSERT INTO chat_messages (
            id,
            school_id,
            sender_id,
            sender_role,
            receiver_id,
            receiver_role,
            message,
            attachment_url,
            group_id
        )
        VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9
        )
        `,
        [
            id,
            schoolId,
            senderId,
            senderRole,
            receiverId ?? null,
            receiverRole ?? null,
            message ?? "",
            attachmentUrl ?? null,
            groupId ?? null,
        ]
    );

    const { rows } = await pool.query(
        `
        SELECT *
        FROM chat_messages
        WHERE id = $1
        `,
        [id]
    );

    return rows[0];
}

export async function markAsRead(
    schoolId,
    userId,
    contactId,
    isGroup = false
) {
    if (isGroup) {
        await pool.query(
            `
            UPDATE chat_messages
            SET is_read = TRUE
            WHERE school_id = $1
              AND group_id = $2
              AND receiver_id = $3
            `,
            [schoolId, contactId, userId]
        );
    } else {
        await pool.query(
            `
            UPDATE chat_messages
            SET is_read = TRUE
            WHERE school_id = $1
              AND receiver_id = $2
              AND sender_id = $3
              AND group_id IS NULL
            `,
            [schoolId, userId, contactId]
        );
    }

    return {
        success: true,
    };
}

export default {
    getMessages,
    sendMessage,
    markAsRead,
};