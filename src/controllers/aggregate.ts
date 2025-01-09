import { Response } from "express";
import { CustomRequest } from "../@types/express";
import { formatVitalsToLabResults } from "../util/ocr-to-labresult";
import { stringToJson } from "../util/string-to-json";

export async function Aggr(req: CustomRequest, res: Response): Promise<any> {
  const appointments = req.body.appointment; // Appointments
  const files = req.files; // Uploaded files
  console.log("Appointments:", stringToJson(appointments));
  console.log("Files:", files);

  res.send({ message: "Success", appointments, files });
  return res.send(req.ocr);
}
