import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/connectDb.js";
import dns from "dns"

dns.setServers(["1.1.1.1", "8.8.8.8"]);
dotenv.config();
const app =express();
const PORT= process.env.PORT||6000;
app.get("/",(req,res)=>{
    return res.json({"message":"succesfully created" });
})
app.listen(PORT,()=>{
    console.log("server is working");
    connectDb();
})
