import { Request } from "express";
import { DecodedIdToken } from "firebase-admin/auth";

export interface CustomRequest extends Request {
  user?: DecodedIdToken;
  ocr?: OCRResponse[];
}

export interface OCRResponse {
  complaints: string[];
  designation: string[];
  doctorName: string;
  doctorPhone: string;
  medications: string[];
  vitals: [
    {
      name: string;
      value: string;
      unit: string;
    }
  ];
  // vitals: {
  //   BP?: string;
  //   "Pulse Rate"?: string;
  //   "Resp Rate"?: string;
  //   SpO2?: string;
  //   Weight?: string;
  //   BMI?: string;
  //   "Blood Pressure"?: string;
  //   "PT/INR"?: string;
  //   "B-type Natriuretic Peptide"?: string;
  //   Sodium?: string;
  //   Potassium?: string;
  //   "Blood Glucose"?: string;
  //   HbA1c?: string;
  //   "Lipid Profile"?: string;
  //   "Renal Function Tests"?: string;
  //   Creatinine?: string;
  //   eGFR?: string;
  //   Urinalysis?: string;
  //   "Liver Function Tests"?: string;
  //   "Viral Markers"?: string;
  //   TSH?: string;
  //   "Free T3"?: string;
  //   "Free T4"?: string;
  //   CRP?: string;
  //   CBC?: string;
  //   Ferritin?: string;
  //   "Iron Studies"?: string;
  //   ECG?: string;
  //   "Cardiac Enzymes"?: string;
  //   "Bone Density Test"?: string;
  //   "Calcium Levels"?: string;
  //   "Vitamin D"?: string;
  //   "Visual Acuity"?: string;
  //   "Slit Lamp"?: string;
  //   "Retinal Exam"?: string;
  //   Tonometry?: string;
  //   "Culture Tests"?: string;
  //   "Contrast Sensitivity Test"?: string;
  //   Triglycerides?: string;
  //   HDL?: string;
  //   LDL?: string;
  //   VLDL?: string;
  //   "Total Cholesterol"?: string;
  //   Albumin?: string;
  //   Globulin?: string;
  //   "A/G Ratio"?: string;
  //   Bilirubin?: string;
  //   "Alkaline Phosphatase"?: string;
  //   AST?: string;
  //   ALT?: string;
  //   ESR?: string;
  //   "WBC Count"?: string;
  //   "RBC Count"?: string;
  //   "Platelet Count"?: string;
  //   Hemoglobin?: string;
  //   MCV?: string;
  //   MCH?: string;
  //   MCHC?: string;
  //   RDW?: string;
  //   "Serum Calcium"?: string;
  //   "Serum Magnesium"?: string;
  //   "Serum Phosphate"?: string;
  //   "Uric Acid"?: string;
  //   "Folic Acid"?: string;
  //   "Vitamin B12"?: string;
  //   "TSH 3rd Generation"?: string;
  //   "Free Testosterone"?: string;
  //   "Prostate-Specific Antigen"?: string;
  //   "D-Dimer"?: string;
  //   Cortisol?: string;
  //   Amylase?: string;
  //   Lipase?: string;
  //   "Serum Iron"?: string;
  //   "Total Iron-Binding Capacity"?: string;
  //   "Transferrin Saturation"?: string;
  //   "Anti-TPO Antibodies"?: string;
  //   "Rheumatoid Factor"?: string;
  //   ANA?: string;
  //   dsDNA?: string;
  //   ANCA?: string;
  //   "Resp Pattern"?: string;
  //   "Pulse Pattern"?: string;
  //   Temp?: string;
  //   RBS?: string;
  // };
}
