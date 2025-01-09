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

    const doctors = await Promise.all(
      req.ocr.map(async (item) => {
        const doctor = await prisma.doctor.create({
          data: {
            name: item.doctorName,
            phNo: item.doctorPhone,
            designation: item.designation.join(", "),
            rating: 0,
          },
        });
        return doctor.id;
      })
    );

    const processedAppointment = JSON.parse(appointment);
    // processedLabResults will be array. use for loop
    const processedLabResults = req.ocr.map((item) => {
      return formatVitalsToLabResults(item.vitals);
    });

    const condition = await prisma.condition.create({
      data: {
        name,
        userId: user.id,
        Appointments: {
          createMany: {
            data: processedAppointment.map((item: any, index: number) => {
              return {
                name: item.name,
                appointmentDate: item.appointmentDate,
                // notes: item.notes,
                // imageUrl: req.files[index].location,
                // category: item.category,
                userId: user.id,
                isDigital: item.isDigital,
                doctorId: doctors[index],
                LabResult: {
                  createMany: {
                    data: processedLabResults[index].map((labResult: any) => {
                      return {
                        name: labResult.name,
                        value: labResult.value,
                        userId: user.id,
                      };
                    }),
                  },
                },
              };
            }),
          },
        },
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

    res.status(200).send(new CustomResponse("Condition fetched", condition));
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
      include: { Appointments: true },
    });
    res.status(200).send(new CustomResponse("Conditions fetched", conditions));
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
      where: { uid: req.user?.id },
    });

    if (!user) return res.status(401).send(new CustomResponse("Unauthorised"));

    const labResults = await prisma.labResult.findMany({
      where: { userId: user.id },
    });
    res.status(200).send(new CustomResponse("Lab results fetched", labResults));
  } catch (error) {
    console.error(error);
    res.status(500).send(new CustomResponse("Internal server error"));
  }
};
