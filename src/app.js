import express from "express";
import cors from "cors";
import authRoutes from "./features/auth/auth.routes.js";
import academicRoutes from "./features/academics/academics.routes.js";
import academicConfigRoutes from "./features/academicConfig/academicConfig.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/academic", academicRoutes);
app.use("/api/academic-config", academicConfigRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "SERP API running"
    });
});

export default app;