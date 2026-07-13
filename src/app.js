import express from "express";
import cors from "cors";
import authRoutes from "./features/auth/auth.routes.js";
import academicRoutes from "./features/academics/academics.routes.js";
import academicConfigRoutes from "./features/academicConfig/academicConfig.routes.js";
import attendanceRoutes from "./features/attendance/attendance.routes.js"
import communicationRoutes from "./features/communication/communication.routes.js"
import dashboardRoutes from "./features/dashboard/dashboard.routes.js"
import draftsRoutes from "./features/drafts/drafts.routes.js"
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/academic", academicRoutes);
app.use("/api/academic-config", academicConfigRoutes);
app.use("/api/attendance",attendanceRoutes)
app.use("/api/communication",communicationRoutes)
app.use("/api/dashboard",dashboardRoutes)
app.use("/api/drafts",draftsRoutes)

app.get("/", (req, res) => {
    res.json({
        message: "SERP API running"
    });
});

export default app;