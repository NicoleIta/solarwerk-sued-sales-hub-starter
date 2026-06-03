import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { ladeBenutzerPermissions } from "@/lib/permissions";
import PipelineClient from "./pipeline-client";
import type { UserRole } from "@/types";

export default async function PipelinePage() {
  const supabase = await createSupabaseServerClient();
  const { permissions, isAdmin, role, userId } = await ladeBenutzerPermissions(supabase);
  if (!isAdmin && !permissions.pipeline.read) {
    redirect("/?error=kein-zugriff");
  }

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
    <PipelineClient
      activeUsers={activeUsers}
      currentUserId={userId ?? ""}
      currentUserRole={(role ?? "viewer") as UserRole}
    />
  );
}
