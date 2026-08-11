import multer from "multer"

const storage = multer.diskStorage({
    destination: function(req,file,cd){
        cd(null, "public")
    },
    filename :function(req,file,cd){
        const filename =Date.now() + "-" +file.originalname;
        cd(null, filename)
    }
})

export const upload = multer({
    storage,
    limits: {fileSize: 5 * 1024 *1024 },
})