import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/db";
import { getPresetById } from "@/lib/presets";

export const runtime = "nodejs";

// Streams the actual file to a verified buyer. The token only exists on a
// paid order, so this route is the one place the real Vercel Blob URL is
// ever touched — it's never sent to the browser directly.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token." }, { status: 400 });
  }

  const supabase = getServerSupabase();
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("download_token", token)
    .eq("status", "paid")
    .eq("kind", "preset")
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: "Invalid or expired download link." }, { status: 404 });
  }

  const preset = getPresetById(order.preset_id);
  if (!preset) {
    return NextResponse.json({ error: "Preset no longer available." }, { status: 404 });
  }

  const upstream = await fetch(preset.fileUrl);
  if (!upstream.ok || !upstream.body) {
    console.error(`Failed to fetch blob for preset ${preset.id}: ${upstream.status}`);
    return NextResponse.json({ error: "Download temporarily unavailable." }, { status: 502 });
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${preset.fileName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
