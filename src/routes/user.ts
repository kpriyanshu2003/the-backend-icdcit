import express from "express";
const route = express.Router();

import { authToken } from "../middlewares/auth";
import { createUser, sampleUser,createUserWithEmailPassword } from "../controllers/user";

route.post("/", authToken, createUser);
route.get("/", sampleUser);
route.post("/create", createUserWithEmailPassword);

export default route;
