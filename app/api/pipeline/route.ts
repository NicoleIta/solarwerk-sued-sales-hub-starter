import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = await createSupabaseServerClient();

  let kundeUuid: string | null = null;
  if (body.kundeId) {
    const { data: kundeData } = await supabase
      .from("kunden")
      .select("id")
      .eq("int_id", Number(body.kundeId))
      .single();
    kundeUuid = kundeData?.id ?? null;
  }

  const { data: neuerEintrag, error } = await supabase
    .from("pipeline")
    .insert({
      titel: body.firma,
      status: body.status,
      betrag: Number(body.volumen_eur) || null,
      datum: body.angebotsdatum || null,
      notizen: body.notiz || null,
      zustaendig_id: body.zustaendig_id || null,
      ...(kundeUuid ? { kunde_id: kundeUuid } : {}),
    })
    .select("id")
    .single();

  if (error || !neuerEintrag) {
    return Response.json({ error: error?.message ?? "Fehler beim Anlegen" }, { status: 500 });
  }

  return Response.json({ ok: true, id: neuerEintrag.id });
}
