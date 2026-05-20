export type Nutzer = {
  id: string;
  name: string;
  email: string;
  passwort: string;
};

export const NUTZER: Nutzer[] = [
  { id: "1", name: "Nicole Ita",   email: "nicole@solarwerk-sued.de",  passwort: "solar2024"   },
  { id: "2", name: "Felix Berger", email: "felix@solarwerk-sued.de",   passwort: "energie123"  },
  { id: "3", name: "Markus Klein", email: "markus@solarwerk-sued.de",  passwort: "sonne456"    },
];

export function verifyNutzer(eingabe: string, passwort: string): Nutzer | null {
  return (
    NUTZER.find(
      (u) =>
        (u.email === eingabe || u.name === eingabe) &&
        u.passwort === passwort
    ) ?? null
  );
}
