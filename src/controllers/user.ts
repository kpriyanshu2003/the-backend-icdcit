import { Response } from "express";
import { CustomRequest } from "../@types/express";
import { CustomResponse } from "../@types/custom-response";
import { prisma } from "../..";

export const createUser = async (
  req: CustomRequest,
  res: Response
): Promise<any> => {
  try {
    const { name, age, height, weight, bmi } = req.body;
    if (!req.user)
      return res.status(400).send(new CustomResponse("Invalid Token"));
    if (!name || !age || !height || !weight || !bmi)
      return res
        .status(400)
        .send(new CustomResponse("Give all the req fields."));

    const firebaseUser = req.user;
    const { email, uid } = firebaseUser;
    if (!email || !uid)
      return res.status(400).send(new CustomResponse("Invalid Token"));
    const user = await prisma.user.create({
      data: {
        name,
        age,
        email,
        uid,
        height,
        weight,
        bmi,
      },
    });
    console.log("User created:", user);
    res.status(201).send(new CustomResponse("User created successfully"));
  } catch (error) {
    console.error(error);
    res.status(500).send(new CustomResponse("Internal Server Error"));
  }
};

export async function sampleUser(
  req: CustomRequest,
  res: Response
): Promise<any> {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Assume we create a condition here
    const condition = {
      /* your condition object */
    };

    return res
      .status(201)
      .json({ message: "Condition created successfully", condition });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

export const createUserWithEmailPassword = async (
  req: CustomRequest,
  res: Response
):
Promise<any> => {
  try {
    const { name, email, password, age, height, weight, bmi } = req.body;
    if (!name || !email || !password || !age || !height || !weight || !bmi) {
      return res
        .status(400)
        .send(new CustomResponse("Give all the req fields."));
    }

    const user = await prisma.user.create({
      data: {
        name,
        age,
        email,
        uid: password,
        height,
        weight,
        bmi,
      },
    });

    console.log("User created:", user);
    res.status(201).send(new CustomResponse("User created successfully"));
  } catch (error) {
    console.error(error);
    res.status(500).send(new CustomResponse("Internal Server Error"));
  }
};

export const loginUser = async (
  req: CustomRequest,
  res: Response
): Promise<any> => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .send(new CustomResponse("Give all the req fields."));
    const user = await prisma.user.findFirst({
      where: {
        email,
        uid: password,
      },
    });
    if (!user) return res.status(400).send(new CustomResponse("Invalid user"));
    res.status(200).send(new CustomResponse("User logged in successfully"));
  } catch (error) {
    console.error(error);
    res.status(500).send(new CustomResponse("Internal Server Error"));
  }
};
