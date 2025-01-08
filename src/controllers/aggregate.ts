import { Response } from "express";
import { CustomRequest } from "../@types/express";

export async function Aggr(req: CustomRequest, res: Response): Promise<any> {
  console.log(req.file);
  return res.send("hello world");
}
