import { Response } from "express";
import { CustomRequest } from "../@types/express";
import { CustomResponse } from "../@types/custom-response";
import { prisma } from "../..";
import { firebaseAuth } from "../libs/firebase-admin";
import { s3 } from "../libs/aws";

// TOOD : Figure out, DiseaseDiagnosis and Conditions.
export const createUser = async (req: CustomRequest, res: Response) => {
  try {
    const { name, gender, dob, height, weight, bmi, diagnosedDiseases } =
      req.body;
    // height, weight, bmi : { value, unit}
    // TODO : Add validations
    if (!req.user)
      return res.status(400).send(new CustomResponse("Invalid Token"));

    // AWS S3 Uploads
    let imageUrl;
    if (req.file) {
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `appointment-images/${Date.now()}-${req.file.originalname}`,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      };
      const uploadResult = await s3.upload(params).promise();
      imageUrl = uploadResult.Location;
    }

    // Create User
    const firebaseUser = req.user;
    const { email, uid } = firebaseUser;
    if (!email || !uid)
      return res.status(400).send(new CustomResponse("Invalid Token"));
    const user = await prisma.user.create({
      data: {
        name,
        dob,
        gender,
        email,
        uid,
        conditions: {
          create: diagnosedDiseases
            ? diagnosedDiseases.map((disease) => ({
                name: disease.name,
                medication: disease.medication || [],
                symptoms: disease.symptoms || [],
                notes: disease.notes || "",
              }))
            : [],
        },
        appointment: {
          create: {
            name: `${name}'s Initial Appointment`,
            doctorName: "Default Doctor",
            appointmentDate: new Date(),
            imageUrl,
            labResults: {
              create: [
                { name: "Height", value: height.value, unit: height.unit },
                { name: "Weight", value: height.value, unit: weight.unit },
                { name: "BMI", value: bmi.value, unit: bmi.unit },
              ],
            },
          },
        },
      },
    });

    res.status(201).send(new CustomResponse("User created successfully"));
  } catch (error) {
    console.error(error);
    res.status(500).send(new CustomResponse("Internal Server Error"));
  }
};
