import { NextRequest, NextResponse } from "next/server";
import { getKunden } from "@/lib/data";

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email: string = body.email ?? "";

  if (!email.trim()) {
    return NextResponse.json({ treffer: null });
  }

  const kunden = getKunden();
  const schwellenwert = email.length <= 10 ? 2 : 3;

  for (const kunde of kunden) {
    if (!kunde.email) continue;
    const dist = levenshtein(email.toLowerCase(), kunde.email.toLowerCase());
    if (dist > 0 && dist <= schwellenwert) {
      return NextResponse.json({
        treffer: { name: kunde.ansprechpartner, firma: kunde.firma },
      });
    }
  }

  return NextResponse.json({ treffer: null });
}
