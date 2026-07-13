import { z } from "zod";

export const getTransportVehiclesParamsSchema = z.object({
    schoolId: z.string().min(1),
});

export const getHostelsParamsSchema = z.object({
    schoolId: z.string().min(1),
});

export const getHostelRoomsParamsSchema = z.object({
    hostelId: z.string().min(1),
});