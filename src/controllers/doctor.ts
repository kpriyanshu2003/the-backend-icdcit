// - Get doctor
// - update doctor
// - Get - doctor with higest ratings

import { Response } from "express";
import { CustomRequest } from "../@types/express";
import { CustomResponse } from "../@types/custom-response";
import { prisma } from "../..";

export async function getDoctor(
  req: CustomRequest,
  res: Response
): Promise<any> {
  try {
    const user = await prisma.user.findUnique({
      where: { uid: req.user?.uid },
    });
    if (!user)
      return res
        .status(401)
        .send(new CustomResponse("Condition: No lab results for the user."));
    const doctors = await prisma.doctor.findMany({
      where: { Appointment: { some: { userId: user.id } } },
    });
    res.status(200).send(new CustomResponse("Doctors Fetched", doctors));
  } catch (error) {
    console.error(error);
    res.status(500).send(new CustomResponse("Internal Server Error"));
  }
}

export async function getAllDoctors(
  req: CustomRequest,
  res: Response
): Promise<any> {
  try {
    const doctorsWithConditions = await prisma.doctor.findMany({
      include: {
        Appointment: {
          include: {
            Condition: true,
          },
        },
      },
    });

    const formattedResponse = doctorsWithConditions.map((doctor) => {
      const diseases = [
        ...new Set(
          doctor.Appointment.flatMap((appointment) =>
            appointment.Condition ? [appointment.Condition.name] : []
          )
        ),
      ];

      const uniquePatients = new Set(
        doctor.Appointment.map((appointment) => appointment.userId)
      );

      return {
        id: doctor.id,
        name: doctor.name,
        phNo: doctor.phNo,
        designation: doctor.designation,
        rating: doctor.rating,
        diseases: diseases,
        patients: uniquePatients.size,
      };
    });

    formattedResponse.sort((a, b) => b.rating - a.rating);
    res
      .status(200)
      .send(new CustomResponse("Doctors fetched", formattedResponse));
  } catch (error) {
    console.error("Error fetching doctors with conditions:", error);
    res.status(500).send(new CustomResponse("Internal Server Error"));
  }
}

export async function updateDoctor(
  req: CustomRequest,
  res: Response
): Promise<any> {
  try {
    const { id } = req.params;
    const { name, designation, rating } = req.body;
    if (!id)
      return res
        .status(400)
        .send(new CustomResponse("Required Field: Doctor ID"));

    const user = await prisma.user.findUnique({
      where: { uid: req.user?.uid },
    });
    if (!user)
      return res
        .status(401)
        .send(new CustomResponse("Condition: No lab results for the user."));

    const updatedDoctor = await prisma.doctor.updateMany({
      where: { id, Appointment: { some: { userId: user.id } } },
      data: {
        name,
        designation,
        rating: rating ? { increment: 1 } : { decrement: 1 },
      },
    });

    // Ensure rating does not go below 0
    await prisma.doctor.updateMany({
      where: { id, rating: { lt: 0 } },
      data: { rating: 0 },
    });
    res.status(202).send(new CustomResponse("Doctor Updated", updatedDoctor));
  } catch (error) {
    console.error(error);
    res.status(500).send(new CustomResponse("Internal Server Error"));
  }
}

export async function getDoctorWithRating(
  req: CustomRequest,
  res: Response
): Promise<any> {
  try {
    const doctors = await prisma.doctor.findMany({
      orderBy: { rating: "desc" },
    });
    res.status(200).send(new CustomResponse("Doctors fetched", doctors));
  } catch (error) {
    console.error(error);
    res.status(500).send(new CustomResponse("Internal Server Error"));
  }
}
