import { Request } from "express";
import { DecodedIdToken } from "firebase-admin/auth";

export interface CustomRequest extends Request {
  user?: DecodedIdToken;
  
}
