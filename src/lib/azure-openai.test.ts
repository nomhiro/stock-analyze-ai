import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCreate = vi.fn();

vi.mock("openai", () => ({
  AzureOpenAI: class MockAzureOpenAI {
    chat = {
      completions: {
        create: mockCreate,
      },
    };
  },
}));

import { streamAnalysis, getAzureOpenAIClient } from "./azure-openai";

describe("getAzureOpenAIClient", () => {
  it("AzureOpenAI クライアントインスタンスを返す", () => {
    const client = getAzureOpenAIClient();
    expect(client).toBeDefined();
    expect(client.chat.completions.create).toBeDefined();
  });
});

describe("streamAnalysis", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("max_completion_tokens パラメータで API を呼び出す", async () => {
    const mockStream = {
      async *[Symbol.asyncIterator]() {
        yield { choices: [{ delta: { content: "テスト" } }] };
      },
    };
    mockCreate.mockResolvedValue(mockStream);

    await streamAnalysis("システムプロンプト", "ユーザープロンプト");

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        max_completion_tokens: 4096,
        stream: true,
        messages: [
          { role: "system", content: "システムプロンプト" },
          { role: "user", content: "ユーザープロンプト" },
        ],
      }),
    );
    expect(mockCreate).not.toHaveBeenCalledWith(
      expect.objectContaining({ max_tokens: expect.any(Number) }),
    );
  });

  it("ReadableStream を返す", async () => {
    const mockStream = {
      async *[Symbol.asyncIterator]() {
        yield { choices: [{ delta: { content: "分析" } }] };
        yield { choices: [{ delta: { content: "結果" } }] };
      },
    };
    mockCreate.mockResolvedValue(mockStream);

    const stream = await streamAnalysis("system", "user");

    expect(stream).toBeInstanceOf(ReadableStream);

    const reader = stream.getReader();
    const decoder = new TextDecoder();
    const chunks: string[] = [];

    let done = false;
    while (!done) {
      const result = await reader.read();
      done = result.done;
      if (result.value) {
        chunks.push(decoder.decode(result.value));
      }
    }

    expect(chunks).toEqual(["分析", "結果"]);
  });
});
