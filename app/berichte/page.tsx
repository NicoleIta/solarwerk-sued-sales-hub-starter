export const dynamic = "force-dynamic";

import { getKunden, getPipeline } from "@/lib/data";
import BerichteClient from "./berichte-client";

export default function BerichtePage() {
  const kunden = getKunden();
  const pipeline = getPipeline();
  return <BerichteClient kunden={kunden} pipeline={pipeline} />;
}
