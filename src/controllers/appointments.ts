import { Response } from "express";
import { CustomRequest } from "../@types/express";
import { CustomResponse } from "../@types/custom-response";
import { prisma } from "../..";
import { firebaseAuth } from "../libs/firebase-admin";
import { s3 } from "../libs/aws";

// Create a new appointment
export const createAppointment = async (
  req: CustomRequest,
  res: Response
): Promise<any> => {
  try {
    const {
      userId,
      name,
      doctorName,
      appointmentDate,
      notes,
      imageUrl,
      category,
    } = req.body;

    // Validate required fields
    if (!userId || !name || !doctorName || !appointmentDate || !category) {
      return res
        .status(400)
        .send(
          new CustomResponse(
            "Required Fields: userId, name, doctorName, appointmentDate, category"
          )
        );
    }

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        name,
        doctorName,
        appointmentDate: new Date(appointmentDate),
        notes: notes || "",
        imageUrl: imageUrl || "",
        category,
        userId,
      },
    });

    res
      .status(201)
      .send(new CustomResponse("Appointment created successfully"));
  } catch (error) {
    console.error(error);
    res.status(500).send(new CustomResponse("Internal server error"));
  }
};

// Get an appointment by ID
export const getAppointmentById = async (
  req: CustomRequest,
  res: Response
): Promise<any> => {
  try {
    const { appointmentId } = req.params;

    if (!appointmentId) {
      return res.status(400).json({ error: "Appointment ID is required" });
    }

    // Fetch the appointment and include associated lab results
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        labResults: true,
      },
    });

    if (!appointment) {
      return res.status(404).send(new CustomResponse("Appointment not found"));
    }

    res.status(200).json({ appointment });
  } catch (error) {
    console.error(error);
    res.status(500).send(new CustomResponse("Internal server error"));
  }
};

// Create a lab result for an existing appointment
export const createLabResult = async (
  req: CustomRequest,
  res: Response
): Promise<any> => {
  try {
    const { appointmentId, name, value, prediction, unit, referenceRange } =
      req.body;

    // Validate required fields
    if (!appointmentId || !name || value === undefined) {
      return res
        .status(400)
        .send(
          new CustomResponse("Required Fields: appointmentId, name, value")
        );
    }

    // Verify if the appointment exists
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return res.status(404).send(new CustomResponse("Appointment not found"));
    }

    // Create the lab result
    const labResult = await prisma.labResult.create({
      data: {
        name,
        value,
        prediction: prediction || null,
        unit: unit || "",
        referenceRange: referenceRange || "",
        appointmentId,
      },
    });

    res.status(201).send(new CustomResponse("Lab result created successfully"));
  } catch (error) {
    console.error(error);
    res.status(500).send(new CustomResponse("Internal server error"));
  }
};
