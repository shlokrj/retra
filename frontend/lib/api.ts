export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type PredictResult = {
  prediction: string;
  class_id: number;
  confidence: number;
  probabilities: Record<string, number>;
  heatmap_url: string;
};

type ErrorResponse = {
  detail?: unknown;
};

export async function predict(file: File): Promise<PredictResult> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_URL}/predict`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    throw new Error(await getErrorMessage(res));
  }
  return res.json();
}

async function getErrorMessage(res: Response) {
  try {
    const data = (await res.json()) as ErrorResponse;
    if (typeof data.detail === "string") {
      return data.detail;
    }
  } catch {
    // fall through to the status-based message
  }

  return `prediction failed (${res.status})`;
}
