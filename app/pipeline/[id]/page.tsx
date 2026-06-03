import { createSupabaseServerClient } from "@/lib/supabase-server";
import PipelineDetailClient from "./pipeline-detail-client";
import { notFound, redirect } from "next/navigation";
import { PipelineEintrag, PipelineStatus } from "@/types";
import { ladeBenutzerPermissions } from "@/lib/permissions";

export default async function PipelineDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { permissions, isAdmin } = await ladeBenutzerPermissions(supabase);
  if (!isAdmin && !permissions.pipeline.read) {
    redirect("/?error=kein-zugriff");
  }

  const { data, error } = await supabase
    .from("pipeline")
    .select("*, kunden(ansprechpartner, branche)")
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  const eintrag: PipelineEintrag = {
    id: 0,
    supabase_uuid: data.id,
    firma: data.titel,
    ansprechpartner: data.kunden?.ansprechpartner ?? "",
    branche: data.kunden?.branche ?? "",
    anlagengroesse_kwp: 0,
    volumen_eur: data.betrag ?? 0,
    angebotsdatum: data.datum ?? "",
    status: data.status as PipelineStatus,
    notiz: data.notizen ?? "",
  };

  const canDelete = isAdmin || permissions.pipeline.delete;

  return <PipelineDetailClient eintrag={eintrag} canDelete={canDelete} />;
}
