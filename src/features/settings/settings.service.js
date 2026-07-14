import pool from "../../config/db.js";


export async function getSettings(schoolId) {
    const { rows } = await pool.query(
        `
        SELECT setting_key, setting_value
        FROM school_settings
        WHERE school_id = $1
        `,
        [schoolId]
    );

    const settings = {};

    rows.forEach((setting) => {
        try {
            settings[setting.setting_key] =
                typeof setting.setting_value === "string"
                    ? JSON.parse(setting.setting_value)
                    : setting.setting_value;
        } catch {
            settings[setting.setting_key] = setting.setting_value;
        }
    });

    return settings;
}


export async function getSetting(schoolId, key) {
    const { rows } = await pool.query(
        `
        SELECT setting_value
        FROM school_settings
        WHERE school_id = $1
        AND setting_key = $2
        `,
        [
            schoolId,
            key
        ]
    );


    if (rows.length === 0) {
        return {
            value: null
        };
    }


    let value = rows[0].setting_value;

    try {
        value =
            typeof value === "string"
                ? JSON.parse(value)
                : value;
    } catch {}


    return {
        value
    };
}


export async function saveSetting(schoolId, key, value) {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");


        await client.query(
            `
            INSERT INTO school_settings
            (
                school_id,
                setting_key,
                setting_value
            )
            VALUES
            (
                $1,
                $2,
                $3
            )
            ON CONFLICT (school_id, setting_key)
            DO UPDATE SET
                setting_value = EXCLUDED.setting_value,
                updated_at = CURRENT_TIMESTAMP
            `,
            [
                schoolId,
                key,
                JSON.stringify(value)
            ]
        );


        // Sync school details to schools table
        if (key === "school_details" && value) {

            const updates = [];
            const params = [];


            if (value.logo !== undefined) {
                params.push(value.logo || null);
                updates.push(`logo = $${params.length}`);
            }


            if (value.schoolName) {
                params.push(value.schoolName);
                updates.push(`name = $${params.length}`);
            }


            if (updates.length > 0) {

                params.push(schoolId);


                await client.query(
                    `
                    UPDATE schools
                    SET ${updates.join(", ")}
                    WHERE id = $${params.length}
                    `,
                    params
                );
            }
        }


        await client.query("COMMIT");


        return {
            message: "Setting saved successfully"
        };


    } catch (error) {

        await client.query("ROLLBACK");
        throw error;

    } finally {

        client.release();

    }
}


export async function deleteSetting(schoolId, key) {

    await pool.query(
        `
        DELETE FROM school_settings
        WHERE school_id = $1
        AND setting_key = $2
        `,
        [
            schoolId,
            key
        ]
    );


    return {
        message: "Setting deleted"
    };
}

export async function getSchoolDetails(schoolId) {
    const schoolSql = `
        SELECT
            id,
            name,
            logo,
            login_background
        FROM schools
        WHERE id = $1;
    `;

    const settingsSql = `
        SELECT
            setting_key,
            setting_value
        FROM school_settings
        WHERE school_id = $1;
    `;

    const [{ rows: schoolRows }, { rows: settingRows }] = await Promise.all([
        pool.query(schoolSql, [schoolId]),
        pool.query(settingsSql, [schoolId]),
    ]);

    if (!schoolRows.length) {
        return null;
    }

    const school = schoolRows[0];

    const settings = {};

    for (const row of settingRows) {
        settings[row.setting_key] = row.setting_value;
    }

    return {
        schoolName: school.name,
        logo: school.logo,
        loginBg: school.login_background,
        loginShowLogo: settings.login_show_logo !== false,
        loginShowName: settings.login_show_name !== false,
    };
}