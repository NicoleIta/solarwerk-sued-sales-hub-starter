import { getKunde, getPipeline } from "@/lib/data";
import KundeDetailClient from "./kunde-detail-client";
import { notFound } from "next/navigation";

export default async function KundenDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const kunde = await getKunde(Number(id));

  if (!kunde) notFound();

  const pipelineEintraege = getPipeline().filter(
    (e) => e.firma === kunde.firma
  );

  return <KundeDetailClient kunde={kunde} pipelineEintraege={pipelineEintraege} />;
}
