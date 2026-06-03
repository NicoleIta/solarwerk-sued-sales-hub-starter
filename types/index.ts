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
  supabase_uuid?: string;
  firma: string;
  ansprechpartner: string;
  branche: string;
  anlagengroesse_kwp: number;
  volumen_eur: number;
  angebotsdatum: string;
  status: PipelineStatus;
  notiz: string;
}

export type AktivitaetTyp = 'Anruf' | 'E-Mail' | 'Notiz' | 'Besuch/Termin';

export interface Aktivitaet {
  id: string;
  kunde_id: string;
  typ: AktivitaetTyp;
  betreff: string;
  inhalt: string | null;
  erstellt_von: string;
  erstellt_am: string;
}

export type UserRole = 'admin' | 'teamleiter' | 'manager' | 'sales' | 'viewer';

export interface BereichPermission {
  read: boolean;
  edit: boolean;
  delete: boolean;
}

export interface UserPermissions {
  kunden:             BereichPermission;
  pipeline:           BereichPermission;
  berichte:           BereichPermission;
  benutzerverwaltung: BereichPermission;
}

export interface UserProfile {
  id: string;
  email: string;
  vorname: string | null;
  nachname: string | null;
  role: UserRole;
  abteilung: string | null;
  eintrittsdatum: string | null;
  strasse: string | null;
  plz: string | null;
  ort: string | null;
  geburtstag: string | null;
  telefon: string | null;
  profilbild_url: string | null;
  austrittsdatum: string | null;
  aktiv: boolean;
  permissions: UserPermissions;
  temp_password: string | null;
  muss_passwort_aendern: boolean;
}
