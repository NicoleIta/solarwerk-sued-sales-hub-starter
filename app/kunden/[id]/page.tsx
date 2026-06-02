import { createSupabaseServerClient } from "@/lib/supabase-server";
import KundeDetailClient from "./kunde-detail-client";
import { notFound } from "next/navigation";
import { Kunde, PipelineEintrag } from "@/types";

export default async function KundenDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("kunden")
    .select("*")
    .eq("int_id", Number(id))
    .single();

  if (error || !data) notFound();

  const kunde: Kunde = {
    id: data.int_id,
    supabase_uuid: data.id,
    firma: data.firma,
    ansprechpartner: data.ansprechpartner,
    branche: data.branche,
    anlagengroesse_kwp: data.anlagengroesse_kwp,
    status: data.status,
    letzter_kontakt: data.letzter_kontakt,
    telefon: data.telefon,
    email: data.email,
    notiz: data.notiz,
  };

  const { data: pipelineData } = await supabase
    .from("pipeline")
    .select("*")
    .eq("firma", data.firma);

  return (
    <KundeDetailClient
      kunde={kunde}
      pipelineEintraege={(pipelineData ?? []) as PipelineEintrag[]}
    />
  );
}
