import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return Response.json({ error: "Nicht eingeloggt" }, { status: 401 });
  }
  const user = session.user;

  const body = await request.json();
  const { neues_passwort, bestaetigung } = body;

  if (!neues_passwort || !bestaetigung) {
    return Response.json({ error: "Alle Felder sind erforderlich" }, { status: 400 });
  }
  if (neues_passwort !== bestaetigung) {
    return Response.json({ error: "Passwörter stimmen nicht überein" }, { status: 400 });
  }
  if (neues_passwort.length < 8) {
    return Response.json({ error: "Mindestens 8 Zeichen erforderlich" }, { status: 400 });
  }

  const adminClient = createSupabaseAdminClient();

  const { error: authError } = await adminClient.auth.admin.updateUserById(user.id, {
    password: neues_passwort,
  });
  if (authError) {
    return Response.json({ error: authError.message }, { status: 500 });
  }

  const { error: profileError } = await adminClient
    .from("profiles")
    .update({ temp_password: neues_passwort, muss_passwort_aendern: false })
    .eq("id", user.id);

  if (profileError) {
    return Response.json({ error: profileError.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
