import { supabase } from "@/lib/supabase";
import DashboardClient from "./dashboard-client";
import { Kunde } from "@/types";

export default async function DashboardPage() {
  const { data } = await supabase
    .from("kunden")
    .select("*")
    .order("int_id");

  const kunden: Kunde[] = (data ?? []).map((k) => ({
    id: k.int_id,
    supabase_uuid: k.id,
    firma: k.firma,
    ansprechpartner: k.ansprechpartner,
    branche: k.branche,
    anlagengroesse_kwp: k.anlagengroesse_kwp,
    status: k.status,
    letzter_kontakt: k.letzter_kontakt,
    telefon: k.telefon,
    email: k.email,
    notiz: k.notiz,
  }));

  return <DashboardClient kunden={kunden} />;
}
