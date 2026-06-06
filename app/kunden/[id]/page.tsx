import { createSupabaseServerClient } from "@/lib/supabase-server";
import KundeDetailClient from "./kunde-detail-client";
import { notFound, redirect } from "next/navigation";
import { Aktivitaet, Kunde, PipelineEintrag } from "@/types";
import { ladeBenutzerPermissions } from "@/lib/permissions";
import { computeKundeStatus } from "@/lib/pipeline-rules";

export default async function KundenDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { permissions, isAdmin } = await ladeBenutzerPermissions(supabase);
  if (!isAdmin && !permissions.kunden.read) {
    redirect("/?error=kein-zugriff");
  }

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
    created_at: data.created_at,
  };

  const [{ data: pipelineData }, { data: aktivitaetenData }, { data: { session } }] =
    await Promise.all([
      supabase.from("pipeline").select("*").eq("firma", data.firma),
      supabase
        .from("aktivitaeten")
        .select("*")
        .eq("kunde_id", data.id)
        .order("erstellt_am", { ascending: false }),
      supabase.auth.getSession(),
    ]);

  const canDelete = isAdmin || permissions.kunden.delete;
  const pipelineEintraege = (pipelineData ?? []) as PipelineEintrag[];
  const aktivitaeten = (aktivitaetenData ?? []) as Aktivitaet[];
  const pipelineStatus = computeKundeStatus(kunde, aktivitaeten, pipelineEintraege);

  return (
    <KundeDetailClient
      kunde={kunde}
      pipelineEintraege={pipelineEintraege}
      aktivitaeten={aktivitaeten}
      currentUserId={session?.user.id ?? ""}
      canDelete={canDelete}
      pipelineStatus={pipelineStatus}
    />
  );
}
