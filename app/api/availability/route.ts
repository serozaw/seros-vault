import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase, HOLD_MINUTES } from "@/lib/db";

export const runtime = "nodejs";

// Returns the busy time ranges (confirmed bookings + still-active holds) so
// the booking calendar can grey out unavailable slots. Expired holds are
// filtered out here rather than deleted, so a read never has side effects.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from") || new Date().toISOString();
    const to =
      searchParams.get("to") ||
      new Date(Date.now() + 30 * 24 * 60 * 60_000).toISOString();

    const supabase = getServerSupabase();
    const cutoff = new Date(Date.now() - HOLD_MINUTES * 60_000).toISOString();

    const { data, error } = await supabase
      .from("bookings")
      .select("starts_at, ends_at, status, created_at")
      .neq("status", "cancelled")
      .gte("starts_at", from)
      .lte("starts_at", to);

    if (error) throw error;

    const busy = (data || [])
      .filter((b) => b.status === "confirmed" || b.created_at >= cutoff)
      .map((b) => ({ startsAt: b.starts_at, endsAt: b.ends_at }));

    return NextResponse.json({ busy });
  } catch (err) {
    console.error("Availability error:", err);
    return NextResponse.json({ error: "Could not load availability." }, { status: 500 });
  }
}
