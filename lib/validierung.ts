export type NeuerKundeInput = {
  firma: string
  ansprechpartner: string
  telefon: string
  email: string
}

export type Validierungsfehler = {
  feld: keyof NeuerKundeInput
  meldung: string
}

export function validiereNeuerKunde(input: NeuerKundeInput): Validierungsfehler[] {
  const fehler: Validierungsfehler[] = []

  if (!input.firma.trim()) {
    fehler.push({ feld: 'firma', meldung: 'Firma ist ein Pflichtfeld' })
  }
  if (!input.ansprechpartner.trim()) {
    fehler.push({ feld: 'ansprechpartner', meldung: 'Ansprechpartner ist ein Pflichtfeld' })
  }
  if (!input.email.trim()) {
    fehler.push({ feld: 'email', meldung: 'E-Mail ist ein Pflichtfeld' })
  }
  if (!input.telefon.trim()) {
    fehler.push({ feld: 'telefon', meldung: 'Telefon ist ein Pflichtfeld' })
  }

  return fehler
}

export function istGueltig(input: NeuerKundeInput): boolean {
  return validiereNeuerKunde(input).length === 0
}
