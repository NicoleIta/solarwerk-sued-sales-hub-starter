export const dynamic = "force-dynamic";

import { getKunden, getPipeline } from "@/lib/data";
import BerichteClient from "./berichte-client";

export default async function BerichtePage() {
  const kunden = await getKunden();
  const pipeline = getPipeline();
  return <BerichteClient kunden={kunden} pipeline={pipeline} />;
}
