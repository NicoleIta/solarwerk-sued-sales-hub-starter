import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { Kunde, PipelineEintrag } from "@/types";

export function getKunden(): Kunde[] {
  const filePath = path.join(process.cwd(), 'data', 'solarwerk_kunden.csv');
  const csv = fs.readFileSync(filePath, 'utf-8');
  const result = Papa.parse<Kunde>(csv, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });
  return result.data;
}

export function getPipeline(): PipelineEintrag[] {
  const filePath = path.join(process.cwd(), 'data', 'solarwerk_pipeline.csv');
  const csv = fs.readFileSync(filePath, 'utf-8');
  const result = Papa.parse<PipelineEintrag>(csv, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });
  return result.data;
}
