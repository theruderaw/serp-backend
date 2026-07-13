import pool from "../../config/db.js";

async function getTransportVehicles(schoolId) {
    const { rows } = await pool.query(
        `
        SELECT
            v.*,
            (
                SELECT COUNT(*)
                FROM students
                WHERE transportid = v.id
            ) AS occupancy
        FROM transport_vehicles v
        WHERE v.schoolid = $1
        `,
        [schoolId]
    );

    return rows;
}

async function getHostels(schoolId) {
    const { rows } = await pool.query(
        `
        SELECT
            h.*,
            (
                SELECT COUNT(*)
                FROM students
                WHERE hostelid = h.id
            ) AS occupancy,
            (
                SELECT COUNT(*)
                FROM hostel_rooms
                WHERE hostelid = h.id
            ) AS "roomCount"
        FROM hostels h
        WHERE h.schoolid = $1
        `,
        [schoolId]
    );

    return rows;
}

async function getHostelRooms(hostelId) {
    const { rows } = await pool.query(
        `
        SELECT *
        FROM hostel_rooms
        WHERE hostelid = $1
        `,
        [hostelId]
    );

    return rows;
}

export default {
    getTransportVehicles,
    getHostels,
    getHostelRooms,
};