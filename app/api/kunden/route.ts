import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = await createSupabaseServerClient();

  // Eingeloggten Nutzer ermitteln — dessen UUID kommt in kunden_owner
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Nicht eingeloggt" }, { status: 401 });
  }

  // Neuen Kunden in Supabase anlegen
  const { data: neuerKunde, error: kundeError } = await supabase
    .from("kunden")
    .insert({
      firma: body.firma,
      ansprechpartner: body.ansprechpartner,
      branche: body.branche,
      anlagengroesse_kwp: Number(body.anlagengroesse_kwp),
      status: body.status,
      letzter_kontakt: new Date().toISOString().split("T")[0],
      telefon: body.telefon,
      email: body.email,
      notiz: body.notiz,
    })
    .select("id")
    .single();

  if (kundeError || !neuerKunde) {
    return Response.json({ error: kundeError?.message ?? "Fehler beim Anlegen" }, { status: 500 });
  }

  // Ersteller automatisch als Owner eintragen
  const { error: ownerError } = await supabase
    .from("kunden_owner")
    .insert({ kunden_id: neuerKunde.id, user_id: user.id });

  if (ownerError) {
    return Response.json({ error: ownerError.message }, { status: 500 });
  }

  return Response.json({ ok: true, id: neuerKunde.id });
}
