import { getKunden } from "@/lib/data";
import DashboardClient from "./dashboard-client";

export default function DashboardPage() {
  const kunden = getKunden();

  return <DashboardClient kunden={kunden} />;
}
