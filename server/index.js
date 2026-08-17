import express from "express"
import connectDb from "./config/connectDb.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/auth.route.js";
import dns from "node:dns"
import userRouter from "./routes/user.routes.js";
import interviewRouter from "./routes/interview.route.js";
import isAuth from "./middleware/isAuth.js"

import dotenv from "dotenv";

dns.setServers(["1.1.1.1", "8.8.8.8"]);
dotenv.config();


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
app.use("/api/interview",interviewRouter)

app.listen(PORT, () => {
    console.log("Server is working");
    console.log("Port", PORT);
    connectDb();
});