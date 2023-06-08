import express, { Router } from "express";
const router: Router = express.Router();
import { S3Client, S3ClientConfig } from "@aws-sdk/client-s3";
import multer from "multer";
// import multerS3 from "multer-s3";

//AWS S3 Configuration
// const bucketName: string | undefined = process.env.BUCKET_NAME;
// const bucketRegion: string | undefined = process.env.BUCKET_REGION;
// const accessKey: string | undefined = process.env.ACCESS_KEY;
// const secretAccessKey: string | undefined = process.env.SECRET_ACCESS_KEY;

// if (!bucketName || !bucketRegion || !accessKey || !secretAccessKey) {
//     throw new Error("Missing required environment variables for S3 configuration.");
// }

// const s3Config: S3ClientConfig = {
//     credentials: {
//         accessKeyId: accessKey,
//         secretAccessKey: secretAccessKey,
//     },
//     region: bucketRegion,
// };

// const s3 = new S3Client(s3Config);

//Multer upload to s3 config
// const upload = multer({
//     storage: multerS3({
//         s3: s3,
//         bucket: bucketName,
//         contentType: multerS3.AUTO_CONTENT_TYPE,
//         // metadata: function (req, file, cb) {
//         //     cb(null, { fieldName: file.fieldname });
//         // },
//         key: function (req, file, cb) {
//             cb(null, Date.now().toString());
//         },
//     }),
// });

//Multer config
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//Imported Controller Methods
// import { getLogin } from "../controllers/loginController";
import { postUser, loginUser, getUserPosts, getUserDetails } from "../controllers/userController";

// router.get("/", getLogin);

router.route("/").post(upload.array("images"), postUser);
router.route("/login").post(loginUser);
router.route("/:userId").get(getUserDetails);
router.route("/:userId/posts").get(getUserPosts);

export default router;
