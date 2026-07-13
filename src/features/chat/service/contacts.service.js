// services/contacts.service.js

import pool from "../../../config/db.js";
import { getChatSettings } from "./settings.service.js";

export async function getContacts(schoolId, userId, role) {
    const { rows: historyRows } = await pool.query(
        `
        SELECT
            CASE
                WHEN sender_id = $1 THEN receiver_id
                ELSE sender_id
            END AS contact_id,
            MAX(created_at) AS last_message_at
        FROM chat_messages
        WHERE school_id = $2
          AND group_id IS NULL
          AND (sender_id = $1 OR receiver_id = $1)
        GROUP BY contact_id
        `,
        [userId, schoolId]
    );

    const { rows: prefs } = await pool.query(
        `
        SELECT
            contact_id,
            is_pinned,
            deleted_at,
            cleared_at
        FROM chat_preferences
        WHERE user_id = $1
        `,
        [userId]
    );

    const prefMap = {};
    for (const pref of prefs) {
        prefMap[pref.contact_id] = pref;
    }

    const contactIds = [];

    for (const row of historyRows) {
        const pref = prefMap[row.contact_id];

        if (
            !pref?.deleted_at ||
            new Date(row.last_message_at) > new Date(pref.deleted_at)
        ) {
            contactIds.push(row.contact_id);
        }
    }

    let contacts = [];

    if (contactIds.length > 0) {
        const { rows: students } = await pool.query(
            `
            SELECT
                s.id,
                s.name,
                s.avatar,
                'student' AS role,
                c.name AS "className",
                c.section AS "sectionName"
            FROM students s
            LEFT JOIN classes c
                ON s.class_id = c.id
            WHERE s.id = ANY($1)
              AND s.status = 'active'
            `,
            [contactIds]
        );

        const { rows: staff } = await pool.query(
            `
            SELECT
                u.id,
                u.name,
                u.avatar,
                u.role,
                e.job_title AS "jobTitle"
            FROM users u
            LEFT JOIN employees e
                ON u.id = e.id
            WHERE u.id = ANY($1)
              AND u.status = 'active'
            `,
            [contactIds]
        );

        contacts = [...students, ...staff];
    }

    if (role !== "student") {
        const { rows: groups } = await pool.query(
            `
            SELECT
                g.id,
                g.name,
                g.type,
                'custom_group' AS role,
                '' AS avatar
            FROM chat_groups g
            JOIN chat_group_members m
                ON g.id = m.group_id
            WHERE g.school_id = $1
              AND m.user_id = $2
            `,
            [schoolId, userId]
        );

        contacts.push(...groups);
    }

    const { rows: unreadRows } = await pool.query(
        `
        SELECT
            sender_id,
            group_id,
            COUNT(*)::int AS count
        FROM chat_messages
        WHERE school_id = $1
          AND receiver_id = $2
          AND is_read = FALSE
        GROUP BY sender_id, group_id
        `,
        [schoolId, userId]
    );

    const unreadMap = {};

    for (const row of unreadRows) {
        if (row.group_id) {
            unreadMap[row.group_id] = row.count;
        } else {
            unreadMap[row.sender_id] = row.count;
        }
    }

    contacts = contacts
        .map((contact) => {
            const pref = prefMap[contact.id];

            return {
                ...contact,
                unreadCount: unreadMap[contact.id] || 0,
                isPinned: pref?.is_pinned ?? false,
                clearedAt: pref?.cleared_at ?? null,
            };
        })
        .filter((contact) => {
            if (
                contact.role === "custom_group" ||
                contact.role === "class_group"
            ) {
                const pref = prefMap[contact.id];

                if (contact.unreadCount > 0) {
                    return true;
                }

                if (pref?.deleted_at) {
                    return false;
                }
            }

            return true;
        });

    return contacts;
}

export async function searchContacts(
    schoolId,
    userId,
    role,
    q,
    classId
) {
    const settings = await getChatSettings(schoolId);

    const search = q ? `%${q}%` : "%";

    let contacts = [];

    if (role === "student") {
        const { rows: studentRows } = await pool.query(
            `
            SELECT class_id, section_id
            FROM students
            WHERE id = $1
            `,
            [userId]
        );

        if (!studentRows.length) {
            throw new Error("Student not found");
        }

        const { class_id, section_id } = studentRows[0];

        if (settings.studentConnectWith === "all") {
            const { rows } = await pool.query(
                `
                SELECT
                    s.id,
                    s.name,
                    s.avatar,
                    'student' AS role,
                    c.name AS "className",
                    c.section AS "sectionName"
                FROM students s
                LEFT JOIN classes c
                    ON s.class_id = c.id
                WHERE s.school_id = $1
                  AND s.id <> $2
                  AND s.status = 'active'
                  AND s.name ILIKE $3
                LIMIT 50
                `,
                [schoolId, userId, search]
            );

            contacts.push(...rows);
        }

        // continue with classmates/section/staff...
    } else {
        // continue with staff search...
    }

    return contacts;
}

export async function getUnreadCount(schoolId, userId) {
    const { rows } = await pool.query(
        `
        SELECT COUNT(*)::int AS count
        FROM chat_messages
        WHERE school_id = $1
          AND receiver_id = $2
          AND is_read = FALSE
        `,
        [schoolId, userId]
    );

    return {
        count: rows[0].count,
    };
}

export default {
    getContacts,
    searchContacts,
    getUnreadCount,
};