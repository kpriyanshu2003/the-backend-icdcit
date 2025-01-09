import { NextFunction, Response } from "express";
import { CustomRequest } from "../@types/express";
import { CompressImage } from "../util/compress";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import sharp from "sharp";
import fs from "fs/promises";
import { CustomResponse } from "../@types/custom-response";
import { uploadToS3 } from "../util/upload-s3";

export async function FileHandler(
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<any> {
  try {
    if (!req.file && !req.files)
      return res
        .status(400)
        .send(new CustomResponse("FileHandler: No file uploaded"));

    if (req.file) {
      const tempFilePath = req.file.path;
      const compressedFilename = `${uuidv4()}.webp`;
      const finalPath = path.join(__dirname, "../uploads", compressedFilename);

      await CompressImage(tempFilePath, finalPath);
      req.file.destination = finalPath;
      req.file.filename = compressedFilename;
      req.file.path = finalPath;
      uploadToS3({ key: compressedFilename, filePath: finalPath });
      await fs.unlink(tempFilePath);
    }

    if (req.files) {
      const files = req.files as Express.Multer.File[];
      const compressedFiles = await Promise.all(
        files.map(async (file) => {
          const tempFilePath = file.path;
          const compressedFilename = `${uuidv4()}.webp`;
          const finalPath = path.join(
            __dirname,
            "../uploads",
            compressedFilename
          );

          await CompressImage(tempFilePath, finalPath);
          file.destination = finalPath;
          file.filename = compressedFilename;
          file.path = finalPath;
          uploadToS3({ key: compressedFilename, filePath: finalPath });
          await fs.unlink(tempFilePath);

          return file;
        })
      );

      req.files = compressedFiles;
    }

    next();
  } catch (error) {
    next(error);
  }
}
