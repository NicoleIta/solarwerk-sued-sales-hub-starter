import { Suspense } from "react";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { ladeBenutzerPermissions } from "@/lib/permissions";
import DashboardClient from "./dashboard-client";
import type { UserRole } from "@/types";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { role, userId } = await ladeBenutzerPermissions(supabase);

  const { data: usersData } = await supabase
    .from("profiles")
    .select("id, vorname, nachname")
    .eq("aktiv", true)
    .order("nachname", { ascending: true });

  const activeUsers = (usersData ?? []).map((u) => ({
    id: u.id as string,
    vorname: (u.vorname ?? "") as string,
    nachname: (u.nachname ?? "") as string,
  }));

  return (
    <Suspense>
      <DashboardClient
        activeUsers={activeUsers}
        currentUserId={userId ?? ""}
        currentUserRole={(role ?? "viewer") as UserRole}
      />
    </Suspense>
  );
}
