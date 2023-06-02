import express, { Router } from "express";
const router: Router = express.Router();
import { S3Client, S3ClientConfig } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";

//AWS S3 Configuration
const bucketName: string | undefined = process.env.BUCKET_NAME;
const bucketRegion: string | undefined = process.env.BUCKET_REGION;
const accessKey: string | undefined = process.env.ACCESS_KEY;
const secretAccessKey: string | undefined = process.env.SECRET_ACCESS_KEY;

if (!bucketName || !bucketRegion || !accessKey || !secretAccessKey) {
    throw new Error("Missing required environment variables for S3 configuration.");
}

const s3Config: S3ClientConfig = {
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey,
    },
    region: bucketRegion,
};

const s3 = new S3Client(s3Config);

//Imported Controller Methods
// import { getLogin } from "../controllers/loginController";
import { postUser, loginUser } from "../controllers/userController";

// router.get("/", getLogin);

router.post("/", postUser).post("/login", loginUser);

export default router;
