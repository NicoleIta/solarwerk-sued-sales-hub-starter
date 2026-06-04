import { describe, it, expect } from 'vitest'
import { validiereNeuerKunde, istGueltig } from './validierung'

const gueltigeEingabe = {
  firma: 'Musterfirma GmbH',
  ansprechpartner: 'Max Muster',
  email: 'max@musterfirma.de',
  branche: 'Gewerbe',
}

describe('validiereNeuerKunde', () => {
  it('gibt keine Fehler bei gültiger Eingabe zurück', () => {
    const fehler = validiereNeuerKunde(gueltigeEingabe)
    expect(fehler).toHaveLength(0)
  })

  it('meldet Fehler wenn Firma fehlt', () => {
    const fehler = validiereNeuerKunde({ ...gueltigeEingabe, firma: '' })
    expect(fehler).toHaveLength(1)
    expect(fehler[0].feld).toBe('firma')
  })

  it('meldet Fehler wenn Ansprechpartner fehlt', () => {
    const fehler = validiereNeuerKunde({ ...gueltigeEingabe, ansprechpartner: '' })
    expect(fehler).toHaveLength(1)
    expect(fehler[0].feld).toBe('ansprechpartner')
  })

  it('meldet Fehler wenn E-Mail fehlt', () => {
    const fehler = validiereNeuerKunde({ ...gueltigeEingabe, email: '' })
    expect(fehler).toHaveLength(1)
    expect(fehler[0].feld).toBe('email')
  })

  it('meldet mehrere Fehler wenn mehrere Felder fehlen', () => {
    const fehler = validiereNeuerKunde({ firma: '', ansprechpartner: '', email: '', branche: '' })
    expect(fehler).toHaveLength(4)
  })

  it('behandelt Leerzeichen wie leere Felder', () => {
    const fehler = validiereNeuerKunde({ ...gueltigeEingabe, firma: '   ' })
    expect(fehler).toHaveLength(1)
    expect(fehler[0].feld).toBe('firma')
  })
})

describe('istGueltig', () => {
  it('gibt true bei vollständiger Eingabe zurück', () => {
    expect(istGueltig(gueltigeEingabe)).toBe(true)
  })

  it('gibt false bei fehlender Pflichtangabe zurück', () => {
    expect(istGueltig({ ...gueltigeEingabe, email: '' })).toBe(false)
  })
})
