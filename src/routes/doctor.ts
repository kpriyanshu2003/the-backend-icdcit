import express from "express";
import { authToken } from "../middlewares/auth";
import {
  getDoctor,
  getDoctorWithRating,
  updateDoctor,
} from "../controllers/doctor";

const router = express.Router();

router.get("/", authToken, getDoctor);
router.patch("/:id", authToken, updateDoctor);
router.get("/rating", getDoctorWithRating);

export default router;
