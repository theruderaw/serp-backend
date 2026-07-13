// services/groups.service.js

import pool from "../../../config/db.js";
import { randomUUID } from "crypto";

export async function createGroup(body) {
    const {
        schoolId,
        name,
        createdBy,
        members = [],
    } = body;

    const groupId = randomUUID();

    await pool.query(
        `
        INSERT INTO chat_groups (
            id,
            school_id,
            name,
            type,
            created_by
        )
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
            groupId,
            schoolId,
            name,
            "custom",
            createdBy,
        ]
    );

    await pool.query(
        `
        INSERT INTO chat_group_members (
            group_id,
            user_id,
            role
        )
        VALUES ($1, $2, $3)
        `,
        [
            groupId,
            createdBy,
            "admin",
        ]
    );

    for (const memberId of members) {
        if (memberId === createdBy) continue;

        await pool.query(
            `
            INSERT INTO chat_group_members (
                group_id,
                user_id,
                role
            )
            VALUES ($1, $2, $3)
            ON CONFLICT (group_id, user_id)
            DO NOTHING
            `,
            [
                groupId,
                memberId,
                "member",
            ]
        );
    }

    return {
        id: groupId,
        name,
        type: "custom",
        role: "custom_group",
        avatar: "",
    };
}

export async function addGroupMembers(groupId, members = []) {
    for (const memberId of members) {
        await pool.query(
            `
            INSERT INTO chat_group_members (
                group_id,
                user_id,
                role
            )
            VALUES ($1, $2, $3)
            ON CONFLICT (group_id, user_id)
            DO NOTHING
            `,
            [
                groupId,
                memberId,
                "member",
            ]
        );
    }

    return {
        success: true,
    };
}

export async function getGroupMembers(groupId) {
    const { rows } = await pool.query(
        `
        SELECT
            m.user_id AS id,
            m.role AS "groupRole",

            COALESCE(s.name, u.name) AS name,
            COALESCE(s.avatar, u.avatar) AS avatar,

            CASE
                WHEN s.id IS NOT NULL
                THEN 'student'
                ELSE u.role
            END AS role,

            c.name AS "className",
            c.section AS "sectionName",

            e.job_title AS "jobTitle"

        FROM chat_group_members m

        LEFT JOIN students s
            ON m.user_id = s.id

        LEFT JOIN classes c
            ON s.class_id = c.id

        LEFT JOIN users u
            ON m.user_id = u.id

        LEFT JOIN employees e
            ON u.id = e.id

        WHERE m.group_id = $1
          AND (
                s.status = 'active'
             OR u.status = 'active'
          )
        `,
        [groupId]
    );

    return rows;
}

export async function removeGroupMember(
    groupId,
    userId
) {
    await pool.query(
        `
        DELETE FROM chat_group_members
        WHERE group_id = $1
          AND user_id = $2
          AND role <> 'admin'
        `,
        [
            groupId,
            userId,
        ]
    );

    return {
        success: true,
    };
}

export default {
    createGroup,
    addGroupMembers,
    getGroupMembers,
    removeGroupMember,
};