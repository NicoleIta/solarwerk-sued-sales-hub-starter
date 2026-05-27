import { getKunden } from "@/lib/data";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const kunden = await getKunden();

  return <DashboardClient kunden={kunden} />;
}
