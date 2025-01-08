import dotenv from "dotenv";
import { Response, NextFunction } from "express";
import { CustomRequest } from "../@types/express";
import { firebaseAuth } from "../libs/firebase-admin";
import { CustomResponse } from "../@types/custom-response";
import { FirebaseAppError } from "firebase-admin/app";

dotenv.config();

export const authToken = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    let token = "";
    if (!req.headers.authorization)
      return res.status(401).send(new CustomResponse("Unauthorised"));
    token = req.headers.authorization.split(" ")[1];
    if (!token) return res.status(401).send(new CustomResponse("Unauthorised"));
    if (token === process.env.TOKEN) return next();
    const user = await firebaseAuth.verifyIdToken(token);
    if (user) {
      console.log(user);
      req.user = user;
      return next();
    }
  } catch (error: any) {
    console.log(error);
    if (error.errorInfo.code === "auth/id-token-expired")
      return res.status(400).send(new CustomResponse("Token Expired"));
    res.status(400).send(new CustomResponse("Invalid Token"));
  }
};
