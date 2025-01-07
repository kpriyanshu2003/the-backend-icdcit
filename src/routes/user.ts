import express from "express";
import { authToken } from "../middlewares/auth";
import { createUser } from "../controllers/user";
const router = express.Router();

router.post("/", authToken, createUser);

export default router;
