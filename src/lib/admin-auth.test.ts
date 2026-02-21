import { describe, it, expect, vi, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { validateAdminRequest } from "./admin-auth";

function createRequest(authHeader?: string): NextRequest {
  const headers = new Headers();
  if (authHeader) {
    headers.set("Authorization", authHeader);
  }
  return new NextRequest("http://localhost:3000/api/admin/test", { headers });
}

describe("validateAdminRequest", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("ADMIN_API_KEY 未設定で 503 を返す", async () => {
    vi.stubEnv("ADMIN_API_KEY", "");

    const result = validateAdminRequest(createRequest("Bearer some-key"));
    expect(result).not.toBeNull();

    const body = await result!.json();
    expect(result!.status).toBe(503);
    expect(body.error).toContain("ADMIN_API_KEY");
  });

  it("Authorization ヘッダーなしで 401 を返す", async () => {
    vi.stubEnv("ADMIN_API_KEY", "test-key");

    const result = validateAdminRequest(createRequest());
    expect(result).not.toBeNull();

    const body = await result!.json();
    expect(result!.status).toBe(401);
    expect(body.error).toContain("認証に失敗");
  });

  it("不正なキーで 401 を返す", async () => {
    vi.stubEnv("ADMIN_API_KEY", "test-key");

    const result = validateAdminRequest(
      createRequest("Bearer wrong-key"),
    );
    expect(result).not.toBeNull();
    expect(result!.status).toBe(401);
  });

  it("正しいキーで null を返す", () => {
    vi.stubEnv("ADMIN_API_KEY", "test-key");

    const result = validateAdminRequest(
      createRequest("Bearer test-key"),
    );
    expect(result).toBeNull();
  });
});
