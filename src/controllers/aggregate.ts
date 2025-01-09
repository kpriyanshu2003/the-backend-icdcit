import { Response } from "express";
import { CustomRequest } from "../@types/express";
import { formatVitalsToLabResults } from "../util/ocr-to-labresult";
import { stringToJson } from "../util/string-to-json";
import { riskFactor } from "../util/risk-factor";
import { getHealthRecommendations } from "../util/health-recommendations";
import { CustomResponse } from "../@types/custom-response";
import { prisma } from "../..";

export async function Aggr(req: CustomRequest, res: Response): Promise<any> {
  // const appointments = req.body.appointment; // Appointments
  // const files = req.files; // Uploaded files
  // console.log("Appointments:", stringToJson(appointments));

  console.log(req.files);
  res.send({ message: "Success" });
  return res.send(req.ocr);
}

// export async function getRiskFactor(
//   req: CustomRequest,
//   res: Response
// ): Promise<any> {
//   const user = await prisma.user.findUnique({
//     where: { uid: req.user?.uid },
//   });

//   if (!req.user || !user)
//     return res
//       .status(401)
//       .send(new CustomResponse("HealthRecommendation: Unauthorised"));

//   const labResults = await prisma.labResult.findMany({
//     where: { userId: user.id },
//     orderBy: { createdAt: "desc" },
//     distinct: ["name"],
//   });
//   const appointments = await riskFactor(labResults);
//   return res.status(200).send(new CustomResponse("risk factor", appointments));
// }

export async function healthRecommendation(
  req: CustomRequest,
  res: Response
): Promise<any> {
  const user = await prisma.user.findUnique({
    where: { uid: req.user?.uid },
  });

  if (!req.user || !user)
    return res
      .status(401)
      .send(new CustomResponse("HealthRecommendation: Unauthorised"));

  const labResults = await prisma.labResult.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    distinct: ["name"],
  });
  const healthRecommendation = await getHealthRecommendations({
    vitals: labResults,
    body_params: user,
  });
  const appointments = await riskFactor();
  console.log(appointments);
  return res.status(200).send(
    new CustomResponse("Fetched Health Recommendations", {
      riskFactor: appointments,
      recommendations: healthRecommendation,
    })
  );
}
