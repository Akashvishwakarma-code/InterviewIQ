import express from "express"
import isAuth from "../middleware/isAuth.js"
import { upload } from "../middleware/multer.js"
import { analyzeResume } from "../controllers/interview.controller.js"

const interviewRouter = express.Router()

interviewRouter.post("/resume", isAuth, (req, res, next) => {
    upload.single("resume")(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
}, analyzeResume);

export default interviewRouter