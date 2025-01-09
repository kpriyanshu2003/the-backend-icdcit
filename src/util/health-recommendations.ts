import axios from "axios";
import { transformData } from "./transform-body";

export async function getHealthRecommendations(vitals: any) {
  try {
    const data = transformData(vitals);
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "http://127.0.0.1:5001/get_recommendations",
      headers: {},
      data,
    };
    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    console.error("HealthRecommendation:", error);
    throw error;
  }
}
