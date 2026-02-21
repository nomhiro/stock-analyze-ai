# Fix: TypeScript build error in TSE stocks update route

## Context

Azure Static Web Apps の CI/CD ビルドが TypeScript コンパイルエラーで失敗している。

```
./src/app/api/admin/tse-stocks/update/route.ts:51:39
Type error: Property 'code' does not exist on type 'Error'.
```

## 原因

[route.ts:51](src/app/api/admin/tse-stocks/update/route.ts#L51) で `error instanceof Error` チェック後に `error.code` にアクセスしているが、TypeScript の標準 `Error` 型には `code` プロパティが存在しない。`code` は `NodeJS.ErrnoException` 型のプロパティ。

## 修正

**対象ファイル**: `src/app/api/admin/tse-stocks/update/route.ts`

Line 51 を以下に変更:

```typescript
error instanceof Error && (error as NodeJS.ErrnoException).code === "EROFS"
```

## 検証

```bash
npm run build
```

ビルドが成功することを確認する。
