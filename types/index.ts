export type KundenStatus = 'aktiv' | 'in_wartung' | 'beschwerde';

export type PipelineStatus = 'erstkontakt' | 'angebot_raus' | 'verhandlung' | 'gewonnen' | 'verloren';

export interface Kunde {
  id: number;
  supabase_uuid?: string;
  firma: string;
  ansprechpartner: string;
  branche: string;
  anlagengroesse_kwp: number;
  status: KundenStatus;
  letzter_kontakt: string;
  telefon: string;
  email: string;
  notiz: string;
}

export interface PipelineEintrag {
  id: number;
  firma: string;
  ansprechpartner: string;
  branche: string;
  anlagengroesse_kwp: number;
  volumen_eur: number;
  angebotsdatum: string;
  status: PipelineStatus;
  notiz: string;
}
