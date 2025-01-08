import sharp from "sharp";

export async function CompressImage(
  inputFilePath: string,
  outputFile: string
): Promise<void> {
  await sharp(inputFilePath)
    .resize(500, 500, { fit: "inside" })
    .webp({ quality: 80 })
    .toFile(outputFile);
}
