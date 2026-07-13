import pool from "../../config/db.js";


const validStudentColumns = [
    "name",
    "middleName",
    "lastName",
    "gender",
    "dob",
    "bloodGroup",
    "category",
    "religion",
    "nationality",
    "aadhaarNumber",
    "mobile",
    "email",
    "phone",
    "admissionDate",
    "sessionYear",
    "classId",
    "section",
    "rollNo",
    "enrollmentNo",
    "schoolId",
    "previousSchool",
    "previousBoard",
    "previousClass",
    "previousPercentage",
    "medium",
    "stream",
    "course",
    "semester",
    "fatherName",
    "fatherMobile",
    "fatherContact",
    "fatherOccupation",
    "motherName",
    "motherMobile",
    "motherContact",
    "motherOccupation",
    "guardianName",
    "guardianRelation",
    "guardianMobile",
    "annualIncome",
    "parentContact",
    "contactNumber",
    "address",
    "permanentAddress",
    "state",
    "district",
    "city",
    "pincode",
    "busRequired",
    "route",
    "pickupPoint",
    "hostelRequired",
    "hostelRoom",
    "admissionFee",
    "tuitionFee",
    "scholarship",
    "discount",
    "paymentMode",
    "transactionId",
    "height",
    "weight",
    "guardianEmail",
    "emergencyContact",
    "avatar",
    "feeStatus",
    "academicStatus",
    "status"
];


export async function getStudentsGlobal() {
    const { rows } = await pool.query(
        `
        SELECT *
        FROM students
        `
    );

    return rows;
}


export async function generateStudentId(schoolId) {

    const { rows: settingsRows } = await pool.query(
        `
        SELECT value
        FROM settings
        WHERE schoolId = $1
        AND key = 'student_settings'
        `,
        [schoolId]
    );


    let format = null;


    if (settingsRows.length > 0) {

        try {

            const setting =
                typeof settingsRows[0].value === "string"
                    ? JSON.parse(settingsRows[0].value)
                    : settingsRows[0].value;


            if (
                setting &&
                setting.admissionNoFormat &&
                typeof setting.admissionNoFormat === "object"
            ) {
                format = setting.admissionNoFormat;
            }

        } catch {}

    }


    if (!format) {

        format = {
            blocks: [
                {
                    type: "text",
                    value: "ADM"
                },
                {
                    type: "year",
                    value: "YYYY"
                },
                {
                    type: "sequence",
                    length: 4
                }
            ],
            separators: [
                "-",
                "-"
            ]
        };

    }


    const date = new Date();

    const yy = String(date.getFullYear()).slice(2);
    const yyyy = String(date.getFullYear());
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");


    let prefix = "";
    let pattern = "";
    let sequenceLength = 4;
    let sequenceStarted = false;


    format.blocks.forEach((block, index) => {

        let value = "";


        if (block.type === "text") {
            value = block.value || "";
        }

        else if (block.type === "year") {
            value = block.value === "YY"
                ? yy
                : yyyy;
        }

        else if (block.type === "month") {
            value = mm;
        }

        else if (block.type === "date") {
            value = dd;
        }

        else if (block.type === "sequence") {

            value = "%";
            sequenceStarted = true;

            sequenceLength =
                parseInt(block.length) || 4;
        }


        if (!sequenceStarted) {
            prefix += value;
        }


        pattern += value;


        if (index < format.blocks.length - 1) {

            const separator =
                format.separators[index] || "";


            if (!sequenceStarted) {
                prefix += separator;
            }


            pattern += separator;
        }

    });



    const { rows } = await pool.query(
        `
        SELECT enrollmentNo
        FROM students
        WHERE schoolId = $1
        AND enrollmentNo LIKE $2
        `,
        [
            schoolId,
            pattern
        ]
    );


    let maxSequence = 0;


    rows.forEach(student => {

        if (!student.enrollmentno) {
            return;
        }


        const remaining =
            student.enrollmentno.substring(
                prefix.length
            );


        const number =
            parseInt(
                remaining.split(/[^0-9]/)[0],
                10
            );


        if (!isNaN(number) && number > maxSequence) {
            maxSequence = number;
        }

    });



    const nextSequence =
        String(maxSequence + 1)
            .padStart(sequenceLength, "0");



    let generatedId = "";


    format.blocks.forEach((block, index) => {

        let value = "";


        if (block.type === "text") {
            value = block.value || "";
        }

        else if (block.type === "year") {
            value = block.value === "YY"
                ? yy
                : yyyy;
        }

        else if (block.type === "month") {
            value = mm;
        }

        else if (block.type === "date") {
            value = dd;
        }

        else if (block.type === "sequence") {
            value = nextSequence;
        }


        generatedId += value;


        if (index < format.blocks.length - 1) {
            generatedId +=
                format.separators[index] || "";
        }

    });


    return {
        generatedId
    };
}


