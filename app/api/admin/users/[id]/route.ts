import { createSupabaseServerClient } from "@/lib/supabase-server";

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, error: Response.json({ error: "Nicht eingeloggt" }, { status: 401 }) };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { supabase, user, error: Response.json({ error: "Kein Zugriff" }, { status: 403 }) };
  }

  return { supabase, user, error: null };
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();

  // Admin darf sich selbst nicht deaktivieren
  if (id === user!.id && body.aktiv === false) {
    return Response.json({ error: "Du kannst dein eigenes Konto nicht deaktivieren" }, { status: 400 });
  }

  const erlaubteFelder = [
    "vorname", "nachname", "role", "abteilung", "eintrittsdatum",
    "strasse", "plz", "ort", "geburtstag", "telefon",
    "austrittsdatum", "aktiv", "permissions",
  ];

  const datumsFelder = ["eintrittsdatum", "geburtstag", "austrittsdatum"];

  const update: Record<string, unknown> = {};
  for (const feld of erlaubteFelder) {
    if (feld in body) {
      update[feld] = datumsFelder.includes(feld) && body[feld] === "" ? null : body[feld];
    }
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", id);

  if (updateError) {
    return Response.json({ error: updateError.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user, error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  if (id === user!.id) {
    return Response.json({ error: "Du kannst dein eigenes Konto nicht deaktivieren" }, { status: 400 });
  }

  // Kein hartes Löschen — nur deaktivieren
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ aktiv: false })
    .eq("id", id);

  if (updateError) {
    return Response.json({ error: updateError.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
