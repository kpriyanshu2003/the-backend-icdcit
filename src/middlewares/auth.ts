import dotenv from "dotenv";
import { Response, NextFunction } from "express";
import { CustomRequest } from "../@types/express";
import { firebaseAuth } from "../libs/firebase-admin";
import { CustomResponse } from "../@types/custom-response";

dotenv.config();

export const authToken = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token = "";
    if (!req.headers.authorization)
      return res.status(401).send(new CustomResponse("Access Denied"));
    token = req.headers.authorization.split(" ")[1];
    if (!token)
      return res.status(401).send(new CustomResponse("Access Denied"));
    if (token === process.env.TOKEN) return next();
    const user = await firebaseAuth.verifyIdToken(token);
    if (user) {
      // console.log(user);
      req.user = user;
      return next();
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(new CustomResponse("Invalid Token"));
  }
};
