import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { PipelineEintrag } from "@/types";

export async function POST(request: Request) {
  const body = await request.json();

  const filePath = path.join(process.cwd(), "data", "solarwerk_pipeline.csv");
  const csv = fs.readFileSync(filePath, "utf-8");
  const result = Papa.parse<PipelineEintrag>(csv, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  const eintraege = result.data;
  const hoechsteId = eintraege.reduce((max, e) => Math.max(max, e.id), 0);

  const neuerEintrag: PipelineEintrag = {
    id: hoechsteId + 1,
    firma: body.firma,
    ansprechpartner: body.ansprechpartner,
    branche: body.branche,
    anlagengroesse_kwp: Number(body.anlagengroesse_kwp),
    volumen_eur: Number(body.volumen_eur),
    angebotsdatum: body.angebotsdatum,
    status: body.status,
    notiz: body.notiz,
  };

  eintraege.push(neuerEintrag);
  fs.writeFileSync(filePath, Papa.unparse(eintraege), "utf-8");

  return Response.json({ ok: true, id: neuerEintrag.id });
}
