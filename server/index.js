import express from "express";
import dotenv from "dotenv";
<<<<<<< HEAD
import connectDb from "./config/connectDb.js";
import dns from "dns"

dns.setServers(["1.1.1.1", "8.8.8.8"]);
=======
>>>>>>> 2cec510ac32d316cfa926dc0144b142e29e1713c
dotenv.config();

import connectDb from "./config/connectDb.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/auth.route.js";
import dns from "node:dns"
import userRouter from "./routes/user.routes.js";

dns.setServers(["1.1.1.1","8.8.8.8"])

const app = express();
const PORT = process.env.PORT || 6000;

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

app.listen(PORT, () => {
    console.log("Server is working");
    console.log("Port", PORT);
    connectDb();
});