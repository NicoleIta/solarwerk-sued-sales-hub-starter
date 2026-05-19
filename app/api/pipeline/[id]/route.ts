import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { PipelineEintrag } from "@/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const filePath = path.join(process.cwd(), "data", "solarwerk_pipeline.csv");
  const csv = fs.readFileSync(filePath, "utf-8");
  const result = Papa.parse<PipelineEintrag>(csv, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  const eintraege = result.data.map((e) =>
    e.id === Number(id) ? { ...e, ...body } : e
  );

  fs.writeFileSync(filePath, Papa.unparse(eintraege), "utf-8");

  return Response.json({ ok: true });
}
