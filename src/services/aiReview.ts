interface ReviewInputs {
  purpose: string;
  example_code?: string;
  user_code: string;
}

export interface ReviewStreamPayload {
  inputs: ReviewInputs;
  response_mode?: string;
  user?: string;
}

export async function streamCodeReview(
  payload: ReviewStreamPayload,
  onChunk: (chunk: string) => void
): Promise<void> {
  const response = await fetch("https://ai-code-service.ript.vn/review_stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok || !response.body) {
    throw new Error("Không thể gọi API đánh giá code");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    if (chunk) {
      onChunk(chunk);
    }
  }
}
