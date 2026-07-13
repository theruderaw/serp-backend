import pool from "../../config/db.js";

async function getNotices(schoolId, query) {
    const { role, userId, classId } = query;

    const { rows } = await pool.query(
        `
        SELECT *
        FROM notices
        WHERE schoolid = $1
        ORDER BY createdat DESC
        `,
        [schoolId]
    );

    let filtered = rows;

    if (role && userId) {
        filtered = rows.filter((notice) => {
            if (!notice.targetaudience) {
                if (!notice.targettype || notice.targettype === "all") {
                    return true;
                }

                if (
                    role === "student" &&
                    (
                        notice.targettype === "students" ||
                        (
                            notice.targettype === "class" &&
                            notice.targetid === classId
                        )
                    )
                ) {
                    return true;
                }

                if (
                    role !== "student" &&
                    notice.targettype === "employees"
                ) {
                    return true;
                }

                return false;
            }

            let audience = notice.targetaudience;

            if (typeof audience === "string") {
                try {
                    audience = JSON.parse(audience);
                } catch {
                    return true;
                }
            }

            if (audience.all) {
                return true;
            }

            if (role === "student" || role === "parent") {
                if (audience.students?.all) {
                    return true;
                }

                if (
                    classId &&
                    audience.students?.classIds?.includes(classId)
                ) {
                    return true;
                }

                if (
                    audience.students?.ids?.includes(userId)
                ) {
                    return true;
                }
            } else {
                if (audience.staff?.all) {
                    return true;
                }

                if (
                    audience.staff?.ids?.includes(userId)
                ) {
                    return true;
                }
            }

            return false;
        });
    }

    return filtered;
}

async function createNotice(body) {
    const {
        schoolId,
        title,
        message,
        priority,
        targetType,
        targetId,
        createdBy,
        link,
        fileUrl,
        targetAudience,
    } = body;

    const id = `not-${Date.now()}`;

    await pool.query(
        `
        INSERT INTO notices (
            id,
            schoolid,
            title,
            message,
            targettype,
            targetid,
            createdby,
            priority,
            link,
            fileurl,
            targetaudience
        )
        VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11
        )
        `,
        [
            id,
            schoolId,
            title,
            message,
            targetType || "all",
            targetId || null,
            createdBy,
            priority || "medium",
            link || null,
            fileUrl || null,
            targetAudience
                ? JSON.stringify(targetAudience)
                : null,
        ]
    );

    return {
        id,
        message: "Notice created successfully",
    };
}

async function deleteNotice(id) {
    await pool.query(
        `
        DELETE FROM notices
        WHERE id = $1
        `,
        [id]
    );

    return {
        message: "Notice deleted",
    };
}

async function getMessages(schoolId) {
    const { rows } = await pool.query(
        `
        SELECT *
        FROM messages
        WHERE schoolid = $1
        `,
        [schoolId]
    );

    return rows;
}

async function createMessage(body) {
    const id = `msg-${Date.now()}`;

    await pool.query(
        `
        INSERT INTO messages (
            id,
            schoolid,
            type,
            subject,
            body,
            recipients,
            sentby,
            sentat,
            status
        )
        VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9
        )
        `,
        [
            id,
            body.schoolId,
            body.type,
            body.subject,
            body.body,
            JSON.stringify(body.recipients),
            body.sentBy,
            new Date(),
            "delivered",
        ]
    );

    return {
        id,
        ...body,
    };
}

export default {
    getNotices,
    createNotice,
    deleteNotice,
    getMessages,
    createMessage,
};