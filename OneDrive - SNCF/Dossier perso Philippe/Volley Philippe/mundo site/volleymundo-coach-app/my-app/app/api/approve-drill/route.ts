import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

export async function POST(request: Request) {

  const formData = await request.formData();
  const submissionId = formData.get("submissionId") as string;

  const { data: submission } = await supabase
    .from("drill_submissions")
    .select(`
      user_drill_id,
      user_drills (*)
    `)
    .eq("id", submissionId)
    .single();

  const drill = submission?.user_drills;

  if (!drill) {
    return NextResponse.redirect(new URL("/admin/propositions", request.url));
  }

  await supabase.from("club_drills").insert({
    title: drill.title,
    description: drill.description,
    category: drill.category,
    level: drill.level,
    theme: drill.theme,
    duration: drill.duration,
    material: drill.material
  });

  await supabase
    .from("drill_submissions")
    .update({ status: "approved" })
    .eq("id", submissionId);

  return NextResponse.redirect(new URL("/admin/propositions", request.url));
}