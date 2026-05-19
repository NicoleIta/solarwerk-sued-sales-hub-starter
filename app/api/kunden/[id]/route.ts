import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { Kunde } from "@/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const filePath = path.join(process.cwd(), "data", "solarwerk_kunden.csv");
  const csv = fs.readFileSync(filePath, "utf-8");
  const result = Papa.parse<Kunde>(csv, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  const kunden = result.data.map((k) =>
    k.id === Number(id) ? { ...k, ...body } : k
  );

  fs.writeFileSync(filePath, Papa.unparse(kunden), "utf-8");

  return Response.json({ ok: true });
}
