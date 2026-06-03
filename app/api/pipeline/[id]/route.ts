import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const supabase = await createSupabaseServerClient();

  const update: Record<string, unknown> = {
    betrag: body.volumen_eur !== undefined ? Number(body.volumen_eur) : undefined,
    datum: body.angebotsdatum,
    notizen: body.notiz,
    status: body.status,
  };
  if (body.zustaendig_id !== undefined) update.zustaendig_id = body.zustaendig_id;

  const { error } = await supabase
    .from("pipeline")
    .update(update)
    .eq("id", id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
