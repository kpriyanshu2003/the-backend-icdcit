import { Response } from "express";
import { CustomRequest } from "../@types/express";

export async function Aggr(req: CustomRequest, res: Response): Promise<any> {
  return res.send(req.ocr);
}
