import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { Kunde, PipelineEintrag } from '@/types';

function ladeKundenAusCsv(): Kunde[] {
  const filePath = path.join(process.cwd(), 'data', 'solarwerk_kunden.csv');
  const csv = fs.readFileSync(filePath, 'utf-8');
  const result = Papa.parse<Kunde>(csv, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });
  return result.data;
}

const VALID_MODES = ['normal', 'loading', 'error', 'empty'] as const;
type MockMode = typeof VALID_MODES[number];

export async function getKunden(): Promise<Kunde[]> {
  if (process.env.NODE_ENV === 'development') {
    const rawMode = process.env.NEXT_PUBLIC_MOCK_MODE;
    const mockMode: MockMode = VALID_MODES.includes(rawMode as MockMode)
      ? (rawMode as MockMode)
      : 'normal';

    if (mockMode === 'loading') {
      await new Promise((r) => setTimeout(r, 1500));
      return ladeKundenAusCsv();
    }
    if (mockMode === 'error') throw new Error('Mock-Fehler');
    if (mockMode === 'empty') return [];
  }
  return ladeKundenAusCsv();
}

export async function getKunde(id: number): Promise<Kunde | null> {
  const kunden = await getKunden();
  return kunden.find((k) => k.id === id) ?? null;
}

export function getPipelineEintrag(id: number): PipelineEintrag | null {
  const eintraege = getPipeline();
  return eintraege.find((e) => e.id === id) ?? null;
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
