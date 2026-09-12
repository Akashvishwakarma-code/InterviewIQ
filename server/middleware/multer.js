import multer from "multer"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadDir = path.join(__dirname, "../public")

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, uploadDir)
    },
    filename: function(req, file, cb){
        const filename = Date.now() + "-" + file.originalname;
        cb(null, filename)
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf")) {
        cb(null, true)
    } else {
        cb(new Error("Only PDF files are allowed"), false)
    }
}

export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter
})