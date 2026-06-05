import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase-server";
import { UserPermissions } from "@/types";
import { DEFAULT_PERMISSIONS } from "@/lib/permissions";

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null, error: Response.json({ error: "Nicht eingeloggt" }, { status: 401 }) };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { supabase, user, profile, error: Response.json({ error: "Kein Zugriff" }, { status: 403 }) };
  }

  return { supabase, user, profile, error: null };
}

export async function GET() {
  const { supabase, error } = await requireAdmin();
  if (error) return error;

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .order("nachname", { ascending: true });

  if (profilesError) {
    return Response.json({ error: profilesError.message }, { status: 500 });
  }

  return Response.json({ profiles });
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json({ error: "SUPABASE_SERVICE_ROLE_KEY fehlt in .env.local" }, { status: 500 });
  }

  const body = await request.json();
  const { vorname, nachname, email, role, abteilung, eintrittsdatum,
          strasse, plz, ort, geburtstag, telefon, austrittsdatum, temp_password } = body;

  if (!vorname || !nachname || !email || !role || !abteilung || !eintrittsdatum) {
    return Response.json({ error: "Pflichtfelder fehlen" }, { status: 400 });
  }
  if (!temp_password) {
    return Response.json({ error: "Temp-Passwort ist erforderlich" }, { status: 400 });
  }

  const adminClient = createSupabaseAdminClient();

  // Auth-User anlegen mit Temp-Passwort
  const { data: { user: newAuthUser }, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password: temp_password,
    email_confirm: true,
  });

  let authUserId: string;

  if (authError) {
    if (authError.message.includes("already registered")) {
      // Auth-User existiert — prüfe ob Profil vorhanden
      const { data: { users } } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
      const existing = users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
      if (!existing) {
        return Response.json({ error: "Diese E-Mail ist bereits vergeben" }, { status: 409 });
      }
      const { data: existingProfile } = await adminClient
        .from("profiles")
        .select("id")
        .eq("id", existing.id)
        .maybeSingle();
      if (existingProfile) {
        return Response.json({ error: "Diese E-Mail ist bereits vergeben" }, { status: 409 });
      }
      // Auth-User ohne Profil → Profil jetzt anlegen
      authUserId = existing.id;
    } else {
      return Response.json({ error: authError.message }, { status: 500 });
    }
  } else {
    authUserId = newAuthUser!.id;
  }

  // Profil anlegen — bei Fehler Auth-User wieder löschen (Rollback)
  const { error: profileError } = await adminClient
    .from("profiles")
    .insert({
      id: authUserId,
      name: `${vorname} ${nachname}`,
      email,
      role,
      vorname,
      nachname,
      abteilung,
      eintrittsdatum,
      strasse: strasse || null,
      plz: plz || null,
      ort: ort || null,
      geburtstag: geburtstag || null,
      telefon: telefon || null,
      austrittsdatum: austrittsdatum || null,
      aktiv: true,
      permissions: body.permissions ?? DEFAULT_PERMISSIONS,
      temp_password,
      muss_passwort_aendern: true,
    });

  if (profileError) {
    // Rollback: neu angelegten Auth-User wieder löschen
    if (!authError) {
      await adminClient.auth.admin.deleteUser(authUserId);
    }
    return Response.json({ error: profileError.message }, { status: 500 });
  }

  return Response.json({ ok: true, id: authUserId });
}
