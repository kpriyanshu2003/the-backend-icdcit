import { Response } from "express";
import { CustomRequest } from "../@types/express";
import { CustomResponse } from "../@types/custom-response";
import { prisma } from "../..";
import { firebaseAuth } from "../libs/firebase-admin";

// Create a new appointment
export const createAppointment = async (
  req: CustomRequest,
  res: Response
): Promise<any> => {
  try {
    const { name, doctorName, appointmentDate, notes, imageUrl, category } =
      req.body;

    // Validate required fields
    if (!name || !doctorName || !appointmentDate || !category) {
      return res
        .status(400)
        .send(
          new CustomResponse(
            "Required Fields: userId, name, doctorName, appointmentDate, category"
          )
        );
    }

    const user = await prisma.user.findUnique({
      where: { uid: req.user?.uid },
    });

    if (!req.user || !user)
      return res.status(401).send(new CustomResponse("Unauthorised"));

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        name,
        doctorName,
        appointmentDate: new Date(appointmentDate),
        notes: notes || "",
        imageUrl: imageUrl || "",
        category,
        userId: user.id,
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
    const { id } = req.params;

    if (!id)
      return res.status(400).json({ error: "Appointment ID is required" });

    const user = await prisma.user.findUnique({
      where: { uid: req.user?.uid },
    });

    if (!req.user || !user)
      return res.status(401).send(new CustomResponse("Unauthorised"));

    // Fetch the appointment and include associated lab results
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      // also latest lab results
    });

    if (!appointment)
      return res.status(404).send(new CustomResponse("Appointment not found"));

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
    const { appointmentId, result } = req.body;

    // Validate required fields
    if (!appointmentId || !result) {
      return res
        .status(400)
        .send(new CustomResponse("Required Fields: appointmentId, result"));
    }

    // Verify if the appointment exists
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment)
      return res.status(404).send(new CustomResponse("Appointment not found"));

    // Create the lab result
    const labResult = await prisma.labResult.createMany({
      data: result.map((r: any) => ({
        ...r,
        appointmentId,
      })),
    });

    res.status(201).send(new CustomResponse("Lab result created successfully"));
  } catch (error) {
    console.error(error);
    res.status(500).send(new CustomResponse("Internal server error"));
  }
};

export const getAllAppointments = async (
  req: CustomRequest,
  res: Response
): Promise<any> => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: { LabResult: true },
    });

    res.status(200).json({ appointments });
  } catch (error) {
    console.error(error);
    res.status(500).send(new CustomResponse("Internal server error"));
  }
};
