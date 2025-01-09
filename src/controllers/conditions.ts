import { Response, Request } from "express";
import { CustomRequest } from "../@types/express";
import { CustomResponse } from "../@types/custom-response";
import { prisma } from "../..";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import formData from "form-data";
import fs from "fs";
// import { uploadImageToS3 } from "../util/upload-s3";

// Create a new condition and an associated appointment
export const createCondition = async (
  req: CustomRequest,
  res: Response
): Promise<any> => {
  try {
    const { name, appointmentDate } = req.body;

    // Validate required fields
    if (!name || !appointmentDate)
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

    const fileProcessingPromises = (req.files as Express.Multer.File[]).map(
      (file) => {
        return new Promise(async (resolve, reject) => {
          try {
            let data = new FormData();
            console.log(file.path);
            const buffer = fs.readFileSync(file.path);
            const blob = new Blob([buffer]);
            data.append("file", blob, file.filename);

            let config = {
              method: "post",
              maxBodyLength: Infinity,
              url: "http://127.0.0.1:5000/process-prescription",
              data: data,
            };
            const response = await axios.request(config);
            console.log(response.data);
            resolve(response.data);
          } catch (error) {
            console.error("Error processing file with axios:", error);
            reject(error);
          }
        });
      }
    );

    Promise.all(fileProcessingPromises)
      .then((results) => {
        console.log("All files processed successfully:", results);
      })
      .catch((error) => {
        console.error("Error processing one or more files:", error);
      });
    // Create the condition and its associated appointment in a transaction
    // const condition = await prisma.condition.create({
    //   data: {
    //     userId: user.id,
    //     name,
    //     medication,
    //     symptoms,
    //     notes,
    //     imageUrl,
    //     Appointments: {
    //       create: {
    //         name: `Follow-up for ${name}`,
    //         doctorName,
    //         appointmentDate: new Date(appointmentDate),
    //         notes: appointmentNotes || "",
    //         category: "AS_NEEDED",
    //         userId: user.id,
    //       },
    //     },
    //   },
    //   include: {
    //     Appointments: true,
    //   },
    // });

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
