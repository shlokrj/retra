export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type PredictResult = {
  prediction: string;
  class_id: number;
  confidence: number;
  probabilities: Record<string, number>;
  heatmap_url: string;
};

export async function predict(file: File): Promise<PredictResult> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_URL}/predict`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    throw new Error(`prediction failed (${res.status})`);
  }
  return res.json();
}
