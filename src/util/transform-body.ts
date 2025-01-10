export function transformData(input: {
  vitals: {
    id: string;
    name: string;
    value: string;
    prediction: string | null;
    unit: string | null;
    referenceRange: string | null;
    createdAt: string;
    appointmentId: string;
    userId: string;
  }[];
  body_params: {
    id: string;
    age: number;
    gender: string; // "Male" or "Female"
    height: string;
    weight: string;
    bmi: number;
    email: string;
    uid: string;
    createdAt: string;
    updatedAt: string;
  };
}): {
  vitals: Record<string, any>;
  body_params: {
    age: number;
    gender: string; // "M" or "F"
    bmi: number;
    weight: number;
    height: number;
  };
} {
  // Transform vitals into dynamic key-value pairs
  const vitals = input.vitals.reduce((acc, vital) => {
    const key = vital.name.toLowerCase().replace(/\s+/g, "_"); // Convert "BP" to "bp", "Pulse Rate" to "pulse_rate", etc.

    if (vital.name === "BP") {
      // Handle special case for blood pressure
      const [systolic, diastolic] = vital.value
        .split(" ")[0]
        .split("/")
        .map(Number);
      acc[key] = [systolic, diastolic];
    } else {
      // General case for other vitals
      const value = parseFloat(vital.value) || vital.value.split(" ")[0]; // Attempt to parse numbers, else take the first word
      acc[key] = isNaN(Number(value)) ? value : Number(value); // Convert to number if numeric
    }

    return acc;
  }, {} as Record<string, any>);

  // Transform body_params into the desired format
  const body_params = {
    age: input.body_params.age,
    gender: input.body_params.gender === "Male" ? "M" : "F", // Convert gender
    bmi: input.body_params.bmi,
    weight: parseFloat(input.body_params.weight),
    height: parseFloat(input.body_params.height),
  };
  console.log(vitals);
  return { vitals, body_params };
}
