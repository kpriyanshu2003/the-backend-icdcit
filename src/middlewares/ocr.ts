import { CustomResponse } from "../@types/custom-response";
import { Response, NextFunction } from "express";
import { CustomRequest } from "../@types/express";
import { processFile } from "../util/process-file";

export async function OCR(
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<any> {
  try {
    if (!req.file && !req.files) {
      return res
        .status(400)
        .send(new CustomResponse("FileHandler: No file uploaded"));
    }

    const files: Express.Multer.File[] = (
      Array.isArray(req.files) ? req.files : [req.file]
    ).filter((file): file is Express.Multer.File => !!file);

    const results = await Promise.all(
      files.map(async (file) => {
        return await processFile(file);
      })
    );
    req.ocr = results;
    next();
  } catch (error) {
    console.error("OCR:", error);
    return next(error);
  }
}
