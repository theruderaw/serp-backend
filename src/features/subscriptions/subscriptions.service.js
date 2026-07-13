import pool from "../../config/db.js";


async function getSettings(schoolId) {
    const { rows } = await pool.query(
        `
        SELECT *
        FROM subscription_settings
        WHERE schoolId = $1
        `,
        [schoolId]
    );


    if (rows.length === 0) {
        return {
            schoolId,
            billingMode: "Cumulative",
            perStudentPrice: 0,
            yearlyPerStudentPrice: 0,
            monthlyAmount: 0,
            yearlyAmount: 0,
            discountAmount: "",
            discountText: "",
            gstPercentage: 0,
            upiId: "",
            bankName: "",
            bankAccountNo: "",
            bankIfsc: "",
            bankBranch: "",
            bankDetails: "",
            qrCodeUrl: "",
            validUntil: null,
            validityRemark: ""
        };
    }

    return rows[0];
}


async function updateSettings(schoolId, body) {
    const {
        billingMode,
        perStudentPrice,
        yearlyPerStudentPrice,
        monthlyAmount,
        yearlyAmount,
        discountAmount,
        discountText,
        gstPercentage,
        validUntil,
        validityRemark,
        upiId,
        bankName,
        bankAccountNo,
        bankIfsc,
        bankBranch,
        bankDetails,
        qrCodeUrl
    } = body;


    const safeValidUntil =
        validUntil === ""
            ? null
            : validUntil;


    const params = [
        billingMode || "Cumulative",
        perStudentPrice || 0,
        yearlyPerStudentPrice || 0,
        monthlyAmount || 0,
        yearlyAmount || 0,
        discountAmount || 0,
        discountText ?? null,
        gstPercentage || 0,
        safeValidUntil,
        validityRemark ?? null,
        upiId ?? null,
        bankName ?? null,
        bankAccountNo ?? null,
        bankIfsc ?? null,
        bankBranch ?? null,
        bankDetails ?? null,
        qrCodeUrl ?? null
    ];


    const { rows: existing } = await pool.query(
        `
        SELECT *
        FROM subscription_settings
        WHERE schoolId = $1
        `,
        [schoolId]
    );


    if (existing.length === 0) {

        await pool.query(
            `
            INSERT INTO subscription_settings
            (
                schoolId,
                billingMode,
                perStudentPrice,
                yearlyPerStudentPrice,
                monthlyAmount,
                yearlyAmount,
                discountAmount,
                discountText,
                gstPercentage,
                validUntil,
                validityRemark,
                upiId,
                bankName,
                bankAccountNo,
                bankIfsc,
                bankBranch,
                bankDetails,
                qrCodeUrl
            )
            VALUES
            (
                $1,$2,$3,$4,$5,$6,$7,$8,$9,
                $10,$11,$12,$13,$14,$15,$16,$17,$18
            )
            `,
            [
                schoolId,
                ...params
            ]
        );

    } else {

        await pool.query(
            `
            UPDATE subscription_settings
            SET
                billingMode = $1,
                perStudentPrice = $2,
                yearlyPerStudentPrice = $3,
                monthlyAmount = $4,
                yearlyAmount = $5,
                discountAmount = $6,
                discountText = $7,
                gstPercentage = $8,
                validUntil = $9,
                validityRemark = $10,
                upiId = $11,
                bankName = $12,
                bankAccountNo = $13,
                bankIfsc = $14,
                bankBranch = $15,
                bankDetails = $16,
                qrCodeUrl = $17
            WHERE schoolId = $18
            `,
            [
                ...params,
                schoolId
            ]
        );
    }


    return {
        message: "Settings updated successfully"
    };
}


async function getPayments(schoolId) {
    const { rows } = await pool.query(
        `
        SELECT *
        FROM subscription_payments
        WHERE schoolId = $1
        ORDER BY createdAt DESC
        `,
        [schoolId]
    );

    return rows;
}


async function createPayment(body) {
    const {
        schoolId,
        amount,
        paymentMode,
        receiptUrl,
        schoolRemark
    } = body;


    await pool.query(
        `
        INSERT INTO subscription_payments
        (
            schoolId,
            amount,
            paymentMode,
            receiptUrl,
            school_remark,
            status
        )
        VALUES
        ($1,$2,$3,$4,$5,$6)
        `,
        [
            schoolId,
            amount,
            paymentMode,
            receiptUrl,
            schoolRemark,
            "Pending"
        ]
    );


    return {
        message: "Payment submitted successfully"
    };
}


async function verifyPayment(id, body) {
    const {
        status,
        validUntil,
        remark
    } = body;


    await pool.query(
        `
        UPDATE subscription_payments
        SET
            status = $1,
            validUntil = $2,
            remark = $3
        WHERE id = $4
        `,
        [
            status,
            validUntil,
            remark,
            id
        ]
    );


    if (status === "Verified") {

        const { rows } = await pool.query(
            `
            SELECT schoolId
            FROM subscription_payments
            WHERE id = $1
            `,
            [id]
        );


        if (rows.length > 0) {

            const schoolId = rows[0].schoolId;


            await pool.query(
                `
                UPDATE schools
                SET status = 'active'
                WHERE id = $1
                `,
                [schoolId]
            );


            if (validUntil) {

                await pool.query(
                    `
                    UPDATE subscription_settings
                    SET
                        validUntil = $1,
                        validityRemark = $2
                    WHERE schoolId = $3
                    `,
                    [
                        validUntil,
                        remark,
                        schoolId
                    ]
                );
            }
        }
    }


    return {
        message: "Payment updated successfully"
    };
}


export default {
    getSettings,
    updateSettings,
    getPayments,
    createPayment,
    verifyPayment
};