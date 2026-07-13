import pool from "../../config/db.js";


export async function getSettings(schoolId) {
    const { rows } = await pool.query(
        `
        SELECT settingKey, settingValue
        FROM school_settings
        WHERE schoolId = $1
        `,
        [schoolId]
    );

    const settings = {};

    rows.forEach((setting) => {
        try {
            settings[setting.settingkey] =
                typeof setting.settingvalue === "string"
                    ? JSON.parse(setting.settingvalue)
                    : setting.settingvalue;
        } catch {
            settings[setting.settingkey] = setting.settingvalue;
        }
    });

    return settings;
}


export async function getSetting(schoolId, key) {
    const { rows } = await pool.query(
        `
        SELECT settingValue
        FROM school_settings
        WHERE schoolId = $1
        AND settingKey = $2
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


    let value = rows[0].settingvalue;

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
                schoolId,
                settingKey,
                settingValue
            )
            VALUES
            (
                $1,
                $2,
                $3
            )
            ON CONFLICT (schoolId, settingKey)
            DO UPDATE SET
                settingValue = EXCLUDED.settingValue,
                updatedAt = CURRENT_TIMESTAMP
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
        WHERE schoolId = $1
        AND settingKey = $2
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