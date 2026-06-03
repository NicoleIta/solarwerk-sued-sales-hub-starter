import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { UserProfile } from "@/types";
import UsersClient from "./users-client";

export default async function AdminUsersPage() {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (currentProfile?.role !== "admin") {
    redirect("/?error=kein-zugriff");
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("nachname", { ascending: true });

  // E-Mail aus auth.users via Admin-API ist clientseitig nicht verfügbar —
  // E-Mail wird pro Profil separat geladen wo vorhanden, sonst leer
  const userProfiles: UserProfile[] = (profiles ?? []).map((p) => ({
    id: p.id,
    email: p.email ?? "",
    vorname: p.vorname ?? null,
    nachname: p.nachname ?? null,
    role: p.role,
    abteilung: p.abteilung ?? null,
    eintrittsdatum: p.eintrittsdatum ?? null,
    strasse: p.strasse ?? null,
    plz: p.plz ?? null,
    ort: p.ort ?? null,
    geburtstag: p.geburtstag ?? null,
    telefon: p.telefon ?? null,
    profilbild_url: p.profilbild_url ?? null,
    austrittsdatum: p.austrittsdatum ?? null,
    aktiv: p.aktiv ?? true,
    permissions: p.permissions ?? {
      kunden:             { read: true,  edit: false, delete: false },
      pipeline:           { read: true,  edit: false, delete: false },
      berichte:           { read: true,  edit: false, delete: false },
      benutzerverwaltung: { read: false, edit: false, delete: false },
    },
    temp_password: p.temp_password ?? null,
    muss_passwort_aendern: p.muss_passwort_aendern ?? false,
  }));

  return (
    <UsersClient
      profiles={userProfiles}
      currentUserId={user.id}
    />
  );
}
