// server.js
import "./config/db.js"; // or import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


import expressListEndpoints from "express-list-endpoints";

console.log(expressListEndpoints(app));