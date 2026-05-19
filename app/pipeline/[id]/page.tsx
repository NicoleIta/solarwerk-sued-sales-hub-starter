import { getPipelineEintrag } from "@/lib/data";
import PipelineDetailClient from "./pipeline-detail-client";
import { notFound } from "next/navigation";

export default async function PipelineDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const eintrag = getPipelineEintrag(Number(id));

  if (!eintrag) notFound();

  return <PipelineDetailClient eintrag={eintrag} />;
}
