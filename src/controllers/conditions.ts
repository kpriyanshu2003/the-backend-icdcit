import { Response, Request } from "express";
import { CustomRequest } from "../@types/express";
import { CustomResponse } from "../@types/custom-response";
import { prisma } from "../..";
import { firebaseAuth } from "../libs/firebase-admin";
import { s3 } from "../libs/aws";

// Create a new condition and an associated appointment
export const createCondition = async (req: CustomRequest, res: Response) => {
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
export async function getConditionById(req: Request, res: Response) {
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
