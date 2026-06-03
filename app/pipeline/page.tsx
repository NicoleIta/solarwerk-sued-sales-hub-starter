import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { ladeBenutzerPermissions } from "@/lib/permissions";
import PipelineClient from "./pipeline-client";

export default async function PipelinePage() {
  const supabase = await createSupabaseServerClient();
  const { permissions, isAdmin } = await ladeBenutzerPermissions(supabase);
  if (!isAdmin && !permissions.pipeline.read) {
    redirect("/?error=kein-zugriff");
  }
  return <PipelineClient />;
}
