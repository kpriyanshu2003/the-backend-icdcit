import multer from "multer";
import { s3 } from "../libs/aws";
import sharp from "sharp";
import { CompressImage } from "./compress";

// const abc = multer({
//   // https://github.com/expressjs/multer
//   dest: "./public/uploads/",
//   limits: { fileSize: 100000 },
//   rename: function (fieldname, filename) {
//     return filename.replace(/\W+/g, "-").toLowerCase();
//   },
//   onFileUploadData: function (file, data, req, res) {
//     // file : { fieldname, originalname, name, encoding, mimetype, path, extension, size, truncated, buffer }
//     var params = {
//       Bucket: "makersquest",
//       Key: file.name,
//       Body: data,
//     };

//     s3.putObject(params, function (perr, pres) {
//       if (perr) {
//         console.log("Error uploading data: ", perr);
//       } else {
//         console.log("Successfully uploaded data to myBucket/myKey");
//       }
//     });
//   },
// });

export const uploadImageToS3 = async (
  base64Image: Buffer,
  key: string
): Promise<string> => {
  if (!process.env.AWS_S3_BUCKET) throw new Error("AWS not configured");

  const webpKey = key.replace(/\.\w+$/, ".webp");
  const s3Params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: webpKey,
    Body: CompressImage(base64Image, "./uploads"),
    ContentType: "image/webp",
  };

  const s3Response = await s3.upload(s3Params).promise();
  return s3Response.Location;
};
