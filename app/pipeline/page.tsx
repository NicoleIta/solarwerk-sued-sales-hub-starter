export const dynamic = "force-dynamic";

import { getPipeline } from "@/lib/data";
import PipelineClient from "./pipeline-client";

export default function PipelinePage() {
  const eintraege = getPipeline();

  return <PipelineClient eintraege={eintraege} />;
}
