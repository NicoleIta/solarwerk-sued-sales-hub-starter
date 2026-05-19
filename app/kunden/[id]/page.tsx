import { getKunde, getPipeline } from "@/lib/data";
import KundeDetailClient from "./kunde-detail-client";

export default async function KundenDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const kunde = getKunde(Number(id));

  if (!kunde) {
    return <p>Kunde nicht gefunden</p>;
  }

  const pipelineEintraege = getPipeline().filter(
    (e) => e.firma === kunde.firma
  );

  return <KundeDetailClient kunde={kunde} pipelineEintraege={pipelineEintraege} />;
}
