import { supabase } from "@/lib/supabase";
import PipelineDetailClient from "./pipeline-detail-client";
import { notFound } from "next/navigation";
import { PipelineEintrag, PipelineStatus } from "@/types";

export default async function PipelineDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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

  return <PipelineDetailClient eintrag={eintrag} />;
}
