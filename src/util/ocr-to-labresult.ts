export function formatVitalsToLabResults(
  vitals: Record<string, string | undefined>
) {
  const labResults = [];

  for (const [key, value] of Object.entries(vitals)) {
    if (value !== undefined) {
      labResults.push({
        name: key,
        value: value,
      });
    }
  }
  return labResults;
}
