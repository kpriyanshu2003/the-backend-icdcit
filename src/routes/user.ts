import express from "express";
const route = express.Router();

import { authToken } from "../middlewares/auth";
import { createUser } from "../controllers/user";

route.post("/", createUser);
// route.post("/create", createUserWithEmailPassword);

export default route;
