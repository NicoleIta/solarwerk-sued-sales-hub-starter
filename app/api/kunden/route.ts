import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { Kunde } from "@/types";

export async function POST(request: Request) {
  const body = await request.json();

  const filePath = path.join(process.cwd(), "data", "solarwerk_kunden.csv");
  const csv = fs.readFileSync(filePath, "utf-8");
  const result = Papa.parse<Kunde>(csv, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  const kunden = result.data;
  const hoechsteId = kunden.reduce((max, k) => Math.max(max, k.id), 0);

  const neuerKunde: Kunde = {
    id: hoechsteId + 1,
    firma: body.firma,
    ansprechpartner: body.ansprechpartner,
    branche: body.branche,
    anlagengroesse_kwp: Number(body.anlagengroesse_kwp),
    status: body.status,
    letzter_kontakt: new Date().toISOString().split("T")[0],
    telefon: body.telefon,
    email: body.email,
    notiz: body.notiz,
  };

  kunden.push(neuerKunde);

  const neueCsv = Papa.unparse(kunden);
  fs.writeFileSync(filePath, neueCsv, "utf-8");

  return Response.json({ ok: true, id: neuerKunde.id });
}