export async function getStudentDetail(id) {

    const { rows } = await pool.query(
        `
        SELECT
            s.*,
            cc.className
        FROM students s
        LEFT JOIN class_config cc
            ON s.classId = cc.id
        WHERE s.id = $1
        `,
        [id]
    );


    if (rows.length === 0) {
        throw new Error("Student not found");
    }


    const student = rows[0];


    if (
        student.metadata &&
        typeof student.metadata === "string"
    ) {
        student.metadata =
            JSON.parse(student.metadata);
    }


    if (
        student.documents &&
        typeof student.documents === "string"
    ) {
        student.documents =
            JSON.parse(student.documents);
    }


    return student;
}

export async function getStudentFilters(schoolId) {

    const { rows: streams } = await pool.query(
        `
        SELECT DISTINCT stream
        FROM students
        WHERE schoolId = $1
        AND stream IS NOT NULL
        AND stream != 'None'
        `,
        [schoolId]
    );


    const { rows: feeStatuses } = await pool.query(
        `
        SELECT DISTINCT feeStatus
        FROM students
        WHERE schoolId = $1
        AND feeStatus IS NOT NULL
        `,
        [schoolId]
    );


    const { rows: academicStatuses } = await pool.query(
        `
        SELECT DISTINCT academicStatus
        FROM students
        WHERE schoolId = $1
        AND academicStatus IS NOT NULL
        `,
        [schoolId]
    );


    return {
        streams: streams.map(row => row.stream),
        feeStatuses: feeStatuses.map(row => row.feestatus),
        academicStatuses: academicStatuses.map(row => row.academicstatus)
    };
}



export async function getStudentDashboard(id) {

    const { rows } = await pool.query(
        `
        SELECT
            s.*,
            c.name AS className,
            c.section AS sectionName
        FROM students s
        LEFT JOIN classes c
            ON s.classId = c.id
        WHERE s.id = $1
        `,
        [id]
    );


    if (rows.length === 0) {
        throw new Error("Student not found");
    }


    const student = rows[0];


    return {
        student: {
            ...student,
            section: student.sectionname
        },
        attendance: {
            present: 0,
            total: 0
        },
        fees: {
            total: 0,
            paid: 0
        },
        recentMarks: [],
        latestHomework: []
    };
}



export async function getStudents(
    schoolId,
    filters
) {

    const {
        className,
        section,
        stream,
        feeStatus,
        academicStatus,
        search,
        classId,
        status
    } = filters;


    let query = `
        SELECT
            s.*,
            c.name AS className,
            c.section AS classSection
        FROM students s
        LEFT JOIN classes c
            ON s.classId = c.id
        WHERE s.schoolId = $1
    `;


    const params = [
        schoolId
    ];


    if (status) {

        params.push(status);

        query += `
            AND s.status = $${params.length}
        `;

    } else {

        query += `
            AND s.status != 'archived'
        `;

    }



    if (classId && classId !== "All") {

        params.push(classId);

        query += `
            AND s.classId = $${params.length}
        `;

    }



    if (className && className !== "All") {

        params.push(className);

        query += `
            AND c.name = $${params.length}
        `;

    }



    if (section && section !== "All") {

        params.push(section);

        query += `
            AND c.section = $${params.length}
        `;

    }



    if (
        stream &&
        stream !== "All" &&
        stream !== "None"
    ) {

        params.push(stream);

        query += `
            AND s.stream = $${params.length}
        `;

    }



    if (
        feeStatus &&
        feeStatus !== "All"
    ) {

        params.push(
            feeStatus.toLowerCase()
        );

        query += `
            AND s.feeStatus = $${params.length}
        `;

    }



    if (
        academicStatus &&
        academicStatus !== "All"
    ) {

        params.push(academicStatus);

        query += `
            AND s.academicStatus = $${params.length}
        `;

    }



    if (search) {

        params.push(`%${search}%`);

        const searchParam = params.length;


        params.push(`%${search}%`);

        const enrollmentParam = params.length;


        params.push(`%${search}%`);

        const rollParam = params.length;


        query += `
            AND (
                s.name ILIKE $${searchParam}
                OR s.enrollmentNo ILIKE $${enrollmentParam}
                OR s.rollNo ILIKE $${rollParam}
            )
        `;
    }



    query += `
        ORDER BY
            c.grade ASC,
            c.section ASC,
            s.rollNo ASC
    `;



    const { rows } =
        await pool.query(
            query,
            params
        );


    return rows;
}



