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
    if (!req.file)
      return res.status(400).send(new CustomResponse("No file uploaded"));

    const tempFilePath = req.file.path;
    const compressedFilename = `${uuidv4()}.webp`;
    const finalPath = path.join(__dirname, "../uploads", compressedFilename);

    await CompressImage(tempFilePath, finalPath);
    await uploadToS3({ key: compressedFilename, filePath: finalPath });
    await fs.unlink(tempFilePath);

    next();
  } catch (error) {
    next(error);
  }
}
