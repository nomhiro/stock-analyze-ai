import { NextRequest, NextResponse } from "next/server";

/**
 * 管理者 API リクエストの認証を検証する。
 * 認証成功時は null を返し、失敗時はエラー NextResponse を返す。
 */
export function validateAdminRequest(
  request: NextRequest,
): NextResponse | null {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) {
    return NextResponse.json(
      { error: "管理機能が設定されていません（ADMIN_API_KEYが未設定）" },
      { status: 503 },
    );
  }

  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${adminKey}`) {
    return NextResponse.json(
      { error: "認証に失敗しました" },
      { status: 401 },
    );
  }

  return null;
}
