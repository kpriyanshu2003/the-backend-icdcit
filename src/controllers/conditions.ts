import { Response, Request } from "express";
import { CustomRequest } from "../@types/express";
import { CustomResponse } from "../@types/custom-response";
import { prisma } from "../..";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import formData from "form-data";
import fs from "fs";
import { formatVitalsToLabResults } from "../util/ocr-to-labresult";
import { IStringToJson, stringToJson } from "../util/string-to-json";
// import { uploadImageToS3 } from "../util/upload-s3";

// Create a new condition and an associated appointment
export const createCondition = async (
  req: CustomRequest,
  res: Response
): Promise<any> => {
  try {
    const { name, appointment } = req.body;

    // Validate required fields
    if (!name || !appointment)
      return res
        .status(400)
        .send(new CustomResponse("Required fields:  name, appointmentDate"));

    const user = await prisma.user.findUnique({
      where: { uid: req.user?.uid },
    });

    if (!req.user || !user)
      return res.status(401).send(new CustomResponse("Unauthorisedd"));
    if (req.files === undefined)
      return res.status(400).send(new CustomResponse("Required Field: File"));
    if (!req.ocr)
      return res.status(400).send(new CustomResponse("Required Field: OCR"));

    console.log(req.ocr);

    const doctors = await Promise.all(
      req.ocr.map(async (item) => {
        const doctor = await prisma.doctor.upsert({
          where: { phNo: item.doctorPhone }, // Check based on the unique phone number
          create: {
            name: item.doctorName || "Anadibhai G Joshi",
            phNo: item.doctorPhone,
            designation: item.designation.join(", "),
            rating: 0,
          },
          update: { name: item.doctorName || "Anadibhai G Joshi" },
        });
        return doctor.id;
      })
    );

    const processedAppointment = stringToJson(appointment);
    // processedLabResults will be array. use for loop
    // const processedLabResults = req.ocr.map((item) => {
    //   return formatVitalsToLabResults(item.vitals);
    // });

    console.log(processedAppointment);

    const medication =
      req.ocr && req.ocr.length > 0
        ? req.ocr.flatMap((item) => item.medications)
        : []; // Use flatMap to merge all medications from OCR responses into a single array

    const symptoms =
      req.ocr && req.ocr.length > 0
        ? req.ocr.flatMap((item) => item.complaints)
        : []; //

    const condition = await prisma.condition.create({
      data: {
        name,
        userId: user.id,
        medication,
        symptoms,
        Appointments: {
          createMany: {
            data: processedAppointment.map(
              (item: IStringToJson, index: number) => ({
                name: item.name,
                appointmentDate: item.date,
                // notes: item.notes,
                imageUrl:
                  "https://icdcit.iotkiit.in/public/" +
                  (req.files as Express.Multer.File[])?.[index].filename, // Uncomment if needed
                // category: item.category,
                userId: user.id,
                // isDigital: item.isDigital,
                doctorId: doctors[index],
              })
            ),
          },
        },
      },
    });

    // Retrieve all created appointments
    const appointments = await prisma.appointment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: processedAppointment.length, // Fetch the same number of appointments that were created
    });

    // Create LabResults for each appointment
    for (const [index, appointment] of appointments.entries()) {
      const labResults = req.ocr?.[index]?.vitals.map((vital) => ({
        name: vital.name,
        value: vital.value,
        unit: vital.unit,
        userId: user.id,
        appointmentId: appointment.id, // Link LabResults to the appointment
      }));

      if (labResults && labResults.length > 0) {
        await prisma.labResult.createMany({ data: labResults });
      }
    }

    res.status(201).send(new CustomResponse("Condition created"));
  } catch (error) {
    console.error(error);
    res.status(500).send(new CustomResponse("Internal server error"));
  }
};

