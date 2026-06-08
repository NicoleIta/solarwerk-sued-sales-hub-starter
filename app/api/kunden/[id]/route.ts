import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Nicht eingeloggt" }, { status: 401 });

  const update: Record<string, unknown> = {};
  if (body.status !== undefined) update.status = body.status;
  if (body.zustaendig_id !== undefined) update.zustaendig_id = body.zustaendig_id;
  if (body.ansprechpartner !== undefined) update.ansprechpartner = body.ansprechpartner;

  const { error } = await supabase
    .from("kunden")
    .update(update)
    .eq("int_id", Number(id));

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Nicht eingeloggt" }, { status: 401 });

  const { error } = await supabase
    .from("kunden")
    .delete()
    .eq("int_id", Number(id));

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
