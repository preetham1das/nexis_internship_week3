const express = require("express");
const multer = require("multer");
const path = require ("path");
const fs = require("fs");

const router = express.Router();
const uploadDir = path.join(__dirname,"..","uploads");
fs.mkdirSync(uploadDir,{ recursive:true});
const storage = multer.diskStorage({
    destination:(req,res,cb)=>{
        cb(null,uploadDir);
    },
    filename:(req,file,cb)=>{
        const extension = path.extname(file.originalname).toLocaleLowerCase();
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);

    }
});

const fileFilter = (req,file,cb)=>{
    const allowedTypes = ["image/jpeg","image/png","image/webp"];
    if(allowedTypes.includes(file.mimetype)){
        return cb(null,true);
    }
    cb(new Error("Only JPG,PNG WEBP images are allowed"));
};
 
const upload = multer({
    storage,
    fileFilter,
    limits:{
        fileSize:5 * 1024*1024
    }
});

router.post("/", (req, res, next) => {
    upload.single("image")(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                message: err.message
            });
        }
        next();
    });
}, (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            message: "Please select an image"
        });
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    return res.status(201).json({
        message: "Image uploaded successfully",
        imageUrl
    });
});
module.exports = router;
