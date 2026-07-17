import pool from "../../config/db.js";


function mapSettings(row) {
    if (!row) return null;

    return {
        schoolId: row.school_id,
        billingMode: row.billing_mode,
        perStudentPrice: row.per_student_price,
        yearlyPerStudentPrice: row.yearly_per_student_price,
        monthlyAmount: row.monthly_amount,
        yearlyAmount: row.yearly_amount,
        discountAmount: row.discount_amount,
        discountText: row.discount_text,
        gstPercentage: row.gst_percentage,
        upiId: row.upi_id,
        bankName: row.bank_name,
        bankAccountNo: row.bank_account_no,
        bankIfsc: row.bank_ifsc,
        bankBranch: row.bank_branch,
        bankDetails: row.bank_details,
        qrCodeUrl: row.qr_code_url,
        validUntil: row.valid_until,
        validityRemark: row.validity_remark
    };
}


function mapPayment(row) {
    if (!row) return null;

    return {
        id: row.id,
        schoolId: row.schoolid,
        amount: row.amount,
        paymentMode: row.paymentmode,
        receiptUrl: row.receipturl,
        status: row.status,
        validUntil: row.validuntil,
        remark: row.remark,
        schoolRemark: row.school_remark,
        createdAt: row.createdat
    };
}


async function getSettings(schoolId) {
    const { rows } = await pool.query(
        `
        SELECT *
        FROM subscription_settings
        WHERE school_id = $1
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
            discountAmount: 0,
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


    return mapSettings(rows[0]);
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
        billingMode ?? "Cumulative",
        perStudentPrice ?? 0,
        yearlyPerStudentPrice ?? 0,
        monthlyAmount ?? 0,
        yearlyAmount ?? 0,
        discountAmount ?? 0,
        discountText ?? null,
        gstPercentage ?? 0,
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
        SELECT school_id
        FROM subscription_settings
        WHERE school_id = $1
        `,
        [schoolId]
    );


    if (existing.length === 0) {

        await pool.query(
            `
            INSERT INTO subscription_settings
            (
                school_id,
                billing_mode,
                per_student_price,
                yearly_per_student_price,
                monthly_amount,
                yearly_amount,
                discount_amount,
                discount_text,
                gst_percentage,
                valid_until,
                validity_remark,
                upi_id,
                bank_name,
                bank_account_no,
                bank_ifsc,
                bank_branch,
                bank_details,
                qr_code_url
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
                billing_mode = $1,
                per_student_price = $2,
                yearly_per_student_price = $3,
                monthly_amount = $4,
                yearly_amount = $5,
                discount_amount = $6,
                discount_text = $7,
                gst_percentage = $8,
                valid_until = $9,
                validity_remark = $10,
                upi_id = $11,
                bank_name = $12,
                bank_account_no = $13,
                bank_ifsc = $14,
                bank_branch = $15,
                bank_details = $16,
                qr_code_url = $17
            WHERE school_id = $18
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
        WHERE schoolid = $1
        ORDER BY createdat DESC
        `,
        [schoolId]
    );
    console.log(`
        SELECT *
        FROM subscription_payments
        WHERE schoolid = ${schoolId}
        ORDER BY createdat DESC
        `)

    return rows.map(mapPayment);
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
            schoolid,
            amount,
            paymentmode,
            receipturl,
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
            validuntil = $2,
            remark = $3
        WHERE id = $4
        `,
        [
            status,
            validUntil || null,
            remark || null,
            id
        ]
    );


    if (status === "Verified") {

        const { rows } = await pool.query(
            `
            SELECT schoolid
            FROM subscription_payments
            WHERE id = $1
            `,
            [id]
        );


        if (rows.length > 0) {

            const schoolId = rows[0].schoolid;


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
                        valid_until = $1,
                        validity_remark = $2
                    WHERE school_id = $3
                    `,
                    [
                        validUntil,
                        remark || null,
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