import { config } from "dotenv";
import express from "express";
import { router } from "./router.js";
import cors from "cors";
import { UserRoutes, OrgRoutes } from "../Routes/index.js";
import cookieParser from "cookie-parser";

const env = config().parsed;
const PORT = env?.PORT || 9200;
const HOST = env?.HOST || "127.0.0.1";
const SECRET = env?.SECRET || "";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser(SECRET));

app.use("/user", UserRoutes);
app.use("/org", OrgRoutes);
app.use("*", (req, res) => {res.status(404).json({message: "Oops! Page not found."})});
app.use(router);

app.listen(PORT, HOST, () => {
    console.log("server runs on port 9200");
});
