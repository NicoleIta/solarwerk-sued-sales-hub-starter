import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserPermissions, UserRole } from "@/types";

export const DEFAULT_PERMISSIONS: UserPermissions = {
  kunden:             { read: true,  edit: false, delete: false },
  pipeline:           { read: true,  edit: false, delete: false },
  berichte:           { read: true,  edit: false, delete: false },
  benutzerverwaltung: { read: false, edit: false, delete: false },
};

export async function ladeBenutzerPermissions(supabase: SupabaseClient): Promise<{
  permissions: UserPermissions;
  role: UserRole | null;
  isAdmin: boolean;
}> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    return { permissions: DEFAULT_PERMISSIONS, role: null, isAdmin: false };
  }

  const { data } = await supabase
    .from("profiles")
    .select("role, permissions")
    .eq("id", session.user.id)
    .single();

  const role = (data?.role ?? null) as UserRole | null;
  const isAdmin = role === "admin";
  const permissions: UserPermissions = data?.permissions ?? DEFAULT_PERMISSIONS;

  return { permissions, role, isAdmin };
}