export async function createStudent(body) {

    const client =
        await pool.connect();


    const id =
        `std-${Date.now()}`;


    try {

        await client.query("BEGIN");


        const schoolId =
            body.schoolId;


        const name =
            body.name || "Unknown";


        const email =
            body.email ||
            `${id}@school.com`;



        await client.query(
            `
            INSERT INTO users
            (
                id,
                name,
                email,
                password,
                role,
                tenantId,
                status
            )
            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7
            )
            `,
            [
                id,
                name,
                email,
                "student123",
                "student",
                schoolId,
                "active"
            ]
        );



        const keys = [
            "id"
        ];


        const values = [
            id
        ];


        const placeholders = [
            "$1"
        ];



        Object.keys(body)
            .forEach(key => {

                if (validStudentColumns.includes(key)) {

                    keys.push(key);

                    values.push(
                        body[key]
                    );

                    placeholders.push(
                        `$${values.length}`
                    );

                }

            });



        if (body.documents) {

            keys.push(
                "documents"
            );

            values.push(
                JSON.stringify(body.documents)
            );

            placeholders.push(
                `$${values.length}`
            );
        }



        await client.query(
            `
            INSERT INTO students
            (
                ${keys.join(",")}
            )
            VALUES
            (
                ${placeholders.join(",")}
            )
            `,
            values
        );



        await client.query(
            `
            UPDATE schools
            SET studentCount = studentCount + 1
            WHERE id = $1
            `,
            [
                schoolId
            ]
        );



        await client.query(
            "COMMIT"
        );


        return {
            id,
            message: "Student admitted successfully"
        };


    } catch(error) {

        await client.query(
            "ROLLBACK"
        );

        throw error;

    } finally {

        client.release();

    }
}

export async function updateStudent(id, body) {

    const updates = [];
    const values = [];


    Object.keys(body).forEach(key => {

        if (validStudentColumns.includes(key)) {

            values.push(body[key]);

            updates.push(
                `${key} = $${values.length}`
            );

        }

    });



    if (body.documents) {

        values.push(
            JSON.stringify(body.documents)
        );

        updates.push(
            `documents = $${values.length}`
        );

    }



    if (updates.length === 0) {

        return {
            message: "No changes made"
        };

    }



    const client =
        await pool.connect();


    try {

        await client.query(
            "BEGIN"
        );


        values.push(id);


        await client.query(
            `
            UPDATE students
            SET ${updates.join(", ")}
            WHERE id = $${values.length}
            `,
            values
        );



        // Sync selected fields with users table

        const userUpdates = [];
        const userValues = [];


        if (body.name) {

            userValues.push(
                body.name
            );

            userUpdates.push(
                `name = $${userValues.length}`
            );

        }



        if (body.email) {

            userValues.push(
                body.email
            );

            userUpdates.push(
                `email = $${userValues.length}`
            );

        }



        if (body.avatar !== undefined) {

            userValues.push(
                body.avatar
            );

            userUpdates.push(
                `avatar = $${userValues.length}`
            );

        }



        if (userUpdates.length > 0) {

            userValues.push(id);


            await client.query(
                `
                UPDATE users
                SET ${userUpdates.join(", ")}
                WHERE id = $${userValues.length}
                `,
                userValues
            );

        }



        await client.query(
            "COMMIT"
        );


        return {
            message: "Student updated successfully"
        };


    } catch(error) {

        await client.query(
            "ROLLBACK"
        );

        throw error;

    } finally {

        client.release();

    }
}





export async function archiveStudent(id, remark) {

    const client =
        await pool.connect();


    try {

        await client.query(
            "BEGIN"
        );



        const { rows } =
            await client.query(
                `
                SELECT schoolId
                FROM students
                WHERE id = $1
                `,
                [
                    id
                ]
            );



        if (rows.length > 0) {

            await client.query(
                `
                UPDATE schools
                SET studentCount = studentCount - 1
                WHERE id = $1
                `,
                [
                    rows[0].schoolid
                ]
            );

        }



        await client.query(
            `
            UPDATE students
            SET
                status = $1,
                archive_remark = $2
            WHERE id = $3
            `,
            [
                "archived",
                remark || "Archived",
                id
            ]
        );



        await client.query(
            `
            UPDATE users
            SET status = $1
            WHERE id = $2
            `,
            [
                "inactive",
                id
            ]
        );



        await client.query(
            "COMMIT"
        );


        return {
            message: "Student archived"
        };


    } catch(error) {

        await client.query(
            "ROLLBACK"
        );

        throw error;

    } finally {

        client.release();

    }
}