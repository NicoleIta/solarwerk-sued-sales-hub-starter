export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { ladeBenutzerPermissions } from "@/lib/permissions";
import { getKunden, getPipeline } from "@/lib/data";
import BerichteClient from "./berichte-client";

export default async function BerichtePage() {
  const supabase = await createSupabaseServerClient();
  const { permissions, isAdmin } = await ladeBenutzerPermissions(supabase);
  if (!isAdmin && !permissions.berichte.read) {
    redirect("/?error=kein-zugriff");
  }
  const kunden = await getKunden();
  const pipeline = getPipeline();
  return <BerichteClient kunden={kunden} pipeline={pipeline} />;
}
