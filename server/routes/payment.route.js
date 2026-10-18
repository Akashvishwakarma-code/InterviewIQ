import express from "express";
import { createOrder, verifyPayment } from "../controllers/payment.controllers.js";
import isAuth from "../middleware/isAuth.js";

const paymentRouter = express.Router();

paymentRouter.post("/order", isAuth, createOrder);
paymentRouter.post("/verify", isAuth, verifyPayment);

export default paymentRouter;
