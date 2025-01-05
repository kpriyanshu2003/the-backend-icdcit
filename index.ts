import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import compress from "compression";
import express, { Response, Request } from "express";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const app = express();
const port = process.env.PORT || 3300;
export const prisma = new PrismaClient();

app.use(compress());
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/", (req: Request, res: Response) => {
  res
    .status(200)
    .send({ status: 200, message: "Sentinel Safe API is working fine!" });
});

app.use((err: Error, req: Request, res: Response) => {
  console.error(err);
  res.status(500).send({ message: "Something Broke!" });
});

export default app;
