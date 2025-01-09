import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import compress from "compression";
import express, { Response } from "express";
import { PrismaClient } from "@prisma/client";
import router from "./src/routes";
import { CustomRequest } from "./src/@types/express";

dotenv.config();
const app = express();
const port = process.env.PORT || 3300;
export const prisma = new PrismaClient();

app.use(compress());
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/public", express.static("./src/uploads"));

app.use("/", router);
app.use("/", (req: CustomRequest, res: Response) => {
  res
    .status(200)
    .send({ status: 200, message: "Digital Health API is working fine!" });
});

app.use((err: Error, req: CustomRequest, res: Response) => {
  console.error(err);
  res.status(500).send({ message: "Something Broke!" });
});

app.listen(port, () => console.log(`Server is running on port ${port}`));

export default app;
