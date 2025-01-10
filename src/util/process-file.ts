import axios from "axios";
import FormData from "form-data";
import fs from "fs";

export const processFile = async (file: Express.Multer.File) => {
  try {
    const buffer = fs.readFileSync(file.path);
    const data = new FormData();
    data.append("file", buffer, file.originalname);

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "http://127.0.0.1:5002/process-prescription",
      headers: { ...data.getHeaders() },
      data: data,
    };

    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    console.error(`Error processing file: ${file.originalname}`, error);
    throw new Error(`Error processing file: ${file.originalname}`);
  }
};