// Get a condition by ID with brief appointment details
export async function getConditionById(
  req: CustomRequest,
  res: Response
): Promise<any> {
  try {
    const { id } = req.params;
    if (!id)
      return res
        .status(400)
        .send(new CustomResponse("Required Field: Condition ID"));
    const firebaseUser = req.user;
    const user = await prisma.user.findUnique({
      where: { uid: firebaseUser?.uid },
    });
    if (!user) return res.status(401).send(new CustomResponse("Unauthorised"));
    console.log(user);
    // Validate the condition ID

    // Fetch the condition with its related appointment
    const condition = await prisma.condition.findUnique({
      where: { id, userId: user.id },
      include: {
        Appointments: {
          select: {
            id: true,
            name: true,
            appointmentDate: true,
            notes: true,
            category: true,
            Doctor: true,
          },
        },
      },
    });

    const doctors = await prisma.doctor.findMany({
      where: {
        Appointment: {
          some: {
            Condition: {
              name: condition?.name,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        phNo: true,
        designation: true,
        rating: true,
        Appointment: {
          select: {
            Condition: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        rating: "desc", // Sort doctors by their rating in descending order
      },
    });

    // Format the response to include only unique diseases for each doctor
    const response = doctors.map((doctor) => ({
      id: doctor.id,
      name: doctor.name,
      phNo: doctor.phNo,
      designation: doctor.designation,
      rating: doctor.rating,
    }));

    res
      .status(200)
      .send(new CustomResponse("Condition fetched", { condition, response }));
  } catch (error) {
    console.error(error);
    res.status(500).send(new CustomResponse("Internal server error"));
  }
}

// export const addConditionWithAppointments = async (
//   req: CustomRequest,
//   res: Response
// ): Promise<any> => {
//   try {
//     const { name, medication, symptoms, notes, appointments } = req.body;
//     const user = await prisma.user.findUnique({
//       where: { uid: req.user?.uid },
//     });
//     if (!user) return res.status(401).send(new CustomResponse("Unauthorised"));
//     const processedAppointments = await Promise.all(
//       appointments.map(async (appointment: any) => {
//         const appointmentImageKey = `appointments/${uuidv4()}.jpeg`;
//         const appointmentImageUrl = await uploadImageToS3(
//           appointment.image,
//           appointmentImageKey
//         );
//         // if (appointment.isDigital)
//         // {
//         //   const {symptoms,medication,doctorName,}
//         // }

//         let labResult = null;
//         if (appointment.labResults && appointment.labResults.name) {
//           labResult = await prisma.labResult.findFirst({
//             where: { name: appointment.labResults.name },
//           });

//           if (labResult) {
//             await prisma.labResult.update({
//               where: { id: labResult.id },
//               data: { ...appointment.labResults },
//             });
//           } else {
//             await prisma.labResult.create({
//               data: { ...appointment.labResults },
//             });
//           }
//         }

//         //TODO: Add to flask server OCR

//         return {
//           name: appointment.name,
//           appointmentDate: new Date(appointment.appointmentDate),
//           notes: appointment.notes,
//           imageUrl: appointmentImageUrl,
//           category: appointment.category,
//           userId: user.id,
//           labResults: labResult,
//         };
//       })
//     );

//     const condition = await prisma.condition.create({
//       data: {
//         name,
//         medication,
//         symptoms,
//         notes,
//         userId: user.id,
//         Appointments: {
//           create: processedAppointments,
//         },
//       },
//     });

//     res.status(200).json({
//       message: "disease and appointments added successfully",
//       condition,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Error adding condition and appointments" });
//   }
// };

export const getConditions = async (
  req: CustomRequest,
  res: Response
): Promise<any> => {
  try {
    const firebaseUser = req.user;
    const user = await prisma.user.findUnique({
      where: { uid: firebaseUser?.uid },
    });
    console.log(user);
    if (!user) return res.status(401).send(new CustomResponse("Unauthorisedd"));
    const conditions = await prisma.condition.findMany({
      where: { userId: user.id },
    });

    console.log("sdfsdfss", user.id);
    const labResults = await prisma.labResult.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      distinct: ["name"],
    });
    res.status(200).send(
      new CustomResponse("Conditions fetched", {
        condition: conditions,
        user: user,
        result: labResults,
      })
    );
  } catch (error) {
    console.error(error);
    res.status(500).send(new CustomResponse("Internal server error"));
  }
};

export const getConditionsByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res
        .status(400)
        .send(new CustomResponse("Required Field: User ID"));
    }

    const conditions = await prisma.condition.findMany({
      where: { userId },
      include: {
        Appointments: true,
      },
    });
    res.status(200).send(new CustomResponse("Conditions fetched", conditions));
  } catch (error) {
    console.error(error);
    res.status(500).send(new CustomResponse("Internal server error"));
  }
};

export const getlabResults = async (
  req: CustomRequest,
  res: Response
): Promise<any> => {
  try {
    const user = await prisma.user.findUnique({
      where: { uid: req.user?.uid },
    });
    if (!user)
      return res
        .status(401)
        .send(new CustomResponse("Condition: No lab results for the user."));

    console.log("sdfsdfss", user.id);
    const labResults = await prisma.labResult.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      distinct: ["name"],
    });
    res.status(200).send(new CustomResponse("Lab results fetched", labResults));
  } catch (error) {
    console.error(error);
    res.status(500).send(new CustomResponse("Internal server error"));
  }
};
