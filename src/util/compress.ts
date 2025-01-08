import sharp from "sharp";

export async function CompressImage(
  image: Buffer,
  outputPath: string
): Promise<void> {
  await sharp(image)
    .resize(500, 500, { fit: "inside" })
    .webp({ quality: 80 })
    .toFile(outputPath);
}
