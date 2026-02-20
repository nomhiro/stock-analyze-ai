import { AzureOpenAI } from "openai";

let clientInstance: AzureOpenAI | null = null;

export function getAzureOpenAIClient(): AzureOpenAI {
  if (clientInstance) return clientInstance;

  clientInstance = new AzureOpenAI({
    endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
    apiKey: process.env.AZURE_OPENAI_API_KEY!,
    apiVersion:
      process.env.AZURE_OPENAI_API_VERSION || "2025-04-01-preview",
    deployment: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-51",
  });

  return clientInstance;
}

export async function streamAnalysis(
  systemPrompt: string,
  userPrompt: string,
): Promise<ReadableStream> {
  const client = getAzureOpenAIClient();

  const stream = await client.chat.completions.create({
    model: "",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 4096,
    // GPT-5 series: temperature is not supported
    stream: true,
  });

  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }
      } finally {
        controller.close();
      }
    },
  });
}
