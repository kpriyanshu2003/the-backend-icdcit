import express from "express";
const route = express.Router();

import { authToken } from "../middlewares/auth";
import { createUser, sampleUser } from "../controllers/user";

// route.post("/", authToken, createUser);
// route.get("/", sampleUser);

export default route;
