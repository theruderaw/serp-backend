import infrastructureService from "./infrastructure.service.js";

export async function getTransportVehicles(req, res, next) {
    try {
        const data = await infrastructureService.getTransportVehicles(
            req.params.schoolId
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function getHostels(req, res, next) {
    try {
        const data = await infrastructureService.getHostels(
            req.params.schoolId
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}

export async function getHostelRooms(req, res, next) {
    try {
        const data = await infrastructureService.getHostelRooms(
            req.params.hostelId
        );

        res.json(data);
    } catch (err) {
        next(err);
    }
}