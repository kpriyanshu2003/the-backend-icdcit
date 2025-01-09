import { Response } from "express";
import { CustomRequest } from "../@types/express";
import { formatVitalsToLabResults } from "../util/ocr-to-labresult";

export async function Aggr(req: CustomRequest, res: Response): Promise<any> {
  const processedLabResults = req.ocr?.map((item) => {
    return formatVitalsToLabResults(item.vitals);
  });

  console.log(processedLabResults);
  return res.send(req.ocr);
}
