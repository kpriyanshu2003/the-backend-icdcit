import { Response, Request } from "express";
import { CustomRequest } from "../@types/express";
import { CustomResponse } from "../@types/custom-response";
import { prisma } from "../..";
import { s3 } from "../libs/aws";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
// Create a new condition and an associated appointment
export const createCondition = async (
  req: CustomRequest,
  res: Response
): Promise<any> => {
  try {
    const {
      userId,
      name,
      medication,
      symptoms,
      notes,
      imageUrl,
      doctorName,
      appointmentDate,
      appointmentNotes,
    } = req.body;

    // Validate required fields
    if (
      !userId ||
      !name ||
      !medication ||
      !symptoms ||
      !doctorName ||
      !appointmentDate
    ) {
      return res
        .status(400)
        .send(
          new CustomResponse(
            "Required fields: userId, name, medication, symptoms, doctorName, appointmentDate"
          )
        );
    }

    // Create the condition and its associated appointment in a transaction
    const condition = await prisma.condition.create({
      data: {
        name,
        medication,
        symptoms,
        notes,
        imageUrl,
        userId,
        Appointments: {
          create: {
            name: `Follow-up for ${name}`,
            doctorName,
            appointmentDate: new Date(appointmentDate),
            notes: appointmentNotes || "",
            category: "AS_NEEDED",
            userId,
          },
        },
      },
      include: {
        Appointments: true,
      },
    });

    res.status(201).send(new CustomResponse("Condition created"));
  } catch (error) {
    console.error(error);
    res.status(500).send(new CustomResponse("Internal server error"));
  }
};

// Get a condition by ID with brief appointment details
export async function getConditionById(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { id } = req.params;

    // Validate the condition ID
    if (!id) {
      return res
        .status(400)
        .send(new CustomResponse("Required Field: Condition ID"));
    }

    // Fetch the condition with its related appointment
    const condition = await prisma.condition.findUnique({
      where: { id },
      include: {
        Appointments: {
          select: {
            id: true,
            name: true,
            doctorName: true,
            appointmentDate: true,
            notes: true,
            category: true,
          },
        },
      },
    });

    res.status(200).send(new CustomResponse("Condition fetched", condition));
  } catch (error) {
    console.error(error);
    res.status(500).send(new CustomResponse("Internal server error"));
  }
}

export const addConditionWithAppointments = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { userId, name, medication, symptoms, notes, appointments } =
      req.body;
    const processedAppointments = await Promise.all(
      appointments.map(async (appointment: any) => {
        const appointmentImageKey = `appointments/${uuidv4()}.jpeg`;
        const appointmentImageUrl = await uploadImageToS3(
          appointment.image,
          appointmentImageKey
        );

        let labResult = null;
        if (appointment.labResults && appointment.labResults.name) {
          labResult = await prisma.labResult.findFirst({
            where: { name: appointment.labResults.name },
          });

          if (labResult) {
            await prisma.labResult.update({
              where: { id: labResult.id },
              data: { ...appointment.labResults },
            });
          } else {
            await prisma.labResult.create({
              data: { ...appointment.labResults },
            });
          }
        }

        return {
          name: appointment.name,
          appointmentDate: new Date(appointment.appointmentDate),
          notes: appointment.notes,
          imageUrl: appointmentImageUrl,
          category: appointment.category,
          userId: userId,
          labResults: labResult,
        };
      })
    );

    const condition = await prisma.condition.create({
      data: {
        name,
        medication,
        symptoms,
        notes,
        userId,
        Appointments: {
          create: processedAppointments,
        },
      },
    });

    res.status(200).json({
      message: "disease and appointments added successfully",
      condition,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error adding condition and appointments" });
  }
};

const uploadImageToS3 = async (
  base64Image: string,
  key: string
): Promise<string> => {
  const compressedImageBuffer = await sharp(Buffer.from(base64Image, "base64"))
    .resize(500, 500, { fit: "inside" })
    .webp({ quality: 80 })
    .toBuffer();

  if (!process.env.AWS_S3_BUCKET) {
    throw new Error("AWS not configured");
  }
  const webpKey = key.replace(/\.\w+$/, ".webp");
  const s3Params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: webpKey,
    Body: compressedImageBuffer,
    ContentType: "image/webp",
  };

  const s3Response = await s3.upload(s3Params).promise();
  return s3Response.Location;
};
